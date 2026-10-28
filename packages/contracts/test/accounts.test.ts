import { describe, expect, it } from 'vitest';
import {
  acceptedSchema,
  accountSchema,
  emailSchema,
  emailVerificationSchema,
  loginInputSchema,
  MAX_EMAIL_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  passwordResetConfirmSchema,
  passwordResetRequestSchema,
  passwordSchema,
  registerInputSchema,
  sessionSummarySchema,
} from '../src/accounts.js';

const SUFIXO = '@example.com';
const emailComTamanho = (total: number) => 'a'.repeat(total - SUFIXO.length) + SUFIXO;
const senha = (tamanho: number) => 'a'.repeat(tamanho);

describe('emailSchema', () => {
  it('normaliza espaços em volta e maiúsculas antes de validar', () => {
    expect(emailSchema.parse('  Pessoa@Example.COM  ')).toBe('pessoa@example.com');
  });

  it('rejeita endereço malformado e texto vazio', () => {
    for (const invalido of ['pessoa', 'pessoa@', '@example.com', 'pessoa example.com', '', '   ']) {
      expect(emailSchema.safeParse(invalido).success).toBe(false);
    }
  });

  it('aceita até MAX_EMAIL_LENGTH e rejeita um caractere acima', () => {
    expect(emailSchema.safeParse(emailComTamanho(MAX_EMAIL_LENGTH)).success).toBe(true);
    expect(emailSchema.safeParse(emailComTamanho(MAX_EMAIL_LENGTH + 1)).success).toBe(false);
  });

  it('mede o tamanho depois de cortar os espaços', () => {
    const limite = emailComTamanho(MAX_EMAIL_LENGTH);
    expect(emailSchema.safeParse(`  ${limite}  `).success).toBe(true);
  });
});

describe('passwordSchema (A-A1)', () => {
  it('exige MIN_PASSWORD_LENGTH caracteres', () => {
    expect(passwordSchema.safeParse(senha(MIN_PASSWORD_LENGTH - 1)).success).toBe(false);
    expect(passwordSchema.safeParse(senha(MIN_PASSWORD_LENGTH)).success).toBe(true);
  });

  it('aceita até MAX_PASSWORD_LENGTH e rejeita acima', () => {
    expect(passwordSchema.safeParse(senha(MAX_PASSWORD_LENGTH)).success).toBe(true);
    expect(passwordSchema.safeParse(senha(MAX_PASSWORD_LENGTH + 1)).success).toBe(false);
  });

  it('não impõe regra de composição: oito minúsculas passam', () => {
    expect(passwordSchema.safeParse('abcdefgh').success).toBe(true);
  });
});

describe('registerInputSchema e loginInputSchema', () => {
  const corpo = { email: '  Pessoa@Example.com ', password: senha(MIN_PASSWORD_LENGTH) };

  it('normalizam o e-mail no corpo do pedido', () => {
    expect(registerInputSchema.parse(corpo).email).toBe('pessoa@example.com');
    expect(loginInputSchema.parse(corpo).email).toBe('pessoa@example.com');
  });

  it('rejeitam campo a mais, campo a menos e senha curta', () => {
    for (const esquema of [registerInputSchema, loginInputSchema]) {
      expect(esquema.safeParse({ ...corpo, lembrar: true }).success).toBe(false);
      expect(esquema.safeParse({ email: 'pessoa@example.com' }).success).toBe(false);
      expect(esquema.safeParse({ ...corpo, password: senha(MIN_PASSWORD_LENGTH - 1) }).success).toBe(false);
    }
  });
});

describe('passwordResetRequestSchema', () => {
  it('aceita só o e-mail, normalizado', () => {
    expect(passwordResetRequestSchema.parse({ email: 'PESSOA@example.com' })).toEqual({
      email: 'pessoa@example.com',
    });
  });

  it('rejeita campo a mais', () => {
    expect(passwordResetRequestSchema.safeParse({ email: 'pessoa@example.com', token: 'x' }).success).toBe(false);
  });
});

describe('passwordResetConfirmSchema e emailVerificationSchema', () => {
  const token = 'a'.repeat(64);

  it('aceitam o token do link de e-mail', () => {
    expect(passwordResetConfirmSchema.safeParse({ token, password: senha(MIN_PASSWORD_LENGTH) }).success).toBe(true);
    expect(emailVerificationSchema.safeParse({ token }).success).toBe(true);
  });

  it('rejeitam token vazio e token acima de 256 caracteres', () => {
    for (const invalido of ['', 'a'.repeat(257)]) {
      expect(passwordResetConfirmSchema.safeParse({ token: invalido, password: senha(MIN_PASSWORD_LENGTH) }).success).toBe(false);
      expect(emailVerificationSchema.safeParse({ token: invalido }).success).toBe(false);
    }
    expect(emailVerificationSchema.safeParse({ token: 'a'.repeat(256) }).success).toBe(true);
  });

  it('a confirmação exige a senha nova e recusa campo a mais', () => {
    expect(passwordResetConfirmSchema.safeParse({ token }).success).toBe(false);
    expect(passwordResetConfirmSchema.safeParse({ token, password: senha(MIN_PASSWORD_LENGTH), email: 'a@b.com' }).success).toBe(false);
  });
});

describe('accountSchema', () => {
  const conta = {
    id: '3f1c2b5a-9d4e-4f0b-8c7a-1e2d3c4b5a69',
    email: 'pessoa@example.com',
    emailVerified: false,
    createdAt: '2026-10-28T20:00:00Z',
  };

  it('aceita a conta como a interface a vê', () => {
    expect(accountSchema.parse(conta)).toEqual(conta);
  });

  it('rejeita identificador que não é uuid e data sem formato ISO', () => {
    expect(accountSchema.safeParse({ ...conta, id: 'OVc2-Alcu-Ynsy' }).success).toBe(false);
    expect(accountSchema.safeParse({ ...conta, createdAt: '28/10/2026' }).success).toBe(false);
  });

  it('exige emailVerified e não aceita texto no seu lugar', () => {
    const { emailVerified: _omitido, ...semVerificado } = conta;
    expect(accountSchema.safeParse(semVerificado).success).toBe(false);
    expect(accountSchema.safeParse({ ...conta, emailVerified: 'false' }).success).toBe(false);
  });

  it('não devolve resumo de senha: o campo é ignorado, não copiado', () => {
    const lido = accountSchema.parse({ ...conta, passwordHash: 'nao-devia-estar-aqui' });
    expect('passwordHash' in lido).toBe(false);
  });
});

describe('sessionSummarySchema', () => {
  const sessao = {
    id: '7a8b9c0d-1e2f-4a3b-9c8d-7e6f5a4b3c2d',
    createdAt: '2026-10-28T20:00:00Z',
    lastSeenAt: '2026-10-28T20:10:00Z',
    expiresAt: '2026-11-04T20:00:00Z',
    current: true,
    userAgent: 'Mozilla/5.0',
  };

  it('aceita a sessão com userAgent e com userAgent nulo', () => {
    expect(sessionSummarySchema.parse(sessao)).toEqual(sessao);
    expect(sessionSummarySchema.safeParse({ ...sessao, userAgent: null }).success).toBe(true);
  });

  it('exige userAgent presente, ainda que nulo, e current booleano', () => {
    const { userAgent: _omitido, ...semAgente } = sessao;
    expect(sessionSummarySchema.safeParse(semAgente).success).toBe(false);
    expect(sessionSummarySchema.safeParse({ ...sessao, current: 'sim' }).success).toBe(false);
  });
});

describe('acceptedSchema (A-A2)', () => {
  it('aceita apenas accepted igual a true', () => {
    expect(acceptedSchema.parse({ accepted: true })).toEqual({ accepted: true });
    expect(acceptedSchema.safeParse({ accepted: false }).success).toBe(false);
    expect(acceptedSchema.safeParse({}).success).toBe(false);
  });
});
