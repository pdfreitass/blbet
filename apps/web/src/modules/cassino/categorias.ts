/*
 * Rotulos das categorias de jogo -- ponto unico, para que o mesmo valor nunca apareca
 * escrito de duas maneiras em telas diferentes.
 */

import type { CategoriaJogo } from './tipos';

const ROTULOS: Record<CategoriaJogo, string> = {
  slots: 'Slots',
  mesa: 'Mesa',
  cartas: 'Cartas',
  instantaneos: 'Instantâneos',
};

/**
 * Rotulo legivel de uma categoria.
 *
 * Um valor desconhecido NAO quebra a interface: e devolvido como veio, que e o
 * compromisso assumido na PC-014 do contrato -- acrescentar um valor ao enumerado e
 * uma mudanca compativel.
 */
export function rotularCategoria(categoria: string): string {
  return ROTULOS[categoria as CategoriaJogo] ?? categoria;
}

/** As categorias conhecidas, na ordem em que aparecem nos filtros. */
export const CATEGORIAS_CONHECIDAS: readonly CategoriaJogo[] = [
  'slots',
  'mesa',
  'cartas',
  'instantaneos',
];
