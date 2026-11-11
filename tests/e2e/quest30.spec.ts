import { expect, test, type Page } from '@playwright/test';
import { DAYS_11_20 } from '../../src/quest/days11to20';
import { QUEST_TEXT_11_20 } from '../../src/i18n/packs/quests11to20';
import { ROUTE_HASH, type Route } from '../../src/routes';
import { voiceKey } from '../../src/speech/voiceKey';
import { installFakeSpeech } from './helpers/fakeSpeech';
import { seedLang } from './helpers/lang';

const SHOT_DIR = process.env.ILLY_SHOT_DIR ?? 'tests/e2e/screenshots';
const KEY = 'korea30.progress.v1';

const range = (a: number, b: number): number[] => Array.from({ length: b - a + 1 }, (_, i) => a + i);

async function seedProgress(page: Page, value: string): Promise<void> {
  // 비어 있을 때만 심는다 → reload 후에도 앱이 쓴 값이 유지된다
  await page.addInitScript(
    ([k, v]) => {
      if (localStorage.getItem(k) === null) localStorage.setItem(k, v);
    },
    [KEY, value],
  );
}
const isVoice = (path: string) => (r: { url(): string }) => new URL(r.url()).pathname.endsWith(path);
const stored = (page: Page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? 'null'), KEY);
const noOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

test('vi day 11: dots, title, translation recording, complete opens day 12', async ({ page }) => {
  await seedLang(page, 'vi');
  await installFakeSpeech(page);
  await seedProgress(page, JSON.stringify(range(1, 10)));
  await page.goto('/');
  await expect(page.getByTestId('quest-progress')).toHaveText('Ngày 11 / 30');
  await expect(page.getByTestId('quest-title')).toContainText('외국인등록증 받기');
  await expect(page.getByTestId('quest-dot-11')).toHaveAttribute('data-state', 'today');
  await expect(page.locator('[data-testid^="quest-dot-"]')).toHaveCount(30);
  const path = `/voice/vi/${voiceKey('vi', DAYS_11_20[0].say.viMeaning)}.mp3`;
  const respP = page.waitForResponse(isVoice(path));
  await page.getByTestId('quest-say-speak-tr').click();
  expect([200, 206]).toContain((await respP).status());
  await expect(page.getByTestId('quest-say-speak-tr')).toHaveAttribute('data-voice-source', 'file');
  await page.screenshot({ path: `${SHOT_DIR}/quest30-day11.png`, fullPage: true });
  await page.getByTestId('quest-complete').click();
  await expect(page.getByTestId('quest-progress')).toHaveText('Ngày 12 / 30');
  await page.reload();
  await expect(page.getByTestId('quest-progress')).toHaveText('Ngày 12 / 30');
  expect(await stored(page)).toEqual(range(1, 11));
});

test('en day 20: Korean and English recordings play', async ({ page }) => {
  await seedLang(page, 'en');
  await installFakeSpeech(page);
  await seedProgress(page, JSON.stringify(range(1, 19)));
  await page.goto('/');
  await expect(page.getByTestId('quest-progress')).toHaveText('Day 20 / 30');
  const koPath = `/voice/ko/${voiceKey('ko', '봉투 하나 주세요. 카드로 계산할게요.')}.mp3`;
  const koP = page.waitForResponse(isVoice(koPath));
  await page.getByTestId('quest-say-speak').click();
  expect([200, 206]).toContain((await koP).status());
  await expect(page.getByTestId('quest-say-speak')).toHaveAttribute('data-voice-source', 'file');
  const enPath = `/voice/en/${voiceKey('en', QUEST_TEXT_11_20.en[20].sayMeaning)}.mp3`;
  const enP = page.waitForResponse(isVoice(enPath));
  await page.getByTestId('quest-say-speak-tr').click();
  expect([200, 206]).toContain((await enP).status());
  await expect(page.getByTestId('quest-say-speak-tr')).toHaveAttribute('data-voice-source', 'file');
  await page.screenshot({ path: `${SHOT_DIR}/quest30-day20-en.png`, fullPage: true });
});

test('vi day 30: link to tools, complete shows all-done and persists', async ({ page }) => {
  await seedLang(page, 'vi');
  await seedProgress(page, JSON.stringify(range(1, 29)));
  await page.goto('/');
  await expect(page.getByTestId('quest-progress')).toHaveText('Ngày 30 / 30');
  await expect(page.getByTestId('quest-link')).toHaveAttribute('href', '#/tools');
  await page.screenshot({ path: `${SHOT_DIR}/quest30-day30.png`, fullPage: true });
  await page.getByTestId('quest-complete').click();
  await expect(page.getByTestId('quest-all-done')).toContainText('30');
  await expect(page.getByTestId('quest-all-done')).toContainText('30일 퀘스트를 모두 마쳤어요.');
  await expect(page.getByTestId('quest-complete')).toHaveCount(0);
  await page.screenshot({ path: `${SHOT_DIR}/quest30-all-done.png`, fullPage: true });
  await page.reload();
  await expect(page.getByTestId('quest-all-done')).toBeVisible();
  await expect(page.getByTestId('quest-complete')).toHaveCount(0);
});

const LINKS: Record<number, Route> = {
  12: 'deadline', 13: 'deadline', 15: 'glossary', 16: 'help', 17: 'work', 18: 'help', 19: 'help',
  23: 'glossary', 24: 'glossary', 25: 'glossary', 26: 'help', 27: 'glossary', 30: 'tools',
};
for (const [d, route] of Object.entries(LINKS)) {
  test(`day ${d} link points to ${route}`, async ({ page }) => {
    await seedLang(page, 'vi');
    await seedProgress(page, JSON.stringify(range(1, Number(d) - 1)));
    await page.goto('/');
    await expect(page.getByTestId('quest-progress')).toHaveText(`Ngày ${d} / 30`);
    await expect(page.getByTestId('quest-link')).toHaveAttribute('href', ROUTE_HASH[route]);
  });
}
for (const d of [11, 14, 20, 21, 22, 28, 29]) {
  test(`day ${d} has no link`, async ({ page }) => {
    await seedLang(page, 'vi');
    await seedProgress(page, JSON.stringify(range(1, d - 1)));
    await page.goto('/');
    await expect(page.getByTestId('quest-progress')).toHaveText(`Ngày ${d} / 30`);
    await expect(page.getByTestId('quest-link')).toHaveCount(0);
  });
}

test('failure: broken sequence resumes at the first gap', async ({ page }) => {
  await seedLang(page, 'vi');
  await seedProgress(page, JSON.stringify([...range(1, 10), 12, 13]));
  await page.goto('/');
  await expect(page.getByTestId('quest-progress')).toHaveText('Ngày 11 / 30');
  await expect(page.getByTestId('quest-dot-11')).toHaveAttribute('data-state', 'today');
});

test('failure: invalid json falls back to day 1', async ({ page }) => {
  await seedLang(page, 'vi');
  await seedProgress(page, 'not json');
  await page.goto('/');
  await expect(page.getByTestId('quest-progress')).toHaveText('Ngày 1 / 30');
  await expect(page.getByTestId('quest-dot-1')).toHaveAttribute('data-state', 'today');
});

test('failure: values over 30 are ignored and all-done shows', async ({ page }) => {
  await seedLang(page, 'vi');
  await seedProgress(page, JSON.stringify(range(1, 31)));
  await page.goto('/');
  await expect(page.getByTestId('quest-all-done')).toBeVisible();
});

test('360px: thirty dots fit without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await seedLang(page, 'vi');
  await page.goto('/');
  await expect(page.locator('[data-testid^="quest-dot-"]')).toHaveCount(30);
  expect(await noOverflow(page)).toBe(true);
  const fits = await page.evaluate(() => {
    const dot = document.querySelector('[data-testid="quest-dot-1"]') as HTMLElement;
    const c = dot.parentElement as HTMLElement;
    return c.scrollWidth <= c.clientWidth;
  });
  expect(fits).toBe(true);
  await page.screenshot({ path: `${SHOT_DIR}/quest30-dots-360.png`, fullPage: true });
});

test('th day 25: Thai title and Korean title without overflow', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await seedLang(page, 'th');
  await seedProgress(page, JSON.stringify(range(1, 24)));
  await page.goto('/');
  await expect(page.getByTestId('quest-title')).toContainText('จองคิวไปสำนักงานตรวจคนเข้าเมือง');
  await expect(page.getByTestId('quest-title')).toContainText('출입국 방문 예약하기');
  expect(await noOverflow(page)).toBe(true);
  await page.screenshot({ path: `${SHOT_DIR}/quest30-day25-th.png`, fullPage: true });
});
