import estilos from './NavegacaoPrincipal.module.css';

/** Os cinco destinos de RF-001. Um so conjunto, usado nos dois arranjos. */
export const DESTINOS = [
  { id: 'esportes', rotulo: 'Esportes', icone: '◎' },
  { id: 'cassino', rotulo: 'Cassino', icone: '◈' },
  { id: 'busca', rotulo: 'Busca', icone: '⌕' },
  { id: 'favoritos', rotulo: 'Favoritos', icone: '☆' },
  { id: 'perfil', rotulo: 'Perfil', icone: '◐' },
] as const;

export type IdDestino = (typeof DESTINOS)[number]['id'];

interface NavegacaoPrincipalProps {
  destinoAtivo: IdDestino;
  onNavegar: (destino: IdDestino) => void;
}

/**
 * Dois arranjos do MESMO componente (design-system 9.7): barra no fundo abaixo de
 * 600px, navegacao no topo a partir dai. A troca e so de CSS.
 *
 * Os destinos sao botoes e nao ligacoes porque ainda nao existe roteamento: a escolha
 * de biblioteca de rotas nao esta decidida e nao instalo dependencia por omissao.
 * Quando existir, cada destino passa a ligacao com `href` e o `aria-current` mantem-se.
 */
export function NavegacaoPrincipal({ destinoAtivo, onNavegar }: NavegacaoPrincipalProps) {
  return (
    <nav className={estilos.navegacao} aria-label="Navegação principal">
      <ul className={estilos.lista} role="list">
        {DESTINOS.map((destino) => {
          const ativo = destino.id === destinoAtivo;

          return (
            <li className={estilos.item} key={destino.id}>
              <button
                type="button"
                className={estilos.destino}
                aria-current={ativo ? 'page' : undefined}
                onClick={() => onNavegar(destino.id)}
              >
                {/* O icone nunca e o unico portador de significado (RNF-002): o
                    rotulo esta sempre visivel ao lado. */}
                <span className={estilos.icone} aria-hidden="true">
                  {destino.icone}
                </span>
                {destino.rotulo}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
