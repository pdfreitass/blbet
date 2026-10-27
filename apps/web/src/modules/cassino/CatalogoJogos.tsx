import { useState } from 'react';

import { NadaCadastrado, NadaEncontrado } from '../../shared/componentes/Estados';
import { CartaoJogo } from './CartaoJogo';
import estilos from './CatalogoJogos.module.css';
import { CATEGORIAS_CONHECIDAS, rotularCategoria } from './categorias';
import type { CategoriaJogo, JogoDemonstrativo } from './tipos';

interface CatalogoJogosProps {
  jogos: readonly JogoDemonstrativo[];
}

/** `null` = sem filtro, que e o estado inicial. */
type FiltroCategoria = CategoriaJogo | null;

/**
 * Catalogo do cassino (RF-004): filtro por categoria e grelha de cartoes.
 *
 * Uma categoria valida sem jogos da lista vazia, e nao erro -- e a regra A7 do
 * contrato, e e o que o estado *nada encontrado* mostra aqui (CA-005.2, CA-008.3).
 */
export function CatalogoJogos({ jogos }: CatalogoJogosProps) {
  const [categoria, setCategoria] = useState<FiltroCategoria>(null);

  if (jogos.length === 0) {
    return <NadaCadastrado conjunto="jogos" />;
  }

  const visiveis = categoria === null ? jogos : jogos.filter((jogo) => jogo.categoria === categoria);

  return (
    <>
      <div className={estilos.filtros} role="group" aria-label="Filtrar por categoria">
        {CATEGORIAS_CONHECIDAS.map((disponivel) => {
          const ativa = disponivel === categoria;

          return (
            <button
              type="button"
              key={disponivel}
              className={estilos.filtro}
              aria-pressed={ativa}
              // Carregar na categoria ativa remove o filtro: e a saida mais curta, e
              // evita que o utilizador fique preso numa categoria.
              onClick={() => setCategoria(ativa ? null : disponivel)}
            >
              {rotularCategoria(disponivel)}
            </button>
          );
        })}
      </div>

      {visiveis.length === 0 ? (
        <NadaEncontrado
          criterio={rotularCategoria(categoria ?? '')}
          rotuloLimpar="Ver todos os jogos"
          onLimpar={() => setCategoria(null)}
        />
      ) : (
        <>
          <ul className={estilos.grelha} role="list">
            {visiveis.map((jogo) => (
              <li key={jogo.id}>
                <CartaoJogo jogo={jogo} />
              </li>
            ))}
          </ul>
          <p className={estilos.rodape}>
            Catálogo demonstrativo: os jogos são fictícios, não há como jogar e nenhum
            valor é real.
          </p>
        </>
      )}
    </>
  );
}
