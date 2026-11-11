import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { TabBar } from './TabBar';
import { LangContext, langValue } from '../i18n/LangContext';
import { PACKS } from '../i18n/packs';

function count(html: string, needle: string): number {
  return html.split(needle).length - 1;
}

describe('TabBar', () => {
  it('renders nav with 6 links', () => {
    const html = renderToString(<TabBar current="quest" />);
    expect(html).toContain('data-testid="tab-bar"');
    expect(html).toContain('class="tabbar"');
    expect(html).toContain('aria-label="Điều hướng"');
    expect(count(html, '<a ')).toBe(6);
    expect(html).toContain('href="#/"');
    expect(html).toContain('href="#/form"');
    expect(html).toContain('href="#/payslip"');
    expect(html).toContain('href="#/cards"');
    expect(html).toContain('href="#/glossary"');
    expect(html).toContain('href="#/tools"');
    // 한국어 탭 이름은 화면 글자 대신 title(툴팁)로만 남긴다
    expect(html).toContain('title="퀘스트"');
    expect(html).not.toContain('lang="ko"');
  });

  it('marks only the current tab with aria-current', () => {
    const html = renderToString(<TabBar current="payslip" />);
    expect(count(html, 'aria-current="page"')).toBe(1);
    expect(html).toMatch(/<a[^>]*data-testid="nav-payslip"[^>]*aria-current="page"/);
  });

  it.each(['tools', 'work', 'deadline', 'passport'] as const)('marks the tools tab current on %s', (current) => {
    const html = renderToString(<TabBar current={current} />);
    expect(count(html, 'aria-current="page"')).toBe(1);
    expect(html).toMatch(/<a[^>]*data-testid="nav-tools"[^>]*aria-current="page"/);
  });

  it('marks no tab when current is help', () => {
    const html = renderToString(<TabBar current="help" />);
    expect(count(html, 'aria-current')).toBe(0);
  });
});

describe('TabBar (lang)', () => {
  it('renders selected-language tab labels under ru provider', () => {
    const html = renderToString(
      <LangContext.Provider value={langValue('ru')}>
        <TabBar current="quest" />
      </LangContext.Provider>,
    );
    expect(html).toContain(PACKS.ru.ui.tabs.payslip);
    expect(html).toContain(PACKS.ru.ui.tabs.tools);
    expect(html).toContain(`aria-label="${PACKS.ru.ui.navAria}"`);
    expect(html).not.toContain('Lương');
    expect(html).toContain('급여');
  });
});
