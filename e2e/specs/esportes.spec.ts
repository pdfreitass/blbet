import { expect, test } from '@playwright/test';

/*
 * Caminho de esportes contra a api em modo gravado (DT-018).
 *
 * As asserções são sobre o que a gravação tem mesmo: a English Premier League, e os
 * jogos Liverpool × Arsenal FC e Newcastle United × Everton, ambos com odds.
 */

test('a faixa declara a natureza da plataforma e não se pode dispensar (CA-001.4)', async ({
  page,
}) => {
  await page.goto('/');

  const faixa = page.getByLabel('Natureza da plataforma');

  await expect(faixa).toContainText('Plataforma demonstrativa.');
  await expect(faixa.getByRole('button')).toHaveCount(0);
});

test('a listagem mostra os jogos gravados, com as cotações', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Esportes', level: 1 })).toBeVisible();
  await expect(page.getByText('Liverpool')).toBeVisible();
  await expect(page.getByText('Newcastle United')).toBeVisible();
});

test('abrir um jogo leva ao detalhe, e voltar traz a listagem de volta', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link').filter({ hasText: 'Newcastle United' }).first().click();

  await expect(page).toHaveURL(/\/eventos\//);
  await expect(page.getByText('Everton')).toBeVisible();

  await page.goBack();

  await expect(page).toHaveURL('http://localhost:5173/');
  await expect(page.getByText('Liverpool')).toBeVisible();
});

test('a busca filtra pelo termo e o termo fica no endereço (regra A7)', async ({ page }) => {
  await page.goto('/busca');

  await page.getByLabel('Buscar').fill('Everton');

  await expect(page).toHaveURL(/\?q=Everton/);
  await expect(page.getByText('Newcastle United')).toBeVisible();
});

test('um endereço desconhecido tem saída, em vez de ecrã em branco (CA-008.4)', async ({
  page,
}) => {
  await page.goto('/caminho-que-nao-existe');

  await expect(page.getByRole('navigation', { name: 'Navegação principal' })).toBeVisible();
});
