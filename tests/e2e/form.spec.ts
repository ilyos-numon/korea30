import { expect, test } from '@playwright/test';
import { seedLang } from './helpers/lang';
test.beforeEach(async ({ page }) => { await seedLang(page); });

const SHOT_DIR = process.env.ILLY_SHOT_DIR ?? 'tests/e2e/screenshots';

test('shows thirteen numbered fields with guide for field 1', async ({ page }) => {
  await page.goto('/#/form');
  await expect(page.getByTestId('screen-form')).toBeVisible();
  await expect(page.locator('[data-testid^="form-field-"]')).toHaveCount(13);
  await expect(page.getByTestId('form-guide-no')).toHaveText('①');
  await expect(page.getByTestId('form-sample-note')).toBeVisible();
  await page.screenshot({ path: `${SHOT_DIR}/form-field-1.png`, fullPage: true });
});

test('tapping a number shows its guide', async ({ page }) => {
  await page.goto('/#/form');
  await page.getByTestId('form-field-9').click();
  await expect(page.getByTestId('form-guide-no')).toHaveText('⑨');
  await expect(page.getByTestId('form-guide-label')).toContainText('체류지');
  await expect(page.getByTestId('form-guide-example')).toBeVisible();
  await page.screenshot({ path: `${SHOT_DIR}/form-field-9.png`, fullPage: true });
});

test('prev and next stop at the ends', async ({ page }) => {
  await page.goto('/#/form');
  await expect(page.getByTestId('form-prev')).toBeDisabled();
  for (let i = 0; i < 12; i++) {
    await page.getByTestId('form-next').click();
  }
  await expect(page.getByTestId('form-guide-no')).toHaveText('⑬');
  await expect(page.getByTestId('form-next')).toBeDisabled();
});

test('field one asks to check with the officer', async ({ page }) => {
  await page.goto('/#/form');
  await expect(page.getByTestId('form-ask-officer')).toBeVisible();
  await page.getByTestId('form-field-2').click();
  await expect(page.getByTestId('form-ask-officer')).toHaveCount(0);
});

test('submitted completes day 3 when it is today', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('korea30.progress.v1', '[1,2]'));
  await page.goto('/#/form');
  await page.getByTestId('form-submitted').click();
  await expect(page.getByTestId('form-submitted-msg')).toContainText('3~4주');
  await expect(page.getByTestId('form-quest-done')).toBeVisible();
  await page.screenshot({ path: `${SHOT_DIR}/form-submitted.png`, fullPage: true });
  await page.getByTestId('nav-quest').click();
  await expect(page.getByTestId('quest-progress')).toHaveText('Ngày 4 / 30');
});

test('submitted keeps progress when day 3 is not today', async ({ page }) => {
  await page.goto('/#/form');
  await page.getByTestId('form-submitted').click();
  await expect(page.getByTestId('form-submitted-msg')).toBeVisible();
  await expect(page.getByTestId('form-quest-done')).toHaveCount(0);
  await page.getByTestId('nav-quest').click();
  await expect(page.getByTestId('quest-progress')).toHaveText('Ngày 1 / 30');
});
