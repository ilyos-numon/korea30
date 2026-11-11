import { useLang } from './LangContext';
import type { Lang } from './types';

export type FeaturePacks<T> = { readonly ko: T; readonly en: T } & Partial<Readonly<Record<Exclude<Lang, 'en'>, T>>>;

/** packs[lang] ?? packs.en */
export function pickFeature<T>(packs: FeaturePacks<T>, lang: Lang): T {
  return packs[lang] ?? packs.en;
}

/** useLang().lang 으로 pickFeature. ko 는 한국어 병기용 */
export function useFeatureStrings<T>(packs: FeaturePacks<T>): { t: T; ko: T; lang: Lang } {
  const { lang } = useLang();
  return { t: pickFeature(packs, lang), ko: packs.ko, lang };
}
