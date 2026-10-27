import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CartaoJogo } from './CartaoJogo';
import type { JogoDemonstrativo } from './tipos';

const JOGO: JogoDemonstrativo = {
  id: 'jog-teste',
  nome: 'Rolos de Exemplo',
  categoria: 'slots',
  origin: 'demo',
};

describe('CartaoJogo', () => {
  it('mostra o nome e a categoria', () => {
    render(<CartaoJogo jogo={JOGO} />);

    expect(screen.getByRole('heading', { name: 'Rolos de Exemplo' })).toBeTruthy();
    expect(screen.getByText('Slots')).toBeTruthy();
  });

  /*
   * A salvaguarda de RN-004 e CA-004.4: o cartão é leitura. Se alguém lhe acrescentar
   * uma afordância de jogar, este teste falha.
   */
  it('não contém nenhum controle nem ligação', () => {
    const { container } = render(<CartaoJogo jogo={JOGO} />);

    expect(container.querySelectorAll('a, button, input, [role="button"]')).toHaveLength(0);
  });

  it('reserva o espaço da imagem antes de haver imagem, para não deslocar o layout', () => {
    const { container } = render(<CartaoJogo jogo={JOGO} />);
    const espaco = container.querySelector('[aria-hidden="true"]')?.parentElement;

    expect(espaco).not.toBeNull();
  });

  it('esconde a sigla do leitor de tela: o nome está logo abaixo em texto', () => {
    const { container } = render(<CartaoJogo jogo={JOGO} />);

    expect(container.querySelector('[aria-hidden="true"]')?.textContent).toBe('RO');
  });
});
