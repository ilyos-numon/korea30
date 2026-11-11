import { expect, test } from '@playwright/test';
import { LANG_KEY } from './helpers/lang';

const SHOT_DIR = process.env.ILLY_SHOT_DIR ?? 'tests/e2e/screenshots';
const INTRO_KEY = 'korea30.intro.v1';

async function noHScroll(page: import('@playwright/test').Page): Promise<void> {
  const [sw, cw] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  expect(sw).toBeLessThanOrEqual(cw);
}

test('first language pick shows the intro once; start opens the quest screen', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('lang-option-vi').click();
  await expect(page.getByTestId('intro')).toBeVisible();
  await expect(page.getByTestId('intro-slide-1')).toHaveAttribute('data-active', 'true');
  await expect(page.getByTestId('intro-slide-1')).toContainText('30');
  await noHScroll(page);
  await page.screenshot({ path: `${SHOT_DIR}/intro-1-vi.png` });
  for (const n of [2, 3, 4]) {
    await page.getByTestId('intro-next').click();
    await expect(page.getByTestId(`intro-slide-${n}`)).toHaveAttribute('data-active', 'true');
  }
  await expect(page.getByTestId('intro-next')).toHaveCount(0);
  await page.screenshot({ path: `${SHOT_DIR}/intro-4-vi.png` });
  await page.getByTestId('intro-start').click();
  await expect(page.getByTestId('screen-quest')).toBeVisible();
  await expect(page.getByTestId('intro')).toHaveCount(0);
  expect(await page.evaluate((k) => localStorage.getItem(k), INTRO_KEY)).toBe('1');
  expect(await page.evaluate((k) => localStorage.getItem(k), LANG_KEY)).toBe('vi');
  await page.reload();
  await expect(page.getByTestId('screen-quest')).toBeVisible();
  await expect(page.getByTestId('intro')).toHaveCount(0);
});

test('swiping the slides changes the active slide', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('lang-option-en').click();
  await expect(page.getByTestId('intro')).toBeVisible();
  await page.locator('.intro-track').evaluate((el) => el.scrollTo({ left: el.clientWidth * 2 }));
  await expect(page.getByTestId('intro-slide-3')).toHaveAttribute('data-active', 'true');
});

test('skip keeps the deep link target', async ({ page }) => {
  await page.goto('/#/glossary');
  await page.getByTestId('lang-option-th').click();
  await expect(page.getByTestId('intro')).toBeVisible();
  await page.getByTestId('intro-skip').click();
  await expect(page.getByTestId('screen-glossary')).toBeVisible();
});

test('the intro can be opened again from the records hub and the language sheet', async ({ page }) => {
  await page.addInitScript(
    ([lk, ik]) => {
      localStorage.setItem(lk, 'ru');
      localStorage.setItem(ik, '1');
    },
    [LANG_KEY, INTRO_KEY],
  );
  await page.goto('/#/tools');
  await expect(page.getByTestId('intro')).toHaveCount(0);
  await page.getByTestId('tools-about').click();
  await expect(page.getByTestId('intro')).toBeVisible();
  await page.getByTestId('intro-skip').click();
  await expect(page.getByTestId('screen-tools')).toBeVisible();
  await page.getByTestId('lang-switch').click();
  await page.getByTestId('lang-sheet-about').click();
  await expect(page.getByTestId('intro')).toBeVisible();
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('intro still works and finishes', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('lang-option-zh').click();
    await expect(page.getByTestId('intro')).toBeVisible();
    for (let i = 0; i < 3; i++) await page.getByTestId('intro-next').click();
    await page.getByTestId('intro-start').click();
    await expect(page.getByTestId('screen-quest')).toBeVisible();
  });
});

test('no request leaves the origin during the intro', async ({ page }) => {
  const urls: string[] = [];
  page.on('request', (r) => urls.push(r.url()));
  await page.goto('/');
  await page.getByTestId('lang-option-uz').click();
  for (let i = 0; i < 3; i++) await page.getByTestId('intro-next').click();
  await page.getByTestId('intro-start').click();
  await expect(page.getByTestId('screen-quest')).toBeVisible();
  const origin = new URL(page.url()).origin;
  for (const u of urls) {
    if (u.startsWith('data:') || u.startsWith('blob:')) continue;
    expect(new URL(u).origin).toBe(origin);
  }
  expect(urls.filter((u) => /\.(woff2?|ttf|otf)(\?|$)/.test(u))).toHaveLength(0);
});
