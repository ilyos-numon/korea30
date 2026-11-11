import { describe, expect, it } from 'vitest';
import { msUntilNextDay } from './useToday';

describe('msUntilNextDay', () => {
  it('23:59:00 → 다음 자정 + 1초 = 61000ms', () => {
    expect(msUntilNextDay(new Date(2026, 11, 22, 23, 59, 0))).toBe(61000);
  });

  it('00:00:00 → 하루 + 1초 = 86401000ms', () => {
    expect(msUntilNextDay(new Date(2026, 11, 22, 0, 0, 0))).toBe(86401000);
  });

  it('항상 > 0 (자정 직전 마지막 ms 포함)', () => {
    expect(msUntilNextDay(new Date(2026, 11, 22, 23, 59, 59, 999))).toBe(1001);
    for (let h = 0; h < 24; h += 1) {
      expect(msUntilNextDay(new Date(2026, 2, 8, h, 30, 0))).toBeGreaterThan(0);
    }
  });
});
