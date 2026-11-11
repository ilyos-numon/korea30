import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import type { ReactElement } from 'react';
import { WorkScreen } from './WorkScreen';
import { LangContext, langValue } from '../i18n/LangContext';
import type { Lang } from '../i18n/types';
import { ko } from '../worklog/i18n/ko';
import { en } from '../worklog/i18n/en';
import { WORKLOG_PACKS } from '../worklog/i18n';
import { calcMonth } from '../worklog/calc';
import { legalNumber } from '../legal';
import { MANUAL_FIELDS } from '../payroll/manual';
import { EMPTY_WORK_PROFILE } from '../storage/repos';
import type { WorkProfile, WorkShift } from '../storage/db';
import { PHOTO_PACKS } from '../worklog/photos/i18n';
import { UI_PACKS } from '../ui/i18n';

const NOW = new Date(2026, 9, 27); // 2026-10-27

function render(el: ReactElement, lang: Lang = 'vi'): string {
  return renderToString(<LangContext.Provider value={langValue(lang)}>{el}</LangContext.Provider>);
}

function shift(id: string, date: string, start: string, end: string, breakMinutes = 60, isHoliday = false): WorkShift {
  return { id, date, start, end, breakMinutes, isHoliday, memo: '', createdAt: 0 };
}

const SHIFTS: WorkShift[] = [
  shift('a', '2026-10-05', '09:00', '20:00'),
  shift('b', '2026-10-06', '22:00', '06:00'),
  shift('c', '2026-09-30', '09:00', '18:00'),
];

/** 최저시급보다 낮은 입력 시급 (법정 수치 리터럴 대신 접근자로 만든다) */
const LOW_WAGE = legalNumber('minWageHourly2026') - 100;

function profile(patch: Partial<Omit<WorkProfile, 'id'>> = {}): Omit<WorkProfile, 'id'> {
  return { ...EMPTY_WORK_PROFILE, companyName: '테스트상회', ...patch };
}

describe('WorkScreen', () => {
  it('shows the empty state when no shifts and no profile are saved', () => {
    const html = render(<WorkScreen now={NOW} initialShifts={[]} initialProfile={null} />, 'en');
    expect(html).toContain('data-testid="screen-work"');
    expect(html).toContain('data-testid="work-empty"');
    expect(html).toContain(en.empty);
    expect(html).not.toContain(ko.empty);
    expect(html).toContain(en.wageMissing);
    expect(html).not.toContain('data-testid="work-shift-row"');
    expect(html).not.toContain('data-testid="work-minwage-warning"');
    expect(html).not.toContain('data-testid="work-note-belowMinWage"');
    expect(html).not.toContain('data-testid="work-compare-result"');
    expect(html).toMatch(/data-testid="work-month"[^>]*value="2026-10"|value="2026-10"[^>]*data-testid="work-month"/);
  });

  it('renders every contract testid for a month with shifts', () => {
    const html = render(
      <WorkScreen now={NOW} initialShifts={SHIFTS} initialProfile={profile({ hourlyWage: LOW_WAGE, workplace5Plus: 'yes' })} />,
      'en',
    );
    const ids = [
      'work-month', 'work-shift-date', 'work-shift-start', 'work-shift-end', 'work-shift-break',
      'work-shift-holiday', 'work-shift-add', 'work-shift-row', 'work-shift-delete', 'work-wage', 'work-size',
      'work-profile-save', 'work-total-regular', 'work-total-overtime', 'work-total-night', 'work-expected-gross',
      'work-minwage-warning', 'work-note-belowMinWage', 'work-note-weeklyHolidayPayNotIncluded',
      'work-compare-run', 'work-statement', 'work-pdf', 'work-wipe',
      ...MANUAL_FIELDS.map((f) => `work-compare-${f}`),
    ];
    for (const id of ids) expect(html).toContain(`data-testid="${id}"`);
    expect(MANUAL_FIELDS).toHaveLength(10);
    // 이번 달(2026-10) 행만, 9월 시프트는 목록에 없다
    expect(html.match(/data-testid="work-shift-row"/g)).toHaveLength(2);
    expect(html).toContain('data-date="2026-10-05"');
    expect(html).not.toContain('data-date="2026-09-30"');
    // 합계는 calcMonth 결과와 같다
    const calc = calcMonth({ shifts: SHIFTS, hourlyWage: LOW_WAGE, workplace5Plus: 'yes', weekStartsOn: 1, yearMonth: '2026-10' });
    const value = (id: string): string => html.match(new RegExp(`data-testid="${id}"[^>]*>([^<]*)<`))?.[1] ?? '';
    expect(value('work-total-overtime')).toBe(en.hoursMinutes(calc.totals.overtime));
    expect(value('work-total-night')).toBe(en.hoursMinutes(calc.totals.night));
    expect(value('work-expected-gross')).toBe(en.won(calc.expectedGross));
    expect(calc.totals.overtime).toBeGreaterThan(0);
    // 상호작용 뒤에만 나오는 것
    for (const id of ['work-shift-error', 'work-compare-result', 'work-pdf-error', 'work-wipe-confirm']) {
      expect(html).not.toContain(`data-testid="${id}"`);
    }
  });

  it('shows wage notes with the legal worker count and no judgement words', () => {
    const workers = legalNumber('premiumMinWorkers');
    const small = render(<WorkScreen now={NOW} initialShifts={SHIFTS} initialProfile={profile({ hourlyWage: LOW_WAGE, workplace5Plus: 'no' })} />, 'en');
    expect(small).toContain('data-testid="work-note-smallWorkplaceNoPremium"');
    expect(small).toContain(en.noteSmallWorkplaceNoPremium(workers));
    expect(small).not.toContain(ko.noteSmallWorkplaceNoPremium(workers));
    expect(small).toContain(en.minWageWarning(legalNumber('minWageHourly2026')));

    const unknown = render(<WorkScreen now={NOW} initialShifts={SHIFTS} initialProfile={profile({ hourlyWage: LOW_WAGE })} />, 'en');
    expect(unknown).toContain('data-testid="work-note-workplaceSizeUnknown"');
    expect(unknown).toContain(en.noteWorkplaceSizeUnknown(workers));
    expect(unknown).not.toContain('data-testid="work-note-smallWorkplaceNoPremium"');

    for (const html of [small, unknown]) expect(html).not.toMatch(/위법|불법|체불입니다/);
  });

  it('prefills the complaint statement in Korean from the profile', () => {
    const html = render(<WorkScreen now={NOW} initialShifts={SHIFTS} initialProfile={profile({ hourlyWage: LOW_WAGE })} />, 'en');
    const textarea = html.match(/<textarea[^>]*data-testid="work-statement"[^>]*>([\s\S]*?)<\/textarea>/);
    expect(textarea).not.toBeNull();
    expect(textarea?.[1]).toContain('테스트상회');
  });

  it('uses English strings when lang is en and keeps Korean only where it is the original', () => {
    const html = render(<WorkScreen now={NOW} initialShifts={[]} initialProfile={null} />, 'en');
    for (const s of [en.title, en.shiftAdd, en.profileSave, en.compareRun, en.pdf, en.wipe]) expect(html).toContain(s);
    expect(html).not.toContain(`<span lang="ko">${ko.title}</span>`);
    // 명세서 항목명(한국어 원문)과 진정서(한국어로 PDF 에 들어감)는 한국어 그대로
    expect(html).toContain('<span lang="ko">기본급</span>');
    expect(html).toMatch(/<textarea[^>]*data-testid="work-statement"[^>]*lang="ko"|<textarea[^>]*lang="ko"[^>]*data-testid="work-statement"/);
  });

  it('renders the photo panel below the shift list without reading storage in test renders', () => {
    const html = render(<WorkScreen now={NOW} initialShifts={SHIFTS} initialProfile={null} />, 'en');
    expect(html).toContain('data-testid="photo-panel"');
    expect(html).toContain('data-testid="photo-empty"');
    expect(html.indexOf('data-testid="work-shift-row"')).toBeLessThan(html.indexOf('data-testid="photo-panel"'));
    expect(html.indexOf('data-testid="photo-panel"')).toBeLessThan(html.indexOf('data-testid="work-wage"'));
  });

  it('has a photo wipe note string in every language and hides the note until wipe is asked', () => {
    for (const pack of Object.values(PHOTO_PACKS)) expect(pack.wipeIncludesPhotos).not.toBe('');
    const html = render(<WorkScreen now={NOW} initialShifts={[]} initialProfile={null} />, 'en');
    expect(html).not.toContain('data-testid="work-wipe-photos-note"');
    expect(html).not.toContain(PHOTO_PACKS.en.wipeIncludesPhotos);
  });

  it('shows no storage, load or undo notes before anything has failed or been deleted', () => {
    const html = render(<WorkScreen now={NOW} initialShifts={SHIFTS} initialProfile={profile()} />, 'en');
    for (const id of ['work-storage-error', 'work-load-error', 'work-undo-note', 'work-undo']) {
      expect(html).not.toContain(`data-testid="${id}"`);
    }
  });

  it('hides the no-photo retry button and dropped note until a PDF with photos has failed', () => {
    const html = render(<WorkScreen now={NOW} initialShifts={SHIFTS} initialProfile={profile()} />, 'en');
    expect(html).not.toContain('data-testid="work-pdf-retry-nophotos"');
    expect(html).not.toContain('data-testid="work-pdf-photo-note"');
    expect(html).not.toContain(UI_PACKS.en.pdfRetryNoPhotos);
    for (const pack of Object.values(UI_PACKS)) {
      expect(pack.pdfPhotoBroken).not.toBe('');
      expect(pack.pdfRetryNoPhotos).not.toBe('');
      expect(pack.pdfPhotosDropped(2)).toContain('2');
    }
  });

  it('string functions never return empty text for unexpected arguments', () => {
    for (const pack of [WORKLOG_PACKS.ko, WORKLOG_PACKS.en]) {
      for (const [key, value] of Object.entries(pack)) {
        if (typeof value === 'function') {
          for (const arg of [3, '2026-10-27', '', 'abc']) {
            expect((value as (a: number | string) => string)(arg), key).not.toBe('');
          }
        } else {
          expect(value, key).not.toBe('');
        }
      }
    }
  });
});
