import type { Bilingual } from '../quest/types';

export interface FormField {
  no: number;
  id: string;
  labelKo: string;
  labelVi: string;
  guide: Bilingual;
  example: string;
  askOfficer: boolean;
  span: 1 | 2;
}

export const ARC_FORM_TITLE: Bilingual = {
  vi: 'Đơn đăng ký người nước ngoài (mẫu giả lập)',
  ko: '외국인등록 신청서 (가상 샘플)',
};

export const ARC_FORM_FIELDS: readonly FormField[] = [
  {
    no: 1,
    id: 'apply-type',
    labelKo: '신청 구분',
    labelVi: 'Loại đơn',
    guide: {
      vi: 'Đánh dấu ✓ vào ô "외국인 등록" (đăng ký người nước ngoài). Có cần đánh dấu ô khác hay không, hãy hỏi cán bộ phụ trách.',
      ko: "'외국인 등록' 칸에 ✓ 표시해요. 다른 업무 칸이 필요한지는 담당 공무원에게 물어보세요.",
    },
    example: '☑ 외국인 등록',
    askOfficer: true,
    span: 2,
  },
  {
    no: 2,
    id: 'surname',
    labelKo: '성',
    labelVi: 'Họ',
    guide: {
      vi: 'Viết bằng chữ in hoa tiếng Anh, giống hệt hộ chiếu.',
      ko: '여권과 똑같이 영문 대문자로 써요.',
    },
    example: 'NGUYEN',
    askOfficer: false,
    span: 1,
  },
  {
    no: 3,
    id: 'given-names',
    labelKo: '명',
    labelVi: 'Tên đệm và tên',
    guide: {
      vi: 'Viết đúng tên như trong hộ chiếu, cách chữ cũng giống vậy.',
      ko: '여권에 적힌 이름 그대로, 띄어쓰기도 같게 써요.',
    },
    example: 'VAN A',
    askOfficer: false,
    span: 1,
  },
  {
    no: 4,
    id: 'birth',
    labelKo: '생년월일',
    labelVi: 'Ngày sinh',
    guide: {
      vi: 'Viết theo thứ tự năm-tháng-ngày. Khác với thứ tự ở Việt Nam (ngày/tháng/năm).',
      ko: '연도-월-일 순서로 써요. 베트남(일/월/연도)과 순서가 달라요.',
    },
    example: '1998.05.17',
    askOfficer: false,
    span: 1,
  },
  {
    no: 5,
    id: 'sex',
    labelKo: '성별',
    labelVi: 'Giới tính',
    guide: {
      vi: 'Nam đánh dấu ✓ vào 남(M), nữ đánh dấu ✓ vào 여(F).',
      ko: '남자는 남(M), 여자는 여(F)에 ✓ 표시해요.',
    },
    example: '☑ 남(M)',
    askOfficer: false,
    span: 1,
  },
  {
    no: 6,
    id: 'nationality',
    labelKo: '국적',
    labelVi: 'Quốc tịch',
    guide: {
      vi: 'Viết "Việt Nam" bằng tiếng Anh.',
      ko: '베트남이라고 영문으로 써요.',
    },
    example: 'VIETNAM',
    askOfficer: false,
    span: 1,
  },
  {
    no: 7,
    id: 'passport-no',
    labelKo: '여권번호',
    labelVi: 'Số hộ chiếu',
    guide: {
      vi: 'Chép đúng số ở góc trên bên phải của trang có ảnh trong hộ chiếu.',
      ko: '여권 사진이 있는 면의 오른쪽 위 번호를 그대로 써요.',
    },
    example: 'C1234567',
    askOfficer: false,
    span: 1,
  },
  {
    no: 8,
    id: 'passport-dates',
    labelKo: '여권 발급일자·유효기간',
    labelVi: 'Ngày cấp và ngày hết hạn hộ chiếu',
    guide: {
      vi: 'Viết hai ngày trong hộ chiếu theo thứ tự năm-tháng-ngày.',
      ko: '여권에 적힌 두 날짜를 연도-월-일 순서로 써요.',
    },
    example: '2024.01.10 / 2034.01.10',
    askOfficer: false,
    span: 2,
  },
  {
    no: 9,
    id: 'address-kr',
    labelKo: '대한민국 내 주소 (체류지)',
    labelVi: 'Địa chỉ tại Hàn Quốc (nơi ở)',
    guide: {
      vi: 'Viết địa chỉ ký túc xá hoặc nhà bạn đang ở, ghi đủ cả số tòa và số phòng. Nếu không biết, hãy chép y nguyên tin nhắn mà người phụ trách ở công ty gửi.',
      ko: '지금 사는 기숙사·집 주소를 동·호수까지 써요. 모르면 회사 담당자에게 받은 문자 그대로 옮겨 써요.',
    },
    example: '○○시 ○○구 ○○로 12, 301호',
    askOfficer: false,
    span: 2,
  },
  {
    no: 10,
    id: 'phone',
    labelKo: '휴대전화',
    labelVi: 'Số điện thoại di động',
    guide: {
      vi: 'Viết số điện thoại Hàn Quốc bạn đã mở ở Ngày 1.',
      ko: '1일 차에 개통한 한국 휴대폰 번호를 써요.',
    },
    example: '010-1234-5678',
    askOfficer: false,
    span: 1,
  },
  {
    no: 11,
    id: 'address-home',
    labelKo: '본국 주소',
    labelVi: 'Địa chỉ ở Việt Nam',
    guide: {
      vi: 'Viết địa chỉ nhà ở Việt Nam.',
      ko: '베트남 집 주소를 써요.',
    },
    example: 'Ha Noi, Viet Nam',
    askOfficer: false,
    span: 1,
  },
  {
    no: 12,
    id: 'workplace',
    labelKo: '근무처·사업자등록번호',
    labelVi: 'Nơi làm việc và mã số đăng ký kinh doanh',
    guide: {
      vi: 'Viết tên công ty và mã số đăng ký kinh doanh (10 chữ số). Số này có trong hợp đồng lao động, hoặc hãy hỏi người phụ trách ở công ty.',
      ko: '회사 이름과 사업자등록번호(10자리)를 써요. 근로계약서에 있거나 회사 담당자에게 물어보세요.',
    },
    example: '○○산업 / 123-45-67890',
    askOfficer: false,
    span: 2,
  },
  {
    no: 13,
    id: 'sign',
    labelKo: '신청일·서명',
    labelVi: 'Ngày nộp đơn và chữ ký',
    guide: {
      vi: 'Viết ngày hôm nay và ký tên giống chữ ký trong hộ chiếu.',
      ko: '오늘 날짜를 쓰고, 여권 서명과 같은 모양으로 서명해요.',
    },
    example: '2026.10.23 / (서명)',
    askOfficer: false,
    span: 2,
  },
];

export const CIRCLED: readonly string[] = Array.from({ length: 13 }, (_, i) =>
  String.fromCodePoint(0x2460 + i),
);
