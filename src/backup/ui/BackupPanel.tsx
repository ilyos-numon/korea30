import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, JSX } from 'react';
import { Icon } from '../../components/Icon';
import { StatusNote } from '../../components/StatusNote';
import { useFeatureStrings } from '../../i18n/feature';
import type { ProgressStorage } from '../../quest/progress';
import { UI_PACKS, type UiKitStrings } from '../../ui/i18n';
import { countBackup, parseBackup, type BackupCounts, type BackupFileV1, type BackupParseError } from '../format';
import { currentCounts, dataSignature, restoreBackup } from '../io';
import { saveBackupMeta } from '../reminder';
import { exportBackup, exportErrorName } from '../share';
import '../backup.css';

export type BackupErrorCode = BackupParseError | 'restoreFailed' | 'exportFailed';

/** 미리보기 상태. file 이 없으면(테스트용 초기값) 확인 버튼은 아무것도 하지 않는다 */
export interface BackupPreviewState {
  counts: BackupCounts;
  current: BackupCounts | null;
  file?: BackupFileV1;
}

export interface BackupPanelProps {
  /** 테스트용 고정 시각 */
  now?: Date;
  storage?: ProgressStorage;
  /** 테스트용 초기 표시 (renderToString 마크업 확인) */
  initial?: { preview?: BackupPreviewState; error?: BackupErrorCode; errorName?: string; done?: 'export' | 'restore' };
}

const RELOAD_DELAY_MS = 1000;

function defaultStorage(): ProgressStorage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

function errorText(s: UiKitStrings, code: BackupErrorCode): string {
  switch (code) {
    case 'notJson':
      return s.backupErrNotJson;
    case 'otherApp':
      return s.backupErrOtherApp;
    case 'newerVersion':
      return s.backupErrNewer;
    case 'damaged':
      return s.backupErrDamaged;
    case 'restoreFailed':
      return s.backupErrRestore;
    case 'exportFailed':
      return s.backupErrExport;
  }
}

function previewText(s: UiKitStrings, c: BackupCounts): string {
  return s.backupPreview(c.shifts, c.photos, c.questDays);
}

/** 도구 화면 "기록 백업" 섹션: 파일로 내보내기 · 파일에서 바꿔서 불러오기 */
export function BackupPanel(props: BackupPanelProps = {}): JSX.Element {
  const { now, initial } = props;
  const { t, ko } = useFeatureStrings(UI_PACKS);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<BackupPreviewState | null>(initial?.preview ?? null);
  const [error, setError] = useState<BackupErrorCode | null>(initial?.error ?? null);
  const [errorName, setErrorName] = useState<string | null>(initial?.errorName ?? null);
  const [done, setDone] = useState<'export' | 'restore' | null>(initial?.done ?? null);
  const inputRef = useRef<HTMLInputElement>(null);
  const reloadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (reloadTimer.current !== null) clearTimeout(reloadTimer.current);
    },
    [],
  );

  const storage = (): ProgressStorage | null => props.storage ?? defaultStorage();

  const clearInput = (): void => {
    if (inputRef.current) inputRef.current.value = '';
  };

  const onExport = async (): Promise<void> => {
    const s = storage();
    if (busy) return;
    setBusy(true);
    setError(null);
    setErrorName(null);
    setDone(null);
    try {
      if (!s) throw new Error('no storage');
      const result = await exportBackup(s, now ?? new Date());
      if (result !== 'cancelled') setDone('export');
    } catch (err) {
      setError('exportFailed');
      setErrorName(exportErrorName(err));
    } finally {
      setBusy(false);
    }
  };

  const onFile = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const f = e.target.files?.[0];
    if (!f || busy) return;
    setError(null);
    setErrorName(null);
    setDone(null);
    setPreview(null);
    let text: string;
    try {
      text = await f.text();
    } catch {
      setError('notJson');
      clearInput();
      return;
    }
    const parsed = parseBackup(text);
    if (!parsed.ok) {
      setError(parsed.error);
      clearInput();
      return;
    }
    const s = storage();
    let current: BackupCounts | null = null;
    try {
      if (s) current = await currentCounts(s);
    } catch {
      current = null;
    }
    setPreview({ counts: countBackup(parsed.file), current, file: parsed.file });
  };

  const onCancel = (): void => {
    setPreview(null);
    clearInput();
  };

  const onConfirm = async (): Promise<void> => {
    const file = preview?.file;
    const s = storage();
    if (!file || busy) return;
    setBusy(true);
    setError(null);
    setErrorName(null);
    try {
      if (!s) throw new Error('no storage');
      await restoreBackup(file, s);
    } catch {
      setError('restoreFailed');
      setBusy(false);
      return;
    }
    try {
      const { signature } = await dataSignature(s);
      saveBackupMeta(s, { lastBackupAt: (now ?? new Date()).getTime(), signature });
    } catch {
      // 복원은 끝났다. 알림 메타만 못 남긴 경우라 안내하지 않는다
    }
    setPreview(null);
    clearInput();
    setDone('restore');
    reloadTimer.current = setTimeout(() => {
      location.reload();
    }, RELOAD_DELAY_MS);
  };

  return (
    <section data-testid="backup-section" className="card backup-section" aria-labelledby="backup-title">
      <h2 id="backup-title" className="backup-title">
        <Icon name="folder" size={20} />
        <span>{t.backupTitle}</span>
      </h2>
      <p className="backup-intro">
        {t.backupIntro}
        {' '}
        <span lang="ko">{ko.backupIntro}</span>
      </p>
      <div className="backup-actions">
        <button
          type="button"
          data-testid="backup-export"
          className="btn btn-primary"
          disabled={busy}
          onClick={() => {
            void onExport();
          }}
        >
          <Icon name="download" size={18} />
          <span>{t.backupExport}</span>
        </button>
        <label className={`btn btn-line backup-file-btn${busy ? ' backup-file-busy' : ''}`}>
          <Icon name="fileText" size={18} />
          <span>{t.backupImport}</span>
          <input
            ref={inputRef}
            type="file"
            accept="application/json,.json"
            data-testid="backup-import-input"
            className="backup-file-input"
            disabled={busy}
            onChange={(e) => {
              void onFile(e);
            }}
          />
        </label>
      </div>
      {preview ? (
        <div
          data-testid="backup-preview"
          className="note note-warn backup-preview"
          data-shifts={preview.counts.shifts}
          data-photos={preview.counts.photos}
          data-quest-days={preview.counts.questDays}
          data-stay={String(preview.counts.stay)}
        >
          <Icon name="fileCheck" size={18} />
          <div className="backup-preview-body">
            <p className="backup-preview-file">
              {previewText(t, preview.counts)}
              {' '}
              <span lang="ko">{previewText(ko, preview.counts)}</span>
            </p>
            {preview.current ? (
              <p className="backup-preview-current">
                <Icon name="smartphone" size={14} />
                <span>{previewText(t, preview.current)}</span>
              </p>
            ) : null}
            <p className="backup-preview-warn">
              {t.backupReplaceWarn}
              {' '}
              <span lang="ko">{ko.backupReplaceWarn}</span>
            </p>
            <div className="backup-preview-actions">
              <button
                type="button"
                data-testid="backup-restore-cancel"
                className="btn btn-line btn-sm"
                disabled={busy}
                onClick={onCancel}
              >
                {t.backupCancel}
              </button>
              <button
                type="button"
                data-testid="backup-restore-confirm"
                className="btn btn-primary btn-sm"
                disabled={busy}
                onClick={() => {
                  void onConfirm();
                }}
              >
                {t.backupRestore}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {error ? (
        <StatusNote
          tone="danger"
          testId="backup-error"
          role="alert"
          data={errorName ? { code: error, 'err-name': errorName } : { code: error }}
          text={errorText(t, error)}
          ko={errorText(ko, error)}
        />
      ) : null}
      {done ? (
        <StatusNote
          tone="ok"
          testId="backup-done"
          role="status"
          data={{ kind: done }}
          text={done === 'export' ? t.backupExported : t.backupRestored}
          ko={done === 'export' ? ko.backupExported : ko.backupRestored}
        />
      ) : null}
    </section>
  );
}
