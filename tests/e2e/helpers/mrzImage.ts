import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Page } from '@playwright/test';

/** ICAO Doc 9303 Part 4 TD3 견본 (PLAN §4.10) */
export const MRZ_LINES: readonly [string, string] = [
  'P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<',
  'L898902C36UTO7408122F1204159ZE184226B<<<<<10',
];

export const MRZ_FIXTURE_PATH = fileURLToPath(new URL('../fixtures/mrz-specimen.png', import.meta.url));

/** Playwright 페이지 캔버스로 흰 배경·검정 고정폭 글꼴(56px) MRZ 2줄 PNG 를 그린다 */
export async function drawMrzPng(page: Page): Promise<Buffer> {
  const dataUrl = await page.evaluate((lines) => {
    const size = 56;
    const font = `bold ${size}px "Courier New", Courier, monospace`;
    const probe = document.createElement('canvas').getContext('2d')!;
    probe.font = font;
    const charW = probe.measureText('M').width;
    const pad = 60;
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(charW * 44 + pad * 2);
    canvas.height = Math.ceil(size * 2 * 1.5 + pad * 2);
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000';
    ctx.font = font;
    ctx.textBaseline = 'top';
    lines.forEach((line, i) => ctx.fillText(line, pad, pad + i * size * 1.5));
    return canvas.toDataURL('image/png');
  }, MRZ_LINES);
  return Buffer.from(dataUrl.split(',')[1]!, 'base64');
}

/** fixtures/mrz-specimen.png 가 없으면 만든다 (생성된 PNG 는 커밋 대상) */
export async function ensureMrzFixture(page: Page): Promise<string> {
  if (!existsSync(MRZ_FIXTURE_PATH)) {
    mkdirSync(path.dirname(MRZ_FIXTURE_PATH), { recursive: true });
    writeFileSync(MRZ_FIXTURE_PATH, await drawMrzPng(page));
  }
  return MRZ_FIXTURE_PATH;
}
