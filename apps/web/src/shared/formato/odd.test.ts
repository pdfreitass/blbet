import { describe, expect, it } from 'vitest';

import { formatarOdd } from './odd';

describe('formatarOdd', () => {
  it('troca o ponto do contrato pela vírgula do português', () => {
    expect(formatarOdd('2.35')).toBe('2,35');
  });

  it('preserva as casas que o servidor enviou, sem arredondar nem completar', () => {
    expect(formatarOdd('3.1')).toBe('3,1');
    expect(formatarOdd('1.850')).toBe('1,850');
  });

  it('aceita um inteiro sem casas decimais', () => {
    expect(formatarOdd('2')).toBe('2');
  });

  it('usa o mesmo formato em qualquer tela: a função é o único ponto (CA-003.2)', () => {
    expect(formatarOdd('1.95')).toBe(formatarOdd('1.95'));
  });

  it('devolve indisponível quando a odd é null, como a regra A5 prevê', () => {
    expect(formatarOdd(null)).toBe('—');
    expect(formatarOdd(undefined)).toBe('—');
  });

  it('devolve indisponível para texto vazio, que a regra A5 proíbe', () => {
    expect(formatarOdd('')).toBe('—');
  });

  /*
   * Os casos seguintes violam a regra A5. Exibi-los como vieram seria dar por boa uma
   * resposta que o contrato não permite, por isso são tratados como indisponíveis.
   */
  it('recusa vírgula como separador decimal', () => {
    expect(formatarOdd('2,35')).toBe('—');
  });

  it('recusa separador de milhares', () => {
    expect(formatarOdd('1,000.50')).toBe('—');
  });

  it('recusa sinal e notação científica', () => {
    expect(formatarOdd('+2.35')).toBe('—');
    expect(formatarOdd('-1.50')).toBe('—');
    expect(formatarOdd('1e3')).toBe('—');
  });

  it('recusa texto que não é número', () => {
    expect(formatarOdd('indisponível')).toBe('—');
    expect(formatarOdd('NaN')).toBe('—');
  });

  it('recusa zero, que não é uma cotação', () => {
    expect(formatarOdd('0')).toBe('—');
    expect(formatarOdd('0.00')).toBe('—');
  });
});
