export const DRAFT_FOOTER_KO =
  '이 문서는 Korea30이 기기 안에서 만든 초안입니다. 법률 판단이 아니며, 제출 전에 내용을 확인해 보세요.';

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
