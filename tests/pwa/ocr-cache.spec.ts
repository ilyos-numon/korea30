import { expect, test } from '@playwright/test';
import { seedLang } from '../e2e/helpers/lang';
import { ensureMrzFixture } from '../e2e/helpers/mrzImage';
import { waitForSwControl } from './helpers';

async function scan(page: import('@playwright/test').Page, file: string): Promise<void> {
  await page.getByTestId('passport-file').setInputFiles(file);
  await expect(page.getByTestId('passport-progress')).toHaveAttribute('data-state', 'done', { timeout: 90_000 });
  await expect(page.getByTestId('passport-field-surname')).toHaveValue(/ERIKSSON/, { timeout: 60_000 });
}

const cachedUrls = (page: import('@playwright/test').Page): Promise<string[]> =>
  page.evaluate(async () => {
    if (!(await caches.has('k30-ocr'))) return [];
    const c = await caches.open('k30-ocr');
    return (await c.keys()).map((r) => r.url);
  });

test('OCR data is cached at runtime and the scan works offline', async ({ page, context }) => {
  test.setTimeout(240_000);
  await seedLang(page, 'vi');
  await page.goto('/#/passport');
  await waitForSwControl(page);
  await expect(page.getByTestId('screen-passport')).toBeVisible();
  expect((await cachedUrls(page)).filter((u) => u.includes('eng.traineddata'))).toEqual([]);

  const fixture = await ensureMrzFixture(page);
  await scan(page, fixture);
  await expect
    .poll(async () => (await cachedUrls(page)).some((u) => u.includes('eng.traineddata')), { timeout: 30_000 })
    .toBe(true);

  await context.setOffline(true);
  await page.goto('/#/passport');
  await page.reload();
  await expect(page.getByTestId('screen-passport')).toBeVisible();
  await scan(page, fixture);
});
