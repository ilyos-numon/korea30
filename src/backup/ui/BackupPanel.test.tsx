import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { BackupPanel, type BackupPanelProps } from './BackupPanel';
import { ToolsScreen } from '../../screens/ToolsScreen';
import { LangContext, langValue } from '../../i18n/LangContext';
import type { Lang } from '../../i18n/types';
import { UI_PACKS } from '../../ui/i18n';

const counts = { shifts: 3, photos: 2, questDays: 5, stay: true, work: false, arrival: true };

function render(props: BackupPanelProps = {}, lang: Lang = 'en'): string {
  return renderToString(
    <LangContext.Provider value={langValue(lang)}>
      <BackupPanel {...props} />
    </LangContext.Provider>,
  );
}

function escape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

describe('BackupPanel', () => {
  it('renders the section with export button and json file input', () => {
    const html = render();
    expect(html).toContain('data-testid="backup-section"');
    expect(html).toMatch(/<button[^>]*data-testid="backup-export"/);
    expect(html).toMatch(/<input[^>]*type="file"[^>]*accept="application\/json,.json"[^>]*data-testid="backup-import-input"/);
    expect(html).not.toContain('data-testid="backup-preview"');
    expect(html).not.toContain('data-testid="backup-error"');
    expect(html).not.toContain('data-testid="backup-done"');
  });

  it('shows the privacy intro in the screen language with the Korean original', () => {
    const html = render({}, 'en');
    expect(html).toContain(escape(UI_PACKS.en.backupIntro));
    expect(html).toContain(escape(UI_PACKS.ko.backupIntro));
    expect(html).toContain(escape(UI_PACKS.en.backupTitle));
  });

  it('preview carries file counts as data attributes and the current device summary', () => {
    const current = { shifts: 7, photos: 0, questDays: 1, stay: false, work: false, arrival: false };
    const html = render({ initial: { preview: { counts, current } } });
    expect(html).toMatch(/data-testid="backup-preview"[^>]*data-shifts="3"[^>]*data-photos="2"[^>]*data-quest-days="5"[^>]*data-stay="true"/);
    expect(html).toContain(escape(UI_PACKS.en.backupPreview(3, 2, 5)));
    expect(html).toContain(escape(UI_PACKS.en.backupPreview(7, 0, 1)));
    expect(html).toContain(escape(UI_PACKS.en.backupReplaceWarn));
    expect(html).toContain('data-testid="backup-restore-confirm"');
    expect(html).toContain('data-testid="backup-restore-cancel"');
  });

  it('error note uses role=alert and data-code', () => {
    for (const code of ['notJson', 'otherApp', 'newerVersion', 'damaged', 'restoreFailed', 'exportFailed'] as const) {
      const html = render({ initial: { error: code } });
      expect(html).toMatch(new RegExp(`role="alert"[^>]*data-testid="backup-error"[^>]*data-code="${code}"`));
    }
    expect(render({ initial: { error: 'otherApp' } })).toContain(escape(UI_PACKS.en.backupErrOtherApp));
  });

  it('export error note carries data-err-name after data-code; other errors do not', () => {
    expect(render({ initial: { error: 'exportFailed', errorName: 'TypeError' } })).toMatch(
      /data-testid="backup-error"[^>]*data-code="exportFailed"[^>]*data-err-name="TypeError"/,
    );
    expect(render({ initial: { error: 'notJson' } })).not.toContain('data-err-name');
  });

  it('done note uses role=status and data-kind', () => {
    const exp = render({ initial: { done: 'export' } });
    expect(exp).toMatch(/role="status"[^>]*data-testid="backup-done"[^>]*data-kind="export"/);
    expect(exp).toContain(escape(UI_PACKS.en.backupExported));
    const res = render({ initial: { done: 'restore' } });
    expect(res).toMatch(/data-testid="backup-done"[^>]*data-kind="restore"/);
    expect(res).toContain(escape(UI_PACKS.en.backupRestored));
  });

  it('is placed on the tools screen below the card list', () => {
    const html = renderToString(
      <LangContext.Provider value={langValue('vi')}>
        <ToolsScreen />
      </LangContext.Provider>,
    );
    const list = html.indexOf('tools-list');
    const section = html.indexOf('data-testid="backup-section"');
    expect(list).toBeGreaterThan(-1);
    expect(section).toBeGreaterThan(list);
  });
});
