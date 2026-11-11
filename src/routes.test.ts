import { describe, expect, it } from 'vitest';
import { parseRoute, ROUTE_HASH, TABS, tabOf, type Route, type TabRoute } from './routes';

describe('parseRoute', () => {
  it.each<[string, Route]>([
    ['#/', 'quest'],
    ['#/form', 'form'],
    ['#/payslip', 'payslip'],
    ['#/cards', 'cards'],
    ['#/glossary', 'glossary'],
    ['#/help', 'help'],
    ['#/tools', 'tools'],
    ['#/work', 'work'],
    ['#/deadline', 'deadline'],
    ['#/passport', 'passport'],
    ['#/privacy', 'privacy'],
    ['#/terms', 'terms'],
  ])('%s → %s', (hash, route) => {
    expect(parseRoute(hash)).toBe(route);
  });

  it.each(['', '#', '#/does-not-exist', '#/form/', '#/payslip?x=1', '#/privacy/', '#/terms/'])('%s → quest', (hash) => {
    expect(parseRoute(hash)).toBe('quest');
  });

  it('round-trips every ROUTE_HASH value', () => {
    for (const [route, hash] of Object.entries(ROUTE_HASH)) {
      expect(parseRoute(hash)).toBe(route);
    }
  });
});

describe('TABS', () => {
  it('has 6 tabs in fixed order', () => {
    expect(TABS.map((t) => t.route)).toEqual(['quest', 'form', 'payslip', 'cards', 'glossary', 'tools']);
  });

  it('uses fixed testIds and labels', () => {
    expect(TABS.map((t) => t.testId)).toEqual([
      'nav-quest',
      'nav-form',
      'nav-payslip',
      'nav-cards',
      'nav-glossary',
      'nav-tools',
    ]);
    expect(TABS.map((t) => t.vi)).toEqual(['Nhiệm vụ', 'Giấy tờ', 'Lương', 'Thẻ nói', 'Từ điển', 'Hồ sơ']);
    expect(TABS.map((t) => t.ko)).toEqual(['퀘스트', '서류', '급여', '카드', '사전', '내 기록']);
    expect(TABS.map((t) => t.icon)).toEqual(['✅', '📝', '💰', '🗣️', '📖', '🗂️']);
  });

  it('does not include help', () => {
    expect(TABS.some((t) => (t.route as Route) === 'help')).toBe(false);
  });
});

describe('tabOf', () => {
  it.each<[Route, TabRoute | null]>([
    ['quest', 'quest'],
    ['form', 'form'],
    ['payslip', 'payslip'],
    ['cards', 'cards'],
    ['glossary', 'glossary'],
    ['tools', 'tools'],
    ['work', 'tools'],
    ['deadline', 'tools'],
    ['passport', 'tools'],
    ['privacy', 'tools'],
    ['terms', 'tools'],
    ['help', null],
  ])('%s → %s', (route, tab) => {
    expect(tabOf(route)).toBe(tab);
  });
});
