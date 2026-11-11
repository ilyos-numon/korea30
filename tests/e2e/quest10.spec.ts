import { expect, test } from '@playwright/test';
import { installFakeSpeech, removeSpeech, spokenCalls } from './helpers/fakeSpeech';
import { blockVoiceFiles, removeAudio } from './helpers/fakeVoice';
import { seedLang } from './helpers/lang';
test.beforeEach(async ({ page }) => { await seedLang(page); });

const SHOT_DIR = process.env.ILLY_SHOT_DIR ?? 'tests/e2e/screenshots';
const SAY1 = '선불 유심 개통하고 싶어요. 여권 여기 있어요.';

test('shows thirty progress dots on first visit', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('quest-progress')).toHaveText('Ngày 1 / 30');
  await expect(page.locator('[data-testid^="quest-dot-"]')).toHaveCount(30);
  await expect(page.getByTestId('quest-dot-1')).toHaveAttribute('data-state', 'today');
  await expect(page.getByTestId('quest-dot-2')).toHaveAttribute('data-state', 'locked');
  await expect(page.getByTestId('quest-item-10')).toHaveAttribute('data-state', 'locked');
  await page.screenshot({ path: `${SHOT_DIR}/quest10-day1.png`, fullPage: true });
});

test('arrival date shows D+N and survives reload', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-23T09:00:00'));
  await page.goto('/');
  await page.getByTestId('quest-arrival-open').click();
  await page.getByTestId('quest-arrival-input').fill('2026-10-19');
  await page.getByTestId('quest-arrival-save').click();
  await expect(page.getByTestId('quest-dplus')).toHaveText('D+5');
  await page.reload();
  await expect(page.getByTestId('quest-dplus')).toHaveText('D+5');
  await page.screenshot({ path: `${SHOT_DIR}/quest-dplus.png`, fullPage: true });
});

test('future arrival date is rejected', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-23T09:00:00'));
  await page.goto('/');
  await page.getByTestId('quest-arrival-open').click();
  // max 속성 때문에 fill 은 통과하지만 앱 검증이 거부해야 한다.
  await page.getByTestId('quest-arrival-input').fill('2026-10-30');
  await page.getByTestId('quest-arrival-save').click();
  await expect(page.getByTestId('quest-arrival-error')).toBeVisible();
  await expect(page.getByTestId('quest-dplus')).toHaveCount(0);
});

test('day 3 links to the form guide', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('korea30.progress.v1', '[1,2]'));
  await page.goto('/');
  await expect(page.getByTestId('quest-progress')).toHaveText('Ngày 3 / 30');
  await expect(page.getByTestId('quest-link')).toHaveAttribute('href', '#/form');
  await page.getByTestId('quest-link').click();
  await expect(page.getByTestId('screen-form')).toBeVisible();
});

test('say sentence can be spoken and shown big', async ({ page }) => {
  await installFakeSpeech(page);
  await blockVoiceFiles(page);
  await page.goto('/');
  await page.getByTestId('quest-say-speak').click();
  await expect.poll(() => spokenCalls(page)).toEqual([{ text: SAY1, lang: 'ko-KR' }]);
  await page.getByTestId('quest-say-big').click();
  await expect(page.getByTestId('big-card-ko')).toHaveText(SAY1);
  await page.screenshot({ path: `${SHOT_DIR}/quest-big-card.png`, fullPage: true });
});

test('speak button hidden without speech support', async ({ page }) => {
  await removeSpeech(page);
  await removeAudio(page);
  await page.goto('/');
  await expect(page.getByTestId('quest-say-big')).toBeVisible();
  await expect(page.getByTestId('quest-say-speak')).toHaveCount(0);
});

test('day 10 links to payslip and opens day 11', async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem('korea30.progress.v1', '[1,2,3,4,5,6,7,8,9]'),
  );
  await page.goto('/');
  await expect(page.getByTestId('quest-title')).toContainText('급여명세서');
  await expect(page.getByTestId('quest-link')).toHaveAttribute('href', '#/payslip');
  await page.getByTestId('quest-complete').click();
  await expect(page.getByTestId('quest-progress')).toHaveText('Ngày 11 / 30');
  await expect(page.getByTestId('quest-all-done')).toHaveCount(0);
  await page.screenshot({ path: `${SHOT_DIR}/quest10-day11.png`, fullPage: true });
});
