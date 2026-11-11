import { parse } from 'mrz';

export interface PassportData {
  documentNumber: string; surname: string; givenNames: string;   // '<' → 공백, 대문자
  nationality: string; issuingState: string;                       // ICAO 3자리
  birthDate: string; expiryDate: string;                            // YYYY-MM-DD, 생년 YY > 오늘 YY 이면 19YY
  sex: 'M' | 'F' | 'X';
}
export type MrzError = 'notTd3' | 'checksum' | 'unreadable';
export type MrzParse =
  | { ok: true; data: PassportData; corrected: boolean }
  | { ok: false; error: MrzError; partial: Partial<PassportData> };

const TD3_LEN = 44;
const MIN_LEN = 40;
const MAX_LEN = 48;
// OCR 이 '<' 를 잘못 읽는 대표 문자들
const FILLER_LOOKALIKES = /[«‹〈＜<]/g;

function cleanLine(line: string): string {
  return line
    .toUpperCase()
    .replace(FILLER_LOOKALIKES, '<')
    .replace(/[^A-Z0-9<]/g, '');
}

function fitTd3(line: string): string {
  return line.length >= TD3_LEN ? line.slice(0, TD3_LEN) : line.padEnd(TD3_LEN, '<');
}

/** OCR/붙여넣기 텍스트 → 공백 제거·대문자·« 등 '<' 치환 → 길이 44 근처 줄 2개 추출 */
export function normalizeMrzText(raw: string): string[] {
  const cleaned = raw.split(/\r?\n/).map(cleanLine).filter((l) => l.length > 0);
  // 줄바꿈 없이 붙여넣은 88자 한 줄
  if (cleaned.length === 1 && cleaned[0].length === TD3_LEN * 2) {
    return [cleaned[0].slice(0, TD3_LEN), cleaned[0].slice(TD3_LEN)];
  }
  const candidates = cleaned.filter((l) => l.length >= MIN_LEN && l.length <= MAX_LEN).map(fitTd3);
  if (candidates.length < 2) return candidates;
  // 여권 MRZ 첫 줄은 'P' 로 시작한다. 없으면 맨 아래 두 줄.
  for (let i = candidates.length - 2; i >= 0; i -= 1) {
    if (candidates[i].startsWith('P')) return [candidates[i], candidates[i + 1]];
  }
  return candidates.slice(-2);
}

function looksLikeOtherFormat(raw: string): boolean {
  const lines = raw.split(/\r?\n/).map(cleanLine);
  return lines.filter((l) => (l.length >= 28 && l.length <= 38)).length >= 2;
}

function toIso(yymmdd: string | null | undefined, century: (yy: number) => number): string | undefined {
  if (!yymmdd || !/^\d{6}$/.test(yymmdd)) return undefined;
  const yy = Number(yymmdd.slice(0, 2));
  return `${century(yy)}-${yymmdd.slice(2, 4)}-${yymmdd.slice(4, 6)}`;
}

function stripFiller(s: string): string {
  return s.replace(/</g, ' ').trim().replace(/\s+/g, ' ');
}

/** mrz.parse(lines, { autocorrect: true }) 사용, today 는 세기 판정용 */
export function parsePassportMrz(raw: string, today: string): MrzParse {
  const lines = normalizeMrzText(raw);
  if (lines.length < 2) {
    return { ok: false, error: looksLikeOtherFormat(raw) ? 'notTd3' : 'unreadable', partial: {} };
  }

  let result: ReturnType<typeof parse>;
  try {
    result = parse(lines, { autocorrect: true });
  } catch {
    return { ok: false, error: 'unreadable', partial: {} };
  }
  if (result.format !== 'TD3' || !lines[0].startsWith('P')) {
    return { ok: false, error: 'notTd3', partial: {} };
  }

  const f = result.fields;
  const todayYy = Number(today.slice(2, 4));
  const sexChar = lines[1].charAt(20);
  const partial: Partial<PassportData> = {};
  if (f.documentNumber) partial.documentNumber = f.documentNumber.toUpperCase();
  if (f.lastName) partial.surname = stripFiller(f.lastName.toUpperCase());
  if (f.firstName) partial.givenNames = stripFiller(f.firstName.toUpperCase());
  // 라이브러리가 모르는 코드(견본 UTO 등)는 null 이므로 원문 위치에서 읽는다
  const issuing = stripFiller(lines[0].slice(2, 5));
  const nationality = stripFiller(lines[1].slice(10, 13));
  if (/^[A-Z]{1,3}$/.test(issuing)) partial.issuingState = issuing;
  if (/^[A-Z]{1,3}$/.test(nationality)) partial.nationality = nationality;
  const birth = toIso(f.birthDate, (yy) => (yy > todayYy ? 1900 : 2000) + yy);
  const expiry = toIso(f.expirationDate, (yy) => 2000 + yy);
  if (birth) partial.birthDate = birth;
  if (expiry) partial.expiryDate = expiry;
  partial.sex = sexChar === 'M' || sexChar === 'F' ? sexChar : 'X';

  const checksumFailed = result.details.some((d) => (d.field ?? '').endsWith('CheckDigit') && !d.valid);
  if (checksumFailed) return { ok: false, error: 'checksum', partial };

  const { documentNumber, surname, givenNames, issuingState, birthDate, expiryDate, sex } = partial;
  if (
    documentNumber === undefined || surname === undefined || partial.nationality === undefined ||
    issuingState === undefined || birthDate === undefined || expiryDate === undefined || sex === undefined
  ) {
    return { ok: false, error: 'unreadable', partial };
  }
  const corrected = result.details.some((d) => d.autocorrect.length > 0);
  return {
    ok: true,
    data: {
      documentNumber, surname, givenNames: givenNames ?? '', nationality: partial.nationality,
      issuingState, birthDate, expiryDate, sex,
    },
    corrected,
  };
}
