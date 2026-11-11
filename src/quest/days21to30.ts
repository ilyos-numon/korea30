import type { QuestDay } from './types';

export const DAYS_21_30: readonly QuestDay[] = [
  {
    day: 21,
    icon: '📦',
    title: { vi: 'Gửi bưu kiện quốc tế ở bưu điện', ko: '우체국에서 국제 택배 보내기' },
    where: {
      vi: 'Bưu điện (quầy gửi bưu kiện quốc tế)',
      ko: '우체국 (국제 택배 창구)',
    },
    bring: [
      { vi: 'Đồ muốn gửi', ko: '보낼 물건' },
      { vi: 'Địa chỉ và số điện thoại của người nhận', ko: '받는 사람 주소와 전화번호' },
      { vi: 'Hộ chiếu hoặc thẻ đăng ký người nước ngoài', ko: '여권 또는 외국인등록증' },
    ],
    say: {
      ko: '국제 택배를 보내고 싶어요. 얼마나 걸려요?',
      viPron: 'Cúc-chê thec-be-rưl bô-ne-cô xi-pơ-yô. Ơl-ma-na cơl-liơ-yô?',
      viMeaning: 'Tôi muốn gửi bưu kiện quốc tế. Mất bao lâu?',
    },
    tip: {
      vi: 'Giá và thời gian gửi khác nhau tùy nước nhận và cách gửi. Có những đồ không gửi được, nên hãy hỏi ở quầy trước.',
      ko: '나라와 보내는 방법에 따라 요금과 걸리는 날이 달라요. 보낼 수 없는 물건도 있으니 창구에서 먼저 물어보세요.',
    },
  },
  {
    day: 22,
    icon: '🤒',
    title: { vi: 'Báo cho công ty khi bị ốm', ko: '아플 때 회사에 알리기' },
    where: {
      vi: 'Người phụ trách ở công ty (gọi điện hoặc nhắn tin)',
      ko: '회사 담당자 (전화나 메시지로)',
    },
    bring: [{ vi: 'Điện thoại di động', ko: '휴대폰' }],
    say: {
      ko: '몸이 아파서 오늘 병원에 가야 해요.',
      viPron: 'Mô-mi a-pha-xơ ô-nưl biơng-uơ-nê ca-ya he-yô.',
      viMeaning: 'Tôi bị ốm nên hôm nay phải đi bệnh viện.',
    },
    tip: {
      vi: 'Quy định nghỉ ốm khác nhau tùy công ty, hãy hỏi trước người phụ trách. Nếu bị thương nặng hoặc nguy cấp, hãy gọi 119.',
      ko: '아플 때 쉬는 규칙은 회사마다 달라요. 담당자에게 미리 확인해 보세요. 크게 다치거나 위급하면 119에 전화하세요.',
    },
  },
  {
    day: 23,
    icon: '🩹',
    title: { vi: 'Biết cần làm gì khi bị thương lúc làm việc', ko: '일하다 다쳤을 때 알아두기' },
    where: {
      vi: 'Bệnh viện gần nhất (báo cho người phụ trách ở công ty)',
      ko: '가까운 병원 (회사 담당자에게도 알리기)',
    },
    bring: [
      { vi: 'Thẻ đăng ký người nước ngoài', ko: '외국인등록증' },
      { vi: 'Ghi chú ngày, nơi và cách bị thương', ko: '다친 날짜·장소·상황 메모' },
    ],
    say: {
      ko: '일하다가 다쳤어요. 병원에 가고 싶어요.',
      viPron: 'Il-ha-đa-ga ta-chơ-xơ-yô. Biơng-uơ-nê ca-cô xi-pơ-yô.',
      viMeaning: 'Tôi bị thương khi đang làm việc. Tôi muốn đi bệnh viện.',
    },
    tip: {
      vi: 'Khi bị thương do làm việc, bạn có thể thuộc diện bảo hiểm tai nạn lao động. Có được hay không, có thể hỏi Bộ Việc làm và Lao động (1350).',
      ko: '일하다 다쳤으면 산재보험 대상이 될 수 있어요. 해당되는지는 고용노동부(1350)에 물어볼 수 있어요.',
    },
    link: {
      route: 'glossary',
      label: { vi: '📖 Tra từ khó', ko: '어려운 말 찾기' },
    },
  },
  {
    day: 24,
    icon: '🌙',
    title: { vi: 'Tìm hiểu làm đêm và làm thêm giờ', ko: '밤·연장 근무 알아두기' },
    where: {
      vi: 'Công ty (xem lịch làm việc, nếu không rõ thì hỏi người phụ trách)',
      ko: '회사 (근무표 보기, 모르면 담당자에게 묻기)',
    },
    bring: [{ vi: 'Điện thoại di động', ko: '휴대폰' }],
    say: {
      ko: '오늘 몇 시까지 일해요?',
      viPron: 'Ô-nưl miơt xi-ca-chi il-he-yô?',
      viMeaning: 'Hôm nay tôi làm việc đến mấy giờ?',
    },
    tip: {
      vi: 'Làm việc từ 22:00 đến 06:00 được tính là làm đêm. Hãy ghi cả giờ làm đêm và làm thêm vào ghi chép giờ làm.',
      ko: '22:00부터 06:00까지 일하면 야간 근무로 봐요. 야간·연장 근무 시간도 근무 기록에 적어 두세요.',
    },
    link: {
      route: 'glossary',
      label: { vi: '📖 Tra từ khó', ko: '어려운 말 찾기' },
    },
  },
  {
    day: 25,
    icon: '🗓️',
    title: { vi: 'Đặt lịch đến văn phòng xuất nhập cảnh', ko: '출입국 방문 예약하기' },
    where: {
      vi: 'Trang web HiKorea (nếu khó thì hỏi số 1345)',
      ko: '하이코리아 누리집 (어려우면 1345에 문의)',
    },
    bring: [
      { vi: 'Hộ chiếu', ko: '여권' },
      { vi: 'Thẻ đăng ký người nước ngoài', ko: '외국인등록증' },
    ],
    say: {
      ko: '출입국 방문 예약을 하고 싶어요.',
      viPron: 'Chu-ríp-cúc bang-mun yê-ya-gưl ha-cô xi-pơ-yô.',
      viMeaning: 'Tôi muốn đặt lịch đến văn phòng xuất nhập cảnh.',
    },
    tip: {
      vi: 'Nhiều việc ở văn phòng xuất nhập cảnh cần đặt lịch trước khi đến. Nếu khó đặt lịch, có thể hỏi số 1345.',
      ko: '출입국·외국인관서는 미리 예약하고 가야 하는 일이 많아요. 예약이 어려우면 1345에 물어볼 수 있어요.',
    },
    link: {
      route: 'glossary',
      label: { vi: '📖 Tra từ khó', ko: '어려운 말 찾기' },
    },
  },
  {
    day: 26,
    icon: '🔎',
    title: { vi: 'Khi bị mất hộ chiếu hoặc thẻ đăng ký', ko: '여권·등록증을 잃어버렸을 때' },
    where: {
      vi: 'Văn phòng xuất nhập cảnh (nếu mất hộ chiếu thì hỏi cả đại sứ quán nước mình)',
      ko: '출입국·외국인관서 (여권을 잃어버렸으면 자기 나라 대사관에도 문의)',
    },
    bring: [
      { vi: 'Hộ chiếu hoặc bản sao hộ chiếu', ko: '여권 또는 여권 사본' },
      { vi: 'Ảnh thẻ', ko: '증명사진' },
    ],
    say: {
      ko: '외국인등록증을 잃어버렸어요. 어떻게 해야 해요?',
      viPron: 'Uê-cúc-in-đưng-rốc-chưng-ưl i-rơ-bơ-riơ-xơ-yô. Ơ-tơ-khê he-ya he-yô?',
      viMeaning: 'Tôi bị mất thẻ đăng ký người nước ngoài. Tôi phải làm gì?',
    },
    tip: {
      vi: 'Thời hạn xin cấp lại và giấy tờ cần mang, hãy hỏi số 1345. Nên chụp ảnh hộ chiếu và thẻ đăng ký để sẵn.',
      ko: '재발급 신청 기한과 필요한 서류는 1345에 확인해 보세요. 여권과 등록증을 미리 사진으로 찍어 두면 좋아요.',
    },
    link: {
      route: 'help',
      label: { vi: '☎ Xem số điện thoại hỗ trợ', ko: '도움 전화 보기' },
    },
  },
  {
    day: 27,
    icon: '🧾',
    title: { vi: 'Tìm hiểu thuế thu nhập và quyết toán thuế cuối năm', ko: '소득세·연말정산 알아보기' },
    where: {
      vi: 'Người phụ trách lương ở công ty',
      ko: '회사 급여 담당자',
    },
    bring: [{ vi: 'Bảng lương', ko: '급여명세서' }],
    say: {
      ko: '연말정산은 회사에서 해 주나요?',
      viPron: 'Yơn-mal-chơng-xa-nưn huê-xa-ê-xơ he chu-na-yô?',
      viMeaning: 'Công ty có làm quyết toán thuế cuối năm cho tôi không?',
    },
    tip: {
      vi: 'Thuế thu nhập thường được trừ trước từ lương tháng. Quyết toán thuế cuối năm thường làm qua công ty, hãy hỏi người phụ trách cần giấy tờ gì.',
      ko: '소득세는 보통 월급에서 미리 떼요. 연말정산은 회사를 통해 하는 경우가 많으니 필요한 서류를 담당자에게 확인해 보세요.',
    },
    link: {
      route: 'glossary',
      label: { vi: '📖 Tra từ khó', ko: '어려운 말 찾기' },
    },
  },
  {
    day: 28,
    icon: '🏘️',
    title: { vi: 'Tìm hiểu quy định ở ký túc xá và nhà ở', ko: '기숙사·집 생활 규칙 확인하기' },
    where: {
      vi: 'Ký túc xá hoặc nhà (hỏi người quản lý hoặc chủ nhà)',
      ko: '기숙사나 집 (관리인이나 집주인에게 묻기)',
    },
    bring: [{ vi: 'Điện thoại di động', ko: '휴대폰' }],
    say: {
      ko: '세탁기는 언제 쓸 수 있어요?',
      viPron: 'Xê-thác-ki-nưn ơn-chê xưl xu ít-xơ-yô?',
      viMeaning: 'Khi nào tôi có thể dùng máy giặt?',
    },
    tip: {
      vi: 'Hãy hỏi giờ dùng máy giặt, giờ tắm và giờ cần giữ yên lặng. Chụp ảnh bảng quy định sẽ giúp bạn không quên.',
      ko: '세탁기·샤워 시간과 조용히 해야 하는 시간을 물어보세요. 규칙을 사진으로 찍어 두면 잊지 않아요.',
    },
  },
  {
    day: 29,
    icon: '📚',
    title: { vi: 'Tìm lớp học tiếng Hàn miễn phí', ko: '무료 한국어 수업 찾기' },
    where: {
      vi: 'Cơ quan hỗ trợ người nước ngoài gần nhà (có nơi mở lớp vào cuối tuần)',
      ko: '가까운 외국인 지원기관 (주말 수업이 있는 곳도 있어요)',
    },
    bring: [
      { vi: 'Thẻ đăng ký người nước ngoài', ko: '외국인등록증' },
      { vi: 'Điện thoại di động', ko: '휴대폰' },
    ],
    say: {
      ko: '한국어 수업을 듣고 싶어요. 무료예요?',
      viPron: 'Han-cu-cơ xu-ơ-bưl tứt-cô xi-pơ-yô. Mu-ryô-yê-yô?',
      viMeaning: 'Tôi muốn học lớp tiếng Hàn. Có miễn phí không?',
    },
    tip: {
      vi: 'Tùy khu vực, có nơi mở lớp tiếng Hàn miễn phí. Giờ học và cách đăng ký, có thể hỏi cơ quan đó.',
      ko: '지역에 따라 무료 한국어 수업을 하는 곳이 있어요. 수업 시간과 신청 방법은 기관에 물어볼 수 있어요.',
    },
  },
  {
    day: 30,
    icon: '💾',
    title: { vi: 'Sao lưu ghi chép tháng đầu tiên', ko: '첫 한 달 기록 백업하기' },
    where: {
      vi: 'Ứng dụng này (lưu tệp sao lưu vào điện thoại)',
      ko: '이 앱 (백업 파일을 휴대폰에 저장하기)',
    },
    bring: [{ vi: 'Điện thoại di động', ko: '휴대폰' }],
    say: {
      ko: '한 달 동안 감사했어요. 앞으로도 잘 부탁드려요.',
      viPron: 'Han tal tông-an cam-xa-he-xơ-yô. A-pư-rô-đô chal bu-thác-tư-riơ-yô.',
      viMeaning: 'Cảm ơn mọi người trong một tháng qua. Mong được giúp đỡ tiếp.',
    },
    tip: {
      vi: 'Nếu lưu tệp sao lưu tiến độ và giờ làm, khi đổi điện thoại vẫn có thể lấy lại. Đừng gửi tệp sao lưu cho người khác.',
      ko: '진행 상황과 근무 기록을 백업 파일로 저장해 두면 휴대폰을 바꿔도 다시 불러올 수 있어요. 백업 파일은 다른 사람에게 보내지 마세요.',
    },
    link: {
      route: 'tools',
      label: { vi: '💾 Sao lưu ghi chép', ko: '기록 백업하기' },
    },
  },
];
