import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { GlossaryScreen } from './GlossaryScreen';
import { LangContext, langValue } from '../i18n/LangContext';

describe('GlossaryScreen', () => {
  it('renders all 40 terms with count', () => {
    const html = renderToString(<GlossaryScreen />);
    expect(html).toContain('data-testid="screen-glossary"');
    expect(html).toContain('Từ điển lương &amp; hành chính');
    expect(html).toContain('data-testid="glossary-search"');
    expect(html).toMatch(/data-testid="glossary-count"[^>]*>40 từ</);
    expect(html.match(/<article[^>]*data-testid="term-[^"]+"/g)).toHaveLength(40);
    expect(html).not.toContain('data-testid="glossary-empty"');
  });

  it('links expert terms to help', () => {
    const html = renderToString(<GlossaryScreen />);
    expect(html).toContain('data-testid="term-stay-ext"');
    expect(html).toMatch(/data-testid="term-expert-stay-ext"[^>]*href="#\/help"|href="#\/help"[^>]*data-testid="term-expert-stay-ext"/);
    expect(html.match(/data-testid="term-expert-/g)).toHaveLength(3);
  });

  it('shows empty message for initialQuery zzzz', () => {
    const html = renderToString(<GlossaryScreen initialQuery="zzzz" />);
    expect(html).toContain('data-testid="glossary-empty"');
    expect(html).toMatch(/data-testid="glossary-count"[^>]*>0 từ</);
    expect(html).not.toMatch(/<article[^>]*data-testid="term-/);
  });

  it('filters by initialQuery', () => {
    const html = renderToString(<GlossaryScreen initialQuery="퇴직" />);
    expect(html).toContain('data-testid="term-severance"');
    expect(html).not.toContain('data-testid="term-base-pay"');
  });

  it('has no forbidden words', () => {
    const html = renderToString(<GlossaryScreen />);
    expect(html).not.toMatch(/틀렸|잘못|위반|불법/);
  });

  it('searches in zh: 保险 finds term-health', () => {
    const html = renderToString(
      <LangContext.Provider value={langValue('zh')}>
        <GlossaryScreen initialQuery="保险" />
      </LangContext.Provider>,
    );
    expect(html).toContain('工资和行政词典');
    expect(html).toContain('data-testid="term-health"');
    expect(html).toContain('건강보험');
    expect(html).not.toContain('Từ điển lương');
    expect(html).not.toContain('data-testid="glossary-empty"');
  });
});
