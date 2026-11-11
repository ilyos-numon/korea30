import type { JSX } from 'react';
import { useLang } from '../i18n/LangContext';
import { ROUTE_HASH, TABS, tabOf, type Route, type TabRoute } from '../routes';
import { Icon, type IconName } from './Icon';

const TAB_ICON: Readonly<Record<TabRoute, IconName>> = {
  quest: 'checkCircle',
  form: 'fileText',
  payslip: 'receipt',
  cards: 'message',
  glossary: 'book',
  tools: 'folder',
};

/** 하단 탭 6개. 라벨은 선택 언어 한 줄, 한국어는 접근성 이름에만 남긴다(글자 줄이기) */
export function TabBar(props: { current: Route }): JSX.Element {
  const { current } = props;
  const { ui } = useLang();
  return (
    <nav data-testid="tab-bar" className="tabbar" aria-label={ui.navAria}>
      {TABS.map(({ route, ko, testId }) => {
        const on = tabOf(current) === route;
        return (
          <a key={route} href={ROUTE_HASH[route]} data-testid={testId} aria-current={on ? 'page' : undefined} title={ko}>
            <span className="tabbar-icon" aria-hidden="true">
              <Icon name={TAB_ICON[route]} size={22} strokeWidth={on ? 2.1 : 1.8} />
            </span>
            <span className="tabbar-label">{ui.tabs[route]}</span>
          </a>
        );
      })}
    </nav>
  );
}
