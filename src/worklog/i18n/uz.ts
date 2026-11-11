import type { WorklogStrings } from './types';

/** Son boʻlmasa null */
function toNum(v: number | string): number | null {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

const cnt = (v: number | string): string => String(toNum(v) ?? (String(v) || '-'));

const won = (v: number | string): string => {
  const n = toNum(v);
  return n === null ? `${String(v) || '-'} von` : `${n.toLocaleString('ru-RU')} von`;
};

const hoursMinutes = (v: number | string): string => {
  const n = toNum(v);
  if (n === null) return `${String(v) || '-'} daqiqa`;
  const h = Math.floor(Math.abs(n) / 60);
  const m = Math.abs(n) % 60;
  return `${n < 0 ? '-' : ''}${h} soat ${m} daqiqa`;
};

export const uz: WorklogStrings = {
  title: 'Ish yozuvlari',
  intro: 'Ishga kelish va ketish vaqtini yozing — shu oylik taxminiy maoshni hisoblaymiz. Kiritganlaringiz faqat shu qurilmada saqlanadi.',
  month: 'Oyni tanlang',
  shiftHeading: 'Ish qoʻshish',
  shiftDate: 'Sana',
  shiftStart: 'Ishga kelish vaqti',
  shiftEnd: 'Ishdan ketish vaqti',
  shiftBreak: 'Tanaffus (daqiqa)',
  shiftHoliday: 'Dam olish kunida ishladim',
  shiftMemo: 'Izoh',
  shiftOvernightHint: 'Ketish vaqti kelish vaqtidan oldin boʻlsa, ertasi kuni ketgan deb hisoblaymiz.',
  shiftAdd: 'Yozuv qoʻshish',
  errBadDate: 'Sanani tekshirib koʻring.',
  errBadTime: 'Vaqtni tekshirib koʻring.',
  errZeroLength: 'Kelish va ketish vaqti bir xil.',
  errTooLong: 'Bir martalik ish 16 soatdan oshib ketdi. Vaqtni tekshirib koʻring.',
  errBreakTooLong: 'Tanaffus ish vaqtidan uzun.',
  errBadBreak: 'Tanaffusni 0 yoki undan katta butun son (daqiqa) bilan kiriting.',
  errFuture: 'Bugundan keyingi sanani yozib boʻlmaydi.',
  listHeading: 'Shu oydagi yozuvlar',
  empty: 'Shu oyda hali yozuv yoʻq. Yuqorida kelish va ketish vaqtini qoʻshing.',
  breakMinutes: (v) => `Tanaffus ${toNum(v) ?? (String(v) || '-')} daqiqa`,
  holidayTag: 'Dam olish kuni',
  delete: 'Oʻchirish',
  profileHeading: 'Soatbay ish haqi va ish joyi',
  wage: 'Soatbay ish haqi (von)',
  wageHint: 'Mehnat shartnomasi yoki maosh varaqasida yozilgan soatbay ish haqini kiriting.',
  size: (v) => `Ish joyida ${cnt(v)} va undan koʻp kishi ishlaydi`,
  sizeYes: (v) => `${cnt(v)} va undan koʻp`,
  sizeNo: (v) => `${cnt(v)} kishidan kam`,
  sizeUnknown: 'Bilmayman',
  weekStart: 'Hafta qaysi kundan boshlanadi',
  weekStartMon: 'Dushanba',
  weekStartSun: 'Yakshanba',
  detailsHeading: 'Siz va ish joyi haqida (shikoyat arizasi qoralamasi uchun)',
  detailsHint: 'Boʻsh qoldirsangiz ham hisoblanadi. Faqat shikoyat arizasi qoralamasida ishlatiladi.',
  workerName: 'Ism',
  workerBirth: 'Tugʻilgan sana',
  workerPhone: 'Telefon',
  workerAddress: 'Manzil',
  companyName: 'Ish joyi nomi',
  employerName: 'Rahbar (vakil)',
  employerAddress: 'Ish joyi manzili',
  employerPhone: 'Ish joyi telefoni',
  startDate: 'Ishga kirgan sana',
  endDate: 'Ishdan ketgan sana',
  profileSave: 'Saqlash',
  profileSaved: 'Saqlandi.',
  errWage: 'Soatbay ish haqini faqat raqam bilan kiriting.',
  totalsHeading: 'Shu oy hisobi',
  totalWorked: 'Jami ishlangan',
  totalRegular: 'Belgilangan ish vaqti',
  totalOvertime: 'Qoʻshimcha ish vaqti',
  totalNight: 'Tungi ish',
  totalHoliday: 'Dam olish kunidagi ish',
  basePay: 'Asosiy maosh',
  premiumPay: 'Qoʻshimcha toʻlovlar',
  expectedGross: 'Taxminiy maosh (soliqdan oldin)',
  hoursMinutes,
  won,
  wageMissing: 'Soatbay ish haqini saqlasangiz, summani hisoblaymiz.',
  minWageWarning: (v) => `Kiritilgan soatbay ish haqi bu yilgi eng kam ish haqidan (${won(v)}) past. Tekshirib koʻring.`,
  noteSmallWorkplaceNoPremium: (v) =>
    `${cnt(v)} kishidan kam ishlaydigan ish joylarida qoʻshimcha ish vaqti, tungi va dam olish kunidagi ish uchun toʻlovlar hisobga qoʻshilmadi.`,
  noteWorkplaceSizeUnknown: (v) =>
    `Ish joyidagi xodimlar soni nomaʼlum, shuning uchun qoʻshimcha toʻlovlar bilan hisoblandi. ${cnt(v)} kishidan kam boʻlsa, natija boshqacha boʻlishi mumkin.`,
  noteBelowMinWage: 'Soatbay ish haqi eng kam ish haqidan past. Tekshirib koʻring.',
  noteWeeklyHolidayPayNotIncluded: 'Haftalik dam olish kuni toʻlovi bu hisobga kirmagan.',
  compareHeading: 'Maosh varaqasi bilan solishtirish',
  compareHint: 'Shu oylik maosh varaqasidagi summalarni kiriting — hisobdan farqini koʻrsatamiz.',
  compareEarnings: 'Toʻlovlar',
  compareDeductions: 'Ushlab qolishlar',
  compareRun: 'Solishtirish',
  errRequired: 'Raqam kiriting (boʻlmasa 0)',
  errNotNumber: 'Faqat raqam kiriting',
  errTooLarge: '100 million vondan oshmasin',
  compareExpected: 'Ish yozuvlari boʻyicha hisob',
  compareReported: 'Varaqadagi soliqqa tortiladigan jami',
  compareDiff: 'Hisobdan farq',
  statusMatch: 'Hisob bilan deyarli bir xil.',
  statusLower: 'Maosh varaqasi hisobdan kam. Tekshirib koʻring.',
  statusHigher: 'Maosh varaqasi hisobdan koʻp.',
  unpaidEstimate: 'Toʻlanmagan taxminiy summa',
  deductionMismatch: (v) => `${toNum(v) ?? (String(v) || '-')} ta ushlab qolish bandi hisobdan farq qiladi. Tekshirib koʻring.`,
  ask1350: 'Baho kerak boʻlsa, 1350 ga (Bandlik va mehnat vazirligi maslahat markazi) murojaat qiling.',
  statementHeading: 'Shikoyat matni (qoralama)',
  statementHint: 'Bu PDF ga koreys tilida kiradi. Oʻzingiz tahrirlashingiz mumkin.',
  statementReset: 'Tavsiya qilingan matnga qaytarish',
  pdf: 'Dalil PDF yaratish',
  pdfHint: 'Kelish-ketish yozuvlari, oylik hisob, maosh varaqasi bilan solishtirish va shikoyat qoralamasini bitta faylga jamlaydi. Faqat shu qurilmada yaratiladi.',
  pdfBusy: 'PDF yaratilmoqda…',
  pdfErrorEmpty: 'Ish yozuvi yoʻq, shuning uchun PDF yaratib boʻlmaydi.',
  pdfErrorLibrary: 'PDF yaratilmadi. Birozdan keyin qayta urinib koʻring.',
  wipe: 'Barcha ish yozuvlarini oʻchirish',
  wipeAsk: 'Shu qurilmada saqlangan barcha ish yozuvlari, soatbay ish haqi va ish joyi maʼlumotlari oʻchirilsinmi?',
  wipeConfirm: 'Hammasini oʻchirish',
  wipeCancel: 'Bekor qilish',
  wiped: 'Barcha ish yozuvlari oʻchirildi.',
};
