import type { FastifyInstance } from 'fastify';
import { buildApp } from './app.js';
import { type AppConfig, InvalidEnvError, loadConfig } from './config/env.js';
import { createSportsCatalog, type SportsCatalog } from './modules/sports/sports-catalog.js';
import { createSportsbookClient } from './modules/sports/sportsbook/client.js';

const PROVIDER_TIMEOUT_MS = 10_000;
const MINUTE_MS = 60_000;

// O catálogo regista avisos no logger da app, que só existe depois de buildApp.
function sportsCatalogFor(config: AppConfig, logger: () => FastifyInstance['log']): SportsCatalog | undefined {
  if (!config.SPORTS_PROVIDER_API_KEY) return undefined;
  return createSportsCatalog({
    provider: createSportsbookClient({
      apiKey: config.SPORTS_PROVIDER_API_KEY,
      host: config.SPORTS_PROVIDER_HOST,
      timeoutMs: PROVIDER_TIMEOUT_MS,
    }),
    competitions: config.SPORTS_COMPETITIONS,
    source: config.SPORTS_PROVIDER_SOURCE,
    refreshMs: config.SPORTS_REFRESH_MINUTES * MINUTE_MS,
    now: () => new Date(),
    log: { warn: (context, message) => logger().warn(context, message) },
  });
}

async function main(): Promise<void> {
  const config = loadConfig();
  const sports = sportsCatalogFor(config, () => app.log);
  const app = buildApp(config, { sports });
  if (!sports) app.log.warn('SPORTS_PROVIDER_API_KEY ausente: as rotas de esportes respondem 503');

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
  const message = error instanceof InvalidEnvError ? error.message : 'Falha ao arrancar o servidor.';
  console.error(message);
  if (!(error instanceof InvalidEnvError)) console.error(error);
  process.exit(1);
});
