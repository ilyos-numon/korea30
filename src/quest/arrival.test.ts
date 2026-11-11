import { describe, expect, it } from 'vitest';
import {
  ARRIVAL_KEY,
  dPlus,
  isIsoDate,
  loadArrival,
  saveArrival,
  toIsoDate,
  validateArrival,
} from './arrival';
import type { ProgressStorage } from './progress';

function memoryStorage(initial?: string): ProgressStorage & { map: Map<string, string> } {
  const map = new Map<string, string>();
  if (initial !== undefined) map.set(ARRIVAL_KEY, initial);
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

describe('arrival', () => {
  it('ARRIVAL_KEY is fixed', () => {
    expect(ARRIVAL_KEY).toBe('korea30.arrival.v1');
  });

  it('toIsoDate uses local date with zero padding', () => {
    expect(toIsoDate(new Date(2026, 9, 3))).toBe('2026-10-03');
    expect(toIsoDate(new Date(2026, 0, 1, 23, 59))).toBe('2026-01-01');
  });

  it('isIsoDate checks format and real calendar dates', () => {
    expect(isIsoDate('2026-10-23')).toBe(true);
    expect(isIsoDate('2024-02-29')).toBe(true);
    expect(isIsoDate('2026-02-30')).toBe(false);
    expect(isIsoDate('2026-02-29')).toBe(false);
    expect(isIsoDate('2026-13-01')).toBe(false);
    expect(isIsoDate('2026-00-10')).toBe(false);
    expect(isIsoDate('2026-2-3')).toBe(false);
    expect(isIsoDate('')).toBe(false);
    expect(isIsoDate('abcd-ef-gh')).toBe(false);
  });

  it('validateArrival returns invalid / future / null', () => {
    const today = '2026-10-23';
    expect(validateArrival('2026-10-24', today)).toBe('future');
    expect(validateArrival('2026-02-30', today)).toBe('invalid');
    expect(validateArrival('', today)).toBe('invalid');
    expect(validateArrival('1999-12-31', today)).toBe('invalid');
    expect(validateArrival('2000-01-01', today)).toBeNull();
    expect(validateArrival('2026-10-23', today)).toBeNull();
    expect(validateArrival('2026-10-19', today)).toBeNull();
  });

  it('loadArrival / saveArrival round trip', () => {
    const s = memoryStorage();
    expect(loadArrival(s)).toBeNull();
    saveArrival(s, '2026-10-19');
    expect(s.map.get(ARRIVAL_KEY)).toBe('2026-10-19');
    expect(loadArrival(s)).toBe('2026-10-19');
  });

  it('loadArrival returns null for corrupted values', () => {
    expect(loadArrival(memoryStorage('{oops'))).toBeNull();
    expect(loadArrival(memoryStorage('2026-02-30'))).toBeNull();
    expect(loadArrival(memoryStorage('2026-2-3'))).toBeNull();
  });

  it('dPlus counts the arrival day as D+1', () => {
    expect(dPlus('2026-10-19', '2026-10-23')).toBe(5);
    expect(dPlus('2026-10-23', '2026-10-23')).toBe(1);
    expect(dPlus('2026-09-30', '2026-10-01')).toBe(2);
    expect(dPlus('2025-12-31', '2026-01-01')).toBe(2);
  });
});
