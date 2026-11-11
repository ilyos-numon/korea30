import { createContext, useContext, useMemo, type JSX, type ReactNode } from 'react';
import { PACKS } from './packs';
import type { ContentPack, Lang, UiStrings } from './types';

export interface LangValue {
  lang: Lang;
  ui: UiStrings;
  pack: ContentPack;
  setLang: (l: Lang) => void;
}

const noop = (): void => {};

/** setLang 기본 no-op */
export function langValue(lang: Lang, setLang: (l: Lang) => void = noop): LangValue {
  return { lang, ui: PACKS[lang].ui, pack: PACKS[lang].content, setLang };
}

// 기본값 vi → provider 없이 렌더하는 기존 테스트는 그대로 vi
export const LangContext = createContext<LangValue>(langValue('vi'));

export function LangProvider(props: { lang: Lang; setLang: (l: Lang) => void; children: ReactNode }): JSX.Element {
  const { lang, setLang, children } = props;
  const value = useMemo(() => langValue(lang, setLang), [lang, setLang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangValue {
  return useContext(LangContext);
}
