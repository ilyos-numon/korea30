import { describe, expect, it } from 'vitest';
import type { Lang, QuestText } from '../i18n/types';
import {
  MAX_SAY_KO_CHARS,
  QUEST_LINK_LABEL_KO,
  allowedNumberTokens,
  numberTokens,
  questDayProblems,
  type QuestContentInput,
} from './contentRules';
import type { QuestDay } from './types';

type PackLang = Exclude<Lang, 'vi'>;

function day(n: number, withLink: boolean): QuestDay {
  return {
    day: n,
    icon: '📅',
    title: { vi: `Việc ngày ${n === 11 ? 'một' : 'hai'}`, ko: `할 일 ${n === 11 ? '하나' : '둘'}` },
    where: { vi: 'Văn phòng (gọi 1345)', ko: '사무소 (1345에 확인)' },
    bring: [{ vi: 'Hộ chiếu', ko: '여권' }],
    say: {
      ko: n === 11 ? '등록증 받으러 왔어요.' : '이사했어요.',
      viPron: n === 11 ? 'Tưng-noc-chưng ba-tư-rơ oát-xơ-yô.' : 'I-xa-het-xơ-yô.',
      viMeaning: n === 11 ? 'Tôi đến nhận thẻ.' : 'Tôi đã chuyển nhà.',
    },
    tip: { vi: 'Trong 15 ngày, hãy hỏi 1345.', ko: '15일 안에 신고해요. 22:00 이후는 1345에 확인해 보세요.' },
    ...(withLink
      ? { link: { route: 'deadline' as const, label: { vi: '📅 Xem hạn lưu trú', ko: QUEST_LINK_LABEL_KO.deadline } } }
      : {}),
  };
}

const TEXT_BASE: Record<PackLang, (n: number) => QuestText> = {
  zh: (n) => ({
    title: n === 11 ? '领取登记证' : '搬家申报',
    where: '办公室',
    bring: ['护照'],
    sayMeaning: n === 11 ? '我来领证。' : '我搬家了。',
    sayPron: n === 11 ? '登录证 吧特热 瓦色哟' : '依撒海色哟',
    tip: '请拨打1345确认。',
  }),
  en: (n) => ({
    title: n === 11 ? 'Get your card' : 'Report a move',
    where: 'Office',
    bring: ['Passport'],
    sayMeaning: n === 11 ? 'I came to get my card.' : 'I moved.',
    sayPron: n === 11 ? 'deung-rok-jeung ba-deu-reo wa-sseo-yo.' : 'i-sa-hae-sseo-yo.',
    tip: 'Ask 1345 within 15 days.',
  }),
  th: (n) => ({
    title: n === 11 ? 'รับบัตร' : 'แจ้งย้ายบ้าน',
    where: 'สำนักงาน',
    bring: ['หนังสือเดินทาง'],
    sayMeaning: n === 11 ? 'ฉันมารับบัตร' : 'ฉันย้ายบ้านแล้ว',
    sayPron: n === 11 ? 'ทึงนกจึง' : 'อีซาแฮซอโย',
    tip: 'โทร 1345 เพื่อสอบถาม',
  }),
  uz: (n) => ({
    title: n === 11 ? 'Kartani olish' : 'Koʻchishni bildirish',
    where: 'Idora',
    bring: ['Pasport'],
    sayMeaning: n === 11 ? 'Kartani olgani keldim.' : 'Koʻchib keldim.',
    sayPron: n === 11 ? 'dingnokjing badiro vassoyo' : 'isahessoyo',
    tip: '1345 ga qoʻngʻiroq qiling.',
  }),
  ru: (n) => ({
    title: n === 11 ? 'Получить карту' : 'Сообщить о переезде',
    where: 'Офис',
    bring: ['Паспорт'],
    sayMeaning: n === 11 ? 'Я пришёл за картой.' : 'Я переехал.',
    sayPron: n === 11 ? 'тынночжын бадыро вассоё' : 'исахэссоё',
    tip: 'Позвоните 1345.',
  }),
};

function texts(): Record<PackLang, Record<number, QuestText>> {
  const out = {} as Record<PackLang, Record<number, QuestText>>;
  for (const lang of Object.keys(TEXT_BASE) as PackLang[]) {
    out[lang] = { 11: TEXT_BASE[lang](11), 12: { ...TEXT_BASE[lang](12), linkLabel: '📅 label' } };
  }
  // linkLabel 은 언어 규칙에 맞게
  out.zh[12] = { ...out.zh[12], linkLabel: '📅 查看期限' };
  out.th[12] = { ...out.th[12], linkLabel: '📅 ดูกำหนด' };
  out.ru[12] = { ...out.ru[12], linkLabel: '📅 Срок' };
  return out;
}

function valid(): QuestContentInput {
  return {
    days: [day(11, false), day(12, true)],
    expectedDays: [11, 12],
    texts: texts(),
    takenSayKo: ['여권 여기 있어요.'],
    takenMeaning: { zh: ['旧'], vi: ['Cũ'], en: ['Old'], th: ['เก่า'], uz: ['Eski'], ru: ['Старое'] },
  };
}

const has = (problems: string[], prefix: string): boolean => problems.some((s) => s.startsWith(prefix));

describe('allowedNumberTokens / numberTokens', () => {
  it('includes legal values and contact numbers, not 20', () => {
    const set = allowedNumberTokens();
    for (const t of ['15', '90', '4', '22:00', '06:00', '1345', '1577-0071']) expect(set.has(t)).toBe(true);
    expect(set.has('20')).toBe(false);
  });

  it('extracts tokens and strips commas', () => {
    expect(numberTokens('1577-0071 과 10,320')).toEqual(['1577-0071', '10320']);
    expect(numberTokens('22:00 부터')).toEqual(['22:00']);
    expect(numberTokens('숫자 없음')).toEqual([]);
  });
});

describe('questDayProblems', () => {
  it('valid fixture → []', () => {
    expect(questDayProblems(valid())).toEqual([]);
  });

  it('(a) day order mismatch', () => {
    const input = valid();
    const problems = questDayProblems({ ...input, days: [input.days[1], input.days[0]] });
    expect(has(problems, 'day 11 ko day:')).toBe(true);
    expect(questDayProblems({ ...input, expectedDays: [11, 12, 13] }).some((s) => s.startsWith('day 13 ko day:'))).toBe(true);
  });

  it('(b) empty required fields', () => {
    const input = valid();
    const d = input.days[0];
    const bad: QuestDay = {
      ...d,
      icon: '',
      where: { vi: ' ', ko: '' },
      bring: [],
      say: { ...d.say, viPron: '' },
      tip: undefined,
    };
    const problems = questDayProblems({ ...input, days: [bad, input.days[1]] });
    expect(problems).toContain('day 11 ko icon: empty');
    expect(problems).toContain('day 11 ko where: empty');
    expect(problems).toContain('day 11 vi where: empty');
    expect(problems).toContain('day 11 ko bring: empty');
    expect(problems).toContain('day 11 vi viPron: empty');
    expect(problems).toContain('day 11 ko tip: missing');
  });

  it('(c) say.ko duplicate (taken and in batch) and too long', () => {
    const input = valid();
    const taken = questDayProblems({ ...input, takenSayKo: [input.days[0].say.ko] });
    expect(taken).toContain('day 11 ko say: duplicate');
    const d12 = { ...input.days[1], say: { ...input.days[1].say, ko: input.days[0].say.ko } };
    expect(questDayProblems({ ...input, days: [input.days[0], d12] })).toContain('day 12 ko say: duplicate');
    const long = '가'.repeat(MAX_SAY_KO_CHARS + 1);
    const d11 = { ...input.days[0], say: { ...input.days[0].say, ko: long } };
    expect(questDayProblems({ ...input, days: [d11, input.days[1]] })).toContain(
      `day 11 ko say: longer than ${MAX_SAY_KO_CHARS}`,
    );
    const ok = { ...input.days[0], say: { ...input.days[0].say, ko: '가'.repeat(MAX_SAY_KO_CHARS) } };
    expect(questDayProblems({ ...input, days: [ok, input.days[1]] })).toEqual([]);
  });

  it('(d) ko forbidden word', () => {
    const input = valid();
    const d = { ...input.days[0], tip: { vi: input.days[0].tip!.vi, ko: '불법이에요.' } };
    expect(questDayProblems({ ...input, days: [d, input.days[1]] })).toContain('day 11 ko tip: forbidden 불법');
  });

  it('(e) vi forbidden word and pron rule', () => {
    const input = valid();
    const d = {
      ...input.days[0],
      title: { vi: 'Việc Bất Hợp Pháp', ko: input.days[0].title.ko },
      say: { ...input.days[0].say, viPron: '등록증' },
    };
    const problems = questDayProblems({ ...input, days: [d, input.days[1]] });
    expect(problems).toContain('day 11 vi title: forbidden bất hợp pháp');
    expect(problems).toContain('day 11 vi viPron: pron rule');
  });

  it('(f) pack: missing day, bring length, linkLabel, empty, pron, forbidden, script', () => {
    const input = valid();
    const t = texts();
    delete (t.en as Record<number, QuestText>)[12];
    t.zh[11] = { ...t.zh[11], bring: ['护照', '钱'], linkLabel: '📅 期限', where: '' };
    t.ru[12] = { ...t.ru[12], linkLabel: undefined };
    delete t.ru[12].linkLabel;
    t.en[11] = { ...t.en[11], sayPron: 'deung-rok 등록', tip: 'This is ILLEGAL.' };
    t.th[11] = { ...t.th[11], title: 'Get card' };
    const problems = questDayProblems({ ...input, texts: t });
    expect(problems).toContain('day 12 en text: missing');
    expect(problems).toContain('day 11 zh bring: length 2 !== 1');
    expect(problems).toContain('day 11 zh linkLabel: unexpected');
    expect(problems).toContain('day 12 ru linkLabel: missing');
    expect(problems).toContain('day 11 zh where: empty');
    expect(problems).toContain('day 11 en sayPron: pron rule');
    expect(problems).toContain('day 11 en tip: forbidden illegal');
    expect(problems).toContain('day 11 th title: script mismatch');
  });

  it('(g) numbers outside legal/contacts in ko, vi and packs', () => {
    const input = valid();
    const d = {
      ...input.days[0],
      tip: { vi: 'Trong 20 ngày.', ko: '20일 안에 해요. 1577-0071 또는 10,320원.' },
    };
    const t = texts();
    t.uz[11] = { ...t.uz[11], tip: '30 kun ichida.' };
    const problems = questDayProblems({ ...input, days: [d, input.days[1]], texts: t });
    expect(problems).toContain('day 11 ko tip: number 20 not allowed');
    expect(problems).toContain('day 11 vi tip: number 20 not allowed');
    expect(problems).toContain('day 11 uz tip: number 30 not allowed');
    expect(problems.filter((s) => s.includes('1577-0071') || s.includes('10320'))).toEqual([]);
  });

  it('(h) link route and label', () => {
    const input = valid();
    const d12 = input.days[1];
    const wrongLabel = { ...d12, link: { route: 'deadline' as const, label: { vi: d12.link!.label.vi, ko: '기한' } } };
    expect(questDayProblems({ ...input, days: [input.days[0], wrongLabel] })).toContain(
      'day 12 ko link.label: label mismatch',
    );
    const wrongRoute = { ...d12, link: { route: 'form' as const, label: { vi: d12.link!.label.vi, ko: '서류' } } };
    expect(questDayProblems({ ...input, days: [input.days[0], wrongRoute] })).toContain(
      'day 12 ko link.route: unknown route form',
    );
  });

  it('(i) meaning duplicates (taken and in batch)', () => {
    const input = valid();
    const taken = questDayProblems({
      ...input,
      takenMeaning: { ...input.takenMeaning, vi: [input.days[0].say.viMeaning], ru: ['Я переехал.'] },
    });
    expect(taken).toContain('day 11 vi viMeaning: duplicate meaning');
    expect(taken).toContain('day 12 ru sayMeaning: duplicate meaning');
    const t = texts();
    t.en[12] = { ...t.en[12], sayMeaning: t.en[11].sayMeaning };
    expect(questDayProblems({ ...input, texts: t })).toContain('day 12 en sayMeaning: duplicate meaning');
  });
});
