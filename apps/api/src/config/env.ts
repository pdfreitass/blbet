import { z } from 'zod';

// Uma linha `NOME=` vazia no .env conta como não definida.
const blankAsUndefined = (value: unknown) => (typeof value === 'string' && value.trim() === '' ? undefined : value);
const optionalText = <T extends z.ZodType>(schema: T) => z.preprocess(blankAsUndefined, schema);

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().min(1).default('127.0.0.1'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3333),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  // Provedor esportivo (DT-009, DT-012). Sem chave, as rotas de esportes respondem 503.
  SPORTS_PROVIDER_API_KEY: optionalText(z.string().min(1).optional()),
  SPORTS_PROVIDER_HOST: optionalText(z.string().min(1).default('sportsbook-api2.p.rapidapi.com')),
  SPORTS_PROVIDER_SOURCE: optionalText(z.string().min(1).default('BET_PARX')),
  SPORTS_COMPETITIONS: optionalText(
    z
      .string()
      .transform((list) => list.split(',').map((item) => item.trim()).filter(Boolean))
      .pipe(z.array(z.string()).min(1))
      .default(['EPL', 'LA_LIGA', 'SERIE_A']),
  ),
  SPORTS_REFRESH_MINUTES: optionalText(z.coerce.number().int().min(1).default(60)),
  // Modo de teste (DT-018): `recorded` serve as respostas gravadas de `recordings/`, sem chave e
  // sem chamar o provedor. Destina-se aos E2E e ao desenvolvimento sem quota.
  SPORTS_MODE: optionalText(z.enum(['live', 'recorded']).default('live')),
  // Só com SPORTS_MODE=recorded: instante em que o relógio fica parado. Por omissão, o
  // `recordedAt` da gravação.
  SPORTS_NOW: optionalText(z.iso.datetime().optional()),
  // S-1 — pedidos por cliente em cada janela. `0` desliga o limite, o que serve aos E2E, que
  // fazem muitos pedidos seguidos e não devem apanhar 429 por isso.
  RATE_LIMIT_MAX: optionalText(z.coerce.number().int().min(0).default(300)),
  RATE_LIMIT_WINDOW_SECONDS: optionalText(z.coerce.number().int().min(1).default(60)),
  // S-3 — origens autorizadas a chamar a api de outro sítio. Vazio significa **nenhuma**: em
  // desenvolvimento o Vite encaminha `/api`, logo é a mesma origem e não é preciso CORS.
  CORS_ORIGINS: optionalText(
    z
      .string()
      .transform((list) => list.split(',').map((item) => item.trim()).filter(Boolean))
      .pipe(z.array(z.url()))
      .default([]),
  ),
  // S-3 — teto do corpo de um pedido. As rotas desta api recebem objetos pequenos.
  BODY_LIMIT_BYTES: optionalText(z.coerce.number().int().min(1024).default(65_536)),

  // Contas e sessões (DT-020, DT-021). Sem DATABASE_FILE as rotas de conta não existem, e a api
  // fica a servir só esportes — que é o estado anterior a esta decisão.
  DATABASE_FILE: optionalText(z.string().min(1).optional()),
  SESSION_COOKIE_NAME: optionalText(z.string().min(1).default('blbet_session')),
  SESSION_IDLE_MINUTES: optionalText(z.coerce.number().int().min(1).default(60)),
  SESSION_ABSOLUTE_HOURS: optionalText(z.coerce.number().int().min(1).default(168)),
  // O cookie só viaja em HTTPS. Fica `false` só para desenvolvimento em http://127.0.0.1.
  COOKIE_SECURE: optionalText(z.stringbool().optional()),
  AUTH_REQUIRE_VERIFIED_EMAIL: optionalText(z.stringbool().default(true)),
  AUTH_MAX_FAILURES_PER_ACCOUNT: optionalText(z.coerce.number().int().min(1).default(5)),
  AUTH_MAX_FAILURES_PER_IP: optionalText(z.coerce.number().int().min(1).default(20)),
  AUTH_FAILURE_WINDOW_MINUTES: optionalText(z.coerce.number().int().min(1).default(15)),
  AUTH_RATE_LIMIT_MAX: optionalText(z.coerce.number().int().min(0).default(10)),
  // Segredo com que os endereços IP são resumidos antes de guardados, para a auditoria não
  // guardar o endereço em claro. Obrigatório quando há base de dados.
  AUTH_IP_HASH_SECRET: optionalText(z.string().min(32).optional()),
  EMAIL_VERIFICATION_TTL_HOURS: optionalText(z.coerce.number().int().min(1).default(24)),
  PASSWORD_RESET_TTL_MINUTES: optionalText(z.coerce.number().int().min(1).default(30)),
  // Base dos links enviados por e-mail.
  PUBLIC_URL: optionalText(z.url().default('http://127.0.0.1:5173')),
}).superRefine((config, ctx) => {
  const require = (path: string, message: string) => ctx.addIssue({ code: 'custom', path: [path], message });

  if (config.DATABASE_FILE && !config.AUTH_IP_HASH_SECRET) {
    require('AUTH_IP_HASH_SECRET', 'obrigatório quando há base de dados');
  }
  if (config.NODE_ENV === 'production') {
    // Em produção estas não podem ficar ao critério de quem arranca o processo.
    if (config.COOKIE_SECURE === false) require('COOKIE_SECURE', 'não pode ser falso em produção');
    if (config.RATE_LIMIT_MAX === 0) require('RATE_LIMIT_MAX', 'não pode desligar o limite em produção');
    if (config.AUTH_RATE_LIMIT_MAX === 0) require('AUTH_RATE_LIMIT_MAX', 'não pode desligar o limite em produção');
    if (config.DATABASE_FILE && !config.AUTH_REQUIRE_VERIFIED_EMAIL) {
      require('AUTH_REQUIRE_VERIFIED_EMAIL', 'não pode ser falso em produção');
    }
  }
});

export type AppConfig = Readonly<z.infer<typeof envSchema>>;

export class InvalidEnvError extends Error {
  readonly variables: readonly string[];

  constructor(variables: readonly string[]) {
    // Só os nomes das variáveis: o valor recebido pode ser um segredo.
    super(`Variáveis de ambiente inválidas: ${variables.join(', ')}`);
    this.name = 'InvalidEnvError';
    this.variables = variables;
  }
}

export function loadConfig(source: NodeJS.ProcessEnv = process.env): AppConfig {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const variables = [...new Set(result.error.issues.map((issue) => issue.path.join('.')))];
    throw new InvalidEnvError(variables);
  }
  return Object.freeze(result.data);
}
