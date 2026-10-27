import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderizar } from '../../test/render';
import { Perfil } from './Perfil';

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe('Perfil', () => {
  it('mostra os campos da conta demonstrativa', () => {
    renderizar(<Perfil />);

    expect(screen.getByText('Visitante de demonstração')).toBeTruthy();
    expect(screen.getByText('Identificador')).toBeTruthy();
    expect(screen.getByText('demo-0001')).toBeTruthy();
  });

  /* CA-007.2 — todo o dado exibido é fictício e identificado como tal. */
  it('marca cada campo da conta como demonstrativo, também para leitor de tela', () => {
    const { container } = renderizar(<Perfil />);

    const campos = container.querySelectorAll('dl [class*="campo"] dd');

    for (const campo of container.querySelectorAll('section[aria-labelledby="perfil-conta"] dd')) {
      expect(campo.textContent).toContain('valor demonstrativo');
    }

    expect(campos.length).toBeGreaterThan(0);
  });

  it('identifica a conta como demonstrativa já no cabeçalho', () => {
    renderizar(<Perfil />);

    expect(screen.getByText('Conta demonstrativa')).toBeTruthy();
  });

  /*
   * CA-007.3 e CA-007.4 são o centro desta tela. Os dois testes seguintes falham se
   * alguém acrescentar um controle ou um campo de entrada ao perfil.
   */
  it('não oferece ação nenhuma: sem botões e sem ligações (CA-007.3)', () => {
    const { container } = renderizar(<Perfil />);

    expect(container.querySelectorAll('a, button, [role="button"]')).toHaveLength(0);
  });

  it('não tem campo que recolha dado pessoal (CA-007.4)', () => {
    const { container } = renderizar(<Perfil />);

    expect(container.querySelectorAll('input, textarea, select, form, [contenteditable]')).toHaveLength(
      0,
    );
  });

  it('diz o que a plataforma não faz, em vez de ficar calada', () => {
    renderizar(<Perfil />);

    expect(screen.getByText('Depósito, saque ou qualquer pagamento')).toBeTruthy();
    expect(screen.getByText('Verificação de identidade ou envio de documentos')).toBeTruthy();
    expect(screen.getByText('Apostas, cupons ou bilhetes')).toBeTruthy();
  });

  /*
   * PD-006 continua em aberto: campos exatos do perfil e se exibe saldo fictício.
   * Inventar um saldo seria decidir por omissão, e este teste trava isso.
   */
  it('não inventa saldo nem histórico, que a PD-006 ainda não definiu', () => {
    const { container } = renderizar(<Perfil />);
    const texto = container.textContent ?? '';

    expect(texto).not.toContain('Saldo:');
    expect(texto).not.toContain('R$');
    expect(texto).not.toContain('Histórico de');
  });

  it('mostra a contagem de favoritos sem a marcar como fictícia', () => {
    renderizar(<Perfil />);

    const seccao = screen.getByText('Favoritos guardados').closest('div');

    expect(seccao?.textContent).not.toContain('valor demonstrativo');
  });

  it('esconde a secção da interface quando o armazenamento local não responde', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('acesso negado', 'SecurityError');
    });

    renderizar(<Perfil />);

    expect(screen.queryByText('Favoritos guardados')).toBeNull();
    // E a tela continua útil: o resto do perfil está lá.
    expect(screen.getByText('demo-0001')).toBeTruthy();
  });
});
