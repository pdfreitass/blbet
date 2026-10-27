import { z } from 'zod';

// Forma das respostas da Sportsbook API (docs/integracoes.md, secção 5), confirmada com chamadas
// reais em 2026-10-27. Só os campos que o adaptador usa; o resto é ignorado (looseObject), para
// que um campo novo do provedor não derrube a integração.

const outcomeSchema = z.looseObject({
  type: z.string(),
  modifier: z.number(),
  payout: z.number(),
  participantKey: z.string().nullable(),
});
export type SportsbookOutcome = z.infer<typeof outcomeSchema>;

const marketSchema = z.looseObject({
  type: z.string(),
  segment: z.string(),
  // Ausente em mercados sem odds atuais (ex.: lastFoundAt antigo).
  outcomes: z.record(z.string(), z.array(outcomeSchema)).optional(),
});
export type SportsbookMarket = z.infer<typeof marketSchema>;

const participantSchema = z.looseObject({
  key: z.string().min(1),
  name: z.string().min(1),
});

const eventSchema = z.looseObject({
  key: z.string().min(1),
  startTime: z.string().min(1),
  homeParticipantKey: z.string().nullable(),
  participants: z.array(participantSchema),
  markets: z.array(marketSchema),
});
export type SportsbookEvent = z.infer<typeof eventSchema>;

export const eventsResponseSchema = z.looseObject({ events: z.array(eventSchema) });

const competitionSchema = z.looseObject({
  key: z.string().min(1),
  shortName: z.string().min(1),
  name: z.string().min(1),
  sport: z.string(),
});
export type SportsbookCompetition = z.infer<typeof competitionSchema>;

export const competitionsResponseSchema = z.looseObject({ competitions: z.array(competitionSchema) });
