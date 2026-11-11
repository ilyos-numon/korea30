import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { StatusNote } from './StatusNote';

describe('StatusNote', () => {
  it('danger: testId, default role alert, tone class, data-*, ko span, alert icon', () => {
    const html = renderToString(
      <StatusNote tone="danger" testId="work-storage-error" text="Storage is full" ko="저장 공간이 부족해요" data={{ code: 'quota' }} />,
    );
    expect(html).toContain('data-testid="work-storage-error"');
    expect(html).toContain('role="alert"');
    expect(html).toContain('class="note note-danger status-note"');
    expect(html).toContain('data-code="quota"');
    expect(html).toContain('Storage is full');
    expect(html).toContain('<span lang="ko">저장 공간이 부족해요</span>');
    expect(html).toContain('class="icon');
    expect(html).not.toContain('<button');
  });

  it('warn defaults to alert, ok defaults to status, explicit role wins', () => {
    expect(renderToString(<StatusNote tone="warn" testId="a" text="x" />)).toContain('role="alert"');
    expect(renderToString(<StatusNote tone="ok" testId="b" text="x" />)).toContain('role="status"');
    expect(renderToString(<StatusNote tone="warn" testId="c" text="x" role="status" />)).toContain('role="status"');
  });

  it('omits ko span when ko is not given', () => {
    const html = renderToString(<StatusNote tone="ok" testId="d" text="Saved" />);
    expect(html).not.toContain('lang="ko"');
  });

  it('renders action as link-btn button with testId', () => {
    const html = renderToString(
      <StatusNote
        tone="ok"
        testId="work-undo-note"
        text="Deleted"
        role="status"
        data={{ reason: 'skipped', count: '2' }}
        action={{ label: 'Undo', testId: 'work-undo', onClick: () => {} }}
      />,
    );
    expect(html).toContain('data-reason="skipped"');
    expect(html).toContain('data-count="2"');
    expect(html).toMatch(/<button[^>]*type="button"[^>]*class="link-btn"[^>]*data-testid="work-undo"[^>]*>Undo<\/button>/);
  });
});
