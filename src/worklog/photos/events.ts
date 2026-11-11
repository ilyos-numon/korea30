/** 사진을 지우거나 보관 기간을 바꿨을 때 보내는 window 이벤트 */
export const PHOTOS_CHANGED_EVENT = 'korea30:photos-changed';

export function notifyPhotosChanged(): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(PHOTOS_CHANGED_EVENT));
}

/** 구독 해제 함수를 돌려준다. window 가 없으면 아무것도 하지 않는다 */
export function onPhotosChanged(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = () => cb();
  window.addEventListener(PHOTOS_CHANGED_EVENT, handler);
  return () => window.removeEventListener(PHOTOS_CHANGED_EVENT, handler);
}
