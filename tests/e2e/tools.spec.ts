import { expect, test } from '@playwright/test';
import { seedLang } from './helpers/lang';

const SHOT_DIR = process.env.ILLY_SHOT_DIR ?? 'tests/e2e/screenshots';
test.beforeEach(async ({ page }) => { await seedLang(page); });

test('tools hub shows three cards', async ({ page }) => {
  await page.goto('/#/tools');
  await expect(page.getByTestId('screen-tools')).toBeVisible();
  for (const id of ['tool-work', 'tool-deadline', 'tool-passport']) {
    await expect(page.getByTestId(id)).toBeVisible();
  }
  await expect(page.getByTestId('nav-tools')).toHaveAttribute('aria-current', 'page');
  await page.screenshot({ path: `${SHOT_DIR}/tools-hub.png`, fullPage: true });
});

for (const name of ['work', 'deadline', 'passport']) {
  test(`hub card ${name} opens its screen`, async ({ page }) => {
    await page.goto('/#/tools');
    await page.getByTestId(`tool-${name}`).click();
    await expect(page).toHaveURL(new RegExp(`#/${name}$`));
    await expect(page.getByTestId(`screen-${name}`)).toBeVisible();
    await expect(page.getByTestId('nav-tools')).toHaveAttribute('aria-current', 'page');
  });
}
