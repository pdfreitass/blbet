import { describe, expect, it } from 'vitest';

import { rotularCategoria } from './categorias';

describe('rotularCategoria', () => {
  it('traduz as categorias conhecidas', () => {
    expect(rotularCategoria('slots')).toBe('Slots');
    expect(rotularCategoria('instantaneos')).toBe('Instantâneos');
  });

  /*
   * PC-014: a interface tolera um valor enumerado desconhecido sem quebrar. Foi o
   * compromisso que o `frontend` assumiu no contrato, e é este teste que o sustenta.
   */
  it('devolve um valor desconhecido como veio, sem quebrar', () => {
    expect(rotularCategoria('crash')).toBe('crash');
  });

  it('não inventa rótulo para texto vazio', () => {
    expect(rotularCategoria('')).toBe('');
  });
});
