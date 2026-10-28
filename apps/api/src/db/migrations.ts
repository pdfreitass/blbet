/**
 * Migrações versionadas, por ordem e **imutáveis**: uma migração já aplicada nunca é editada;
 * corrige-se com outra a seguir. Ficam em TypeScript, e não em ficheiros `.sql`, para seguirem
 * o `dist/` no build sem passo de cópia.
 *
 * Convenções das tabelas:
 * - instantes em texto ISO 8601 em UTC, como no resto da api;
 * - nada de segredo em claro: senhas em resumo Argon2id, tokens e endereços IP em resumo;
 * - `accounts` é a única tabela com dado pessoal, para a eliminação da LGPD ser localizada.
 */
export interface Migration {
  readonly version: number;
  readonly name: string;
  readonly sql: string;
}

export const MIGRATIONS: readonly Migration[] = [
  {
    version: 1,
    name: 'contas-e-sessoes',
    sql: `
      create table accounts (
        id                text primary key,
        email             text not null unique,
        password_hash     text not null,
        status            text not null default 'active'
                            check (status in ('active', 'locked', 'disabled')),
        email_verified_at text,
        created_at        text not null,
        updated_at        text not null
      );

      -- O resumo do token é a chave primária: o token em claro existe só no e-mail enviado.
      create table sessions (
        id           text primary key,
        token_hash   text not null unique,
        account_id   text not null references accounts(id) on delete cascade,
        created_at   text not null,
        last_seen_at text not null,
        expires_at   text not null,
        revoked_at   text,
        user_agent   text,
        ip_hash      text
      );
      create index sessions_account_idx on sessions(account_id);
      create index sessions_expires_idx on sessions(expires_at);

      create table verification_tokens (
        token_hash text primary key,
        account_id text not null references accounts(id) on delete cascade,
        purpose    text not null check (purpose in ('email_verification', 'password_reset')),
        created_at text not null,
        expires_at text not null,
        used_at    text
      );
      create index verification_account_idx on verification_tokens(account_id, purpose);

      -- Tentativas de autenticação, para travar força bruta por conta e por origem.
      create table auth_attempts (
        id          integer primary key autoincrement,
        scope       text not null check (scope in ('account', 'ip')),
        scope_key   text not null,
        occurred_at text not null,
        successful  integer not null check (successful in (0, 1))
      );
      create index auth_attempts_idx on auth_attempts(scope, scope_key, occurred_at);

      -- Auditoria. \`detail\` é JSON e nunca leva senha, token nem e-mail em claro.
      create table security_events (
        id          integer primary key autoincrement,
        occurred_at text not null,
        kind        text not null,
        account_id  text,
        ip_hash     text,
        detail      text
      );
      create index security_events_time_idx on security_events(occurred_at);
      create index security_events_account_idx on security_events(account_id, occurred_at);
    `,
  },
];
