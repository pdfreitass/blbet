import type { Competition, EventMarkets, MatchResultMarket, SportEvent, TotalGoalsMarket } from '@blbet/contracts';
import type { SportsbookCompetition, SportsbookEvent, SportsbookMarket, SportsbookOutcome } from './schema.js';

// Conversão Sportsbook API → modelo interno (packages/contracts, T-014). Funções puras: nenhum
// nome, chave de casa ou formato do provedor passa daqui para fora (DT-009, DT-010).

const MIN_ODD = 1.01;
// DT-010 — só o tempo regulamentar.
const FULL_TIME = 'REGULATION_TIME';
const SPORT_BY_PROVIDER: Readonly<Record<string, Competition['sport']>> = { SOCCER: 'soccer' };

/** A5 e DT-010 — decimal com 2 casas; abaixo de 1.01 a odd não paga nada e conta como indisponível. */
export function toOdd(payout: number): string | null {
  if (!Number.isFinite(payout)) return null;
  const rounded = Math.round(payout * 100) / 100;
  return rounded >= MIN_ODD ? rounded.toFixed(2) : null;
}

/** Devolve null para desportos fora da DT-010. */
export function toCompetition(raw: SportsbookCompetition): Competition | null {
  const sport = SPORT_BY_PROVIDER[raw.sport];
  return sport ? { id: raw.key, name: raw.name, sport, origin: 'provider' } : null;
}

function outcomesOf(markets: readonly SportsbookMarket[], type: string, source: string): SportsbookOutcome[][] {
  return markets
    .filter((market) => market.type === type && market.segment === FULL_TIME)
    .map((market) => market.outcomes?.[source] ?? [])
    .filter((outcomes) => outcomes.length > 0);
}

function oddOf(outcome: SportsbookOutcome | undefined): string | null {
  return outcome ? toOdd(outcome.payout) : null;
}

function matchResult(markets: readonly SportsbookMarket[], source: string, homeKey: string, awayKey: string): MatchResultMarket | null {
  // Mercados repetidos acontecem: usa-se o primeiro com odds desta fonte.
  const outcomes = outcomesOf(markets, 'MONEYLINE_3WAY', source)[0];
  if (!outcomes) return null;
  const win = (participantKey: string) => outcomes.find((o) => o.type === 'WIN' && o.participantKey === participantKey);
  return {
    home: oddOf(win(homeKey)),
    draw: oddOf(outcomes.find((o) => o.type === 'DRAW')),
    away: oddOf(win(awayKey)),
  };
}

function totalGoals(markets: readonly SportsbookMarket[], source: string): TotalGoalsMarket[] {
  const byLine = new Map<string, TotalGoalsMarket>();
  for (const outcomes of outcomesOf(markets, 'POINT_TOTAL', source)) {
    for (const outcome of outcomes) {
      if (outcome.modifier < 0 || (outcome.type !== 'OVER' && outcome.type !== 'UNDER')) continue;
      const line = outcome.modifier.toFixed(2);
      const current = byLine.get(line) ?? { line, over: null, under: null };
      const side = outcome.type === 'OVER' ? 'over' : 'under';
      // O primeiro valor de cada linha ganha, como no 1X2.
      if (current[side] !== null) continue;
      byLine.set(line, { ...current, [side]: oddOf(outcome) });
    }
  }
  return [...byLine.values()].sort((a, b) => Number(a.line) - Number(b.line));
}

/** Devolve null quando o evento não tem casa e fora identificáveis. */
export function toSportEvent(raw: SportsbookEvent, competition: Competition, source: string): SportEvent | null {
  const home = raw.participants.find((participant) => participant.key === raw.homeParticipantKey);
  const away = raw.participants.find((participant) => participant.key !== raw.homeParticipantKey);
  if (!home || !away || raw.participants.length !== 2) return null;

  const markets: EventMarkets = {
    matchResult: matchResult(raw.markets, source, home.key, away.key),
    totalGoals: totalGoals(raw.markets, source),
  };
  return {
    id: raw.key,
    competition: { id: competition.id, name: competition.name, sport: competition.sport },
    startsAt: raw.startTime,
    status: 'scheduled',
    homeTeam: { id: home.key, name: home.name },
    awayTeam: { id: away.key, name: away.name },
    markets,
    origin: 'provider',
  };
}
