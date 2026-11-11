import { useState } from 'react';
import type { JSX } from 'react';
import { Hint } from '../../components/Hint';
import { Icon } from '../../components/Icon';
import { legalNumber } from '../../legal';
import { parseWon } from '../../payroll/manual';
import type { WorkProfile, Workplace5Plus } from '../../storage/db';
import type { WorklogStrings } from '../i18n';

export type WorkProfileInput = Omit<WorkProfile, 'id'>;

type TextField =
  | 'workerName'
  | 'workerBirth'
  | 'workerPhone'
  | 'workerAddress'
  | 'companyName'
  | 'employerName'
  | 'employerAddress'
  | 'employerPhone';

const TEXT_FIELDS: readonly { field: TextField; type: 'text' | 'tel' | 'date'; label: (s: WorklogStrings) => string }[] = [
  { field: 'workerName', type: 'text', label: (s) => s.workerName },
  { field: 'workerBirth', type: 'date', label: (s) => s.workerBirth },
  { field: 'workerPhone', type: 'tel', label: (s) => s.workerPhone },
  { field: 'workerAddress', type: 'text', label: (s) => s.workerAddress },
  { field: 'companyName', type: 'text', label: (s) => s.companyName },
  { field: 'employerName', type: 'text', label: (s) => s.employerName },
  { field: 'employerAddress', type: 'text', label: (s) => s.employerAddress },
  { field: 'employerPhone', type: 'tel', label: (s) => s.employerPhone },
];

const SIZES: readonly { value: Workplace5Plus; label: (s: WorklogStrings, n: number) => string }[] = [
  { value: 'unknown', label: (s) => s.sizeUnknown },
  { value: 'yes', label: (s, n) => s.sizeYes(n) },
  { value: 'no', label: (s, n) => s.sizeNo(n) },
];

interface Draft extends Omit<WorkProfileInput, 'hourlyWage' | 'startDate' | 'endDate'> {
  wage: string;
  startDate: string;
  endDate: string;
}

function toDraft(p: WorkProfileInput): Draft {
  const { hourlyWage, startDate, endDate, ...rest } = p;
  return { ...rest, wage: hourlyWage > 0 ? String(hourlyWage) : '', startDate: startDate ?? '', endDate: endDate ?? '' };
}

/** 시급·사업장 규모·본인/사업장 정보. 저장 버튼을 눌러야 계산에 반영된다 */
export function ProfileForm(props: {
  t: WorklogStrings;
  ko: WorklogStrings;
  profile: WorkProfileInput;
  /** 저장 직후 안내 표시 */
  saved: boolean;
  onSave: (p: WorkProfileInput) => void;
}): JSX.Element {
  const { t, ko } = props;
  const workers = legalNumber('premiumMinWorkers');
  const [draft, setDraftState] = useState<Draft>(() => toDraft(props.profile));
  const [wageError, setWageError] = useState(false);

  const setDraft = (patch: Partial<Draft>): void => setDraftState((d) => ({ ...d, ...patch }));

  const onSave = (): void => {
    const parsed = parseWon(draft.wage);
    if (parsed.kind === 'error') {
      setWageError(true);
      return;
    }
    setWageError(false);
    const { wage: _wage, startDate, endDate, ...rest } = draft;
    props.onSave({
      ...rest,
      hourlyWage: parsed.kind === 'value' ? parsed.value : 0,
      startDate: startDate === '' ? null : startDate,
      endDate: endDate === '' ? null : endDate,
    });
  };

  return (
    <section id="work-profile" className="card work-card">
      <h2 className="work-heading">
        <Icon name="user" size={18} />
        {t.profileHeading}
      </h2>
      <div className="field">
        <Hint text={t.wageHint}>
          <label htmlFor="work-wage" className="field-label">
            {t.wage}
          </label>
        </Hint>
        <div className="work-money">
          <input
            id="work-wage"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            data-testid="work-wage"
            className="input num"
            placeholder="10,320"
            value={draft.wage}
            aria-invalid={wageError ? true : undefined}
            onChange={(e) => setDraft({ wage: e.target.value })}
          />
          <span className="work-money-unit" lang="ko" aria-hidden="true">
            원
          </span>
        </div>
      </div>
      {wageError ? (
        <p className="field-error" role="alert">
          {t.errWage}
          <span lang="ko" className="work-ko">
            {ko.errWage}
          </span>
        </p>
      ) : null}
      <label className="field">
        <span className="field-label">{t.size(workers)}</span>
        <select
          data-testid="work-size"
          className="input"
          value={draft.workplace5Plus}
          onChange={(e) => setDraft({ workplace5Plus: e.target.value as Workplace5Plus })}
        >
          {SIZES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label(t, workers)}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span className="field-label">{t.weekStart}</span>
        <select
          className="input"
          value={String(draft.weekStartsOn)}
          onChange={(e) => setDraft({ weekStartsOn: e.target.value === '0' ? 0 : 1 })}
        >
          <option value="1">{t.weekStartMon}</option>
          <option value="0">{t.weekStartSun}</option>
        </select>
      </label>
      <details className="work-details">
        <summary className="work-summary">
          <span>{t.detailsHeading}</span>
          <Icon name="chevronDown" size={18} className="work-summary-chev" />
        </summary>
        <div className="work-details-body">
          <p className="work-hint">{t.detailsHint}</p>
          {TEXT_FIELDS.map((f) => (
            <label key={f.field} className="field">
              <span className="field-label">{f.label(t)}</span>
              <input
                type={f.type}
                className="input"
                autoComplete="off"
                value={draft[f.field]}
                onChange={(e) => setDraft({ [f.field]: e.target.value })}
              />
            </label>
          ))}
          <div className="grid-2">
            <label className="field">
              <span className="field-label">{t.startDate}</span>
              <input type="date" className="input" value={draft.startDate} onChange={(e) => setDraft({ startDate: e.target.value })} />
            </label>
            <label className="field">
              <span className="field-label">{t.endDate}</span>
              <input type="date" className="input" value={draft.endDate} onChange={(e) => setDraft({ endDate: e.target.value })} />
            </label>
          </div>
        </div>
      </details>
      <button type="button" data-testid="work-profile-save" className="btn btn-primary btn-block" onClick={onSave}>
        {t.profileSave}
      </button>
      {props.saved ? (
        <p className="note note-ok work-status" role="status">
          <Icon name="checkCircle" size={18} />
          {t.profileSaved}
        </p>
      ) : null}
    </section>
  );
}
