/** 새 UI 의 공용 문자열(소개 페이지·? 도움말·급여 요약 등). 값은 string 또는 함수만. */
export interface UiKitStrings {
  moreInfo: string;
  koreanOriginal: string;
  aboutApp: string;
  introSkip: string;
  introNext: string;
  introStart: string;
  introStepAria: (step: number, total: number) => string;
  intro1Title: string;
  intro1Body: string;
  intro2Title: string;
  intro2Body: string;
  intro3Title: string;
  intro3Body: string;
  intro4Title: string;
  intro4Body: string;
  questTip: string;
  questAllDays: string;
  payslipMatch: string;
  payslipSkipped: string;
  payslipSummaryOk: string;
  payslipSummaryMismatch: (n: number) => string;
  prevMonth: string;
  nextMonth: string;
  all: string;
  copy: string;
  copied: string;
  /** 기기 저장 실패 (일반) */
  storageFailed: string;
  /** 기기 저장 실패 (용량 가득) */
  storageFull: string;
  /** 저장된 기록 읽기 실패 */
  loadFailed: string;
  /** 클립보드 복사 실패 */
  copyFailed: string;
  /** 근무 기록 삭제 알림 */
  shiftDeleted: string;
  /** 되돌리기 버튼 */
  undo: string;
  /** PDF 에 사진 n장이 빠짐 (용량 상한 + 변환 실패) */
  pdfPhotosSkipped: (n: number) => string;
  /** 사진을 읽지 못해 사진 없이 PDF 생성 */
  pdfPhotosUnread: string;
  /** 재판독 후 직접 고친 칸 n개 유지 */
  keptEdits: (n: number) => string;
  /** 재판독 값으로 바꾸기 */
  useScanned: string;
  // PWA
  pwaUpdateTitle: string;
  pwaUpdateReload: string;
  close: string;
  installTitle: string;
  installWhy: string;
  installButton: string;
  installIosStep1: string;
  installIosStep2: string;
  // 만료 사진
  expiredPhotosAsk: (n: number) => string;
  expiredPhotosHint: (years: number) => string;
  expiredPhotosDelete: string;
  expiredPhotosKeep: string;
  expiredPhotosDeleted: (n: number) => string;
  expiredPhotosKept: (n: number, until: string) => string;
  // 백업
  backupTitle: string;
  backupIntro: string;
  backupExport: string;
  backupImport: string;
  backupPreview: (shifts: number, photos: number, questDays: number) => string;
  backupReplaceWarn: string;
  backupRestore: string;
  backupCancel: string;
  backupExported: string;
  backupRestored: string;
  backupErrNotJson: string;
  backupErrOtherApp: string;
  backupErrNewer: string;
  backupErrDamaged: string;
  backupErrRestore: string;
  backupErrExport: string;
  backupRemind: string;
  backupNow: string;
  // 도착일·입국일·미리보기
  arrivalFilledEntry: string;
  entryFilledArrival: string;
  timelinePreview: string;
  // 퀘스트 저장 실패 (storageFull|storageFailed 뒤에 붙임)
  questNotSaved: string;
  // 증거 PDF
  pdfPhotoBroken: string;
  pdfRetryNoPhotos: string;
  pdfPhotosDropped: (n: number) => string;
}
