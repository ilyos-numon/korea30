import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { Icon } from '../../../components/Icon';
import { Layer } from '../../../components/Layer';
import type { WorkPhoto } from '../../../storage/db';
import { validateExpiresOn, type ExpiryEditError } from '../expiry';
import type { PhotoStrings } from '../i18n';

/** ArrayBuffer → objectURL. effect 안에서 만들고 cleanup 에서 revoke (서버 렌더에서는 null) */
export function useObjectUrl(buf: ArrayBuffer, mime: string): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return undefined;
    const u = URL.createObjectURL(new Blob([buf], { type: mime }));
    setUrl(u);
    return () => {
      URL.revokeObjectURL(u);
      setUrl(null);
    };
  }, [buf, mime]);
  return url;
}

const EXPIRY_ERROR_TEXT: Readonly<Record<ExpiryEditError, (s: PhotoStrings) => string>> = {
  format: (s) => s.expiryErrorFormat,
  notFuture: (s) => s.expiryErrorNotFuture,
};

export interface PhotoViewerProps {
  photo: WorkPhoto;
  today: string;
  t: PhotoStrings;
  ko: PhotoStrings;
  shiftLabel: string | null;
  onSaveExpiry(expiresOn: string): void;
  onDelete(): void;
  onClose(): void;
}

export function PhotoViewer(props: PhotoViewerProps): JSX.Element {
  const { photo, today, t, ko, shiftLabel, onClose } = props;
  const url = useObjectUrl(photo.image, photo.mime);
  const [expiry, setExpiry] = useState(photo.expiresOn);
  const [expiryError, setExpiryError] = useState<ExpiryEditError | null>(null);
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    setExpiry(photo.expiresOn);
    setExpiryError(null);
  }, [photo.id, photo.expiresOn]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const onSaveExpiry = (): void => {
    const err = validateExpiresOn(expiry, today);
    setExpiryError(err);
    if (err) return;
    props.onSaveExpiry(expiry);
  };

  const saved = photo.takenOnSource === 'saved';

  return (
    <Layer>
      <div className="scrim" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label={t.open} data-testid="photo-viewer" className="sheet photo-viewer">
        <div className="sheet-grip" />
        <div className="photo-viewer-head">
          <h3 className="photo-viewer-title num">{photo.date}</h3>
          <button type="button" data-testid="photo-viewer-close" className="icon-btn" aria-label={t.close} onClick={onClose}>
            <Icon name="x" size={20} />
          </button>
        </div>
        {url ? (
          <img
            data-testid="photo-viewer-img"
            className="photo-viewer-img"
            src={url}
            alt={photo.memo || photo.date}
            width={photo.width}
            height={photo.height}
          />
        ) : (
          <div data-testid="photo-viewer-img" className="photo-viewer-img photo-viewer-img-empty" />
        )}
        <div className="photo-meta-list">
          <p data-testid="photo-viewer-taken" data-source={photo.takenOnSource} className="photo-meta">
            <Icon name="camera" size={15} />
            {saved ? t.takenOnSaved(photo.takenOn) : t.takenOn(photo.takenOn)}
          </p>
          {shiftLabel ? (
            <p className="photo-meta">
              <Icon name="clock" size={15} />
              {t.linkedShift(shiftLabel)}
            </p>
          ) : null}
          {photo.memo ? (
            <p className="photo-meta">
              <Icon name="edit" size={15} />
              {photo.memo}
            </p>
          ) : null}
          <p className="photo-meta">
            <Icon name="trash" size={15} />
            {t.expiresOn(photo.expiresOn)}
          </p>
          {photo.expiryCustom ? (
            <p data-testid="photo-expiry-custom" className="photo-meta photo-meta-note">
              <Icon name="info" size={15} />
              {t.expiryCustomNote}
            </p>
          ) : null}
        </div>

        <div className="photo-expiry-edit">
          <label className="field">
            <span className="field-label">{t.expiryEditLabel}</span>
            <input
              type="date"
              data-testid="photo-expiry-input"
              className="input"
              value={expiry}
              onChange={(e) => {
                setExpiry(e.target.value);
                setExpiryError(null);
              }}
            />
          </label>
          <button type="button" data-testid="photo-expiry-save" className="btn btn-soft" onClick={onSaveExpiry}>
            {t.expirySave}
          </button>
        </div>
        {expiryError ? (
          <p role="alert" data-testid="photo-expiry-error" data-code={expiryError} className="field-error">
            {EXPIRY_ERROR_TEXT[expiryError](t)}
            <span lang="ko" className="work-ko">
              {EXPIRY_ERROR_TEXT[expiryError](ko)}
            </span>
          </p>
        ) : null}

        {asking ? (
          <div className="photo-confirm">
            <p className="photo-confirm-q">{t.deleteAsk}</p>
            <div className="grid-2">
              <button type="button" className="btn btn-line" onClick={() => setAsking(false)}>
                {t.deleteCancel}
              </button>
              <button type="button" data-testid="photo-delete-confirm" className="btn btn-danger" onClick={props.onDelete}>
                {t.deleteConfirm}
              </button>
            </div>
          </div>
        ) : (
          <button type="button" data-testid="photo-delete" className="btn btn-ghost btn-block photo-danger" onClick={() => setAsking(true)}>
            <Icon name="trash" size={16} />
            {t.delete}
          </button>
        )}
      </div>
    </Layer>
  );
}
