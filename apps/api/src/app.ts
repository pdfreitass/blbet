import Fastify, { type FastifyInstance } from 'fastify';
import type { ErrorCode } from '@blbet/contracts';
import type { AppConfig } from './config/env.js';
import { healthRoutes } from './routes/health.js';
import { AppError, errorBody, statusOf } from './shared/errors.js';
import { UpstreamError } from './shared/http/fetch-json.js';

// Cabeçalhos que podem levar credenciais nunca chegam aos logs.
const REDACTED_PATHS = ['req.headers.authorization', 'req.headers.cookie', 'req.headers["x-api-key"]'];

export function buildApp(config: AppConfig): FastifyInstance {
  const app = Fastify({
    logger: { level: config.LOG_LEVEL, redact: REDACTED_PATHS },
  });

  // Todos os erros saem no envelope da PC-001. O detalhe técnico fica no log (CA-008.2).
  app.setErrorHandler((error: unknown, request, reply) => {
    if (error instanceof AppError) {
      return reply.status(statusOf(error.code)).send(errorBody(error.code, error.message, error.details));
    }
    if (error instanceof UpstreamError) {
      request.log.warn({ failure: error.failure, target: error.target, status: error.status }, 'provedor indisponível');
      return reply.status(503).send(errorBody('UPSTREAM_UNAVAILABLE', 'upstream unavailable'));
    }
    const clientCode = clientErrorCode(error);
    if (clientCode) return reply.status(statusOf(clientCode)).send(errorBody(clientCode, 'invalid request'));

    request.log.error({ err: error }, 'falha inesperada');
    return reply.status(500).send(errorBody('INTERNAL_ERROR', 'internal error'));
  });

  app.setNotFoundHandler((_request, reply) => reply.status(404).send(errorBody('NOT_FOUND', 'route not found')));

  app.register(healthRoutes);

  return app;
}

// Erros 4xx do próprio Fastify (JSON malformado, tipo de conteúdo não suportado, etc.).
function clientErrorCode(error: unknown): ErrorCode | undefined {
  if (typeof error !== 'object' || error === null || !('statusCode' in error)) return undefined;
  const { statusCode } = error;
  if (typeof statusCode !== 'number' || statusCode < 400 || statusCode >= 500) return undefined;
  if (statusCode === 404) return 'NOT_FOUND';
  if (statusCode === 429) return 'RATE_LIMITED';
  return 'VALIDATION_FAILED';
}
