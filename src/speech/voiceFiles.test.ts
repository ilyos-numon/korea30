import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { RECORDED_LANGS } from './voiceKey';
import { voiceTargets } from './voiceTargets';

const VOICE_DIR = join(process.cwd(), 'public', 'voice');
const MANIFEST = join(process.cwd(), 'scripts', 'voice', 'manifest.json');
const MIN_BYTES = 1000;
const MAX_BYTES = 81920;
const MAX_TOTAL = 6291456;
const HINT =
  'run: node scripts/voice/export-manifest.mjs && uv run --project ../voice-agent --frozen --extra tts python scripts/voice/record.py --manifest scripts/voice/manifest.json --out public/voice --prune';

function listMp3(): string[] {
  const out: string[] = [];
  for (const lang of RECORDED_LANGS) {
    const dir = join(VOICE_DIR, lang);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) if (f.endsWith('.mp3')) out.push(`${lang}/${f}`);
  }
  return out;
}

describe('recorded voice files', () => {
  const targets = voiceTargets();
  const targetFiles = new Set(targets.map((t) => t.file));

  it('has a file for every target', () => {
    const missing = targets.filter((t) => !existsSync(join(VOICE_DIR, t.file))).map((t) => `public/voice/${t.file} (${t.text})`);
    expect(missing, `missing recordings:\n${missing.join('\n')}\n${HINT}`).toEqual([]);
  });

  it('keeps each file between 1000 and 81920 bytes', () => {
    const bad: string[] = [];
    for (const t of targets) {
      const p = join(VOICE_DIR, t.file);
      if (!existsSync(p)) continue;
      const size = statSync(p).size;
      if (size < MIN_BYTES || size > MAX_BYTES) bad.push(`public/voice/${t.file} size=${size}`);
    }
    expect(bad, `bad file sizes:\n${bad.join('\n')}\n${HINT}`).toEqual([]);
  });

  it('has no orphan files', () => {
    const orphans = listMp3().filter((f) => !targetFiles.has(f)).map((f) => `public/voice/${f}`);
    expect(orphans, `orphan recordings:\n${orphans.join('\n')}\n${HINT}`).toEqual([]);
  });

  it('keeps total size within 6291456 bytes', () => {
    const total = listMp3().reduce((sum, f) => sum + statSync(join(VOICE_DIR, f)).size, 0);
    expect(total, `total=${total}`).toBeLessThanOrEqual(MAX_TOTAL);
  });

  it('has no key collision', () => {
    const keys = targets.map((t) => `${t.lang}/${t.key}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('matches scripts/voice/manifest.json', () => {
    const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8')) as { entries: unknown[] };
    expect(manifest.entries, `scripts/voice/manifest.json is stale\n${HINT}`).toEqual(targets);
  });
});
