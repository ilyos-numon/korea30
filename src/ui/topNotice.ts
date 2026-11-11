import { useCallback, useSyncExternalStore } from 'react';

/**
 * 화면 위 안내(헤더 아래)는 한 번에 하나만 보인다.
 * 우선순위: 만료 사진 안내(expiredPhotos) > 백업 알림(backup) > 홈 화면 추가 권유.
 * 위쪽 안내가 보임/숨김을 알리면 아래쪽 안내가 구독해서 숨거나 다시 나온다. 모듈 상태라 SSR 에서도 안전하다.
 */
export type TopNoticeKind = 'expiredPhotos' | 'backup';

const shown = new Set<TopNoticeKind>();
const listeners = new Set<() => void>();

/** kind 안내가 지금 화면에 보이는지 알린다. 값이 바뀔 때만 구독자를 부른다 */
export function setTopNotice(kind: TopNoticeKind, visible: boolean): void {
  if (shown.has(kind) === visible) return;
  if (visible) shown.add(kind);
  else shown.delete(kind);
  for (const fn of [...listeners]) fn();
}

/** kinds 중 하나라도 보이면 true */
export function isTopNoticeShown(kinds: readonly TopNoticeKind[]): boolean {
  return kinds.some((k) => shown.has(k));
}

/** 바뀔 때마다 fn 을 부른다. 반환값으로 구독을 끊는다 */
export function subscribeTopNotice(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** 컴포넌트용: kinds 중 하나라도 보이는 동안 true. 모듈 상태만 읽으니 서버 렌더에서도 같은 값(처음엔 false) */
export function useTopNoticeShown(kinds: readonly TopNoticeKind[]): boolean {
  const key = kinds.join(',');
  const get = useCallback(() => isTopNoticeShown(key.split(',') as TopNoticeKind[]), [key]);
  return useSyncExternalStore(subscribeTopNotice, get, get);
}

/** 테스트용: 상태와 구독을 모두 비운다 */
export function resetTopNoticeForTest(): void {
  shown.clear();
  listeners.clear();
}
