import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { defineConfig, devices } from '@playwright/test';

/*
 * Testes end-to-end do blbet (DT-015, resolve PA-008; dono: `frontend`).
 *
 * Correm contra a api em MODO GRAVADO (DT-018): sem chave do provedor, sem rede e sem
 * gastar quota. A gravação é a de `apps/api/recordings/`, e o relógio dela está parado
 * em 2026-10-27T10:00:00Z -- é por isso que os dois jogos estão sempre por começar.
 *
 * Limite real da gravação, para não se escreverem asserções contra o que não existe:
 * só a EPL, só dois jogos. **Não há paginação para exercitar**, nem jogo sem odds, nem
 * lista vazia. Pedido de mais gravações registado no quadro.
 */

/**
 * Base de dados nova por execução.
 *
 * **Sem `DATABASE_FILE` as rotas de conta não existem** (DT-021), e partilhar o
 * ficheiro entre execuções faria o segundo cadastro com o mesmo e-mail cair noutro
 * caminho -- que é precisamente o que A-A2 esconde, e portanto um teste que passava
 * ou falhava consoante o que ficou do dia anterior.
 */
const BASE_DE_DADOS = join(mkdtempSync(join(tmpdir(), 'blbet-e2e-')), 'blbet.db');

const AMBIENTE_DA_API = {
  SPORTS_MODE: 'recorded',

  /*
   * Os dois limites desligados. Não é conveniência: por omissão são 300 e 10 pedidos
   * por minuto, e uma bateria de testes de autenticação passa os 10 à vontade -- a
   * bateria falharia com `429` e não por defeito do produto (DT-019, A-A4).
   */
  RATE_LIMIT_MAX: '0',
  AUTH_RATE_LIMIT_MAX: '0',

  DATABASE_FILE: BASE_DE_DADOS,
  // Resumo dos endereços IP. Mínimo de 32 caracteres; valor de teste, sem segredo nenhum.
  AUTH_IP_HASH_SECRET: 'segredo-de-teste-end-to-end-sem-valor-real',

  /*
   * O único desvio do comportamento por omissão, e tem de ser dito: por omissão é
   * preciso confirmar o e-mail para entrar, e o token só existe na mensagem que o
   * `Mailer` escreve na saída, porque **não há provedor de e-mail escolhido**
   * (DT-020). Ler a saída do servidor para extrair o token seria apertar o teste a um
   * formato de log que ninguém acordou. O ecrã de confirmação é exercitado à parte,
   * com o token na própria URL.
   */
  AUTH_REQUIRE_VERIFIED_EMAIL: 'false',
} as const;

export default defineConfig({
  testDir: './specs',
  outputDir: './test-results',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  // Um só worker: os testes de conta partilham a mesma base de dados.
  workers: 1,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],

  use: {
    /*
     * `localhost`, nao `127.0.0.1`: o servidor do Vite anuncia-se em `localhost` e,
     * nesta maquina, isso resolve para `::1`. Com `127.0.0.1` a espera do Playwright
     * estoura sem o servidor ter nada de errado.
     */
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  webServer: [
    {
      command: 'pnpm --filter @blbet/api dev',
      cwd: '..',
      url: 'http://127.0.0.1:3333/health',
      env: AMBIENTE_DA_API,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      // O Vite encaminha /api para 127.0.0.1:3333: mesma origem, sem CORS.
      command: 'pnpm --filter @blbet/web dev',
      cwd: '..',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
});
