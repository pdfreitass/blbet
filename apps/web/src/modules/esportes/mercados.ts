/*
 * Rotulos e ordem de exibicao dos mercados.
 *
 * Ficou acordado na revisao da T-014 que os rotulos visiveis e a ORDEM sao decisao do
 * `frontend`: o contrato traz um objeto, nao uma lista ordenada. A ordem e fixada aqui
 * para que CA-003.2 -- formato e apresentacao identicos em todas as telas -- continue
 * a valer.
 */

/** Resultado final primeiro: e o mercado que o utilizador procura primeiro. */
export const ROTULO_RESULTADO_FINAL = 'Resultado final';

export function rotularTotalGolos(linha: string): string {
  // A linha vem em texto decimal com ponto (A5); a virgula e so apresentacao.
  return `Mais/menos ${linha.replace('.', ',')} gols`;
}

export const ROTULO_CASA = 'Casa';
export const ROTULO_EMPATE = 'Empate';
export const ROTULO_FORA = 'Fora';
export const ROTULO_ACIMA = 'Acima';
export const ROTULO_ABAIXO = 'Abaixo';
