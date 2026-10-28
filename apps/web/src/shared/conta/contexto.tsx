import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { Resultado } from '../api/cliente';
import { entrar as entrarNaApi, obterConta, sair as sairDaApi, type Account } from '../api/contas';
import type { FalhaApi } from '../api/erros';

/**
 * Os estados em que a area de conta pode estar.
 *
 * `indisponivel` nao e um defeito: a api so regista as rotas de conta quando tem
 * `DATABASE_FILE` configurado (DT-020, DT-021). Sem ele, `/api/accounts/me` responde
 * `404` -- o mesmo `404` que nenhuma outra causa pode produzir nesta rota, porque ela
 * ou responde a conta ou responde `401`. A interface diz que a area esta desligada em
 * vez de mostrar "não encontrámos o que procurava", que nao explicaria nada.
 */
export type EstadoConta =
  | { readonly situacao: 'carregando' }
  | { readonly situacao: 'indisponivel' }
  | { readonly situacao: 'anonimo' }
  | { readonly situacao: 'autenticado'; readonly conta: Account }
  | { readonly situacao: 'falha'; readonly falha: FalhaApi };

interface ValorConta {
  readonly estado: EstadoConta;
  /** Entra e, em caso de sucesso, passa o estado a `autenticado`. */
  readonly entrar: (email: string, senha: string) => Promise<Resultado<Account>>;
  /** Sai. O estado passa a `anonimo` mesmo que o pedido falhe -- ver abaixo. */
  readonly sair: () => Promise<void>;
  /** Volta a perguntar a api quem esta autenticado. */
  readonly recarregar: () => void;
  /**
   * Marca a sessao como terminada sem chamar a api. Usado depois da redefinicao de
   * senha, que ja derrubou TODAS as sessoes do lado do servidor (seccao 7.2).
   */
  readonly marcarSaida: () => void;
}

const ContextoConta = createContext<ValorConta | null>(null);

export function ContaProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoConta>({ situacao: 'carregando' });
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    const controlador = new AbortController();
    let ativo = true;

    obterConta({ signal: controlador.signal })
      .then((resultado) => {
        if (ativo) {
          setEstado(interpretar(resultado));
        }
      })
      .catch(() => {
        // Cancelamento ao desmontar; nao ha estado a corrigir.
      });

    return () => {
      ativo = false;
      controlador.abort();
    };
  }, [tentativa]);

  const recarregar = useCallback(() => setTentativa((valor) => valor + 1), []);

  const entrar = useCallback(async (email: string, senha: string): Promise<Resultado<Account>> => {
    const resultado = await entrarNaApi({ email, password: senha });

    if (!resultado.ok) {
      return resultado;
    }

    setEstado({ situacao: 'autenticado', conta: resultado.dados.data });
    return { ok: true, dados: resultado.dados.data };
  }, []);

  const marcarSaida = useCallback(() => setEstado({ situacao: 'anonimo' }), []);

  const sair = useCallback(async () => {
    await sairDaApi();
    /*
     * O estado passa a anonimo tenha o pedido corrido bem ou mal. A rota responde o
     * mesmo com ou sem sessao, e manter a tela a dizer "entrado" depois de alguem
     * carregar em "sair" seria pior do que o contrario: se a sessao sobreviveu, o
     * proximo pedido autenticado repoe o estado.
     */
    setEstado({ situacao: 'anonimo' });
  }, []);

  const valor = useMemo<ValorConta>(
    () => ({ estado, entrar, sair, recarregar, marcarSaida }),
    [estado, entrar, sair, recarregar, marcarSaida],
  );

  return <ContextoConta.Provider value={valor}>{children}</ContextoConta.Provider>;
}

export function useConta(): ValorConta {
  const valor = useContext(ContextoConta);

  if (valor === null) {
    throw new Error('useConta exige <ContaProvider> acima na árvore.');
  }

  return valor;
}

/** Traduz o resultado de `/api/accounts/me` para um dos estados acima. */
function interpretar(resultado: Resultado<{ data: Account }>): EstadoConta {
  if (resultado.ok) {
    return { situacao: 'autenticado', conta: resultado.dados.data };
  }

  // Nao ha sessao. E a resposta normal de quem ainda nao entrou, nao um erro.
  if (resultado.falha.codigo === 'UNAUTHENTICATED') {
    return { situacao: 'anonimo' };
  }

  if (resultado.falha.codigo === 'NOT_FOUND') {
    return { situacao: 'indisponivel' };
  }

  return { situacao: 'falha', falha: resultado.falha };
}
