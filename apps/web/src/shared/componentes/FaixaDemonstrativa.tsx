import estilos from './FaixaDemonstrativa.module.css';

/**
 * Declaracao permanente do carater demonstrativo da plataforma (CA-001.4, RN-001,
 * RN-002). Sem botao de fechar, de proposito: o utilizador nao pode dispensar a
 * informacao de que nada aqui e real.
 */
export function FaixaDemonstrativa() {
  return (
    <aside className={estilos.faixa} aria-label="Natureza da plataforma">
      <span className={estilos.icone} aria-hidden="true">
        ⓘ
      </span>
      <p>
        <span className={estilos.destaque}>Plataforma demonstrativa.</span>{' '}
        Não há apostas, depósitos, saques nem pagamentos. Todos os valores exibidos são
        fictícios e servem apenas para demonstrar a interface.
      </p>
    </aside>
  );
}
