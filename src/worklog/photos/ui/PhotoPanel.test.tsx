import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import type { ReactElement } from 'react';
import { LangContext, langValue } from '../../../i18n/LangContext';
import type { Lang } from '../../../i18n/types';
import { pickFeature } from '../../../i18n/feature';
import { FORBIDDEN } from '../../../i18n/packCheck';
import type { WorkPhoto, WorkShift } from '../../../storage/db';
import { PHOTO_PACKS } from '../i18n';
import { PhotoPanel } from './PhotoPanel';
import { PhotoSettings } from './PhotoSettings';
import { PhotoViewer } from './PhotoViewer';

const TODAY = '2026-10-27';
const ko = PHOTO_PACKS.ko;
const en = PHOTO_PACKS.en;

function render(el: ReactElement, lang: Lang = 'vi'): string {
  return renderToString(<LangContext.Provider value={langValue(lang)}>{el}</LangContext.Provider>);
}

/** renderToString 의 텍스트 escape 와 같게 */
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function photo(patch: Partial<WorkPhoto> & Pick<WorkPhoto, 'id' | 'date'>): WorkPhoto {
  const buf = new Uint8Array([1, 2, 3]).buffer;
  return {
    shiftId: null,
    memo: '',
    takenOn: patch.date,
    takenOnSource: 'exif',
    savedAt: 1,
    expiresOn: '2028-10-20',
    expiryCustom: false,
    mime: 'image/jpeg',
    image: buf,
    thumb: buf,
    width: 640,
    height: 480,
    ...patch,
  };
}

function shift(id: string, date: string, start: string, end: string): WorkShift {
  return { id, date, start, end, breakMinutes: 60, isHoliday: false, memo: '', createdAt: 0 };
}

const OCT = photo({ id: 'p-oct', date: '2026-10-20', memo: '출근 기록' });
const SEP = photo({ id: 'p-sep', date: '2026-09-15', takenOnSource: 'saved' });
const SOON = photo({ id: 'p-soon', date: '2026-10-05', expiresOn: '2026-11-16' }); // 20일 남음
const EXPIRED = photo({ id: 'p-old', date: '2026-10-01', expiresOn: '2026-10-27' });

function count(html: string, needle: string): number {
  return html.split(needle).length - 1;
}

function panel(photos: readonly WorkPhoto[], extra: Partial<Parameters<typeof PhotoPanel>[0]> = {}): ReactElement {
  return <PhotoPanel today={TODAY} month="2026-10" shifts={[]} reloadKey={0} initialPhotos={photos} {...extra} />;
}

describe('PhotoPanel', () => {
  it('lists only photos of the selected month with data-state and data-expires', () => {
    const html = render(panel([OCT, SEP]));
    expect(count(html, 'data-testid="photo-item"')).toBe(1);
    expect(html).toContain('data-id="p-oct"');
    expect(html).not.toContain('data-id="p-sep"');
    expect(html).toContain('data-state="active"');
    expect(html).toContain('data-expires="2028-10-20"');
    expect(html).not.toContain('data-testid="photo-empty"');
    expect(html).toContain('data-testid="photo-thumb"');
    expect(html).toContain('data-testid="photo-item-memo"');
  });

  it('shows the expiring-soon notice with days for a soon photo', () => {
    const html = render(panel([SOON]), 'en');
    expect(html).toContain('data-state="soon"');
    expect(html).toContain('data-testid="photo-item-soon"');
    expect(html).toContain(esc(en.expiringSoon(20)));
    expect(html).not.toContain(esc(ko.expiringSoon(20)));
  });

  it('does not show an active photo as soon and hides expired photos', () => {
    const html = render(panel([OCT, EXPIRED]), 'en');
    expect(html).not.toContain('data-testid="photo-item-soon"');
    expect(html).not.toContain('data-id="p-old"');
    expect(count(html, 'data-testid="photo-item"')).toBe(1);
  });

  it('shows photo-empty for a month without photos', () => {
    const html = render(panel([SEP]), 'en');
    expect(html).toContain('data-testid="photo-empty"');
    expect(html).toContain(esc(en.empty));
    expect(html).not.toContain(esc(ko.empty));
    expect(html).not.toContain('data-testid="photo-item"');
    expect(html).not.toContain('data-testid="photo-purged"');
  });

  it('renders the user language, with the Korean retention note kept behind the 가 button in vi', () => {
    const html = render(panel([OCT]), 'vi');
    const vi = pickFeature(PHOTO_PACKS, 'vi');
    expect(html).toContain(esc(vi.heading));
    expect(html).toContain(esc(vi.privacyNote));
    expect(html).toContain(esc(vi.camera));
    expect(html).not.toContain(`<span lang="ko">${esc(ko.heading)}</span>`);
    expect(html).toMatch(new RegExp(`hidden=""[^>]*lang="ko"[^>]*>${esc(ko.retentionHint).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
  });

  it('shows the default retention of 24 months in settings', () => {
    const html = render(panel([]), 'en');
    expect(html).toContain('data-testid="photo-settings"');
    expect(html).toMatch(/data-testid="photo-retention"[^>]*value="24"|value="24"[^>]*data-testid="photo-retention"/);
    const input = html.match(/<input[^>]*data-testid="photo-retention"[^>]*>/)?.[0] ?? '';
    expect(input).toContain('type="number"');
    expect(input).toContain('min="1"');
    expect(input).toContain('max="120"');
    expect(html).toContain(esc(ko.retentionHint));
  });

  it('renders the input contract: camera capture, gallery pick, date, shift, memo, privacy', () => {
    const html = render(panel([]), 'en');
    expect(html).toContain('data-testid="photo-panel"');
    expect(html).toContain('data-testid="photo-privacy"');
    expect(html).toMatch(/<input type="date"[^>]*data-testid="photo-date"[^>]*value="2026-10-27"/);
    expect(html).toMatch(/<input type="file" accept="image\/\*" capture="environment" data-testid="photo-camera"/);
    expect(html).toMatch(/<input type="file" accept="image\/\*" data-testid="photo-pick"/);
    expect(html).toMatch(/<label[^>]*class="btn[^"]*"[^>]*>[^]*?data-testid="photo-camera"/);
    expect(html).toContain('data-testid="photo-shift"');
    expect(html).toContain('data-testid="photo-memo"');
    expect(html).toContain('role="status" data-testid="photo-status"');
    expect(html).not.toContain('data-testid="photo-error"');
    expect(html).not.toContain('data-testid="photo-busy"');
    expect(html).not.toContain('data-testid="photo-viewer"');
  });

  it('offers only shifts of the month and shows the linked shift label', () => {
    const shifts = [shift('s-oct', '2026-10-20', '09:00', '18:00'), shift('s-sep', '2026-09-30', '08:00', '17:00')];
    const linked = photo({ id: 'p-l', date: '2026-10-20', shiftId: 's-oct' });
    const unknown = photo({ id: 'p-u', date: '2026-10-21', shiftId: 'gone' });
    const html = render(panel([linked, unknown], { shifts }), 'en');
    expect(html).toContain('value="s-oct"');
    expect(html).not.toContain('value="s-sep"');
    expect(html).toContain('<option value="" selected="">');
    expect(count(html, 'data-testid="photo-item-shift"')).toBe(1);
    expect(html).toContain(esc(en.linkedShift(en.shiftOption('2026-10-20', '09:00', '18:00'))));
  });

  it('marks the taken date source on items', () => {
    const saved = photo({ id: 'p-s', date: '2026-10-10', takenOnSource: 'saved', takenOn: '2026-10-11' });
    const html = render(panel([OCT, saved]), 'en');
    expect(html).toContain(esc(en.takenOn('2026-10-20')));
    expect(html).toContain(esc(en.takenOnSaved('2026-10-11')));
  });

  it('contains no judgement words in Korean or English', () => {
    const html = render(panel([OCT, SOON]), 'en');
    for (const w of ['위법', '불법', '체불', '법정 보존']) expect(html).not.toContain(w);
    const lower = html.toLowerCase();
    for (const w of FORBIDDEN.en) expect(lower).not.toContain(w);
  });
});

describe('PhotoViewer', () => {
  const noop = (): void => {};

  it('renders a dialog with source, custom note and delete step', () => {
    const p = photo({ id: 'v', date: '2026-10-20', takenOnSource: 'saved', expiryCustom: true, expiresOn: '2027-01-31', memo: 'm1' });
    const html = render(
      <PhotoViewer photo={p} today={TODAY} t={en} ko={ko} shiftLabel="2026-10-20 09:00~18:00" onSaveExpiry={noop} onDelete={noop} onClose={noop} />,
    );
    expect(html).toMatch(/role="dialog"[^>]*data-testid="photo-viewer"/);
    expect(html).toContain('data-testid="photo-viewer-img"');
    expect(html).toContain('data-testid="photo-viewer-taken" data-source="saved"');
    expect(html).toContain('data-testid="photo-expiry-custom"');
    expect(html).toMatch(/<input type="date" data-testid="photo-expiry-input"[^>]*value="2027-01-31"/);
    expect(html).toContain('data-testid="photo-expiry-save"');
    expect(html).toContain('data-testid="photo-delete"');
    expect(html).not.toContain('data-testid="photo-delete-confirm"');
    expect(html).not.toContain('data-testid="photo-expiry-error"');
    expect(html).toContain('data-testid="photo-viewer-close"');
    expect(html).toContain(esc(en.linkedShift('2026-10-20 09:00~18:00')));
  });

  it('hides the custom note for exif photos with default expiry', () => {
    const html = render(
      <PhotoViewer photo={OCT} today={TODAY} t={en} ko={ko} shiftLabel={null} onSaveExpiry={noop} onDelete={noop} onClose={noop} />,
    );
    expect(html).toContain('data-source="exif"');
    expect(html).not.toContain('data-testid="photo-expiry-custom"');
  });
});

describe('PhotoSettings', () => {
  it('renders the given months inside details without confirm or status', () => {
    const html = render(
      <PhotoSettings months={36} t={en} ko={ko} expiringNow={() => 0} onSave={() => Promise.resolve(0)} />,
    );
    expect(html).toMatch(/^<details data-testid="photo-settings"/);
    expect(html).toMatch(/value="36"/);
    expect(html).toContain('data-testid="photo-retention-save"');
    expect(html).not.toContain('data-testid="photo-retention-ask"');
    expect(html).not.toContain('data-testid="photo-retention-error"');
    expect(html).not.toContain('data-testid="photo-retention-status"');
    expect(html).toContain(esc(en.months(36)));
  });
});
