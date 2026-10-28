import { Link } from 'wouter';

import { Etiqueta } from '../../shared/componentes/Etiqueta';
import { IndicadorFavorito } from '../../shared/componentes/IndicadorFavorito';
import estilos from './CartaoJogo.module.css';
import { rotularCategoria } from './categorias';
import type { JogoDemonstrativo } from './tipos';

interface CartaoJogoProps {
  jogo: JogoDemonstrativo;
}

/** Duas letras do nome, para o espaco reservado da imagem. */
function sigla(nome: string): string {
  return nome.slice(0, 2).toLocaleUpperCase('pt-BR');
}

/**
 * Cartao de jogo do catalogo (RF-004).
 *
 * O nome do jogo navega para o detalhe (DT-015), e a area clicavel estende-se a faixa
 * de identificacao. O que continua proibido e qualquer afordancia de **jogar**
 * (RN-004, CA-004.4): o cartao leva ao detalhe e a mais nada. O espaco da imagem fica
 * fora da area da ligacao, para que nada no cartao se pareca com um botao de jogo.
 *
 * O indicador de favorito da seccao 9.4 fica acima da ligacao, como controle proprio.
 */
export function CartaoJogo({ jogo }: CartaoJogoProps) {
  return (
    <article className={estilos.cartao} aria-label={jogo.nome}>
      <div className={estilos.espacoImagem}>
        {/* Decorativo: o nome do jogo esta logo abaixo, em texto. */}
        <span className={`${estilos.sigla} numeric`} aria-hidden="true">
          {sigla(jogo.nome)}
        </span>
      </div>
      <div className={estilos.identificacao}>
        <h3 className={estilos.nome}>
          <Link href={`/cassino/${encodeURIComponent(jogo.id)}`} className={estilos.ligacao}>
            {jogo.nome}
          </Link>
        </h3>
        <div className={estilos.rodapeCartao}>
          <Etiqueta variante="neutra">{rotularCategoria(jogo.categoria)}</Etiqueta>
          <IndicadorFavorito tipo="jogo" id={jogo.id} nome={jogo.nome} />
        </div>
      </div>
    </article>
  );
}
