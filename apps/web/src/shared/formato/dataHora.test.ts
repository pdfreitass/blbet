import { describe, expect, it } from 'vitest';

import { descreverInstante, formatarDiaMes, formatarHora } from './dataHora';

/*
 * A entrada é o texto do contrato: ISO 8601 em UTC com `Z` (PC-005).
 * O fuso de saída é o do ambiente onde o teste corre, por isso as asserções de hora
 * comparam com o que o próprio Intl produz, em vez de fixarem um valor que mudaria
 * de máquina para máquina.
 */
const ISO = '2026-11-03T19:45:00Z';
const INVALIDO = 'não é uma data';

function esperado(iso: string, opcoes: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('pt-BR', opcoes).format(new Date(iso));
}

describe('formatarHora', () => {
  it('usa 24 horas com dois dígitos, na hora local', () => {
    expect(formatarHora(ISO)).toBe(
      esperado(ISO, { hour: '2-digit', minute: '2-digit', hour12: false }),
    );
  });

  it('tem a forma HH:MM', () => {
    expect(formatarHora(ISO)).toMatch(/^\d{2}:\d{2}$/);
  });

  it('devolve cadeia vazia para texto inválido, sem imprimir Invalid Date', () => {
    expect(formatarHora(INVALIDO)).toBe('');
  });

  it('devolve cadeia vazia para texto vazio', () => {
    expect(formatarHora('')).toBe('');
  });
});

describe('formatarDiaMes', () => {
  it('usa dia e mês com dois dígitos', () => {
    expect(formatarDiaMes(ISO)).toMatch(/^\d{2}\/\d{2}$/);
  });

  it('devolve cadeia vazia para texto inválido', () => {
    expect(formatarDiaMes(INVALIDO)).toBe('');
  });
});

describe('descreverInstante', () => {
  it('descreve o mês por extenso, para o nome acessível', () => {
    expect(descreverInstante(ISO)).toContain('novembro');
  });

  it('diz que a data está indisponível em vez de falhar', () => {
    expect(descreverInstante(INVALIDO)).toBe('data indisponível');
  });
});
