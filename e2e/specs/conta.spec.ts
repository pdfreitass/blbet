import { expect, test } from '@playwright/test';

/*
 * Contas e sessões (DT-020, secção 7.2 do contrato), contra a api a sério.
 *
 * O que estes testes provam e os testes de componente não podem provar: que o cookie
 * de sessão é posto, viaja e é aceite; que o token NUNCA aparece onde o JavaScript
 * lhe chegue; e que a resposta genérica do cadastro (A-A2) é mesmo a mesma com uma
 * conta nova e com uma conta repetida.
 */

/** E-mail novo por execução: a base de dados é nova, mas o ficheiro é um só. */
function emailNovo(): string {
  return `e2e-${Date.now()}-${Math.floor(Math.random() * 10_000)}@exemplo.pt`;
}

const SENHA = 'senha-de-teste-1';

test('cadastro, entrada, conta, dispositivos e saída', async ({ page }) => {
  const email = emailNovo();

  await page.goto('/conta/criar');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha').fill(SENHA);
  await page.getByRole('button', { name: 'Criar conta' }).click();

  await expect(page.getByRole('status')).toContainText('Se este endereço puder ser usado');

  await page.goto('/conta/entrar');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha').fill('Senha');
  await page.getByLabel('Senha').fill(SENHA);
  await page.getByRole('button', { name: 'Entrar' }).click();

  // A entrada leva ao perfil, e o perfil mostra a conta real.
  await expect(page).toHaveURL(/\/perfil$/);
  await expect(page.getByText(email)).toBeVisible();

  /*
   * O cookie de sessão é `HttpOnly`: o `document.cookie` da página não o vê. Se um
   * dia este `expect` falhar, alguém tirou o `HttpOnly` -- e um XSS passou a valer a
   * conta.
   */
  const cookies = await page.context().cookies();
  const sessao = cookies.find((cookie) => cookie.name === 'blbet_session');

  expect(sessao, 'o cookie de sessão tem de existir').toBeDefined();
  expect(sessao?.httpOnly, 'o cookie de sessão tem de ser HttpOnly').toBe(true);
  expect(await page.evaluate(() => document.cookie)).not.toContain('blbet_session');

  await page.getByRole('link', { name: 'Dispositivos autenticados' }).click();
  // `exact`: sem isto apanha também o botão "Sair deste dispositivo".
  await expect(page.getByText('Este dispositivo', { exact: true })).toBeVisible();

  await page.goto('/perfil');
  await page.getByRole('button', { name: 'Sair' }).click();

  await expect(page.getByText('Não está autenticado')).toBeVisible();

  // Recarregar não repõe a sessão: ela acabou mesmo, do lado do servidor.
  await page.reload();
  await expect(page.getByText('Não está autenticado')).toBeVisible();
});

test('o cadastro responde o mesmo com conta nova e com conta repetida (A-A2)', async ({ page }) => {
  const email = emailNovo();

  for (const tentativa of ['primeira', 'segunda']) {
    await page.goto('/conta/criar');
    await page.getByLabel('E-mail').fill(email);
    await page.getByLabel('Senha').fill(SENHA);
    await page.getByRole('button', { name: 'Criar conta' }).click();

    await expect(
      page.getByRole('status'),
      `a ${tentativa} resposta tem de ser indistinguível da outra`,
    ).toContainText('Se este endereço puder ser usado');
    await expect(page.locator('body')).not.toContainText('já existe');
  }
});

test('o pedido de recuperação não revela se a conta existe (A-A2)', async ({ page }) => {
  await page.goto('/conta/recuperar');
  await page.getByLabel('E-mail').fill('nao-existe-de-certeza@exemplo.pt');
  await page.getByRole('button', { name: 'Enviar ligação' }).click();

  await expect(page.getByRole('status')).toContainText('Se este endereço puder ser usado');
});

test('credenciais erradas dizem o mesmo para e-mail inexistente e para senha errada', async ({
  page,
}) => {
  const email = emailNovo();

  await page.goto('/conta/criar');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha').fill(SENHA);
  await page.getByRole('button', { name: 'Criar conta' }).click();
  await expect(page.getByRole('status')).toBeVisible();

  const mensagens: string[] = [];

  for (const [endereco, senha] of [
    [email, 'senha-errada-mesmo'],
    ['nunca-registado@exemplo.pt', SENHA],
  ]) {
    await page.goto('/conta/entrar');
    await page.getByLabel('E-mail').fill(endereco as string);
    await page.getByLabel('Senha').fill(senha as string);
    await page.getByRole('button', { name: 'Entrar' }).click();

    mensagens.push((await page.getByRole('alert').textContent()) ?? '');
  }

  expect(mensagens[0]).toBe(mensagens[1]);
  expect(mensagens[0]).toBe('E-mail ou senha incorretos.');
});

test('o e-mail é normalizado: maiúsculas e espaços dão a mesma conta (A-A3)', async ({ page }) => {
  const email = emailNovo();

  await page.goto('/conta/criar');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha').fill(SENHA);
  await page.getByRole('button', { name: 'Criar conta' }).click();
  await expect(page.getByRole('status')).toBeVisible();

  await page.goto('/conta/entrar');
  await page.getByLabel('E-mail').fill(`  ${email.toUpperCase()} `);
  await page.getByLabel('Senha').fill(SENHA);
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page).toHaveURL(/\/perfil$/);
  // O servidor guardou-o em minúsculas (A-A3), e é assim que volta.
  await expect(page.getByText(email)).toBeVisible();
});

test('uma ligação de confirmação gasta ou inválida é explicada, não dá erro técnico', async ({
  page,
}) => {
  await page.goto('/conta/verificar?token=token-que-nao-existe');
  await page.getByRole('button', { name: 'Confirmar o meu e-mail' }).click();

  const aviso = page.getByRole('alert');

  await expect(aviso).toContainText('já foi usada ou expirou');
  await expect(page.locator('body')).not.toContainText('invalid token');
});

test('a alteração de senha exige sessão', async ({ page }) => {
  await page.goto('/conta/alterar-senha');

  await expect(page.getByRole('alert')).toContainText('Entre na sua conta');
});
