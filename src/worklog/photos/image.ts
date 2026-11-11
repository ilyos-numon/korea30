// 사진 처리 래퍼. compressorjs·exifr 는 이 파일의 함수 안에서만 dynamic import 한다 (PLAN §4.0·§4.4).
// compressorjs: https://github.com/fengyuanchen/compressorjs · exifr: https://github.com/MikeKovarik/exifr

export const MAX_INPUT_BYTES = 25 * 1024 * 1024;
export const IMAGE_MAX_EDGE = 1600;
export const IMAGE_QUALITY = 0.7;
export const THUMB_MAX_EDGE = 320;
export const THUMB_QUALITY = 0.6;

export type PhotoInputError = 'notImage' | 'tooLarge' | 'decode';

export interface ProcessedPhoto {
  image: ArrayBuffer;
  thumb: ArrayBuffer;
  mime: 'image/jpeg';
  width: number;
  height: number;
  takenOn: string | null;
}

export type ProcessResult =
  | { ok: true; photo: ProcessedPhoto }
  | { ok: false; error: PhotoInputError };

const MIN_YEAR = 1990;

/** 순수. type 이 'image/' 로 시작하지 않으면 notImage, size > MAX_INPUT_BYTES 면 tooLarge */
export function checkPhotoFile(file: { type: string; size: number }): PhotoInputError | null {
  if (!file.type.startsWith('image/')) return 'notImage';
  if (file.size > MAX_INPUT_BYTES) return 'tooLarge';
  return null;
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function ymdToIso(y: number, m: number, d: number): string | null {
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return null;
  if (y < MIN_YEAR || m < 1 || m > 12 || d < 1) return null;
  const check = new Date(y, m - 1, d);
  if (check.getFullYear() !== y || check.getMonth() !== m - 1 || check.getDate() !== d) return null;
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

/** 순수. Date → 로컬 'YYYY-MM-DD'; 'YYYY:MM:DD HH:mm:ss' → 'YYYY-MM-DD'; 1990 미만·잘못된 값·undefined → null */
export function exifDateToIso(v: unknown): string | null {
  if (v instanceof Date) {
    if (Number.isNaN(v.getTime())) return null;
    return ymdToIso(v.getFullYear(), v.getMonth() + 1, v.getDate());
  }
  if (typeof v === 'string') {
    const m = /^(\d{4}):(\d{2}):(\d{2})(?:[ T]|$)/.exec(v.trim());
    if (!m) return null;
    return ymdToIso(Number(m[1]), Number(m[2]), Number(m[3]));
  }
  return null;
}

/** exifr dynamic import, parse(buf, { pick: ['DateTimeOriginal', 'CreateDate'] }), 어떤 오류도 null */
export async function readTakenOn(buf: ArrayBuffer): Promise<string | null> {
  try {
    const mod = await import('exifr');
    const exifr = mod.default ?? mod;
    const tags: unknown = await exifr.parse(buf, { pick: ['DateTimeOriginal', 'CreateDate'] });
    if (!tags || typeof tags !== 'object') return null;
    const t = tags as { DateTimeOriginal?: unknown; CreateDate?: unknown };
    return exifDateToIso(t.DateTimeOriginal) ?? exifDateToIso(t.CreateDate);
  } catch {
    return null;
  }
}

async function compress(file: File, maxEdge: number, quality: number): Promise<Blob> {
  const { default: Compressor } = await import('compressorjs');
  return new Promise<Blob>((resolve, reject) => {
    new Compressor(file, {
      strict: false, // 기본 true 면 결과가 클 때 원본(EXIF·GPS 포함)을 돌려준다
      checkOrientation: true,
      retainExif: false,
      mimeType: 'image/jpeg',
      convertSize: Infinity,
      maxWidth: maxEdge,
      maxHeight: maxEdge,
      quality,
      success: resolve,
      error: reject,
    });
  });
}

async function measure(blob: Blob): Promise<{ width: number; height: number }> {
  if (typeof createImageBitmap === 'function') {
    const bmp = await createImageBitmap(blob);
    const size = { width: bmp.width, height: bmp.height };
    bmp.close();
    return size;
  }
  const url = URL.createObjectURL(blob);
  try {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => reject(new Error('decode'));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** checkPhotoFile → readTakenOn(원본) → compressorjs 로 2회 압축 (image·thumb). 압축·측정 실패 → decode */
export async function processPhoto(file: File): Promise<ProcessResult> {
  const invalid = checkPhotoFile(file);
  if (invalid) return { ok: false, error: invalid };
  try {
    const takenOn = await readTakenOn(await file.arrayBuffer());
    const imageBlob = await compress(file, IMAGE_MAX_EDGE, IMAGE_QUALITY);
    const thumbBlob = await compress(file, THUMB_MAX_EDGE, THUMB_QUALITY);
    const { width, height } = await measure(imageBlob);
    if (!(width > 0 && height > 0)) return { ok: false, error: 'decode' };
    return {
      ok: true,
      photo: {
        image: await imageBlob.arrayBuffer(),
        thumb: await thumbBlob.arrayBuffer(),
        mime: 'image/jpeg',
        width,
        height,
        takenOn,
      },
    };
  } catch {
    return { ok: false, error: 'decode' };
  }
}
