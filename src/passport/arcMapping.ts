import { isValid, parse } from 'date-fns';
import type { FormFieldId } from '../i18n/ids';
import type { PassportData } from './mrz';

export interface ArcExtraInput { addressKr: string; phone: string; addressHome: string; workplace: string; passportIssueDate: string }
export type ArcFormValues = Readonly<Record<FormFieldId, string>>;
export type ArcInputError = Partial<Record<keyof ArcExtraInput, 'required' | 'badDate' | 'badPhone'>>;

export const ICAO_TO_KO: Readonly<Record<string, string>> = {
  CHN: '중국',
  VNM: '베트남',
  USA: '미국',
  THA: '태국',
  UZB: '우즈베키스탄',
  RUS: '러시아',
  PHL: '필리핀',
  KHM: '캄보디아',
  NPL: '네팔',
  IDN: '인도네시아',
  MNG: '몽골',
  KAZ: '카자흐스탄',
  KGZ: '키르기스스탄',
  MMR: '미얀마',
  LKA: '스리랑카',
  UTO: '유토피아(견본)',
};

function isIsoDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && isValid(parse(s, 'yyyy-MM-dd', new Date(0)));
}

// 숫자·하이픈·공백·괄호·+ 만, 숫자 9~15자리
function isPhone(s: string): boolean {
  if (!/^[0-9+\-\s()]+$/.test(s)) return false;
  const digits = s.replace(/\D/g, '').length;
  return digits >= 9 && digits <= 15;
}

/** addressKr·phone·passportIssueDate 필수 */
export function validateArcExtra(x: ArcExtraInput): ArcInputError {
  const errs: ArcInputError = {};
  if (x.addressKr.trim() === '') errs.addressKr = 'required';
  const phone = x.phone.trim();
  if (phone === '') errs.phone = 'required';
  else if (!isPhone(phone)) errs.phone = 'badPhone';
  const issue = x.passportIssueDate.trim();
  if (issue === '') errs.passportIssueDate = 'required';
  else if (!isIsoDate(issue)) errs.passportIssueDate = 'badDate';
  return errs;
}

function dotted(iso: string): string {
  return iso.trim().replace(/-/g, '.');
}

const SEX_KO: Readonly<Record<PassportData['sex'], string>> = { M: '남(M)', F: '여(F)', X: 'X' };

export function toArcFormValues(p: PassportData, x: ArcExtraInput): ArcFormValues {
  return {
    'apply-type': '외국인 등록',
    surname: p.surname,
    'given-names': p.givenNames,
    birth: dotted(p.birthDate),
    sex: SEX_KO[p.sex],
    nationality: ICAO_TO_KO[p.nationality] ?? p.nationality,
    'passport-no': p.documentNumber,
    'passport-dates': `발급 ${dotted(x.passportIssueDate)} / 만료 ${dotted(p.expiryDate)}`,
    'address-kr': x.addressKr,
    phone: x.phone,
    'address-home': x.addressHome,
    workplace: x.workplace,
    sign: '',
  };
}
