import { useId, useState, type JSX, type ReactNode } from 'react';
import { useFeatureStrings } from '../i18n/feature';
import { UI_PACKS } from '../ui/i18n';

/**
 * 짧은 본문 옆에 작은 ? (또는 '가') 버튼을 두고, 누르면 바로 아래에 설명을 펼친다.
 * - kind 'help': 부가 설명. kind 'ko': 한국어 원문(창구에서 보여 줄 때).
 * - 설명은 DOM 에 남기고 hidden 으로만 숨긴다(검색·테스트·스크린리더 접근 유지).
 */
export function Hint(props: {
  children: ReactNode;
  text: ReactNode;
  kind?: 'help' | 'ko';
  label?: string;
  className?: string;
  testId?: string;
  panelTestId?: string;
}): JSX.Element {
  const { children, text, kind = 'help', label, className, testId, panelTestId } = props;
  const { t } = useFeatureStrings(UI_PACKS);
  const [open, setOpen] = useState(false);
  const id = useId();
  const aria = label ?? (kind === 'ko' ? t.koreanOriginal : t.moreInfo);
  return (
    <div className={className ? `hint ${className}` : 'hint'}>
      <div className="hint-row">
        <div className="hint-main">{children}</div>
        <button
          type="button"
          className={`hint-btn hint-btn-${kind}`}
          aria-expanded={open}
          aria-controls={id}
          aria-label={aria}
          data-testid={testId}
          onClick={() => setOpen((o) => !o)}
        >
          {kind === 'ko' ? <span lang="ko">가</span> : '?'}
        </button>
      </div>
      <div
        id={id}
        className="hint-panel"
        role="note"
        hidden={!open}
        lang={kind === 'ko' ? 'ko' : undefined}
        data-testid={panelTestId}
      >
        {text}
      </div>
    </div>
  );
}
