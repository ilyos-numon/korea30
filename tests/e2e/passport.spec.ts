import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { seedLang } from './helpers/lang';
import { MRZ_LINES, ensureMrzFixture } from './helpers/mrzImage';
import { appOrigin } from './helpers/origin';

const SHOT_DIR = process.env.ILLY_SHOT_DIR ?? 'tests/e2e/screenshots';
const PDF_NAME = 'korea30-arc-application.pdf';

async function openPassport(page: Page): Promise<void> {
  await page.goto('/#/passport');
  await page.evaluate(() => indexedDB.deleteDatabase('korea30'));
  await page.reload();
  await expect(page.getByTestId('screen-passport')).toBeVisible();
}

async function fillExtra(page: Page): Promise<void> {
  await page.getByTestId('passport-extra-passportIssueDate').fill('2020-01-15');
  await page.getByTestId('passport-extra-addressKr').fill('서울특별시 중구 세종대로 110');
  await page.getByTestId('passport-extra-phone').fill('010-1234-5678');
}

test.describe('passport', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-12-25T10:00:00'));
    await seedLang(page, 'vi');
    await openPassport(page);
  });

  test('specimen image fills surname, passport number and birth date', async ({ page }) => {
    test.setTimeout(120_000);
    const fixture = await ensureMrzFixture(page);
    await page.getByTestId('passport-file').setInputFiles(fixture);
    await expect(page.getByTestId('passport-progress')).toHaveAttribute('data-state', 'done', { timeout: 60_000 });
    await expect(page.getByTestId('passport-field-surname')).toHaveValue(/ERIKSSON/, { timeout: 60_000 });
    await expect(page.getByTestId('passport-field-passport-no')).toHaveValue('L898902C3');
    await expect(page.getByTestId('passport-field-birth')).toHaveValue(/1974/);
    await expect(page.getByTestId('passport-error')).toHaveCount(0);
    await page.screenshot({ path: `${SHOT_DIR}/passport-filled.png`, fullPage: true });
  });

  test('no request leaves the origin while reading the photo', async ({ page }) => {
    test.setTimeout(120_000);
    const foreign: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (url.startsWith('data:') || url.startsWith('blob:')) return;
      if (new URL(url).origin !== appOrigin()) foreign.push(url);
    });
    const fixture = await ensureMrzFixture(page);
    await page.getByTestId('passport-file').setInputFiles(fixture);
    await expect(page.getByTestId('passport-progress')).toHaveAttribute('data-state', 'done', { timeout: 60_000 });
    expect(foreign).toEqual([]);
  });

  test('pasted garbage shows an error and fields stay editable', async ({ page }) => {
    await page.getByTestId('passport-mrz-text').fill('this is not a passport');
    await page.getByTestId('passport-parse').click();
    await expect(page.getByTestId('passport-error')).toBeVisible();
    const surname = page.getByTestId('passport-field-surname');
    await surname.fill('KIM');
    await expect(surname).toHaveValue('KIM');
    await page.screenshot({ path: `${SHOT_DIR}/passport-error.png`, fullPage: true });
  });

  test('pasted specimen text parses without OCR', async ({ page }) => {
    await page.getByTestId('passport-mrz-text').fill(MRZ_LINES.join('\n'));
    await page.getByTestId('passport-parse').click();
    await expect(page.getByTestId('passport-error')).toHaveCount(0);
    await expect(page.getByTestId('passport-field-surname')).toHaveValue(/ERIKSSON/);
    await expect(page.getByTestId('passport-field-passport-no')).toHaveValue('L898902C3');
  });

  test('empty address blocks the PDF with a field error and no download', async ({ page }) => {
    await page.getByTestId('passport-mrz-text').fill(MRZ_LINES.join('\n'));
    await page.getByTestId('passport-parse').click();
    await page.getByTestId('passport-extra-passportIssueDate').fill('2020-01-15');
    await page.getByTestId('passport-extra-phone').fill('010-1234-5678');
    let downloads = 0;
    page.on('download', () => { downloads += 1; });
    await page.getByTestId('passport-pdf').click();
    await expect(page.getByTestId('passport-extra-error-addressKr')).toBeVisible();
    await expect(page.getByTestId('passport-pdf')).toBeEnabled();
    expect(downloads).toBe(0);
  });

  test('valid input downloads a PDF with the expected name', async ({ page }) => {
    await page.getByTestId('passport-mrz-text').fill(MRZ_LINES.join('\n'));
    await page.getByTestId('passport-parse').click();
    await fillExtra(page);
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 30_000 }),
      page.getByTestId('passport-pdf').click(),
    ]);
    expect(download.suggestedFilename()).toBe(PDF_NAME);
    const saved = path.join(SHOT_DIR, PDF_NAME);
    await download.saveAs(saved);
    expect(readFileSync(saved).subarray(0, 5).toString('latin1')).toBe('%PDF-');
    await expect(page.getByTestId('passport-pdf-error')).toHaveCount(0);
  });

  test('russian seed renders the screen', async ({ browser }) => {
    const ctx = await browser.newContext({ baseURL: appOrigin(), viewport: { width: 412, height: 915 } });
    const page = await ctx.newPage();
    await seedLang(page, 'ru');
    await openPassport(page);
    await page.getByTestId('passport-mrz-text').fill(MRZ_LINES.join('\n'));
    await page.getByTestId('passport-parse').click();
    await expect(page.getByTestId('passport-field-surname')).toHaveValue(/ERIKSSON/);
    await page.screenshot({ path: `${SHOT_DIR}/passport-ru.png`, fullPage: true });
    await ctx.close();
  });
});
