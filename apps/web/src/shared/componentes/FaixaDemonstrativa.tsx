import estilos from './FaixaDemonstrativa.module.css';

/**
 * Declaracao permanente da natureza da plataforma (CA-001.4, RN-001). Sem botao de
 * fechar, de proposito: o utilizador nao pode dispensar esta informacao.
 *
 * O TEXTO MUDOU em 2026-10-27, com a entrada dos dados reais da T-015. Antes dizia que
 * "todos os valores exibidos sao ficticios", o que deixou de ser verdade: as cotacoes
 * esportivas vêm agora de uma fonte externa real (DT-002, DT-009). Uma faixa que
 * afirma algo falso e pior do que faixa nenhuma, e contraria o principio P5 do
 * design-system -- sinal honesto.
 *
 * O que continua rigorosamente verdadeiro, e e o que importa: nao ha apostas,
 * depositos, saques nem pagamentos (RN-001, RN-003, RN-004).
 *
 * A distincao item a item e a **opcao A** (DT-014): marca-se so o ficticio. Esta faixa
 * e que diz de que tipo e cada area -- e por isso que o dado real nao precisa de selo.
 */
export function FaixaDemonstrativa() {
  return (
    <aside className={estilos.faixa} aria-label="Natureza da plataforma">
      <span className={estilos.icone} aria-hidden="true">
        ⓘ
      </span>
      <p>
        <span className={estilos.destaque}>Plataforma demonstrativa.</span>{' '}
        Não há apostas, depósitos, saques nem pagamentos. As cotações esportivas vêm de
        uma fonte externa e são meramente informativas; o cassino e os restantes valores
        são fictícios.
      </p>
    </aside>
  );
}
