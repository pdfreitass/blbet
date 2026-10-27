/*
 * Persistencia local dos favoritos -- RF-006 e RN-005: no navegador, sem servidor e
 * sem conta de utilizador.
 *
 * REGRA DURA (CA-006.5, RF-006): falha de leitura ou de escrita NAO quebra a
 * interface e NAO mostra erro tecnico. O armazenamento pode estar indisponivel por
 * razoes que nao sao defeito nenhum -- janela privada, cookies de terceiros
 * bloqueados, quota cheia, politica do navegador -- e nesses casos a aplicacao
 * continua navegavel, apenas sem favoritos.
 */

/** Tipos de item que podem ser favoritados (RF-006): um evento esportivo e um jogo. */
export type TipoItem = 'evento' | 'jogo';

/** Chave de um favorito: o tipo e o id, que e texto opaco (PC-004). */
export type ChaveFavorito = `${TipoItem}:${string}`;

export function chaveDe(tipo: TipoItem, id: string): ChaveFavorito {
  return `${tipo}:${id}`;
}

const CHAVE_ARMAZENAMENTO = 'blbet:favoritos';

/** O resultado de ler: o conjunto, e se o armazenamento esta mesmo disponivel. */
export interface LeituraFavoritos {
  readonly chaves: readonly ChaveFavorito[];
  readonly disponivel: boolean;
}

const VAZIO: LeituraFavoritos = { chaves: [], disponivel: false };

/**
 * Le os favoritos guardados.
 *
 * Qualquer falha -- acesso negado, JSON invalido, conteudo com forma inesperada --
 * devolve o conjunto vazio com `disponivel: false`, sem lancar.
 */
export function lerFavoritos(): LeituraFavoritos {
  try {
    const bruto = window.localStorage.getItem(CHAVE_ARMAZENAMENTO);

    if (bruto === null) {
      // Nunca houve nada guardado. O armazenamento responde, portanto esta disponivel.
      return { chaves: [], disponivel: true };
    }

    const analisado: unknown = JSON.parse(bruto);

    if (!Array.isArray(analisado)) {
      // Conteudo de outra versao ou corrompido: trata-se como vazio em vez de falhar.
      return { chaves: [], disponivel: true };
    }

    // Filtrar em vez de confiar: o conteudo do armazenamento e dado externo, e vale a
    // mesma regra de validar nas fronteiras.
    const chaves = analisado.filter((item): item is ChaveFavorito => ehChaveValida(item));

    return { chaves, disponivel: true };
  } catch {
    return VAZIO;
  }
}

/**
 * Guarda os favoritos.
 *
 * Devolve `true` se conseguiu. Um `false` nao e erro a mostrar ao utilizador: e o
 * sinal de que a interface deve degradar para "favoritos indisponiveis".
 */
export function guardarFavoritos(chaves: readonly ChaveFavorito[]): boolean {
  try {
    window.localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(chaves));
    return true;
  } catch {
    return false;
  }
}

function ehChaveValida(item: unknown): boolean {
  if (typeof item !== 'string') {
    return false;
  }

  const separador = item.indexOf(':');

  if (separador <= 0 || separador === item.length - 1) {
    return false;
  }

  const tipo = item.slice(0, separador);

  return tipo === 'evento' || tipo === 'jogo';
}
