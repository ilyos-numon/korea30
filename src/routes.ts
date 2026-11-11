export type Route = 'quest' | 'form' | 'payslip' | 'cards' | 'glossary' | 'help' | 'tools' | 'work' | 'deadline' | 'passport' | 'privacy' | 'terms';
export type TabRoute = 'quest' | 'form' | 'payslip' | 'cards' | 'glossary' | 'tools';

export const ROUTE_HASH: Readonly<Record<Route, string>> = {
  quest: '#/',
  form: '#/form',
  payslip: '#/payslip',
  cards: '#/cards',
  glossary: '#/glossary',
  help: '#/help',
  tools: '#/tools',
  work: '#/work',
  deadline: '#/deadline',
  passport: '#/passport',
  privacy: '#/privacy',
  terms: '#/terms',
};

/** 정확히 일치하는 해시만 인식. '', '#', '#/', 알 수 없는 값 → 'quest'. 쿼리·뒤 슬래시 허용 안 함. */
export function parseRoute(hash: string): Route {
  for (const route of Object.keys(ROUTE_HASH) as Route[]) {
    if (ROUTE_HASH[route] === hash) return route;
  }
  return 'quest';
}

export interface TabDef {
  route: TabRoute;
  icon: string;
  vi: string;
  ko: string;
  testId: string;
}

export const TABS: readonly TabDef[] = [
  { route: 'quest', icon: '✅', vi: 'Nhiệm vụ', ko: '퀘스트', testId: 'nav-quest' },
  { route: 'form', icon: '📝', vi: 'Giấy tờ', ko: '서류', testId: 'nav-form' },
  { route: 'payslip', icon: '💰', vi: 'Lương', ko: '급여', testId: 'nav-payslip' },
  { route: 'cards', icon: '🗣️', vi: 'Thẻ nói', ko: '카드', testId: 'nav-cards' },
  { route: 'glossary', icon: '📖', vi: 'Từ điển', ko: '사전', testId: 'nav-glossary' },
  { route: 'tools', icon: '🗂️', vi: 'Hồ sơ', ko: '내 기록', testId: 'nav-tools' },
];

/** work/deadline/passport/privacy/terms → 'tools', help → null, 나머지 → 자기 자신 */
export function tabOf(route: Route): TabRoute | null {
  switch (route) {
    case 'work':
    case 'deadline':
    case 'passport':
    case 'privacy':
    case 'terms':
      return 'tools';
    case 'help':
      return null;
    default:
      return route;
  }
}
