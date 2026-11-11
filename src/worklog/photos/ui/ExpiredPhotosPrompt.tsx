import { useCallback, useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import { Icon } from '../../../components/Icon';
import { StatusNote } from '../../../components/StatusNote';
import { useToday } from '../../../components/useToday';
import { useFeatureStrings } from '../../../i18n/feature';
import { legalNumber } from '../../../legal';
import type { WorkPhoto } from '../../../storage/db';
import { classifyStorageError, type StorageFailure } from '../../../storage/failure';
import { photoRepo } from '../../../storage/repos';
import { UI_PACKS } from '../../../ui/i18n';
import { setTopNotice } from '../../../ui/topNotice';
import { notifyPhotosChanged, onPhotosChanged } from '../events';
import { keepMoreExpiresOn } from '../expiry';
import '../photos.css';

export interface ExpiredPhotosPromptProps {
  /** 테스트용 고정 시각 */
  now?: Date;
  /** 테스트용: 주면 처음 목록으로 쓰고 열 때 IndexedDB 를 읽지 않는다 */
  initialExpired?: readonly Pick<WorkPhoto, 'id'>[];
}

type Done = { kind: 'purged'; n: number } | { kind: 'kept'; n: number; until: string };

/**
 * 어느 화면이든 앱을 열 때 보관 기간이 지난 사진을 묻는다 (자동 삭제하지 않는다).
 * 지우기 → removeMany, 1년 더 보관 → expiresOn = keepMoreExpiresOn(today). 문서 흐름 배치(오버레이 아님).
 */
export function ExpiredPhotosPrompt(props: ExpiredPhotosPromptProps = {}): JSX.Element | null {
  const { now, initialExpired } = props;
  const today = useToday(now);
  const { t, ko } = useFeatureStrings(UI_PACKS);
  const testMode = initialExpired !== undefined;

  const [expired, setExpired] = useState<readonly Pick<WorkPhoto, 'id'>[]>(() => initialExpired ?? []);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const [error, setError] = useState<StorageFailure | null>(null);
  const seq = useRef(0);

  const load = useCallback(async (): Promise<void> => {
    const mine = ++seq.current;
    try {
      const rows = await photoRepo.listExpired(today);
      if (mine === seq.current) setExpired(rows.map((p) => ({ id: p.id })));
    } catch {
      // 읽기 실패는 안내 없이 그대로 둔다 (다음 열 때 다시 묻는다)
    }
  }, [today]);

  useEffect(() => {
    if (testMode) return undefined;
    void load();
    const off = onPhotosChanged(() => {
      void load();
    });
    return () => {
      seq.current += 1;
      off();
    };
  }, [testMode, load]);

  // 화면 위 안내 우선순위 1위: 보이는 동안 백업 알림·홈 화면 추가 권유를 숨긴다
  const asking = expired.length > 0;
  useEffect(() => {
    setTopNotice('expiredPhotos', asking);
  }, [asking]);
  useEffect(() => () => setTopNotice('expiredPhotos', false), []);

  const onDelete = async (): Promise<void> => {
    if (busy || expired.length === 0) return;
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      const n = await photoRepo.removeMany(expired.map((p) => p.id));
      seq.current += 1;
      setExpired([]);
      setDone({ kind: 'purged', n });
      notifyPhotosChanged();
    } catch (err) {
      setError(classifyStorageError(err));
      void load();
    } finally {
      setBusy(false);
    }
  };

  const onKeep = async (): Promise<void> => {
    if (busy || expired.length === 0) return;
    setBusy(true);
    setError(null);
    setDone(null);
    const until = keepMoreExpiresOn(today);
    try {
      for (const p of expired) await photoRepo.updateMeta(p.id, { expiresOn: until, expiryCustom: true });
      const n = expired.length;
      seq.current += 1;
      setExpired([]);
      setDone({ kind: 'kept', n, until });
      notifyPhotosChanged();
    } catch (err) {
      setError(classifyStorageError(err));
      // 일부만 바뀌었을 수 있으니 다시 읽어 남은 장 수로 안내를 유지한다
      void load();
      notifyPhotosChanged();
    } finally {
      setBusy(false);
    }
  };

  const result =
    done === null ? null : done.kind === 'purged' ? (
      <StatusNote
        tone="ok"
        testId="photo-purged"
        role="status"
        data={{ count: String(done.n) }}
        text={t.expiredPhotosDeleted(done.n)}
        ko={ko.expiredPhotosDeleted(done.n)}
      />
    ) : (
      <StatusNote
        tone="ok"
        testId="expired-photos-kept"
        role="status"
        data={{ count: String(done.n), until: done.until }}
        text={t.expiredPhotosKept(done.n, done.until)}
        ko={ko.expiredPhotosKept(done.n, done.until)}
      />
    );

  if (expired.length === 0) return result ? <div className="expired-photos-result">{result}</div> : null;

  const n = expired.length;
  const years = legalNumber('wageClaimYears');
  return (
    <section
      data-testid="expired-photos-prompt"
      role="region"
      aria-label={t.expiredPhotosAsk(n)}
      data-count={n}
      className="note note-warn expired-photos"
    >
      <Icon name="image" size={18} />
      <div className="expired-photos-body">
        <p className="expired-photos-ask">
          {t.expiredPhotosAsk(n)}
          {' '}
          <span lang="ko">{ko.expiredPhotosAsk(n)}</span>
        </p>
        <p data-testid="expired-photos-hint" className="expired-photos-hint">
          {t.expiredPhotosHint(years)}
          {' '}
          <span lang="ko">{ko.expiredPhotosHint(years)}</span>
        </p>
        <div className="expired-photos-actions">
          <button
            type="button"
            data-testid="expired-photos-delete"
            className="btn btn-line btn-sm"
            disabled={busy}
            onClick={() => {
              void onDelete();
            }}
          >
            {t.expiredPhotosDelete}
          </button>
          <button
            type="button"
            data-testid="expired-photos-keep"
            className="btn btn-primary btn-sm"
            disabled={busy}
            onClick={() => {
              void onKeep();
            }}
          >
            {t.expiredPhotosKeep}
          </button>
        </div>
        {error ? (
          // StatusNote 와 같은 모양이지만 testid 는 두지 않는다 (§4.4 목록 외)
          <p className="note note-danger status-note" role="alert">
            <Icon name="alert" size={18} />
            <span>
              {error === 'quota' ? t.storageFull : t.storageFailed}
              {' '}
              <span lang="ko">{error === 'quota' ? ko.storageFull : ko.storageFailed}</span>
            </span>
          </p>
        ) : null}
      </div>
    </section>
  );
}
