import estilos from './Estados.module.css';

/* --- Carregamento ------------------------------------------------------ */

interface EsqueletoListaProps {
  /** Quantas linhas de esqueleto mostrar. Igual ao numero esperado de itens. */
  linhas?: number;
  /** O que esta a carregar, para a regiao viva anunciar. */
  descricao: string;
}

const LINHAS_ESQUELETO_POR_OMISSAO = 3;

/**
 * Esqueleto com a forma do conteudo futuro (design-system 9.1). `aria-busy` no
 * contentor e regiao viva polida para anunciar a conclusao (CA-008.1, RNF-002).
 * A pulsacao e suprimida por `prefers-reduced-motion` na regra global.
 */
export function EsqueletoLista({
  linhas = LINHAS_ESQUELETO_POR_OMISSAO,
  descricao,
}: EsqueletoListaProps) {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="visually-hidden">{`Carregando ${descricao}`}</span>
      {Array.from({ length: linhas }, (_, indice) => (
        <div className={estilos.esqueleto} key={indice} aria-hidden="true">
          <div className={`${estilos.barra} ${estilos.barraLonga}`} />
          <div className={`${estilos.barra} ${estilos.barraCurta}`} />
        </div>
      ))}
    </div>
  );
}

/* --- Erro -------------------------------------------------------------- */

interface EstadoErroProps {
  /**
   * Mensagem compreensivel, SEM detalhe tecnico (RNF-004, CA-008.2). Nenhum rastreio,
   * caminho de ficheiro ou codigo interno chega a tela.
   */
  mensagem: string;
  /**
   * Nova tentativa apenas quando a operacao for repetivel. Ausente => sem botao:
   * um botao que nao resolve nada e pior do que nenhum.
   */
  onTentarNovamente?: () => void;
}

export function EstadoErro({ mensagem, onTentarNovamente }: EstadoErroProps) {
  return (
    <div className={estilos.bloco} role="alert">
      <span className={`${estilos.marca} ${estilos.marcaErro}`} aria-hidden="true">
        ⚠
      </span>
      <h2 className={estilos.titulo}>Não foi possível carregar</h2>
      <p className={estilos.mensagem}>{mensagem}</p>
      {onTentarNovamente ? (
        <button type="button" className={estilos.acao} onClick={onTentarNovamente}>
          Tentar novamente
        </button>
      ) : null}
    </div>
  );
}

/* --- Vazio: dois componentes distintos, nao um com texto variavel ------- */
/* CA-008.3 exige que os dois casos sejam textualmente distintos.           */

interface NadaCadastradoProps {
  /** O que nao existe, em minusculas: "eventos", "jogos", "favoritos". */
  conjunto: string;
}

/** O conjunto esta vazio na origem -- nao ha critério de busca aplicado. */
export function NadaCadastrado({ conjunto }: NadaCadastradoProps) {
  return (
    <div className={estilos.bloco}>
      <span className={`${estilos.marca} ${estilos.marcaVazio}`} aria-hidden="true">
        ∅
      </span>
      <h2 className={estilos.titulo}>{`Ainda não há ${conjunto}`}</h2>
      <p className={estilos.mensagem}>
        {`Nenhum ${conjunto.replace(/s$/, '')} foi cadastrado nesta área do protótipo. Quando houver, aparece aqui.`}
      </p>
    </div>
  );
}

interface NadaEncontradoProps {
  /** O critério aplicado, mostrado ao utilizador (CA-005.2). */
  criterio: string;
  /** Caminho de saida: limpar filtros ou voltar a listagem (CA-005.4, CA-008.4). */
  onLimpar: () => void;
  /** Texto do caminho de saida. */
  rotuloLimpar?: string;
}

/** Ha critério de busca ou filtro aplicado e nada corresponde. */
export function NadaEncontrado({
  criterio,
  onLimpar,
  rotuloLimpar = 'Limpar filtros',
}: NadaEncontradoProps) {
  return (
    <div className={estilos.bloco}>
      <span className={`${estilos.marca} ${estilos.marcaVazio}`} aria-hidden="true">
        ⌕
      </span>
      <h2 className={estilos.titulo}>Nada encontrado</h2>
      <p className={estilos.mensagem}>
        {'Nenhum resultado para '}
        <span className={estilos.criterio}>{criterio}</span>
        {'. Tente outro termo ou remova os filtros.'}
      </p>
      <button type="button" className={estilos.acao} onClick={onLimpar}>
        {rotuloLimpar}
      </button>
    </div>
  );
}
