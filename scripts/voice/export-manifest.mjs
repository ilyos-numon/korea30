// voiceTargets() 를 읽어 scripts/voice/manifest.json 을 쓴다. 사용: node scripts/voice/export-manifest.mjs
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..', '..');
const targetsPath = resolve(root, 'src/speech/voiceTargets.ts');
const outPath = resolve(here, 'manifest.json');

async function loadTargets() {
  const vite = await import('vite');
  try {
    const { module } = await vite.runnerImport(targetsPath, { configFile: false, logLevel: 'error' });
    return module.voiceTargets();
  } catch (err) {
    console.error(`runnerImport failed, falling back to ssrLoadModule: ${err?.message ?? err}`);
    const server = await vite.createServer({
      root,
      configFile: false,
      server: { middlewareMode: true },
      appType: 'custom',
      logLevel: 'error',
    });
    try {
      const mod = await server.ssrLoadModule('/src/speech/voiceTargets.ts');
      return mod.voiceTargets();
    } finally {
      await server.close();
    }
  }
}

const entries = await loadTargets();
const manifest = {
  version: 1,
  model: 'supertonic-3',
  voice: 'F5',
  totalSteps: 8,
  format: { codec: 'mp3', sampleRate: 24000, channels: 1, bitrateKbps: 32 },
  entries,
};
writeFileSync(outPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
const count = (l) => entries.filter((e) => e.lang === l).length;
console.log(`MANIFEST entries=${entries.length} ko=${count('ko')} vi=${count('vi')} en=${count('en')} ru=${count('ru')}`);
