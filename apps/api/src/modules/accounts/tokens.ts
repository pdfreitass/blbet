import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * Tokens opacos de sessão e de verificação. São aleatórios, não transportam informação e não são
 * assinados: quem os valida é a base de dados. Isso torna a revogação imediata — apagar a linha
 * chega — ao contrário de um token assinado, que vale até expirar.
 *
 * **Guarda-se só o resumo.** Quem leia a base de dados não consegue usar as sessões de ninguém,
 * porque o SHA-256 não se inverte. Aqui não é preciso Argon2id: o token tem 256 bits de entropia,
 * não há dicionário que o alcance; a lentidão do Argon2id só serve para senhas escolhidas por
 * pessoas.
 */
const TOKEN_BYTES = 32;

export function newToken(): string {
  return randomBytes(TOKEN_BYTES).toString('base64url');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Compara dois resumos em tempo constante. O tempo de uma comparação normal depende de quantos
 * caracteres coincidem, o que deixa adivinhar um token byte a byte.
 */
export function tokensMatch(a: string, b: string): boolean {
  const left = Buffer.from(a, 'utf8');
  const right = Buffer.from(b, 'utf8');
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/**
 * Resumo de um endereço IP, para auditoria e limites por origem. O endereço é dado pessoal; o
 * resumo com segredo permite contar tentativas da mesma origem sem guardar de quem são.
 */
export function hashIp(ip: string, secret: string): string {
  return createHash('sha256').update(`${secret}:${ip}`).digest('hex');
}
