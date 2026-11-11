import { useCallback, useEffect, useState, type JSX, type ReactNode } from 'react';
import { LangProvider } from '../i18n/LangContext';
import { detectLang, loadLang, saveLang } from '../i18n/storage';
import { HTML_LANG, type Lang } from '../i18n/types';
import type { ProgressStorage } from '../quest/progress';
import { SHOW_INTRO_EVENT, loadIntroSeen, saveIntroSeen } from '../ui/intro';
import { Intro } from './Intro';
import { LanguagePicker } from './LanguagePicker';

function defaultLanguages(): readonly string[] {
  if (typeof navigator === 'undefined') return [];
  return navigator.languages ?? [navigator.language];
}

/**
 * 언어가 없으면 언어 선택 화면, 처음 고른 직후에는 소개 페이지, 그다음 앱.
 * 소개는 한 번만 자동으로 뜬다(korea30.intro.v1). 언어 시트의 "앱 소개"로 다시 열 수 있다.
 */
export function LangRoot(props: {
  storage?: ProgressStorage;
  languages?: readonly string[];
  children: ReactNode;
}): JSX.Element {
  const { storage = globalThis.localStorage, languages = defaultLanguages(), children } = props;
  const [lang, setLangState] = useState<Lang | null>(() => loadLang(storage));
  const [introOpen, setIntroOpen] = useState(false);

  const pick = useCallback(
    (l: Lang): void => {
      saveLang(storage, l);
      setLangState(l);
    },
    [storage],
  );

  const firstPick = useCallback(
    (l: Lang): void => {
      pick(l);
      if (!loadIntroSeen(storage)) setIntroOpen(true);
    },
    [pick, storage],
  );

  const closeIntro = useCallback((): void => {
    saveIntroSeen(storage);
    setIntroOpen(false);
  }, [storage]);

  useEffect(() => {
    document.documentElement.lang = lang ? HTML_LANG[lang] : 'en';
  }, [lang]);

  useEffect(() => {
    const open = (): void => setIntroOpen(true);
    window.addEventListener(SHOW_INTRO_EVENT, open);
    return () => window.removeEventListener(SHOW_INTRO_EVENT, open);
  }, []);

  if (lang === null) return <LanguagePicker suggested={detectLang(languages)} onPick={firstPick} />;
  return (
    <LangProvider lang={lang} setLang={pick}>
      {introOpen ? <Intro onDone={closeIntro} /> : children}
    </LangProvider>
  );
}
