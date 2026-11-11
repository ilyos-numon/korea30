import type { Lang } from '../i18n/types';

export interface LegalBadgeStrings {
  label: string;
  hint: string;
}

// 배지 문구 7개 세트. 판단하지 않는 톤 — 공식 대조 전이니 확인을 권한다.
export const LEGAL_BADGE_STRINGS: Readonly<Record<'ko' | Lang, LegalBadgeStrings>> = {
  ko: { label: '공식 대조 전', hint: '법정 수치를 아직 공식 출처와 대조하지 않았어요. 1350·1345에 확인해 보세요.' },
  zh: { label: '尚未与官方核对', hint: '法定数值尚未与官方来源核对。请向1350或1345确认。' },
  vi: { label: 'Chưa đối chiếu chính thức', hint: 'Các con số theo luật chưa được đối chiếu với nguồn chính thức. Hãy hỏi lại 1350 hoặc 1345.' },
  en: { label: 'Not yet checked officially', hint: 'Legal figures have not been checked against official sources yet. Please confirm with 1350 or 1345.' },
  th: { label: 'ยังไม่ได้ตรวจสอบกับแหล่งทางการ', hint: 'ตัวเลขตามกฎหมายยังไม่ได้ตรวจสอบกับแหล่งทางการ โปรดสอบถาม 1350 หรือ 1345' },
  uz: { label: 'Rasmiy manba bilan tekshirilmagan', hint: "Qonuniy raqamlar hali rasmiy manba bilan solishtirilmagan. 1350 yoki 1345 ga murojaat qilib tekshiring." },
  ru: { label: 'Ещё не сверено с официальным источником', hint: 'Законные значения ещё не сверены с официальными источниками. Уточните по 1350 или 1345.' },
};
