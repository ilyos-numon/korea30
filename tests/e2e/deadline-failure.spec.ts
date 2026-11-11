import { expect, test, type Page } from '@playwright/test';
import { failIdbReadsFromStart, installIdbFailure, setIdbFailure } from './helpers/failStorage';
import { seedLang } from './helpers/lang';

const SHOT_DIR = process.env.ILLY_SHOT_DIR ?? 'tests/e2e/screenshots';

// en 문구 (src/ui/i18n/en.ts, src/deadline/i18n/en.ts)
const STORAGE_FULL = 'Your phone storage is full, so this was not saved. Free up space and try again.';
const STORAGE_FAILED = "Couldn't save on this phone. Please try again.";
const LOAD_FAILED = "Couldn't read the records saved on this phone.";
const SAVED = 'Saved.';
const WIPED = 'Stay details deleted.';

async function open(page: Page): Promise<void> {
  await seedLang(page, 'en');
  await installIdbFailure(page);
  await page.clock.setFixedTime(new Date('2026-12-25T10:00:00'));
  await page.goto('/#/deadline');
  await expect(page.getByTestId('screen-deadline')).toBeVisible();
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const req = indexedDB.deleteDatabase('korea30');
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
        req.onblocked = () => resolve();
      }),
  );
  await page.reload();
  await expect(page.getByTestId('screen-deadline')).toBeVisible();
}

test('quota on save shows storage full and saves nothing', async ({ page }) => {
  await open(page);
  await setIdbFailure(page, { write: 'quota' });
  await page.getByTestId('stay-entry').fill('2026-10-01');
  await page.getByTestId('stay-save').click();
  const err = page.getByTestId('stay-storage-error');
  await expect(err).toBeVisible();
  await expect(err).toHaveAttribute('data-code', 'quota');
  await expect(err).toHaveAttribute('role', 'alert');
  await expect(err).toContainText(STORAGE_FULL);
  await expect(page.getByText(SAVED, { exact: true })).toHaveCount(0);
  await expect(page.getByTestId('deadline-timeline')).toHaveAttribute('data-preview', 'true');
  await expect(page.getByTestId('deadline-preview-note')).toBeVisible();
  await page.screenshot({ path: `${SHOT_DIR}/s7-stay-quota.png`, fullPage: true });
  await setIdbFailure(page, { write: null });
  await page.reload();
  await expect(page.getByTestId('screen-deadline')).toBeVisible();
  await expect(page.getByTestId('deadline-item')).toHaveCount(0);
});

test('wipe failure shows error and keeps timeline', async ({ page }) => {
  await open(page);
  await page.getByTestId('stay-entry').fill('2026-10-01');
  await page.getByTestId('stay-save').click();
  await expect(page.getByTestId('deadline-item').first()).toBeVisible();
  const before = await page.getByTestId('deadline-item').count();
  await setIdbFailure(page, { write: 'unknown' });
  await page.getByTestId('stay-wipe').click();
  const err = page.getByTestId('stay-storage-error');
  await expect(err).toBeVisible();
  await expect(err).toHaveAttribute('data-code', 'unknown');
  await expect(err).toContainText(STORAGE_FAILED);
  await expect(page.getByText(WIPED, { exact: true })).toHaveCount(0);
  await expect(page.getByTestId('deadline-item')).toHaveCount(before);
});

test('error clears on next successful save', async ({ page }) => {
  await open(page);
  await setIdbFailure(page, { write: 'quota' });
  await page.getByTestId('stay-entry').fill('2026-10-01');
  await page.getByTestId('stay-save').click();
  await expect(page.getByTestId('stay-storage-error')).toBeVisible();
  await setIdbFailure(page, { write: null });
  await page.getByTestId('stay-save').click();
  await expect(page.getByTestId('deadline-item').first()).toBeVisible();
  await expect(page.getByTestId('stay-storage-error')).toHaveCount(0);
});

test('load failure shows load error', async ({ page }) => {
  await open(page);
  await failIdbReadsFromStart(page, 'unknown');
  await page.reload();
  await expect(page.getByTestId('screen-deadline')).toBeVisible();
  const err = page.getByTestId('stay-load-error');
  await expect(err).toBeVisible();
  await expect(err).toHaveAttribute('role', 'alert');
  await expect(err).toContainText(LOAD_FAILED);
});
