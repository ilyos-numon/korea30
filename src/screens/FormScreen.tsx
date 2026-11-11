import { useRef, useState } from 'react';
import type { JSX } from 'react';
import { ARC_FORM_FIELDS, ARC_FORM_TITLE, CIRCLED } from '../forms/arcForm';
import { Hint } from '../components/Hint';
import { Icon } from '../components/Icon';
import { plain } from '../components/text';
import { formFieldView } from '../i18n/content';
import { useLang } from '../i18n/LangContext';
import { QUESTS } from '../quest/quests';
import {
  type ProgressStorage,
  completeDay,
  currentDay,
  loadCompleted,
  saveCompleted,
} from '../quest/progress';
import './form.css';

const TOTAL_FIELDS = ARC_FORM_FIELDS.length;
const FORM_QUEST_DAY = 3;

function clampNo(no: number): number {
  if (!Number.isInteger(no)) return 1;
  return Math.min(Math.max(no, 1), TOTAL_FIELDS);
}

export function FormScreen(props: { storage?: ProgressStorage; initialNo?: number }): JSX.Element {
  const { lang, ui } = useLang();
  const storage = props.storage ?? globalThis.localStorage;
  const [no, setNo] = useState<number>(() => clampNo(props.initialNo ?? 1));
  const [submitted, setSubmitted] = useState(false);
  const [questDone, setQuestDone] = useState(false);
  const guideRef = useRef<HTMLElement>(null);

  const views = ARC_FORM_FIELDS.map((f) => formFieldView(f, lang));
  const field = views[no - 1];

  const pickField = (n: number): void => {
    setNo(clampNo(n));
    const el = guideRef.current;
    if (el && typeof el.scrollIntoView === 'function') el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const onSubmitted = (): void => {
    const total = QUESTS.length;
    const completed = loadCompleted(storage, total);
    if (currentDay(completed, total) === FORM_QUEST_DAY) {
      saveCompleted(storage, completeDay(completed, FORM_QUEST_DAY, total));
      setQuestDone(true);
    }
    setSubmitted(true);
  };

  return (
    <main data-testid="screen-form" className="screen form">
      <header className="screen-head">
        <div>
          <h1 className="screen-title">{ui.formTitle}</h1>
          <p lang="ko" className="screen-sub">
            외국인등록 신청서
          </p>
        </div>
        <span className="badge badge-warn">{`${plain(ui.formSampleBadge)} · 샘플`}</span>
      </header>

      <div data-testid="form-sample-note" className="note note-warn form-sample-note">
        <Icon name="info" size={18} />
        <Hint
          kind="ko"
          text="가상 샘플 양식이에요. 실제 신청서는 사무소에서 받은 종이를 기준으로 하세요. 칸 위치가 다를 수 있어요."
        >
          <p className="form-sample-text">{ui.formSampleNote}</p>
        </Hint>
      </div>

      <div data-testid="form-sheet" className="form-sheet">
        <p className="form-sheet-title" lang="ko">
          {ARC_FORM_TITLE.ko}
        </p>
        <div className="form-grid">
          {views.map((f) => (
            <button
              key={f.no}
              type="button"
              data-testid={`form-field-${f.no}`}
              className={`form-cell${f.span === 2 ? ' form-cell-wide' : ''}`}
              aria-pressed={f.no === no}
              aria-label={`${CIRCLED[f.no - 1]} ${f.label}`}
              onClick={() => pickField(f.no)}
            >
              <span className="form-cell-no">{f.no}</span>
              <span className="form-cell-label" lang="ko">
                {f.labelKo}
              </span>
            </button>
          ))}
        </div>
      </div>

      <section ref={guideRef} data-testid="form-guide" className="card form-guide" aria-live="polite">
        <div key={no} className="form-guide-body">
          <div className="form-guide-head">
            <span data-testid="form-guide-no" className="form-guide-no">
              {CIRCLED[no - 1]}
            </span>
            <h2 data-testid="form-guide-label" className="form-guide-label">
              <span lang="ko">{field.labelKo}</span>
              <span className="form-guide-label-t">{field.label}</span>
            </h2>
          </div>
          <div data-testid="form-guide-text" className="form-guide-text">
            <Hint kind="ko" text={field.guideKo}>
              <p>{field.guide}</p>
            </Hint>
          </div>
          <p data-testid="form-guide-example" className="form-guide-example">
            <span className="form-example-label">{`${plain(ui.formExample)} · 예`}</span>
            <span className="form-example-value">{field.example}</span>
          </p>
          {field.askOfficer ? (
            <p data-testid="form-ask-officer" className="note note-primary form-ask-officer">
              <Icon name="user" size={18} />
              <span>
                {plain(ui.askOfficer)}
                <span lang="ko" className="form-ko">
                  담당 공무원에게 물어보세요
                </span>
              </span>
            </p>
          ) : null}
        </div>
        <div className="form-nav">
          <button
            type="button"
            data-testid="form-prev"
            className="icon-btn"
            aria-label={ui.formPrevAria}
            disabled={no <= 1}
            onClick={() => setNo(clampNo(no - 1))}
          >
            <Icon name="chevronLeft" size={20} />
          </button>
          <span className="form-nav-pos num">{`${no} / ${TOTAL_FIELDS}`}</span>
          <button
            type="button"
            data-testid="form-next"
            className="icon-btn"
            aria-label={ui.formNextAria}
            disabled={no >= TOTAL_FIELDS}
            onClick={() => setNo(clampNo(no + 1))}
          >
            <Icon name="chevronRight" size={20} />
          </button>
        </div>
      </section>

      <button type="button" data-testid="form-submitted" className="btn btn-primary btn-lg btn-block form-submitted" onClick={onSubmitted}>
        <Icon name="check" size={20} strokeWidth={2.4} />
        {plain(ui.formSubmit)}
      </button>

      {submitted ? (
        <section data-testid="form-submitted-msg" className="note note-ok form-submitted-msg" role="status">
          <Icon name="checkCircle" size={20} />
          <div>
            <p>{ui.formSubmittedMsg}</p>
            <p lang="ko" className="form-ko">
              제출 수고했어요! 등록증은 보통 3~4주 뒤에 나와요. 체류·비자 판단은 담당 공무원에게 물어보세요.
            </p>
            {questDone ? (
              <p data-testid="form-quest-done" className="badge badge-ok form-quest-done">
                <Icon name="check" size={14} strokeWidth={2.6} />
                {`${plain(ui.formQuestDone(FORM_QUEST_DAY))} · ${FORM_QUEST_DAY}일 차 완료`}
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      <a data-testid="form-back-quest" className="link-btn form-back-quest" href="#/">
        <Icon name="chevronLeft" size={16} />
        {plain(ui.formBackQuest)}
      </a>
    </main>
  );
}
