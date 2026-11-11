import type { JSX } from 'react';
import { Hint } from '../../components/Hint';
import { ARC_FORM_FIELDS } from '../../forms/arcForm';
import type { FormFieldId } from '../../i18n/ids';
import type { ArcExtraInput, ArcFormValues, ArcInputError } from '../arcMapping';
import type { PassportStrings } from '../i18n';

type ExtraKey = keyof ArcExtraInput;
type ExtraErr = NonNullable<ArcInputError[ExtraKey]>;

const EXTRA_INPUTS: readonly { key: ExtraKey; type: 'text' | 'tel' | 'date'; label: (s: PassportStrings) => string }[] = [
  { key: 'passportIssueDate', type: 'date', label: (s) => s.extraPassportIssueDate },
  { key: 'addressKr', type: 'text', label: (s) => s.extraAddressKr },
  { key: 'phone', type: 'tel', label: (s) => s.extraPhone },
  { key: 'addressHome', type: 'text', label: (s) => s.extraAddressHome },
  { key: 'workplace', type: 'text', label: (s) => s.extraWorkplace },
];

const REQUIRED: ReadonlySet<ExtraKey> = new Set<ExtraKey>(['addressKr', 'phone', 'passportIssueDate']);

const ERROR_TEXT: Readonly<Record<ExtraErr, (s: PassportStrings) => string>> = {
  required: (s) => s.errRequired,
  badDate: (s) => s.errBadDate,
  badPhone: (s) => s.errBadPhone,
};

export interface FieldsFormProps {
  t: PassportStrings;
  ko: PassportStrings;
  values: ArcFormValues;
  extra: ArcExtraInput;
  extraErrors: ArcInputError;
  onField: (id: FormFieldId, value: string) => void;
  onExtra: (key: ExtraKey, value: string) => void;
}

export function FieldsForm(props: FieldsFormProps): JSX.Element {
  const { t, values, extra, extraErrors } = props;
  return (
    <>
      <section className="card passport-step passport-extra">
        <h2 className="passport-heading">
          <span className="passport-step-no">2</span>
          {t.extraHeading}
        </h2>
        {EXTRA_INPUTS.map((f) => {
          const err = extraErrors[f.key];
          return (
            <label key={f.key} className="field">
              <span className="field-label">
                {f.label(t)}
                {REQUIRED.has(f.key) ? <span className="passport-req"> *</span> : null}
              </span>
              <input
                type={f.type}
                data-testid={`passport-extra-${f.key}`}
                className="input"
                autoComplete="off"
                aria-invalid={err ? true : undefined}
                value={extra[f.key]}
                onChange={(e) => props.onExtra(f.key, e.target.value)}
              />
              {err ? (
                <span data-testid={`passport-extra-error-${f.key}`} className="field-error" role="alert">
                  {ERROR_TEXT[err](t)}
                </span>
              ) : null}
            </label>
          );
        })}
      </section>

      <section className="card passport-step passport-fields">
        <Hint text={t.fieldsHint}>
          <h2 className="passport-heading">
            <span className="passport-step-no">3</span>
            {t.fieldsHeading}
          </h2>
        </Hint>
        <div className="passport-grid">
          {ARC_FORM_FIELDS.map((f) => {
            const id = f.id as FormFieldId;
            const filled = values[id].trim() !== '';
            return (
              <label key={id} className={`passport-cell${f.span === 2 ? ' passport-cell-wide' : ''}${filled ? ' is-filled' : ''}`}>
                <span className="passport-cell-label">
                  <span className="passport-cell-no">{f.no}</span>
                  <span className="passport-cell-text">
                    {t.fieldLabel(id)}
                    <span lang="ko" className="passport-cell-ko">
                      {f.labelKo}
                    </span>
                  </span>
                </span>
                <input
                  type="text"
                  data-testid={`passport-field-${id}`}
                  className="input"
                  autoComplete="off"
                  value={values[id]}
                  onChange={(e) => props.onField(id, e.target.value)}
                />
              </label>
            );
          })}
        </div>
      </section>
    </>
  );
}
