import type { AboutStrings } from './types';

export const zh: AboutStrings = {
  linkPrivacy: '隐私政策',
  linkTerms: '使用说明',
  privacyTitle: '隐私政策',
  privacyIntro: 'Korea30 不收集个人信息。你输入的记录不会离开这台设备。',
  privacyNoCollectTitle: '不收集的内容',
  privacyNoCollectBody: '没有服务器、登录或账号，也没有分析或广告工具。姓名、护照信息、工作记录和照片都不会发送到任何地方。',
  privacyStorageTitle: '保存在这台设备上的内容',
  privacyStorageBody:
    '任务进度、工作记录、居留期限和语言设置只保存在这个浏览器的设备存储（IndexedDB、localStorage）中。在浏览器设置里清除本网站数据后，这些内容会全部消失。',
  privacyPhotoTitle: '照片和护照',
  privacyPhotoBody: '工作照片会先删除位置等照片信息，再只保存在这台设备上。护照照片只在这台设备上读取文字，不会保存。',
  privacyBackupTitle: '备份文件',
  privacyBackupBody: '只有你自己下载时才会生成备份文件。文件没有加密，请只放在你信任的地方。',
  privacyHostingTitle: '传送应用的服务',
  privacyHostingBody:
    '传送应用文件的托管服务在你访问时可能会留下一般的访问记录（IP 地址、时间等）。Korea30 不会接收也不会使用这些记录。',
  privacyUpdated: (date) => `生效日期：${date}`,
  termsTitle: '使用说明',
  termsIntro: 'Korea30 是一款帮助你了解在韩国生活第一个月办事顺序和常用表达的指南应用。',
  termsNotAdviceTitle: '不是法律或签证判断',
  termsNotAdviceBody:
    '应用中的内容是一般性指南。法律、签证、劳动问题的判断，请向外国人综合服务中心（1345）或雇佣劳动部咨询中心（1350）等官方机构确认。',
  termsAccuracyTitle: '信息可能会变化',
  termsAccuracyBody: '法定数值和联系方式已与官方来源核对，但制度可能会变化。翻译和发音标注可能尚未经过母语者审核。',
  termsDocsTitle: '生成的文件是草稿',
  termsDocsBody: '应用生成的 PDF 是草稿或应用自己的格式。提交前请自己确认。以官方表格为准。',
  contactTitle: '联系',
  contactBody: '如发现应用错误或内容有误，请通过下方告诉我们。',
  contactPending: '联系方式正在准备中。',
};
