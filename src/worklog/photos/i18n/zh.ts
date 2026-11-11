import type { PhotoStrings } from './types';

/** 值缺失或为空时返回 '-'（不返回空字符串） */
const s = (v: unknown): string => {
  if (v === undefined || v === null) return '-';
  if (typeof v === 'number' && !Number.isFinite(v)) return '-';
  return String(v).trim() || '-';
};

export const zh: PhotoStrings = {
  heading: '照片记录',
  intro: '把能证明工作的照片（打卡机画面、排班表等）连同日期保存在这台设备上。',
  privacyNote: '照片只保存在这台设备上。保存前会删除位置等照片信息。',
  dateLabel: '工作日期',
  shiftLabel: '关联的工作',
  shiftNone: '不关联',
  shiftOption: (date, start, end) => `${s(date)} ${s(start)}~${s(end)}`,
  memoLabel: '备注',
  camera: '用相机拍照',
  pick: '选择照片',
  saving: '正在保存…',
  saved: '已保存',
  errorNotImage: '只能保存图片文件。',
  errorTooLarge: (mb) => `照片太大。请选择${s(mb)}MB以下的照片。`,
  errorDecode: '无法打开这张照片。请选择其他照片。',
  errorQuota: '设备存储空间不足。请试着删除较早的照片。',
  errorUnknown: '没能保存。请再试一次。',
  empty: '本月没有保存的照片。',
  takenOn: (date) => `拍摄日期 ${s(date)}`,
  takenOnSaved: (date) => `保存日期 ${s(date)}（没有拍摄日期信息）`,
  expiresOn: (date) => `保存至${s(date)}`,
  expiringSoon: (days) => `${s(days)}天后保存期限结束`,
  linkedShift: (label) => `关联的工作：${s(label)}`,
  open: '放大查看',
  close: '关闭',
  delete: '删除',
  deleteAsk: '要删除这张照片吗？删除后无法恢复。',
  deleteConfirm: '删除',
  deleteCancel: '取消',
  expiryEditLabel: '更改保存截止日期',
  expirySave: '保存日期',
  expiryErrorFormat: '请按YYYY-MM-DD格式填写日期。',
  expiryErrorNotFuture: '请选择今天以后的日期。',
  expiryCustomNote: '这是你自己设定的日期。即使保存期限设置改变，也不会变。',
  retentionHeading: '照片保存期限',
  retentionLabel: '保存期限（月）',
  retentionHint:
    '这是本应用的设置，不是法定期限。期限一到，应用会问你是否删除照片。想保存更久，请延长期限。与工资有关的证据可能需要保存更久，请延长保存期限，或另外制作证据PDF保存。',
  retentionSave: '保存期限设置',
  retentionSaved: (changed) => `已保存。重新计算了${s(changed)}张照片的保存截止日期。`,
  retentionError: (min, max) => `请填写${s(min)}~${s(max)}个月之间的数字。`,
  retentionApplyAsk: (n) => `这样更改后，${s(n)}张照片的保存期限会立即结束。应用会问你是否删除。要更改吗？`,
  retentionApplyConfirm: '更改',
  retentionApplyCancel: '取消',
  purged: (n) => `已删除${s(n)}张超过保存期限的照片。`,
  months: (n) => `${s(n)}个月`,
  wipeIncludesPhotos: '全部删除时，保存的照片也会一起删除。',
};
