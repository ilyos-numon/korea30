import { describe, expect, it } from 'vitest';
import type { WorkPhoto, WorkShift } from '../../storage/db';
import {
  PDF_PHOTO_MAX_BYTES,
  PDF_PHOTO_MAX_COUNT,
  arrayBufferToDataUrl,
  selectPdfPhotos,
  toEvidencePhotos,
} from './pdfPhotos';

const TODAY = '2026-10-27';

function photo(id: string, over: Partial<WorkPhoto> = {}): WorkPhoto {
  return {
    id,
    date: '2026-10-05',
    shiftId: null,
    memo: '',
    takenOn: '2026-10-05',
    takenOnSource: 'exif',
    savedAt: 0,
    expiresOn: '2028-10-05',
    expiryCustom: false,
    mime: 'image/jpeg',
    image: new Uint8Array([1, 2, 3]).buffer,
    thumb: new Uint8Array([1]).buffer,
    width: 10,
    height: 10,
    ...over,
  };
}

const SHIFT: WorkShift = { id: 's1', date: '2026-10-05', start: '09:00', end: '18:00', breakMinutes: 60, isHoliday: false, memo: '', createdAt: 0 };

describe('selectPdfPhotos', () => {
  it('excludes expired photos (expiresOn <= today) and does not count them as omitted', () => {
    const r = selectPdfPhotos(
      [photo('a', { expiresOn: TODAY }), photo('b', { expiresOn: '2026-10-26' }), photo('c', { expiresOn: '2026-10-28' })],
      TODAY,
    );
    expect(r.picked.map((p) => p.id)).toEqual(['c']);
    expect(r.omitted).toBe(0);
  });

  it('sorts by date then savedAt', () => {
    const r = selectPdfPhotos(
      [photo('x', { date: '2026-10-07', savedAt: 1 }), photo('y', { date: '2026-10-05', savedAt: 9 }), photo('z', { date: '2026-10-05', savedAt: 2 })],
      TODAY,
    );
    expect(r.picked.map((p) => p.id)).toEqual(['z', 'y', 'x']);
  });

  it('caps at 30 photos and reports 2 omitted out of 32', () => {
    const all = Array.from({ length: 32 }, (_, i) => photo(`p${i}`, { savedAt: i }));
    const r = selectPdfPhotos(all, TODAY);
    expect(PDF_PHOTO_MAX_COUNT).toBe(30);
    expect(r.picked).toHaveLength(30);
    expect(r.picked[29].id).toBe('p29');
    expect(r.omitted).toBe(2);
  });

  it('caps total image bytes at 12MB', () => {
    const big = () => new ArrayBuffer(5 * 1024 * 1024);
    const r = selectPdfPhotos([photo('a', { savedAt: 1, image: big() }), photo('b', { savedAt: 2, image: big() }), photo('c', { savedAt: 3, image: big() })], TODAY);
    expect(PDF_PHOTO_MAX_BYTES).toBe(12 * 1024 * 1024);
    expect(r.picked.map((p) => p.id)).toEqual(['a', 'b']);
    expect(r.omitted).toBe(1);
  });

  it('returns empty for no photos', () => {
    expect(selectPdfPhotos([], TODAY)).toEqual({ picked: [], omitted: 0 });
  });
});

describe('arrayBufferToDataUrl', () => {
  it('builds a base64 data URL with the jpeg prefix', () => {
    expect(arrayBufferToDataUrl(new Uint8Array([0xff, 0xd8, 0xff]).buffer, 'image/jpeg')).toBe('data:image/jpeg;base64,/9j/');
  });

  it('handles buffers larger than one chunk', () => {
    const bytes = new Uint8Array(0x8000 * 2 + 5).map((_, i) => i % 256);
    const url = arrayBufferToDataUrl(bytes.buffer, 'image/jpeg');
    const decoded = Uint8Array.from(atob(url.slice('data:image/jpeg;base64,'.length)), (c) => c.charCodeAt(0));
    expect(decoded).toEqual(bytes);
  });
});

describe('toEvidencePhotos', () => {
  it('maps a linked shift to a label and copies photo fields', () => {
    const r = toEvidencePhotos([photo('a', { shiftId: 's1', memo: '출근 카드', takenOnSource: 'saved' })], [SHIFT], TODAY);
    expect(r.omitted).toBe(0);
    expect(r.photos).toHaveLength(1);
    const p = r.photos[0];
    expect(p.dataUrl.startsWith('data:image/jpeg;base64,')).toBe(true);
    expect(p.shiftLabel).toBe('2026-10-05 09:00–18:00');
    expect(p).toMatchObject({ date: '2026-10-05', takenOn: '2026-10-05', takenOnSource: 'saved', expiresOn: '2028-10-05', memo: '출근 카드' });
  });

  it('gives null shiftLabel when the shift id is missing or null', () => {
    const r = toEvidencePhotos([photo('a', { shiftId: 'gone' }), photo('b', { shiftId: null, savedAt: 1 })], [SHIFT], TODAY);
    expect(r.photos.map((p) => p.shiftLabel)).toEqual([null, null]);
  });

  it('passes through omitted count from selection', () => {
    const all = Array.from({ length: 32 }, (_, i) => photo(`p${i}`, { savedAt: i }));
    const r = toEvidencePhotos(all, [], TODAY);
    expect(r.photos).toHaveLength(30);
    expect(r.omitted).toBe(2);
  });
});

describe('toEvidencePhotos failed count', () => {
  it('drops only the photo whose conversion throws and counts it as failed', () => {
    const broken = { byteLength: 3, [Symbol.iterator]: () => { throw new Error('bad image'); } } as unknown as ArrayBuffer;
    const r = toEvidencePhotos([photo('ok', { savedAt: 1 }), photo('bad', { savedAt: 2, image: broken })], [], TODAY);
    expect(r.photos).toHaveLength(1);
    expect(r.failed).toBe(1);
    expect(r.omitted).toBe(0);
  });

  it('reports failed 0 when all photos convert', () => {
    const r = toEvidencePhotos([photo('a', { savedAt: 1 }), photo('b', { savedAt: 2 })], [], TODAY);
    expect(r.photos).toHaveLength(2);
    expect(r.failed).toBe(0);
  });
});
