import type { Page } from '@playwright/test';

type Voice = { lang: string; name?: string; localService?: boolean };

export async function installFakeSpeechWithVoices(page: Page, voices: Voice[]): Promise<void> {
  await page.addInitScript((vs) => {
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
    const list = vs.map((v) => ({
      lang: v.lang,
      name: v.name ?? v.lang,
      localService: v.localService ?? true,
      default: false,
      voiceURI: v.name ?? v.lang,
    }));
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        speak: (u: FakeUtterance) => {
          calls.push({ text: u.text, lang: u.lang });
        },
        cancel: () => {},
        getVoices: () => list,
        addEventListener: () => {},
        removeEventListener: () => {},
        speaking: false,
        pending: false,
        paused: false,
      },
    });
  }, voices);
}

export async function removeAudio(page: Page): Promise<void> {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'Audio', { value: undefined, configurable: true, writable: true });
  });
}

export async function trackAudio(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const w = window as unknown as { __played: Array<{ src: string; ok: boolean; error?: string }> };
    w.__played = [];
    const orig = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
      const src = this.currentSrc || this.src;
      let p: Promise<void>;
      try {
        p = orig.call(this);
      } catch (e) {
        w.__played.push({ src, ok: false, error: String(e) });
        throw e;
      }
      return p.then(
        () => {
          w.__played.push({ src, ok: true });
        },
        (e: unknown) => {
          w.__played.push({ src, ok: false, error: String(e) });
          throw e;
        },
      );
    };
  });
}

export async function playedAudio(
  page: Page,
): Promise<Array<{ src: string; ok: boolean; error?: string }>> {
  return page.evaluate(
    () =>
      (window as unknown as { __played?: Array<{ src: string; ok: boolean; error?: string }> })
        .__played ?? [],
  );
}

export async function blockVoiceFiles(page: Page): Promise<void> {
  await page.route('**/voice/**', (route) => route.abort());
}

export async function corruptVoiceFiles(page: Page): Promise<void> {
  await page.route('**/voice/**', (route) =>
    route.fulfill({ status: 200, contentType: 'audio/mpeg', body: 'not audio' }),
  );
}
