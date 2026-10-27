import { describe, expect, it } from 'vitest';
import {
  competitionSchema,
  eventSchema,
  eventsQuerySchema,
  oddSchema,
  totalLineSchema,
} from '../src/sports.js';

const evento = {
  id: 'OVc2-Alcu-Ynsy',
  competition: { id: 'Xa0f-wjcs-tANp', name: 'English Premier League', sport: 'soccer' },
  startsAt: '2026-11-02T20:00:00Z',
  status: 'scheduled',
  homeTeam: { id: 'MIuT-wjcs-m2L0', name: 'Newcastle United' },
  awayTeam: { id: 'WPB8-wjcs-P0WD', name: 'Everton' },
  markets: {
    matchResult: { home: '1.94', draw: '3.60', away: null },
    totalGoals: [{ line: '2.50', over: '1.78', under: '2.05' }],
  },
  origin: 'provider',
};

describe('oddSchema', () => {
  it('aceita decimal com exatamente 2 casas', () => {
    expect(oddSchema.safeParse('1.94').success).toBe(true);
    expect(oddSchema.safeParse('12.00').success).toBe(true);
  });

  it('rejeita número, outras casas, vírgula, sinal e texto vazio', () => {
    for (const invalida of [1.94, '1.9', '1.555', '1,94', '-1.94', '', '1e2']) {
      expect(oddSchema.safeParse(invalida).success).toBe(false);
    }
  });

  it('rejeita odd abaixo de 1.01, que não paga nada', () => {
    expect(oddSchema.safeParse('1.00').success).toBe(false);
    expect(oddSchema.safeParse('0.50').success).toBe(false);
    expect(oddSchema.safeParse('1.01').success).toBe(true);
  });
});

describe('totalLineSchema', () => {
  it('aceita linhas com 2 casas e rejeita negativas ou sem casas', () => {
    expect(totalLineSchema.safeParse('2.50').success).toBe(true);
    expect(totalLineSchema.safeParse('2.25').success).toBe(true);
    expect(totalLineSchema.safeParse('2.5').success).toBe(false);
    expect(totalLineSchema.safeParse('-2.50').success).toBe(false);
  });
});

describe('eventSchema', () => {
  it('aceita um evento completo', () => {
    expect(eventSchema.parse(evento)).toEqual(evento);
  });

  it('aceita evento sem odds: resultado nulo e sem linhas de golos', () => {
    const semOdds = { ...evento, markets: { matchResult: null, totalGoals: [] } };
    expect(eventSchema.safeParse(semOdds).success).toBe(true);
  });

  it('exige origin (A8) e situação conhecida (A4)', () => {
    const { origin: _origin, ...semOrigin } = evento;
    expect(eventSchema.safeParse(semOrigin).success).toBe(false);
    expect(eventSchema.safeParse({ ...evento, status: 'live' }).success).toBe(false);
  });

  it('rejeita data fora de UTC e odd numérica', () => {
    expect(eventSchema.safeParse({ ...evento, startsAt: '2026-11-02T20:00:00+01:00' }).success).toBe(false);
    const oddNumerica = { ...evento, markets: { ...evento.markets, matchResult: { home: 1.94, draw: null, away: null } } };
    expect(eventSchema.safeParse(oddNumerica).success).toBe(false);
  });

  it('embute a competição sem origin próprio (T14-A3)', () => {
    expect(eventSchema.safeParse({ ...evento, competition: { ...evento.competition, origin: 'provider' } }).success).toBe(false);
    const { competition: _competition, ...semCompeticao } = evento;
    expect(eventSchema.safeParse({ ...semCompeticao, competitionId: 'Xa0f-wjcs-tANp' }).success).toBe(false);
  });

  it('não aceita campos do provedor (nome da casa de apostas)', () => {
    const comFonte = { ...evento, markets: { ...evento.markets, source: 'DRAFT_KINGS' } };
    expect(eventSchema.safeParse(comFonte).success).toBe(false);
  });
});

describe('competitionSchema', () => {
  it('aceita competição de futebol e rejeita desporto fora da lista', () => {
    const epl = { id: 'Xa0f-wjcs-tANp', name: 'English Premier League', sport: 'soccer', origin: 'provider' };
    expect(competitionSchema.parse(epl)).toEqual(epl);
    expect(competitionSchema.safeParse({ ...epl, sport: 'basketball' }).success).toBe(false);
  });
});

describe('eventsQuerySchema', () => {
  it('aplica limite padrão 20 e converte texto da query', () => {
    expect(eventsQuerySchema.parse({})).toEqual({ limit: 20 });
    expect(eventsQuerySchema.parse({ limit: '50', competitionId: 'abc' })).toEqual({ limit: 50, competitionId: 'abc' });
  });

  it('aceita busca q aparada, entre 1 e 100 caracteres (A7, T14-A4)', () => {
    expect(eventsQuerySchema.parse({ q: '  arsenal ' })).toEqual({ limit: 20, q: 'arsenal' });
    expect(eventsQuerySchema.safeParse({ q: '   ' }).success).toBe(false);
    expect(eventsQuerySchema.safeParse({ q: 'a'.repeat(101) }).success).toBe(false);
  });

  it('rejeita limite fora de 1..100 e campo desconhecido', () => {
    expect(eventsQuerySchema.safeParse({ limit: '0' }).success).toBe(false);
    expect(eventsQuerySchema.safeParse({ limit: '101' }).success).toBe(false);
    expect(eventsQuerySchema.safeParse({ sort: 'startsAt' }).success).toBe(false);
  });
});
