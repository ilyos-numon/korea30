import type { JSX } from 'react';
import { Icon } from '../components/Icon';
import { useFeatureStrings } from '../i18n/feature';
import { UI_PACKS } from '../ui/i18n';
import './pwa.css';

/** 새 버전 안내: 모국어 + 한국어 원문(lang="ko"), 새로고침·닫기. 문서 흐름 배치(오버레이 아님) */
export function UpdateNotice(props: { onReload: () => void; onClose: () => void }): JSX.Element {
  const { onReload, onClose } = props;
  const { t, ko } = useFeatureStrings(UI_PACKS);
  return (
    <div className="note note-primary pwa-update" role="status" data-testid="pwa-update">
      <Icon name="refresh" size={18} />
      <div className="pwa-update-body">
        <p className="pwa-update-text">
          {t.pwaUpdateTitle} <span lang="ko">{ko.pwaUpdateTitle}</span>
        </p>
        <div className="pwa-update-actions">
          <button type="button" className="btn btn-primary btn-sm" data-testid="pwa-update-reload" onClick={onReload}>
            {t.pwaUpdateReload}
          </button>
          <button type="button" className="btn btn-ghost btn-sm" data-testid="pwa-update-close" onClick={onClose}>
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}
