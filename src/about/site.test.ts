import { describe, expect, it } from 'vitest';
import { normalizeContactEmail, POLICY_DATE } from './site';

describe('normalizeContactEmail', () => {
  it('trims surrounding whitespace', () => {
    expect(normalizeContactEmail(' help@example.com ')).toBe('help@example.com');
  });

  it.each<[unknown]>([[''], [undefined], [123], ['not-an-email'], ['a@b'], ['a b@c.d']])('%s → null', (raw) => {
    expect(normalizeContactEmail(raw)).toBeNull();
  });
});

describe('POLICY_DATE', () => {
  it('is YYYY-MM-DD', () => {
    expect(POLICY_DATE).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
