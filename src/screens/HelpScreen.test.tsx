import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { HelpScreen } from './HelpScreen';
import { LangContext, langValue } from '../i18n/LangContext';

function attrPair(testId: string, attr: string): RegExp {
  return new RegExp(
    `data-testid="${testId}"[^>]*${attr}|${attr}[^>]*data-testid="${testId}"`,
  );
}

describe('HelpScreen', () => {
  const html = renderToString(<HelpScreen />);

  it('renders root, title and expert note', () => {
    expect(html).toContain('data-testid="screen-help"');
    const h1 = html.match(/<h1[^>]*>(.*?)<\/h1>/)?.[1] ?? '';
    expect(h1.replace(/<[^>]+>/g, '')).toBe('Trợ giúp');
    expect(html).toContain('data-testid="help-expert-note"');
    expect(html).toContain('Korea30은 비자·법률을 판단하지 않아요.');
  });

  it('renders call links with tel hrefs', () => {
    expect(html).toMatch(attrPair('contact-call-police', 'href="tel:112"'));
    expect(html).toMatch(attrPair('contact-call-migrant', 'href="tel:15770071"'));
    expect(html.match(/data-testid="contact-call-/g)).toHaveLength(9);
    expect(html.match(/<article[^>]*data-testid="contact-[a-z]+"/g)).toHaveLength(9);
  });

  it('shows recheck badge only on migrant', () => {
    expect(html).toContain('data-testid="contact-recheck-migrant"');
    expect(html).not.toContain('data-testid="contact-recheck-labor"');
    expect(html.match(/data-testid="contact-recheck-/g)).toHaveLength(1);
  });

  it('shows vietnamese badges and say sentence', () => {
    expect(html).toContain('data-testid="contact-vi-immigration"');
    expect(html).toContain('data-testid="contact-vi-migrant"');
    expect(html.match(/data-testid="contact-vi-/g)).toHaveLength(2);
    expect(html).toContain('data-testid="contact-say-immigration"');
  });

  it('puts emergency section before lines', () => {
    const e = html.indexOf('data-testid="help-emergency"');
    const l = html.indexOf('data-testid="help-lines"');
    expect(e).toBeGreaterThan(-1);
    expect(l).toBeGreaterThan(e);
    const police = html.indexOf('data-testid="contact-police"');
    const fire = html.indexOf('data-testid="contact-fire"');
    expect(police).toBeGreaterThan(e);
    expect(fire).toBeLessThan(l);
    expect(html.indexOf('data-testid="contact-immigration"')).toBeGreaterThan(l);
  });

  it('links the expert note to the terms screen, after its text', () => {
    expect(html).toMatch(/<a[^>]*href="#\/terms"[^>]*data-testid="help-terms-link"|<a[^>]*data-testid="help-terms-link"[^>]*href="#\/terms"/);
    const note = html.indexOf('data-testid="help-expert-note"');
    const link = html.indexOf('data-testid="help-terms-link"');
    expect(link).toBeGreaterThan(note);
    expect(link).toBeLessThan(html.indexOf('data-testid="help-emergency"'));
  });

  it('has no forbidden words and no web links', () => {
    expect(html).not.toMatch(/틀렸|잘못|위반|불법/);
    expect(html).not.toMatch(/https?:/);
  });

  it('zh provider renders Chinese UI with Korean kept and Chinese say sentence', () => {
    const zh = langValue('zh');
    const zhHtml = renderToString(
      <LangContext.Provider value={zh}>
        <HelpScreen />
      </LangContext.Provider>,
    );
    const h1 = zhHtml.match(/<h1[^>]*>(.*?)<\/h1>/)?.[1] ?? '';
    expect(h1.replace(/<[^>]+>/g, '')).toBe(zh.ui.helpTitle);
    expect(zhHtml).toContain(zh.ui.helpExpertNote);
    expect(zhHtml).toContain(zh.ui.helpNativeBadge);
    expect(zhHtml).toContain('Korea30은 비자·법률을 판단하지 않아요.');
    expect(zhHtml).toContain('중국어 상담 부탁드립니다.');
    expect(zhHtml).not.toContain('베트남어 상담 부탁드립니다.');
    expect(zhHtml.match(/data-testid="contact-vi-/g)).toHaveLength(2);
    expect(zhHtml).not.toMatch(/Trợ giúp|Có tiếng Việt|Khẩn cấp|Tư vấn|Số cần xác nhận lại/);
  });
});
