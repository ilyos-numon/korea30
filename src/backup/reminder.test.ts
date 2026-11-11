import { describe, expect, it } from 'vitest';
import type { ProgressStorage } from '../quest/progress';
import { BACKUP_META_KEY, BACKUP_REMIND_MS, loadBackupMeta, saveBackupMeta, shouldRemind, type BackupMeta } from './reminder';

function memStorage(init: Record<string, string> = {}): ProgressStorage & { map: Map<string, string> } {
  const map = new Map(Object.entries(init));
  return {
    map,
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
  };
}

const T0 = Date.UTC(2026, 9, 1, 9, 0, 0);
const meta: BackupMeta = { lastBackupAt: T0, signature: 'old' };

describe('shouldRemind', () => {
  it('no data → false (even with no backup history)', () => {
    expect(shouldRemind(null, 'x', false, T0 + 10 * BACKUP_REMIND_MS)).toBe(false);
    expect(shouldRemind(meta, 'new', false, T0 + 10 * BACKUP_REMIND_MS)).toBe(false);
  });

  it('data but never backed up → true', () => {
    expect(shouldRemind(null, 'x', true, T0)).toBe(true);
  });

  it('same signature as last backup → false even long after', () => {
    expect(shouldRemind(meta, 'old', true, T0 + 30 * BACKUP_REMIND_MS)).toBe(false);
  });

  it('changed and more than 2 days → true', () => {
    expect(shouldRemind(meta, 'new', true, T0 + 3 * 24 * 60 * 60 * 1000)).toBe(true);
  });

  it('changed but within 2 days → false', () => {
    expect(shouldRemind(meta, 'new', true, T0 + 60 * 60 * 1000)).toBe(false);
  });

  it('boundary: exactly 2 days → false, 2 days + 1ms → true', () => {
    expect(BACKUP_REMIND_MS).toBe(2 * 24 * 60 * 60 * 1000);
    expect(shouldRemind(meta, 'new', true, T0 + BACKUP_REMIND_MS)).toBe(false);
    expect(shouldRemind(meta, 'new', true, T0 + BACKUP_REMIND_MS + 1)).toBe(true);
  });
});

describe('loadBackupMeta / saveBackupMeta', () => {
  it('round-trips under korea30.backup.v1', () => {
    const s = memStorage();
    expect(BACKUP_META_KEY).toBe('korea30.backup.v1');
    expect(saveBackupMeta(s, meta)).toBe(true);
    expect(JSON.parse(s.map.get(BACKUP_META_KEY) ?? '')).toEqual(meta);
    expect(loadBackupMeta(s)).toEqual(meta);
  });

  it('missing or broken value → null', () => {
    expect(loadBackupMeta(memStorage())).toBeNull();
    expect(loadBackupMeta(memStorage({ [BACKUP_META_KEY]: '{oops' }))).toBeNull();
    expect(loadBackupMeta(memStorage({ [BACKUP_META_KEY]: '{"lastBackupAt":"1","signature":"s"}' }))).toBeNull();
    expect(loadBackupMeta(memStorage({ [BACKUP_META_KEY]: 'null' }))).toBeNull();
  });

  it('setItem throwing → false', () => {
    const s: ProgressStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('quota');
      },
      removeItem: () => {},
    };
    expect(saveBackupMeta(s, meta)).toBe(false);
  });
});
