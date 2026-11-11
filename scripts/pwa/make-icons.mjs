// public/icons/icon.svg 를 PWA 아이콘 PNG 로 렌더한다. 실행: node scripts/pwa/make-icons.mjs
// any 아이콘은 SVG 그대로, maskable·apple-touch 는 배경을 끝까지 채우고 글리프를 안전 영역(80%) 안에 둔다.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { chromium } from '@playwright/test';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ICON_DIR = path.join(ROOT, 'public/icons');
const BG = '#2e4bd1';

const TARGETS = [
  { file: 'icon-192.png', size: 192, fullBleed: false },
  { file: 'icon-512.png', size: 512, fullBleed: false },
  { file: 'icon-maskable-512.png', size: 512, fullBleed: true },
  { file: 'apple-touch-icon-180.png', size: 180, fullBleed: true },
];

function pageHtml(svg, size, fullBleed) {
  const scale = fullBleed ? 0.8 : 1;
  const inner = Math.round(size * scale);
  const offset = Math.round((size - inner) / 2);
  const bg = fullBleed ? BG : 'transparent';
  const src = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  return `<!doctype html><html><body style="margin:0;width:${size}px;height:${size}px;background:${bg}">
<img src="${src}" width="${inner}" height="${inner}" style="position:absolute;left:${offset}px;top:${offset}px;display:block">
</body></html>`;
}

const svg = await readFile(path.join(ICON_DIR, 'icon.svg'), 'utf8');
const browser = await chromium.launch();
try {
  for (const t of TARGETS) {
    const page = await browser.newPage({ viewport: { width: t.size, height: t.size }, deviceScaleFactor: 1 });
    await page.setContent(pageHtml(svg, t.size, t.fullBleed));
    await page.waitForFunction(() => document.images[0]?.complete);
    await page.screenshot({
      path: path.join(ICON_DIR, t.file),
      omitBackground: !t.fullBleed,
      clip: { x: 0, y: 0, width: t.size, height: t.size },
    });
    await page.close();
    console.log(`wrote public/icons/${t.file} (${t.size}x${t.size})`);
  }
} finally {
  await browser.close();
}
