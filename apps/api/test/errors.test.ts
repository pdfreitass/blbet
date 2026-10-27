import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { apiErrorSchema } from '@blbet/contracts';
import { buildApp } from '../src/app.js';
import { loadConfig } from '../src/config/env.js';
import { AppError, parseInput } from '../src/shared/errors.js';
import { UpstreamError } from '../src/shared/http/fetch-json.js';

function testApp(): FastifyInstance {
  return buildApp(loadConfig({ NODE_ENV: 'test', LOG_LEVEL: 'silent' }));
}

describe('tratamento de erros', () => {
  let app: FastifyInstance | undefined;

  afterEach(async () => {
    await app?.close();
  });

  it('falha inesperada → INTERNAL_ERROR repetível, sem detalhe interno', async () => {
    app = testApp();
    app.get('/falha', async () => {
      throw new Error('detalhe interno C:\\caminho\\secreto');
    });

    const response = await app.inject({ method: 'GET', url: '/falha' });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'internal error', retryable: true } });
    expect(response.body).not.toContain('secreto');
  });

  it('provedor indisponível → 503 UPSTREAM_UNAVAILABLE repetível, sem o alvo', async () => {
    app = testApp();
    app.get('/provedor', async () => {
      throw new UpstreamError('timeout', 'https://exemplo.invalid/caminho');
    });

    const response = await app.inject({ method: 'GET', url: '/provedor' });

    expect(response.statusCode).toBe(503);
    expect(response.json().error).toMatchObject({ code: 'UPSTREAM_UNAVAILABLE', retryable: true });
    expect(response.body).not.toContain('exemplo.invalid');
  });

  it('AppError mantém o código e não é repetível quando o catálogo diz que não', async () => {
    app = testApp();
    app.get('/nao-existe-recurso', async () => {
      throw new AppError('NOT_FOUND', 'resource not found');
    });

    const response = await app.inject({ method: 'GET', url: '/nao-existe-recurso' });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: { code: 'NOT_FOUND', message: 'resource not found', retryable: false } });
  });

  it('validação → 400 VALIDATION_FAILED com detalhe por campo', async () => {
    app = testApp();
    const query = z.strictObject({ limit: z.coerce.number().int().max(100), sport: z.string() });
    app.get('/lista', async (request) => parseInput(query, request.query, 'query'));

    const response = await app.inject({ method: 'GET', url: '/lista?limit=500&extra=1' });

    expect(response.statusCode).toBe(400);
    const body = apiErrorSchema.parse(response.json());
    expect(body.error.code).toBe('VALIDATION_FAILED');
    expect(body.error.retryable).toBe(false);
    expect(body.error.details).toEqual(
      expect.arrayContaining([
        { field: 'query.limit', issue: 'too_big' },
        { field: 'query.sport', issue: 'required' },
        { field: 'query.extra', issue: 'unknown_field' },
      ]),
    );
  });

  it('JSON malformado → VALIDATION_FAILED sem detalhe técnico', async () => {
    app = testApp();
    app.post('/eco', async (request) => request.body);

    const response = await app.inject({ method: 'POST', url: '/eco', headers: { 'content-type': 'application/json' }, payload: '{mal' });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: { code: 'VALIDATION_FAILED', message: 'invalid request', retryable: false } });
  });

  it('todas as respostas de erro cumprem o esquema do contrato', async () => {
    app = testApp();
    const response = await app.inject({ method: 'GET', url: '/rota-inexistente' });

    expect(response.statusCode).toBe(404);
    expect(apiErrorSchema.safeParse(response.json()).success).toBe(true);
  });
});
