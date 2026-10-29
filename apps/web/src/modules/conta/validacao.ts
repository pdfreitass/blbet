/*
 * Validacao do lado do cliente, para dizer o que esta mal ANTES de gastar um pedido.
 *
 * As regras sao as do contrato, importadas, nao copiadas: `emailSchema` e
 * `passwordSchema` sao os mesmos objetos que o servidor usa. Em particular, **nao ha
 * regra de composicao da senha** (A-A1) -- exigir maiuscula ou simbolo aqui seria
 * inventar um requisito que a api nao tem e recusar senhas que ela aceita.
 *
 * A validacao do servidor continua a mandar: isto so poupa uma ida a rede.
 */

import { emailSchema, MIN_PASSWORD_LENGTH, passwordSchema } from '@blbet/contracts';

export function erroDeEmail(valor: string): string | undefined {
  if (valor.trim() === '') {
    return 'Indique o seu e-mail.';
  }

  return emailSchema.safeParse(valor).success ? undefined : 'Este e-mail não parece válido.';
}

export function erroDeSenha(valor: string): string | undefined {
  if (valor === '') {
    return 'Indique uma senha.';
  }

  return passwordSchema.safeParse(valor).success
    ? undefined
    : `A senha tem de ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;
}

/** O que o campo de senha anuncia, antes de haver erro nenhum. */
export const APOIO_SENHA = `Pelo menos ${MIN_PASSWORD_LENGTH} caracteres. Não há exigência de maiúsculas, números ou símbolos.`;
