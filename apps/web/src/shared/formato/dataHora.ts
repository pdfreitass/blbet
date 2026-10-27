/*
 * Formatacao de data e hora de evento -- ponto unico, pela mesma razao de odd.ts.
 *
 * O fuso horario NAO e forcado: usa-se o do dispositivo, que e o que o utilizador
 * espera ver. Quando o provedor esportivo existir (BLQ-001) e devolver instantes em
 * UTC, continua a ser este o unico lugar que decide a apresentacao.
 */

/**
 * Hora curta, 24 horas: `19:45`.
 *
 * Instante invalido devolve cadeia vazia, para que o componente decida o que mostrar
 * em vez de imprimir "Invalid Date" na tela.
 */
export function formatarHora(instante: Date): string {
  if (Number.isNaN(instante.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(instante);
}

/** Dia e mes curtos: `03/11`. Mesma regra para instante invalido. */
export function formatarDiaMes(instante: Date): string {
  if (Number.isNaN(instante.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(instante);
}

/** Forma longa e legivel, para o nome acessivel do cartao de evento. */
export function descreverInstante(instante: Date): string {
  if (Number.isNaN(instante.getTime())) {
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
