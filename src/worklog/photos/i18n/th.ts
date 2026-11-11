import type { PhotoStrings } from './types';

/** คืน '-' เมื่อไม่มีค่าหรือเป็นค่าว่าง (ไม่คืนสตริงว่าง) */
const s = (v: unknown): string => {
  if (v === undefined || v === null) return '-';
  if (typeof v === 'number' && !Number.isFinite(v)) return '-';
  return String(v).trim() || '-';
};

export const th: PhotoStrings = {
  heading: 'บันทึกภาพถ่าย',
  intro: 'เก็บภาพที่แสดงการทำงานของคุณ (หน้าจอเครื่องตอกบัตร ตารางกะงาน ฯลฯ) พร้อมวันที่ไว้ในเครื่องนี้',
  privacyNote: 'ภาพถ่ายจะเก็บไว้ในเครื่องนี้เท่านั้น ข้อมูลภาพ เช่น ตำแหน่งที่ตั้ง จะถูกลบออกก่อนบันทึก',
  dateLabel: 'วันที่ทำงาน',
  shiftLabel: 'เชื่อมกับการทำงาน',
  shiftNone: 'ไม่เชื่อม',
  shiftOption: (date, start, end) => `${s(date)} ${s(start)}–${s(end)}`,
  memoLabel: 'บันทึกช่วยจำ',
  camera: 'ถ่ายด้วยกล้อง',
  pick: 'เลือกภาพ',
  saving: 'กำลังบันทึก…',
  saved: 'บันทึกแล้ว',
  errorNotImage: 'บันทึกได้เฉพาะไฟล์ภาพเท่านั้น',
  errorTooLarge: (mb) => `ภาพใหญ่เกินไป เลือกภาพที่มีขนาดไม่เกิน ${s(mb)} MB`,
  errorDecode: 'เปิดภาพนี้ไม่ได้ เลือกภาพอื่น',
  errorQuota: 'พื้นที่เก็บข้อมูลในเครื่องไม่พอ ลองลบภาพเก่าออก',
  errorUnknown: 'บันทึกไม่สำเร็จ ลองอีกครั้ง',
  empty: 'เดือนนี้ยังไม่มีภาพที่บันทึกไว้',
  takenOn: (date) => `ถ่ายเมื่อ ${s(date)}`,
  takenOnSaved: (date) => `บันทึกเมื่อ ${s(date)} (ไม่มีข้อมูลวันที่ถ่าย)`,
  expiresOn: (date) => `เก็บถึงวันที่ ${s(date)}`,
  expiringSoon: (days) => `ระยะเวลาเก็บจะหมดในอีก ${s(days)} วัน`,
  linkedShift: (label) => `การทำงานที่เชื่อมไว้: ${s(label)}`,
  open: 'ดูภาพขยาย',
  close: 'ปิด',
  delete: 'ลบ',
  deleteAsk: 'ลบภาพนี้หรือไม่? ภาพที่ลบแล้วกู้คืนไม่ได้',
  deleteConfirm: 'ลบ',
  deleteCancel: 'ยกเลิก',
  expiryEditLabel: 'เปลี่ยนวันที่หมดระยะเวลาเก็บ',
  expirySave: 'บันทึกวันที่',
  expiryErrorFormat: 'กรอกวันที่ในรูปแบบ YYYY-MM-DD',
  expiryErrorNotFuture: 'เลือกวันที่หลังวันนี้',
  expiryCustomNote: 'วันที่นี้คุณกำหนดเอง แม้การตั้งค่าระยะเวลาเก็บจะเปลี่ยน วันที่นี้ก็ยังคงเดิม',
  retentionHeading: 'ระยะเวลาเก็บภาพ',
  retentionLabel: 'ระยะเวลาเก็บ (เดือน)',
  retentionHint:
    'นี่คือค่าที่ตั้งในแอปนี้ ไม่ใช่ระยะเวลาตามกฎหมาย เมื่อครบระยะเวลา แอปจะถามว่าจะลบภาพหรือไม่ ถ้าต้องการเก็บนานขึ้น ให้เพิ่มระยะเวลา หลักฐานเกี่ยวกับค่าจ้างอาจต้องใช้นานกว่านั้น จึงควรเพิ่มระยะเวลาเก็บ หรือเก็บแยกไว้เป็น PDF หลักฐาน',
  retentionSave: 'บันทึกระยะเวลาเก็บ',
  retentionSaved: (changed) => `บันทึกแล้ว คำนวณวันที่หมดระยะเวลาเก็บของภาพ ${s(changed)} ภาพใหม่แล้ว`,
  retentionError: (min, max) => `กรอกตัวเลขระหว่าง ${s(min)} ถึง ${s(max)} เดือน`,
  retentionApplyAsk: (n) => `ถ้าเปลี่ยนแบบนี้ ระยะเวลาเก็บของภาพ ${s(n)} ภาพจะหมดทันที แอปจะถามว่าจะลบหรือไม่ ต้องการเปลี่ยนหรือไม่?`,
  retentionApplyConfirm: 'เปลี่ยน',
  retentionApplyCancel: 'ยกเลิก',
  purged: (n) => `ลบภาพที่เกินระยะเวลาเก็บแล้ว ${s(n)} ภาพ`,
  months: (n) => `${s(n)} เดือน`,
  wipeIncludesPhotos: 'การลบทั้งหมดจะลบภาพที่บันทึกไว้ด้วย',
};
