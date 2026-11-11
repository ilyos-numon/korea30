import { expect, test, type Page } from '@playwright/test';
import { seedLang } from './helpers/lang';

/** 진입 애니메이션이 끝난 뒤 캡처한다 (고정 sleep 아님) */
async function settle(page: Page): Promise<void> {
  await page.evaluate(() => Promise.all(document.getAnimations().filter((a) => Number.isFinite(a.effect?.getComputedTiming().endTime ?? 0)).map((a) => a.finished.catch(() => undefined))));
}

const SHOT_DIR = process.env.ILLY_SHOT_DIR ?? 'tests/e2e/screenshots';
const IPHONE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';

async function openQuest(page: Page): Promise<void> {
  await seedLang(page, 'vi');
  await page.goto('/#/');
  await expect(page.getByTestId('screen-quest')).toBeVisible();
}

test.describe('Chromium install prompt', () => {
  test('beforeinstallprompt shows prompt mode and the button calls prompt()', async ({ page }) => {
    await openQuest(page);
    await expect(page.getByTestId('install-hint')).toHaveCount(0);
    await page.evaluate(() => {
      const w = window as unknown as { __promptCalled: boolean };
      w.__promptCalled = false;
      const ev = new Event('beforeinstallprompt', { cancelable: true }) as Event & { prompt: () => Promise<void> };
      ev.prompt = () => {
        w.__promptCalled = true;
        return Promise.resolve();
      };
      window.dispatchEvent(ev);
    });
    const hint = page.getByTestId('install-hint');
    await expect(hint).toBeVisible();
    await expect(hint).toHaveAttribute('data-mode', 'prompt');
    await settle(page);
  await page.screenshot({ path: `${SHOT_DIR}/install-hint-prompt-vi.png`, fullPage: true });
    await page.getByTestId('install-hint-install').click();
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { __promptCalled: boolean }).__promptCalled))
      .toBe(true);
  });

  test('no hint without the install event on Chromium', async ({ page }) => {
    await openQuest(page);
    await expect(page.getByTestId('install-hint')).toHaveCount(0);
  });

  test('hint is not shown outside the quest screen', async ({ page }) => {
    await openQuest(page);
    await page.evaluate(() => {
      const ev = new Event('beforeinstallprompt', { cancelable: true }) as Event & { prompt: () => Promise<void> };
      ev.prompt = () => Promise.resolve();
      window.dispatchEvent(ev);
    });
    await expect(page.getByTestId('install-hint')).toBeVisible();
    await page.goto('/#/tools');
    await expect(page.getByTestId('backup-section')).toBeVisible();
    await expect(page.getByTestId('install-hint')).toHaveCount(0);
  });
});

test.describe('iOS Safari', () => {
  test.use({ userAgent: IPHONE_UA });

  test('shows share-to-home-screen steps and stays closed after dismissing', async ({ page }) => {
    await openQuest(page);
    const hint = page.getByTestId('install-hint');
    await expect(hint).toBeVisible();
    await expect(hint).toHaveAttribute('data-mode', 'ios');
    await expect(page.getByTestId('install-hint-ios-steps')).toBeVisible();
    await settle(page);
  await page.screenshot({ path: `${SHOT_DIR}/install-hint-ios-vi.png`, fullPage: true });
    await page.getByTestId('install-hint-close').click();
    await expect(hint).toHaveCount(0);
    await page.reload();
    await expect(page.getByTestId('screen-quest')).toBeVisible();
    await expect(page.getByTestId('install-hint')).toHaveCount(0);
  });
});
