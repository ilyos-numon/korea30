import { expect, test } from '@playwright/test';
import { seedLang } from './helpers/lang';
test.beforeEach(async ({ page }) => { await seedLang(page); });

const SHOT_DIR = process.env.ILLY_SHOT_DIR ?? 'tests/e2e/screenshots';

test('shows day 1 on first visit', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('quest-progress')).toHaveText('Ngày 1 / 30');
  await expect(page.getByTestId('quest-where')).toBeVisible();
  await expect(page.getByTestId('quest-bring')).toBeVisible();
  await expect(page.getByTestId('quest-say')).toBeVisible();
  await expect(page.getByTestId('quest-item-2')).toHaveAttribute('data-state', 'locked');
  await expect(page.getByTestId('quest-item-3')).toHaveAttribute('data-state', 'locked');
  await page.screenshot({ path: `${SHOT_DIR}/quest-day1.png`, fullPage: true });
});

test('locked day shows hint and keeps today', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('quest-item-3').click();
  await expect(page.getByTestId('quest-locked-hint')).toBeVisible();
  await expect(page.getByTestId('quest-locked-hint')).toContainText('Ngày 1');
  await expect(page.getByTestId('quest-progress')).toHaveText('Ngày 1 / 30');
  await page.screenshot({ path: `${SHOT_DIR}/quest-locked-hint.png`, fullPage: true });
});

test('completing day 1 opens day 2 and survives reload', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('quest-complete').click();
  await expect(page.getByTestId('quest-progress')).toHaveText('Ngày 2 / 30');
  await expect(page.getByTestId('quest-item-1')).toHaveAttribute('data-state', 'done');
  await page.reload();
  await expect(page.getByTestId('quest-progress')).toHaveText('Ngày 2 / 30');
  await expect(page.getByTestId('quest-item-1')).toHaveAttribute('data-state', 'done');
  await expect(page.getByTestId('quest-item-2')).toHaveAttribute('data-state', 'today');
  await page.screenshot({ path: `${SHOT_DIR}/quest-day2.png`, fullPage: true });
});

test('completing all days shows all-done', async ({ page }) => {
  test.setTimeout(120_000); // 29 clicks, each waits for the card animation to settle
  await page.goto('/');
  for (let n = 2; n <= 30; n++) {
    await page.getByTestId('quest-complete').click();
    await expect(page.getByTestId('quest-progress')).toHaveText(`Ngày ${n} / 30`);
  }
  await page.getByTestId('quest-complete').click();
  await expect(page.getByTestId('quest-all-done')).toBeVisible();
  await expect(page.getByTestId('quest-all-done')).toContainText('30');
  await expect(page.getByTestId('quest-complete')).toHaveCount(0);
  await page.screenshot({ path: `${SHOT_DIR}/quest-all-done.png`, fullPage: true });
});

test('corrupt storage falls back to day 1', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('korea30.progress.v1', '{oops');
  });
  await page.goto('/');
  await expect(page.getByTestId('quest-progress')).toHaveText('Ngày 1 / 30');
});

test('reset clears progress', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('quest-complete').click();
  await expect(page.getByTestId('quest-progress')).toHaveText('Ngày 2 / 30');
  await page.getByTestId('quest-reset').click();
  await expect(page.getByTestId('quest-progress')).toHaveText('Ngày 1 / 30');
  await expect(page.getByTestId('quest-item-1')).toHaveAttribute('data-state', 'today');
});

test('no horizontal scroll on quest screen', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('screen-quest')).toBeVisible();
  const noHScroll = await page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  );
  expect(noHScroll).toBe(true);
});
