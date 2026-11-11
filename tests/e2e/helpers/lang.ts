import type { Page } from '@playwright/test';

export const LANG_KEY = 'korea30.lang.v1';

/** 키가 비어 있을 때만 심는다 → 테스트 중 전환한 언어가 reload 후에도 유지된다 */
export async function seedLang(page: Page, lang: string = 'vi'): Promise<void> {
  await page.addInitScript(
    ([k, l]) => {
      if (localStorage.getItem(k) === null) localStorage.setItem(k, l);
    },
    [LANG_KEY, lang],
  );
}
