import { type Algorithm, hash, verify } from '@node-rs/argon2';

/**
 * `Algorithm.Argon2id`. O valor vai escrito porque `Algorithm` é um `const enum` ambiente, que o
 * `verbatimModuleSyntax` do projeto não deixa ler em tempo de execução. O teste de
 * `password.test.ts` confirma que o resumo sai mesmo em `$argon2id$`.
 */
const ARGON2ID = 2 satisfies Algorithm;

/**
 * Parâmetros do Argon2id. São os do próprio `@node-rs/argon2` e coincidem com a recomendação da
 * OWASP (19 MiB de memória, 2 passagens, paralelismo 1): memória alta trava ataque por GPU, e o
 * custo por tentativa legítima fica na ordem das dezenas de milissegundos.
 */
const PARAMS = { algorithm: ARGON2ID, memoryCost: 19_456, timeCost: 2, parallelism: 1 } as const;

/**
 * Resumo de uma senha **que não existe**, usado para gastar o mesmo tempo quando o e-mail não
 * está registado. Sem isto, responder depressa a um e-mail desconhecido e devagar a um conhecido
 * revelaria quem tem conta, mesmo com a resposta genérica da A-A2.
 */
let decoyHash: string | undefined;

export async function hashPassword(password: string): Promise<string> {
  return hash(password, PARAMS);
}

/** Nunca lança por senha errada: um resumo corrompido ou de outro formato conta como falha. */
export async function verifyPassword(storedHash: string, password: string): Promise<boolean> {
  try {
    return await verify(storedHash, password, PARAMS);
  } catch {
    return false;
  }
}

/** Faz o trabalho de uma verificação, e devolve sempre `false`. Ver `decoyHash`. */
export async function wasteVerification(password: string): Promise<false> {
  decoyHash ??= await hashPassword(`inexistente:${crypto.randomUUID()}`);
  await verifyPassword(decoyHash, password);
  return false;
}
