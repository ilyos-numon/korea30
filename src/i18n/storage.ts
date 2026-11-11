import type { ProgressStorage } from '../quest/progress';
import { LANG_KEY, isLang, type Lang } from './types';

/** getItem(LANG_KEY) 가 isLang 이면 그 값, 아니면 null. getItem 예외 → null */
export function loadLang(s: ProgressStorage): Lang | null {
  try {
    const raw = s.getItem(LANG_KEY);
    return isLang(raw) ? raw : null;
  } catch {
    return null;
  }
}

/** setItem(LANG_KEY, lang). 예외는 삼킨다 */
export function saveLang(s: ProgressStorage, lang: Lang): void {
  try {
    s.setItem(LANG_KEY, lang);
  } catch {
    // 저장 불가(사생활 모드 등)여도 앱은 계속 동작한다
  }
}

const PREFIXES: readonly (readonly [string, Lang])[] = [
  ['zh', 'zh'],
  ['vi', 'vi'],
  ['en', 'en'],
  ['fil', 'en'],
  ['tl', 'en'],
  ['th', 'th'],
  ['uz', 'uz'],
  ['ru', 'ru'],
  ['kk', 'ru'],
  ['ky', 'ru'],
  ['tg', 'ru'],
];

/** languages 를 앞에서부터 보고 첫 매치. 'zh*'→zh, 'vi*'→vi, 'en*'|'fil*'|'tl*'→en, 'th*'→th, 'uz*'→uz, 'ru*'|'kk*'|'ky*'|'tg*'→ru. 대소문자 무시. 없으면 null */
export function detectLang(languages: readonly string[]): Lang | null {
  for (const raw of languages) {
    const tag = raw.toLowerCase();
    for (const [prefix, lang] of PREFIXES) {
      if (tag.startsWith(prefix)) return lang;
    }
  }
  return null;
}
