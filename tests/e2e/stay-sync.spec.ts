import { expect, test, type Page } from '@playwright/test';
import { seedLang } from './helpers/lang';

const SHOT_DIR = process.env.ILLY_SHOT_DIR ?? 'tests/e2e/screenshots';
const ARRIVAL_KEY = 'korea30.arrival.v1';

test.beforeEach(async ({ page }) => {
  await seedLang(page, 'vi');
  await page.clock.setFixedTime(new Date('2026-10-27T10:00:00'));
});

async function openStay(page: Page): Promise<void> {
  await page.goto('/#/deadline');
  await expect(page.getByTestId('screen-deadline')).toBeVisible();
}

test('stay entry date fills empty quest arrival date and shows D+N', async ({ page }) => {
  await openStay(page);
  await page.getByTestId('stay-entry').fill('2026-10-20');
  await page.getByTestId('stay-visa').selectOption('E-9');
  await page.getByTestId('stay-expiry').fill('2027-03-01');
  await page.getByTestId('stay-save').click();
  const synced = page.getByTestId('stay-arrival-synced');
  await expect(synced).toBeVisible();
  await synced.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${SHOT_DIR}/stay-arrival-synced-vi.png`, fullPage: true });

  await page.goto('/#/');
  await expect(page.getByTestId('screen-quest')).toBeVisible();
  await expect(page.getByTestId('quest-dplus')).toHaveText('D+8');
});

test('existing quest arrival date is kept', async ({ page }) => {
  await page.goto('/#/');
  await expect(page.getByTestId('screen-quest')).toBeVisible();
  await page.evaluate((k) => localStorage.setItem(k, '2026-10-10'), ARRIVAL_KEY);
  await openStay(page);
  await page.getByTestId('stay-entry').fill('2026-10-20');
  await page.getByTestId('stay-save').click();
  await expect(page.locator('.deadline-status')).toBeVisible();
  await expect(page.getByTestId('stay-storage-error')).toHaveCount(0);
  await expect(page.getByTestId('stay-arrival-synced')).toHaveCount(0);
  expect(await page.evaluate((k) => localStorage.getItem(k), ARRIVAL_KEY)).toBe('2026-10-10');
});

test('quest arrival date fills empty stay entry date when a stay profile exists', async ({ page }) => {
  await openStay(page);
  await page.getByTestId('stay-visa').selectOption('E-9');
  await page.getByTestId('stay-save').click();
  await expect(page.getByRole('status').first()).toBeVisible();

  await page.goto('/#/');
  await expect(page.getByTestId('screen-quest')).toBeVisible();
  await page.getByTestId('quest-arrival-open').click();
  await page.getByTestId('quest-arrival-input').fill('2026-10-20');
  await page.getByTestId('quest-arrival-save').click();
  await expect(page.getByTestId('quest-arrival-synced')).toBeVisible();

  await openStay(page);
  await expect(page.getByTestId('stay-entry')).toHaveValue('2026-10-20');
});

test('quest arrival date does not create a stay profile', async ({ page }) => {
  await page.goto('/#/');
  await expect(page.getByTestId('screen-quest')).toBeVisible();
  await page.getByTestId('quest-arrival-open').click();
  await page.getByTestId('quest-arrival-input').fill('2026-10-20');
  await page.getByTestId('quest-arrival-save').click();
  await expect(page.getByTestId('quest-dplus')).toHaveText('D+8');
  await expect(page.getByTestId('quest-arrival-synced')).toHaveCount(0);
  const profiles = await page.evaluate(
    () =>
      new Promise<number>((resolve, reject) => {
        const open = indexedDB.open('korea30');
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          if (!db.objectStoreNames.contains('stayProfile')) {
            db.close();
            resolve(-1);
            return;
          }
          const req = db.transaction('stayProfile', 'readonly').objectStore('stayProfile').count();
          req.onsuccess = () => {
            db.close();
            resolve(req.result);
          };
          req.onerror = () => reject(req.error);
        };
      }),
  );
  expect(profiles).toBe(0);
});

test('unsaved edits show a preview that is not stored; saving turns it off', async ({ page }) => {
  await openStay(page);
  const timeline = page.getByTestId('deadline-timeline');
  await expect(timeline).toHaveAttribute('data-preview', 'false');
  await page.getByTestId('stay-entry').fill('2026-10-20');
  await page.getByTestId('stay-visa').selectOption('E-9');
  await page.getByTestId('stay-expiry').fill('2027-03-01');
  await expect(timeline).toHaveAttribute('data-preview', 'true');
  await expect(page.getByTestId('deadline-preview-note')).toBeVisible();
  expect(await page.getByTestId('deadline-item').count()).toBeGreaterThan(0);
  await timeline.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${SHOT_DIR}/stay-preview-vi.png`, fullPage: true });

  await page.reload();
  await expect(page.getByTestId('screen-deadline')).toBeVisible();
  await expect(page.getByTestId('deadline-timeline')).toHaveAttribute('data-preview', 'false');
  await expect(page.getByTestId('deadline-preview-note')).toHaveCount(0);
  await expect(page.getByTestId('deadline-item')).toHaveCount(0);

  await page.getByTestId('stay-entry').fill('2026-10-20');
  await page.getByTestId('stay-visa').selectOption('E-9');
  await page.getByTestId('stay-expiry').fill('2027-03-01');
  await page.getByTestId('stay-save').click();
  await expect(page.getByTestId('deadline-timeline')).toHaveAttribute('data-preview', 'false');
  await expect(page.getByTestId('deadline-preview-note')).toHaveCount(0);
  expect(await page.getByTestId('deadline-item').count()).toBeGreaterThan(0);
});
