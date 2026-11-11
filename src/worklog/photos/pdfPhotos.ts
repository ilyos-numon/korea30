import type { WorkPhoto, WorkShift } from '../../storage/db';
import { expiryState } from './expiry';

export const PDF_PHOTO_MAX_COUNT = 30;
export const PDF_PHOTO_MAX_BYTES = 12 * 1024 * 1024;

export interface EvidencePhoto {
  dataUrl: string;
  date: string;
  takenOn: string;
  takenOnSource: 'exif' | 'saved';
  expiresOn: string;
  memo: string;
  shiftLabel: string | null;
}

/** expired(expiryState) 제외 → date·savedAt 오름차순 → 개수·바이트 상한까지. omitted = 상한으로 빠진 수(만료는 세지 않음) */
export function selectPdfPhotos(all: readonly WorkPhoto[], today: string): { picked: WorkPhoto[]; omitted: number } {
  const live = all
    .filter((p) => expiryState(p.expiresOn, today) !== 'expired')
    .sort((a, b) => a.date.localeCompare(b.date) || a.savedAt - b.savedAt);
  const picked: WorkPhoto[] = [];
  let bytes = 0;
  for (const p of live) {
    if (picked.length >= PDF_PHOTO_MAX_COUNT) break;
    if (bytes + p.image.byteLength > PDF_PHOTO_MAX_BYTES) break;
    picked.push(p);
    bytes += p.image.byteLength;
  }
  return { picked, omitted: live.length - picked.length };
}

export function arrayBufferToDataUrl(buf: ArrayBuffer, mime: string): string {
  const bytes = new Uint8Array(buf);
  const CHUNK = 0x8000;
  let bin = '';
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return `data:${mime};base64,${btoa(bin)}`;
}

export function toEvidencePhotos(
  all: readonly WorkPhoto[],
  shifts: readonly WorkShift[],
  today: string,
): { photos: EvidencePhoto[]; omitted: number; failed: number } {
  const byId = new Map(shifts.map((s) => [s.id, s]));
  const { picked, omitted } = selectPdfPhotos(all, today);
  const photos: EvidencePhoto[] = [];
  let failed = 0;
  for (const p of picked) {
    let dataUrl: string;
    try {
      dataUrl = arrayBufferToDataUrl(p.image, p.mime);
    } catch {
      // 이 사진만 뺀다. 나머지는 유지
      failed += 1;
      continue;
    }
    const s = p.shiftId ? byId.get(p.shiftId) : undefined;
    photos.push({
      dataUrl,
      date: p.date,
      takenOn: p.takenOn,
      takenOnSource: p.takenOnSource,
      expiresOn: p.expiresOn,
      memo: p.memo,
      shiftLabel: s ? `${s.date} ${s.start}–${s.end}` : null,
    });
  }
  return { photos, omitted, failed };
}
