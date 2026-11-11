import { expect, test, type Page } from '@playwright/test';
import { failIdbReadsFromStart, installIdbFailure, setIdbFailure } from './helpers/failStorage';
import { seedLang } from './helpers/lang';

const SHOT_DIR = process.env.ILLY_SHOT_DIR ?? 'tests/e2e/screenshots';
const PLAIN = 'tests/e2e/fixtures/photo-plain.png';

// en 문구 (src/ui/i18n/en.ts, src/worklog/i18n/en.ts)
const STORAGE_FULL = 'Your phone storage is full, so this was not saved. Free up space and try again.';
const STORAGE_FAILED = "Couldn't save on this phone. Please try again.";
const LOAD_FAILED = "Couldn't read the records saved on this phone.";
const SHIFT_DELETED = 'Work record deleted.';
const PROFILE_SAVED = 'Saved.';
const WIPED = 'All work records were deleted.';

test.beforeEach(async ({ page }) => {
  await seedLang(page, 'en');
  await installIdbFailure(page);
  await page.clock.setFixedTime(new Date('2026-10-15T10:00:00'));
  await page.goto('/#/work');
  await expect(page.getByTestId('screen-work')).toBeVisible();
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
  await expect(page.getByTestId('screen-work')).toBeVisible();
});

async function addShift(page: Page, date: string): Promise<void> {
  await page.getByTestId('work-shift-date').fill(date);
  await page.getByTestId('work-shift-start').fill('09:00');
  await page.getByTestId('work-shift-end').fill('18:00');
  await page.getByTestId('work-shift-break').fill('60');
  await page.getByTestId('work-shift-add').click();
}

async function readStore(page: Page, store: 'shifts' | 'photos'): Promise<Array<Record<string, unknown>>> {
  return page.evaluate(
    (name) =>
      new Promise<Array<Record<string, unknown>>>((resolve, reject) => {
        const open = indexedDB.open('korea30');
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          const req = db.transaction(name, 'readonly').objectStore(name).getAll();
          req.onerror = () => reject(req.error);
          req.onsuccess = () => {
            const rows = (req.result as Array<Record<string, unknown>>).map((r) => ({ id: r.id, shiftId: r.shiftId }));
            db.close();
            resolve(rows);
          };
        };
      }),
    store,
  );
}

test('quota on add shows storage full and saves nothing', async ({ page }) => {
  await setIdbFailure(page, { write: 'quota' });
  await addShift(page, '2026-10-15');
  const err = page.getByTestId('work-storage-error');
  await expect(err).toBeVisible();
  await expect(err).toHaveAttribute('data-code', 'quota');
  await expect(err).toHaveAttribute('role', 'alert');
  await expect(err).toContainText(STORAGE_FULL);
  await expect(page.locator('[data-testid="work-shift-row"][data-date="2026-10-15"]')).toHaveCount(0);
  await page.screenshot({ path: `${SHOT_DIR}/s5-work-storage-full.png`, fullPage: true });
  await setIdbFailure(page, { write: null });
  await page.reload();
  await expect(page.getByTestId('screen-work')).toBeVisible();
  await expect(page.locator('[data-testid="work-shift-row"][data-date="2026-10-15"]')).toHaveCount(0);
});

test('unknown on profile save shows storage failed and no saved note', async ({ page }) => {
  await setIdbFailure(page, { write: 'unknown' });
  await page.getByTestId('work-wage').fill('10320');
  await page.getByTestId('work-profile-save').click();
  const err = page.getByTestId('work-storage-error');
  await expect(err).toBeVisible();
  await expect(err).toHaveAttribute('data-code', 'unknown');
  await expect(err).toContainText(STORAGE_FAILED);
  await expect(page.getByText(PROFILE_SAVED, { exact: true })).toHaveCount(0);
});

test('delete failure keeps row and shows error', async ({ page }) => {
  await addShift(page, '2026-10-15');
  await expect(page.getByTestId('work-shift-row')).toHaveCount(1);
  await setIdbFailure(page, { write: 'unknown' });
  await page.getByTestId('work-shift-delete').click();
  await expect(page.getByTestId('work-storage-error')).toHaveAttribute('data-code', 'unknown');
  await expect(page.getByTestId('work-shift-row')).toHaveCount(1);
  await expect(page.getByTestId('work-undo-note')).toHaveCount(0);
});

test('wipe failure shows error and keeps rows', async ({ page }) => {
  await addShift(page, '2026-10-15');
  await expect(page.getByTestId('work-shift-row')).toHaveCount(1);
  await setIdbFailure(page, { write: 'unknown' });
  await page.getByTestId('work-wipe').click();
  await page.getByTestId('work-wipe-confirm').click();
  await expect(page.getByTestId('work-storage-error')).toHaveAttribute('data-code', 'unknown');
  await expect(page.getByText(WIPED)).toHaveCount(0);
  await expect(page.getByTestId('work-shift-row')).toHaveCount(1);
});

test('load failure shows load error', async ({ page }) => {
  await failIdbReadsFromStart(page, 'unknown');
  await page.reload();
  await expect(page.getByTestId('screen-work')).toBeVisible();
  const err = page.getByTestId('work-load-error');
  await expect(err).toBeVisible();
  await expect(err).toHaveAttribute('role', 'alert');
  await expect(err).toContainText(LOAD_FAILED);
  await page.screenshot({ path: `${SHOT_DIR}/s5-work-load-error.png`, fullPage: true });
});

test('error clears on next successful save', async ({ page }) => {
  await setIdbFailure(page, { write: 'quota' });
  await addShift(page, '2026-10-15');
  await expect(page.getByTestId('work-storage-error')).toBeVisible();
  await setIdbFailure(page, { write: null });
  await page.getByTestId('work-shift-add').click();
  await expect(page.locator('[data-testid="work-shift-row"][data-date="2026-10-15"]')).toHaveCount(1);
  await expect(page.getByTestId('work-storage-error')).toHaveCount(0);
});

test('undo restores shift and photo link', async ({ page }) => {
  await addShift(page, '2026-10-15');
  await expect(page.getByTestId('work-shift-row')).toHaveCount(1);
  const [stored] = await readStore(page, 'shifts');
  const shiftId = String(stored.id);
  await page.getByTestId('photo-shift').selectOption({ index: 1 });
  await page.getByTestId('photo-pick').setInputFiles(PLAIN);
  await expect(page.getByTestId('photo-item')).toHaveCount(1);
  await expect(page.getByTestId('photo-item-shift')).toBeVisible();

  await page.getByTestId('work-shift-delete').click();
  await expect(page.getByTestId('work-shift-row')).toHaveCount(0);
  const note = page.getByTestId('work-undo-note');
  await expect(note).toBeVisible();
  await expect(note).toHaveAttribute('role', 'status');
  await expect(note).toContainText(SHIFT_DELETED);
  await expect(page.getByTestId('photo-item-shift')).toHaveCount(0);
  await page.screenshot({ path: `${SHOT_DIR}/s5-work-undo-note.png`, fullPage: true });

  await page.getByTestId('work-undo').click();
  await expect(page.getByTestId('work-shift-row')).toHaveCount(1);
  await expect(page.getByTestId('photo-item-shift')).toBeVisible();
  await expect(page.getByTestId('work-undo-note')).toHaveCount(0);

  await page.reload();
  await expect(page.getByTestId('screen-work')).toBeVisible();
  await expect(page.getByTestId('work-shift-row')).toHaveCount(1);
  const shifts = await readStore(page, 'shifts');
  expect(shifts.map((s) => s.id)).toEqual([shiftId]);
  const photos = await readStore(page, 'photos');
  expect(photos).toHaveLength(1);
  expect(photos[0].shiftId).toBe(shiftId);
});

test('undo note goes away on next add', async ({ page }) => {
  await addShift(page, '2026-10-15');
  await expect(page.getByTestId('work-shift-row')).toHaveCount(1);
  await page.getByTestId('work-shift-delete').click();
  await expect(page.getByTestId('work-undo-note')).toBeVisible();
  await addShift(page, '2026-10-14');
  await expect(page.getByTestId('work-shift-row')).toHaveCount(1);
  await expect(page.getByTestId('work-undo-note')).toHaveCount(0);
});
