import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { competitionSchema, eventSchema, paginatedSchema } from '@blbet/contracts';
import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { loadConfig } from '../src/config/env.js';
import { loadRecording, RecordingError } from '../src/modules/sports/recorded/recording.js';
import { createSportsCatalog } from '../src/modules/sports/sports-catalog.js';

// Gravação real em `apps/api/recordings/`: EPL com Liverpool–Arsenal e Newcastle–Everton.
const LIVERPOOL = 'YmT4-Albq-rMNm';
const NEWCASTLE = 'OVc2-Alcu-Ynsy';

// Uma pasta temporária por teste, para exercitar gravações inválidas sem tocar na real.
function recordingDir(files: Readonly<Record<string, string>>): URL {
  const dir = mkdtempSync(join(tmpdir(), 'blbet-recording-'));
  for (const [name, content] of Object.entries(files)) writeFileSync(join(dir, name), content);
  return pathToFileURL(`${dir}/`);
}

describe('loadRecording', () => {
  it('lê a gravação que acompanha a api', () => {
    const recording = loadRecording();
    expect(recording.competitions).toEqual(['EPL']);
    expect(recording.source).toBe('BET_PARX');
    expect(recording.recordedAt.toISOString()).toBe('2026-10-27T10:00:00.000Z');
  });

  it('serve os eventos gravados da competição e nada para as outras', async () => {
    const { provider, recordedAt } = loadRecording();
    const window = { from: recordedAt, to: recordedAt };
    expect((await provider.listEvents('EPL', window)).map((event) => event.key)).toEqual([NEWCASTLE, LIVERPOOL]);
    expect(await provider.listEvents('LA_LIGA', window)).toEqual([]);
    expect((await provider.listCompetitions()).map((competition) => competition.shortName)).toContain('EPL');
  });

  it('não deixa a janela de tempo alterar a gravação', async () => {
    const { provider, recordedAt } = loadRecording();
    const later = new Date(recordedAt.getTime() + 90 * 24 * 60 * 60 * 1000);
    const wide = await provider.listEvents('EPL', { from: recordedAt, to: later });
    const narrow = await provider.listEvents('EPL', { from: recordedAt, to: recordedAt });
    expect(wide).toEqual(narrow);
  });

  it('recusa um manifesto malformado, dizendo o ficheiro', () => {
    const dir = recordingDir({ 'recording.json': '{ não é json' });
    expect(() => loadRecording(dir)).toThrow(RecordingError);
    expect(() => loadRecording(dir)).toThrow(/recording\.json/);
  });

  it('recusa um manifesto sem os campos exigidos', () => {
    const dir = recordingDir({ 'recording.json': JSON.stringify({ recordedAt: '2026-10-27T10:00:00.000Z' }) });
    expect(() => loadRecording(dir)).toThrow(/recording\.json/);
  });

  it('recusa a gravação quando falta o ficheiro de eventos de uma competição anunciada', () => {
    const dir = recordingDir({
      'recording.json': JSON.stringify({ recordedAt: '2026-10-27T10:00:00.000Z', source: 'BET_PARX', competitions: ['EPL'] }),
      'competitions.json': JSON.stringify({ competitions: [] }),
    });
    expect(() => loadRecording(dir)).toThrow(/events-EPL\.json/);
  });

  it('recusa uma resposta gravada que não tem a forma do provedor', () => {
    const dir = recordingDir({
      'recording.json': JSON.stringify({ recordedAt: '2026-10-27T10:00:00.000Z', source: 'BET_PARX', competitions: ['EPL'] }),
      'competitions.json': JSON.stringify({ competitions: [{ key: 'k' }] }),
    });
    expect(() => loadRecording(dir)).toThrow(/competitions\.json/);
  });
});

describe('api com a gravação', () => {
  // Reproduz o que o `server.ts` monta em SPORTS_MODE=recorded: relógio parado no instante gravado.
  function start() {
    const recording = loadRecording();
    const now = () => recording.recordedAt;
    const sports = createSportsCatalog({
      provider: recording.provider,
      competitions: recording.competitions,
      source: recording.source,
      refreshMs: 60_000,
      now,
      log: { warn: () => {} },
    });
    return buildApp(loadConfig({ NODE_ENV: 'test', LOG_LEVEL: 'silent' }), { sports, now });
  }

  it('serve as competições e os jogos gravados, sem chave do provedor', async () => {
    const app = start();
    try {
      const competitions = paginatedSchema(competitionSchema).parse(
        (await app.inject({ method: 'GET', url: '/api/competitions' })).json(),
      );
      expect(competitions.data.map((competition) => competition.name)).toEqual(['English Premier League']);

      const events = paginatedSchema(eventSchema).parse((await app.inject({ method: 'GET', url: '/api/events' })).json());
      expect(events.data.map((event) => event.id)).toEqual([LIVERPOOL, NEWCASTLE]);
      expect(events.data[0]?.markets.matchResult).not.toBeNull();
    } finally {
      await app.close();
    }
  });

  it('dá sempre a mesma resposta, que é o que os E2E precisam', async () => {
    const first = start();
    const second = start();
    try {
      const a = await first.inject({ method: 'GET', url: '/api/events' });
      const b = await second.inject({ method: 'GET', url: '/api/events' });
      expect(a.json()).toEqual(b.json());
    } finally {
      await first.close();
      await second.close();
    }
  });

  it('serve o detalhe do jogo gravado', async () => {
    const app = start();
    try {
      const response = await app.inject({ method: 'GET', url: `/api/events/${LIVERPOOL}` });
      expect(response.statusCode).toBe(200);
      expect(eventSchema.parse(response.json().data).homeTeam.name).toBe('Liverpool');
    } finally {
      await app.close();
    }
  });
});
