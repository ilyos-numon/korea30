import type { ProgressStorage } from '../quest/progress';

export const BACKUP_META_KEY = 'korea30.backup.v1';
export const BACKUP_REMIND_MS = 2 * 24 * 60 * 60 * 1000;

export interface BackupMeta {
  lastBackupAt: number;
  signature: string;
}

/** 파싱 실패 null */
export function loadBackupMeta(s: ProgressStorage): BackupMeta | null {
  try {
    const raw = s.getItem(BACKUP_META_KEY);
    if (raw === null) return null;
    const v: unknown = JSON.parse(raw);
    if (typeof v !== 'object' || v === null) return null;
    const { lastBackupAt, signature } = v as Record<string, unknown>;
    if (typeof lastBackupAt !== 'number' || !Number.isFinite(lastBackupAt) || typeof signature !== 'string') return null;
    return { lastBackupAt, signature };
  } catch {
    return null;
  }
}

/** 예외 삼키고 false */
export function saveBackupMeta(s: ProgressStorage, m: BackupMeta): boolean {
  try {
    s.setItem(BACKUP_META_KEY, JSON.stringify({ lastBackupAt: m.lastBackupAt, signature: m.signature }));
    return true;
  } catch {
    return false;
  }
}

/** !hasData → false · meta null → true · signature===meta.signature → false ·
 *  nowMs - meta.lastBackupAt > BACKUP_REMIND_MS → true · 그 외 false */
export function shouldRemind(meta: BackupMeta | null, signature: string, hasData: boolean, nowMs: number): boolean {
  if (!hasData) return false;
  if (meta === null) return true;
  if (signature === meta.signature) return false;
  return nowMs - meta.lastBackupAt > BACKUP_REMIND_MS;
}
