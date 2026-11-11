import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { seedLang } from './helpers/lang';
import { MRZ_LINES } from './helpers/mrzImage';

const SHOT_DIR = process.env.ILLY_SHOT_DIR ?? 'tests/e2e/screenshots';

async function openPassport(page: Page): Promise<void> {
  await page.goto('/#/passport');
  await page.evaluate(() => indexedDB.deleteDatabase('korea30'));
  await page.reload();
  await expect(page.getByTestId('screen-passport')).toBeVisible();
}

async function parsePasted(page: Page): Promise<void> {
  await page.getByTestId('passport-mrz-text').fill(MRZ_LINES.join('\n'));
  await page.getByTestId('passport-parse').click();
}

test.describe('passport rescan', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-12-25T10:00:00'));
    await seedLang(page, 'vi');
    await openPassport(page);
  });

  test('first reading shows no kept note', async ({ page }) => {
    await parsePasted(page);
    await expect(page.getByTestId('passport-field-surname')).toHaveValue(/ERIKSSON/);
    await expect(page.getByTestId('passport-kept-note')).toHaveCount(0);
  });

  test('reading again keeps a box the user changed and tells how many', async ({ page }) => {
    await parsePasted(page);
    const surname = page.getByTestId('passport-field-surname');
    await expect(surname).toHaveValue(/ERIKSSON/);
    await surname.fill('KIM');
    await expect(page.getByTestId('passport-kept-note')).toHaveCount(0);
    await page.getByTestId('passport-parse').click();
    await expect(surname).toHaveValue('KIM');
    const note = page.getByTestId('passport-kept-note');
    await expect(note).toHaveAttribute('data-count', '1');
    await expect(note).toHaveAttribute('role', 'status');
    await expect(note.locator('[lang="ko"]')).toContainText('직접 고친 칸 1개');
    await page.screenshot({ path: `${SHOT_DIR}/s10-kept.png`, fullPage: true });
  });

  test('use the new reading replaces the changed box and hides the note', async ({ page }) => {
    await parsePasted(page);
    const surname = page.getByTestId('passport-field-surname');
    await surname.fill('KIM');
    await page.getByTestId('passport-parse').click();
    await expect(page.getByTestId('passport-kept-note')).toHaveAttribute('data-count', '1');
    await page.getByTestId('passport-use-scanned').click();
    await expect(surname).toHaveValue(/ERIKSSON/);
    await expect(page.getByTestId('passport-kept-note')).toHaveCount(0);
  });
});
