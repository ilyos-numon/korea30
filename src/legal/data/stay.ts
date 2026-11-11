import type { LegalSource, LegalValue } from '../types';

// S9(2026-10-27) 국가법령정보센터 원문과 대조. 출입국관리법·시행령은 2026-10-02 시행본, 외국인고용법은 2025-10-01 시행본 기준.
const CHECKED_ON = '2026-10-27';

function src(law: string, article: string, url: string, checkedOn: string | null = CHECKED_ON): LegalSource {
  return { law, article, url, checkedOn };
}

export const STAY_LAW: readonly LegalValue<number | string>[] = [
  {
    id: 'arcRegistrationDays', value: 90, unit: 'days', labelKo: '외국인등록 기한(입국일부터)',
    source: src('출입국관리법', '제31조①', 'https://www.law.go.kr/법령/출입국관리법/제31조'), status: 'verified',
  },
  {
    id: 'addressChangeReportDays', value: 15, unit: 'days', labelKo: '체류지 변경 신고 기한(전입일부터)',
    source: src('출입국관리법', '제36조①', 'https://www.law.go.kr/법령/출입국관리법/제36조'), status: 'verified',
  },
  {
    id: 'extensionOpensMonthsBefore', value: 4, unit: 'months', labelKo: '체류기간 연장 신청 시작(만료 전)',
    source: src(
      '출입국관리법 제25조(하이코리아 체류기간연장 안내)', '체류기간연장허가 신청기간',
      'https://www.hikorea.go.kr/info/InfoDatail.pt?CAT_SEQ=181&PARENT_ID=140', '2026-10-29',
    ),
    status: 'verified',
    note: '"만료하기 전 4개월부터 만료 당일까지 신청". 법 제25조·시행령 제31조①에는 4개월 기준이 없고 하이코리아 안내 기준임.',
  },
  {
    id: 'jobChangeApplyMonths', value: 1, unit: 'months', labelKo: '사업장 변경 신청 기한(근로계약 종료 후)',
    source: src(
      '외국인근로자의 고용 등에 관한 법률', '제25조③',
      'https://www.law.go.kr/법령/외국인근로자의고용등에관한법률/제25조',
    ),
    status: 'verified',
  },
  {
    id: 'arcLateFineMaxWon', value: 10_000_000, unit: 'won', labelKo: '외국인등록 지연 시 벌금 상한(범칙금 통고 가능)',
    source: src('출입국관리법', '제95조 제7호, 제102조(통고처분)', 'https://www.law.go.kr/법령/출입국관리법/제95조'),
    status: 'verified',
    note: '이전 값 2,000,000(제100조 과태료). 제31조 등록의무 위반은 제100조 과태료 대상이 아니고 제95조 제7호 '
      + '"1천만원 이하의 벌금" 대상이며, 제102조에 따라 범칙금 통고처분으로 처리될 수 있음.',
  },
  {
    id: 'addressLateFineMaxWon', value: 1_000_000, unit: 'won', labelKo: '체류지 변경 신고 지연 시 벌금 상한(범칙금 통고 가능)',
    source: src('출입국관리법', '제98조 제2호, 제102조(통고처분)', 'https://www.law.go.kr/법령/출입국관리법/제98조'),
    status: 'verified',
    note: '금액은 같음. 출처를 제100조(과태료)에서 제98조 제2호 "100만원 이하의 벌금"으로 고침. '
      + '제102조에 따라 범칙금 통고처분으로 처리될 수 있음.',
  },
  {
    id: 'overstayNote', value: '체류기간이 지나면 범칙금·출국 조치 대상이 될 수 있어요. 1345에 확인해 보세요.',
    unit: 'time', labelKo: '체류기간 초과 안내',
    source: src(
      '출입국관리법', '제94조 제17호, 제46조①8호, 제102조', 'https://www.law.go.kr/법령/출입국관리법/제94조',
    ),
    status: 'verified',
  },
];
