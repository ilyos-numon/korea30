import { describe, expect, it } from 'vitest';
import { classifyStorageError } from './failure';

describe('classifyStorageError', () => {
  it('QuotaExceededError → quota', () => {
    expect(classifyStorageError(new DOMException('full', 'QuotaExceededError'))).toBe('quota');
  });
  it('{ code: 22 } → quota', () => {
    expect(classifyStorageError({ code: 22 })).toBe('quota');
  });
  it('new Error() → unknown', () => {
    expect(classifyStorageError(new Error())).toBe('unknown');
  });
  it('null → unknown', () => {
    expect(classifyStorageError(null)).toBe('unknown');
  });
});
