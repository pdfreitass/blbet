import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { erroDaApi, EVENTO_COMPLETO, EVENTO_SEM_MERCADOS, paginaDeEventos } from '../test/fixtures';
import { limparCache } from '../shared/api/cache';
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

    expect(navegacao.querySelectorAll('a')).toHaveLength(5);
    expect(screen.getByRole('link', { current: 'page' }).textContent).toContain('Esportes');
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
    fireEvent.click(screen.getByRole('link', { name: /Cassino/ }));

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

    fireEvent.click(screen.getByRole('link', { name: /Busca/ }));
    fireEvent.change(screen.getByLabelText('Buscar'), { target: { value: 'newcastle' } });

    expect(await screen.findByLabelText(JOGO_DESCRICAO)).toBeTruthy();
    expect(pedidos.some((url) => url.includes('q=newcastle'))).toBe(true);
  });

  it('termo sem correspondência dá lista vazia com saída, e não erro (regra A7)', async () => {
    responderSempre(200, paginaDeEventos([]));
    render(<App />);

    fireEvent.click(screen.getByRole('link', { name: /Busca/ }));
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

    fireEvent.click(screen.getByRole('link', { name: /Busca/ }));
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

    fireEvent.click(screen.getByRole('link', { name: /Favoritos/ }));

    expect(await screen.findByRole('heading', { name: 'Jogos esportivos' })).toBeTruthy();
  });

  it('um favorito que já começou é explicado, em vez de desaparecer em silêncio', async () => {
    render(<App />);

    fireEvent.click(
      await screen.findByRole('button', { name: `Adicionar ${JOGO_DESCRICAO} aos favoritos` }),
    );

    // O jogo começou: a api deixa de o trazer na listagem (DT-010).
    // O cache de 30 s (DT-017) serviria a resposta anterior, por isso limpa-se —
    // é o equivalente a ter passado meio minuto entre marcar e abrir os favoritos.
    limparCache();
    responderSempre(200, paginaDeEventos([]));
    fireEvent.click(screen.getByRole('link', { name: /Favoritos/ }));

    expect(
      await screen.findByText('1 jogo favoritado já começou e deixou de estar disponível.'),
    ).toBeTruthy();
  });

  it('sem favoritos, a visualização explica-se (CA-006.4)', async () => {
    render(<App />);

    await screen.findByLabelText(JOGO_DESCRICAO);
    fireEvent.click(screen.getByRole('link', { name: /Favoritos/ }));

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

    fireEvent.click(screen.getByRole('link', { name: /Cassino/ }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Adicionar Rolos de Exemplo aos favoritos' }),
    );
    fireEvent.click(screen.getByRole('link', { name: /Favoritos/ }));

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

    fireEvent.click(screen.getByRole('link', { name: /Perfil/ }));

    expect(screen.getByRole('link', { current: 'page' }).textContent).toContain('Perfil');
    expect(screen.getByText('Visitante de demonstração')).toBeTruthy();
  });

  it('o perfil não expõe nenhuma operação financeira (CA-007.3)', () => {
    const { container } = render(<App />);

    fireEvent.click(screen.getByRole('link', { name: /Perfil/ }));

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

describe('App — rotas (DT-016)', () => {
  /** Abre a aplicação já num endereço, como quem chega por link ou recarrega. */
  function abrirEm(caminho: string) {
    window.history.replaceState(null, '', caminho);
    return render(<App />);
  }

  it('o endereço decide a tela: recarregar no cassino não volta aos esportes', () => {
    responderSempre(200, paginaDeEventos([EVENTO_COMPLETO]));
    abrirEm('/cassino');

    expect(screen.getByRole('heading', { name: 'Cassino', level: 1 })).toBeTruthy();
    expect(screen.getByRole('link', { current: 'page' }).textContent).toContain('Cassino');
  });

  it('a busca sobrevive a recarregar, porque o termo está no endereço', async () => {
    instalarServidorFalso((url) => ({
      estado: 200,
      corpo: url.includes('q=arsenal') ? paginaDeEventos([EVENTO_COMPLETO]) : paginaDeEventos([]),
    }));
    abrirEm('/busca?q=arsenal');

    expect((screen.getByLabelText('Buscar') as HTMLInputElement).value).toBe('arsenal');
    expect(await screen.findByLabelText(JOGO_DESCRICAO)).toBeTruthy();
  });

  it('clicar no cartão abre o detalhe do evento', async () => {
    responderSempre(200, paginaDeEventos([EVENTO_COMPLETO]));
    render(<App />);

    await screen.findByLabelText(JOGO_DESCRICAO);

    // A listagem devolve uma página; o detalhe devolve um recurso único.
    responderSempre(200, { data: EVENTO_COMPLETO });
    fireEvent.click(screen.getByRole('link', { name: /Newcastle United/ }));

    expect(await screen.findByRole('heading', { level: 1, name: /Newcastle United/ })).toBeTruthy();
    expect(window.location.pathname).toBe('/eventos/evt-1');
  });

  /*
   * O motivo de tudo isto: antes, o "voltar" do navegador saía da aplicação. Agora
   * volta à listagem.
   */
  it('o voltar do navegador regressa à listagem, em vez de sair da aplicação', async () => {
    responderSempre(200, paginaDeEventos([EVENTO_COMPLETO]));
    render(<App />);
    await screen.findByLabelText(JOGO_DESCRICAO);

    responderSempre(200, { data: EVENTO_COMPLETO });
    fireEvent.click(screen.getByRole('link', { name: /Newcastle United/ }));
    await screen.findByRole('heading', { level: 1, name: /Newcastle United/ });

    responderSempre(200, paginaDeEventos([EVENTO_COMPLETO]));
    act(() => {
      window.history.back();
    });

    await waitFor(() => expect(window.location.pathname).toBe('/'));
  });

  it('um endereço desconhecido mostra uma tela com saída, e não um ecrã vazio', () => {
    responderSempre(200, paginaDeEventos([]));
    abrirEm('/isto-nao-existe');

    expect(screen.getByRole('heading', { name: 'Esta página não existe' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Ir para os esportes' })).toBeTruthy();
  });

  it('o destino continua marcado quando se está numa tela abaixo dele', async () => {
    responderSempre(200, { data: EVENTO_COMPLETO });
    abrirEm('/eventos/evt-1');

    await screen.findByRole('heading', { level: 1, name: /Newcastle United/ });

    expect(screen.getByRole('link', { current: 'page' }).textContent).toContain('Esportes');
  });
});

describe('App — detalhe de evento', () => {
  it('mostra os mercados do evento pedido à api', async () => {
    responderSempre(200, { data: EVENTO_COMPLETO });
    window.history.replaceState(null, '', '/eventos/evt-1');
    render(<App />);

    await screen.findByRole('heading', { level: 1, name: /Newcastle United/ });

    expect(screen.getByText('1,94')).toBeTruthy();
    expect(screen.getByText('Mais/menos 2,50 gols')).toBeTruthy();
  });

  /*
   * O issue event_started (T14-A1) existia desde a revisão da T-014 e nunca tinha
   * tido ecrã onde aparecer. Passa a ter: é o caso de clicar num jogo que começou
   * entre a listagem e o clique.
   */
  it('um jogo que já começou diz isso, em vez de "não encontrámos"', async () => {
    responderSempre(
      404,
      erroDaApi('NOT_FOUND', false, [{ field: 'path.id', issue: 'event_started' }]),
    );
    window.history.replaceState(null, '', '/eventos/evt-1');
    render(<App />);

    expect(
      await screen.findByText('Este jogo já começou e deixou de estar disponível.'),
    ).toBeTruthy();
    // E tem saída (CA-008.4).
    expect(screen.getByRole('link', { name: 'Ver os jogos disponíveis' })).toBeTruthy();
  });

  it('o favorito está visível no detalhe, e não só na listagem (RF-006)', async () => {
    responderSempre(200, { data: EVENTO_COMPLETO });
    window.history.replaceState(null, '', '/eventos/evt-1');
    render(<App />);

    expect(
      await screen.findByRole('button', { name: `Adicionar ${JOGO_DESCRICAO} aos favoritos` }),
    ).toBeTruthy();
  });

  it('nenhuma cotação do detalhe é operável (RN-003, CA-003.3)', async () => {
    responderSempre(200, { data: EVENTO_COMPLETO });
    window.history.replaceState(null, '', '/eventos/evt-1');
    const { container } = render(<App />);

    await screen.findByRole('heading', { level: 1, name: /Newcastle United/ });

    for (const lista of container.querySelectorAll('dl')) {
      expect(lista.querySelectorAll('a, button, input, [role="button"], [disabled]')).toHaveLength(
        0,
      );
    }
  });
});

describe('App — detalhe de jogo do cassino', () => {
  it('mostra o jogo do catálogo demonstrativo', () => {
    responderSempre(200, paginaDeEventos([]));
    window.history.replaceState(null, '', '/cassino/jog-fict-001');
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: 'Rolos de Exemplo' })).toBeTruthy();
    expect(screen.getByText('Jogo demonstrativo')).toBeTruthy();
  });

  it('diz que o jogo não pode ser jogado, e não oferece como (RN-004, CA-004.4)', () => {
    responderSempre(200, paginaDeEventos([]));
    window.history.replaceState(null, '', '/cassino/jog-fict-001');
    const { container } = render(<App />);

    expect(screen.getByText(/não pode ser jogado/)).toBeTruthy();

    // O único botão do conteúdo é o favorito; a única ligação é o trilho de volta.
    const main = container.querySelector('main');
    for (const botao of main?.querySelectorAll('button') ?? []) {
      expect(botao.getAttribute('aria-label')).toContain('favoritos');
    }
    expect(main?.querySelectorAll('a')).toHaveLength(1);
  });

  it('um jogo que não existe cai na tela de endereço desconhecido', () => {
    responderSempre(200, paginaDeEventos([]));
    window.history.replaceState(null, '', '/cassino/jog-inexistente');
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Esta página não existe' })).toBeTruthy();
  });
});
