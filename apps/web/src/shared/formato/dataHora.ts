/*
 * Formatacao de data e hora de evento -- ponto unico, pela mesma razao de odd.ts.
 *
 * A ENTRADA e o texto do contrato: ISO 8601 em UTC com `Z` (PC-005). A conversao para
 * a hora local acontece aqui e so aqui, que e o que o contrato manda.
 *
 * O fuso NAO e forcado: usa-se o do dispositivo, que e o que o utilizador espera ver.
 */

/** Converte o texto do contrato num instante, ou `null` se nao for legivel. */
function instanteDe(iso: string): Date | null {
  const instante = new Date(iso);

  return Number.isNaN(instante.getTime()) ? null : instante;
}

/** Hora curta, 24 horas: `19:45`. Texto invalido devolve cadeia vazia. */
export function formatarHora(iso: string): string {
  const instante = instanteDe(iso);

  if (instante === null) {
    return '';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(instante);
}

/** Dia e mes curtos: `03/11`. Mesma regra para texto invalido. */
export function formatarDiaMes(iso: string): string {
  const instante = instanteDe(iso);

  if (instante === null) {
    return '';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(instante);
}

/** Forma longa e legivel, para o nome acessivel do cartao de evento. */
export function descreverInstante(iso: string): string {
  const instante = instanteDe(iso);

  if (instante === null) {
    return 'data indisponível';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(instante);
}
