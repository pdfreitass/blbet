// Limpa a árvore renderizada entre testes. Sem isto, componentes de um teste
// sobrevivem no DOM do seguinte e as consultas passam a encontrar duplicados.
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
