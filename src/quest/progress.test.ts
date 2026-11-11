import { describe, expect, it } from 'vitest';
import {
  PROGRESS_KEY,
  type ProgressStorage,
  clearProgress,
  completeDay,
  currentDay,
  dayState,
  loadCompleted,
  saveCompleted,
} from './progress';

function memoryStorage(initial?: string): ProgressStorage {
  const map = new Map<string, string>();
  if (initial !== undefined) map.set(PROGRESS_KEY, initial);
  return {
    getItem: (k) => (map.has(k) ? (map.get(k) as string) : null),
    setItem: (k, v) => {
      map.set(k, String(v));
    },
    removeItem: (k) => {
      map.delete(k);
    },
  };
}

describe('loadCompleted (d)', () => {
  const cases: Array<[string, number[]]> = [
    ['[1,2]', [1, 2]],
    ['[2]', []],
    ['[1,3]', [1]],
    ['{oops', []],
    ['null', []],
    ['[1,"2"]', [1]],
    ['{"a":1}', []],
    ['[1,2,3,4]', [1, 2, 3]],
  ];
  it.each(cases)('%s -> %j', (raw, expected) => {
    expect(loadCompleted(memoryStorage(raw), 3)).toEqual(expected);
  });

  it('missing key -> []', () => {
    expect(loadCompleted(memoryStorage(), 3)).toEqual([]);
  });
});

describe('currentDay (e)', () => {
  it('[] -> 1', () => {
    expect(currentDay([], 3)).toBe(1);
  });
  it('[1] -> 2', () => {
    expect(currentDay([1], 3)).toBe(2);
  });
  it('[1,2,3] -> null', () => {
    expect(currentDay([1, 2, 3], 3)).toBeNull();
  });
});

describe('dayState (f)', () => {
  it('returns done / today / locked', () => {
    expect(dayState(1, [1], 3)).toBe('done');
    expect(dayState(2, [1], 3)).toBe('today');
    expect(dayState(3, [1], 3)).toBe('locked');
  });
  it('all done when completed', () => {
    expect([1, 2, 3].map((d) => dayState(d, [1, 2, 3], 3))).toEqual(['done', 'done', 'done']);
  });
});

describe('completeDay (g)', () => {
  it('adds today as a new array', () => {
    const before = [1];
    const after = completeDay(before, 2, 3);
    expect(after).toEqual([1, 2]);
    expect(after).not.toBe(before);
    expect(before).toEqual([1]);
  });
  it('returns completed unchanged for a locked day', () => {
    const before = [1];
    expect(completeDay(before, 3, 3)).toBe(before);
  });
  it('returns completed unchanged for an already done day', () => {
    const before = [1, 2];
    expect(completeDay(before, 1, 3)).toBe(before);
  });
});

describe('save/load/clear (h)', () => {
  it('round-trips through storage in ascending order', () => {
    const s = memoryStorage();
    saveCompleted(s, [2, 1]);
    expect(s.getItem(PROGRESS_KEY)).toBe('[1,2]');
    expect(loadCompleted(s, 3)).toEqual([1, 2]);
  });
  it('clearProgress removes the key so load returns []', () => {
    const s = memoryStorage();
    saveCompleted(s, [1, 2, 3]);
    clearProgress(s);
    expect(s.getItem(PROGRESS_KEY)).toBeNull();
    expect(loadCompleted(s, 3)).toEqual([]);
  });
});
