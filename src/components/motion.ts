import { useEffect, useState, type RefObject } from 'react';

/** 사용자가 "동작 줄이기"를 켰는지 */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

/** Web Animations API 가 있으면 애니메이션, 없거나 동작 줄이기면 아무것도 하지 않는다 */
export function animate(el: Element | null | undefined, keyframes: Keyframe[], options: KeyframeAnimationOptions): void {
  if (!el || prefersReducedMotion() || typeof (el as HTMLElement).animate !== 'function') return;
  (el as HTMLElement).animate(keyframes, options);
}

/** 요소가 화면에 들어오면 true (IntersectionObserver 없으면 바로 true) */
export function useInView(ref: RefObject<Element | null>, threshold = 0.35): boolean {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    if (typeof IntersectionObserver === 'undefined') {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, seen, threshold]);
  return seen;
}
