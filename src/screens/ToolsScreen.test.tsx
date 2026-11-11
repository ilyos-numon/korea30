import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { ToolsScreen } from './ToolsScreen';
import { LangContext, langValue } from '../i18n/LangContext';
import type { Lang } from '../i18n/types';
import { ko } from '../tools/i18n/ko';
import { en } from '../tools/i18n/en';
import { TOOLS_PACKS } from '../tools/i18n';
import { ABOUT_PACKS } from '../about/i18n';

function render(lang: Lang = 'vi'): string {
  return renderToString(
    <LangContext.Provider value={langValue(lang)}>
      <ToolsScreen />
    </LangContext.Provider>,
  );
}

function escape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

describe('ToolsScreen', () => {
  it('renders screen-tools root with three tool links to their routes', () => {
    const html = render();
    expect(html).toContain('data-testid="screen-tools"');
    expect(html).toMatch(/<a[^>]*href="#\/work"[^>]*data-testid="tool-work"|<a[^>]*data-testid="tool-work"[^>]*href="#\/work"/);
    expect(html).toMatch(/<a[^>]*href="#\/deadline"[^>]*data-testid="tool-deadline"|<a[^>]*data-testid="tool-deadline"[^>]*href="#\/deadline"/);
    expect(html).toMatch(/<a[^>]*href="#\/passport"[^>]*data-testid="tool-passport"|<a[^>]*data-testid="tool-passport"[^>]*href="#\/passport"/);
  });

  it('links to privacy and terms below the about button', () => {
    const html = render('en');
    expect(html).toMatch(/<a[^>]*href="#\/privacy"[^>]*data-testid="tools-privacy-link"|<a[^>]*data-testid="tools-privacy-link"[^>]*href="#\/privacy"/);
    expect(html).toMatch(/<a[^>]*href="#\/terms"[^>]*data-testid="tools-terms-link"|<a[^>]*data-testid="tools-terms-link"[^>]*href="#\/terms"/);
    const about = html.indexOf('data-testid="tools-about"');
    const nav = html.indexOf('class="tools-legal"');
    expect(nav).toBeGreaterThan(about);
    expect(html.indexOf('data-testid="tools-privacy-link"')).toBeGreaterThan(nav);
    expect(html).toContain(escape(ABOUT_PACKS.en.linkPrivacy));
    expect(html).toContain(escape(ABOUT_PACKS.en.linkTerms));
  });

  it('shows each card description and the on-device storage note', () => {
    const html = render('en');
    for (const s of [en.workDesc, en.deadlineDesc, en.passportDesc, en.passportDeviceOnly]) {
      expect(html).toContain(escape(s));
    }
    expect(html.split(escape(en.deviceOnly)).length - 1).toBe(2);
  });

  it('keeps the Korean tool names as tooltips instead of extra visible text', () => {
    const html = render('en');
    expect(html).toContain(`title="${escape(ko.workTitle)}"`);
    expect(html).toContain(`title="${escape(ko.deadlineTitle)}"`);
    expect(html).toContain(`title="${escape(ko.passportTitle)}"`);
    expect(html).not.toContain(escape(ko.deviceOnly));
  });

  it('falls back to English for languages without a pack', () => {
    const html = render('vi');
    const t = TOOLS_PACKS.vi ?? en;
    expect(html).toContain(escape(t.title));
  });

  it('string packs have the same keys and no empty values', () => {
    expect(Object.keys(ko).sort()).toEqual(Object.keys(en).sort());
    for (const v of [...Object.values(ko), ...Object.values(en)]) {
      expect(typeof v).toBe('string');
      expect(v.length).toBeGreaterThan(0);
    }
  });
});
