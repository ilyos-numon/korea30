import { describe, expect, it } from 'vitest';
import { INTRO_KEY, loadIntroSeen, saveIntroSeen } from './intro';
import type { ProgressStorage } from '../quest/progress';

function mem(init: Record<string, string> = {}): ProgressStorage & { data: Map<string, string> } {
  const data = new Map(Object.entries(init));
  return {
    data,
    getItem: (k) => (data.has(k) ? (data.get(k) as string) : null),
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

const broken: ProgressStorage = {
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('blocked');
  },
  removeItem: () => {},
};

describe('intro storage', () => {
  it('uses a versioned key', () => {
    expect(INTRO_KEY).toBe('korea30.intro.v1');
  });

  it('is unseen by default and seen after save', () => {
    const s = mem();
    expect(loadIntroSeen(s)).toBe(false);
    saveIntroSeen(s);
    expect(s.data.get(INTRO_KEY)).toBe('1');
    expect(loadIntroSeen(s)).toBe(true);
  });

  it('ignores other values', () => {
    expect(loadIntroSeen(mem({ [INTRO_KEY]: 'yes' }))).toBe(false);
  });

  it('survives storage errors', () => {
    expect(loadIntroSeen(broken)).toBe(false);
    expect(() => saveIntroSeen(broken)).not.toThrow();
  });
});
