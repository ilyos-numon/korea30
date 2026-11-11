export const PROGRESS_KEY = 'korea30.progress.v1';

export type ProgressStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export type DayState = 'done' | 'today' | 'locked';

/** JSON 배열을 읽어 1..total 정수 중 1부터 끊김 없이 이어지는 접두만 반환. 파싱 실패·배열 아님 → []. */
export function loadCompleted(s: ProgressStorage, total: number): number[] {
  const raw = s.getItem(PROGRESS_KEY);
  if (raw === null) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const result: number[] = [];
  for (let i = 0; i < parsed.length && i < total; i++) {
    if (parsed[i] !== i + 1) break;
    result.push(i + 1);
  }
  return result;
}

export function saveCompleted(s: ProgressStorage, completed: number[]): void {
  const sorted = [...completed].sort((a, b) => a - b);
  s.setItem(PROGRESS_KEY, JSON.stringify(sorted));
}

export function clearProgress(s: ProgressStorage): void {
  s.removeItem(PROGRESS_KEY);
}

export function currentDay(completed: number[], total: number): number | null {
  for (let day = 1; day <= total; day++) {
    if (!completed.includes(day)) return day;
  }
  return null;
}

export function dayState(day: number, completed: number[], total: number): DayState {
  if (completed.includes(day)) return 'done';
  return day === currentDay(completed, total) ? 'today' : 'locked';
}

/** day === currentDay 일 때만 추가한 새 배열 반환, 아니면 completed 그대로 반환 */
export function completeDay(completed: number[], day: number, total: number): number[] {
  if (day !== currentDay(completed, total)) return completed;
  return [...completed, day];
}
