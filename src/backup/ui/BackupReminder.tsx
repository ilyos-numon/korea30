import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { Icon } from '../../components/Icon';
import { StatusNote } from '../../components/StatusNote';
import { useToday } from '../../components/useToday';
import { useFeatureStrings } from '../../i18n/feature';
import type { ProgressStorage } from '../../quest/progress';
import { UI_PACKS } from '../../ui/i18n';
import { setTopNotice, useTopNoticeShown } from '../../ui/topNotice';
import { PHOTOS_CHANGED_EVENT } from '../../worklog/photos/events';
import { dataSignature } from '../io';
import { loadBackupMeta, shouldRemind } from '../reminder';
import { BACKUP_CHANGED_EVENT, exportBackup, exportErrorName } from '../share';
import '../backup.css';

/** DeadlineBanner 의 체류 저장 이벤트 (상수가 export 되지 않아 같은 값을 쓴다) */
const STAY_CHANGED_EVENT = 'korea30:stay-changed';

export interface BackupReminderProps {
  /** 테스트용 고정 시각 */
  now?: Date;
  storage?: ProgressStorage;
}

function defaultStorage(): ProgressStorage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

/** 현재 기기 데이터 서명 → shouldRemind. 읽기 실패는 알리지 않음(false) */
export async function checkBackupReminder(storage: ProgressStorage, nowMs: number): Promise<boolean> {
  try {
    const { signature, hasData } = await dataSignature(storage);
    return shouldRemind(loadBackupMeta(storage), signature, hasData, nowMs);
  } catch {
    return false;
  }
}

export interface BackupReminderViewProps {
  busy: boolean;
  onNow: () => void;
  onClose: () => void;
  /** 내보내기 실패 시 오류 이름. 있으면 알림 안에 오류 줄을 보인다 */
  errorName?: string | null;
}

/** 알림 한 줄 (문서 흐름 안, 오버레이 아님) */
export function BackupReminderView(props: BackupReminderViewProps): JSX.Element {
  const { busy, onNow, onClose, errorName } = props;
  const { t, ko } = useFeatureStrings(UI_PACKS);
  const hasError = typeof errorName === 'string';
  return (
    <div
      data-testid="backup-reminder"
      className="backup-reminder"
      role="status"
      style={hasError ? { flexWrap: 'wrap' } : undefined}
    >
      <span className="backup-reminder-icon" aria-hidden="true">
        <Icon name="folder" size={16} />
      </span>
      <p className="backup-reminder-text">
        {t.backupRemind}
        {' '}
        <span lang="ko">{ko.backupRemind}</span>
      </p>
      <div className="backup-reminder-actions">
        <button
          type="button"
          data-testid="backup-reminder-now"
          className="btn btn-primary btn-sm"
          disabled={busy}
          onClick={onNow}
        >
          <Icon name="download" size={16} />
          <span>{t.backupNow}</span>
        </button>
        <button
          type="button"
          data-testid="backup-reminder-close"
          className="backup-reminder-close"
          aria-label={t.close}
          title={t.close}
          onClick={onClose}
        >
          <Icon name="x" size={18} />
        </button>
      </div>
      {hasError ? (
        <div style={{ flexBasis: '100%', minWidth: 0 }}>
          <StatusNote
            tone="danger"
            role="alert"
            testId="backup-reminder-error"
            data={{ code: 'exportFailed', 'err-name': errorName }}
            text={t.backupErrExport}
            ko={ko.backupErrExport}
          />
        </div>
      ) : null}
    </div>
  );
}

/** 마지막 백업 뒤 2일이 넘었고 기록이 바뀌었으면(또는 백업 이력 없이 기록이 있으면) 백업을 권한다 (PLAN §4.7) */
export function BackupReminder(props: BackupReminderProps = {}): JSX.Element | null {
  const { now } = props;
  const today = useToday(now);
  const [show, setShow] = useState(false);
  const [closed, setClosed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorName, setErrorName] = useState<string | null>(null);
  const nowMs = now?.getTime();
  // 만료 사진 안내가 보이는 동안은 숨는다 (화면 위 안내는 한 번에 하나)
  const blocked = useTopNoticeShown(['expiredPhotos']);
  const visible = show && !closed && !blocked;

  useEffect(() => {
    setTopNotice('backup', visible);
  }, [visible]);
  useEffect(() => () => setTopNotice('backup', false), []);

  const storage = (): ProgressStorage | null => props.storage ?? defaultStorage();

  useEffect(() => {
    const s = props.storage ?? defaultStorage();
    if (!s || typeof window === 'undefined') return;
    let alive = true;
    let seq = 0;
    const check = (): void => {
      const mine = ++seq;
      void checkBackupReminder(s, nowMs ?? Date.now()).then((v) => {
        if (alive && mine === seq) setShow(v);
      });
    };
    const onVisible = (): void => {
      if (document.visibilityState === 'visible') check();
    };
    check();
    const events = [BACKUP_CHANGED_EVENT, PHOTOS_CHANGED_EVENT, STAY_CHANGED_EVENT, 'hashchange', 'focus'];
    for (const e of events) window.addEventListener(e, check);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      alive = false;
      for (const e of events) window.removeEventListener(e, check);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [today, nowMs, props.storage]);

  const onNow = async (): Promise<void> => {
    const s = storage();
    if (!s || busy) return;
    setBusy(true);
    setErrorName(null);
    try {
      const result = await exportBackup(s, now ?? new Date());
      if (result !== 'cancelled') setShow(false);
    } catch (err) {
      // 실패하면 알림을 그대로 두고 알림 안에 오류 줄을 보인다
      setErrorName(exportErrorName(err));
    } finally {
      setBusy(false);
    }
  };

  if (!visible) return null;
  return (
    <BackupReminderView
      busy={busy}
      errorName={errorName}
      onNow={() => {
        void onNow();
      }}
      onClose={() => setClosed(true)}
    />
  );
}
