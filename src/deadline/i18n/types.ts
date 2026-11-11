import type { DeadlineKind } from '../rules';

/** 기한 화면·배너 문자열. 값은 string 또는 함수만 (PLAN §4.3). kindTitle/alarm 은 IcsText 를 만족한다. */
export interface DeadlineStrings {
  title: string;
  intro: string;
  profileHeading: string;
  fieldEntry: string;
  fieldVisa: string;
  fieldExpiry: string;
  fieldArcDone: string;
  fieldArcDate: string;
  fieldMove: string;
  fieldContractEnd: string;
  fieldLeftJob: string;
  fieldPassportExpiry: string;
  visaChoose: string;
  visaOther: string;
  prefillNote: string;
  save: string;
  saved: string;
  errBadDate: string;
  errExpiryBeforeEntry: string;
  errMoveBeforeEntry: string;
  errFutureEntry: string;
  timelineHeading: string;
  empty: string;
  kindTitle: (kind: DeadlineKind) => string;
  levelOverdue: string;
  levelUrgent: string;
  levelSoon: string;
  levelOk: string;
  extensionOpenNow: string;
  dueOn: (date: string) => string;
  daysLeft: (n: number) => string;
  fineLabel: string;
  overstayHint: string;
  ask1345: string;
  ics: string;
  icsHint: string;
  icsErrorEmpty: string;
  icsErrorLibrary: string;
  alarm: (kind: DeadlineKind, daysBefore: number) => string;
  wipe: string;
  wiped: string;
  banner: (count: number) => string;
}
