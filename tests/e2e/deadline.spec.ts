import { expect, test, type Page } from '@playwright/test';
import { seedLang } from './helpers/lang';
import { appOrigin } from './helpers/origin';

const SHOT_DIR = process.env.ILLY_SHOT_DIR ?? 'tests/e2e/screenshots';

async function resetDb(page: Page): Promise<void> {
  await page.evaluate(() => indexedDB.deleteDatabase('korea30'));
  await page.reload();
}

async function open(page: Page, today: string, lang = 'vi'): Promise<void> {
  await seedLang(page, lang);
  await page.clock.setFixedTime(new Date(`${today}T10:00:00`));
  await page.goto('/#/deadline');
  await resetDb(page);
  await expect(page.getByTestId('screen-deadline')).toBeVisible();
}

test('unregistered ARC: urgent with due date 2026-12-30', async ({ page }) => {
  await open(page, '2026-12-25');
  await page.getByTestId('stay-entry').fill('2026-10-01');
  await page.getByTestId('stay-save').click();
  const item = page.locator('[data-testid="deadline-item"][data-kind="arcRegistration"]');
  await expect(item).toHaveAttribute('data-level', 'urgent');
  await expect(item).toContainText('2026-12-30');
  await page.screenshot({ path: `${SHOT_DIR}/deadline-timeline.png`, fullPage: true });
});

test('late address change: overdue with fine shown', async ({ page }) => {
  await open(page, '2026-10-27');
  await page.getByTestId('stay-move').fill('2026-10-01');
  await page.getByTestId('stay-save').click();
  const item = page.locator('[data-testid="deadline-item"][data-kind="addressChange"]');
  await expect(item).toHaveAttribute('data-level', 'overdue');
  await expect(item.getByTestId('deadline-fine')).toBeVisible();
});

test('banner shows on home and links to deadline screen', async ({ page }) => {
  await open(page, '2026-12-25');
  await page.getByTestId('stay-entry').fill('2026-10-01');
  await page.getByTestId('stay-save').click();
  await expect(page.getByTestId('deadline-item').first()).toBeVisible();
  await page.goto('/#/');
  const banner = page.getByTestId('deadline-banner');
  await expect(banner).toBeVisible();
  await page.screenshot({ path: `${SHOT_DIR}/deadline-banner.png`, fullPage: true });
  await banner.click();
  await expect(page).toHaveURL(/#\/deadline$/);
  await expect(page.getByTestId('screen-deadline')).toBeVisible();
});

test('expiry before entry shows stay-error and saves nothing', async ({ page }) => {
  await open(page, '2026-12-25');
  await page.getByTestId('stay-entry').fill('2026-10-01');
  await page.getByTestId('stay-expiry').fill('2026-09-01');
  await page.getByTestId('stay-save').click();
  await expect(page.getByTestId('stay-error')).toBeVisible();
  await expect(page.getByTestId('deadline-item')).toHaveCount(0);
});

test('ICS download contains VALARM', async ({ page }) => {
  await open(page, '2026-12-25');
  await page.getByTestId('stay-entry').fill('2026-10-01');
  await page.getByTestId('stay-save').click();
  await expect(page.getByTestId('deadline-item').first()).toBeVisible();
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByTestId('deadline-ics').click()]);
  const file = `${SHOT_DIR}/deadline-download.ics`;
  await download.saveAs(file);
  const text = (await import('node:fs')).readFileSync(file, 'utf8');
  expect(text).toContain('BEGIN:VCALENDAR');
  expect(text).toContain('BEGIN:VALARM');
});

test('empty profile ICS shows deadline-ics-error', async ({ page }) => {
  await open(page, '2026-12-25');
  await page.getByTestId('deadline-ics').click();
  await expect(page.getByTestId('deadline-ics-error')).toBeVisible();
});

test('quest arrival date prefills entry date', async ({ page }) => {
  await seedLang(page);
  await page.clock.setFixedTime(new Date('2026-10-27T10:00:00'));
  await page.goto('/');
  await resetDb(page);
  await page.evaluate(() => localStorage.setItem('korea30.arrival.v1', '2026-10-19'));
  await page.goto('/#/deadline');
  await expect(page.getByTestId('stay-entry')).toHaveValue('2026-10-19');
});

test('zh seed renders timeline with no external requests', async ({ page }) => {
  const external: string[] = [];
  page.on('request', (r) => {
    const u = r.url();
    if (u.startsWith('data:') || u.startsWith('blob:')) return;
    if (new URL(u).origin !== appOrigin()) external.push(u);
  });
  await open(page, '2026-12-25', 'zh');
  await page.getByTestId('stay-entry').fill('2026-10-01');
  await page.getByTestId('stay-save').click();
  await expect(page.getByTestId('deadline-item').first()).toBeVisible();
  await page.screenshot({ path: `${SHOT_DIR}/deadline-zh.png`, fullPage: true });
  expect(external).toEqual([]);
});
