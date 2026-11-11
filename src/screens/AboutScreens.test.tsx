import { describe, expect, it } from 'vitest';
import type { JSX } from 'react';
import { renderToString } from 'react-dom/server';
import { PrivacyScreen } from './PrivacyScreen';
import { TermsScreen } from './TermsScreen';
import { ContactSection } from '../about/ContactSection';
import { ABOUT_PACKS } from '../about/i18n';
import { LangContext, langValue } from '../i18n/LangContext';
import type { Lang } from '../i18n/types';

function render(node: JSX.Element, lang: Lang = 'vi'): string {
  return renderToString(<LangContext.Provider value={langValue(lang)}>{node}</LangContext.Provider>);
}

function escape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function order(html: string, ids: readonly string[]): number[] {
  return ids.map((id) => html.indexOf(`data-testid="${id}"`));
}

describe('PrivacyScreen', () => {
  it('(a) renders five sections in order and the effective date in vi', () => {
    const html = render(<PrivacyScreen />, 'vi');
    expect(html).toContain('data-testid="screen-privacy"');
    const idx = order(html, ['nocollect', 'storage', 'photo', 'backup', 'hosting'].map((s) => `privacy-section-${s}`));
    for (const i of idx) expect(i).toBeGreaterThan(-1);
    expect([...idx].sort((a, b) => a - b)).toEqual(idx);
    expect(html).toMatch(/data-testid="privacy-updated"[^>]*>[^<]*2026-10-29/);
    expect(html).toContain('data-testid="about-contact"');
    expect(html).toMatch(/<a[^>]*href="#\/terms"[^>]*data-testid="privacy-to-terms"/);
  });

  it('(e) uses the en title in en, with the Korean title as tooltip', () => {
    const html = render(<PrivacyScreen />, 'en');
    expect(html).toMatch(new RegExp(`data-testid="about-title"[^>]*>${escape(ABOUT_PACKS.en.privacyTitle)}<`));
    expect(html).toContain(`title="${escape(ABOUT_PACKS.ko.privacyTitle)}"`);
  });
});

describe('TermsScreen', () => {
  it('(b) renders three sections in order', () => {
    const html = render(<TermsScreen />, 'vi');
    expect(html).toContain('data-testid="screen-terms"');
    const idx = order(html, ['notadvice', 'accuracy', 'docs'].map((s) => `terms-section-${s}`));
    for (const i of idx) expect(i).toBeGreaterThan(-1);
    expect([...idx].sort((a, b) => a - b)).toEqual(idx);
    expect(html).toContain(escape(ABOUT_PACKS.vi!.termsTitle));
    expect(html).toContain('data-testid="about-contact"');
    expect(html).toMatch(/<a[^>]*href="#\/privacy"[^>]*data-testid="terms-to-privacy"/);
  });
});

describe('ContactSection', () => {
  it('(c) shows pending text and no mailto link without an email', () => {
    const html = render(<ContactSection email={null} />);
    expect(html).toContain('data-testid="about-contact-pending"');
    expect(html).not.toContain('mailto:');
    expect(html).not.toContain('data-testid="about-contact-email"');
  });

  it('(d) links to the given email', () => {
    const html = render(<ContactSection email="help@example.com" />);
    expect(html).toContain('href="mailto:help@example.com"');
    expect(html).toContain('data-testid="about-contact-email"');
    expect(html).not.toContain('data-testid="about-contact-pending"');
  });
});
