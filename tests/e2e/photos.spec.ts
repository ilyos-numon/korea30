import { expect, test, type Page } from '@playwright/test';
import { seedLang } from './helpers/lang';
import { appOrigin } from './helpers/origin';

const SHOT_DIR = process.env.ILLY_SHOT_DIR ?? 'tests/e2e/screenshots';
const EXIF = 'tests/e2e/fixtures/photo-exif.jpg';
const PLAIN = 'tests/e2e/fixtures/photo-plain.png';
const TODAY = '2026-10-27T10:00:00';

test.beforeEach(async ({ page }) => {
  await seedLang(page, 'vi');
  await page.clock.setFixedTime(new Date(TODAY));
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

async function setNow(page: Page, iso: string, month?: string): Promise<void> {
  await page.clock.setFixedTime(new Date(iso));
  await page.reload();
  await expect(page.getByTestId('screen-work')).toBeVisible();
  if (month) await page.getByTestId('work-month').fill(month);
}

async function addExifPhoto(page: Page, expected: number, memo = ''): Promise<void> {
  if (memo) await page.getByTestId('photo-memo').fill(memo);
  await page.getByTestId('photo-camera').setInputFiles(EXIF);
  await expect(page.getByTestId('photo-item')).toHaveCount(expected);
}

async function addShift(page: Page, date: string, start: string, end: string, brk: string): Promise<void> {
  await page.getByTestId('work-shift-date').fill(date);
  await page.getByTestId('work-shift-start').fill(start);
  await page.getByTestId('work-shift-end').fill(end);
  await page.getByTestId('work-shift-break').fill(brk);
  await page.getByTestId('work-shift-add').click();
}

interface StoredPhoto {
  count: number;
  takenOn: string;
  expiresOn: string;
  imageHasExif: boolean;
  thumbHasExif: boolean;
}

async function readStored(page: Page): Promise<StoredPhoto> {
  return page.evaluate(
    () =>
      new Promise<StoredPhoto>((resolve, reject) => {
        const open = indexedDB.open('korea30');
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          const req = db.transaction('photos', 'readonly').objectStore('photos').getAll();
          req.onerror = () => reject(req.error);
          req.onsuccess = () => {
            const rows = req.result as Array<Record<string, unknown>>;
            const has = (b: unknown): boolean => {
              const u = new Uint8Array(b as ArrayBuffer);
              for (let i = 0; i + 5 < u.length; i++) {
                if (u[i] === 0x45 && u[i + 1] === 0x78 && u[i + 2] === 0x69 && u[i + 3] === 0x66 && u[i + 4] === 0 && u[i + 5] === 0)
                  return true;
              }
              return false;
            };
            const r = rows[0] ?? {};
            db.close();
            resolve({
              count: rows.length,
              takenOn: String(r.takenOn ?? ''),
              expiresOn: String(r.expiresOn ?? ''),
              imageHasExif: has(r.image),
              thumbHasExif: has(r.thumb),
            });
          };
        };
      }),
  );
}

test('camera input stores photo with exif date and 24-month expiry', async ({ page }) => {
  await page.getByTestId('photo-memo').fill('ca dem');
  await page.getByTestId('photo-camera').setInputFiles(EXIF);
  const item = page.getByTestId('photo-item');
  await expect(item).toHaveCount(1);
  await expect(page.getByTestId('photo-status')).not.toBeEmpty();
  await expect(item).toHaveAttribute('data-date', '2026-10-27');
  await expect(item).toHaveAttribute('data-expires', '2028-10-20');
  await expect(page.getByTestId('photo-item-taken')).toContainText('2026-10-20');
  await expect(page.getByTestId('photo-item-memo')).toHaveText('ca dem');
  await page.reload();
  await expect(page.getByTestId('photo-item')).toHaveCount(1);
  await expect(page.getByTestId('photo-item')).toHaveAttribute('data-expires', '2028-10-20');
  await page.screenshot({ path: `${SHOT_DIR}/photos-list-vi.png`, fullPage: true });
});

test('metadata removed from stored image and thumb', async ({ page }) => {
  await addExifPhoto(page, 1);
  const rec = await readStored(page);
  expect(rec.count).toBe(1);
  expect(rec.imageHasExif).toBe(false);
  expect(rec.thumbHasExif).toBe(false);
  expect(rec.takenOn).toBe('2026-10-20');
});

test('gallery without exif uses save date', async ({ page }) => {
  await page.getByTestId('photo-pick').setInputFiles(PLAIN);
  await expect(page.getByTestId('photo-item')).toHaveCount(1);
  await expect(page.getByTestId('photo-item-taken')).toHaveAttribute('data-source', 'saved');
  await expect(page.getByTestId('photo-item')).toHaveAttribute('data-expires', '2028-10-27');
});

test('viewer and expiry edit validates future date', async ({ page }) => {
  await addExifPhoto(page, 1);
  await page.getByTestId('photo-open').click();
  await expect(page.getByTestId('photo-viewer')).toBeVisible();
  await expect(page.getByTestId('photo-viewer-taken')).toHaveAttribute('data-source', 'exif');
  await page.getByTestId('photo-expiry-input').fill('2027-01-31');
  await page.getByTestId('photo-expiry-save').click();
  await expect(page.getByTestId('photo-expiry-custom')).toBeVisible();
  await page.getByTestId('photo-expiry-input').fill('2026-10-27');
  await page.getByTestId('photo-expiry-save').click();
  await expect(page.getByTestId('photo-expiry-error')).toHaveAttribute('data-code', 'notFuture');
  await page.screenshot({ path: `${SHOT_DIR}/photos-viewer-vi.png`, fullPage: true });
  await page.getByTestId('photo-viewer-close').click();
  await expect(page.getByTestId('photo-item')).toHaveAttribute('data-expires', '2027-01-31');
});

test('retention change recalculates non-custom photos only', async ({ page }) => {
  await addExifPhoto(page, 1);
  await page.getByTestId('photo-open').first().click();
  await page.getByTestId('photo-expiry-input').fill('2027-01-31');
  await page.getByTestId('photo-expiry-save').click();
  await expect(page.getByTestId('photo-expiry-custom')).toBeVisible();
  await page.getByTestId('photo-viewer-close').click();
  await addExifPhoto(page, 2);
  // 같은 시각(고정 시계)에 저장돼 순서가 정해지지 않으므로 값 집합으로 비교한다
  const expiries = async (): Promise<string[]> =>
    (await page.getByTestId('photo-item').evaluateAll((els) => els.map((e) => e.getAttribute('data-expires') ?? ''))).sort();
  expect(await expiries()).toEqual(['2027-01-31', '2028-10-20']);
  await page.getByTestId('photo-settings').locator('summary').click();
  await page.screenshot({ path: `${SHOT_DIR}/photos-settings-vi.png`, fullPage: true });
  await page.getByTestId('photo-retention').fill('36');
  await page.getByTestId('photo-retention-save').click();
  await expect(page.getByTestId('photo-retention-status')).toBeVisible();
  await expect.poll(expiries).toEqual(['2027-01-31', '2029-10-20']);
});

test('retention invalid values are rejected and value kept', async ({ page }) => {
  await page.getByTestId('photo-settings').locator('summary').click();
  for (const v of ['0', '121']) {
    await page.getByTestId('photo-retention').fill(v);
    await page.getByTestId('photo-retention-save').click();
    await expect(page.getByTestId('photo-retention-error')).toBeVisible();
    await expect(page.getByTestId('photo-retention')).toHaveValue(v);
    await expect(page.getByTestId('photo-retention-status')).toHaveCount(0);
  }
  await page.reload();
  await page.getByTestId('photo-settings').locator('summary').click();
  await expect(page.getByTestId('photo-retention')).toHaveValue('24');
});

test('retention shrink asks before expiring and purges after', async ({ page }) => {
  await addExifPhoto(page, 1);
  await setNow(page, '2028-01-10T10:00:00');
  await page.getByTestId('photo-settings').locator('summary').click();
  await page.getByTestId('photo-retention').fill('12');
  await page.getByTestId('photo-retention-save').click();
  await expect(page.getByTestId('photo-retention-ask')).toHaveAttribute('data-count', '1');
  await page.getByTestId('photo-retention-confirm').click();
  await expect(page.getByTestId('photo-retention-status')).toBeVisible();
  await page.reload();
  await expect(page.getByTestId('expired-photos-prompt')).toHaveAttribute('data-count', '1');
  await page.getByTestId('expired-photos-delete').click();
  await expect(page.getByTestId('photo-purged')).toHaveAttribute('data-count', '1');
  expect((await readStored(page)).count).toBe(0);
});

test('expiry notice and auto delete', async ({ page }) => {
  await addExifPhoto(page, 1);
  await setNow(page, '2028-09-30T10:00:00', '2026-10');
  await expect(page.getByTestId('photo-item')).toHaveAttribute('data-state', 'soon');
  await expect(page.getByTestId('photo-item-soon')).toContainText('20');
  await expect(page.getByTestId('photo-item-soon')).toHaveAttribute('data-days', '20');
  await page.screenshot({ path: `${SHOT_DIR}/photos-soon-vi.png`, fullPage: true });
  await setNow(page, '2028-10-21T10:00:00', '2026-10');
  await expect(page.getByTestId('expired-photos-prompt')).toHaveAttribute('data-count', '1');
  await page.getByTestId('expired-photos-delete').click();
  await expect(page.getByTestId('photo-purged')).toHaveAttribute('data-count', '1');
  await expect(page.getByTestId('photo-item')).toHaveCount(0);
  await page.screenshot({ path: `${SHOT_DIR}/photos-purged-vi.png`, fullPage: true });
});

test('invalid files rejected without changing the list', async ({ page }) => {
  const cases: Array<{ name: string; mimeType: string; buffer: Buffer; code: string }> = [
    { name: 'a.txt', mimeType: 'text/plain', buffer: Buffer.from('hello'), code: 'notImage' },
    { name: 'broken.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('this is not a jpeg at all'), code: 'decode' },
    { name: 'huge.jpg', mimeType: 'image/jpeg', buffer: Buffer.alloc(26 * 1024 * 1024, 1), code: 'tooLarge' },
  ];
  for (const c of cases) {
    await page.getByTestId('photo-pick').setInputFiles({ name: c.name, mimeType: c.mimeType, buffer: c.buffer });
    await expect(page.getByTestId('photo-error')).toHaveAttribute('data-code', c.code);
    await expect(page.getByTestId('photo-item')).toHaveCount(0);
    await expect(page.getByTestId('photo-empty')).toBeVisible();
  }
  expect((await readStored(page)).count).toBe(0);
});

async function shiftAndProfile(page: Page): Promise<void> {
  await addShift(page, '2026-10-26', '14:00', '23:00', '60');
  await expect(page.getByTestId('work-shift-row')).toHaveCount(1);
  await page.getByTestId('work-wage').fill('10320');
  await page.getByTestId('work-size').selectOption('yes');
  await page.getByTestId('work-profile-save').click();
}

test('pdf includes photo as image and is downloadable', async ({ page }) => {
  await shiftAndProfile(page);
  await addExifPhoto(page, 1);
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByTestId('work-pdf').click()]);
  const saved = `${SHOT_DIR}/${download.suggestedFilename()}`;
  await download.saveAs(saved);
  const { readFileSync } = await import('node:fs');
  const buf = readFileSync(saved);
  expect(buf.subarray(0, 5).toString('latin1')).toBe('%PDF-');
  expect(buf.toString('latin1')).toContain('/Subtype /Image');
});

test('delete photo removes it permanently', async ({ page }) => {
  await addExifPhoto(page, 1);
  await page.getByTestId('photo-open').click();
  await page.getByTestId('photo-delete').click();
  await page.getByTestId('photo-delete-confirm').click();
  await expect(page.getByTestId('photo-item')).toHaveCount(0);
  await page.reload();
  await expect(page.getByTestId('photo-empty')).toBeVisible();
  expect((await readStored(page)).count).toBe(0);
});

test('wipe all removes photos', async ({ page }) => {
  await addExifPhoto(page, 1);
  await page.getByTestId('work-wipe').click();
  await expect(page.getByTestId('work-wipe-photos-note')).toBeVisible();
  await page.getByTestId('work-wipe-confirm').click();
  await expect(page.getByTestId('photo-item')).toHaveCount(0);
  await page.reload();
  await expect(page.getByTestId('photo-empty')).toBeVisible();
  expect((await readStored(page)).count).toBe(0);
});

test('shift delete unlinks photo but keeps it', async ({ page }) => {
  await addShift(page, '2026-10-26', '09:00', '18:00', '60');
  await expect(page.getByTestId('work-shift-row')).toHaveCount(1);
  await page.getByTestId('photo-shift').selectOption({ index: 1 });
  await addExifPhoto(page, 1);
  await expect(page.getByTestId('photo-item-shift')).toBeVisible();
  await page.getByTestId('work-shift-delete').click();
  await expect(page.getByTestId('work-shift-row')).toHaveCount(0);
  await expect(page.getByTestId('photo-item')).toHaveCount(1);
  await expect(page.getByTestId('photo-item-shift')).toHaveCount(0);
});

test('no external request during photo and pdf flows', async ({ page }) => {
  const urls: string[] = [];
  page.on('request', (r) => urls.push(r.url()));
  await shiftAndProfile(page);
  await addExifPhoto(page, 1);
  await page.getByTestId('photo-open').click();
  await page.getByTestId('photo-viewer-close').click();
  await Promise.all([page.waitForEvent('download'), page.getByTestId('work-pdf').click()]);
  expect(urls.length).toBeGreaterThan(0);
  for (const u of urls) {
    if (u.startsWith('data:') || u.startsWith('blob:')) continue;
    expect(new URL(u).origin).toBe(appOrigin());
  }
});

test('no horizontal overflow at 412px with list and viewer', async ({ page }) => {
  await page.setViewportSize({ width: 412, height: 800 });
  await page.reload();
  await expect(page.getByTestId('screen-work')).toBeVisible();
  await addExifPhoto(page, 1, 'ghi chu rat dai '.repeat(6));
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(412);
  await page.getByTestId('photo-open').click();
  await expect(page.getByTestId('photo-viewer')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(412);
});
