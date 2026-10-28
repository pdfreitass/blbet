import { useCallback, useEffect, useState } from 'react';

import { PedidoCancelado, type OpcoesPedido, type Resultado } from './cliente';
import { mesmasDependencias } from './dependencias';
import type { FalhaApi } from './erros';

export interface EstadoRecurso<T> {
  readonly carregando: boolean;
  readonly dados: T | null;
  readonly falha: FalhaApi | null;
  /** Presente so quando a falha e repetivel (A1): sem isso, nao se oferece repetir. */
  readonly repetir: (() => void) | null;
}

/**
 * Carrega um recurso da api e devolve os tres estados de RF-008.
 *
 * O pedido anterior e CANCELADO quando as dependencias mudam: sem isso, numa busca,
 * uma resposta lenta de um termo antigo chegaria depois da do termo atual e
 * substituiria o resultado certo pelo errado.
 */
/** O que o hook passa a quem carrega: o sinal, e se e para ignorar o cache. */
export type OpcoesCarregamento = OpcoesPedido & { signal: AbortSignal };

export function useRecurso<T>(
  carregar: (opcoes: OpcoesCarregamento) => Promise<Resultado<T>>,
  dependencias: readonly unknown[],
): EstadoRecurso<T> {
  const [estado, setEstado] = useState<{
    carregando: boolean;
    dados: T | null;
    falha: FalhaApi | null;
  }>({ carregando: true, dados: null, falha: null });

  const [tentativa, setTentativa] = useState(0);

  /*
   * O estado passa a "a carregar" DURANTE O RENDER em que as dependencias mudam, e
   * nao dentro do efeito. E o padrao que o React documenta para ajustar estado quando
   * uma entrada muda: poupa um render e evita o intervalo em que a tela ainda diria
   * "pronto" com os dados do pedido anterior.
   *
   * A lista comparada inclui `tentativa` porque repetir tem de voltar a mostrar o
   * carregamento, mesmo com as dependencias iguais.
   */
  const chaves: readonly unknown[] = [...dependencias, tentativa];
  const [chavesAnteriores, setChavesAnteriores] = useState(chaves);

  if (!mesmasDependencias(chavesAnteriores, chaves)) {
    setChavesAnteriores(chaves);
    setEstado((anterior) => ({ ...anterior, carregando: true }));
  }

  useEffect(() => {
    const controlador = new AbortController();
    let ativo = true;

    // Uma repeticao pedida pelo utilizador vai sempre a rede (DT-017).
    carregar({ signal: controlador.signal, ignorarCache: tentativa > 0 })
      .then((resultado) => {
        if (!ativo) {
          return;
        }

        if (resultado.ok) {
          setEstado({ carregando: false, dados: resultado.dados, falha: null });
        } else {
          setEstado({ carregando: false, dados: null, falha: resultado.falha });
        }
      })
      .catch((erro: unknown) => {
        // Cancelamento nao e falha: nao mexe no estado, porque ja ha outro pedido a
        // caminho e mostrar erro aqui faria piscar uma mensagem que nao se aplica.
        if (erro instanceof PedidoCancelado || !ativo) {
          return;
        }

        setEstado({
          carregando: false,
          dados: null,
          falha: {
            codigo: 'RESPOSTA_INVALIDA',
            retryable: false,
            mensagem: 'Recebemos uma resposta que não conseguimos ler.',
          },
        });
      });

    return () => {
      ativo = false;
      controlador.abort();
    };
    // `carregar` muda de identidade a cada render; as dependencias declaradas por quem
    // chama sao a fonte de verdade sobre quando repetir o pedido.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, chaves);

  const repetir = useCallback(() => setTentativa((valor) => valor + 1), []);

  return {
    carregando: estado.carregando,
    dados: estado.dados,
    falha: estado.falha,
    // Repetir so se o servidor disse que vale a pena (A1).
    repetir: estado.falha?.retryable === true ? repetir : null,
  };
}
