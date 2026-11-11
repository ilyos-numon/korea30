import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { Icon } from '../components/Icon';
import { useToday } from '../components/useToday';
import { useFeatureStrings } from '../i18n/feature';
import { stayProfileRepo } from '../storage/repos';
import { DEADLINE_PACKS } from './i18n';
import { buildTimeline, needsBanner } from './rules';
import '../screens/deadline.css';

const STAY_CHANGED_EVENT = 'korea30:stay-changed';

/** 기한 화면이 저장·삭제 후 호출 → 배너가 다시 읽는다 */
export function notifyStayChanged(): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(STAY_CHANGED_EVENT));
}

/** stayProfileRepo.get() → buildTimeline → needsBanner 이면 #/deadline 링크, 아니면 null (PLAN §4.9) */
export function DeadlineBanner(): JSX.Element | null {
  const { t, ko } = useFeatureStrings(DEADLINE_PACKS);
  const [count, setCount] = useState(0);
  const today = useToday();

  useEffect(() => {
    let alive = true;
    const load = (): void => {
      stayProfileRepo
        .get()
        .then((p) => {
          if (!alive) return;
          if (!p) {
            setCount(0);
            return;
          }
          const items = buildTimeline(p, today);
          setCount(
            needsBanner(items)
              ? items.filter((i) => i.kind !== 'extensionOpens' && (i.level === 'overdue' || i.level === 'urgent')).length
              : 0,
          );
        })
        .catch(() => {});
    };
    load();
    window.addEventListener(STAY_CHANGED_EVENT, load);
    window.addEventListener('hashchange', load);
    return () => {
      alive = false;
      window.removeEventListener(STAY_CHANGED_EVENT, load);
      window.removeEventListener('hashchange', load);
    };
  }, [today]);

  if (count === 0) return null;
  return (
    <a href="#/deadline" data-testid="deadline-banner" className="deadline-banner" role="status" title={ko.banner(count)}>
      <span className="deadline-banner-icon" aria-hidden="true">
        <Icon name="bell" size={18} />
      </span>
      <span className="deadline-banner-text">{t.banner(count)}</span>
      <Icon name="chevronRight" size={18} className="deadline-banner-go" />
    </a>
  );
}
