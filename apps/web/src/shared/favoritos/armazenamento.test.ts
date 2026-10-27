import { afterEach, describe, expect, it, vi } from 'vitest';

import { chaveDe, guardarFavoritos, lerFavoritos } from './armazenamento';

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe('chaveDe', () => {
  it('compõe tipo e id', () => {
    expect(chaveDe('evento', 'evt-1')).toBe('evento:evt-1');
  });

  it('aceita um id com dois-pontos, porque o id é texto opaco (PC-004)', () => {
    // O id vem do provedor e não se pode assumir que não tem o separador.
    expect(chaveDe('jogo', 'a:b')).toBe('jogo:a:b');
  });
});

describe('lerFavoritos', () => {
  it('devolve vazio e disponível quando nunca se guardou nada', () => {
    expect(lerFavoritos()).toEqual({ chaves: [], disponivel: true });
  });

  it('lê o que foi guardado', () => {
    guardarFavoritos(['evento:evt-1', 'jogo:jog-2']);

    expect(lerFavoritos().chaves).toEqual(['evento:evt-1', 'jogo:jog-2']);
  });

  it('ignora conteúdo que não é uma lista, sem falhar', () => {
    window.localStorage.setItem('blbet:favoritos', '{"isto":"não é uma lista"}');

    expect(lerFavoritos()).toEqual({ chaves: [], disponivel: true });
  });

  it('ignora JSON inválido, sem falhar', () => {
    window.localStorage.setItem('blbet:favoritos', 'isto não é json');

    expect(lerFavoritos().chaves).toEqual([]);
  });

  it('filtra as entradas com forma inesperada e mantém as boas', () => {
    window.localStorage.setItem(
      'blbet:favoritos',
      JSON.stringify(['evento:evt-1', 42, null, 'tipo-errado:x', ':sem-tipo', 'jogo:', 'jogo:ok']),
    );

    expect(lerFavoritos().chaves).toEqual(['evento:evt-1', 'jogo:ok']);
  });

  /*
   * CA-006.5 e o ponto mais importante deste módulo: o armazenamento pode estar
   * bloqueado por razões que não são defeito nenhum — janela privada, política do
   * navegador, quota cheia. Nada disso pode quebrar a interface.
   */
  it('devolve indisponível, sem lançar, quando a leitura é recusada', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('acesso negado', 'SecurityError');
    });

    expect(() => lerFavoritos()).not.toThrow();
    expect(lerFavoritos()).toEqual({ chaves: [], disponivel: false });
  });
});

describe('guardarFavoritos', () => {
  it('devolve true quando consegue guardar', () => {
    expect(guardarFavoritos(['evento:evt-1'])).toBe(true);
  });

  it('devolve false, sem lançar, quando a escrita é recusada', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota excedida', 'QuotaExceededError');
    });

    expect(() => guardarFavoritos(['evento:evt-1'])).not.toThrow();
    expect(guardarFavoritos(['evento:evt-1'])).toBe(false);
  });
});
