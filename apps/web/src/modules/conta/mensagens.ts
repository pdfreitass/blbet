/*
 * Texto mostrado ao utilizador quando uma rota de conta falha.
 *
 * A regra geral continua a ser a de `shared/api/erros.ts`: `error.message` e TECNICA
 * e nunca chega a tela (DIV-F01). O que muda aqui e que o MESMO codigo de erro quer
 * dizer coisas diferentes consoante o ecra -- um `401` na entrada e "a senha nao
 * confere", e em qualquer outro sitio e "a sessao acabou". Por isso o contexto e um
 * parametro, e nao se le o `message` para adivinhar.
 */

import type { FalhaApi } from '../../shared/api/erros';

export type ContextoConta =
  | 'entrada'
  | 'cadastro'
  | 'verificacao'
  | 'recuperacao'
  | 'redefinicao'
  | 'senha'
  | 'sessoes';

/**
 * Um `429` nestes ecras e quase sempre o travao por tentativas (A-A4), que dispara
 * **mesmo com a senha certa**. Dizer "verifique a senha" seria mandar o utilizador
 * corrigir o que nao esta errado.
 *
 * Nota: o contrato nao da forma de distinguir este `429` do limite geral da api sem
 * ler `error.message`, que e tecnico. Enquanto assim for, os dois casos levam este
 * texto, que serve para ambos -- em qualquer deles a saida e esperar.
 */
const DEMASIADAS_TENTATIVAS =
  'Demasiadas tentativas seguidas. Aguarde um momento e tente de novo — isto pode acontecer mesmo com os dados certos.';

export function mensagemDeConta(falha: FalhaApi, contexto: ContextoConta): string {
  if (falha.codigo === 'RATE_LIMITED') {
    return DEMASIADAS_TENTATIVAS;
  }

  // Token de verificacao ou de redefinicao gasto, errado ou fora de prazo. O servidor
  // marca-o no campo (`body.token`), e e isso que se usa -- nao o texto tecnico.
  if (falha.codigo === 'VALIDATION_FAILED' && falha.issue === 'invalid_value') {
    if (contexto === 'verificacao') {
      return 'Esta ligação já foi usada ou expirou. Peça uma nova a partir da entrada.';
    }

    if (contexto === 'redefinicao') {
      return 'Esta ligação de recuperação já foi usada ou expirou. Peça outra.';
    }
  }

  if (falha.codigo === 'UNAUTHENTICATED') {
    if (contexto === 'entrada') {
      // Nunca "esse e-mail não existe": diria quem tem conta (A-A2).
      return 'E-mail ou senha incorretos.';
    }

    if (contexto === 'senha') {
      /*
       * O contrato devolve `UNAUTHENTICATED` tanto para "a senha atual nao confere"
       * como para "a sessao ja nao e valida", e a interface tinha de fazer coisas
       * opostas nos dois casos. Enquanto nao houver forma de os distinguir, o texto
       * cobre os dois e nao expulsa ninguem do ecra. Pendencia registada no quadro.
       */
      return 'Não foi possível alterar a senha. Confirme a senha atual; se o problema persistir, entre de novo.';
    }

    return 'A sua sessão terminou. Entre de novo para continuar.';
  }

  if (falha.codigo === 'FORBIDDEN') {
    if (contexto === 'entrada') {
      return 'A sua conta ainda não está confirmada ou não está ativa. Abra a mensagem que lhe enviámos por e-mail.';
    }

    return 'A sua conta não tem acesso a isto.';
  }

  if (falha.codigo === 'NOT_FOUND' && contexto === 'sessoes') {
    return 'Esse dispositivo já não consta da lista.';
  }

  // Fora destes casos, a mensagem geral da aplicacao ja serve.
  return falha.mensagem;
}
