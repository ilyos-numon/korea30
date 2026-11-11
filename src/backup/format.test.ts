import { describe, expect, it } from 'vitest';
import { backupFileName, countBackup, fromBase64, parseBackup, toBase64, type BackupFileV1 } from './format';

function validFile(): BackupFileV1 {
  return {
    format: 'korea30-backup',
    version: 1,
    exportedAt: '2026-10-29T00:00:00.000Z',
    localStorage: { 'korea30.progress.v1': '[1,2,3]', 'korea30.arrival.v1': '2026-10-01' },
    idb: {
      shifts: [
        { id: 'a', date: '2026-10-05', start: '09:00', end: '18:00', breakMinutes: 60, isHoliday: false, memo: '', createdAt: 1 },
      ],
      workProfile: null,
      stayProfile: null,
      photoSettings: null,
      photos: [],
    },
  };
}

describe('parseBackup', () => {
  it('정상 파일은 ok', () => {
    const r = parseBackup(JSON.stringify(validFile()));
    expect(r.ok).toBe(true);
  });

  it('JSON 이 아니면 notJson', () => {
    expect(parseBackup('not json {')).toEqual({ ok: false, error: 'notJson' });
  });

  it('format 이 다르면 otherApp', () => {
    expect(parseBackup(JSON.stringify({ ...validFile(), format: 'other' }))).toEqual({ ok: false, error: 'otherApp' });
    expect(parseBackup('42')).toEqual({ ok: false, error: 'otherApp' });
  });

  it('version > 1 이면 newerVersion', () => {
    expect(parseBackup(JSON.stringify({ ...validFile(), version: 2 }))).toEqual({ ok: false, error: 'newerVersion' });
  });

  it('구조 검사 실패는 damaged', () => {
    const noIdbField = validFile() as unknown as { idb: Record<string, unknown> };
    delete noIdbField.idb.photoSettings;
    expect(parseBackup(JSON.stringify(noIdbField))).toEqual({ ok: false, error: 'damaged' });

    const badShift = validFile();
    (badShift.idb.shifts[0] as unknown as Record<string, unknown>).breakMinutes = '60';
    expect(parseBackup(JSON.stringify(badShift))).toEqual({ ok: false, error: 'damaged' });

    const badLs = { ...validFile(), localStorage: { 'other.key': 'x' } };
    expect(parseBackup(JSON.stringify(badLs))).toEqual({ ok: false, error: 'damaged' });

    const badPhoto = validFile() as unknown as { idb: { photos: unknown[] } };
    badPhoto.idb.photos.push({ id: 'p', date: 'd', takenOn: 't', expiresOn: 'e', mime: 'image/jpeg', image: '!!', thumb: '' });
    expect(parseBackup(JSON.stringify(badPhoto))).toEqual({ ok: false, error: 'damaged' });

    expect(parseBackup(JSON.stringify({ ...validFile(), version: 0 }))).toEqual({ ok: false, error: 'damaged' });
  });
});

describe('countBackup', () => {
  it('개수와 유무를 센다', () => {
    expect(countBackup(validFile())).toEqual({ shifts: 1, photos: 0, questDays: 3, stay: false, work: false, arrival: true });
  });

  it('progress 파싱 실패는 0', () => {
    const f = validFile();
    f.localStorage['korea30.progress.v1'] = '{bad';
    expect(countBackup(f).questDays).toBe(0);
  });
});

describe('base64 · 파일 이름', () => {
  it('바이트가 왕복한다', () => {
    const bytes = new Uint8Array(70000);
    for (let i = 0; i < bytes.length; i++) bytes[i] = (i * 31) % 256;
    const s = toBase64(bytes.buffer);
    expect(s).toMatch(/^[A-Za-z0-9+/]*={0,2}$/);
    expect(new Uint8Array(fromBase64(s))).toEqual(bytes);
    expect(toBase64(new ArrayBuffer(0))).toBe('');
  });

  it('파일 이름', () => {
    expect(backupFileName('2026-10-29')).toBe('korea30-backup-2026-10-29.json');
  });
});
