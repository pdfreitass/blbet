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
 * Mostra um valor marcando-o conforme a procedencia: marca so o ficticio, e o dado
 * real fica sem marcacao. E a **opcao A**, decidida na **DT-014** e registada na
 * seccao 7 do design-system.
 *
 * Este e o UNICO lugar que decide se um valor leva marca. Nenhum componente que
 * mostre um valor toma essa decisao por si -- e o que faz a marcacao ser consistente
 * em todas as areas, que e o que a RNF-008 exige.
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
