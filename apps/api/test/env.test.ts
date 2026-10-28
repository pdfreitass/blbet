import { describe, expect, it } from 'vitest';
import { InvalidEnvError, loadConfig } from '../src/config/env.js';

describe('loadConfig', () => {
  it('aplica os valores por omissão quando nada está definido', () => {
    const config = loadConfig({});

    expect(config).toEqual({
      NODE_ENV: 'development',
      HOST: '127.0.0.1',
      PORT: 3333,
      LOG_LEVEL: 'info',
      SPORTS_PROVIDER_HOST: 'sportsbook-api2.p.rapidapi.com',
      SPORTS_PROVIDER_SOURCE: 'BET_PARX',
      SPORTS_COMPETITIONS: ['EPL', 'LA_LIGA', 'SERIE_A'],
      SPORTS_REFRESH_MINUTES: 60,
      SPORTS_MODE: 'live',
      RATE_LIMIT_MAX: 300,
      RATE_LIMIT_WINDOW_SECONDS: 60,
      CORS_ORIGINS: [],
      BODY_LIMIT_BYTES: 65_536,
      SESSION_COOKIE_NAME: 'blbet_session',
      SESSION_IDLE_MINUTES: 60,
      SESSION_ABSOLUTE_HOURS: 168,
      AUTH_REQUIRE_VERIFIED_EMAIL: true,
      AUTH_MAX_FAILURES_PER_ACCOUNT: 5,
      AUTH_MAX_FAILURES_PER_IP: 20,
      AUTH_FAILURE_WINDOW_MINUTES: 15,
      AUTH_RATE_LIMIT_MAX: 10,
      EMAIL_VERIFICATION_TTL_HOURS: 24,
      PASSWORD_RESET_TTL_MINUTES: 30,
      PUBLIC_URL: 'http://127.0.0.1:5173',
    });
    expect(Object.isFrozen(config)).toBe(true);
  });

  it('converte PORT para número', () => {
    expect(loadConfig({ PORT: '8080' }).PORT).toBe(8080);
  });

  it('trata variáveis vazias do .env como ausentes (chave do provedor opcional)', () => {
    const config = loadConfig({ SPORTS_PROVIDER_API_KEY: '', SPORTS_PROVIDER_HOST: '' });
    expect(config.SPORTS_PROVIDER_API_KEY).toBeUndefined();
    expect(config.SPORTS_PROVIDER_HOST).toBe('sportsbook-api2.p.rapidapi.com');
  });

  it('lê a lista de competições separada por vírgulas e o intervalo em minutos (DT-012)', () => {
    const config = loadConfig({ SPORTS_COMPETITIONS: ' EPL , NBA ', SPORTS_REFRESH_MINUTES: '15' });
    expect(config.SPORTS_COMPETITIONS).toEqual(['EPL', 'NBA']);
    expect(config.SPORTS_REFRESH_MINUTES).toBe(15);
    expect(() => loadConfig({ SPORTS_REFRESH_MINUTES: '0' })).toThrow(InvalidEnvError);
  });

  it('aceita o modo de teste e o instante do relógio (DT-018)', () => {
    const config = loadConfig({ SPORTS_MODE: 'recorded', SPORTS_NOW: '2026-11-01T17:00:00.000Z' });
    expect(config.SPORTS_MODE).toBe('recorded');
    expect(config.SPORTS_NOW).toBe('2026-11-01T17:00:00.000Z');
    expect(() => loadConfig({ SPORTS_MODE: 'gravado' })).toThrow(InvalidEnvError);
    expect(() => loadConfig({ SPORTS_NOW: '1 de novembro' })).toThrow(InvalidEnvError);
  });

  it('exige o segredo dos resumos de IP quando há base de dados (DT-020)', () => {
    expect(() => loadConfig({ DATABASE_FILE: 'blbet.db' })).toThrow(InvalidEnvError);

    const config = loadConfig({ DATABASE_FILE: 'blbet.db', AUTH_IP_HASH_SECRET: 'x'.repeat(32) });
    expect(config.DATABASE_FILE).toBe('blbet.db');
    // Curto de mais é tão mau como ausente.
    expect(() => loadConfig({ DATABASE_FILE: 'blbet.db', AUTH_IP_HASH_SECRET: 'curto' })).toThrow(InvalidEnvError);
  });

  it('não deixa produção arrancar com as proteções desligadas (DT-020)', () => {
    const base = { NODE_ENV: 'production', DATABASE_FILE: 'blbet.db', AUTH_IP_HASH_SECRET: 'x'.repeat(32) };

    expect(() => loadConfig({ ...base, COOKIE_SECURE: 'false' })).toThrow(InvalidEnvError);
    expect(() => loadConfig({ ...base, RATE_LIMIT_MAX: '0' })).toThrow(InvalidEnvError);
    expect(() => loadConfig({ ...base, AUTH_RATE_LIMIT_MAX: '0' })).toThrow(InvalidEnvError);
    expect(() => loadConfig({ ...base, AUTH_REQUIRE_VERIFIED_EMAIL: 'false' })).toThrow(InvalidEnvError);
    // As mesmas variáveis fora de produção são legítimas: é assim que os E2E correm.
    expect(() => loadConfig({ ...base, NODE_ENV: 'test', RATE_LIMIT_MAX: '0', AUTH_RATE_LIMIT_MAX: '0' })).not.toThrow();
  });

  it('rejeita valores inválidos indicando só o nome da variável', () => {
    const secretLike = 'valor-que-nao-pode-aparecer';

    try {
      loadConfig({ PORT: secretLike, NODE_ENV: 'staging' });
      expect.unreachable('devia ter falhado');
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidEnvError);
      const invalid = error as InvalidEnvError;
      expect(invalid.variables).toEqual(expect.arrayContaining(['PORT', 'NODE_ENV']));
      expect(invalid.message).not.toContain(secretLike);
    }
  });
});
