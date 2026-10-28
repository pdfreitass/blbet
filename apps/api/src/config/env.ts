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
