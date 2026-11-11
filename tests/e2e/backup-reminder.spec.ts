import { expect, test, type Page } from '@playwright/test';
import { seedLang } from './helpers/lang';

/** 진입 애니메이션이 끝난 뒤 캡처한다 (고정 sleep 아님) */
async function settle(page: Page): Promise<void> {
  await page.evaluate(() => Promise.all(document.getAnimations().filter((a) => Number.isFinite(a.effect?.getComputedTiming().endTime ?? 0)).map((a) => a.finished.catch(() => undefined))));
}

const SHOT_DIR = process.env.ILLY_SHOT_DIR ?? 'tests/e2e/screenshots';

async function addShift(page: Page, date: string): Promise<void> {
  const before = await page.getByTestId('work-shift-row').count();
  await page.getByTestId('work-shift-date').fill(date);
  await page.getByTestId('work-shift-start').fill('09:00');
  await page.getByTestId('work-shift-end').fill('18:00');
  await page.getByTestId('work-shift-break').fill('60');
  await page.getByTestId('work-shift-add').click();
  await expect(page.getByTestId('work-shift-row')).toHaveCount(before + 1);
}

async function at(page: Page, iso: string, hash: string, screen: string): Promise<void> {
  await page.clock.setFixedTime(new Date(iso));
  await page.goto(hash);
  await page.reload();
  await expect(page.getByTestId(screen)).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await seedLang(page, 'vi');
});

test('reminder shows with data and no backup history, and disappears after backing up now', async ({ page }) => {
  await at(page, '2026-10-20T10:00:00', '/#/work', 'screen-work');
  await addShift(page, '2026-10-05');
  await page.goto('/#/tools');
  await page.reload();
  const reminder = page.getByTestId('backup-reminder');
  await expect(reminder).toBeVisible();
  await settle(page);
  await page.screenshot({ path: `${SHOT_DIR}/backup-reminder-vi.png`, fullPage: true });

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('backup-reminder-now').click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/\.json$/);
  await expect(reminder).toHaveCount(0);
});

test('reminder returns after 2 days with changed data', async ({ page }) => {
  await at(page, '2026-10-20T10:00:00', '/#/work', 'screen-work');
  await addShift(page, '2026-10-05');
  await page.goto('/#/tools');
  await expect(page.getByTestId('backup-section')).toBeVisible();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('backup-export').click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/\.json$/);
  await expect(page.getByTestId('backup-done')).toHaveAttribute('data-kind', 'export');
  await page.goto('/#/work');
  await expect(page.getByTestId('backup-reminder')).toHaveCount(0);
  await addShift(page, '2026-10-06');
  await at(page, '2026-10-22T10:01:00', '/#/work', 'screen-work');
  await expect(page.getByTestId('backup-reminder')).toBeVisible();
});

test('no reminder when there are no records', async ({ page }) => {
  await at(page, '2026-10-20T10:00:00', '/#/tools', 'backup-section');
  await expect(page.getByTestId('backup-reminder')).toHaveCount(0);
});

test('no reminder when nothing changed since the backup', async ({ page }) => {
  await at(page, '2026-10-20T10:00:00', '/#/work', 'screen-work');
  await addShift(page, '2026-10-05');
  await page.goto('/#/tools');
  await expect(page.getByTestId('backup-section')).toBeVisible();
  await Promise.all([page.waitForEvent('download'), page.getByTestId('backup-export').click()]);
  await expect(page.getByTestId('backup-done')).toBeVisible();
  await at(page, '2026-10-25T10:00:00', '/#/work', 'screen-work');
  await expect(page.getByTestId('backup-reminder')).toHaveCount(0);
});

test('closing the reminder hides it for the session', async ({ page }) => {
  await at(page, '2026-10-20T10:00:00', '/#/work', 'screen-work');
  await addShift(page, '2026-10-05');
  await page.goto('/#/tools');
  await page.reload();
  await expect(page.getByTestId('backup-reminder')).toBeVisible();
  await page.getByTestId('backup-reminder-close').click();
  await expect(page.getByTestId('backup-reminder')).toHaveCount(0);
});
