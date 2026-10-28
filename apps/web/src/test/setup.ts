// Limpa a árvore renderizada entre testes. Sem isto, componentes de um teste
// sobrevivem no DOM do seguinte e as consultas passam a encontrar duplicados.
import { afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

/*
 * Repõe o endereço antes de cada teste.
 *
 * Com roteamento (DT-015), o `location` do jsdom é partilhado por todo o ficheiro: um
 * teste que navegue para /cassino deixaria o seguinte a começar lá, e a falha
 * apareceria num teste que não tem defeito nenhum.
 */
beforeEach(() => {
  window.history.replaceState(null, '', '/');
});
