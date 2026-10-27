import { NadaCadastrado } from '../../shared/componentes/Estados';
import { useFavoritos } from '../../shared/favoritos/contexto';
import { CartaoJogo } from '../cassino/CartaoJogo';
import type { JogoDemonstrativo } from '../cassino/tipos';
import { CartaoEvento } from '../esportes/CartaoEvento';
import type { EventoDemonstrativo } from '../esportes/tipos';
import estilos from './ListaFavoritos.module.css';

interface ListaFavoritosProps {
  eventos: readonly EventoDemonstrativo[];
  jogos: readonly JogoDemonstrativo[];
}

/**
 * Reune o que foi favoritado (RF-006). Desmarcar remove daqui de imediato, porque a
 * lista deriva do estado partilhado e nao de uma copia (CA-006.3).
 *
 * A ordem segue a dos conjuntos de origem, e nao a ordem em que foram favoritados:
 * uma lista que se reordena sozinha ao voltar a ela e mais dificil de reencontrar.
 */
export function ListaFavoritos({ eventos, jogos }: ListaFavoritosProps) {
  const { disponivel, estaFavorito, total } = useFavoritos();

  // Sem armazenamento, nao ha favoritos nem como os criar: dizer isso e melhor do que
  // uma lista vazia que o utilizador nao percebe porque nunca enche (CA-006.5).
  if (!disponivel) {
    return (
      <div className={estilos.grupo}>
        <p className={estilos.titulo}>Favoritos indisponíveis neste navegador</p>
      </div>
    );
  }

  if (total === 0) {
    return <NadaCadastrado conjunto="favoritos" />;
  }

  const eventosMarcados = eventos.filter((evento) => estaFavorito('evento', evento.id));
  const jogosMarcados = jogos.filter((jogo) => estaFavorito('jogo', jogo.id));

  return (
    <>
      {eventosMarcados.length > 0 ? (
        <section className={estilos.grupo} aria-labelledby="favoritos-eventos">
          <h3 className={estilos.titulo} id="favoritos-eventos">
            Eventos
          </h3>
          {eventosMarcados.map((evento) => (
            <CartaoEvento evento={evento} key={evento.id} />
          ))}
        </section>
      ) : null}

      {jogosMarcados.length > 0 ? (
        <section className={estilos.grupo} aria-labelledby="favoritos-jogos">
          <h3 className={estilos.titulo} id="favoritos-jogos">
            Jogos
          </h3>
          <ul className={estilos.grelha} role="list">
            {jogosMarcados.map((jogo) => (
              <li key={jogo.id}>
                <CartaoJogo jogo={jogo} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
