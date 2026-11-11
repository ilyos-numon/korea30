import { afterEach, describe, expect, it, vi } from 'vitest';
import { SPEECH_BCP47, VOICE_TIMEOUT_MS, canListen, canPlayAudio, isRecorded, playVoice, stopVoice, voiceUrl } from './voice';
import { voiceKey } from './voiceKey';

class FakeUtterance {
  text: string;
  lang = '';
  rate = 1;
  voice: unknown = null;
  constructor(text: string) {
    this.text = text;
  }
}

type PlayMode = 'resolve' | 'reject' | 'error' | 'hang';

function makeAudioClass(mode: PlayMode) {
  const created: FakeAudio[] = [];
  class FakeAudio {
    src: string;
    paused = true;
    listeners: Record<string, Array<() => void>> = {};
    pause = vi.fn(() => {
      this.paused = true;
    });
    load = vi.fn();
    constructor(src: string) {
      this.src = src;
      created.push(this);
    }
    addEventListener(name: string, fn: () => void) {
      (this.listeners[name] ??= []).push(fn);
    }
    removeEventListener(name: string, fn: () => void) {
      this.listeners[name] = (this.listeners[name] ?? []).filter((f) => f !== fn);
    }
    removeAttribute(name: string) {
      if (name === 'src') this.src = '';
    }
    play(): Promise<void> {
      if (mode === 'resolve') {
        this.paused = false;
        return Promise.resolve();
      }
      if (mode === 'reject') return Promise.reject(new Error('NotAllowedError'));
      if (mode === 'error') {
        queueMicrotask(() => (this.listeners.error ?? []).forEach((f) => f()));
      }
      return new Promise<void>(() => {});
    }
  }
  return { FakeAudio, created };
}

function makeSpeech(voices?: Array<{ lang: string; localService: boolean }>) {
  const spoken: FakeUtterance[] = [];
  const speechSynthesis: Record<string, unknown> = {
    cancel: vi.fn(),
    speak: vi.fn((u: FakeUtterance) => {
      spoken.push(u);
    }),
  };
  if (voices) speechSynthesis.getVoices = () => voices;
  return { speechSynthesis, spoken };
}

function stubWindow(opts: { audio?: PlayMode; speech?: boolean; voices?: Array<{ lang: string; localService: boolean }> }) {
  const win: Record<string, unknown> = {};
  let created: unknown[] = [];
  if (opts.audio) {
    const a = makeAudioClass(opts.audio);
    win.Audio = a.FakeAudio;
    created = a.created;
  }
  const s = makeSpeech(opts.voices);
  if (opts.speech) {
    win.speechSynthesis = s.speechSynthesis;
    win.SpeechSynthesisUtterance = FakeUtterance;
  }
  vi.stubGlobal('window', win);
  return { created: created as Array<{ src: string; pause: ReturnType<typeof vi.fn> }>, ...s };
}

afterEach(() => {
  stopVoice();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('constants', () => {
  it('maps langs to BCP47 tags', () => {
    expect(SPEECH_BCP47).toEqual({ ko: 'ko-KR', vi: 'vi-VN', en: 'en-US', ru: 'ru-RU', zh: 'zh-CN', th: 'th-TH', uz: 'uz-UZ' });
    expect(VOICE_TIMEOUT_MS).toBe(4000);
  });

  it('isRecorded is true only for ko, vi, en, ru', () => {
    expect(['ko', 'vi', 'en', 'ru', 'zh', 'th', 'uz'].map((l) => isRecorded(l as 'ko'))).toEqual([
      true, true, true, true, false, false, false,
    ]);
  });
});

describe('voiceUrl', () => {
  it('builds /voice/<lang>/<key>.mp3 from base', () => {
    expect(voiceUrl('ko', '기본급', '/')).toBe(`/voice/ko/${voiceKey('ko', '기본급')}.mp3`);
    expect(voiceUrl('vi', 'Lương', '/app/')).toBe(`/app/voice/vi/${voiceKey('vi', 'Lương')}.mp3`);
  });
});

describe('playVoice', () => {
  it('returns file when play resolves and does not speak', async () => {
    const { created, speechSynthesis } = stubWindow({ audio: 'resolve', speech: true });
    await expect(playVoice('안녕하세요', 'ko')).resolves.toBe('file');
    expect(created).toHaveLength(1);
    expect(created[0].src).toBe(voiceUrl('ko', '안녕하세요'));
    expect(speechSynthesis.speak).toHaveBeenCalledTimes(0);
  });

  it('falls back to synth with ko-KR when play rejects', async () => {
    const { created, spoken } = stubWindow({ audio: 'reject', speech: true });
    await expect(playVoice('안녕하세요', 'ko')).resolves.toBe('synth');
    expect(created[0].pause).toHaveBeenCalled();
    expect(created[0].src).toBe('');
    expect(spoken).toHaveLength(1);
    expect(spoken[0].text).toBe('안녕하세요');
    expect(spoken[0].lang).toBe('ko-KR');
  });

  it('falls back to synth on error event', async () => {
    const { spoken } = stubWindow({ audio: 'error', speech: true });
    await expect(playVoice('Xin chào', 'vi')).resolves.toBe('synth');
    expect(spoken[0].lang).toBe('vi-VN');
  });

  it('falls back to synth after VOICE_TIMEOUT_MS', async () => {
    vi.useFakeTimers();
    const { spoken } = stubWindow({ audio: 'hang', speech: true });
    const p = playVoice('안녕하세요', 'ko');
    await vi.advanceTimersByTimeAsync(VOICE_TIMEOUT_MS - 1);
    expect(spoken).toHaveLength(0);
    await vi.advanceTimersByTimeAsync(1);
    await expect(p).resolves.toBe('synth');
    expect(spoken[0].lang).toBe('ko-KR');
  });

  it('falls back to synth directly when Audio is missing', async () => {
    const { spoken } = stubWindow({ speech: true });
    await expect(playVoice('Hello', 'en')).resolves.toBe('synth');
    expect(spoken[0].lang).toBe('en-US');
  });

  it('returns none when neither Audio nor speech exists', async () => {
    stubWindow({});
    await expect(playVoice('안녕하세요', 'ko')).resolves.toBe('none');
  });

  it('returns none when play fails and speech is missing', async () => {
    stubWindow({ audio: 'reject' });
    await expect(playVoice('안녕하세요', 'ko')).resolves.toBe('none');
  });

  it('zh uses speech only with zh-CN and creates no Audio', async () => {
    const { created, spoken } = stubWindow({ audio: 'resolve', speech: true, voices: [{ lang: 'zh-CN', localService: true }] });
    await expect(playVoice('你好', 'zh')).resolves.toBe('synth');
    expect(created).toHaveLength(0);
    expect(spoken[0].text).toBe('你好');
    expect(spoken[0].lang).toBe('zh-CN');
  });

  it('stops the previous audio before playing again', async () => {
    const { created } = stubWindow({ audio: 'resolve', speech: true });
    await playVoice('하나', 'ko');
    await playVoice('둘', 'ko');
    expect(created[0].pause).toHaveBeenCalled();
    expect(created).toHaveLength(2);
  });
});

describe('canPlayAudio / canListen', () => {
  it('canPlayAudio reflects window.Audio', () => {
    vi.stubGlobal('window', undefined);
    expect(canPlayAudio()).toBe(false);
    stubWindow({ audio: 'resolve' });
    expect(canPlayAudio()).toBe(true);
  });

  it('ko with Audio only → true', () => {
    stubWindow({ audio: 'resolve' });
    expect(canListen('ko')).toBe(true);
  });

  it('ko with speech only → true', () => {
    stubWindow({ speech: true });
    expect(canListen('ko')).toBe(true);
  });

  it('ko with neither → false', () => {
    stubWindow({});
    expect(canListen('ko')).toBe(false);
  });

  it('th with a th voice → true', () => {
    stubWindow({ audio: 'resolve', speech: true, voices: [{ lang: 'th-TH', localService: false }] });
    expect(canListen('th')).toBe(true);
  });

  it('th without a th voice → false even with Audio', () => {
    stubWindow({ audio: 'resolve', speech: true, voices: [{ lang: 'en-US', localService: true }] });
    expect(canListen('th')).toBe(false);
  });
});
