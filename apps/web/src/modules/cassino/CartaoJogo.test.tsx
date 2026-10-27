import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderizar } from '../../test/render';

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
    renderizar(<CartaoJogo jogo={JOGO} />);

    expect(screen.getByRole('heading', { name: 'Rolos de Exemplo' })).toBeTruthy();
    expect(screen.getByText('Slots')).toBeTruthy();
  });

  /*
   * A salvaguarda de RN-004 e CA-004.4: o cartão é leitura. O único controle que o
   * design-system autoriza aqui é o indicador de favorito (secção 9.4); qualquer
   * outro, ou uma ligação, faz este teste falhar.
   */
  it('não contém controle nenhum além do indicador de favorito', () => {
    const { container } = renderizar(<CartaoJogo jogo={JOGO} />);

    expect(container.querySelectorAll('a, input, select, [role="button"]')).toHaveLength(0);

    const botoes = [...container.querySelectorAll('button')];
    expect(botoes).toHaveLength(1);
    expect(botoes[0]?.getAttribute('aria-label')).toContain('favoritos');
  });

  it('reserva o espaço da imagem antes de haver imagem, para não deslocar o layout', () => {
    const { container } = renderizar(<CartaoJogo jogo={JOGO} />);
    const espaco = container.querySelector('[aria-hidden="true"]')?.parentElement;

    expect(espaco).not.toBeNull();
  });

  it('esconde a sigla do leitor de tela: o nome está logo abaixo em texto', () => {
    const { container } = renderizar(<CartaoJogo jogo={JOGO} />);

    expect(container.querySelector('[aria-hidden="true"]')?.textContent).toBe('RO');
  });
});
