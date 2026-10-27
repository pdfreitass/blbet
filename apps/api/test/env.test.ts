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
