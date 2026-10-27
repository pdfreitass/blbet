import Fastify, { type FastifyInstance } from 'fastify';
import type { AppConfig } from './config/env.js';
import { healthRoutes } from './routes/health.js';

// Cabeçalhos que podem levar credenciais nunca chegam aos logs.
const REDACTED_PATHS = ['req.headers.authorization', 'req.headers.cookie', 'req.headers["x-api-key"]'];

export function buildApp(config: AppConfig): FastifyInstance {
  const app = Fastify({
    logger: { level: config.LOG_LEVEL, redact: REDACTED_PATHS },
  });

  // O detalhe técnico fica no log do servidor; o cliente recebe só uma mensagem genérica (CA-008.2).
  // O formato definitivo do erro depende de PC-001 a PC-003 do contrato.
  app.setErrorHandler((error: unknown, request, reply) => {
    const statusCode = clientStatusCode(error) ?? 500;
    if (statusCode >= 500) {
      request.log.error({ err: error }, 'falha inesperada');
      return reply.status(500).send({ message: 'Erro interno.' });
    }
    return reply.status(statusCode).send({ message: 'Pedido inválido.' });
  });

  app.setNotFoundHandler((_request, reply) => reply.status(404).send({ message: 'Recurso não encontrado.' }));

  app.register(healthRoutes);

  return app;
}

function clientStatusCode(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null || !('statusCode' in error)) return undefined;
  const { statusCode } = error;
  return typeof statusCode === 'number' && statusCode >= 400 && statusCode < 500 ? statusCode : undefined;
}
