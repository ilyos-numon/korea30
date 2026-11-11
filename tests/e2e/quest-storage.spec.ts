import { expect, test } from '@playwright/test';
import { failLocalStorage } from './helpers/failLocalStorage';
import { seedLang } from './helpers/lang';

const SHOT_DIR = process.env.ILLY_SHOT_DIR ?? 'tests/e2e/screenshots';

test('quota failure on quest save warns but advances in memory; reload shows Day 1 again', async ({ page }) => {
  await seedLang(page, 'vi');
  await failLocalStorage(page, 'korea30.progress', 'QuotaExceededError');
  await page.clock.setFixedTime(new Date('2026-10-27T10:00:00'));
  await page.goto('/#/');
  await expect(page.getByTestId('screen-quest')).toBeVisible();
  await expect(page.getByTestId('quest-item-1')).toHaveAttribute('data-state', 'today');
  await page.getByTestId('quest-complete').click();
  const err = page.getByTestId('quest-storage-error');
  await expect(err).toBeVisible();
  await expect(err).toHaveAttribute('data-code', 'quota');
  await expect(err).toHaveAttribute('role', 'alert');
  await expect(page.getByTestId('quest-item-1')).toHaveAttribute('data-state', 'done');
  await expect(page.getByTestId('quest-item-2')).toHaveAttribute('data-state', 'today');
  await page.screenshot({ path: `${SHOT_DIR}/quest-storage-error-vi.png`, fullPage: true });

  await page.reload();
  await expect(page.getByTestId('screen-quest')).toBeVisible();
  await expect(page.getByTestId('quest-item-1')).toHaveAttribute('data-state', 'today');
  await expect(page.getByTestId('quest-storage-error')).toHaveCount(0);
});

test('SecurityError on arrival date save shows unknown code', async ({ page }) => {
  await seedLang(page, 'vi');
  await failLocalStorage(page, 'korea30.arrival', 'SecurityError');
  await page.clock.setFixedTime(new Date('2026-10-27T10:00:00'));
  await page.goto('/#/');
  await expect(page.getByTestId('screen-quest')).toBeVisible();
  await page.getByTestId('quest-arrival-open').click();
  await page.getByTestId('quest-arrival-input').fill('2026-10-20');
  await page.getByTestId('quest-arrival-save').click();
  await expect(page.getByTestId('quest-storage-error')).toHaveAttribute('data-code', 'unknown');
  await expect(page.getByTestId('quest-arrival-synced')).toHaveCount(0);
});

test('without failure no storage warning appears', async ({ page }) => {
  await seedLang(page, 'vi');
  await page.goto('/#/');
  await expect(page.getByTestId('screen-quest')).toBeVisible();
  await page.getByTestId('quest-complete').click();
  await expect(page.getByTestId('quest-item-2')).toHaveAttribute('data-state', 'today');
  await expect(page.getByTestId('quest-storage-error')).toHaveCount(0);
});
