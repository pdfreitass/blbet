import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { erroDaApi, EVENTO_COMPLETO, EVENTO_SEM_MERCADOS } from '../../test/fixtures';
import { instalarServidorFalso, responderSempre } from '../../test/servidorFalso';
import { obterEventos } from './esportes';
import { useListaPaginada } from './useListaPaginada';

afterEach(() => {
  vi.unstubAllGlobals();
});

/** Componente mínimo que expõe o estado do hook no DOM. */
function Lista({ termo = '' }: { termo?: string }) {
  const lista = useListaPaginada(
    (cursor, opcoes) =>
      obterEventos({ ...(termo === '' ? {} : { q: termo }), ...(cursor === undefined ? {} : { cursor }) }, opcoes),
    [termo],
  );

  return (
    <div>
      <span data-testid="estado">
        {lista.carregando ? 'a-carregar' : lista.falha !== null ? 'falhou' : 'pronto'}
      </span>
      <span data-testid="ids">{lista.itens.map((evento) => evento.id).join(',')}</span>
      <span data-testid="mais">{lista.carregarMais === null ? 'fim' : 'ha-mais'}</span>
      <span data-testid="falha-mais">{lista.falhaAoCarregarMais?.codigo ?? ''}</span>
      {lista.carregarMais !== null ? (
        <button type="button" onClick={lista.carregarMais}>
          Carregar mais
        </button>
      ) : null}
    </div>
  );
}

function pagina(ids: readonly string[], nextCursor: string | null) {
  const porId = { 'evt-1': EVENTO_COMPLETO, 'evt-2': EVENTO_SEM_MERCADOS } as const;

  return {
    data: ids.map((id) => porId[id as keyof typeof porId]),
    meta: { nextCursor },
  };
}

describe('useListaPaginada', () => {
  it('carrega a primeira página e indica que há mais', async () => {
    responderSempre(200, pagina(['evt-1'], 'cursor-2'));
    render(<Lista />);

    await waitFor(() => expect(screen.getByTestId('estado').textContent).toBe('pronto'));

    expect(screen.getByTestId('ids').textContent).toBe('evt-1');
    expect(screen.getByTestId('mais').textContent).toBe('ha-mais');
  });

  it('não oferece carregar mais quando o cursor vem nulo', async () => {
    responderSempre(200, pagina(['evt-1'], null));
    render(<Lista />);

    await waitFor(() => expect(screen.getByTestId('mais').textContent).toBe('fim'));
  });

  it('acumula as páginas em vez de substituir a lista', async () => {
    instalarServidorFalso((url) =>
      url.includes('cursor=cursor-2')
        ? { estado: 200, corpo: pagina(['evt-2'], null) }
        : { estado: 200, corpo: pagina(['evt-1'], 'cursor-2') },
    );
    render(<Lista />);

    await waitFor(() => expect(screen.getByTestId('ids').textContent).toBe('evt-1'));
    act(() => screen.getByRole('button', { name: 'Carregar mais' }).click());

    await waitFor(() => expect(screen.getByTestId('ids').textContent).toBe('evt-1,evt-2'));
    expect(screen.getByTestId('mais').textContent).toBe('fim');
  });

  it('envia o cursor da página anterior', async () => {
    const pedidos: string[] = [];
    instalarServidorFalso((url) => {
      pedidos.push(url);
      return url.includes('cursor=')
        ? { estado: 200, corpo: pagina(['evt-2'], null) }
        : { estado: 200, corpo: pagina(['evt-1'], 'cursor-2') };
    });
    render(<Lista />);

    await waitFor(() => expect(screen.getByTestId('ids').textContent).toBe('evt-1'));
    act(() => screen.getByRole('button', { name: 'Carregar mais' }).click());

    await waitFor(() => expect(pedidos.some((url) => url.includes('cursor=cursor-2'))).toBe(true));
    // A primeira página não leva cursor nenhum.
    expect(pedidos[0]).not.toContain('cursor=');
  });

  /*
   * Falhar a carregar MAIS não pode apagar o que já está na tela: quem leu metade da
   * lista continua a poder lê-la.
   */
  it('mantém os itens já carregados quando a página seguinte falha', async () => {
    let primeira = true;
    instalarServidorFalso(() => {
      if (primeira) {
        primeira = false;
        return { estado: 200, corpo: pagina(['evt-1'], 'cursor-2') };
      }
      return { estado: 503, corpo: erroDaApi('UPSTREAM_UNAVAILABLE', true) };
    });
    render(<Lista />);

    await waitFor(() => expect(screen.getByTestId('ids').textContent).toBe('evt-1'));
    act(() => screen.getByRole('button', { name: 'Carregar mais' }).click());

    await waitFor(() =>
      expect(screen.getByTestId('falha-mais').textContent).toBe('UPSTREAM_UNAVAILABLE'),
    );
    expect(screen.getByTestId('ids').textContent).toBe('evt-1');
    expect(screen.getByTestId('estado').textContent).toBe('pronto');
  });

  /*
   * A6: um cursor obsoleto dá VALIDATION_FAILED com issue invalid_cursor. Dizer "o
   * pedido não é válido" a quem só carregou num botão seria incompreensível — a lista
   * recomeça, que é o que a pessoa faria à mão.
   */
  it('recomeça a lista quando o cursor ficou obsoleto, sem mostrar erro', async () => {
    let fase = 0;
    instalarServidorFalso(() => {
      fase += 1;

      if (fase === 2) {
        return {
          estado: 400,
          corpo: erroDaApi('VALIDATION_FAILED', false, [
            { field: 'query.cursor', issue: 'invalid_cursor' },
          ]),
        };
      }

      return { estado: 200, corpo: pagina(['evt-1'], 'cursor-2') };
    });
    render(<Lista />);

    await waitFor(() => expect(screen.getByTestId('ids').textContent).toBe('evt-1'));
    act(() => screen.getByRole('button', { name: 'Carregar mais' }).click());

    // Recomeçou: a lista volta à primeira página e não há falha para mostrar.
    await waitFor(() => expect(fase).toBeGreaterThanOrEqual(3));
    expect(screen.getByTestId('falha-mais').textContent).toBe('');
    expect(screen.getByTestId('ids').textContent).toBe('evt-1');
  });

  it('recomeça do princípio quando o termo de busca muda', async () => {
    const pedidos: string[] = [];
    instalarServidorFalso((url) => {
      pedidos.push(url);
      return { estado: 200, corpo: pagina(['evt-1'], 'cursor-2') };
    });

    const { rerender } = render(<Lista termo="" />);
    await waitFor(() => expect(screen.getByTestId('ids').textContent).toBe('evt-1'));

    rerender(<Lista termo="arsenal" />);

    await waitFor(() => expect(pedidos.some((url) => url.includes('q=arsenal'))).toBe(true));
    // O pedido do novo termo não leva o cursor do termo antigo.
    const comTermo = pedidos.filter((url) => url.includes('q=arsenal'));
    expect(comTermo.every((url) => !url.includes('cursor='))).toBe(true);
  });

  it('a falha da primeira página é a falha da lista, e não do rodapé', async () => {
    responderSempre(503, erroDaApi('UPSTREAM_UNAVAILABLE', true));
    render(<Lista />);

    await waitFor(() => expect(screen.getByTestId('estado').textContent).toBe('falhou'));
    expect(screen.getByTestId('falha-mais').textContent).toBe('');
  });
});
