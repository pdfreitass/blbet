import { describe, expect, it } from 'vitest';
import { InvalidEnvError, loadConfig } from '../src/config/env.js';

describe('loadConfig', () => {
  it('aplica os valores por omissão quando nada está definido', () => {
    const config = loadConfig({});

    expect(config).toEqual({ NODE_ENV: 'development', HOST: '127.0.0.1', PORT: 3333, LOG_LEVEL: 'info' });
    expect(Object.isFrozen(config)).toBe(true);
  });

  it('converte PORT para número', () => {
    expect(loadConfig({ PORT: '8080' }).PORT).toBe(8080);
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
