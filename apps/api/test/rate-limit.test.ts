import { apiErrorSchema } from '@blbet/contracts';
import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { loadConfig } from '../src/config/env.js';

// S-1 — limite de pedidos por cliente. A cache protege a quota do provedor; isto protege a api.

let app: FastifyInstance | undefined;
afterEach(async () => {
  await app?.close();
});

function start(env: Readonly<Record<string, string>> = {}) {
  app = buildApp(loadConfig({ NODE_ENV: 'test', LOG_LEVEL: 'silent', ...env }));
  return app;
}

const get = (instance: FastifyInstance) => instance.inject({ method: 'GET', url: '/health' });

describe('limite de pedidos', () => {
  it('responde 429 no envelope da PC-001 quando o cliente passa do limite', async () => {
    const instance = start({ RATE_LIMIT_MAX: '2' });

    expect((await get(instance)).statusCode).toBe(200);
    expect((await get(instance)).statusCode).toBe(200);

    const blocked = await get(instance);
    expect(blocked.statusCode).toBe(429);
    const body = apiErrorSchema.parse(blocked.json());
    expect(body.error).toMatchObject({ code: 'RATE_LIMITED', retryable: true });
    // A1 — o cliente sabe que pode repetir sem manter a tabela de códigos.
    expect(body.error.message).toBe('too many requests');
  });

  it('anuncia o limite nos cabeçalhos, para o cliente se poder conter', async () => {
    const instance = start({ RATE_LIMIT_MAX: '2' });
    const response = await get(instance);
    expect(response.headers['x-ratelimit-limit']).toBe('2');
    expect(response.headers['x-ratelimit-remaining']).toBe('1');
  });

  it('conta por janela: RATE_LIMIT_WINDOW_SECONDS define a janela', async () => {
    const instance = start({ RATE_LIMIT_MAX: '1', RATE_LIMIT_WINDOW_SECONDS: '600' });
    expect((await get(instance)).statusCode).toBe(200);
    const blocked = await get(instance);
    expect(blocked.statusCode).toBe(429);
    expect(Number(blocked.headers['x-ratelimit-reset'])).toBeGreaterThan(60);
  });

  it('RATE_LIMIT_MAX=0 desliga o limite, que é o que os E2E precisam', async () => {
    const instance = start({ RATE_LIMIT_MAX: '0' });
    for (let attempt = 0; attempt < 12; attempt += 1) {
      expect((await get(instance)).statusCode).toBe(200);
    }
    expect((await get(instance)).headers['x-ratelimit-limit']).toBeUndefined();
  });

  it('o limite por omissão é largo e não estorva o uso normal', async () => {
    const config = loadConfig({});
    expect(config.RATE_LIMIT_MAX).toBe(300);
    expect(config.RATE_LIMIT_WINDOW_SECONDS).toBe(60);

    const instance = start();
    const responses = await Promise.all(Array.from({ length: 30 }, () => get(instance)));
    expect(responses.every((response) => response.statusCode === 200)).toBe(true);
  });
});
