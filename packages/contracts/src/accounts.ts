import { z } from 'zod';

// Contas e sessões (DT-020). Secção 7.2 de docs/api-contract.md.
// Mudanças aqui exigem revisão cruzada do `frontend` (DT-005).

/**
 * A-A1 — comprimento mínimo da senha. Oito caracteres é o que a interface já anuncia; não há
 * regra de composição, por recomendação do NIST SP 800-63B: regras de composição levam a senhas
 * previsíveis sem ganho real. O teto existe só para travar entrada arbitrariamente grande.
 */
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 200;

/** Teto do e-mail. Acima disto não é um endereço legítimo, é entrada a testar os limites. */
export const MAX_EMAIL_LENGTH = 254;

/**
 * O e-mail é normalizado antes de validado: espaços fora e tudo em minúsculas. Os provedores
 * tratam o endereço como insensível a maiúsculas, e sem isto a mesma pessoa podia criar duas
 * contas com `A@b.com` e `a@b.com`.
 */
export const emailSchema = z
  .string()
  .transform((value) => value.trim().toLowerCase())
  .pipe(z.email().max(MAX_EMAIL_LENGTH));

export const passwordSchema = z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH);

export const registerInputSchema = z.strictObject({
  email: emailSchema,
  password: passwordSchema,
});
export type RegisterInput = z.infer<typeof registerInputSchema>;

export const loginInputSchema = z.strictObject({
  email: emailSchema,
  password: passwordSchema,
});
export type LoginInput = z.infer<typeof loginInputSchema>;

export const passwordResetRequestSchema = z.strictObject({ email: emailSchema });
export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>;

/** O token vem do link enviado por e-mail; o servidor guarda só o seu resumo. */
export const passwordResetConfirmSchema = z.strictObject({
  token: z.string().min(1).max(256),
  password: passwordSchema,
});
export type PasswordResetConfirm = z.infer<typeof passwordResetConfirmSchema>;

export const emailVerificationSchema = z.strictObject({ token: z.string().min(1).max(256) });
export type EmailVerification = z.infer<typeof emailVerificationSchema>;

/**
 * A conta como a interface a vê. **Não** inclui resumo de senha, identificadores internos de
 * sessão nem qualquer dado que não seja necessário para desenhar o ecrã.
 */
export const accountSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  emailVerified: z.boolean(),
  createdAt: z.iso.datetime(),
});
export type Account = z.infer<typeof accountSchema>;

/** Uma sessão na lista de dispositivos. `current` marca aquela com que o pedido foi feito. */
export const sessionSummarySchema = z.object({
  id: z.uuid(),
  createdAt: z.iso.datetime(),
  lastSeenAt: z.iso.datetime(),
  expiresAt: z.iso.datetime(),
  current: z.boolean(),
  userAgent: z.string().nullable(),
});
export type SessionSummary = z.infer<typeof sessionSummarySchema>;

/**
 * A-A2 — resposta genérica. Cadastro, pedido de recuperação e reenvio de verificação respondem
 * sempre isto, exista ou não a conta: é o que impede descobrir quem está registado.
 */
export const acceptedSchema = z.object({ accepted: z.literal(true) });
export type Accepted = z.infer<typeof acceptedSchema>;
