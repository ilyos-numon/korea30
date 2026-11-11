import { beforeEach, describe, expect, it } from 'vitest';
import { isTopNoticeShown, resetTopNoticeForTest, setTopNotice, subscribeTopNotice } from './topNotice';

describe('topNotice', () => {
  beforeEach(() => resetTopNoticeForTest());

  it('starts with nothing shown', () => {
    expect(isTopNoticeShown(['expiredPhotos'])).toBe(false);
    expect(isTopNoticeShown(['expiredPhotos', 'backup'])).toBe(false);
  });

  it('reports a kind while it is shown and clears it when hidden', () => {
    setTopNotice('expiredPhotos', true);
    expect(isTopNoticeShown(['expiredPhotos'])).toBe(true);
    expect(isTopNoticeShown(['backup'])).toBe(false);
    expect(isTopNoticeShown(['expiredPhotos', 'backup'])).toBe(true);
    setTopNotice('expiredPhotos', false);
    expect(isTopNoticeShown(['expiredPhotos', 'backup'])).toBe(false);
  });

  it('notifies subscribers only when a value changes, until unsubscribed', () => {
    let calls = 0;
    const off = subscribeTopNotice(() => {
      calls += 1;
    });
    setTopNotice('backup', true);
    setTopNotice('backup', true);
    expect(calls).toBe(1);
    setTopNotice('backup', false);
    expect(calls).toBe(2);
    off();
    setTopNotice('backup', true);
    expect(calls).toBe(2);
  });
});
