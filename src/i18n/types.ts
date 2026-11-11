import type { PhraseCategory } from '../cards/phrases';
import type { TermCategory } from '../glossary/glossary';
import type { DeductionKind } from '../payroll/types';
import type { TabRoute } from '../routes';
import type { QuestDayNo, FormFieldId, PhraseId, TermId, ContactId, EarningNameKo } from './ids';

export type Lang = 'zh' | 'vi' | 'en' | 'th' | 'uz' | 'ru';
export const LANGS: readonly Lang[] = ['zh', 'vi', 'en', 'th', 'uz', 'ru']; // 체류 인원 순 + ru
export const LANG_NATIVE: Readonly<Record<Lang, string>> = {
  zh: '中文（简体）',
  vi: 'Tiếng Việt',
  en: 'English',
  th: 'ไทย',
  uz: 'Oʻzbekcha', // ʻ 는 U+02BB
  ru: 'Русский',
};
export const LANG_KO: Readonly<Record<Lang, string>> = {
  zh: '중국어',
  vi: '베트남어',
  en: '영어',
  th: '태국어',
  uz: '우즈베크어',
  ru: '러시아어',
};
export const LANG_SHORT: Readonly<Record<Lang, string>> = { zh: 'ZH', vi: 'VI', en: 'EN', th: 'TH', uz: 'UZ', ru: 'RU' };
export const HTML_LANG: Readonly<Record<Lang, string>> = {
  zh: 'zh-Hans',
  vi: 'vi',
  en: 'en',
  th: 'th',
  uz: 'uz-Latn',
  ru: 'ru',
};
// 언어 선택 화면에 6줄로 모두 표시
export const LANG_PROMPT: Readonly<Record<Lang, string>> = {
  zh: '请选择语言',
  vi: 'Chọn ngôn ngữ',
  en: 'Choose your language',
  th: 'เลือกภาษา',
  uz: 'Tilni tanlang',
  ru: 'Выберите язык',
};
export const LANG_KEY = 'korea30.lang.v1';

/** LANGS 포함 여부 */
export function isLang(x: unknown): x is Lang {
  return typeof x === 'string' && (LANGS as readonly string[]).includes(x);
}

export interface UiStrings {
  appHelp: string;
  navAria: string;
  tabs: Readonly<Record<TabRoute, string>>;
  listen: string;
  listenAria: string;
  listenMine: string;
  listenMineAria: string;
  bigCardAria: string;
  bigCardShow: string;
  close: string;
  save: string;
  langSwitchAria: string;
  langSheetTitle: string;
  questTitle: string;
  questProgress: (day: number, total: number) => string;
  questDotsAria: (done: number, total: number) => string;
  questDplusNote: string;
  questArrivalOpen: string;
  questArrivalEdit: string;
  questArrivalAria: string;
  arrivalError: Readonly<Record<'invalid' | 'future', string>>;
  questLockedHint: (day: number) => string;
  questToday: string;
  questWhere: string;
  questBring: string;
  questSay: string;
  showBig: string;
  questComplete: string;
  questAllDone: (total: number) => string;
  questDay: (day: number) => string;
  questReset: string;
  formTitle: string;
  formSampleBadge: string;
  formSampleNote: string;
  formExample: string;
  askOfficer: string;
  formPrevAria: string;
  formNextAria: string;
  formSubmit: string;
  formSubmittedMsg: string;
  formQuestDone: (day: number) => string;
  formBackQuest: string;
  payslipTitle: string;
  payslipSampleA: string;
  payslipSampleB: string;
  payslipManual: string;
  payslipDiff: string;
  payslipTaxableTotal: string;
  payslipAskLabel: string;
  payslipDisclaimer: string;
  manualPrivacy: string;
  manualEarnings: string;
  manualDeductions: string;
  manualLtcHint: string;
  manualCheck: string;
  manualError: Readonly<Record<'required' | 'notNumber' | 'tooLarge', string>>;
  cardsTitle: string;
  cardsHint: string;
  glossaryTitle: string;
  glossaryPlaceholder: string;
  glossarySearchAria: string;
  glossaryCount: (n: number) => string;
  glossaryEmpty: string;
  glossaryEmptyTry: string;
  askExpert: string;
  helpTitle: string;
  helpExpertNote: string;
  helpEmergency: string;
  helpLines: string;
  helpNativeBadge: string;
  helpRecheck: string;
}

export interface QuestText {
  title: string;
  where: string;
  bring: readonly string[];
  sayMeaning: string;
  sayPron: string;
  tip: string;
  linkLabel?: string;
}

export interface ContentPack {
  quests: Readonly<Record<QuestDayNo, QuestText>>; // bring 길이 = QUESTS[day-1].bring 길이, linkLabel 은 link 있는 날(3·9·10)만
  form: Readonly<Record<FormFieldId, { label: string; guide: string }>>;
  phrases: Readonly<Record<PhraseId, { meaning: string; pron: string }>>; // b1~b12. q1~q10 은 quests 에서 온다
  phraseCategories: Readonly<Record<PhraseCategory, string>>;
  terms: Readonly<Record<TermId, { name: string; explain: string }>>;
  termCategories: Readonly<Record<TermCategory, string>>;
  contacts: Readonly<Record<ContactId, { name: string; when: string }>>;
  payroll: {
    earnings: Readonly<Record<EarningNameKo, string>>;
    deductions: Readonly<Record<DeductionKind, string>>;
  };
}

export interface LangPack {
  ui: UiStrings;
  content: ContentPack;
}
