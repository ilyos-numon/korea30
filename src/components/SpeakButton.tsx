import { useEffect, useState, type JSX } from 'react';
import { useLang } from '../i18n/LangContext';
import { LANG_SHORT } from '../i18n/types';
import { canListen, isRecorded, playVoice, type VoiceLang, type VoiceSource } from '../speech/voice';
import { Icon } from './Icon';
import { animate } from './motion';
import { plain } from './text';

/** 문장을 녹음 파일로 먼저 틀고, 안 되면 기기 음성으로 읽는다. 둘 다 못 하면 그리지 않는다.
 *  lang 이 'ko' 가 아니면 번역문 듣기 버튼이다 */
export function SpeakButton(props: {
  text: string;
  testId: string;
  big?: boolean;
  compact?: boolean;
  /** 기본 'ko'. 'ko' 가 아니면 번역 듣기 버튼 */
  lang?: VoiceLang;
}): JSX.Element | null {
  const { text, testId, big, compact } = props;
  const lang: VoiceLang = props.lang ?? 'ko';
  const { ui } = useLang();
  const [ok, setOk] = useState(false);
  const [source, setSource] = useState<VoiceSource | undefined>(undefined);
  useEffect(() => {
    setOk(canListen(lang));
    if (isRecorded(lang)) return undefined;
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
    if (!synth || typeof synth.addEventListener !== 'function') return undefined;
    const onChange = (): void => setOk(canListen(lang));
    synth.addEventListener('voiceschanged', onChange);
    return () => synth.removeEventListener('voiceschanged', onChange);
  }, [lang]);
  if (!ok) return null;
  const tr = lang !== 'ko';
  const base = compact ? 'icon-btn speak-btn' : `btn ${big ? 'btn-primary btn-lg btn-block' : 'btn-soft'} speak-btn`;
  const cls = tr ? `${base} speak-btn-tr` : base;
  return (
    <button
      type="button"
      className={cls}
      data-testid={testId}
      data-voice-source={source}
      aria-label={tr ? ui.listenMineAria : ui.listenAria}
      onClick={(e) => {
        void playVoice(text, lang).then(setSource);
        animate(e.currentTarget, [{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 320, easing: 'ease-out' });
      }}
    >
      <Icon name="volume" size={compact ? 18 : 20} />
      {compact ? (lang !== 'ko' ? <span className="speak-btn-tag">{LANG_SHORT[lang]}</span> : null) : <span>{plain(tr ? ui.listenMine : ui.listen)}</span>}
    </button>
  );
}
