/*
 * Formatacao de odds -- PONTO UNICO.
 *
 * A ENTRADA segue a regra A5 da seccao 9.1 de docs/api-contract.md, acordada entre os
 * dois agentes: texto decimal com ponto, sem separador de milhares, sem sinal e sem
 * notacao cientifica, com numero fixo de casas por campo. Uma odd indisponivel e
 * `null`, nunca texto vazio. Texto, e nao numero, para nao perder precisao no
 * caminho -- e por isso a conversao para numero NAO acontece aqui.
 *
 * A SAIDA nao esta decidida (PD-007; PC-006 continua dependente de BLQ-001 para o
 * numero de casas). O design-system (seccao 9.3) exige que a decisao mude um so lugar
 * e que CA-003.2 -- formato identico em todas as telas -- seja verificavel por teste.
 *
 * Formato provisorio de exibicao: as casas que o servidor enviar, com virgula.
 */

/** Texto exibido quando a odd nao esta disponivel. Nunca uma cadeia vazia. */
const ODD_INDISPONIVEL = '—';

/**
 * Texto decimal aceite pela regra A5: digitos, ponto opcional, digitos. Sem sinal,
 * sem espacos, sem separador de milhares e sem expoente.
 */
const DECIMAL_A5 = /^\d+(\.\d+)?$/;

/**
 * Formata uma odd para exibicao.
 *
 * Valor ausente, mal formado ou nao positivo devolve `ODD_INDISPONIVEL`: a interface
 * nunca mostra `NaN` nem um texto do servidor que nao seja uma cotacao. Um valor que
 * viole a regra A5 e tratado como indisponivel em vez de ser exibido como veio --
 * exibi-lo seria dar por boa uma resposta que o contrato nao permite.
 */
export function formatarOdd(valor: string | null | undefined): string {
  if (valor === null || valor === undefined) {
    return ODD_INDISPONIVEL;
  }

  if (!DECIMAL_A5.test(valor)) {
    return ODD_INDISPONIVEL;
  }

  if (Number(valor) <= 0) {
    return ODD_INDISPONIVEL;
  }

  return valor.replace('.', ',');
}
