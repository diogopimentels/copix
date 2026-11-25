import { expect, test } from '@playwright/test';

async function fazerLogin(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible();
  await page.getByLabel('E-mail').fill('demo@copix.local');
  await page.getByLabel('Senha').fill('senha123');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
}

test.describe('fluxo principal Copix', () => {
  test('login e navegação do dashboard', async ({ page }) => {
    await fazerLogin(page);
    await expect(page.getByRole('heading', { name: 'Visão geral' })).toBeVisible();

    await page.getByRole('link', { name: 'Cobranças' }).click();
    await expect(page).toHaveURL(/\/cobrancas/);
    await expect(page.getByRole('heading', { name: 'Cobranças' })).toBeVisible();
  });

  test('cria cobrança e simula pix', async ({ page }) => {
    await fazerLogin(page);

    await page.getByRole('link', { name: 'Cobranças' }).click();
    await expect(page.getByRole('heading', { name: 'Cobranças' })).toBeVisible();

    await page.getByRole('button', { name: 'Nova cobrança' }).click();
    await expect(page.getByRole('heading', { name: 'Nova cobrança' })).toBeVisible();

    const descricao = `E2E pedido ${Date.now()}`;
    await page.getByLabel('Descrição').fill(descricao);
    await page.getByLabel('Valor (BRL)').fill('42,50');
    await page.getByRole('button', { name: 'Criar cobrança' }).click();

    await expect(page.getByText(descricao)).toBeVisible({ timeout: 15_000 });

    const linha = page.getByRole('row').filter({ hasText: descricao });
    await linha.getByRole('button', { name: 'Simular Pix' }).click();
    await page.getByRole('button', { name: 'Simular agora' }).click();
    await expect(linha.getByText('PAGA')).toBeVisible({ timeout: 15_000 });

    await page.getByRole('link', { name: 'Pagamentos' }).click();
    await expect(page.getByRole('heading', { name: 'Pagamentos' })).toBeVisible();

    await page.getByRole('link', { name: 'Conciliações' }).click();
    await expect(page.getByRole('heading', { name: 'Conciliações' })).toBeVisible();
    await expect(
      page.getByRole('table').getByText('CONCILIADO').first(),
    ).toBeVisible({ timeout: 15_000 });
  });
});
