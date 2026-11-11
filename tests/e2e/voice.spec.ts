import { expect, test, type Page } from '@playwright/test';
import { voiceKey } from '../../src/speech/voiceKey';
import {
  blockVoiceFiles,
  corruptVoiceFiles,
  installFakeSpeechWithVoices,
  playedAudio,
  trackAudio,
} from './helpers/fakeVoice';
import { installFakeSpeech, removeSpeech, spokenCalls } from './helpers/fakeSpeech';
import { seedLang } from './helpers/lang';

const SHOT_DIR = process.env.ILLY_SHOT_DIR ?? 'tests/e2e/screenshots';
const B1 = '한국어를 잘 못해요. 천천히 말해 주세요.';

function isVoice(path: string): (url: string) => boolean {
  return (url) => new URL(url).pathname.endsWith(path);
}

async function openB1(page: Page): Promise<void> {
  await page.goto('/#/cards');
  await page.getByTestId('card-b1').click();
  await expect(page.getByTestId('big-card-ko')).toHaveText(B1);
}

test('vi: big card Korean listen plays the recording and nothing else is requested', async ({ page }) => {
  await seedLang(page, 'vi');
  await installFakeSpeech(page);
  await trackAudio(page);
  await openB1(page);
  const requests: string[] = [];
  page.on('request', (r) => requests.push(r.url()));
  const path = `/voice/ko/${voiceKey('ko', B1)}.mp3`;
  const respP = page.waitForResponse((r) => isVoice(path)(r.url()));
  await page.getByTestId('big-card-speak').click();
  const resp = await respP;
  expect([200, 206]).toContain(resp.status());
  expect(resp.headers()['content-type']).toContain('audio/mpeg');
  await expect(page.getByTestId('big-card-speak')).toHaveAttribute('data-voice-source', 'file');
  await expect.poll(async () => (await playedAudio(page)).some((p) => p.ok && p.src.endsWith(path))).toBe(true);
  expect(await spokenCalls(page)).toEqual([]);
  // 외부로 나가는 요청 없음
  const origin = new URL(page.url()).origin;
  expect(requests.filter((u) => !u.startsWith(origin) && !u.startsWith('data:') && !u.startsWith('blob:'))).toEqual([]);
  await page.screenshot({ path: `${SHOT_DIR}/voice-bigcard-vi.png`, fullPage: true });
});

test('vi: big card translation listen plays the vi recording', async ({ page }) => {
  await seedLang(page, 'vi');
  await installFakeSpeech(page);
  await openB1(page);
  const meaning = (await page.getByTestId('big-card-vi').innerText()).trim();
  const path = `/voice/vi/${voiceKey('vi', meaning)}.mp3`;
  const respP = page.waitForResponse((r) => isVoice(path)(r.url()));
  await page.getByTestId('big-card-speak-tr').click();
  expect([200, 206]).toContain((await respP).status());
  await expect(page.getByTestId('big-card-speak-tr')).toHaveAttribute('data-voice-source', 'file');
});

test('en: glossary term translation listen plays the en recording', async ({ page }) => {
  await seedLang(page, 'en');
  await installFakeSpeech(page);
  await page.goto('/#/glossary');
  const btn = page.getByTestId('term-speak-tr-base-pay');
  await expect(btn).toBeVisible();
  const path = `/voice/en/${voiceKey('en', 'Base pay')}.mp3`;
  const respP = page.waitForResponse((r) => isVoice(path)(r.url()));
  await btn.click();
  expect([200, 206]).toContain((await respP).status());
  await expect(btn).toHaveAttribute('data-voice-source', 'file');
  await page.screenshot({ path: `${SHOT_DIR}/voice-glossary-en.png`, fullPage: true });
});

test('ru: quest day 1 translation listen plays the ru recording', async ({ page }) => {
  await seedLang(page, 'ru');
  await installFakeSpeech(page);
  await page.goto('/');
  const btn = page.getByTestId('quest-say-speak-tr');
  await expect(btn).toBeVisible();
  const meaning = (await page.locator('.quest-say-meaning').innerText()).trim();
  const path = `/voice/ru/${voiceKey('ru', meaning)}.mp3`;
  const respP = page.waitForResponse((r) => isVoice(path)(r.url()));
  await btn.click();
  expect([200, 206]).toContain((await respP).status());
  await expect(btn).toHaveAttribute('data-voice-source', 'file');
  await page.screenshot({ path: `${SHOT_DIR}/voice-quest-ru.png`, fullPage: true });
});

test('vi: blocked recording falls back to device Korean voice', async ({ page }) => {
  await seedLang(page, 'vi');
  await installFakeSpeech(page);
  await blockVoiceFiles(page);
  await openB1(page);
  await page.getByTestId('big-card-speak').click();
  await expect(page.getByTestId('big-card-speak')).toHaveAttribute('data-voice-source', 'synth');
  const calls = await spokenCalls(page);
  expect(calls[calls.length - 1]).toEqual({ text: B1, lang: 'ko-KR' });
});

test('vi: corrupt recording falls back to device vi voice', async ({ page }) => {
  await seedLang(page, 'vi');
  await installFakeSpeech(page);
  await corruptVoiceFiles(page);
  await openB1(page);
  await page.getByTestId('big-card-speak-tr').click();
  await expect(page.getByTestId('big-card-speak-tr')).toHaveAttribute('data-voice-source', 'synth');
  const calls = await spokenCalls(page);
  expect(calls[calls.length - 1].lang).toBe('vi-VN');
});

test('zh: no recording, uses device zh voice without voice requests', async ({ page }) => {
  await seedLang(page, 'zh');
  await installFakeSpeechWithVoices(page, [{ lang: 'zh-CN', localService: true }]);
  const voiceReqs: string[] = [];
  page.on('request', (r) => {
    if (r.url().includes('/voice/zh/')) voiceReqs.push(r.url());
  });
  await page.goto('/');
  const btn = page.getByTestId('quest-say-speak-tr');
  await expect(btn).toBeVisible();
  await btn.click();
  await expect(btn).toHaveAttribute('data-voice-source', 'synth');
  const calls = await spokenCalls(page);
  expect(calls[calls.length - 1].lang).toBe('zh-CN');
  expect(voiceReqs).toEqual([]);
  await page.screenshot({ path: `${SHOT_DIR}/voice-quest-zh.png`, fullPage: true });
});

test('th: translation listen button hidden without a th voice', async ({ page }) => {
  await seedLang(page, 'th');
  await installFakeSpeech(page);
  await page.goto('/');
  await expect(page.getByTestId('quest-say-speak')).toBeVisible();
  await expect(page.getByTestId('quest-say-speak-tr')).toHaveCount(0);
  await page.screenshot({ path: `${SHOT_DIR}/voice-quest-th-hidden.png`, fullPage: true });
});

test('uz: glossary translation buttons hidden, Korean listen stays', async ({ page }) => {
  await seedLang(page, 'uz');
  await installFakeSpeech(page);
  await page.goto('/#/glossary');
  await expect(page.getByTestId('term-speak-base-pay')).toBeVisible();
  await expect(page.locator('[data-testid^="term-speak-tr-"]')).toHaveCount(0);
  await page.screenshot({ path: `${SHOT_DIR}/voice-glossary-uz-hidden.png`, fullPage: true });
});

test('vi: without speechSynthesis the recording still plays', async ({ page }) => {
  await seedLang(page, 'vi');
  await removeSpeech(page);
  await openB1(page);
  const btn = page.getByTestId('big-card-speak');
  await expect(btn).toBeVisible();
  await btn.click();
  await expect(btn).toHaveAttribute('data-voice-source', 'file');
});
