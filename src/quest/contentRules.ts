// 퀘스트 11~30일 문구 검사기. 테스트 헬퍼 — 런타임 화면에서는 import 하지 않는다.
import { CONTACTS } from '../help/contacts';
import { FORBIDDEN, PRON_RULE, TEXT_SCRIPT } from '../i18n/packCheck';
import type { Lang, QuestText } from '../i18n/types';
import { ALL_LEGAL } from '../legal';
import type { QuestDay } from './types';

type PackLang = Exclude<Lang, 'vi'>;
type LinkRoute = 'deadline' | 'glossary' | 'help' | 'work' | 'tools';

const PACK_LANGS: readonly PackLang[] = ['zh', 'en', 'th', 'uz', 'ru'];

export const QUEST_FORBIDDEN_KO: readonly string[] = ['위법', '불법', '체불'];
export const QUEST_LINK_LABEL_KO: Readonly<Record<LinkRoute, string>> = {
  deadline: '체류 기한 보기',
  glossary: '어려운 말 찾기',
  help: '도움 전화 보기',
  work: '근무 기록하기',
  tools: '기록 백업하기',
};
export const MAX_SAY_KO_CHARS = 40;

const stripCommas = (s: string): string => s.replace(/,/g, '');

/** ALL_LEGAL 의 value(숫자는 String(value), 문자열 중 /^\d{2}:\d{2}$/ 인 것) + CONTACTS[].number. 쉼표 제거 형태 */
export function allowedNumberTokens(): ReadonlySet<string> {
  const out = new Set<string>();
  for (const e of ALL_LEGAL) {
    if (typeof e.value === 'number') out.add(stripCommas(String(e.value)));
    else if (/^\d{2}:\d{2}$/.test(e.value)) out.add(e.value);
  }
  for (const c of CONTACTS) out.add(stripCommas(c.number));
  return out;
}

/** /\d+(?:[:\-.,]\d+)*\/g 로 뽑아 쉼표를 지운 토큰 목록 (예 '1577-0071', '22:00', '10320') */
export function numberTokens(s: string): string[] {
  return (s.match(/\d+(?:[:\-.,]\d+)*/g) ?? []).map(stripCommas);
}

export interface QuestContentInput {
  days: readonly QuestDay[];
  expectedDays: readonly number[];
  texts: Readonly<Record<Exclude<Lang, 'vi'>, Readonly<Record<number, QuestText>>>>;
  takenSayKo: readonly string[]; // 겹치면 안 되는 기존 한국어 문장
  takenMeaning: Readonly<Record<Lang, readonly string[]>>; // 겹치면 안 되는 기존 뜻(녹음 키 충돌 방지)
}

interface Field {
  field: string;
  value: string;
}

function koFields(d: QuestDay): Field[] {
  return [
    { field: 'title', value: d.title.ko },
    { field: 'where', value: d.where.ko },
    ...d.bring.map((b, i) => ({ field: `bring.${i}`, value: b.ko })),
    { field: 'say', value: d.say.ko },
    ...(d.tip ? [{ field: 'tip', value: d.tip.ko }] : []),
    ...(d.link ? [{ field: 'link.label', value: d.link.label.ko }] : []),
  ];
}

function viFields(d: QuestDay): Field[] {
  return [
    { field: 'title', value: d.title.vi },
    { field: 'where', value: d.where.vi },
    ...d.bring.map((b, i) => ({ field: `bring.${i}`, value: b.vi })),
    { field: 'viPron', value: d.say.viPron },
    { field: 'viMeaning', value: d.say.viMeaning },
    ...(d.tip ? [{ field: 'tip', value: d.tip.vi }] : []),
    ...(d.link ? [{ field: 'link.label', value: d.link.label.vi }] : []),
  ];
}

function textFields(t: QuestText): Field[] {
  return [
    { field: 'title', value: t.title },
    { field: 'where', value: t.where },
    ...t.bring.map((b, i) => ({ field: `bring.${i}`, value: b })),
    { field: 'sayMeaning', value: t.sayMeaning },
    { field: 'sayPron', value: t.sayPron },
    { field: 'tip', value: t.tip },
    ...(t.linkLabel !== undefined ? [{ field: 'linkLabel', value: t.linkLabel }] : []),
  ];
}

const isBlank = (s: string | undefined): boolean => s === undefined || s.trim() === '';

/** 문제 문자열 목록. 정상이면 []. 각 문자열은 `day <n> <lang|ko|vi> <field>: <reason>` 형식 */
export function questDayProblems(input: QuestContentInput): string[] {
  const { days, expectedDays, texts, takenSayKo, takenMeaning } = input;
  const problems: string[] = [];
  const allowed = allowedNumberTokens();
  const p = (day: number, lang: string, field: string, reason: string): void => {
    problems.push(`day ${day} ${lang} ${field}: ${reason}`);
  };
  const checkNumbers = (day: number, lang: string, fields: Field[]): void => {
    for (const f of fields) {
      for (const tok of numberTokens(f.value)) {
        if (!allowed.has(tok)) p(day, lang, f.field, `number ${tok} not allowed`);
      }
    }
  };

  // (a) 일차 순서
  const actual = days.map((d) => d.day);
  const len = Math.max(actual.length, expectedDays.length);
  for (let i = 0; i < len; i += 1) {
    if (actual[i] !== expectedDays[i]) {
      p(expectedDays[i] ?? actual[i] ?? -1, 'ko', 'day', `expected ${expectedDays[i] ?? 'none'} got ${actual[i] ?? 'none'}`);
    }
  }

  const sayKoSeen = new Set(takenSayKo);
  const meaningSeen = Object.fromEntries(
    (['vi', ...PACK_LANGS] as Lang[]).map((l) => [l, new Set(takenMeaning[l] ?? [])]),
  ) as Record<Lang, Set<string>>;
  const checkMeaning = (day: number, lang: Lang, field: string, value: string): void => {
    if (meaningSeen[lang].has(value)) p(day, lang, field, 'duplicate meaning');
    meaningSeen[lang].add(value);
  };

  for (const d of days) {
    const n = d.day;
    // (b) 필수 값
    if (isBlank(d.icon)) p(n, 'ko', 'icon', 'empty');
    if (!d.tip) p(n, 'ko', 'tip', 'missing');
    if (d.bring.length < 1) p(n, 'ko', 'bring', 'empty');
    for (const f of koFields(d)) if (isBlank(f.value)) p(n, 'ko', f.field, 'empty');
    for (const f of viFields(d)) if (isBlank(f.value)) p(n, 'vi', f.field, 'empty');

    // (c) say.ko 유일·길이
    if (sayKoSeen.has(d.say.ko)) p(n, 'ko', 'say', 'duplicate');
    sayKoSeen.add(d.say.ko);
    if ([...d.say.ko].length > MAX_SAY_KO_CHARS) p(n, 'ko', 'say', `longer than ${MAX_SAY_KO_CHARS}`);

    // (d) ko 금지어
    for (const f of koFields(d)) {
      for (const w of QUEST_FORBIDDEN_KO) if (f.value.includes(w)) p(n, 'ko', f.field, `forbidden ${w}`);
    }

    // (e) vi 금지어·발음
    for (const f of viFields(d)) {
      const v = f.value.toLowerCase();
      for (const w of FORBIDDEN.vi) if (v.includes(w)) p(n, 'vi', f.field, `forbidden ${w}`);
    }
    if (!PRON_RULE.vi(d.say.viPron)) p(n, 'vi', 'viPron', 'pron rule');

    // (g) 숫자
    checkNumbers(n, 'ko', koFields(d));
    checkNumbers(n, 'vi', viFields(d));

    // (h) 링크
    if (d.link) {
      const route = d.link.route as string;
      if (!(route in QUEST_LINK_LABEL_KO)) p(n, 'ko', 'link.route', `unknown route ${route}`);
      else if (d.link.label.ko !== QUEST_LINK_LABEL_KO[route as LinkRoute]) p(n, 'ko', 'link.label', 'label mismatch');
    }

    // (i) vi 뜻 유일
    checkMeaning(n, 'vi', 'viMeaning', d.say.viMeaning);
  }

  // (f) 번역 팩
  const byDay = new Map(days.map((d) => [d.day, d]));
  for (const lang of PACK_LANGS) {
    const rec = texts[lang] ?? {};
    for (const n of expectedDays) {
      const t = rec[n];
      if (!t) {
        p(n, lang, 'text', 'missing');
        continue;
      }
      const d = byDay.get(n);
      const fields = textFields(t);
      if (d) {
        if (t.bring.length !== d.bring.length) p(n, lang, 'bring', `length ${t.bring.length} !== ${d.bring.length}`);
        if (Boolean(d.link) !== (t.linkLabel !== undefined)) p(n, lang, 'linkLabel', d.link ? 'missing' : 'unexpected');
      }
      for (const f of fields) if (isBlank(f.value)) p(n, lang, f.field, 'empty');
      if (!PRON_RULE[lang](t.sayPron)) p(n, lang, 'sayPron', 'pron rule');
      for (const f of fields) {
        const v = f.value.toLowerCase();
        for (const w of FORBIDDEN[lang]) if (v.includes(w)) p(n, lang, f.field, `forbidden ${w}`);
      }
      const script = TEXT_SCRIPT[lang];
      if (script && !script.test(t.title)) p(n, lang, 'title', 'script mismatch');
      // (g) 숫자
      checkNumbers(n, lang, fields);
      // (i) 뜻 유일
      checkMeaning(n, lang, 'sayMeaning', t.sayMeaning);
    }
  }

  return problems;
}
