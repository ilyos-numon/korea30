import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProgressStorage } from '../quest/progress';
import { DB_NAME, openKoreaDb, resetDbForTest, type WorkPhoto, type WorkShift } from '../storage/db';
import { EMPTY_STAY_PROFILE, EMPTY_WORK_PROFILE } from '../storage/repos';
import { parseBackup, type BackupFileV1 } from './format';
import { collectBackup, currentCounts, dataSignature, restoreBackup } from './io';
import { BACKUP_CHANGED_EVENT, exportBackup } from './share';

vi.mock('../pdf/download', () => ({ downloadBlob: vi.fn() }));
import { downloadBlob } from '../pdf/download';

function deleteDb(): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => resolve();
  });
}

function memStorage(init: Record<string, string> = {}): ProgressStorage & { map: Map<string, string> } {
  const map = new Map(Object.entries(init));
  return {
    map,
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
  };
}

function shift(id: string, createdAt = 1): WorkShift {
  return { id, date: '2026-10-05', start: '09:00', end: '18:00', breakMinutes: 60, isHoliday: false, memo: 'm', createdAt };
}

function bytes(n: number, seed: number): ArrayBuffer {
  const b = new Uint8Array(n);
  for (let i = 0; i < n; i++) b[i] = (i * seed + 7) % 256;
  return b.buffer;
}

function photo(id: string): WorkPhoto {
  return {
    id,
    date: '2026-10-05',
    shiftId: 'a',
    memo: '',
    takenOn: '2026-10-05',
    takenOnSource: 'exif',
    savedAt: 100,
    expiresOn: '2027-04-05',
    expiryCustom: false,
    mime: 'image/jpeg',
    image: bytes(5000, 3),
    thumb: bytes(300, 5),
    width: 800,
    height: 600,
  };
}

async function seed(): Promise<void> {
  const db = await openKoreaDb();
  await db.put('shifts', shift('a'));
  await db.put('shifts', shift('b', 5));
  await db.put('workProfile', { id: 'me', ...EMPTY_WORK_PROFILE, hourlyWage: 12000 });
  await db.put('stayProfile', { id: 'me', ...EMPTY_STAY_PROFILE, visaType: 'E-9' });
  await db.put('settings', { id: 'photos', retentionMonths: 6 });
  await db.put('photos', photo('p1'));
}

const NOW = new Date('2026-10-29T03:00:00Z');

beforeEach(async () => {
  resetDbForTest();
  await deleteDb();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.mocked(downloadBlob).mockClear();
});

describe('collectBackup / restoreBackup', () => {
  it('왕복: collect → stringify → parse → restore → collect 가 같고 사진 바이트가 같다', async () => {
    await seed();
    const ls = memStorage({ 'korea30.progress.v1': '[1,2]', 'korea30.lang.v1': 'vi', 'other.key': 'keep' });
    const first = await collectBackup(ls, NOW);
    expect(first.idb.shifts).toHaveLength(2);
    expect(first.idb.photos).toHaveLength(1);
    expect(first.localStorage).toEqual({ 'korea30.progress.v1': '[1,2]', 'korea30.lang.v1': 'vi' });

    const parsed = parseBackup(JSON.stringify(first));
    if (!parsed.ok) throw new Error(parsed.error);

    // 다른 기기 상태로 바꾼 뒤 복원
    const db = await openKoreaDb();
    await db.clear('photos');
    await db.put('shifts', shift('zzz'));
    const target = memStorage({ 'korea30.intro.v1': '1', 'other.key': 'keep' });
    await restoreBackup(parsed.file, target);

    const second = await collectBackup(target, NOW);
    expect(second).toEqual(first);
    const restored = await db.get('photos', 'p1');
    expect(new Uint8Array(restored!.image)).toEqual(new Uint8Array(photo('p1').image));
    expect(new Uint8Array(restored!.thumb)).toEqual(new Uint8Array(photo('p1').thumb));
    expect(target.map.get('other.key')).toBe('keep');
  });

  it('백업에 없는 localStorage 키는 restore 후 제거된다', async () => {
    const file = await collectBackup(memStorage({ 'korea30.lang.v1': 'en' }), NOW);
    const target = memStorage({ 'korea30.progress.v1': '[1]', 'korea30.arrival.v1': '2026-10-01', 'korea30.lang.v1': 'vi' });
    await restoreBackup(file, target);
    expect(target.getItem('korea30.progress.v1')).toBeNull();
    expect(target.getItem('korea30.arrival.v1')).toBeNull();
    expect(target.getItem('korea30.lang.v1')).toBe('en');
  });

  it('null 프로필은 store 를 비운다', async () => {
    await seed();
    const empty: BackupFileV1 = {
      format: 'korea30-backup',
      version: 1,
      exportedAt: NOW.toISOString(),
      localStorage: {},
      idb: { shifts: [], workProfile: null, stayProfile: null, photoSettings: null, photos: [] },
    };
    await restoreBackup(empty, memStorage());
    const counts = await currentCounts(memStorage());
    expect(counts).toEqual({ shifts: 0, photos: 0, questDays: 0, stay: false, work: false, arrival: false });
  });

  it('복원 중 put 실패 시 기존 IDB·localStorage 가 그대로다', async () => {
    await seed();
    const ls = memStorage({ 'korea30.progress.v1': '[1,2]' });
    const before = await collectBackup(ls, NOW);

    const bad = await collectBackup(memStorage(), NOW);
    bad.idb.shifts = [shift('new1'), { ...shift('x'), id: undefined as unknown as string }];
    bad.idb.photos = [];
    await expect(restoreBackup(bad, ls)).rejects.toBeTruthy();

    expect(await collectBackup(ls, NOW)).toEqual(before);
    expect(ls.getItem('korea30.progress.v1')).toBe('[1,2]');
  });
});

describe('currentCounts / dataSignature', () => {
  it('빈 기기는 hasData=false, 데이터가 바뀌면 서명이 바뀐다', async () => {
    const ls = memStorage();
    const empty = await dataSignature(ls);
    expect(empty.hasData).toBe(false);

    await seed();
    ls.setItem('korea30.arrival.v1', '2026-10-01');
    const full = await dataSignature(ls);
    expect(full.hasData).toBe(true);
    expect(full.signature).not.toBe(empty.signature);
    expect(JSON.parse(full.signature)).toMatchObject({ s: 2, sMax: 5, p: 1, pMax: 100, arr: '2026-10-01', prog: null });

    expect(await currentCounts(ls)).toEqual({ shifts: 2, photos: 1, questDays: 0, stay: true, work: true, arrival: true });
  });
});

describe('exportBackup', () => {
  function stubWindow(): Event[] {
    const events: Event[] = [];
    vi.stubGlobal('window', { dispatchEvent: (e: Event) => (events.push(e), true) });
    return events;
  }

  it('Web Share 가능하면 공유하고 메타 저장·이벤트 발행', async () => {
    await seed();
    const events = stubWindow();
    const share = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { canShare: () => true, share });
    const ls = memStorage();

    expect(await exportBackup(ls, NOW)).toBe('shared');
    const arg = share.mock.calls[0][0] as { files: File[]; title: string };
    expect(arg.title).toBe('Korea30 backup');
    expect(arg.files[0].name).toMatch(/^korea30-backup-\d{4}-\d{2}-\d{2}\.json$/);
    const parsed = parseBackup(await arg.files[0].text());
    expect(parsed.ok).toBe(true);
    expect(downloadBlob).not.toHaveBeenCalled();

    const meta = JSON.parse(ls.getItem('korea30.backup.v1')!);
    expect(meta.lastBackupAt).toBe(NOW.getTime());
    expect(meta.signature).toBe((await dataSignature(ls)).signature);
    expect(events.map((e) => e.type)).toEqual([BACKUP_CHANGED_EVENT]);
  });

  it('canShare 없으면 다운로드', async () => {
    const events = stubWindow();
    vi.stubGlobal('navigator', {});
    const ls = memStorage();
    expect(await exportBackup(ls, NOW)).toBe('downloaded');
    expect(downloadBlob).toHaveBeenCalledTimes(1);
    expect(ls.getItem('korea30.backup.v1')).not.toBeNull();
    expect(events).toHaveLength(1);
  });

  it('canShare 가 false 면 다운로드', async () => {
    stubWindow();
    vi.stubGlobal('navigator', { canShare: () => false, share: vi.fn() });
    expect(await exportBackup(memStorage(), NOW)).toBe('downloaded');
  });

  it('사용자 취소(AbortError)는 cancelled, 메타·이벤트 없음', async () => {
    const events = stubWindow();
    const abort = Object.assign(new Error('cancel'), { name: 'AbortError' });
    vi.stubGlobal('navigator', { canShare: () => true, share: vi.fn().mockRejectedValue(abort) });
    const ls = memStorage();
    expect(await exportBackup(ls, NOW)).toBe('cancelled');
    expect(ls.getItem('korea30.backup.v1')).toBeNull();
    expect(events).toHaveLength(0);
  });

  it('그 외 공유 오류는 다운로드로 대체', async () => {
    stubWindow();
    vi.stubGlobal('navigator', { canShare: () => true, share: vi.fn().mockRejectedValue(new TypeError('boom')) });
    expect(await exportBackup(memStorage(), NOW)).toBe('downloaded');
    expect(downloadBlob).toHaveBeenCalledTimes(1);
  });
});
