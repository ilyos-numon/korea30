import { QUESTS } from '../quest/quests';
import { TERMS } from '../glossary/glossary';
import { phraseViews, questView, termView } from '../i18n/content';
import { LANGS } from '../i18n/types';
import type { RecordedLang } from './voiceKey';
import { normalizeVoiceText, RECORDED_LANGS, voiceFile, voiceKey } from './voiceKey';

export interface VoiceTarget {
  lang: RecordedLang;
  key: string;
  file: string;
  text: string;
}

/** 화면이 읽는 문장 목록. ko 는 6개 언어 합집합, vi/en/ru 는 그 언어의 번역문. */
export function voiceTargets(): VoiceTarget[] {
  const texts: Record<RecordedLang, Set<string>> = { ko: new Set(), vi: new Set(), en: new Set(), ru: new Set() };
  const add = (lang: RecordedLang, raw: string) => {
    const text = normalizeVoiceText(raw);
    if (text) texts[lang].add(text);
  };
  for (const l of LANGS) {
    for (const t of TERMS) add('ko', termView(t, l).ko);
    for (const p of phraseViews(l)) add('ko', p.ko);
    for (const q of QUESTS) add('ko', questView(q, l).sayKo);
  }
  for (const lang of RECORDED_LANGS) {
    if (lang === 'ko') continue;
    for (const t of TERMS) add(lang, termView(t, lang).name);
    for (const p of phraseViews(lang)) add(lang, p.meaning);
    for (const q of QUESTS) add(lang, questView(q, lang).sayMeaning);
  }
  const out: VoiceTarget[] = [];
  for (const lang of RECORDED_LANGS) {
    const sorted = [...texts[lang]].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    for (const text of sorted) out.push({ lang, key: voiceKey(lang, text), file: voiceFile(lang, text), text });
  }
  return out;
}
