/** 여권 스캔 화면 문자열. 값은 string 또는 함수만 (PLAN §4.3). */
export interface PassportStrings {
  title: string;
  intro: string;
  privacyTitle: string;
  privacyBody: string;
  scanHeading: string;
  choosePhoto: string;
  photoHint: string;
  reading: (percent: number) => string;
  readDone: string;
  ocrFailed: string;
  pasteHeading: string;
  pasteHint: string;
  parse: string;
  errEmpty: string;
  errNotTd3: string;
  errChecksum: string;
  errUnreadable: string;
  parsed: string;
  corrected: string;
  fieldsHeading: string;
  fieldsHint: string;
  fieldLabel: (fieldId: string) => string;
  extraHeading: string;
  extraAddressKr: string;
  extraPhone: string;
  extraAddressHome: string;
  extraWorkplace: string;
  extraPassportIssueDate: string;
  errRequired: string;
  errBadDate: string;
  errBadPhone: string;
  pdf: string;
  pdfMaking: string;
  pdfError: string;
  officialNotice: string;
  ask1345: string;
}
