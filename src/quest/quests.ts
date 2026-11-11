import type { QuestDay } from './types';
import { DAYS_11_20 } from './days11to20';
import { DAYS_21_30 } from './days21to30';

export const QUESTS: readonly QuestDay[] = [
  {
    day: 1,
    icon: '📱',
    title: { vi: 'Mở SIM điện thoại', ko: '유심 개통하기' },
    where: {
      vi: 'Quầy chuyển vùng của nhà mạng ở sân bay hoặc cửa hàng điện thoại gần nhất',
      ko: '공항 통신사 로밍센터 또는 가까운 휴대폰 대리점',
    },
    bring: [
      { vi: 'Hộ chiếu', ko: '여권' },
      { vi: 'Thẻ thanh toán hoặc tiền mặt', ko: '결제할 카드 또는 현금' },
    ],
    say: {
      ko: '선불 유심 개통하고 싶어요. 여권 여기 있어요.',
      viPron: 'Xơn-bul yu-xim ke-thông-ha-cô xi-pơ-yô. Yơ-quơn yơ-ghi ít-xơ-yô.',
      viMeaning: 'Tôi muốn mở SIM trả trước. Hộ chiếu của tôi đây.',
    },
    tip: {
      vi: 'Trước khi đăng ký người nước ngoài, thường chỉ dùng được gói cước trả trước.',
      ko: '외국인등록 전에는 선불 요금제만 되는 경우가 많아요.',
    },
  },
  {
    day: 2,
    icon: '🚇',
    title: { vi: 'Làm thẻ giao thông', ko: '교통카드 만들기' },
    where: {
      vi: 'Cửa hàng tiện lợi hoặc máy nạp thẻ giao thông ở ga tàu điện ngầm',
      ko: '편의점 또는 지하철역 교통카드 충전기',
    },
    bring: [
      { vi: 'Tiền mặt (nạp tiền hầu hết bằng tiền mặt)', ko: '현금 (충전은 대부분 현금)' },
    ],
    say: {
      ko: '교통카드 하나 주세요. 만 원 충전해 주세요.',
      viPron: 'Ghiô-thông-ca-đư ha-na chu-xê-yô. Man uôn chung-chơn-he chu-xê-yô.',
      viMeaning: 'Cho tôi một thẻ giao thông. Nạp giúp tôi 10.000 won.',
    },
    tip: {
      vi: 'Khi xuống xe buýt hay tàu điện ngầm cũng quẹt thẻ thì sẽ được giảm giá khi chuyển tuyến.',
      ko: '버스·지하철 내릴 때도 카드를 찍으면 환승 할인을 받아요.',
    },
  },
  {
    day: 3,
    icon: '📋',
    title: { vi: 'Nộp đơn đăng ký người nước ngoài', ko: '외국인등록 신청하기' },
    where: {
      vi: 'Văn phòng xuất nhập cảnh quản lý khu vực của bạn (đặt lịch hẹn trên HiKorea)',
      ko: '관할 출입국·외국인관서 (하이코리아에서 방문 예약)',
    },
    bring: [
      { vi: 'Hộ chiếu', ko: '여권' },
      { vi: '1 ảnh thẻ', ko: '사진 1장' },
      { vi: 'Địa chỉ ký túc xá', ko: '기숙사 주소' },
    ],
    say: {
      ko: '외국인등록 하러 왔어요.',
      viPron: 'Uê-cúc-in-đưng-rốc ha-rơ oát-xơ-yô.',
      viMeaning: 'Tôi đến để đăng ký người nước ngoài.',
    },
    tip: {
      vi: 'Thẻ đăng ký thường có sau khoảng 3–4 tuần. Về lưu trú và visa, hãy hỏi cán bộ phụ trách.',
      ko: '등록증은 보통 3~4주 뒤에 나와요. 체류·비자 판단은 담당 공무원에게 물어보세요.',
    },
    link: {
      route: 'form',
      label: { vi: '📝 Xem hướng dẫn điền đơn', ko: '신청서 작성 도움 보기' },
    },
  },
  {
    day: 4,
    icon: '🏦',
    title: { vi: 'Mở tài khoản ngân hàng', ko: '은행 통장 만들기' },
    where: {
      vi: 'Chi nhánh ngân hàng gần công ty hoặc ký túc xá (có chi nhánh có quầy riêng cho người nước ngoài)',
      ko: '회사나 기숙사 근처 은행 지점 (외국인 전용 창구가 있는 지점도 있어요)',
    },
    bring: [
      { vi: 'Hộ chiếu', ko: '여권' },
      { vi: 'Hợp đồng lao động hoặc giấy xác nhận đang làm việc', ko: '근로계약서 또는 재직증명서' },
      { vi: 'Điện thoại di động Hàn Quốc', ko: '한국 휴대폰' },
    ],
    say: {
      ko: '월급 받을 통장을 만들고 싶어요.',
      viPron: 'Uôl-gưp ba-đưl thông-chang-ưl man-đưl-cô xi-pơ-yô.',
      viMeaning: 'Tôi muốn mở tài khoản để nhận lương.',
    },
    tip: {
      vi: 'Mỗi ngân hàng cần giấy tờ khác nhau. Trước khi đi, hãy hỏi người phụ trách ở công ty. Đừng cho người khác biết mật khẩu.',
      ko: '은행마다 필요한 서류가 달라요. 가기 전에 회사 담당자에게 확인해 보세요. 비밀번호는 다른 사람에게 알려주지 마세요.',
    },
  },
  {
    day: 5,
    icon: '🏥',
    title: { vi: 'Kiểm tra tham gia bảo hiểm y tế', ko: '건강보험 가입 확인하기' },
    where: {
      vi: 'Người phụ trách ở công ty hoặc chi nhánh Cơ quan Bảo hiểm Y tế Quốc gia',
      ko: '회사 담당자 또는 국민건강보험공단 지사',
    },
    bring: [
      { vi: 'Hộ chiếu', ko: '여권' },
      { vi: 'Giấy biên nhận đơn đăng ký người nước ngoài (nếu có)', ko: '외국인등록 신청 접수증 (있으면)' },
    ],
    say: {
      ko: '제가 건강보험에 가입됐는지 확인하고 싶어요.',
      viPron: 'Chê-ga cơn-cang-bô-hơm-ê ca-ip-toét-nưn-chi hoác-in-ha-cô xi-pơ-yô.',
      viMeaning: 'Tôi muốn kiểm tra xem mình đã được tham gia bảo hiểm y tế chưa.',
    },
    tip: {
      vi: 'Nếu đi làm ở công ty, thường bạn sẽ là người tham gia qua nơi làm việc. Nếu thắc mắc, có thể hỏi Cơ quan Bảo hiểm Y tế Quốc gia (1577-1000).',
      ko: '회사에 다니면 보통 회사를 통해 직장가입자가 돼요. 궁금하면 국민건강보험공단(1577-1000)에 물어볼 수 있어요.',
    },
  },
  {
    day: 6,
    icon: '💊',
    title: { vi: 'Tìm hiểu bệnh viện và nhà thuốc gần nhà', ko: '가까운 병원·약국 알아두기' },
    where: {
      vi: "Phòng khám và nhà thuốc gần ký túc xá (tìm '내과', '약국' trên ứng dụng bản đồ)",
      ko: "기숙사 근처 동네 의원과 약국 (지도 앱에서 '내과', '약국' 검색)",
    },
    bring: [
      { vi: 'Hộ chiếu hoặc thẻ đăng ký người nước ngoài', ko: '여권 또는 외국인등록증' },
      { vi: 'Thông tin bảo hiểm y tế (nếu có)', ko: '건강보험 정보 (있으면)' },
    ],
    say: {
      ko: '처음 왔어요. 진료 받고 싶어요.',
      viPron: 'Chơ-ưm oát-xơ-yô. Chin-ryô bát-cô xi-pơ-yô.',
      viMeaning: 'Tôi đến lần đầu. Tôi muốn được khám bệnh.',
    },
    tip: {
      vi: 'Nếu bị ốm nặng đột ngột vào ban đêm hoặc ngày nghỉ, hãy gọi 119.',
      ko: '밤이나 휴일에 갑자기 크게 아프면 119에 전화하세요.',
    },
  },
  {
    day: 7,
    icon: '♻️',
    title: { vi: 'Học cách bỏ rác', ko: '쓰레기 버리는 방법 익히기' },
    where: {
      vi: 'Cửa hàng tiện lợi hoặc siêu thị gần ký túc xá, nhà ở (mua túi rác theo quy định)',
      ko: '기숙사·집 근처 편의점이나 마트 (종량제 봉투 사기)',
    },
    bring: [{ vi: 'Tiền mặt hoặc thẻ', ko: '현금 또는 카드' }],
    say: {
      ko: '종량제 봉투 20리터 주세요.',
      viPron: 'Chông-ryang-chê bông-thu i-sip-ri-thơ chu-xê-yô.',
      viMeaning: 'Cho tôi túi rác theo quy định loại 20 lít.',
    },
    tip: {
      vi: 'Rác thường bỏ vào túi rác theo quy định, rác thực phẩm và rác tái chế bỏ riêng. Ngày và nơi bỏ rác khác nhau tùy khu phố.',
      ko: '일반 쓰레기는 종량제 봉투에, 음식물·재활용은 따로 버려요. 버리는 요일과 장소는 동네마다 달라요.',
    },
  },
  {
    day: 8,
    icon: '💸',
    title: { vi: 'Tìm hiểu cách gửi tiền về quê', ko: '고향으로 송금하는 방법 알아보기' },
    where: {
      vi: 'Quầy giao dịch ngân hàng hoặc ứng dụng ngân hàng, chuyển tiền',
      ko: '은행 창구 또는 은행·송금 앱',
    },
    bring: [
      { vi: 'Hộ chiếu', ko: '여권' },
      { vi: 'Sổ tài khoản', ko: '통장' },
      { vi: 'Tên và thông tin tài khoản người nhận', ko: '받는 사람 이름과 계좌 정보' },
    ],
    say: {
      ko: '베트남으로 송금하고 싶어요. 수수료가 얼마예요?',
      viPron: 'Bê-thư-nam-ư-rô xông-gưm-ha-cô xi-pơ-yô. Xu-xu-ryô-ga ơl-ma-ê-yô?',
      viMeaning: 'Tôi muốn gửi tiền về Việt Nam. Phí là bao nhiêu?',
    },
    tip: {
      vi: 'Phí và tỷ giá khác nhau tùy nơi. Hãy kiểm tra thông tin người nhận hai lần.',
      ko: '수수료와 환율은 곳마다 달라요. 받는 사람 정보를 두 번 확인하세요.',
    },
  },
  {
    day: 9,
    icon: '📄',
    title: { vi: 'Đọc lại hợp đồng lao động', ko: '근로계약서 다시 읽기' },
    where: {
      vi: 'Ký túc xá, nhà ở (hợp đồng nhận từ công ty)',
      ko: '기숙사·집 (회사에서 받은 계약서)',
    },
    bring: [{ vi: 'Hợp đồng lao động', ko: '근로계약서' }],
    say: {
      ko: '근로계약서 사본을 한 부 받을 수 있을까요?',
      viPron: 'Cưn-lô-kê-iác-xơ xa-bôn-ưl han bu ba-đưl xu ít-xưl-ca-yô?',
      viMeaning: 'Tôi có thể nhận một bản sao hợp đồng lao động không?',
    },
    tip: {
      vi: 'Hãy xem tiền lương, giờ làm việc và ngày nghỉ được ghi như thế nào. Nếu thắc mắc, có thể hỏi Bộ Việc làm và Lao động (1350).',
      ko: '임금·근로시간·휴일이 어떻게 적혀 있는지 확인해 보세요. 궁금한 점은 고용노동부(1350)에 물어볼 수 있어요.',
    },
    link: {
      route: 'glossary',
      label: { vi: '📖 Tra từ khó', ko: '어려운 말 찾기' },
    },
  },
  {
    day: 10,
    icon: '💰',
    title: { vi: 'Kiểm tra bảng lương đầu tiên', ko: '첫 급여명세서 확인하기' },
    where: {
      vi: 'Công ty (nhận bảng lương vào ngày trả lương)',
      ko: '회사 (급여일에 명세서 받기)',
    },
    bring: [
      { vi: 'Bảng lương', ko: '급여명세서' },
      { vi: 'Hợp đồng lao động', ko: '근로계약서' },
    ],
    say: {
      ko: '이번 달 급여명세서를 받을 수 있을까요?',
      viPron: 'I-bơn tal cưp-iơ-miơng-xê-xơ-rưl ba-đưl xu ít-xưl-ca-yô?',
      viMeaning: 'Tôi có thể nhận bảng lương tháng này không?',
    },
    tip: {
      vi: 'Nếu số tiền khấu trừ khác với cách tính, hãy hỏi lại công ty. Nếu cần đánh giá, hãy hỏi chuyên gia.',
      ko: '공제액이 계산과 다르면 회사에 확인해 보세요. 판단이 필요하면 전문가에게 물어보세요.',
    },
    link: {
      route: 'payslip',
      label: { vi: '💰 Kiểm tra bảng lương', ko: '급여 검산하기' },
    },
  },
  ...DAYS_11_20,
  ...DAYS_21_30,
];
