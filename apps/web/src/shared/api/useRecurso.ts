import { useCallback, useEffect, useState } from 'react';

import { PedidoCancelado, type Resultado } from './cliente';
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
export function useRecurso<T>(
  carregar: (opcoes: { signal: AbortSignal }) => Promise<Resultado<T>>,
  dependencias: readonly unknown[],
): EstadoRecurso<T> {
  const [estado, setEstado] = useState<{
    carregando: boolean;
    dados: T | null;
    falha: FalhaApi | null;
  }>({ carregando: true, dados: null, falha: null });

  const [tentativa, setTentativa] = useState(0);

  // `carregar` muda de identidade a cada render; as dependencias declaradas por quem
  // chama sao a fonte de verdade sobre quando repetir o pedido.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const executar = useCallback(carregar, dependencias);

  useEffect(() => {
    const controlador = new AbortController();
    let ativo = true;

    setEstado((anterior) => ({ ...anterior, carregando: true }));

    executar({ signal: controlador.signal })
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
  }, [executar, tentativa]);

  const repetir = useCallback(() => setTentativa((valor) => valor + 1), []);

  return {
    carregando: estado.carregando,
    dados: estado.dados,
    falha: estado.falha,
    // Repetir so se o servidor disse que vale a pena (A1).
    repetir: estado.falha?.retryable === true ? repetir : null,
  };
}
