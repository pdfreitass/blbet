import type { Origin } from '@blbet/contracts';
import type { ReactNode } from 'react';

import { ValorDemonstrativo } from './ValorDemonstrativo';

interface ValorDeDadoProps {
  origin: Origin;
  children: ReactNode;
  descricao: string;
  numerico?: boolean;
}

/**
 * Mostra um valor marcando-o conforme a procedencia -- a **opcao A** da DIV-001, que
 * e a que o design-system (seccao 7) manda seguir enquanto o Pedro nao decidir: marca
 * so o ficticio, e o dado real fica sem marcacao.
 *
 * Se o Pedro escolher a opcao B, a variante de procedencia real entra AQUI, e nenhum
 * componente que use este precisa de mudar.
 */
export function ValorDeDado({ origin, children, descricao, numerico = false }: ValorDeDadoProps) {
  if (origin === 'demo') {
    return (
      <ValorDemonstrativo descricao={descricao} numerico={numerico}>
        {children}
      </ValorDemonstrativo>
    );
  }

  return <span className={numerico ? 'numeric' : undefined}>{children}</span>;
}
