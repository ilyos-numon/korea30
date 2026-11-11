import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import type { ProgressStorage } from '../quest/progress';
import { LangContext, langValue } from '../i18n/LangContext';
import { resetTopNoticeForTest, setTopNotice } from '../ui/topNotice';
import { INSTALL_DISMISS_KEY } from './install';
import { InstallHint, InstallHintView } from './InstallHint';

const IPHONE_SAFARI =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';

function memStorage(init: Record<string, string> = {}): ProgressStorage {
  const map = new Map(Object.entries(init));
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
  };
}

const noop = (): void => {};

describe('InstallHint', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows iOS steps on iPhone Safari when not dismissed', () => {
    vi.stubGlobal('navigator', { userAgent: IPHONE_SAFARI });
    const html = renderToString(<InstallHint storage={memStorage()} />);
    expect(html).toMatch(/data-testid="install-hint"[^>]*data-mode="ios"|data-mode="ios"[^>]*data-testid="install-hint"/);
    expect(html).toContain('data-testid="install-hint-ios-steps"');
    expect(html).toContain('data-testid="install-hint-close"');
    expect(html).not.toContain('data-testid="install-hint-install"');
  });

  it('renders nothing when the dismiss key is set', () => {
    vi.stubGlobal('navigator', { userAgent: IPHONE_SAFARI });
    const html = renderToString(<InstallHint storage={memStorage({ [INSTALL_DISMISS_KEY]: '1' })} />);
    expect(html).toBe('');
  });

  it('renders nothing when mode is none (desktop, no prompt)', () => {
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (X11; Linux x86_64) Firefox/126.0' });
    expect(renderToString(<InstallHint storage={memStorage()} />)).toBe('');
  });

  it('renders nothing when installed (standalone)', () => {
    vi.stubGlobal('navigator', { userAgent: IPHONE_SAFARI, standalone: true });
    expect(renderToString(<InstallHint storage={memStorage()} />)).toBe('');
  });

  it('hides while the expired photos prompt or the backup reminder is shown, and comes back after', () => {
    vi.stubGlobal('navigator', { userAgent: IPHONE_SAFARI });
    resetTopNoticeForTest();
    setTopNotice('expiredPhotos', true);
    expect(renderToString(<InstallHint storage={memStorage()} />)).toBe('');
    setTopNotice('expiredPhotos', false);
    setTopNotice('backup', true);
    expect(renderToString(<InstallHint storage={memStorage()} />)).toBe('');
    setTopNotice('backup', false);
    expect(renderToString(<InstallHint storage={memStorage()} />)).toContain('data-testid="install-hint"');
    resetTopNoticeForTest();
  });
});

describe('InstallHintView', () => {
  it('prompt mode has install button, no iOS steps', () => {
    const html = renderToString(<InstallHintView mode="prompt" onInstall={noop} onClose={noop} />);
    expect(html).toContain('data-mode="prompt"');
    expect(html).toMatch(/<button[^>]*type="button"[^>]*data-testid="install-hint-install"/);
    expect(html).not.toContain('install-hint-ios-steps');
  });

  it('shows native text with Korean original and the reason', () => {
    const html = renderToString(
      <LangContext.Provider value={langValue('en')}>
        <InstallHintView mode="ios" onInstall={noop} onClose={noop} />
      </LangContext.Provider>,
    );
    expect(html).toContain('Add this app to your home screen');
    expect(html).toContain('<span lang="ko">홈 화면에 추가하세요</span>');
    expect(html).toContain('Tap the Share button below');
    expect(html).toMatch(/<ol[^>]*data-testid="install-hint-ios-steps"/);
  });
});
