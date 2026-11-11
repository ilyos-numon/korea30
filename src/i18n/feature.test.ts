import { describe, expect, it } from 'vitest';
import { createElement, type JSX } from 'react';
import { renderToString } from 'react-dom/server';
import { pickFeature, useFeatureStrings, type FeaturePacks } from './feature';
import { LangContext, langValue } from './LangContext';
import type { Lang } from './types';

interface Demo {
  title: string;
  count: (n: number | string) => string;
}

const PACKS: FeaturePacks<Demo> = {
  ko: { title: '제목', count: (n) => `${n}개` },
  en: { title: 'Title', count: (n) => `${n} items` },
  vi: { title: 'Tiêu đề', count: (n) => `${n} mục` },
};

describe('pickFeature', () => {
  it('returns the pack for the language when present', () => {
    expect(pickFeature(PACKS, 'vi').title).toBe('Tiêu đề');
    expect(pickFeature(PACKS, 'en').title).toBe('Title');
  });

  it.each<Lang>(['zh', 'th', 'uz', 'ru'])('falls back to en for missing %s', (lang) => {
    expect(pickFeature(PACKS, lang)).toBe(PACKS.en);
  });
});

function Probe(): JSX.Element {
  const { t, ko, lang } = useFeatureStrings(PACKS);
  return createElement('p', null, `${lang}|${t.title}|${ko.title}|${t.count(3)}`);
}

describe('useFeatureStrings', () => {
  it('uses the provider language with ko alongside', () => {
    const html = renderToString(createElement(LangContext.Provider, { value: langValue('vi') }, createElement(Probe)));
    expect(html).toContain('vi|Tiêu đề|제목|3 mục');
  });

  it('falls back to en for a language without a pack', () => {
    const html = renderToString(createElement(LangContext.Provider, { value: langValue('ru') }, createElement(Probe)));
    expect(html).toContain('ru|Title|제목|3 items');
  });
});
