import type { ApiError, ErrorCode, FieldIssue, IssueCode } from '@blbet/contracts';
import type { z } from 'zod';

const STATUS_BY_CODE: Readonly<Record<ErrorCode, number>> = {
  VALIDATION_FAILED: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
  UPSTREAM_UNAVAILABLE: 503,
};

// A1 — o servidor decide se repetir faz sentido; o frontend não mantém esta tabela.
const RETRYABLE_BY_CODE: Readonly<Record<ErrorCode, boolean>> = {
  VALIDATION_FAILED: false,
  // Repetir o mesmo pedido não resolve: é preciso entrar, ou cumprir a condição em falta.
  UNAUTHENTICATED: false,
  FORBIDDEN: false,
  NOT_FOUND: false,
  RATE_LIMITED: true,
  INTERNAL_ERROR: true,
  UPSTREAM_UNAVAILABLE: true,
};

export type FieldLocation = 'path' | 'query' | 'body';

/** Erro conhecido de uma rota. A `message` é técnica e não pode conter dados sensíveis. */
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly details: readonly FieldIssue[] | undefined;

  constructor(code: ErrorCode, message: string, details?: readonly FieldIssue[]) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
  }
}

export function statusOf(code: ErrorCode): number {
  return STATUS_BY_CODE[code];
}

export function errorBody(code: ErrorCode, message: string, details?: readonly FieldIssue[]): ApiError {
  const error: ApiError['error'] = { code, message, retryable: RETRYABLE_BY_CODE[code] };
  return { error: details && details.length > 0 ? { ...error, details: [...details] } : error };
}

function valueAt(input: unknown, path: readonly PropertyKey[]): unknown {
  return path.reduce<unknown>(
    (current, key) => (typeof current === 'object' && current !== null ? (current as Record<PropertyKey, unknown>)[key] : undefined),
    input,
  );
}

function issueCodeOf(issue: z.core.$ZodIssue, input: unknown): IssueCode {
  switch (issue.code) {
    case 'invalid_type':
      return valueAt(input, issue.path) === undefined ? 'required' : 'invalid_type';
    case 'too_small':
    case 'too_big':
    case 'invalid_format':
      return issue.code;
    default:
      return 'invalid_value';
  }
}

/** Converte os problemas de validação do Zod para o detalhe por campo da PC-003. */
export function toFieldIssues(location: FieldLocation, issues: readonly z.core.$ZodIssue[], input: unknown): FieldIssue[] {
  return issues.flatMap((issue) => {
    const base = [location, ...issue.path.map(String)];
    if (issue.code === 'unrecognized_keys') {
      return issue.keys.map((key) => ({ field: [...base, key].join('.'), issue: 'unknown_field' as const }));
    }
    return [{ field: base.join('.'), issue: issueCodeOf(issue, input) }];
  });
}

/** Valida uma entrada de rota; em falha lança VALIDATION_FAILED com o detalhe por campo. */
export function parseInput<T>(schema: z.ZodType<T>, input: unknown, location: FieldLocation): T {
  const result = schema.safeParse(input);
  if (result.success) return result.data;
  throw new AppError('VALIDATION_FAILED', `invalid ${location}`, toFieldIssues(location, result.error.issues, input));
}
