import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { PayslipScreen } from './PayslipScreen';
import { LangContext, langValue } from '../i18n/LangContext';
import { PACKS } from '../i18n/packs';
import { deductionName, earningName } from '../i18n/content';
import { plain } from '../components/text';

function count(html: string, needle: string): number {
  return html.split(needle).length - 1;
}

function lineTag(html: string, kind: string): string {
  const m = html.match(new RegExp(`<[a-z]+[^>]*data-testid="check-line-${kind}"[^>]*>`));
  return m ? m[0] : '';
}

describe('PayslipScreen', () => {
  it('(a) default sample A shows 6 lines, 5 match, 1 skipped, no ask', () => {
    const html = renderToString(<PayslipScreen />);
    expect(html).toContain('data-testid="screen-payslip"');
    expect(count(html, 'data-testid="check-line-')).toBe(6);
    expect(count(html, 'data-status="match"')).toBe(5);
    expect(count(html, 'data-status="skipped"')).toBe(1);
    expect(lineTag(html, 'incomeTax')).toContain('data-status="skipped"');
    expect(html).not.toContain('data-testid="payslip-ask"');
    expect(html).toContain('✓ 확인한 공제 항목이 계산과 같습니다.');
    expect(html).toMatch(/data-testid="payslip-month"[^>]*>2026년 10월</);
    expect(count(html, 'data-testid="earning-row"')).toBe(3);
    expect(html).toContain('2,370,000');
    expect(html).toMatch(/data-testid="payslip-sample-a"[^>]*aria-pressed="true"|aria-pressed="true"[^>]*data-testid="payslip-sample-a"/);
    expect(html).toContain('Mẫu A');
    expect(html).toContain('Mẫu B');
  });

  it('(b) sample B flags employment insurance with expected 21,330 and ask sentence', () => {
    const html = renderToString(<PayslipScreen initial="sample-b" />);
    expect(lineTag(html, 'employmentInsurance')).toContain('data-status="mismatch"');
    expect(html).toContain('계산 21,330');
    expect(html).toContain('Khác với tính toán');
    expect(html).toMatch(/data-testid="payslip-ask"[^>]*>고용보험 공제액 확인 부탁드립니다\.</);
    expect(html).toContain('⚠ 1개 항목이 계산과 다릅니다. 확인해 보세요.');
    expect(html).toContain('1 khoản khác với tính toán. Hãy kiểm tra lại.');
    expect(html).toContain('data-testid="payslip-copy"');
    expect(html).toMatch(/data-testid="payslip-sample-b"[^>]*aria-pressed="true"|aria-pressed="true"[^>]*data-testid="payslip-sample-b"/);
  });

  it('(c) disclaimer is shown in Korean and Vietnamese', () => {
    const html = renderToString(<PayslipScreen />);
    expect(html).toContain('data-testid="payslip-disclaimer"');
    expect(html).toContain('이 결과는 안내이며 법적 판단이 아닙니다. 2026년 공개 요율 기준.');
    expect(html).toContain('Kết quả này chỉ để tham khảo');
  });

  it('(d) rendered output contains no judgement words', () => {
    for (const initial of ['sample-a', 'sample-b'] as const) {
      const html = renderToString(<PayslipScreen initial={initial} />);
      expect(html).not.toMatch(/틀렸|잘못|위반/);
    }
  });
  it('(e) manual mode renders the input form without results', () => {
    const html = renderToString(<PayslipScreen initial="manual" now={new Date(2026, 9, 23)} />);
    expect(html).toContain('data-testid="screen-payslip"');
    expect(html).toContain('data-testid="manual-form"');
    expect(html).toContain('data-testid="manual-privacy"');
    expect(html).toContain('data-testid="manual-check"');
    expect(count(html, '<input')).toBe(10);
    for (const field of [
      'basePay',
      'overtimePay',
      'otherTaxable',
      'nonTaxable',
      'nationalPension',
      'healthInsurance',
      'longTermCare',
      'employmentInsurance',
      'incomeTax',
      'localIncomeTax',
    ]) {
      expect(html).toContain(`data-testid="manual-${field}"`);
    }
    expect(html).not.toContain('data-testid="check-line-');
    expect(html).not.toContain('data-testid="manual-error-');
    expect(html).toMatch(/data-testid="payslip-manual"[^>]*aria-pressed="true"|aria-pressed="true"[^>]*data-testid="payslip-manual"/);
    expect(html).toContain('Nếu bảng lương không ghi riêng, nhập 0.');
    expect(html).not.toMatch(/틀렸|잘못|위반|불법/);
  });

  it('(f) mode chips include sample A, sample B and manual', () => {
    const html = renderToString(<PayslipScreen />);
    expect(html).toContain('data-testid="payslip-sample-a"');
    expect(html).toContain('data-testid="payslip-sample-b"');
    expect(html).toContain('data-testid="payslip-manual"');
    expect(html).toContain('Tự nhập');
    expect(html).not.toContain('직접 입력');
    expect(html).toMatch(/data-testid="payslip-manual"[^>]*aria-pressed="false"|aria-pressed="false"[^>]*data-testid="payslip-manual"/);
    expect(count(html, 'class="chip"')).toBe(3);
  });

  it('(g) ru provider renders Russian UI with Korean originals and no Vietnamese literals', () => {
    const ru = PACKS.ru.ui;
    const html = renderToString(
      <LangContext.Provider value={langValue('ru')}>
        <PayslipScreen initial="sample-b" />
      </LangContext.Provider>,
    );
    expect(html).toContain(ru.payslipDisclaimer);
    expect(html).toContain(ru.payslipTitle);
    expect(html).toContain(ru.payslipDiff);
    expect(html).toContain(`${ru.payslipAskLabel} · 회사에 물어볼 때`);
    expect(html).toContain(deductionName('employmentInsurance', 'ru'));
    expect(html).toContain(earningName('기본급', 'ru'));
    expect(html).toContain('고용보험');
    expect(html).toContain('급여명세서');
    expect(html).toContain('계산 21,330');
    expect(html).toContain('lang="ru"');
    expect(html).not.toContain('lang="vi"');
    expect(html).not.toContain('Bảng lương');
    expect(html).not.toContain('Khác với tính toán');
    expect(html).not.toContain('Kết quả này chỉ để tham khảo');
  });

  it('(h) ru provider renders the manual form labels in Russian with Korean originals', () => {
    const ru = PACKS.ru.ui;
    const html = renderToString(
      <LangContext.Provider value={langValue('ru')}>
        <PayslipScreen initial="manual" now={new Date(2026, 9, 23)} />
      </LangContext.Provider>,
    );
    expect(html).toContain(plain(ru.payslipManual));
    expect(html).toContain(plain(ru.manualPrivacy));
    expect(html).toContain(`${ru.manualEarnings} <span lang="ko">지급</span>`);
    expect(html).toContain(`${ru.manualDeductions} <span lang="ko">공제</span>`);
    expect(html).toContain(ru.manualCheck);
    expect(html).toContain(ru.manualLtcHint);
    expect(html).toContain(earningName('연장·야간·휴일 수당', 'ru'));
    expect(html).toContain(deductionName('localIncomeTax', 'ru'));
    expect(html).toContain('고용보험');
    expect(count(html, '<input')).toBe(10);
    expect(html).not.toContain('lang="vi"');
    expect(html).not.toContain('Tự nhập');
    expect(html).not.toContain('Nếu bảng lương không ghi riêng');
  });
});
