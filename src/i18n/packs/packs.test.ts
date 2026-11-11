import { describe, expect, it } from 'vitest';
import { BASIC_PHRASES, CATEGORY_LABEL } from '../../cards/phrases';
import { ARC_FORM_FIELDS } from '../../forms/arcForm';
import { TERMS, TERM_CATEGORY_LABEL } from '../../glossary/glossary';
import { CONTACTS } from '../../help/contacts';
import { MANUAL_LABELS } from '../../payroll/manual';
import { SAMPLE_A } from '../../payroll/samples';
import { QUESTS } from '../../quest/quests';
import { CONTACT_IDS, FORM_FIELD_IDS, PHRASE_IDS, QUEST_DAYS, TERM_IDS } from '../ids';
import { LOCAL } from '../local';
import { normalizeFor } from '../normalize';
import { collectStrings, forbiddenHits, packProblems, PRON_RULE, SEARCH_ANCHOR } from '../packCheck';
import { LANGS } from '../types';
import { PACKS } from './index';
import { vi } from './vi';

const field = (id: string) => ARC_FORM_FIELDS.find((f) => f.id === id)!;
const contact = (id: string) => CONTACTS.find((c) => c.id === id)!;

describe('PACKS 레지스트리', () => {
  it('키가 LANGS 와 같다', () => {
    expect(Object.keys(PACKS)).toEqual([...LANGS]);
    expect(PACKS.vi).toBe(vi);
  });

  it.each(LANGS)('packProblems(%s) 는 []', (l) => {
    expect(packProblems(PACKS[l])).toEqual([]);
  });

  it("forbiddenHits('vi', vi) 는 []", () => {
    expect(forbiddenHits('vi', vi)).toEqual([]);
  });
});

describe('vi 동일성 (데이터 파일 vi 필드와 같음)', () => {
  it('개수가 데이터와 같다', () => {
    const c = vi.content;
    expect(Object.keys(c.quests)).toHaveLength(QUESTS.length);
    expect(Object.keys(c.quests)).toEqual(QUEST_DAYS.map(String));
    expect(Object.keys(c.form)).toEqual([...FORM_FIELD_IDS]);
    expect(Object.keys(c.form)).toHaveLength(ARC_FORM_FIELDS.length);
    expect(Object.keys(c.phrases)).toEqual([...PHRASE_IDS]);
    expect(Object.keys(c.phrases)).toHaveLength(BASIC_PHRASES.length);
    expect(Object.keys(c.terms)).toEqual([...TERM_IDS]);
    expect(Object.keys(c.terms)).toHaveLength(TERMS.length);
    expect(Object.keys(c.contacts)).toEqual([...CONTACT_IDS]);
    expect(Object.keys(c.contacts)).toHaveLength(CONTACTS.length);
    expect(Object.keys(c.payroll.earnings)).toHaveLength(6);
    expect(Object.keys(c.payroll.deductions)).toHaveLength(6);
  });

  it('퀘스트 항목이 모두 같다', () => {
    for (const q of QUESTS) {
      const t = vi.content.quests[q.day as (typeof QUEST_DAYS)[number]];
      expect(t.title).toBe(q.title.vi);
      expect(t.where).toBe(q.where.vi);
      expect(t.bring).toEqual(q.bring.map((b) => b.vi));
      expect(t.sayMeaning).toBe(q.say.viMeaning);
      expect(t.sayPron).toBe(q.say.viPron);
      expect(t.tip).toBe(q.tip?.vi);
      expect(t.linkLabel).toBe(q.link?.label.vi);
    }
    expect(['3', '9', '10'].every((d) => vi.content.quests[Number(d) as 3].linkLabel)).toBe(true);
  });

  it('서류·문장·용어·연락처·카테고리가 같다', () => {
    for (const f of ARC_FORM_FIELDS) {
      expect(vi.content.form[f.id as (typeof FORM_FIELD_IDS)[number]]).toEqual({ label: f.labelVi, guide: f.guide.vi });
    }
    for (const p of BASIC_PHRASES) {
      expect(vi.content.phrases[p.id as (typeof PHRASE_IDS)[number]]).toEqual({ meaning: p.vi, pron: p.viPron });
    }
    for (const t of TERMS) {
      expect(vi.content.terms[t.id as (typeof TERM_IDS)[number]]).toEqual({ name: t.vi, explain: t.explainVi });
    }
    for (const c of CONTACTS) {
      expect(vi.content.contacts[c.id as (typeof CONTACT_IDS)[number]]).toEqual({ name: c.nameVi, when: c.whenVi });
    }
    expect(vi.content.phraseCategories).toEqual({
      counter: CATEGORY_LABEL.counter.vi,
      daily: CATEGORY_LABEL.daily.vi,
      quest: CATEGORY_LABEL.quest.vi,
    });
    expect(vi.content.termCategories).toEqual({
      pay: TERM_CATEGORY_LABEL.pay.vi,
      insurance: TERM_CATEGORY_LABEL.insurance.vi,
      admin: TERM_CATEGORY_LABEL.admin.vi,
    });
  });

  it('급여 항목 이름이 같다', () => {
    const e = vi.content.payroll.earnings;
    for (const s of SAMPLE_A.earnings) expect(e[s.nameKo as '기본급']).toBe(s.nameVi);
    expect(e['연장·야간·휴일 수당']).toBe(MANUAL_LABELS.overtimePay.vi);
    expect(e['기타 과세 수당']).toBe(MANUAL_LABELS.otherTaxable.vi);
    expect(e['비과세 수당 (식대 등)']).toBe(MANUAL_LABELS.nonTaxable.vi);
    expect(vi.content.payroll.deductions.healthInsurance).toBe(MANUAL_LABELS.healthInsurance.vi);
    expect(vi.content.payroll.deductions.localIncomeTax).toBe(MANUAL_LABELS.localIncomeTax.vi);
  });

  it('UI 문자열 샘플이 현재 화면 리터럴과 같다', () => {
    const u = vi.ui;
    expect(u.appHelp).toBe('☎ Trợ giúp');
    expect(u.tabs).toEqual({ quest: 'Nhiệm vụ', form: 'Giấy tờ', payslip: 'Lương', cards: 'Thẻ nói', glossary: 'Từ điển', tools: 'Hồ sơ' });
    expect(u.questProgress(3, 10)).toBe('Ngày 3 / 10');
    expect(u.questDotsAria(2, 10)).toBe('Tiến độ 2/10');
    expect(u.questLockedHint(4)).toBe('🔒 Hãy hoàn thành Ngày 4 trước.');
    expect(u.questAllDone(10)).toBe('🎉 Bạn đã hoàn thành cả 10 ngày!');
    expect(u.formQuestDone(3)).toBe('Ngày 3 hoàn thành');
    expect(u.glossaryCount(40)).toBe('40 từ');
    expect(u.glossaryTitle).toBe('Từ điển lương & hành chính');
  });

  it('vi 발음은 PRON_RULE 을 지키고 검색 앵커가 보험 용어에 있다', () => {
    const prons = collectStrings(vi).filter((s) => s.kind === 'pron');
    expect(prons).toHaveLength(42);
    for (const p of prons) expect(PRON_RULE.vi(p.value)).toBe(true);
    const anchor = normalizeFor('vi', SEARCH_ANCHOR.vi);
    expect(normalizeFor('vi', vi.content.terms.health.name)).toContain(anchor);
    expect(normalizeFor('vi', vi.content.terms.employment.name)).toContain(anchor);
  });
});

describe('LOCAL 국가별 변형', () => {
  it('vi 값이 데이터 원문과 같다', () => {
    const v = LOCAL.vi;
    expect(v.interpreterKo).toBe(BASIC_PHRASES.find((p) => p.id === 'b4')!.ko);
    expect(v.remitKo).toBe(QUESTS[7].say.ko);
    expect(v.immigrationSayKo).toBe(contact('immigration').sayKo);
    for (const id of ['surname', 'given-names', 'nationality', 'address-home'] as const) {
      expect(v.formExample[id]).toBe(field(id).example);
    }
    for (const id of ['birth', 'nationality', 'address-home'] as const) {
      expect(v.formGuideKo[id]).toBe(field(id).guide.ko);
    }
    expect([...v.nativeContacts]).toEqual(CONTACTS.filter((c) => c.vietnamese).map((c) => c.id));
  });

  it.each(LANGS)('LOCAL.%s 모든 값이 비어 있지 않다', (l) => {
    const v = LOCAL[l];
    const values = [
      v.interpreterKo,
      v.remitKo,
      v.immigrationSayKo,
      ...Object.values(v.formExample),
      ...Object.values(v.formGuideKo),
    ];
    expect(values).toHaveLength(10);
    for (const s of values) expect(s.trim()).not.toBe('');
    expect(v.nativeContacts.length).toBeGreaterThan(0);
    for (const id of v.nativeContacts) expect(CONTACT_IDS).toContain(id);
  });
});
