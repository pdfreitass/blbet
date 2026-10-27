import { useEffect, useState } from 'react';

/** Espera depois da ultima tecla antes de deixar o termo passar. */
const ESPERA_MS = 350;

/**
 * Adia o termo de busca.
 *
 * NAO e polimento: o plano do provedor esportivo tem 150 pedidos por dia (DT-009), e
 * um pedido por tecla esgota-o numa tarde. O adiamento junta as teclas de uma mesma
 * palavra num pedido so.
 */
export function useTermoAdiado(termo: string): string {
  const [adiado, setAdiado] = useState(termo);

  useEffect(() => {
    const temporizador = setTimeout(() => setAdiado(termo), ESPERA_MS);

    return () => clearTimeout(temporizador);
  }, [termo]);

  return adiado;
}
