import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { seedLang } from './helpers/lang';
test.beforeEach(async ({ page }) => { await seedLang(page); });

const SHOT_DIR = process.env.ILLY_SHOT_DIR ?? 'tests/e2e/screenshots';

const SAMPLE_A: Record<string, string> = {
  basePay: '2,060,000',
  overtimePay: '310000',
  otherTaxable: '0',
  nonTaxable: '200000',
  nationalPension: '112570',
  healthInsurance: '85200',
  longTermCare: '11190',
  employmentInsurance: '21330',
  incomeTax: '25000',
  localIncomeTax: '2500',
};

async function openManual(page: Page): Promise<void> {
  await page.goto('/#/payslip');
  await expect(page.getByTestId('screen-payslip')).toBeVisible();
  await page.getByTestId('payslip-manual').click();
  await expect(page.getByTestId('manual-form')).toBeVisible();
}

async function fill(page: Page, values: Record<string, string>): Promise<void> {
  for (const [field, value] of Object.entries(values)) {
    await page.getByTestId(`manual-${field}`).fill(value);
  }
}

const MATCH_KINDS = ['nationalPension', 'healthInsurance', 'longTermCare', 'employmentInsurance', 'localIncomeTax'];

test('manual input equal to sample A matches', async ({ page }) => {
  await openManual(page);
  await fill(page, SAMPLE_A);
  await page.getByTestId('manual-check').click();
  for (const kind of MATCH_KINDS) {
    await expect(page.getByTestId(`check-line-${kind}`)).toHaveAttribute('data-status', 'match');
  }
  await expect(page.getByTestId('check-line-incomeTax')).toHaveAttribute('data-status', 'skipped');
  await expect(page.getByTestId('payslip-summary')).toContainText('✓');
  await page.screenshot({ path: `${SHOT_DIR}/payslip-manual-match.png`, fullPage: true });
});

test('manual employment insurance difference asks to check', async ({ page }) => {
  await openManual(page);
  await fill(page, { ...SAMPLE_A, employmentInsurance: '23,700' });
  await page.getByTestId('manual-check').click();
  await expect(page.getByTestId('check-line-employmentInsurance')).toHaveAttribute('data-status', 'mismatch');
  await expect(page.getByTestId('payslip-ask')).toHaveText('고용보험 공제액 확인 부탁드립니다.');
  await page.screenshot({ path: `${SHOT_DIR}/payslip-manual-mismatch.png`, fullPage: true });
});

test('invalid manual input shows errors and no result', async ({ page }) => {
  await openManual(page);
  await fill(page, { ...SAMPLE_A, basePay: '', employmentInsurance: 'abc' });
  await page.getByTestId('manual-check').click();
  await expect(page.getByTestId('manual-error-basePay')).toBeVisible();
  await expect(page.getByTestId('manual-error-employmentInsurance')).toBeVisible();
  await expect(page.getByTestId('check-line-nationalPension')).toHaveCount(0);
  await page.screenshot({ path: `${SHOT_DIR}/payslip-manual-error.png`, fullPage: true });
});

test('manual numbers are not stored', async ({ page }) => {
  await openManual(page);
  await fill(page, SAMPLE_A);
  await page.getByTestId('manual-check').click();
  await expect(page.getByTestId('payslip-summary')).toBeVisible();
  const stored = await page.evaluate(() => JSON.stringify(localStorage) + JSON.stringify(sessionStorage));
  expect(stored).not.toContain('2060000');
  expect(stored).not.toContain('2,060,000');
  await page.reload();
  await page.getByTestId('payslip-manual').click();
  await expect(page.getByTestId('manual-basePay')).toHaveValue('');
});
