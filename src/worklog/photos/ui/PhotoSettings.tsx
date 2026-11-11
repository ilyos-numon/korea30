import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { MAX_RETENTION_MONTHS, MIN_RETENTION_MONTHS, validateRetentionMonths } from '../expiry';
import type { PhotoStrings } from '../i18n';
import { Hint } from '../../../components/Hint';
import { Icon } from '../../../components/Icon';

export interface PhotoSettingsProps {
  months: number;
  t: PhotoStrings;
  ko: PhotoStrings;
  /** 즉시 만료될 수 (확인 단계 표시용) */
  expiringNow(months: number): number;
  onSave(months: number): Promise<number>; // 바뀐 사진 수
}

/** '' → NaN (validateRetentionMonths 가 integer 로 잡는다) */
function parseMonths(raw: string): number {
  const s = raw.trim();
  return s === '' ? Number.NaN : Number(s);
}

export function PhotoSettings(props: PhotoSettingsProps): JSX.Element {
  const { months, t, ko } = props;
  const [raw, setRaw] = useState(String(months));
  const [error, setError] = useState(false);
  const [ask, setAsk] = useState<{ months: number; count: number } | null>(null);
  const [changed, setChanged] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setRaw(String(months));
  }, [months]);

  const apply = (m: number): void => {
    setAsk(null);
    props
      .onSave(m)
      .then((n) => {
        setChanged(n);
        setFailed(false);
      })
      .catch(() => {
        setChanged(null);
        setFailed(true);
      });
  };

  const onSave = (): void => {
    setChanged(null);
    setFailed(false);
    const m = parseMonths(raw);
    if (validateRetentionMonths(m) !== null) {
      setError(true);
      setAsk(null);
      return;
    }
    setError(false);
    const count = m < months ? props.expiringNow(m) : 0;
    if (count > 0) {
      setAsk({ months: m, count });
      return;
    }
    apply(m);
  };

  return (
    <details data-testid="photo-settings" className="work-details photo-settings">
      <summary className="work-summary">
        <span>
          {t.retentionHeading}
          <span className="badge photo-retention-badge">{t.months(months)}</span>
        </span>
        <Icon name="chevronDown" size={18} className="work-summary-chev" />
      </summary>
      <div className="work-details-body">
        <Hint kind="ko" text={ko.retentionHint}>
          <p className="work-hint">{t.retentionHint}</p>
        </Hint>
        <div className="photo-retention-row">
          <label className="field">
            <span className="field-label">{t.retentionLabel}</span>
            <input
              type="number"
              inputMode="numeric"
              data-testid="photo-retention"
              className="input"
              min={MIN_RETENTION_MONTHS}
              max={MAX_RETENTION_MONTHS}
              step={1}
              value={raw}
              onChange={(e) => {
                setRaw(e.target.value);
                setError(false);
                setAsk(null);
                setChanged(null);
              }}
            />
          </label>
          <button type="button" data-testid="photo-retention-save" className="btn btn-primary" onClick={onSave}>
            {t.retentionSave}
          </button>
        </div>
        {error ? (
          <p role="alert" data-testid="photo-retention-error" className="field-error">
            {t.retentionError(MIN_RETENTION_MONTHS, MAX_RETENTION_MONTHS)}
          </p>
        ) : null}
        {ask ? (
          <div data-testid="photo-retention-ask" data-count={ask.count} className="photo-confirm">
            <p className="photo-confirm-q">{t.retentionApplyAsk(ask.count)}</p>
            <div className="grid-2">
              <button type="button" className="btn btn-line" onClick={() => setAsk(null)}>
                {t.retentionApplyCancel}
              </button>
              <button
                type="button"
                data-testid="photo-retention-confirm"
                className="btn btn-danger"
                onClick={() => apply(ask.months)}
              >
                {t.retentionApplyConfirm}
              </button>
            </div>
          </div>
        ) : null}
        {changed !== null ? (
          <p role="status" data-testid="photo-retention-status" data-count={changed} className="note note-ok">
            <Icon name="checkCircle" size={16} />
            {t.retentionSaved(changed)}
          </p>
        ) : null}
        {failed ? (
          <p role="alert" className="field-error">
            {t.errorUnknown}
          </p>
        ) : null}
      </div>
    </details>
  );
}
