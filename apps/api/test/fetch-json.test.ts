import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { z } from 'zod';
import { UpstreamError, fetchJson } from '../src/shared/http/fetch-json.js';

// Servidor HTTP local, só para os testes: não representa nenhum provedor real.
let server: Server;
let baseUrl: string;

beforeAll(async () => {
  server = createServer((request, response) => {
    const path = new URL(request.url ?? '/', 'http://localhost').pathname;
    if (path === '/ok') return void response.writeHead(200, { 'content-type': 'application/json' }).end('{"valor":42}');
    if (path === '/eco-cabecalho') {
      return void response.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ valor: Number(request.headers['x-teste']) }));
    }
    if (path === '/forma-errada') return void response.writeHead(200).end('{"valor":"texto"}');
    if (path === '/nao-json') return void response.writeHead(200).end('<html>');
    if (path === '/erro') return void response.writeHead(503).end('{}');
    if (path === '/lento') return void setTimeout(() => response.writeHead(200).end('{"valor":1}'), 500);
    response.writeHead(404).end();
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  server.closeAllConnections();
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

const schema = z.object({ valor: z.number() });
const options = { timeoutMs: 200 };

async function failureOf(promise: Promise<unknown>): Promise<UpstreamError> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof UpstreamError) return error;
    throw error;
  }
  throw new Error('devia ter falhado');
}

describe('fetchJson', () => {
  it('devolve a resposta validada pelo esquema', async () => {
    await expect(fetchJson(new URL('/ok', baseUrl), schema, options)).resolves.toEqual({ valor: 42 });
  });

  it('envia os cabeçalhos passados pelo adaptador', async () => {
    const result = await fetchJson(new URL('/eco-cabecalho', baseUrl), schema, { ...options, headers: { 'x-teste': '7' } });
    expect(result).toEqual({ valor: 7 });
  });

  it('rejeita resposta que não cumpre o esquema', async () => {
    expect((await failureOf(fetchJson(new URL('/forma-errada', baseUrl), schema, options))).failure).toBe('invalid_schema');
  });

  it('rejeita corpo que não é JSON', async () => {
    expect((await failureOf(fetchJson(new URL('/nao-json', baseUrl), schema, options))).failure).toBe('invalid_json');
  });

  it('expõe o status de uma resposta de erro', async () => {
    const error = await failureOf(fetchJson(new URL('/erro', baseUrl), schema, options));
    expect(error.failure).toBe('http_status');
    expect(error.status).toBe(503);
  });

  it('falha por tempo limite', async () => {
    expect((await failureOf(fetchJson(new URL('/lento', baseUrl), schema, options))).failure).toBe('timeout');
  });

  it('falha de rede quando nada responde', async () => {
    expect((await failureOf(fetchJson(new URL('http://127.0.0.1:1/x'), schema, options))).failure).toBe('network');
  });

  it('nunca inclui a query string nem os cabeçalhos na mensagem de erro', async () => {
    const url = new URL('/erro?apiKey=segredo-de-teste', baseUrl);
    const error = await failureOf(fetchJson(url, schema, { ...options, headers: { authorization: 'Bearer outro-segredo' } }));
    expect(error.message).not.toContain('segredo');
    expect(error.target).toBe(`${baseUrl}/erro`);
  });
});
