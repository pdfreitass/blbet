/*
 * Acesso a api. UM ponto: nenhum componente chama `fetch` por sua conta.
 *
 * Em desenvolvimento, o servidor do Vite encaminha `/api` para a api local (acordo da
 * T-013), por isso o caminho e relativo e nao ha endereco nenhum em variavel.
 *
 * NUNCA lanca: devolve um resultado discriminado. Uma excecao a atravessar a arvore
 * de componentes transformaria uma falha prevista -- a api em baixo -- num ecra
 * branco, que e exatamente o que RF-008 proibe.
 */

import { apiErrorSchema } from '@blbet/contracts';

import { guardarNoCache, lerDoCache } from './cache';

import { mensagemDe, type FalhaApi } from './erros';

/**
 * O que este modulo precisa de um esquema: validar sem lancar.
 *
 * Descrito pela forma, e nao importado de `zod`, para que `apps/web` nao passe a ter
 * a biblioteca como dependencia direta so por causa de uma assinatura. Os esquemas
 * continuam a ser os do pacote de contratos.
 */
export interface Validador<T> {
  safeParse(valor: unknown): { success: true; data: T } | { success: false };
}

export type Resultado<T> = { readonly ok: true; readonly dados: T } | { readonly ok: false; readonly falha: FalhaApi };

export interface OpcoesPedido {
  /** Sinal de cancelamento, para abandonar um pedido que deixou de interessar. */
  readonly signal?: AbortSignal;
  /**
   * Vai a rede mesmo havendo resposta recente guardada.
   *
   * Usado quando o utilizador pede explicitamente para recarregar -- "Tentar
   * novamente", ou a lista a recomecar depois de um cursor obsoleto. Nesses casos
   * servir o cache daria a mesma resposta e o pedido pareceria nao ter feito nada.
   */
  readonly ignorarCache?: boolean;
}

/** Lancado so para interromper: quem chama distingue-o de uma falha a mostrar. */
export class PedidoCancelado extends Error {}

/**
 * Faz o pedido e valida a resposta contra o esquema do contrato.
 *
 * Uma resposta que nao obedece ao contrato e tratada como falha, e nao exibida: dar
 * por boa uma resposta que o contrato nao permite e pior do que dizer que nao se
 * conseguiu ler.
 */
export async function pedir<T>(
  caminho: string,
  schema: Validador<T>,
  opcoes: OpcoesPedido = {},
): Promise<Resultado<T>> {
  /*
   * Resposta recente para este mesmo caminho serve (DT-016): evita que voltar do
   * detalhe para a listagem mostre o esqueleto outra vez. A chave e o caminho
   * completo, com a query, por isso cada pagina e cada termo de busca sao entradas
   * distintas.
   */
  const guardado = opcoes.ignorarCache === true ? undefined : lerDoCache(caminho);

  if (guardado !== undefined) {
    const analisadoDoCache = schema.safeParse(guardado);

    // Se o que esta no cache ja nao bate certo com o esquema -- por exemplo depois de
    // o contrato mudar durante o desenvolvimento -- ignora-se e vai-se a rede.
    if (analisadoDoCache.success) {
      return { ok: true, dados: analisadoDoCache.data };
    }
  }

  let resposta: Response;

  try {
    resposta = await fetch(caminho, {
      headers: { Accept: 'application/json' },
      // `signal: undefined` nao passa com `exactOptionalPropertyTypes`; `null` e o
      // valor que a API de fetch aceita para "sem cancelamento".
      signal: opcoes.signal ?? null,
    });
  } catch (erro) {
    if (erro instanceof DOMException && erro.name === 'AbortError') {
      throw new PedidoCancelado();
    }

    // Rede em baixo, DNS, servidor desligado: nao ha corpo nenhum para ler.
    return falhar('SEM_LIGACAO', true);
  }

  const corpo: unknown = await lerJson(resposta);

  if (!resposta.ok) {
    const erro = apiErrorSchema.safeParse(corpo);

    if (!erro.success) {
      // Estado de erro sem o envelope acordado: nao se inventa um codigo, mas o
      // ESTADO HTTP ainda diz alguma coisa. Acontece quando a resposta nem chega a
      // vir da api -- com a api desligada, o proxy do Vite responde 502 com HTML.
      // Nesse caso repetir e exatamente o que resolve, e nao oferecer repetir deixa o
      // utilizador sem saida. Quando o servidor fala o contrato, o `retryable` dele
      // continua a mandar; isto e so para quando nao ha contrato nenhum na resposta.
      return falhar('RESPOSTA_INVALIDA', ehEstadoRepetivel(resposta.status));
    }

    const { code, retryable, details } = erro.data.error;
    const issue = details?.[0]?.issue;

    // `exactOptionalPropertyTypes` esta ligado: a chave so entra quando ha valor, em
    // vez de entrar com `undefined`.
    return {
      ok: false,
      falha: {
        codigo: code,
        // Do SERVIDOR (A1). Acrescentar um codigo de erro novo nao quebra isto.
        retryable,
        ...(issue === undefined ? {} : { issue }),
        mensagem: mensagemDe(code, issue),
      },
    };
  }

  const analisado = schema.safeParse(corpo);

  if (!analisado.success) {
    return falhar('RESPOSTA_INVALIDA', false);
  }

  // So respostas bem sucedidas e validas entram no cache. Falhas nunca, para que
  // "Tentar novamente" va mesmo a rede.
  guardarNoCache(caminho, corpo);

  return { ok: true, dados: analisado.data };
}

async function lerJson(resposta: Response): Promise<unknown> {
  try {
    return await resposta.json();
  } catch {
    return null;
  }
}

/**
 * Vale a pena repetir perante este estado HTTP?
 *
 * Usado SO quando a resposta nao traz o envelope do contrato. `5xx` e falha do lado
 * do servidor ou de um intermediario e costuma passar; `408` e `429` pedem
 * explicitamente para tentar mais tarde. Um `4xx` e um pedido que esta mal, e
 * repeti-lo da o mesmo.
 */
function ehEstadoRepetivel(estado: number): boolean {
  return estado >= 500 || estado === 408 || estado === 429;
}

function falhar(codigo: FalhaApi['codigo'], retryable: boolean): Resultado<never> {
  return { ok: false, falha: { codigo, retryable, mensagem: mensagemDe(codigo) } };
}
