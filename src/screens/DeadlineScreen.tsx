import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import { buildTimeline, validateStayProfile, type DeadlineItem, type DeadlineLevel, type ProfileError } from '../deadline/rules';
import { buildIcs, ICS_FILE_NAME } from '../deadline/ics';
import { DEADLINE_PACKS, type DeadlineStrings } from '../deadline/i18n';
import { notifyStayChanged } from '../deadline/DeadlineBanner';
import { fillArrivalFromEntry } from '../deadline/arrivalSync';
import { Hint } from '../components/Hint';
import { Icon } from '../components/Icon';
import { StatusNote } from '../components/StatusNote';
import { useToday } from '../components/useToday';
import { vars } from '../components/text';
import { useFeatureStrings } from '../i18n/feature';
import { legalEntry, legalText } from '../legal';
import { LegalBadge } from '../legal/LegalBadge';
import { downloadBlob } from '../pdf/download';
import { loadArrival } from '../quest/arrival';
import type { ProgressStorage } from '../quest/progress';
import type { StayProfile, VisaType } from '../storage/db';
import { classifyStorageError, type StorageFailure } from '../storage/failure';
import { EMPTY_STAY_PROFILE, stayProfileRepo, wipeStayData } from '../storage/repos';
import { UI_PACKS } from '../ui/i18n';
import './deadline.css';

type StayInput = Omit<StayProfile, 'id'>;
type DateField = Exclude<keyof StayInput, 'visaType' | 'arcRegisteredOn'>;

interface Draft {
  entryDate: string;
  visaType: VisaType | '';
  stayExpiry: string;
  arcDone: boolean;
  arcRegisteredOn: string;
  lastMoveDate: string;
  contractEnd: string;
  leftJobOn: string;
  passportExpiry: string;
}

const VISA_TYPES: readonly VisaType[] = ['E-9', 'H-2', 'E-7', 'D-2', 'D-4', 'F-2', 'F-4', 'F-5', 'F-6', 'other'];

const DATE_INPUTS: readonly { field: DateField; testId: string; label: (s: DeadlineStrings) => string }[] = [
  { field: 'entryDate', testId: 'stay-entry', label: (s) => s.fieldEntry },
  { field: 'stayExpiry', testId: 'stay-expiry', label: (s) => s.fieldExpiry },
  { field: 'lastMoveDate', testId: 'stay-move', label: (s) => s.fieldMove },
  { field: 'contractEnd', testId: 'stay-contract-end', label: (s) => s.fieldContractEnd },
  { field: 'leftJobOn', testId: 'stay-left-job', label: (s) => s.fieldLeftJob },
  { field: 'passportExpiry', testId: 'stay-passport-expiry', label: (s) => s.fieldPassportExpiry },
];

const FIELD_LABEL: Readonly<Record<keyof StayInput, (s: DeadlineStrings) => string>> = {
  entryDate: (s) => s.fieldEntry,
  visaType: (s) => s.fieldVisa,
  stayExpiry: (s) => s.fieldExpiry,
  arcRegisteredOn: (s) => s.fieldArcDate,
  lastMoveDate: (s) => s.fieldMove,
  contractEnd: (s) => s.fieldContractEnd,
  leftJobOn: (s) => s.fieldLeftJob,
  passportExpiry: (s) => s.fieldPassportExpiry,
};

const ERROR_TEXT: Readonly<Record<ProfileError, (s: DeadlineStrings) => string>> = {
  badDate: (s) => s.errBadDate,
  expiryBeforeEntry: (s) => s.errExpiryBeforeEntry,
  moveBeforeEntry: (s) => s.errMoveBeforeEntry,
  futureEntry: (s) => s.errFutureEntry,
};

const LEVEL_TEXT: Readonly<Record<DeadlineLevel, (s: DeadlineStrings) => string>> = {
  overdue: (s) => s.levelOverdue,
  urgent: (s) => s.levelUrgent,
  soon: (s) => s.levelSoon,
  ok: (s) => s.levelOk,
};

function toDraft(p: StayInput): Draft {
  return {
    entryDate: p.entryDate ?? '',
    visaType: p.visaType ?? '',
    stayExpiry: p.stayExpiry ?? '',
    arcDone: p.arcRegisteredOn !== null,
    arcRegisteredOn: p.arcRegisteredOn ?? '',
    lastMoveDate: p.lastMoveDate ?? '',
    contractEnd: p.contractEnd ?? '',
    leftJobOn: p.leftJobOn ?? '',
    passportExpiry: p.passportExpiry ?? '',
  };
}

const orNull = (s: string): string | null => (s === '' ? null : s);

function fromDraft(d: Draft): StayInput {
  return {
    entryDate: orNull(d.entryDate),
    visaType: d.visaType === '' ? null : d.visaType,
    stayExpiry: orNull(d.stayExpiry),
    // 체크했는데 날짜가 비면 '' 그대로 → validateStayProfile 이 badDate 로 잡는다
    arcRegisteredOn: d.arcDone ? d.arcRegisteredOn : null,
    lastMoveDate: orNull(d.lastMoveDate),
    contractEnd: orNull(d.contractEnd),
    leftJobOn: orNull(d.leftJobOn),
    passportExpiry: orNull(d.passportExpiry),
  };
}

const STAY_KEYS = Object.keys(EMPTY_STAY_PROFILE) as (keyof StayInput)[];

function sameInput(a: StayInput, b: StayInput): boolean {
  return STAY_KEYS.every((k) => a[k] === b[k]);
}

function defaultStorage(): ProgressStorage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

function prefillDraft(storage: ProgressStorage | null): { draft: Draft; prefilled: boolean } {
  const arrival = storage ? loadArrival(storage) : null;
  return { draft: toDraft({ ...EMPTY_STAY_PROFILE, entryDate: arrival }), prefilled: arrival !== null };
}

/** 금액 단위(won) 항목 = 벌칙 상한 */
function fineEntryId(item: DeadlineItem) {
  return item.legalIds.find((id) => legalEntry(id).unit === 'won') ?? null;
}

function formatWon(n: number): string {
  return `${n.toLocaleString('ko-KR')}원`;
}

export interface DeadlineScreenProps {
  /** 오늘 (테스트용). 기본 new Date() */
  now?: Date;
  /** 도착일 prefill 저장소 (테스트용). 기본 localStorage */
  storage?: ProgressStorage;
  /** 저장된 프로필 (테스트용). 주면 IndexedDB 를 읽지 않는다. null = 저장된 것 없음 */
  initialProfile?: StayInput | null;
}

export function DeadlineScreen(props: DeadlineScreenProps): JSX.Element {
  const { t, ko } = useFeatureStrings(DEADLINE_PACKS);
  const { t: kit, ko: kitKo } = useFeatureStrings(UI_PACKS);
  const today = useToday(props.now);
  const [saved, setSaved] = useState<StayInput | null>(props.initialProfile ?? null);
  const [{ draft, prefilled }, setDraftState] = useState(() =>
    props.initialProfile
      ? { draft: toDraft(props.initialProfile), prefilled: false }
      : prefillDraft(props.storage ?? defaultStorage()),
  );
  const [errors, setErrors] = useState<Partial<Record<keyof StayInput, ProfileError>>>({});
  const [status, setStatus] = useState<'saved' | 'wiped' | null>(null);
  const [icsError, setIcsError] = useState<'empty' | 'library' | null>(null);
  const [storageError, setStorageError] = useState<StorageFailure | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [arrivalSynced, setArrivalSynced] = useState(false);
  const timelineRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (props.initialProfile !== undefined) return;
    let alive = true;
    stayProfileRepo
      .get()
      .then((p) => {
        if (!alive || !p) return;
        const { id: _id, ...rest } = p;
        setSaved(rest);
        setDraftState({ draft: toDraft(rest), prefilled: false });
      })
      .catch(() => {
        if (alive) setLoadError(true);
      });
    return () => {
      alive = false;
    };
  }, [props.initialProfile]);

  const setDraft = (patch: Partial<Draft>): void => {
    setDraftState((s) => ({ ...s, draft: { ...s.draft, ...patch } }));
    setStatus(null);
    setArrivalSynced(false);
  };

  // 저장·배너·ICS 는 saved 만. 입력 중에는 오류 없고 저장값과 다를 때만 미리보기
  const items = saved ? buildTimeline(saved, today) : [];
  const draftInput = fromDraft(draft);
  const preview =
    !sameInput(draftInput, saved ?? EMPTY_STAY_PROFILE) &&
    Object.keys(validateStayProfile(draftInput, today)).length === 0;
  const shown = preview ? buildTimeline(draftInput, today) : items;

  const onSave = (): void => {
    const input = fromDraft(draft);
    const errs = validateStayProfile(input, today);
    setErrors(errs);
    setArrivalSynced(false);
    if (Object.keys(errs).length > 0) {
      setStatus(null);
      return;
    }
    void stayProfileRepo
      .put({ id: 'me', ...input })
      .then(() => {
        setSaved(input);
        setStatus('saved');
        setStorageError(null);
        setIcsError(null);
        notifyStayChanged();
        if (input.entryDate !== null) {
          const sync = fillArrivalFromEntry(input.entryDate, today, props.storage ?? defaultStorage());
          setArrivalSynced(sync === 'filled');
        }
        const el = timelineRef.current;
        if (el && typeof el.scrollIntoView === 'function') el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      })
      .catch((err: unknown) => {
        setStatus(null);
        setStorageError(classifyStorageError(err));
      });
  };

  const onIcs = (): void => {
    const res = buildIcs(items, { title: t.kindTitle, alarm: t.alarm }, { title: ko.kindTitle, alarm: ko.alarm });
    if (!res.ok) {
      setIcsError(res.error);
      return;
    }
    setIcsError(null);
    downloadBlob(new Blob([res.text], { type: 'text/calendar;charset=utf-8' }), ICS_FILE_NAME);
  };

  const onWipe = (): void => {
    void wipeStayData()
      .then(() => {
        setSaved(null);
        setDraftState({ draft: toDraft(EMPTY_STAY_PROFILE), prefilled: false });
        setErrors({});
        setIcsError(null);
        setStatus('wiped');
        setStorageError(null);
        notifyStayChanged();
      })
      .catch((err: unknown) => {
        setStatus(null);
        setStorageError(classifyStorageError(err));
      });
  };

  const errorKeys = Object.keys(errors) as (keyof StayInput)[];

  const dateInput = (f: (typeof DATE_INPUTS)[number]): JSX.Element => (
    <label key={f.field} className="field">
      <span className="field-label">{f.label(t)}</span>
      <input
        type="date"
        data-testid={f.testId}
        className="input"
        value={draft[f.field]}
        onChange={(e) => setDraft({ [f.field]: e.target.value })}
      />
    </label>
  );
  const byField = (field: DateField): (typeof DATE_INPUTS)[number] => DATE_INPUTS.find((d) => d.field === field)!;

  return (
    <main data-testid="screen-deadline" className="screen deadline">
      <header className="screen-head">
        <Hint text={t.intro}>
          <h1 className="screen-title">{t.title}</h1>
        </Hint>
      </header>

      <section
        ref={timelineRef}
        data-testid="deadline-timeline"
        data-preview={preview ? 'true' : 'false'}
        className="deadline-timeline"
        aria-labelledby="deadline-tl-h"
      >
        <h2 id="deadline-tl-h" className="section-title">
          <Icon name="bell" size={18} />
          {t.timelineHeading}
        </h2>
        {preview ? (
          <p data-testid="deadline-preview-note" className="deadline-note deadline-preview-note" role="status">
            <Icon name="info" size={14} />
            <span>
              {kit.timelinePreview}
              {' '}
              <span lang="ko">{kitKo.timelinePreview}</span>
            </span>
          </p>
        ) : null}
        {shown.length === 0 ? (
          <div className="deadline-empty">
            <span className="deadline-empty-icon" aria-hidden="true">
              <Icon name="calendar" size={26} />
            </span>
            <p>{t.empty}</p>
          </div>
        ) : (
          <ol className="deadline-list">
            {shown.map((item, i) => (
              <TimelineItem key={`${item.kind}-${item.due}`} item={item} t={t} ko={ko} i={i} />
            ))}
          </ol>
        )}
        <Hint text={t.icsHint} className="deadline-ics-wrap">
          <button type="button" data-testid="deadline-ics" className="btn btn-line btn-block" onClick={onIcs}>
            <Icon name="calendar" size={18} />
            {t.ics}
          </button>
        </Hint>
        {icsError ? (
          <p data-testid="deadline-ics-error" className="field-error" role="alert">
            {icsError === 'empty' ? t.icsErrorEmpty : t.icsErrorLibrary}
          </p>
        ) : null}
      </section>

      <section className="card deadline-form">
        <h2 className="work-heading">
          <Icon name="idCard" size={18} />
          {t.profileHeading}
        </h2>
        <div className="grid-2">
          {dateInput(byField('entryDate'))}
          {dateInput(byField('stayExpiry'))}
        </div>
        {prefilled ? (
          <p className="deadline-note">
            <Icon name="info" size={14} />
            {t.prefillNote}
          </p>
        ) : null}
        <label className="field">
          <span className="field-label">{t.fieldVisa}</span>
          <select
            data-testid="stay-visa"
            className="input"
            value={draft.visaType}
            onChange={(e) => setDraft({ visaType: e.target.value as VisaType | '' })}
          >
            <option value="">{t.visaChoose}</option>
            {VISA_TYPES.map((v) => (
              <option key={v} value={v}>
                {v === 'other' ? t.visaOther : v}
              </option>
            ))}
          </select>
        </label>
        <label className="check deadline-check">
          <input
            type="checkbox"
            data-testid="stay-arc-done"
            checked={draft.arcDone}
            onChange={(e) => setDraft({ arcDone: e.target.checked })}
          />
          <span>{t.fieldArcDone}</span>
        </label>
        {draft.arcDone ? (
          <label className="field deadline-reveal">
            <span className="field-label">{t.fieldArcDate}</span>
            <input
              type="date"
              data-testid="stay-arc-date"
              className="input"
              value={draft.arcRegisteredOn}
              onChange={(e) => setDraft({ arcRegisteredOn: e.target.value })}
            />
          </label>
        ) : null}
        <div className="grid-2">
          {dateInput(byField('lastMoveDate'))}
          {dateInput(byField('contractEnd'))}
          {dateInput(byField('leftJobOn'))}
          {dateInput(byField('passportExpiry'))}
        </div>
        {errorKeys.length > 0 ? (
          <div data-testid="stay-error" className="note note-danger deadline-errors" role="alert">
            <Icon name="alert" size={16} />
            <div>
              {errorKeys.map((k) => {
                const err = errors[k] as ProfileError;
                return (
                  <p key={k} className="deadline-error-line">
                    {`${FIELD_LABEL[k](t)}: ${ERROR_TEXT[err](t)}`}
                  </p>
                );
              })}
            </div>
          </div>
        ) : null}
        <button type="button" data-testid="stay-save" className="btn btn-primary btn-block" onClick={onSave}>
          {t.save}
        </button>
        {status ? (
          <p className="note note-ok deadline-status" role="status">
            <Icon name="checkCircle" size={16} />
            {status === 'saved' ? t.saved : t.wiped}
          </p>
        ) : null}
        {arrivalSynced ? (
          <StatusNote
            tone="ok"
            testId="stay-arrival-synced"
            text={kit.entryFilledArrival}
            ko={kitKo.entryFilledArrival}
          />
        ) : null}
        {loadError ? (
          <StatusNote tone="danger" testId="stay-load-error" role="alert" text={kit.loadFailed} ko={kitKo.loadFailed} />
        ) : null}
        {storageError ? (
          <StatusNote
            tone="danger"
            testId="stay-storage-error"
            role="alert"
            data={{ code: storageError }}
            text={storageError === 'quota' ? kit.storageFull : kit.storageFailed}
            ko={storageError === 'quota' ? kitKo.storageFull : kitKo.storageFailed}
          />
        ) : null}
      </section>

      <button type="button" data-testid="stay-wipe" className="btn btn-ghost btn-sm deadline-wipe" onClick={onWipe}>
        <Icon name="trash" size={16} />
        {t.wipe}
      </button>
    </main>
  );
}

function TimelineItem(props: { item: DeadlineItem; t: DeadlineStrings; ko: DeadlineStrings; i: number }): JSX.Element {
  const { item, t, ko, i } = props;
  const fineId = item.level === 'overdue' ? fineEntryId(item) : null;
  const fine = fineId ? legalEntry(fineId) : null;
  const extensionOpen = item.kind === 'extensionOpens' && item.daysLeft <= 0;
  const overstay = item.level === 'overdue' && item.legalIds.includes('overstayNote');
  return (
    <li
      data-testid="deadline-item"
      data-kind={item.kind}
      data-level={item.level}
      className={`deadline-item deadline-item-${item.level}`}
      style={vars({ '--i': i })}
    >
      <span className="deadline-dot" aria-hidden="true" />
      <div className="deadline-item-body">
        <div className="deadline-item-head">
          <span className="deadline-item-title">
            {t.kindTitle(item.kind)}
            <span lang="ko" className="deadline-item-ko">
              {ko.kindTitle(item.kind)}
            </span>
          </span>
          <span className={`badge deadline-level deadline-level-${item.level}`}>{LEVEL_TEXT[item.level](t)}</span>
        </div>
        <p className="deadline-item-due">
          <span className="num">{t.dueOn(item.due)}</span>
          <span data-testid="deadline-days" className="deadline-days">
            {extensionOpen ? t.extensionOpenNow : t.daysLeft(item.daysLeft)}
          </span>
        </p>
        {fine && typeof fine.value === 'number' ? (
          <p data-testid="deadline-fine" className="deadline-fine">
            {`${t.fineLabel}: `}
            <span lang="ko">{`${fine.labelKo} ${formatWon(fine.value)}`}</span>
          </p>
        ) : null}
        {overstay ? (
          <Hint kind="ko" text={legalText('overstayNote')} className="deadline-overstay">
            <p className="deadline-fine">{t.overstayHint}</p>
          </Hint>
        ) : null}
        {item.level === 'overdue' ? (
          <a className="deadline-ask" href="tel:1345">
            <Icon name="phone" size={14} />
            {t.ask1345}
          </a>
        ) : null}
        {item.unverified ? <LegalBadge ids={item.legalIds} /> : null}
      </div>
    </li>
  );
}
