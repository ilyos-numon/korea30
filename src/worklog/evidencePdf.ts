import type { Content, TDocumentDefinitions, TableCell } from 'pdfmake/interfaces';
import { legalEntry } from '../legal';
import type { LegalId, LegalUnit, LegalValue } from '../legal/types';
import { DRAFT_FOOTER_KO } from '../pdf/download';
import type { WorkProfile, WorkShift } from '../storage/db';
import type { WageCalcResult } from './calc';
import type { ComplaintDraft } from './complaint';
import type { PayslipCompare } from './compare';
import type { EvidencePhoto } from './photos/pdfPhotos';

export interface EvidenceInput {
  profile: WorkProfile;
  shifts: readonly WorkShift[];
  months: readonly WageCalcResult[];
  compares: readonly PayslipCompare[];
  complaint: ComplaintDraft;
  generatedOn: string;
  photos?: readonly EvidencePhoto[];
  photosOmitted?: number;
}

export const EVIDENCE_SECTION_TITLES = {
  summary: '요약',
  shifts: '출퇴근 기록',
  months: '월별 계산',
  compare: '명세서 비교',
  photos: '사진 기록',
  complaint: '진정서(초안)',
} as const;

/** 섹션 제목 텍스트 (번호는 buildEvidenceDoc 이 실제 포함 순서대로 붙인다) */
const SECTION_TITLE_SET = new Set<string>(Object.values(EVIDENCE_SECTION_TITLES));

const COMPLAINT_DRAFT_NOTE_KO =
  '이 진정서는 Korea30이 만든 초안입니다. 내용을 직접 확인하고 고친 뒤, 본인이 서명해 제출해 주세요. 판단이 필요하면 1350(고용노동부 상담센터)에 문의해 보세요.';

const PPM_PER_PERCENT = 10_000;

export function evidenceFileName(generatedOn: string): string {
  return `korea30-evidence-${generatedOn.replace(/-/g, '')}.pdf`;
}

function won(n: number): string {
  return `${n.toLocaleString('ko-KR')}원`;
}

function minutesKo(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}시간` : `${h}시간 ${m}분`;
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':');
  return Number(h) * 60 + Number(m);
}

function shiftWorkedMinutes(s: WorkShift): number {
  let len = toMinutes(s.end) - toMinutes(s.start);
  if (len <= 0) len += 24 * 60;
  return Math.max(0, len - s.breakMinutes);
}

const UNIT_SUFFIX: Record<LegalUnit, string> = {
  won: '원',
  'won/hour': '원/시간',
  ppm: '%',
  days: '일',
  months: '개월',
  hours: '시간',
  minutes: '분',
  time: '',
  workers: '명',
  years: '년',
};

function legalValueKo(e: LegalValue<number | string>): string {
  if (typeof e.value === 'string') return e.value;
  if (e.unit === 'ppm') return `${e.value / PPM_PER_PERCENT}%`;
  return `${e.value.toLocaleString('ko-KR')}${UNIT_SUFFIX[e.unit]}`;
}

function statusKo(e: LegalValue<number | string>): string {
  return e.status === 'verified' ? `공식 대조 완료(${e.source.checkedOn ?? ''})` : '공식 대조 전';
}

function header(cells: string[]): TableCell[] {
  return cells.map((text) => ({ text, bold: true, fillColor: '#eeeeee' }));
}

function sectionTitle(text: string, extra: Partial<{ pageBreak: 'before' }> = {}): Content {
  return { text, style: 'h2', ...extra };
}

/** 실제 포함된 섹션 제목에 1부터 연속 번호를 붙인다 */
function numberSections(content: Content[]): Content[] {
  let n = 0;
  return content.map((c) => {
    if (typeof c === 'object' && c !== null && 'style' in c && c.style === 'h2' && 'text' in c && typeof c.text === 'string' && SECTION_TITLE_SET.has(c.text)) {
      n += 1;
      return { ...c, text: `${n}. ${c.text}` };
    }
    return c;
  });
}

function summarySection(input: EvidenceInput): Content[] {
  const { profile, shifts, months, complaint, generatedOn } = input;
  const expected = months.reduce((s, m) => s + m.expectedGross, 0);
  const rows: TableCell[][] = [
    ['작성일', generatedOn],
    ['근로자', profile.workerName || '-'],
    ['사업장', profile.companyName || '-'],
    ['근무 기간', `${profile.startDate ?? '-'} ~ ${profile.endDate ?? '-'}`],
    ['시급', won(profile.hourlyWage)],
    ['출퇴근 기록 수', `${shifts.length}건`],
    ['계산한 달', months.map((m) => m.yearMonth).join(', ') || '-'],
    ['근무 기록으로 계산한 금액 합계', won(expected)],
    ['미지급 추정액 합계', won(complaint.unpaidEstimate)],
  ];
  return [
    sectionTitle(EVIDENCE_SECTION_TITLES.summary),
    { table: { widths: [150, '*'], body: rows, dontBreakRows: true }, layout: 'lightHorizontalLines' },
    {
      text: '금액은 근무 기록과 입력한 시급으로 계산한 추정치입니다. 주휴수당은 포함하지 않았습니다.',
      style: 'note',
    },
  ];
}

function shiftsSection(shifts: readonly WorkShift[]): Content[] {
  const sorted = [...shifts].sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  const body: TableCell[][] = [
    header(['날짜', '시작', '종료', '휴게(분)', '휴일', '근무(분)']),
    ...sorted.map((s) => [
      s.date,
      s.start,
      s.end,
      String(s.breakMinutes),
      s.isHoliday ? '예' : '아니요',
      String(shiftWorkedMinutes(s)),
    ]),
  ];
  return [
    sectionTitle(EVIDENCE_SECTION_TITLES.shifts),
    { table: { headerRows: 1, dontBreakRows: true, widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto'], body } },
  ];
}

function monthBlock(m: WageCalcResult): Content[] {
  const t = m.totals;
  const minutesBody: TableCell[][] = [
    header(['구분', '시간']),
    ['근무 합계', minutesKo(t.worked)],
    ['기본', minutesKo(t.regular)],
    ['연장', minutesKo(t.overtime)],
    ['야간', minutesKo(t.night)],
    ['휴일(8시간 이내)', minutesKo(t.holidayWithin8)],
    ['휴일(8시간 초과)', minutesKo(t.holidayOver8)],
  ];
  const payBody: TableCell[][] = [
    header(['항목', '금액']),
    ['기본 임금', won(m.basePay)],
    [m.premiumsApplied ? '가산 임금' : '가산 임금(적용 안 함)', won(m.premiumPay)],
    ['계산 합계', won(m.expectedGross)],
  ];
  const ids: LegalId[] = [...new Set(m.legalIds)];
  const legalBody: TableCell[][] = [
    header(['이름', '값', '법령', '조항', 'URL', '검증 상태']),
    ...ids.map((id) => {
      const e = legalEntry(id);
      return [e.labelKo, legalValueKo(e), e.source.law, e.source.article, { text: e.source.url, link: e.source.url }, statusKo(e)];
    }),
  ];
  return [
    { text: m.yearMonth, style: 'h3' },
    { table: { headerRows: 1, dontBreakRows: true, widths: ['*', 'auto'], body: minutesBody } },
    { table: { headerRows: 1, dontBreakRows: true, widths: ['*', 'auto'], body: payBody }, margin: [0, 6, 0, 0] },
    { text: '계산에 쓴 법정 항목', style: 'h4' },
    {
      table: { headerRows: 1, dontBreakRows: true, widths: ['auto', 'auto', '*', 'auto', '*', 'auto'], body: legalBody },
      fontSize: 8,
    },
  ];
}

function monthsSection(months: readonly WageCalcResult[]): Content[] {
  return [sectionTitle(EVIDENCE_SECTION_TITLES.months), ...months.flatMap(monthBlock)];
}

function compareSection(compares: readonly PayslipCompare[]): Content[] {
  const label: Record<PayslipCompare['status'], string> = {
    match: '비슷함',
    lower: '명세서가 적음',
    higher: '명세서가 많음',
  };
  const body: TableCell[][] = [
    header(['월', '계산 금액', '명세서 과세 금액', '계산과의 차액', '상태', '미지급 추정액']),
    ...compares.map((c) => [
      c.yearMonth,
      won(c.expectedGross),
      won(c.reportedTaxable),
      won(c.diff),
      label[c.status],
      won(c.status === 'lower' ? c.unpaidEstimate : 0),
    ]),
  ];
  return [
    sectionTitle(EVIDENCE_SECTION_TITLES.compare),
    { table: { headerRows: 1, dontBreakRows: true, widths: ['auto', '*', '*', '*', 'auto', '*'], body } },
  ];
}

function photosSection(photos: readonly EvidencePhoto[], omitted: number): Content[] {
  const rows: Content[] = photos.map((p) => {
    const lines: string[] = [
      `근무 날짜 ${p.date}`,
      p.takenOnSource === 'exif' ? `촬영일 ${p.takenOn}` : `저장일 ${p.takenOn} (촬영일 정보 없음)`,
    ];
    if (p.shiftLabel) lines.push(`연결 근무 ${p.shiftLabel}`);
    if (p.memo) lines.push(`메모 ${p.memo}`);
    lines.push(`보관 기한 ${p.expiresOn} (앱 설정)`);
    const body: TableCell[][] = [[{ image: p.dataUrl, fit: [220, 220] }, { stack: lines }]];
    return { table: { widths: [230, '*'], body, dontBreakRows: true }, margin: [0, 0, 0, 6] };
  });
  return [
    sectionTitle(EVIDENCE_SECTION_TITLES.photos),
    ...rows,
    ...(omitted > 0 ? [{ text: `용량 제한으로 사진 ${omitted}장은 넣지 않았습니다.`, style: 'note' }] : []),
  ];
}

function complaintSection(c: ComplaintDraft, generatedOn: string): Content[] {
  const blank = (v: string) => v || ' ';
  const body: TableCell[][] = [
    [{ text: '진정인', bold: true, rowSpan: 4 }, '성명', blank(c.workerName)],
    ['', '생년월일', blank(c.workerBirth)],
    ['', '주소', blank(c.workerAddress)],
    ['', '연락처', blank(c.workerPhone)],
    [{ text: '피진정인', bold: true, rowSpan: 4 }, '사업장명', blank(c.companyName)],
    ['', '대표자', blank(c.employerName)],
    ['', '소재지', blank(c.employerAddress)],
    ['', '연락처', blank(c.employerPhone)],
    [{ text: '근무 기간', bold: true, colSpan: 2 }, '', `${c.startDate ?? ' '} ~ ${c.endDate ?? ' '}`],
    [{ text: '미지급 추정액', bold: true, colSpan: 2 }, '', won(c.unpaidEstimate)],
    [{ text: '진정 내용', bold: true, colSpan: 2 }, '', c.statementKo],
    [{ text: '작성일', bold: true, colSpan: 2 }, '', generatedOn],
    [{ text: '서명', bold: true, colSpan: 2 }, '', { text: ' ', margin: [0, 20, 0, 0] }],
  ];
  return [
    sectionTitle(EVIDENCE_SECTION_TITLES.complaint, { pageBreak: 'before' }),
    { text: COMPLAINT_DRAFT_NOTE_KO, style: 'note' },
    { table: { widths: [60, 70, '*'], body, dontBreakRows: true } },
  ];
}

/** 순수 함수. 섹션 순서: 1 요약 2 출퇴근 기록 표 3 월별 계산 4 명세서 비교(있을 때) 5 사진 기록(있을 때) 6 진정서(초안) — pageBreak 'before'. 번호는 포함된 섹션 순서대로 연속. 모든 표 dontBreakRows. footer: DRAFT_FOOTER_KO + 페이지 번호 */
export function buildEvidenceDoc(input: EvidenceInput): TDocumentDefinitions {
  const content: Content[] = numberSections([
    { text: '근무 기록 증거 자료', style: 'h1' },
    ...summarySection(input),
    ...shiftsSection(input.shifts),
    ...monthsSection(input.months),
    ...(input.compares.length > 0 ? compareSection(input.compares) : []),
    ...(input.photos && input.photos.length > 0 ? photosSection(input.photos, input.photosOmitted ?? 0) : []),
    ...complaintSection(input.complaint, input.generatedOn),
  ]);
  return {
    info: { title: '근무 기록 증거 자료' },
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 60],
    content,
    footer: (currentPage: number, pageCount: number): Content => ({
      margin: [40, 10, 40, 0],
      fontSize: 8,
      columns: [
        { text: DRAFT_FOOTER_KO, width: '*' },
        { text: `${currentPage} / ${pageCount}`, width: 'auto', alignment: 'right' },
      ],
    }),
    styles: {
      h1: { fontSize: 18, bold: true, margin: [0, 0, 0, 12] },
      h2: { fontSize: 14, bold: true, margin: [0, 16, 0, 6] },
      h3: { fontSize: 12, bold: true, margin: [0, 10, 0, 4] },
      h4: { fontSize: 10, bold: true, margin: [0, 8, 0, 4] },
      note: { fontSize: 9, color: '#555555', margin: [0, 4, 0, 8] },
    },
    defaultStyle: { fontSize: 10 },
  };
}
