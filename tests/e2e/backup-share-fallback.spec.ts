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

/** 시프트 1개를 만들고 도구 화면까지 이동한다 */
async function prepare(page: Page): Promise<void> {
  await at(page, '2026-10-20T10:00:00', '/#/work', 'screen-work');
  await addShift(page, '2026-10-05');
  await page.goto('/#/tools');
  await page.reload();
}

test.beforeEach(async ({ page }) => {
  await seedLang(page, 'vi');
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true });
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: () => Promise.reject(new DOMException('blocked', 'NotAllowedError')),
    });
  });
});

test('tools export falls back to download when share is rejected', async ({ page }) => {
  await prepare(page);
  await expect(page.getByTestId('backup-section')).toBeVisible();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('backup-export').click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/\.json$/);
  await expect(page.getByTestId('backup-done')).toHaveAttribute('data-kind', 'export');
  await expect(page.getByTestId('backup-error')).toHaveCount(0);
});

test('reminder backup-now falls back to download when share is rejected', async ({ page }) => {
  await prepare(page);
  const reminder = page.getByTestId('backup-reminder');
  await expect(reminder).toBeVisible();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('backup-reminder-now').click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/\.json$/);
  await expect(reminder).toHaveCount(0);
});

test('reminder shows export error when download fallback also fails', async ({ page }) => {
  await prepare(page);
  const reminder = page.getByTestId('backup-reminder');
  await expect(reminder).toBeVisible();
  await page.evaluate(() => {
    URL.createObjectURL = () => {
      throw new DOMException('blocked', 'SecurityError');
    };
  });
  await page.getByTestId('backup-reminder-now').click();
  const err = page.getByTestId('backup-reminder-error');
  await expect(err).toBeVisible();
  await expect(err).toHaveAttribute('data-code', 'exportFailed');
  await expect(err).toHaveAttribute('data-err-name', 'SecurityError');
  await expect(reminder).toBeVisible();
  await settle(page);
  await page.screenshot({ path: `${SHOT_DIR}/backup-reminder-error-vi.png`, fullPage: true });
});
