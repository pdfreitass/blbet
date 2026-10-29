/*
 * Traducao de uma falha da api para o que a interface mostra.
 *
 * Regras que vêm do contrato e dos requisitos:
 *   - `error.message` e TECNICA e nunca chega a tela (DIV-F01, RNF-004, CA-008.2);
 *   - `retryable` e decidido pelo SERVIDOR (A1), nao adivinhado aqui;
 *   - nenhum rastreio, codigo interno ou caminho de ficheiro aparece ao utilizador.
 */

import type { ErrorCode, IssueCode } from '@blbet/contracts';

export interface FalhaApi {
  /** Codigo estavel do contrato, ou `'RESPOSTA_INVALIDA'` quando nem isso se percebeu. */
  readonly codigo: ErrorCode | 'RESPOSTA_INVALIDA' | 'SEM_LIGACAO';
  /** Decidido pelo servidor (A1). Quando nao ha resposta, decide-se pela natureza da falha. */
  readonly retryable: boolean;
  /** Motivo por campo, quando o servidor o enviou (PC-003, A2). */
  readonly issue?: IssueCode;
  /** Texto para o utilizador. Compreensivel, sem detalhe tecnico. */
  readonly mensagem: string;
}

const MENSAGEM_POR_CODIGO: Record<FalhaApi['codigo'], string> = {
  VALIDATION_FAILED: 'O pedido não é válido. Tente de novo a partir da listagem.',
  // DT-020. UNAUTHENTICATED leva ao ecrã de entrada; FORBIDDEN não leva a lado nenhum — há
  // sessão, falta é uma condição da conta.
  UNAUTHENTICATED: 'Precisa de entrar na sua conta para continuar.',
  FORBIDDEN: 'A sua conta ainda não tem acesso a isto.',
  NOT_FOUND: 'Não encontrámos o que procurava.',
  RATE_LIMITED: 'Há demasiados pedidos neste momento. Tente daqui a pouco.',
  INTERNAL_ERROR: 'Algo correu mal do nosso lado.',
  UPSTREAM_UNAVAILABLE: 'Os dados esportivos estão indisponíveis neste momento.',
  RESPOSTA_INVALIDA: 'Recebemos uma resposta que não conseguimos ler.',
  SEM_LIGACAO: 'Não foi possível contactar o servidor.',
};

/**
 * Mensagem para o utilizador.
 *
 * O `issue` `event_started` (T14-A1) tem texto proprio: sem ele, um `404` diria "não
 * encontrámos" sobre um jogo que existe e apenas começou -- que e enganador.
 */
export function mensagemDe(codigo: FalhaApi['codigo'], issue?: IssueCode): string {
  if (issue === 'event_started') {
    return 'Este jogo já começou e deixou de estar disponível.';
  }

  return MENSAGEM_POR_CODIGO[codigo];
}
