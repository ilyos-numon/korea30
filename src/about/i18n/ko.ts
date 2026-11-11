import type { AboutStrings } from './types';

export const ko: AboutStrings = {
  linkPrivacy: '개인정보처리방침',
  linkTerms: '이용 안내',
  privacyTitle: '개인정보처리방침',
  privacyIntro: 'Korea30은 개인정보를 모으지 않아요. 입력한 기록은 이 기기 밖으로 나가지 않아요.',
  privacyNoCollectTitle: '모으지 않는 것',
  privacyNoCollectBody: '서버, 로그인·계정, 분석·광고 도구가 없어요. 이름·여권 정보·근무 기록·사진을 어디에도 보내지 않아요.',
  privacyStorageTitle: '이 기기에 저장되는 것',
  privacyStorageBody:
    '퀘스트 진행, 근무 기록, 체류 기한, 언어 설정은 이 브라우저의 기기 저장소(IndexedDB, localStorage)에만 저장돼요. 브라우저 설정에서 이 사이트 데이터를 지우면 모두 사라져요.',
  privacyPhotoTitle: '사진과 여권',
  privacyPhotoBody:
    '근무 사진은 위치정보 같은 사진 정보를 지우고 이 기기에만 저장해요. 여권 사진은 이 기기 안에서 글자만 읽고 저장하지 않아요.',
  privacyBackupTitle: '백업 파일',
  privacyBackupBody: '백업 파일은 직접 내려받을 때만 만들어져요. 암호화하지 않으니 믿을 수 있는 곳에만 두세요.',
  privacyHostingTitle: '앱을 전달하는 서비스',
  privacyHostingBody:
    '앱 파일을 전달하는 호스팅 서비스는 접속 때 일반적인 접속 기록(IP 주소, 시각 등)을 남길 수 있어요. Korea30은 이 기록을 받지도 쓰지도 않아요.',
  privacyUpdated: (date) => `시행일: ${date}`,
  termsTitle: '이용 안내',
  termsIntro: 'Korea30은 한국 생활 첫 한 달의 순서와 표현을 돕는 안내 앱이에요.',
  termsNotAdviceTitle: '법률·비자 판단이 아니에요',
  termsNotAdviceBody:
    '앱의 내용은 일반 안내예요. 법률·비자·노동 문제의 판단은 외국인종합안내센터(1345)나 고용노동부 상담센터(1350) 같은 공식 기관에 확인하세요.',
  termsAccuracyTitle: '정보는 바뀔 수 있어요',
  termsAccuracyBody:
    '법정 수치와 연락처는 공식 출처와 대조하지만 제도는 바뀔 수 있어요. 번역과 발음 표기는 원어민 검수 전일 수 있어요.',
  termsDocsTitle: '만든 서류는 초안이에요',
  termsDocsBody: '앱이 만드는 PDF는 초안이거나 자체 양식이에요. 내기 전에 직접 확인하세요. 공식 서식이 우선해요.',
  contactTitle: '문의',
  contactBody: '앱 오류나 잘못된 내용은 아래로 알려 주세요.',
  contactPending: '문의 연락처는 준비 중이에요.',
};
