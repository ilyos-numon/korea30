import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import { checkPayslip } from '../payroll/check';
import { RATES_2026 } from '../payroll/rates2026';
import { SAMPLE_A, SAMPLE_B } from '../payroll/samples';
import type { ManualResult } from '../payroll/manual';
import type { CheckLine, Payslip } from '../payroll/types';
import { toIsoDate } from '../quest/arrival';
import { Hint } from '../components/Hint';
import { Icon } from '../components/Icon';
import { StatusNote } from '../components/StatusNote';
import { copyText } from '../components/clipboard';
import { plain, vars } from '../components/text';
import { useLang } from '../i18n/LangContext';
import { useFeatureStrings } from '../i18n/feature';
import { deductionName, earningName } from '../i18n/content';
import { HTML_LANG, type UiStrings } from '../i18n/types';
import { UI_PACKS, type UiKitStrings } from '../ui/i18n';
import { ManualPayslipForm } from './ManualPayslipForm';
import './payslip.css';

type SampleId = 'sample-a' | 'sample-b';
type Mode = SampleId | 'manual';

const SAMPLES: Record<SampleId, Payslip> = { 'sample-a': SAMPLE_A, 'sample-b': SAMPLE_B };

function won(n: number): string {
  return n.toLocaleString('ko-KR');
}

function monthKo(yearMonth: string): string {
  const [y, m] = yearMonth.split('-');
  return `${y}년 ${Number(m)}월`;
}

function LineStatus(props: { line: CheckLine; ui: UiStrings; kit: UiKitStrings; htmlLang: string }): JSX.Element {
  const { line, ui, kit, htmlLang } = props;
  if (line.status === 'match') {
    return (
      <span className="payslip-status payslip-status-match">
        <Icon name="check" size={14} strokeWidth={2.6} />
        <span lang={htmlLang}>{kit.payslipMatch}</span>
      </span>
    );
  }
  if (line.status === 'skipped') {
    return (
      <span className="payslip-status payslip-status-skipped" lang={htmlLang}>
        {kit.payslipSkipped}
      </span>
    );
  }
  return (
    <span className="payslip-status payslip-status-mismatch">
      <span className="payslip-calc">
        <Icon name="alert" size={14} strokeWidth={2.2} />
        {`계산 ${won(line.expected ?? 0)}`}
      </span>
      <span lang={htmlLang}>{ui.payslipDiff}</span>
    </span>
  );
}

function PayslipResult(props: { payslip: Payslip; title: string }): JSX.Element {
  const { payslip } = props;
  const { lang, ui } = useLang();
  const { t: kit, ko: kitKo } = useFeatureStrings(UI_PACKS);
  const htmlLang = HTML_LANG[lang];
  const result = checkPayslip(payslip, RATES_2026);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const onCopy = async (): Promise<void> => {
    if (!result.askKo) return;
    setCopyError(false);
    const ok = await copyText(result.askKo);
    if (!ok) {
      setCopied(false);
      setCopyError(true);
      return;
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };

  const mismatch = result.mismatchCount > 0;

  return (
    <>
      <section className="card payslip-card">
        <div className="payslip-head">
          <h2 className="payslip-heading" lang="ko">
            {props.title}
          </h2>
          <span data-testid="payslip-month" className="badge">
            {monthKo(payslip.yearMonth)}
          </span>
        </div>

        <ul className="payslip-list">
          {payslip.earnings.map((e, i) => (
            <li key={e.nameKo} data-testid="earning-row" className="payslip-row" style={vars({ '--i': i })}>
              <span className="payslip-name">
                <span lang="ko">{e.nameKo}</span>
                <span lang={htmlLang} className="payslip-vi">
                  {earningName(e.nameKo, lang)}
                </span>
              </span>
              <span className="payslip-amount num">{won(e.amount)}</span>
            </li>
          ))}
        </ul>
        <p data-testid="payslip-base" className="payslip-base">
          <span>
            <span lang="ko">과세 합계</span>
            <span className="payslip-vi">{ui.payslipTaxableTotal}</span>
          </span>
          <span className="payslip-amount num">{won(result.taxableBase)}</span>
        </p>

        <ul className="payslip-list payslip-deductions">
          {result.lines.map((line, i) => (
            <li
              key={line.kind}
              data-testid={`check-line-${line.kind}`}
              data-status={line.status}
              className={`payslip-row payslip-check payslip-check-${line.status}`}
              style={vars({ '--i': i + 3 })}
            >
              <span className="payslip-name">
                <span lang="ko">{line.labelKo}</span>
                <span lang={htmlLang} className="payslip-vi">
                  {deductionName(line.kind, lang)}
                </span>
              </span>
              <span className="payslip-amount">
                <span className="num">{won(line.reported)}</span>
                <LineStatus line={line} ui={ui} kit={kit} htmlLang={htmlLang} />
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div data-testid="payslip-summary" className={`note ${mismatch ? 'note-warn' : 'note-ok'} payslip-summary`} role="status">
        <Icon name={mismatch ? 'alert' : 'checkCircle'} size={20} />
        <div>
          <p className="payslip-summary-main" lang={htmlLang}>
            {mismatch ? kit.payslipSummaryMismatch(result.mismatchCount) : kit.payslipSummaryOk}
          </p>
          <p lang="ko" className="payslip-summary-ko">
            {mismatch
              ? `⚠ ${result.mismatchCount}개 항목이 계산과 다릅니다. 확인해 보세요.`
              : '✓ 확인한 공제 항목이 계산과 같습니다.'}
          </p>
        </div>
      </div>

      {result.askKo ? (
        <section className="card payslip-ask-box">
          <p className="eyebrow">
            <Icon name="message" size={15} />
            {`${ui.payslipAskLabel} · 회사에 물어볼 때`}
          </p>
          <p data-testid="payslip-ask" lang="ko" className="payslip-ask">
            {result.askKo}
          </p>
          <button
            type="button"
            data-testid="payslip-copy"
            className={copied ? 'btn btn-sm btn-soft payslip-copy is-copied' : 'btn btn-sm btn-line payslip-copy'}
            onClick={() => void onCopy()}
          >
            <Icon name={copied ? 'check' : 'copy'} size={16} />
            {copied ? kit.copied : kit.copy}
          </button>
          {copyError ? (
            <StatusNote tone="danger" testId="payslip-copy-error" role="alert" text={kit.copyFailed} ko={kitKo.copyFailed} />
          ) : null}
        </section>
      ) : null}
    </>
  );
}

export function PayslipScreen(props: { initial?: Mode; now?: Date }): JSX.Element {
  const { lang, ui } = useLang();
  const [mode, setMode] = useState<Mode>(props.initial ?? 'sample-a');
  const [manualResult, setManualResult] = useState<ManualResult | null>(null);
  const yearMonth = toIsoDate(props.now ?? new Date()).slice(0, 7);
  const labels: Record<Mode, JSX.Element> = {
    'sample-a': <>{ui.payslipSampleA}</>,
    'sample-b': <>{ui.payslipSampleB}</>,
    manual: (
      <>
        <Icon name="edit" size={15} />
        {plain(ui.payslipManual)}
      </>
    ),
  };

  const onSelect = (next: Mode): void => {
    setMode(next);
    setManualResult(null);
  };

  return (
    <main data-testid="screen-payslip" className="screen payslip">
      <header className="screen-head">
        <h1 className="screen-title">{ui.payslipTitle}</h1>
      </header>

      <div className="segmented payslip-samples" role="group" aria-label={ui.payslipTitle}>
        {(['sample-a', 'sample-b', 'manual'] as const).map((id) => (
          <button
            key={id}
            type="button"
            data-testid={`payslip-${id}`}
            aria-pressed={mode === id}
            className="chip"
            onClick={() => onSelect(id)}
          >
            {labels[id]}
          </button>
        ))}
      </div>

      {mode === 'manual' ? (
        <>
          <ManualPayslipForm key="manual" yearMonth={yearMonth} onResult={setManualResult} />
          {manualResult?.ok ? <PayslipResult payslip={manualResult.payslip} title="내 명세서 (직접 입력)" /> : null}
        </>
      ) : (
        <PayslipResult key={mode} payslip={SAMPLES[mode]} title="급여명세서" />
      )}

      <div data-testid="payslip-disclaimer" className="payslip-disclaimer">
        <Icon name="info" size={16} />
        <Hint kind="ko" text="이 결과는 안내이며 법적 판단이 아닙니다. 2026년 공개 요율 기준.">
          <p lang={HTML_LANG[lang]}>{ui.payslipDisclaimer}</p>
        </Hint>
      </div>
    </main>
  );
}
