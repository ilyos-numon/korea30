import { expect, test } from '@playwright/test';
import { voiceKey } from '../../src/speech/voiceKey';
import { seedLang } from '../e2e/helpers/lang';
import { waitForSwControl } from './helpers';

const SHOT_DIR = process.env.ILLY_SHOT_DIR ?? 'tests/e2e/screenshots';

test('day 30 and its recording work offline', async ({ page, context }) => {
  test.setTimeout(120_000);
  await seedLang(page, 'vi');
  await page.goto('/');
  await waitForSwControl(page);
  await context.setOffline(true);
  await page.evaluate(() =>
    localStorage.setItem('korea30.progress.v1', JSON.stringify(Array.from({ length: 29 }, (_, i) => i + 1))),
  );
  await page.reload();
  await expect(page.getByTestId('quest-progress')).toHaveText('Ngày 30 / 30');
  const file = `${voiceKey('ko', '한 달 동안 감사했어요. 앞으로도 잘 부탁드려요.')}.mp3`;
  const status = await page.evaluate(async (f) => (await fetch(`/voice/ko/${f}`)).status, file);
  expect(status).toBe(200);
  await page.screenshot({ path: `${SHOT_DIR}/quest30-pwa-offline.png`, fullPage: true });
});
