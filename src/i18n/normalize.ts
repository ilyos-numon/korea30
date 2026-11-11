import { normalizeVi } from '../glossary/glossary';
import type { Lang } from './types';

function latin(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** vi: normalizeVi(s) 그대로(import from '../glossary/glossary').
 *  en: NFD → U+0300–U+036F 제거 → 소문자 → 공백 압축 → trim.
 *  uz: en 과 같고, 추가로 ʻ(U+02BB) ’(U+2019) ‘(U+2018) '(U+0027) `(U+0060) ʼ(U+02BC) 를 모두 제거.
 *  ru: NFC → 소문자 → ё→е → 공백 압축 → trim (결합 부호 제거 안 함: й 보존).
 *  zh, th: NFKC → 소문자 → 모든 공백과 U+200B 제거. */
export function normalizeFor(lang: Lang, s: string): string {
  switch (lang) {
    case 'vi':
      return normalizeVi(s);
    case 'en':
      return latin(s);
    case 'uz':
      return latin(s.replace(/[ʻ’‘'`ʼ]/g, ''));
    case 'ru':
      return s.normalize('NFC').toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();
    case 'zh':
    case 'th':
      return s.normalize('NFKC').toLowerCase().replace(/[\s​]/g, '');
  }
}
