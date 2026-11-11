/** 개인정보처리방침·이용 안내 문자열. 값은 string 또는 함수만 (PLAN §4.3). */
export interface AboutStrings {
  linkPrivacy: string;
  linkTerms: string;
  privacyTitle: string;
  privacyIntro: string;
  privacyNoCollectTitle: string;
  privacyNoCollectBody: string;
  privacyStorageTitle: string;
  privacyStorageBody: string;
  privacyPhotoTitle: string;
  privacyPhotoBody: string;
  privacyBackupTitle: string;
  privacyBackupBody: string;
  privacyHostingTitle: string;
  privacyHostingBody: string;
  privacyUpdated: (date: string) => string;
  termsTitle: string;
  termsIntro: string;
  termsNotAdviceTitle: string;
  termsNotAdviceBody: string;
  termsAccuracyTitle: string;
  termsAccuracyBody: string;
  termsDocsTitle: string;
  termsDocsBody: string;
  contactTitle: string;
  contactBody: string;
  contactPending: string;
}
