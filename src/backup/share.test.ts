import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProgressStorage } from '../quest/progress';
import { DB_NAME, resetDbForTest } from '../storage/db';
import { downloadBlob } from '../pdf/download';
import { loadBackupMeta } from './reminder';
import { exportBackup, exportErrorName } from './share';

vi.mock('../pdf/download', () => ({ downloadBlob: vi.fn() }));

function deleteDb(): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => resolve();
  });
}

function memStorage(init: Record<string, string> = {}): ProgressStorage {
  const map = new Map(Object.entries(init));
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
  };
}

const now = new Date(2026, 9, 20, 10, 0, 0);
const dl = vi.mocked(downloadBlob);

function stubShare(share: () => Promise<void>): void {
  vi.stubGlobal('navigator', { share: vi.fn(share), canShare: () => true });
}

beforeEach(async () => {
  resetDbForTest();
  await deleteDb();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('exportBackup', () => {
  it('share rejected with NotAllowedError → download fallback, meta saved', async () => {
    stubShare(() => Promise.reject(new DOMException('x', 'NotAllowedError')));
    const storage = memStorage();
    expect(await exportBackup(storage, now)).toBe('downloaded');
    expect(dl).toHaveBeenCalledTimes(1);
    expect(dl.mock.calls[0][1]).toMatch(/^korea30-backup-2026-10-20\.json$/);
    expect(loadBackupMeta(storage)?.lastBackupAt).toBe(now.getTime());
  });

  it('share rejected with TypeError → download fallback', async () => {
    stubShare(() => Promise.reject(new TypeError('x')));
    const storage = memStorage();
    expect(await exportBackup(storage, now)).toBe('downloaded');
    expect(dl).toHaveBeenCalledTimes(1);
    expect(loadBackupMeta(storage)?.lastBackupAt).toBe(now.getTime());
  });

  it('share rejected with AbortError → cancelled, no download, no meta', async () => {
    stubShare(() => Promise.reject(new DOMException('x', 'AbortError')));
    const storage = memStorage();
    expect(await exportBackup(storage, now)).toBe('cancelled');
    expect(dl).toHaveBeenCalledTimes(0);
    expect(loadBackupMeta(storage)).toBeNull();
  });

  it('share resolves → shared, no download, meta saved', async () => {
    stubShare(() => Promise.resolve());
    const storage = memStorage();
    expect(await exportBackup(storage, now)).toBe('shared');
    expect(dl).toHaveBeenCalledTimes(0);
    expect(loadBackupMeta(storage)?.lastBackupAt).toBe(now.getTime());
  });

  it('no navigator.share → downloaded', async () => {
    vi.stubGlobal('navigator', {});
    const storage = memStorage();
    expect(await exportBackup(storage, now)).toBe('downloaded');
    expect(dl).toHaveBeenCalledTimes(1);
  });

  it('share rejected and download throws → rejects with that error, no meta', async () => {
    stubShare(() => Promise.reject(new DOMException('x', 'NotAllowedError')));
    dl.mockImplementationOnce(() => {
      throw new DOMException('x', 'SecurityError');
    });
    const storage = memStorage();
    await expect(exportBackup(storage, now)).rejects.toMatchObject({ name: 'SecurityError' });
    expect(loadBackupMeta(storage)).toBeNull();
  });
});

describe('exportErrorName', () => {
  it('returns err.name for errors', () => {
    expect(exportErrorName(new DOMException('x', 'NotAllowedError'))).toBe('NotAllowedError');
    expect(exportErrorName(new TypeError('x'))).toBe('TypeError');
  });

  it('returns Unknown for values without a usable name', () => {
    expect(exportErrorName({})).toBe('Unknown');
    expect(exportErrorName(null)).toBe('Unknown');
    expect(exportErrorName('str')).toBe('Unknown');
    expect(exportErrorName({ name: '' })).toBe('Unknown');
    expect(exportErrorName(undefined)).toBe('Unknown');
  });
});
