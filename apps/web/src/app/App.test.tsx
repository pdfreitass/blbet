import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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

    // Na grelha só existe o indicador de favorito; os filtros ficam fora dela.
    const grelha = container.querySelector('main ul');
    expect(grelha?.querySelectorAll('a, input, select, [role="button"]')).toHaveLength(0);

    for (const botao of grelha?.querySelectorAll('button') ?? []) {
      expect(botao.getAttribute('aria-label')).toContain('favoritos');
    }
  });

  it('nenhuma tela do protótipo expõe controle de aposta (RN-001, CA-003.3)', () => {
    const { container } = render(<App />);

    // Em esportes, os únicos controles do conteúdo são os indicadores de favorito,
    // um por evento. Nenhum outro botão, nenhuma ligação, nada sobre uma odd.
    const main = container.querySelector('main');
    expect(main?.querySelectorAll('a, input, select, [role="button"]')).toHaveLength(0);

    for (const botao of main?.querySelectorAll('button') ?? []) {
      expect(botao.getAttribute('aria-label')).toContain('favoritos');
    }
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

describe('App — favoritos (RF-006)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('marca um evento e ele aparece na visualização de favoritos', () => {
    render(<App />);

    const marcar = screen.getByRole('button', {
      name: 'Adicionar Atlético Exemplo contra Clube Protótipo aos favoritos',
    });
    fireEvent.click(marcar);

    // CA-006.1: o indicador muda na hora.
    expect(
      screen.getByRole('button', {
        name: 'Remover Atlético Exemplo contra Clube Protótipo dos favoritos',
        pressed: true,
      }),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Favoritos/ }));

    expect(screen.getByRole('heading', { name: 'Eventos' })).toBeTruthy();
    expect(screen.getByLabelText('Atlético Exemplo contra Clube Protótipo')).toBeTruthy();
  });

  it('desmarcar remove o item da visualização de favoritos (CA-006.3)', () => {
    render(<App />);

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Adicionar Atlético Exemplo contra Clube Protótipo aos favoritos',
      }),
    );
    fireEvent.click(screen.getByRole('button', { name: /Favoritos/ }));
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Remover Atlético Exemplo contra Clube Protótipo dos favoritos',
      }),
    );

    expect(screen.getByText('Ainda não há favoritos')).toBeTruthy();
  });

  it('sem favoritos, a visualização explica-se (CA-006.4)', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Favoritos/ }));

    expect(screen.getByText('Ainda não há favoritos')).toBeTruthy();
  });

  it('os favoritos sobrevivem a recarregar a página (CA-006.2)', () => {
    const primeira = render(<App />);
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Adicionar Atlético Exemplo contra Clube Protótipo aos favoritos',
      }),
    );
    primeira.unmount();

    // Montar de novo é o equivalente a recarregar: o estado vem do armazenamento.
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Favoritos/ }));

    expect(screen.getByLabelText('Atlético Exemplo contra Clube Protótipo')).toBeTruthy();
  });

  it('marca um jogo do cassino e ele aparece nos favoritos', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Cassino/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar Rolos de Exemplo aos favoritos' }));
    fireEvent.click(screen.getByRole('button', { name: /Favoritos/ }));

    expect(screen.getByRole('heading', { name: 'Jogos' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Rolos de Exemplo' })).toBeTruthy();
  });
});

describe('App — armazenamento local indisponível (CA-006.5)', () => {
  beforeEach(() => {
    // Janela privada, política do navegador, quota cheia: nada disto é defeito, e
    // nada disto pode quebrar a aplicação nem mostrar erro técnico ao utilizador.
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('acesso negado', 'SecurityError');
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('a aplicação continua navegável', () => {
    render(<App />);

    expect(screen.getByLabelText('Atlético Exemplo contra Clube Protótipo')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Cassino/ }));
    expect(screen.getByRole('heading', { name: 'Rolos de Exemplo' })).toBeTruthy();
  });

  it('não desenha indicadores de favorito que não guardariam nada', () => {
    const { container } = render(<App />);

    const favoritos = [...(container.querySelectorAll('main button') ?? [])].filter((botao) =>
      botao.getAttribute('aria-label')?.includes('favoritos'),
    );

    expect(favoritos).toHaveLength(0);
  });

  it('não mostra erro técnico em lado nenhum', () => {
    const { container } = render(<App />);

    expect(screen.queryByRole('alert')).toBeNull();
    expect(container.textContent).not.toContain('SecurityError');
    expect(container.textContent).not.toContain('localStorage');
  });

  it('a visualização de favoritos explica-se em vez de ficar vazia sem razão', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Favoritos/ }));

    expect(screen.getByText('Favoritos indisponíveis neste navegador')).toBeTruthy();
  });
});
