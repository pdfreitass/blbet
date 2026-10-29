import {
  competitionSchema,
  eventSchema,
  MAX_CURSOR_LENGTH,
  MAX_QUERY_LENGTH,
  paginatedSchema,
  successSchema,
} from '@blbet/contracts';
import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { loadConfig } from '../src/config/env.js';
import { createSportsCatalog } from '../src/modules/sports/sports-catalog.js';
import type { SportsProvider } from '../src/modules/sports/sportsbook/client.js';
import { competitionsResponseSchema, eventsResponseSchema } from '../src/modules/sports/sportsbook/schema.js';
import competitionsFixture from '../recordings/competitions.json' with { type: 'json' };
import eventsFixture from '../recordings/events-EPL.json' with { type: 'json' };

const { competitions } = competitionsResponseSchema.parse(competitionsFixture);
const { events } = eventsResponseSchema.parse(eventsFixture);
// Fixture: Newcastle–Everton a 2026-11-02T20:00Z e Liverpool–Arsenal a 2026-11-01T16:30Z.
const NEWCASTLE = 'OVc2-Alcu-Ynsy';
const BEFORE_BOTH = new Date('2026-10-27T10:00:00Z');
const BETWEEN = new Date('2026-11-01T17:00:00Z');

const provider: SportsProvider = {
  listCompetitions: async () => competitions,
  listEvents: async (competition) => (competition === 'EPL' ? events : []),
};

let app: FastifyInstance | undefined;
afterEach(async () => {
  await app?.close();
});

function start(now = BEFORE_BOTH, withProvider = true) {
  const config = loadConfig({ NODE_ENV: 'test', LOG_LEVEL: 'silent' });
  const clock = () => now;
  const sports = withProvider
    ? createSportsCatalog({ provider, competitions: ['EPL'], source: 'BET_PARX', refreshMs: 60_000, now: clock, log: { warn: () => {} } })
    : undefined;
  app = buildApp(config, { sports, now: clock });
  return app;
}

const get = async (url: string, now?: Date, withProvider?: boolean) =>
  start(now, withProvider).inject({ method: 'GET', url });

describe('GET /api/competitions', () => {
  it('devolve as competições no envelope paginado', async () => {
    const response = await get('/api/competitions');
    expect(response.statusCode).toBe(200);
    const body = paginatedSchema(competitionSchema).parse(response.json());
    expect(body.data.map((competition) => competition.name)).toEqual(['English Premier League']);
    expect(body.meta.nextCursor).toBeNull();
  });

  it('dá 503 retryable quando o provedor não está configurado', async () => {
    const response = await get('/api/competitions', BEFORE_BOTH, false);
    expect(response.statusCode).toBe(503);
    expect(response.json().error).toMatchObject({ code: 'UPSTREAM_UNAVAILABLE', retryable: true });
  });
});

describe('GET /api/events', () => {
  it('lista os jogos futuros por ordem de início e valida pelo contrato', async () => {
    const response = await get('/api/events');
    expect(response.statusCode).toBe(200);
    const body = paginatedSchema(eventSchema).parse(response.json());
    expect(body.data.map((event) => event.homeTeam.name)).toEqual(['Liverpool', 'Newcastle United']);
  });

  it('esconde os jogos que já começaram (DT-010)', async () => {
    const body = (await get('/api/events', BETWEEN)).json();
    expect(body.data.map((event: { id: string }) => event.id)).toEqual([NEWCASTLE]);
  });

  it('filtra por competição e pela busca q, sem distinguir maiúsculas nem acentos', async () => {
    expect((await get('/api/events?competitionId=outra')).json().data).toEqual([]);
    const body = (await get('/api/events?q=ÉVERTON')).json();
    expect(body.data.map((event: { id: string }) => event.id)).toEqual([NEWCASTLE]);
    expect((await get('/api/events?q=premier')).json().data).toHaveLength(2);
    expect((await get('/api/events?q=inexistente')).json()).toEqual({ data: [], meta: { nextCursor: null } });
  });

  it('pagina com cursor opaco', async () => {
    const first = (await get('/api/events?limit=1')).json();
    expect(first.data).toHaveLength(1);
    expect(first.meta.nextCursor).toEqual(expect.any(String));
    const second = (await get(`/api/events?limit=1&cursor=${first.meta.nextCursor}`)).json();
    expect(second.data[0].id).toBe(NEWCASTLE);
    expect(second.meta.nextCursor).toBeNull();
  });

  it('rejeita cursor inválido ou usado com outros filtros (A6)', async () => {
    const first = (await get('/api/events?limit=1')).json();
    for (const url of ['/api/events?cursor=lixo', `/api/events?limit=1&q=arsenal&cursor=${first.meta.nextCursor}`]) {
      const response = await get(url);
      expect(response.statusCode).toBe(400);
      expect(response.json().error.details).toEqual([{ field: 'query.cursor', issue: 'invalid_cursor' }]);
    }
  });

  // S-2 — o cursor vai a JSON.parse, por isso tem teto de tamanho. O teto não pode cortar o que a
  // própria api emite: aqui confirma-se com o cursor real do pior caso que a query permite.
  it('aceita o cursor do pior caso e rejeita um cursor acima do teto (S-2)', async () => {
    const heavy = `?limit=1&q=${encodeURIComponent('中'.repeat(MAX_QUERY_LENGTH))}`;
    const emitted = (await get(`/api/events${heavy}`)).json().meta.nextCursor;
    expect(emitted === null || emitted.length <= MAX_CURSOR_LENGTH).toBe(true);

    const oversized = await get(`/api/events?cursor=${'x'.repeat(MAX_CURSOR_LENGTH + 1)}`);
    expect(oversized.statusCode).toBe(400);
    expect(oversized.json().error.details).toEqual([{ field: 'query.cursor', issue: 'too_big' }]);
  });

  it('rejeita campo desconhecido e limite fora do intervalo', async () => {
    const unknown = await get('/api/events?sort=startsAt');
    expect(unknown.statusCode).toBe(400);
    expect(unknown.json().error.details).toEqual([{ field: 'query.sort', issue: 'unknown_field' }]);
    expect((await get('/api/events?limit=500')).statusCode).toBe(400);
  });
});

describe('GET /api/events/:id', () => {
  it('devolve o evento', async () => {
    const response = await get(`/api/events/${NEWCASTLE}`);
    expect(response.statusCode).toBe(200);
    expect(successSchema(eventSchema).parse(response.json()).data.awayTeam.name).toBe('Everton');
  });

  it('devolve o mesmo conteúdo da listagem para o mesmo evento (CA-002.3)', async () => {
    const server = start();
    const list = paginatedSchema(eventSchema).parse((await server.inject({ method: 'GET', url: '/api/events' })).json());
    const detail = successSchema(eventSchema).parse((await server.inject({ method: 'GET', url: `/api/events/${NEWCASTLE}` })).json());
    expect(detail.data).toEqual(list.data.find((event) => event.id === NEWCASTLE));
  });

  it('dá 404 com event_started para um jogo que já começou (T14-A1)', async () => {
    const response = await get('/api/events/YmT4-Albq-rMNm', BETWEEN);
    expect(response.statusCode).toBe(404);
    expect(response.json().error).toMatchObject({
      code: 'NOT_FOUND',
      retryable: false,
      details: [{ field: 'path.id', issue: 'event_started' }],
    });
  });

  it('dá 404 sem detalhe para um id desconhecido', async () => {
    const response = await get('/api/events/nao-existe');
    expect(response.statusCode).toBe(404);
    expect(response.json().error.details).toBeUndefined();
  });
});
