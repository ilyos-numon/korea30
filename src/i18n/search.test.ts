import { describe, expect, it } from 'vitest';
import { searchTerms, TERMS } from '../glossary/glossary';
import { searchTermViews } from './search';
import { LANGS } from './types';

describe('searchTermViews', () => {
  it.each(['', 'bao hiem', 'BẢO HIỂM', '퇴직', 'gia han', 'zzzz'])('vi results equal searchTerms(%j)', (q) => {
    expect(searchTermViews('vi', q).map((t) => t.id)).toEqual(searchTerms(q).map((t) => t.id));
  });

  it('Korean query finds severance in zh', () => {
    expect(searchTermViews('zh', '퇴직').map((t) => t.id)).toContain('severance');
  });

  it('empty or whitespace query returns all terms in every language', () => {
    for (const l of LANGS) {
      expect(searchTermViews(l, '').map((t) => t.id)).toEqual(TERMS.map((t) => t.id));
      expect(searchTermViews(l, '   ')).toHaveLength(TERMS.length);
    }
  });

  it('no match returns []', () => {
    for (const l of LANGS) expect(searchTermViews(l, 'zzzz')).toEqual([]);
  });

  it('name/ko matches come before explain matches, each in TERMS order', () => {
    const ids = searchTermViews('vi', '퇴직').map((t) => t.id);
    const order = TERMS.map((t) => t.id);
    const first = ids.filter((id) => TERMS.find((t) => t.id === id)!.ko.includes('퇴직'));
    expect(ids.slice(0, first.length)).toEqual(first);
    const idx = (id: string) => order.indexOf(id);
    const rest = ids.slice(first.length);
    expect([...rest].sort((a, b) => idx(a) - idx(b))).toEqual(rest);
  });
});
