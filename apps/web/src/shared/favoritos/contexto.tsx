import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import {
  chaveDe,
  guardarFavoritos,
  lerFavoritos,
  type ChaveFavorito,
  type TipoItem,
} from './armazenamento';

interface ValorFavoritos {
  /** `false` quando o armazenamento local nao responde: a interface esconde o indicador. */
  readonly disponivel: boolean;
  readonly estaFavorito: (tipo: TipoItem, id: string) => boolean;
  readonly alternar: (tipo: TipoItem, id: string) => void;
  /** Os ids favoritados de um tipo, para a visualizacao que os reune (RF-006). */
  readonly idsDe: (tipo: TipoItem) => readonly string[];
  readonly total: number;
}

const ContextoFavoritos = createContext<ValorFavoritos | null>(null);

/**
 * Estado partilhado dos favoritos.
 *
 * O estado inicial e lido UMA vez, na inicializacao preguicosa do `useState`: ler em
 * cada render tocaria o armazenamento a cada atualizacao, e ler num efeito faria o
 * indicador aparecer desmarcado antes de se corrigir, que e exatamente o salto visual
 * que CA-006.1 e RF-008 proibem.
 */
export function FavoritosProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState(() => {
    const { chaves, disponivel } = lerFavoritos();
    return { chaves: new Set<ChaveFavorito>(chaves), disponivel };
  });

  const alternar = useCallback((tipo: TipoItem, id: string) => {
    setEstado((anterior) => {
      const chave = chaveDe(tipo, id);
      const seguinte = new Set(anterior.chaves);

      if (seguinte.has(chave)) {
        seguinte.delete(chave);
      } else {
        seguinte.add(chave);
      }

      // A tela atualiza mesmo que a escrita falhe (CA-006.1): o que se perde e a
      // persistencia, nao a resposta ao toque. Se a escrita falhar, o indicador
      // desaparece a seguir, porque `disponivel` passa a false -- sem erro tecnico.
      const guardou = guardarFavoritos([...seguinte]);

      return { chaves: seguinte, disponivel: anterior.disponivel && guardou };
    });
  }, []);

  const valor = useMemo<ValorFavoritos>(
    () => ({
      disponivel: estado.disponivel,
      estaFavorito: (tipo, id) => estado.chaves.has(chaveDe(tipo, id)),
      alternar,
      idsDe: (tipo) =>
        [...estado.chaves]
          .filter((chave) => chave.startsWith(`${tipo}:`))
          .map((chave) => chave.slice(tipo.length + 1)),
      total: estado.chaves.size,
    }),
    [estado, alternar],
  );

  return <ContextoFavoritos.Provider value={valor}>{children}</ContextoFavoritos.Provider>;
}

/** Falha cedo e com mensagem clara se alguem usar o hook fora do provedor. */
export function useFavoritos(): ValorFavoritos {
  const valor = useContext(ContextoFavoritos);

  if (valor === null) {
    throw new Error('useFavoritos exige <FavoritosProvider> acima na árvore.');
  }

  return valor;
}
