import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, JSX } from 'react';
import { useFeatureStrings } from '../../../i18n/feature';
import type { WorkPhoto, WorkShift } from '../../../storage/db';
import { PhotoStorageError, photoRepo, settingsRepo } from '../../../storage/repos';
import {
  DEFAULT_RETENTION_MONTHS,
  countExpiringNow,
  daysUntilExpiry,
  expiryState,
  newPhotoRecord,
} from '../expiry';
import { onPhotosChanged } from '../events';
import { PHOTO_PACKS, type PhotoStrings } from '../i18n';
import { MAX_INPUT_BYTES, processPhoto, type PhotoInputError } from '../image';
import { PhotoSettings } from './PhotoSettings';
import { PhotoViewer, useObjectUrl } from './PhotoViewer';
import { Hint } from '../../../components/Hint';
import { Icon } from '../../../components/Icon';
import { vars } from '../../../components/text';
import '../photos.css';

export interface PhotoPanelProps {
  today: string; // YYYY-MM-DD
  month: string; // YYYY-MM (WorkScreen 의 선택 달)
  shifts: readonly WorkShift[]; // 전체 시프트 (연결 선택지는 month 의 것만)
  /** 바뀌면 IndexedDB 를 다시 읽는다 (전체 지우기·시프트 삭제 뒤) */
  reloadKey: number;
  /** 테스트용: 주면 IndexedDB 를 읽지 않는다 */
  initialPhotos?: readonly WorkPhoto[];
  initialRetentionMonths?: number;
}

export type PhotoErrorCode = PhotoInputError | 'quota' | 'unknown';

const ERROR_TEXT: Readonly<Record<PhotoErrorCode, (s: PhotoStrings) => string>> = {
  notImage: (s) => s.errorNotImage,
  tooLarge: (s) => s.errorTooLarge(MAX_INPUT_BYTES / (1024 * 1024)),
  decode: (s) => s.errorDecode,
  quota: (s) => s.errorQuota,
  unknown: (s) => s.errorUnknown,
};

function newId(): string {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function byDateSaved(a: WorkPhoto, b: WorkPhoto): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1;
  return a.savedAt - b.savedAt;
}

/** navigator.storage.persist 는 존재할 때만, 결과 무시 */
function requestPersist(): void {
  try {
    const storage = typeof navigator !== 'undefined' ? navigator.storage : undefined;
    if (storage && typeof storage.persist === 'function') void storage.persist().catch(() => {});
  } catch {
    // 무시
  }
}

function PhotoThumb(props: { photo: WorkPhoto; alt: string }): JSX.Element {
  const url = useObjectUrl(props.photo.thumb, props.photo.mime);
  return url ? (
    <img data-testid="photo-thumb" className="photo-thumb" src={url} alt={props.alt} loading="lazy" />
  ) : (
    <span data-testid="photo-thumb" role="img" aria-label={props.alt} className="photo-thumb photo-thumb-empty" />
  );
}

export function PhotoPanel(props: PhotoPanelProps): JSX.Element {
  const { today, month, shifts, reloadKey, initialPhotos, initialRetentionMonths } = props;
  const { t, ko } = useFeatureStrings(PHOTO_PACKS);
  const testMode = initialPhotos !== undefined;

  const [photos, setPhotos] = useState<WorkPhoto[]>(() => [...(initialPhotos ?? [])].sort(byDateSaved));
  const [retention, setRetention] = useState(initialRetentionMonths ?? DEFAULT_RETENTION_MONTHS);
  const [date, setDate] = useState(today);
  const [shiftId, setShiftId] = useState('');
  const [memo, setMemo] = useState('');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<PhotoErrorCode | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const persisted = useRef(false);

  useEffect(() => {
    if (testMode) return undefined;
    let alive = true;
    void (async () => {
      try {
        const months = await settingsRepo.getRetentionMonths();
        if (alive) setRetention(months);
        const all = await photoRepo.listAll();
        if (alive) setPhotos(all);
      } catch {
        // 읽기 실패는 빈 목록 그대로 두고 알린다
        if (alive) setError('unknown');
      }
    })();
    return () => {
      alive = false;
    };
  }, [testMode, today, reloadKey]);

  // 만료 사진 안내(ExpiredPhotosPrompt)에서 지우거나 보관을 늘리면 목록을 다시 읽는다
  useEffect(() => {
    if (testMode) return undefined;
    let alive = true;
    const off = onPhotosChanged(() => {
      photoRepo
        .listAll()
        .then((all) => {
          if (alive) setPhotos(all);
        })
        .catch(() => {
          if (alive) setError('unknown');
        });
    });
    return () => {
      alive = false;
      off();
    };
  }, [testMode]);

  const monthShifts = useMemo(
    () =>
      shifts
        .filter((s) => s.date.startsWith(`${month}-`))
        .slice()
        .sort((a, b) => (a.date === b.date ? (a.start < b.start ? -1 : 1) : a.date < b.date ? -1 : 1)),
    [shifts, month],
  );

  const shiftById = useMemo(() => new Map(shifts.map((s) => [s.id, s])), [shifts]);
  const shiftLabelOf = (id: string | null, s: PhotoStrings): string | null => {
    if (!id) return null;
    const sh = shiftById.get(id);
    return sh ? s.shiftOption(sh.date, sh.start, sh.end) : null;
  };

  // 만료(expired)는 표시하지 않는다 (앱 전체 만료 안내에서 지우기·1년 더 보관을 묻는다)
  const monthPhotos = photos.filter((p) => p.date.startsWith(`${month}-`) && expiryState(p.expiresOn, today) !== 'expired');
  const open = openId ? photos.find((p) => p.id === openId) ?? null : null;

  const onShift = (id: string): void => {
    setShiftId(id);
    const sh = shiftById.get(id);
    if (sh) setDate(sh.date);
  };

  const onFile = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const input = e.currentTarget;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    setBusy(true);
    setSaved(false);
    setError(null);
    try {
      const res = await processPhoto(file);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      const rec = newPhotoRecord({
        id: newId(),
        date,
        shiftId: shiftId || null,
        memo: memo.trim(),
        takenOn: res.photo.takenOn,
        today,
        savedAt: Date.now(),
        retentionMonths: retention,
        image: res.photo.image,
        thumb: res.photo.thumb,
        width: res.photo.width,
        height: res.photo.height,
      });
      await photoRepo.put(rec);
      setPhotos((prev) => [...prev, rec].sort(byDateSaved));
      setMemo('');
      setSaved(true);
      if (!persisted.current) {
        persisted.current = true;
        requestPersist();
      }
    } catch (err) {
      setError(err instanceof PhotoStorageError ? err.code : 'unknown');
    } finally {
      setBusy(false);
    }
  };

  const onSaveExpiry = (id: string, expiresOn: string): void => {
    photoRepo
      .updateMeta(id, { expiresOn, expiryCustom: true })
      .then(() => {
        setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, expiresOn, expiryCustom: true } : p)));
      })
      .catch(() => setError('unknown'));
  };

  const onDelete = (id: string): void => {
    photoRepo
      .remove(id)
      .then(() => {
        setPhotos((prev) => prev.filter((p) => p.id !== id));
        setOpenId(null);
      })
      .catch(() => setError('unknown'));
  };

  const onSaveRetention = async (months: number): Promise<number> => {
    await settingsRepo.setRetentionMonths(months);
    const changed = await photoRepo.applyRetention(months);
    setRetention(months);
    setPhotos(await photoRepo.listAll());
    return changed;
  };

  const fileInput = (testId: string, text: string, camera: boolean): JSX.Element => (
    <label className={`btn photo-file-btn${camera ? ' btn-primary' : ' btn-line'}${busy ? ' photo-file-busy' : ''}`}>
      <Icon name={camera ? 'camera' : 'image'} size={18} />
      <span>{text}</span>
      <input
        type="file"
        accept="image/*"
        {...(camera ? { capture: 'environment' as const } : {})}
        data-testid={testId}
        className="photo-file-input"
        disabled={busy}
        onChange={(e) => {
          void onFile(e);
        }}
      />
    </label>
  );

  return (
    <section data-testid="photo-panel" className="card work-card photo-panel">
      <Hint text={t.intro}>
        <h2 className="work-heading">
          <Icon name="camera" size={18} />
          {t.heading}
        </h2>
      </Hint>
      <p data-testid="photo-privacy" className="photo-privacy">
        <Icon name="guardCheck" size={15} />
        <span>{t.privacyNote}</span>
      </p>

      <div className="grid-2">
        <label className="field">
          <span className="field-label">{t.dateLabel}</span>
          <input
            type="date"
            data-testid="photo-date"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value || today)}
          />
        </label>
        <label className="field">
          <span className="field-label">{t.shiftLabel}</span>
          <select data-testid="photo-shift" className="input" value={shiftId} onChange={(e) => onShift(e.target.value)}>
            <option value="">{t.shiftNone}</option>
            {monthShifts.map((s) => (
              <option key={s.id} value={s.id}>
                {t.shiftOption(s.date, s.start, s.end)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="field">
        <span className="field-label">{t.memoLabel}</span>
        <input
          type="text"
          data-testid="photo-memo"
          className="input"
          maxLength={200}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </label>
      <div className="photo-actions">
        {fileInput('photo-camera', t.camera, true)}
        {fileInput('photo-pick', t.pick, false)}
      </div>

      {busy ? (
        <p data-testid="photo-busy" className="photo-busy">
          <Icon name="refresh" size={16} className="spin" />
          {t.saving}
        </p>
      ) : null}
      <p role="status" data-testid="photo-status" className="photo-status">
        {saved ? (
          <>
            <Icon name="checkCircle" size={16} />
            {t.saved}
          </>
        ) : null}
      </p>
      {error ? (
        <p role="alert" data-testid="photo-error" data-code={error} className="field-error">
          {ERROR_TEXT[error](t)}
          <span lang="ko" className="work-ko">
            {ERROR_TEXT[error](ko)}
          </span>
        </p>
      ) : null}

      {monthPhotos.length === 0 ? (
        <p data-testid="photo-empty" className="photo-empty">
          <Icon name="image" size={22} />
          <span>{t.empty}</span>
        </p>
      ) : (
        <ul className="photo-grid">
          {monthPhotos.map((p, i) => {
            const state = expiryState(p.expiresOn, today);
            const days = daysUntilExpiry(p.expiresOn, today);
            const label = shiftLabelOf(p.shiftId, t);
            return (
              <li
                key={p.id}
                data-testid="photo-item"
                data-id={p.id}
                data-date={p.date}
                data-state={state}
                data-expires={p.expiresOn}
                className={`photo-item photo-item-${state}`}
                style={vars({ '--i': i })}
              >
                <button
                  type="button"
                  data-testid="photo-open"
                  className="photo-open"
                  aria-label={`${t.open} ${p.date}`}
                  onClick={() => setOpenId(p.id)}
                >
                  <PhotoThumb photo={p} alt={`${p.date} ${p.memo}`.trim()} />
                  <span className="photo-item-date num">{p.date.slice(5).replace('-', '.')}</span>
                  {state === 'soon' ? (
                    <span data-testid="photo-item-soon" data-days={days} className="badge badge-warn photo-item-soon">
                      {t.expiringSoon(days)}
                    </span>
                  ) : null}
                </button>
                <span className="photo-item-info">
                  <span data-testid="photo-item-taken" data-source={p.takenOnSource} className="photo-item-line">
                    {p.takenOnSource === 'saved' ? t.takenOnSaved(p.takenOn) : t.takenOn(p.takenOn)}
                  </span>
                  <span data-testid="photo-item-expires" className="photo-item-line photo-item-faint">
                    {t.expiresOn(p.expiresOn)}
                  </span>
                  {label ? (
                    <span data-testid="photo-item-shift" className="photo-item-line">
                      {t.linkedShift(label)}
                    </span>
                  ) : null}
                  {p.memo ? (
                    <span data-testid="photo-item-memo" className="photo-item-line photo-item-memo">
                      {p.memo}
                    </span>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <PhotoSettings
        months={retention}
        t={t}
        ko={ko}
        expiringNow={(m) => countExpiringNow(photos, m, today)}
        onSave={onSaveRetention}
      />

      {open ? (
        <PhotoViewer
          key={open.id}
          photo={open}
          today={today}
          t={t}
          ko={ko}
          shiftLabel={shiftLabelOf(open.shiftId, t)}
          onSaveExpiry={(d) => onSaveExpiry(open.id, d)}
          onDelete={() => onDelete(open.id)}
          onClose={() => setOpenId(null)}
        />
      ) : null}
    </section>
  );
}
