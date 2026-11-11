import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { TERMS } from '../glossary/glossary';
import { termView } from '../i18n/content';
import { LOCAL } from '../i18n/local';
import { LANGS } from '../i18n/types';
import { normalizeVoiceText, RECORDED_LANGS, voiceFile, voiceKey } from './voiceKey';
import { voiceTargets } from './voiceTargets';

describe('voiceKey', () => {
  it('is deterministic and 8 lowercase hex chars', () => {
    expect(voiceKey('ko', '기본급')).toBe(voiceKey('ko', '기본급'));
    expect(voiceKey('ko', '기본급')).toMatch(/^[0-9a-f]{8}$/);
    expect(voiceKey('en', '')).toMatch(/^[0-9a-f]{8}$/);
  });

  it('treats NFC and NFD the same', () => {
    const nfc = '기본급'.normalize('NFC');
    const nfd = '기본급'.normalize('NFD');
    expect(nfc).not.toBe(nfd);
    expect(voiceKey('ko', nfd)).toBe(voiceKey('ko', nfc));
  });

  it('ignores leading and trailing whitespace', () => {
    expect(voiceKey('vi', '  Lương cơ bản \n')).toBe(voiceKey('vi', 'Lương cơ bản'));
    expect(normalizeVoiceText('  a b  ')).toBe('a b');
  });

  it('differs by lang', () => {
    expect(voiceKey('en', 'OK')).not.toBe(voiceKey('ru', 'OK'));
  });

  it('builds file path from lang and key', () => {
    expect(voiceFile('ru', 'Да')).toBe(`ru/${voiceKey('ru', 'Да')}.mp3`);
  });
});

describe('voiceTargets', () => {
  const targets = voiceTargets();

  it('has no key collision within a lang', () => {
    const seen = new Set(targets.map((t) => `${t.lang}/${t.key}`));
    expect(seen.size).toBe(targets.length);
    for (const t of targets) expect(t.file).toBe(`${t.lang}/${t.key}.mp3`);
  });

  it('has no empty or unnormalized text', () => {
    for (const t of targets) {
      expect(t.text).not.toBe('');
      expect(t.text).toBe(normalizeVoiceText(t.text));
    }
  });

  it('includes interpreterKo and remitKo of all 6 langs in ko', () => {
    const ko = new Set(targets.filter((t) => t.lang === 'ko').map((t) => t.text));
    for (const l of LANGS) {
      expect(ko.has(normalizeVoiceText(LOCAL[l].interpreterKo))).toBe(true);
      expect(ko.has(normalizeVoiceText(LOCAL[l].remitKo))).toBe(true);
    }
  });

  it('includes the first term name for vi, en, ru', () => {
    for (const l of ['vi', 'en', 'ru'] as const) {
      const name = normalizeVoiceText(termView(TERMS[0], l).name);
      expect(targets.some((t) => t.lang === l && t.text === name)).toBe(true);
    }
  });

  it('has only recorded langs (no zh, th, uz)', () => {
    for (const t of targets) expect(RECORDED_LANGS).toContain(t.lang);
    expect(targets.filter((t) => (t.lang as string) === 'zh' || (t.lang as string) === 'th' || (t.lang as string) === 'uz')).toHaveLength(0);
  });

  it('is sorted by RECORDED_LANGS order then text ascending', () => {
    for (let i = 1; i < targets.length; i++) {
      const a = targets[i - 1];
      const b = targets[i];
      const la = RECORDED_LANGS.indexOf(a.lang);
      const lb = RECORDED_LANGS.indexOf(b.lang);
      expect(la <= lb).toBe(true);
      if (la === lb) expect(a.text < b.text).toBe(true);
    }
  });

  it('matches scripts/voice/manifest.json entries', () => {
    const raw = readFileSync('scripts/voice/manifest.json', 'utf8');
    const manifest = JSON.parse(raw) as { entries: unknown[] };
    expect(manifest.entries).toEqual(targets);
  });
});
