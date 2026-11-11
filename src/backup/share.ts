import { downloadBlob } from '../pdf/download';
import { toIsoDate } from '../quest/arrival';
import type { ProgressStorage } from '../quest/progress';
import { backupFileName } from './format';
import { collectBackup, dataSignature } from './io';
import { saveBackupMeta } from './reminder';

export type ExportResult = 'shared' | 'downloaded' | 'cancelled';
export const BACKUP_CHANGED_EVENT = 'korea30:backup-changed';

function isAbortError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { name?: unknown }).name === 'AbortError';
}

/** err.name 이 비어 있지 않은 문자열이면 그 값, 아니면 'Unknown' */
export function exportErrorName(err: unknown): string {
  if (typeof err === 'object' && err !== null) {
    const name = (err as { name?: unknown }).name;
    if (typeof name === 'string' && name !== '') return name;
  }
  return 'Unknown';
}

/** collectBackup → Blob(application/json) → File. Web Share 가능하면 공유, 아니면 다운로드.
 *  공유가 AbortError 외 이유로 거부되면 다운로드로 대체한다. */
export async function exportBackup(storage: ProgressStorage, now: Date): Promise<ExportResult> {
  const backup = await collectBackup(storage, now);
  const name = backupFileName(toIsoDate(now));
  const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' });
  const file = new File([blob], name, { type: 'application/json' });

  let result: ExportResult;
  const nav = typeof navigator !== 'undefined' ? navigator : undefined;
  if (nav && typeof nav.share === 'function' && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: 'Korea30 backup' });
      result = 'shared';
    } catch (err) {
      if (isAbortError(err)) return 'cancelled';
      downloadBlob(blob, name);
      result = 'downloaded';
    }
  } else {
    downloadBlob(blob, name);
    result = 'downloaded';
  }

  const { signature } = await dataSignature(storage);
  saveBackupMeta(storage, { lastBackupAt: now.getTime(), signature });
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(BACKUP_CHANGED_EVENT));
  return result;
}
