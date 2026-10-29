import { readFileSync } from 'node:fs';
import { z } from 'zod';
import type { SportsProvider } from '../sportsbook/client.js';
import { competitionsResponseSchema, eventsResponseSchema, type SportsbookEvent } from '../sportsbook/schema.js';

// Modo de teste da api (DT-018): o provedor é substituído por respostas gravadas, para os testes
// end-to-end correrem sem chave e sem gastar quota. Os ficheiros de `recordings/` são respostas
// reais do provedor, reduzidas — nada aqui é inventado, e nada é apresentado como chamada real.

const manifestSchema = z.strictObject({
  /** Instante da gravação. É também o relógio do modo de teste (ver `server.ts`). */
  recordedAt: z.iso.datetime(),
  /** Fonte única das odds na gravação (DT-010). */
  source: z.string().min(1),
  /** Nomes curtos com eventos gravados; cada um exige um `events-<nome>.json`. */
  competitions: z.array(z.string().min(1)).min(1),
});

export class RecordingError extends Error {
  constructor(file: string, detail: string) {
    super(`Gravação inválida em ${file}: ${detail}`);
    this.name = 'RecordingError';
  }
}

export interface Recording {
  readonly recordedAt: Date;
  readonly source: string;
  readonly competitions: readonly string[];
  readonly provider: SportsProvider;
}

/** `apps/api/recordings/`, tanto a partir de `src/` como de `dist/`. */
export const DEFAULT_RECORDINGS_DIR = new URL('../../../../recordings/', import.meta.url);

function read<T>(dir: URL, file: string, schema: z.ZodType<T>): T {
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(new URL(file, dir), 'utf8'));
  } catch (error: unknown) {
    throw new RecordingError(file, error instanceof Error ? error.message : 'não foi possível ler o ficheiro');
  }
  const result = schema.safeParse(raw);
  if (!result.success) throw new RecordingError(file, z.prettifyError(result.error));
  return result.data;
}

export function loadRecording(dir: URL = DEFAULT_RECORDINGS_DIR): Recording {
  const manifest = read(dir, 'recording.json', manifestSchema);
  const { competitions } = read(dir, 'competitions.json', competitionsResponseSchema);

  const eventsOf = new Map<string, readonly SportsbookEvent[]>(
    manifest.competitions.map((shortName) => {
      const file = `events-${shortName}.json`;
      return [shortName, read(dir, file, eventsResponseSchema).events];
    }),
  );

  return {
    recordedAt: new Date(manifest.recordedAt),
    source: manifest.source,
    competitions: manifest.competitions,
    provider: {
      listCompetitions: async () => competitions,
      // A gravação é uma fotografia: a janela de tempo pedida não a altera.
      listEvents: async (competition) => eventsOf.get(competition) ?? [],
    },
  };
}
