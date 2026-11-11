import type { ContactId } from './ids';
import type { Lang } from './types';

export interface LocalVariant {
  interpreterKo: string; // phrase b4 의 한국어
  remitKo: string; // quest day 8 say.ko
  immigrationSayKo: string; // contact immigration sayKo
  formExample: Readonly<Record<'surname' | 'given-names' | 'nationality' | 'address-home', string>>;
  formGuideKo: Readonly<Record<'birth' | 'nationality' | 'address-home', string>>;
  nativeContacts: readonly ContactId[]; // 모국어 배지 표시 연락처
}

// 이름은 가상 자리표시. 실제 인물 아님.
export const LOCAL: Readonly<Record<Lang, LocalVariant>> = {
  zh: {
    interpreterKo: '중국어 통역이 가능한가요?',
    remitKo: '중국으로 송금하고 싶어요. 수수료가 얼마예요?',
    immigrationSayKo: '중국어 상담 부탁드립니다.',
    formExample: { surname: 'WANG', 'given-names': 'XIAOMING', nationality: 'CHINA', 'address-home': 'Qingdao, China' },
    formGuideKo: {
      birth: '연도-월-일 순서로 써요. 중국과 같은 순서예요.',
      nationality: '중국이라고 영문으로 써요.',
      'address-home': '중국 집 주소를 써요.',
    },
    nativeContacts: ['immigration', 'migrant'],
  },
  vi: {
    interpreterKo: '베트남어 통역이 가능한가요?',
    remitKo: '베트남으로 송금하고 싶어요. 수수료가 얼마예요?',
    immigrationSayKo: '베트남어 상담 부탁드립니다.',
    formExample: { surname: 'NGUYEN', 'given-names': 'VAN A', nationality: 'VIETNAM', 'address-home': 'Ha Noi, Viet Nam' },
    formGuideKo: {
      birth: '연도-월-일 순서로 써요. 베트남(일/월/연도)과 순서가 달라요.',
      nationality: '베트남이라고 영문으로 써요.',
      'address-home': '베트남 집 주소를 써요.',
    },
    nativeContacts: ['immigration', 'migrant'],
  },
  en: {
    interpreterKo: '영어 통역이 가능한가요?',
    remitKo: '고향으로 송금하고 싶어요. 수수료가 얼마예요?',
    immigrationSayKo: '영어 상담 부탁드립니다.',
    formExample: {
      surname: 'SANTOS',
      'given-names': 'MARIA',
      nationality: 'PHILIPPINES',
      'address-home': 'Manila, Philippines',
    },
    formGuideKo: {
      birth: '연도-월-일 순서로 써요. 월/일/연도 순서와 헷갈리지 않게 조심해요.',
      nationality: '여권에 적힌 국적을 영문으로 써요.',
      'address-home': '본국 집 주소를 써요.',
    },
    nativeContacts: ['immigration'],
  },
  th: {
    interpreterKo: '태국어 통역이 가능한가요?',
    remitKo: '태국으로 송금하고 싶어요. 수수료가 얼마예요?',
    immigrationSayKo: '태국어 상담 부탁드립니다.',
    formExample: {
      surname: 'JAIDEE',
      'given-names': 'SOMCHAI',
      nationality: 'THAILAND',
      'address-home': 'Bangkok, Thailand',
    },
    formGuideKo: {
      birth: '연도-월-일 순서로 써요. 태국(일/월/연도)과 순서가 달라요. 불기가 아니라 서기 연도로 써요.',
      nationality: '태국이라고 영문으로 써요.',
      'address-home': '태국 집 주소를 써요.',
    },
    nativeContacts: ['immigration', 'migrant'],
  },
  uz: {
    interpreterKo: '우즈베크어 통역이 가능한가요?',
    remitKo: '우즈베키스탄으로 송금하고 싶어요. 수수료가 얼마예요?',
    immigrationSayKo: '우즈베크어 상담 부탁드립니다.',
    formExample: {
      surname: 'KARIMOV',
      'given-names': 'AZIZ',
      nationality: 'UZBEKISTAN',
      'address-home': 'Tashkent, Uzbekistan',
    },
    formGuideKo: {
      birth: '연도-월-일 순서로 써요. 우즈베키스탄(일.월.연도)과 순서가 달라요.',
      nationality: '우즈베키스탄이라고 영문으로 써요.',
      'address-home': '우즈베키스탄 집 주소를 써요.',
    },
    nativeContacts: ['immigration', 'migrant'],
  },
  ru: {
    interpreterKo: '러시아어 통역이 가능한가요?',
    remitKo: '고향으로 송금하고 싶어요. 수수료가 얼마예요?',
    immigrationSayKo: '러시아어 상담 부탁드립니다.',
    formExample: {
      surname: 'IVANOV',
      'given-names': 'IVAN',
      nationality: 'RUSSIA',
      'address-home': 'Vladivostok, Russia',
    },
    formGuideKo: {
      birth: '연도-월-일 순서로 써요. 일.월.연도 순서와 달라요.',
      nationality: '여권에 적힌 국적을 영문으로 써요.',
      'address-home': '본국 집 주소를 써요.',
    },
    nativeContacts: ['immigration'],
  },
};
