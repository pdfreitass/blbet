import { describe, expect, it } from 'vitest';

import type { FalhaApi } from '../../shared/api/erros';
import { mensagemDeConta } from './mensagens';
import { APOIO_SENHA, erroDeEmail, erroDeSenha } from './validacao';

function falha(parcial: Partial<FalhaApi> & Pick<FalhaApi, 'codigo'>): FalhaApi {
  return {
    retryable: false,
    mensagem: 'mensagem geral da aplicação',
    ...parcial,
  };
}

describe('mensagemDeConta', () => {
  /*
   * A-A4. O mesmo `429` que na listagem de jogos quer dizer "demasiados pedidos"
   * aqui quer dizer "demasiadas tentativas", e dispara com a senha certa.
   */
  it('trata o 429 como travão por tentativas, sem sugerir que os dados estão errados', () => {
    for (const contexto of ['entrada', 'cadastro', 'senha'] as const) {
      const texto = mensagemDeConta(falha({ codigo: 'RATE_LIMITED', retryable: true }), contexto);

      expect(texto).toContain('mesmo com os dados certos');
      expect(texto).not.toMatch(/incorret|errad/i);
    }
  });

  it('distingue o 401 da entrada do 401 das outras páginas', () => {
    expect(mensagemDeConta(falha({ codigo: 'UNAUTHENTICATED' }), 'entrada')).toBe(
      'E-mail ou senha incorretos.',
    );
    expect(mensagemDeConta(falha({ codigo: 'UNAUTHENTICATED' }), 'sessoes')).toContain(
      'sessão terminou',
    );
  });

  /*
   * O contrato devolve `UNAUTHENTICATED` tanto para "senha atual errada" como para
   * "sessão caducada". Enquanto for assim, o texto tem de servir os dois casos --
   * pendência registada no quadro.
   */
  it('na alteração de senha cobre os dois sentidos do 401 sem expulsar ninguém', () => {
    const texto = mensagemDeConta(falha({ codigo: 'UNAUTHENTICATED' }), 'senha');

    expect(texto).toContain('Confirme a senha atual');
    expect(texto).toContain('entre de novo');
  });

  it('explica o 403 da entrada como e-mail por confirmar, e não como senha errada', () => {
    const texto = mensagemDeConta(falha({ codigo: 'FORBIDDEN' }), 'entrada');

    expect(texto).toContain('não está confirmada');
    expect(mensagemDeConta(falha({ codigo: 'FORBIDDEN' }), 'sessoes')).toContain('não tem acesso');
  });

  it('reconhece o token gasto pelo issue do campo, não pelo texto técnico', () => {
    const tokenInvalido = falha({ codigo: 'VALIDATION_FAILED', issue: 'invalid_value' });

    expect(mensagemDeConta(tokenInvalido, 'verificacao')).toContain('já foi usada ou expirou');
    expect(mensagemDeConta(tokenInvalido, 'redefinicao')).toContain('recuperação já foi usada');
    // Noutro contexto não há leitura especial: vale a mensagem geral.
    expect(mensagemDeConta(tokenInvalido, 'cadastro')).toBe('mensagem geral da aplicação');
  });

  it('explica o 404 da revogação como dispositivo que já saiu da lista', () => {
    expect(mensagemDeConta(falha({ codigo: 'NOT_FOUND' }), 'sessoes')).toContain(
      'já não consta da lista',
    );
    expect(mensagemDeConta(falha({ codigo: 'NOT_FOUND' }), 'entrada')).toBe(
      'mensagem geral da aplicação',
    );
  });

  it('nos restantes casos devolve a mensagem geral, sem inventar texto', () => {
    expect(mensagemDeConta(falha({ codigo: 'SEM_LIGACAO', retryable: true }), 'entrada')).toBe(
      'mensagem geral da aplicação',
    );
  });
});

describe('validação local', () => {
  it('aceita o que o contrato aceita e recusa o que ele recusa', () => {
    expect(erroDeEmail('')).toBe('Indique o seu e-mail.');
    expect(erroDeEmail('isto-não-é-email')).toBe('Este e-mail não parece válido.');
    // A-A3: espaços à volta e maiúsculas são normalizados, não rejeitados.
    expect(erroDeEmail('  Pedro@Exemplo.PT ')).toBeUndefined();
  });

  it('não exige composição nenhuma na senha (A-A1)', () => {
    expect(erroDeSenha('')).toBe('Indique uma senha.');
    expect(erroDeSenha('abcdefg')).toBe('A senha tem de ter pelo menos 8 caracteres.');
    expect(erroDeSenha('abcdefgh')).toBeUndefined();
    expect(APOIO_SENHA).toContain('Não há exigência de maiúsculas');
  });
});
