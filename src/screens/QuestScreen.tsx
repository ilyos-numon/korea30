import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import { QUESTS } from '../quest/quests';
import {
  type ProgressStorage,
  clearProgress,
  completeDay,
  currentDay,
  dayState,
  loadCompleted,
  saveCompleted,
} from '../quest/progress';
import {
  type ArrivalError,
  dPlus,
  loadArrival,
  saveArrival,
  toIsoDate,
  validateArrival,
} from '../quest/arrival';
import { type StayRepoLike, fillEntryFromArrival } from '../deadline/arrivalSync';
import { classifyStorageError, type StorageFailure } from '../storage/failure';
import { ROUTE_HASH } from '../routes';
import { StatusNote } from '../components/StatusNote';
import { SpeakButton } from '../components/SpeakButton';
import { BigCard } from '../components/BigCard';
import { Hint } from '../components/Hint';
import { Icon, questIcon } from '../components/Icon';
import { animate } from '../components/motion';
import { plain, vars } from '../components/text';
import { useLang } from '../i18n/LangContext';
import { useFeatureStrings } from '../i18n/feature';
import { questView } from '../i18n/content';
import { UI_PACKS } from '../ui/i18n';
import './quest.css';

const TOTAL = QUESTS.length;

const ARRIVAL_ERROR_KO: Record<ArrivalError, string> = {
  invalid: '날짜를 다시 확인해 주세요',
  future: '미래 날짜는 넣을 수 없어요',
};

/** localStorage 쓰기를 시도하고 실패하면 종류를 돌려준다 (성공 null). 실패해도 화면은 메모리 상태로 진행한다. */
export function tryStorageWrite(write: () => void): StorageFailure | null {
  try {
    write();
    return null;
  } catch (err) {
    return classifyStorageError(err);
  }
}

/** 도착일 저장. 저장에 성공했을 때만 비어 있는 체류 입국일을 채운다 (synced: 'filled' 일 때 true). */
export function saveArrivalWithSync(
  storage: ProgressStorage,
  iso: string,
  todayIso: string,
  stayRepo?: StayRepoLike,
): { error: StorageFailure | null; synced: Promise<boolean> } {
  const error = tryStorageWrite(() => saveArrival(storage, iso));
  if (error) return { error, synced: Promise.resolve(false) };
  return { error, synced: fillEntryFromArrival(iso, todayIso, stayRepo).then((r) => r === 'filled') };
}

export function QuestScreen(props: { storage?: ProgressStorage; now?: Date; stayRepo?: StayRepoLike }): JSX.Element {
  const { lang, ui } = useLang();
  const { t: kit, ko: kitKo } = useFeatureStrings(UI_PACKS);
  const storage = props.storage ?? globalThis.localStorage;
  const todayIso = toIsoDate(props.now ?? new Date());
  const [completed, setCompleted] = useState<number[]>(() => loadCompleted(storage, TOTAL));
  const [hintVisible, setHintVisible] = useState(false);
  const [arrival, setArrival] = useState<string | null>(() => loadArrival(storage));
  const [arrivalOpen, setArrivalOpen] = useState(false);
  const [arrivalDraft, setArrivalDraft] = useState('');
  const [arrivalError, setArrivalError] = useState<ArrivalError | null>(null);
  const [bigOpen, setBigOpen] = useState(false);
  const [storageError, setStorageError] = useState<StorageFailure | null>(null);
  const [arrivalSynced, setArrivalSynced] = useState(false);

  const dotsRef = useRef<HTMLDivElement>(null);
  const prevDone = useRef(completed.length);
  useEffect(() => {
    // 완료하면 방금 채워진 진행 점이 한 번 튀어 오른다
    if (completed.length > prevDone.current) {
      const el = dotsRef.current?.querySelector(`[data-testid="quest-dot-${completed.length}"]`);
      animate(el, [{ transform: 'scaleY(1)' }, { transform: 'scaleY(2.4)' }, { transform: 'scaleY(1)' }], {
        duration: 560,
        easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      });
    }
    prevDone.current = completed.length;
  }, [completed.length]);

  const today = currentDay(completed, TOTAL);
  const progressDay = today ?? TOTAL;
  const questDay = today === null ? undefined : QUESTS.find((q) => q.day === today);
  const quest = questDay ? questView(questDay, lang) : undefined;

  const onComplete = (): void => {
    if (today === null) return;
    const next = completeDay(completed, today, TOTAL);
    setStorageError(tryStorageWrite(() => saveCompleted(storage, next)));
    setCompleted(next);
    setHintVisible(false);
    setBigOpen(false);
  };

  const onReset = (): void => {
    setStorageError(tryStorageWrite(() => clearProgress(storage)));
    setCompleted([]);
    setHintVisible(false);
    setBigOpen(false);
  };

  const onArrivalToggle = (): void => {
    if (!arrivalOpen) setArrivalDraft(arrival ?? '');
    setArrivalError(null);
    setArrivalOpen(!arrivalOpen);
  };

  const onArrivalSave = (): void => {
    const err = validateArrival(arrivalDraft, todayIso);
    if (err) {
      setArrivalError(err);
      return;
    }
    const saved = saveArrivalWithSync(storage, arrivalDraft, todayIso, props.stayRepo);
    setStorageError(saved.error);
    setArrival(arrivalDraft);
    setArrivalError(null);
    setArrivalOpen(false);
    setArrivalSynced(false);
    void saved.synced.then(setArrivalSynced);
  };

  return (
    <main data-testid="screen-quest" className="screen quest">
      <section className="quest-hero">
        <div className="quest-hero-top">
          <h1 className="screen-title">{ui.questTitle}</h1>
          <p data-testid="quest-progress" className="quest-progress">{ui.questProgress(progressDay, TOTAL)}</p>
        </div>
        <div
          ref={dotsRef}
          data-testid="quest-dots"
          className="dots quest-dots"
          role="img"
          aria-label={ui.questDotsAria(completed.length, TOTAL)}
        >
          {QUESTS.map((q) => (
            <span
              key={q.day}
              data-testid={`quest-dot-${q.day}`}
              className="dot"
              data-state={dayState(q.day, completed, TOTAL)}
            />
          ))}
        </div>
        <div className="quest-arrival">
          {arrival ? (
            <p className="quest-dplus-row">
              <span data-testid="quest-dplus" className="quest-dplus num">{`D+${dPlus(arrival, todayIso)}`}</span>
              <span className="quest-dplus-note">{ui.questDplusNote}</span>
            </p>
          ) : null}
          <button
            type="button"
            data-testid="quest-arrival-open"
            className="link-btn quest-arrival-open"
            aria-expanded={arrivalOpen}
            onClick={onArrivalToggle}
          >
            <Icon name="calendar" size={16} />
            {plain(arrival ? ui.questArrivalEdit : ui.questArrivalOpen)}
          </button>
        </div>
        {arrivalOpen ? (
          <div className="quest-arrival-form">
            <input
              type="date"
              data-testid="quest-arrival-input"
              className="input"
              max={todayIso}
              value={arrivalDraft}
              aria-label={ui.questArrivalAria}
              onChange={(e) => setArrivalDraft(e.target.value)}
            />
            <button type="button" data-testid="quest-arrival-save" className="btn btn-primary" onClick={onArrivalSave}>
              {plain(ui.save)}
            </button>
            {arrivalError ? (
              <p data-testid="quest-arrival-error" className="field-error" role="alert">
                {`${ui.arrivalError[arrivalError]} · ${ARRIVAL_ERROR_KO[arrivalError]}`}
              </p>
            ) : null}
          </div>
        ) : null}
        {arrivalSynced ? (
          <StatusNote
            tone="ok"
            testId="quest-arrival-synced"
            text={kit.arrivalFilledEntry}
            ko={kitKo.arrivalFilledEntry}
          />
        ) : null}
      </section>

      {storageError ? (
        <StatusNote
          tone="danger"
          testId="quest-storage-error"
          role="alert"
          data={{ code: storageError }}
          text={`${storageError === 'quota' ? kit.storageFull : kit.storageFailed} ${kit.questNotSaved}`}
          ko={`${storageError === 'quota' ? kitKo.storageFull : kitKo.storageFailed} ${kitKo.questNotSaved}`}
        />
      ) : null}

      {hintVisible && today !== null ? (
        <p data-testid="quest-locked-hint" className="note note-warn quest-locked-hint" role="status">
          <Icon name="lock" size={16} />
          <span>
            {`${plain(ui.questLockedHint(today))} · `}
            <span lang="ko">오늘 퀘스트를 먼저 마쳐 주세요.</span>
          </span>
        </p>
      ) : null}

      {quest ? (
        <section key={quest.day} data-testid="quest-today" className="card quest-card">
          <div className="quest-card-head">
            <span className="icon-tile quest-icon" aria-hidden="true">
              <Icon name={questIcon(quest.day)} size={26} />
            </span>
            <div className="quest-card-titles">
              <span className="eyebrow quest-label">
                <span className="quest-label-dot" aria-hidden="true" />
                {`${ui.questToday} · ${ui.questDay(quest.day)}`}
              </span>
              <h2 className="quest-title" data-testid="quest-title">
                {`${quest.title} `}
                <span lang="ko" className="quest-title-ko">
                  {quest.titleKo}
                </span>
              </h2>
            </div>
          </div>

          <div className="quest-rows">
            <div className="quest-row">
              <Icon name="pin" size={18} className="quest-row-icon" />
              <div className="quest-row-main">
                <p className="quest-row-label">{plain(ui.questWhere)}</p>
                <Hint kind="ko" text={quest.whereKo}>
                  <p data-testid="quest-where" className="quest-where">{quest.where}</p>
                </Hint>
              </div>
            </div>
            <div className="quest-row">
              <Icon name="bag" size={18} className="quest-row-icon" />
              <div className="quest-row-main">
                <p className="quest-row-label">{plain(ui.questBring)}</p>
                <ul data-testid="quest-bring" className="quest-bring">
                  {quest.bring.map((b) => (
                    <li key={b.ko}>
                      <span>{b.text}</span>
                      <span lang="ko" className="quest-ko">{b.ko}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="quest-say-box">
            <p className="quest-row-label">
              <Icon name="message" size={16} />
              {plain(ui.questSay)}
            </p>
            <p data-testid="quest-say" className="quest-say" lang="ko">{`“${quest.sayKo}”`}</p>
            <p data-testid="quest-say-pron" className="quest-say-pron">{quest.sayPron}</p>
            <p className="quest-say-meaning">{quest.sayMeaning}</p>
            <div className="quest-say-actions">
              <SpeakButton text={quest.sayKo} testId="quest-say-speak" />
              <SpeakButton text={quest.sayMeaning} testId="quest-say-speak-tr" lang={lang} />
              <button type="button" data-testid="quest-say-big" className="btn btn-soft" onClick={() => setBigOpen(true)}>
                <Icon name="expand" size={18} />
                {plain(ui.showBig)}
              </button>
            </div>
          </div>

          {questDay?.tip ? (
            <div data-testid="quest-tip" className="quest-tip">
              <Hint
                text={
                  <>
                    {quest.tip}
                    <br />
                    <span lang="ko">{quest.tipKo}</span>
                  </>
                }
                label={kit.questTip}
              >
                <span className="eyebrow">
                  <Icon name="bulb" size={16} />
                  {kit.questTip}
                </span>
              </Hint>
            </div>
          ) : null}

          <div className="quest-actions">
            {quest.link ? (
              <a
                data-testid="quest-link"
                className="btn btn-line btn-block quest-link"
                href={ROUTE_HASH[quest.link.route]}
                title={quest.link.labelKo}
              >
                <span>{plain(quest.link.label)}</span>
                <Icon name="arrowRight" size={18} />
              </a>
            ) : null}
            <button
              type="button"
              data-testid="quest-complete"
              className="btn btn-primary btn-lg btn-block quest-complete"
              onClick={onComplete}
            >
              <Icon name="check" size={20} strokeWidth={2.4} />
              {plain(ui.questComplete)}
            </button>
          </div>
          {bigOpen ? (
            <BigCard ko={quest.sayKo} vi={quest.sayMeaning} viPron={quest.sayPron} onClose={() => setBigOpen(false)} />
          ) : null}
        </section>
      ) : (
        <section data-testid="quest-all-done" className="card quest-all-done">
          <span className="quest-trophy" aria-hidden="true">
            <Icon name="sparkle" size={34} />
          </span>
          <p className="quest-all-done-text">{plain(ui.questAllDone(TOTAL))}</p>
          <p lang="ko" className="ko">{`${TOTAL}일 퀘스트를 모두 마쳤어요.`}</p>
        </section>
      )}

      <section className="section">
        <h2 className="section-title">{kit.questAllDays}</h2>
        <ol className="quest-list card">
          {QUESTS.map((q, i) => {
            const state = dayState(q.day, completed, TOTAL);
            const view = questView(q, lang);
            return (
              <li key={q.day} style={vars({ '--i': i })}>
                <button
                  type="button"
                  data-testid={`quest-item-${q.day}`}
                  data-state={state}
                  className={`quest-item quest-item-${state}`}
                  onClick={() => setHintVisible(state === 'locked')}
                >
                  <span className="quest-item-mark" aria-hidden="true">
                    <Icon
                      name={state === 'done' ? 'check' : state === 'locked' ? 'lock' : questIcon(q.day)}
                      size={state === 'today' ? 18 : 16}
                      strokeWidth={state === 'done' ? 2.6 : 1.9}
                    />
                  </span>
                  <span className="quest-item-text">
                    <span className="quest-item-day">{ui.questDay(q.day)}</span>
                    <span className="quest-item-title">{view.title}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      <button type="button" data-testid="quest-reset" className="btn btn-ghost btn-sm quest-reset" onClick={onReset}>
        <Icon name="refresh" size={16} />
        {ui.questReset}
      </button>
    </main>
  );
}
