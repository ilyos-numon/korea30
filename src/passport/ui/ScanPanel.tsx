import type { ChangeEvent, JSX } from 'react';
import { Hint } from '../../components/Hint';
import { Icon } from '../../components/Icon';
import type { MrzError } from '../mrz';
import type { PassportStrings } from '../i18n';

export type ScanError = MrzError | 'empty' | 'ocr';
export type OcrState = { kind: 'idle' } | { kind: 'reading'; ratio: number } | { kind: 'done' } | { kind: 'failed' };
export type ParseNote = 'parsed' | 'corrected' | null;

const ERROR_TEXT: Readonly<Record<ScanError, (s: PassportStrings) => string>> = {
  empty: (s) => s.errEmpty,
  notTd3: (s) => s.errNotTd3,
  checksum: (s) => s.errChecksum,
  unreadable: (s) => s.errUnreadable,
  ocr: (s) => s.ocrFailed,
};

export interface ScanPanelProps {
  t: PassportStrings;
  ko: PassportStrings;
  mrzText: string;
  ocr: OcrState;
  error: ScanError | null;
  note: ParseNote;
  onMrzText: (text: string) => void;
  onPhoto: (file: File) => void;
  onParse: () => void;
}

function percent(ratio: number): number {
  return Math.round(Math.min(Math.max(ratio, 0), 1) * 100);
}

export function ScanPanel(props: ScanPanelProps): JSX.Element {
  const { t, ko, ocr, error, note } = props;
  const reading = ocr.kind === 'reading';

  const onFile = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    // 같은 사진을 다시 골라도 change 가 오도록 비운다
    e.target.value = '';
    if (file) props.onPhoto(file);
  };

  return (
    <section className="card passport-step passport-scan">
      <h2 className="passport-heading">
        <span className="passport-step-no">1</span>
        {t.scanHeading}
      </h2>
      <label className={`passport-drop${reading ? ' passport-file-busy' : ''}`}>
        <span className="passport-drop-icon" aria-hidden="true">
          <Icon name="camera" size={26} />
        </span>
        <span className="passport-drop-title">{t.choosePhoto}</span>
        <span className="passport-drop-hint">{t.photoHint}</span>
        <span className="passport-mrz-sample" aria-hidden="true">
          <span>P&lt;UTOERIKSSON&lt;&lt;ANNA&lt;MARIA&lt;&lt;&lt;</span>
          <span>L898902C36UTO7408122F12041</span>
        </span>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          data-testid="passport-file"
          className="passport-file-input"
          disabled={reading}
          onChange={onFile}
        />
      </label>
      {ocr.kind === 'reading' || ocr.kind === 'done' ? (
        <div data-testid="passport-progress" data-state={ocr.kind} className="passport-progress" role="status">
          {ocr.kind === 'reading' ? (
            <>
              <progress className="passport-progress-bar" max={100} value={percent(ocr.ratio)} />
              <span>{t.reading(percent(ocr.ratio))}</span>
            </>
          ) : (
            <>
              <Icon name="checkCircle" size={16} />
              <span>{t.readDone}</span>
            </>
          )}
        </div>
      ) : null}

      <div className="passport-or">
        <span>{t.pasteHeading}</span>
      </div>
      <div className="field">
        <Hint text={t.pasteHint}>
          <label htmlFor="passport-mrz" className="field-label">
            MRZ
          </label>
        </Hint>
        <textarea
          id="passport-mrz"
          data-testid="passport-mrz-text"
          className="input passport-mrz"
          rows={2}
          spellCheck={false}
          autoCapitalize="characters"
          autoComplete="off"
          placeholder="P<…"
          value={props.mrzText}
          onChange={(e) => props.onMrzText(e.target.value)}
        />
      </div>
      <button type="button" data-testid="passport-parse" className="btn btn-soft btn-block" disabled={reading} onClick={props.onParse}>
        {t.parse}
      </button>
      {error ? (
        <p data-testid="passport-error" data-error={error} className="field-error" role="alert">
          {ERROR_TEXT[error](t)}
          <span lang="ko" className="passport-ko">
            {ERROR_TEXT[error](ko)}
          </span>
        </p>
      ) : null}
      {note ? (
        <p className="note note-ok passport-status" role="status">
          <Icon name="checkCircle" size={16} />
          {note === 'corrected' ? t.corrected : t.parsed}
        </p>
      ) : null}
    </section>
  );
}
