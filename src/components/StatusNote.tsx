import type { JSX } from 'react';
import { Icon } from './Icon';

export interface StatusNoteProps {
  tone: 'ok' | 'warn' | 'danger';
  testId: string;
  text: string;
  /** 한국어 원문 병기 (lang="ko" span). 화면 언어가 ko 면 생략 */
  ko?: string;
  /** danger/warn → 'alert', ok → 'status' 기본 */
  role?: 'alert' | 'status';
  /** data-code / data-reason 등 */
  data?: Readonly<Record<string, string>>;
  action?: { label: string; testId: string; onClick: () => void };
}

/** 저장·복사 결과 안내 한 줄. 기존 .note 계열 CSS 만 쓴다. */
export function StatusNote(props: StatusNoteProps): JSX.Element {
  const { tone, testId, text, ko, data, action } = props;
  const role = props.role ?? (tone === 'ok' ? 'status' : 'alert');
  const dataAttrs: Record<string, string> = {};
  if (data) for (const [k, v] of Object.entries(data)) dataAttrs[`data-${k}`] = v;
  return (
    <p className={`note note-${tone} status-note`} role={role} data-testid={testId} {...dataAttrs}>
      <Icon name={tone === 'ok' ? 'checkCircle' : 'alert'} size={18} />
      <span>
        {text}
        {ko ? (
          <>
            {' '}
            <span lang="ko">{ko}</span>
          </>
        ) : null}
        {action ? (
          <>
            {' '}
            <button type="button" className="link-btn" data-testid={action.testId} onClick={action.onClick}>
              {action.label}
            </button>
          </>
        ) : null}
      </span>
    </p>
  );
}
