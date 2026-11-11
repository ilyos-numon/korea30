import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { ABOUT_PACKS } from '../../src/about/i18n';
import { seedLang } from './helpers/lang';

const SHOT_DIR = process.env.ILLY_SHOT_DIR ?? 'tests/e2e/screenshots';
const SECTIONS = ['nocollect', 'storage', 'photo', 'backup', 'hosting'];

const noHScroll = (page: Page): Promise<boolean> =>
  page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

test.describe('about screens', () => {
  test.beforeEach(async ({ page }) => {
    await seedLang(page, 'vi');
  });

  test('tools link opens the privacy policy in vi', async ({ page }) => {
    await page.goto('/#/tools');
    await expect(page.getByTestId('screen-tools')).toBeVisible();
    await page.getByTestId('tools-privacy-link').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${SHOT_DIR}/about-tools-links.png`, fullPage: true });
    await expect(page.getByTestId('tools-terms-link')).toBeVisible();
    await page.getByTestId('tools-privacy-link').click();
    await expect(page).toHaveURL(/#\/privacy$/);
    await expect(page.getByTestId('screen-privacy')).toBeVisible();
    for (const id of SECTIONS) await expect(page.getByTestId(`privacy-section-${id}`)).toBeVisible();
    await expect(page.getByTestId('about-title')).toHaveText(ABOUT_PACKS.vi!.privacyTitle);
    await expect(page.getByTestId('privacy-updated')).toContainText('2026-10-29');
    await expect(page.getByTestId('nav-tools')).toHaveAttribute('aria-current', 'page');
    await expect(page.getByTestId('about-contact-pending')).toBeVisible();
    await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
    await page.screenshot({ path: `${SHOT_DIR}/about-privacy-vi.png`, fullPage: true });
  });

  test('switching to en re-renders the privacy policy', async ({ page }) => {
    await page.goto('/#/privacy');
    await expect(page.getByTestId('screen-privacy')).toBeVisible();
    await page.getByTestId('lang-switch').click();
    await page.getByTestId('lang-option-en').click();
    await expect(page.getByTestId('about-title')).toHaveText(ABOUT_PACKS.en.privacyTitle);
    await expect(page.getByTestId('privacy-section-storage').locator('h2')).toHaveText(
      ABOUT_PACKS.en.privacyStorageTitle,
    );
    await page.screenshot({ path: `${SHOT_DIR}/about-privacy-en.png`, fullPage: true });
  });

  test('help links to terms and terms links back to privacy', async ({ page }) => {
    await page.goto('/#/help');
    await expect(page.getByTestId('screen-help')).toBeVisible();
    await page.getByTestId('help-terms-link').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${SHOT_DIR}/about-help-link.png`, fullPage: true });
    await page.getByTestId('help-terms-link').click();
    await expect(page).toHaveURL(/#\/terms$/);
    await expect(page.getByTestId('screen-terms')).toBeVisible();
    for (const id of ['notadvice', 'accuracy', 'docs']) {
      await expect(page.getByTestId(`terms-section-${id}`)).toBeVisible();
    }
    await expect(page.getByTestId('terms-section-notadvice')).toContainText('1345');
    await expect(page.getByTestId('terms-section-notadvice')).toContainText('1350');
    await page.screenshot({ path: `${SHOT_DIR}/about-terms-vi.png`, fullPage: true });
    await page.getByTestId('terms-to-privacy').click();
    await expect(page).toHaveURL(/#\/privacy$/);
    await expect(page.getByTestId('screen-privacy')).toBeVisible();
  });

  for (const lang of ['zh', 'vi', 'en', 'th', 'uz', 'ru']) {
    test(`no horizontal scroll at 360px in ${lang}`, async ({ browser, baseURL }) => {
      const ctx = await browser.newContext({ baseURL, viewport: { width: 360, height: 800 } });
      const page = await ctx.newPage();
      await seedLang(page, lang);
      for (const name of ['privacy', 'terms']) {
        await page.goto(`/#/${name}`);
        await expect(page.getByTestId(`screen-${name}`)).toBeVisible();
        expect(await noHScroll(page)).toBe(true);
      }
      await ctx.close();
    });
  }

  for (const hash of ['#/privacy/', '#/terms?x=1']) {
    test(`unknown route ${hash} falls back to quest`, async ({ page }) => {
      await page.goto(`/${hash}`);
      await expect(page.getByTestId('screen-quest')).toBeVisible();
      await expect(page.getByTestId('screen-privacy')).toHaveCount(0);
      await expect(page.getByTestId('screen-terms')).toHaveCount(0);
    });
  }
});
