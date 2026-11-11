import { createPortal } from 'react-dom';
import type { JSX, ReactNode } from 'react';

/**
 * 시트·다이얼로그·큰 글씨 카드를 body 바로 아래로 옮겨 그린다.
 * 헤더의 backdrop-filter 나 화면 진입 애니메이션이 position: fixed 의 기준을 바꾸지 못하게 한다.
 * 서버 렌더(단위 테스트)에는 document 가 없으므로 그 자리에 그대로 그린다.
 */
export function Layer(props: { children: ReactNode }): JSX.Element {
  if (typeof document === 'undefined') return <>{props.children}</>;
  return createPortal(props.children, document.body);
}
