export type StorageFailure = 'quota' | 'unknown';

/** toPhotoStorageError(err).code 와 같은 규칙 (QuotaExceededError 또는 code 22 → 'quota') */
export function classifyStorageError(err: unknown): StorageFailure {
  if (typeof err === 'object' && err !== null) {
    const e = err as { name?: unknown; code?: unknown };
    if (e.name === 'QuotaExceededError' || e.code === 22) return 'quota';
  }
  return 'unknown';
}
