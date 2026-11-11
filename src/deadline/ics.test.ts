import { describe, expect, it } from 'vitest';
import { buildTimeline } from './rules';
import { buildIcs, ICS_FILE_NAME, type IcsText } from './ics';

const en: IcsText = { title: (k) => `EN-${k}`, alarm: (k, d) => `EN-${k}-${d}` };
const ko: IcsText = { title: (k) => `KO-${k}`, alarm: (k, d) => `KO-${k}-${d}` };
const items = buildTimeline(
  { entryDate: '2026-10-01', visaType: null, stayExpiry: null, arcRegisteredOn: null, lastMoveDate: null, contractEnd: '2027-01-15', leftJobOn: null, passportExpiry: null },
  '2026-12-25',
);
const unfold = (s: string) => s.replace(/\r?\n[ \t]/g, '');

describe('buildIcs', () => {
  it('empty list → empty error', () => {
    expect(buildIcs([], en, ko)).toEqual({ ok: false, error: 'empty' });
  });

  it('produces VEVENT with VALARM -P7D and -P1D per item', () => {
    const r = buildIcs(items, en, ko);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const text = unfold(r.text);
    expect(text).toContain('BEGIN:VCALENDAR');
    expect(text.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(text.match(/BEGIN:VALARM/g)).toHaveLength(4);
    expect(text.match(/TRIGGER:-P7D/g)).toHaveLength(2);
    expect(text.match(/TRIGGER:-P1D/g)).toHaveLength(2);
    expect(text).toContain('ACTION:DISPLAY');
  });

  it('all-day event on due date with bilingual title and stable UID', () => {
    const r = buildIcs(items, en, ko);
    if (!r.ok) throw new Error('expected ok');
    const text = unfold(r.text);
    expect(text).toContain('DTSTART;VALUE=DATE:20261230');
    expect(text).toContain('DTEND;VALUE=DATE:20261231');
    expect(text).toContain('SUMMARY:EN-arcRegistration / KO-arcRegistration');
    expect(text).toContain('UID:arcRegistration-2026-12-30@korea30.local');
    expect(text).toContain('UID:contractEnd-2027-01-15@korea30.local');
    expect(text).toContain('EN-arcRegistration-7 / KO-arcRegistration-7');
  });

  it('file name constant', () => {
    expect(ICS_FILE_NAME).toBe('korea30-deadlines.ics');
  });
});
