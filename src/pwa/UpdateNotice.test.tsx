import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { LangContext, LangProvider, langValue } from '../i18n/LangContext';
import { UpdateNotice } from './UpdateNotice';

const noop = (): void => {};

describe('UpdateNotice', () => {
  it('renders root role=status and reload/close buttons with testids', () => {
    const html = renderToString(<UpdateNotice onReload={noop} onClose={noop} />);
    expect(html).toMatch(/<[a-z]+[^>]*role="status"[^>]*data-testid="pwa-update"|<[a-z]+[^>]*data-testid="pwa-update"[^>]*role="status"/);
    expect(html).toMatch(/<button[^>]*type="button"[^>]*data-testid="pwa-update-reload"/);
    expect(html).toMatch(/<button[^>]*type="button"[^>]*data-testid="pwa-update-close"/);
  });

  it('shows native text plus Korean original in lang="ko"', () => {
    const html = renderToString(
      <LangProvider lang="en" setLang={noop}>
        <UpdateNotice onReload={noop} onClose={noop} />
      </LangProvider>,
    );
    expect(html).toContain('A new version is available. Reload to update.');
    expect(html).toContain('<span lang="ko">새 버전이 있어요. 새로고침하면 바뀌어요.</span>');
    expect(html).toContain('Reload');
    expect(html).toContain('Close');
  });

  it('uses the screen language for buttons (zh) and keeps Korean original', () => {
    const html = renderToString(
      <LangContext.Provider value={langValue('zh')}>
        <UpdateNotice onReload={noop} onClose={noop} />
      </LangContext.Provider>,
    );
    expect(html).toContain('有新版本。刷新后即可更新。');
    expect(html).toContain('<span lang="ko">새 버전이 있어요. 새로고침하면 바뀌어요.</span>');
    expect(html).toMatch(/data-testid="pwa-update-reload"[^>]*>刷新<\/button>/);
  });
});
