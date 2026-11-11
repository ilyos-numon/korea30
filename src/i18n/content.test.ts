import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { allPhrases, CATEGORY_LABEL } from '../cards/phrases';
import { ARC_FORM_FIELDS } from '../forms/arcForm';
import { TERMS, TERM_CATEGORY_LABEL } from '../glossary/glossary';
import { CONTACTS } from '../help/contacts';
import { MANUAL_LABELS } from '../payroll/manual';
import { SAMPLE_A } from '../payroll/samples';
import { DEDUCTION_ORDER } from '../payroll/types';
import { QUESTS } from '../quest/quests';
import {
  contactViews,
  deductionName,
  earningName,
  formFieldView,
  phraseCategoryLabel,
  phraseViews,
  questView,
  termCategoryLabel,
  termView,
} from './content';
import { LangProvider, langValue, useLang } from './LangContext';
import { LOCAL } from './local';
import { PACKS } from './packs';
import { LANGS } from './types';

const field = (id: string) => {
  const f = ARC_FORM_FIELDS.find((x) => x.id === id);
  if (!f) throw new Error(`no field ${id}`);
  return f;
};

describe('content views — vi identity', () => {
  it('questView(q, vi) matches every vi field of the data', () => {
    for (const q of QUESTS) {
      const v = questView(q, 'vi');
      expect(v.day).toBe(q.day);
      expect(v.icon).toBe(q.icon);
      expect(v.titleKo).toBe(q.title.ko);
      expect(v.title).toBe(q.title.vi);
      expect(v.whereKo).toBe(q.where.ko);
      expect(v.where).toBe(q.where.vi);
      expect(v.bring).toEqual(q.bring.map((b) => ({ ko: b.ko, text: b.vi })));
      expect(v.sayKo).toBe(q.say.ko);
      expect(v.sayMeaning).toBe(q.say.viMeaning);
      expect(v.sayPron).toBe(q.say.viPron);
      expect(v.tipKo).toBe(q.tip!.ko);
      expect(v.tip).toBe(q.tip!.vi);
      if (q.link) expect(v.link).toEqual({ route: q.link.route, labelKo: q.link.label.ko, label: q.link.label.vi });
      else expect(v.link).toBeUndefined();
    }
  });

  it('phraseViews(vi) equals allPhrases() ko/vi/viPron in order', () => {
    const all = allPhrases();
    const views = phraseViews('vi');
    expect(views).toHaveLength(42);
    expect(views.map((p) => p.id)).toEqual(all.map((p) => p.id));
    views.forEach((v, i) => {
      expect(v.category).toBe(all[i].category);
      expect(v.ko).toBe(all[i].ko);
      expect(v.meaning).toBe(all[i].vi);
      expect(v.pron).toBe(all[i].viPron);
    });
  });

  it('phraseCategoryLabel / termCategoryLabel match data labels for vi', () => {
    for (const c of ['counter', 'daily', 'quest'] as const) {
      expect(phraseCategoryLabel(c, 'vi')).toEqual({ ko: CATEGORY_LABEL[c].ko, text: CATEGORY_LABEL[c].vi });
    }
    for (const c of ['pay', 'insurance', 'admin'] as const) {
      expect(termCategoryLabel(c, 'vi')).toBe(TERM_CATEGORY_LABEL[c].vi);
    }
  });

  it('formFieldView(f, vi) keeps example, label and guide', () => {
    for (const f of ARC_FORM_FIELDS) {
      const v = formFieldView(f, 'vi');
      expect(v).toEqual({
        no: f.no,
        id: f.id,
        labelKo: f.labelKo,
        label: f.labelVi,
        guideKo: f.guide.ko,
        guide: f.guide.vi,
        example: f.example,
        askOfficer: f.askOfficer,
        span: f.span,
      });
    }
  });

  it('termView(t, vi) keeps ko/vi/explain fields', () => {
    for (const t of TERMS) {
      expect(termView(t, 'vi')).toEqual({
        id: t.id,
        category: t.category,
        ko: t.ko,
        name: t.vi,
        explainKo: t.explainKo,
        explain: t.explainVi,
        askExpert: t.askExpert,
      });
    }
  });

  it('contactViews(vi) keeps order, native = vietnamese, sayKo as data', () => {
    const views = contactViews('vi');
    expect(views.map((c) => c.id)).toEqual(CONTACTS.map((c) => c.id));
    views.forEach((v, i) => {
      const c = CONTACTS[i];
      expect(v.native).toBe(c.vietnamese);
      expect(v.name).toBe(c.nameVi);
      expect(v.nameKo).toBe(c.nameKo);
      expect(v.when).toBe(c.whenVi);
      expect(v.whenKo).toBe(c.whenKo);
      expect(v.number).toBe(c.number);
      expect(v.tel).toBe(c.tel);
      expect(v.emergency).toBe(c.emergency);
      expect(v.verified).toBe(c.verified);
      expect(v.sayKo).toBe(c.sayKo);
    });
  });

  it('earningName / deductionName for vi match data labels', () => {
    expect(earningName('기본급', 'vi')).toBe(SAMPLE_A.earnings.find((e) => e.nameKo === '기본급')!.nameVi);
    expect(earningName('연장·야간·휴일 수당', 'vi')).toBe(MANUAL_LABELS.overtimePay.vi);
    expect(earningName('없는 항목', 'vi')).toBe('없는 항목');
    for (const k of DEDUCTION_ORDER) expect(deductionName(k, 'vi')).toBe(MANUAL_LABELS[k].vi);
  });
});

describe('content views — local Korean variants', () => {
  it('phraseViews(zh) b4.ko is the Chinese interpreter variant', () => {
    const b4 = phraseViews('zh').find((p) => p.id === 'b4');
    expect(b4?.ko).toBe('중국어 통역이 가능한가요?');
  });

  it('questView(day 8, th).sayKo is the Thai remit variant; q8 phrase follows', () => {
    expect(questView(QUESTS[7], 'th').sayKo).toBe('태국으로 송금하고 싶어요. 수수료가 얼마예요?');
    expect(phraseViews('th').find((p) => p.id === 'q8')?.ko).toBe('태국으로 송금하고 싶어요. 수수료가 얼마예요?');
  });

  it('formFieldView uses LOCAL example and guideKo', () => {
    expect(formFieldView(field('nationality'), 'uz').example).toBe('UZBEKISTAN');
    expect(formFieldView(field('surname'), 'ru').example).toBe('IVANOV');
    expect(formFieldView(field('birth'), 'th').guideKo).toBe(LOCAL.th.formGuideKo.birth);
    expect(formFieldView(field('birth'), 'th').example).toBe(field('birth').example);
  });

  it('contactViews uses LOCAL nativeContacts and immigrationSayKo', () => {
    const en = contactViews('en');
    expect(en.filter((c) => c.native).map((c) => c.id)).toEqual(['immigration']);
    expect(en.find((c) => c.id === 'immigration')?.sayKo).toBe('영어 상담 부탁드립니다.');
  });

  it('every language yields complete views with non-empty text', () => {
    for (const l of LANGS) {
      expect(phraseViews(l)).toHaveLength(42);
      expect(contactViews(l)).toHaveLength(CONTACTS.length);
      for (const q of QUESTS) {
        const v = questView(q, l);
        expect(v.title.trim()).not.toBe('');
        expect(v.bring).toHaveLength(q.bring.length);
        expect(Boolean(v.link)).toBe(Boolean(q.link));
      }
      for (const p of phraseViews(l)) expect(p.meaning.trim()).not.toBe('');
    }
  });
});

describe('LangContext', () => {
  const Probe = () => {
    const { lang, ui } = useLang();
    return createElement('span', null, `${lang}:${ui.navAria}`);
  };

  it('defaults to vi without a provider', () => {
    expect(renderToString(createElement(Probe))).toContain(`vi:${PACKS.vi.ui.navAria}`);
  });

  it('langValue / LangProvider expose the chosen language pack', () => {
    const v = langValue('ru');
    expect(v.lang).toBe('ru');
    expect(v.ui).toBe(PACKS.ru.ui);
    expect(v.pack).toBe(PACKS.ru.content);
    expect(() => v.setLang('en')).not.toThrow();
    const html = renderToString(
      createElement(LangProvider, { lang: 'ru', setLang: () => {}, children: createElement(Probe) }),
    );
    expect(html).toContain('ru:');
  });
});
