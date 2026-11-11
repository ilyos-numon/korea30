import type { PhotoSettings, StayProfile, WorkPhoto, WorkProfile, WorkShift } from '../storage/db';

export const BACKUP_FORMAT = 'korea30-backup';
export const BACKUP_VERSION = 1;
export const BACKUP_LS_KEYS = ['korea30.progress.v1', 'korea30.arrival.v1', 'korea30.lang.v1', 'korea30.intro.v1'] as const;
export type BackupLsKey = (typeof BACKUP_LS_KEYS)[number];

/** image/thumb = base64 (data: 접두 없음) */
export type BackupPhotoV1 = Omit<WorkPhoto, 'image' | 'thumb'> & { image: string; thumb: string };

export interface BackupFileV1 {
  format: typeof BACKUP_FORMAT;
  version: 1;
  exportedAt: string;
  localStorage: Partial<Record<BackupLsKey, string>>;
  idb: {
    shifts: WorkShift[];
    workProfile: WorkProfile | null;
    stayProfile: StayProfile | null;
    photoSettings: PhotoSettings | null;
    photos: BackupPhotoV1[];
  };
}

export interface BackupCounts {
  shifts: number;
  photos: number;
  questDays: number;
  stay: boolean;
  work: boolean;
  arrival: boolean;
}

export type BackupParseError = 'notJson' | 'otherApp' | 'newerVersion' | 'damaged';

const BASE64_RE = /^[A-Za-z0-9+/]*={0,2}$/;

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isObjectOrNull(v: unknown): boolean {
  return v === null || isObject(v);
}

function validShift(v: unknown): boolean {
  if (!isObject(v)) return false;
  return (
    typeof v.id === 'string' &&
    typeof v.date === 'string' &&
    typeof v.start === 'string' &&
    typeof v.end === 'string' &&
    typeof v.breakMinutes === 'number' &&
    typeof v.isHoliday === 'boolean'
  );
}

function validPhoto(v: unknown): boolean {
  if (!isObject(v)) return false;
  return (
    typeof v.id === 'string' &&
    typeof v.date === 'string' &&
    typeof v.takenOn === 'string' &&
    typeof v.expiresOn === 'string' &&
    v.mime === 'image/jpeg' &&
    typeof v.image === 'string' &&
    BASE64_RE.test(v.image) &&
    typeof v.thumb === 'string' &&
    BASE64_RE.test(v.thumb)
  );
}

function validLocalStorage(v: unknown): boolean {
  if (!isObject(v)) return false;
  const allowed: readonly string[] = BACKUP_LS_KEYS;
  return Object.entries(v).every(([k, val]) => allowed.includes(k) && typeof val === 'string');
}

function validIdb(v: unknown): boolean {
  if (!isObject(v)) return false;
  for (const k of ['shifts', 'workProfile', 'stayProfile', 'photoSettings', 'photos']) {
    if (!(k in v)) return false;
  }
  if (!Array.isArray(v.shifts) || !Array.isArray(v.photos)) return false;
  if (!isObjectOrNull(v.workProfile) || !isObjectOrNull(v.stayProfile) || !isObjectOrNull(v.photoSettings)) return false;
  return v.shifts.every(validShift) && v.photos.every(validPhoto);
}

/** JSON.parse 실패 notJson · format 다름 otherApp · version>1 newerVersion · 그 외 검사 실패 damaged */
export function parseBackup(text: string): { ok: true; file: BackupFileV1 } | { ok: false; error: BackupParseError } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: 'notJson' };
  }
  if (!isObject(parsed) || parsed.format !== BACKUP_FORMAT) return { ok: false, error: 'otherApp' };
  if (typeof parsed.version === 'number' && parsed.version > BACKUP_VERSION) return { ok: false, error: 'newerVersion' };
  if (parsed.version !== BACKUP_VERSION) return { ok: false, error: 'damaged' };
  if (!validLocalStorage(parsed.localStorage) || !validIdb(parsed.idb)) return { ok: false, error: 'damaged' };
  return { ok: true, file: parsed as unknown as BackupFileV1 };
}

/** questDays = progress JSON 배열 길이(파싱 실패 0) */
export function countBackup(file: BackupFileV1): BackupCounts {
  let questDays = 0;
  const raw = file.localStorage['korea30.progress.v1'];
  if (raw !== undefined) {
    try {
      const p: unknown = JSON.parse(raw);
      if (Array.isArray(p)) questDays = p.length;
    } catch {
      questDays = 0;
    }
  }
  return {
    shifts: file.idb.shifts.length,
    photos: file.idb.photos.length,
    questDays,
    stay: file.idb.stayProfile !== null,
    work: file.idb.workProfile !== null,
    arrival: file.localStorage['korea30.arrival.v1'] !== undefined,
  };
}

export function backupFileName(today: string): string {
  return `korea30-backup-${today}.json`;
}

const CHUNK = 0x8000;

export function toBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin);
}

export function fromBase64(s: string): ArrayBuffer {
  const bin = atob(s);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}
