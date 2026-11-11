import type { TDocumentDefinitions } from 'pdfmake/interfaces';

export const KOREAN_FONT_FILE = 'fonts/NotoSansKR-subset.ttf';
export const PDF_FONT_NAME = 'NotoKR';

const VFS_FONT_KEY = 'NotoSansKR-subset.ttf';

type PdfMake = typeof import('pdfmake/build/pdfmake');

let pdfMakePromise: Promise<PdfMake> | null = null;

function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

async function loadPdfMake(): Promise<PdfMake> {
  const mod = await import('pdfmake/build/pdfmake');
  const pdfMake = ((mod as { default?: PdfMake }).default ?? mod) as PdfMake;
  const res = await fetch(`${import.meta.env.BASE_URL}${KOREAN_FONT_FILE}`);
  if (!res.ok) throw new Error(`font fetch failed: ${res.status}`);
  const base64 = arrayBufferToBase64(await res.arrayBuffer());
  pdfMake.addVirtualFileSystem({ [VFS_FONT_KEY]: base64 });
  pdfMake.addFonts({
    [PDF_FONT_NAME]: {
      normal: VFS_FONT_KEY,
      bold: VFS_FONT_KEY,
      italics: VFS_FONT_KEY,
      bolditalics: VFS_FONT_KEY,
    },
  });
  return pdfMake;
}

/** pdfmake 를 dynamic import, 폰트를 fetch 해 등록(1회 캐시), defaultStyle.font = NotoKR 강제 후 Blob(application/pdf) 반환 */
export async function renderPdf(doc: TDocumentDefinitions): Promise<Blob> {
  if (!pdfMakePromise) {
    pdfMakePromise = loadPdfMake().catch((err: unknown) => {
      pdfMakePromise = null;
      throw err;
    });
  }
  const pdfMake = await pdfMakePromise;
  const withFont: TDocumentDefinitions = {
    ...doc,
    defaultStyle: { ...(doc.defaultStyle ?? {}), font: PDF_FONT_NAME },
  };
  const blob = await pdfMake.createPdf(withFont).getBlob();
  return blob.type === 'application/pdf' ? blob : new Blob([blob], { type: 'application/pdf' });
}
