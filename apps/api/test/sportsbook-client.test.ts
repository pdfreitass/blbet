import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSportsbookClient } from '../src/modules/sports/sportsbook/client.js';
import { UpstreamError } from '../src/shared/http/fetch-json.js';

// Respostas reais gravadas (secção 5 do integracoes.md); o fetch é substituído, nada sai da máquina.
const competitionsBody = readFileSync(new URL('../recordings/competitions.json', import.meta.url), 'utf8');
const eventsBody = readFileSync(new URL('../recordings/events-EPL.json', import.meta.url), 'utf8');

const config = { apiKey: 'chave-de-teste', host: 'provedor.test', timeoutMs: 1000 };

function stubFetch(status: number, body: string) {
  const fetchMock = vi.fn(async (_url: URL, _init?: RequestInit) => new Response(body, { status }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function headersOf(init: RequestInit | undefined): Record<string, string> {
  return init?.headers as Record<string, string>;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('createSportsbookClient', () => {
  it('pede as competições com a chave só no cabeçalho', async () => {
    const fetchMock = stubFetch(200, competitionsBody);

    const competitions = await createSportsbookClient(config).listCompetitions();

    expect(competitions.length).toBeGreaterThan(0);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url.href).toBe('https://provedor.test/v0/competitions/');
    expect(url.href).not.toContain(config.apiKey);
    expect(headersOf(init)).toMatchObject({ 'x-rapidapi-key': 'chave-de-teste', 'x-rapidapi-host': 'provedor.test' });
  });

  it('pede os eventos pelo nome curto, com a janela sem milissegundos', async () => {
    const fetchMock = stubFetch(200, eventsBody);

    const events = await createSportsbookClient(config).listEvents('EPL', {
      from: new Date('2026-10-27T10:00:00.123Z'),
      to: new Date('2026-11-10T10:00:00.999Z'),
    });

    expect(events.length).toBeGreaterThan(0);
    const [url] = fetchMock.mock.calls[0]!;
    expect(url.pathname).toBe('/v1/competitions/EPL/events');
    expect(url.searchParams.get('startTimeFrom')).toBe('2026-10-27T10:00:00Z');
    expect(url.searchParams.get('startTimeTo')).toBe('2026-11-10T10:00:00Z');
  });

  it('escapa o nome da competição no caminho', async () => {
    const fetchMock = stubFetch(200, eventsBody);

    await createSportsbookClient(config).listEvents('A/B', { from: new Date(0), to: new Date(1000) });

    expect(fetchMock.mock.calls[0]![0].pathname).toBe('/v1/competitions/A%2FB/events');
  });

  it('transforma um erro HTTP do provedor em UpstreamError sem a chave na mensagem', async () => {
    stubFetch(429, '{}');

    const failure = await createSportsbookClient(config).listCompetitions().catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(UpstreamError);
    expect((failure as UpstreamError).status).toBe(429);
    expect((failure as UpstreamError).message).not.toContain(config.apiKey);
  });
});
