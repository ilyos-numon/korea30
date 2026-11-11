import { expect, test, type Page } from '@playwright/test';
import { seedLang } from './helpers/lang';

const SHOT_DIR = process.env.ILLY_SHOT_DIR ?? 'tests/e2e/screenshots';
const EXIF = 'tests/e2e/fixtures/photo-exif.jpg';

// 사진 저장일 2026-10-27, EXIF 촬영일 2026-10-20 → 만료일 2028-10-20
async function openWithPhoto(page: Page): Promise<void> {
  await seedLang(page, 'vi');
  await page.clock.setFixedTime(new Date('2026-10-27T10:00:00'));
  await page.goto('/#/work');
  await expect(page.getByTestId('screen-work')).toBeVisible();
  await page.getByTestId('photo-camera').setInputFiles(EXIF);
  await expect(page.getByTestId('photo-item')).toHaveCount(1);
}

async function gotoQuestAt(page: Page, iso: string): Promise<void> {
  await page.clock.setFixedTime(new Date(iso));
  await page.goto('/#/');
  await page.reload();
  await expect(page.getByTestId('screen-quest')).toBeVisible();
}

test('expired photo prompt on quest screen shows count and 3-year hint, delete clears it', async ({ page }) => {
  await openWithPhoto(page);
  await gotoQuestAt(page, '2028-10-21T10:00:00');
  const prompt = page.getByTestId('expired-photos-prompt');
  await expect(prompt).toBeVisible();
  await expect(prompt).toHaveAttribute('data-count', '1');
  await expect(page.getByTestId('expired-photos-hint')).toContainText('3');
  await page.screenshot({ path: `${SHOT_DIR}/expired-photos-prompt-vi.png`, fullPage: true });

  await page.getByTestId('expired-photos-delete').click();
  await expect(page.getByTestId('photo-purged')).toHaveAttribute('data-count', '1');
  await expect(prompt).toHaveCount(0);
  await page.screenshot({ path: `${SHOT_DIR}/expired-photos-deleted-vi.png`, fullPage: true });

  await page.reload();
  await expect(page.getByTestId('screen-quest')).toBeVisible();
  await expect(page.getByTestId('expired-photos-prompt')).toHaveCount(0);
});

test('keep 1 more year sets until date and prompt stays gone after reload', async ({ page }) => {
  await openWithPhoto(page);
  await gotoQuestAt(page, '2028-10-21T10:00:00');
  await page.getByTestId('expired-photos-keep').click();
  const kept = page.getByTestId('expired-photos-kept');
  await expect(kept).toHaveAttribute('data-count', '1');
  await expect(kept).toHaveAttribute('data-until', '2029-10-21');
  await expect(page.getByTestId('expired-photos-prompt')).toHaveCount(0);
  await page.reload();
  await expect(page.getByTestId('screen-quest')).toBeVisible();
  await expect(page.getByTestId('expired-photos-prompt')).toHaveCount(0);
});

test('no prompt when no photo has expired', async ({ page }) => {
  await openWithPhoto(page);
  await gotoQuestAt(page, '2027-01-10T10:00:00');
  await expect(page.getByTestId('expired-photos-prompt')).toHaveCount(0);
  await expect(page.getByTestId('photo-purged')).toHaveCount(0);
});
