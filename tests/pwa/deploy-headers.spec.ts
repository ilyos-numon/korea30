import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { seedLang } from '../e2e/helpers/lang';
import { ensureMrzFixture } from '../e2e/helpers/mrzImage';

const SHOT_DIR = process.env.ILLY_SHOT_DIR ?? 'tests/e2e/screenshots';

function parseHeaders(text: string): Map<string, Map<string, string>> {
  const out = new Map<string, Map<string, string>>();
  let cur: Map<string, string> | null = null;
  for (const line of text.split('\n')) {
    if (line.trim() === '') continue;
    if (!/^\s/.test(line)) {
      cur = new Map();
      out.set(line.trim(), cur);
    } else if (cur) {
      const i = line.indexOf(':');
      cur.set(line.slice(0, i).trim(), line.slice(i + 1).trim());
    }
  }
  return out;
}

const headersText = (): string => readFileSync('public/_headers', 'utf8');
const cspValue = (): string => parseHeaders(headersText()).get('/*')!.get('Content-Security-Policy-Report-Only')!;

async function enforceCsp(page: Page): Promise<string[]> {
  const csp = cspValue();
  await page.context().route('**/*', async (route) => {
    if (route.request().resourceType() !== 'document') return route.continue();
    const res = await route.fetch();
    await route.fulfill({ response: res, headers: { ...res.headers(), 'content-security-policy': csp } });
  });
  await page.addInitScript(() => {
    const w = window as unknown as { __csp: string[] };
    w.__csp = [];
    document.addEventListener('securitypolicyviolation', (e) => {
      w.__csp.push(`${e.violatedDirective} ${e.blockedURI}`);
    });
  });
  const msgs: string[] = [];
  page.on('console', (m) => {
    if (m.text().includes('Content Security Policy')) msgs.push(m.text());
  });
  return msgs;
}

const violations = (page: Page): Promise<string[]> =>
  page.evaluate(() => (window as unknown as { __csp: string[] }).__csp);

test('dist/_headers matches source and has the expected rules', () => {
  expect(readFileSync('dist/_headers').equals(readFileSync('public/_headers'))).toBe(true);
  const h = parseHeaders(headersText());
  for (const p of ['/sw.js', '/manifest.webmanifest', '/index.html', '/']) {
    expect(h.get(p)?.get('Cache-Control'), p).toBe('no-cache');
  }
  expect(h.get('/assets/*')?.get('Cache-Control')).toBe('public, max-age=31536000, immutable');
  const all = h.get('/*')!;
  for (const k of [
    'X-Content-Type-Options',
    'Referrer-Policy',
    'X-Frame-Options',
    'Cross-Origin-Opener-Policy',
    'Permissions-Policy',
    'Content-Security-Policy-Report-Only',
  ]) {
    expect(all.has(k), k).toBe(true);
  }
  expect(all.has('Cache-Control')).toBe(false);
});

test('built dist passes the size check', () => {
  const r = spawnSync(process.execPath, ['scripts/deploy/check-size.mjs', 'dist'], { encoding: 'utf8' });
  expect(r.status).toBe(0);
  expect(r.stdout).toContain('SIZE OK');
});

test.describe('enforced CSP, no service worker', () => {
  test.use({ serviceWorkers: 'block' });

  test('OCR, PDF and privacy screen work with no violations', async ({ page }) => {
    test.setTimeout(240_000);
    const consoleMsgs = await enforceCsp(page);
    await seedLang(page, 'vi');
    await page.goto('/#/passport');
    await expect(page.getByTestId('screen-passport')).toBeVisible();
    const fixture = await ensureMrzFixture(page);
    await page.getByTestId('passport-file').setInputFiles(fixture);
    await expect(page.getByTestId('passport-progress')).toHaveAttribute('data-state', 'done', { timeout: 90_000 });
    await expect(page.getByTestId('passport-field-surname')).toHaveValue(/ERIKSSON/, { timeout: 60_000 });
    await page.getByTestId('passport-extra-passportIssueDate').fill('2020-01-15');
    await page.getByTestId('passport-extra-addressKr').fill('서울특별시 중구 세종대로 110');
    await page.getByTestId('passport-extra-phone').fill('010-1234-5678');
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 30_000 }),
      page.getByTestId('passport-pdf').click(),
    ]);
    const p = await download.path();
    expect(readFileSync(p).subarray(0, 5).toString('latin1')).toBe('%PDF-');
    await page.evaluate(() => {
      location.hash = '#/privacy';
    });
    await expect(page.getByTestId('screen-privacy')).toBeVisible();
    await page.screenshot({ path: `${SHOT_DIR}/csp-privacy.png`, fullPage: true });
    expect(await violations(page)).toEqual([]);
    expect(consoleMsgs).toEqual([]);
  });
});

test('enforced CSP with service worker registers cleanly', async ({ page }) => {
  test.setTimeout(120_000);
  await enforceCsp(page);
  await seedLang(page, 'vi');
  await page.goto('/');
  await expect(page.getByTestId('screen-quest')).toBeVisible();
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
  expect(await violations(page)).toEqual([]);
});
