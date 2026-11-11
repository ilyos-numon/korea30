import type { PhotoStrings } from './types';

/** '-' when the value is missing or empty (never returns an empty string) */
const s = (v: unknown): string => {
  if (v === undefined || v === null) return '-';
  if (typeof v === 'number' && !Number.isFinite(v)) return '-';
  return String(v).trim() || '-';
};

/** "1 photo" / "3 photos"; unknown input keeps the plural form */
const photos = (n: unknown): string => `${s(n)} ${Number(n) === 1 ? 'photo' : 'photos'}`;

export const en: PhotoStrings = {
  heading: 'Work photos',
  intro: 'Save photos that show your work (time clock screen, shift schedule, etc.) with a date, on this device.',
  privacyNote: 'Photos are saved only on this device. Location and other photo details are removed before saving.',
  dateLabel: 'Work date',
  shiftLabel: 'Link to a shift',
  shiftNone: 'No link',
  shiftOption: (date, start, end) => `${s(date)} ${s(start)}–${s(end)}`,
  memoLabel: 'Memo',
  camera: 'Take a photo',
  pick: 'Choose a photo',
  saving: 'Saving…',
  saved: 'Saved',
  errorNotImage: 'Only image files can be saved.',
  errorTooLarge: (mb) => `This photo is too large. Choose a photo of ${s(mb)} MB or less.`,
  errorDecode: 'This photo cannot be opened. Choose another photo.',
  errorQuota: 'Not enough storage on this device. Try deleting older photos.',
  errorUnknown: 'Could not save. Please try again.',
  empty: 'No photos saved for this month.',
  takenOn: (date) => `Taken ${s(date)}`,
  takenOnSaved: (date) => `Saved ${s(date)} (no date taken)`,
  expiresOn: (date) => `Kept until ${s(date)}`,
  expiringSoon: (days) => `Keep period ends in ${s(days)} ${Number(days) === 1 ? 'day' : 'days'}`,
  linkedShift: (label) => `Linked shift: ${s(label)}`,
  open: 'View larger',
  close: 'Close',
  delete: 'Delete',
  deleteAsk: 'Delete this photo? A deleted photo cannot be restored.',
  deleteConfirm: 'Delete',
  deleteCancel: 'Cancel',
  expiryEditLabel: 'Change keep-until date',
  expirySave: 'Save date',
  expiryErrorFormat: 'Enter the date as YYYY-MM-DD.',
  expiryErrorNotFuture: 'Choose a date after today.',
  expiryCustomNote: 'You set this date. It stays the same even if the keep period setting changes.',
  retentionHeading: 'Photo keep period',
  retentionLabel: 'Keep period (months)',
  retentionHint:
    'This is an app setting, not a legal period. When the period ends, the app asks whether to delete the photos. To keep them longer, increase the period. Evidence about wages may be needed for longer, so increase the keep period or keep it separately as an evidence PDF.',
  retentionSave: 'Save keep period',
  retentionSaved: (changed) => `Saved. Recalculated the keep-until date of ${photos(changed)}.`,
  retentionError: (min, max) => `Enter a number from ${s(min)} to ${s(max)} months.`,
  retentionApplyAsk: (n) => `With this change, the keep period of ${photos(n)} ends right away. The app will ask whether to delete them. Change it?`,
  retentionApplyConfirm: 'Change',
  retentionApplyCancel: 'Cancel',
  purged: (n) => `Deleted ${photos(n)} past the keep period.`,
  months: (n) => `${s(n)} ${Number(n) === 1 ? 'month' : 'months'}`,
  wipeIncludesPhotos: 'Delete all also deletes your saved photos.',
};
