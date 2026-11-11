import { describe, expect, it } from 'vitest';
import { copyText } from './clipboard';

describe('copyText', () => {
  it('writeText 가 resolve 하면 true', async () => {
    const calls: string[] = [];
    const ok = await copyText('안녕', {
      writeText: (t: string) => {
        calls.push(t);
        return Promise.resolve();
      },
    });
    expect(ok).toBe(true);
    expect(calls).toEqual(['안녕']);
  });

  it('writeText 가 reject 하면 false', async () => {
    const ok = await copyText('x', { writeText: () => Promise.reject(new Error('denied')) });
    expect(ok).toBe(false);
  });

  it('writeText 가 동기 throw 하면 false', async () => {
    const ok = await copyText('x', {
      writeText: () => {
        throw new Error('boom');
      },
    });
    expect(ok).toBe(false);
  });

  it('clipboard 가 null 이면 false', async () => {
    expect(await copyText('x', null)).toBe(false);
  });
});
