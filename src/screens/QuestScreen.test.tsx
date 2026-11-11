import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { PROGRESS_KEY, type ProgressStorage } from '../quest/progress';
import { ARRIVAL_KEY } from '../quest/arrival';
import { QuestScreen, saveArrivalWithSync, tryStorageWrite } from './QuestScreen';
import type { StayRepoLike } from '../deadline/arrivalSync';
import type { StayProfile } from '../storage/db';
import { EMPTY_STAY_PROFILE } from '../storage/repos';
import { LangContext, langValue } from '../i18n/LangContext';
import { questView } from '../i18n/content';
import { QUESTS } from '../quest/quests';
import { plain } from '../components/text';

function memoryStorage(initial?: string, arrival?: string): ProgressStorage {
  const map = new Map<string, string>();
  if (initial !== undefined) map.set(PROGRESS_KEY, initial);
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

const NOW = new Date(2026, 9, 23);

function render(initial?: string, arrival?: string): string {
  return renderToString(<QuestScreen storage={memoryStorage(initial, arrival)} now={NOW} />);
}

function dotTag(html: string, day: number): string {
  const m = html.match(new RegExp(`<span[^>]*data-testid="quest-dot-${day}"[^>]*>`));
  return m ? m[0] : '';
}

function itemTag(html: string, day: number): string {
  const m = html.match(new RegExp(`<button[^>]*data-testid="quest-item-${day}"[^>]*>`));
  return m ? m[0] : '';
}

describe('QuestScreen', () => {
  it('(a) empty storage shows day 1 with complete button and locked day 2', () => {
    const html = render();
    expect(html).toContain('data-testid="screen-quest"');
    expect(html).toMatch(/data-testid="quest-progress"[^>]*>Ngày 1 \/ 30</);
    expect(html).toContain('data-testid="quest-complete"');
    expect(html).toContain('Hoàn thành');
    expect(itemTag(html, 2)).toContain('data-state="locked"');
    expect(itemTag(html, 1)).toContain('data-state="today"');
    expect(html).toMatch(/data-testid="quest-title"[^>]*>Mở SIM điện thoại <span lang="ko"[^>]*>유심 개통하기<\/span>/);
    expect(html).toContain('data-testid="quest-reset"');
    expect(html).toContain('Làm lại từ đầu');
    expect(html).not.toContain('data-testid="quest-all-done"');
  });

  it('(b) storage [1] shows day 2 and marks day 1 done', () => {
    const html = render('[1]');
    expect(html).toMatch(/data-testid="quest-progress"[^>]*>Ngày 2 \/ 30</);
    expect(itemTag(html, 1)).toContain('data-state="done"');
    expect(itemTag(html, 2)).toContain('data-state="today"');
    expect(itemTag(html, 3)).toContain('data-state="locked"');
    expect(html).toContain('교통카드 하나 주세요. 만 원 충전해 주세요.');
  });

  it('(c) storage [1..30] shows all-done and no complete button', () => {
    const html = render('[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30]');
    expect(html).toContain('data-testid="quest-all-done"');
    expect(html).not.toContain('data-testid="quest-complete"');
    expect(html).not.toContain('data-testid="quest-today"');
    expect(html).toMatch(/data-testid="quest-progress"[^>]*>Ngày 30 \/ 30</);
    expect(html).toContain('data-testid="quest-reset"');
  });

  it('storage [1..10] shows day 11 as today', () => {
    const html = render('[1,2,3,4,5,6,7,8,9,10]');
    expect(html).toMatch(/data-testid="quest-progress"[^>]*>Ngày 11 \/ 30</);
    expect(itemTag(html, 10)).toContain('data-state="done"');
    expect(itemTag(html, 11)).toContain('data-state="today"');
    expect(itemTag(html, 12)).toContain('data-state="locked"');
    expect(html).toContain('data-testid="quest-complete"');
    expect(html).not.toContain('data-testid="quest-all-done"');
  });

  it('corrupt storage falls back to day 1', () => {
    const html = render('{oops');
    expect(html).toMatch(/data-testid="quest-progress"[^>]*>Ngày 1 \/ 30</);
  });

  it('renders thirty progress dots with done/today/locked states', () => {
    const html = render('[1,2]');
    expect(html).toContain('data-testid="quest-dots"');
    expect(html.match(/data-testid="quest-dot-\d+"/g)?.length).toBe(30);
    expect(dotTag(html, 1)).toContain('data-state="done"');
    expect(dotTag(html, 2)).toContain('data-state="done"');
    expect(dotTag(html, 3)).toContain('data-state="today"');
    expect(dotTag(html, 4)).toContain('data-state="locked"');
    expect(dotTag(html, 30)).toContain('data-state="locked"');
    expect(html).toContain('aria-label="Tiến độ 2/30"');
    expect(html.match(/data-testid="quest-item-\d+"/g)?.length).toBe(30);
  });

  it('stored arrival date shows D+N', () => {
    const html = render(undefined, '2026-10-19');
    expect(html).toMatch(/data-testid="quest-dplus"[^>]*>D\+5</);
    expect(html).toContain('kể từ ngày đến Hàn Quốc');
    expect(html).toMatch(/data-testid="quest-arrival-open"[^>]*>[\s\S]*?<\/svg>Sửa ngày đến</);
  });

  it('without arrival date shows open button and no D+N', () => {
    const html = render();
    expect(html).not.toContain('data-testid="quest-dplus"');
    expect(html).toContain('data-testid="quest-arrival-open"');
    expect(html).toContain('Nhập ngày đến Hàn Quốc');
    expect(html).not.toContain('📅');
    expect(html).not.toContain('data-testid="quest-arrival-input"');
  });

  it('corrupt arrival value is ignored', () => {
    const html = render(undefined, '2026-02-30');
    expect(html).not.toContain('data-testid="quest-dplus"');
  });

  it('day 3 shows module link to the form guide', () => {
    const html = render('[1,2]');
    expect(html).toMatch(/<a[^>]*data-testid="quest-link"[^>]*href="#\/form"|<a[^>]*href="#\/form"[^>]*data-testid="quest-link"/);
    expect(html).toContain('신청서 작성 도움 보기');
  });

  it('day 1 has no module link', () => {
    const html = render('[1]');
    expect(html).not.toContain('data-testid="quest-link"');
  });

  it('say block has big-card button and no speak button on server render', () => {
    const html = render();
    expect(html).toContain('data-testid="quest-say-big"');
    expect(html).toContain('Hiện chữ lớn');
    expect(html).not.toContain('🔍');
    expect(html).not.toContain('data-testid="quest-say-speak"');
    expect(html).not.toContain('data-testid="big-card"');
  });

  it('today card has label and primary complete button', () => {
    const html = render();
    expect(html).toContain('Hôm nay · Ngày 1');
    expect(html).toMatch(/<button[^>]*class="btn btn-primary[^"]*btn-block[^"]*"[^>]*data-testid="quest-complete"|<button[^>]*data-testid="quest-complete"[^>]*class="btn btn-primary[^"]*btn-block/);
    expect(html).toMatch(/<main[^>]*class="screen quest"/);
  });

  it('screen text avoids judgement words', () => {
    for (const seed of [undefined, '[1,2]', '[1,2,3,4,5,6,7,8,9]', '[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30]']) {
      expect(render(seed, '2026-10-19')).not.toMatch(/틀렸|잘못|위반|불법/);
    }
  });

  it('ru provider renders Russian UI and content with Korean kept', () => {
    const ru = langValue('ru');
    const html = renderToString(
      <LangContext.Provider value={ru}>
        <QuestScreen storage={memoryStorage(undefined, '2026-10-19')} now={NOW} />
      </LangContext.Provider>,
    );
    const day1 = questView(QUESTS[0], 'ru');
    expect(html).toContain(ru.ui.questTitle);
    expect(html).toMatch(/data-testid="quest-progress"[^>]*>День 1 \/ 30</);
    expect(html).toContain(ru.ui.questComplete);
    expect(html).toContain(ru.ui.questReset);
    expect(html).toContain(ru.ui.questDplusNote);
    expect(html).toContain(`${ru.ui.questToday} · ${ru.ui.questDay(1)}`);
    expect(html).toContain(`${day1.title} <span lang="ko" class="quest-title-ko">${day1.titleKo}</span>`);
    expect(html).toContain(day1.sayPron);
    expect(html).toContain('유심 개통하기');
    expect(html).not.toMatch(/Nhiệm vụ|Hoàn thành|Làm lại từ đầu|Ở đâu|Hôm nay|Ngày \d/);
  });

  it('ru provider renders Russian all-done text with Korean kept', () => {
    const ru = langValue('ru');
    const html = renderToString(
      <LangContext.Provider value={ru}>
        <QuestScreen storage={memoryStorage('[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30]')} now={NOW} />
      </LangContext.Provider>,
    );
    expect(html).toContain(plain(ru.ui.questAllDone(30)));
    expect(html).toContain('30일 퀘스트를 모두 마쳤어요.');
    expect(html).not.toContain('Bạn đã hoàn thành');
  });

  it('no storage error note on normal render', () => {
    expect(render()).not.toContain('data-testid="quest-storage-error"');
    expect(render()).not.toContain('data-testid="quest-arrival-synced"');
  });
});

function quotaError(): Error {
  const e = new Error('full');
  e.name = 'QuotaExceededError';
  return e;
}

function throwingStorage(err: unknown): ProgressStorage {
  return {
    getItem: () => null,
    setItem: () => {
      throw err;
    },
    removeItem: () => {
      throw err;
    },
  };
}

function stayRepo(initial: StayProfile | null): StayRepoLike & { puts: StayProfile[] } {
  let cur = initial;
  const puts: StayProfile[] = [];
  return {
    puts,
    get: async () => cur,
    put: async (p) => {
      puts.push(p);
      cur = p;
    },
  };
}

const TODAY = '2026-10-23';

describe('QuestScreen storage writes', () => {
  it('tryStorageWrite returns null on success', () => {
    const s = memoryStorage();
    expect(tryStorageWrite(() => s.setItem(PROGRESS_KEY, '[1]'))).toBeNull();
    expect(s.getItem(PROGRESS_KEY)).toBe('[1]');
  });

  it('tryStorageWrite classifies quota and unknown failures', () => {
    expect(tryStorageWrite(() => throwingStorage(quotaError()).setItem(PROGRESS_KEY, '[1]'))).toBe('quota');
    expect(tryStorageWrite(() => throwingStorage({ code: 22 }).removeItem(PROGRESS_KEY))).toBe('quota');
    expect(tryStorageWrite(() => throwingStorage(new Error('x')).setItem(PROGRESS_KEY, '[1]'))).toBe('unknown');
  });

  it('arrival save failure reports error and does not touch stay profile', async () => {
    const repo = stayRepo({ id: 'me', ...EMPTY_STAY_PROFILE });
    const res = saveArrivalWithSync(throwingStorage(quotaError()), '2026-10-19', TODAY, repo);
    expect(res.error).toBe('quota');
    expect(await res.synced).toBe(false);
    expect(repo.puts).toHaveLength(0);
  });

  it('arrival save success fills empty stay entry date', async () => {
    const s = memoryStorage();
    const repo = stayRepo({ id: 'me', ...EMPTY_STAY_PROFILE });
    const res = saveArrivalWithSync(s, '2026-10-19', TODAY, repo);
    expect(res.error).toBeNull();
    expect(s.getItem(ARRIVAL_KEY)).not.toBeNull();
    expect(await res.synced).toBe(true);
    expect(repo.puts[0]?.entryDate).toBe('2026-10-19');
  });

  it('arrival save without stay profile does not create one', async () => {
    const repo = stayRepo(null);
    const res = saveArrivalWithSync(memoryStorage(), '2026-10-19', TODAY, repo);
    expect(res.error).toBeNull();
    expect(await res.synced).toBe(false);
    expect(repo.puts).toHaveLength(0);
  });

  it('arrival save keeps existing stay entry date', async () => {
    const repo = stayRepo({ id: 'me', ...EMPTY_STAY_PROFILE, entryDate: '2026-10-01' });
    const res = saveArrivalWithSync(memoryStorage(), '2026-10-19', TODAY, repo);
    expect(await res.synced).toBe(false);
    expect(repo.puts).toHaveLength(0);
  });
});
