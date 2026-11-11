import { expect, test } from '@playwright/test';
import { seedLang } from './helpers/lang';
import { appOrigin } from './helpers/origin';
test.beforeEach(async ({ page }) => { await seedLang(page); });

const SHOT_DIR = process.env.ILLY_SHOT_DIR ?? 'tests/e2e/screenshots';

test('sample A all items match', async ({ page }) => {
  await page.goto('/#/payslip');
  await expect(page.getByTestId('screen-payslip')).toBeVisible();
  for (const kind of [
    'nationalPension',
    'healthInsurance',
    'longTermCare',
    'employmentInsurance',
    'localIncomeTax',
  ]) {
    await expect(page.getByTestId(`check-line-${kind}`)).toHaveAttribute('data-status', 'match');
  }
  await expect(page.getByTestId('check-line-incomeTax')).toHaveAttribute('data-status', 'skipped');
  await expect(page.getByTestId('payslip-summary')).toContainText('✓');
  await expect(page.getByTestId('payslip-ask')).toHaveCount(0);
  await page.screenshot({ path: `${SHOT_DIR}/payslip-a-match.png`, fullPage: true });
});

test('sample B flags employment insurance', async ({ page }) => {
  await page.goto('/#/payslip');
  await page.getByTestId('payslip-sample-b').click();
  const line = page.getByTestId('check-line-employmentInsurance');
  await expect(line).toHaveAttribute('data-status', 'mismatch');
  await expect(line).toContainText('21,330');
  await expect(page.getByTestId('payslip-ask')).toHaveText('고용보험 공제액 확인 부탁드립니다.');
  await expect(page.getByTestId('payslip-summary')).toContainText('1개');
  await page.screenshot({ path: `${SHOT_DIR}/payslip-b-mismatch.png`, fullPage: true });
});

test('disclaimer shown and no judgement words', async ({ page }) => {
  await page.goto('/#/payslip');
  await expect(page.getByTestId('payslip-disclaimer')).toBeVisible();
  await page.getByTestId('payslip-sample-b').click();
  await expect(page.getByTestId('payslip-ask')).toBeVisible();
  const text = await page.locator('body').innerText();
  expect(text).not.toMatch(/틀렸|잘못|위반/);
});

test('no external requests during quest and payslip flow', async ({ page }) => {
  const urls: string[] = [];
  page.on('request', (r) => urls.push(r.url()));
  await page.goto('/');
  await page.getByTestId('quest-complete').click();
  await expect(page.getByTestId('quest-progress')).toHaveText('Ngày 2 / 30');
  await page.getByTestId('nav-payslip').click();
  await expect(page.getByTestId('screen-payslip')).toBeVisible();
  await page.getByTestId('payslip-sample-b').click();
  await expect(page.getByTestId('payslip-ask')).toBeVisible();
  await page.getByTestId('payslip-sample-a').click();
  await expect(page.getByTestId('payslip-ask')).toHaveCount(0);
  expect(urls.length).toBeGreaterThan(0);
  for (const u of urls) {
    expect(u.startsWith(appOrigin()), `unexpected request: ${u}`).toBe(true);
  }
});

test('no horizontal scroll on payslip screen', async ({ page }) => {
  await page.goto('/#/payslip');
  await page.getByTestId('payslip-sample-b').click();
  await expect(page.getByTestId('payslip-ask')).toBeVisible();
  const noHScroll = await page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  );
  expect(noHScroll).toBe(true);
});
