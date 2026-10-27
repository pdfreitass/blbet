import { eventSchema } from '@blbet/contracts';
import { describe, expect, it } from 'vitest';
import { toCompetition, toOdd, toSportEvent } from '../src/modules/sports/sportsbook/adapter.js';
import { competitionsResponseSchema, eventsResponseSchema } from '../src/modules/sports/sportsbook/schema.js';
import competitionsFixture from './fixtures/sportsbook-competitions.json' with { type: 'json' };
import eventsFixture from './fixtures/sportsbook-epl-events.json' with { type: 'json' };

// Fixtures reduzidos a partir de respostas reais da Sportsbook API (2026-10-27): 2 eventos da
// EPL, só os mercados e fontes de que os testes precisam.
const { events } = eventsResponseSchema.parse(eventsFixture);
const { competitions } = competitionsResponseSchema.parse(competitionsFixture);
const epl = toCompetition(competitions.find((competition) => competition.shortName === 'EPL')!)!;

describe('toOdd', () => {
  it('arredonda para 2 casas', () => {
    expect(toOdd(1.555556)).toBe('1.56');
    expect(toOdd(2.3)).toBe('2.30');
    expect(toOdd(1.0101010101010102)).toBe('1.01');
  });

  it('devolve null abaixo de 1.01 ou para valores sem sentido', () => {
    expect(toOdd(1.004)).toBeNull();
    expect(toOdd(0)).toBeNull();
    expect(toOdd(Number.NaN)).toBeNull();
  });
});

describe('toCompetition', () => {
  it('converte futebol e ignora outros desportos', () => {
    expect(epl).toEqual({ id: 'Xa0f-wjcs-tANp', name: 'English Premier League', sport: 'soccer', origin: 'provider' });
    expect(toCompetition(competitions.find((competition) => competition.shortName === 'NBA')!)).toBeNull();
  });
});

describe('toSportEvent', () => {
  const [newcastle, liverpool] = events;

  it('produz um evento válido pelo contrato', () => {
    const event = toSportEvent(newcastle!, epl, 'BET_PARX');
    expect(eventSchema.safeParse(event).success).toBe(true);
  });

  it('separa casa e fora pelo homeParticipantKey, não pela ordem do nome', () => {
    const event = toSportEvent(newcastle!, epl, 'BET_PARX')!;
    expect(event.homeTeam).toEqual({ id: 'MIuT-wjcs-m2L0', name: 'Newcastle United' });
    expect(event.awayTeam).toEqual({ id: 'WPB8-wjcs-P0WD', name: 'Everton' });
    expect(event.competition).toEqual({ id: 'Xa0f-wjcs-tANp', name: 'English Premier League', sport: 'soccer' });
    expect(event.startsAt).toBe('2026-11-02T20:00:00.000Z');
  });

  it('usa só a fonte fixa e o tempo regulamentar', () => {
    const event = toSportEvent(newcastle!, epl, 'BET_PARX')!;
    expect(event.markets.matchResult).toEqual({ home: '2.20', draw: '3.55', away: '2.95' });
    expect(event.markets.totalGoals).toEqual([{ line: '2.50', over: '1.70', under: '2.14' }]);
  });

  it('deixa os mercados vazios quando a fonte não os tem', () => {
    const event = toSportEvent(liverpool!, epl, 'FONTE_INEXISTENTE')!;
    expect(event.markets).toEqual({ matchResult: null, totalGoals: [] });
  });

  it('não leva nenhum campo do provedor além do que o contrato define', () => {
    const event = toSportEvent(newcastle!, epl, 'DRAFT_KINGS')!;
    expect(JSON.stringify(event)).not.toMatch(/DRAFT_KINGS|BET_PARX|payout|modifier/);
  });

  it('descarta evento sem equipa da casa identificável', () => {
    expect(toSportEvent({ ...newcastle!, homeParticipantKey: 'outra' }, epl, 'BET_PARX')).toBeNull();
  });
});
