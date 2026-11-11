import { afterEach, describe, expect, it, vi } from 'vitest';
import { INSTALL_DISMISS_KEY, detectInstallMode, isStandalone } from './install';

const IPHONE_SAFARI =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const IPHONE_CRIOS =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0.6478.54 Mobile/15E148 Safari/604.1';
const ANDROID_CHROME =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36';

describe('detectInstallMode', () => {
  it('iPhone Safari without prompt → ios', () => {
    expect(detectInstallMode({ standalone: false, ua: IPHONE_SAFARI, hasPrompt: false })).toBe('ios');
  });

  it('iPhone Chrome (CriOS) → none (cannot add from there)', () => {
    expect(detectInstallMode({ standalone: false, ua: IPHONE_CRIOS, hasPrompt: false })).toBe('none');
  });

  it('Android Chrome with beforeinstallprompt → prompt; without → none', () => {
    expect(detectInstallMode({ standalone: false, ua: ANDROID_CHROME, hasPrompt: true })).toBe('prompt');
    expect(detectInstallMode({ standalone: false, ua: ANDROID_CHROME, hasPrompt: false })).toBe('none');
  });

  it('standalone → installed even with prompt or iOS Safari', () => {
    expect(detectInstallMode({ standalone: true, ua: ANDROID_CHROME, hasPrompt: true })).toBe('installed');
    expect(detectInstallMode({ standalone: true, ua: IPHONE_SAFARI, hasPrompt: false })).toBe('installed');
  });
});

describe('isStandalone', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('false when window is missing (node)', () => {
    expect(isStandalone()).toBe(false);
  });

  it('true when display-mode standalone matches', () => {
    vi.stubGlobal('window', { matchMedia: () => ({ matches: true }) });
    expect(isStandalone()).toBe(true);
  });

  it('true when navigator.standalone is true (iOS)', () => {
    vi.stubGlobal('window', { matchMedia: () => ({ matches: false }) });
    vi.stubGlobal('navigator', { userAgent: IPHONE_SAFARI, standalone: true });
    expect(isStandalone()).toBe(true);
  });
});

describe('INSTALL_DISMISS_KEY', () => {
  it('is the new versioned key', () => {
    expect(INSTALL_DISMISS_KEY).toBe('korea30.install.v1');
  });
});
