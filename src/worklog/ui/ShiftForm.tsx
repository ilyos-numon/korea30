import { useState } from 'react';
import type { JSX } from 'react';
import { Hint } from '../../components/Hint';
import { Icon } from '../../components/Icon';
import type { WorkShift } from '../../storage/db';
import { validateShift, type ShiftError } from '../calc';
import type { WorklogStrings } from '../i18n';

export type ShiftDraft = Omit<WorkShift, 'id' | 'createdAt'>;

const ERROR_TEXT: Readonly<Record<ShiftError, (s: WorklogStrings) => string>> = {
  badDate: (s) => s.errBadDate,
  badTime: (s) => s.errBadTime,
  zeroLength: (s) => s.errZeroLength,
  tooLong: (s) => s.errTooLong,
  breakTooLong: (s) => s.errBreakTooLong,
  badBreak: (s) => s.errBadBreak,
  future: (s) => s.errFuture,
};

/** '' → 0, 숫자가 아니면 NaN (validateShift 가 badBreak 로 잡는다) */
function parseBreak(raw: string): number {
  const s = raw.trim();
  return s === '' ? 0 : Number(s);
}

export function ShiftForm(props: {
  t: WorklogStrings;
  ko: WorklogStrings;
  today: string;
  /** 저장 성공 여부. true 일 때만 메모 칸을 비운다 */
  onAdd: (draft: ShiftDraft) => Promise<boolean>;
}): JSX.Element {
  const { t, ko, today } = props;
  const [date, setDate] = useState(today);
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('18:00');
  const [breakRaw, setBreakRaw] = useState('60');
  const [isHoliday, setIsHoliday] = useState(false);
  const [memo, setMemo] = useState('');
  const [memoOpen, setMemoOpen] = useState(false);
  const [error, setError] = useState<ShiftError | null>(null);

  const onAdd = (): void => {
    const draft: ShiftDraft = { date, start, end, breakMinutes: parseBreak(breakRaw), isHoliday, memo: memo.trim() };
    const err = validateShift(draft, today);
    setError(err);
    if (err) return;
    void props.onAdd(draft).then((ok) => {
      if (ok) setMemo('');
    });
  };

  const edit = <T,>(set: (v: T) => void) => (v: T): void => {
    set(v);
    setError(null);
  };

  return (
    <section className="card work-card" aria-labelledby="work-add-h">
      <h2 id="work-add-h" className="work-heading">
        <Icon name="plus" size={18} />
        {t.shiftHeading}
      </h2>
      <label className="field">
        <span className="field-label">{t.shiftDate}</span>
        <input
          type="date"
          data-testid="work-shift-date"
          className="input"
          max={today}
          value={date}
          onChange={(e) => edit(setDate)(e.target.value)}
        />
      </label>
      <div className="grid-2">
        <label className="field">
          <span className="field-label">{t.shiftStart}</span>
          <input
            type="time"
            data-testid="work-shift-start"
            className="input"
            value={start}
            onChange={(e) => edit(setStart)(e.target.value)}
          />
        </label>
        <div className="field">
          <Hint text={t.shiftOvernightHint}>
            <label htmlFor="work-shift-end" className="field-label">
              {t.shiftEnd}
            </label>
          </Hint>
          <input
            id="work-shift-end"
            type="time"
            data-testid="work-shift-end"
            className="input"
            value={end}
            onChange={(e) => edit(setEnd)(e.target.value)}
          />
        </div>
      </div>
      <div className="grid-2 work-break-row">
        <label className="field">
          <span className="field-label">{t.shiftBreak}</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            data-testid="work-shift-break"
            className="input"
            value={breakRaw}
            onChange={(e) => edit(setBreakRaw)(e.target.value)}
          />
        </label>
        <label className="work-toggle">
          <input
            type="checkbox"
            data-testid="work-shift-holiday"
            checked={isHoliday}
            onChange={(e) => edit(setIsHoliday)(e.target.checked)}
          />
          <span className="work-toggle-ui" aria-hidden="true" />
          <span className="work-toggle-text">{t.shiftHoliday}</span>
        </label>
      </div>
      {memoOpen ? (
        <label className="field">
          <span className="field-label">{t.shiftMemo}</span>
          <input type="text" className="input" value={memo} autoFocus onChange={(e) => setMemo(e.target.value)} />
        </label>
      ) : (
        <button type="button" className="link-btn work-memo-open" onClick={() => setMemoOpen(true)}>
          <Icon name="plus" size={14} />
          {t.shiftMemo}
        </button>
      )}
      {error ? (
        <p data-testid="work-shift-error" className="field-error" role="alert">
          {ERROR_TEXT[error](t)}
          <span lang="ko" className="work-ko">
            {ERROR_TEXT[error](ko)}
          </span>
        </p>
      ) : null}
      <button type="button" data-testid="work-shift-add" className="btn btn-primary btn-block" onClick={onAdd}>
        <Icon name="plus" size={18} strokeWidth={2.2} />
        {t.shiftAdd}
      </button>
    </section>
  );
}
