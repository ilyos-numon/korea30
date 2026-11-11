import type { WorklogStrings } from './types';

/** 不是数字时为 null */
function toNum(v: number | string): number | null {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

const cnt = (v: number | string): string => String(toNum(v) ?? (String(v) || '-'));

const won = (v: number | string): string => {
  const n = toNum(v);
  return n === null ? `${String(v) || '-'}韩元` : `${n.toLocaleString('zh-CN')}韩元`;
};

const hoursMinutes = (v: number | string): string => {
  const n = toNum(v);
  if (n === null) return `${String(v) || '-'}分钟`;
  const h = Math.floor(Math.abs(n) / 60);
  const m = Math.abs(n) % 60;
  return `${n < 0 ? '-' : ''}${h}小时${m}分钟`;
};

export const zh: WorklogStrings = {
  title: '工作记录',
  intro: '记下上下班时间，就能估算这个月的工资。输入的内容只保存在这台设备上。',
  month: '选择月份',
  shiftHeading: '添加工作',
  shiftDate: '日期',
  shiftStart: '上班时间',
  shiftEnd: '下班时间',
  shiftBreak: '休息时间（分钟）',
  shiftHoliday: '我在休息日上班了',
  shiftMemo: '备注',
  shiftOvernightHint: '下班时间早于上班时间时，按第二天下班计算。',
  shiftAdd: '添加记录',
  errBadDate: '请检查一下日期。',
  errBadTime: '请检查一下时间。',
  errZeroLength: '上班时间和下班时间相同。',
  errTooLong: '一次工作超过了16小时。请检查一下时间。',
  errBreakTooLong: '休息时间比工作时间还长。',
  errBadBreak: '休息时间请输入0以上的整数（分钟）。',
  errFuture: '不能记录今天以后的日期。',
  listHeading: '本月记录',
  empty: '本月还没有记录。请在上面添加上下班时间。',
  breakMinutes: (v) => `休息${toNum(v) ?? (String(v) || '-')}分钟`,
  holidayTag: '休息日',
  delete: '删除',
  profileHeading: '时薪和工作单位',
  wage: '时薪（韩元）',
  wageHint: '请填写合同或工资单上写的时薪。',
  size: (v) => `工作单位有${cnt(v)}人以上`,
  sizeYes: (v) => `${cnt(v)}人以上`,
  sizeNo: (v) => `不到${cnt(v)}人`,
  sizeUnknown: '不太清楚',
  weekStart: '一周从哪天开始',
  weekStartMon: '星期一',
  weekStartSun: '星期日',
  detailsHeading: '本人和工作单位信息（用于申诉书草稿）',
  detailsHint: '不填也能计算。只用在申诉书草稿里。',
  workerName: '姓名',
  workerBirth: '出生日期',
  workerPhone: '联系电话',
  workerAddress: '地址',
  companyName: '工作单位名称',
  employerName: '负责人（代表）',
  employerAddress: '工作单位地址',
  employerPhone: '工作单位电话',
  startDate: '入职日期',
  endDate: '离职日期',
  profileSave: '保存',
  profileSaved: '已保存。',
  errWage: '时薪请只输入数字。',
  totalsHeading: '本月计算',
  totalWorked: '总工作时间',
  totalRegular: '规定工作时间',
  totalOvertime: '加班',
  totalNight: '夜班',
  totalHoliday: '休息日工作',
  basePay: '基本工资',
  premiumPay: '加班津贴（加算部分）',
  expectedGross: '预计工资（税前）',
  hoursMinutes,
  won,
  wageMissing: '保存时薪后就会计算金额。',
  minWageWarning: (v) => `输入的时薪低于今年的最低工资（${won(v)}）。请确认一下。`,
  noteSmallWorkplaceNoPremium: (v) => `不到${cnt(v)}人的工作单位，计算中没有包括加班、夜班、休息日加班津贴。`,
  noteWorkplaceSizeUnknown: (v) => `不知道工作单位人数，所以按包括加班津贴来计算。如果不到${cnt(v)}人，结果可能不同。`,
  noteBelowMinWage: '时薪低于最低工资。请确认一下。',
  noteWeeklyHolidayPayNotIncluded: '这个计算里不包括周休津贴。',
  compareHeading: '和工资单比较',
  compareHint: '输入本月工资单上的金额，就能看到和计算结果的差额。',
  compareEarnings: '支付',
  compareDeductions: '扣除',
  compareRun: '比较',
  errRequired: '请输入数字（没有就填0）',
  errNotNumber: '请只输入数字',
  errTooLarge: '请输入1亿韩元以下',
  compareExpected: '工作记录的计算',
  compareReported: '工资单上的应税支付额',
  compareDiff: '和计算结果的差额',
  statusMatch: '和计算结果差不多。',
  statusLower: '工资单比计算结果少。请确认一下。',
  statusHigher: '工资单比计算结果多。',
  unpaidEstimate: '估计未支付金额',
  deductionMismatch: (v) => `有${toNum(v) ?? (String(v) || '-')}项扣除和计算结果不同。请确认一下。`,
  ask1350: '需要判断时，请咨询1350（雇佣劳动部咨询中心）。',
  statementHeading: '申诉内容（草稿）',
  statementHint: '会用韩语写进PDF。可以自己修改。',
  statementReset: '恢复推荐的句子',
  pdf: '制作证据PDF',
  pdfHint: '把上下班记录、每月计算、工资单比较和申诉书草稿做成一个文件。只在这台设备上制作。',
  pdfBusy: '正在制作PDF…',
  pdfErrorEmpty: '没有工作记录，无法制作PDF。',
  pdfErrorLibrary: '没能制作PDF。请稍后再试。',
  wipe: '删除全部工作记录',
  wipeAsk: '要删除这台设备上保存的全部工作记录以及时薪、工作单位信息吗？',
  wipeConfirm: '全部删除',
  wipeCancel: '取消',
  wiped: '已删除全部工作记录。',
};
