import { useEffect, useState } from 'react';
import { toIsoDate } from '../quest/arrival';

/** now 다음 로컬 자정 + 1000ms 까지 ms (항상 > 0) */
export function msUntilNextDay(now: Date): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  return next.getTime() - now.getTime() + 1000;
}

/** fixed 가 있으면 toIsoDate(fixed) 고정, 타이머 없음. 없으면 오늘 YYYY-MM-DD, 자정 타이머 + visibilitychange(visible)·focus 시 재계산 */
export function useToday(fixed?: Date): string {
  const fixedIso = fixed ? toIsoDate(fixed) : null;
  const [today, setToday] = useState(() => fixedIso ?? toIsoDate(new Date()));

  useEffect(() => {
    if (fixedIso !== null) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = (): void => {
      const now = new Date();
      setToday(toIsoDate(now));
      if (timer !== undefined) clearTimeout(timer);
      timer = setTimeout(refresh, msUntilNextDay(now));
    };
    const onVisible = (): void => {
      if (document.visibilityState === 'visible') refresh();
    };
    refresh();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', refresh);
    return () => {
      if (timer !== undefined) clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', refresh);
    };
  }, [fixedIso]);

  return fixedIso ?? today;
}
