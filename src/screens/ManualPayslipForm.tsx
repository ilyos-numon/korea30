import { useState } from 'react';
import type { FormEvent, JSX } from 'react';
import {
  EMPTY_MANUAL_INPUT,
  MANUAL_FIELDS,
  MANUAL_LABELS,
  buildManualPayslip,
  type ManualError,
  type ManualField,
  type ManualInput,
  type ManualResult,
} from '../payroll/manual';
import type { DeductionKind } from '../payroll/types';
import { Hint } from '../components/Hint';
import { Icon } from '../components/Icon';
import { plain } from '../components/text';
import { useLang } from '../i18n/LangContext';
import { deductionName, earningName } from '../i18n/content';
import { HTML_LANG, type UiStrings } from '../i18n/types';

const EARNING_GROUP: readonly ManualField[] = MANUAL_FIELDS.slice(0, 4);
const DEDUCTION_GROUP: readonly ManualField[] = MANUAL_FIELDS.slice(4);

function errorText(ui: UiStrings): Record<ManualError, string> {
  return {
    required: ui.manualError.required,
    notNumber: ui.manualError.notNumber,
    tooLarge: ui.manualError.tooLarge,
  };
}

export function ManualPayslipForm(props: {
  yearMonth: string;
  onResult: (r: ManualResult | null) => void;
}): JSX.Element {
  const { lang, ui } = useLang();
  const ERROR_TEXT = errorText(ui);
  // 입력값은 이 컴포넌트의 state 에만 둔다. 저장·전송하지 않는다.
  const [input, setInput] = useState<ManualInput>(EMPTY_MANUAL_INPUT);
  const [errors, setErrors] = useState<Partial<Record<ManualField, ManualError>>>({});

  const onChange = (field: ManualField, value: string): void => {
    setInput((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    props.onResult(null);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const result = buildManualPayslip(input, props.yearMonth);
    setErrors(result.ok ? {} : result.errors);
    props.onResult(result);
  };

  const renderField = (field: ManualField): JSX.Element => {
    const label = MANUAL_LABELS[field];
    const labelText = EARNING_GROUP.includes(field)
      ? earningName(label.ko, lang)
      : deductionName(field as DeductionKind, lang);
    const id = `manual-input-${field}`;
    const error = errors[field];
    const labelEl = (
      <label htmlFor={id} className="manual-label">
        <span lang="ko">{label.ko}</span>
        <span lang={HTML_LANG[lang]} className="payslip-vi">
          {labelText}
        </span>
      </label>
    );
    return (
      <div key={field} className="manual-field">
        <div className="manual-line">
          {field === 'longTermCare' ? (
            <Hint text={`${ui.manualLtcHint} · 명세서에 따로 없으면 0을 입력하세요.`}>{labelEl}</Hint>
          ) : (
            labelEl
          )}
          <input
            id={id}
            data-testid={`manual-${field}`}
            className="input manual-input num"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={input[field]}
            aria-invalid={error ? true : undefined}
            onChange={(e) => onChange(field, e.target.value)}
          />
        </div>
        {error ? (
          <p data-testid={`manual-error-${field}`} className="field-error">
            {ERROR_TEXT[error]}
          </p>
        ) : null}
      </div>
    );
  };

  return (
    <form data-testid="manual-form" className="card manual-form" noValidate onSubmit={onSubmit}>
      <p data-testid="manual-privacy" className="manual-privacy">
        <Icon name="lock" size={15} />
        <span>{plain(ui.manualPrivacy)}</span>
      </p>

      <fieldset className="manual-group">
        <legend className="manual-group-title">
          {`${ui.manualEarnings} `}
          <span lang="ko">지급</span>
        </legend>
        {EARNING_GROUP.map(renderField)}
      </fieldset>

      <fieldset className="manual-group">
        <legend className="manual-group-title">
          {`${ui.manualDeductions} `}
          <span lang="ko">공제</span>
        </legend>
        {DEDUCTION_GROUP.map(renderField)}
      </fieldset>

      <button type="submit" data-testid="manual-check" className="btn btn-primary btn-lg btn-block">
        {plain(ui.manualCheck)}
      </button>
    </form>
  );
}
