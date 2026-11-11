import { expect, test } from '@playwright/test';
import { seedLang } from './helpers/lang';
test.beforeEach(async ({ page }) => { await seedLang(page); });

const SHOT_DIR = process.env.ILLY_SHOT_DIR ?? 'tests/e2e/screenshots';

test('opens quest screen by default', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('screen-quest')).toBeVisible();
  await expect(page.getByTestId('app-header')).toContainText('Korea30');
  const noHScroll = await page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  );
  expect(noHScroll).toBe(true);
  await page.screenshot({ path: `${SHOT_DIR}/smoke-quest.png`, fullPage: true });
});

test('navigates to payslip screen', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('nav-payslip').click();
  await expect(page).toHaveURL(/#\/payslip$/);
  await expect(page.getByTestId('screen-payslip')).toBeVisible();
  await page.screenshot({ path: `${SHOT_DIR}/smoke-payslip.png`, fullPage: true });
});

test('unknown hash falls back to quest', async ({ page }) => {
  await page.goto('/#/does-not-exist');
  await expect(page.getByTestId('screen-quest')).toBeVisible();
});
