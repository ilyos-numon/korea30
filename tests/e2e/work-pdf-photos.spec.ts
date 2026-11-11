import { expect, test, type Page } from '@playwright/test';
import { failIdbReadsFromStart, installIdbFailure, setIdbFailure } from './helpers/failStorage';
import { seedLang } from './helpers/lang';

const SHOT_DIR = process.env.ILLY_SHOT_DIR ?? 'tests/e2e/screenshots';
const PLAIN = 'tests/e2e/fixtures/photo-plain.png';

// en 문구 (src/ui/i18n/en.ts)
const PDF_PHOTOS_UNREAD = "Photos couldn't be read, so the PDF was made without photos.";

async function resetDb(page: Page): Promise<void> {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const req = indexedDB.deleteDatabase('korea30');
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
        req.onblocked = () => resolve();
      }),
  );
}

async function open(page: Page): Promise<void> {
  await seedLang(page, 'en');
  await installIdbFailure(page);
  await page.clock.setFixedTime(new Date('2026-10-15T10:00:00'));
  await page.goto('/#/work');
  await expect(page.getByTestId('screen-work')).toBeVisible();
  await resetDb(page);
  await page.reload();
  await expect(page.getByTestId('screen-work')).toBeVisible();
}

async function shiftAndPhoto(page: Page): Promise<void> {
  await page.getByTestId('work-shift-date').fill('2026-10-15');
  await page.getByTestId('work-shift-start').fill('09:00');
  await page.getByTestId('work-shift-end').fill('18:00');
  await page.getByTestId('work-shift-break').fill('60');
  await page.getByTestId('work-shift-add').click();
  await expect(page.getByTestId('work-shift-row')).toHaveCount(1);
  await page.getByTestId('photo-pick').setInputFiles(PLAIN);
  await expect(page.getByTestId('photo-item')).toHaveCount(1);
}

test('photo read failure still downloads the PDF and shows the unread note', async ({ page }) => {
  await open(page);
  await shiftAndPhoto(page);
  await setIdbFailure(page, { read: 'unknown' });
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByTestId('work-pdf').click()]);
  expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  const note = page.getByTestId('work-pdf-photo-note');
  await expect(note).toBeVisible();
  await expect(note).toHaveAttribute('data-reason', 'unread');
  await expect(note).toHaveAttribute('role', 'status');
  await expect(note).toContainText(PDF_PHOTOS_UNREAD);
  await expect(page.getByTestId('work-pdf-error')).toHaveCount(0);
  await note.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${SHOT_DIR}/s6-pdf-unread.png`, fullPage: true });

  // 다음 PDF 시도 때 초기화된다
  await setIdbFailure(page, { read: null });
  await Promise.all([page.waitForEvent('download'), page.getByTestId('work-pdf').click()]);
  await expect(page.getByTestId('work-pdf-photo-note')).toHaveCount(0);
});

test('normal PDF with photos shows no photo note', async ({ page }) => {
  await open(page);
  await shiftAndPhoto(page);
  await Promise.all([page.waitForEvent('download'), page.getByTestId('work-pdf').click()]);
  await expect(page.getByTestId('work-pdf')).toBeEnabled();
  await expect(page.getByTestId('work-pdf-photo-note')).toHaveCount(0);
});

test('photo list read failure from start shows photo-error unknown', async ({ page }) => {
  await seedLang(page, 'en');
  await failIdbReadsFromStart(page);
  await page.clock.setFixedTime(new Date('2026-10-15T10:00:00'));
  await page.goto('/#/work');
  await expect(page.getByTestId('screen-work')).toBeVisible();
  const err = page.getByTestId('photo-error');
  await expect(err).toBeVisible();
  await expect(err).toHaveAttribute('data-code', 'unknown');
});
