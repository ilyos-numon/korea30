import type { Page } from '@playwright/test';

/** SW 가 설치돼 이 페이지를 제어할 때까지 기다린다. controller 가 없으면 reload (60초) */
export async function waitForSwControl(page: Page): Promise<void> {
  const deadline = Date.now() + 60_000;
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
  while (Date.now() < deadline) {
    if (await page.evaluate(() => navigator.serviceWorker.controller !== null)) return;
    await page.reload();
    await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
  }
  throw new Error('service worker did not take control within 60s');
}
