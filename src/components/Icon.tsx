import type { JSX } from 'react';

/** 24×24 선 아이콘. 색은 currentColor, 선 굵기 1.8. 장식용이라 기본 aria-hidden. */
const PATHS = {
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  chevronLeft: <path d="M15 5.5L8.5 12l6.5 6.5" />,
  chevronRight: <path d="M9 5.5l6.5 6.5L9 18.5" />,
  chevronDown: <path d="M6 9l6 6 6-6" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.4 2.5 3.7 5.6 3.7 9s-1.3 6.5-3.7 9c-2.4-2.5-3.7-5.6-3.7-9S9.6 5.5 12 3z" />
    </>
  ),
  phone: (
    <path d="M6.6 3.5h2.7l1.6 4.1-2 1.3a11.3 11.3 0 0 0 6.2 6.2l1.3-2 4.1 1.6v2.7a2 2 0 0 1-2.1 2A16.6 16.6 0 0 1 4.6 5.6a2 2 0 0 1 2-2.1z" />
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.6 9.4a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.1-2.4 3.7" />
      <path d="M12 17.2h.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 7.8h.01" />
    </>
  ),
  alert: (
    <>
      <path d="M10.3 4.6a2 2 0 0 1 3.4 0l7.2 12.6a2 2 0 0 1-1.7 3H4.8a2 2 0 0 1-1.7-3z" />
      <path d="M12 10v4M12 17.2h.01" />
    </>
  ),
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.4l2.8 2.8 5.2-5.4" />
    </>
  ),
  flag: <path d="M5.5 21V4.5M5.5 4.5h11l-2.2 4 2.2 4h-11" />,
  fileText: (
    <>
      <path d="M6.5 3h7.5l4.5 4.5V20a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M13.5 3v5h5M9 13h6M9 16.5h4" />
    </>
  ),
  fileCheck: (
    <>
      <path d="M6.5 3h7.5l4.5 4.5V20a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M13.5 3v5h5M9 14.5l2.2 2.2 4-4" />
    </>
  ),
  receipt: (
    <>
      <path d="M6 3.5h12V21l-2.4-1.6-2.4 1.6-2.4-1.6-2.4 1.6L6 19.4z" />
      <path d="M9 8.5h6M9 12h6M9 15.5h3" />
    </>
  ),
  message: <path d="M5 4.5h14a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5h-7l-4.5 3.5v-3.5H5A1.5 1.5 0 0 1 3.5 15V6A1.5 1.5 0 0 1 5 4.5z" />,
  book: (
    <>
      <path d="M12 6.5C10 5 7 4.5 3.5 5v13.5C7 18 10 18.5 12 20c2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5z" />
      <path d="M12 6.5V20" />
    </>
  ),
  folder: <path d="M3.5 7a2 2 0 0 1 2-2h3.8l2 2.2h7.2a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />,
  volume: (
    <>
      <path d="M4 9.5h3.5L12 5.8v12.4l-4.5-3.7H4z" />
      <path d="M15.5 9a4 4 0 0 1 0 6M18.2 6.5a7.5 7.5 0 0 1 0 11" />
    </>
  ),
  expand: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
  bulb: (
    <>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.3" />
    </>
  ),
  bag: (
    <>
      <path d="M5 8h14l-1 12.5H6z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5.5" width="16" height="15" rx="2.5" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  camera: (
    <>
      <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7H8l1.5-2h5L16 7h2.5A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" />
      <circle cx="12" cy="13" r="3.4" />
    </>
  ),
  image: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <circle cx="9" cy="10" r="1.7" />
      <path d="M20.5 15.5l-5-5-8.8 9" />
    </>
  ),
  download: <path d="M12 4v11M7 10.5l5 5 5-5M5 20h14" />,
  trash: <path d="M4.5 7h15M10 7V4.5h4V7M6.5 7l1 13h9l1-13" />,
  guard: <path d="M12 3l7 3v5.2c0 4.4-3 8.3-7 9.8-4-1.5-7-5.4-7-9.8V6z" />,
  guardCheck: (
    <>
      <path d="M12 3l7 3v5.2c0 4.4-3 8.3-7 9.8-4-1.5-7-5.4-7-9.8V6z" />
      <path d="M9 11.8l2.2 2.2 4-4" />
    </>
  ),
  guardPlus: (
    <>
      <path d="M12 3l7 3v5.2c0 4.4-3 8.3-7 9.8-4-1.5-7-5.4-7-9.8V6z" />
      <path d="M12 9v6M9 12h6" />
    </>
  ),
  star: <path d="M12 4l2.4 5 5.4.6-4 3.7 1.1 5.3L12 15.9l-4.9 2.7 1.1-5.3-4-3.7 5.4-.6z" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4 4" />
    </>
  ),
  copy: (
    <>
      <rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2" />
      <path d="M15.5 8.5V5.5A1.5 1.5 0 0 0 14 4H5.5A1.5 1.5 0 0 0 4 5.5V14a1.5 1.5 0 0 0 1.5 1.5h3" />
    </>
  ),
  refresh: (
    <>
      <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" />
      <path d="M19.5 4.5v4.5H15" />
    </>
  ),
  siren: (
    <>
      <path d="M7 17.5V12a5 5 0 0 1 10 0v5.5" />
      <path d="M5 17.5h14v3H5zM12 3v1.5M4.4 6.4l1 1M19.6 6.4l-1 1" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M5 20c1-3.5 3.8-5.5 7-5.5s6 2 7 5.5" />
    </>
  ),
  sparkle: <path d="M12 3.5l1.8 5.2 5.2 1.8-5.2 1.8L12 17.5l-1.8-5.2L5 10.5l5.2-1.8z" />,
  smartphone: (
    <>
      <rect x="7" y="2.5" width="10" height="19" rx="2.4" />
      <path d="M11 18.3h2" />
    </>
  ),
  card: (
    <>
      <rect x="3" y="6" width="18" height="12.5" rx="2.4" />
      <path d="M3 10.2h18M7 14.8h4" />
    </>
  ),
  idCard: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.4" />
      <circle cx="8.6" cy="11" r="2" />
      <path d="M5.8 16c.6-1.3 1.6-2 2.8-2s2.2.7 2.8 2M14 10h4.2M14 13.5h4.2" />
    </>
  ),
  passport: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2.2" />
      <circle cx="12" cy="10.5" r="3.2" />
      <path d="M9 16.8h6" />
    </>
  ),
  bank: <path d="M3.5 9.5L12 4.5l8.5 5M5.5 10.5v7M9.8 10.5v7M14.2 10.5v7M18.5 10.5v7M3.5 20h17" />,
  medical: <path d="M9.8 4h4.4v5.8H20v4.4h-5.8V20H9.8v-5.8H4V9.8h5.8z" />,
  send: (
    <>
      <path d="M20.5 3.5L3.5 10.6l6.9 2.9 2.9 6.9z" />
      <path d="M10.4 13.5l10.1-10" />
    </>
  ),
  edit: (
    <>
      <path d="M4.5 19.5h4L19 9l-4-4L4.5 15.5z" />
      <path d="M13.5 6.5l4 4" />
    </>
  ),
  moon: <path d="M19.5 14.5A8 8 0 0 1 9.5 4.5 8 8 0 1 0 19.5 14.5z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M4.6 4.6L6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4" />
    </>
  ),
  bell: (
    <>
      <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z" />
      <path d="M10 20.5a2 2 0 0 0 4 0" />
    </>
  ),
} as const;

export type IconName = keyof typeof PATHS;

export function Icon(props: { name: IconName; size?: number; className?: string; label?: string; strokeWidth?: number }): JSX.Element {
  const { name, size = 22, className, label, strokeWidth = 1.8 } = props;
  return (
    <svg
      className={className ? `icon ${className}` : 'icon'}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}

/** 퀘스트 날짜별 아이콘(데이터의 이모지 대신 화면에서 쓴다) */
export const QUEST_ICON: Readonly<Record<number, IconName>> = {
  1: 'smartphone',
  2: 'card',
  3: 'idCard',
  4: 'bank',
  5: 'guardPlus',
  6: 'medical',
  7: 'trash',
  8: 'send',
  9: 'fileCheck',
  10: 'receipt',
  11: 'idCard',
  12: 'calendar',
  13: 'pin',
  14: 'smartphone',
  15: 'card',
  16: 'guard',
  17: 'clock',
  18: 'siren',
  19: 'phone',
  20: 'bag',
  21: 'send',
  22: 'medical',
  23: 'guardPlus',
  24: 'moon',
  25: 'globe',
  26: 'search',
  27: 'fileText',
  28: 'user',
  29: 'book',
  30: 'download',
};

export function questIcon(day: number): IconName {
  return QUEST_ICON[day] ?? 'flag';
}
