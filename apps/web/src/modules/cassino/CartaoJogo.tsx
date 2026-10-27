import { Etiqueta } from '../../shared/componentes/Etiqueta';
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
 * NAO navega e NAO tem botao: nao existe tela de detalhe nem roteamento decidido, e o
 * design-system proibe qualquer afordancia de "jogar" (RN-004, CA-004.4). Pela mesma
 * razao do cartao de evento, fica de leitura ate haver para onde ir.
 *
 * O indicador de favorito previsto na seccao 9.4 pertence a RF-006 e ainda nao existe:
 * nao ponho um lugar vazio no canto a fingir que existe.
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
        <h3 className={estilos.nome}>{jogo.nome}</h3>
        <Etiqueta variante="neutra">{rotularCategoria(jogo.categoria)}</Etiqueta>
      </div>
    </article>
  );
}
