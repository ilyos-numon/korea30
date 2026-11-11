import type { Content, ContentTable, TDocumentDefinitions } from 'pdfmake/interfaces';
import { describe, expect, it } from 'vitest';
import { legalEntry } from '../legal';
import type { CheckResult } from '../payroll/types';
import { DRAFT_FOOTER_KO } from '../pdf/download';
import type { WorkProfile, WorkShift } from '../storage/db';
import { calcMonth } from './calc';
import type { PayslipCompare } from './compare';
import { defaultStatementKo, toComplaintDraft } from './complaint';
import { EVIDENCE_SECTION_TITLES, buildEvidenceDoc, evidenceFileName, type EvidenceInput } from './evidencePdf';
import type { EvidencePhoto } from './photos/pdfPhotos';

const PROFILE: WorkProfile = {
  id: 'me',
  hourlyWage: 20000,
  workplace5Plus: 'yes',
  weekStartsOn: 1,
  workerName: '홍길동',
  workerPhone: '010-0000-0000',
  workerAddress: '서울시 어딘가',
  workerBirth: '1995-01-01',
  companyName: '예시공장',
  employerName: '김대표',
  employerAddress: '경기도 어딘가',
  employerPhone: '031-000-0000',
  startDate: '2026-10-01',
  endDate: null,
};

function shift(id: string, date: string, start: string, end: string, breakMinutes: number, isHoliday = false): WorkShift {
  return { id, date, start, end, breakMinutes, isHoliday, memo: '', createdAt: 0 };
}

const SHIFTS = [shift('b', '2026-10-06', '14:00', '00:00', 0), shift('a', '2026-10-05', '09:00', '18:00', 60)];
const MONTH = calcMonth({ shifts: SHIFTS, hourlyWage: 20000, workplace5Plus: 'yes', weekStartsOn: 1, yearMonth: '2026-10' });
const DEDUCTIONS: CheckResult = { yearMonth: '2026-10', taxableBase: 0, lines: [], mismatchCount: 0, askKo: null };
const COMPARE: PayslipCompare = {
  yearMonth: '2026-10',
  expectedGross: MONTH.expectedGross,
  reportedTaxable: MONTH.expectedGross - 50000,
  diff: -50000,
  status: 'lower',
  unpaidEstimate: 50000,
  deductions: DEDUCTIONS,
};

function makeInput(compares: readonly PayslipCompare[]): EvidenceInput {
  const statement = defaultStatementKo(PROFILE, [MONTH], compares);
  return {
    profile: PROFILE,
    shifts: SHIFTS,
    months: [MONTH],
    compares,
    complaint: toComplaintDraft(PROFILE, compares, statement),
    generatedOn: '2026-10-27',
  };
}

function contentOf(doc: TDocumentDefinitions): Content[] {
  return doc.content as Content[];
}

function textOf(c: unknown): string | undefined {
  if (c && typeof c === 'object' && 'text' in c && typeof (c as { text: unknown }).text === 'string') {
    return (c as { text: string }).text;
  }
  return undefined;
}

const TITLES = Object.values(EVIDENCE_SECTION_TITLES) as string[];

function rawSectionTitles(doc: TDocumentDefinitions): string[] {
  return contentOf(doc)
    .map(textOf)
    .filter((t): t is string => t !== undefined && /^\d+\. /.test(t) && TITLES.includes(t.replace(/^\d+\. /, '')));
}

function sectionTitles(doc: TDocumentDefinitions): string[] {
  return rawSectionTitles(doc).map((t) => t.replace(/^\d+\. /, ''));
}

function allTables(v: unknown, out: ContentTable[] = []): ContentTable[] {
  if (Array.isArray(v)) v.forEach((x) => allTables(x, out));
  else if (v && typeof v === 'object') {
    if ('table' in v) out.push(v as ContentTable);
    Object.values(v).forEach((x) => allTables(x, out));
  }
  return out;
}

function flatStrings(v: unknown, out: string[] = []): string[] {
  if (typeof v === 'string') out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => flatStrings(x, out));
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => flatStrings(x, out));
  return out;
}

function tableAfter(doc: TDocumentDefinitions, headerText: string): ContentTable {
  const items = contentOf(doc);
  const t = items.find(
    (c) => typeof c === 'object' && c !== null && 'table' in c && flatStrings((c as ContentTable).table.body[0]).includes(headerText),
  );
  if (!t) throw new Error(`table with header ${headerText} not found`);
  return t as ContentTable;
}

describe('evidenceFileName', () => {
  it('uses compact date', () => {
    expect(evidenceFileName('2026-10-27')).toBe('korea30-evidence-20261027.pdf');
  });
});

describe('buildEvidenceDoc', () => {
  it('has 5 sections in order when a payslip comparison exists', () => {
    const doc = buildEvidenceDoc(makeInput([COMPARE]));
    expect(sectionTitles(doc)).toEqual([
      EVIDENCE_SECTION_TITLES.summary,
      EVIDENCE_SECTION_TITLES.shifts,
      EVIDENCE_SECTION_TITLES.months,
      EVIDENCE_SECTION_TITLES.compare,
      EVIDENCE_SECTION_TITLES.complaint,
    ]);
  });

  it('omits section 4 when there is no comparison', () => {
    const doc = buildEvidenceDoc(makeInput([]));
    const titles = sectionTitles(doc);
    expect(titles).not.toContain(EVIDENCE_SECTION_TITLES.compare);
    expect(titles).toHaveLength(4);
    expect(titles[3]).toBe(EVIDENCE_SECTION_TITLES.complaint);
  });

  it('numbers section titles consecutively from 1 whether or not a comparison exists', () => {
    expect(rawSectionTitles(buildEvidenceDoc(makeInput([])))).toEqual([
      `1. ${EVIDENCE_SECTION_TITLES.summary}`,
      `2. ${EVIDENCE_SECTION_TITLES.shifts}`,
      `3. ${EVIDENCE_SECTION_TITLES.months}`,
      `4. ${EVIDENCE_SECTION_TITLES.complaint}`,
    ]);
    expect(rawSectionTitles(buildEvidenceDoc(makeInput([COMPARE])))).toEqual([
      `1. ${EVIDENCE_SECTION_TITLES.summary}`,
      `2. ${EVIDENCE_SECTION_TITLES.shifts}`,
      `3. ${EVIDENCE_SECTION_TITLES.months}`,
      `4. ${EVIDENCE_SECTION_TITLES.compare}`,
      `5. ${EVIDENCE_SECTION_TITLES.complaint}`,
    ]);
  });

  it('keeps every table row on one page (dontBreakRows)', () => {
    for (const compares of [[], [COMPARE]]) {
      const tables = allTables(buildEvidenceDoc(makeInput(compares)).content);
      expect(tables.length).toBeGreaterThanOrEqual(compares.length > 0 ? 6 : 5);
      for (const t of tables) expect(t.table.dontBreakRows, flatStrings(t.table.body[0]).join('|')).toBe(true);
    }
  });

  it('starts the complaint draft on a new page and marks it as a user-edited draft', () => {
    const doc = buildEvidenceDoc(makeInput([COMPARE]));
    const items = contentOf(doc);
    const idx = items.findIndex((c) => textOf(c)?.endsWith(EVIDENCE_SECTION_TITLES.complaint));
    expect((items[idx] as { pageBreak?: string }).pageBreak).toBe('before');
    const others = items.filter((c, i) => i !== idx && typeof c === 'object' && c !== null && 'pageBreak' in c);
    expect(others).toHaveLength(0);
    const after = flatStrings(items.slice(idx)).join('\n');
    expect(after).toContain('초안');
    expect(after).toContain('직접');
    for (const label of ['진정인', '성명', '생년월일', '주소', '연락처', '피진정인', '사업장명', '대표자', '소재지', '근무 기간', '미지급 추정액', '진정 내용', '작성일', '서명']) {
      expect(after).toContain(label);
    }
  });

  it('shift table is sorted and has date/start/end/break/holiday/worked columns', () => {
    const doc = buildEvidenceDoc(makeInput([]));
    const t = tableAfter(doc, '날짜');
    expect(t.table.body[0].map(textOf)).toEqual(['날짜', '시작', '종료', '휴게(분)', '휴일', '근무(분)']);
    expect(t.table.body[1]).toEqual(['2026-10-05', '09:00', '18:00', '60', '아니요', '480']);
    expect(t.table.body[2]).toEqual(['2026-10-06', '14:00', '00:00', '0', '아니요', '600']);
  });

  it('legal table lists every used legal id with law, article, URL and verify status', () => {
    const doc = buildEvidenceDoc(makeInput([]));
    const t = tableAfter(doc, '검증 상태');
    expect(t.table.body[0].map(textOf)).toEqual(['이름', '값', '법령', '조항', 'URL', '검증 상태']);
    const rows = t.table.body.slice(1);
    expect(rows).toHaveLength(new Set(MONTH.legalIds).size);
    for (const id of MONTH.legalIds) {
      const e = legalEntry(id);
      const row = rows.find((r) => flatStrings(r[0]).includes(e.labelKo));
      expect(row, id).toBeDefined();
      const cells = flatStrings(row);
      expect(cells).toContain(e.source.law);
      expect(cells).toContain(e.source.article);
      expect(cells).toContain(e.source.url);
      expect(cells.some((c) => c.startsWith(e.status === 'verified' ? '공식 대조 완료' : '공식 대조 전'))).toBe(true);
    }
  });

  it('footer has the draft notice and page number', () => {
    const doc = buildEvidenceDoc(makeInput([]));
    expect(typeof doc.footer).toBe('function');
    const footer = (doc.footer as (p: number, n: number) => Content)(2, 5);
    const strings = flatStrings(footer);
    expect(strings).toContain(DRAFT_FOOTER_KO);
    expect(strings).toContain('2 / 5');
  });

  it('shows the unpaid estimate total in summary, compare and complaint', () => {
    const second: PayslipCompare = { ...COMPARE, yearMonth: '2026-11', diff: -25000, unpaidEstimate: 25000, reportedTaxable: COMPARE.expectedGross - 25000 };
    const input = makeInput([COMPARE, second]);
    expect(input.complaint.unpaidEstimate).toBe(75000);
    const all = flatStrings(buildEvidenceDoc(input).content);
    expect(all.filter((s) => s === '75,000원').length).toBeGreaterThanOrEqual(2);
    expect(all).toContain('50,000원');
    expect(all).toContain('25,000원');
  });

  it('statement and whole document contain no judgement words', () => {
    const input = makeInput([COMPARE]);
    expect(input.complaint.statementKo).not.toMatch(/위법|불법/);
    const all = flatStrings(buildEvidenceDoc(input)).join('\n');
    expect(all).not.toMatch(/위법|불법|체불/);
    expect(all).toContain(input.complaint.statementKo);
  });
});

const PHOTO: EvidencePhoto = {
  dataUrl: 'data:image/jpeg;base64,/9j/',
  date: '2026-10-05',
  takenOn: '2026-10-05',
  takenOnSource: 'exif',
  expiresOn: '2028-10-05',
  memo: '출근 카드 사진',
  shiftLabel: '2026-10-05 09:00–18:00',
};

function imageNodes(v: unknown, out: string[] = []): string[] {
  if (Array.isArray(v)) v.forEach((x) => imageNodes(x, out));
  else if (v && typeof v === 'object') {
    if ('image' in v && typeof (v as { image: unknown }).image === 'string') out.push((v as { image: string }).image);
    Object.values(v).forEach((x) => imageNodes(x, out));
  }
  return out;
}

describe('buildEvidenceDoc photo section', () => {
  it('adds the photo section after compare and before complaint with one image node', () => {
    const doc = buildEvidenceDoc({ ...makeInput([COMPARE]), photos: [PHOTO] });
    expect(rawSectionTitles(doc)).toEqual([
      `1. ${EVIDENCE_SECTION_TITLES.summary}`,
      `2. ${EVIDENCE_SECTION_TITLES.shifts}`,
      `3. ${EVIDENCE_SECTION_TITLES.months}`,
      `4. ${EVIDENCE_SECTION_TITLES.compare}`,
      `5. ${EVIDENCE_SECTION_TITLES.photos}`,
      `6. ${EVIDENCE_SECTION_TITLES.complaint}`,
    ]);
    expect(imageNodes(doc.content)).toEqual([PHOTO.dataUrl]);
  });

  it('numbers the photo section 4 when there is no comparison', () => {
    const doc = buildEvidenceDoc({ ...makeInput([]), photos: [PHOTO] });
    expect(rawSectionTitles(doc)[3]).toBe(`4. ${EVIDENCE_SECTION_TITLES.photos}`);
    expect(rawSectionTitles(doc)[4]).toBe(`5. ${EVIDENCE_SECTION_TITLES.complaint}`);
  });

  it('shows work date, taken date, linked shift, memo and app-setting expiry', () => {
    const all = flatStrings(buildEvidenceDoc({ ...makeInput([]), photos: [PHOTO] }).content).join('\n');
    expect(all).toContain('근무 날짜 2026-10-05');
    expect(all).toContain('촬영일 2026-10-05');
    expect(all).toContain('연결 근무 2026-10-05 09:00–18:00');
    expect(all).toContain('메모 출근 카드 사진');
    expect(all).toContain('보관 기한 2028-10-05 (앱 설정)');
  });

  it('labels saved date when no taken date exists and skips empty shift/memo lines', () => {
    const p: EvidencePhoto = { ...PHOTO, takenOnSource: 'saved', takenOn: '2026-10-20', memo: '', shiftLabel: null };
    const all = flatStrings(buildEvidenceDoc({ ...makeInput([]), photos: [p] }).content).join('\n');
    expect(all).toContain('저장일 2026-10-20 (촬영일 정보 없음)');
    expect(all).not.toContain('촬영일 2026-10-20');
    expect(all).not.toContain('연결 근무');
    expect(all).not.toContain('메모 ');
  });

  it('uses one dontBreakRows table per photo with a fitted image', () => {
    const doc = buildEvidenceDoc({ ...makeInput([]), photos: [PHOTO, { ...PHOTO, dataUrl: 'data:image/jpeg;base64,AAAA' }] });
    const photoTables = allTables(doc.content).filter((t) => imageNodes(t).length > 0);
    expect(photoTables).toHaveLength(2);
    for (const t of photoTables) {
      expect(t.table.dontBreakRows).toBe(true);
      expect(t.table.body).toHaveLength(1);
      expect(t.table.body[0]).toHaveLength(2);
      expect((t.table.body[0][0] as { fit?: unknown }).fit).toEqual([220, 220]);
    }
  });

  it('notes omitted photo count at the end of the section', () => {
    const doc = buildEvidenceDoc({ ...makeInput([]), photos: [PHOTO], photosOmitted: 2 });
    const items = contentOf(doc);
    const noteIdx = items.findIndex((c) => textOf(c) === '용량 제한으로 사진 2장은 넣지 않았습니다.');
    const complaintIdx = items.findIndex((c) => textOf(c)?.endsWith(EVIDENCE_SECTION_TITLES.complaint));
    expect(noteIdx).toBeGreaterThan(-1);
    expect(noteIdx).toBe(complaintIdx - 1);
  });

  it('has no omitted note when photosOmitted is 0 or missing', () => {
    const all = flatStrings(buildEvidenceDoc({ ...makeInput([]), photos: [PHOTO], photosOmitted: 0 }).content).join('\n');
    expect(all).not.toContain('용량 제한');
  });

  it('without photos (missing or empty) the document is unchanged', () => {
    for (const compares of [[], [COMPARE]]) {
      const base = buildEvidenceDoc(makeInput(compares));
      const empty = buildEvidenceDoc({ ...makeInput(compares), photos: [], photosOmitted: 3 });
      expect(rawSectionTitles(empty)).toEqual(rawSectionTitles(base));
      expect(JSON.stringify(empty.content)).toBe(JSON.stringify(base.content));
      expect(sectionTitles(base)).not.toContain(EVIDENCE_SECTION_TITLES.photos);
    }
  });

  it('photo section contains no judgement words', () => {
    const all = flatStrings(buildEvidenceDoc({ ...makeInput([COMPARE]), photos: [PHOTO], photosOmitted: 1 })).join('\n');
    expect(all).not.toMatch(/위법|불법|체불/);
  });
});
