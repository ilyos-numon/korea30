import { expect, test } from '@playwright/test';
import { seedLang } from './helpers/lang';
test.beforeEach(async ({ page }) => { await seedLang(page); });

const SHOT_DIR = process.env.ILLY_SHOT_DIR ?? 'tests/e2e/screenshots';

const noHScroll = (page: import('@playwright/test').Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

test('tab bar shows six tabs and marks current', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('tab-bar').locator('a')).toHaveCount(6);
  await expect(page.getByTestId('nav-quest')).toHaveAttribute('aria-current', 'page');
  await page.getByTestId('nav-payslip').click();
  await expect(page).toHaveURL(/#\/payslip$/);
  await expect(page.getByTestId('screen-payslip')).toBeVisible();
  await expect(page.getByTestId('nav-payslip')).toHaveAttribute('aria-current', 'page');
  await expect(page.getByTestId('nav-tools')).toBeVisible();
  await page.screenshot({ path: `${SHOT_DIR}/nav-tabbar.png`, fullPage: true });
});

test('every route opens its screen without horizontal scroll', async ({ page }) => {
  await page.goto('/');
  for (const name of ['form', 'payslip', 'cards', 'glossary', 'help', 'tools', 'work', 'deadline', 'passport']) {
    await page.goto(`/#/${name}`);
    await expect(page.getByTestId(`screen-${name}`)).toBeVisible();
    expect(await noHScroll(page)).toBe(true);
  }
});

for (const route of ['deadline', 'work', 'passport']) {
  test(`#/${route} keeps the tools tab current`, async ({ page }) => {
    await page.goto(`/#/${route}`);
    await expect(page.getByTestId(`screen-${route}`)).toBeVisible();
    await expect(page.getByTestId('nav-tools')).toHaveAttribute('aria-current', 'page');
    await expect(page.getByTestId('nav-quest')).not.toHaveAttribute('aria-current', 'page');
  });
}

test('help is one tap from any screen', async ({ page }) => {
  await page.goto('/#/payslip');
  await expect(page.getByTestId('screen-payslip')).toBeVisible();
  await page.getByTestId('nav-help').click();
  await expect(page.getByTestId('screen-help')).toBeVisible();
});

test('no external requests across all screens', async ({ page }) => {
  const urls: string[] = [];
  page.on('request', (r) => urls.push(r.url()));
  await page.goto('/');
  await expect(page.getByTestId('screen-quest')).toBeVisible();
  await page.getByTestId('quest-complete').click();
  await expect(page.getByTestId('quest-progress')).toHaveText('Ngày 2 / 30');
  for (const name of ['form', 'payslip', 'cards', 'glossary', 'help']) {
    await page.goto(`/#/${name}`);
    await expect(page.getByTestId(`screen-${name}`)).toBeVisible();
    if (name === 'payslip') {
      await page.getByTestId('payslip-sample-b').click();
      await expect(page.getByTestId('payslip-ask')).toBeVisible();
    }
    if (name === 'cards') {
      await page.getByTestId('card-b1').click();
      await expect(page.getByTestId('big-card')).toBeVisible();
    }
  }
  expect(urls.length).toBeGreaterThan(0);
  const origin = new URL(page.url()).origin;
  for (const u of urls) {
    expect(u.startsWith(origin)).toBe(true);
  }
});
