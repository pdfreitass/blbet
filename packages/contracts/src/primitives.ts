import { z } from 'zod';

/** PC-004 e A3 — identificador opaco e estável ao longo do tempo. */
export const idSchema = z.string().min(1);

/** PC-005 — ISO 8601 em UTC, com `Z` e sem desvio de fuso. */
export const utcDateTimeSchema = z.iso.datetime();

/** PC-010 e A8 — procedência obrigatória de cada recurso. A forma de a mostrar depende da DIV-001. */
export const ORIGINS = ['demo', 'provider'] as const;
export const originSchema = z.enum(ORIGINS);
export type Origin = z.infer<typeof originSchema>;

// PC-006 (odds): a forma está acordada (texto decimal, com ponto, sem separador de milhares,
// casas fixas), mas o número de casas depende do provedor (BLQ-001). Não há esquema ainda.
