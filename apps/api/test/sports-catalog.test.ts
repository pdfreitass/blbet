import { describe, expect, it, vi } from 'vitest';
import { createSportsCatalog } from '../src/modules/sports/sports-catalog.js';
import type { SportsProvider, TimeWindow } from '../src/modules/sports/sportsbook/client.js';
import { competitionsResponseSchema, eventsResponseSchema } from '../src/modules/sports/sportsbook/schema.js';
import competitionsFixture from './fixtures/sportsbook-competitions.json' with { type: 'json' };
import eventsFixture from './fixtures/sportsbook-epl-events.json' with { type: 'json' };

const { competitions } = competitionsResponseSchema.parse(competitionsFixture);
const { events } = eventsResponseSchema.parse(eventsFixture);
const HOUR = 60 * 60 * 1000;
const silentLog = { warn: () => {} };

function fakeProvider() {
  return {
    listCompetitions: vi.fn(async () => competitions),
    listEvents: vi.fn(async (competition: string, _window: TimeWindow) => (competition === 'EPL' ? events : [])),
  } satisfies SportsProvider;
}

function setup(provider: SportsProvider, start = new Date('2026-10-27T10:00:00Z')) {
  let now = start;
  const catalog = createSportsCatalog({
    provider,
    competitions: ['EPL', 'LA_LIGA'],
    source: 'BET_PARX',
    refreshMs: HOUR,
    now: () => now,
    log: silentLog,
  });
  return { catalog, advance: (ms: number) => (now = new Date(now.getTime() + ms)) };
}

describe('createSportsCatalog', () => {
  it('lista só as competições configuradas, na ordem configurada', async () => {
    const { catalog } = setup(fakeProvider());
    const result = await catalog.competitions();
    expect(result.map((competition) => competition.name)).toEqual(['English Premier League', 'Spanish La Liga']);
  });

  it('converte os eventos e junta a competição', async () => {
    const { catalog } = setup(fakeProvider());
    const result = await catalog.events();
    expect(result).toHaveLength(2);
    expect(result[0]?.competition.name).toBe('English Premier League');
  });

  it('não volta ao provedor dentro do intervalo de atualização (DT-012)', async () => {
    const provider = fakeProvider();
    const { catalog, advance } = setup(provider);
    await catalog.events();
    advance(HOUR - 1);
    await catalog.events();
    expect(provider.listEvents).toHaveBeenCalledTimes(2); // uma por competição
    advance(1);
    await catalog.events();
    expect(provider.listEvents).toHaveBeenCalledTimes(4);
    expect(provider.listCompetitions).toHaveBeenCalledTimes(1); // só uma vez por dia
  });

  it('pedidos em simultâneo partilham a mesma chamada', async () => {
    const provider = fakeProvider();
    const { catalog } = setup(provider);
    await Promise.all([catalog.events(), catalog.events(), catalog.competitions()]);
    expect(provider.listCompetitions).toHaveBeenCalledTimes(1);
    expect(provider.listEvents).toHaveBeenCalledTimes(2);
  });

  it('serve os dados antigos quando o provedor falha e já há cache', async () => {
    const provider = fakeProvider();
    const { catalog, advance } = setup(provider);
    await catalog.events();
    provider.listEvents.mockRejectedValue(new Error('quota'));
    advance(HOUR);
    expect(await catalog.events()).toHaveLength(2);
  });

  it('depois de uma falha espera o intervalo completo antes de tentar de novo (poupa a quota)', async () => {
    const provider = fakeProvider();
    const { catalog, advance } = setup(provider);
    await catalog.events();
    provider.listEvents.mockRejectedValue(new Error('quota'));
    advance(HOUR);
    await catalog.events();
    await catalog.events();
    expect(provider.listEvents).toHaveBeenCalledTimes(4);
  });

  it('propaga a falha quando não há cache', async () => {
    const provider = fakeProvider();
    provider.listCompetitions.mockRejectedValue(new Error('down'));
    const { catalog } = setup(provider);
    await expect(catalog.competitions()).rejects.toThrow('down');
  });

  it('pede eventos de agora até 14 dias à frente', async () => {
    const provider = fakeProvider();
    const { catalog } = setup(provider);
    await catalog.events();
    const window = provider.listEvents.mock.calls[0]?.[1];
    expect(window?.from.toISOString()).toBe('2026-10-27T10:00:00.000Z');
    expect(window?.to.toISOString()).toBe('2026-11-10T10:00:00.000Z');
  });
});
