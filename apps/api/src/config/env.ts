import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().min(1).default('127.0.0.1'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3333),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
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
