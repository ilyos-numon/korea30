import { afterEach, describe, expect, it, vi } from 'vitest';
import { SPEECH_LANG, SPEECH_RATE, canSpeak, hasVoiceFor, speakIn, speakKo } from './speak';

class FakeUtterance {
  text: string;
  lang = '';
  rate = 1;
  voice: unknown = null;
  constructor(text: string) {
    this.text = text;
  }
}

function makeWindow(opts: { voices?: unknown[]; speakThrows?: boolean } = {}) {
  const calls: string[] = [];
  const spoken: FakeUtterance[] = [];
  const speechSynthesis: Record<string, unknown> = {
    cancel: vi.fn(() => {
      calls.push('cancel');
    }),
    speak: vi.fn((u: FakeUtterance) => {
      calls.push('speak');
      if (opts.speakThrows) throw new Error('boom');
      spoken.push(u);
    }),
  };
  if (opts.voices) speechSynthesis.getVoices = () => opts.voices;
  const win = { speechSynthesis, SpeechSynthesisUtterance: FakeUtterance };
  return { win, calls, spoken, speechSynthesis };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('speak constants', () => {
  it('uses ko-KR and rate 0.9', () => {
    expect(SPEECH_LANG).toBe('ko-KR');
    expect(SPEECH_RATE).toBe(0.9);
  });
});

describe('canSpeak / speakKo', () => {
  it('(a) returns false when window is missing', () => {
    vi.stubGlobal('window', undefined);
    expect(canSpeak()).toBe(false);
    expect(speakKo('안녕하세요')).toBe(false);
  });

  it('(a) returns false when speechSynthesis is missing', () => {
    vi.stubGlobal('window', { SpeechSynthesisUtterance: FakeUtterance });
    expect(canSpeak()).toBe(false);
    expect(speakKo('안녕하세요')).toBe(false);
  });

  it('(b) speaks once with ko-KR, rate 0.9, cancel first', () => {
    const { win, calls, spoken, speechSynthesis } = makeWindow();
    vi.stubGlobal('window', win);
    expect(canSpeak()).toBe(true);
    expect(speakKo('안녕하세요')).toBe(true);
    expect(speechSynthesis.speak).toHaveBeenCalledTimes(1);
    expect(speechSynthesis.cancel).toHaveBeenCalledTimes(1);
    expect(calls).toEqual(['cancel', 'speak']);
    expect(spoken[0].text).toBe('안녕하세요');
    expect(spoken[0].lang).toBe('ko-KR');
    expect(spoken[0].rate).toBe(0.9);
  });

  it('(c) sets voice when a local ko voice exists', () => {
    const voice = { lang: 'ko-KR', localService: true };
    const { win, spoken } = makeWindow({ voices: [{ lang: 'en-US', localService: true }, voice] });
    vi.stubGlobal('window', win);
    expect(speakKo('안녕하세요')).toBe(true);
    expect(spoken[0].voice).toBe(voice);
  });

  it('(c) leaves voice unset when ko voice is not local', () => {
    const { win, spoken } = makeWindow({ voices: [{ lang: 'ko_KR', localService: false }] });
    vi.stubGlobal('window', win);
    expect(speakKo('안녕하세요')).toBe(true);
    expect(spoken[0].voice).toBeNull();
  });

  it('(d) returns false when speak throws', () => {
    const { win } = makeWindow({ speakThrows: true });
    vi.stubGlobal('window', win);
    expect(speakKo('안녕하세요')).toBe(false);
  });
});

describe('speakIn', () => {
  it('speaks with given lang and default rate 1, cancel first', () => {
    const { win, calls, spoken } = makeWindow();
    vi.stubGlobal('window', win);
    expect(speakIn('Xin chào', 'vi-VN')).toBe(true);
    expect(calls).toEqual(['cancel', 'speak']);
    expect(spoken[0].text).toBe('Xin chào');
    expect(spoken[0].lang).toBe('vi-VN');
    expect(spoken[0].rate).toBe(1);
  });

  it('uses the given rate', () => {
    const { win, spoken } = makeWindow();
    vi.stubGlobal('window', win);
    expect(speakIn('Hello', 'en-US', 0.8)).toBe(true);
    expect(spoken[0].rate).toBe(0.8);
  });

  it('prefers a local voice with matching prefix', () => {
    const remote = { lang: 'vi-VN', localService: false };
    const local = { lang: 'vi_VN', localService: true };
    const { win, spoken } = makeWindow({ voices: [{ lang: 'en-US', localService: true }, remote, local] });
    vi.stubGlobal('window', win);
    expect(speakIn('Xin chào', 'vi-VN')).toBe(true);
    expect(spoken[0].voice).toBe(local);
  });

  it('falls back to the first matching voice when none is local', () => {
    const first = { lang: 'vi_VN', localService: false };
    const { win, spoken } = makeWindow({
      voices: [{ lang: 'ko-KR', localService: true }, first, { lang: 'vi-VN', localService: false }],
    });
    vi.stubGlobal('window', win);
    expect(speakIn('Xin chào', 'vi-VN')).toBe(true);
    expect(spoken[0].voice).toBe(first);
  });

  it('returns false without speech support', () => {
    vi.stubGlobal('window', undefined);
    expect(speakIn('Hello', 'en-US')).toBe(false);
  });

  it('returns false when speak throws', () => {
    const { win } = makeWindow({ speakThrows: true });
    vi.stubGlobal('window', win);
    expect(speakIn('Hello', 'en-US')).toBe(false);
  });
});

describe('hasVoiceFor', () => {
  it('is true when a voice with the same prefix exists (vi_VN)', () => {
    const { win } = makeWindow({ voices: [{ lang: 'vi_VN', localService: false }] });
    vi.stubGlobal('window', win);
    expect(hasVoiceFor('vi-VN')).toBe(true);
  });

  it('is false when no voice matches', () => {
    const { win } = makeWindow({ voices: [{ lang: 'en-US', localService: true }] });
    vi.stubGlobal('window', win);
    expect(hasVoiceFor('th-TH')).toBe(false);
  });

  it('is false when getVoices is missing', () => {
    const { win } = makeWindow();
    vi.stubGlobal('window', win);
    expect(hasVoiceFor('ko-KR')).toBe(false);
  });

  it('is false without speech support', () => {
    vi.stubGlobal('window', undefined);
    expect(hasVoiceFor('ko-KR')).toBe(false);
  });
});
