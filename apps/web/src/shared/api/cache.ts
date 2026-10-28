/*
 * Cache em memoria, de validade curta, para as leituras da api.
 *
 * **O que isto NAO e:** nao e uma camada de estado de servidor nem substitui uma
 * biblioteca como o TanStack Query. Nao invalida por mutacao, nao revalida ao voltar
 * a janela e nao sincroniza telas. Se alguma dessas coisas passar a ser precisa, a
 * decisao (DT-017) manda reavaliar em vez de fazer crescer este ficheiro.
 *
 * **O que resolve:** voltar do detalhe para a listagem refazia o pedido e mostrava o
 * esqueleto outra vez. Nao era questao de quota -- o teto de pedidos ao provedor e do
 * `backend`, que tem cache propria (DT-012) -- era o piscar.
 *
 * Vive so na memoria da pagina: recarregar limpa-o, e e isso que se quer. Dados com
 * ate uma hora de atraso ja vem assim do `backend`; o que nao se quer e servir dados
 * antigos a quem pediu explicitamente uma pagina nova.
 */

/** Quanto tempo uma resposta serve para outra montagem. */
const VALIDADE_MS = 30_000;

/**
 * Limite de entradas. Sem ele, uma sessao longa com muitas buscas diferentes faria o
 * mapa crescer sem fim -- cada termo de busca e uma chave propria.
 */
const MAXIMO_ENTRADAS = 50;

interface Entrada {
  readonly valor: unknown;
  readonly expiraEm: number;
}

const entradas = new Map<string, Entrada>();

/** Devolve o valor guardado para esta chave, ou `undefined` se nao houver ou expirou. */
export function lerDoCache(chave: string): unknown | undefined {
  const entrada = entradas.get(chave);

  if (entrada === undefined) {
    return undefined;
  }

  if (Date.now() >= entrada.expiraEm) {
    entradas.delete(chave);
    return undefined;
  }

  // Reinsere para o mapa ficar ordenado por uso recente: e o que torna a remocao
  // abaixo uma politica de "sai o mais antigo a ser usado", e nao "o primeiro posto".
  entradas.delete(chave);
  entradas.set(chave, entrada);

  return entrada.valor;
}

/** Guarda um valor. So se chama com respostas bem sucedidas; falhas nunca entram. */
export function guardarNoCache(chave: string, valor: unknown): void {
  entradas.set(chave, { valor, expiraEm: Date.now() + VALIDADE_MS });

  while (entradas.size > MAXIMO_ENTRADAS) {
    const maisAntiga = entradas.keys().next();

    if (maisAntiga.done === true) {
      break;
    }

    entradas.delete(maisAntiga.value);
  }
}

/** Esvazia o cache. Existe para os testes poderem partir de um estado conhecido. */
export function limparCache(): void {
  entradas.clear();
}
