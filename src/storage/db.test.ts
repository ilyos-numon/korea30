import 'fake-indexeddb/auto';
import { openDB } from 'idb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DB_NAME, DB_VERSION, openKoreaDb, resetDbForTest, type WorkPhoto, type WorkShift } from './db';
import {
  EMPTY_STAY_PROFILE,
  EMPTY_WORK_PROFILE,
  photoRepo,
  PhotoStorageError,
  settingsRepo,
  shiftRepo,
  toPhotoStorageError,
  stayProfileRepo,
  wipeStayData,
  wipeWorkData,
  workProfileRepo,
} from './repos';

function deleteDb(): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => resolve();
  });
}

function shift(id: string, date: string, start: string): WorkShift {
  return { id, date, start, end: '18:00', breakMinutes: 60, isHoliday: false, memo: '', createdAt: 1 };
}

beforeEach(async () => {
  resetDbForTest();
  await deleteDb();
});

describe('storage repos', () => {
  it('put → get 으로 근무·프로필이 돌아온다', async () => {
    const s = shift('a', '2026-10-05', '09:00');
    await shiftRepo.put(s);
    expect(await shiftRepo.listAll()).toEqual([s]);

    expect(await workProfileRepo.get()).toBeNull();
    const wp = { id: 'me' as const, ...EMPTY_WORK_PROFILE, hourlyWage: 12000 };
    await workProfileRepo.put(wp);
    expect(await workProfileRepo.get()).toEqual(wp);

    expect(await stayProfileRepo.get()).toBeNull();
    const sp = { id: 'me' as const, ...EMPTY_STAY_PROFILE, visaType: 'E-9' as const, stayExpiry: '2027-03-01' };
    await stayProfileRepo.put(sp);
    expect(await stayProfileRepo.get()).toEqual(sp);
  });

  it('put 은 같은 id 를 덮어쓰고 remove 는 지운다', async () => {
    await shiftRepo.put(shift('a', '2026-10-05', '09:00'));
    await shiftRepo.put({ ...shift('a', '2026-10-05', '09:00'), memo: 'edited' });
    const all = await shiftRepo.listAll();
    expect(all).toHaveLength(1);
    expect(all[0].memo).toBe('edited');
    await shiftRepo.remove('a');
    expect(await shiftRepo.listAll()).toEqual([]);
  });

  it('listMonth 는 그 달의 첫날·마지막날을 포함하고 앞뒤 달은 뺀 뒤 date·start 순으로 준다', async () => {
    await shiftRepo.put(shift('prev', '2026-09-30', '09:00'));
    await shiftRepo.put(shift('last', '2026-10-31', '22:00'));
    await shiftRepo.put(shift('first-late', '2026-10-01', '13:00'));
    await shiftRepo.put(shift('first-early', '2026-10-01', '08:00'));
    await shiftRepo.put(shift('next', '2026-11-01', '00:00'));
    await shiftRepo.put(shift('feb-end', '2026-02-28', '09:00'));

    const oct = await shiftRepo.listMonth('2026-10');
    expect(oct.map((s) => s.id)).toEqual(['first-early', 'first-late', 'last']);

    const feb = await shiftRepo.listMonth('2026-02');
    expect(feb.map((s) => s.id)).toEqual(['feb-end']);

    expect(await shiftRepo.listMonth('2026-12')).toEqual([]);
  });

  it('wipeWorkData 는 근무·근무 프로필만, wipeStayData 는 체류 프로필만 비운다', async () => {
    await shiftRepo.put(shift('a', '2026-10-05', '09:00'));
    await workProfileRepo.put({ id: 'me', ...EMPTY_WORK_PROFILE });
    await stayProfileRepo.put({ id: 'me', ...EMPTY_STAY_PROFILE });

    await wipeWorkData();
    expect(await shiftRepo.listAll()).toEqual([]);
    expect(await workProfileRepo.get()).toBeNull();
    expect(await stayProfileRepo.get()).not.toBeNull();

    await wipeStayData();
    expect(await stayProfileRepo.get()).toBeNull();
  });

  it('EMPTY 프로필 기본값', () => {
    expect(EMPTY_WORK_PROFILE.hourlyWage).toBe(0);
    expect(EMPTY_WORK_PROFILE.workplace5Plus).toBe('unknown');
    expect(EMPTY_WORK_PROFILE.weekStartsOn).toBe(1);
    expect(EMPTY_WORK_PROFILE.startDate).toBeNull();
    expect(Object.values(EMPTY_STAY_PROFILE).every((v) => v === null)).toBe(true);
  });
});

function photo(id: string, date: string, savedAt: number, over: Partial<WorkPhoto> = {}): WorkPhoto {
  return {
    id,
    date,
    shiftId: null,
    memo: '',
    takenOn: date,
    takenOnSource: 'exif',
    savedAt,
    expiresOn: '2028-10-20',
    expiryCustom: false,
    mime: 'image/jpeg',
    image: new Uint8Array([1, 2, 3]).buffer,
    thumb: new Uint8Array([4, 5]).buffer,
    width: 1600,
    height: 1200,
    ...over,
  };
}

describe('IndexedDB v2 upgrade', () => {
  it('DB_VERSION 은 2', () => {
    expect(DB_VERSION).toBe(2);
  });

  it('v1 DB(시프트 1건)를 v2 로 열면 시프트가 남고 photos·settings 스토어가 생긴다', async () => {
    const v1 = await openDB(DB_NAME, 1, {
      upgrade(db) {
        const shifts = db.createObjectStore('shifts', { keyPath: 'id' });
        shifts.createIndex('by-date', 'date');
        db.createObjectStore('workProfile', { keyPath: 'id' });
        db.createObjectStore('stayProfile', { keyPath: 'id' });
      },
    });
    const s = shift('old', '2026-09-01', '09:00');
    await v1.put('shifts', s);
    v1.close();

    resetDbForTest();
    expect(await shiftRepo.listAll()).toEqual([s]);
    expect(await shiftRepo.listMonth('2026-09')).toEqual([s]);
    expect(await photoRepo.listAll()).toEqual([]);

    const db = await openKoreaDb();
    expect(db.version).toBe(2);
    expect(Array.from(db.objectStoreNames).sort()).toEqual(
      ['photos', 'settings', 'shifts', 'stayProfile', 'workProfile'].sort(),
    );
    const tx = db.transaction('photos');
    expect(Array.from(tx.store.indexNames).sort()).toEqual(['by-date', 'by-expires']);
    await tx.done;
    expect(await settingsRepo.getRetentionMonths()).toBe(24);
  });
});

describe('photoRepo', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('put → get 은 ArrayBuffer 를 포함해 그대로 돌려주고 없는 id 는 null', async () => {
    const p = photo('a', '2026-10-05', 1);
    await photoRepo.put(p);
    const got = await photoRepo.get('a');
    expect(got).not.toBeNull();
    expect(got?.memo).toBe('');
    expect(Array.from(new Uint8Array(got!.image))).toEqual([1, 2, 3]);
    expect(Array.from(new Uint8Array(got!.thumb))).toEqual([4, 5]);
    expect(await photoRepo.get('missing')).toBeNull();
  });

  it('listMonth 는 첫날·마지막날 포함, 앞뒤 달 제외, date·savedAt 순', async () => {
    await photoRepo.put(photo('prev', '2026-09-30', 1));
    await photoRepo.put(photo('last', '2026-10-31', 1));
    await photoRepo.put(photo('first-late', '2026-10-01', 20));
    await photoRepo.put(photo('first-early', '2026-10-01', 10));
    await photoRepo.put(photo('next', '2026-11-01', 1));

    const oct = await photoRepo.listMonth('2026-10');
    expect(oct.map((p) => p.id)).toEqual(['first-early', 'first-late', 'last']);
    expect(await photoRepo.listMonth('2026-12')).toEqual([]);

    const all = await photoRepo.listAll();
    expect(all.map((p) => p.id)).toEqual(['prev', 'first-early', 'first-late', 'last', 'next']);
  });

  it('remove 는 그 사진만 지운다', async () => {
    await photoRepo.put(photo('a', '2026-10-05', 1));
    await photoRepo.put(photo('b', '2026-10-06', 1));
    await photoRepo.remove('a');
    expect((await photoRepo.listAll()).map((p) => p.id)).toEqual(['b']);
  });

  it('updateMeta 는 지정한 필드만 바꾸고 없는 id 는 무시한다', async () => {
    await photoRepo.put(photo('a', '2026-10-05', 1, { shiftId: 's1' }));
    await photoRepo.updateMeta('a', { memo: '야간', expiresOn: '2030-01-01', expiryCustom: true });
    const got = await photoRepo.get('a');
    expect(got?.memo).toBe('야간');
    expect(got?.expiresOn).toBe('2030-01-01');
    expect(got?.expiryCustom).toBe(true);
    expect(got?.shiftId).toBe('s1');
    expect(got?.date).toBe('2026-10-05');

    await photoRepo.updateMeta('a', { shiftId: null, date: '2026-10-06' });
    const moved = await photoRepo.get('a');
    expect(moved?.shiftId).toBeNull();
    expect(moved?.date).toBe('2026-10-06');
    expect(moved?.memo).toBe('야간');

    await photoRepo.updateMeta('missing', { memo: 'x' });
    expect(await photoRepo.get('missing')).toBeNull();
    expect(await photoRepo.listAll()).toHaveLength(1);
  });

  it('unlinkShift 는 그 시프트를 가리키는 사진만 shiftId=null 로 바꾸고 수를 준다', async () => {
    await photoRepo.put(photo('a', '2026-10-05', 1, { shiftId: 's1' }));
    await photoRepo.put(photo('b', '2026-10-05', 2, { shiftId: 's1' }));
    await photoRepo.put(photo('c', '2026-10-06', 1, { shiftId: 's2' }));
    await photoRepo.put(photo('d', '2026-10-07', 1));

    expect(await photoRepo.unlinkShift('s1')).toBe(2);
    const byId = Object.fromEntries((await photoRepo.listAll()).map((p) => [p.id, p.shiftId]));
    expect(byId).toEqual({ a: null, b: null, c: 's2', d: null });
    expect(await photoRepo.unlinkShift('s1')).toBe(0);
    expect(await photoRepo.unlinkShift('none')).toBe(0);
  });

  it('purgeExpired 는 expiresOn <= today 를 지우고 today+1 은 남긴다', async () => {
    await photoRepo.put(photo('past', '2026-01-01', 1, { expiresOn: '2028-10-19' }));
    await photoRepo.put(photo('today', '2026-01-02', 1, { expiresOn: '2028-10-20' }));
    await photoRepo.put(photo('tomorrow', '2026-01-03', 1, { expiresOn: '2028-10-21' }));

    expect(await photoRepo.purgeExpired('2028-10-20')).toBe(2);
    expect((await photoRepo.listAll()).map((p) => p.id)).toEqual(['tomorrow']);
    expect(await photoRepo.purgeExpired('2028-10-20')).toBe(0);
  });

  it('listExpired 는 expiresOn <= today 를 돌려주고 내일 만료는 뺀다 (지우지 않음)', async () => {
    await photoRepo.put(photo('past', '2026-01-01', 1, { expiresOn: '2028-10-19' }));
    await photoRepo.put(photo('today', '2026-01-02', 1, { expiresOn: '2028-10-20' }));
    await photoRepo.put(photo('tomorrow', '2026-01-03', 1, { expiresOn: '2028-10-21' }));

    const ids = (await photoRepo.listExpired('2028-10-20')).map((p) => p.id).sort();
    expect(ids).toEqual(['past', 'today']);
    expect((await photoRepo.listAll()).length).toBe(3);
    expect(await photoRepo.listExpired('2028-10-18')).toEqual([]);
  });

  it('removeMany 는 주어진 id 만 지우고 없는 id 는 무시, 지운 수를 돌려준다', async () => {
    await photoRepo.put(photo('a', '2026-01-01', 1));
    await photoRepo.put(photo('b', '2026-01-02', 1));
    await photoRepo.put(photo('c', '2026-01-03', 1));

    expect(await photoRepo.removeMany(['a', 'missing', 'c'])).toBe(2);
    expect((await photoRepo.listAll()).map((p) => p.id)).toEqual(['b']);
    expect(await photoRepo.removeMany(['missing'])).toBe(0);
    expect(await photoRepo.removeMany([])).toBe(0);
  });

  it('applyRetention 은 expiryCustom=false 만 다시 계산하고 직접 고친 사진은 둔다', async () => {
    await photoRepo.put(photo('auto', '2026-10-21', 1, { takenOn: '2026-10-20', expiresOn: '2028-10-20' }));
    await photoRepo.put(
      photo('leap', '2026-10-22', 1, { takenOn: '2024-02-29', expiresOn: '2026-02-28' }),
    );
    await photoRepo.put(
      photo('custom', '2026-10-23', 1, { takenOn: '2026-10-20', expiresOn: '2031-01-01', expiryCustom: true }),
    );

    expect(await photoRepo.applyRetention(36)).toBe(2);
    expect((await photoRepo.get('auto'))?.expiresOn).toBe('2029-10-20');
    expect((await photoRepo.get('leap'))?.expiresOn).toBe('2027-02-28');
    expect((await photoRepo.get('custom'))?.expiresOn).toBe('2031-01-01');
    // 같은 기간으로 다시 적용하면 바뀐 수 0
    expect(await photoRepo.applyRetention(36)).toBe(0);
  });

  it('put 이 QuotaExceededError 를 만나면 PhotoStorageError(quota) 를 던진다', async () => {
    await openKoreaDb();
    vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(() => {
      throw new DOMException('quota exceeded', 'QuotaExceededError');
    });
    const err = await photoRepo.put(photo('a', '2026-10-05', 1)).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(PhotoStorageError);
    expect((err as PhotoStorageError).code).toBe('quota');
    vi.restoreAllMocks();
    expect(await photoRepo.listAll()).toEqual([]);
  });

  it('put 의 그 밖 실패는 PhotoStorageError(unknown)', async () => {
    await openKoreaDb();
    vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(() => {
      throw new Error('boom');
    });
    const err = await photoRepo.put(photo('a', '2026-10-05', 1)).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(PhotoStorageError);
    expect((err as PhotoStorageError).code).toBe('unknown');
  });

  it('toPhotoStorageError 는 name 또는 code 22 로 quota 를 알아본다', () => {
    expect(toPhotoStorageError(new DOMException('x', 'QuotaExceededError')).code).toBe('quota');
    expect(toPhotoStorageError({ code: 22 }).code).toBe('quota');
    expect(toPhotoStorageError(new Error('x')).code).toBe('unknown');
    expect(toPhotoStorageError('str').code).toBe('unknown');
    const already = new PhotoStorageError('quota');
    expect(toPhotoStorageError(already)).toBe(already);
  });
});

describe('settingsRepo', () => {
  it('저장 전에는 기본 24개월, 저장하면 그 값을 돌려준다', async () => {
    expect(await settingsRepo.getRetentionMonths()).toBe(24);
    await settingsRepo.setRetentionMonths(36);
    expect(await settingsRepo.getRetentionMonths()).toBe(36);
    await settingsRepo.setRetentionMonths(1);
    expect(await settingsRepo.getRetentionMonths()).toBe(1);
  });

  it('범위 밖·정수 아님은 RangeError 를 던지고 값을 바꾸지 않는다', async () => {
    await settingsRepo.setRetentionMonths(12);
    await expect(settingsRepo.setRetentionMonths(0)).rejects.toBeInstanceOf(RangeError);
    await expect(settingsRepo.setRetentionMonths(121)).rejects.toBeInstanceOf(RangeError);
    await expect(settingsRepo.setRetentionMonths(2.5)).rejects.toBeInstanceOf(RangeError);
    expect(await settingsRepo.getRetentionMonths()).toBe(12);
  });
});

describe('wipeWorkData (v2)', () => {
  it('사진·사진 설정도 비우고 체류 프로필은 남긴다', async () => {
    await shiftRepo.put(shift('a', '2026-10-05', '09:00'));
    await workProfileRepo.put({ id: 'me', ...EMPTY_WORK_PROFILE });
    await stayProfileRepo.put({ id: 'me', ...EMPTY_STAY_PROFILE });
    await photoRepo.put(photo('p', '2026-10-05', 1, { shiftId: 'a' }));
    await settingsRepo.setRetentionMonths(60);

    await wipeWorkData();
    expect(await shiftRepo.listAll()).toEqual([]);
    expect(await workProfileRepo.get()).toBeNull();
    expect(await photoRepo.listAll()).toEqual([]);
    expect(await settingsRepo.getRetentionMonths()).toBe(24);
    expect(await stayProfileRepo.get()).not.toBeNull();
  });
});
