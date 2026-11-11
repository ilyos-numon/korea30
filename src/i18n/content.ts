import { allPhrases, CATEGORY_LABEL, type PhraseCategory } from '../cards/phrases';
import type { FormField } from '../forms/arcForm';
import type { Term, TermCategory } from '../glossary/glossary';
import { CONTACTS } from '../help/contacts';
import type { DeductionKind } from '../payroll/types';
import type { QuestDay } from '../quest/types';
import type { Route } from '../routes';
import { EARNING_NAMES_KO, type ContactId, type EarningNameKo, type FormFieldId, type PhraseId, type QuestDayNo, type TermId } from './ids';
import { LOCAL } from './local';
import { PACKS } from './packs';
import type { Lang } from './types';

// 화면은 이 함수만 쓴다(.vi 필드 직접 접근 금지)

export interface QuestView {
  day: number;
  icon: string;
  titleKo: string;
  title: string;
  whereKo: string;
  where: string;
  bring: { ko: string; text: string }[];
  sayKo: string;
  sayMeaning: string;
  sayPron: string;
  tipKo: string;
  tip: string;
  link?: { route: Exclude<Route, 'quest'>; labelKo: string; label: string };
}

const REMIT_DAY = 8;

/** day 8 의 sayKo = LOCAL[lang].remitKo */
export function questView(q: QuestDay, lang: Lang): QuestView {
  const t = PACKS[lang].content.quests[q.day as QuestDayNo];
  return {
    day: q.day,
    icon: q.icon,
    titleKo: q.title.ko,
    title: t.title,
    whereKo: q.where.ko,
    where: t.where,
    bring: q.bring.map((b, i) => ({ ko: b.ko, text: t.bring[i] })),
    sayKo: q.day === REMIT_DAY ? LOCAL[lang].remitKo : q.say.ko,
    sayMeaning: t.sayMeaning,
    sayPron: t.sayPron,
    tipKo: q.tip?.ko ?? '',
    tip: t.tip,
    ...(q.link ? { link: { route: q.link.route, labelKo: q.link.label.ko, label: t.linkLabel ?? '' } } : {}),
  };
}

export interface PhraseView {
  id: string;
  category: PhraseCategory;
  ko: string;
  meaning: string;
  pron: string;
}

/** allPhrases() 순서·id 그대로(22개). b4.ko = LOCAL[lang].interpreterKo, q8.ko = LOCAL[lang].remitKo */
export function phraseViews(lang: Lang): PhraseView[] {
  const { content } = PACKS[lang];
  const local = LOCAL[lang];
  return allPhrases().map((p) => {
    const quest = /^q(\d+)$/.exec(p.id);
    if (quest) {
      const t = content.quests[Number(quest[1]) as QuestDayNo];
      const ko = Number(quest[1]) === REMIT_DAY ? local.remitKo : p.ko;
      return { id: p.id, category: p.category, ko, meaning: t.sayMeaning, pron: t.sayPron };
    }
    const t = content.phrases[p.id as PhraseId];
    const ko = p.id === 'b4' ? local.interpreterKo : p.ko;
    return { id: p.id, category: p.category, ko, meaning: t.meaning, pron: t.pron };
  });
}

export function phraseCategoryLabel(c: PhraseCategory, lang: Lang): { ko: string; text: string } {
  return { ko: CATEGORY_LABEL[c].ko, text: PACKS[lang].content.phraseCategories[c] };
}

export interface FormFieldView {
  no: number;
  id: string;
  labelKo: string;
  label: string;
  guideKo: string;
  guide: string;
  example: string;
  askOfficer: boolean;
  span: 1 | 2;
}

/** example·guideKo 는 LOCAL[lang] 에 있으면 그것 */
export function formFieldView(f: FormField, lang: Lang): FormFieldView {
  const t = PACKS[lang].content.form[f.id as FormFieldId];
  const local = LOCAL[lang];
  const example = (local.formExample as Readonly<Record<string, string>>)[f.id] ?? f.example;
  const guideKo = (local.formGuideKo as Readonly<Record<string, string>>)[f.id] ?? f.guide.ko;
  return {
    no: f.no,
    id: f.id,
    labelKo: f.labelKo,
    label: t.label,
    guideKo,
    guide: t.guide,
    example,
    askOfficer: f.askOfficer,
    span: f.span,
  };
}

export interface TermView {
  id: string;
  category: TermCategory;
  ko: string;
  name: string;
  explainKo: string;
  explain: string;
  askExpert: boolean;
}

export function termView(t: Term, lang: Lang): TermView {
  const x = PACKS[lang].content.terms[t.id as TermId];
  return {
    id: t.id,
    category: t.category,
    ko: t.ko,
    name: x.name,
    explainKo: t.explainKo,
    explain: x.explain,
    askExpert: t.askExpert,
  };
}

export function termCategoryLabel(c: TermCategory, lang: Lang): string {
  return PACKS[lang].content.termCategories[c];
}

export interface ContactView {
  id: string;
  number: string;
  tel: string;
  nameKo: string;
  name: string;
  whenKo: string;
  when: string;
  emergency: boolean;
  native: boolean;
  verified: boolean;
  sayKo?: string;
}

/** CONTACTS 순서. native = LOCAL[lang].nativeContacts 포함, immigration 의 sayKo = LOCAL[lang].immigrationSayKo, 그 외 c.sayKo */
export function contactViews(lang: Lang): ContactView[] {
  const { content } = PACKS[lang];
  const local = LOCAL[lang];
  return CONTACTS.map((c) => {
    const id = c.id as ContactId;
    const t = content.contacts[id];
    const sayKo = id === 'immigration' ? local.immigrationSayKo : c.sayKo;
    return {
      id: c.id,
      number: c.number,
      tel: c.tel,
      nameKo: c.nameKo,
      name: t.name,
      whenKo: c.whenKo,
      when: t.when,
      emergency: c.emergency,
      native: local.nativeContacts.includes(id),
      verified: c.verified,
      ...(sayKo !== undefined ? { sayKo } : {}),
    };
  });
}

/** EARNING_NAMES_KO 에 있으면 팩 값, 없으면 nameKo */
export function earningName(nameKo: string, lang: Lang): string {
  if ((EARNING_NAMES_KO as readonly string[]).includes(nameKo)) {
    return PACKS[lang].content.payroll.earnings[nameKo as EarningNameKo];
  }
  return nameKo;
}

export function deductionName(kind: DeductionKind, lang: Lang): string {
  return PACKS[lang].content.payroll.deductions[kind];
}
