import type { Page } from '@playwright/test';

/** page.goto 전에 호출. 키가 prefix 로 시작하는 localStorage.setItem 만 DOMException(name) 으로 실패시킨다.
 *  읽기·다른 키 쓰기(언어 등)는 그대로 둔다. */
export async function failLocalStorage(
  page: Page,
  prefix: string,
  name: 'QuotaExceededError' | 'SecurityError',
): Promise<void> {
  await page.addInitScript(
    ([p, n]) => {
      const orig = Storage.prototype.setItem;
      Storage.prototype.setItem = function (this: Storage, key: string, value: string): void {
        if (String(key).startsWith(p)) throw new DOMException('k30 injected localStorage failure', n);
        orig.call(this, key, value);
      };
    },
    [prefix, name],
  );
}
