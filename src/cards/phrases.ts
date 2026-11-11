import type { Bilingual } from '../quest/types';
import { QUESTS } from '../quest/quests';

export type PhraseCategory = 'counter' | 'daily' | 'quest';

export interface Phrase {
  id: string;
  category: PhraseCategory;
  ko: string;
  vi: string;
  viPron: string;
}

export const BASIC_PHRASES: readonly Phrase[] = [
  {
    id: 'b1',
    category: 'counter',
    ko: '한국어를 잘 못해요. 천천히 말해 주세요.',
    vi: 'Tôi không giỏi tiếng Hàn. Xin hãy nói chậm lại.',
    viPron: 'Han-cu-cơ-rưl chal mô-the-yô. Chơn-chơn-hi mal-he chu-xê-yô.',
  },
  {
    id: 'b2',
    category: 'counter',
    ko: '다시 한 번 말해 주세요.',
    vi: 'Xin hãy nói lại một lần nữa.',
    viPron: 'Ta-xi han bơn mal-he chu-xê-yô.',
  },
  {
    id: 'b3',
    category: 'counter',
    ko: '여기에 써 주세요.',
    vi: 'Xin hãy viết vào đây.',
    viPron: 'Yơ-ghi-ê xơ chu-xê-yô.',
  },
  {
    id: 'b4',
    category: 'counter',
    ko: '베트남어 통역이 가능한가요?',
    vi: 'Có phiên dịch tiếng Việt không ạ?',
    viPron: 'Bê-thư-nam-ơ thông-yơ-ghi ca-nưng-han-ga-yô?',
  },
  {
    id: 'b5',
    category: 'counter',
    ko: '이 서류는 어디에 내요?',
    vi: 'Giấy tờ này nộp ở đâu ạ?',
    viPron: 'I xơ-ryu-nưn ơ-đi-ê ne-yô?',
  },
  {
    id: 'b6',
    category: 'counter',
    ko: '무엇을 더 가져와야 해요?',
    vi: 'Tôi cần mang thêm gì nữa ạ?',
    viPron: 'Mu-ơ-xưl tơ ca-chơ-oa-ya he-yô?',
  },
  {
    id: 'b7',
    category: 'counter',
    ko: '이 칸에는 무엇을 써야 해요?',
    vi: 'Ô này cần viết gì ạ?',
    viPron: 'I khan-ê-nưn mu-ơ-xưl xơ-ya he-yô?',
  },
  {
    id: 'b8',
    category: 'counter',
    ko: '언제 다시 오면 돼요?',
    vi: 'Khi nào tôi nên quay lại ạ?',
    viPron: 'Ơn-chê ta-xi ô-myơn tue-yô?',
  },
  {
    id: 'b9',
    category: 'daily',
    ko: '이거 얼마예요?',
    vi: 'Cái này bao nhiêu tiền?',
    viPron: 'I-gơ ơl-ma-yê-yô?',
  },
  {
    id: 'b10',
    category: 'daily',
    ko: '화장실이 어디예요?',
    vi: 'Nhà vệ sinh ở đâu ạ?',
    viPron: 'Hoa-chang-xi-ri ơ-đi-yê-yô?',
  },
  {
    id: 'b11',
    category: 'daily',
    ko: '여기가 아파요.',
    vi: 'Tôi bị đau ở chỗ này.',
    viPron: 'Yơ-ghi-ga a-pha-yô.',
  },
  {
    id: 'b12',
    category: 'daily',
    ko: '도와주셔서 감사합니다.',
    vi: 'Cảm ơn vì đã giúp tôi.',
    viPron: 'Tô-oa-chu-xơ-xơ cam-xa-ham-ni-đa.',
  },
];

export const CATEGORY_LABEL: Readonly<Record<PhraseCategory, Bilingual>> = {
  counter: { vi: 'Ở quầy', ko: '창구에서' },
  daily: { vi: 'Hằng ngày', ko: '일상' },
  quest: { vi: 'Theo nhiệm vụ', ko: '퀘스트 문장' },
};

/** BASIC_PHRASES + QUESTS 에서 만든 quest 문장 10개 (id `q{day}`) */
export function allPhrases(): Phrase[] {
  const quest: Phrase[] = QUESTS.map((q) => ({
    id: `q${q.day}`,
    category: 'quest',
    ko: q.say.ko,
    vi: q.say.viMeaning,
    viPron: q.say.viPron,
  }));
  return [...BASIC_PHRASES, ...quest];
}
