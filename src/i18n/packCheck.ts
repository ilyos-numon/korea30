// 테스트 헬퍼. 런타임 화면에서는 import 하지 않는다.
import { QUESTS } from '../quest/quests';
import { CONTACT_IDS, EARNING_NAMES_KO, FORM_FIELD_IDS, PHRASE_IDS, QUEST_DAYS, TERM_IDS } from './ids';
import type { Lang, LangPack } from './types';

export interface PackString {
  path: string;
  value: string;
  kind: 'text' | 'pron';
}

/** 함수형 키 호출 인자: 2인자 (3,10), glossaryCount (12), 나머지 1인자 (3) */
function callUi(key: string, fn: (...args: number[]) => string): string {
  if (fn.length >= 2) return fn(3, 10);
  if (key === 'glossaryCount') return fn(12);
  return fn(3);
}

function walk(node: unknown, path: string, out: PackString[], pronOf: (path: string) => boolean): void {
  if (typeof node === 'string') {
    out.push({ path, value: node, kind: pronOf(path) ? 'pron' : 'text' });
    return;
  }
  if (typeof node === 'function') {
    const key = path.slice(path.lastIndexOf('.') + 1);
    out.push({ path, value: callUi(key, node as (...args: number[]) => string), kind: 'text' });
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((v, i) => walk(v, `${path}.${i}`, out, pronOf));
    return;
  }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) walk(v, `${path}.${k}`, out, pronOf);
  }
}

const isPronPath = (p: string): boolean =>
  /^content\.quests\.\d+\.sayPron$/.test(p) || /^content\.phrases\.[^.]+\.pron$/.test(p);

/** ui 의 모든 문자열(함수형 키는 (3,10)/(3)/(12) 로 호출한 결과), content 의 모든 문자열을 경로와 함께. sayPron·phrases.*.pron 은 kind 'pron' */
export function collectStrings(pack: LangPack): PackString[] {
  const out: PackString[] = [];
  walk(pack.ui, 'ui', out, isPronPath);
  walk(pack.content, 'content', out, isPronPath);
  return out;
}

const BAD_TOKENS = ['undefined', 'NaN', '[object', 'TODO'] as const;

function missingKeys(rec: object, ids: readonly (string | number)[], path: string): string[] {
  return ids.filter((id) => !(String(id) in rec)).map((id) => `${path}.${id}: missing`);
}

/** 빈 문자열(trim 후 ''), bring 길이 불일치, linkLabel 유무 불일치(3·9·10 일만), 'undefined'/'NaN'/'[object'/'TODO' 포함을 문제 목록으로 */
export function packProblems(pack: LangPack): string[] {
  const problems: string[] = [];
  const c = pack.content;
  problems.push(
    ...missingKeys(c.quests, QUEST_DAYS, 'content.quests'),
    ...missingKeys(c.form, FORM_FIELD_IDS, 'content.form'),
    ...missingKeys(c.phrases, PHRASE_IDS, 'content.phrases'),
    ...missingKeys(c.terms, TERM_IDS, 'content.terms'),
    ...missingKeys(c.contacts, CONTACT_IDS, 'content.contacts'),
    ...missingKeys(c.payroll.earnings, EARNING_NAMES_KO, 'content.payroll.earnings'),
  );
  for (const q of QUESTS) {
    const t = c.quests[q.day as keyof typeof c.quests];
    if (!t) continue;
    if (t.bring.length !== q.bring.length) {
      problems.push(`content.quests.${q.day}.bring: length ${t.bring.length} !== ${q.bring.length}`);
    }
    if (Boolean(q.link) !== (t.linkLabel !== undefined)) {
      problems.push(`content.quests.${q.day}.linkLabel: ${q.link ? 'missing' : 'unexpected'}`);
    }
  }
  for (const s of collectStrings(pack)) {
    if (s.value.trim() === '') problems.push(`${s.path}: empty`);
    for (const bad of BAD_TOKENS) {
      if (s.value.includes(bad)) problems.push(`${s.path}: contains ${bad}`);
    }
  }
  return problems;
}

// §4.8
export const FORBIDDEN: Readonly<Record<Lang, readonly string[]>> = {
  zh: ['违法', '非法', '违规', '违反', '错误'],
  vi: ['vi phạm', 'bất hợp pháp', 'phạm pháp'],
  en: ['illegal', 'unlawful', 'violat', 'wrong'],
  th: ['ผิดกฎหมาย', 'ละเมิด', 'ไม่ถูกต้อง'],
  uz: ['noqonuniy', 'qonunbuzar', 'xato'],
  ru: ['незаконн', 'нарушени', 'наруша', 'неправильн', 'ошиб'],
};

export const TEXT_SCRIPT: Readonly<Record<Lang, RegExp | null>> = {
  zh: /[一-鿿]/,
  vi: null,
  en: /[A-Za-z]/,
  th: /[฀-๿]/,
  uz: /[A-Za-z]/, // 키릴 문자 0개 조건은 언어 테스트에서 별도로 검사
  ru: /[Ѐ-ӿ]/,
};

const HANGUL = /[ᄀ-ᇿ㄰-㆏가-힯]/;
const LATIN = /[A-Za-z]/;
const CYRILLIC = /[Ѐ-ӿ]/;
const HAN = /[一-鿿]/;
const THAI = /[฀-๿]/;

export const PRON_RULE: Readonly<Record<Lang, (s: string) => boolean>> = {
  zh: (s) => HAN.test(s) && !HANGUL.test(s) && !LATIN.test(s),
  vi: (s) => !HANGUL.test(s),
  en: (s) => /^[A-Za-z0-9\s\-'.,?!]+$/.test(s),
  th: (s) => THAI.test(s) && !HANGUL.test(s) && !LATIN.test(s),
  uz: (s) => LATIN.test(s) && !HANGUL.test(s) && !CYRILLIC.test(s),
  ru: (s) => CYRILLIC.test(s) && !HANGUL.test(s) && !LATIN.test(s),
};

export const SEARCH_ANCHOR: Readonly<Record<Lang, string>> = {
  zh: '保险',
  vi: 'bảo hiểm',
  en: 'insurance',
  th: 'ประกัน',
  uz: 'sugʻurta', // ʻ 는 U+02BB
  ru: 'страхов',
};

/** 소문자화한 각 문자열에 FORBIDDEN 부분 문자열이 있으면 path */
export function forbiddenHits(lang: Lang, pack: LangPack): string[] {
  const words = FORBIDDEN[lang];
  return collectStrings(pack)
    .filter((s) => {
      const v = s.value.toLowerCase();
      return words.some((w) => v.includes(w));
    })
    .map((s) => s.path);
}
