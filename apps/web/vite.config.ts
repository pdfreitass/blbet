import { defaultClientConditions, defaultServerConditions } from 'vite';
// defineConfig vem de 'vitest/config', e nao de 'vite': e a versao que aceita a chave
// `test` no mesmo ficheiro. Com a de 'vite', `test` nao existe no tipo e o typecheck
// falha -- sem precisar de um segundo ficheiro de configuracao so para os testes.
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Porta e host da api, confirmados em apps/api/.env.example e apps/api/src/config/env.ts.
// Constante nomeada em vez de um valor solto no corpo da configuracao.
const API_DEV_TARGET = 'http://127.0.0.1:3333';

// Resolve @blbet/contracts para o codigo-fonte TypeScript, pela condicao "source" dos
// exports do pacote -- a mesma que a api usa em dev e em teste.
//
// Espalhar as condicoes por omissao e OBRIGATORIO: definir `conditions` substitui a
// lista inteira, e sem os defaults o Vite deixa de resolver "import", "module" e
// "browser" nas restantes dependencias.
const SOURCE_FIRST_CLIENT = ['source', ...defaultClientConditions];
const SOURCE_FIRST_SERVER = ['source', ...defaultServerConditions];

export default defineConfig({
  plugins: [react()],

  resolve: {
    conditions: SOURCE_FIRST_CLIENT,
  },

  // Os testes do Vitest correm no lado servidor do Vite, que tem a sua propria
  // lista de condicoes: sem isto, o pacote de contratos resolveria para o dist.
  ssr: {
    resolve: {
      conditions: SOURCE_FIRST_SERVER,
    },
  },

  server: {
    port: 5173,
    // Encaminha /api para a api local, acordado no quadro com o `backend`.
    // Mesma origem em desenvolvimento: a api nao precisa de CORS, e o codigo do
    // frontend usa caminhos relativos (/api/...) sem variavel com o endereco.
    proxy: {
      '/api': {
        target: API_DEV_TARGET,
        changeOrigin: true,
      },
    },
  },

  test: {
    environment: 'jsdom',
    // Importar describe/it/expect de 'vitest' explicitamente, sem globais.
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
    // Os componentes importam os seus .module.css; sem isto o Vitest ignora-os.
    css: true,

    /*
     * Cobertura minima de 80% em tudo, por pacote (DT-015). Abaixo disto o comando
     * falha, e e isso que torna a meta real em vez de indicativa.
     */
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      /*
       * Fora da conta, com razao:
       *   - `src/test/`: sao as ferramentas dos proprios testes (helper de render,
       *     servidor falso, exemplos de resposta). Medi-las seria medir a regua;
       *   - `main.tsx`: so monta a aplicacao no DOM real, que o jsdom nao exercita.
       */
      exclude: ['src/test/**', 'src/app/main.tsx'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
