import { useCallback, useState } from 'react';

import type { Resultado } from '../../shared/api/cliente';
import type { FalhaApi } from '../../shared/api/erros';

export interface Envio {
  /** Pedido em curso: o botao fica desativado e nao se envia duas vezes. */
  readonly pendente: boolean;
  /** Falha do ultimo envio, ja em texto proprio do ecra (ver `mensagens.ts`). */
  readonly falha: FalhaApi | null;
  readonly enviar: <T>(acao: () => Promise<Resultado<T>>, aoConseguir: (dados: T) => void) => void;
  readonly limpar: () => void;
}

/**
 * Um envio de formulario: pendente, falha, e o que fazer quando corre bem.
 *
 * Existe porque os sete ecras de conta fazem exatamente o mesmo a volta do pedido, e
 * repetir isto sete vezes garantiria que um deles ficava sem o `pendente` -- que e o
 * que permite enviar o mesmo cadastro duas vezes com dois cliques rapidos.
 */
export function useEnvio(): Envio {
  const [pendente, setPendente] = useState(false);
  const [falha, setFalha] = useState<FalhaApi | null>(null);

  const enviar = useCallback(
    <T,>(acao: () => Promise<Resultado<T>>, aoConseguir: (dados: T) => void) => {
      setPendente(true);
      setFalha(null);

      acao()
        .then((resultado) => {
          setPendente(false);

          if (resultado.ok) {
            aoConseguir(resultado.dados);
          } else {
            setFalha(resultado.falha);
          }
        })
        .catch(() => {
          setPendente(false);
          setFalha({
            codigo: 'RESPOSTA_INVALIDA',
            retryable: false,
            mensagem: 'Recebemos uma resposta que não conseguimos ler.',
          });
        });
    },
    [],
  );

  const limpar = useCallback(() => setFalha(null), []);

  return { pendente, falha, enviar, limpar };
}
