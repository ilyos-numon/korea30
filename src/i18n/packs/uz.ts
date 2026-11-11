import type { QuestDayNo } from '../ids';
import type { ContentPack, LangPack, QuestText, UiStrings } from '../types';
import { QUEST_TEXT_11_20 } from './quests11to20';
import { QUEST_TEXT_21_30 } from './quests21to30';

// Oʻzbekcha (lotin). oʻ·gʻ 는 U+02BB, tutuq belgisi 는 U+02BC.
const ui: UiStrings = {
  appHelp: '☎ Yordam',
  navAria: 'Navigatsiya',
  tabs: { quest: 'Vazifalar', form: 'Hujjatlar', payslip: 'Maosh', cards: 'Kartalar', glossary: 'Lugʻat', tools: 'Yozuvlar' },
  listen: 'Tinglash',
  listenAria: 'Koreyschasini tinglash',
  listenMine: 'Oʻzbekcha tinglash',
  listenMineAria: 'Oʻzbekcha tarjimani tinglash',
  bigCardAria: 'Katta yozuvli karta',
  bigCardShow: 'Bu ekranni xodimga koʻrsating',
  close: 'Yopish',
  save: 'Saqlash',
  langSwitchAria: 'Tilni oʻzgartirish',
  langSheetTitle: 'Tilni tanlang',
  questTitle: 'Vazifalar',
  questProgress: (day, total) => `${day}-kun / ${total}`,
  questDotsAria: (done, total) => `Jarayon ${done}/${total}`,
  questDplusNote: 'Koreyaga kelgan kundan boshlab',
  questArrivalOpen: '📅 Koreyaga kelgan sanani kiriting',
  questArrivalEdit: 'Kelgan sanani oʻzgartirish',
  questArrivalAria: 'Koreyaga kelgan sana',
  arrivalError: { invalid: 'Bunday sana yoʻq', future: 'Kelgan sana kelajakda boʻlishi mumkin emas' },
  questLockedHint: (day) => `🔒 Avval ${day}-kunni tugating.`,
  questToday: 'Bugun',
  questWhere: '📍 Qayerda',
  questBring: '🎒 Nimani olib borasiz',
  questSay: '💬 Nima deysiz',
  showBig: '🔍 Katta qilib koʻrsatish',
  questComplete: 'Bajarildi',
  questAllDone: (total) => `🎉 Siz barcha ${total} kunni tugatdingiz!`,
  questDay: (day) => `${day}-kun`,
  questReset: 'Boshidan boshlash',
  formTitle: 'Chet ellikni roʻyxatga olish arizasi',
  formSampleBadge: 'Namuna',
  formSampleNote: 'Bu sinov uchun namuna. Idoradan olgan haqiqiy arizangizga qarab toʻldiring.',
  formExample: 'Misol',
  askOfficer: '🙋 Masʼul xodimdan soʻrang',
  formPrevAria: 'Oldingi katak',
  formNextAria: 'Keyingi katak',
  formSubmit: 'Topshirdim',
  formSubmittedMsg:
    'Topshirib boʻldingiz! Roʻyxat kartasi odatda 3–4 haftadan keyin tayyor boʻladi. Yashash va viza masalalarini masʼul xodimdan soʻrang.',
  formQuestDone: (day) => `${day}-kun bajarildi`,
  formBackQuest: 'Vazifalarga qaytish',
  payslipTitle: 'Maosh varaqasi',
  payslipSampleA: 'Namuna A',
  payslipSampleB: 'Namuna B',
  payslipManual: 'Oʻzim kiritaman',
  payslipDiff: 'Hisobdan farq qiladi',
  payslipTaxableTotal: 'Soliqqa tortiladigan jami',
  payslipAskLabel: 'Kompaniyadan soʻraganda',
  payslipDisclaimer:
    'Bu natija faqat maʼlumot uchun, huquqiy baho emas. 2026-yilda eʼlon qilingan stavkalar asosida.',
  manualPrivacy:
    '🔒 Kiritgan raqamlaringiz faqat shu telefonda hisoblanadi, saqlanmaydi va hech qayerga yuborilmaydi.',
  manualEarnings: 'Toʻlanadigan summalar',
  manualDeductions: 'Ushlab qolinadigan summalar',
  manualLtcHint: 'Maosh varaqasida alohida yozilmagan boʻlsa, 0 kiriting.',
  manualCheck: 'Tekshirish',
  manualError: {
    required: 'Raqam kiriting (boʻlmasa 0 kiriting)',
    notNumber: 'Faqat raqam kiriting',
    tooLarge: 'Raqam juda katta',
  },
  cardsTitle: 'Koreyscha soʻz kartalari',
  cardsHint: 'Xodimga katta yozuvni koʻrsatish uchun kartaga bosing',
  glossaryTitle: 'Maosh va hujjatlar lugʻati',
  glossaryPlaceholder: 'Qidirish: sugʻurta, maosh, 보험…',
  glossarySearchAria: 'Soʻz qidirish',
  glossaryCount: (n) => `${n} ta soʻz`,
  glossaryEmpty: 'Hech narsa topilmadi',
  glossaryEmptyTry: 'Boshqa soʻzni sinab koʻring, masalan «sugʻurta».',
  askExpert: '🙋 Mutaxassisdan soʻrash kerak',
  helpTitle: 'Yordam',
  helpExpertNote:
    'Korea30 viza yoki qonun masalalarida baho bermaydi. Bunday savollarni quyidagi idoralarga bering.',
  helpEmergency: '🚨 Shoshilinch',
  helpLines: '☎ Maslahat',
  helpNativeBadge: 'Oʻzbek tilida bor',
  helpRecheck: 'Raqamni qayta tekshiring',
};

const quests: Record<QuestDayNo, QuestText> = {
  1: {
    title: 'SIM karta ochish',
    where: 'Aeroportdagi aloqa operatorining rouming markazi yoki yaqin atrofdagi telefon doʻkoni',
    bring: ['Pasport', 'Toʻlov uchun karta yoki naqd pul'],
    sayMeaning: 'Oldindan toʻlanadigan SIM karta ochmoqchiman. Mana pasportim.',
    sayPron: 'Son-bul yu-sim ge-tong-ha-go si-po-yo. Yo-gwon yo-gi is-so-yo.',
    tip: 'Chet ellik sifatida roʻyxatdan oʻtishdan oldin koʻpincha faqat oldindan toʻlanadigan tarif ishlaydi.',
  },
  2: {
    title: 'Transport kartasini olish',
    where: 'Kecha-kunduz ishlaydigan doʻkon yoki metro bekatidagi transport kartasini toʻldirish apparati',
    bring: ['Naqd pul (kartani toʻldirish asosan naqd pulda)'],
    sayMeaning: 'Bitta transport kartasi bering. 10 000 von toʻldirib bering.',
    sayPron: 'Gyo-tong-ka-di ha-na ju-se-yo. Man won chung-jon-he ju-se-yo.',
    tip: 'Avtobus yoki metrodan tushayotganda ham kartani tegizsangiz, boshqa transportga oʻtishda chegirma olasiz.',
  },
  3: {
    title: 'Chet ellik sifatida roʻyxatdan oʻtishga ariza berish',
    where: 'Hududingizdagi immigratsiya idorasi (HiKorea saytida tashrif vaqtini oldindan band qiling)',
    bring: ['Pasport', '1 dona surat', 'Yotoqxona manzili'],
    sayMeaning: 'Chet ellik sifatida roʻyxatdan oʻtish uchun keldim.',
    sayPron: 'We-gu-gin-ding-nok ha-ro wat-so-yo.',
    tip: 'Roʻyxat kartasi odatda 3–4 haftada tayyor boʻladi. Yashash va viza masalalarini masʼul xodimdan soʻrang.',
    linkLabel: '📝 Arizani toʻldirish yoʻriqnomasi',
  },
  4: {
    title: 'Bank hisobi ochish',
    where: 'Kompaniya yoki yotoqxona yaqinidagi bank filiali (baʼzi filiallarda chet elliklar uchun alohida kassa bor)',
    bring: ['Pasport', 'Mehnat shartnomasi yoki ish joyidan maʼlumotnoma', 'Koreya mobil telefoni'],
    sayMeaning: 'Maosh olish uchun bank hisobi ochmoqchiman.',
    sayPron: 'Wol-gip ba-dil tong-jang-il man-dil-go si-po-yo.',
    tip: 'Har bir bankda kerakli hujjatlar har xil. Borishdan oldin kompaniyadagi masʼul xodimdan soʻrang. Parolingizni boshqalarga aytmang.',
  },
  5: {
    title: 'Tibbiy sugʻurtaga aʼzolikni tekshirish',
    where: 'Kompaniyadagi masʼul xodim yoki Milliy tibbiy sugʻurta xizmati filiali',
    bring: ['Pasport', 'Roʻyxatdan oʻtish arizasi qabul qilingani haqidagi tilxat (boʻlsa)'],
    sayMeaning: 'Tibbiy sugʻurtaga aʼzo boʻlganimni tekshirmoqchiman.',
    sayPron: 'Je-ga gon-gang-bo-ho-me ga-ip-dwen-nin-ji hwa-gin-ha-go si-po-yo.',
    tip: 'Kompaniyada ishlasangiz, odatda kompaniya orqali ish joyi boʻyicha aʼzo boʻlasiz. Savolingiz boʻlsa, Milliy tibbiy sugʻurta xizmatiga (1577-1000) murojaat qilishingiz mumkin.',
  },
  6: {
    title: 'Yaqin atrofdagi shifoxona va dorixonani bilib olish',
    where: 'Yotoqxona yaqinidagi poliklinika va dorixona (xarita ilovasida «내과», «약국» deb qidiring)',
    bring: ['Pasport yoki chet ellik roʻyxat kartasi', 'Tibbiy sugʻurta maʼlumotlari (boʻlsa)'],
    sayMeaning: 'Birinchi marta keldim. Shifokor koʻrigidan oʻtmoqchiman.',
    sayPron: 'Cho-im wat-so-yo. Jil-lyo bat-go si-po-yo.',
    tip: 'Kechasi yoki dam olish kunida toʻsatdan qattiq kasal boʻlsangiz, 119 ga qoʻngʻiroq qiling.',
  },
  7: {
    title: 'Chiqindi tashlash qoidalarini oʻrganish',
    where: 'Yotoqxona yoki uy yaqinidagi doʻkon yoki market (maxsus chiqindi qopini sotib olish)',
    bring: ['Naqd pul yoki karta'],
    sayMeaning: '20 litrli maxsus chiqindi qopini bering.',
    sayPron: 'Jong-nyang-je bong-tu i-sip-li-to ju-se-yo.',
    tip: 'Oddiy chiqindi maxsus qopga solinadi, oziq-ovqat va qayta ishlanadigan chiqindilar alohida tashlanadi. Tashlash kunlari va joyi mahallaga qarab farq qiladi.',
  },
  8: {
    title: 'Vatanga pul joʻnatish yoʻllarini bilib olish',
    where: 'Bank kassasi yoki bank, pul oʻtkazish ilovasi',
    bring: ['Pasport', 'Bank daftarchasi', 'Oluvchining ismi va hisob maʼlumotlari'],
    sayMeaning: 'Oʻzbekistonga pul joʻnatmoqchiman. Komissiya qancha?',
    sayPron: 'U-ji-be-ki-si-ta-ni-ro song-gim-ha-go si-po-yo. Su-su-ryo-ga ol-ma-ye-yo?',
    tip: 'Komissiya va valyuta kursi har joyda har xil. Oluvchi maʼlumotlarini ikki marta tekshiring.',
  },
  9: {
    title: 'Mehnat shartnomasini qayta oʻqish',
    where: 'Yotoqxona yoki uy (kompaniyadan olgan shartnoma)',
    bring: ['Mehnat shartnomasi'],
    sayMeaning: 'Mehnat shartnomasining bir nusxasini olsam boʻladimi?',
    sayPron: 'Gil-lo-gye-yak-so sa-bo-nil han bu ba-dil su is-sil-kka-yo?',
    tip: 'Maosh, ish vaqti va dam olish kunlari qanday yozilganini tekshiring. Savolingiz boʻlsa, Bandlik va mehnat vazirligiga (1350) murojaat qilishingiz mumkin.',
    linkLabel: '📖 Qiyin soʻzlarni qidirish',
  },
  10: {
    title: 'Birinchi maosh varaqasini tekshirish',
    where: 'Kompaniya (maosh kuni varaqani olish)',
    bring: ['Maosh varaqasi', 'Mehnat shartnomasi'],
    sayMeaning: 'Shu oyning maosh varaqasini olsam boʻladimi?',
    sayPron: 'I-bon dal gi-pyo-myong-se-so-ril ba-dil su is-sil-kka-yo?',
    tip: 'Ushlab qolingan summa hisobdan farq qilsa, kompaniyadan soʻrang. Baho berish kerak boʻlsa, mutaxassisdan soʻrang.',
    linkLabel: '💰 Maoshni tekshirish',
  },
  ...QUEST_TEXT_11_20.uz,
  ...QUEST_TEXT_21_30.uz,
};

const content: ContentPack = {
  quests,
  form: {
    'apply-type': {
      label: 'Ariza turi',
      guide:
        '«외국인 등록» (chet ellik sifatida roʻyxatdan oʻtish) katagiga ✓ belgisini qoʻying. Boshqa katak ham kerakmi, masʼul xodimdan soʻrang.',
    },
    surname: { label: 'Familiya', guide: 'Pasportdagidek, katta lotin harflari bilan yozing.' },
    'given-names': {
      label: 'Ism',
      guide: 'Pasportda yozilgan ismni xuddi shunday, boʻsh joylari bilan birga yozing.',
    },
    birth: {
      label: 'Tugʻilgan sana',
      guide: 'Yil-oy-kun tartibida yozing. Oʻzbekistondagi tartibdan (kun.oy.yil) farq qiladi.',
    },
    sex: { label: 'Jinsi', guide: 'Erkaklar 남(M) ga, ayollar 여(F) ga ✓ belgisini qoʻying.' },
    nationality: { label: 'Fuqarolik', guide: 'Inglizcha qilib UZBEKISTAN deb yozing.' },
    'passport-no': {
      label: 'Pasport raqami',
      guide: 'Pasportning surat bor sahifasidagi oʻng yuqori burchakdagi raqamni xuddi shunday yozing.',
    },
    'passport-dates': {
      label: 'Pasport berilgan sana va amal qilish muddati',
      guide: 'Pasportdagi ikki sanani yil-oy-kun tartibida yozing.',
    },
    'address-kr': {
      label: 'Koreyadagi manzil (yashash joyi)',
      guide:
        'Hozir yashayotgan yotoqxona yoki uy manzilini bino va xona raqamigacha yozing. Bilmasangiz, kompaniyadagi masʼul xodim yuborgan xabarni aynan koʻchirib yozing.',
    },
    phone: { label: 'Mobil telefon', guide: '1-kuni ochgan Koreya telefon raqamingizni yozing.' },
    'address-home': { label: 'Oʻzbekistondagi manzil', guide: 'Oʻzbekistondagi uy manzilingizni yozing.' },
    workplace: {
      label: 'Ish joyi va tadbirkorlik roʻyxat raqami',
      guide:
        'Kompaniya nomi va tadbirkorlik roʻyxat raqamini (10 xonali) yozing. U mehnat shartnomasida bor yoki kompaniyadagi masʼul xodimdan soʻrang.',
    },
    sign: {
      label: 'Ariza sanasi va imzo',
      guide: 'Bugungi sanani yozing va pasportdagi imzo bilan bir xil imzo qoʻying.',
    },
  },
  phrases: {
    b1: {
      meaning: 'Koreyschani yaxshi bilmayman. Iltimos, sekinroq gapiring.',
      pron: 'Han-gu-go-ril jal mo-te-yo. Chon-chon-hi mal-he ju-se-yo.',
    },
    b2: { meaning: 'Iltimos, yana bir marta ayting.', pron: 'Da-si han bon mal-he ju-se-yo.' },
    b3: { meaning: 'Iltimos, shu yerga yozib bering.', pron: 'Yo-gi-e sso ju-se-yo.' },
    b4: { meaning: 'Oʻzbek tilida tarjimon xizmati bormi?', pron: 'U-ji-be-ki-o tong-yo-gi ga-ning-han-ga-yo?' },
    b5: { meaning: 'Bu hujjatni qayerga topshiraman?', pron: 'I so-ryu-nin o-di-e ne-yo?' },
    b6: { meaning: 'Yana nima olib kelishim kerak?', pron: 'Mu-o-sil do ga-jo-wa-ya he-yo?' },
    b7: { meaning: 'Bu katakka nima yozish kerak?', pron: 'I ka-ne-nin mu-o-sil so-ya he-yo?' },
    b8: { meaning: 'Qachon yana kelsam boʻladi?', pron: 'On-je da-si o-myon dwe-yo?' },
    b9: { meaning: 'Bu qancha turadi?', pron: 'I-go ol-ma-ye-yo?' },
    b10: { meaning: 'Hojatxona qayerda?', pron: 'Hwa-jang-si-ri o-di-ye-yo?' },
    b11: { meaning: 'Shu yerim ogʻriyapti.', pron: 'Yo-gi-ga a-pa-yo.' },
    b12: { meaning: 'Yordamingiz uchun rahmat.', pron: 'Do-wa-ju-syo-so gam-sa-ham-ni-da.' },
  },
  phraseCategories: { counter: 'Xizmat darchasida', daily: 'Kundalik', quest: 'Vazifa boʻyicha' },
  terms: {
    'base-pay': { name: 'Asosiy maosh', explain: 'Qoʻshimcha toʻlovlarsiz belgilangan asosiy oylik.' },
    overtime: {
      name: 'Qoʻshimcha ish vaqti uchun toʻlov',
      explain: 'Belgilangan ish vaqtidan ortiq ishlangan soatlar uchun beriladigan pul.',
    },
    night: {
      name: 'Tungi ish uchun toʻlov',
      explain: 'Kechqurun soat 10 dan ertalab soat 6 gacha ishlangan soatlar uchun qoʻshimcha toʻlanadigan pul.',
    },
    holiday: {
      name: 'Dam olish kunidagi ish uchun toʻlov',
      explain: 'Dam olish kunida ishlangan soatlar uchun qoʻshimcha toʻlanadigan pul.',
    },
    'weekly-holiday': {
      name: 'Haftalik dam olish kuni toʻlovi',
      explain:
        'Haftada belgilangan kunlarning hammasida ishlasangiz, bir kunlik haq toʻlanadigan dam olish kuni uchun pul. Odatda haftasiga 15 soat va undan koʻp ishlaganda beriladi.',
    },
    meal: { name: 'Ovqat puli', explain: 'Ovqat uchun beriladigan pul. Maʼlum miqdorgacha soliq olinmaydi.' },
    bonus: {
      name: 'Mukofot puli',
      explain: 'Oylikdan tashqari belgilangan vaqtda qoʻshimcha beriladigan pul (bonus).',
    },
    severance: {
      name: 'Ishdan boʻshash nafaqasi',
      explain: 'Bir kompaniyada 1 yil va undan koʻp ishlab, ishdan ketganda olinadigan pul.',
    },
    'min-wage': {
      name: 'Eng kam ish haqi',
      explain: 'Qonunda belgilangan soatbay eng past ish haqi. Har yili oʻzgaradi.',
    },
    'ordinary-wage': {
      name: 'Oddiy ish haqi',
      explain:
        'Belgilangan ish uchun muntazam va bir xil toʻlanadigan ish haqi. Qoʻshimcha va tungi ish toʻlovlarini hisoblashda asos boʻladi.',
    },
    'total-pay': {
      name: 'Jami hisoblangan maosh',
      explain: 'Ushlab qolishdan oldin shu oyda olinadigan barcha pullar yigʻindisi.',
    },
    deduction: {
      name: 'Ushlab qolish',
      explain: 'Oylikdan sugʻurta badallari, soliq va boshqalarni oldindan ayirib qolish.',
    },
    'net-pay': {
      name: 'Qoʻlga tegadigan maosh',
      explain: 'Ushlab qolingandan keyin hisobingizga haqiqatda tushadigan pul.',
    },
    payslip: {
      name: 'Maosh varaqasi',
      explain: 'Shu oydagi maosh va ushlab qolingan summalar yozilgan qogʻoz yoki fayl.',
    },
    contract: {
      name: 'Mehnat shartnomasi',
      explain:
        'Maosh, ish vaqti, dam olish kunlari kabi ish shartlari yozilgan shartnoma. Bir nusxasi ishchiga beriladi.',
    },
    taxable: { name: 'Soliqqa tortiladigan', explain: 'Soliq olinadigan pul.' },
    'non-taxable': {
      name: 'Soliqdan ozod',
      explain: 'Soliq olinmaydigan pul. Masalan: belgilangan miqdordagi ovqat puli.',
    },
    'four-ins': {
      name: '4 ta ijtimoiy sugʻurta',
      explain:
        'Milliy pensiya, tibbiy sugʻurta, bandlik sugʻurtasi va ishlab chiqarishdagi baxtsiz hodisalar sugʻurtasi — toʻrt xil ijtimoiy sugʻurta.',
    },
    pension: {
      name: 'Milliy pensiya',
      explain: 'Qarilik va boshqa holatlar uchun pensiya sugʻurtasi. Oylikdan maʼlum ulush toʻlanadi.',
    },
    health: {
      name: 'Tibbiy sugʻurta',
      explain:
        'Davolanish xarajatlarining bir qismini sugʻurta toʻlab beradigan tizim. Oylikdan maʼlum ulush toʻlanadi.',
    },
    ltc: {
      name: 'Uzoq muddatli parvarish sugʻurtasi',
      explain:
        'Qariganda yoki kasal boʻlib parvarish kerak boʻlganda yordam beradigan sugʻurta. Tibbiy sugʻurta badali bilan birga toʻlanadi.',
    },
    employment: {
      name: 'Bandlik sugʻurtasi',
      explain: 'Ishni yoʻqotganda va boshqa holatlar uchun sugʻurta. Oylikdan maʼlum ulush toʻlanadi.',
    },
    industrial: {
      name: 'Ishlab chiqarishdagi baxtsiz hodisalar sugʻurtasi',
      explain:
        'Ish paytida jarohatlansangiz yoki kasal boʻlsangiz, davolanish xarajatlari va boshqalarni toʻlaydigan sugʻurta. Badalini kompaniya toʻlaydi.',
    },
    'income-tax': {
      name: 'Daromad soligʻi',
      explain: 'Topgan pulingizdan olinadigan soliq. Oylikdan oldindan ushlab qolinadi.',
    },
    'local-tax': {
      name: 'Mahalliy daromad soligʻi',
      explain: 'Daromad soligʻiga qoʻshib olinadigan mahalliy soliq. Odatda daromad soligʻining 10 foizi.',
    },
    'year-end': {
      name: 'Yil yakunidagi soliq hisob-kitobi',
      explain:
        '1 yil davomida toʻlangan daromad soligʻi keyingi yil boshida qayta hisoblanadi: ortiqcha toʻlangan boʻlsa qaytariladi, kam toʻlangan boʻlsa qoʻshimcha toʻlanadi.',
    },
    'arc-reg': {
      name: 'Chet ellikni roʻyxatga olish',
      explain: '90 kundan ortiq qoladigan chet elliklarning immigratsiya idorasida roʻyxatdan oʻtishi.',
    },
    'arc-card': {
      name: 'Chet ellik roʻyxat kartasi',
      explain: 'Roʻyxatdan oʻtgach beriladigan shaxsiy guvohnoma. Odatda 3–4 hafta vaqt oladi.',
    },
    'arc-no': {
      name: 'Chet ellik roʻyxat raqami',
      explain:
        'Chet ellik roʻyxat kartasida yozilgan 13 xonali raqam. Bank, shifoxona va telefon ochishda kerak boʻladi.',
    },
    residence: { name: 'Yashash joyi', explain: 'Koreyada haqiqatda yashayotgan joyingiz manzili.' },
    'stay-status': {
      name: 'Yashash maqomi',
      explain: 'Koreyada qolish maqsadiga qarab belgilanadigan maqom (viza turi).',
    },
    'stay-ext': {
      name: 'Yashash muddatini uzaytirish',
      explain: 'Ruxsat berilgan yashash muddatini uzaytirish uchun ariza.',
    },
    'workplace-change': {
      name: 'Ish joyini almashtirish',
      explain: 'Ishlaydigan kompaniyani oʻzgartirish. Buning shartlari va tartibi belgilangan.',
    },
    immigration: {
      name: 'Immigratsiya idorasi',
      explain: 'Chet elliklarni roʻyxatga olish va yashash masalalari bilan shugʻullanadigan davlat idorasi.',
    },
    hikorea: {
      name: 'HiKorea (immigratsiya sayti)',
      explain: 'Immigratsiya idorasiga tashrifni band qilish va ariza berish uchun davlat sayti.',
    },
    'biz-no': {
      name: 'Tadbirkorlik roʻyxat raqami',
      explain: 'Har bir kompaniyaning 10 xonali raqami. Arizadagi ish joyi katagiga yoziladi.',
    },
    'employment-cert': {
      name: 'Ish joyidan maʼlumotnoma',
      explain: 'Siz shu kompaniyada ishlayotganingizni kompaniya tasdiqlaydigan hujjat.',
    },
    receipt: {
      name: 'Qabul tilxati',
      explain: 'Ariza topshirganingizni tasdiqlaydigan qogʻoz. Karta tayyor boʻlguncha yaxshi saqlang.',
    },
    account: { name: 'Bank hisobi (daftarcha)', explain: 'Bank hisobi. Maosh olish uchun kerak.' },
    'check-card': { name: 'Debet karta', explain: 'Hisobingizdagi pul miqdorida darhol ishlatiladigan karta.' },
  },
  termCategories: { pay: 'Maosh', insurance: 'Sugʻurta · Soliq', admin: 'Maʼmuriy ishlar' },
  contacts: {
    police: { name: 'Politsiya', when: 'Jinoyatdan jabrlanganda yoki xavf ostida qolganda' },
    fire: {
      name: 'Yongʻin xizmati · Tez yordam',
      when: 'Yongʻin chiqqanda, qattiq jarohatlanganda yoki toʻsatdan kasal boʻlganda',
    },
    immigration: {
      name: 'Chet elliklar uchun umumiy maʼlumot markazi',
      when: 'Yashash, viza, chet ellik sifatida roʻyxatdan oʻtish haqida soʻramoqchi boʻlganda (koʻp tillarda maslahat)',
    },
    labor: {
      name: 'Bandlik va mehnat vazirligi maslahat markazi',
      when: 'Maosh, ish vaqti, ishdan boʻshash nafaqasi kabi ish masalalarida savol boʻlganda',
    },
    migrant: {
      name: 'Chet ellik ishchilar maslahat markazi',
      when: 'Chet ellik ishchi sifatida ish yoki hayot haqida maslahat olmoqchi boʻlganda (koʻp tillarda maslahat)',
    },
    legal: { name: 'Koreya yuridik yordam korporatsiyasi', when: 'Yuridik maslahat kerak boʻlganda' },
    health: {
      name: 'Milliy tibbiy sugʻurta xizmati',
      when: 'Tibbiy sugʻurtaga aʼzolik yoki badallar haqida soʻramoqchi boʻlganda',
    },
    pension: { name: 'Milliy pensiya xizmati', when: 'Milliy pensiya haqida soʻramoqchi boʻlganda' },
    disease: {
      name: 'Kasalliklarni nazorat qilish agentligi aloqa markazi',
      when: 'Yuqumli kasalliklar yoki emlash haqida soʻramoqchi boʻlganda',
    },
  },
  payroll: {
    earnings: {
      기본급: 'Asosiy maosh',
      연장근로수당: 'Qoʻshimcha ish vaqti uchun toʻlov',
      식대: 'Ovqat puli',
      '연장·야간·휴일 수당': 'Qoʻshimcha, tungi va dam olish kunidagi ish uchun toʻlov',
      '기타 과세 수당': 'Boshqa toʻlovlar (soliqqa tortiladigan)',
      '비과세 수당 (식대 등)': 'Soliqdan ozod toʻlovlar (ovqat puli va h.k.)',
    },
    deductions: {
      nationalPension: 'Milliy pensiya',
      healthInsurance: 'Tibbiy sugʻurta',
      longTermCare: 'Uzoq muddatli parvarish sugʻurtasi',
      employmentInsurance: 'Bandlik sugʻurtasi',
      incomeTax: 'Daromad soligʻi',
      localIncomeTax: 'Mahalliy daromad soligʻi',
    },
  },
};

export const uz: LangPack = { ui, content };
