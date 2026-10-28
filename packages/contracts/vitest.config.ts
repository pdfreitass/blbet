import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      reporter: ['text-summary'],
      // DT-015: meta mínima de 80%.
      thresholds: { lines: 80, statements: 80, functions: 80, branches: 80 },
    },
  },
});
