import {
  computeExpiresOn,
  DEFAULT_RETENTION_MONTHS,
  validateRetentionMonths,
} from '../worklog/photos/expiry';
import { openKoreaDb, type StayProfile, type WorkPhoto, type WorkProfile, type WorkShift } from './db';

function compareShift(a: WorkShift, b: WorkShift): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1;
  if (a.start !== b.start) return a.start < b.start ? -1 : 1;
  return 0;
}

export const shiftRepo = {
  /** yearMonth: 'YYYY-MM'. date 오름차순, 같은 날은 start 오름차순. */
  async listMonth(yearMonth: string): Promise<WorkShift[]> {
    const db = await openKoreaDb();
    const range = IDBKeyRange.bound(`${yearMonth}-01`, `${yearMonth}-31`);
    const rows = await db.getAllFromIndex('shifts', 'by-date', range);
    return rows.sort(compareShift);
  },
  async listAll(): Promise<WorkShift[]> {
    const db = await openKoreaDb();
    const rows = await db.getAll('shifts');
    return rows.sort(compareShift);
  },
  async put(s: WorkShift): Promise<void> {
    const db = await openKoreaDb();
    await db.put('shifts', s);
  },
  async remove(id: string): Promise<void> {
    const db = await openKoreaDb();
    await db.delete('shifts', id);
  },
};

export const workProfileRepo = {
  async get(): Promise<WorkProfile | null> {
    const db = await openKoreaDb();
    return (await db.get('workProfile', 'me')) ?? null;
  },
  async put(p: WorkProfile): Promise<void> {
    const db = await openKoreaDb();
    await db.put('workProfile', p);
  },
};

export const stayProfileRepo = {
  async get(): Promise<StayProfile | null> {
    const db = await openKoreaDb();
    return (await db.get('stayProfile', 'me')) ?? null;
  },
  async put(p: StayProfile): Promise<void> {
    const db = await openKoreaDb();
    await db.put('stayProfile', p);
  },
};

export type PhotoStorageErrorCode = 'quota' | 'unknown';

export class PhotoStorageError extends Error {
  readonly code: PhotoStorageErrorCode;
  constructor(code: PhotoStorageErrorCode, cause?: unknown) {
    super(`photo storage failed: ${code}`, { cause });
    this.name = 'PhotoStorageError';
    this.code = code;
  }
}

/** DOMException name 'QuotaExceededError' (또는 code 22) → 'quota', 그 밖 → 'unknown' */
export function toPhotoStorageError(err: unknown): PhotoStorageError {
  if (err instanceof PhotoStorageError) return err;
  if (typeof err === 'object' && err !== null) {
    const e = err as { name?: unknown; code?: unknown };
    if (e.name === 'QuotaExceededError' || e.code === 22) return new PhotoStorageError('quota', err);
  }
  return new PhotoStorageError('unknown', err);
}

function comparePhoto(a: WorkPhoto, b: WorkPhoto): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1;
  return a.savedAt - b.savedAt;
}

export const photoRepo = {
  /** yearMonth: 'YYYY-MM'. date 오름차순, 같은 날은 savedAt 오름차순. */
  async listMonth(yearMonth: string): Promise<WorkPhoto[]> {
    const db = await openKoreaDb();
    const range = IDBKeyRange.bound(`${yearMonth}-01`, `${yearMonth}-31`);
    const rows = await db.getAllFromIndex('photos', 'by-date', range);
    return rows.sort(comparePhoto);
  },
  async listAll(): Promise<WorkPhoto[]> {
    const db = await openKoreaDb();
    const rows = await db.getAll('photos');
    return rows.sort(comparePhoto);
  },
  async get(id: string): Promise<WorkPhoto | null> {
    const db = await openKoreaDb();
    return (await db.get('photos', id)) ?? null;
  },
  /** 실패 시 PhotoStorageError throw */
  async put(p: WorkPhoto): Promise<void> {
    try {
      const db = await openKoreaDb();
      await db.put('photos', p);
    } catch (err) {
      throw toPhotoStorageError(err);
    }
  },
  async remove(id: string): Promise<void> {
    const db = await openKoreaDb();
    await db.delete('photos', id);
  },
  /** 없는 id 는 무시 */
  async updateMeta(
    id: string,
    patch: Partial<Pick<WorkPhoto, 'memo' | 'expiresOn' | 'expiryCustom' | 'shiftId' | 'date'>>,
  ): Promise<void> {
    const db = await openKoreaDb();
    const tx = db.transaction('photos', 'readwrite');
    const current = await tx.store.get(id);
    if (current) await tx.store.put({ ...current, ...patch });
    await tx.done;
  },
  /** 그 시프트를 가리키는 사진 shiftId=null, 바꾼 수 */
  async unlinkShift(shiftId: string): Promise<number> {
    const db = await openKoreaDb();
    const tx = db.transaction('photos', 'readwrite');
    let changed = 0;
    let cursor = await tx.store.openCursor();
    while (cursor) {
      if (cursor.value.shiftId === shiftId) {
        await cursor.update({ ...cursor.value, shiftId: null });
        changed += 1;
      }
      cursor = await cursor.continue();
    }
    await tx.done;
    return changed;
  },
  /** expiresOn <= today 인 사진 (오늘 만료 포함). 지우지 않는다 */
  async listExpired(today: string): Promise<WorkPhoto[]> {
    const db = await openKoreaDb();
    const rows = await db.getAllFromIndex('photos', 'by-expires', IDBKeyRange.upperBound(today));
    return rows.sort(comparePhoto);
  },
  /** 한 트랜잭션으로 삭제. 없는 id 는 무시, 지운 수 */
  async removeMany(ids: readonly string[]): Promise<number> {
    if (ids.length === 0) return 0;
    const db = await openKoreaDb();
    const tx = db.transaction('photos', 'readwrite');
    let removed = 0;
    for (const id of ids) {
      const key = await tx.store.getKey(id);
      if (key === undefined) continue;
      await tx.store.delete(id);
      removed += 1;
    }
    await tx.done;
    return removed;
  },
  /** expiresOn <= today 인 사진 삭제, 삭제 수 */
  async purgeExpired(today: string): Promise<number> {
    const db = await openKoreaDb();
    const tx = db.transaction('photos', 'readwrite');
    let removed = 0;
    let cursor = await tx.store.index('by-expires').openCursor(IDBKeyRange.upperBound(today));
    while (cursor) {
      await cursor.delete();
      removed += 1;
      cursor = await cursor.continue();
    }
    await tx.done;
    return removed;
  },
  /** expiryCustom=false 인 사진의 expiresOn 을 computeExpiresOn(takenOn, months) 로 다시 씀. 바뀐 수 */
  async applyRetention(months: number): Promise<number> {
    const db = await openKoreaDb();
    const tx = db.transaction('photos', 'readwrite');
    let changed = 0;
    let cursor = await tx.store.openCursor();
    while (cursor) {
      const p = cursor.value;
      if (!p.expiryCustom) {
        const expiresOn = computeExpiresOn(p.takenOn, months);
        if (expiresOn !== p.expiresOn) {
          await cursor.update({ ...p, expiresOn });
          changed += 1;
        }
      }
      cursor = await cursor.continue();
    }
    await tx.done;
    return changed;
  },
};

export const settingsRepo = {
  /** 없으면 DEFAULT_RETENTION_MONTHS */
  async getRetentionMonths(): Promise<number> {
    const db = await openKoreaDb();
    const row = await db.get('settings', 'photos');
    return row?.retentionMonths ?? DEFAULT_RETENTION_MONTHS;
  },
  /** validateRetentionMonths 가 통과하지 않으면 RangeError */
  async setRetentionMonths(months: number): Promise<void> {
    const err = validateRetentionMonths(months);
    if (err !== null) throw new RangeError(`invalid retention months (${err}): ${months}`);
    const db = await openKoreaDb();
    await db.put('settings', { id: 'photos', retentionMonths: months });
  },
};

/** 근무·근무 프로필·사진·사진 설정을 한 트랜잭션으로 비운다. */
export async function wipeWorkData(): Promise<void> {
  const db = await openKoreaDb();
  const tx = db.transaction(['shifts', 'workProfile', 'photos', 'settings'], 'readwrite');
  await Promise.all([
    tx.objectStore('shifts').clear(),
    tx.objectStore('workProfile').clear(),
    tx.objectStore('photos').clear(),
    tx.objectStore('settings').delete('photos'),
    tx.done,
  ]);
}

export async function wipeStayData(): Promise<void> {
  const db = await openKoreaDb();
  await db.clear('stayProfile');
}

export const EMPTY_WORK_PROFILE: Omit<WorkProfile, 'id'> = {
  hourlyWage: 0,
  workplace5Plus: 'unknown',
  weekStartsOn: 1,
  workerName: '',
  workerPhone: '',
  workerAddress: '',
  workerBirth: '',
  companyName: '',
  employerName: '',
  employerAddress: '',
  employerPhone: '',
  startDate: null,
  endDate: null,
};

export const EMPTY_STAY_PROFILE: Omit<StayProfile, 'id'> = {
  entryDate: null,
  visaType: null,
  stayExpiry: null,
  arcRegisteredOn: null,
  lastMoveDate: null,
  contractEnd: null,
  leftJobOn: null,
  passportExpiry: null,
};
