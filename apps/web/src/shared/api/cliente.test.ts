import { afterEach, describe, expect, it, vi } from 'vitest';

import { erroDaApi, paginaDeEventos } from '../../test/fixtures';
import { instalarServidorFalso, responderSempre } from '../../test/servidorFalso';
import { obterEvento, obterEventos } from './esportes';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('obterEventos', () => {
  it('devolve os dados quando a resposta obedece ao contrato', async () => {
    responderSempre(200, paginaDeEventos());

    const resultado = await obterEventos();

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.dados.data[0]?.homeTeam.name).toBe('Newcastle United');
    }
  });

  it('envia o termo de busca como ?q= (regra A7)', async () => {
    let pedido = '';
    instalarServidorFalso((url) => {
      pedido = url;
      return { estado: 200, corpo: paginaDeEventos() };
    });

    await obterEventos({ q: 'arsenal', limit: 30 });

    expect(pedido).toContain('q=arsenal');
    expect(pedido).toContain('limit=30');
  });

  it('não envia ?q= vazio, que a rota recusaria com VALIDATION_FAILED', async () => {
    let pedido = '';
    instalarServidorFalso((url) => {
      pedido = url;
      return { estado: 200, corpo: paginaDeEventos() };
    });

    await obterEventos({ q: '   ' });

    expect(pedido).not.toContain('q=');
  });

  /*
   * O caminho que mais importa hoje: sem a chave do provedor, a api responde 503.
   * O servidor diz que é repetível (A1), e é isso que decide se a interface oferece
   * repetir — não uma lista de códigos escrita do lado do frontend.
   */
  it('traduz o 503 do provedor numa falha repetível, sem texto técnico', async () => {
    responderSempre(503, erroDaApi('UPSTREAM_UNAVAILABLE', true));

    const resultado = await obterEventos();

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.falha.codigo).toBe('UPSTREAM_UNAVAILABLE');
      expect(resultado.falha.retryable).toBe(true);
      expect(resultado.falha.mensagem).toBe('Os dados esportivos estão indisponíveis neste momento.');
      expect(resultado.falha.mensagem).not.toContain('upstream');
      expect(resultado.falha.mensagem).not.toContain('503');
    }
  });

  it('respeita o servidor quando ele diz que a falha não é repetível', async () => {
    responderSempre(400, erroDaApi('VALIDATION_FAILED', false));

    const resultado = await obterEventos();

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.falha.retryable).toBe(false);
    }
  });

  it('trata como falha uma resposta que não obedece ao contrato', async () => {
    responderSempre(200, { data: [{ isto: 'não é um evento' }], meta: { nextCursor: null } });

    const resultado = await obterEventos();

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.falha.codigo).toBe('RESPOSTA_INVALIDA');
    }
  });

  it('trata como falha um erro sem o envelope acordado, sem inventar código', async () => {
    responderSempre(500, '<html>Internal Server Error</html>');

    const resultado = await obterEventos();

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.falha.codigo).toBe('RESPOSTA_INVALIDA');
      expect(resultado.falha.retryable).toBe(false);
    }
  });

  it('não lança quando a rede falha; devolve falha repetível', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))),
    );

    const resultado = await obterEventos();

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.falha.codigo).toBe('SEM_LIGACAO');
      expect(resultado.falha.retryable).toBe(true);
    }
  });
});

describe('obterEvento', () => {
  it('distingue um jogo que já começou de um que não existe (T14-A1)', async () => {
    responderSempre(
      404,
      erroDaApi('NOT_FOUND', false, [{ field: 'path.id', issue: 'event_started' }]),
    );

    const resultado = await obterEvento('evt-1');

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.falha.issue).toBe('event_started');
      expect(resultado.falha.mensagem).toBe('Este jogo já começou e deixou de estar disponível.');
    }
  });

  it('usa a mensagem genérica quando o 404 é mesmo de inexistente', async () => {
    responderSempre(404, erroDaApi('NOT_FOUND', false));

    const resultado = await obterEvento('evt-inexistente');

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.falha.issue).toBeUndefined();
      expect(resultado.falha.mensagem).toBe('Não encontrámos o que procurava.');
    }
  });

  it('codifica o id, que é texto opaco (PC-004)', async () => {
    let pedido = '';
    instalarServidorFalso((url) => {
      pedido = url;
      return { estado: 404, corpo: erroDaApi('NOT_FOUND', false) };
    });

    await obterEvento('a/b c');

    expect(pedido).toBe('/api/events/a%2Fb%20c');
  });
});
