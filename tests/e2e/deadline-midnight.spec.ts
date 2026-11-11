import { expect, test, type Page } from '@playwright/test';
import { seedLang } from './helpers/lang';

const SHOT_DIR = process.env.ILLY_SHOT_DIR ?? 'tests/e2e/screenshots';

// 입국 2026-10-01 → 외국인등록 기한 2026-12-30. 12-22 = 8일(soon), 12-23 = 7일(urgent)
async function setup(page: Page): Promise<void> {
  await seedLang(page, 'en');
  await page.clock.install({ time: new Date('2026-12-22T10:00:00') });
  await page.goto('/#/deadline');
  await expect(page.getByTestId('screen-deadline')).toBeVisible();
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
  await expect(page.getByTestId('screen-deadline')).toBeVisible();
  await page.getByTestId('stay-entry').fill('2026-10-01');
  await page.getByTestId('stay-save').click();
  const item = page.locator('[data-testid="deadline-item"][data-kind="arcRegistration"]');
  await expect(item).toHaveAttribute('data-level', 'soon');
  await expect(item).toContainText('2026-12-30');
}

// setSystemTime 은 타이머를 발화·재예약하지 않는다 (10:00 에 잡힌 자정 타이머는 가상 14시간 뒤 그대로).
// 23:59 에 탭으로 돌아온 상황(visibilitychange)을 만들어 자정 타이머를 다시 잡게 한 뒤 runFor 로 자정을 넘긴다.
async function jumpTo2359(page: Page): Promise<void> {
  await page.clock.setSystemTime(new Date('2026-12-22T23:59:00'));
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
}

test('banner appears after local midnight without reload', async ({ page }) => {
  await setup(page);
  await page.goto('/#/');
  await jumpTo2359(page);
  await expect(page.getByTestId('deadline-banner')).toHaveCount(0);
  await page.clock.runFor('02:00');
  await expect(page.getByTestId('deadline-banner')).toBeVisible();
  await page.screenshot({ path: `${SHOT_DIR}/s8-banner-after-midnight.png`, fullPage: true });
});

test('timeline level turns urgent after midnight while staying on the screen', async ({ page }) => {
  await setup(page);
  await jumpTo2359(page);
  const item = page.locator('[data-testid="deadline-item"][data-kind="arcRegistration"]');
  await expect(item).toHaveAttribute('data-level', 'soon');
  await page.clock.runFor('02:00');
  await expect(item).toHaveAttribute('data-level', 'urgent');
});
