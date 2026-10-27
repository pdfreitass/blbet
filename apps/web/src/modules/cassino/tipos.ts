/*
 * Tipos do catalogo DEMONSTRATIVO de cassino.
 *
 * Nao sao contrato. A seccao 1 de docs/integracoes.md regista que a API agregadora de
 * cassino fica para etapa posterior e que, ate la, o catalogo usa dados demonstrativos
 * com `origin: "demo"` -- que e o que esta aqui.
 */

import type { Origin } from '@blbet/contracts';

/**
 * Categoria do jogo. Lista fechada do conjunto demonstrativo; quando houver provedor,
 * passa a vir do adaptador. A interface tolera um valor desconhecido sem quebrar
 * (PC-014), e e por isso que o rotulo cai no proprio valor quando nao o reconhece.
 */
export type CategoriaJogo = 'slots' | 'mesa' | 'cartas' | 'instantaneos';

export interface JogoDemonstrativo {
  readonly id: string;
  readonly nome: string;
  readonly categoria: CategoriaJogo;
  /** PC-010 e A8: procedencia obrigatoria. Aqui e sempre `'demo'`. */
  readonly origin: Origin;
}
