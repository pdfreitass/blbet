import estilos from './CampoBusca.module.css';

interface CampoBuscaProps {
  termo: string;
  onAlterar: (termo: string) => void;
  /**
   * Contagem de resultados, anunciada por regiao viva polida. E texto da interface,
   * nao dado ficticio: nao leva campo tracejado (design-system 6.3).
   */
  contagem: number;
}

/**
 * O escopo da busca e PD-003, aberto: este componente e agnostico quanto ao que
 * pesquisa -- recebe o termo e devolve o termo, e quem chama decide o que filtrar.
 */
export function CampoBusca({ termo, onAlterar, contagem }: CampoBuscaProps) {
  const temConteudo = termo.length > 0;

  return (
    <div className={estilos.campo}>
      <label className={estilos.rotulo} htmlFor="busca">
        Buscar
      </label>
      <div className={estilos.controle}>
        <span className={estilos.icone} aria-hidden="true">
          ⌕
        </span>
        <input
          id="busca"
          type="search"
          className={estilos.entrada}
          value={termo}
          placeholder="Competição, participante ou esporte"
          onChange={(evento) => onAlterar(evento.target.value)}
        />
        {/* Aparece so com conteudo, e tem nome acessivel (nao e so o "x"). */}
        {temConteudo ? (
          <button
            type="button"
            className={estilos.limpar}
            aria-label="Limpar a busca"
            onClick={() => onAlterar('')}
          >
            <span aria-hidden="true">×</span>
          </button>
        ) : null}
      </div>
      <p className={estilos.contagem} role="status" aria-live="polite">
        {temConteudo ? descreverContagem(contagem) : 'Digite para buscar entre os eventos.'}
      </p>
    </div>
  );
}

function descreverContagem(contagem: number): string {
  if (contagem === 0) {
    return 'Nenhum resultado.';
  }

  if (contagem === 1) {
    return '1 resultado.';
  }

  return `${contagem} resultados.`;
}
