import type { ProgressStorage } from '../quest/progress';

/** 소개 페이지를 본 적이 있는지. 값 '1'. 기기 밖으로 보내지 않는다. */
export const INTRO_KEY = 'korea30.intro.v1';

/** 소개 페이지를 다시 열 때 보내는 window 이벤트 */
export const SHOW_INTRO_EVENT = 'korea30:show-intro';

/** 저장값이 '1' 이면 true. getItem 예외 → false */
export function loadIntroSeen(s: ProgressStorage): boolean {
  try {
    return s.getItem(INTRO_KEY) === '1';
  } catch {
    return false;
  }
}

/** setItem(INTRO_KEY, '1'). 예외는 삼킨다(사생활 모드 등) */
export function saveIntroSeen(s: ProgressStorage): void {
  try {
    s.setItem(INTRO_KEY, '1');
  } catch {
    /* 저장 불가여도 앱은 계속 돈다 */
  }
}

export function requestIntro(): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(SHOW_INTRO_EVENT));
}
