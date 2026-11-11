import type { WorklogStrings } from './types';

/** เป็น null ถ้าไม่ใช่ตัวเลข */
function toNum(v: number | string): number | null {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

const cnt = (v: number | string): string => String(toNum(v) ?? (String(v) || '-'));

const won = (v: number | string): string => {
  const n = toNum(v);
  return n === null ? `${String(v) || '-'} วอน` : `${n.toLocaleString('th-TH')} วอน`;
};

const hoursMinutes = (v: number | string): string => {
  const n = toNum(v);
  if (n === null) return `${String(v) || '-'} นาที`;
  const h = Math.floor(Math.abs(n) / 60);
  const m = Math.abs(n) % 60;
  return `${n < 0 ? '-' : ''}${h} ชั่วโมง ${m} นาที`;
};

export const th: WorklogStrings = {
  title: 'บันทึกการทำงาน',
  intro: 'จดเวลาเข้างานและเลิกงาน แล้วเราจะประมาณค่าจ้างของเดือนนี้ให้ ข้อมูลที่กรอกจะเก็บไว้ในเครื่องนี้เท่านั้น',
  month: 'เลือกเดือน',
  shiftHeading: 'เพิ่มการทำงาน',
  shiftDate: 'วันที่',
  shiftStart: 'เวลาเข้างาน',
  shiftEnd: 'เวลาเลิกงาน',
  shiftBreak: 'เวลาพัก (นาที)',
  shiftHoliday: 'ฉันทำงานในวันหยุด',
  shiftMemo: 'บันทึกช่วยจำ',
  shiftOvernightHint: 'ถ้าเวลาเลิกงานเร็วกว่าเวลาเข้างาน จะนับว่าเลิกงานในวันถัดไป',
  shiftAdd: 'เพิ่มบันทึก',
  errBadDate: 'กรุณาตรวจสอบวันที่อีกครั้ง',
  errBadTime: 'กรุณาตรวจสอบเวลาอีกครั้ง',
  errZeroLength: 'เวลาเข้างานและเวลาเลิกงานเป็นเวลาเดียวกัน',
  errTooLong: 'การทำงานหนึ่งครั้งเกิน 16 ชั่วโมง กรุณาตรวจสอบเวลาอีกครั้ง',
  errBreakTooLong: 'เวลาพักนานกว่าเวลาทำงาน',
  errBadBreak: 'กรอกเวลาพักเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป (นาที)',
  errFuture: 'บันทึกวันที่หลังจากวันนี้ไม่ได้',
  listHeading: 'บันทึกของเดือนนี้',
  empty: 'เดือนนี้ยังไม่มีบันทึก ลองเพิ่มเวลาเข้างานและเลิกงานด้านบน',
  breakMinutes: (v) => `พัก ${toNum(v) ?? (String(v) || '-')} นาที`,
  holidayTag: 'วันหยุด',
  delete: 'ลบ',
  profileHeading: 'ค่าจ้างรายชั่วโมงและสถานที่ทำงาน',
  wage: 'ค่าจ้างรายชั่วโมง (วอน)',
  wageHint: 'ใส่ค่าจ้างรายชั่วโมงที่เขียนไว้ในสัญญาจ้างหรือสลิปเงินเดือน',
  size: (v) => `สถานที่ทำงานมีพนักงาน ${cnt(v)} คนขึ้นไป`,
  sizeYes: (v) => `${cnt(v)} คนขึ้นไป`,
  sizeNo: (v) => `น้อยกว่า ${cnt(v)} คน`,
  sizeUnknown: 'ไม่แน่ใจ',
  weekStart: 'วันเริ่มต้นของสัปดาห์',
  weekStartMon: 'วันจันทร์',
  weekStartSun: 'วันอาทิตย์',
  detailsHeading: 'ข้อมูลของคุณและสถานที่ทำงาน (สำหรับร่างคำร้อง)',
  detailsHint: 'เว้นว่างไว้ก็คำนวณได้ ใช้เฉพาะในร่างคำร้องเท่านั้น',
  workerName: 'ชื่อ',
  workerBirth: 'วันเกิด',
  workerPhone: 'เบอร์ติดต่อ',
  workerAddress: 'ที่อยู่',
  companyName: 'ชื่อสถานที่ทำงาน',
  employerName: 'ผู้แทน (นายจ้าง)',
  employerAddress: 'ที่อยู่สถานที่ทำงาน',
  employerPhone: 'เบอร์ติดต่อสถานที่ทำงาน',
  startDate: 'วันที่เริ่มงาน',
  endDate: 'วันที่ออกจากงาน',
  profileSave: 'บันทึก',
  profileSaved: 'บันทึกแล้ว',
  errWage: 'กรอกค่าจ้างรายชั่วโมงเป็นตัวเลขเท่านั้น',
  totalsHeading: 'การคำนวณของเดือนนี้',
  totalWorked: 'เวลาทำงานทั้งหมด',
  totalRegular: 'เวลาทำงานที่กำหนด',
  totalOvertime: 'ทำงานล่วงเวลา',
  totalNight: 'ทำงานกะกลางคืน',
  totalHoliday: 'ทำงานในวันหยุด',
  basePay: 'เงินเดือนพื้นฐาน',
  premiumPay: 'เงินเพิ่ม (ค่าล่วงเวลา ฯลฯ)',
  expectedGross: 'ค่าจ้างโดยประมาณ (ก่อนหักภาษี)',
  hoursMinutes,
  won,
  wageMissing: 'บันทึกค่าจ้างรายชั่วโมงแล้วจะคำนวณจำนวนเงินให้',
  minWageWarning: (v) => `ค่าจ้างรายชั่วโมงที่กรอกต่ำกว่าค่าจ้างขั้นต่ำของปีนี้ (${won(v)}) กรุณาตรวจสอบ`,
  noteSmallWorkplaceNoPremium: (v) =>
    `สถานที่ทำงานที่มีพนักงานน้อยกว่า ${cnt(v)} คน ไม่ได้รวมเงินเพิ่มค่าล่วงเวลา กะกลางคืน และวันหยุดไว้ในการคำนวณ`,
  noteWorkplaceSizeUnknown: (v) =>
    `ไม่ทราบจำนวนพนักงาน จึงคำนวณโดยรวมเงินเพิ่มไว้ด้วย ถ้ามีน้อยกว่า ${cnt(v)} คน ผลอาจต่างออกไป`,
  noteBelowMinWage: 'ค่าจ้างรายชั่วโมงต่ำกว่าค่าจ้างขั้นต่ำ กรุณาตรวจสอบ',
  noteWeeklyHolidayPayNotIncluded: 'การคำนวณนี้ไม่ได้รวมค่าจ้างวันหยุดประจำสัปดาห์',
  compareHeading: 'เทียบกับสลิปเงินเดือน',
  compareHint: 'กรอกจำนวนเงินในสลิปเงินเดือนของเดือนนี้ แล้วจะแสดงส่วนต่างจากที่คำนวณ',
  compareEarnings: 'รายการจ่าย',
  compareDeductions: 'รายการหัก',
  compareRun: 'เปรียบเทียบ',
  errRequired: 'กรอกตัวเลข (ถ้าไม่มีให้ใส่ 0)',
  errNotNumber: 'กรอกตัวเลขเท่านั้น',
  errTooLarge: 'กรอกไม่เกิน 100 ล้านวอน',
  compareExpected: 'คำนวณจากบันทึกการทำงาน',
  compareReported: 'รวมส่วนที่ต้องเสียภาษีในสลิป',
  compareDiff: 'ส่วนต่างจากที่คำนวณ',
  statusMatch: 'เกือบเท่ากับที่คำนวณ',
  statusLower: 'สลิปเงินเดือนน้อยกว่าที่คำนวณ กรุณาตรวจสอบ',
  statusHigher: 'สลิปเงินเดือนมากกว่าที่คำนวณ',
  unpaidEstimate: 'จำนวนเงินที่คาดว่ายังไม่ได้รับ',
  deductionMismatch: (v) => `รายการหัก ${toNum(v) ?? (String(v) || '-')} รายการต่างจากที่คำนวณ กรุณาตรวจสอบ`,
  ask1350: 'ถ้าต้องการคำวินิจฉัย ให้สอบถาม 1350 (ศูนย์ให้คำปรึกษากระทรวงการจ้างงานและแรงงาน)',
  statementHeading: 'เนื้อหาคำร้อง (ร่าง)',
  statementHint: 'ส่วนนี้จะใส่ใน PDF เป็นภาษาเกาหลี แก้ไขเองได้',
  statementReset: 'กลับไปใช้ข้อความที่แนะนำ',
  pdf: 'สร้าง PDF หลักฐาน',
  pdfHint: 'รวมบันทึกเวลาเข้า-เลิกงาน การคำนวณรายเดือน การเทียบสลิปเงินเดือน และร่างคำร้องไว้ในไฟล์เดียว สร้างในเครื่องนี้เท่านั้น',
  pdfBusy: 'กำลังสร้าง PDF…',
  pdfErrorEmpty: 'ยังไม่มีบันทึกการทำงาน จึงสร้าง PDF ไม่ได้',
  pdfErrorLibrary: 'สร้าง PDF ไม่สำเร็จ ลองใหม่อีกครั้งในภายหลัง',
  wipe: 'ลบบันทึกการทำงานทั้งหมด',
  wipeAsk: 'ลบบันทึกการทำงาน ค่าจ้างรายชั่วโมง และข้อมูลสถานที่ทำงานที่เก็บไว้ในเครื่องนี้ทั้งหมดหรือไม่?',
  wipeConfirm: 'ลบทั้งหมด',
  wipeCancel: 'ยกเลิก',
  wiped: 'ลบบันทึกการทำงานทั้งหมดแล้ว',
};
