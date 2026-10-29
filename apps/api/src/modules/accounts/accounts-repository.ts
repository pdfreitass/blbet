import type { Database } from '../../db/database.js';

/**
 * Tudo o que toca na base de dados de contas passa por aqui. É a costura que permite trocar o
 * SQLite por PostgreSQL (DT-021) sem mexer no serviço: o serviço depende desta interface, nunca
 * de SQL. Os métodos são síncronos porque o `node:sqlite` é síncrono; a interface devolve
 * `Promise` para que a implementação em PostgreSQL caiba sem alterar quem a chama.
 */

export type AccountStatus = 'active' | 'locked' | 'disabled';
export type TokenPurpose = 'email_verification' | 'password_reset';
export type AttemptScope = 'account' | 'ip';

export interface AccountRecord {
  readonly id: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly status: AccountStatus;
  readonly emailVerifiedAt: Date | null;
  readonly createdAt: Date;
}

export interface SessionRecord {
  readonly id: string;
  readonly accountId: string;
  readonly createdAt: Date;
  readonly lastSeenAt: Date;
  readonly expiresAt: Date;
  readonly userAgent: string | null;
}

export interface AccountsRepository {
  createAccount(input: { id: string; email: string; passwordHash: string; now: Date }): Promise<AccountRecord | undefined>;
  findAccountByEmail(email: string): Promise<AccountRecord | undefined>;
  findAccountById(id: string): Promise<AccountRecord | undefined>;
  setEmailVerified(accountId: string, now: Date): Promise<void>;
  setPasswordHash(accountId: string, passwordHash: string, now: Date): Promise<void>;
  setStatus(accountId: string, status: AccountStatus, now: Date): Promise<void>;

  createSession(input: {
    id: string;
    tokenHash: string;
    accountId: string;
    now: Date;
    expiresAt: Date;
    userAgent: string | null;
    ipHash: string | null;
  }): Promise<void>;
  findLiveSession(tokenHash: string, now: Date): Promise<SessionRecord | undefined>;
  touchSession(id: string, now: Date, expiresAt: Date): Promise<void>;
  revokeSession(id: string, now: Date): Promise<boolean>;
  revokeAllSessions(accountId: string, now: Date, exceptId?: string): Promise<number>;
  listLiveSessions(accountId: string, now: Date): Promise<readonly SessionRecord[]>;

  createVerificationToken(input: {
    tokenHash: string;
    accountId: string;
    purpose: TokenPurpose;
    now: Date;
    expiresAt: Date;
  }): Promise<void>;
  consumeVerificationToken(tokenHash: string, purpose: TokenPurpose, now: Date): Promise<string | undefined>;
  discardVerificationTokens(accountId: string, purpose: TokenPurpose, now: Date): Promise<void>;

  recordAttempt(scope: AttemptScope, key: string, now: Date, successful: boolean): Promise<void>;
  countRecentFailures(scope: AttemptScope, key: string, since: Date): Promise<number>;
  clearFailures(scope: AttemptScope, key: string): Promise<void>;

  recordEvent(input: { kind: string; now: Date; accountId?: string | null; ipHash?: string | null; detail?: unknown }): Promise<void>;
}

const iso = (date: Date) => date.toISOString();
const text = (value: unknown): string => String(value);
const textOrNull = (value: unknown): string | null => (value === null || value === undefined ? null : String(value));
const dateOf = (value: unknown): Date => new Date(String(value));
const dateOrNull = (value: unknown): Date | null => (value === null || value === undefined ? null : new Date(String(value)));

function toAccount(row: Record<string, unknown>): AccountRecord {
  return {
    id: text(row['id']),
    email: text(row['email']),
    passwordHash: text(row['password_hash']),
    status: text(row['status']) as AccountStatus,
    emailVerifiedAt: dateOrNull(row['email_verified_at']),
    createdAt: dateOf(row['created_at']),
  };
}

function toSession(row: Record<string, unknown>): SessionRecord {
  return {
    id: text(row['id']),
    accountId: text(row['account_id']),
    createdAt: dateOf(row['created_at']),
    lastSeenAt: dateOf(row['last_seen_at']),
    expiresAt: dateOf(row['expires_at']),
    userAgent: textOrNull(row['user_agent']),
  };
}

export function createSqliteAccountsRepository(db: Database): AccountsRepository {
  return {
    async createAccount({ id, email, passwordHash, now }) {
      // `on conflict do nothing` em vez de perguntar antes: entre a pergunta e a escrita cabe
      // outro pedido com o mesmo e-mail, e quem decide é a restrição de unicidade.
      const inserted = db
        .prepare(
          `insert into accounts (id, email, password_hash, status, created_at, updated_at)
           values (?, ?, ?, 'active', ?, ?)
           on conflict (email) do nothing
           returning *`,
        )
        .get(id, email, passwordHash, iso(now), iso(now));
      return inserted ? toAccount(inserted as Record<string, unknown>) : undefined;
    },

    async findAccountByEmail(email) {
      const row = db.prepare('select * from accounts where email = ?').get(email);
      return row ? toAccount(row as Record<string, unknown>) : undefined;
    },

    async findAccountById(id) {
      const row = db.prepare('select * from accounts where id = ?').get(id);
      return row ? toAccount(row as Record<string, unknown>) : undefined;
    },

    async setEmailVerified(accountId, now) {
      db.prepare('update accounts set email_verified_at = ?, updated_at = ? where id = ? and email_verified_at is null').run(
        iso(now),
        iso(now),
        accountId,
      );
    },

    async setPasswordHash(accountId, passwordHash, now) {
      db.prepare('update accounts set password_hash = ?, updated_at = ? where id = ?').run(passwordHash, iso(now), accountId);
    },

    async setStatus(accountId, status, now) {
      db.prepare('update accounts set status = ?, updated_at = ? where id = ?').run(status, iso(now), accountId);
    },

    async createSession({ id, tokenHash, accountId, now, expiresAt, userAgent, ipHash }) {
      db.prepare(
        `insert into sessions (id, token_hash, account_id, created_at, last_seen_at, expires_at, user_agent, ip_hash)
         values (?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(id, tokenHash, accountId, iso(now), iso(now), iso(expiresAt), userAgent, ipHash);
    },

    async findLiveSession(tokenHash, now) {
      const row = db
        .prepare('select * from sessions where token_hash = ? and revoked_at is null and expires_at > ?')
        .get(tokenHash, iso(now));
      return row ? toSession(row as Record<string, unknown>) : undefined;
    },

    async touchSession(id, now, expiresAt) {
      db.prepare('update sessions set last_seen_at = ?, expires_at = ? where id = ?').run(iso(now), iso(expiresAt), id);
    },

    async revokeSession(id, now) {
      const result = db.prepare('update sessions set revoked_at = ? where id = ? and revoked_at is null').run(iso(now), id);
      return Number(result.changes) > 0;
    },

    async revokeAllSessions(accountId, now, exceptId) {
      const result = exceptId
        ? db
            .prepare('update sessions set revoked_at = ? where account_id = ? and revoked_at is null and id <> ?')
            .run(iso(now), accountId, exceptId)
        : db.prepare('update sessions set revoked_at = ? where account_id = ? and revoked_at is null').run(iso(now), accountId);
      return Number(result.changes);
    },

    async listLiveSessions(accountId, now) {
      const rows = db
        .prepare('select * from sessions where account_id = ? and revoked_at is null and expires_at > ? order by created_at desc')
        .all(accountId, iso(now));
      return rows.map((row) => toSession(row as Record<string, unknown>));
    },

    async createVerificationToken({ tokenHash, accountId, purpose, now, expiresAt }) {
      db.prepare(
        'insert into verification_tokens (token_hash, account_id, purpose, created_at, expires_at) values (?, ?, ?, ?, ?)',
      ).run(tokenHash, accountId, purpose, iso(now), iso(expiresAt));
    },

    async consumeVerificationToken(tokenHash, purpose, now) {
      // Marca como usado e devolve a conta num só comando: dois pedidos em paralelo com o mesmo
      // token não conseguem ambos consumi-lo.
      const row = db
        .prepare(
          `update verification_tokens set used_at = ?
           where token_hash = ? and purpose = ? and used_at is null and expires_at > ?
           returning account_id`,
        )
        .get(iso(now), tokenHash, purpose, iso(now));
      return row ? text((row as Record<string, unknown>)['account_id']) : undefined;
    },

    async discardVerificationTokens(accountId, purpose, now) {
      db.prepare('update verification_tokens set used_at = ? where account_id = ? and purpose = ? and used_at is null').run(
        iso(now),
        accountId,
        purpose,
      );
    },

    async recordAttempt(scope, key, now, successful) {
      db.prepare('insert into auth_attempts (scope, scope_key, occurred_at, successful) values (?, ?, ?, ?)').run(
        scope,
        key,
        iso(now),
        successful ? 1 : 0,
      );
    },

    async countRecentFailures(scope, key, since) {
      const row = db
        .prepare('select count(*) as total from auth_attempts where scope = ? and scope_key = ? and successful = 0 and occurred_at > ?')
        .get(scope, key, iso(since));
      return Number((row as Record<string, unknown>)['total']);
    },

    async clearFailures(scope, key) {
      db.prepare('delete from auth_attempts where scope = ? and scope_key = ?').run(scope, key);
    },

    async recordEvent({ kind, now, accountId = null, ipHash = null, detail }) {
      db.prepare('insert into security_events (occurred_at, kind, account_id, ip_hash, detail) values (?, ?, ?, ?, ?)').run(
        iso(now),
        kind,
        accountId,
        ipHash,
        detail === undefined ? null : JSON.stringify(detail),
      );
    },
  };
}
