import { describe, expect, it } from 'vitest';
import { plain, vars } from './text';

describe('plain', () => {
  it.each([
    ['☎ Trợ giúp', 'Trợ giúp'],
    ['📅 Nhập ngày đến Hàn Quốc', 'Nhập ngày đến Hàn Quốc'],
    ['🔒 Hãy hoàn thành Ngày 1 trước.', 'Hãy hoàn thành Ngày 1 trước.'],
    ['🎉 Bạn đã hoàn thành cả 10 ngày!', 'Bạn đã hoàn thành cả 10 ngày!'],
    ['🙋 Cần hỏi chuyên gia', 'Cần hỏi chuyên gia'],
    ['🚨 Khẩn cấp', 'Khẩn cấp'],
    ['Hộ chiếu → Đơn', 'Hộ chiếu → Đơn'],
    ['Ngày 2 / 10', 'Ngày 2 / 10'],
    ['ไทย', 'ไทย'],
    ['外国人登录 ✅', '外国人登录'],
  ])('%s → %s', (input, out) => {
    expect(plain(input)).toBe(out);
  });

  it('vars passes custom properties through', () => {
    expect(vars({ '--i': 3 })).toEqual({ '--i': 3 });
  });
});
