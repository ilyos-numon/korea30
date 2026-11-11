import { useEffect, useState, type JSX } from 'react';
import { useFeatureStrings } from '../i18n/feature';
import { useLang } from '../i18n/LangContext';
import { LANG_SHORT, type Lang } from '../i18n/types';
import { UI_PACKS } from '../ui/i18n';
import { requestIntro } from '../ui/intro';
import { Icon } from './Icon';
import { Layer } from './Layer';
import { LanguageOptions } from './LanguagePicker';
import { plain } from './text';

export function LangSwitch(): JSX.Element {
  const { lang, ui, setLang } = useLang();
  const { t } = useFeatureStrings(UI_PACKS);
  const [open, setOpen] = useState(false);
  const pick = (l: Lang): void => {
    setLang(l);
    setOpen(false);
  };
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  return (
    <>
      <button
        type="button"
        data-testid="lang-switch"
        className="app-lang"
        aria-label={ui.langSwitchAria}
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Icon name="globe" size={18} />
        <span>{LANG_SHORT[lang]}</span>
      </button>
      {open && (
        <Layer>
          <div className="scrim" onClick={() => setOpen(false)} />
          <div data-testid="lang-sheet" className="sheet lang-sheet" role="dialog" aria-modal="true" aria-label={ui.langSheetTitle}>
            <div className="sheet-grip" />
            <h2>{plain(ui.langSheetTitle)}</h2>
            <LanguageOptions current={lang} suggested={null} onPick={pick} />
            <div className="lang-sheet-foot">
              <button
                type="button"
                data-testid="lang-sheet-about"
                className="link-btn"
                onClick={() => {
                  setOpen(false);
                  requestIntro();
                }}
              >
                <Icon name="sparkle" size={16} />
                {t.aboutApp}
              </button>
              <button type="button" data-testid="lang-sheet-close" className="btn btn-line" onClick={() => setOpen(false)}>
                {plain(ui.close)}
              </button>
            </div>
          </div>
        </Layer>
      )}
    </>
  );
}
