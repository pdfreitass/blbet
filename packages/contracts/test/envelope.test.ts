import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { apiErrorSchema, paginatedSchema, successSchema } from '../src/envelope.js';
import { originSchema, utcDateTimeSchema } from '../src/primitives.js';

describe('apiErrorSchema', () => {
  it('aceita um erro com detalhe por campo', () => {
    const body = {
      error: {
        code: 'VALIDATION_FAILED',
        message: 'query.limit too_big',
        retryable: false,
        details: [{ field: 'query.limit', issue: 'too_big' }],
      },
    };
    expect(apiErrorSchema.parse(body)).toEqual(body);
  });

  it('aceita retryAfterSeconds positivo e rejeita zero', () => {
    const base = { code: 'RATE_LIMITED', message: 'rate limited', retryable: true };
    expect(apiErrorSchema.safeParse({ error: { ...base, retryAfterSeconds: 30 } }).success).toBe(true);
    expect(apiErrorSchema.safeParse({ error: { ...base, retryAfterSeconds: 0 } }).success).toBe(false);
  });

  it('exige retryable', () => {
    const body = { error: { code: 'INTERNAL_ERROR', message: 'x' } };
    expect(apiErrorSchema.safeParse(body).success).toBe(false);
  });

  it('rejeita código fora do catálogo e campo sem localização', () => {
    expect(apiErrorSchema.safeParse({ error: { code: 'OOPS', message: 'x', retryable: false } }).success).toBe(false);
    const semLocalizacao = { error: { code: 'VALIDATION_FAILED', message: 'x', retryable: false, details: [{ field: 'limit', issue: 'too_big' }] } };
    expect(apiErrorSchema.safeParse(semLocalizacao).success).toBe(false);
  });
});

describe('sucesso e paginação', () => {
  it('coleção vazia é sucesso válido', () => {
    const schema = paginatedSchema(z.object({ id: z.string() }));
    expect(schema.parse({ data: [], meta: { nextCursor: null } })).toEqual({ data: [], meta: { nextCursor: null } });
  });

  it('carga simples vai em data', () => {
    expect(successSchema(z.object({ id: z.string() })).parse({ data: { id: 'a' } })).toEqual({ data: { id: 'a' } });
  });
});

describe('primitivas', () => {
  it('datas só em UTC com Z', () => {
    expect(utcDateTimeSchema.safeParse('2026-10-26T22:00:00Z').success).toBe(true);
    expect(utcDateTimeSchema.safeParse('2026-10-26T22:00:00-03:00').success).toBe(false);
    expect(utcDateTimeSchema.safeParse('26/10/2026').success).toBe(false);
  });

  it('origin só aceita demo ou provider', () => {
    expect(originSchema.safeParse('demo').success).toBe(true);
    expect(originSchema.safeParse('outro').success).toBe(false);
  });
});
