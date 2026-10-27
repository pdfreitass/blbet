import { defaultServerConditions } from 'vite';
import { defineConfig } from 'vitest/config';

// Nos testes, os pacotes do workspace resolvem para o código-fonte (condição "source").
export default defineConfig({
  ssr: { resolve: { conditions: ['source', ...defaultServerConditions] } },
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      // server.ts só liga o processo (sinais, listen); a lógica que monta está em app.ts e é testada.
      exclude: ['src/server.ts'],
      reporter: ['text-summary', 'text'],
      // DT-015: meta mínima de 80%.
      thresholds: { lines: 80, statements: 80, functions: 80, branches: 80 },
    },
  },
});
