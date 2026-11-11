export const SPEECH_LANG = 'ko-KR';
export const SPEECH_RATE = 0.9;

export function canSpeak(): boolean {
  return (
    typeof window !== 'undefined' &&
    window != null &&
    window.speechSynthesis != null &&
    typeof window.SpeechSynthesisUtterance === 'function'
  );
}

export function speakKo(text: string): boolean {
  if (!canSpeak()) return false;
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new window.SpeechSynthesisUtterance(text);
    u.lang = SPEECH_LANG;
    u.rate = SPEECH_RATE;
    if (typeof synth.getVoices === 'function') {
      const voice = synth
        .getVoices()
        .find((v) => v.lang.replace('_', '-').toLowerCase().startsWith('ko') && v.localService);
      if (voice) u.voice = voice;
    }
    synth.speak(u);
    return true;
  } catch {
    return false;
  }
}

function langPrefix(bcp47: string): string {
  return bcp47.replace('_', '-').split('-')[0].toLowerCase();
}

function voicesFor(bcp47: string): SpeechSynthesisVoice[] {
  const synth = window.speechSynthesis;
  if (typeof synth.getVoices !== 'function') return [];
  const prefix = langPrefix(bcp47);
  return synth.getVoices().filter((v) => langPrefix(v.lang) === prefix);
}

export function speakIn(text: string, bcp47: string, rate = 1): boolean {
  if (!canSpeak()) return false;
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new window.SpeechSynthesisUtterance(text);
    u.lang = bcp47;
    u.rate = rate;
    const voices = voicesFor(bcp47);
    const voice = voices.find((v) => v.localService) ?? voices[0];
    if (voice) u.voice = voice;
    synth.speak(u);
    return true;
  } catch {
    return false;
  }
}

export function hasVoiceFor(bcp47: string): boolean {
  if (!canSpeak()) return false;
  try {
    return voicesFor(bcp47).length > 0;
  } catch {
    return false;
  }
}
