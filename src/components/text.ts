import type { CSSProperties } from 'react';

const LEAD = /^[\p{Extended_Pictographic}←-⇿⌀-⏿☀-➿️‍\s]+/u;
const TRAIL = /[\s️‍]*[\p{Extended_Pictographic}☀-➿]+[️]*$/u;

/** 언어 팩 문자열 앞뒤의 이모지·기호(☎ 📅 🔒 💡 🙋 🎉 …)를 떼어 낸다. 새 UI 는 SVG 아이콘을 쓴다. */
export function plain(s: string): string {
  return s.replace(LEAD, '').replace(TRAIL, '').trim();
}

/** CSS 사용자 속성(--i 등)을 style 로 넘긴다 */
export function vars(v: Record<string, string | number>): CSSProperties {
  return v as unknown as CSSProperties;
}
