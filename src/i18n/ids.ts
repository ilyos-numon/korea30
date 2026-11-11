// as const 튜플 + 유니온. 순서는 데이터 파일 순서 그대로.
export const QUEST_DAYS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  21, 22, 23, 24, 25, 26, 27, 28, 29, 30] as const;
export type QuestDayNo = (typeof QUEST_DAYS)[number];
export const QUEST_DAYS_11_20 = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20] as const;
export type QuestDay11to20 = (typeof QUEST_DAYS_11_20)[number];
export const QUEST_DAYS_21_30 = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30] as const;
export type QuestDay21to30 = (typeof QUEST_DAYS_21_30)[number];

export const FORM_FIELD_IDS = [
  'apply-type',
  'surname',
  'given-names',
  'birth',
  'sex',
  'nationality',
  'passport-no',
  'passport-dates',
  'address-kr',
  'phone',
  'address-home',
  'workplace',
  'sign',
] as const;
export type FormFieldId = (typeof FORM_FIELD_IDS)[number];

export const PHRASE_IDS = ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9', 'b10', 'b11', 'b12'] as const;
export type PhraseId = (typeof PHRASE_IDS)[number];

export const TERM_IDS = [
  'base-pay',
  'overtime',
  'night',
  'holiday',
  'weekly-holiday',
  'meal',
  'bonus',
  'severance',
  'min-wage',
  'ordinary-wage',
  'total-pay',
  'deduction',
  'net-pay',
  'payslip',
  'contract',
  'taxable',
  'non-taxable',
  'four-ins',
  'pension',
  'health',
  'ltc',
  'employment',
  'industrial',
  'income-tax',
  'local-tax',
  'year-end',
  'arc-reg',
  'arc-card',
  'arc-no',
  'residence',
  'stay-status',
  'stay-ext',
  'workplace-change',
  'immigration',
  'hikorea',
  'biz-no',
  'employment-cert',
  'receipt',
  'account',
  'check-card',
] as const;
export type TermId = (typeof TERM_IDS)[number];

export const CONTACT_IDS = [
  'police',
  'fire',
  'immigration',
  'labor',
  'migrant',
  'legal',
  'health',
  'pension',
  'disease',
] as const;
export type ContactId = (typeof CONTACT_IDS)[number];

export const EARNING_NAMES_KO = [
  '기본급',
  '연장근로수당',
  '식대',
  '연장·야간·휴일 수당',
  '기타 과세 수당',
  '비과세 수당 (식대 등)',
] as const;
export type EarningNameKo = (typeof EARNING_NAMES_KO)[number];
