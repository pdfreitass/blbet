import rateLimit from '@fastify/rate-limit';
import Fastify, { type FastifyInstance } from 'fastify';
import type { ErrorCode } from '@blbet/contracts';
import type { AppConfig } from './config/env.js';
import type { SportsCatalog } from './modules/sports/sports-catalog.js';
import { healthRoutes } from './routes/health.js';
import { sportsRoutes } from './routes/sports.js';
import { AppError, errorBody, statusOf } from './shared/errors.js';
import { UpstreamError } from './shared/http/fetch-json.js';

// Cabeçalhos que podem levar credenciais nunca chegam aos logs.
const REDACTED_PATHS = ['req.headers.authorization', 'req.headers.cookie', 'req.headers["x-api-key"]'];

export interface AppDeps {
  /** Ausente sem provedor configurado: as rotas de esportes respondem 503. */
  readonly sports?: SportsCatalog | undefined;
  readonly now?: () => Date;
}

export function buildApp(config: AppConfig, deps: AppDeps = {}): FastifyInstance {
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

  // S-1 — limite de pedidos por cliente. A cache (DT-012) protege a quota do provedor, não a api:
  // um cliente só já basta para a sobrecarregar. O 429 sai no envelope da PC-001, como os outros.
  if (config.RATE_LIMIT_MAX > 0) {
    app.register(rateLimit, {
      max: config.RATE_LIMIT_MAX,
      timeWindow: config.RATE_LIMIT_WINDOW_SECONDS * 1000,
      // O plugin lança o que este construtor devolve: um AppError cai no tratamento normal e sai
      // no envelope da PC-001, com `retryable: true` pela tabela de `errors.ts`.
      errorResponseBuilder: () => new AppError('RATE_LIMITED', 'too many requests'),
    });
  }

  app.register(healthRoutes);
  app.register(sportsRoutes, { sports: deps.sports, now: deps.now ?? (() => new Date()) });

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
