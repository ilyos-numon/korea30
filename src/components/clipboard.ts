/** writeText 가 resolve 하면 true. API 없음·reject·동기 throw → false */
export async function copyText(text: string, clipboard?: Pick<Clipboard, 'writeText'> | null): Promise<boolean> {
  const target = clipboard === undefined ? globalThis.navigator?.clipboard : clipboard;
  if (!target || typeof target.writeText !== 'function') return false;
  try {
    await target.writeText(text);
    return true;
  } catch {
    return false;
  }
}
