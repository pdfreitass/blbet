import { Link, useLocation } from 'wouter';

import estilos from './NavegacaoPrincipal.module.css';

/** Os cinco destinos de RF-001. Um so conjunto, usado nos dois arranjos. */
export const DESTINOS = [
  { href: '/', rotulo: 'Esportes', icone: '◎' },
  { href: '/cassino', rotulo: 'Cassino', icone: '◈' },
  { href: '/busca', rotulo: 'Busca', icone: '⌕' },
  { href: '/favoritos', rotulo: 'Favoritos', icone: '☆' },
  { href: '/perfil', rotulo: 'Perfil', icone: '◐' },
] as const;

/**
 * Dois arranjos do MESMO componente (design-system 9.7): barra no fundo abaixo de
 * 600px, navegacao no topo a partir dai. A troca e so de CSS.
 *
 * Os destinos sao LIGACOES, nao botoes (DT-016). Alem de darem endereco a cada area,
 * uma ligacao pode ser aberta noutro separador e e anunciada como ligacao pelo leitor
 * de tela -- um botao que navega mente sobre o que faz.
 */
export function NavegacaoPrincipal() {
  const [caminho] = useLocation();

  return (
    <nav className={estilos.navegacao} aria-label="Navegação principal">
      <ul className={estilos.lista} role="list">
        {DESTINOS.map((destino) => (
          <li className={estilos.item} key={destino.href}>
            <Link
              href={destino.href}
              className={estilos.destino}
              aria-current={ehDestinoAtivo(caminho, destino.href) ? 'page' : undefined}
            >
              {/* O icone nunca e o unico portador de significado (RNF-002): o
                  rotulo esta sempre visivel ao lado. */}
              <span className={estilos.icone} aria-hidden="true">
                {destino.icone}
              </span>
              {destino.rotulo}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * O destino continua marcado quando se esta numa tela abaixo dele.
 *
 * Sem isto, abrir o detalhe de um jogo apagaria a marca de "Cassino" e o utilizador
 * deixaria de ver em que area esta. A raiz e caso a parte, porque e prefixo de tudo.
 */
function ehDestinoAtivo(caminho: string, href: string): boolean {
  if (href === '/') {
    // Esportes cobre a raiz e o detalhe de evento, que vive em /eventos/:id.
    return caminho === '/' || caminho.startsWith('/eventos');
  }

  return caminho === href || caminho.startsWith(`${href}/`);
}
