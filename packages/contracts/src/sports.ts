import { z } from 'zod';
import { idSchema, originSchema, utcDateTimeSchema } from './primitives.js';

// T-014 — modelo esportivo. PROPOSTA do `backend`, à espera da revisão cruzada do `frontend`
// (DT-005). Âmbito decidido na DT-010. Nada aqui depende do formato do provedor: o adaptador
// em apps/api converte para estes esquemas (DT-009).

/** PC-006, A5 e DT-010 — odd decimal em texto, com exatamente 2 casas e no mínimo 1.01. */
export const oddSchema = z
  .string()
  .regex(/^\d+\.\d{2}$/)
  .refine((value) => Number(value) >= 1.01, { message: 'odd below 1.01' });
export type Odd = z.infer<typeof oddSchema>;

/** A5 — linha de mais/menos golos, com 2 casas (`"2.50"`, `"2.25"`). */
export const totalLineSchema = z.string().regex(/^\d+\.\d{2}$/);

/** A5 — uma odd que a fonte não tem é `null`. */
const optionalOddSchema = oddSchema.nullable();

/** DT-010 — futebol primeiro; acrescentar um valor é compatível (PC-014). */
export const SPORTS = ['soccer'] as const;
export const sportSchema = z.enum(SPORTS);
export type Sport = z.infer<typeof sportSchema>;

/** A4 e DT-010 — só jogos futuros por agora; valores novos entram como mudança compatível. */
export const EVENT_STATUSES = ['scheduled'] as const;
export const eventStatusSchema = z.enum(EVENT_STATUSES);
export type EventStatus = z.infer<typeof eventStatusSchema>;

export const competitionSchema = z.strictObject({
  id: idSchema,
  name: z.string().min(1),
  sport: sportSchema,
  origin: originSchema,
});
export type Competition = z.infer<typeof competitionSchema>;

/** T14-A3 — competição embutida no evento, para agrupar sem segunda chamada. Sem `origin` próprio. */
export const competitionRefSchema = competitionSchema.omit({ origin: true });
export type CompetitionRef = z.infer<typeof competitionRefSchema>;

export const teamSchema = z.strictObject({
  id: idSchema,
  name: z.string().min(1),
});
export type Team = z.infer<typeof teamSchema>;

/** DT-010 — resultado final (casa, empate, fora) no tempo regulamentar. */
export const matchResultMarketSchema = z.strictObject({
  home: optionalOddSchema,
  draw: optionalOddSchema,
  away: optionalOddSchema,
});
export type MatchResultMarket = z.infer<typeof matchResultMarketSchema>;

/** DT-010 — mais/menos golos no tempo regulamentar, uma entrada por linha. */
export const totalGoalsMarketSchema = z.strictObject({
  line: totalLineSchema,
  over: optionalOddSchema,
  under: optionalOddSchema,
});
export type TotalGoalsMarket = z.infer<typeof totalGoalsMarketSchema>;

/** DT-010 — uma odd por resultado, de uma fonte fixa escolhida no backend; a fonte não vem aqui. */
export const eventMarketsSchema = z.strictObject({
  matchResult: matchResultMarketSchema.nullable(),
  totalGoals: z.array(totalGoalsMarketSchema),
});
export type EventMarkets = z.infer<typeof eventMarketsSchema>;

export const eventSchema = z.strictObject({
  id: idSchema,
  competition: competitionRefSchema,
  startsAt: utcDateTimeSchema,
  status: eventStatusSchema,
  homeTeam: teamSchema,
  awayTeam: teamSchema,
  markets: eventMarketsSchema,
  origin: originSchema,
});
export type SportEvent = z.infer<typeof eventSchema>;

/** PC-008 e PC-009 — query de `GET /api/events`. Campos desconhecidos dão VALIDATION_FAILED. */
export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;
export const MAX_QUERY_LENGTH = 100;

export const eventsQuerySchema = z.strictObject({
  competitionId: idSchema.optional(),
  /** A7 e T14-A4 — busca por nome de equipa ou de competição. Sem resultados dá `200` com `data: []`. */
  q: z.string().trim().min(1).max(MAX_QUERY_LENGTH).optional(),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_LIMIT).default(DEFAULT_PAGE_LIMIT),
  cursor: z.string().min(1).optional(),
});
export type EventsQuery = z.infer<typeof eventsQuerySchema>;
