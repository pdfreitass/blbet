/*
 * Respostas de exemplo da api, para os testes.
 *
 * Cada uma e VALIDADA contra o esquema do contrato no momento em que e construida: se
 * o `backend` mudar o modelo, estes exemplos deixam de passar e o teste denuncia-o,
 * em vez de continuar a verificar uma forma que ja nao existe.
 */

import {
  competitionSchema,
  eventSchema,
  paginatedSchema,
  type Competition,
  type SportEvent,
} from '@blbet/contracts';

const listaDeEventos = paginatedSchema(eventSchema);
const listaDeCompeticoes = paginatedSchema(competitionSchema);

const COMPETICAO = {
  id: 'cmp-epl',
  name: 'English Premier League',
  sport: 'soccer',
} as const;

/** Evento com os dois mercados preenchidos. */
export const EVENTO_COMPLETO: SportEvent = eventSchema.parse({
  id: 'evt-1',
  competition: COMPETICAO,
  startsAt: '2026-11-02T20:00:00Z',
  status: 'scheduled',
  homeTeam: { id: 'tm-new', name: 'Newcastle United' },
  awayTeam: { id: 'tm-eve', name: 'Everton' },
  markets: {
    matchResult: { home: '1.94', draw: '3.60', away: null },
    totalGoals: [
      { line: '3.50', over: '2.90', under: '1.40' },
      { line: '2.50', over: '1.78', under: '2.05' },
    ],
  },
  origin: 'provider',
});

/**
 * Evento distante, sem cotacoes. E o caso comum acima de ~10 dias, e nao e erro: a
 * fonte ainda nao publicou mercados.
 */
export const EVENTO_SEM_MERCADOS: SportEvent = eventSchema.parse({
  id: 'evt-2',
  competition: { id: 'cmp-laliga', name: 'Spanish La Liga', sport: 'soccer' },
  startsAt: '2026-11-20T18:00:00Z',
  status: 'scheduled',
  homeTeam: { id: 'tm-rma', name: 'Real Madrid' },
  awayTeam: { id: 'tm-fcb', name: 'Barcelona' },
  markets: { matchResult: null, totalGoals: [] },
  origin: 'provider',
});

export function paginaDeEventos(eventos: readonly SportEvent[] = [EVENTO_COMPLETO]) {
  return listaDeEventos.parse({ data: eventos, meta: { nextCursor: null } });
}

/*
 * Competicoes da rota `GET /api/competitions`. Note-se o `origin`, que a competicao
 * embutida no evento nao tem (T14-A3): sao dois esquemas, e este e o completo.
 */
export const COMPETICAO_EPL: Competition = competitionSchema.parse({
  ...COMPETICAO,
  origin: 'provider',
});

export const COMPETICAO_LALIGA: Competition = competitionSchema.parse({
  id: 'cmp-laliga',
  name: 'Spanish La Liga',
  sport: 'soccer',
  origin: 'provider',
});

export function paginaDeCompeticoes(
  competicoes: readonly Competition[] = [COMPETICAO_EPL, COMPETICAO_LALIGA],
) {
  return listaDeCompeticoes.parse({ data: competicoes, meta: { nextCursor: null } });
}

/** Erro no envelope acordado (PC-001, A1). */
export function erroDaApi(
  code: string,
  retryable: boolean,
  details?: readonly { field: string; issue: string }[],
) {
  return {
    error: {
      code,
      // Tecnica, de proposito: o teste verifica que NUNCA chega a tela (DIV-F01).
      message: `upstream responded 500: ${code}`,
      retryable,
      ...(details === undefined ? {} : { details }),
    },
  };
}
