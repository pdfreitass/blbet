import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { loadConfig } from '../src/config/env.js';

// S-3 — cabeçalhos de segurança, CORS restrito e teto do corpo do pedido.

let app: FastifyInstance | undefined;
afterEach(async () => {
  await app?.close();
  app = undefined;
});

function start(env: Readonly<Record<string, string>> = {}) {
  app = buildApp(loadConfig({ NODE_ENV: 'test', LOG_LEVEL: 'silent', RATE_LIMIT_MAX: '0', ...env }));
  return app;
}

describe('cabeçalhos de segurança', () => {
  it('a api serve JSON, por isso a política de conteúdo nega tudo', async () => {
    const response = await start().inject({ method: 'GET', url: '/health' });

    expect(response.headers['content-security-policy']).toContain("default-src 'none'");
    expect(response.headers['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });

  it('não promete HTTPS fora de produção, onde não há HTTPS', async () => {
    const response = await start().inject({ method: 'GET', url: '/health' });
    expect(response.headers['strict-transport-security']).toBeUndefined();
  });
});

describe('CORS', () => {
  it('sem origens configuradas, nenhuma é autorizada', async () => {
    const response = await start().inject({
      method: 'GET',
      url: '/health',
      headers: { origin: 'https://exemplo.invalido' },
    });

    // Sem o cabeçalho, o navegador recusa a resposta a quem chama de outra origem.
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('autoriza só as origens da lista, e deixa passar o cookie', async () => {
    const instance = start({ CORS_ORIGINS: 'https://blbet.exemplo' });

    const autorizada = await instance.inject({
      method: 'GET',
      url: '/health',
      headers: { origin: 'https://blbet.exemplo' },
    });
    expect(autorizada.headers['access-control-allow-origin']).toBe('https://blbet.exemplo');
    expect(autorizada.headers['access-control-allow-credentials']).toBe('true');

    const outra = await instance.inject({ method: 'GET', url: '/health', headers: { origin: 'https://outro.exemplo' } });
    expect(outra.headers['access-control-allow-origin']).toBeUndefined();
  });
});

describe('tamanho do pedido', () => {
  it('recusa um corpo acima do teto, no envelope da PC-001', async () => {
    const instance = start({ BODY_LIMIT_BYTES: '1024' });

    const response = await instance.inject({
      method: 'POST',
      url: '/api/accounts',
      headers: { 'content-type': 'application/json' },
      payload: JSON.stringify({ email: 'a@b.pt', password: 'x'.repeat(4096) }),
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe('VALIDATION_FAILED');
  });
});
