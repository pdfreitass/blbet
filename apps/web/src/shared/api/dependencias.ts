/*
 * Comparacao de listas de dependencias, igual a que o React faz nos seus proprios
 * hooks: mesmo comprimento e `Object.is` em cada posicao.
 *
 * Existe porque `useRecurso` e `useListaPaginada` recebem a lista de dependencias de
 * quem os chama e precisam de saber, DURANTE O RENDER, se ela mudou -- para reporem o
 * estado nesse momento em vez de o fazerem dentro de um efeito, que custa um render a
 * mais e e o que a regra `react-hooks/set-state-in-effect` apanha.
 */

/** Verdadeiro quando as duas listas tem o mesmo comprimento e os mesmos valores. */
export function mesmasDependencias(a: readonly unknown[], b: readonly unknown[]): boolean {
  if (a.length !== b.length) {
    return false;
  }

  return a.every((valor, indice) => Object.is(valor, b[indice]));
}
