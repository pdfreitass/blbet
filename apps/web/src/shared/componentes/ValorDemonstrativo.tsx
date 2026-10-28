import type { ReactNode } from 'react';

import estilos from './ValorDemonstrativo.module.css';

interface ValorDemonstrativoProps {
  /** O valor ja formatado. A formatacao e dos modulos de shared/formato, nao daqui. */
  children: ReactNode;
  /**
   * Nome acessivel completo, incluindo o que o valor representa. O tracejado, a
   * hachura e o glifo sao invisiveis para quem usa leitor de tela (design-system 6.2),
   * por isso o caracter ficticio tem de chegar por texto.
   */
  descricao: string;
  /** Marca o valor como numero com funcao de dado: tabular-nums (principio P1). */
  numerico?: boolean;
}

/**
 * Todo valor ficticio da interface passa por aqui -- odds, data e hora, situacao de
 * evento, informacao de jogo (design-system 6.3). Nao se aplica a rotulos, titulos
 * nem mensagens de estado: marca-los diluiria o sinal.
 *
 * Nao ha variante para dado real, e nao e para criar: a DT-014 escolheu a opcao A.
 * Quem decide se um valor passa por aqui e o `ValorDeDado`, pelo `origin`.
 */
export function ValorDemonstrativo({
  children,
  descricao,
  numerico = false,
}: ValorDemonstrativoProps) {
  const classes = numerico ? `${estilos.campo} numeric` : estilos.campo;

  return (
    <span className={classes}>
      <span className={estilos.glifo} aria-hidden="true">
        ◇
      </span>
      <span className={estilos.valor}>{children}</span>
      <span className="visually-hidden">{` ${descricao}, valor demonstrativo`}</span>
    </span>
  );
}
