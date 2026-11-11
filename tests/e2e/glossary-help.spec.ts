import { expect, test } from '@playwright/test';
import { seedLang } from './helpers/lang';
test.beforeEach(async ({ page }) => { await seedLang(page); });

const SHOT_DIR = process.env.ILLY_SHOT_DIR ?? 'tests/e2e/screenshots';
const JUDGEMENT = /틀렸|잘못|위반|불법/;

test('glossary lists at least thirty terms', async ({ page }) => {
  await page.goto('/#/glossary');
  await expect(page.getByTestId('screen-glossary')).toBeVisible();
  await expect(page.getByTestId('glossary-count')).toHaveText(/^\d+ từ$/);
  expect(await page.locator('article[data-testid^="term-"]').count()).toBeGreaterThanOrEqual(30);
  await page.screenshot({ path: `${SHOT_DIR}/glossary-all.png`, fullPage: true });
});

test('vietnamese search without diacritics finds insurance terms', async ({ page }) => {
  await page.goto('/#/glossary');
  const total = await page.locator('article[data-testid^="term-"]').count();
  await page.getByTestId('glossary-search').fill('bao hiem');
  await expect(page.getByTestId('term-health')).toBeVisible();
  await expect(page.getByTestId('term-employment')).toBeVisible();
  await expect.poll(() => page.locator('article[data-testid^="term-"]').count()).toBeLessThan(total);
  await page.screenshot({ path: `${SHOT_DIR}/glossary-search.png`, fullPage: true });
});

test('korean search finds severance pay', async ({ page }) => {
  await page.goto('/#/glossary');
  await page.getByTestId('glossary-search').fill('퇴직');
  await expect(page.getByTestId('term-severance')).toBeVisible();
});

test('no result shows empty message', async ({ page }) => {
  await page.goto('/#/glossary');
  await page.getByTestId('glossary-search').fill('zzzz');
  await expect(page.getByTestId('glossary-empty')).toBeVisible();
});

test('expert term links to help', async ({ page }) => {
  await page.goto('/#/glossary');
  await page.getByTestId('glossary-search').fill('gia han');
  await page.getByTestId('term-expert-stay-ext').click();
  await expect(page.getByTestId('screen-help')).toBeVisible();
});

test('help shows public numbers with call links', async ({ page }) => {
  await page.goto('/#/help');
  await expect(page.getByTestId('screen-help')).toBeVisible();
  const tels: Record<string, string> = { police: '112', fire: '119', immigration: '1345', labor: '1350' };
  for (const [id, tel] of Object.entries(tels)) {
    await expect(page.getByTestId(`contact-call-${id}`)).toHaveAttribute('href', `tel:${tel}`);
  }
  const emergency = await page.getByTestId('help-emergency').boundingBox();
  const lines = await page.getByTestId('help-lines').boundingBox();
  expect(emergency).not.toBeNull();
  expect(lines).not.toBeNull();
  expect(emergency!.y).toBeLessThan(lines!.y);
  await expect(page.getByTestId('help-expert-note')).toBeVisible();
  await expect(page.getByTestId('contact-recheck-migrant')).toBeVisible();
  await page.screenshot({ path: `${SHOT_DIR}/help.png`, fullPage: true });
});

test('no judgement words on glossary and help', async ({ page }) => {
  for (const name of ['glossary', 'help']) {
    await page.goto(`/#/${name}`);
    await expect(page.getByTestId(`screen-${name}`)).toBeVisible();
    const text = await page.locator('body').innerText();
    expect(text).not.toMatch(JUDGEMENT);
  }
});
