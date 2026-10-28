import { fireEvent, render, screen, waitFor, type RenderResult } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { erroDaApi } from '../../test/fixtures';
import { instalarServidorFalso, responderSempre, type RespostaFalsa } from '../../test/servidorFalso';
import { ContaProvider } from '../../shared/conta/contexto';
import { AlterarSenha } from './AlterarSenha';
import { CriarConta } from './CriarConta';
import { Dispositivos } from './Dispositivos';
import { Entrar } from './Entrar';
import { Recuperar } from './Recuperar';
import { Redefinir } from './Redefinir';
import { ResumoConta } from './ResumoConta';
import { VerificarEmail } from './VerificarEmail';

/*
 * Os ecras de conta (DT-020, seccao 7.2 do contrato).
 *
 * O que estes testes protegem nao e a aparencia: sao as tres coisas que a api faz de
 * proposito e que e facil desfazer sem dar por isso --
 *   A-A2: o cadastro e a recuperacao respondem o mesmo exista ou nao a conta;
 *   A-A4: um `429` pode acontecer com a senha certa;
 *   A-A1: a senha tem minimo de 8 e NENHUMA regra de composicao.
 */

const CONTA = {
  id: '6f4a2d4e-9f3a-4c11-8a1d-2f9b0c7e5a11',
  email: 'pedro@exemplo.pt',
  emailVerified: true,
  createdAt: '2026-10-20T10:00:00.000Z',
};

const SESSAO_ATUAL = {
  id: 'b2c3d4e5-f6a7-4b89-9c01-2d3e4f5a6b7c',
  createdAt: '2026-10-27T09:00:00.000Z',
  lastSeenAt: '2026-10-28T08:00:00.000Z',
  expiresAt: '2026-11-04T09:00:00.000Z',
  current: true,
  userAgent: 'Firefox no Windows',
};

const SESSAO_OUTRA = {
  ...SESSAO_ATUAL,
  id: 'c3d4e5f6-a7b8-4c90-9d12-3e4f5a6b7c8d',
  current: false,
  userAgent: 'Chrome no Android',
};

function renderizarConta(elemento: ReactElement): RenderResult {
  return render(<ContaProvider>{elemento}</ContaProvider>);
}

/** Escreve num campo pelo rotulo. `fireEvent` e o que o resto da bateria ja usa. */
function escrever(rotulo: string, valor: string): void {
  fireEvent.change(screen.getByLabelText(rotulo), { target: { value: valor } });
}

function clicar(nome: string): void {
  fireEvent.click(screen.getByRole('button', { name: nome }));
}

/** `fetch` com as chamadas registadas, para verificar o que NAO foi pedido. */
function espiarPedidos(encaminhar: (url: string, metodo: string) => RespostaFalsa) {
  const pedidos: { url: string; metodo: string; corpo: unknown }[] = [];

  vi.stubGlobal(
    'fetch',
    vi.fn((entrada: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof entrada === 'string' ? entrada : String(entrada);
      const metodo = init?.method ?? 'GET';
      pedidos.push({
        url,
        metodo,
        corpo: typeof init?.body === 'string' ? JSON.parse(init.body) : undefined,
      });

      const { estado, corpo } = encaminhar(url, metodo);

      return Promise.resolve(
        new Response(estado === 204 ? null : JSON.stringify(corpo), {
          status: estado,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }),
  );

  return pedidos;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('cadastro (A-A2)', () => {
  it('não diz que o e-mail já existe: a api responde o mesmo exista ou não a conta', async () => {
    responderSempre(202, { data: { accepted: true } });
    renderizarConta(<CriarConta />);

    escrever('E-mail', 'pedro@exemplo.pt');
    escrever('Senha', 'senha-comprida');
    clicar('Criar conta');

    const confirmacao = await screen.findByRole('status');

    expect(confirmacao.textContent).toContain('Se este endereço puder ser usado');
    expect(document.body.textContent).not.toContain('já existe');
  });

  it('anuncia o mínimo de 8 caracteres e não exige maiúsculas, números nem símbolos (A-A1)', async () => {
    const pedidos = espiarPedidos(() => ({ estado: 202, corpo: { data: { accepted: true } } }));
    renderizarConta(<CriarConta />);

    expect(screen.getByText(/Pelo menos 8 caracteres/)).toBeTruthy();
    expect(screen.getByText(/Não há exigência de maiúsculas/)).toBeTruthy();

    // Oito minusculas sem nada mais: a api aceita, e a interface nao pode recusar.
    escrever('E-mail', 'pedro@exemplo.pt');
    escrever('Senha', 'abcdefgh');
    clicar('Criar conta');

    await screen.findByRole('status');
    expect(pedidos.filter((pedido) => pedido.url === '/api/accounts')).toHaveLength(1);
  });

  it('senha curta de mais não gasta um pedido', async () => {
    const pedidos = espiarPedidos(() => ({ estado: 202, corpo: { data: { accepted: true } } }));
    renderizarConta(<CriarConta />);

    escrever('E-mail', 'pedro@exemplo.pt');
    escrever('Senha', 'curta');
    clicar('Criar conta');

    expect(screen.getByText('A senha tem de ter pelo menos 8 caracteres.')).toBeTruthy();
    expect(pedidos.filter((pedido) => pedido.url === '/api/accounts')).toHaveLength(0);
  });
});

describe('entrada', () => {
  it('envia a entrada por POST, com o corpo do contrato e com as credenciais', async () => {
    const pedidos = espiarPedidos((url) =>
      url === '/api/sessions' ? { estado: 201, corpo: { data: CONTA } } : { estado: 401, corpo: erroDaApi('UNAUTHENTICATED', false) },
    );
    renderizarConta(<Entrar />);

    escrever('E-mail', 'pedro@exemplo.pt');
    escrever('Senha', 'senha-comprida');
    clicar('Entrar');

    await waitFor(() => {
      expect(pedidos.some((pedido) => pedido.url === '/api/sessions')).toBe(true);
    });

    const entrada = pedidos.find((pedido) => pedido.url === '/api/sessions');

    expect(entrada?.metodo).toBe('POST');
    expect(entrada?.corpo).toEqual({ email: 'pedro@exemplo.pt', password: 'senha-comprida' });
  });

  it('não revela se o e-mail existe quando as credenciais não conferem', async () => {
    responderSempre(401, erroDaApi('UNAUTHENTICATED', false));
    renderizarConta(<Entrar />);

    escrever('E-mail', 'pedro@exemplo.pt');
    escrever('Senha', 'senha-comprida');
    clicar('Entrar');

    const aviso = await screen.findByRole('alert');

    expect(aviso.textContent).toBe('E-mail ou senha incorretos.');
    // A mensagem tecnica do servidor nunca chega a tela (DIV-F01).
    expect(document.body.textContent).not.toContain('upstream responded');
  });

  /*
   * A-A4. Este e o caso que um texto descuidado estraga: dizer "verifique a senha"
   * manda corrigir o que pode estar certo.
   */
  it('perante um 429 diz que pode acontecer com os dados certos, e não culpa a senha', async () => {
    responderSempre(429, erroDaApi('RATE_LIMITED', true));
    renderizarConta(<Entrar />);

    escrever('E-mail', 'pedro@exemplo.pt');
    escrever('Senha', 'senha-comprida');
    clicar('Entrar');

    const aviso = await screen.findByRole('alert');

    expect(aviso.textContent).toContain('mesmo com os dados certos');
    expect(aviso.textContent).not.toContain('incorret');
  });

  it('perante um 403 encaminha para a confirmação do e-mail, não para outra tentativa', async () => {
    responderSempre(403, erroDaApi('FORBIDDEN', false));
    renderizarConta(<Entrar />);

    escrever('E-mail', 'pedro@exemplo.pt');
    escrever('Senha', 'senha-comprida');
    clicar('Entrar');

    const aviso = await screen.findByRole('alert');

    expect(aviso.textContent).toContain('não está confirmada');
  });
});

describe('recuperação de senha (A-A2)', () => {
  it('confirma condicionalmente, sem dizer se a conta existe', async () => {
    responderSempre(202, { data: { accepted: true } });
    renderizarConta(<Recuperar />);

    escrever('E-mail', 'pedro@exemplo.pt');
    clicar('Enviar ligação');

    const confirmacao = await screen.findByRole('status');

    expect(confirmacao.textContent).toContain('Se este endereço puder ser usado');
  });
});

describe('verificação de e-mail', () => {
  it('não gasta o token ao abrir a página: espera um ato explícito', async () => {
    window.history.replaceState(null, '', '/conta/verificar?token=abc');
    const pedidos = espiarPedidos(() => ({ estado: 204, corpo: null }));

    renderizarConta(<VerificarEmail />);

    // So a leitura da conta; nenhuma chamada a /verify antes do clique.
    await waitFor(() => {
      expect(pedidos.some((pedido) => pedido.url === '/api/accounts/me')).toBe(true);
    });
    expect(pedidos.some((pedido) => pedido.url === '/api/accounts/verify')).toBe(false);

    clicar('Confirmar o meu e-mail');

    const confirmacao = await screen.findByRole('status');

    expect(confirmacao.textContent).toContain('E-mail confirmado');
    expect(pedidos.filter((pedido) => pedido.url === '/api/accounts/verify')).toHaveLength(1);
  });

  it('sem token, explica o que falta em vez de tentar', () => {
    window.history.replaceState(null, '', '/conta/verificar');
    responderSempre(401, erroDaApi('UNAUTHENTICATED', false));

    renderizarConta(<VerificarEmail />);

    expect(screen.getByRole('alert').textContent).toContain('ligação está incompleta');
    expect(screen.queryByRole('button', { name: 'Confirmar o meu e-mail' })).toBeNull();
  });

  it('diz que a ligação expirou quando o servidor marca o token como inválido', async () => {
    window.history.replaceState(null, '', '/conta/verificar?token=gasto');
    instalarServidorFalso((url) =>
      url === '/api/accounts/verify'
        ? {
            estado: 400,
            corpo: erroDaApi('VALIDATION_FAILED', false, [
              { field: 'body.token', issue: 'invalid_value' },
            ]),
          }
        : { estado: 401, corpo: erroDaApi('UNAUTHENTICATED', false) },
    );

    renderizarConta(<VerificarEmail />);
    clicar('Confirmar o meu e-mail');

    const aviso = await screen.findByRole('alert');

    expect(aviso.textContent).toContain('já foi usada ou expirou');
  });
});

describe('redefinição de senha', () => {
  it('avisa, antes e depois, que todas as sessões terminam', async () => {
    window.history.replaceState(null, '', '/conta/nova-senha?token=abc');
    instalarServidorFalso((url) =>
      url === '/api/accounts/password-reset/confirm'
        ? { estado: 204, corpo: null }
        : { estado: 401, corpo: erroDaApi('UNAUTHENTICATED', false) },
    );

    renderizarConta(<Redefinir />);

    expect(screen.getByText(/todas as sessões desta conta terminam/)).toBeTruthy();

    escrever('Senha nova', 'senha-comprida');
    clicar('Alterar a senha');

    const confirmacao = await screen.findByRole('status');

    expect(confirmacao.textContent).toContain('incluindo a deste navegador');
  });
});

describe('alteração de senha', () => {
  it('exige sessão: sem ela, pede a entrada em vez de mostrar o formulário', async () => {
    responderSempre(401, erroDaApi('UNAUTHENTICATED', false));
    renderizarConta(<AlterarSenha />);

    const aviso = await screen.findByRole('alert');

    expect(aviso.textContent).toContain('Entre na sua conta');
    expect(screen.queryByLabelText('Senha atual')).toBeNull();
  });

  it('com sessão, envia a senha atual e a nova e diz que as outras sessões caíram', async () => {
    const pedidos = espiarPedidos((url) => {
      if (url === '/api/accounts/me') return { estado: 200, corpo: { data: CONTA } };
      return { estado: 204, corpo: null };
    });

    renderizarConta(<AlterarSenha />);

    const atual = await screen.findByLabelText('Senha atual');

    fireEvent.change(atual, { target: { value: 'senha-antiga' } });
    escrever('Senha nova', 'senha-nova-1');
    clicar('Alterar a senha');

    const confirmacao = await screen.findByRole('status');

    expect(confirmacao.textContent).toContain('outros dispositivos foram terminadas');

    const alteracao = pedidos.find((pedido) => pedido.url === '/api/accounts/password');

    expect(alteracao?.corpo).toEqual({
      currentPassword: 'senha-antiga',
      newPassword: 'senha-nova-1',
    });
  });
});

describe('dispositivos autenticados', () => {
  it('lista as sessões, marca a atual e revoga outra', async () => {
    const pedidos = espiarPedidos((url, metodo) => {
      if (url === '/api/accounts/me') return { estado: 200, corpo: { data: CONTA } };
      if (url === '/api/sessions' && metodo === 'GET') {
        return { estado: 200, corpo: { data: [SESSAO_ATUAL, SESSAO_OUTRA] } };
      }
      return { estado: 204, corpo: null };
    });

    renderizarConta(<Dispositivos />);

    expect(await screen.findByText('Chrome no Android')).toBeTruthy();
    expect(screen.getByText('Este dispositivo')).toBeTruthy();

    clicar('Terminar');

    await waitFor(() => {
      expect(
        pedidos.some(
          (pedido) => pedido.url === `/api/sessions/${SESSAO_OUTRA.id}` && pedido.metodo === 'DELETE',
        ),
      ).toBe(true);
    });
  });
});

describe('resumo da conta no perfil', () => {
  it('sem sessão, convida a entrar e diz o que uma conta não é', async () => {
    responderSempre(401, erroDaApi('UNAUTHENTICATED', false));
    renderizarConta(<ResumoConta />);

    expect(await screen.findByText(/Não está autenticado/)).toBeTruthy();
    expect(screen.getByText(/não há carteira, depósitos nem saques/i)).toBeTruthy();
  });

  it('com sessão, mostra o e-mail real e a data de criação', async () => {
    responderSempre(200, { data: CONTA });
    renderizarConta(<ResumoConta />);

    expect(await screen.findByText('pedro@exemplo.pt')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Sair' })).toBeTruthy();
  });

  /*
   * Sem `DATABASE_FILE` a api nao regista as rotas de conta (DT-021) e `/accounts/me`
   * da `404`. Dizer "não encontrámos o que procurava" nao explicaria nada.
   */
  it('com a área de contas desligada no servidor, diz isso em vez de dar erro', async () => {
    responderSempre(404, erroDaApi('NOT_FOUND', false));
    renderizarConta(<ResumoConta />);

    expect(await screen.findByText(/sem a área de contas/)).toBeTruthy();
    expect(document.body.textContent).not.toContain('Não encontrámos o que procurava');
  });
});

describe('estados partilhados da área de conta', () => {
  it('com a área de contas desligada, o ecrã protegido explica-o em vez de pedir a entrada', async () => {
    responderSempre(404, erroDaApi('NOT_FOUND', false));
    renderizarConta(<AlterarSenha />);

    const aviso = await screen.findByRole('alert');

    expect(aviso.textContent).toContain('não tem a área de contas ligada');
    expect(document.body.textContent).not.toContain('Entre na sua conta');
  });

  it('quando a leitura da conta falha por outra razão, oferece tentar de novo', async () => {
    responderSempre(503, erroDaApi('UPSTREAM_UNAVAILABLE', true));
    renderizarConta(<AlterarSenha />);

    expect(await screen.findByRole('button', { name: 'Tentar novamente' })).toBeTruthy();
  });

  it('sair deixa de mostrar a conta e volta a convidar a entrar', async () => {
    instalarServidorFalso((url) =>
      url === '/api/accounts/me'
        ? { estado: 200, corpo: { data: CONTA } }
        : { estado: 204, corpo: null },
    );

    renderizarConta(<ResumoConta />);
    expect(await screen.findByText('pedro@exemplo.pt')).toBeTruthy();

    clicar('Sair');

    expect(await screen.findByText(/Não está autenticado/)).toBeTruthy();
  });

  it('terminar a sessão atual é tratado como sair, não como revogar outra', async () => {
    const pedidos = espiarPedidos((url, metodo) => {
      if (url === '/api/accounts/me') return { estado: 200, corpo: { data: CONTA } };
      if (url === '/api/sessions' && metodo === 'GET') {
        return { estado: 200, corpo: { data: [SESSAO_ATUAL] } };
      }
      return { estado: 204, corpo: null };
    });

    renderizarConta(<Dispositivos />);

    const botao = await screen.findByRole('button', { name: 'Sair deste dispositivo' });

    // Com uma só sessão não há "terminar as outras" para mostrar.
    expect(screen.queryByRole('button', { name: /Terminar as outras/ })).toBeNull();

    fireEvent.click(botao);

    await waitFor(() => {
      expect(
        pedidos.some(
          (pedido) => pedido.url === `/api/sessions/${SESSAO_ATUAL.id}` && pedido.metodo === 'DELETE',
        ),
      ).toBe(true);
    });
  });

  it('termina as outras sessões de uma vez', async () => {
    const pedidos = espiarPedidos((url, metodo) => {
      if (url === '/api/accounts/me') return { estado: 200, corpo: { data: CONTA } };
      if (url === '/api/sessions' && metodo === 'GET') {
        return { estado: 200, corpo: { data: [SESSAO_ATUAL, SESSAO_OUTRA] } };
      }
      return { estado: 204, corpo: null };
    });

    renderizarConta(<Dispositivos />);

    fireEvent.click(await screen.findByRole('button', { name: 'Terminar as outras sessão' }));

    await waitFor(() => {
      expect(
        pedidos.some((pedido) => pedido.url === '/api/sessions' && pedido.metodo === 'DELETE'),
      ).toBe(true);
    });
  });

  it('o e-mail por confirmar é dito por palavras, não só por cor', async () => {
    responderSempre(200, { data: { ...CONTA, emailVerified: false } });
    renderizarConta(<ResumoConta />);

    expect(await screen.findByText('E-mail por confirmar')).toBeTruthy();
  });

  it('e-mail inválido no pedido de recuperação não gasta um pedido', () => {
    const pedidos = espiarPedidos(() => ({ estado: 202, corpo: { data: { accepted: true } } }));
    renderizarConta(<Recuperar />);

    escrever('E-mail', 'isto-não-é-email');
    clicar('Enviar ligação');

    expect(screen.getByText('Este e-mail não parece válido.')).toBeTruthy();
    expect(pedidos.filter((pedido) => pedido.url === '/api/accounts/password-reset')).toHaveLength(0);
  });

  it('sem token, a redefinição manda pedir outra ligação', () => {
    window.history.replaceState(null, '', '/conta/nova-senha');
    responderSempre(401, erroDaApi('UNAUTHENTICATED', false));

    renderizarConta(<Redefinir />);

    expect(screen.getByRole('alert').textContent).toContain('ligação está incompleta');
    expect(screen.queryByLabelText('Senha nova')).toBeNull();
  });

  it('entrada sem campos preenchidos não gasta um pedido', () => {
    const pedidos = espiarPedidos(() => ({ estado: 201, corpo: { data: CONTA } }));
    renderizarConta(<Entrar />);

    clicar('Entrar');

    expect(screen.getByText('Indique o seu e-mail.')).toBeTruthy();
    expect(screen.getByText('Indique a sua senha.')).toBeTruthy();
    expect(pedidos.filter((pedido) => pedido.url === '/api/sessions')).toHaveLength(0);
  });
});
