import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { Intro } from './Intro';
import { Hint } from './Hint';
import { LangContext, langValue } from '../i18n/LangContext';
import type { Lang } from '../i18n/types';
import { UI_PACKS } from '../ui/i18n';

function render(lang: Lang): string {
  return renderToString(
    <LangContext.Provider value={langValue(lang)}>
      <Intro onDone={() => {}} />
    </LangContext.Provider>,
  );
}

describe('Intro', () => {
  it('renders four slides, skip and next, and no start button on the first slide', () => {
    const html = render('vi');
    expect(html).toContain('data-testid="intro"');
    expect(html.match(/data-testid="intro-slide-\d"/g)).toHaveLength(4);
    expect(html).toContain('data-testid="intro-skip"');
    expect(html).toContain('data-testid="intro-next"');
    expect(html).not.toContain('data-testid="intro-start"');
    expect(html).toMatch(/data-testid="intro-slide-1"[^>]*data-active="true"/);
    expect(html).toMatch(/data-testid="intro-slide-2"[^>]*data-active="false"/);
  });

  it.each(['zh', 'vi', 'en', 'th', 'uz', 'ru'] as const)('shows %s titles and bodies in the selected language', (lang) => {
    const html = render(lang);
    const t = UI_PACKS[lang]!;
    for (const s of [t.intro1Title, t.intro2Title, t.intro3Title, t.intro4Title, t.intro1Body, t.introSkip, t.introNext]) {
      expect(html).toContain(s.replace(/&/g, '&amp;').replace(/'/g, '&#x27;').replace(/"/g, '&quot;'));
    }
  });

  it('avoids judgement words', () => {
    for (const lang of ['vi', 'en'] as const) expect(render(lang)).not.toMatch(/위법|불법|체불|illegal|wrong/i);
  });
});

describe('Hint', () => {
  it('renders a collapsed ? button and keeps the explanation in a hidden panel', () => {
    const html = renderToString(<Hint text="설명 문장">본문</Hint>);
    expect(html).toMatch(/<button[^>]*class="hint-btn hint-btn-help"[^>]*aria-expanded="false"/);
    expect(html).toContain('>?</button>');
    expect(html).toMatch(/class="hint-panel"[^>]*hidden=""[^>]*>설명 문장</);
    expect(html).toContain('본문');
  });

  it('uses a 가 button with Korean lang for the Korean original', () => {
    const html = renderToString(<Hint kind="ko" text="한국어 원문">text</Hint>);
    expect(html).toContain('<span lang="ko">가</span>');
    expect(html).toMatch(/class="hint-panel"[^>]*hidden=""[^>]*lang="ko"/);
    expect(html).toContain(`aria-label="${UI_PACKS.vi!.koreanOriginal}"`);
  });
});
