import type { PhotoStrings } from './types';

/** Trả về '-' khi giá trị trống (không bao giờ trả về chuỗi rỗng) */
const s = (v: unknown): string => {
  if (v === undefined || v === null) return '-';
  if (typeof v === 'number' && !Number.isFinite(v)) return '-';
  return String(v).trim() || '-';
};

export const vi: PhotoStrings = {
  heading: 'Ảnh ghi lại công việc',
  intro: 'Lưu ảnh cho thấy việc bạn đã làm (màn hình máy chấm công, bảng phân ca…) kèm ngày, ngay trên thiết bị này.',
  privacyNote: 'Ảnh chỉ được lưu trên thiết bị này. Thông tin vị trí và các thông tin khác của ảnh sẽ được xóa trước khi lưu.',
  dateLabel: 'Ngày làm việc',
  shiftLabel: 'Gắn với ca làm',
  shiftNone: 'Không gắn',
  shiftOption: (date, start, end) => `${s(date)} ${s(start)}–${s(end)}`,
  memoLabel: 'Ghi chú',
  camera: 'Chụp bằng camera',
  pick: 'Chọn ảnh',
  saving: 'Đang lưu…',
  saved: 'Đã lưu',
  errorNotImage: 'Chỉ có thể lưu tệp ảnh.',
  errorTooLarge: (mb) => `Ảnh quá lớn. Hãy chọn ảnh từ ${s(mb)} MB trở xuống.`,
  errorDecode: 'Không mở được ảnh này. Hãy chọn ảnh khác.',
  errorQuota: 'Bộ nhớ thiết bị không đủ. Hãy thử xóa bớt ảnh cũ.',
  errorUnknown: 'Không lưu được. Hãy thử lại.',
  empty: 'Tháng này chưa lưu ảnh nào.',
  takenOn: (date) => `Ngày chụp ${s(date)}`,
  takenOnSaved: (date) => `Ngày lưu ${s(date)} (không có ngày chụp)`,
  expiresOn: (date) => `Lưu đến ${s(date)}`,
  expiringSoon: (days) => `Còn ${s(days)} ngày là hết thời gian lưu`,
  linkedShift: (label) => `Ca làm đã gắn: ${s(label)}`,
  open: 'Xem lớn',
  close: 'Đóng',
  delete: 'Xóa',
  deleteAsk: 'Xóa ảnh này? Ảnh đã xóa không thể khôi phục.',
  deleteConfirm: 'Xóa',
  deleteCancel: 'Hủy',
  expiryEditLabel: 'Đổi ngày hết thời gian lưu',
  expirySave: 'Lưu ngày',
  expiryErrorFormat: 'Hãy nhập ngày theo dạng YYYY-MM-DD.',
  expiryErrorNotFuture: 'Hãy chọn một ngày sau hôm nay.',
  expiryCustomNote: 'Đây là ngày bạn tự đặt. Ngày này giữ nguyên dù cài đặt thời gian lưu thay đổi.',
  retentionHeading: 'Thời gian lưu ảnh',
  retentionLabel: 'Thời gian lưu (tháng)',
  retentionHint:
    'Đây là cài đặt của ứng dụng, không phải thời hạn theo luật. Hết thời gian này, ứng dụng sẽ hỏi bạn có muốn xóa ảnh không. Muốn giữ lâu hơn, hãy tăng thời gian lưu. Bằng chứng liên quan đến tiền lương có thể cần giữ lâu hơn, vì vậy hãy tăng thời gian lưu hoặc lưu riêng bằng PDF bằng chứng.',
  retentionSave: 'Lưu thời gian lưu',
  retentionSaved: (changed) => `Đã lưu. Đã tính lại ngày hết thời gian lưu của ${s(changed)} ảnh.`,
  retentionError: (min, max) => `Hãy nhập số từ ${s(min)} đến ${s(max)} tháng.`,
  retentionApplyAsk: (n) => `Nếu đổi như vậy, ${s(n)} ảnh sẽ hết thời gian lưu ngay. Ứng dụng sẽ hỏi bạn có muốn xóa không. Bạn có muốn đổi không?`,
  retentionApplyConfirm: 'Đổi',
  retentionApplyCancel: 'Hủy',
  purged: (n) => `Đã xóa ${s(n)} ảnh đã quá thời gian lưu.`,
  months: (n) => `${s(n)} tháng`,
  wipeIncludesPhotos: 'Xóa tất cả cũng xóa luôn các ảnh đã lưu.',
};
