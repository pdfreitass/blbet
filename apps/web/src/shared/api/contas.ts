/*
 * Contas e sessoes (DT-020, seccao 7.2 do contrato).
 *
 * Os esquemas sao os de `@blbet/contracts`: nenhuma forma de conta vive no frontend.
 * A unica excecao esta assinalada em `alterarSenhaSchema`, e e um pedido registado no
 * quadro, nao uma invencao.
 *
 * Tres coisas que estas rotas fazem ao contrario do que parece, e que estao no
 * contrato (A-A2, 5.2, A-A4):
 *   1. cadastro e pedido de recuperacao respondem `202 { accepted: true }` EXISTA OU
 *      NAO a conta -- nada aqui pode dizer "este e-mail ja existe";
 *   2. o token de sessao nunca vem no corpo: vai num cookie `HttpOnly` que este
 *      codigo nao le nem pode ler;
 *   3. um `429` pode acontecer com a senha certa -- e o travao por tentativas.
 */

import {
  acceptedSchema,
  accountSchema,
  emailVerificationSchema,
  loginInputSchema,
  passwordResetConfirmSchema,
  passwordResetRequestSchema,
  passwordSchema,
  registerInputSchema,
  sessionSummarySchema,
  successSchema,
  type Account,
  type SessionSummary,
} from '@blbet/contracts';

import { pedir, SEM_CONTEUDO, type OpcoesPedido, type Resultado } from './cliente';

const contaSchema = successSchema(accountSchema);
const aceiteSchema = successSchema(acceptedSchema);
// `.array()` em vez de `z.array(...)`: `apps/web` nao tem `zod` como dependencia
// direta, de proposito (ver `cliente.ts`), e os esquemas do contrato ja trazem o metodo.
const sessoesSchema = successSchema(sessionSummarySchema.array());

export type { Account, SessionSummary };

/*
 * O corpo de `POST /api/accounts/password` e a UNICA forma da seccao 7.2 que
 * `@blbet/contracts` nao exporta: vive em `apps/api/src/routes/accounts.ts`, que o
 * frontend nao importa. Aqui nao se redeclara o objeto -- valida-se cada campo com o
 * `passwordSchema` do proprio contrato, que e a regra que interessa (A-A1). O pedido
 * para mover a forma para o pacote esta registado no quadro.
 */
export {
  emailVerificationSchema,
  loginInputSchema,
  passwordResetConfirmSchema,
  passwordResetRequestSchema,
  passwordSchema,
  registerInputSchema,
};

/** Cadastro. Responde o mesmo exista ou nao a conta (A-A2). */
export function criarConta(
  entrada: { email: string; password: string },
  opcoes?: OpcoesPedido,
): Promise<Resultado<{ data: { accepted: true } }>> {
  return pedir('/api/accounts', aceiteSchema, { ...opcoes, metodo: 'POST', corpo: entrada });
}

/** Verificacao de e-mail, com o token de uso unico que veio na mensagem. */
export function verificarEmail(token: string, opcoes?: OpcoesPedido): Promise<Resultado<null>> {
  return pedir('/api/accounts/verify', SEM_CONTEUDO, {
    ...opcoes,
    metodo: 'POST',
    corpo: { token },
  });
}

/** Entrada. Poe o cookie de sessao; devolve a conta, nunca o token. */
export function entrar(
  entrada: { email: string; password: string },
  opcoes?: OpcoesPedido,
): Promise<Resultado<{ data: Account }>> {
  return pedir('/api/sessions', contaSchema, { ...opcoes, metodo: 'POST', corpo: entrada });
}

/** Sair. Responde igual com ou sem sessao. */
export function sair(opcoes?: OpcoesPedido): Promise<Resultado<null>> {
  return pedir('/api/sessions/current', SEM_CONTEUDO, { ...opcoes, metodo: 'DELETE' });
}

/**
 * A conta da sessao atual. `401` quando nao ha sessao -- que nao e erro a mostrar.
 *
 * Nunca pelo cache: trinta segundos de atraso aqui significariam mostrar como entrado
 * quem acabou de sair, ou o contrario.
 */
export function obterConta(opcoes?: OpcoesPedido): Promise<Resultado<{ data: Account }>> {
  return pedir('/api/accounts/me', contaSchema, { ...opcoes, ignorarCache: true });
}

/** Dispositivos autenticados. `current` marca aquele de onde o pedido saiu. */
export function obterSessoes(
  opcoes?: OpcoesPedido,
): Promise<Resultado<{ data: SessionSummary[] }>> {
  // Sem cache, pela mesma razao: revogar um dispositivo tem de o fazer desaparecer.
  return pedir('/api/sessions', sessoesSchema, { ...opcoes, ignorarCache: true });
}

/** Revoga uma sessao. A de outra conta da `404`, nao `403` (seccao 7.2). */
export function revogarSessao(id: string, opcoes?: OpcoesPedido): Promise<Resultado<null>> {
  // O id e um uuid, mas codifica-se na mesma: nao se constroi caminho com texto cru.
  return pedir(`/api/sessions/${encodeURIComponent(id)}`, SEM_CONTEUDO, {
    ...opcoes,
    metodo: 'DELETE',
  });
}

/** Derruba as outras sessoes e mantem a atual. */
export function revogarOutrasSessoes(opcoes?: OpcoesPedido): Promise<Resultado<null>> {
  return pedir('/api/sessions', SEM_CONTEUDO, { ...opcoes, metodo: 'DELETE' });
}

/** Pedido de recuperacao. Responde o mesmo exista ou nao a conta (A-A2). */
export function pedirRecuperacao(
  email: string,
  opcoes?: OpcoesPedido,
): Promise<Resultado<{ data: { accepted: true } }>> {
  return pedir('/api/accounts/password-reset', aceiteSchema, {
    ...opcoes,
    metodo: 'POST',
    corpo: { email },
  });
}

/** Redefinicao com o token do e-mail. Derruba TODAS as sessoes, incluindo esta. */
export function redefinirSenha(
  entrada: { token: string; password: string },
  opcoes?: OpcoesPedido,
): Promise<Resultado<null>> {
  return pedir('/api/accounts/password-reset/confirm', SEM_CONTEUDO, {
    ...opcoes,
    metodo: 'POST',
    corpo: entrada,
  });
}

/** Alteracao de senha com a atual. Derruba as outras sessoes, nao esta. */
export function alterarSenha(
  entrada: { currentPassword: string; newPassword: string },
  opcoes?: OpcoesPedido,
): Promise<Resultado<null>> {
  return pedir('/api/accounts/password', SEM_CONTEUDO, {
    ...opcoes,
    metodo: 'POST',
    corpo: entrada,
  });
}
