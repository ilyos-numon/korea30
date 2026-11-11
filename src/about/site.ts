/** 문서 시행일 (YYYY-MM-DD). 문구가 바뀌면 이 값만 바꾼다. */
export const POLICY_DATE = '2026-10-29';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 앞뒤 공백 제거 후 /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 를 만족하면 그 문자열, 아니면 null. string 이 아니면 null. */
export function normalizeContactEmail(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  return EMAIL_RE.test(trimmed) ? trimmed : null;
}

/** 빌드 시 환경변수 VITE_CONTACT_EMAIL. 없거나 잘못되면 null → 화면은 준비 중 문구 */
export const CONTACT_EMAIL: string | null = normalizeContactEmail(import.meta.env.VITE_CONTACT_EMAIL);
