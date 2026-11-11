import { describe, expect, it } from 'vitest';
import {
  computeExpiresOn,
  countExpiringNow,
  daysUntilExpiry,
  DEFAULT_RETENTION_MONTHS,
  EXPIRY_NOTICE_DAYS,
  expiryState,
  keepMoreExpiresOn,
  KEEP_MORE_MONTHS,
  MAX_RETENTION_MONTHS,
  MIN_RETENTION_MONTHS,
  newPhotoRecord,
  validateExpiresOn,
  validateRetentionMonths,
  type NewPhotoArgs,
} from './expiry';

describe('constants', () => {
  it('기본 24개월, 범위 1~120, 안내 30일', () => {
    expect(DEFAULT_RETENTION_MONTHS).toBe(24);
    expect(MIN_RETENTION_MONTHS).toBe(1);
    expect(MAX_RETENTION_MONTHS).toBe(120);
    expect(EXPIRY_NOTICE_DAYS).toBe(30);
  });
});

describe('computeExpiresOn', () => {
  it('2026-10-20 + 24개월 → 2028-10-20', () => {
    expect(computeExpiresOn('2026-10-20', 24)).toBe('2028-10-20');
  });
  it('윤일 2024-02-29 + 24개월 → 2026-02-28 (말일 클램프)', () => {
    expect(computeExpiresOn('2024-02-29', 24)).toBe('2026-02-28');
  });
  it('2026-01-31 + 1개월 → 2026-02-28 (말일 클램프)', () => {
    expect(computeExpiresOn('2026-01-31', 1)).toBe('2026-02-28');
  });
  it('2026-08-31 + 1개월 → 2026-09-30', () => {
    expect(computeExpiresOn('2026-08-31', 1)).toBe('2026-09-30');
  });
  it('2026-10-20 + 120개월 → 2036-10-20', () => {
    expect(computeExpiresOn('2026-10-20', 120)).toBe('2036-10-20');
  });
});

describe('keepMoreExpiresOn', () => {
  it('KEEP_MORE_MONTHS 는 12', () => expect(KEEP_MORE_MONTHS).toBe(12));
  it('2028-10-21 → 2029-10-21', () => expect(keepMoreExpiresOn('2028-10-21')).toBe('2029-10-21'));
  it('윤일 2028-02-29 → 2029-02-28', () => expect(keepMoreExpiresOn('2028-02-29')).toBe('2029-02-28'));
});

describe('daysUntilExpiry / expiryState', () => {
  it('today == expiresOn → 0일, expired', () => {
    expect(daysUntilExpiry('2028-10-20', '2028-10-20')).toBe(0);
    expect(expiryState('2028-10-20', '2028-10-20')).toBe('expired');
  });
  it('today 가 만료일 뒤 → 음수, expired', () => {
    expect(daysUntilExpiry('2028-10-20', '2028-10-25')).toBe(-5);
    expect(expiryState('2028-10-20', '2028-10-25')).toBe('expired');
  });
  it('today 2028-09-30 → 20일 남음, soon', () => {
    expect(daysUntilExpiry('2028-10-20', '2028-09-30')).toBe(20);
    expect(expiryState('2028-10-20', '2028-09-30')).toBe('soon');
  });
  it('30일 남음 → soon (경계)', () => {
    expect(daysUntilExpiry('2028-10-20', '2028-09-20')).toBe(30);
    expect(expiryState('2028-10-20', '2028-09-20')).toBe('soon');
  });
  it('31일 남음 → active (경계)', () => {
    expect(daysUntilExpiry('2028-10-20', '2028-09-19')).toBe(31);
    expect(expiryState('2028-10-20', '2028-09-19')).toBe('active');
  });
  it('1일 남음 → soon', () => {
    expect(expiryState('2028-10-20', '2028-10-19')).toBe('soon');
  });
});

describe('validateRetentionMonths', () => {
  it('0 → range', () => expect(validateRetentionMonths(0)).toBe('range'));
  it('1 → null', () => expect(validateRetentionMonths(1)).toBeNull());
  it('120 → null', () => expect(validateRetentionMonths(120)).toBeNull());
  it('121 → range', () => expect(validateRetentionMonths(121)).toBe('range'));
  it('1.5 → integer', () => expect(validateRetentionMonths(1.5)).toBe('integer'));
  it('NaN → integer', () => expect(validateRetentionMonths(Number.NaN)).toBe('integer'));
});

describe('validateExpiresOn', () => {
  const today = '2026-10-27';
  it('today 와 같으면 notFuture', () => expect(validateExpiresOn(today, today)).toBe('notFuture'));
  it('과거면 notFuture', () => expect(validateExpiresOn('2026-10-01', today)).toBe('notFuture'));
  it('today+1 → null', () => expect(validateExpiresOn('2026-10-28', today)).toBeNull());
  it('없는 날짜 2026-02-30 → format', () => expect(validateExpiresOn('2026-02-30', today)).toBe('format'));
  it('abc → format', () => expect(validateExpiresOn('abc', today)).toBe('format'));
  it('자리수가 다르면 format', () => expect(validateExpiresOn('2027-1-05', today)).toBe('format'));
});

describe('countExpiringNow', () => {
  it('expiryCustom=false 이고 새 기간으로 만료되는 사진만 센다', () => {
    const today = '2026-10-27';
    const photos = [
      { takenOn: '2026-01-10', expiryCustom: false }, // +6 → 2026-07-10 만료
      { takenOn: '2026-04-27', expiryCustom: false }, // +6 → 2026-10-27 == today 만료
      { takenOn: '2026-04-28', expiryCustom: false }, // +6 → 2026-10-28 유지
      { takenOn: '2025-01-01', expiryCustom: true }, // 직접 고친 사진은 세지 않음
    ];
    expect(countExpiringNow(photos, 6, today)).toBe(2);
    expect(countExpiringNow(photos, 24, today)).toBe(0);
    expect(countExpiringNow([], 1, today)).toBe(0);
  });
});

describe('newPhotoRecord', () => {
  const base: NewPhotoArgs = {
    id: 'p1',
    date: '2026-10-21',
    shiftId: 's1',
    memo: '출근 기록',
    takenOn: '2026-10-20',
    today: '2026-10-27',
    savedAt: 1000,
    retentionMonths: 24,
    image: new Uint8Array([1, 2, 3]).buffer,
    thumb: new Uint8Array([4]).buffer,
    width: 1600,
    height: 1200,
  };

  it('EXIF 촬영일이 있으면 그 날 기준, source exif', () => {
    const r = newPhotoRecord(base);
    expect(r).toEqual({
      id: 'p1',
      date: '2026-10-21',
      shiftId: 's1',
      memo: '출근 기록',
      takenOn: '2026-10-20',
      takenOnSource: 'exif',
      savedAt: 1000,
      expiresOn: '2028-10-20',
      expiryCustom: false,
      mime: 'image/jpeg',
      image: base.image,
      thumb: base.thumb,
      width: 1600,
      height: 1200,
    });
  });

  it('EXIF 촬영일이 없으면 저장일(today) 기준, source saved', () => {
    const r = newPhotoRecord({ ...base, takenOn: null, shiftId: null, retentionMonths: 12 });
    expect(r.takenOn).toBe('2026-10-27');
    expect(r.takenOnSource).toBe('saved');
    expect(r.expiresOn).toBe('2027-10-27');
    expect(r.shiftId).toBeNull();
    expect(r.expiryCustom).toBe(false);
  });
});
