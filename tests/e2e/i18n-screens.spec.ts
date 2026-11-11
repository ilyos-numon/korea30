import { expect, test } from '@playwright/test';
import { seedLang } from './helpers/lang';

const SHOT_DIR = process.env.ILLY_SHOT_DIR ?? 'tests/e2e/screenshots';

const HTML_LANG: Record<string, string> = {
  zh: 'zh-Hans', vi: 'vi', en: 'en', th: 'th', uz: 'uz-Latn', ru: 'ru',
};
// §4.8 PRON 문자 체계: 포함해야 할 문자 / 있으면 안 되는 문자
const HANGUL = /[가-힯ᄀ-ᇿ㄰-㆏]/;
const LATIN = /[A-Za-z]/;
const CYR = /[Ѐ-ӿ]/;
const PRON: Record<string, { has: RegExp; not: RegExp[] }> = {
  zh: { has: /[一-鿿]/, not: [HANGUL, LATIN] },
  vi: { has: /\S/, not: [HANGUL] },
  en: { has: /^[A-Za-z0-9\s\-'.,?!]+$/, not: [HANGUL] },
  th: { has: /[฀-๿]/, not: [HANGUL, LATIN] },
  uz: { has: LATIN, not: [HANGUL, CYR] },
  ru: { has: CYR, not: [HANGUL, LATIN] },
};
const ROUTES: Array<[string, string]> = [
  ['', 'quest'], ['form', 'form'], ['payslip', 'payslip'],
  ['cards', 'cards'], ['glossary', 'glossary'], ['help', 'help'],
  ['tools', 'tools'], ['work', 'work'], ['deadline', 'deadline'], ['passport', 'passport'],
];

for (const lang of ['zh', 'vi', 'en', 'th', 'uz', 'ru']) {
  test(`all screens render cleanly in ${lang}`, async ({ page }) => {
    await seedLang(page, lang);
    for (const [route, name] of ROUTES) {
      await page.goto(`/#/${route}`);
      await expect(page.getByTestId(`screen-${name}`)).toBeVisible();
      const text = await page.evaluate(() => document.body.innerText);
      expect(text).not.toMatch(/undefined|\[object |NaN|TODO/);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
      ).toBe(true);
      await expect(page.locator('html')).toHaveAttribute('lang', HTML_LANG[lang]);
      if (name === 'quest') {
        await page.screenshot({ path: `${SHOT_DIR}/i18n-${lang}-quest.png`, fullPage: true });
      }
    }

    await page.goto('/#/cards');
    await page.getByTestId('card-b1').click();
    await expect(page.getByTestId('big-card')).toBeVisible();
    const pron = (await page.getByTestId('big-card-pron').innerText()).trim();
    const rule = PRON[lang];
    expect(pron).toMatch(rule.has);
    for (const n of rule.not) expect(pron).not.toMatch(n);
    await page.screenshot({ path: `${SHOT_DIR}/i18n-${lang}-card-big.png`, fullPage: true });

    await page.goto('/#/form');
    await page.getByTestId('form-field-6').click();
    await expect(page.getByTestId('form-guide-example')).toBeVisible();
    await page.screenshot({ path: `${SHOT_DIR}/i18n-${lang}-form.png`, fullPage: true });
  });
}
