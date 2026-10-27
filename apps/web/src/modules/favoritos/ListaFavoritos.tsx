import { useCallback } from 'react';

import { obterEventos } from '../../shared/api/esportes';
import { useRecurso } from '../../shared/api/useRecurso';
import { EsqueletoLista, EstadoErro, NadaCadastrado } from '../../shared/componentes/Estados';
import { useFavoritos } from '../../shared/favoritos/contexto';
import { CartaoJogo } from '../cassino/CartaoJogo';
import type { JogoDemonstrativo } from '../cassino/tipos';
import { CartaoEvento } from '../esportes/CartaoEvento';
import estilos from './ListaFavoritos.module.css';

interface ListaFavoritosProps {
  jogos: readonly JogoDemonstrativo[];
}

/** O mesmo limite da listagem: os favoritos sao poucos e vêm desta mesma página. */
const EVENTOS_POR_PAGINA = 30;

/**
 * Reune o que foi favoritado (RF-006). Desmarcar remove daqui de imediato, porque a
 * lista deriva do estado partilhado e nao de uma copia (CA-006.3).
 *
 * Os eventos sao cruzados com a listagem da api em vez de serem pedidos um a um: com
 * 150 pedidos por dia (DT-009), um pedido por favorito seria desperdicio. A
 * consequencia e visivel e esta dita ao utilizador: um jogo favoritado que ja comecou
 * deixa de vir na listagem (DT-010) e por isso nao aparece aqui.
 */
export function ListaFavoritos({ jogos }: ListaFavoritosProps) {
  const { disponivel, estaFavorito, idsDe, total } = useFavoritos();
  const temEventosMarcados = idsDe('evento').length > 0;

  const carregar = useCallback(
    (opcoes: { signal: AbortSignal }) => obterEventos({ limit: EVENTOS_POR_PAGINA }, opcoes),
    [],
  );
  const { carregando, dados, falha, repetir } = useRecurso(carregar, []);

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

  const jogosMarcados = jogos.filter((jogo) => estaFavorito('jogo', jogo.id));
  const eventosMarcados = (dados?.data ?? []).filter((evento) => estaFavorito('evento', evento.id));
  const marcadosForaDaListagem = idsDe('evento').length - eventosMarcados.length;

  return (
    <>
      {temEventosMarcados && carregando ? (
        <EsqueletoLista descricao="os jogos favoritados" linhas={2} />
      ) : null}

      {/* A falha a carregar os eventos nao esconde os jogos favoritados, que nao
          dependem da api. */}
      {temEventosMarcados && !carregando && falha !== null ? (
        <EstadoErro
          mensagem={falha.mensagem}
          {...(repetir === null ? {} : { onTentarNovamente: repetir })}
        />
      ) : null}

      {eventosMarcados.length > 0 ? (
        <section className={estilos.grupo} aria-labelledby="favoritos-eventos">
          <h3 className={estilos.titulo} id="favoritos-eventos">
            Jogos esportivos
          </h3>
          {eventosMarcados.map((evento) => (
            <CartaoEvento evento={evento} key={evento.id} />
          ))}
        </section>
      ) : null}

      {!carregando && falha === null && marcadosForaDaListagem > 0 ? (
        <p className={estilos.aviso}>
          {marcadosForaDaListagem === 1
            ? '1 jogo favoritado já começou e deixou de estar disponível.'
            : `${marcadosForaDaListagem} jogos favoritados já começaram e deixaram de estar disponíveis.`}
        </p>
      ) : null}

      {jogosMarcados.length > 0 ? (
        <section className={estilos.grupo} aria-labelledby="favoritos-jogos">
          <h3 className={estilos.titulo} id="favoritos-jogos">
            Jogos de cassino
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
