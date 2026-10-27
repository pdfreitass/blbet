import { useFavoritos } from '../favoritos/contexto';
import type { TipoItem } from '../favoritos/armazenamento';
import estilos from './IndicadorFavorito.module.css';

interface IndicadorFavoritoProps {
  tipo: TipoItem;
  id: string;
  /** O que esta a ser favoritado, para o nome acessivel descrever a acao E o alvo. */
  nome: string;
}

/** Contorno quando nao e favorito, preenchido quando e. A forma carrega o estado. */
const ESTRELA_VAZIA = '☆';
const ESTRELA_CHEIA = '★';

/**
 * Botao de alternancia de favorito (design-system 9.6).
 *
 * Com o armazenamento local indisponivel, NAO se desenha: um controle que nao guarda
 * nada e pior do que controle nenhum, e CA-006.5 exige que a aplicacao continue
 * navegavel sem erro tecnico na tela.
 */
export function IndicadorFavorito({ tipo, id, nome }: IndicadorFavoritoProps) {
  const { disponivel, estaFavorito, alternar } = useFavoritos();

  if (!disponivel) {
    return null;
  }

  const marcado = estaFavorito(tipo, id);

  return (
    <button
      type="button"
      className={estilos.indicador}
      aria-pressed={marcado}
      // Descreve a acao E o alvo: "Favoritos" sozinho nao diz de que item se trata
      // quando se navega por lista de botoes.
      aria-label={marcado ? `Remover ${nome} dos favoritos` : `Adicionar ${nome} aos favoritos`}
      onClick={() => alternar(tipo, id)}
    >
      <span aria-hidden="true">{marcado ? ESTRELA_CHEIA : ESTRELA_VAZIA}</span>
    </button>
  );
}
