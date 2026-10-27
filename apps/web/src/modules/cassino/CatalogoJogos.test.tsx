import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CatalogoJogos } from './CatalogoJogos';
import type { JogoDemonstrativo } from './tipos';

const JOGOS: readonly JogoDemonstrativo[] = [
  { id: 'a', nome: 'Rolos de Exemplo', categoria: 'slots', origin: 'demo' },
  { id: 'b', nome: 'Roleta Maquete', categoria: 'mesa', origin: 'demo' },
];

describe('CatalogoJogos', () => {
  it('mostra todos os jogos sem filtro', () => {
    render(<CatalogoJogos jogos={JOGOS} />);

    expect(screen.getByRole('heading', { name: 'Rolos de Exemplo' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Roleta Maquete' })).toBeTruthy();
  });

  it('filtra por categoria e marca o filtro ativo', () => {
    render(<CatalogoJogos jogos={JOGOS} />);

    fireEvent.click(screen.getByRole('button', { name: 'Mesa' }));

    expect(screen.getByRole('button', { name: 'Mesa', pressed: true })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Roleta Maquete' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Rolos de Exemplo' })).toBeNull();
  });

  it('carregar de novo na categoria ativa remove o filtro', () => {
    render(<CatalogoJogos jogos={JOGOS} />);

    fireEvent.click(screen.getByRole('button', { name: 'Mesa' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mesa' }));

    expect(screen.getByRole('button', { name: 'Mesa', pressed: false })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Rolos de Exemplo' })).toBeTruthy();
  });

  it('categoria válida sem jogos dá lista vazia com saída, não erro (regra A7)', () => {
    render(<CatalogoJogos jogos={JOGOS} />);

    fireEvent.click(screen.getByRole('button', { name: 'Cartas' }));

    expect(screen.getByText('Nada encontrado')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Ver todos os jogos' }));

    expect(screen.getByRole('heading', { name: 'Rolos de Exemplo' })).toBeTruthy();
  });

  it('catálogo vazio na origem usa o estado de nada cadastrado, não o de nada encontrado', () => {
    render(<CatalogoJogos jogos={[]} />);

    expect(screen.getByText('Ainda não há jogos')).toBeTruthy();
    expect(screen.queryByText('Nada encontrado')).toBeNull();
  });

  it('nenhum cartão da grelha é operável (RN-004, CA-004.4)', () => {
    const { container } = render(<CatalogoJogos jogos={JOGOS} />);
    const grelha = container.querySelector('ul');

    expect(grelha?.querySelectorAll('a, button, input, [role="button"]')).toHaveLength(0);
  });
});
