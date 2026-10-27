/*
 * Formatacao de odds -- PONTO UNICO.
 *
 * O formato de exibicao NAO esta decidido (PD-007 em docs/requisitos.md; PC-006 em
 * docs/api-contract.md). O design-system (secao 9.3) exige que a decisao mude um so
 * lugar e que CA-003.2 -- formato identico em todas as telas -- seja verificavel por
 * teste. Por isso nenhum componente formata uma odd por conta propria.
 *
 * Formato provisorio: decimal com duas casas, separador do portugues. Quando a PD-007
 * for decidida, muda-se SO esta funcao.
 */

/** Numero de casas decimais do formato provisorio. */
const CASAS_DECIMAIS = 2;

/** Texto exibido quando a odd nao esta disponivel. Nunca uma cadeia vazia. */
const ODD_INDISPONIVEL = '—';

/**
 * Formata uma odd demonstrativa para exibicao.
 *
 * Valor ausente, nao finito ou nao positivo devolve `ODD_INDISPONIVEL`: a interface
 * nunca mostra `NaN`, `Infinity` nem um numero sem sentido como cotacao.
 */
export function formatarOdd(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) {
    return ODD_INDISPONIVEL;
  }

  if (!Number.isFinite(valor) || valor <= 0) {
    return ODD_INDISPONIVEL;
  }

  return valor.toFixed(CASAS_DECIMAIS).replace('.', ',');
}
