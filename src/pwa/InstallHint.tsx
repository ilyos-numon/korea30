import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { Icon } from '../components/Icon';
import { useFeatureStrings } from '../i18n/feature';
import type { ProgressStorage } from '../quest/progress';
import { UI_PACKS } from '../ui/i18n';
import { useTopNoticeShown } from '../ui/topNotice';
import {
  INSTALL_DISMISS_KEY,
  clearDeferredPrompt,
  detectInstallMode,
  getDeferredPrompt,
  isStandalone,
  onInstallChange,
  wasInstalled,
} from './install';
import type { InstallMode } from './install';
import './pwa.css';

function defaultStorage(): ProgressStorage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

function readDismissed(s: ProgressStorage | null): boolean {
  try {
    return s?.getItem(INSTALL_DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

function currentMode(): InstallMode {
  if (wasInstalled()) return 'installed';
  const ua = typeof navigator === 'undefined' ? '' : (navigator.userAgent ?? '');
  return detectInstallMode({ standalone: isStandalone(), ua, hasPrompt: getDeferredPrompt() !== null });
}

/** Icon 선 스타일의 공유 아이콘 (사각형 + 위 화살표) */
function ShareGlyph(): JSX.Element {
  return (
    <svg
      className="icon"
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={true}
      focusable="false"
    >
      <path d="M8.5 9.5H6.5a1 1 0 0 0-1 1V20a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-9.5a1 1 0 0 0-1-1h-2" />
      <path d="M12 14.5V3M8.5 6.5L12 3l3.5 3.5" />
    </svg>
  );
}

export interface InstallHintViewProps {
  mode: 'prompt' | 'ios';
  onInstall: () => void;
  onClose: () => void;
}

/** 홈 화면 추가 권유 카드 (문서 흐름 배치, 오버레이 아님) */
export function InstallHintView(props: InstallHintViewProps): JSX.Element {
  const { mode, onInstall, onClose } = props;
  const { t, ko } = useFeatureStrings(UI_PACKS);
  return (
    <div className="note note-primary install-hint" data-testid="install-hint" data-mode={mode}>
      <Icon name="smartphone" size={18} />
      <div className="install-hint-body">
        <p className="install-hint-title">
          {t.installTitle} <span lang="ko">{ko.installTitle}</span>
        </p>
        <p className="install-hint-why">{t.installWhy}</p>
        {mode === 'prompt' ? (
          <div className="install-hint-actions">
            <button type="button" className="btn btn-primary btn-sm" data-testid="install-hint-install" onClick={onInstall}>
              <Icon name="download" size={16} />
              <span>{t.installButton}</span>
            </button>
          </div>
        ) : (
          <ol className="install-hint-steps" data-testid="install-hint-ios-steps">
            <li>
              <span className="install-hint-step-icon">
                <ShareGlyph />
              </span>
              <span>
                {t.installIosStep1} <span lang="ko">{ko.installIosStep1}</span>
              </span>
            </li>
            <li>
              <span className="install-hint-step-icon">
                <Icon name="plus" size={18} />
              </span>
              <span>
                {t.installIosStep2} <span lang="ko">{ko.installIosStep2}</span>
              </span>
            </li>
          </ol>
        )}
      </div>
      <button
        type="button"
        className="install-hint-close"
        data-testid="install-hint-close"
        aria-label={t.close}
        title={t.close}
        onClick={onClose}
      >
        <Icon name="x" size={18} />
      </button>
    </div>
  );
}

/** 설치 안 된 상태면 홈 화면 추가를 권한다. 닫으면 INSTALL_DISMISS_KEY 에 영구 기억 (PLAN §4.7) */
export function InstallHint(props: { storage?: ProgressStorage } = {}): JSX.Element | null {
  const [mode, setMode] = useState<InstallMode>(currentMode);
  const [dismissed, setDismissed] = useState<boolean>(() => readDismissed(props.storage ?? defaultStorage()));
  // 만료 사진 안내나 백업 알림이 보이는 동안은 숨는다 (화면 위 안내는 한 번에 하나)
  const blocked = useTopNoticeShown(['expiredPhotos', 'backup']);

  useEffect(() => {
    setMode(currentMode());
    return onInstallChange(() => setMode(currentMode()));
  }, []);

  const onInstall = (): void => {
    const ev = getDeferredPrompt();
    if (!ev) return;
    clearDeferredPrompt();
    void ev.prompt().catch(() => {});
  };

  const onClose = (): void => {
    try {
      (props.storage ?? defaultStorage())?.setItem(INSTALL_DISMISS_KEY, '1');
    } catch {
      // 저장 실패해도 이번 세션에서는 숨긴다
    }
    setDismissed(true);
  };

  if (blocked || dismissed || (mode !== 'prompt' && mode !== 'ios')) return null;
  return <InstallHintView mode={mode} onInstall={onInstall} onClose={onClose} />;
}
