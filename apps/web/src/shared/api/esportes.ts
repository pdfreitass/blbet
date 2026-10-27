/*
 * Rotas de esportes (T-014, secao 7.1 do contrato; implementadas na T-015).
 * Os esquemas sao os do pacote de contratos: nenhum tipo de evento vive no frontend.
 */

import {
  competitionSchema,
  eventSchema,
  paginatedSchema,
  successSchema,
  type EventsQuery,
} from '@blbet/contracts';

import { pedir, type OpcoesPedido, type Resultado } from './cliente';

const eventosSchema = paginatedSchema(eventSchema);
const competicoesSchema = paginatedSchema(competitionSchema);
const eventoSchema = successSchema(eventSchema);

export type RespostaEventos = ReturnType<typeof eventosSchema.parse>;
export type RespostaCompeticoes = ReturnType<typeof competicoesSchema.parse>;
export type RespostaEvento = ReturnType<typeof eventoSchema.parse>;

/** Filtros aceites pela rota. Os nomes sao os do contrato, nao traduzidos. */
export type FiltrosEventos = Partial<Pick<EventsQuery, 'q' | 'competitionId' | 'limit' | 'cursor'>>;

export function obterEventos(
  filtros: FiltrosEventos = {},
  opcoes?: OpcoesPedido,
): Promise<Resultado<RespostaEventos>> {
  return pedir(`/api/events${construirQuery(filtros)}`, eventosSchema, opcoes);
}

export function obterCompeticoes(opcoes?: OpcoesPedido): Promise<Resultado<RespostaCompeticoes>> {
  return pedir('/api/competitions', competicoesSchema, opcoes);
}

export function obterEvento(id: string, opcoes?: OpcoesPedido): Promise<Resultado<RespostaEvento>> {
  // O id e texto opaco (PC-004): codifica-se, nao se interpreta.
  return pedir(`/api/events/${encodeURIComponent(id)}`, eventoSchema, opcoes);
}

/**
 * Constroi a query so com o que tem valor.
 *
 * Um parametro vazio NAO e enviado: a rota e `strictObject` e `q=""` daria
 * `VALIDATION_FAILED` em vez da lista completa.
 */
function construirQuery(filtros: FiltrosEventos): string {
  const parametros = new URLSearchParams();

  if (filtros.q !== undefined && filtros.q.trim() !== '') {
    parametros.set('q', filtros.q.trim());
  }

  if (filtros.competitionId !== undefined) {
    parametros.set('competitionId', filtros.competitionId);
  }

  if (filtros.limit !== undefined) {
    parametros.set('limit', String(filtros.limit));
  }

  if (filtros.cursor !== undefined) {
    parametros.set('cursor', filtros.cursor);
  }

  const query = parametros.toString();

  return query === '' ? '' : `?${query}`;
}
