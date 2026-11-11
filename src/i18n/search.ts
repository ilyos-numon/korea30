import { normalizeVi, TERMS } from '../glossary/glossary';
import { termView, type TermView } from './content';
import { normalizeFor } from './normalize';
import type { Lang } from './types';

/** 1군: normalizeFor(lang, view.name) 또는 normalizeVi(view.ko) 가 질의를 포함. 2군: explain(선택 언어) 또는 explainKo.
 *  질의 정규화: 선택 언어 쪽은 normalizeFor(lang, q), 한국어 쪽은 normalizeVi(q). 둘 다 '' 이면 전체. 결과 순서 = 1군(TERMS 순) + 2군(TERMS 순). */
export function searchTermViews(lang: Lang, query: string): TermView[] {
  const views = TERMS.map((t) => termView(t, lang));
  const qLang = normalizeFor(lang, query);
  const qKo = normalizeVi(query);
  if (qLang === '' && qKo === '') return views;
  // 한쪽 질의만 비면 그쪽은 매치로 치지 않는다
  const hitLang = (s: string): boolean => qLang !== '' && normalizeFor(lang, s).includes(qLang);
  const hitKo = (s: string): boolean => qKo !== '' && normalizeVi(s).includes(qKo);
  const first: TermView[] = [];
  const second: TermView[] = [];
  for (const v of views) {
    if (hitLang(v.name) || hitKo(v.ko)) first.push(v);
    else if (hitLang(v.explain) || hitKo(v.explainKo)) second.push(v);
  }
  return [...first, ...second];
}
