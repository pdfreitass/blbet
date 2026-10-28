import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { guardarNoCache, lerDoCache, limparCache } from './cache';
import { obterEventos } from './esportes';
import { EVENTO_COMPLETO, paginaDeEventos } from '../../test/fixtures';
import { instalarServidorFalso } from '../../test/servidorFalso';

beforeEach(() => {
  limparCache();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('cache', () => {
  it('devolve o que foi guardado', () => {
    guardarNoCache('/api/events', { data: [] });

    expect(lerDoCache('/api/events')).toEqual({ data: [] });
  });

  it('não devolve nada para uma chave que nunca foi guardada', () => {
    expect(lerDoCache('/api/events')).toBeUndefined();
  });

  it('deixa de devolver depois de expirar', () => {
    vi.useFakeTimers();
    guardarNoCache('/api/events', { data: [] });

    vi.advanceTimersByTime(31_000);

    expect(lerDoCache('/api/events')).toBeUndefined();
  });

  it('ainda devolve antes de expirar', () => {
    vi.useFakeTimers();
    guardarNoCache('/api/events', { data: [] });

    vi.advanceTimersByTime(29_000);

    expect(lerDoCache('/api/events')).toEqual({ data: [] });
  });

  /*
   * Sem limite, uma sessão longa com muitas buscas faria o mapa crescer sem fim —
   * cada termo é uma chave própria.
   */
  it('não cresce sem limite: a entrada menos usada sai', () => {
    for (let indice = 0; indice < 60; indice += 1) {
      guardarNoCache(`/api/events?q=${indice}`, { indice });
    }

    expect(lerDoCache('/api/events?q=0')).toBeUndefined();
    expect(lerDoCache('/api/events?q=59')).toEqual({ indice: 59 });
  });

  it('ler uma entrada protege-a da remoção por idade', () => {
    guardarNoCache('/api/events?q=antiga', { valor: 'antiga' });

    for (let indice = 0; indice < 40; indice += 1) {
      guardarNoCache(`/api/events?q=${indice}`, { indice });
      // Tocar na entrada antiga mantém-na como recentemente usada.
      lerDoCache('/api/events?q=antiga');
    }

    for (let indice = 40; indice < 60; indice += 1) {
      guardarNoCache(`/api/events?q=${indice}`, { indice });
      lerDoCache('/api/events?q=antiga');
    }

    expect(lerDoCache('/api/events?q=antiga')).toEqual({ valor: 'antiga' });
  });
});

describe('cache ligado ao cliente', () => {
  it('um segundo pedido igual não volta à rede', async () => {
    let pedidos = 0;
    instalarServidorFalso(() => {
      pedidos += 1;
      return { estado: 200, corpo: paginaDeEventos([EVENTO_COMPLETO]) };
    });

    await obterEventos({ limit: 30 });
    await obterEventos({ limit: 30 });

    expect(pedidos).toBe(1);
  });

  it('caminhos diferentes são entradas diferentes', async () => {
    let pedidos = 0;
    instalarServidorFalso(() => {
      pedidos += 1;
      return { estado: 200, corpo: paginaDeEventos([EVENTO_COMPLETO]) };
    });

    await obterEventos({ limit: 30 });
    await obterEventos({ limit: 30, cursor: 'c2' });

    expect(pedidos).toBe(2);
  });

  /*
   * O ponto que os testes apanharam quando o cache entrou: um pedido explícito do
   * utilizador — "Tentar novamente", ou a lista a recomeçar depois de um cursor
   * obsoleto — tem de ir à rede. Servir o cache daria a mesma resposta e o pedido
   * pareceria não ter feito nada.
   */
  it('ignorarCache volta à rede, mesmo havendo resposta guardada', async () => {
    let pedidos = 0;
    instalarServidorFalso(() => {
      pedidos += 1;
      return { estado: 200, corpo: paginaDeEventos([EVENTO_COMPLETO]) };
    });

    await obterEventos({ limit: 30 });
    await obterEventos({ limit: 30 }, { ignorarCache: true });

    expect(pedidos).toBe(2);
  });

  it('uma falha não entra no cache: o pedido seguinte volta a tentar', async () => {
    let pedidos = 0;
    instalarServidorFalso(() => {
      pedidos += 1;
      return { estado: 503, corpo: { error: { code: 'UPSTREAM_UNAVAILABLE', message: 'x', retryable: true } } };
    });

    await obterEventos({ limit: 30 });
    await obterEventos({ limit: 30 });

    expect(pedidos).toBe(2);
  });
});
