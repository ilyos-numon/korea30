import { createWorker, PSM, type Worker } from 'tesseract.js';
// 세 경로 모두 앱 오리진 자산. 라이브러리 기본값(CDN)을 쓰지 않는다.
import workerUrl from 'tesseract.js/dist/worker.min.js?url';
import coreUrl from 'tesseract.js-core/tesseract-core-simd-lstm.wasm.js?url';
import { normalizeMrzText } from './mrz';

const WHITELIST = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<';
const MRZ_CROP_RATIO = 0.4;
const MIN_WIDTH = 1200;

let workerPromise: Promise<Worker> | null = null;
let progressListener: ((ratio: number) => void) | undefined;

// blob 워커 안에서도 풀리도록 절대 URL 로 바꾼다 (같은 오리진)
function abs(path: string): string {
  return new URL(path, window.location.href).href;
}

function getWorker(): Promise<Worker> {
  if (!workerPromise) {
    workerPromise = (async () => {
      const worker = await createWorker('eng', 1, {
        workerPath: abs(workerUrl),
        corePath: abs(coreUrl),
        langPath: abs(`${import.meta.env.BASE_URL}tessdata`),
        gzip: false,
        logger: (m) => {
          if (m.status === 'recognizing text') progressListener?.(m.progress);
        },
      });
      await worker.setParameters({
        tessedit_char_whitelist: WHITELIST,
        tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
      });
      return worker;
    })();
    workerPromise.catch(() => {
      workerPromise = null;
    });
  }
  return workerPromise;
}

/** 하단 cropRatio 만큼 잘라 그레이·이진화한 캔버스 (cropRatio 1 = 전체) */
async function preprocess(image: Blob, cropRatio: number): Promise<HTMLCanvasElement> {
  const bitmap = await createImageBitmap(image);
  const srcH = Math.max(1, Math.round(bitmap.height * cropRatio));
  const srcY = bitmap.height - srcH;
  const scale = bitmap.width < MIN_WIDTH ? MIN_WIDTH / bitmap.width : 1;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(srcH * scale);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('canvas 2d unavailable');
  ctx.drawImage(bitmap, 0, srcY, bitmap.width, srcH, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const px = img.data;
  const gray = new Uint8Array(px.length / 4);
  let sum = 0;
  for (let i = 0, j = 0; i < px.length; i += 4, j += 1) {
    const g = Math.round(0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]);
    gray[j] = g;
    sum += g;
  }
  // 평균보다 조금 어두운 값을 경계로 이진화 (배경 무늬 제거)
  const threshold = (sum / gray.length) * 0.85;
  for (let i = 0, j = 0; i < px.length; i += 4, j += 1) {
    const v = gray[j] < threshold ? 0 : 255;
    px[i] = v;
    px[i + 1] = v;
    px[i + 2] = v;
    px[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

export async function recognizeMrz(image: Blob, onProgress?: (ratio: number) => void): Promise<string> {
  const worker = await getWorker();
  progressListener = onProgress;
  try {
    const cropped = await worker.recognize(await preprocess(image, MRZ_CROP_RATIO));
    if (normalizeMrzText(cropped.data.text).length >= 2) return cropped.data.text;
    // MRZ 만 찍힌 이미지처럼 하단 크롭에서 두 줄이 안 나오면 전체로 한 번 더
    const full = await worker.recognize(await preprocess(image, 1));
    return normalizeMrzText(full.data.text).length >= 2 ? full.data.text : cropped.data.text;
  } finally {
    progressListener = undefined;
    onProgress?.(1);
  }
}
