import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { erroDaApi, EVENTO_COMPLETO, EVENTO_SEM_MERCADOS, paginaDeEventos } from '../test/fixtures';
import { instalarServidorFalso, responderSempre } from '../test/servidorFalso';
import { App } from './App';

const JOGO_DESCRICAO = 'Newcastle United contra Everton';

afterEach(() => {
  vi.unstubAllGlobals();
  window.localStorage.clear();
});

describe('App', () => {
  beforeEach(() => {
    responderSempre(200, paginaDeEventos([EVENTO_COMPLETO, EVENTO_SEM_MERCADOS]));
  });

  it('declara permanentemente a natureza da plataforma (CA-001.4)', () => {
    render(<App />);

    expect(screen.getByText('Plataforma demonstrativa.')).toBeTruthy();
    expect(screen.getByText(/Não há apostas, depósitos, saques nem pagamentos/)).toBeTruthy();
  });

  /*
   * A faixa deixou de dizer que "todos os valores são fictícios" quando entraram os
   * dados reais da T-015. Uma declaração falsa é pior do que declaração nenhuma.
   */
  it('não afirma que as cotações são fictícias, porque vêm de uma fonte real', () => {
    render(<App />);

    const faixa = screen.getByLabelText('Natureza da plataforma');

    expect(faixa.textContent).not.toContain('Todos os valores exibidos são fictícios');
    expect(faixa.textContent).toContain('fonte externa');
  });

  it('não oferece como dispensar essa declaração', () => {
    render(<App />);

    expect(screen.getByLabelText('Natureza da plataforma').querySelectorAll('button')).toHaveLength(
      0,
    );
  });

  it('abre em esportes, com os cinco destinos de RF-001 presentes', () => {
    render(<App />);

    const navegacao = screen.getByRole('navigation', { name: 'Navegação principal' });

    expect(navegacao.querySelectorAll('button')).toHaveLength(5);
    expect(screen.getByRole('button', { current: 'page' }).textContent).toContain('Esportes');
  });

  it('mostra o esqueleto enquanto carrega e anuncia o que está a carregar (CA-008.1)', () => {
    render(<App />);

    expect(screen.getByText('Carregando os jogos')).toBeTruthy();
  });

  it('mostra os jogos vindos da api, agrupados por competição (CA-002.1)', async () => {
    render(<App />);

    expect(await screen.findByLabelText(JOGO_DESCRICAO)).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'English Premier League' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Spanish La Liga' })).toBeTruthy();
  });

  it('mostra as cotações no formato do contrato, com vírgula', async () => {
    render(<App />);

    await screen.findByLabelText(JOGO_DESCRICAO);

    expect(screen.getByText('1,94')).toBeTruthy();
    expect(screen.getByText('3,60')).toBeTruthy();
  });

  /* A5: uma odd que a fonte não tem é `null`, e não um buraco na tela. */
  it('mostra indisponível na cotação que a fonte não tem', async () => {
    render(<App />);

    await screen.findByLabelText(JOGO_DESCRICAO);

    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });

  /*
   * Opção A da DIV-001: marca-se só o fictício. Uma cotação real não leva campo
   * tracejado nem o texto de "valor demonstrativo".
   */
  it('não marca como demonstrativo um dado que vem do provedor', async () => {
    render(<App />);

    await screen.findByLabelText(JOGO_DESCRICAO);

    expect(screen.queryByText(/valor demonstrativo/)).toBeNull();
  });

  it('um jogo distante sem cotações explica-se, em vez de parecer defeito', async () => {
    render(<App />);

    await screen.findByLabelText('Real Madrid contra Barcelona');

    expect(screen.getByText('Ainda não há cotações publicadas para este jogo.')).toBeTruthy();
  });

  it('ordena as linhas de mais/menos golos, que o contrato não garante ordenadas', async () => {
    render(<App />);

    await screen.findByLabelText(JOGO_DESCRICAO);

    const titulos = screen.getAllByRole('heading', { level: 4 }).map((titulo) => titulo.textContent);

    expect(titulos.indexOf('Mais/menos 2,50 gols')).toBeLessThan(
      titulos.indexOf('Mais/menos 3,50 gols'),
    );
  });

  it('nenhuma cotação é operável (RN-003, CA-003.3)', async () => {
    const { container } = render(<App />);

    await screen.findByLabelText(JOGO_DESCRICAO);

    for (const lista of container.querySelectorAll('dl')) {
      expect(lista.querySelectorAll('a, button, input, [role="button"], [disabled]')).toHaveLength(
        0,
      );
    }
  });
});

describe('App — falha da api (RF-008)', () => {
  /*
   * Sem a chave do provedor no apps/api/.env, as rotas respondem 503. É o estado em
   * que a aplicação vai estar na maior parte das máquinas, por isso tem de estar certo.
   */
  it('mostra erro compreensível e oferece repetir quando o servidor diz que é repetível', async () => {
    responderSempre(503, erroDaApi('UPSTREAM_UNAVAILABLE', true));
    render(<App />);

    const alerta = await screen.findByRole('alert');

    expect(alerta.textContent).toContain('Os dados esportivos estão indisponíveis neste momento.');
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeTruthy();
  });

  it('nenhum detalhe técnico chega à tela (RNF-004, CA-008.2, DIV-F01)', async () => {
    responderSempre(503, erroDaApi('UPSTREAM_UNAVAILABLE', true));
    const { container } = render(<App />);

    await screen.findByRole('alert');

    expect(container.textContent).not.toContain('upstream');
    expect(container.textContent).not.toContain('503');
    expect(container.textContent).not.toContain('UPSTREAM_UNAVAILABLE');
  });

  it('repetir volta a pedir à api', async () => {
    let pedidos = 0;
    instalarServidorFalso(() => {
      pedidos += 1;
      return { estado: 503, corpo: erroDaApi('UPSTREAM_UNAVAILABLE', true) };
    });
    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: 'Tentar novamente' }));

    await waitFor(() => expect(pedidos).toBeGreaterThan(1));
  });

  it('não oferece repetir quando o servidor diz que não vale a pena', async () => {
    responderSempre(400, erroDaApi('VALIDATION_FAILED', false));
    render(<App />);

    await screen.findByRole('alert');

    expect(screen.queryByRole('button', { name: 'Tentar novamente' })).toBeNull();
  });

  it('a aplicação continua navegável com a api em baixo', async () => {
    responderSempre(503, erroDaApi('UPSTREAM_UNAVAILABLE', true));
    render(<App />);

    await screen.findByRole('alert');
    fireEvent.click(screen.getByRole('button', { name: /Cassino/ }));

    // O cassino é demonstrativo e não depende da api.
    expect(screen.getByRole('heading', { name: 'Rolos de Exemplo' })).toBeTruthy();
  });
});

describe('App — busca', () => {
  it('pede à api com ?q= e mostra o resultado', async () => {
    const pedidos: string[] = [];
    instalarServidorFalso((url) => {
      pedidos.push(url);
      return {
        estado: 200,
        corpo: url.includes('q=') ? paginaDeEventos([EVENTO_COMPLETO]) : paginaDeEventos([]),
      };
    });
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Busca/ }));
    fireEvent.change(screen.getByLabelText('Buscar'), { target: { value: 'newcastle' } });

    expect(await screen.findByLabelText(JOGO_DESCRICAO)).toBeTruthy();
    expect(pedidos.some((url) => url.includes('q=newcastle'))).toBe(true);
  });

  it('termo sem correspondência dá lista vazia com saída, e não erro (regra A7)', async () => {
    responderSempre(200, paginaDeEventos([]));
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Busca/ }));
    fireEvent.change(screen.getByLabelText('Buscar'), { target: { value: 'zzzz' } });

    expect(await screen.findByText('Nada encontrado')).toBeTruthy();
    expect(screen.getByText('“zzzz”')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('junta as teclas de uma palavra num pedido só, por causa do limite diário', async () => {
    const pedidos: string[] = [];
    instalarServidorFalso((url) => {
      pedidos.push(url);
      return { estado: 200, corpo: paginaDeEventos([]) };
    });
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Busca/ }));
    const campo = screen.getByLabelText('Buscar');

    for (const valor of ['a', 'ar', 'ars', 'arse']) {
      fireEvent.change(campo, { target: { value: valor } });
    }

    await screen.findByText('Nada encontrado');

    const comTermo = pedidos.filter((url) => url.includes('q='));
    expect(comTermo).toHaveLength(1);
    expect(comTermo[0]).toContain('q=arse');
  });
});

describe('App — favoritos (RF-006)', () => {
  beforeEach(() => {
    responderSempre(200, paginaDeEventos([EVENTO_COMPLETO]));
  });

  it('marca um jogo esportivo e ele aparece na visualização de favoritos', async () => {
    render(<App />);

    fireEvent.click(
      await screen.findByRole('button', { name: `Adicionar ${JOGO_DESCRICAO} aos favoritos` }),
    );

    expect(
      screen.getByRole('button', { name: `Remover ${JOGO_DESCRICAO} dos favoritos`, pressed: true }),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Favoritos/ }));

    expect(await screen.findByRole('heading', { name: 'Jogos esportivos' })).toBeTruthy();
  });

  it('um favorito que já começou é explicado, em vez de desaparecer em silêncio', async () => {
    render(<App />);

    fireEvent.click(
      await screen.findByRole('button', { name: `Adicionar ${JOGO_DESCRICAO} aos favoritos` }),
    );

    // O jogo começou: a api deixa de o trazer na listagem (DT-010).
    responderSempre(200, paginaDeEventos([]));
    fireEvent.click(screen.getByRole('button', { name: /Favoritos/ }));

    expect(
      await screen.findByText('1 jogo favoritado já começou e deixou de estar disponível.'),
    ).toBeTruthy();
  });

  it('sem favoritos, a visualização explica-se (CA-006.4)', async () => {
    render(<App />);

    await screen.findByLabelText(JOGO_DESCRICAO);
    fireEvent.click(screen.getByRole('button', { name: /Favoritos/ }));

    expect(screen.getByText('Ainda não há favoritos')).toBeTruthy();
  });

  it('os favoritos sobrevivem a recarregar a página (CA-006.2)', async () => {
    const primeira = render(<App />);
    fireEvent.click(
      await screen.findByRole('button', { name: `Adicionar ${JOGO_DESCRICAO} aos favoritos` }),
    );
    primeira.unmount();

    render(<App />);

    expect(
      await screen.findByRole('button', { name: `Remover ${JOGO_DESCRICAO} dos favoritos` }),
    ).toBeTruthy();
  });

  it('marca um jogo do cassino e ele aparece nos favoritos', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Cassino/ }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Adicionar Rolos de Exemplo aos favoritos' }),
    );
    fireEvent.click(screen.getByRole('button', { name: /Favoritos/ }));

    expect(await screen.findByRole('heading', { name: 'Jogos de cassino' })).toBeTruthy();
  });
});

describe('App — armazenamento local indisponível (CA-006.5)', () => {
  beforeEach(() => {
    responderSempre(200, paginaDeEventos([EVENTO_COMPLETO]));
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('acesso negado', 'SecurityError');
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('a aplicação continua navegável', async () => {
    render(<App />);

    expect(await screen.findByLabelText(JOGO_DESCRICAO)).toBeTruthy();
  });

  it('não desenha indicadores de favorito que não guardariam nada', async () => {
    const { container } = render(<App />);

    await screen.findByLabelText(JOGO_DESCRICAO);

    const favoritos = [...container.querySelectorAll('main button')].filter((botao) =>
      botao.getAttribute('aria-label')?.includes('favoritos'),
    );

    expect(favoritos).toHaveLength(0);
  });

  it('não mostra erro técnico em lado nenhum', async () => {
    const { container } = render(<App />);

    await screen.findByLabelText(JOGO_DESCRICAO);

    expect(screen.queryByRole('alert')).toBeNull();
    expect(container.textContent).not.toContain('SecurityError');
  });
});

describe('App — perfil (RF-007)', () => {
  beforeEach(() => {
    responderSempre(200, paginaDeEventos([EVENTO_COMPLETO]));
  });

  it('o perfil é alcançável pela navegação principal (CA-007.1)', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Perfil/ }));

    expect(screen.getByRole('button', { current: 'page' }).textContent).toContain('Perfil');
    expect(screen.getByText('Visitante de demonstração')).toBeTruthy();
  });

  it('o perfil não expõe nenhuma operação financeira (CA-007.3)', () => {
    const { container } = render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Perfil/ }));

    // O conteúdo do perfil não tem controle nenhum; a navegação fica fora do <main>.
    expect(container.querySelectorAll('main a, main button, main input')).toHaveLength(0);
  });
});

describe('App — paginação por cursor (PC-008)', () => {
  it('oferece carregar mais quando a api diz que há mais página', async () => {
    responderSempre(200, {
      data: [EVENTO_COMPLETO],
      meta: { nextCursor: 'cursor-2' },
    });
    render(<App />);

    expect(await screen.findByRole('button', { name: 'Carregar mais jogos' })).toBeTruthy();
  });

  it('acrescenta a página seguinte à lista, sem substituir a primeira', async () => {
    instalarServidorFalso((url) =>
      url.includes('cursor=cursor-2')
        ? { estado: 200, corpo: { data: [EVENTO_SEM_MERCADOS], meta: { nextCursor: null } } }
        : { estado: 200, corpo: { data: [EVENTO_COMPLETO], meta: { nextCursor: 'cursor-2' } } },
    );
    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: 'Carregar mais jogos' }));

    expect(await screen.findByLabelText('Real Madrid contra Barcelona')).toBeTruthy();
    // A primeira página continua lá.
    expect(screen.getByLabelText(JOGO_DESCRICAO)).toBeTruthy();
  });

  it('diz que a lista acabou, em vez de terminar em silêncio', async () => {
    responderSempre(200, paginaDeEventos([EVENTO_COMPLETO]));
    render(<App />);

    await screen.findByLabelText(JOGO_DESCRICAO);

    expect(screen.getByText('Fim da lista de jogos.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Carregar mais/ })).toBeNull();
  });

  it('junta os eventos da segunda página ao grupo da competição que já estava', async () => {
    instalarServidorFalso((url) =>
      url.includes('cursor=cursor-2')
        ? { estado: 200, corpo: { data: [EVENTO_COMPLETO], meta: { nextCursor: null } } }
        : { estado: 200, corpo: { data: [EVENTO_COMPLETO], meta: { nextCursor: 'cursor-2' } } },
    );
    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: 'Carregar mais jogos' }));

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /Carregar mais/ })).toBeNull(),
    );

    // Um só cabeçalho de competição, apesar de os eventos virem de páginas diferentes
    // (DIV-F02: agrupa-se o que foi recebido).
    expect(screen.getAllByRole('heading', { name: 'English Premier League' })).toHaveLength(1);
  });
});
