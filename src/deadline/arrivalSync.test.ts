import { describe, expect, it } from 'vitest';
import { fillArrivalFromEntry, fillEntryFromArrival, type StayRepoLike } from './arrivalSync';
import { ARRIVAL_KEY } from '../quest/arrival';
import type { ProgressStorage } from '../quest/progress';
import type { StayProfile } from '../storage/db';
import { EMPTY_STAY_PROFILE } from '../storage/repos';

const TODAY = '2026-10-27';

function memoryStorage(arrival?: string): ProgressStorage & { map: Map<string, string> } {
  const map = new Map<string, string>();
  if (arrival !== undefined) map.set(ARRIVAL_KEY, arrival);
  return {
    map,
    getItem: (k) => (map.has(k) ? (map.get(k) as string) : null),
    setItem: (k, v) => {
      map.set(k, String(v));
    },
    removeItem: (k) => {
      map.delete(k);
    },
  };
}

function memoryRepo(initial: StayProfile | null): StayRepoLike & { current: StayProfile | null; puts: number } {
  const repo = {
    current: initial,
    puts: 0,
    async get() {
      return repo.current;
    },
    async put(p: StayProfile) {
      repo.puts += 1;
      repo.current = p;
    },
  };
  return repo;
}

const BASE: StayProfile = { id: 'me', ...EMPTY_STAY_PROFILE, visaType: 'E-9', stayExpiry: '2027-03-01' };

describe('fillArrivalFromEntry', () => {
  it('fills an empty quest arrival date with the entry date', () => {
    const s = memoryStorage();
    expect(fillArrivalFromEntry('2026-09-01', TODAY, s)).toBe('filled');
    expect(s.map.get(ARRIVAL_KEY)).toBe('2026-09-01');
  });

  it('keeps an existing arrival date', () => {
    const s = memoryStorage('2026-08-15');
    expect(fillArrivalFromEntry('2026-09-01', TODAY, s)).toBe('kept');
    expect(s.map.get(ARRIVAL_KEY)).toBe('2026-08-15');
  });

  it('skips an invalid or future entry date', () => {
    const s = memoryStorage();
    expect(fillArrivalFromEntry('2026-11-30', TODAY, s)).toBe('skipped');
    expect(fillArrivalFromEntry('1999-12-31', TODAY, s)).toBe('skipped');
    expect(fillArrivalFromEntry('2026-02-30', TODAY, s)).toBe('skipped');
    expect(s.map.has(ARRIVAL_KEY)).toBe(false);
  });

  it('fails without storage', () => {
    expect(fillArrivalFromEntry('2026-09-01', TODAY, null)).toBe('failed');
  });

  it('fails when storage throws', () => {
    const s = memoryStorage();
    s.setItem = () => {
      throw new Error('quota');
    };
    expect(fillArrivalFromEntry('2026-09-01', TODAY, s)).toBe('failed');
    const r = memoryStorage();
    r.getItem = () => {
      throw new Error('denied');
    };
    expect(fillArrivalFromEntry('2026-09-01', TODAY, r)).toBe('failed');
  });
});

describe('fillEntryFromArrival', () => {
  it('skips when there is no stay profile (does not create one)', async () => {
    const repo = memoryRepo(null);
    await expect(fillEntryFromArrival('2026-09-01', TODAY, repo)).resolves.toBe('skipped');
    expect(repo.current).toBeNull();
    expect(repo.puts).toBe(0);
  });

  it('fills an empty entry date and keeps the other fields', async () => {
    const repo = memoryRepo(BASE);
    await expect(fillEntryFromArrival('2026-09-01', TODAY, repo)).resolves.toBe('filled');
    expect(repo.current).toEqual({ ...BASE, entryDate: '2026-09-01' });
  });

  it('keeps an existing entry date', async () => {
    const repo = memoryRepo({ ...BASE, entryDate: '2026-08-01' });
    await expect(fillEntryFromArrival('2026-09-01', TODAY, repo)).resolves.toBe('kept');
    expect(repo.current?.entryDate).toBe('2026-08-01');
    expect(repo.puts).toBe(0);
  });

  it('skips when the filled profile would be invalid', async () => {
    // 입국일이 체류 만료일보다 뒤 → expiryBeforeEntry
    const repo = memoryRepo({ ...BASE, stayExpiry: '2026-08-01' });
    await expect(fillEntryFromArrival('2026-09-01', TODAY, repo)).resolves.toBe('skipped');
    // 미래 입국일 → futureEntry
    await expect(fillEntryFromArrival('2026-12-01', TODAY, memoryRepo(BASE))).resolves.toBe('skipped');
    expect(repo.puts).toBe(0);
  });

  it('fails when the repo throws', async () => {
    const getFails: StayRepoLike = {
      get: () => Promise.reject(new Error('db')),
      put: () => Promise.resolve(),
    };
    await expect(fillEntryFromArrival('2026-09-01', TODAY, getFails)).resolves.toBe('failed');
    const putFails: StayRepoLike = {
      get: () => Promise.resolve(BASE),
      put: () => Promise.reject(new Error('quota')),
    };
    await expect(fillEntryFromArrival('2026-09-01', TODAY, putFails)).resolves.toBe('failed');
  });
});
