import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { seedLang } from './helpers/lang';

/** 진입 애니메이션이 끝난 뒤 캡처한다 (고정 sleep 아님) */
async function settle(page: Page): Promise<void> {
  await page.evaluate(() => Promise.all(document.getAnimations().filter((a) => Number.isFinite(a.effect?.getComputedTiming().endTime ?? 0)).map((a) => a.finished.catch(() => undefined))));
}

const SHOT_DIR = process.env.ILLY_SHOT_DIR ?? 'tests/e2e/screenshots';
const EXIF = 'tests/e2e/fixtures/photo-exif.jpg';
const NOT_JSON = 'tests/e2e/fixtures/backup-not-json.txt';
const TODAY = '2026-10-27T10:00:00';

async function addShift(page: Page, date: string): Promise<void> {
  await page.getByTestId('work-shift-date').fill(date);
  await page.getByTestId('work-shift-start').fill('09:00');
  await page.getByTestId('work-shift-end').fill('18:00');
  await page.getByTestId('work-shift-break').fill('60');
  await page.getByTestId('work-shift-add').click();
}

/** 시프트 2 · 사진 1 · 체류 입국일 · 퀘스트 3일을 만든다 */
async function seedData(page: Page): Promise<void> {
  await seedLang(page, 'vi');
  await page.clock.setFixedTime(new Date(TODAY));
  await page.goto('/#/work');
  await expect(page.getByTestId('screen-work')).toBeVisible();
  await addShift(page, '2026-10-05');
  await expect(page.getByTestId('work-shift-row')).toHaveCount(1);
  await addShift(page, '2026-10-06');
  await expect(page.getByTestId('work-shift-row')).toHaveCount(2);
  await page.getByTestId('photo-camera').setInputFiles(EXIF);
  await expect(page.getByTestId('photo-item')).toHaveCount(1);

  await page.goto('/#/deadline');
  await expect(page.getByTestId('screen-deadline')).toBeVisible();
  await page.getByTestId('stay-entry').fill('2026-10-01');
  await page.getByTestId('stay-save').click();
  await expect(page.getByTestId('deadline-item').first()).toBeVisible();

  await page.evaluate(() => localStorage.setItem('korea30.progress.v1', '[1,2,3]'));
  await page.goto('/#/tools');
  await page.reload();
  await expect(page.getByTestId('backup-section')).toBeVisible();
}

test('export, wipe everything, import restores shifts, photo, stay and quest days', async ({ page }) => {
  await seedData(page);
  await settle(page);
  await page.screenshot({ path: `${SHOT_DIR}/backup-section-vi.png`, fullPage: true });

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('backup-export').click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/\.json$/);
  const path = await download.path();
  const text = readFileSync(path, 'utf8');
  const json = JSON.parse(text) as {
    format: string;
    version: number;
    idb: { shifts: unknown[]; photos: unknown[]; stayProfile: unknown };
    localStorage: Record<string, string>;
  };
  expect(json.format).toBe('korea30-backup');
  expect(json.version).toBe(1);
  expect(json.idb.shifts).toHaveLength(2);
  expect(json.idb.photos).toHaveLength(1);
  expect(json.idb.stayProfile).not.toBeNull();
  expect(json.localStorage['korea30.progress.v1']).toBe('[1,2,3]');
  await expect(page.getByTestId('backup-done')).toHaveAttribute('data-kind', 'export');

  // 기록 전부 지우기
  await page.goto('/#/work');
  await expect(page.getByTestId('work-shift-row')).toHaveCount(2);
  await page.getByTestId('work-wipe').click();
  await page.getByTestId('work-wipe-confirm').click();
  await expect(page.getByTestId('work-shift-row')).toHaveCount(0);
  await page.goto('/#/deadline');
  await expect(page.getByTestId('screen-deadline')).toBeVisible();
  await page.getByTestId('stay-wipe').click();
  await expect(page.getByTestId('deadline-item')).toHaveCount(0);
  await page.evaluate(() => localStorage.removeItem('korea30.progress.v1'));
  await page.goto('/#/tools');
  await page.reload();
  await expect(page.getByTestId('backup-section')).toBeVisible();

  await page.getByTestId('backup-import-input').setInputFiles({
    name: 'korea30-backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(text, 'utf8'),
  });
  const preview = page.getByTestId('backup-preview');
  await expect(preview).toBeVisible();
  await expect(preview).toHaveAttribute('data-shifts', '2');
  await expect(preview).toHaveAttribute('data-photos', '1');
  await expect(preview).toHaveAttribute('data-quest-days', '3');
  await settle(page);
  await page.screenshot({ path: `${SHOT_DIR}/backup-preview-vi.png`, fullPage: true });

  await Promise.all([page.waitForEvent('load'), page.getByTestId('backup-restore-confirm').click()]);

  await page.goto('/#/work');
  await expect(page.getByTestId('screen-work')).toBeVisible();
  await expect(page.getByTestId('work-shift-row')).toHaveCount(2);
  await expect(page.getByTestId('photo-item')).toHaveCount(1);
  await page.goto('/#/deadline');
  await expect(page.getByTestId('screen-deadline')).toBeVisible();
  await expect(page.getByTestId('stay-entry')).toHaveValue('2026-10-01');
  await page.goto('/#/');
  await expect(page.getByTestId('screen-quest')).toBeVisible();
  await expect(page.getByTestId('quest-progress')).toHaveText('Ngày 4 / 30');
  await expect(page.getByTestId('quest-dot-4')).toHaveAttribute('data-state', 'today');
});

async function seedTwoShifts(page: Page): Promise<void> {
  await seedLang(page, 'vi');
  await page.clock.setFixedTime(new Date(TODAY));
  await page.goto('/#/work');
  await expect(page.getByTestId('screen-work')).toBeVisible();
  await addShift(page, '2026-10-05');
  await expect(page.getByTestId('work-shift-row')).toHaveCount(1);
  await addShift(page, '2026-10-06');
  await expect(page.getByTestId('work-shift-row')).toHaveCount(2);
  await page.goto('/#/tools');
  await expect(page.getByTestId('backup-section')).toBeVisible();
}

async function expectShiftsKept(page: Page): Promise<void> {
  await page.goto('/#/work');
  await expect(page.getByTestId('screen-work')).toBeVisible();
  await expect(page.getByTestId('work-shift-row')).toHaveCount(2);
}

test('a non-JSON file shows notJson, no preview, and keeps existing data', async ({ page }) => {
  await seedTwoShifts(page);
  await page.getByTestId('backup-import-input').setInputFiles(NOT_JSON);
  const err = page.getByTestId('backup-error');
  await expect(err).toBeVisible();
  await expect(err).toHaveAttribute('data-code', 'notJson');
  await expect(page.getByTestId('backup-preview')).toHaveCount(0);
  await settle(page);
  await page.screenshot({ path: `${SHOT_DIR}/backup-error-vi.png`, fullPage: true });
  await expectShiftsKept(page);
});

test('a JSON file from another app shows otherApp and keeps existing data', async ({ page }) => {
  await seedTwoShifts(page);
  await page.getByTestId('backup-import-input').setInputFiles({
    name: 'other.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"format":"other"}', 'utf8'),
  });
  await expect(page.getByTestId('backup-error')).toHaveAttribute('data-code', 'otherApp');
  await expect(page.getByTestId('backup-preview')).toHaveCount(0);
  await expectShiftsKept(page);
});

test('cancel on the preview changes nothing', async ({ page }) => {
  await seedTwoShifts(page);
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('backup-export').click(),
  ]);
  const text = readFileSync(await download.path(), 'utf8');
  await page.getByTestId('backup-import-input').setInputFiles({
    name: 'korea30-backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(text, 'utf8'),
  });
  await expect(page.getByTestId('backup-preview')).toBeVisible();
  await page.getByTestId('backup-restore-cancel').click();
  await expect(page.getByTestId('backup-preview')).toHaveCount(0);
  await expect(page.getByTestId('backup-error')).toHaveCount(0);
  await expectShiftsKept(page);
});
