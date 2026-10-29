import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import {
  emailVerificationSchema,
  loginInputSchema,
  passwordResetConfirmSchema,
  passwordResetRequestSchema,
  passwordSchema,
  registerInputSchema,
} from '@blbet/contracts';
import { z } from 'zod';
import type { AccountsService, RequestContext } from '../modules/accounts/accounts-service.js';
import { AppError, parseInput } from '../shared/errors.js';

export interface AccountsRoutesOptions {
  readonly accounts: AccountsService;
  readonly cookieName: string;
  readonly cookieSecure: boolean;
  /** Limite próprio das rotas de autenticação, bem mais apertado que o geral. */
  readonly authRateLimit: { max: number; timeWindowMs: number } | undefined;
}

const changePasswordSchema = z.strictObject({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
});

function contextOf(request: FastifyRequest): RequestContext {
  const agent = request.headers['user-agent'];
  return { ip: request.ip, userAgent: typeof agent === 'string' ? agent.slice(0, 256) : null };
}

// Rotas de conta e de sessão (api-contract.md, secção 7.2; DT-020).
export const accountsRoutes: FastifyPluginAsync<AccountsRoutesOptions> = async (app, options) => {
  const { accounts, cookieName, cookieSecure } = options;

  // As rotas de autenticação levam um limite próprio: são as que interessam a quem tenta senhas
  // à força, e o limite geral da api é largo de mais para elas.
  const strict = options.authRateLimit
    ? { config: { rateLimit: { max: options.authRateLimit.max, timeWindow: options.authRateLimit.timeWindowMs } } }
    : {};

  function setSessionCookie(reply: FastifyReply, token: string, expiresAt: Date): void {
    reply.setCookie(cookieName, token, {
      httpOnly: true, // Fora do alcance do JavaScript da página: um XSS não leva a sessão.
      secure: cookieSecure,
      sameSite: 'strict', // O cookie não viaja em pedido vindo de outro sítio: trava CSRF.
      path: '/',
      expires: expiresAt,
    });
  }

  function clearSessionCookie(reply: FastifyReply): void {
    reply.clearCookie(cookieName, { httpOnly: true, secure: cookieSecure, sameSite: 'strict', path: '/' });
  }

  async function requireSession(request: FastifyRequest) {
    const token = request.cookies[cookieName];
    if (!token) throw new AppError('UNAUTHENTICATED', 'no session cookie');
    return accounts.authenticate(token);
  }

  app.post('/api/accounts', strict, async (request, reply) => {
    const input = parseInput(registerInputSchema, request.body, 'body');
    await accounts.register(input.email, input.password, contextOf(request));
    // Sempre o mesmo corpo e o mesmo estado, exista ou não a conta (A-A2).
    return reply.status(202).send({ data: { accepted: true } });
  });

  app.post('/api/accounts/verify', strict, async (request, reply) => {
    const input = parseInput(emailVerificationSchema, request.body, 'body');
    await accounts.verifyEmail(input.token);
    return reply.status(204).send();
  });

  app.post('/api/accounts/password-reset', strict, async (request, reply) => {
    const input = parseInput(passwordResetRequestSchema, request.body, 'body');
    await accounts.requestPasswordReset(input.email, contextOf(request));
    return reply.status(202).send({ data: { accepted: true } });
  });

  app.post('/api/accounts/password-reset/confirm', strict, async (request, reply) => {
    const input = parseInput(passwordResetConfirmSchema, request.body, 'body');
    await accounts.confirmPasswordReset(input.token, input.password, contextOf(request));
    clearSessionCookie(reply);
    return reply.status(204).send();
  });

  app.post('/api/accounts/password', strict, async (request, reply) => {
    const { account, sessionId } = await requireSession(request);
    const input = parseInput(changePasswordSchema, request.body, 'body');
    await accounts.changePassword(account.id, input.currentPassword, input.newPassword, sessionId);
    return reply.status(204).send();
  });

  app.get('/api/accounts/me', async (request, reply) => {
    const { account } = await requireSession(request);
    return reply.send({ data: account });
  });

  app.post('/api/sessions', strict, async (request, reply) => {
    const input = parseInput(loginInputSchema, request.body, 'body');
    const signedIn = await accounts.login(input.email, input.password, contextOf(request));
    setSessionCookie(reply, signedIn.token, signedIn.expiresAt);
    // O token vai só no cookie. Devolvê-lo no corpo punha-o ao alcance do JavaScript.
    return reply.status(201).send({ data: signedIn.account });
  });

  app.get('/api/sessions', async (request, reply) => {
    const { account, sessionId } = await requireSession(request);
    return reply.send({ data: await accounts.listSessions(account.id, sessionId) });
  });

  app.delete('/api/sessions/current', async (request, reply) => {
    const token = request.cookies[cookieName];
    if (token) await accounts.logout(token);
    clearSessionCookie(reply);
    // Sair responde igual com ou sem sessão: não há aqui nada que valha a pena descobrir.
    return reply.status(204).send();
  });

  app.delete('/api/sessions', async (request, reply) => {
    const { account, sessionId } = await requireSession(request);
    await accounts.revokeOtherSessions(account.id, sessionId);
    return reply.status(204).send();
  });

  app.delete<{ Params: { id: string } }>('/api/sessions/:id', async (request, reply) => {
    const { account, sessionId } = await requireSession(request);
    const { id } = parseInput(z.strictObject({ id: z.uuid() }), request.params, 'path');
    await accounts.revokeSession(account.id, id);
    if (id === sessionId) clearSessionCookie(reply);
    return reply.status(204).send();
  });
};
