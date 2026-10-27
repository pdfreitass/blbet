import { describe, expect, it } from 'vitest';

import { descreverInstante, formatarDiaMes, formatarHora } from './dataHora';

/** Instante fixo, para que o resultado não dependa do dia em que o teste corre. */
const INSTANTE = new Date(2026, 10, 3, 19, 45);
const INVALIDO = new Date('não é uma data');

describe('formatarHora', () => {
  it('usa 24 horas com dois dígitos', () => {
    expect(formatarHora(INSTANTE)).toBe('19:45');
  });

  it('devolve cadeia vazia para instante inválido, sem imprimir Invalid Date', () => {
    expect(formatarHora(INVALIDO)).toBe('');
  });
});

describe('formatarDiaMes', () => {
  it('usa dia e mês com dois dígitos', () => {
    expect(formatarDiaMes(INSTANTE)).toBe('03/11');
  });

  it('devolve cadeia vazia para instante inválido', () => {
    expect(formatarDiaMes(INVALIDO)).toBe('');
  });
});

describe('descreverInstante', () => {
  it('descreve o mês por extenso, para o nome acessível', () => {
    expect(descreverInstante(INSTANTE)).toContain('novembro');
  });

  it('diz que a data está indisponível em vez de falhar', () => {
    expect(descreverInstante(INVALIDO)).toBe('data indisponível');
  });
});
