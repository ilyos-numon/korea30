import { expect, test, type Page } from '@playwright/test';
import { installIdbFailure, setIdbFailure } from './helpers/failStorage';
import { seedLang } from './helpers/lang';

const SHOT_DIR = process.env.ILLY_SHOT_DIR ?? 'tests/e2e/screenshots';
const PLAIN = 'tests/e2e/fixtures/photo-plain.png';

async function open(page: Page): Promise<void> {
  await seedLang(page, 'vi');
  await installIdbFailure(page);
  await page.clock.setFixedTime(new Date('2026-10-15T10:00:00'));
  await page.goto('/#/work');
  await expect(page.getByTestId('screen-work')).toBeVisible();
}

async function fillShift(page: Page): Promise<void> {
  await page.getByTestId('work-shift-date').fill('2026-10-15');
  await page.getByTestId('work-shift-start').fill('09:00');
  await page.getByTestId('work-shift-end').fill('18:00');
  await page.getByTestId('work-shift-break').fill('60');
}

async function addShift(page: Page): Promise<void> {
  await fillShift(page);
  await page.getByTestId('work-shift-add').click();
  await expect(page.getByTestId('work-shift-row')).toHaveCount(1);
}

/** 저장된 사진의 이미지 바이트를 깨뜨린다 (브라우저 IndexedDB 직접) */
async function corruptPhotos(page: Page, bytes: number[]): Promise<void> {
  await page.evaluate(
    (b) =>
      new Promise<void>((resolve, reject) => {
        const open = indexedDB.open('korea30');
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          const tx = db.transaction('photos', 'readwrite');
          const store = tx.objectStore('photos');
          const all = store.getAll();
          all.onsuccess = () => {
            for (const row of all.result as Array<Record<string, unknown>>) {
              store.put({ ...row, image: new Uint8Array(b).buffer });
            }
          };
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
    bytes,
  );
}

async function addPhoto(page: Page): Promise<void> {
  await page.getByTestId('photo-pick').setInputFiles(PLAIN);
  await expect(page.getByTestId('photo-item')).toHaveCount(1);
}

function memoInput(page: Page) {
  return page.locator('label.field:has(input[type="text"]) input[type="text"]').first();
}

test('storage failure on shift save keeps the memo; retry succeeds and clears it', async ({ page }) => {
  await open(page);
  await fillShift(page);
  await page.locator('.work-memo-open').click();
  await memoInput(page).fill('야간 교대');
  await setIdbFailure(page, { write: 'quota' });
  await page.getByTestId('work-shift-add').click();
  const err = page.getByTestId('work-storage-error');
  await expect(err).toBeVisible();
  await expect(err).toHaveAttribute('data-code', 'quota');
  await expect(page.getByTestId('work-shift-row')).toHaveCount(0);
  await expect(memoInput(page)).toHaveValue('야간 교대');
  await err.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${SHOT_DIR}/work-memo-kept-vi.png`, fullPage: true });

  await setIdbFailure(page, { write: null });
  await page.getByTestId('work-shift-add').click();
  await expect(page.getByTestId('work-shift-row')).toHaveCount(1);
  await expect(page.getByTestId('work-storage-error')).toHaveCount(0);
  await expect(memoInput(page)).toHaveValue('');
});

test('damaged photo makes PDF fail, retry without photos downloads and notes dropped', async ({ page }) => {
  await open(page);
  await addShift(page);
  await addPhoto(page);
  await corruptPhotos(page, [1, 2, 3, 4]);
  await page.getByTestId('work-pdf').click();
  const error = page.getByTestId('work-pdf-error');
  await expect(error).toBeVisible();
  const retry = page.getByTestId('work-pdf-retry-nophotos');
  await expect(retry).toBeVisible();
  await error.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${SHOT_DIR}/work-pdf-retry-vi.png`, fullPage: true });

  const [download] = await Promise.all([page.waitForEvent('download'), retry.click()]);
  expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  const note = page.getByTestId('work-pdf-photo-note');
  await expect(note).toBeVisible();
  await expect(note).toHaveAttribute('data-reason', 'dropped');
  await expect(page.getByTestId('work-pdf-error')).toHaveCount(0);
});

test('no retry button when PDF is made without any photos', async ({ page }) => {
  await open(page);
  await addShift(page);
  await Promise.all([page.waitForEvent('download'), page.getByTestId('work-pdf').click()]);
  await expect(page.getByTestId('work-pdf')).toBeEnabled();
  await expect(page.getByTestId('work-pdf-retry-nophotos')).toHaveCount(0);
  await expect(page.getByTestId('work-pdf-error')).toHaveCount(0);
});
