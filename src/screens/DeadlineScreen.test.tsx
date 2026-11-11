import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import type { ReactElement } from 'react';
import { DeadlineScreen } from './DeadlineScreen';
import { LangContext, langValue } from '../i18n/LangContext';
import type { Lang } from '../i18n/types';
import { ko } from '../deadline/i18n/ko';
import { en } from '../deadline/i18n/en';
import { ARRIVAL_KEY } from '../quest/arrival';
import type { ProgressStorage } from '../quest/progress';
import { legalEntry } from '../legal';
import { EMPTY_STAY_PROFILE } from '../storage/repos';
import type { StayProfile } from '../storage/db';
import { en as kitEn } from '../ui/i18n/en';
import { ko as kitKo } from '../ui/i18n/ko';

const NOW = new Date(2026, 9, 27); // 2026-10-27

function memoryStorage(arrival?: string): ProgressStorage {
  const map = new Map<string, string>();
  if (arrival !== undefined) map.set(ARRIVAL_KEY, arrival);
  return {
    getItem: (k) => (map.has(k) ? (map.get(k) as string) : null),
    setItem: (k, v) => {
      map.set(k, String(v));
    },
    removeItem: (k) => {
      map.delete(k);
    },
  };
}

function render(el: ReactElement, lang: Lang = 'vi'): string {
  return renderToString(<LangContext.Provider value={langValue(lang)}>{el}</LangContext.Provider>);
}

const PROFILE: Omit<StayProfile, 'id'> = {
  ...EMPTY_STAY_PROFILE,
  entryDate: '2026-09-01',
  visaType: 'E-9',
  stayExpiry: '2027-03-01',
  lastMoveDate: '2026-10-01',
};

function itemTag(html: string, kind: string): string {
  const m = html.match(new RegExp(`<li[^>]*data-kind="${kind}"[^>]*>`));
  return m ? m[0] : '';
}

describe('DeadlineScreen', () => {
  it('shows the empty-profile guidance when nothing is saved', () => {
    const html = render(<DeadlineScreen now={NOW} storage={memoryStorage()} initialProfile={null} />, 'en');
    expect(html).toContain('data-testid="screen-deadline"');
    expect(html).toContain(en.empty);
    expect(html).not.toContain(ko.empty);
    expect(html).not.toContain('data-testid="deadline-item"');
    expect(html).not.toContain('data-testid="stay-error"');
  });

  it('keeps only the Korean official names of deadlines next to the user language', () => {
    const html = render(<DeadlineScreen now={NOW} storage={memoryStorage()} initialProfile={PROFILE} />, 'en');
    expect(html).toContain(`<span lang="ko" class="deadline-item-ko">${ko.kindTitle('addressChange')}</span>`);
    expect(html).toContain(en.kindTitle('addressChange'));
    expect(html).toContain(en.ask1345);
    expect(html).toMatch(/<a[^>]*href="tel:1345"/);
    expect(html).not.toContain(`<span lang="ko">${ko.title}</span>`);
  });

  it('renders every contract testid and level data for a saved profile', () => {
    const html = render(<DeadlineScreen now={NOW} storage={memoryStorage()} initialProfile={PROFILE} />, 'en');
    for (const id of [
      'stay-entry', 'stay-visa', 'stay-expiry', 'stay-arc-done', 'stay-move', 'stay-contract-end',
      'stay-left-job', 'stay-passport-expiry', 'stay-save', 'deadline-item', 'deadline-days',
      'deadline-fine', 'deadline-ics', 'stay-wipe',
    ]) {
      expect(html).toContain(`data-testid="${id}"`);
    }
    // 체류 법정값이 모두 verified(S14) → 미확인 배지 없음
    expect(html).not.toContain('data-testid="legal-badge"');
    // 이사 2026-10-01 + 신고 기한 → 오늘(2026-10-27) 기준 지남
    expect(itemTag(html, 'addressChange')).toContain('data-level="overdue"');
    expect(itemTag(html, 'stayExpiry')).toContain('data-level="ok"');
    // 미등록 → arcRegistration 항목
    expect(itemTag(html, 'arcRegistration')).not.toBe('');
  });

  it('shows the penalty cap from legalEntry without judgement words', () => {
    const html = render(<DeadlineScreen now={NOW} storage={memoryStorage()} initialProfile={PROFILE} />, 'en');
    const fine = legalEntry('addressLateFineMaxWon');
    const fineHtml = html.match(/<p data-testid="deadline-fine"[^>]*>.*?<\/p>/)?.[0] ?? '';
    expect(fineHtml).toContain(fine.labelKo);
    expect(fineHtml).toContain(`${(fine.value as number).toLocaleString('ko-KR')}원`);
    expect(html).not.toMatch(/과태료|위법|불법|체불/);
  });

  it('uses English strings when lang is en', () => {
    const html = render(<DeadlineScreen now={NOW} storage={memoryStorage()} initialProfile={null} />, 'en');
    expect(html).toContain(en.title);
    expect(html).toContain(en.save);
    expect(html).toContain(en.ics);
    expect(html).toContain(en.fieldEntry);
  });

  it('prefills the entry date from the quest arrival date', () => {
    const html = render(<DeadlineScreen now={NOW} storage={memoryStorage('2026-10-01')} />, 'en');
    expect(html).toMatch(/data-testid="stay-entry"[^>]*value="2026-10-01"|value="2026-10-01"[^>]*data-testid="stay-entry"/);
    expect(html).toContain(en.prefillNote);
  });

  it('shows the saved timeline (not a preview) when the draft equals the saved profile', () => {
    const html = render(<DeadlineScreen now={NOW} storage={memoryStorage()} initialProfile={PROFILE} />, 'en');
    expect(html).toMatch(/data-testid="deadline-timeline"[^>]*data-preview="false"/);
    expect(html).not.toContain('data-testid="deadline-preview-note"');
    expect(html).not.toContain(kitEn.timelinePreview);
    expect(html).not.toContain('data-testid="stay-arrival-synced"');
  });

  it('previews the timeline of a valid unsaved draft with a note that saving is required', () => {
    const html = render(<DeadlineScreen now={NOW} storage={memoryStorage('2026-10-01')} />, 'en');
    expect(html).toMatch(/data-testid="deadline-timeline"[^>]*data-preview="true"/);
    expect(html).toContain('data-testid="deadline-preview-note"');
    expect(html).toContain(kitEn.timelinePreview);
    expect(html).toContain(`<span lang="ko">${kitKo.timelinePreview}</span>`);
    // 입국일만 있어도 외국인등록 기한이 미리 보인다
    expect(itemTag(html, 'arcRegistration')).not.toBe('');
    expect(html).not.toContain(en.empty);
  });

  it('does not preview a draft with errors and falls back to the saved timeline', () => {
    // 미래 입국일 → futureEntry 오류 → 미리보기 없음, 저장된 것 없으니 빈 안내
    const html = render(<DeadlineScreen now={NOW} storage={memoryStorage('2026-12-01')} />, 'en');
    expect(html).toMatch(/data-testid="deadline-timeline"[^>]*data-preview="false"/);
    expect(html).not.toContain('data-testid="deadline-preview-note"');
    expect(html).toContain(en.empty);
  });
});
