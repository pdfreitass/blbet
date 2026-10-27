import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';
import { loadConfig } from '../src/config/env.js';

describe('tratamento de erros', () => {
  let app: FastifyInstance | undefined;

  afterEach(async () => {
    await app?.close();
  });

  it('não expõe o detalhe de uma falha inesperada', async () => {
    app = buildApp(loadConfig({ NODE_ENV: 'test', LOG_LEVEL: 'silent' }));
    app.get('/falha', async () => {
      throw new Error('detalhe interno C:\\caminho\\secreto');
    });

    const response = await app.inject({ method: 'GET', url: '/falha' });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({ message: 'Erro interno.' });
    expect(response.body).not.toContain('secreto');
  });

  it('mantém o status 4xx de um erro do cliente com mensagem genérica', async () => {
    app = buildApp(loadConfig({ NODE_ENV: 'test', LOG_LEVEL: 'silent' }));
    app.get('/invalido', async () => {
      throw Object.assign(new Error('campo x inválido'), { statusCode: 400 });
    });

    const response = await app.inject({ method: 'GET', url: '/invalido' });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ message: 'Pedido inválido.' });
  });
});
