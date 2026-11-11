import type { Lang } from '../i18n/types';
import { canSpeak, hasVoiceFor, speakIn, speakKo } from './speak';
import type { RecordedLang } from './voiceKey';
import { RECORDED_LANGS, voiceFile } from './voiceKey';

export type VoiceLang = 'ko' | Lang;
export type VoiceSource = 'file' | 'synth' | 'none';

export const SPEECH_BCP47: Readonly<Record<VoiceLang, string>> = {
  ko: 'ko-KR',
  vi: 'vi-VN',
  en: 'en-US',
  ru: 'ru-RU',
  zh: 'zh-CN',
  th: 'th-TH',
  uz: 'uz-UZ',
};

export const VOICE_TIMEOUT_MS = 4000;

let current: HTMLAudioElement | null = null;

export function isRecorded(lang: VoiceLang): lang is RecordedLang {
  return (RECORDED_LANGS as readonly string[]).includes(lang);
}

export function voiceUrl(lang: RecordedLang, text: string, base: string = import.meta.env.BASE_URL): string {
  return `${base}voice/${voiceFile(lang, text)}`;
}

export function canPlayAudio(): boolean {
  return typeof window !== 'undefined' && window != null && typeof window.Audio === 'function';
}

export function canListen(lang: VoiceLang): boolean {
  if (isRecorded(lang)) return canPlayAudio() || canSpeak();
  return hasVoiceFor(SPEECH_BCP47[lang]);
}

export function stopVoice(): void {
  if (current) {
    try {
      current.pause();
    } catch {
      // ignore
    }
    current = null;
  }
  if (canSpeak()) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}

function synth(text: string, lang: VoiceLang): VoiceSource {
  const ok = lang === 'ko' ? speakKo(text) : speakIn(text, SPEECH_BCP47[lang]);
  return ok ? 'synth' : 'none';
}

function playFile(audio: HTMLAudioElement): Promise<boolean> {
  return new Promise((resolve) => {
    let done = false;
    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      audio.removeEventListener('error', onError);
      resolve(ok);
    };
    const onError = () => finish(false);
    const timer = setTimeout(() => finish(false), VOICE_TIMEOUT_MS);
    audio.addEventListener('error', onError);
    try {
      Promise.resolve(audio.play()).then(
        () => finish(true),
        () => finish(false),
      );
    } catch {
      finish(false);
    }
  });
}

export async function playVoice(text: string, lang: VoiceLang): Promise<VoiceSource> {
  stopVoice();
  if (!isRecorded(lang) || !canPlayAudio()) return synth(text, lang);
  let audio: HTMLAudioElement;
  try {
    audio = new window.Audio(voiceUrl(lang, text));
  } catch {
    return synth(text, lang);
  }
  current = audio;
  const ok = await playFile(audio);
  if (ok) return 'file';
  try {
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
  } catch {
    // ignore
  }
  if (current === audio) current = null;
  return synth(text, lang);
}
