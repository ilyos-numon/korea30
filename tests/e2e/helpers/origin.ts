import { test } from '@playwright/test';

/** Origin of the app under test, derived from the Playwright baseURL (no hard-coded port). */
export function appOrigin(): string {
  const base = test.info().project.use.baseURL;
  if (!base) throw new Error('baseURL is not configured in playwright.config.ts');
  return new URL(base).origin;
}
