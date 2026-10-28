import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  COMPETICAO_EPL,
  erroDaApi,
  EVENTO_COMPLETO,
  paginaDeCompeticoes,
  paginaDeEventos,
} from '../../test/fixtures';
import type { RespostaFalsa } from '../../test/servidorFalso';
import { App } from '../../app/App';

/*
 * Filtro por competicao (`competitionId`, seccao 7.1 do contrato).
 *
 * `GET /api/competitions` estava implementada na api e documentada no contrato, e a
 * interface **nunca a chamava**: a funcao existia em `shared/api/esportes.ts` sem
 * nenhum consumidor. Estes testes cobrem o que isso passou a fazer.
 */

/** `fetch` com os pedidos registados, para verificar o que foi mesmo pedido. */
function espiarPedidos(encaminhar: (url: string) => RespostaFalsa) {
  const pedidos: string[] = [];

  vi.stubGlobal(
    'fetch',
    vi.fn((entrada: RequestInfo | URL) => {
      const url = typeof entrada === 'string' ? entrada : String(entrada);
      pedidos.push(url);

      const { estado, corpo } = encaminhar(url);

      return Promise.resolve(
        new Response(JSON.stringify(corpo), {
          status: estado,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }),
  );

  return pedidos;
}

function servidorComDuasCompeticoes(eventos = [EVENTO_COMPLETO]) {
  return espiarPedidos((url) =>
    url === '/api/competitions'
      ? { estado: 200, corpo: paginaDeCompeticoes() }
      : { estado: 200, corpo: paginaDeEventos(eventos) },
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  window.localStorage.clear();
});

describe('filtro por competição', () => {
  it('aparece com duas competições ou mais, com "todas" por omissão', async () => {
    servidorComDuasCompeticoes();
    render(<App />);

    const selecao = await screen.findByLabelText('Competição');

    expect((selecao as HTMLSelectElement).value).toBe('');
    expect(screen.getByRole('option', { name: 'Todas as competições' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'English Premier League' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Spanish La Liga' })).toBeTruthy();
  });

  /*
   * Com uma competicao so, um `select` de uma opcao nao filtra nada e sugere uma
   * escolha que nao existe -- e e exatamente o que a gravacao da api tem (DT-018).
   */
  it('não aparece com uma só competição', async () => {
    espiarPedidos((url) =>
      url === '/api/competitions'
        ? { estado: 200, corpo: paginaDeCompeticoes([COMPETICAO_EPL]) }
        : { estado: 200, corpo: paginaDeEventos() },
    );
    render(<App />);

    await screen.findByText('Newcastle United');
    expect(screen.queryByLabelText('Competição')).toBeNull();
  });

  it('escolher uma competição põe o filtro no endereço e no pedido (regra A7)', async () => {
    const pedidos = servidorComDuasCompeticoes();
    render(<App />);

    fireEvent.change(await screen.findByLabelText('Competição'), {
      target: { value: 'cmp-laliga' },
    });

    await waitFor(() => {
      expect(pedidos.some((url) => url.includes('competitionId=cmp-laliga'))).toBe(true);
    });

    expect(window.location.search).toContain('competitionId=cmp-laliga');
  });

  it('com filtro e sem resultados, mostra o critério e dá saída (CA-005.2, CA-005.4)', async () => {
    window.history.replaceState(null, '', '/?competitionId=cmp-laliga');
    servidorComDuasCompeticoes([]);
    render(<App />);

    // Texto distinto do conjunto vazio, como CA-008.3 exige.
    expect(await screen.findByText('Nada encontrado')).toBeTruthy();
    // O nome tambem esta na opcao do `select`: aqui interessa o do critério.
    expect(screen.getByText(/Nenhum resultado para/).textContent).toContain('Spanish La Liga');

    fireEvent.click(screen.getByRole('button', { name: 'Ver todas as competições' }));

    await waitFor(() => {
      expect(window.location.search).not.toContain('competitionId');
    });
  });

  /*
   * A listagem e o que importa na pagina; as competicoes sao um extra. Uma falha a
   * carregá-las nao pode levar a listagem com ela.
   */
  it('falhar a carregar as competições não estraga a listagem: o filtro desaparece', async () => {
    espiarPedidos((url) =>
      url === '/api/competitions'
        ? { estado: 503, corpo: erroDaApi('UPSTREAM_UNAVAILABLE', true) }
        : { estado: 200, corpo: paginaDeEventos() },
    );
    render(<App />);

    expect(await screen.findByText('Newcastle United')).toBeTruthy();
    expect(screen.queryByLabelText('Competição')).toBeNull();
    // Nenhum erro na tela: o que falhou não era o conteúdo da página.
    expect(screen.queryByText('Não foi possível carregar')).toBeNull();
  });

  /*
   * Um identificador que a lista nao tem — endereco guardado de uma competicao que
   * saiu do catalogo. O filtro tem de aparecer na mesma, ou nao ha como o desfazer.
   */
  it('com um filtro desconhecido no endereço, o controle aparece mesmo assim', async () => {
    window.history.replaceState(null, '', '/?competitionId=cmp-que-nao-existe');
    espiarPedidos((url) =>
      url === '/api/competitions'
        ? { estado: 200, corpo: paginaDeCompeticoes([COMPETICAO_EPL]) }
        : { estado: 200, corpo: paginaDeEventos([]) },
    );
    render(<App />);

    expect(await screen.findByLabelText('Competição')).toBeTruthy();
    expect(screen.getByText(/Nenhum resultado para/).textContent).toContain('cmp-que-nao-existe');
  });
});

describe('campo de busca: o teto do contrato', () => {
  /*
   * `q` tem máximo de 100 (`MAX_QUERY_LENGTH`). Sem isto, o 101.º caractere fazia a
   * api responder `VALIDATION_FAILED` e o utilizador lia "o pedido não é válido" por
   * ter escrito um nome comprido.
   */
  it('o campo não aceita mais do que os 100 caracteres que a api aceita', () => {
    espiarPedidos(() => ({ estado: 200, corpo: paginaDeEventos() }));
    window.history.replaceState(null, '', '/busca');
    render(<App />);

    expect(screen.getByLabelText('Buscar').getAttribute('maxlength')).toBe('100');
  });
});
