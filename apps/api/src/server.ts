import type { FastifyInstance } from 'fastify';
import { buildApp } from './app.js';
import { type AppConfig, InvalidEnvError, loadConfig } from './config/env.js';
import { loadRecording, type Recording, RecordingError } from './modules/sports/recorded/recording.js';
import { createSportsCatalog, type SportsCatalog } from './modules/sports/sports-catalog.js';
import { createSportsbookClient } from './modules/sports/sportsbook/client.js';

const PROVIDER_TIMEOUT_MS = 10_000;
const MINUTE_MS = 60_000;

// Com uma gravação (DT-018) o relógio fica parado no instante gravado: os jogos gravados continuam
// futuros, a cache não expira e os E2E vêem sempre o mesmo. SPORTS_NOW permite escolher outro
// instante, por exemplo para exercitar o jogo que já começou.
function clockFor(config: AppConfig, recording: Recording | undefined): () => Date {
  if (!recording) return () => new Date();
  const instant = config.SPORTS_NOW ? new Date(config.SPORTS_NOW) : recording.recordedAt;
  return () => instant;
}

// O catálogo regista avisos no logger da app, que só existe depois de buildApp.
function sportsCatalogFor(
  config: AppConfig,
  recording: Recording | undefined,
  now: () => Date,
  logger: () => FastifyInstance['log'],
): SportsCatalog | undefined {
  const provider =
    recording?.provider ??
    (config.SPORTS_PROVIDER_API_KEY
      ? createSportsbookClient({
          apiKey: config.SPORTS_PROVIDER_API_KEY,
          host: config.SPORTS_PROVIDER_HOST,
          timeoutMs: PROVIDER_TIMEOUT_MS,
        })
      : undefined);
  if (!provider) return undefined;

  return createSportsCatalog({
    provider,
    competitions: recording?.competitions ?? config.SPORTS_COMPETITIONS,
    source: recording?.source ?? config.SPORTS_PROVIDER_SOURCE,
    refreshMs: config.SPORTS_REFRESH_MINUTES * MINUTE_MS,
    now,
    log: { warn: (context, message) => logger().warn(context, message) },
  });
}

async function main(): Promise<void> {
  const config = loadConfig();
  const recording = config.SPORTS_MODE === 'recorded' ? loadRecording() : undefined;
  const now = clockFor(config, recording);
  const sports = sportsCatalogFor(config, recording, now, () => app.log);
  const app = buildApp(config, { sports, now });
  if (recording) {
    app.log.warn(
      { competitions: recording.competitions, clock: now().toISOString() },
      'SPORTS_MODE=recorded: respostas gravadas, sem chamadas ao provedor e com o relógio parado',
    );
  } else if (!sports) {
    app.log.warn('SPORTS_PROVIDER_API_KEY ausente: as rotas de esportes respondem 503');
  }

  const shutdown = async (signal: string): Promise<void> => {
    app.log.info({ signal }, 'a encerrar');
    await app.close();
    process.exit(0);
  };
  process.once('SIGINT', () => void shutdown('SIGINT'));
  process.once('SIGTERM', () => void shutdown('SIGTERM'));

  await app.listen({ host: config.HOST, port: config.PORT });
}

main().catch((error: unknown) => {
  const expected = error instanceof InvalidEnvError || error instanceof RecordingError;
  console.error(expected ? error.message : 'Falha ao arrancar o servidor.');
  if (!expected) console.error(error);
  process.exit(1);
});
