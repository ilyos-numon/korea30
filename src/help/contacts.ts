export interface Contact {
  id: string;
  number: string;
  tel: string;
  nameKo: string;
  nameVi: string;
  whenKo: string;
  whenVi: string;
  emergency: boolean;
  vietnamese: boolean;
  verified: boolean;
  sayKo?: string;
}

function digits(n: string): string {
  return n.replace(/\D/g, '');
}

type ContactInput = Omit<Contact, 'tel'>;

const RAW: readonly ContactInput[] = [
  {
    id: 'police',
    number: '112',
    nameKo: '경찰',
    nameVi: 'Cảnh sát',
    whenKo: '범죄를 당하거나 위험할 때',
    whenVi: 'Khi bị hại bởi tội phạm hoặc gặp nguy hiểm',
    emergency: true,
    vietnamese: false,
    verified: true,
  },
  {
    id: 'fire',
    number: '119',
    nameKo: '소방·구급',
    nameVi: 'Cứu hỏa · Cấp cứu',
    whenKo: '불이 났을 때, 크게 다치거나 갑자기 아플 때',
    whenVi: 'Khi có cháy, khi bị thương nặng hoặc đột ngột bị ốm',
    emergency: true,
    vietnamese: false,
    verified: true,
  },
  {
    id: 'immigration',
    number: '1345',
    nameKo: '외국인종합안내센터',
    nameVi: 'Trung tâm hướng dẫn tổng hợp cho người nước ngoài',
    whenKo: '체류·비자·외국인등록이 궁금할 때 (여러 나라 말 상담)',
    whenVi: 'Khi muốn hỏi về lưu trú, visa, đăng ký người nước ngoài (tư vấn nhiều thứ tiếng)',
    emergency: false,
    vietnamese: true,
    verified: true,
    sayKo: '베트남어 상담 부탁드립니다.',
  },
  {
    id: 'labor',
    number: '1350',
    nameKo: '고용노동부 고객상담센터',
    nameVi: 'Trung tâm tư vấn Bộ Việc làm và Lao động',
    whenKo: '임금·근로시간·퇴직금 등 일에 관해 궁금할 때',
    whenVi: 'Khi muốn hỏi về công việc: lương, giờ làm, trợ cấp thôi việc…',
    emergency: false,
    vietnamese: false,
    verified: true,
  },
  {
    id: 'migrant',
    number: '1577-0071',
    nameKo: '외국인력상담센터',
    nameVi: 'Trung tâm tư vấn lao động nước ngoài',
    whenKo: '외국인 근로자의 일·생활 고민을 상담하고 싶을 때 (여러 나라 말 상담)',
    whenVi: 'Khi lao động nước ngoài muốn tư vấn về công việc, cuộc sống (tư vấn nhiều thứ tiếng)',
    emergency: false,
    vietnamese: true,
    verified: false,
  },
  {
    id: 'legal',
    number: '132',
    nameKo: '대한법률구조공단',
    nameVi: 'Tổng công ty Trợ giúp pháp lý Hàn Quốc',
    whenKo: '법률 상담이 필요할 때',
    whenVi: 'Khi cần tư vấn pháp lý',
    emergency: false,
    vietnamese: false,
    verified: true,
  },
  {
    id: 'health',
    number: '1577-1000',
    nameKo: '국민건강보험공단',
    nameVi: 'Tổng công ty Bảo hiểm Y tế Quốc gia',
    whenKo: '건강보험 가입·보험료가 궁금할 때',
    whenVi: 'Khi muốn hỏi về tham gia bảo hiểm y tế, phí bảo hiểm',
    emergency: false,
    vietnamese: false,
    verified: true,
  },
  {
    id: 'pension',
    number: '1355',
    nameKo: '국민연금공단',
    nameVi: 'Tổng công ty Hưu trí Quốc gia',
    whenKo: '국민연금이 궁금할 때',
    whenVi: 'Khi muốn hỏi về lương hưu quốc gia',
    emergency: false,
    vietnamese: false,
    verified: true,
  },
  {
    id: 'disease',
    number: '1339',
    nameKo: '질병관리청 콜센터',
    nameVi: 'Tổng đài Cơ quan Quản lý Dịch bệnh',
    whenKo: '감염병·예방접종이 궁금할 때',
    whenVi: 'Khi muốn hỏi về bệnh truyền nhiễm, tiêm chủng',
    emergency: false,
    vietnamese: false,
    verified: true,
  },
];

export const CONTACTS: readonly Contact[] = RAW.map((c) => ({ ...c, tel: digits(c.number) }));
