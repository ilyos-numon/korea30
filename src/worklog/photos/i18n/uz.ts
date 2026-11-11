import type { PhotoStrings } from './types';

/** Qiymat boʻlmasa yoki boʻsh boʻlsa '-' (hech qachon boʻsh satr qaytarmaydi) */
const s = (v: unknown): string => {
  if (v === undefined || v === null) return '-';
  if (typeof v === 'number' && !Number.isFinite(v)) return '-';
  return String(v).trim() || '-';
};

export const uz: PhotoStrings = {
  heading: 'Ish rasmlari',
  intro: 'Ishingizni koʻrsatadigan rasmlarni (kelish-ketish qayd qurilmasi ekrani, ish jadvali va h.k.) sanasi bilan shu qurilmada saqlang.',
  privacyNote: 'Rasmlar faqat shu qurilmada saqlanadi. Joylashuv kabi rasm maʼlumotlari saqlashdan oldin oʻchiriladi.',
  dateLabel: 'Ish sanasi',
  shiftLabel: 'Bogʻlanadigan ish',
  shiftNone: 'Bogʻlamaslik',
  shiftOption: (date, start, end) => `${s(date)} ${s(start)}–${s(end)}`,
  memoLabel: 'Izoh',
  camera: 'Kamerada suratga olish',
  pick: 'Rasm tanlash',
  saving: 'Saqlanmoqda…',
  saved: 'Saqlandi',
  errorNotImage: 'Faqat rasm fayllarini saqlash mumkin.',
  errorTooLarge: (mb) => `Rasm juda katta. ${s(mb)} MB yoki undan kichik rasm tanlang.`,
  errorDecode: 'Bu rasmni ochib boʻlmadi. Boshqa rasm tanlang.',
  errorQuota: 'Qurilmada joy yetarli emas. Eski rasmlarni oʻchirib koʻring.',
  errorUnknown: 'Saqlab boʻlmadi. Qayta urinib koʻring.',
  empty: 'Bu oyda saqlangan rasm yoʻq.',
  takenOn: (date) => `Olingan sana: ${s(date)}`,
  takenOnSaved: (date) => `Saqlangan sana: ${s(date)} (olingan sana maʼlumoti yoʻq)`,
  expiresOn: (date) => `${s(date)} gacha saqlanadi`,
  expiringSoon: (days) => `Saqlash muddati ${s(days)} kundan keyin tugaydi`,
  linkedShift: (label) => `Bogʻlangan ish: ${s(label)}`,
  open: 'Kattalashtirib koʻrish',
  close: 'Yopish',
  delete: 'Oʻchirish',
  deleteAsk: 'Bu rasm oʻchirilsinmi? Oʻchirilgan rasmni qaytarib boʻlmaydi.',
  deleteConfirm: 'Oʻchirish',
  deleteCancel: 'Bekor qilish',
  expiryEditLabel: 'Saqlash muddati tugash sanasini oʻzgartirish',
  expirySave: 'Sanani saqlash',
  expiryErrorFormat: 'Sanani YYYY-MM-DD koʻrinishida yozing.',
  expiryErrorNotFuture: 'Bugundan keyingi sanani tanlang.',
  expiryCustomNote: 'Bu sanani oʻzingiz belgilagansiz. Saqlash muddati sozlamasi oʻzgarsa ham, u oʻzgarmaydi.',
  retentionHeading: 'Rasmlarni saqlash muddati',
  retentionLabel: 'Saqlash muddati (oy)',
  retentionHint:
    'Bu ilova sozlamasi, qonunda belgilangan muddat emas. Muddat tugagach, ilova rasmlarni oʻchirish yoki oʻchirmaslikni soʻraydi. Uzoqroq saqlash uchun muddatni oshiring. Ish haqi bilan bogʻliq dalillar uzoqroq kerak boʻlishi mumkin, shuning uchun saqlash muddatini oshiring yoki ularni dalil PDF sifatida alohida saqlang.',
  retentionSave: 'Saqlash muddatini saqlash',
  retentionSaved: (changed) => `Saqlandi. ${s(changed)} ta rasmning saqlash muddati tugash sanasi qayta hisoblandi.`,
  retentionError: (min, max) => `${s(min)} dan ${s(max)} oygacha boʻlgan son yozing.`,
  retentionApplyAsk: (n) => `Shunday oʻzgartirilsa, ${s(n)} ta rasmning saqlash muddati darhol tugaydi. Ilova ularni oʻchirish yoki oʻchirmaslikni soʻraydi. Oʻzgartirilsinmi?`,
  retentionApplyConfirm: 'Oʻzgartirish',
  retentionApplyCancel: 'Bekor qilish',
  purged: (n) => `Saqlash muddati oʻtgan ${s(n)} ta rasm oʻchirildi.`,
  months: (n) => `${s(n)} oy`,
  wipeIncludesPhotos: 'Hammasini oʻchirish saqlangan rasmlarni ham oʻchiradi.',
};
