import type { WorklogStrings } from './types';

/** 숫자로 못 바꾸면 null */
function toNum(v: number | string): number | null {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

const cnt = (v: number | string): string => String(toNum(v) ?? (String(v) || '-'));

const won = (v: number | string): string => {
  const n = toNum(v);
  return n === null ? `${String(v) || '-'}원` : `${n.toLocaleString('ko-KR')}원`;
};

const hoursMinutes = (v: number | string): string => {
  const n = toNum(v);
  if (n === null) return `${String(v) || '-'}분`;
  const h = Math.floor(Math.abs(n) / 60);
  const m = Math.abs(n) % 60;
  return `${n < 0 ? '-' : ''}${h}시간 ${m}분`;
};

export const ko: WorklogStrings = {
  title: '근무 기록',
  intro: '출퇴근 시간을 적으면 이번 달 예상 임금을 계산해요. 입력한 내용은 이 기기에만 저장돼요.',
  month: '월 선택',
  shiftHeading: '근무 추가',
  shiftDate: '날짜',
  shiftStart: '출근 시각',
  shiftEnd: '퇴근 시각',
  shiftBreak: '휴게 시간(분)',
  shiftHoliday: '휴일에 일했어요',
  shiftMemo: '메모',
  shiftOvernightHint: '퇴근 시각이 출근 시각보다 빠르면 다음 날 퇴근으로 봐요.',
  shiftAdd: '기록 추가',
  errBadDate: '날짜를 확인해 보세요.',
  errBadTime: '시각을 확인해 보세요.',
  errZeroLength: '출근과 퇴근 시각이 같아요.',
  errTooLong: '한 번 근무가 16시간을 넘어요. 시각을 확인해 보세요.',
  errBreakTooLong: '휴게 시간이 근무 시간보다 길어요.',
  errBadBreak: '휴게 시간은 0 이상의 정수(분)로 입력하세요.',
  errFuture: '오늘 이후 날짜는 기록할 수 없어요.',
  listHeading: '이번 달 기록',
  empty: '이번 달 기록이 아직 없어요. 위에서 출퇴근 시간을 추가해 보세요.',
  breakMinutes: (v) => `휴게 ${toNum(v) ?? (String(v) || '-')}분`,
  holidayTag: '휴일',
  delete: '삭제',
  profileHeading: '시급과 사업장',
  wage: '시급(원)',
  wageHint: '계약서나 명세서에 적힌 시급을 넣어 주세요.',
  size: (v) => `사업장 인원 ${cnt(v)}명 이상`,
  sizeYes: (v) => `${cnt(v)}명 이상`,
  sizeNo: (v) => `${cnt(v)}명 미만`,
  sizeUnknown: '잘 모르겠어요',
  weekStart: '한 주의 시작',
  weekStartMon: '월요일',
  weekStartSun: '일요일',
  detailsHeading: '본인·사업장 정보 (진정서 초안용)',
  detailsHint: '비워 둬도 계산은 돼요. 진정서 초안에만 쓰여요.',
  workerName: '이름',
  workerBirth: '생년월일',
  workerPhone: '연락처',
  workerAddress: '주소',
  companyName: '사업장 이름',
  employerName: '대표자',
  employerAddress: '사업장 주소',
  employerPhone: '사업장 연락처',
  startDate: '입사일',
  endDate: '퇴사일',
  profileSave: '저장',
  profileSaved: '저장했어요.',
  errWage: '시급은 숫자만 입력하세요.',
  totalsHeading: '이번 달 계산',
  totalWorked: '전체 근무',
  totalRegular: '소정 근로',
  totalOvertime: '연장 근로',
  totalNight: '야간 근로',
  totalHoliday: '휴일 근로',
  basePay: '기본 임금',
  premiumPay: '가산 수당',
  expectedGross: '예상 임금(세전)',
  hoursMinutes,
  won,
  wageMissing: '시급을 저장하면 금액을 계산해요.',
  minWageWarning: (v) => `입력한 시급이 올해 최저시급(${won(v)})보다 낮아요. 확인해 보세요.`,
  noteSmallWorkplaceNoPremium: (v) => `${cnt(v)}명 미만 사업장은 연장·야간·휴일 가산 수당을 계산에 넣지 않았어요.`,
  noteWorkplaceSizeUnknown: (v) => `사업장 인원을 몰라서 가산 수당을 넣어 계산했어요. ${cnt(v)}명 미만이면 달라질 수 있어요.`,
  noteBelowMinWage: '시급이 최저시급보다 낮아요. 확인해 보세요.',
  noteWeeklyHolidayPayNotIncluded: '주휴수당은 이 계산에 들어 있지 않아요.',
  compareHeading: '명세서와 비교',
  compareHint: '이번 달 급여명세서 금액을 넣으면 계산과의 차액을 보여 드려요.',
  compareEarnings: '지급',
  compareDeductions: '공제',
  compareRun: '비교하기',
  errRequired: '숫자를 입력하세요 (없으면 0)',
  errNotNumber: '숫자만 입력하세요',
  errTooLarge: '1억 원 이하로 입력하세요',
  compareExpected: '근무 기록 계산',
  compareReported: '명세서 과세 지급액',
  compareDiff: '계산과의 차액',
  statusMatch: '계산과 거의 같아요.',
  statusLower: '명세서가 계산보다 적어요. 확인해 보세요.',
  statusHigher: '명세서가 계산보다 많아요.',
  unpaidEstimate: '미지급 추정액',
  deductionMismatch: (v) => `공제 항목 ${toNum(v) ?? (String(v) || '-')}개가 계산과 달라요. 확인해 보세요.`,
  ask1350: '판단이 필요하면 1350(고용노동부 상담센터)에 확인해 보세요.',
  statementHeading: '진정 내용 (초안)',
  statementHint: '한국어로 PDF에 들어가요. 직접 고쳐도 돼요.',
  statementReset: '추천 문장으로 되돌리기',
  pdf: '증거 PDF 만들기',
  pdfHint: '출퇴근 기록, 월별 계산, 명세서 비교, 진정서 초안을 한 파일로 만들어요. 기기 안에서만 만들어요.',
  pdfBusy: 'PDF를 만드는 중이에요…',
  pdfErrorEmpty: '근무 기록이 없어서 PDF를 만들 수 없어요.',
  pdfErrorLibrary: 'PDF를 만들지 못했어요. 잠시 뒤 다시 시도해 보세요.',
  wipe: '근무 기록 전체 지우기',
  wipeAsk: '이 기기에 저장한 근무 기록과 시급·사업장 정보를 모두 지울까요?',
  wipeConfirm: '모두 지우기',
  wipeCancel: '취소',
  wiped: '근무 기록을 모두 지웠어요.',
};
