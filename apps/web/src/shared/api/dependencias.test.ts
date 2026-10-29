import { describe, expect, it } from 'vitest';

import { mesmasDependencias } from './dependencias';

describe('mesmasDependencias', () => {
  it('compara por valor, posição a posição', () => {
    expect(mesmasDependencias([], [])).toBe(true);
    expect(mesmasDependencias(['abc', 1], ['abc', 1])).toBe(true);
    expect(mesmasDependencias(['abc', 1], ['abc', 2])).toBe(false);
  });

  it('listas de comprimentos diferentes nunca são iguais', () => {
    expect(mesmasDependencias(['abc'], ['abc', 1])).toBe(false);
    expect(mesmasDependencias(['abc', 1], ['abc'])).toBe(false);
  });

  /*
   * `Object.is`, e nao `===`: com `===`, dois `NaN` seriam considerados diferentes e
   * a lista reiniciava em cada render, a pedir a api sem parar.
   */
  it('usa Object.is: NaN é igual a NaN', () => {
    expect(mesmasDependencias([Number.NaN], [Number.NaN])).toBe(true);
  });
});
