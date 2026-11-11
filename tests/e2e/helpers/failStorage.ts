import type { Page } from '@playwright/test';

export type IdbFailKind = 'quota' | 'unknown';

interface FailFlags {
  write?: IdbFailKind | null;
  read?: IdbFailKind | null;
}

/** 브라우저 안에서 실행된다. 바깥 변수를 참조하지 않는다. */
function installInPage(): void {
  const w = window as unknown as { __k30Fail?: FailFlags; __k30FailInstalled?: boolean };
  if (w.__k30FailInstalled) return;
  w.__k30FailInstalled = true;
  if (!w.__k30Fail) w.__k30Fail = {};
  const toError = (kind: IdbFailKind): DOMException =>
    new DOMException(
      kind === 'quota' ? 'k30 injected quota failure' : 'k30 injected failure',
      kind === 'quota' ? 'QuotaExceededError' : 'UnknownError',
    );
  const wrap = (proto: object, names: readonly string[], key: 'write' | 'read'): void => {
    const p = proto as Record<string, unknown>;
    for (const name of names) {
      const orig = p[name];
      if (typeof orig !== 'function') continue;
      p[name] = function (this: unknown, ...args: unknown[]): unknown {
        const kind = w.__k30Fail?.[key];
        if (kind) throw toError(kind);
        return (orig as (...a: unknown[]) => unknown).apply(this, args);
      };
    }
  };
  wrap(IDBObjectStore.prototype, ['put', 'add', 'delete', 'clear'], 'write');
  wrap(IDBObjectStore.prototype, ['get', 'getAll'], 'read');
  wrap(IDBIndex.prototype, ['get', 'getAll'], 'read');
}

/** page.goto 전에 호출. IDBObjectStore.prototype.{put,add,delete,clear} 와 IDBIndex/IDBObjectStore.prototype.{get,getAll} 을 감싸
 *  window.__k30Fail = { write?: IdbFailKind; read?: IdbFailKind } 가 켜졌을 때 DOMException 을 동기 throw
 *  (quota → name 'QuotaExceededError', unknown → 'UnknownError'). 기본은 꺼짐 */
export async function installIdbFailure(page: Page): Promise<void> {
  await page.addInitScript(installInPage);
}

/** 실행 중 켜고 끄기. null = 끔 (키를 생략하면 그 플래그는 그대로) */
export async function setIdbFailure(
  page: Page,
  mode: { write?: IdbFailKind | null; read?: IdbFailKind | null },
): Promise<void> {
  await page.evaluate((m) => {
    const w = window as unknown as { __k30Fail?: FailFlags };
    const cur = w.__k30Fail ?? {};
    if (m.write !== undefined) cur.write = m.write;
    if (m.read !== undefined) cur.read = m.read;
    w.__k30Fail = cur;
  }, mode);
}

/** 첫 로드부터 읽기 실패: addInitScript 로 플래그를 미리 켠다 (감싸기도 함께 설치, 중복 설치는 무시된다) */
export async function failIdbReadsFromStart(page: Page, kind: IdbFailKind = 'unknown'): Promise<void> {
  await page.addInitScript((k) => {
    const w = window as unknown as { __k30Fail?: FailFlags };
    w.__k30Fail = { ...(w.__k30Fail ?? {}), read: k };
  }, kind);
  await installIdbFailure(page);
}
