import { createEvents, type DateArray, type EventAttributes } from 'ics';
import { addDays } from 'date-fns';
import type { DeadlineItem, DeadlineKind } from './rules';

export interface IcsText {
  title: (kind: DeadlineKind) => string;
  alarm: (kind: DeadlineKind, daysBefore: number) => string;
}

export const ICS_FILE_NAME = 'korea30-deadlines.ics';

const ALARM_DAYS = [7, 1] as const;

function toDateArray(iso: string): DateArray {
  const [y, m, d] = iso.split('-').map(Number);
  return [y, m, d];
}

function nextDay(iso: string): DateArray {
  const [y, m, d] = toDateArray(iso);
  const n = addDays(new Date(y, m - 1, d), 1);
  return [n.getFullYear(), n.getMonth() + 1, n.getDate()];
}

/** 종일 이벤트, 제목 `${t.title(kind)} / ${ko.title(kind)}`, VALARM DISPLAY -P7D, -P1D. UID `${kind}-${due}@korea30.local` */
export function buildIcs(
  items: readonly DeadlineItem[],
  t: IcsText,
  ko: IcsText,
): { ok: true; text: string } | { ok: false; error: 'empty' | 'library' } {
  if (items.length === 0) return { ok: false, error: 'empty' };
  const events: EventAttributes[] = items.map((item) => ({
    uid: `${item.kind}-${item.due}@korea30.local`,
    title: `${t.title(item.kind)} / ${ko.title(item.kind)}`,
    start: toDateArray(item.due),
    end: nextDay(item.due),
    alarms: ALARM_DAYS.map((days) => ({
      action: 'display' as const,
      description: `${t.alarm(item.kind, days)} / ${ko.alarm(item.kind, days)}`,
      trigger: { before: true, days },
    })),
  }));
  try {
    const { error, value } = createEvents(events);
    if (error || !value) return { ok: false, error: 'library' };
    return { ok: true, text: value };
  } catch {
    return { ok: false, error: 'library' };
  }
}
