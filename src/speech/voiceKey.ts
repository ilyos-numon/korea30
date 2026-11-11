// 녹음 파일 키·경로 규칙. node·브라우저·Playwright 어디서나 import 가능해야 한다 (env·DOM·content 금지).

export type RecordedLang = 'ko' | 'vi' | 'en' | 'ru';
export const RECORDED_LANGS: readonly RecordedLang[] = ['ko', 'vi', 'en', 'ru'];

/** NFC + 앞뒤 공백 제거 */
export function normalizeVoiceText(text: string): string {
  return text.normalize('NFC').trim();
}

/** FNV-1a 32bit over UTF-16 code units of `${lang}\n${normalizeVoiceText(text)}` → 소문자 hex 8자 */
export function voiceKey(lang: RecordedLang, text: string): string {
  const s = `${lang}\n${normalizeVoiceText(text)}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

/** `${lang}/${voiceKey(lang, text)}.mp3` (public/voice 기준 상대경로) */
export function voiceFile(lang: RecordedLang, text: string): string {
  return `${lang}/${voiceKey(lang, text)}.mp3`;
}
