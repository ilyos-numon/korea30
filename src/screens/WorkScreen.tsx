import { useEffect, useMemo, useState } from 'react';
import type { JSX } from 'react';
import { Hint } from '../components/Hint';
import { Icon } from '../components/Icon';
import { StatusNote } from '../components/StatusNote';
import { useFeatureStrings } from '../i18n/feature';
import { LegalBadge } from '../legal/LegalBadge';
import { legalNumber } from '../legal';
import type { ManualInput } from '../payroll/manual';
import { downloadBlob } from '../pdf/download';
import { toIsoDate } from '../quest/arrival';
import { classifyStorageError, type StorageFailure } from '../storage/failure';
import type { WorkShift } from '../storage/db';
import { EMPTY_WORK_PROFILE, photoRepo, shiftRepo, wipeWorkData, workProfileRepo } from '../storage/repos';
import { calcMonth, type WageCalcResult, type WageNoteId } from '../worklog/calc';
import { comparePayslip, type PayslipCompare } from '../worklog/compare';
import { defaultStatementKo, toComplaintDraft } from '../worklog/complaint';
import { buildEvidenceDoc, evidenceFileName } from '../worklog/evidencePdf';
import { WORKLOG_PACKS, type WorklogStrings } from '../worklog/i18n';
import { PHOTO_PACKS } from '../worklog/photos/i18n';
import { UI_PACKS, type UiKitStrings } from '../ui/i18n';
import { toEvidencePhotos, type EvidencePhoto } from '../worklog/photos/pdfPhotos';
import { PhotoPanel } from '../worklog/photos/ui/PhotoPanel';
import { ComparePanel } from '../worklog/ui/ComparePanel';
import { ProfileForm, type WorkProfileInput } from '../worklog/ui/ProfileForm';
import { ShiftForm, type ShiftDraft } from '../worklog/ui/ShiftForm';
import { ShiftList } from '../worklog/ui/ShiftList';
import './work.css';

const NOTE_TEXT: Readonly<Record<WageNoteId, (s: WorklogStrings, workers: number) => string>> = {
  smallWorkplaceNoPremium: (s, n) => s.noteSmallWorkplaceNoPremium(n),
  workplaceSizeUnknown: (s, n) => s.noteWorkplaceSizeUnknown(n),
  belowMinWage: (s) => s.noteBelowMinWage,
  weeklyHolidayPayNotIncluded: (s) => s.noteWeeklyHolidayPayNotIncluded,
};

const YEAR_MONTH_RE = /^\d{4}-\d{2}$/;

/** 'YYYY-MM' 에 달을 더한다 */
function shiftMonth(ym: string, delta: number): string {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function compareShift(a: WorkShift, b: WorkShift): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1;
  if (a.start !== b.start) return a.start < b.start ? -1 : 1;
  return 0;
}

function newId(): string {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `shift-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function calcFor(shifts: readonly WorkShift[], p: WorkProfileInput, yearMonth: string): WageCalcResult {
  return calcMonth({
    shifts,
    hourlyWage: p.hourlyWage,
    workplace5Plus: p.workplace5Plus,
    weekStartsOn: p.weekStartsOn,
    yearMonth,
  });
}

type PdfPhotoNote = { reason: 'unread' } | { reason: 'skipped'; n: number } | { reason: 'dropped'; n: number };

function photoNoteText(s: UiKitStrings, note: PdfPhotoNote): string {
  if (note.reason === 'unread') return s.pdfPhotosUnread;
  if (note.reason === 'dropped') return s.pdfPhotosDropped(note.n);
  return s.pdfPhotosSkipped(note.n);
}

export interface WorkScreenProps {
  /** 오늘 (테스트용). 기본 new Date() */
  now?: Date;
  /** 저장된 시프트 (테스트용). 주면 IndexedDB 를 읽지 않는다 */
  initialShifts?: readonly WorkShift[];
  /** 저장된 프로필 (테스트용). 주면 IndexedDB 를 읽지 않는다. null = 저장된 것 없음 */
  initialProfile?: WorkProfileInput | null;
}

export function WorkScreen(props: WorkScreenProps): JSX.Element {
  const { t, ko, lang } = useFeatureStrings(WORKLOG_PACKS);
  const { t: pt } = useFeatureStrings(PHOTO_PACKS);
  const { t: kit, ko: kitKo } = useFeatureStrings(UI_PACKS);
  const today = toIsoDate(props.now ?? new Date());
  const workers = legalNumber('premiumMinWorkers');

  const [month, setMonth] = useState(today.slice(0, 7));
  const [shifts, setShifts] = useState<WorkShift[]>(() => [...(props.initialShifts ?? [])].sort(compareShift));
  const [profile, setProfile] = useState<WorkProfileInput>(props.initialProfile ?? EMPTY_WORK_PROFILE);
  /** ProfileForm·ComparePanel 을 다시 마운트할 때 올린다 (불러오기·지우기) */
  const [version, setVersion] = useState(0);
  const [profileSaved, setProfileSaved] = useState(false);
  /** 달별로 마지막에 비교한 명세서 입력. 결과는 매 렌더 현재 계산으로 다시 만든다 */
  const [submitted, setSubmitted] = useState<Readonly<Record<string, ManualInput>>>({});
  /** null = 추천 문장 사용 */
  const [statement, setStatement] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<'empty' | 'library' | 'photos' | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  /** 마지막 PDF 에서 사진이 빠진 이유. 다음 PDF 시도 때 지운다 */
  const [pdfPhotoNote, setPdfPhotoNote] = useState<PdfPhotoNote | null>(null);
  const [wipeAsk, setWipeAsk] = useState(false);
  const [wiped, setWiped] = useState(false);
  /** PhotoPanel 이 IndexedDB 를 다시 읽게 할 때 올린다 (전체 지우기·시프트 삭제) */
  const [photoReload, setPhotoReload] = useState(0);
  /** 마지막 쓰기 실패. 다음 성공한 저장에서 지운다 */
  const [storageError, setStorageError] = useState<StorageFailure | null>(null);
  const [loadError, setLoadError] = useState(false);
  /** 방금 지운 시프트와 연결돼 있던 사진 id (되돌리기용). 다음 추가·삭제·언마운트 때 사라진다 */
  const [undo, setUndo] = useState<{ shift: WorkShift; photoIds: string[] } | null>(null);

  useEffect(() => {
    let alive = true;
    if (props.initialShifts === undefined) {
      shiftRepo
        .listAll()
        .then((rows) => {
          if (alive) setShifts(rows);
        })
        .catch(() => {
          if (alive) setLoadError(true);
        });
    }
    if (props.initialProfile === undefined) {
      workProfileRepo
        .get()
        .then((p) => {
          if (!alive || !p) return;
          const { id: _id, ...rest } = p;
          setProfile(rest);
          setVersion((v) => v + 1);
        })
        .catch(() => {
          if (alive) setLoadError(true);
        });
    }
    return () => {
      alive = false;
    };
  }, [props.initialShifts, props.initialProfile]);

  const monthShifts = useMemo(() => shifts.filter((s) => s.date.startsWith(`${month}-`)), [shifts, month]);
  const calc = useMemo(() => calcFor(shifts, profile, month), [shifts, profile, month]);

  /** 시프트가 있는 모든 달의 계산과, 명세서를 넣은 달의 비교 */
  const { months, compares } = useMemo(() => {
    const yms = [...new Set(shifts.map((s) => s.date.slice(0, 7)))].sort();
    const ms = yms.map((ym) => calcFor(shifts, profile, ym));
    const cs: PayslipCompare[] = [];
    for (const ym of Object.keys(submitted).sort()) {
      const res = comparePayslip(calcFor(shifts, profile, ym), submitted[ym]);
      if (res.ok) cs.push(res.result);
    }
    return { months: ms, compares: cs };
  }, [shifts, profile, submitted]);

  const monthCompare = compares.find((c) => c.yearMonth === month) ?? null;
  const suggested = defaultStatementKo({ id: 'me', ...profile }, months, compares);
  const statementText = statement ?? suggested;

  const touched = (): void => {
    setWiped(false);
    setPdfError(null);
  };

  const failed = (err: unknown): void => {
    setStorageError(classifyStorageError(err));
  };

  const onAddShift = (draft: ShiftDraft): Promise<boolean> => {
    const shift: WorkShift = { id: newId(), ...draft, createdAt: Date.now() };
    setUndo(null);
    return shiftRepo
      .put(shift)
      .then(() => {
        setShifts((prev) => [...prev, shift].sort(compareShift));
        setMonth(shift.date.slice(0, 7));
        setStorageError(null);
        touched();
        return true;
      })
      .catch((err: unknown) => {
        failed(err);
        return false;
      });
  };

  const onDeleteShift = (id: string): void => {
    const target = shifts.find((s) => s.id === id);
    setUndo(null);
    void (async () => {
      // 되돌리기용: 지우기 전에 이 시프트에 연결된 사진 id 를 모은다 (읽기 실패면 사진 연결은 되돌리지 못한다)
      const photoIds = await photoRepo
        .listAll()
        .then((all) => all.filter((p) => p.shiftId === id).map((p) => p.id))
        .catch(() => [] as string[]);
      try {
        await shiftRepo.remove(id);
      } catch (err) {
        failed(err);
        return;
      }
      setShifts((prev) => prev.filter((s) => s.id !== id));
      setStorageError(null);
      if (target) setUndo({ shift: target, photoIds });
      // 사진은 지우지 않고 시프트 연결만 푼다
      await photoRepo.unlinkShift(id).catch(() => 0);
      setPhotoReload((k) => k + 1);
    })();
  };

  const onUndo = (): void => {
    if (!undo) return;
    const { shift, photoIds } = undo;
    void (async () => {
      try {
        await shiftRepo.put(shift);
      } catch (err) {
        failed(err);
        return;
      }
      setUndo(null);
      setStorageError(null);
      setShifts((prev) => [...prev.filter((s) => s.id !== shift.id), shift].sort(compareShift));
      setMonth(shift.date.slice(0, 7));
      for (const pid of photoIds) await photoRepo.updateMeta(pid, { shiftId: shift.id }).catch(() => undefined);
      setPhotoReload((k) => k + 1);
    })();
  };

  const onSaveProfile = (p: WorkProfileInput): void => {
    void workProfileRepo
      .put({ id: 'me', ...p })
      .then(() => {
        setProfile(p);
        setProfileSaved(true);
        setStorageError(null);
        touched();
      })
      .catch((err: unknown) => {
        setProfileSaved(false);
        failed(err);
      });
  };

  const onPdf = async (opts?: { withoutPhotos?: boolean }): Promise<void> => {
    const withoutPhotos = opts?.withoutPhotos === true;
    if (shifts.length === 0) {
      setPdfError('empty');
      return;
    }
    setPdfError(null);
    setPdfPhotoNote(null);
    setPdfBusy(true);
    try {
      const fullProfile = { id: 'me' as const, ...profile };
      // 사진 읽기 실패는 사진 없이 진행한다 (PDF 오류 아님). 만료된 사진은 toEvidencePhotos 가 뺀다
      let photos: EvidencePhoto[] = [];
      let omitted = 0;
      let failed = 0;
      let unread = false;
      try {
        ({ photos, omitted, failed } = toEvidencePhotos(await photoRepo.listAll(), shifts, today));
      } catch {
        photos = [];
        omitted = 0;
        failed = 0;
        unread = true;
      }
      // 사진 없이 다시 만들기: 넣으려던 사진 수만 세고 PDF 에는 넣지 않는다
      const dropped = withoutPhotos ? photos.length : 0;
      if (withoutPhotos) photos = [];
      const doc = buildEvidenceDoc({
        profile: fullProfile,
        shifts,
        months,
        compares,
        complaint: toComplaintDraft(fullProfile, compares, statementText),
        generatedOn: today,
        photos,
        photosOmitted: omitted,
      });
      let blob: Blob;
      try {
        const { renderPdf } = await import('../pdf/renderPdf');
        blob = await renderPdf(doc);
      } catch {
        // 사진을 넣은 렌더가 실패하면 손상 사진일 수 있다 → 사진 없이 다시 만들기를 제안
        setPdfError(photos.length > 0 && !withoutPhotos ? 'photos' : 'library');
        return;
      }
      downloadBlob(blob, evidenceFileName(today));
      if (withoutPhotos) setPdfPhotoNote({ reason: 'dropped', n: dropped });
      else if (unread) setPdfPhotoNote({ reason: 'unread' });
      else if (omitted + failed > 0) setPdfPhotoNote({ reason: 'skipped', n: omitted + failed });
    } catch {
      setPdfError('library');
    } finally {
      setPdfBusy(false);
    }
  };

  const onWipe = (): void => {
    void wipeWorkData()
      .then(() => {
        setShifts([]);
        setProfile(EMPTY_WORK_PROFILE);
        setSubmitted({});
        setStatement(null);
        setProfileSaved(false);
        setPdfError(null);
        setWipeAsk(false);
        setWiped(true);
        setStorageError(null);
        setUndo(null);
        setVersion((v) => v + 1);
        setPhotoReload((k) => k + 1);
      })
      .catch((err: unknown) => {
        setWiped(false);
        setWipeAsk(false);
        failed(err);
      });
  };

  const wageSet = profile.hourlyWage > 0;
  const notes = calc.notes.filter((n) => wageSet || n !== 'belowMinWage');
  const holidayMinutes = calc.totals.holidayWithin8 + calc.totals.holidayOver8;

  const stat = (testId: string | null, text: string, value: string, tone: string): JSX.Element => (
    <div className={`work-stat work-stat-${tone}`}>
      <dt>{text}</dt>
      <dd data-testid={testId ?? undefined} className="num">
        {value}
      </dd>
    </div>
  );

  const goProfile = (): void => {
    const el = typeof document !== 'undefined' ? document.getElementById('work-profile') : null;
    if (el && typeof el.scrollIntoView === 'function') el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main data-testid="screen-work" className="screen work">
      <header className="screen-head work-head">
        <Hint text={t.intro}>
          <h1 className="screen-title">{t.title}</h1>
        </Hint>
      </header>

      <div className="work-month-bar">
        <button type="button" className="icon-btn" aria-label={kit.prevMonth} onClick={() => setMonth(shiftMonth(month, -1))}>
          <Icon name="chevronLeft" size={20} />
        </button>
        <label className="work-month">
          <span className="sr-only">{t.month}</span>
          <Icon name="calendar" size={18} />
          <input
            type="month"
            data-testid="work-month"
            className="work-month-input num"
            value={month}
            onChange={(e) => {
              if (YEAR_MONTH_RE.test(e.target.value)) setMonth(e.target.value);
            }}
          />
        </label>
        <button type="button" className="icon-btn" aria-label={kit.nextMonth} onClick={() => setMonth(shiftMonth(month, 1))}>
          <Icon name="chevronRight" size={20} />
        </button>
      </div>

      <section className="card work-overview" aria-labelledby="work-sum-h">
        <p id="work-sum-h" className="eyebrow">
          {t.totalsHeading}
        </p>
        <p className="work-gross">
          <span className="work-gross-label">{t.expectedGross}</span>
          <span data-testid="work-expected-gross" className="work-gross-value num">
            {t.won(calc.expectedGross)}
          </span>
        </p>
        <p className="work-gross-split num">
          <span>{`${t.basePay} ${t.won(calc.basePay)}`}</span>
          <span>{`${t.premiumPay} ${t.won(calc.premiumPay)}`}</span>
        </p>
        <dl className="work-stats">
          {stat('work-total-regular', t.totalRegular, t.hoursMinutes(calc.totals.regular), 'blue')}
          {stat('work-total-overtime', t.totalOvertime, t.hoursMinutes(calc.totals.overtime), 'sun')}
          {stat('work-total-night', t.totalNight, t.hoursMinutes(calc.totals.night), 'ink')}
          {stat(null, t.totalHoliday, t.hoursMinutes(holidayMinutes), 'jade')}
        </dl>
        <p className="work-total-worked">
          <Icon name="clock" size={14} />
          {`${t.totalWorked} ${t.hoursMinutes(calc.totals.worked)}`}
        </p>
        {!wageSet ? (
          <button type="button" className="note note-primary work-wage-missing" onClick={goProfile}>
            <Icon name="info" size={16} />
            <span>{t.wageMissing}</span>
            <Icon name="chevronDown" size={16} />
          </button>
        ) : null}
        {wageSet && calc.belowMinWage ? (
          <p data-testid="work-minwage-warning" className="note note-warn work-warning" role="alert">
            <Icon name="alert" size={16} />
            <span>
              {t.minWageWarning(calc.minWageHourly)}
              <span lang="ko" className="work-ko">
                {ko.minWageWarning(calc.minWageHourly)}
              </span>
            </span>
          </p>
        ) : null}
        <ul className="work-notes">
          {notes.map((id) => (
            <li key={id} data-testid={`work-note-${id}`} className="work-note">
              {NOTE_TEXT[id](t, workers)}
            </li>
          ))}
        </ul>
        <LegalBadge ids={calc.legalIds} />
      </section>

      {loadError ? (
        <StatusNote
          tone="danger"
          testId="work-load-error"
          role="alert"
          text={kit.loadFailed}
          ko={kitKo.loadFailed}
        />
      ) : null}
      {storageError ? (
        <StatusNote
          tone="danger"
          testId="work-storage-error"
          role="alert"
          data={{ code: storageError }}
          text={storageError === 'quota' ? kit.storageFull : kit.storageFailed}
          ko={storageError === 'quota' ? kitKo.storageFull : kitKo.storageFailed}
        />
      ) : null}
      {undo ? (
        <StatusNote
          tone="ok"
          testId="work-undo-note"
          role="status"
          text={kit.shiftDeleted}
          ko={kitKo.shiftDeleted}
          action={{ label: kit.undo, testId: 'work-undo', onClick: onUndo }}
        />
      ) : null}
      <ShiftForm t={t} ko={ko} today={today} onAdd={onAddShift} />
      <ShiftList t={t} ko={ko} shifts={monthShifts} onDelete={onDeleteShift} />
      <PhotoPanel
        today={today}
        month={month}
        shifts={shifts}
        reloadKey={photoReload}
        initialPhotos={props.initialShifts !== undefined ? [] : undefined}
      />

      <ProfileForm
        key={`profile-${version}`}
        t={t}
        ko={ko}
        profile={profile}
        saved={profileSaved}
        onSave={onSaveProfile}
      />

      <ComparePanel
        key={`compare-${month}-${version}`}
        t={t}
        ko={ko}
        lang={lang}
        calc={calc}
        submitted={submitted[month] ?? null}
        result={monthCompare}
        onRun={(input) => {
          setSubmitted((prev) => ({ ...prev, [month]: input }));
          touched();
        }}
      />

      <section className="card work-card">
        <Hint text={t.statementHint}>
          <h2 className="work-heading">
            <Icon name="edit" size={18} />
            {t.statementHeading}
          </h2>
        </Hint>
        <textarea
          data-testid="work-statement"
          className="input work-statement"
          lang="ko"
          rows={7}
          value={statementText}
          onChange={(e) => setStatement(e.target.value)}
        />
        {statement !== null ? (
          <button type="button" className="link-btn" onClick={() => setStatement(null)}>
            <Icon name="refresh" size={15} />
            {t.statementReset}
          </button>
        ) : null}
        <Hint text={t.pdfHint} className="work-pdf-hint">
          <button
            type="button"
            data-testid="work-pdf"
            className="btn btn-primary btn-lg btn-block"
            disabled={pdfBusy}
            onClick={() => void onPdf()}
          >
            <Icon name={pdfBusy ? 'refresh' : 'download'} size={20} className={pdfBusy ? 'spin' : undefined} />
            {pdfBusy ? t.pdfBusy : t.pdf}
          </button>
        </Hint>
        {pdfPhotoNote && !pdfError ? (
          <StatusNote
            tone="warn"
            testId="work-pdf-photo-note"
            role="status"
            data={{ reason: pdfPhotoNote.reason }}
            text={photoNoteText(kit, pdfPhotoNote)}
            ko={photoNoteText(kitKo, pdfPhotoNote)}
          />
        ) : null}
        {pdfError ? (
          <p data-testid="work-pdf-error" className="field-error" role="alert">
            {pdfError === 'empty' ? t.pdfErrorEmpty : pdfError === 'photos' ? kit.pdfPhotoBroken : t.pdfErrorLibrary}
            <span lang="ko" className="work-ko">
              {pdfError === 'empty' ? ko.pdfErrorEmpty : pdfError === 'photos' ? kitKo.pdfPhotoBroken : ko.pdfErrorLibrary}
            </span>
            {pdfError === 'photos' ? (
              <button
                type="button"
                data-testid="work-pdf-retry-nophotos"
                className="link-btn"
                disabled={pdfBusy}
                onClick={() => void onPdf({ withoutPhotos: true })}
              >
                {kit.pdfRetryNoPhotos}
              </button>
            ) : null}
          </p>
        ) : null}
      </section>

      {wipeAsk ? (
        <div className="card work-wipe-ask" role="alertdialog" aria-labelledby="work-wipe-q">
          <p id="work-wipe-q" className="work-wipe-q">
            <Icon name="alert" size={18} />
            {t.wipeAsk}
          </p>
          <p data-testid="work-wipe-photos-note" className="work-hint">
            {pt.wipeIncludesPhotos}
          </p>
          <div className="grid-2">
            <button type="button" className="btn btn-line" onClick={() => setWipeAsk(false)}>
              {t.wipeCancel}
            </button>
            <button type="button" data-testid="work-wipe-confirm" className="btn btn-danger" onClick={onWipe}>
              {t.wipeConfirm}
            </button>
          </div>
        </div>
      ) : (
        <button type="button" data-testid="work-wipe" className="btn btn-ghost btn-sm work-wipe" onClick={() => setWipeAsk(true)}>
          <Icon name="trash" size={16} />
          {t.wipe}
        </button>
      )}
      {wiped ? (
        <p className="note note-ok work-status" role="status">
          <Icon name="checkCircle" size={18} />
          {t.wiped}
        </p>
      ) : null}
    </main>
  );
}
