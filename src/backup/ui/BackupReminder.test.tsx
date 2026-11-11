import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import type { ProgressStorage } from '../../quest/progress';
import { DB_NAME, openKoreaDb, resetDbForTest } from '../../storage/db';
import { LangContext, langValue } from '../../i18n/LangContext';
import { UI_PACKS } from '../../ui/i18n';
import { dataSignature } from '../io';
import { BACKUP_META_KEY, BACKUP_REMIND_MS } from '../reminder';
import { BackupReminder, BackupReminderView, checkBackupReminder } from './BackupReminder';

function deleteDb(): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => resolve();
  });
}

function memStorage(init: Record<string, string> = {}): ProgressStorage {
  const map = new Map(Object.entries(init));
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
  };
}

function escape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const NOW = Date.UTC(2026, 9, 29, 3, 0, 0);

async function addShift(id: string, createdAt: number): Promise<void> {
  const db = await openKoreaDb();
  await db.put('shifts', { id, date: '2026-10-05', start: '09:00', end: '18:00', breakMinutes: 60, isHoliday: false, memo: '', createdAt });
}

beforeEach(async () => {
  resetDbForTest();
  await deleteDb();
});

describe('checkBackupReminder', () => {
  it('empty device → false', async () => {
    expect(await checkBackupReminder(memStorage(), NOW)).toBe(false);
  });

  it('records but no backup history → true', async () => {
    await addShift('a', 1);
    expect(await checkBackupReminder(memStorage(), NOW)).toBe(true);
  });

  it('quest progress only (localStorage) counts as data', async () => {
    expect(await checkBackupReminder(memStorage({ 'korea30.progress.v1': '[1]' }), NOW)).toBe(true);
  });

  it('unchanged since last backup → false; changed after 2 days → true; changed within 2 days → false', async () => {
    await addShift('a', 1);
    const s = memStorage();
    const { signature } = await dataSignature(s);
    s.setItem(BACKUP_META_KEY, JSON.stringify({ lastBackupAt: NOW - 3 * BACKUP_REMIND_MS, signature }));
    expect(await checkBackupReminder(s, NOW)).toBe(false);

    await addShift('b', 2);
    expect(await checkBackupReminder(s, NOW)).toBe(true);

    s.setItem(BACKUP_META_KEY, JSON.stringify({ lastBackupAt: NOW - 1000, signature }));
    expect(await checkBackupReminder(s, NOW)).toBe(false);
  });
});

describe('BackupReminder markup', () => {
  it('renders nothing before the async check (SSR / first paint)', () => {
    const html = renderToString(
      <LangContext.Provider value={langValue('en')}>
        <BackupReminder now={new Date(NOW)} storage={memStorage()} />
      </LangContext.Provider>,
    );
    expect(html).toBe('');
  });

  it('view: root, now and close buttons, text with Korean original', () => {
    const html = renderToString(
      <LangContext.Provider value={langValue('vi')}>
        <BackupReminderView busy={false} onNow={() => {}} onClose={() => {}} />
      </LangContext.Provider>,
    );
    expect(html).toMatch(/data-testid="backup-reminder"[^>]*role="status"/);
    expect(html).toMatch(/<button[^>]*data-testid="backup-reminder-now"/);
    expect(html).toMatch(/<button[^>]*data-testid="backup-reminder-close"[^>]*aria-label="[^"]+"/);
    expect(html).toContain(escape(UI_PACKS.vi!.backupRemind));
    expect(html).toContain(escape(UI_PACKS.ko.backupRemind));
    expect(html).toContain(escape(UI_PACKS.vi!.backupNow));
    expect(html).not.toContain('position:fixed');
  });

  it('view: now button disabled while busy', () => {
    const html = renderToString(
      <LangContext.Provider value={langValue('en')}>
        <BackupReminderView busy onNow={() => {}} onClose={() => {}} />
      </LangContext.Provider>,
    );
    expect(html).toMatch(/<button[^>]*data-testid="backup-reminder-now"[^>]*disabled=""/);
  });

  it('view: errorName shows an export error line inside the reminder', () => {
    const html = renderToString(
      <LangContext.Provider value={langValue('en')}>
        <BackupReminderView busy={false} onNow={() => {}} onClose={() => {}} errorName="NotAllowedError" />
      </LangContext.Provider>,
    );
    expect(html).toMatch(/<p[^>]*role="alert"[^>]*data-testid="backup-reminder-error"[^>]*>/);
    expect(html).toMatch(/data-testid="backup-reminder-error"[^>]*data-code="exportFailed"[^>]*data-err-name="NotAllowedError"/);
    expect(html).toContain(escape(UI_PACKS.en.backupErrExport).replace(/'/g, '&#x27;'));
    expect(html).toContain(escape(UI_PACKS.ko.backupErrExport));
    const root = html.indexOf('data-testid="backup-reminder"');
    const err = html.indexOf('data-testid="backup-reminder-error"');
    const now = html.indexOf('data-testid="backup-reminder-now"');
    expect(root).toBeGreaterThanOrEqual(0);
    expect(err).toBeGreaterThan(now);
    expect(html.lastIndexOf('</div>')).toBeGreaterThan(err);
    expect(html.startsWith('<div') && html.indexOf('data-testid="backup-reminder"') < html.indexOf('>')).toBe(true);
  });

  it('view: no error line without errorName', () => {
    const html = renderToString(
      <LangContext.Provider value={langValue('en')}>
        <BackupReminderView busy={false} onNow={() => {}} onClose={() => {}} />
      </LangContext.Provider>,
    );
    expect(html).not.toContain('backup-reminder-error');
    const nullHtml = renderToString(
      <LangContext.Provider value={langValue('en')}>
        <BackupReminderView busy={false} onNow={() => {}} onClose={() => {}} errorName={null} />
      </LangContext.Provider>,
    );
    expect(nullHtml).not.toContain('backup-reminder-error');
  });
});
