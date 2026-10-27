/*
 * Tipos do conjunto DEMONSTRATIVO de esportes.
 *
 * NAO sao contratos de API. O contrato vive em packages/contracts/ e e do agente
 * `backend`; o provedor esportivo nem esta identificado (BLQ-001). Estes tipos
 * descrevem apenas a forma dos dados ficticios locais e sao substituidos pelos
 * esquemas Zod aprovados quando existirem -- sem simular dados do provedor.
 *
 * O que JA vem do contrato partilhado: `Origin` (PC-010 e A8) e a odd como texto
 * decimal (A5). O resto e local.
 */

import type { Origin } from '@blbet/contracts';

/** Situacao do evento. Lista fechada do conjunto demonstrativo. */
export type SituacaoEvento = 'agendado' | 'encerrado';

/**
 * Uma opcao de mercado: nome e cotacao. Somente leitura, sempre (RN-003).
 *
 * A odd e TEXTO decimal, nao numero: e a regra A5 da seccao 9.1 do contrato, que
 * evita perder precisao no caminho. `null` quando indisponivel, nunca texto vazio.
 */
export interface OpcaoDemonstrativa {
  readonly id: string;
  readonly nome: string;
  readonly odd: string | null;
}

export interface MercadoDemonstrativo {
  readonly id: string;
  readonly nome: string;
  readonly opcoes: readonly OpcaoDemonstrativa[];
}

export interface EventoDemonstrativo {
  readonly id: string;
  /** PC-010 e A8: procedencia obrigatoria. Aqui e sempre `'demo'`. */
  readonly origin: Origin;
  readonly esporte: string;
  readonly competicao: string;
  readonly participantes: readonly [string, string];
  readonly inicio: Date;
  readonly situacao: SituacaoEvento;
  readonly mercados: readonly MercadoDemonstrativo[];
}
