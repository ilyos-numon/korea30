import { expect, test } from '@playwright/test';
import { installFakeSpeech, removeSpeech, spokenCalls } from './helpers/fakeSpeech';
import { blockVoiceFiles, removeAudio } from './helpers/fakeVoice';
import { seedLang } from './helpers/lang';
test.beforeEach(async ({ page }) => { await seedLang(page); });

const SHOT_DIR = process.env.ILLY_SHOT_DIR ?? 'tests/e2e/screenshots';
const B1 = '한국어를 잘 못해요. 천천히 말해 주세요.';

test('cards list counter daily and quest phrases', async ({ page }) => {
  await page.goto('/#/cards');
  await expect(page.getByTestId('screen-cards')).toBeVisible();
  for (const c of ['counter', 'daily', 'quest']) {
    await expect(page.getByTestId(`cards-group-${c}`)).toBeVisible();
  }
  await expect(page.getByTestId('card-b1')).toBeVisible();
  await expect(page.getByTestId('card-q3')).toBeVisible();
  await expect(page.getByTestId('card-q3')).toContainText('외국인등록 하러 왔어요.');
  await page.screenshot({ path: `${SHOT_DIR}/cards-list.png`, fullPage: true });
});

test('big card shows large Korean and speaks ko-KR', async ({ page }) => {
  await installFakeSpeech(page);
  await blockVoiceFiles(page);
  await page.goto('/#/cards');
  await page.getByTestId('card-b1').click();
  await expect(page.getByTestId('big-card-ko')).toHaveText(B1);
  const fontSize = await page
    .getByTestId('big-card-ko')
    .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(fontSize).toBeGreaterThanOrEqual(30);
  await page.getByTestId('big-card-speak').click();
  await expect.poll(async () => (await spokenCalls(page)).length).toBeGreaterThan(0);
  const calls = await spokenCalls(page);
  expect(calls[calls.length - 1]).toEqual({ text: B1, lang: 'ko-KR' });
  await page.screenshot({ path: `${SHOT_DIR}/cards-big.png`, fullPage: true });
  await page.getByTestId('big-card-close').click();
  await expect(page.getByTestId('big-card')).toHaveCount(0);
});

test('no speech support hides listen button', async ({ page }) => {
  await removeSpeech(page);
  await removeAudio(page);
  await page.goto('/#/cards');
  await page.getByTestId('card-b1').click();
  await expect(page.getByTestId('big-card')).toBeVisible();
  await expect(page.getByTestId('big-card-speak')).toHaveCount(0);
});
