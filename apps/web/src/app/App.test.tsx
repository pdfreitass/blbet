import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from './App';

/*
 * A interação passa por fireEvent, e não por `elemento.click()`: o clique nativo fica
 * fora do `act` do React, e o re-render não acontece antes da asserção.
 */

describe('App', () => {
  it('declara permanentemente que a plataforma é demonstrativa (CA-001.4)', () => {
    render(<App />);

    expect(screen.getByText('Plataforma demonstrativa.')).toBeTruthy();
    expect(screen.getByText(/Não há apostas, depósitos, saques nem pagamentos/)).toBeTruthy();
  });

  it('não oferece como dispensar essa declaração', () => {
    render(<App />);

    const faixa = screen.getByLabelText('Natureza da plataforma');

    expect(faixa.querySelectorAll('button')).toHaveLength(0);
  });

  it('abre em esportes, com os cinco destinos de RF-001 presentes', () => {
    render(<App />);

    const navegacao = screen.getByRole('navigation', { name: 'Navegação principal' });

    expect(navegacao.querySelectorAll('button')).toHaveLength(5);
    expect(screen.getByRole('button', { current: 'page' }).textContent).toContain('Esportes');
  });

  it('mostra os eventos demonstrativos no destino inicial', () => {
    render(<App />);

    // Pelo nome acessível do cartão: o nome do participante repete-se como opção de
    // mercado, e procurá-lo por texto encontraria os dois.
    expect(screen.getByLabelText('Atlético Exemplo contra Clube Protótipo')).toBeTruthy();
    expect(screen.getByText('Copa Fictícia de Demonstração')).toBeTruthy();
  });

  it('navega entre destinos e marca o ativo', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Cassino/ }));

    expect(screen.getByRole('button', { current: 'page' }).textContent).toContain('Cassino');
    expect(screen.getByRole('heading', { name: 'Rolos de Exemplo' })).toBeTruthy();
  });

  it('o catálogo do cassino não expõe nenhuma forma de jogar (RN-004, CA-004.4)', () => {
    const { container } = render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Cassino/ }));

    // Os únicos controles do conteúdo são os filtros de categoria, fora da grelha.
    const grelha = container.querySelector('main ul');
    expect(grelha?.querySelectorAll('a, button, input, [role="button"]')).toHaveLength(0);
  });

  it('nenhuma tela do protótipo expõe controle de aposta (RN-001, CA-003.3)', () => {
    const { container } = render(<App />);

    // O conteúdo de esportes não tem um único controle: a navegação está fora do
    // <main> e a busca só existe no seu próprio destino.
    expect(container.querySelector('main')?.querySelectorAll('button')).toHaveLength(0);
  });
});

describe('App — busca', () => {
  function irParaBusca(): HTMLInputElement {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Busca/ }));

    return screen.getByLabelText('Buscar');
  }

  it('mostra nada encontrado, com o critério, quando o termo não corresponde', () => {
    fireEvent.change(irParaBusca(), { target: { value: 'zzzz' } });

    expect(screen.getByText('Nada encontrado')).toBeTruthy();
    expect(screen.getByText('“zzzz”')).toBeTruthy();
    expect(screen.getByText('Nenhum resultado.')).toBeTruthy();
  });

  it('filtra os eventos quando o termo corresponde', () => {
    fireEvent.change(irParaBusca(), { target: { value: 'basquete' } });

    expect(screen.getByLabelText('Esboço Basquete Clube contra Rascunho Esportivo')).toBeTruthy();
    expect(screen.queryByLabelText('Atlético Exemplo contra Clube Protótipo')).toBeNull();
  });

  it('a saída de nada encontrado limpa a busca e devolve a lista', () => {
    fireEvent.change(irParaBusca(), { target: { value: 'zzzz' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ver todos os eventos' }));

    expect(screen.queryByText('Nada encontrado')).toBeNull();
    expect(screen.getByLabelText('Atlético Exemplo contra Clube Protótipo')).toBeTruthy();
  });
});
