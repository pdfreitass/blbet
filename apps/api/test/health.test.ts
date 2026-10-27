import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';
import { loadConfig } from '../src/config/env.js';

describe('GET /health', () => {
  let app: FastifyInstance | undefined;

  afterEach(async () => {
    await app?.close();
  });

  it('responde 200 com status ok', async () => {
    app = buildApp(loadConfig({ NODE_ENV: 'test', LOG_LEVEL: 'silent' }));

    const response = await app.inject({ method: 'GET', url: '/health' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });

  it('devolve 404 no envelope de erro para rota inexistente', async () => {
    app = buildApp(loadConfig({ NODE_ENV: 'test', LOG_LEVEL: 'silent' }));

    const response = await app.inject({ method: 'GET', url: '/nao-existe' });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: { code: 'NOT_FOUND', message: 'route not found', retryable: false } });
  });
});
