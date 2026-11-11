import type { JSX } from 'react';
import { Icon } from '../../components/Icon';
import { vars } from '../../components/text';
import type { WorkShift } from '../../storage/db';
import type { WorklogStrings } from '../i18n';

export function ShiftList(props: {
  t: WorklogStrings;
  ko: WorklogStrings;
  /** 이번 달 시프트. date·start 오름차순 */
  shifts: readonly WorkShift[];
  onDelete: (id: string) => void;
}): JSX.Element {
  const { t, shifts } = props;
  return (
    <section className="card work-card work-list-card">
      <h2 className="work-heading">
        <Icon name="clock" size={18} />
        {t.listHeading}
        {shifts.length > 0 ? <span className="badge work-count num">{shifts.length}</span> : null}
      </h2>
      {shifts.length === 0 ? (
        <p data-testid="work-empty" className="work-empty">
          {t.empty}
        </p>
      ) : (
        <ul className="work-list">
          {shifts.map((s, i) => (
            <li key={s.id} data-testid="work-shift-row" data-date={s.date} className="work-shift-row" style={vars({ '--i': i })}>
              <span className="work-shift-day num">
                <span className="work-shift-md">{s.date.slice(5).replace('-', '.')}</span>
              </span>
              <span className="work-shift-main">
                <span className="work-shift-time num">{`${s.start}–${s.end}`}</span>
                <span className="work-shift-sub">
                  {t.breakMinutes(s.breakMinutes)}
                  {s.isHoliday ? <span className="badge badge-accent work-holiday">{t.holidayTag}</span> : null}
                </span>
                {s.memo ? <span className="work-shift-memo">{s.memo}</span> : null}
              </span>
              <button
                type="button"
                data-testid="work-shift-delete"
                className="icon-btn work-shift-delete"
                aria-label={`${t.delete} ${s.date} ${s.start}`}
                onClick={() => props.onDelete(s.id)}
              >
                <Icon name="trash" size={18} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
