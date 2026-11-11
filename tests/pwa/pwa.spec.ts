import { expect, test } from '@playwright/test';
import { copyFileSync, readdirSync, readFileSync, appendFileSync, existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { seedLang } from '../e2e/helpers/lang';
import { waitForSwControl } from './helpers';

const SHOT_DIR = process.env.ILLY_SHOT_DIR ?? 'tests/e2e/screenshots';
const DIST = path.resolve('dist');

test.beforeEach(async ({ page }) => {
  await seedLang(page, 'vi');
});

test('manifest is linked, standalone, and its icons load', async ({ page }) => {
  await page.goto('/');
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(href).toBeTruthy();
  const res = await page.request.get(new URL(href!, page.url()).toString());
  expect(res.status()).toBe(200);
  const m = (await res.json()) as {
    display: string;
    theme_color: string;
    icons: { src: string; sizes: string }[];
  };
  expect(m.display).toBe('standalone');
  expect(m.theme_color).toBe('#f6f5f1');
  expect(m.icons).toHaveLength(3);
  for (const icon of m.icons) {
    const r = await page.request.get(new URL(icon.src, new URL(href!, page.url())).toString());
    expect(r.status()).toBe(200);
    expect(r.headers()['content-type']).toContain('image/png');
  }
});

test('works offline after reload: quest, glossary, voice mp3', async ({ page, context }) => {
  test.setTimeout(120_000);
  await page.goto('/');
  await waitForSwControl(page);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByTestId('screen-quest')).toBeVisible();
  await expect(page.getByTestId('quest-progress')).toHaveText('Ngày 1 / 30');
  await page.screenshot({ path: `${SHOT_DIR}/pwa-offline-quest.png`, fullPage: true });
  await page.getByTestId('quest-complete').click();
  await expect(page.getByTestId('quest-progress')).toHaveText('Ngày 2 / 30');

  await page.goto('/#/glossary');
  await expect(page.getByTestId('screen-glossary')).toBeVisible();
  expect(await page.locator('[data-testid^="term-"]').count()).toBeGreaterThanOrEqual(1);
  await page.screenshot({ path: `${SHOT_DIR}/pwa-offline-glossary.png`, fullPage: true });

  const mp3 = readdirSync(path.join(DIST, 'voice', 'ko')).filter((f) => f.endsWith('.mp3')).sort()[0];
  expect(mp3).toBeTruthy();
  const status = await page.evaluate(async (name) => (await fetch(`/voice/ko/${name}`)).status, mp3);
  expect(status).toBe(200);
});

test('every request from every tab stays on the app origin', async ({ page, context, baseURL }) => {
  const origin = new URL(baseURL!).origin;
  const seen: string[] = [];
  context.on('request', (req) => {
    const url = req.url();
    if (url.startsWith('data:') || url.startsWith('blob:')) return;
    seen.push(url);
  });
  await page.goto('/');
  await waitForSwControl(page);
  const second = await context.newPage();
  await second.goto('/#/glossary');
  await expect(second.getByTestId('screen-glossary')).toBeVisible();
  await page.goto('/#/tools');
  await page.reload();
  expect(seen.length).toBeGreaterThan(0);
  expect(seen.filter((u) => new URL(u).origin !== origin)).toEqual([]);
});

test('no update notice when nothing changed', async ({ page }) => {
  await page.goto('/');
  await waitForSwControl(page);
  await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    await reg.update();
  });
  await page.reload();
  await expect(page.getByTestId('screen-quest')).toBeVisible();
  await expect(page.getByTestId('pwa-update')).toHaveCount(0);
});

test.describe('update', () => {
  const swPath = path.join(DIST, 'sw.js');
  let backup = '';

  test.beforeEach(() => {
    backup = path.join(mkdtempSync(path.join(tmpdir(), 'k30-sw-')), 'sw.js.orig');
    copyFileSync(swPath, backup);
  });

  test.afterEach(() => {
    if (backup && existsSync(backup)) copyFileSync(backup, swPath);
  });

  test('a changed service worker shows the notice; reload applies it', async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto('/');
    await waitForSwControl(page);
    expect(readFileSync(swPath, 'utf8')).toBe(readFileSync(backup, 'utf8'));
    appendFileSync(swPath, `\n// e2e-update-${Date.now()}\n`);
    await page.evaluate(async () => {
      const reg = await navigator.serviceWorker.ready;
      await reg.update();
    });
    await expect(page.getByTestId('pwa-update')).toBeVisible({ timeout: 60_000 });
    await page.screenshot({ path: `${SHOT_DIR}/pwa-update-notice.png`, fullPage: true });
    await page.getByTestId('pwa-update-reload').click();
    await expect(page.getByTestId('screen-quest')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('pwa-update')).toHaveCount(0);
  });
});
