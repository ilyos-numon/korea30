import type { PhotoStrings } from './types';

/** 값이 없거나 빈 문자열이면 '-' (모르는 인자에도 빈 문자열이 아닌 값) */
const s = (v: unknown): string => {
  if (v === undefined || v === null) return '-';
  if (typeof v === 'number' && !Number.isFinite(v)) return '-';
  return String(v).trim() || '-';
};

export const ko: PhotoStrings = {
  heading: '사진 기록',
  intro: '근무를 보여 주는 사진(출퇴근 기록기 화면, 근무표 등)을 날짜와 함께 이 기기 안에 저장해요.',
  privacyNote: '사진은 이 기기 안에만 저장돼요. 위치정보 같은 사진 정보는 지우고 저장해요.',
  dateLabel: '근무 날짜',
  shiftLabel: '연결할 근무',
  shiftNone: '연결 안 함',
  shiftOption: (date, start, end) => `${s(date)} ${s(start)}~${s(end)}`,
  memoLabel: '메모',
  camera: '카메라로 찍기',
  pick: '사진 고르기',
  saving: '저장 중…',
  saved: '저장했어요',
  errorNotImage: '사진 파일만 저장할 수 있어요.',
  errorTooLarge: (mb) => `사진이 너무 커요. ${s(mb)}MB 이하 사진을 골라 주세요.`,
  errorDecode: '이 사진을 열 수 없어요. 다른 사진을 골라 주세요.',
  errorQuota: '기기 저장 공간이 부족해요. 오래된 사진을 지워 보세요.',
  errorUnknown: '저장하지 못했어요. 다시 해 보세요.',
  empty: '이 달에 저장한 사진이 없어요.',
  takenOn: (date) => `촬영일 ${s(date)}`,
  takenOnSaved: (date) => `저장일 ${s(date)} (촬영일 정보 없음)`,
  expiresOn: (date) => `보관 기간 ${s(date)}까지`,
  expiringSoon: (days) => `${s(days)}일 후 보관 기간이 끝나요`,
  linkedShift: (label) => `연결한 근무: ${s(label)}`,
  open: '크게 보기',
  close: '닫기',
  delete: '삭제',
  deleteAsk: '이 사진을 지울까요? 지운 사진은 되돌릴 수 없어요.',
  deleteConfirm: '지우기',
  deleteCancel: '취소',
  expiryEditLabel: '보관 기한 바꾸기',
  expirySave: '날짜 저장',
  expiryErrorFormat: '날짜를 YYYY-MM-DD 형식으로 적어 주세요.',
  expiryErrorNotFuture: '오늘 뒤 날짜를 고르세요.',
  expiryCustomNote: '직접 정한 날짜예요. 보관 기간 설정이 바뀌어도 그대로예요.',
  retentionHeading: '사진 보관 기간',
  retentionLabel: '보관 기간(개월)',
  retentionHint:
    '이 앱의 설정값이며 법정 기간이 아니에요. 기간이 지나면 앱을 열 때 사진을 지울지 물어봐요. 더 오래 두려면 기간을 늘리세요. 임금 관련 증거는 더 오래 필요할 수 있으니 보관 기간을 늘리거나 증거 PDF 로 따로 보관하세요.',
  retentionSave: '보관 기간 저장',
  retentionSaved: (changed) => `저장했어요. 사진 ${s(changed)}장의 보관 기한을 다시 계산했어요.`,
  retentionError: (min, max) => `${s(min)}~${s(max)}개월 사이로 적어 주세요.`,
  retentionApplyAsk: (n) => `이렇게 바꾸면 사진 ${s(n)}장의 보관 기간이 바로 끝나요. 앱을 열 때 지울지 물어봐요. 바꿀까요?`,
  retentionApplyConfirm: '바꾸기',
  retentionApplyCancel: '취소',
  purged: (n) => `보관 기간이 지난 사진 ${s(n)}장을 지웠어요.`,
  months: (n) => `${s(n)}개월`,
  wipeIncludesPhotos: '전체 지우기는 저장한 사진도 함께 지워요.',
};
