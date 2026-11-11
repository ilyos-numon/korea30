import { expect, test } from '@playwright/test';
import { LANG_KEY, seedLang } from './helpers/lang';
import { appOrigin } from './helpers/origin';

const SHOT_DIR = process.env.ILLY_SHOT_DIR ?? 'tests/e2e/screenshots';
const ORDER = ['zh', 'vi', 'en', 'th', 'uz', 'ru'];
const THAI = /[฀-๿]/;

test('first run shows the language picker with six options in order', async ({ page }) => {
  await page.goto('/#/cards');
  await expect(page.getByTestId('lang-picker')).toBeVisible();
  const ids = await page.locator('[data-testid^="lang-option-"]').evaluateAll((els) =>
    els.map((e) => e.getAttribute('data-testid')),
  );
  expect(ids).toEqual(ORDER.map((l) => `lang-option-${l}`));
  await expect(page.getByTestId('screen-cards')).toHaveCount(0);
  await page.screenshot({ path: `${SHOT_DIR}/i18n-picker.png`, fullPage: true });
});

test('picking zh opens cards in Chinese with a Chinese-variant Korean sentence', async ({ page }) => {
  await page.goto('/#/cards');
  await page.getByTestId('lang-option-zh').click();
  // 처음 고르면 소개 페이지가 한 번 나온다. 건너뛰면 원래 가려던 화면으로 간다
  await expect(page.getByTestId('intro')).toBeVisible();
  await page.getByTestId('intro-skip').click();
  await expect(page.getByTestId('screen-cards')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hans');
  expect(await page.evaluate((k) => localStorage.getItem(k), LANG_KEY)).toBe('zh');
  await expect(page.getByTestId('card-b4')).toContainText('중국어 통역이 가능한가요?');
});

test('chosen language persists across reload', async ({ page }) => {
  await page.goto('/#/cards');
  await page.getByTestId('lang-option-en').click();
  await page.getByTestId('intro-skip').click();
  await expect(page.getByTestId('screen-cards')).toBeVisible();
  await page.reload();
  await expect(page.getByTestId('intro')).toHaveCount(0);
  await expect(page.getByTestId('screen-cards')).toBeVisible();
  await expect(page.getByTestId('lang-picker')).toHaveCount(0);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByTestId('nav-quest')).not.toContainText('Nhiệm vụ');
});

test.describe('browser locale ru-RU', () => {
  test.use({ locale: 'ru-RU' });
  test('only the suggested option is marked and nothing is auto-selected', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('lang-picker')).toBeVisible();
    await expect(page.getByTestId('lang-option-ru')).toHaveAttribute('data-suggested', 'true');
    await expect(page.locator('[data-testid^="lang-option-"][data-suggested="true"]')).toHaveCount(1);
    // 자동 선택 안 함: 일정 시간 동안 퀘스트 화면이 나타나지 않는지 폴링으로 확인
    await expect
      .poll(async () => page.getByTestId('screen-quest').count(), { timeout: 1000, intervals: [100] })
      .toBe(0);
    await expect(page.getByTestId('lang-picker')).toBeVisible();
  });
});

test('invalid stored language falls back to the picker', async ({ page }) => {
  await page.addInitScript((k) => localStorage.setItem(k, 'xx'), LANG_KEY);
  await page.goto('/');
  await expect(page.getByTestId('lang-picker')).toBeVisible();
});

test('header switch changes language live and keeps it after reload', async ({ page }) => {
  await seedLang(page, 'vi');
  await page.goto('/');
  await page.getByTestId('quest-complete').click();
  await expect(page.getByTestId('quest-progress')).toHaveText('Ngày 2 / 30');
  const hash = await page.evaluate(() => location.hash);
  await page.getByTestId('lang-switch').click();
  await expect(page.getByTestId('lang-sheet')).toBeVisible();
  await page.getByTestId('lang-option-th').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'th');
  await expect(page.getByTestId('quest-progress')).toHaveText(THAI);
  await expect(page.getByTestId('quest-progress')).toContainText('2');
  await expect(page.getByTestId('nav-quest')).toHaveText(THAI);
  expect(await page.evaluate(() => location.hash)).toBe(hash);
  await page.screenshot({ path: `${SHOT_DIR}/i18n-switch-th.png`, fullPage: true });
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'th');
  await expect(page.getByTestId('quest-progress')).toHaveText(THAI);
  await expect(page.getByTestId('quest-progress')).toContainText('2');
  await expect(page.getByTestId('nav-quest')).toHaveText(THAI);
});

const SEARCHES: Array<[string, string[]]> = [
  ['zh', ['保险']],
  ['en', ['insurance']],
  ['th', ['ประกัน']],
  ['uz', ["sug'urta", 'sugurta']],
  ['ru', ['страхов']],
];
test('glossary search works in zh, en, th, uz and ru', async ({ browser }) => {
  for (const [lang, queries] of SEARCHES) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await seedLang(page, lang);
    await page.goto('/#/glossary');
    await expect(page.getByTestId('screen-glossary')).toBeVisible();
    const terms = page.locator('article[data-testid^="term-"]');
    const total = await terms.count();
    expect(total).toBeGreaterThanOrEqual(30);
    for (const q of queries) {
      await page.getByTestId('glossary-search').fill(q);
      await expect(page.getByTestId('term-health')).toBeVisible();
      await expect.poll(() => terms.count()).toBeLessThan(total);
    }
    await context.close();
  }
});

test('no external or font requests across languages and routes', async ({ page }) => {
  await seedLang(page, 'vi');
  const urls: string[] = [];
  page.on('request', (r) => urls.push(r.url()));
  await page.goto('/');
  await expect(page.getByTestId('screen-quest')).toBeVisible();
  const routes = ['', 'form', 'payslip', 'cards', 'glossary', 'help'];
  for (let i = 0; i < ORDER.length; i++) {
    await page.getByTestId('lang-switch').click();
    await expect(page.getByTestId('lang-sheet')).toBeVisible();
    await page.getByTestId(`lang-option-${ORDER[i]}`).click();
    await expect(page.locator('html')).not.toHaveAttribute('lang', '');
    await page.goto(`/#/${routes[i]}`);
    await expect(page.getByTestId(`screen-${routes[i] || 'quest'}`)).toBeVisible();
  }
  expect(urls.length).toBeGreaterThan(0);
  for (const u of urls) expect(u.startsWith(appOrigin())).toBe(true);
  expect(urls.filter((u) => /\.(woff2?|ttf|otf)(\?|$)/.test(u))).toHaveLength(0);
});

test('help in uz shows the Uzbek-variant immigration sentence', async ({ page }) => {
  await seedLang(page, 'uz');
  await page.goto('/#/help');
  await expect(page.getByTestId('contact-vi-immigration')).toBeVisible();
  await expect(page.getByTestId('contact-say-immigration')).toContainText('우즈베크어 상담 부탁드립니다.');
});

test('form in th shows the Thailand example', async ({ page }) => {
  await seedLang(page, 'th');
  await page.goto('/#/form');
  await page.getByTestId('form-field-6').click();
  await expect(page.getByTestId('form-guide-example')).toContainText('THAILAND');
});
