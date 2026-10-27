import type { z } from 'zod';

// Cliente HTTP genérico para os adaptadores de provedor (docs/arquitetura.md, secção 6).
// Não conhece nenhum provedor: o adaptador passa o URL, os cabeçalhos e o esquema da resposta.

export type UpstreamFailure = 'timeout' | 'network' | 'http_status' | 'invalid_json' | 'invalid_schema';

export class UpstreamError extends Error {
  readonly failure: UpstreamFailure;
  readonly target: string;
  readonly status: number | undefined;

  constructor(failure: UpstreamFailure, target: string, status?: number) {
    super(`Falha no provedor (${failure}${status === undefined ? '' : ` ${status}`}) em ${target}`);
    this.name = 'UpstreamError';
    this.failure = failure;
    this.target = target;
    this.status = status;
  }
}

export interface FetchJsonOptions {
  readonly timeoutMs: number;
  readonly headers?: Readonly<Record<string, string>>;
}

// Só origem e caminho: a query string e os cabeçalhos podem levar credenciais.
function describeTarget(url: URL): string {
  return `${url.origin}${url.pathname}`;
}

export async function fetchJson<T>(url: URL, schema: z.ZodType<T>, options: FetchJsonOptions): Promise<T> {
  const target = describeTarget(url);

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { accept: 'application/json', ...options.headers },
      signal: AbortSignal.timeout(options.timeoutMs),
    });
  } catch (error: unknown) {
    const timedOut = error instanceof DOMException && error.name === 'TimeoutError';
    throw new UpstreamError(timedOut ? 'timeout' : 'network', target);
  }

  if (!response.ok) {
    await response.body?.cancel();
    throw new UpstreamError('http_status', target, response.status);
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new UpstreamError('invalid_json', target, response.status);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new UpstreamError('invalid_schema', target, response.status);
  return parsed.data;
}
