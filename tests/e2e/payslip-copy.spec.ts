import { expect, test } from '@playwright/test';
import { seedLang } from './helpers/lang';
test.beforeEach(async ({ page }) => { await seedLang(page); });

const SHOT_DIR = process.env.ILLY_SHOT_DIR ?? 'tests/e2e/screenshots';

test('copy rejected → shows copy error, not copied', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.reject(new DOMException('denied', 'NotAllowedError')) },
    });
  });
  await page.goto('/#/payslip');
  await page.getByTestId('payslip-sample-b').click();
  await expect(page.getByTestId('payslip-ask')).toBeVisible();
  const btn = page.getByTestId('payslip-copy');
  await btn.click();
  const err = page.getByTestId('payslip-copy-error');
  await expect(err).toBeVisible();
  await expect(err).toHaveAttribute('role', 'alert');
  await expect(err.locator('[lang="ko"]')).toHaveText('복사하지 못했어요. 글자를 길게 눌러 복사해 보세요.');
  await expect(btn).not.toHaveClass(/is-copied/);
  await err.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${SHOT_DIR}/s9-copy-failed.png` });
});

test('copy allowed → copied, no error', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/#/payslip');
  await page.getByTestId('payslip-sample-b').click();
  const btn = page.getByTestId('payslip-copy');
  await btn.click();
  await expect(btn).toHaveClass(/is-copied/);
  await expect(page.getByTestId('payslip-copy-error')).toHaveCount(0);
});
