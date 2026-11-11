import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import type { ReactElement } from 'react';
import { LangContext, langValue } from '../../../i18n/LangContext';
import type { Lang } from '../../../i18n/types';
import { legalNumber } from '../../../legal';
import { UI_PACKS } from '../../../ui/i18n';
import { ExpiredPhotosPrompt } from './ExpiredPhotosPrompt';

const NOW = new Date(2028, 9, 21, 9, 0, 0);

function render(el: ReactElement, lang: Lang = 'vi'): string {
  return renderToString(<LangContext.Provider value={langValue(lang)}>{el}</LangContext.Provider>);
}

/** renderToString 의 텍스트 escape 와 같게 */
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

describe('ExpiredPhotosPrompt', () => {
  it('asks about 2 expired photos with the 3-year wage claim hint and both buttons', () => {
    const html = render(<ExpiredPhotosPrompt now={NOW} initialExpired={[{ id: 'a' }, { id: 'b' }]} />);
    const root = html.match(/^<[a-z]+[^>]*>/)?.[0] ?? '';
    expect(root).toContain('data-testid="expired-photos-prompt"');
    expect(root).toContain('role="region"');
    expect(root).toMatch(/aria-label="[^"]+"/);
    expect(root).toContain('data-count="2"');
    expect(html).toContain(esc(UI_PACKS.ko.expiredPhotosAsk(2)));
    expect(html).toContain(esc((UI_PACKS.vi ?? UI_PACKS.en).expiredPhotosAsk(2)));
    const hint = html.match(/data-testid="expired-photos-hint"[^>]*>([^]*?)<\/p>/)?.[1] ?? '';
    expect(legalNumber('wageClaimYears')).toBe(3);
    expect(hint).toContain('3');
    expect(hint).toContain(esc(UI_PACKS.ko.expiredPhotosHint(3)));
    expect(html).toMatch(/<button[^>]*type="button"[^>]*data-testid="expired-photos-delete"/);
    expect(html).toMatch(/<button[^>]*type="button"[^>]*data-testid="expired-photos-keep"/);
    expect(html).not.toContain('data-testid="photo-purged"');
    expect(html).not.toContain('data-testid="expired-photos-kept"');
  });

  it('renders nothing when there are no expired photos', () => {
    expect(render(<ExpiredPhotosPrompt now={NOW} initialExpired={[]} />)).toBe('');
  });

  it('shows the screen language with the Korean original kept in lang="ko"', () => {
    const html = render(<ExpiredPhotosPrompt now={NOW} initialExpired={[{ id: 'a' }]} />, 'en');
    const en = UI_PACKS.en;
    expect(html).toContain('data-count="1"');
    expect(html).toContain(esc(en.expiredPhotosAsk(1)));
    expect(html).toContain(esc(en.expiredPhotosHint(3)));
    expect(html).toContain(`<span lang="ko">${esc(UI_PACKS.ko.expiredPhotosAsk(1))}</span>`);
    expect(html).toMatch(new RegExp(`data-testid="expired-photos-delete"[^>]*>${esc(en.expiredPhotosDelete)}</button>`));
    expect(html).toMatch(new RegExp(`data-testid="expired-photos-keep"[^>]*>${esc(en.expiredPhotosKeep)}</button>`));
  });

  it('contains no judgement words', () => {
    const html = render(<ExpiredPhotosPrompt now={NOW} initialExpired={[{ id: 'a' }, { id: 'b' }]} />);
    for (const w of ['위법', '불법', '체불']) expect(html).not.toContain(w);
  });
});
