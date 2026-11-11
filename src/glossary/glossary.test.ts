import { describe, expect, it } from 'vitest';
import { TERMS, TERM_CATEGORY_LABEL, normalizeVi, searchTerms } from './glossary';

const EXPECTED: ReadonlyArray<[string, string, string]> = [
  ['base-pay', 'pay', '기본급'],
  ['overtime', 'pay', '연장근로수당'],
  ['night', 'pay', '야간근로수당'],
  ['holiday', 'pay', '휴일근로수당'],
  ['weekly-holiday', 'pay', '주휴수당'],
  ['meal', 'pay', '식대'],
  ['bonus', 'pay', '상여금'],
  ['severance', 'pay', '퇴직금'],
  ['min-wage', 'pay', '최저임금'],
  ['ordinary-wage', 'pay', '통상임금'],
  ['total-pay', 'pay', '지급총액'],
  ['deduction', 'pay', '공제'],
  ['net-pay', 'pay', '실수령액'],
  ['payslip', 'pay', '급여명세서'],
  ['contract', 'pay', '근로계약서'],
  ['taxable', 'pay', '과세'],
  ['non-taxable', 'pay', '비과세'],
  ['four-ins', 'insurance', '4대보험'],
  ['pension', 'insurance', '국민연금'],
  ['health', 'insurance', '건강보험'],
  ['ltc', 'insurance', '장기요양보험'],
  ['employment', 'insurance', '고용보험'],
  ['industrial', 'insurance', '산재보험'],
  ['income-tax', 'insurance', '소득세'],
  ['local-tax', 'insurance', '지방소득세'],
  ['year-end', 'insurance', '연말정산'],
  ['arc-reg', 'admin', '외국인등록'],
  ['arc-card', 'admin', '외국인등록증'],
  ['arc-no', 'admin', '외국인등록번호'],
  ['residence', 'admin', '체류지'],
  ['stay-status', 'admin', '체류자격'],
  ['stay-ext', 'admin', '체류기간 연장'],
  ['workplace-change', 'admin', '사업장 변경'],
  ['immigration', 'admin', '출입국·외국인관서'],
  ['hikorea', 'admin', '하이코리아'],
  ['biz-no', 'admin', '사업자등록번호'],
  ['employment-cert', 'admin', '재직증명서'],
  ['receipt', 'admin', '접수증'],
  ['account', 'admin', '통장'],
  ['check-card', 'admin', '체크카드'],
];

const FIXED_VI: Readonly<Record<string, string>> = {
  'base-pay': 'Lương cơ bản',
  meal: 'Tiền ăn',
  severance: 'Trợ cấp thôi việc',
  payslip: 'Bảng lương',
  contract: 'Hợp đồng lao động',
  pension: 'Lương hưu quốc dân',
  health: 'Bảo hiểm y tế',
  ltc: 'Bảo hiểm chăm sóc dài hạn',
  employment: 'Bảo hiểm việc làm',
  industrial: 'Bảo hiểm tai nạn lao động',
  'income-tax': 'Thuế thu nhập',
  'local-tax': 'Thuế thu nhập địa phương',
  'arc-reg': 'Đăng ký người nước ngoài',
  'stay-ext': 'Gia hạn thời gian lưu trú',
};

const FIXED_EXPLAIN_KO: Readonly<Record<string, string>> = {
  'base-pay': '수당을 빼고 정해진 기본 월급.',
  'weekly-holiday': '한 주에 정해진 날을 다 일하면 받는 하루치 유급 휴일 수당. 보통 주 15시간 이상 일할 때 해당돼요.',
  'stay-status': '한국에 머무는 목적에 따라 정해진 자격(비자 종류).',
  'check-card': '통장에 있는 돈만큼 바로 쓰는 카드.',
};

describe('TERMS', () => {
  it('has the 40 contract terms in order', () => {
    expect(TERMS.length).toBeGreaterThanOrEqual(30);
    expect(TERMS).toHaveLength(40);
    expect(TERMS.map((t) => [t.id, t.category, t.ko])).toEqual(EXPECTED);
  });

  it('has unique ids and all three categories', () => {
    expect(new Set(TERMS.map((t) => t.id)).size).toBe(TERMS.length);
    for (const c of ['pay', 'insurance', 'admin'] as const) {
      expect(TERMS.some((t) => t.category === c)).toBe(true);
    }
  });

  it('marks askExpert only on stay-status, stay-ext, workplace-change', () => {
    expect(TERMS.filter((t) => t.askExpert).map((t) => t.id)).toEqual(['stay-status', 'stay-ext', 'workplace-change']);
  });

  it('uses the fixed vi from the contract table', () => {
    for (const [id, vi] of Object.entries(FIXED_VI)) {
      expect(TERMS.find((t) => t.id === id)?.vi).toBe(vi);
    }
  });

  it('uses the contract explainKo', () => {
    for (const [id, ko] of Object.entries(FIXED_EXPLAIN_KO)) {
      expect(TERMS.find((t) => t.id === id)?.explainKo).toBe(ko);
    }
  });

  it('has non-empty texts and no forbidden words', () => {
    for (const t of TERMS) {
      for (const s of [t.ko, t.vi, t.explainKo, t.explainVi]) {
        expect(s.trim().length).toBeGreaterThan(0);
        for (const w of ['틀렸', '잘못', '위반', '불법']) expect(s).not.toContain(w);
      }
    }
  });
});

describe('TERM_CATEGORY_LABEL', () => {
  it('has bilingual labels', () => {
    expect(TERM_CATEGORY_LABEL.pay).toEqual({ ko: '급여', vi: 'Lương' });
    expect(TERM_CATEGORY_LABEL.insurance).toEqual({ ko: '보험·세금', vi: 'Bảo hiểm · Thuế' });
    expect(TERM_CATEGORY_LABEL.admin).toEqual({ ko: '행정', vi: 'Hành chính' });
  });
});

describe('normalizeVi', () => {
  it('strips tones, maps đ and lowercases', () => {
    expect(normalizeVi('Bảo hiểm Y tế')).toBe('bao hiem y te');
    expect(normalizeVi('Đăng ký')).toBe('dang ky');
  });

  it('collapses spaces and trims', () => {
    expect(normalizeVi('  Gia   hạn  ')).toBe('gia han');
  });
});

describe('searchTerms', () => {
  it('returns all terms in order for empty query', () => {
    expect(searchTerms('')).toHaveLength(40);
    expect(searchTerms('   ').map((t) => t.id)).toEqual(TERMS.map((t) => t.id));
  });

  it('finds insurance terms without diacritics', () => {
    const ids = searchTerms('bao hiem').map((t) => t.id);
    expect(ids).toContain('health');
    expect(ids).toContain('employment');
    expect(ids.length).toBeLessThan(40);
  });

  it('finds severance by Korean', () => {
    expect(searchTerms('퇴직').map((t) => t.id)).toContain('severance');
  });

  it('puts stay-ext first for gia han', () => {
    expect(searchTerms('gia han')[0]?.id).toBe('stay-ext');
  });

  it('returns nothing for zzzz', () => {
    expect(searchTerms('zzzz')).toEqual([]);
  });

  it('puts name matches before explanation matches', () => {
    const terms = [
      { id: 'a', category: 'pay', ko: '가', vi: 'khac', explainKo: '설명', explainVi: 'co tien o day', askExpert: false },
      { id: 'b', category: 'pay', ko: '나', vi: 'Tiền ăn', explainKo: '설명', explainVi: 'khac', askExpert: false },
      { id: 'c', category: 'pay', ko: '다', vi: 'khac', explainKo: '설명', explainVi: 'khac', askExpert: false },
    ] as const;
    expect(searchTerms('tien', terms).map((t) => t.id)).toEqual(['b', 'a']);
    expect(searchTerms('설명', terms).map((t) => t.id)).toEqual(['a', 'b', 'c']);
  });
});
