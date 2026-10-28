import { randomUUID } from 'node:crypto';
import type { Account, SessionSummary } from '@blbet/contracts';
import { AppError } from '../../shared/errors.js';
import type { AccountRecord, AccountsRepository, AttemptScope, SessionRecord } from './accounts-repository.js';
import type { Mailer } from './mailer.js';
import { hashPassword, verifyPassword, wasteVerification } from './password.js';
import { hashIp, hashToken, newToken } from './tokens.js';

export interface AccountsPolicy {
  /** Tempo sem uso ao fim do qual a sessão morre. */
  readonly sessionIdleMinutes: number;
  /** Teto absoluto desde o início da sessão, que o uso contínuo não estica. */
  readonly sessionAbsoluteHours: number;
  readonly verificationTtlHours: number;
  readonly passwordResetTtlMinutes: number;
  /** Falhas por conta, e depois por origem, antes de travar. */
  readonly maxFailuresPerAccount: number;
  readonly maxFailuresPerIp: number;
  readonly failureWindowMinutes: number;
  /** Com `false`, entra-se sem o e-mail verificado — só para desenvolvimento e testes. */
  readonly requireVerifiedEmail: boolean;
  /** Segredo com que os endereços IP são resumidos antes de guardados. */
  readonly ipHashSecret: string;
  /** Base dos links enviados por e-mail. */
  readonly publicUrl: string;
}

export interface RequestContext {
  readonly ip: string;
  readonly userAgent: string | null;
}

export interface SignedIn {
  readonly token: string;
  readonly expiresAt: Date;
  readonly account: Account;
}

export interface AccountsService {
  register(email: string, password: string, context: RequestContext): Promise<void>;
  verifyEmail(token: string): Promise<void>;
  login(email: string, password: string, context: RequestContext): Promise<SignedIn>;
  logout(token: string): Promise<void>;
  authenticate(token: string): Promise<{ account: Account; sessionId: string }>;
  listSessions(accountId: string, currentSessionId: string): Promise<readonly SessionSummary[]>;
  revokeSession(accountId: string, sessionId: string): Promise<void>;
  revokeOtherSessions(accountId: string, currentSessionId: string): Promise<number>;
  requestPasswordReset(email: string, context: RequestContext): Promise<void>;
  confirmPasswordReset(token: string, password: string, context: RequestContext): Promise<void>;
  changePassword(accountId: string, currentPassword: string, newPassword: string, currentSessionId: string): Promise<void>;
}

const minutes = (count: number) => count * 60_000;
const hours = (count: number) => count * 3_600_000;

/** A mesma mensagem para credenciais erradas, conta inexistente e senha vazia (A-A2). */
const invalidCredentials = () => new AppError('UNAUTHENTICATED', 'invalid credentials');

function toAccount(record: AccountRecord): Account {
  return {
    id: record.id,
    email: record.email,
    emailVerified: record.emailVerifiedAt !== null,
    createdAt: record.createdAt.toISOString(),
  };
}

function toSummary(record: SessionRecord, currentId: string): SessionSummary {
  return {
    id: record.id,
    createdAt: record.createdAt.toISOString(),
    lastSeenAt: record.lastSeenAt.toISOString(),
    expiresAt: record.expiresAt.toISOString(),
    current: record.id === currentId,
    userAgent: record.userAgent,
  };
}

export function createAccountsService(deps: {
  repository: AccountsRepository;
  mailer: Mailer;
  policy: AccountsPolicy;
  now?: () => Date;
}): AccountsService {
  const { repository, mailer, policy } = deps;
  const now = deps.now ?? (() => new Date());

  const link = (path: string, token: string) => `${policy.publicUrl.replace(/\/$/, '')}${path}?token=${token}`;

  /** A chave por conta é o resumo do e-mail: contar tentativas não exige guardá-lo em claro. */
  const accountKey = (email: string) => hashToken(email);
  const ipKey = (ip: string) => hashIp(ip, policy.ipHashSecret);

  async function guardAttempts(scope: AttemptScope, key: string, max: number, at: Date): Promise<void> {
    const since = new Date(at.getTime() - minutes(policy.failureWindowMinutes));
    const failures = await repository.countRecentFailures(scope, key, since);
    if (failures >= max) {
      throw new AppError('RATE_LIMITED', 'too many attempts');
    }
  }

  async function sessionExpiry(record: { createdAt: Date }, at: Date): Promise<Date> {
    const idle = new Date(at.getTime() + minutes(policy.sessionIdleMinutes));
    const absolute = new Date(record.createdAt.getTime() + hours(policy.sessionAbsoluteHours));
    return idle < absolute ? idle : absolute;
  }

  return {
    async register(email, password, context) {
      const at = now();
      await guardAttempts('ip', ipKey(context.ip), policy.maxFailuresPerIp, at);

      const passwordHash = await hashPassword(password);
      const created = await repository.createAccount({ id: randomUUID(), email, passwordHash, now: at });

      if (created) {
        const token = newToken();
        await repository.createVerificationToken({
          tokenHash: hashToken(token),
          accountId: created.id,
          purpose: 'email_verification',
          now: at,
          expiresAt: new Date(at.getTime() + hours(policy.verificationTtlHours)),
        });
        await mailer.send({
          to: email,
          subject: 'Confirme o seu e-mail',
          body: `Para confirmar o seu e-mail, abra: ${link('/conta/verificar', token)}`,
        });
        await repository.recordEvent({ kind: 'account.registered', now: at, accountId: created.id, ipHash: ipKey(context.ip) });
        return;
      }

      // O e-mail já tem conta. Quem pediu não fica a saber; quem é dono do endereço, sim.
      await repository.recordAttempt('ip', ipKey(context.ip), at, false);
      await repository.recordEvent({ kind: 'account.register_duplicate', now: at, ipHash: ipKey(context.ip) });
      await mailer.send({
        to: email,
        subject: 'Tentativa de cadastro com o seu e-mail',
        body: 'Alguém tentou criar uma conta com este endereço, que já tem conta. Se não foi você, ignore esta mensagem.',
      });
    },

    async verifyEmail(token) {
      const at = now();
      const accountId = await repository.consumeVerificationToken(hashToken(token), 'email_verification', at);
      if (!accountId) {
        throw new AppError('VALIDATION_FAILED', 'invalid token', [{ field: 'body.token', issue: 'invalid_value' }]);
      }
      await repository.setEmailVerified(accountId, at);
      await repository.recordEvent({ kind: 'account.email_verified', now: at, accountId });
    },

    async login(email, password, context) {
      const at = now();
      const byAccount = accountKey(email);
      const byIp = ipKey(context.ip);
      await guardAttempts('account', byAccount, policy.maxFailuresPerAccount, at);
      await guardAttempts('ip', byIp, policy.maxFailuresPerIp, at);

      const account = await repository.findAccountByEmail(email);
      if (!account) {
        // Gasta o mesmo tempo de uma verificação real antes de responder.
        await wasteVerification(password);
        await repository.recordAttempt('account', byAccount, at, false);
        await repository.recordAttempt('ip', byIp, at, false);
        throw invalidCredentials();
      }

      if (!(await verifyPassword(account.passwordHash, password))) {
        await repository.recordAttempt('account', byAccount, at, false);
        await repository.recordAttempt('ip', byIp, at, false);
        await repository.recordEvent({ kind: 'auth.failed', now: at, accountId: account.id, ipHash: byIp });
        throw invalidCredentials();
      }

      // Daqui para baixo a senha está certa, por isso dizer o motivo exato já não revela nada
      // a quem não sabia a senha.
      if (account.status !== 'active') {
        await repository.recordEvent({ kind: 'auth.blocked_status', now: at, accountId: account.id, ipHash: byIp, detail: { status: account.status } });
        throw new AppError('FORBIDDEN', `account ${account.status}`);
      }
      if (policy.requireVerifiedEmail && account.emailVerifiedAt === null) {
        throw new AppError('FORBIDDEN', 'email not verified');
      }

      await repository.clearFailures('account', byAccount);
      await repository.recordAttempt('account', byAccount, at, true);

      const token = newToken();
      const id = randomUUID();
      const expiresAt = await sessionExpiry({ createdAt: at }, at);
      await repository.createSession({
        id,
        tokenHash: hashToken(token),
        accountId: account.id,
        now: at,
        expiresAt,
        userAgent: context.userAgent,
        ipHash: byIp,
      });
      await repository.recordEvent({ kind: 'auth.succeeded', now: at, accountId: account.id, ipHash: byIp });

      return { token, expiresAt, account: toAccount(account) };
    },

    async logout(token) {
      const at = now();
      const session = await repository.findLiveSession(hashToken(token), at);
      if (!session) return; // Já não valia nada: sair duas vezes não é erro.
      await repository.revokeSession(session.id, at);
      await repository.recordEvent({ kind: 'auth.logout', now: at, accountId: session.accountId });
    },

    async authenticate(token) {
      const at = now();
      const session = await repository.findLiveSession(hashToken(token), at);
      if (!session) throw new AppError('UNAUTHENTICATED', 'no valid session');

      const account = await repository.findAccountById(session.accountId);
      if (!account) throw new AppError('UNAUTHENTICATED', 'no valid session');
      if (account.status !== 'active') throw new AppError('FORBIDDEN', `account ${account.status}`);

      await repository.touchSession(session.id, at, await sessionExpiry(session, at));
      return { account: toAccount(account), sessionId: session.id };
    },

    async listSessions(accountId, currentSessionId) {
      const live = await repository.listLiveSessions(accountId, now());
      return live.map((record) => toSummary(record, currentSessionId));
    },

    async revokeSession(accountId, sessionId) {
      const at = now();
      // Só as próprias: sem este filtro, um identificador adivinhado derrubava a sessão alheia.
      const live = await repository.listLiveSessions(accountId, at);
      if (!live.some((session) => session.id === sessionId)) {
        throw new AppError('NOT_FOUND', 'session not found');
      }
      await repository.revokeSession(sessionId, at);
      await repository.recordEvent({ kind: 'session.revoked', now: at, accountId });
    },

    async revokeOtherSessions(accountId, currentSessionId) {
      const at = now();
      const count = await repository.revokeAllSessions(accountId, at, currentSessionId);
      await repository.recordEvent({ kind: 'session.revoked_others', now: at, accountId, detail: { count } });
      return count;
    },

    async requestPasswordReset(email, context) {
      const at = now();
      await guardAttempts('ip', ipKey(context.ip), policy.maxFailuresPerIp, at);
      const account = await repository.findAccountByEmail(email);
      await repository.recordAttempt('ip', ipKey(context.ip), at, false);

      // Sem conta, a resposta é a mesma e nada acontece — nem sequer um e-mail.
      if (!account) return;

      // Um pedido novo invalida os anteriores: só o último link funciona.
      await repository.discardVerificationTokens(account.id, 'password_reset', at);
      const token = newToken();
      await repository.createVerificationToken({
        tokenHash: hashToken(token),
        accountId: account.id,
        purpose: 'password_reset',
        now: at,
        expiresAt: new Date(at.getTime() + minutes(policy.passwordResetTtlMinutes)),
      });
      await mailer.send({
        to: account.email,
        subject: 'Redefinição de senha',
        body: `Para escolher uma senha nova, abra: ${link('/conta/nova-senha', token)}`,
      });
      await repository.recordEvent({ kind: 'password.reset_requested', now: at, accountId: account.id, ipHash: ipKey(context.ip) });
    },

    async confirmPasswordReset(token, password, context) {
      const at = now();
      const accountId = await repository.consumeVerificationToken(hashToken(token), 'password_reset', at);
      if (!accountId) {
        throw new AppError('VALIDATION_FAILED', 'invalid token', [{ field: 'body.token', issue: 'invalid_value' }]);
      }
      await repository.setPasswordHash(accountId, await hashPassword(password), at);
      // Trocar a senha derruba tudo: se a conta estava comprometida, o intruso perde o acesso.
      const revoked = await repository.revokeAllSessions(accountId, at);
      await repository.clearFailures('account', accountKey((await repository.findAccountById(accountId))?.email ?? ''));
      await repository.recordEvent({
        kind: 'password.reset_completed',
        now: at,
        accountId,
        ipHash: ipKey(context.ip),
        detail: { revokedSessions: revoked },
      });
    },

    async changePassword(accountId, currentPassword, newPassword, currentSessionId) {
      const at = now();
      const account = await repository.findAccountById(accountId);
      if (!account) throw new AppError('UNAUTHENTICATED', 'no valid session');

      // Reautenticação: ter a sessão aberta não chega para trocar a senha.
      if (!(await verifyPassword(account.passwordHash, currentPassword))) {
        await repository.recordEvent({ kind: 'password.change_denied', now: at, accountId });
        throw invalidCredentials();
      }

      await repository.setPasswordHash(accountId, await hashPassword(newPassword), at);
      const revoked = await repository.revokeAllSessions(accountId, at, currentSessionId);
      await repository.recordEvent({ kind: 'password.changed', now: at, accountId, detail: { revokedSessions: revoked } });
    },
  };
}
