/*
 * Substitui `fetch` nos testes, com respostas controladas.
 *
 * Nao e uma api a fingir: cada resposta e um corpo que o contrato permite, e os
 * exemplos em `fixtures.ts` sao validados pelos esquemas reais.
 */

import { vi } from 'vitest';

export interface RespostaFalsa {
  readonly estado: number;
  readonly corpo: unknown;
}

/** Decide a resposta a partir do caminho pedido. */
export type Encaminhador = (url: string) => RespostaFalsa;

export function instalarServidorFalso(encaminhar: Encaminhador): void {
  vi.stubGlobal(
    'fetch',
    vi.fn((entrada: RequestInfo | URL) => {
      const url = typeof entrada === 'string' ? entrada : String(entrada);
      const { estado, corpo } = encaminhar(url);

      /*
       * `204` nao pode ter corpo: o construtor de `Response` recusa-o. As rotas de
       * conta (DT-020) respondem assim, e sem esta distincao o servidor falso
       * lancava em vez de responder.
       */
      const temCorpo = estado !== 204 && estado !== 205 && estado !== 304;

      return Promise.resolve(
        new Response(temCorpo ? JSON.stringify(corpo) : null, {
          status: estado,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }),
  );
}

/** Responde sempre o mesmo, seja qual for o caminho. */
export function responderSempre(estado: number, corpo: unknown): void {
  instalarServidorFalso(() => ({ estado, corpo }));
}
