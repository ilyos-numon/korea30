import type { ProgressStorage } from '../quest/progress';
import { openKoreaDb, type PhotoSettings, type StayProfile, type WorkPhoto, type WorkProfile, type WorkShift } from '../storage/db';
import {
  BACKUP_FORMAT,
  BACKUP_LS_KEYS,
  countBackup,
  fromBase64,
  toBase64,
  type BackupCounts,
  type BackupFileV1,
  type BackupLsKey,
} from './format';

const STORES = ['shifts', 'workProfile', 'stayProfile', 'settings', 'photos'] as const;

interface RawData {
  shifts: WorkShift[];
  workProfile: WorkProfile | null;
  stayProfile: StayProfile | null;
  photoSettings: PhotoSettings | null;
  photos: WorkPhoto[];
}

async function readAll(): Promise<RawData> {
  const db = await openKoreaDb();
  const tx = db.transaction([...STORES], 'readonly');
  const [shifts, workProfile, stayProfile, photoSettings, photos] = await Promise.all([
    tx.objectStore('shifts').getAll(),
    tx.objectStore('workProfile').get('me'),
    tx.objectStore('stayProfile').get('me'),
    tx.objectStore('settings').get('photos'),
    tx.objectStore('photos').getAll(),
  ]);
  await tx.done;
  return {
    shifts,
    workProfile: workProfile ?? null,
    stayProfile: stayProfile ?? null,
    photoSettings: photoSettings ?? null,
    photos,
  };
}

function readLs(storage: ProgressStorage): Partial<Record<BackupLsKey, string>> {
  const out: Partial<Record<BackupLsKey, string>> = {};
  for (const key of BACKUP_LS_KEYS) {
    const v = storage.getItem(key);
    if (v !== null) out[key] = v;
  }
  return out;
}

/** 5개 store 를 한 readonly 트랜잭션으로 읽고 localStorage 4키를 읽는다 */
export async function collectBackup(storage: ProgressStorage, now: Date): Promise<BackupFileV1> {
  const raw = await readAll();
  return {
    format: BACKUP_FORMAT,
    version: 1,
    exportedAt: now.toISOString(),
    localStorage: readLs(storage),
    idb: {
      shifts: raw.shifts,
      workProfile: raw.workProfile,
      stayProfile: raw.stayProfile,
      photoSettings: raw.photoSettings,
      photos: raw.photos.map((p) => ({ ...p, image: toBase64(p.image), thumb: toBase64(p.thumb) })),
    },
  };
}

/** 5개 store readwrite 한 트랜잭션: clear 후 put (null 이면 비움). 성공 뒤 localStorage:
 *  파일에 있는 키 setItem, 없는 키 removeItem. 트랜잭션 실패 시 throw (IDB 는 abort 로 원상태) */
export async function restoreBackup(file: BackupFileV1, storage: ProgressStorage): Promise<void> {
  const photos: WorkPhoto[] = file.idb.photos.map((p) => ({
    ...p,
    image: fromBase64(p.image),
    thumb: fromBase64(p.thumb),
  }));
  const db = await openKoreaDb();
  const tx = db.transaction([...STORES], 'readwrite');
  const pending: Promise<unknown>[] = [];
  const track = (p: Promise<unknown>) => {
    // 개별 요청 실패는 tx.done 으로 드러난다. 처리 안 된 rejection 만 막는다.
    pending.push(p.catch(() => undefined));
  };
  try {
    const shifts = tx.objectStore('shifts');
    const work = tx.objectStore('workProfile');
    const stay = tx.objectStore('stayProfile');
    const settings = tx.objectStore('settings');
    const photoStore = tx.objectStore('photos');
    track(shifts.clear());
    track(work.clear());
    track(stay.clear());
    track(settings.clear());
    track(photoStore.clear());
    for (const s of file.idb.shifts) track(shifts.put(s));
    if (file.idb.workProfile) track(work.put(file.idb.workProfile));
    if (file.idb.stayProfile) track(stay.put(file.idb.stayProfile));
    if (file.idb.photoSettings) track(settings.put(file.idb.photoSettings));
    for (const p of photos) track(photoStore.put(p));
  } catch (err) {
    try {
      tx.abort();
    } catch {
      // 이미 끝난 트랜잭션
    }
    await tx.done.catch(() => undefined);
    await Promise.all(pending);
    throw err;
  }
  await tx.done;
  await Promise.all(pending);

  for (const key of BACKUP_LS_KEYS) {
    const v = file.localStorage[key];
    if (v !== undefined) storage.setItem(key, v);
    else storage.removeItem(key);
  }
}

/** 현재 기기 데이터 요약 (BackupCounts) */
export async function currentCounts(storage: ProgressStorage): Promise<BackupCounts> {
  const raw = await readAll();
  // 사진 바이트는 개수만 필요하므로 base64 변환 없이 센다.
  const counts = countBackup({
    format: BACKUP_FORMAT,
    version: 1,
    exportedAt: '',
    localStorage: readLs(storage),
    idb: { ...raw, photos: [] },
  });
  return { ...counts, photos: raw.photos.length };
}

/** 알림 비교용 서명 */
export async function dataSignature(storage: ProgressStorage): Promise<{ signature: string; hasData: boolean }> {
  const raw = await readAll();
  const prog = storage.getItem('korea30.progress.v1');
  const arr = storage.getItem('korea30.arrival.v1');
  const sMax = raw.shifts.reduce((m, s) => Math.max(m, s.createdAt), 0);
  const pMax = raw.photos.reduce((m, p) => Math.max(m, p.savedAt), 0);
  const signature = JSON.stringify({
    s: raw.shifts.length,
    sMax,
    p: raw.photos.length,
    pMax,
    stay: raw.stayProfile,
    work: raw.workProfile,
    prog,
    arr,
  });
  const hasData =
    raw.shifts.length > 0 ||
    raw.photos.length > 0 ||
    raw.stayProfile !== null ||
    raw.workProfile !== null ||
    prog !== null ||
    arr !== null;
  return { signature, hasData };
}
