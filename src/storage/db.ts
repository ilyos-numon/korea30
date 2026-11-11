import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

export const DB_NAME = 'korea30';
export const DB_VERSION = 2;

export type VisaType = 'E-9' | 'H-2' | 'E-7' | 'D-2' | 'D-4' | 'F-2' | 'F-4' | 'F-5' | 'F-6' | 'other';
export type Workplace5Plus = 'yes' | 'no' | 'unknown';

export interface WorkShift {
  id: string;
  date: string;
  start: string;
  end: string;
  breakMinutes: number;
  isHoliday: boolean;
  memo: string;
  createdAt: number;
}

export interface WorkProfile {
  id: 'me';
  hourlyWage: number;
  workplace5Plus: Workplace5Plus;
  weekStartsOn: 0 | 1;
  workerName: string;
  workerPhone: string;
  workerAddress: string;
  workerBirth: string;
  companyName: string;
  employerName: string;
  employerAddress: string;
  employerPhone: string;
  startDate: string | null;
  endDate: string | null;
}

export interface StayProfile {
  id: 'me';
  entryDate: string | null;
  visaType: VisaType | null;
  stayExpiry: string | null;
  arcRegisteredOn: string | null;
  lastMoveDate: string | null;
  contractEnd: string | null;
  leftJobOn: string | null;
  passportExpiry: string | null;
}

export type PhotoMime = 'image/jpeg';

export interface WorkPhoto {
  id: string;
  /** 연결된 근무 날짜 YYYY-MM-DD */
  date: string;
  shiftId: string | null;
  memo: string;
  /** 촬영일 YYYY-MM-DD (EXIF, 없으면 저장일) */
  takenOn: string;
  takenOnSource: 'exif' | 'saved';
  savedAt: number;
  /** 이 날부터 만료 (today >= expiresOn → expired) */
  expiresOn: string;
  expiryCustom: boolean;
  mime: PhotoMime;
  image: ArrayBuffer;
  thumb: ArrayBuffer;
  width: number;
  height: number;
}

export interface PhotoSettings {
  id: 'photos';
  retentionMonths: number;
}

export interface Korea30DB extends DBSchema {
  shifts: {
    key: string;
    value: WorkShift;
    indexes: { 'by-date': string };
  };
  workProfile: {
    key: 'me';
    value: WorkProfile;
  };
  stayProfile: {
    key: 'me';
    value: StayProfile;
  };
  photos: {
    key: string;
    value: WorkPhoto;
    indexes: { 'by-date': string; 'by-expires': string };
  };
  settings: {
    key: 'photos';
    value: PhotoSettings;
  };
}

let dbPromise: Promise<IDBPDatabase<Korea30DB>> | null = null;

export function openKoreaDb(): Promise<IDBPDatabase<Korea30DB>> {
  if (!dbPromise) {
    dbPromise = openDB<Korea30DB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('shifts')) {
          const shifts = db.createObjectStore('shifts', { keyPath: 'id' });
          shifts.createIndex('by-date', 'date');
        }
        if (!db.objectStoreNames.contains('workProfile')) {
          db.createObjectStore('workProfile', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('stayProfile')) {
          db.createObjectStore('stayProfile', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('photos')) {
          const photos = db.createObjectStore('photos', { keyPath: 'id' });
          photos.createIndex('by-date', 'date');
          photos.createIndex('by-expires', 'expiresOn');
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

/** 테스트 전용: 싱글턴을 비운다. 열린 연결은 닫아 deleteDatabase 가 막히지 않게 한다. */
export function resetDbForTest(): void {
  const current = dbPromise;
  dbPromise = null;
  if (current) {
    current.then((db) => db.close()).catch(() => undefined);
  }
}
