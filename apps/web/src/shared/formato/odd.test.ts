import { describe, expect, it } from 'vitest';

import { formatarOdd } from './odd';

describe('formatarOdd', () => {
  it('formata com duas casas decimais e separador do português', () => {
    expect(formatarOdd(2.35)).toBe('2,35');
  });

  it('completa a segunda casa de um valor com uma só', () => {
    expect(formatarOdd(3.1)).toBe('3,10');
  });

  it('completa as duas casas de um valor inteiro', () => {
    expect(formatarOdd(2)).toBe('2,00');
  });

  it('usa o mesmo formato em qualquer tela: a função é o único ponto (CA-003.2)', () => {
    const umaTela = formatarOdd(1.95);
    const outraTela = formatarOdd(1.95);

    expect(umaTela).toBe(outraTela);
  });

  it('devolve indisponível em vez de NaN', () => {
    expect(formatarOdd(Number.NaN)).toBe('—');
  });

  it('devolve indisponível para infinito', () => {
    expect(formatarOdd(Number.POSITIVE_INFINITY)).toBe('—');
  });

  it('devolve indisponível para valor ausente', () => {
    expect(formatarOdd(null)).toBe('—');
    expect(formatarOdd(undefined)).toBe('—');
  });

  it('devolve indisponível para zero e para negativo, que não são cotações', () => {
    expect(formatarOdd(0)).toBe('—');
    expect(formatarOdd(-1.5)).toBe('—');
  });
});
