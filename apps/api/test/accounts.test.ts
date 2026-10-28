import { accountSchema, apiErrorSchema, sessionSummarySchema } from '@blbet/contracts';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { loadConfig } from '../src/config/env.js';
import { type Database, openDatabase } from '../src/db/database.js';
import { createSqliteAccountsRepository } from '../src/modules/accounts/accounts-repository.js';
import { createAccountsService } from '../src/modules/accounts/accounts-service.js';
import type { Mailer, Message } from '../src/modules/accounts/mailer.js';

// Contas e sessões (DT-020). Cobre a lista da secção 10 do pedido que se aplica a esta fase:
// cadastro, autenticação, expiração e revogação, limites, acesso horizontal, entrada maliciosa
// e segurança do cookie.

const EMAIL = 'pessoa@exemplo.pt';
const SENHA = 'uma senha comprida';
const ERRADA = 'errada mas comprida';
const SECRET = 'segredo-de-teste-com-mais-de-32-caracteres';

let open: { app: FastifyInstance; db: Database } | undefined;
afterEach(async () => {
  await open?.app.close();
  open?.db.close();
  open = undefined;
});

interface Harness {
  readonly app: FastifyInstance;
  readonly db: Database;
  readonly sent: Message[];
  /** O token que seguiu no link de um e-mail. */
  readonly tokenOf: (message: Message) => string;
}

function start(env: Readonly<Record<string, string>> = {}): Harness {
  const sent: Message[] = [];
  const mailer: Mailer = {
    async send(message) {
      sent.push(message);
    },
  };

  const config = loadConfig({
    NODE_ENV: 'test',
    LOG_LEVEL: 'silent',
    RATE_LIMIT_MAX: '0',
    AUTH_RATE_LIMIT_MAX: '0',
    DATABASE_FILE: ':memory:',
    AUTH_IP_HASH_SECRET: SECRET,
    ...env,
  });

  const db = openDatabase({ file: ':memory:' });
  const accounts = createAccountsService({
    repository: createSqliteAccountsRepository(db),
    mailer,
    policy: {
      sessionIdleMinutes: config.SESSION_IDLE_MINUTES,
      sessionAbsoluteHours: config.SESSION_ABSOLUTE_HOURS,
      verificationTtlHours: config.EMAIL_VERIFICATION_TTL_HOURS,
      passwordResetTtlMinutes: config.PASSWORD_RESET_TTL_MINUTES,
      maxFailuresPerAccount: config.AUTH_MAX_FAILURES_PER_ACCOUNT,
      maxFailuresPerIp: config.AUTH_MAX_FAILURES_PER_IP,
      failureWindowMinutes: config.AUTH_FAILURE_WINDOW_MINUTES,
      requireVerifiedEmail: config.AUTH_REQUIRE_VERIFIED_EMAIL,
      ipHashSecret: SECRET,
      publicUrl: config.PUBLIC_URL,
    },
  });

  const app = buildApp(config, { accounts });
  open = { app, db };
  return {
    app,
    db,
    sent,
    tokenOf: (message) => new URL(message.body.slice(message.body.indexOf('http'))).searchParams.get('token') ?? '',
  };
}

const register = (app: FastifyInstance, email = EMAIL, password = SENHA) =>
  app.inject({ method: 'POST', url: '/api/accounts', payload: { email, password } });

const login = (app: FastifyInstance, email = EMAIL, password = SENHA) =>
  app.inject({ method: 'POST', url: '/api/sessions', payload: { email, password } });

const me = (app: FastifyInstance, cookie: string) => app.inject({ method: 'GET', url: '/api/accounts/me', headers: { cookie } });

const total = (db: Database, table: string) => Number(db.prepare(`select count(*) as n from ${table}`).get()!['n']);

function cookieOf(response: Awaited<ReturnType<FastifyInstance['inject']>>): string {
  const header = response.headers['set-cookie'];
  const raw = Array.isArray(header) ? header[0] : header;
  return String(raw).split(';')[0] ?? '';
}

/** Cadastra, verifica o e-mail e entra. Devolve o cookie de sessão. */
async function signedIn(harness: Harness, email = EMAIL, password = SENHA): Promise<string> {
  await register(harness.app, email, password);
  const message = harness.sent.at(-1);
  await harness.app.inject({ method: 'POST', url: '/api/accounts/verify', payload: { token: harness.tokenOf(message!) } });
  return cookieOf(await login(harness.app, email, password));
}

describe('cadastro e verificação de e-mail', () => {
  it('cria a conta e envia o link de verificação, sem devolver nada sobre ela', async () => {
    const harness = start();
    const response = await register(harness.app);

    expect(response.statusCode).toBe(202);
    expect(response.json()).toEqual({ data: { accepted: true } });
    expect(harness.sent).toHaveLength(1);
    expect(harness.sent[0]?.to).toBe(EMAIL);
  });

  it('responde o mesmo a um e-mail já registado — é o que impede descobrir quem tem conta', async () => {
    const harness = start();
    const first = await register(harness.app);
    const second = await register(harness.app);

    expect(second.statusCode).toBe(first.statusCode);
    expect(second.json()).toEqual(first.json());
    // Só uma conta foi criada, e o dono do endereço foi avisado da tentativa.
    expect(total(harness.db, 'accounts')).toBe(1);
    expect(harness.sent.at(-1)?.subject).toContain('Tentativa de cadastro');
  });

  it('normaliza o e-mail: maiúsculas e espaços não criam uma segunda conta', async () => {
    const harness = start();
    await register(harness.app, EMAIL);
    await register(harness.app, `  ${EMAIL.toUpperCase()} `);

    expect(total(harness.db, 'accounts')).toBe(1);
  });

  it('guarda a senha em resumo Argon2id, nunca em claro', async () => {
    const harness = start();
    await register(harness.app);

    const stored = String(harness.db.prepare('select password_hash from accounts').get()!['password_hash']);
    expect(stored).toMatch(/^\$argon2id\$/);
    expect(stored).not.toContain(SENHA);
  });

  it('recusa senha curta com o detalhe por campo da PC-003', async () => {
    const harness = start();
    const response = await register(harness.app, EMAIL, 'curta');

    expect(response.statusCode).toBe(400);
    const body = apiErrorSchema.parse(response.json());
    expect(body.error.details).toContainEqual({ field: 'body.password', issue: 'too_small' });
  });

  it('recusa campo desconhecido no corpo', async () => {
    const harness = start();
    const response = await harness.app.inject({
      method: 'POST',
      url: '/api/accounts',
      payload: { email: EMAIL, password: SENHA, admin: true },
    });

    expect(response.statusCode).toBe(400);
    expect(apiErrorSchema.parse(response.json()).error.details).toContainEqual({ field: 'body.admin', issue: 'unknown_field' });
  });

  it('um token de verificação só serve uma vez', async () => {
    const harness = start();
    await register(harness.app);
    const token = harness.tokenOf(harness.sent[0]!);

    const first = await harness.app.inject({ method: 'POST', url: '/api/accounts/verify', payload: { token } });
    const second = await harness.app.inject({ method: 'POST', url: '/api/accounts/verify', payload: { token } });

    expect(first.statusCode).toBe(204);
    expect(second.statusCode).toBe(400);
  });
});

describe('entrada', () => {
  it('entra com as credenciais certas e devolve a conta, sem o token no corpo', async () => {
    const harness = start();
    await register(harness.app);
    await harness.app.inject({ method: 'POST', url: '/api/accounts/verify', payload: { token: harness.tokenOf(harness.sent[0]!) } });

    const response = await login(harness.app);
    expect(response.statusCode).toBe(201);
    const account = accountSchema.parse(response.json().data);
    expect(account).toMatchObject({ email: EMAIL, emailVerified: true });

    const token = cookieOf(response).split('=')[1];
    expect(JSON.stringify(response.json())).not.toContain(token);
  });

  it('põe o cookie fora do alcance do JavaScript e preso ao sítio', async () => {
    const harness = start();
    await signedIn(harness);

    const header = String((await login(harness.app)).headers['set-cookie']);
    expect(header).toContain('HttpOnly');
    expect(header).toContain('SameSite=Strict');
    // Sem HTTPS em desenvolvimento o cookie não pode ser `Secure`, ou não chegava a ser guardado.
    expect(header).not.toContain('Secure');
  });

  it('responde igual a senha errada e a e-mail que não existe', async () => {
    const harness = start();
    await signedIn(harness);

    const wrongPassword = await login(harness.app, EMAIL, ERRADA);
    const unknownEmail = await login(harness.app, 'ninguem@exemplo.pt', SENHA);

    expect(wrongPassword.statusCode).toBe(401);
    expect(unknownEmail.statusCode).toBe(401);
    expect(unknownEmail.json()).toEqual(wrongPassword.json());
    expect(apiErrorSchema.parse(wrongPassword.json()).error).toMatchObject({ code: 'UNAUTHENTICATED', retryable: false });
  });

  it('recusa entrar com o e-mail por verificar, e diz porquê — a senha já está certa', async () => {
    const harness = start();
    await register(harness.app);

    const response = await login(harness.app);
    expect(response.statusCode).toBe(403);
    expect(apiErrorSchema.parse(response.json()).error).toMatchObject({ code: 'FORBIDDEN', message: 'email not verified' });
  });

  it('trava a conta depois de falhas seguidas, antes de chegar à senha', async () => {
    const harness = start({ AUTH_MAX_FAILURES_PER_ACCOUNT: '3' });
    await signedIn(harness);

    for (let attempt = 0; attempt < 3; attempt += 1) {
      expect((await login(harness.app, EMAIL, ERRADA)).statusCode).toBe(401);
    }

    // A senha certa também não passa: o travão é anterior à verificação.
    const blocked = await login(harness.app);
    expect(blocked.statusCode).toBe(429);
    expect(apiErrorSchema.parse(blocked.json()).error.message).toBe('too many attempts');
  });

  it('entrar com sucesso limpa as falhas acumuladas', async () => {
    const harness = start({ AUTH_MAX_FAILURES_PER_ACCOUNT: '3' });
    await signedIn(harness);

    await login(harness.app, EMAIL, ERRADA);
    await login(harness.app, EMAIL, ERRADA);
    expect((await login(harness.app)).statusCode).toBe(201);

    await login(harness.app, EMAIL, ERRADA);
    expect((await login(harness.app)).statusCode).toBe(201);
  });
});

describe('sessões', () => {
  it('sem cookie não há acesso', async () => {
    const harness = start();
    const response = await harness.app.inject({ method: 'GET', url: '/api/accounts/me' });

    expect(response.statusCode).toBe(401);
    expect(apiErrorSchema.parse(response.json()).error.code).toBe('UNAUTHENTICATED');
  });

  it('um cookie inventado não vale', async () => {
    const harness = start();
    await signedIn(harness);

    expect((await me(harness.app, 'blbet_session=token-que-nunca-foi-emitido')).statusCode).toBe(401);
  });

  it('sair revoga a sessão: o mesmo cookie deixa de servir', async () => {
    const harness = start();
    const cookie = await signedIn(harness);

    expect((await me(harness.app, cookie)).statusCode).toBe(200);
    await harness.app.inject({ method: 'DELETE', url: '/api/sessions/current', headers: { cookie } });
    expect((await me(harness.app, cookie)).statusCode).toBe(401);
  });

  it('lista as sessões da conta e marca a atual', async () => {
    const harness = start();
    const first = await signedIn(harness);
    await login(harness.app);

    const response = await harness.app.inject({ method: 'GET', url: '/api/sessions', headers: { cookie: first } });
    const sessions = z.array(sessionSummarySchema).parse(response.json().data);

    expect(sessions).toHaveLength(2);
    expect(sessions.filter((session) => session.current)).toHaveLength(1);
  });

  it('não deixa derrubar a sessão de outra conta', async () => {
    const harness = start();
    const mine = await signedIn(harness);
    const theirs = await signedIn(harness, 'outra@exemplo.pt');

    const theirSessions = z
      .array(sessionSummarySchema)
      .parse((await harness.app.inject({ method: 'GET', url: '/api/sessions', headers: { cookie: theirs } })).json().data);

    const response = await harness.app.inject({
      method: 'DELETE',
      url: `/api/sessions/${theirSessions[0]!.id}`,
      headers: { cookie: mine },
    });

    expect(response.statusCode).toBe(404);
    // E continua a valer para o dono.
    expect((await me(harness.app, theirs)).statusCode).toBe(200);
  });

  it('derrubar as outras sessões mantém a atual', async () => {
    const harness = start();
    const first = await signedIn(harness);
    const second = cookieOf(await login(harness.app));

    await harness.app.inject({ method: 'DELETE', url: '/api/sessions', headers: { cookie: second } });

    expect((await me(harness.app, second)).statusCode).toBe(200);
    expect((await me(harness.app, first)).statusCode).toBe(401);
  });
});

describe('senha', () => {
  it('trocar a senha exige a atual e derruba as outras sessões', async () => {
    const harness = start();
    const first = await signedIn(harness);
    const second = cookieOf(await login(harness.app));

    const semReautenticar = await harness.app.inject({
      method: 'POST',
      url: '/api/accounts/password',
      headers: { cookie: second },
      payload: { currentPassword: ERRADA, newPassword: 'senha nova comprida' },
    });
    expect(semReautenticar.statusCode).toBe(401);

    const trocada = await harness.app.inject({
      method: 'POST',
      url: '/api/accounts/password',
      headers: { cookie: second },
      payload: { currentPassword: SENHA, newPassword: 'senha nova comprida' },
    });
    expect(trocada.statusCode).toBe(204);
    expect((await me(harness.app, first)).statusCode).toBe(401);
    expect((await me(harness.app, second)).statusCode).toBe(200);
  });

  it('o pedido de recuperação responde o mesmo exista ou não a conta', async () => {
    const harness = start();
    await signedIn(harness);
    harness.sent.length = 0;

    const existe = await harness.app.inject({ method: 'POST', url: '/api/accounts/password-reset', payload: { email: EMAIL } });
    const naoExiste = await harness.app.inject({
      method: 'POST',
      url: '/api/accounts/password-reset',
      payload: { email: 'ninguem@exemplo.pt' },
    });

    expect(naoExiste.statusCode).toBe(existe.statusCode);
    expect(naoExiste.json()).toEqual(existe.json());
    // A diferença está só no e-mail enviado, que o atacante não vê.
    expect(harness.sent).toHaveLength(1);
  });

  it('redefinir a senha derruba todas as sessões e o token não volta a servir', async () => {
    const harness = start();
    const cookie = await signedIn(harness);
    harness.sent.length = 0;

    await harness.app.inject({ method: 'POST', url: '/api/accounts/password-reset', payload: { email: EMAIL } });
    const token = harness.tokenOf(harness.sent[0]!);

    const primeira = await harness.app.inject({
      method: 'POST',
      url: '/api/accounts/password-reset/confirm',
      payload: { token, password: 'outra senha comprida' },
    });
    expect(primeira.statusCode).toBe(204);
    expect((await me(harness.app, cookie)).statusCode).toBe(401);
    expect((await login(harness.app, EMAIL, 'outra senha comprida')).statusCode).toBe(201);

    const repetida = await harness.app.inject({
      method: 'POST',
      url: '/api/accounts/password-reset/confirm',
      payload: { token, password: 'terceira senha comprida' },
    });
    expect(repetida.statusCode).toBe(400);
  });

  it('um pedido novo de recuperação invalida o link anterior', async () => {
    const harness = start();
    await signedIn(harness);
    harness.sent.length = 0;

    await harness.app.inject({ method: 'POST', url: '/api/accounts/password-reset', payload: { email: EMAIL } });
    const antigo = harness.tokenOf(harness.sent[0]!);
    await harness.app.inject({ method: 'POST', url: '/api/accounts/password-reset', payload: { email: EMAIL } });

    const response = await harness.app.inject({
      method: 'POST',
      url: '/api/accounts/password-reset/confirm',
      payload: { token: antigo, password: 'mais uma senha comprida' },
    });
    expect(response.statusCode).toBe(400);
  });
});

describe('auditoria', () => {
  it('regista os eventos de segurança sem guardar senha, e-mail nem endereço em claro', async () => {
    const harness = start();
    await signedIn(harness);
    await login(harness.app, EMAIL, ERRADA);

    const rows = harness.db.prepare('select kind, ip_hash, detail from security_events').all();
    const kinds = rows.map((row) => String(row['kind']));
    expect(kinds).toContain('account.registered');
    expect(kinds).toContain('auth.succeeded');
    expect(kinds).toContain('auth.failed');

    const dump = JSON.stringify(rows);
    expect(dump).not.toContain(SENHA);
    expect(dump).not.toContain(EMAIL);
    expect(dump).not.toContain('127.0.0.1');
  });
});
