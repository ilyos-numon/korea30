import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import { Hint } from '../components/Hint';
import { Icon } from '../components/Icon';
import { StatusNote } from '../components/StatusNote';
import { useFeatureStrings } from '../i18n/feature';
import type { FormFieldId } from '../i18n/ids';
import { PASSPORT_PACKS } from '../passport/i18n';
import {
  toArcFormValues,
  validateArcExtra,
  type ArcExtraInput,
  type ArcFormValues,
  type ArcInputError,
} from '../passport/arcMapping';
import { ARC_PDF_FILE_NAME, buildArcDoc } from '../passport/arcPdf';
import { parsePassportMrz, type PassportData } from '../passport/mrz';
import { keptEdits } from '../passport/rescan';
import { FieldsForm } from '../passport/ui/FieldsForm';
import { ScanPanel, type OcrState, type ParseNote, type ScanError } from '../passport/ui/ScanPanel';
import { downloadBlob } from '../pdf/download';
import { renderPdf } from '../pdf/renderPdf';
import { toIsoDate } from '../quest/arrival';
import { UI_PACKS } from '../ui/i18n';
import './passport.css';

// 여권 사진·여권 값은 이 컴포넌트 state 에만 둔다 (저장·전송 금지, PLAN §4.0·§7 Q5)

const EMPTY_EXTRA: ArcExtraInput = { addressKr: '', phone: '', addressHome: '', workplace: '', passportIssueDate: '' };

const EMPTY_PASSPORT: PassportData = {
  documentNumber: '',
  surname: '',
  givenNames: '',
  nationality: '',
  issuingState: '',
  birthDate: '',
  expiryDate: '',
  sex: 'X',
};

/** 추가 입력 칸이 채우는 신청서 칸 (추가 입력을 고치면 그 칸의 직접 수정을 버린다) */
const EXTRA_TO_FIELD: Readonly<Record<keyof ArcExtraInput, FormFieldId>> = {
  addressKr: 'address-kr',
  phone: 'phone',
  addressHome: 'address-home',
  workplace: 'workplace',
  passportIssueDate: 'passport-dates',
};

type Overrides = Partial<Record<FormFieldId, string>>;

interface ParseState {
  passport: Partial<PassportData> | null;
  error: ScanError | null;
  note: ParseNote;
}

function runParse(text: string, today: string): ParseState {
  if (text.trim() === '') return { passport: null, error: 'empty', note: null };
  const res = parsePassportMrz(text, today);
  if (res.ok) return { passport: res.data, error: null, note: res.corrected ? 'corrected' : 'parsed' };
  // 검증 숫자가 틀려도 읽은 값은 칸에 채워 사용자가 고칠 수 있게 한다
  const partial = Object.keys(res.partial).length > 0 ? res.partial : null;
  return { passport: partial, error: res.error, note: null };
}

function baseValues(p: Partial<PassportData> | null, x: ArcExtraInput): ArcFormValues {
  const v = toArcFormValues({ ...EMPTY_PASSPORT, ...(p ?? {}) }, x);
  const noDates = x.passportIssueDate.trim() === '' && !p?.expiryDate;
  return {
    ...v,
    sex: p?.sex ? v.sex : '',
    'passport-dates': noDates ? '' : v['passport-dates'],
  };
}

export interface PassportScreenProps {
  /** 오늘 (테스트용). 기본 new Date() */
  now?: Date;
  /** 처음 입력란에 넣고 바로 읽을 두 줄 (테스트용) */
  initialMrz?: string;
}

export function PassportScreen(props: PassportScreenProps): JSX.Element {
  const { t, ko } = useFeatureStrings(PASSPORT_PACKS);
  const { t: kit, ko: kitKo } = useFeatureStrings(UI_PACKS);
  const today = toIsoDate(props.now ?? new Date());
  const [mrzText, setMrzText] = useState(props.initialMrz ?? '');
  const [parsed, setParsed] = useState<ParseState>(() =>
    props.initialMrz !== undefined ? runParse(props.initialMrz, today) : { passport: null, error: null, note: null },
  );
  const [ocr, setOcr] = useState<OcrState>({ kind: 'idle' });
  const [extra, setExtra] = useState<ArcExtraInput>(EMPTY_EXTRA);
  const [overrides, setOverrides] = useState<Overrides>({});
  const [extraErrors, setExtraErrors] = useState<ArcInputError>({});
  const [checked, setChecked] = useState(false);
  const [pdf, setPdf] = useState<'idle' | 'making' | 'error'>('idle');
  /** 재판독 때 남긴 직접 수정 칸 수 (0 이면 안내 없음) */
  const [kept, setKept] = useState(0);
  const scanId = useRef(0);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const values: ArcFormValues = { ...baseValues(parsed.passport, extra), ...overrides };
  // OCR 완료 콜백은 이전 렌더의 클로저에서 불리므로 최신 값을 ref 로 읽는다
  const latest = useRef({ overrides, extra });
  latest.current = { overrides, extra };

  // 다시 판독해도 사용자가 고친 칸은 남긴다 (PLAN §4.5)
  const applyText = (text: string): void => {
    const next = runParse(text, today);
    setParsed(next);
    const { overrides: o, extra: x } = latest.current;
    setKept(keptEdits(o, baseValues(next.passport, x)).length);
  };

  const onUseScanned = (): void => {
    setOverrides({});
    setKept(0);
    setPdf('idle');
  };

  const onPhoto = (file: File): void => {
    const id = scanId.current + 1;
    scanId.current = id;
    const current = (): boolean => alive.current && scanId.current === id;
    setOcr({ kind: 'reading', ratio: 0 });
    setParsed((s) => ({ ...s, error: null, note: null }));
    // OCR 엔진(tesseract.js)은 사진을 고를 때만 내려받는다
    import('../passport/ocr')
      .then(({ recognizeMrz }) =>
        recognizeMrz(file, (ratio) => {
          if (current()) setOcr({ kind: 'reading', ratio });
        }),
      )
      .then((text) => {
        if (!current()) return;
        setOcr({ kind: 'done' });
        setMrzText(text);
        applyText(text);
      })
      .catch(() => {
        if (!current()) return;
        setOcr({ kind: 'failed' });
        setParsed((s) => ({ ...s, error: 'ocr', note: null }));
      });
  };

  const onExtra = (key: keyof ArcExtraInput, value: string): void => {
    const next = { ...extra, [key]: value };
    setExtra(next);
    setOverrides((o) => {
      const { [EXTRA_TO_FIELD[key]]: _dropped, ...rest } = o;
      return rest;
    });
    if (checked) setExtraErrors(validateArcExtra(next));
    setPdf('idle');
  };

  const onField = (id: FormFieldId, value: string): void => {
    setOverrides((o) => ({ ...o, [id]: value }));
    setPdf('idle');
  };

  const onPdf = (): void => {
    const errs = validateArcExtra(extra);
    setChecked(true);
    setExtraErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setPdf('making');
    renderPdf(buildArcDoc(values, today))
      .then((blob) => {
        downloadBlob(blob, ARC_PDF_FILE_NAME);
        if (alive.current) setPdf('idle');
      })
      .catch(() => {
        if (alive.current) setPdf('error');
      });
  };

  return (
    <main data-testid="screen-passport" className="screen passport">
      <header className="screen-head">
        <Hint text={t.intro}>
          <h1 className="screen-title">{t.title}</h1>
        </Hint>
      </header>

      <section data-testid="passport-privacy" className="note note-ok passport-privacy">
        <Icon name="guardCheck" size={20} />
        <Hint
          text={
            <>
              {t.privacyBody}
              <br />
              <span lang="ko">{ko.privacyBody}</span>
            </>
          }
        >
          <h2 className="passport-privacy-title">{t.privacyTitle}</h2>
        </Hint>
      </section>

      <ScanPanel
        t={t}
        ko={ko}
        mrzText={mrzText}
        ocr={ocr}
        error={parsed.error}
        note={parsed.note}
        onMrzText={setMrzText}
        onPhoto={onPhoto}
        onParse={() => applyText(mrzText)}
      />

      {kept > 0 ? (
        <StatusNote
          tone="warn"
          testId="passport-kept-note"
          role="status"
          data={{ count: String(kept) }}
          text={kit.keptEdits(kept)}
          ko={kitKo.keptEdits(kept)}
          action={{ label: kit.useScanned, testId: 'passport-use-scanned', onClick: onUseScanned }}
        />
      ) : null}

      <FieldsForm
        t={t}
        ko={ko}
        values={values}
        extra={extra}
        extraErrors={extraErrors}
        onField={onField}
        onExtra={onExtra}
      />

      <section className="passport-output">
        <button
          type="button"
          data-testid="passport-pdf"
          className="btn btn-primary btn-lg btn-block"
          disabled={pdf === 'making'}
          onClick={onPdf}
        >
          <Icon name={pdf === 'making' ? 'refresh' : 'download'} size={20} className={pdf === 'making' ? 'spin' : undefined} />
          {pdf === 'making' ? t.pdfMaking : t.pdf}
        </button>
        {pdf === 'error' ? (
          <p data-testid="passport-pdf-error" className="field-error" role="alert">
            {t.pdfError}
          </p>
        ) : null}
        <p className="passport-note">
          <Icon name="info" size={14} />
          <span>
            {t.officialNotice}
            <span lang="ko" className="passport-ko">
              {ko.officialNotice}
            </span>
          </span>
        </p>
        <a className="passport-ask" href="tel:1345">
          <Icon name="phone" size={14} />
          {t.ask1345}
        </a>
      </section>
    </main>
  );
}
