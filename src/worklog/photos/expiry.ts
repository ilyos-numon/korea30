import { addMonths, differenceInCalendarDays, format, isValid, parseISO } from 'date-fns';
import type { WorkPhoto } from '../../storage/db';

/** 앱 설정 기본값(개인정보 최소 보관). 법정 기간이 아니다. */
export const DEFAULT_RETENTION_MONTHS = 24;
export const MIN_RETENTION_MONTHS = 1;
export const MAX_RETENTION_MONTHS = 120;
export const EXPIRY_NOTICE_DAYS = 30;

export type PhotoExpiryState = 'active' | 'soon' | 'expired';

const ISO_DATE = 'yyyy-MM-dd';

/** addMonths(parseISO(takenOn), months) → 'yyyy-MM-dd'. 2024-02-29 + 24 → 2026-02-28 */
export function computeExpiresOn(takenOn: string, months: number): string {
  return format(addMonths(parseISO(takenOn), months), ISO_DATE);
}

/** 만료 안내의 "1년 더 보관" 개월 수 */
export const KEEP_MORE_MONTHS = 12;

/** computeExpiresOn(today, KEEP_MORE_MONTHS). 2028-02-29 → 2029-02-28 */
export function keepMoreExpiresOn(today: string): string {
  return computeExpiresOn(today, KEEP_MORE_MONTHS);
}

/** differenceInCalendarDays(expiresOn, today). 음수·0 = 만료 */
export function daysUntilExpiry(expiresOn: string, today: string): number {
  return differenceInCalendarDays(parseISO(expiresOn), parseISO(today));
}

/** days <= 0 → expired, days <= EXPIRY_NOTICE_DAYS → soon, 그 외 active */
export function expiryState(expiresOn: string, today: string): PhotoExpiryState {
  const days = daysUntilExpiry(expiresOn, today);
  if (days <= 0) return 'expired';
  if (days <= EXPIRY_NOTICE_DAYS) return 'soon';
  return 'active';
}

export type RetentionError = 'integer' | 'range';

/** 정수 아님 → integer, 1~120 밖 → range, 문제없으면 null */
export function validateRetentionMonths(v: number): RetentionError | null {
  if (!Number.isInteger(v)) return 'integer';
  if (v < MIN_RETENTION_MONTHS || v > MAX_RETENTION_MONTHS) return 'range';
  return null;
}

export type ExpiryEditError = 'format' | 'notFuture';

function isRealIsoDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = parseISO(s);
  return isValid(d) && format(d, ISO_DATE) === s;
}

/** YYYY-MM-DD 이고 실제 날짜인지, today 보다 뒤인지 */
export function validateExpiresOn(expiresOn: string, today: string): ExpiryEditError | null {
  if (!isRealIsoDate(expiresOn)) return 'format';
  if (daysUntilExpiry(expiresOn, today) <= 0) return 'notFuture';
  return null;
}

/** months 로 바꿨을 때 즉시 만료될 사진 수 (expiryCustom=false 만 셈) */
export function countExpiringNow(
  photos: readonly Pick<WorkPhoto, 'takenOn' | 'expiryCustom'>[],
  months: number,
  today: string,
): number {
  let n = 0;
  for (const p of photos) {
    if (p.expiryCustom) continue;
    if (expiryState(computeExpiresOn(p.takenOn, months), today) === 'expired') n += 1;
  }
  return n;
}

export interface NewPhotoArgs {
  id: string;
  date: string;
  shiftId: string | null;
  memo: string;
  /** EXIF 촬영일, 없으면 null */
  takenOn: string | null;
  today: string;
  savedAt: number;
  retentionMonths: number;
  image: ArrayBuffer;
  thumb: ArrayBuffer;
  width: number;
  height: number;
}

/** takenOn ?? today, takenOnSource, expiresOn = computeExpiresOn(...), expiryCustom false, mime 'image/jpeg' */
export function newPhotoRecord(a: NewPhotoArgs): WorkPhoto {
  const takenOn = a.takenOn ?? a.today;
  return {
    id: a.id,
    date: a.date,
    shiftId: a.shiftId,
    memo: a.memo,
    takenOn,
    takenOnSource: a.takenOn ? 'exif' : 'saved',
    savedAt: a.savedAt,
    expiresOn: computeExpiresOn(takenOn, a.retentionMonths),
    expiryCustom: false,
    mime: 'image/jpeg',
    image: a.image,
    thumb: a.thumb,
    width: a.width,
    height: a.height,
  };
}
