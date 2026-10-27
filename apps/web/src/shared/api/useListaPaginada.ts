import { useCallback, useEffect, useRef, useState } from 'react';

import { PedidoCancelado, type Resultado } from './cliente';
import type { FalhaApi } from './erros';

/** O que a api devolve numa pagina: os itens e o cursor para a seguinte (PC-008). */
export interface Pagina<TItem> {
  readonly data: readonly TItem[];
  readonly meta: { readonly nextCursor: string | null };
}

export interface EstadoLista<TItem> {
  /** Primeira pagina a caminho: a tela mostra esqueleto. */
  readonly carregando: boolean;
  /** Itens acumulados de todas as paginas recebidas. */
  readonly itens: readonly TItem[];
  /** Falha que impede mostrar a lista. Uma falha a carregar MAIS nao entra aqui. */
  readonly falha: FalhaApi | null;
  readonly repetir: (() => void) | null;
  /** Presente so quando ha mais para carregar; ausente no fim da lista. */
  readonly carregarMais: (() => void) | null;
  /** Pagina seguinte a caminho. */
  readonly carregandoMais: boolean;
  /** Falha ao carregar MAIS: a lista continua na tela e isto aparece ao fundo. */
  readonly falhaAoCarregarMais: FalhaApi | null;
}

type Carregador<TItem> = (
  cursor: string | undefined,
  opcoes: { signal: AbortSignal },
) => Promise<Resultado<Pagina<TItem>>>;

/**
 * Lista paginada por cursor (PC-008, A6).
 *
 * Tres decisoes de desenho, todas com consequencia visivel:
 *
 * 1. **A pagina seguinte vem por acao explicita, nao por rolagem.** Rolagem infinita
 *    torna o rodape inalcancavel e dispara pedidos sem intencao -- e o plano do
 *    provedor tem 150 por dia (DT-009). Um botao gasta um pedido quando o utilizador
 *    o pede.
 * 2. **Falhar a carregar mais NAO apaga o que ja esta na tela.** A falha fica ao
 *    fundo, junto ao botao, e o que ja foi lido continua legivel.
 * 3. **Um cursor obsoleto nao e erro para o utilizador.** A regra A6 diz que um
 *    cursor fora de prazo da `VALIDATION_FAILED` com `issue: 'invalid_cursor'`.
 *    Mostrar "o pedido nao e valido" seria incompreensivel para quem so carregou num
 *    botao: a lista recomeca do inicio, que e o que o utilizador faria a mao.
 */
export function useListaPaginada<TItem>(
  carregar: Carregador<TItem>,
  dependencias: readonly unknown[],
): EstadoLista<TItem> {
  const [estado, setEstado] = useState<{
    carregando: boolean;
    itens: readonly TItem[];
    cursor: string | null;
    falha: FalhaApi | null;
  }>({ carregando: true, itens: [], cursor: null, falha: null });

  const [carregandoMais, setCarregandoMais] = useState(false);
  const [falhaAoCarregarMais, setFalhaAoCarregarMais] = useState<FalhaApi | null>(null);
  const [tentativa, setTentativa] = useState(0);

  /**
   * Guarda o pedido de "mais" em curso para o cancelar ao desmontar ou ao reiniciar.
   * Sem isto, uma pagina pedida antes de mudar o termo de busca chegaria depois e
   * acrescentaria itens do termo antigo a lista do novo.
   */
  const pedidoEmCurso = useRef<AbortController | null>(null);

  // As dependencias declaradas por quem chama sao a fonte de verdade sobre quando a
  // lista recomeca; `carregar` muda de identidade a cada render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const executar = useCallback(carregar, dependencias);

  useEffect(() => {
    const controlador = new AbortController();
    let ativo = true;

    setEstado({ carregando: true, itens: [], cursor: null, falha: null });
    setFalhaAoCarregarMais(null);
    setCarregandoMais(false);
    pedidoEmCurso.current?.abort();
    pedidoEmCurso.current = null;

    executar(undefined, { signal: controlador.signal })
      .then((resultado) => {
        if (!ativo) {
          return;
        }

        if (resultado.ok) {
          setEstado({
            carregando: false,
            itens: resultado.dados.data,
            cursor: resultado.dados.meta.nextCursor,
            falha: null,
          });
        } else {
          setEstado({ carregando: false, itens: [], cursor: null, falha: resultado.falha });
        }
      })
      .catch((erro: unknown) => {
        if (erro instanceof PedidoCancelado || !ativo) {
          return;
        }

        setEstado({ carregando: false, itens: [], cursor: null, falha: falhaIlegivel() });
      });

    return () => {
      ativo = false;
      controlador.abort();
      pedidoEmCurso.current?.abort();
    };
  }, [executar, tentativa]);

  const reiniciar = useCallback(() => setTentativa((valor) => valor + 1), []);

  const carregarMais = useCallback(() => {
    const cursor = estado.cursor;

    if (cursor === null || carregandoMais) {
      return;
    }

    const controlador = new AbortController();
    pedidoEmCurso.current = controlador;
    setCarregandoMais(true);
    setFalhaAoCarregarMais(null);

    executar(cursor, { signal: controlador.signal })
      .then((resultado) => {
        if (controlador.signal.aborted) {
          return;
        }

        setCarregandoMais(false);

        if (resultado.ok) {
          setEstado((anterior) => ({
            ...anterior,
            itens: [...anterior.itens, ...resultado.dados.data],
            cursor: resultado.dados.meta.nextCursor,
          }));
          return;
        }

        // Cursor fora de prazo (A6): recomeca em vez de mostrar um erro que o
        // utilizador nao provocou nem percebe.
        if (resultado.falha.issue === 'invalid_cursor') {
          reiniciar();
          return;
        }

        setFalhaAoCarregarMais(resultado.falha);
      })
      .catch((erro: unknown) => {
        if (erro instanceof PedidoCancelado || controlador.signal.aborted) {
          return;
        }

        setCarregandoMais(false);
        setFalhaAoCarregarMais(falhaIlegivel());
      });
  }, [estado.cursor, carregandoMais, executar, reiniciar]);

  return {
    carregando: estado.carregando,
    itens: estado.itens,
    falha: estado.falha,
    repetir: estado.falha?.retryable === true ? reiniciar : null,
    carregarMais: estado.cursor === null ? null : carregarMais,
    carregandoMais,
    falhaAoCarregarMais,
  };
}

function falhaIlegivel(): FalhaApi {
  return {
    codigo: 'RESPOSTA_INVALIDA',
    retryable: false,
    mensagem: 'Recebemos uma resposta que não conseguimos ler.',
  };
}
