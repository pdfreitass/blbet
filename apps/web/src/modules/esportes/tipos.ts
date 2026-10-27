/*
 * Tipos do conjunto DEMONSTRATIVO de esportes.
 *
 * NAO sao contratos de API. O contrato vive em packages/contracts/ e e do agente
 * `backend`; o provedor esportivo nem esta identificado (BLQ-001). Estes tipos
 * descrevem apenas a forma dos dados ficticios locais e sao substituidos pelos
 * esquemas Zod aprovados quando existirem -- sem simular dados do provedor.
 */

/** Situacao do evento. Lista fechada do conjunto demonstrativo. */
export type SituacaoEvento = 'agendado' | 'encerrado';

/** Uma opcao de mercado: nome e cotacao. Somente leitura, sempre (RN-003). */
export interface OpcaoDemonstrativa {
  readonly id: string;
  readonly nome: string;
  readonly odd: number;
}

export interface MercadoDemonstrativo {
  readonly id: string;
  readonly nome: string;
  readonly opcoes: readonly OpcaoDemonstrativa[];
}

export interface EventoDemonstrativo {
  readonly id: string;
  readonly esporte: string;
  readonly competicao: string;
  readonly participantes: readonly [string, string];
  readonly inicio: Date;
  readonly situacao: SituacaoEvento;
  readonly mercados: readonly MercadoDemonstrativo[];
}
