import type { Page } from '@playwright/test';

export async function installFakeSpeech(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const calls: Array<{ text: string; lang: string }> = [];
    (window as unknown as { __spoken: typeof calls }).__spoken = calls;
    class FakeUtterance {
      text: string;
      lang = '';
      rate = 1;
      voice: unknown = null;
      constructor(t: string) {
        this.text = t;
      }
    }
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      value: FakeUtterance,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        speak: (u: FakeUtterance) => {
          calls.push({ text: u.text, lang: u.lang });
        },
        cancel: () => {},
        getVoices: () => [],
        speaking: false,
        pending: false,
        paused: false,
      },
    });
  });
}

export async function removeSpeech(page: Page): Promise<void> {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'speechSynthesis', { value: undefined, configurable: true });
  });
}

export async function spokenCalls(page: Page): Promise<Array<{ text: string; lang: string }>> {
  return page.evaluate(
    () => (window as unknown as { __spoken?: Array<{ text: string; lang: string }> }).__spoken ?? [],
  );
}
