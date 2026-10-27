import { defaultServerConditions } from 'vite';
import { defineConfig } from 'vitest/config';

// Nos testes, os pacotes do workspace resolvem para o código-fonte (condição "source").
export default defineConfig({
  ssr: { resolve: { conditions: ['source', ...defaultServerConditions] } },
});
