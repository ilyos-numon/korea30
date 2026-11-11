import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { MAX_INPUT_BYTES, checkPhotoFile, exifDateToIso, readTakenOn } from './image';

function fixture(name: string): ArrayBuffer {
  const b = readFileSync(`tests/e2e/fixtures/${name}`);
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer;
}

describe('checkPhotoFile', () => {
  it('accepts a jpeg within the limit', () => {
    expect(checkPhotoFile({ type: 'image/jpeg', size: 1024 })).toBeNull();
  });
  it('accepts exactly MAX_INPUT_BYTES', () => {
    expect(checkPhotoFile({ type: 'image/png', size: MAX_INPUT_BYTES })).toBeNull();
  });
  it('rejects non-image types', () => {
    expect(checkPhotoFile({ type: 'application/pdf', size: 10 })).toBe('notImage');
    expect(checkPhotoFile({ type: '', size: 10 })).toBe('notImage');
  });
  it('rejects files over MAX_INPUT_BYTES', () => {
    expect(checkPhotoFile({ type: 'image/heic', size: MAX_INPUT_BYTES + 1 })).toBe('tooLarge');
  });
});

describe('exifDateToIso', () => {
  it('formats a Date with local fields', () => {
    expect(exifDateToIso(new Date(2026, 9, 20, 9, 15, 0))).toBe('2026-10-20');
  });
  it('parses an EXIF date string', () => {
    expect(exifDateToIso('2026:10:20 09:15:00')).toBe('2026-10-20');
  });
  it('returns null for undefined and non-date values', () => {
    expect(exifDateToIso(undefined)).toBeNull();
    expect(exifDateToIso(12345)).toBeNull();
    expect(exifDateToIso({})).toBeNull();
  });
  it('returns null for years before 1990', () => {
    expect(exifDateToIso('1989:12:31 23:59:59')).toBeNull();
    expect(exifDateToIso(new Date(1980, 0, 1))).toBeNull();
  });
  it('returns null for invalid Date and placeholder strings', () => {
    expect(exifDateToIso(new Date('nope'))).toBeNull();
    expect(exifDateToIso('0000:00:00 00:00:00')).toBeNull();
  });
  it('returns null for impossible calendar dates', () => {
    expect(exifDateToIso('2026:02:30 10:00:00')).toBeNull();
    expect(exifDateToIso('2026:13:01 10:00:00')).toBeNull();
    expect(exifDateToIso('garbage')).toBeNull();
  });
});

describe('readTakenOn', () => {
  it('reads DateTimeOriginal from the EXIF fixture', async () => {
    expect(await readTakenOn(fixture('photo-exif.jpg'))).toBe('2026-10-20');
  });
  it('returns null for a png without metadata', async () => {
    expect(await readTakenOn(fixture('photo-plain.png'))).toBeNull();
  });
  it('returns null for broken bytes', async () => {
    expect(await readTakenOn(new Uint8Array([1, 2, 3, 4, 5]).buffer)).toBeNull();
  });
  it('returns null for an empty buffer', async () => {
    expect(await readTakenOn(new ArrayBuffer(0))).toBeNull();
  });
});
