import type { FalhaApi } from '../api/erros';
import estilos from './MaisResultados.module.css';

interface MaisResultadosProps {
  /** `null` quando não há mais páginas: o componente mostra o fim da lista. */
  carregarMais: (() => void) | null;
  carregando: boolean;
  falha: FalhaApi | null;
  /** O que está a ser listado, para o texto do fim e para o nome acessível. */
  conjunto: string;
}

/**
 * Fim de uma lista paginada.
 *
 * Mostra sempre alguma coisa: a ação de carregar mais, o estado de carregamento, a
 * falha com nova tentativa, ou a confirmação de que a lista acabou. Uma lista que
 * simplesmente termina deixa o utilizador sem saber se viu tudo ou se faltou carregar.
 */
export function MaisResultados({ carregarMais, carregando, falha, conjunto }: MaisResultadosProps) {
  if (falha !== null) {
    return (
      <div className={estilos.area}>
        <div className={estilos.falha} role="alert">
          <p className={estilos.mensagem}>{falha.mensagem}</p>
          {/* Repetir só quando o servidor disse que vale a pena (A1). */}
          {falha.retryable && carregarMais !== null ? (
            <button type="button" className={estilos.botao} onClick={carregarMais}>
              Tentar novamente
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  if (carregarMais === null) {
    return (
      <div className={estilos.area}>
        <p className={estilos.fim}>{`Fim da lista de ${conjunto}.`}</p>
      </div>
    );
  }

  return (
    <div className={estilos.area}>
      <button
        type="button"
        className={estilos.botao}
        onClick={carregarMais}
        disabled={carregando}
        // Enquanto carrega, o nome acessível diz o que está a acontecer, e não só
        // que o botão está desativado.
        aria-label={carregando ? `A carregar mais ${conjunto}` : `Carregar mais ${conjunto}`}
      >
        {carregando ? 'A carregar…' : 'Carregar mais'}
      </button>
    </div>
  );
}
