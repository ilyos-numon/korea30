import { ARC_FORM_FIELDS } from '../../forms/arcForm';
import type { PassportStrings } from './types';

const FIELD: Readonly<Record<string, string>> = Object.fromEntries(ARC_FORM_FIELDS.map((f) => [f.id, f.labelVi]));

export const vi: PassportStrings = {
  title: 'Quét hộ chiếu',
  intro: 'Đọc hai dòng ở cuối hộ chiếu và điền sẵn bản nháp Đơn đăng ký người nước ngoài.',
  privacyTitle: 'Thông tin hộ chiếu chỉ ở trên máy này',
  privacyBody:
    'Ảnh và thông tin hộ chiếu chỉ được đọc trên máy này. Không lưu lại và không gửi đi đâu cả. Tải lại trang là mất.',
  scanHeading: 'Đọc từ ảnh',
  choosePhoto: 'Chụp hoặc chọn ảnh',
  photoHint: 'Hãy chụp trang ảnh của hộ chiếu sao cho hai dòng cuối (<<<) thật rõ.',
  reading: (percent) => `Đang đọc… ${percent}%`,
  readDone: 'Đã đọc xong. Hãy kiểm tra chữ bên dưới.',
  ocrFailed: 'Không đọc được ảnh. Hãy dùng ảnh rõ hơn hoặc tự nhập hai dòng bên dưới.',
  pasteHeading: 'Hoặc tự nhập hai dòng',
  pasteHint: 'Nhập hoặc dán hai dòng ở cuối trang ảnh (mỗi dòng 44 ký tự).',
  parse: 'Đọc hai dòng',
  errEmpty: 'Hãy nhập hai dòng trước.',
  errNotTd3: 'Có vẻ đây không phải định dạng hộ chiếu (2 dòng, mỗi dòng 44 ký tự).',
  errChecksum: 'Có ký tự không khớp với số kiểm tra. Hãy so với hộ chiếu và sửa lại.',
  errUnreadable: 'Không đọc được hai dòng. Hãy kiểm tra lại các ký tự.',
  parsed: 'Đã điền thông tin hộ chiếu. Hãy kiểm tra tất cả các ô.',
  corrected: 'Một số ký tự đã được tự động sửa. Hãy so với hộ chiếu để kiểm tra.',
  fieldsHeading: 'Các ô trong đơn',
  fieldsHint: 'Bạn có thể sửa mọi ô.',
  fieldLabel: (fieldId) => FIELD[fieldId] ?? 'Mục',
  extraHeading: 'Thông tin không có trong hai dòng hộ chiếu',
  extraAddressKr: 'Địa chỉ tại Hàn Quốc',
  extraPhone: 'Số điện thoại di động',
  extraAddressHome: 'Địa chỉ ở nước nhà',
  extraWorkplace: 'Nơi làm việc',
  extraPassportIssueDate: 'Ngày cấp hộ chiếu',
  errRequired: 'Bắt buộc nhập',
  errBadDate: 'Hãy kiểm tra ngày',
  errBadPhone: 'Hãy kiểm tra số điện thoại',
  pdf: 'Tạo bản nháp PDF',
  pdfMaking: 'Đang tạo PDF…',
  pdfError: 'Không tạo được PDF. Hãy thử lại.',
  officialNotice:
    'Đây là mẫu tự làm dựa theo mẫu chính thức. Mẫu chính thức của cơ quan xuất nhập cảnh được ưu tiên.',
  ask1345: 'Có thắc mắc, hãy gọi 1345 để hỏi.',
};
