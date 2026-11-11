import { CATEGORY_LABEL, BASIC_PHRASES } from '../../cards/phrases';
import { ARC_FORM_FIELDS } from '../../forms/arcForm';
import { TERMS, TERM_CATEGORY_LABEL } from '../../glossary/glossary';
import { CONTACTS } from '../../help/contacts';
import { MANUAL_LABELS } from '../../payroll/manual';
import { SAMPLE_A } from '../../payroll/samples';
import { DEDUCTION_ORDER, type DeductionKind } from '../../payroll/types';
import { QUESTS } from '../../quest/quests';
import type { ContactId, EarningNameKo, FormFieldId, PhraseId, QuestDayNo, TermId } from '../ids';
import type { ContentPack, LangPack, QuestText, UiStrings } from '../types';

// 현재 화면 리터럴의 ` · ` 앞부분을 글자 그대로 (vi 동일성)
const ui: UiStrings = {
  appHelp: '☎ Trợ giúp',
  navAria: 'Điều hướng',
  tabs: { quest: 'Nhiệm vụ', form: 'Giấy tờ', payslip: 'Lương', cards: 'Thẻ nói', glossary: 'Từ điển', tools: 'Hồ sơ' },
  listen: 'Nghe',
  listenAria: 'Nghe tiếng Hàn',
  listenMine: 'Nghe tiếng Việt',
  listenMineAria: 'Nghe bản dịch tiếng Việt',
  bigCardAria: 'Thẻ chữ lớn',
  bigCardShow: 'Đưa màn hình này cho nhân viên',
  close: 'Đóng',
  save: 'Lưu',
  langSwitchAria: 'Đổi ngôn ngữ',
  langSheetTitle: 'Chọn ngôn ngữ',
  questTitle: 'Nhiệm vụ',
  questProgress: (day, total) => `Ngày ${day} / ${total}`,
  questDotsAria: (done, total) => `Tiến độ ${done}/${total}`,
  questDplusNote: 'kể từ ngày đến Hàn Quốc',
  questArrivalOpen: '📅 Nhập ngày đến Hàn Quốc',
  questArrivalEdit: 'Sửa ngày đến',
  questArrivalAria: 'Ngày đến Hàn Quốc',
  arrivalError: { invalid: 'Ngày không hợp lệ', future: 'Ngày đến không thể ở tương lai' },
  questLockedHint: (day) => `🔒 Hãy hoàn thành Ngày ${day} trước.`,
  questToday: 'Hôm nay',
  questWhere: '📍 Ở đâu',
  questBring: '🎒 Mang gì',
  questSay: '💬 Nói gì',
  showBig: '🔍 Hiện chữ lớn',
  questComplete: 'Hoàn thành',
  questAllDone: (total) => `🎉 Bạn đã hoàn thành cả ${total} ngày!`,
  questDay: (day) => `Ngày ${day}`,
  questReset: 'Làm lại từ đầu',
  formTitle: 'Đơn đăng ký người nước ngoài',
  formSampleBadge: 'Mẫu',
  formSampleNote: 'Đây là mẫu giả lập. Hãy làm theo tờ đơn thật bạn nhận ở văn phòng.',
  formExample: 'Ví dụ',
  askOfficer: '🙋 Hãy hỏi cán bộ phụ trách',
  formPrevAria: 'Ô trước',
  formNextAria: 'Ô tiếp theo',
  formSubmit: 'Đã nộp',
  formSubmittedMsg:
    'Bạn đã nộp xong! Thẻ đăng ký thường có sau 3–4 tuần. Về lưu trú và visa, hãy hỏi cán bộ phụ trách.',
  formQuestDone: (day) => `Ngày ${day} hoàn thành`,
  formBackQuest: 'Về nhiệm vụ',
  payslipTitle: 'Bảng lương',
  payslipSampleA: 'Mẫu A',
  payslipSampleB: 'Mẫu B',
  payslipManual: 'Tự nhập',
  payslipDiff: 'Khác với tính toán',
  payslipTaxableTotal: 'Tổng chịu thuế',
  payslipAskLabel: 'Khi hỏi công ty',
  payslipDisclaimer:
    'Kết quả này chỉ để tham khảo, không phải là đánh giá pháp lý. Dựa trên mức phí công bố năm 2026.',
  manualPrivacy: '🔒 Số bạn nhập chỉ được tính trên điện thoại này, không lưu và không gửi đi.',
  manualEarnings: 'Khoản được trả',
  manualDeductions: 'Khoản bị trừ',
  manualLtcHint: 'Nếu bảng lương không ghi riêng, nhập 0.',
  manualCheck: 'Kiểm tra',
  manualError: {
    required: 'Hãy nhập số (không có thì nhập 0)',
    notNumber: 'Chỉ nhập số',
    tooLarge: 'Số quá lớn',
  },
  cardsTitle: 'Thẻ nói tiếng Hàn',
  cardsHint: 'Chạm vào thẻ để hiện chữ lớn cho nhân viên xem',
  glossaryTitle: 'Từ điển lương & hành chính',
  glossaryPlaceholder: 'Tìm: bảo hiểm, lương, 보험…',
  glossarySearchAria: 'Tìm từ',
  glossaryCount: (n) => `${n} từ`,
  glossaryEmpty: 'Không tìm thấy',
  glossaryEmptyTry: 'Thử từ khác, ví dụ "bảo hiểm".',
  askExpert: '🙋 Cần hỏi chuyên gia',
  helpTitle: 'Trợ giúp',
  helpExpertNote:
    'Korea30 không đánh giá về visa hay pháp luật. Những câu hỏi đó hãy hỏi các cơ quan dưới đây.',
  helpEmergency: '🚨 Khẩn cấp',
  helpLines: '☎ Tư vấn',
  helpNativeBadge: 'Có tiếng Việt',
  helpRecheck: 'Số cần xác nhận lại',
};

function byId<K extends string, T extends { id: string }, V>(items: readonly T[], f: (t: T) => V): Record<K, V> {
  return Object.fromEntries(items.map((t) => [t.id, f(t)])) as Record<K, V>;
}

const quests = Object.fromEntries(
  QUESTS.map((q): [number, QuestText] => [
    q.day,
    {
      title: q.title.vi,
      where: q.where.vi,
      bring: q.bring.map((b) => b.vi),
      sayMeaning: q.say.viMeaning,
      sayPron: q.say.viPron,
      tip: q.tip!.vi,
      ...(q.link ? { linkLabel: q.link.label.vi } : {}),
    },
  ]),
) as Record<QuestDayNo, QuestText>;

const sampleEarning = (ko: string): string => {
  const e = SAMPLE_A.earnings.find((x) => x.nameKo === ko);
  if (!e) throw new Error(`SAMPLE_A earning missing: ${ko}`);
  return e.nameVi;
};

const earnings: Record<EarningNameKo, string> = {
  기본급: sampleEarning('기본급'),
  연장근로수당: sampleEarning('연장근로수당'),
  식대: sampleEarning('식대'),
  '연장·야간·휴일 수당': MANUAL_LABELS.overtimePay.vi,
  '기타 과세 수당': MANUAL_LABELS.otherTaxable.vi,
  '비과세 수당 (식대 등)': MANUAL_LABELS.nonTaxable.vi,
};

const content: ContentPack = {
  quests,
  form: byId<FormFieldId, (typeof ARC_FORM_FIELDS)[number], { label: string; guide: string }>(ARC_FORM_FIELDS, (f) => ({
    label: f.labelVi,
    guide: f.guide.vi,
  })),
  phrases: byId<PhraseId, (typeof BASIC_PHRASES)[number], { meaning: string; pron: string }>(BASIC_PHRASES, (p) => ({
    meaning: p.vi,
    pron: p.viPron,
  })),
  phraseCategories: {
    counter: CATEGORY_LABEL.counter.vi,
    daily: CATEGORY_LABEL.daily.vi,
    quest: CATEGORY_LABEL.quest.vi,
  },
  terms: byId<TermId, (typeof TERMS)[number], { name: string; explain: string }>(TERMS, (t) => ({
    name: t.vi,
    explain: t.explainVi,
  })),
  termCategories: {
    pay: TERM_CATEGORY_LABEL.pay.vi,
    insurance: TERM_CATEGORY_LABEL.insurance.vi,
    admin: TERM_CATEGORY_LABEL.admin.vi,
  },
  contacts: byId<ContactId, (typeof CONTACTS)[number], { name: string; when: string }>(CONTACTS, (c) => ({
    name: c.nameVi,
    when: c.whenVi,
  })),
  payroll: {
    earnings,
    deductions: Object.fromEntries(DEDUCTION_ORDER.map((k) => [k, MANUAL_LABELS[k].vi])) as Record<
      DeductionKind,
      string
    >,
  },
};

export const vi: LangPack = { ui, content };
