import { useState } from 'react';
import type { JSX } from 'react';
import { Hint } from '../../components/Hint';
import { Icon } from '../../components/Icon';
import { deductionName, earningName } from '../../i18n/content';
import { HTML_LANG, type Lang } from '../../i18n/types';
import {
  EMPTY_MANUAL_INPUT,
  MANUAL_FIELDS,
  MANUAL_LABELS,
  type ManualError,
  type ManualField,
  type ManualInput,
} from '../../payroll/manual';
import type { DeductionKind } from '../../payroll/types';
import type { WageCalcResult } from '../calc';
import { comparePayslip, type PayslipCompare } from '../compare';
import type { WorklogStrings } from '../i18n';

const EARNING_GROUP: readonly ManualField[] = MANUAL_FIELDS.slice(0, 4);
const DEDUCTION_GROUP: readonly ManualField[] = MANUAL_FIELDS.slice(4);

const ERROR_TEXT: Readonly<Record<ManualError, (s: WorklogStrings) => string>> = {
  required: (s) => s.errRequired,
  notNumber: (s) => s.errNotNumber,
  tooLarge: (s) => s.errTooLarge,
};

const STATUS_TEXT: Readonly<Record<PayslipCompare['status'], (s: WorklogStrings) => string>> = {
  match: (s) => s.statusMatch,
  lower: (s) => s.statusLower,
  higher: (s) => s.statusHigher,
};

function signed(s: WorklogStrings, n: number): string {
  return n > 0 ? `+${s.won(n)}` : n < 0 ? `-${s.won(-n)}` : s.won(0);
}

/** 명세서 10칸 입력 → comparePayslip. 결과는 부모가 현재 계산으로 다시 만들어 result 로 넘긴다 */
export function ComparePanel(props: {
  t: WorklogStrings;
  ko: WorklogStrings;
  lang: Lang;
  calc: WageCalcResult;
  /** 이 달에 마지막으로 비교한 입력 (없으면 null) */
  submitted: ManualInput | null;
  result: PayslipCompare | null;
  onRun: (input: ManualInput) => void;
}): JSX.Element {
  const { t, ko, lang, result } = props;
  const [input, setInput] = useState<ManualInput>(props.submitted ?? EMPTY_MANUAL_INPUT);
  const [errors, setErrors] = useState<Partial<Record<ManualField, ManualError>>>({});

  const onChange = (field: ManualField, value: string): void => {
    setInput((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const onRun = (): void => {
    const res = comparePayslip(props.calc, input);
    if (!res.ok) {
      setErrors(res.errors);
      return;
    }
    setErrors({});
    props.onRun(input);
  };

  const renderField = (field: ManualField): JSX.Element => {
    const labelKo = MANUAL_LABELS[field].ko;
    const labelText = EARNING_GROUP.includes(field)
      ? earningName(labelKo, lang)
      : deductionName(field as DeductionKind, lang);
    const id = `work-compare-input-${field}`;
    const error = errors[field];
    return (
      <div key={field} className="work-money-field">
        <div className="work-money-line">
          <label htmlFor={id} className="work-money-label">
            <span lang="ko">{labelKo}</span>
            <span lang={HTML_LANG[lang]} className="work-money-sub">
              {labelText}
            </span>
          </label>
          <input
            id={id}
            data-testid={`work-compare-${field}`}
            className="input work-money-input num"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={input[field]}
            aria-invalid={error ? true : undefined}
            onChange={(e) => onChange(field, e.target.value)}
          />
        </div>
        {error ? <p className="field-error">{ERROR_TEXT[error](t)}</p> : null}
      </div>
    );
  };

  return (
    <section className="card work-card">
      <Hint text={t.compareHint}>
        <h2 className="work-heading">
          <Icon name="receipt" size={18} />
          {t.compareHeading}
        </h2>
      </Hint>
      <fieldset className="work-group">
        <legend className="work-group-title">
          {t.compareEarnings} <span lang="ko">{ko.compareEarnings}</span>
        </legend>
        {EARNING_GROUP.map(renderField)}
      </fieldset>
      <fieldset className="work-group">
        <legend className="work-group-title">
          {t.compareDeductions} <span lang="ko">{ko.compareDeductions}</span>
        </legend>
        {DEDUCTION_GROUP.map(renderField)}
      </fieldset>
      <button type="button" data-testid="work-compare-run" className="btn btn-primary btn-block" onClick={onRun}>
        {t.compareRun}
      </button>
      {result ? (
        <div
          data-testid="work-compare-result"
          data-status={result.status}
          className={`work-compare-result work-compare-${result.status}`}
          role="status"
        >
          <p className="work-compare-status">
            <Icon name={result.status === 'match' ? 'checkCircle' : 'alert'} size={18} />
            <span>
              {STATUS_TEXT[result.status](t)}
              <span lang="ko" className="work-ko">
                {STATUS_TEXT[result.status](ko)}
              </span>
            </span>
          </p>
          <dl className="work-compare-dl">
            <div>
              <dt>{t.compareExpected}</dt>
              <dd className="num">{t.won(result.expectedGross)}</dd>
            </div>
            <div>
              <dt>{t.compareReported}</dt>
              <dd className="num">{t.won(result.reportedTaxable)}</dd>
            </div>
            <div className="work-compare-diff">
              <dt>{t.compareDiff}</dt>
              <dd className="num">{signed(t, result.diff)}</dd>
            </div>
            {result.unpaidEstimate > 0 && result.status === 'lower' ? (
              <div className="work-compare-unpaid">
                <dt>{t.unpaidEstimate}</dt>
                <dd className="work-unpaid num">{t.won(result.unpaidEstimate)}</dd>
              </div>
            ) : null}
          </dl>
          {result.deductions.mismatchCount > 0 ? (
            <p className="work-hint">{t.deductionMismatch(result.deductions.mismatchCount)}</p>
          ) : null}
          {result.status !== 'match' ? (
            <a className="work-ask" href="tel:1350">
              <Icon name="phone" size={15} />
              {t.ask1350}
            </a>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
