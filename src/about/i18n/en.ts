import type { AboutStrings } from './types';

export const en: AboutStrings = {
  linkPrivacy: 'Privacy policy',
  linkTerms: 'About this app',
  privacyTitle: 'Privacy policy',
  privacyIntro: 'Korea30 does not collect personal data. What you enter never leaves this device.',
  privacyNoCollectTitle: 'What we do not collect',
  privacyNoCollectBody:
    'There is no server, no login or account, and no analytics or ad tools. Your name, passport details, work log and photos are never sent anywhere.',
  privacyStorageTitle: 'What is stored on this device',
  privacyStorageBody:
    'Quest progress, work log, stay deadlines and language setting are stored only in this browser’s device storage (IndexedDB, localStorage). If you clear this site’s data in your browser settings, all of it is deleted.',
  privacyPhotoTitle: 'Photos and passport',
  privacyPhotoBody:
    'Work photos are saved only on this device, after photo details such as location are removed. Passport photos are read for text on this device and are not saved.',
  privacyBackupTitle: 'Backup files',
  privacyBackupBody:
    'A backup file is created only when you download it yourself. It is not encrypted, so keep it only in a place you trust.',
  privacyHostingTitle: 'The service that delivers the app',
  privacyHostingBody:
    'The hosting service that delivers the app files may keep ordinary access records (IP address, time, etc.) when you connect. Korea30 does not receive or use these records.',
  privacyUpdated: (date) => `Effective date: ${date}`,
  termsTitle: 'About this app',
  termsIntro: 'Korea30 is a guide app that helps with the order of tasks and the words you need in your first month in Korea.',
  termsNotAdviceTitle: 'Not a legal or visa decision',
  termsNotAdviceBody:
    'What the app shows is general guidance. For decisions on legal, visa or work problems, check with official offices such as the Immigration Contact Center (1345) or the Ministry of Employment and Labor counseling center (1350).',
  termsAccuracyTitle: 'Information can change',
  termsAccuracyBody:
    'Legal figures and contacts are checked against official sources, but rules can change. Translations and pronunciation guides may not yet be reviewed by native speakers.',
  termsDocsTitle: 'Documents you make are drafts',
  termsDocsBody:
    'PDFs made by the app are drafts or the app’s own forms. Check them yourself before you submit. Official forms come first.',
  contactTitle: 'Contact',
  contactBody: 'Please tell us about app errors or wrong information below.',
  contactPending: 'Contact details are coming soon.',
};
