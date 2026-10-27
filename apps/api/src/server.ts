import { buildApp } from './app.js';
import { InvalidEnvError, loadConfig } from './config/env.js';

async function main(): Promise<void> {
  const config = loadConfig();
  const app = buildApp(config);

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
