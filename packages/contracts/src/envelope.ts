import { z } from 'zod';
import { originSchema } from './primitives.js';

// Convenções acordadas na T-004 (docs/api-contract.md, secções 8 e 9).

/** PC-002 — catálogo de códigos de erro estáveis. Um código nunca é reutilizado. */
export const ERROR_CODES = [
  'VALIDATION_FAILED',
  'NOT_FOUND',
  'RATE_LIMITED',
  'INTERNAL_ERROR',
  'UPSTREAM_UNAVAILABLE',
  // DT-020 — contas e sessões. `UNAUTHENTICATED`: não há sessão válida, ou as credenciais não
  // conferem (401). `FORBIDDEN`: há sessão, mas falta uma condição da conta — e-mail por
  // verificar, conta bloqueada (403). A distinção importa à interface: o primeiro leva ao
  // acesso, o segundo não.
  'UNAUTHENTICATED',
  'FORBIDDEN',
] as const;
export const errorCodeSchema = z.enum(ERROR_CODES);
export type ErrorCode = z.infer<typeof errorCodeSchema>;

/** PC-003 — códigos estáveis do motivo de falha de um campo. */
export const ISSUE_CODES = [
  'required',
  'invalid_type',
  'invalid_value',
  'invalid_format',
  'too_small',
  'too_big',
  'unknown_field',
  'invalid_cursor',
  // T14-A1 — no 404 do detalhe de um evento que já começou (field: path.id).
  'event_started',
] as const;
export const issueCodeSchema = z.enum(ISSUE_CODES);
export type IssueCode = z.infer<typeof issueCodeSchema>;

/** PC-003 — `field` é a localização (`path`, `query`, `body`) seguida do caminho com pontos. */
export const fieldIssueSchema = z.object({
  field: z.string().regex(/^(path|query|body)(\.[^.]+)*$/),
  issue: issueCodeSchema,
});
export type FieldIssue = z.infer<typeof fieldIssueSchema>;

/**
 * PC-001 e A1 — erro. `message` é técnica, para logs e diagnóstico: nunca é mostrada na
 * interface (DIV-F01). `retryable` é decidido pelo servidor. `retryAfterSeconds` só em
 * RATE_LIMITED, e só quando o tempo de espera for conhecido.
 */
export const apiErrorSchema = z.object({
  error: z.object({
    code: errorCodeSchema,
    message: z.string(),
    retryable: z.boolean(),
    retryAfterSeconds: z.number().int().positive().optional(),
    details: z.array(fieldIssueSchema).optional(),
  }),
});
export type ApiError = z.infer<typeof apiErrorSchema>;

/**
 * PC-008, A6 e A8 — metadados de paginação por cursor. `total` é opcional e a interface não
 * depende dele. `origin` agregado só quando toda a coleção tem a mesma procedência.
 */
export const paginationMetaSchema = z.object({
  nextCursor: z.string().min(1).nullable(),
  total: z.number().int().nonnegative().optional(),
  origin: originSchema.optional(),
});
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

/** PC-001 — sucesso: a carga vai sempre em `data`; `meta` só quando há metadados. */
export function successSchema<TData extends z.ZodType>(data: TData) {
  return z.object({ data });
}

export function paginatedSchema<TItem extends z.ZodType>(item: TItem) {
  return z.object({ data: z.array(item), meta: paginationMetaSchema });
}
