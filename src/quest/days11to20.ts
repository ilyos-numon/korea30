import type { QuestDay } from './types';

export const DAYS_11_20: readonly QuestDay[] = [
  {
    day: 11,
    icon: '🪪',
    title: { vi: 'Nhận thẻ đăng ký người nước ngoài', ko: '외국인등록증 받기' },
    where: {
      vi: 'Văn phòng xuất nhập cảnh nơi bạn đã nộp đơn (nếu chọn nhận qua bưu điện thì nhận ở nhà)',
      ko: '신청한 출입국·외국인관서 (우편으로 받기로 했으면 집에서)',
    },
    bring: [
      { vi: 'Hộ chiếu', ko: '여권' },
      { vi: 'Giấy biên nhận đơn đăng ký người nước ngoài', ko: '외국인등록 신청 접수증' },
    ],
    say: {
      ko: '외국인등록증 받으러 왔어요.',
      viPron: 'Uê-cúc-in-đưng-rốc-chưng ba-đư-rơ oát-xơ-yô.',
      viMeaning: 'Tôi đến để nhận thẻ đăng ký người nước ngoài.',
    },
    tip: {
      vi: 'Khi nhận thẻ, hãy xem họ tên và ngày sinh có đúng không. Nếu muốn biết khi nào có thẻ, có thể hỏi số 1345.',
      ko: '받으면 이름과 생년월일이 맞는지 확인해 보세요. 언제 나오는지 궁금하면 1345에 물어볼 수 있어요.',
    },
  },
  {
    day: 12,
    icon: '📅',
    title: { vi: 'Kiểm tra ngày hết hạn lưu trú', ko: '체류기간 만료일 확인하기' },
    where: {
      vi: 'Ở nhà (xem thẻ đăng ký người nước ngoài và hộ chiếu, nếu không rõ thì hỏi văn phòng xuất nhập cảnh)',
      ko: '집 (외국인등록증과 여권 보기, 모르면 출입국·외국인관서에 문의)',
    },
    bring: [
      { vi: 'Thẻ đăng ký người nước ngoài', ko: '외국인등록증' },
      { vi: 'Hộ chiếu', ko: '여권' },
    ],
    say: {
      ko: '제 체류기간이 언제까지인지 알고 싶어요.',
      viPron: 'Chê chê-ryu-ghi-ga-ni ơn-chê-ca-chi-in-chi al-cô xi-pơ-yô.',
      viMeaning: 'Tôi muốn biết thời hạn lưu trú của tôi đến khi nào.',
    },
    tip: {
      vi: 'Thường có thể xin gia hạn lưu trú từ 4 tháng trước ngày hết hạn. Nếu không chắc về ngày, hãy hỏi số 1345.',
      ko: '체류기간 연장은 보통 만료 4개월 전부터 신청할 수 있어요. 날짜가 헷갈리면 1345에 확인해 보세요.',
    },
    link: {
      route: 'deadline',
      label: { vi: '📅 Xem hạn lưu trú', ko: '체류 기한 보기' },
    },
  },
  {
    day: 13,
    icon: '🏠',
    title: { vi: 'Khai báo đổi nơi lưu trú khi chuyển nhà', ko: '이사하면 체류지 변경 신고하기' },
    where: {
      vi: 'Trung tâm hành chính phường, xã nơi ở mới hoặc văn phòng xuất nhập cảnh',
      ko: '새 주소지 주민센터(읍·면·동) 또는 출입국·외국인관서',
    },
    bring: [
      { vi: 'Thẻ đăng ký người nước ngoài', ko: '외국인등록증' },
      { vi: 'Giấy tờ cho thấy nơi ở mới (như hợp đồng thuê nhà)', ko: '새 집 계약서 등 사는 곳을 보여 주는 서류' },
    ],
    say: {
      ko: '이사했어요. 체류지 변경 신고하러 왔어요.',
      viPron: 'I-xa-he-xơ-yô. Chê-ryu-chi biơn-ghiơng xin-cô-ha-rơ oát-xơ-yô.',
      viMeaning: 'Tôi đã chuyển nhà. Tôi đến để khai báo đổi nơi lưu trú.',
    },
    tip: {
      vi: 'Cần khai báo trong vòng 15 ngày kể từ ngày chuyển đến nơi ở mới. Giấy tờ cần mang, hãy hỏi trước số 1345.',
      ko: '새 집으로 옮긴 날부터 15일 안에 신고해야 해요. 필요한 서류는 1345에 미리 확인해 보세요.',
    },
    link: {
      route: 'deadline',
      label: { vi: '📅 Xem hạn lưu trú', ko: '체류 기한 보기' },
    },
  },
  {
    day: 14,
    icon: '📶',
    title: { vi: 'Xem lại gói cước điện thoại', ko: '휴대폰 요금제 다시 보기' },
    where: {
      vi: 'Cửa hàng điện thoại hoặc trung tâm chăm sóc khách hàng của nhà mạng',
      ko: '휴대폰 대리점 또는 통신사 고객센터',
    },
    bring: [
      { vi: 'Thẻ đăng ký người nước ngoài', ko: '외국인등록증' },
      { vi: 'Hộ chiếu', ko: '여권' },
    ],
    say: {
      ko: '외국인등록증으로 요금제를 바꾸고 싶어요.',
      viPron: 'Uê-cúc-in-đưng-rốc-chưng-ư-rô yô-gưm-chê-rưl ba-cu-cô xi-pơ-yô.',
      viMeaning: 'Tôi muốn đổi gói cước bằng thẻ đăng ký người nước ngoài.',
    },
    tip: {
      vi: 'Khi đã có thẻ đăng ký, thường có thể chọn nhiều gói cước hơn. Hãy hỏi trước về thời hạn hợp đồng và điều kiện hủy.',
      ko: '등록증이 나오면 고를 수 있는 요금제가 늘어나는 경우가 많아요. 약정 기간과 해지 조건을 먼저 확인해 보세요.',
    },
  },
  {
    day: 15,
    icon: '💳',
    title: { vi: 'Dùng thẻ ghi nợ', ko: '체크카드 쓰기' },
    where: {
      vi: 'Chi nhánh ngân hàng nơi bạn mở tài khoản hoặc ứng dụng ngân hàng',
      ko: '통장을 만든 은행 지점 또는 은행 앱',
    },
    bring: [
      { vi: 'Thẻ đăng ký người nước ngoài', ko: '외국인등록증' },
      { vi: 'Sổ tài khoản', ko: '통장' },
    ],
    say: {
      ko: '이 통장으로 체크카드를 만들 수 있어요?',
      viPron: 'I thông-chang-ư-rô chê-khư-ca-đư-rưl man-đưl xu ít-xơ-yô?',
      viMeaning: 'Tôi có thể làm thẻ ghi nợ cho tài khoản này không?',
    },
    tip: {
      vi: 'Thẻ ghi nợ chỉ dùng được bằng số tiền có trong tài khoản. Đừng cho người khác mượn thẻ hay biết mật khẩu.',
      ko: '체크카드는 통장에 있는 돈만큼만 쓸 수 있어요. 카드와 비밀번호는 다른 사람에게 빌려주지 마세요.',
    },
    link: {
      route: 'glossary',
      label: { vi: '📖 Tra từ khó', ko: '어려운 말 찾기' },
    },
  },
  {
    day: 16,
    icon: '🧓',
    title: { vi: 'Kiểm tra tham gia lương hưu quốc gia', ko: '국민연금 가입 확인하기' },
    where: {
      vi: 'Người phụ trách ở công ty hoặc chi nhánh Tổng công ty Hưu trí Quốc gia',
      ko: '회사 담당자 또는 국민연금공단 지사',
    },
    bring: [{ vi: 'Thẻ đăng ký người nước ngoài', ko: '외국인등록증' }],
    say: {
      ko: '제가 국민연금에 가입됐는지 확인하고 싶어요.',
      viPron: 'Chê-ga cung-min-yơn-gư-mê ca-ip-toét-nưn-chi hoác-in-ha-cô xi-pơ-yô.',
      viMeaning: 'Tôi muốn kiểm tra xem mình đã được tham gia lương hưu quốc gia chưa.',
    },
    tip: {
      vi: 'Việc tham gia có thể khác nhau tùy quốc tịch và tư cách lưu trú. Nếu thắc mắc, có thể hỏi Tổng công ty Hưu trí Quốc gia (1355).',
      ko: '나라와 체류자격에 따라 가입 여부가 달라질 수 있어요. 궁금하면 국민연금공단(1355)에 물어볼 수 있어요.',
    },
    link: {
      route: 'help',
      label: { vi: '☎ Xem số điện thoại hỗ trợ', ko: '도움 전화 보기' },
    },
  },
  {
    day: 17,
    icon: '⏰',
    title: { vi: 'Bắt đầu ghi giờ đi làm và tan làm', ko: '출퇴근 시간 기록 시작하기' },
    where: {
      vi: 'Công ty (ghi vào ứng dụng mỗi khi đi làm và tan làm)',
      ko: '회사 (출근·퇴근할 때마다 앱에 적기)',
    },
    bring: [{ vi: 'Điện thoại di động', ko: '휴대폰' }],
    say: {
      ko: '출근 시간과 퇴근 시간을 어디에 적어요?',
      viPron: 'Chul-gưn xi-gan-goa thuê-gưn xi-ga-nưl ơ-đi-ê chơ-gơ-yô?',
      viMeaning: 'Tôi ghi giờ đi làm và giờ tan làm ở đâu?',
    },
    tip: {
      vi: 'Nếu ghi giờ đi làm và tan làm mỗi ngày, sẽ dễ so sánh với bảng lương. Nếu khác với ghi chép của công ty, hãy hỏi lại công ty.',
      ko: '매일 출퇴근 시간을 적어 두면 급여명세서와 비교하기 쉬워요. 회사 기록과 다르면 회사에 확인해 보세요.',
    },
    link: {
      route: 'work',
      label: { vi: '⏱ Ghi giờ làm', ko: '근무 기록하기' },
    },
  },
  {
    day: 18,
    icon: '🚨',
    title: { vi: 'Ghi nhớ số khẩn cấp 112 và 119', ko: '긴급전화 112·119 알아두기' },
    where: {
      vi: 'Ở bất cứ đâu (lưu số vào điện thoại)',
      ko: '어디서나 (휴대폰에 번호 저장하기)',
    },
    bring: [
      { vi: 'Điện thoại di động', ko: '휴대폰' },
      { vi: 'Địa chỉ nơi đang ở', ko: '지금 사는 곳 주소' },
    ],
    say: {
      ko: '사람이 다쳤어요. 빨리 와 주세요.',
      viPron: 'Xa-ra-mi ta-chơ-xơ-yô. Bal-li oa chu-xê-yô.',
      viMeaning: 'Có người bị thương. Xin hãy đến nhanh.',
    },
    tip: {
      vi: 'Khi gặp tội phạm hoặc nguy hiểm, gọi 112. Khi có cháy hoặc bị thương nặng, gọi 119. Ghi sẵn địa chỉ sẽ giúp bạn nói nhanh hơn.',
      ko: '범죄나 위험한 일은 112, 불이 나거나 크게 다치면 119에 전화하세요. 주소를 미리 적어 두면 빨리 말할 수 있어요.',
    },
    link: {
      route: 'help',
      label: { vi: '☎ Xem số điện thoại hỗ trợ', ko: '도움 전화 보기' },
    },
  },
  {
    day: 19,
    icon: '☎️',
    title: { vi: 'Ghi nhớ số tư vấn bằng tiếng mẹ đẻ', ko: '모국어 상담 전화 알아두기' },
    where: {
      vi: 'Điện thoại di động (lưu số điện thoại tư vấn)',
      ko: '휴대폰 (상담 전화번호 저장하기)',
    },
    bring: [{ vi: 'Điện thoại di động', ko: '휴대폰' }],
    say: {
      ko: '통역을 연결해 주실 수 있어요?',
      viPron: 'Thông-yơ-gưl yơn-ghiơl-he chu-xil xu ít-xơ-yô?',
      viMeaning: 'Bạn có thể kết nối phiên dịch giúp tôi không?',
    },
    tip: {
      vi: 'Trung tâm hướng dẫn tổng hợp cho người nước ngoài (1345) và Trung tâm tư vấn lao động nước ngoài (1577-0071) tư vấn bằng nhiều thứ tiếng. Hãy hỏi giờ tư vấn khi gọi.',
      ko: '외국인종합안내센터(1345)와 외국인력상담센터(1577-0071)는 여러 나라 말로 상담해요. 상담 시간은 전화해서 확인해 보세요.',
    },
    link: {
      route: 'help',
      label: { vi: '☎ Xem số điện thoại hỗ trợ', ko: '도움 전화 보기' },
    },
  },
  {
    day: 20,
    icon: '🛒',
    title: { vi: 'Đi chợ ở siêu thị', ko: '마트에서 장보기' },
    where: {
      vi: 'Siêu thị hoặc cửa hàng tiện lợi trong khu phố',
      ko: '동네 마트나 편의점',
    },
    bring: [
      { vi: 'Túi mua sắm', ko: '장바구니' },
      { vi: 'Thẻ hoặc tiền mặt', ko: '카드 또는 현금' },
    ],
    say: {
      ko: '봉투 하나 주세요. 카드로 계산할게요.',
      viPron: 'Bông-thu ha-na chu-xê-yô. Kha-đư-rô kiê-xan-hal-kê-yô.',
      viMeaning: 'Cho tôi một cái túi. Tôi sẽ thanh toán bằng thẻ.',
    },
    tip: {
      vi: 'Ở nhiều cửa hàng, túi đựng phải trả tiền riêng. Mang theo túi mua sắm sẽ tiện hơn.',
      ko: '많은 가게에서 봉투는 돈을 따로 내요. 장바구니를 가져가면 편해요.',
    },
  },
];
