import type { ContentPack, LangPack, UiStrings } from '../types';
import { QUEST_TEXT_11_20 } from './quests11to20';
import { QUEST_TEXT_21_30 } from './quests21to30';

// 한국어 원문을 1차 원본으로 한 평이한 영어(Plain English). 발음은 개정 로마자 + 음절 하이픈.
const ui: UiStrings = {
  appHelp: '☎ Help',
  navAria: 'Navigation',
  tabs: { quest: 'Quests', form: 'Forms', payslip: 'Payslip', cards: 'Phrases', glossary: 'Dictionary', tools: 'My files' },
  listen: 'Listen',
  listenAria: 'Listen in Korean',
  listenMine: 'Listen in English',
  listenMineAria: 'Listen to the English translation',
  bigCardAria: 'Big text card',
  bigCardShow: 'Show this screen to the staff',
  close: 'Close',
  save: 'Save',
  langSwitchAria: 'Change language',
  langSheetTitle: 'Choose language',
  questTitle: 'Quests',
  questProgress: (day, total) => `Day ${day} / ${total}`,
  questDotsAria: (done, total) => `Progress ${done}/${total}`,
  questDplusNote: 'since you arrived in Korea',
  questArrivalOpen: '📅 Enter your arrival date in Korea',
  questArrivalEdit: 'Edit arrival date',
  questArrivalAria: 'Arrival date in Korea',
  arrivalError: { invalid: 'This date is not valid', future: 'The arrival date cannot be in the future' },
  questLockedHint: (day) => `🔒 Please finish Day ${day} first.`,
  questToday: 'Today',
  questWhere: '📍 Where',
  questBring: '🎒 What to bring',
  questSay: '💬 What to say',
  showBig: '🔍 Show big text',
  questComplete: 'Done',
  questAllDone: (total) => `🎉 You finished all ${total} days!`,
  questDay: (day) => `Day ${day}`,
  questReset: 'Start over',
  formTitle: 'Foreigner registration form',
  formSampleBadge: 'Sample',
  formSampleNote: 'This is a practice sample. Follow the real form you get at the office.',
  formExample: 'Example',
  askOfficer: '🙋 Ask the officer in charge',
  formPrevAria: 'Previous box',
  formNextAria: 'Next box',
  formSubmit: 'Submitted',
  formSubmittedMsg:
    'You have submitted it! The registration card usually comes after 3–4 weeks. For questions about your stay or visa, ask the officer in charge.',
  formQuestDone: (day) => `Day ${day} done`,
  formBackQuest: 'Back to quests',
  payslipTitle: 'Payslip',
  payslipSampleA: 'Sample A',
  payslipSampleB: 'Sample B',
  payslipManual: 'Enter myself',
  payslipDiff: 'Different from the calculation',
  payslipTaxableTotal: 'Taxable total',
  payslipAskLabel: 'When you ask the company',
  payslipDisclaimer:
    'This result is for reference only. It is not a legal assessment. It is based on the rates published for 2026.',
  manualPrivacy: '🔒 The numbers you enter are calculated only on this phone. They are not saved or sent anywhere.',
  manualEarnings: 'Money you get',
  manualDeductions: 'Money taken out',
  manualLtcHint: 'If your payslip does not show it separately, enter 0.',
  manualCheck: 'Check',
  manualError: {
    required: 'Please enter a number (enter 0 if there is none)',
    notNumber: 'Numbers only',
    tooLarge: 'The number is too large',
  },
  cardsTitle: 'Korean phrase cards',
  cardsHint: 'Tap a card to show big text to the staff',
  glossaryTitle: 'Pay & paperwork dictionary',
  glossaryPlaceholder: 'Search: insurance, pay, 보험…',
  glossarySearchAria: 'Search words',
  glossaryCount: (n) => `${n} words`,
  glossaryEmpty: 'Nothing found',
  glossaryEmptyTry: 'Try another word, for example "insurance".',
  askExpert: '🙋 Ask an expert',
  helpTitle: 'Help',
  helpExpertNote:
    'Korea30 does not give decisions on visas or the law. For those questions, please ask the offices below.',
  helpEmergency: '🚨 Emergency',
  helpLines: '☎ Help lines',
  helpNativeBadge: 'English available',
  helpRecheck: 'Number to check again',
};

const content: ContentPack = {
  quests: {
    1: {
      title: 'Get a phone SIM card',
      where: 'A mobile carrier roaming center at the airport, or the nearest phone shop',
      bring: ['Passport', 'A card or cash to pay'],
      sayMeaning: 'I want to open a prepaid SIM. Here is my passport.',
      sayPron: 'seon-bul yu-sim gae-tong-ha-go si-peo-yo. yeo-gwon yeo-gi i-sseo-yo.',
      tip: 'Before foreigner registration, you can often use only a prepaid plan.',
    },
    2: {
      title: 'Get a transit card',
      where: 'A convenience store, or a transit card top-up machine at a subway station',
      bring: ['Cash (top-ups are mostly cash)'],
      sayMeaning: 'One transit card, please. Please top it up with 10,000 won.',
      sayPron: 'gyo-tong-ka-deu ha-na ju-se-yo. man won chung-jeon-hae ju-se-yo.',
      tip: 'If you also tap your card when you get off the bus or subway, you get a transfer discount.',
    },
    3: {
      title: 'Apply for foreigner registration',
      where: 'The immigration office for your area (book a visit on HiKorea)',
      bring: ['Passport', '1 photo', 'Your dormitory address'],
      sayMeaning: 'I came to do my foreigner registration.',
      sayPron: 'oe-gu-gin-deung-nok ha-reo wa-sseo-yo.',
      tip: 'The registration card usually comes after 3–4 weeks. For decisions about your stay or visa, ask the officer in charge.',
      linkLabel: '📝 See help for filling in the form',
    },
    4: {
      title: 'Open a bank account',
      where: 'A bank branch near your company or dormitory (some branches have a counter just for foreigners)',
      bring: ['Passport', 'Employment contract or proof of employment', 'Korean mobile phone'],
      sayMeaning: 'I want to open an account to get my salary.',
      sayPron: 'wol-geup ba-deul tong-jang-eul man-deul-go si-peo-yo.',
      tip: 'Each bank needs different papers. Check with the person in charge at your company before you go. Do not tell anyone your PIN.',
    },
    5: {
      title: 'Check your health insurance',
      where: 'The person in charge at your company, or a National Health Insurance Service branch',
      bring: ['Passport', 'Foreigner registration receipt (if you have one)'],
      sayMeaning: 'I want to check if I am signed up for health insurance.',
      sayPron: 'je-ga geon-gang-bo-heo-me ga-ip-dwaen-neun-ji hwa-gin-ha-go si-peo-yo.',
      tip: 'If you work for a company, you usually join through your workplace. If you have questions, you can ask the National Health Insurance Service (1577-1000).',
    },
    6: {
      title: 'Find a nearby clinic and pharmacy',
      where: "A local clinic and pharmacy near your dormitory (search '내과', '약국' in a map app)",
      bring: ['Passport or foreigner registration card', 'Health insurance details (if you have them)'],
      sayMeaning: 'This is my first visit. I want to see a doctor.',
      sayPron: 'cheo-eum wa-sseo-yo. jil-lyo bat-go si-peo-yo.',
      tip: 'If you suddenly get very sick at night or on a holiday, call 119.',
    },
    7: {
      title: 'Learn how to throw away trash',
      where: 'A convenience store or supermarket near your dormitory or home (buy official trash bags)',
      bring: ['Cash or card'],
      sayMeaning: 'One 20-liter official trash bag, please.',
      sayPron: 'jong-nyang-je bong-tu i-sip-ri-teo ju-se-yo.',
      tip: 'Put general trash in official trash bags. Throw away food waste and recycling separately. The days and places are different in each neighborhood.',
    },
    8: {
      title: 'Learn how to send money home',
      where: 'A bank counter, or a bank or money transfer app',
      bring: ['Passport', 'Bankbook', 'Name and account details of the person receiving it'],
      sayMeaning: 'I want to send money home. How much is the fee?',
      sayPron: 'go-hyang-eu-ro song-geum-ha-go si-peo-yo. su-su-ryo-ga eol-ma-ye-yo?',
      tip: 'Fees and exchange rates are different at each place. Check the details of the person receiving it twice.',
    },
    9: {
      title: 'Read your employment contract again',
      where: 'Your dormitory or home (the contract you got from your company)',
      bring: ['Employment contract'],
      sayMeaning: 'Can I get one copy of my employment contract?',
      sayPron: 'geul-lo-gye-yak-seo sa-bo-neul han bu ba-deul su i-sseul-kka-yo?',
      tip: 'Check how your pay, working hours and days off are written. If you have questions, you can ask the Ministry of Employment and Labor (1350).',
      linkLabel: '📖 Look up hard words',
    },
    10: {
      title: 'Check your first payslip',
      where: 'Your company (you get the payslip on payday)',
      bring: ['Payslip', 'Employment contract'],
      sayMeaning: "Can I get this month's payslip?",
      sayPron: 'i-beon dal geu-byeo-myeong-se-seo-reul ba-deul su i-sseul-kka-yo?',
      tip: 'If the deductions are different from the calculation, check with your company. If you need a decision, ask an expert.',
      linkLabel: '💰 Check your payslip',
    },
    ...QUEST_TEXT_11_20.en,
    ...QUEST_TEXT_21_30.en,
  },
  form: {
    'apply-type': {
      label: 'Application type',
      guide:
        'Put a ✓ in the "외국인 등록" (foreigner registration) box. Ask the officer in charge if you need to mark any other box.',
    },
    surname: { label: 'Surname', guide: 'Write it in English capital letters, exactly as in your passport.' },
    'given-names': {
      label: 'Given names',
      guide: 'Write your name exactly as in your passport, with the same spaces.',
    },
    birth: {
      label: 'Date of birth',
      guide: 'Write it in year-month-day order. Be careful not to mix it up with month/day/year order.',
    },
    sex: { label: 'Sex', guide: 'Men put a ✓ on 남(M). Women put a ✓ on 여(F).' },
    nationality: { label: 'Nationality', guide: 'Write the nationality shown in your passport, in English.' },
    'passport-no': {
      label: 'Passport number',
      guide: 'Copy the number at the top right of the passport page with your photo.',
    },
    'passport-dates': {
      label: 'Passport issue date and expiry date',
      guide: 'Write the two dates from your passport in year-month-day order.',
    },
    'address-kr': {
      label: 'Address in Korea (place of stay)',
      guide:
        'Write the address of the dormitory or home where you live now, including the building and room number. If you do not know it, copy the text message from the person in charge at your company.',
    },
    phone: { label: 'Mobile phone', guide: 'Write the Korean phone number you opened on Day 1.' },
    'address-home': { label: 'Home country address', guide: 'Write your home address in your home country.' },
    workplace: {
      label: 'Workplace and business registration number',
      guide:
        'Write the company name and its business registration number (10 digits). It is in your employment contract, or ask the person in charge at your company.',
    },
    sign: {
      label: 'Application date and signature',
      guide: "Write today's date and sign the same way as the signature in your passport.",
    },
  },
  phrases: {
    b1: {
      meaning: 'I do not speak Korean well. Please speak slowly.',
      pron: 'han-gu-geo-reul jal mo-tae-yo. cheon-cheon-hi mal-hae ju-se-yo.',
    },
    b2: { meaning: 'Please say it one more time.', pron: 'da-si han beon mal-hae ju-se-yo.' },
    b3: { meaning: 'Please write it here.', pron: 'yeo-gi-e sseo ju-se-yo.' },
    b4: { meaning: 'Is an English interpreter available?', pron: 'yeong-eo tong-yeo-gi ga-neung-han-ga-yo?' },
    b5: { meaning: 'Where do I hand in this paper?', pron: 'i seo-ryu-neun eo-di-e nae-yo?' },
    b6: { meaning: 'What else do I need to bring?', pron: 'mu-eo-seul deo ga-jeo-wa-ya hae-yo?' },
    b7: { meaning: 'What do I write in this box?', pron: 'i ka-ne-neun mu-eo-seul sseo-ya hae-yo?' },
    b8: { meaning: 'When should I come back?', pron: 'eon-je da-si o-myeon dwae-yo?' },
    b9: { meaning: 'How much is this?', pron: 'i-geo eol-ma-ye-yo?' },
    b10: { meaning: 'Where is the restroom?', pron: 'hwa-jang-si-ri eo-di-ye-yo?' },
    b11: { meaning: 'It hurts here.', pron: 'yeo-gi-ga a-pa-yo.' },
    b12: { meaning: 'Thank you for your help.', pron: 'do-wa-ju-syeo-seo gam-sa-ham-ni-da.' },
  },
  phraseCategories: { counter: 'At the counter', daily: 'Daily life', quest: 'From quests' },
  terms: {
    'base-pay': { name: 'Base pay', explain: 'The fixed monthly pay, not counting allowances.' },
    overtime: { name: 'Overtime pay', explain: 'Money paid for hours worked beyond the set working hours.' },
    night: { name: 'Night work pay', explain: 'Extra money paid for hours worked between 10 p.m. and 6 a.m.' },
    holiday: { name: 'Holiday work pay', explain: 'Extra money paid for hours worked on a day off.' },
    'weekly-holiday': {
      name: 'Weekly paid day off',
      explain:
        'If you work all the set days in a week, you get paid for one day off. It usually applies when you work 15 hours or more a week.',
    },
    meal: {
      name: 'Meal allowance',
      explain: 'Money given for meals. Up to a certain limit, it is not taxed.',
    },
    bonus: { name: 'Bonus', explain: 'Extra money paid at set times, on top of the monthly pay.' },
    severance: {
      name: 'Severance pay',
      explain: 'Money you get when you leave after working at the same company for 1 year or more.',
    },
    'min-wage': {
      name: 'Minimum wage',
      explain: 'The lowest hourly pay set by law. It changes every year.',
    },
    'ordinary-wage': {
      name: 'Ordinary wage',
      explain:
        'Pay given regularly and in the same amount for set work. It is the base for calculating overtime and night pay.',
    },
    'total-pay': { name: 'Total pay', explain: 'All the money for this month added together, before deductions.' },
    deduction: {
      name: 'Deduction',
      explain: 'Money such as insurance and tax taken out of your monthly pay in advance.',
    },
    'net-pay': { name: 'Take-home pay', explain: 'The money that actually goes into your bank account after deductions.' },
    payslip: { name: 'Payslip', explain: "A paper or file that shows this month's pay and deductions." },
    contract: {
      name: 'Employment contract',
      explain:
        'A contract that lists working conditions such as pay, working hours and days off. The worker keeps one copy.',
    },
    taxable: { name: 'Taxable', explain: 'Money that is taxed.' },
    'non-taxable': {
      name: 'Non-taxable',
      explain: 'Money that is not taxed. Example: a meal allowance within the limit.',
    },
    'four-ins': {
      name: '4 social insurances',
      explain: 'Four social insurances: national pension, health, employment and industrial accident insurance.',
    },
    pension: {
      name: 'National pension',
      explain: 'Pension insurance for old age and other times. A set share of your monthly pay goes to it.',
    },
    health: {
      name: 'Health insurance',
      explain: 'Insurance that pays part of your medical bills. A set share of your monthly pay goes to it.',
    },
    ltc: {
      name: 'Long-term care insurance',
      explain: 'Insurance for when you need care because of old age or illness. You pay it together with health insurance.',
    },
    employment: {
      name: 'Employment insurance',
      explain: 'Insurance for times such as losing your job. A set share of your monthly pay goes to it.',
    },
    industrial: {
      name: 'Industrial accident insurance',
      explain:
        'Insurance that pays for treatment if you get hurt or sick from work. The company pays for this insurance.',
    },
    'income-tax': { name: 'Income tax', explain: 'Tax on the money you earn. It is taken out of your monthly pay in advance.' },
    'local-tax': {
      name: 'Local income tax',
      explain: 'A local tax added to income tax. It is usually 10% of the income tax.',
    },
    'year-end': {
      name: 'Year-end tax settlement',
      explain:
        'Early the next year, the income tax you paid for 1 year is calculated again. If you paid too much, you get it back. If you paid too little, you pay more.',
    },
    'arc-reg': {
      name: 'Foreigner registration',
      explain: 'Foreigners staying more than 90 days register at the immigration office.',
    },
    'arc-card': {
      name: 'Foreigner registration card',
      explain: 'The ID card you get after foreigner registration. It usually takes 3–4 weeks.',
    },
    'arc-no': {
      name: 'Foreigner registration number',
      explain: 'The 13-digit number on your registration card. You use it at banks, hospitals and phone shops.',
    },
    residence: { name: 'Place of stay', explain: 'The address where you actually live in Korea.' },
    'stay-status': {
      name: 'Status of stay',
      explain: 'Your status set by the purpose of your stay in Korea (the type of visa).',
    },
    'stay-ext': { name: 'Extension of stay', explain: 'An application to make your allowed period of stay longer.' },
    'workplace-change': {
      name: 'Change of workplace',
      explain: 'Moving to a different company to work. There are set conditions and steps.',
    },
    immigration: {
      name: 'Immigration office',
      explain: 'A government office that handles foreigner registration and stay matters.',
    },
    hikorea: {
      name: 'HiKorea (immigration website)',
      explain: 'A government website to book visits to the immigration office and send applications.',
    },
    'biz-no': {
      name: 'Business registration number',
      explain: 'A 10-digit number every company has. Write it in the workplace box on the form.',
    },
    'employment-cert': {
      name: 'Proof of employment',
      explain: 'A paper from your company that confirms you work there.',
    },
    receipt: {
      name: 'Application receipt',
      explain: 'A paper that confirms you handed in your application. Keep it safe until you get your card.',
    },
    account: { name: 'Bank account', explain: 'Your account at a bank. You need it to get your pay.' },
    'check-card': { name: 'Debit card', explain: 'A card that uses the money in your account right away.' },
  },
  termCategories: { pay: 'Pay', insurance: 'Insurance · Tax', admin: 'Paperwork' },
  contacts: {
    police: { name: 'Police', when: 'When you are a victim of a crime or in danger' },
    fire: { name: 'Fire · Ambulance', when: 'When there is a fire, or when you are badly hurt or suddenly sick' },
    immigration: {
      name: 'Immigration Contact Center for foreigners',
      when: 'When you have questions about your stay, visa or foreigner registration (help in many languages)',
    },
    labor: {
      name: 'Ministry of Employment and Labor call center',
      when: 'When you have questions about work, such as pay, working hours or severance pay',
    },
    migrant: {
      name: 'Counseling center for foreign workers',
      when: 'When foreign workers want to talk about work or daily life problems (help in many languages)',
    },
    legal: { name: 'Korea Legal Aid Corporation', when: 'When you need legal advice' },
    health: {
      name: 'National Health Insurance Service',
      when: 'When you have questions about joining health insurance or its fees',
    },
    pension: { name: 'National Pension Service', when: 'When you have questions about the national pension' },
    disease: {
      name: 'Disease control agency call center',
      when: 'When you have questions about infectious diseases or vaccinations',
    },
  },
  payroll: {
    earnings: {
      기본급: 'Base pay',
      연장근로수당: 'Overtime pay',
      식대: 'Meal allowance',
      '연장·야간·휴일 수당': 'Overtime, night and holiday pay',
      '기타 과세 수당': 'Other allowances (taxable)',
      '비과세 수당 (식대 등)': 'Non-taxable pay (meals, etc.)',
    },
    deductions: {
      nationalPension: 'National pension',
      healthInsurance: 'Health insurance',
      longTermCare: 'Long-term care insurance',
      employmentInsurance: 'Employment insurance',
      incomeTax: 'Income tax',
      localIncomeTax: 'Local income tax',
    },
  },
};

export const en: LangPack = { ui, content };
