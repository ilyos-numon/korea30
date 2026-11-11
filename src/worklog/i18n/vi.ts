import type { WorklogStrings } from './types';

/** null nếu không phải số */
function toNum(v: number | string): number | null {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

const cnt = (v: number | string): string => String(toNum(v) ?? (String(v) || '-'));

const won = (v: number | string): string => {
  const n = toNum(v);
  return n === null ? `${String(v) || '-'} won` : `${n.toLocaleString('vi-VN')} won`;
};

const hoursMinutes = (v: number | string): string => {
  const n = toNum(v);
  if (n === null) return `${String(v) || '-'} phút`;
  const h = Math.floor(Math.abs(n) / 60);
  const m = Math.abs(n) % 60;
  return `${n < 0 ? '-' : ''}${h} giờ ${m} phút`;
};

export const vi: WorklogStrings = {
  title: 'Nhật ký làm việc',
  intro: 'Ghi giờ vào làm và giờ tan làm để ước tính lương tháng này. Nội dung bạn nhập chỉ được lưu trên thiết bị này.',
  month: 'Chọn tháng',
  shiftHeading: 'Thêm ca làm',
  shiftDate: 'Ngày',
  shiftStart: 'Giờ vào làm',
  shiftEnd: 'Giờ tan làm',
  shiftBreak: 'Thời gian nghỉ (phút)',
  shiftHoliday: 'Tôi đã làm vào ngày nghỉ',
  shiftMemo: 'Ghi chú',
  shiftOvernightHint: 'Nếu giờ tan làm sớm hơn giờ vào làm, sẽ tính là tan làm vào ngày hôm sau.',
  shiftAdd: 'Thêm ca',
  errBadDate: 'Hãy kiểm tra lại ngày.',
  errBadTime: 'Hãy kiểm tra lại giờ.',
  errZeroLength: 'Giờ vào làm và giờ tan làm giống nhau.',
  errTooLong: 'Một ca làm dài hơn 16 giờ. Hãy kiểm tra lại giờ.',
  errBreakTooLong: 'Thời gian nghỉ dài hơn thời gian làm việc.',
  errBadBreak: 'Hãy nhập thời gian nghỉ là số nguyên từ 0 trở lên (phút).',
  errFuture: 'Không thể ghi ngày sau hôm nay.',
  listHeading: 'Các ca tháng này',
  empty: 'Tháng này chưa có ca nào. Hãy thêm giờ vào làm và tan làm ở trên.',
  breakMinutes: (v) => `Nghỉ ${toNum(v) ?? (String(v) || '-')} phút`,
  holidayTag: 'Ngày nghỉ',
  delete: 'Xóa',
  profileHeading: 'Lương giờ và nơi làm việc',
  wage: 'Lương giờ (won)',
  wageHint: 'Hãy nhập lương giờ ghi trong hợp đồng lao động hoặc bảng lương.',
  size: (v) => `Nơi làm việc có từ ${cnt(v)} người trở lên`,
  sizeYes: (v) => `Từ ${cnt(v)} người trở lên`,
  sizeNo: (v) => `Dưới ${cnt(v)} người`,
  sizeUnknown: 'Tôi không rõ',
  weekStart: 'Ngày bắt đầu tuần',
  weekStartMon: 'Thứ Hai',
  weekStartSun: 'Chủ Nhật',
  detailsHeading: 'Thông tin của bạn và nơi làm việc (cho bản nháp đơn khiếu nại)',
  detailsHint: 'Để trống vẫn tính được. Chỉ dùng trong bản nháp đơn khiếu nại.',
  workerName: 'Họ tên',
  workerBirth: 'Ngày sinh',
  workerPhone: 'Số điện thoại',
  workerAddress: 'Địa chỉ',
  companyName: 'Tên nơi làm việc',
  employerName: 'Người đại diện',
  employerAddress: 'Địa chỉ nơi làm việc',
  employerPhone: 'Số điện thoại nơi làm việc',
  startDate: 'Ngày vào làm',
  endDate: 'Ngày nghỉ việc',
  profileSave: 'Lưu',
  profileSaved: 'Đã lưu.',
  errWage: 'Hãy chỉ nhập số cho lương giờ.',
  totalsHeading: 'Tính toán tháng này',
  totalWorked: 'Tổng giờ làm',
  totalRegular: 'Giờ làm quy định',
  totalOvertime: 'Làm thêm giờ',
  totalNight: 'Làm ca đêm',
  totalHoliday: 'Làm ngày nghỉ',
  basePay: 'Lương cơ bản',
  premiumPay: 'Phụ cấp cộng thêm',
  expectedGross: 'Lương dự kiến (trước thuế)',
  hoursMinutes,
  won,
  wageMissing: 'Lưu lương giờ để tính số tiền.',
  minWageWarning: (v) => `Lương giờ bạn nhập thấp hơn lương tối thiểu năm nay (${won(v)}). Hãy kiểm tra lại.`,
  noteSmallWorkplaceNoPremium: (v) =>
    `Với nơi làm việc dưới ${cnt(v)} người, phụ cấp làm thêm giờ, ca đêm và ngày nghỉ không được đưa vào tính toán.`,
  noteWorkplaceSizeUnknown: (v) =>
    `Vì không rõ số người ở nơi làm việc nên đã tính cả phụ cấp cộng thêm. Nếu dưới ${cnt(v)} người, kết quả có thể khác.`,
  noteBelowMinWage: 'Lương giờ thấp hơn lương tối thiểu. Hãy kiểm tra lại.',
  noteWeeklyHolidayPayNotIncluded: 'Phụ cấp ngày nghỉ hằng tuần không có trong phần tính này.',
  compareHeading: 'So sánh với bảng lương',
  compareHint: 'Nhập số tiền trên bảng lương tháng này để xem chênh lệch so với tính toán.',
  compareEarnings: 'Khoản trả',
  compareDeductions: 'Khấu trừ',
  compareRun: 'So sánh',
  errRequired: 'Hãy nhập số (nếu không có thì nhập 0)',
  errNotNumber: 'Chỉ nhập số',
  errTooLarge: 'Hãy nhập không quá 100 triệu won',
  compareExpected: 'Tính từ nhật ký làm việc',
  compareReported: 'Tổng chịu thuế trên bảng lương',
  compareDiff: 'Chênh lệch so với tính toán',
  statusMatch: 'Gần như giống với tính toán.',
  statusLower: 'Bảng lương thấp hơn tính toán. Hãy kiểm tra lại.',
  statusHigher: 'Bảng lương cao hơn tính toán.',
  unpaidEstimate: 'Số tiền ước tính chưa được trả',
  deductionMismatch: (v) => `Có ${toNum(v) ?? (String(v) || '-')} khoản khấu trừ khác với tính toán. Hãy kiểm tra lại.`,
  ask1350: 'Nếu cần đánh giá, hãy hỏi 1350 (Trung tâm tư vấn Bộ Việc làm và Lao động).',
  statementHeading: 'Nội dung khiếu nại (bản nháp)',
  statementHint: 'Phần này được đưa vào PDF bằng tiếng Hàn. Bạn có thể tự sửa.',
  statementReset: 'Khôi phục câu gợi ý',
  pdf: 'Tạo PDF bằng chứng',
  pdfHint: 'Gộp nhật ký giờ làm, tính toán theo tháng, so sánh bảng lương và bản nháp đơn khiếu nại thành một tệp. Chỉ tạo trên thiết bị này.',
  pdfBusy: 'Đang tạo PDF…',
  pdfErrorEmpty: 'Chưa có ca làm nào nên không thể tạo PDF.',
  pdfErrorLibrary: 'Không tạo được PDF. Hãy thử lại sau ít phút.',
  wipe: 'Xóa toàn bộ nhật ký làm việc',
  wipeAsk: 'Xóa toàn bộ nhật ký làm việc, lương giờ và thông tin nơi làm việc đã lưu trên thiết bị này?',
  wipeConfirm: 'Xóa tất cả',
  wipeCancel: 'Hủy',
  wiped: 'Đã xóa toàn bộ nhật ký làm việc.',
};
