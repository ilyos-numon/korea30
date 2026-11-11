export type TermCategory = 'pay' | 'insurance' | 'admin';

export interface Term {
  id: string;
  category: TermCategory;
  ko: string;
  vi: string;
  explainKo: string;
  explainVi: string;
  askExpert: boolean;
}

export const TERM_CATEGORY_LABEL: Readonly<Record<TermCategory, { ko: string; vi: string }>> = {
  pay: { ko: '급여', vi: 'Lương' },
  insurance: { ko: '보험·세금', vi: 'Bảo hiểm · Thuế' },
  admin: { ko: '행정', vi: 'Hành chính' },
};

export const TERMS: readonly Term[] = [
  {
    id: 'base-pay',
    category: 'pay',
    ko: '기본급',
    vi: 'Lương cơ bản',
    explainKo: '수당을 빼고 정해진 기본 월급.',
    explainVi: 'Tiền lương tháng cố định, chưa tính các khoản phụ cấp.',
    askExpert: false,
  },
  {
    id: 'overtime',
    category: 'pay',
    ko: '연장근로수당',
    vi: 'Phụ cấp làm thêm giờ',
    explainKo: '정해진 근로시간보다 더 일한 시간에 대해 주는 돈.',
    explainVi: 'Tiền trả cho số giờ làm nhiều hơn giờ làm việc quy định.',
    askExpert: false,
  },
  {
    id: 'night',
    category: 'pay',
    ko: '야간근로수당',
    vi: 'Phụ cấp làm ca đêm',
    explainKo: '밤 10시부터 아침 6시 사이에 일한 시간에 대해 더 주는 돈.',
    explainVi: 'Tiền trả thêm cho giờ làm từ 10 giờ tối đến 6 giờ sáng.',
    askExpert: false,
  },
  {
    id: 'holiday',
    category: 'pay',
    ko: '휴일근로수당',
    vi: 'Phụ cấp làm ngày nghỉ',
    explainKo: '쉬는 날에 일한 시간에 대해 더 주는 돈.',
    explainVi: 'Tiền trả thêm cho giờ làm vào ngày nghỉ.',
    askExpert: false,
  },
  {
    id: 'weekly-holiday',
    category: 'pay',
    ko: '주휴수당',
    vi: 'Phụ cấp ngày nghỉ hằng tuần',
    explainKo: '한 주에 정해진 날을 다 일하면 받는 하루치 유급 휴일 수당. 보통 주 15시간 이상 일할 때 해당돼요.',
    explainVi:
      'Đi làm đủ các ngày quy định trong tuần thì được trả lương thêm một ngày nghỉ. Thường áp dụng khi làm từ 15 giờ mỗi tuần trở lên.',
    askExpert: false,
  },
  {
    id: 'meal',
    category: 'pay',
    ko: '식대',
    vi: 'Tiền ăn',
    explainKo: '밥값으로 주는 돈. 일정 한도까지는 세금을 매기지 않아요.',
    explainVi: 'Tiền hỗ trợ ăn uống. Trong một mức nhất định thì không bị tính thuế.',
    askExpert: false,
  },
  {
    id: 'bonus',
    category: 'pay',
    ko: '상여금',
    vi: 'Tiền thưởng',
    explainKo: '월급 외에 정해진 때에 더 주는 돈(보너스).',
    explainVi: 'Tiền trả thêm ngoài lương tháng vào thời điểm đã định (tiền thưởng).',
    askExpert: false,
  },
  {
    id: 'severance',
    category: 'pay',
    ko: '퇴직금',
    vi: 'Trợ cấp thôi việc',
    explainKo: '같은 회사에서 1년 이상 일하고 그만둘 때 받는 돈.',
    explainVi: 'Tiền nhận khi nghỉ việc sau khi đã làm ở cùng một công ty từ 1 năm trở lên.',
    askExpert: false,
  },
  {
    id: 'min-wage',
    category: 'pay',
    ko: '최저임금',
    vi: 'Lương tối thiểu',
    explainKo: '법으로 정한 시간당 가장 낮은 임금. 매년 바뀌어요.',
    explainVi: 'Mức lương theo giờ thấp nhất do luật quy định. Thay đổi mỗi năm.',
    askExpert: false,
  },
  {
    id: 'ordinary-wage',
    category: 'pay',
    ko: '통상임금',
    vi: 'Lương thông thường',
    explainKo: '정해진 일에 대해 정기적으로 똑같이 주는 임금. 연장·야간 수당 계산의 기준이 돼요.',
    explainVi: 'Tiền lương trả đều đặn, cố định cho công việc đã định. Dùng làm cơ sở tính phụ cấp làm thêm giờ, ca đêm.',
    askExpert: false,
  },
  {
    id: 'total-pay',
    category: 'pay',
    ko: '지급총액',
    vi: 'Tổng tiền lương',
    explainKo: '공제하기 전, 이번 달에 받을 돈을 모두 더한 금액.',
    explainVi: 'Tổng tất cả các khoản nhận trong tháng này, trước khi khấu trừ.',
    askExpert: false,
  },
  {
    id: 'deduction',
    category: 'pay',
    ko: '공제',
    vi: 'Khấu trừ',
    explainKo: '월급에서 보험료·세금 등을 미리 빼는 것.',
    explainVi: 'Trừ trước tiền bảo hiểm, thuế… từ lương tháng.',
    askExpert: false,
  },
  {
    id: 'net-pay',
    category: 'pay',
    ko: '실수령액',
    vi: 'Lương thực nhận',
    explainKo: '공제하고 실제로 통장에 들어오는 돈.',
    explainVi: 'Số tiền thật sự vào tài khoản sau khi khấu trừ.',
    askExpert: false,
  },
  {
    id: 'payslip',
    category: 'pay',
    ko: '급여명세서',
    vi: 'Bảng lương',
    explainKo: '이번 달 월급과 공제 내역을 적은 종이나 파일.',
    explainVi: 'Giấy hoặc tệp ghi lương tháng này và các khoản khấu trừ.',
    askExpert: false,
  },
  {
    id: 'contract',
    category: 'pay',
    ko: '근로계약서',
    vi: 'Hợp đồng lao động',
    explainKo: '임금·근로시간·휴일 등 일하는 조건을 적은 계약서. 한 부는 근로자가 받아요.',
    explainVi: 'Văn bản ghi điều kiện làm việc như lương, giờ làm, ngày nghỉ. Người lao động được giữ một bản.',
    askExpert: false,
  },
  {
    id: 'taxable',
    category: 'pay',
    ko: '과세',
    vi: 'Chịu thuế',
    explainKo: '세금을 매기는 돈.',
    explainVi: 'Khoản tiền bị tính thuế.',
    askExpert: false,
  },
  {
    id: 'non-taxable',
    category: 'pay',
    ko: '비과세',
    vi: 'Không chịu thuế',
    explainKo: '세금을 매기지 않는 돈. 예: 한도 안의 식대.',
    explainVi: 'Khoản tiền không bị tính thuế. Ví dụ: tiền ăn trong mức cho phép.',
    askExpert: false,
  },
  {
    id: 'four-ins',
    category: 'insurance',
    ko: '4대보험',
    vi: '4 loại bảo hiểm xã hội',
    explainKo: '국민연금·건강보험·고용보험·산재보험 네 가지 사회보험.',
    explainVi: 'Bốn loại bảo hiểm xã hội: lương hưu quốc dân, y tế, việc làm, tai nạn lao động.',
    askExpert: false,
  },
  {
    id: 'pension',
    category: 'insurance',
    ko: '국민연금',
    vi: 'Lương hưu quốc dân',
    explainKo: '나이 들었을 때 등을 위한 연금 보험. 월급에서 일정 비율을 내요.',
    explainVi: 'Bảo hiểm hưu trí cho lúc về già. Đóng theo một tỷ lệ nhất định từ lương tháng.',
    askExpert: false,
  },
  {
    id: 'health',
    category: 'insurance',
    ko: '건강보험',
    vi: 'Bảo hiểm y tế',
    explainKo: '병원비 일부를 보험이 내 주는 제도. 월급에서 일정 비율을 내요.',
    explainVi: 'Bảo hiểm trả một phần viện phí. Đóng theo một tỷ lệ nhất định từ lương tháng.',
    askExpert: false,
  },
  {
    id: 'ltc',
    category: 'insurance',
    ko: '장기요양보험',
    vi: 'Bảo hiểm chăm sóc dài hạn',
    explainKo: '나이 들거나 아파서 돌봄이 필요할 때를 위한 보험. 건강보험료와 함께 내요.',
    explainVi: 'Bảo hiểm cho lúc già hoặc ốm cần người chăm sóc. Đóng cùng với bảo hiểm y tế.',
    askExpert: false,
  },
  {
    id: 'employment',
    category: 'insurance',
    ko: '고용보험',
    vi: 'Bảo hiểm việc làm',
    explainKo: '일자리를 잃었을 때 등을 위한 보험. 월급에서 일정 비율을 내요.',
    explainVi: 'Bảo hiểm cho lúc mất việc. Đóng theo một tỷ lệ nhất định từ lương tháng.',
    askExpert: false,
  },
  {
    id: 'industrial',
    category: 'insurance',
    ko: '산재보험',
    vi: 'Bảo hiểm tai nạn lao động',
    explainKo: '일하다 다치거나 병이 났을 때 치료비 등을 주는 보험. 보험료는 회사가 내요.',
    explainVi: 'Bảo hiểm trả tiền chữa trị khi bị thương hoặc bị bệnh do làm việc. Công ty đóng phí.',
    askExpert: false,
  },
  {
    id: 'income-tax',
    category: 'insurance',
    ko: '소득세',
    vi: 'Thuế thu nhập',
    explainKo: '번 돈에 매기는 세금. 월급에서 미리 떼요.',
    explainVi: 'Thuế tính trên tiền kiếm được. Được trừ trước từ lương tháng.',
    askExpert: false,
  },
  {
    id: 'local-tax',
    category: 'insurance',
    ko: '지방소득세',
    vi: 'Thuế thu nhập địa phương',
    explainKo: '소득세에 붙는 지방세. 보통 소득세의 10%예요.',
    explainVi: 'Thuế địa phương tính kèm thuế thu nhập. Thường bằng 10% thuế thu nhập.',
    askExpert: false,
  },
  {
    id: 'year-end',
    category: 'insurance',
    ko: '연말정산',
    vi: 'Quyết toán thuế cuối năm',
    explainKo: '1년 동안 낸 소득세를 다음 해 초에 다시 계산해, 더 냈으면 돌려받고 덜 냈으면 더 내는 것.',
    explainVi:
      'Đầu năm sau tính lại thuế thu nhập đã nộp trong 1 năm. Nộp thừa thì được trả lại, nộp thiếu thì nộp thêm.',
    askExpert: false,
  },
  {
    id: 'arc-reg',
    category: 'admin',
    ko: '외국인등록',
    vi: 'Đăng ký người nước ngoài',
    explainKo: '90일 넘게 머무는 외국인이 출입국·외국인관서에 등록하는 것.',
    explainVi: 'Người nước ngoài ở quá 90 ngày đăng ký tại cơ quan xuất nhập cảnh.',
    askExpert: false,
  },
  {
    id: 'arc-card',
    category: 'admin',
    ko: '외국인등록증',
    vi: 'Thẻ đăng ký người nước ngoài',
    explainKo: '외국인등록을 하면 받는 신분증. 보통 3~4주 걸려요.',
    explainVi: 'Thẻ tùy thân nhận được sau khi đăng ký người nước ngoài. Thường mất 3~4 tuần.',
    askExpert: false,
  },
  {
    id: 'arc-no',
    category: 'admin',
    ko: '외국인등록번호',
    vi: 'Số đăng ký người nước ngoài',
    explainKo: '외국인등록증에 적힌 13자리 번호. 은행·병원·휴대폰에서 써요.',
    explainVi: 'Dãy 13 số ghi trên thẻ đăng ký người nước ngoài. Dùng ở ngân hàng, bệnh viện, khi làm điện thoại.',
    askExpert: false,
  },
  {
    id: 'residence',
    category: 'admin',
    ko: '체류지',
    vi: 'Nơi cư trú',
    explainKo: '한국에서 실제로 사는 곳의 주소.',
    explainVi: 'Địa chỉ nơi bạn thật sự sống ở Hàn Quốc.',
    askExpert: false,
  },
  {
    id: 'stay-status',
    category: 'admin',
    ko: '체류자격',
    vi: 'Tư cách lưu trú',
    explainKo: '한국에 머무는 목적에 따라 정해진 자격(비자 종류).',
    explainVi: 'Tư cách được định theo mục đích ở lại Hàn Quốc (loại visa).',
    askExpert: true,
  },
  {
    id: 'stay-ext',
    category: 'admin',
    ko: '체류기간 연장',
    vi: 'Gia hạn thời gian lưu trú',
    explainKo: '허가된 체류 기간을 늘리는 신청.',
    explainVi: 'Đơn xin kéo dài thời gian lưu trú đã được cho phép.',
    askExpert: true,
  },
  {
    id: 'workplace-change',
    category: 'admin',
    ko: '사업장 변경',
    vi: 'Chuyển nơi làm việc',
    explainKo: '일하는 회사를 바꾸는 것. 조건과 절차가 정해져 있어요.',
    explainVi: 'Đổi sang công ty khác để làm việc. Có điều kiện và thủ tục quy định.',
    askExpert: true,
  },
  {
    id: 'immigration',
    category: 'admin',
    ko: '출입국·외국인관서',
    vi: 'Cơ quan xuất nhập cảnh',
    explainKo: '외국인등록·체류 업무를 하는 정부 사무소.',
    explainVi: 'Văn phòng nhà nước làm việc đăng ký người nước ngoài và lưu trú.',
    askExpert: false,
  },
  {
    id: 'hikorea',
    category: 'admin',
    ko: '하이코리아',
    vi: 'HiKorea (trang web xuất nhập cảnh)',
    explainKo: '출입국 업무 방문 예약과 민원을 하는 정부 누리집.',
    explainVi: 'Trang web của nhà nước để đặt lịch đến cơ quan xuất nhập cảnh và nộp hồ sơ.',
    askExpert: false,
  },
  {
    id: 'biz-no',
    category: 'admin',
    ko: '사업자등록번호',
    vi: 'Mã số đăng ký kinh doanh',
    explainKo: '회사마다 있는 10자리 번호. 신청서 근무처 칸에 써요.',
    explainVi: 'Dãy 10 số riêng của mỗi công ty. Ghi vào ô nơi làm việc trong đơn.',
    askExpert: false,
  },
  {
    id: 'employment-cert',
    category: 'admin',
    ko: '재직증명서',
    vi: 'Giấy xác nhận đang làm việc',
    explainKo: '이 회사에서 일하고 있다는 것을 회사가 확인해 주는 서류.',
    explainVi: 'Giấy công ty xác nhận bạn đang làm việc ở công ty đó.',
    askExpert: false,
  },
  {
    id: 'receipt',
    category: 'admin',
    ko: '접수증',
    vi: 'Giấy biên nhận hồ sơ',
    explainKo: '신청서를 냈다는 것을 확인해 주는 종이. 등록증이 나올 때까지 잘 보관해요.',
    explainVi: 'Giấy xác nhận bạn đã nộp đơn. Giữ cẩn thận cho đến khi nhận thẻ.',
    askExpert: false,
  },
  {
    id: 'account',
    category: 'admin',
    ko: '통장',
    vi: 'Sổ tài khoản ngân hàng',
    explainKo: '은행 계좌. 월급을 받을 때 필요해요.',
    explainVi: 'Tài khoản ngân hàng. Cần để nhận lương.',
    askExpert: false,
  },
  {
    id: 'check-card',
    category: 'admin',
    ko: '체크카드',
    vi: 'Thẻ ghi nợ',
    explainKo: '통장에 있는 돈만큼 바로 쓰는 카드.',
    explainVi: 'Thẻ dùng ngay số tiền đang có trong tài khoản.',
    askExpert: false,
  },
];

/** NFD → 결합 부호 제거 → đ/Đ → d → 소문자 → 연속 공백 1개 → trim */
export function normalizeVi(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** 한국어도 normalizeVi 를 거쳐 질의와 같은 (NFD) 형태로 비교한다. */
export function searchTerms(query: string, terms: readonly Term[] = TERMS): Term[] {
  const q = normalizeVi(query);
  if (q === '') return [...terms];
  const first: Term[] = [];
  const second: Term[] = [];
  for (const t of terms) {
    if (normalizeVi(t.vi).includes(q) || normalizeVi(t.ko).includes(q)) first.push(t);
    else if (normalizeVi(t.explainVi).includes(q) || normalizeVi(t.explainKo).includes(q)) second.push(t);
  }
  return [...first, ...second];
}
