import { render, type RenderResult } from '@testing-library/react';
import type { ReactElement } from 'react';

import { FavoritosProvider } from '../shared/favoritos/contexto';

/**
 * Renderiza com os provedores que a aplicacao tem a volta.
 *
 * Um componente que use favoritos lanca sem o provedor, de proposito: e melhor um
 * teste que falha com mensagem clara do que um contexto por omissao que esconde um
 * componente montado fora do sitio.
 */
export function renderizar(elemento: ReactElement): RenderResult {
  return render(<FavoritosProvider>{elemento}</FavoritosProvider>);
}
