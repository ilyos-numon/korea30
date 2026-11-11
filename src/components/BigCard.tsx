import { useEffect, type JSX } from 'react';
import { useLang } from '../i18n/LangContext';
import { Icon } from './Icon';
import { Layer } from './Layer';
import { SpeakButton } from './SpeakButton';
import { plain } from './text';

/** 창구 직원에게 그대로 보여 주는 전체 화면 카드. 맨 위 한 줄은 직원이 읽는 한국어 안내다 */
export function BigCard(props: {
  ko: string;
  vi: string;
  viPron?: string;
  onClose: () => void;
}): JSX.Element {
  const { ko, vi, viPron, onClose } = props;
  const { lang, ui } = useLang();
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <Layer>
      <div data-testid="big-card" className="bigcard" role="dialog" aria-modal="true" aria-label={ui.bigCardAria}>
        <div className="bigcard-top">
          <p className="bigcard-show">{`${ui.bigCardShow} · 이 화면을 직원에게 보여주세요`}</p>
          <button type="button" className="icon-btn" aria-label={plain(ui.close)} onClick={onClose}>
            <Icon name="x" size={20} />
          </button>
        </div>
        <div className="bigcard-body">
          <p data-testid="big-card-ko" className="bigcard-ko" lang="ko">{ko}</p>
          <p data-testid="big-card-vi" className="bigcard-vi">{vi}</p>
          {viPron && <p data-testid="big-card-pron" className="bigcard-pron">{viPron}</p>}
        </div>
        <div className="bigcard-actions">
          <SpeakButton text={ko} testId="big-card-speak" big />
          <SpeakButton text={vi} testId="big-card-speak-tr" lang={lang} />
          <button type="button" data-testid="big-card-close" className="btn btn-line btn-lg btn-block" onClick={onClose}>
            {plain(ui.close)}
          </button>
        </div>
      </div>
    </Layer>
  );
}
