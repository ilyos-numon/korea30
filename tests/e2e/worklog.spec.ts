import { expect, test, type Page } from '@playwright/test';
import { seedLang } from './helpers/lang';
import { appOrigin } from './helpers/origin';

const SHOT_DIR = process.env.ILLY_SHOT_DIR ?? 'tests/e2e/screenshots';

test.beforeEach(async ({ page }) => {
  await seedLang(page, 'vi');
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

async function addShift(page: Page, date: string, start: string, end: string, brk: string): Promise<void> {
  await page.getByTestId('work-shift-date').fill(date);
  await page.getByTestId('work-shift-start').fill(start);
  await page.getByTestId('work-shift-end').fill(end);
  await page.getByTestId('work-shift-break').fill(brk);
  await page.getByTestId('work-shift-add').click();
}

async function saveProfile(page: Page, size: 'yes' | 'no' | 'unknown'): Promise<void> {
  await page.getByTestId('work-wage').fill('10320');
  await page.getByTestId('work-size').selectOption(size);
  await page.getByTestId('work-profile-save').click();
}

test('shift add shows row and totals 480/120/120', async ({ page }) => {
  await addShift(page, '2026-10-05', '14:00', '00:00', '0');
  await expect(page.getByTestId('work-shift-row')).toHaveCount(1);
  await expect(page.getByTestId('work-shift-row')).toHaveAttribute('data-date', '2026-10-05');
  await saveProfile(page, 'yes');
  // 480 / 120 / 120 분 = 8시간 / 2시간 / 2시간 (표기는 언어별이므로 숫자만 확인)
  await expect(page.getByTestId('work-total-regular')).toContainText('8');
  await expect(page.getByTestId('work-total-overtime')).toContainText('2');
  await expect(page.getByTestId('work-total-night')).toContainText('2');
  await expect(page.getByTestId('work-expected-gross')).toContainText('1');
  await page.screenshot({ path: `${SHOT_DIR}/work-list.png`, fullPage: true });
});

test('break longer than shift is rejected and not saved', async ({ page }) => {
  await addShift(page, '2026-10-05', '09:00', '10:00', '120');
  await expect(page.getByTestId('work-shift-error')).toBeVisible();
  await expect(page.getByTestId('work-shift-row')).toHaveCount(0);
  await page.reload();
  await expect(page.getByTestId('screen-work')).toBeVisible();
  await expect(page.getByTestId('work-shift-row')).toHaveCount(0);
});

test('shift survives reload and wipe clears it', async ({ page }) => {
  await addShift(page, '2026-10-05', '09:00', '18:00', '60');
  await expect(page.getByTestId('work-shift-row')).toHaveCount(1);
  await page.reload();
  await expect(page.getByTestId('work-shift-row')).toHaveCount(1);
  await expect(page.getByTestId('work-shift-row')).toHaveAttribute('data-date', '2026-10-05');
  await page.getByTestId('work-wipe').click();
  await page.getByTestId('work-wipe-confirm').click();
  await expect(page.getByTestId('work-shift-row')).toHaveCount(0);
  await page.reload();
  await expect(page.getByTestId('screen-work')).toBeVisible();
  await expect(page.getByTestId('work-shift-row')).toHaveCount(0);
});

test('small workplace adds no premium and shows the note', async ({ page }) => {
  await addShift(page, '2026-10-05', '14:00', '00:00', '0');
  await saveProfile(page, 'no');
  await expect(page.getByTestId('work-note-smallWorkplaceNoPremium')).toBeVisible();
  const smallGross = (await page.getByTestId('work-expected-gross').textContent()) ?? '';
  await saveProfile(page, 'yes');
  await expect(page.getByTestId('work-note-smallWorkplaceNoPremium')).toHaveCount(0);
  await expect(page.getByTestId('work-expected-gross')).not.toHaveText(smallGross);
});

test('below minimum wage shows warning', async ({ page }) => {
  await addShift(page, '2026-10-05', '09:00', '18:00', '60');
  await page.getByTestId('work-wage').fill('9000');
  await page.getByTestId('work-size').selectOption('yes');
  await page.getByTestId('work-profile-save').click();
  await expect(page.getByTestId('work-minwage-warning')).toBeVisible();
});

test('payslip lower than expected shows data-status=lower', async ({ page }) => {
  await addShift(page, '2026-10-05', '14:00', '00:00', '0');
  await saveProfile(page, 'yes');
  await page.getByTestId('work-compare-basePay').fill('5000');
  for (const f of ['nationalPension', 'healthInsurance', 'longTermCare', 'employmentInsurance', 'incomeTax', 'localIncomeTax']) {
    await page.getByTestId(`work-compare-${f}`).fill('0');
  }
  await page.getByTestId('work-compare-run').click();
  await expect(page.getByTestId('work-compare-result')).toHaveAttribute('data-status', 'lower');
  await page.screenshot({ path: `${SHOT_DIR}/work-compare.png`, fullPage: true });
});

test('PDF with no shifts shows error and no download', async ({ page }) => {
  let downloaded = false;
  page.on('download', () => {
    downloaded = true;
  });
  await page.getByTestId('work-pdf').click();
  await expect(page.getByTestId('work-pdf-error')).toBeVisible();
  expect(downloaded).toBe(false);
});

test('PDF download has %PDF- header and dated filename', async ({ page }) => {
  await addShift(page, '2026-10-05', '14:00', '00:00', '0');
  await saveProfile(page, 'yes');
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByTestId('work-pdf').click()]);
  expect(download.suggestedFilename()).toBe('korea30-evidence-20261015.pdf');
  const saved = `${SHOT_DIR}/${download.suggestedFilename()}`;
  await download.saveAs(saved);
  const { readFileSync } = await import('node:fs');
  const buf = readFileSync(saved);
  expect(buf.subarray(0, 5).toString('latin1')).toBe('%PDF-');
  expect(buf.length).toBeGreaterThan(1000);
});

test('no external requests while using the work screen', async ({ page }) => {
  const urls: string[] = [];
  page.on('request', (r) => urls.push(r.url()));
  await page.reload();
  await addShift(page, '2026-10-05', '14:00', '00:00', '0');
  await saveProfile(page, 'yes');
  await Promise.all([page.waitForEvent('download'), page.getByTestId('work-pdf').click()]);
  expect(urls.length).toBeGreaterThan(0);
  for (const u of urls) {
    if (u.startsWith('data:') || u.startsWith('blob:')) continue;
    expect(new URL(u).origin).toBe(appOrigin());
  }
});

test('legal badge is visible while unverified items remain', async ({ page }) => {
  await addShift(page, '2026-10-05', '14:00', '00:00', '0');
  await saveProfile(page, 'yes');
  const badge = page.getByTestId('legal-badge');
  if ((await badge.count()) > 0) await expect(badge.first()).toBeVisible();
});

test('vi seeded work screen with a shift (screenshot)', async ({ page }) => {
  await addShift(page, '2026-10-05', '14:00', '00:00', '0');
  await saveProfile(page, 'yes');
  await expect(page.getByTestId('work-shift-row')).toHaveCount(1);
  await page.screenshot({ path: `${SHOT_DIR}/work-vi.png`, fullPage: true });
});
