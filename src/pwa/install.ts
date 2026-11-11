/** 홈 화면 추가 권유: 설치 상태 판별 + beforeinstallprompt 보관 (PLAN §4.7) */

export const INSTALL_DISMISS_KEY = 'korea30.install.v1'; // '1' = 닫음

export type InstallMode = 'installed' | 'prompt' | 'ios' | 'none';

/** standalone → installed · hasPrompt → prompt · iOS 사파리 → ios · 그 외 none */
export function detectInstallMode(env: { standalone: boolean; ua: string; hasPrompt: boolean }): InstallMode {
  const { standalone, ua, hasPrompt } = env;
  if (standalone) return 'installed';
  if (hasPrompt) return 'prompt';
  if (/iP(hone|ad|od)/.test(ua) && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)) return 'ios';
  return 'none';
}

export function isStandalone(): boolean {
  try {
    if (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(display-mode: standalone)').matches
    ) {
      return true;
    }
    const nav = typeof navigator === 'undefined' ? undefined : (navigator as Navigator & { standalone?: boolean });
    return nav?.standalone === true;
  } catch {
    return false;
  }
}

/** 크롬 계열의 beforeinstallprompt 이벤트 (표준 타입에 없음) */
export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice?: Promise<{ outcome: 'accepted' | 'dismissed'; platform?: string }>;
}

type Listener = () => void;

let deferred: BeforeInstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<Listener>();

function emit(): void {
  for (const l of listeners) l();
}

/** 보관된 설치 프롬프트 이벤트 (없으면 null) */
export function getDeferredPrompt(): BeforeInstallPromptEvent | null {
  return deferred;
}

/** 이 세션에서 appinstalled 가 왔는지 */
export function wasInstalled(): boolean {
  return installed;
}

/** 프롬프트를 썼으면 다시 쓸 수 없으므로 비운다 */
export function clearDeferredPrompt(): void {
  deferred = null;
  emit();
}

export function onInstallChange(cb: Listener): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** 모듈을 읽는 즉시 리스닝해 컴포넌트 마운트 전 이벤트도 잡는다 */
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
    emit();
  });
  window.addEventListener('appinstalled', () => {
    installed = true;
    deferred = null;
    emit();
  });
}
