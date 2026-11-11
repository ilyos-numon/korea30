import { loadArrival, saveArrival, validateArrival } from '../quest/arrival';
import type { ProgressStorage } from '../quest/progress';
import type { StayProfile } from '../storage/db';
import { stayProfileRepo } from '../storage/repos';
import { notifyStayChanged } from './DeadlineBanner';
import { validateStayProfile } from './rules';

/** 도착일(퀘스트) ↔ 입국일(체류) 한쪽을 넣으면 비어 있는 다른 쪽을 같은 날짜로 채운다. 이미 값이 있으면 덮어쓰지 않는다. */
export type SyncResult = 'filled' | 'kept' | 'skipped' | 'failed';

export interface StayRepoLike {
  get(): Promise<StayProfile | null>;
  put(p: StayProfile): Promise<void>;
}

/** 프로필 없음 skipped · entryDate!==null kept · validateStayProfile({...rest, entryDate}, today) 오류 skipped ·
 *  put 성공 filled + notifyStayChanged() · 예외 failed */
export async function fillEntryFromArrival(
  arrivalIso: string,
  today: string,
  repo: StayRepoLike = stayProfileRepo,
): Promise<SyncResult> {
  try {
    const p = await repo.get();
    if (!p) return 'skipped';
    if (p.entryDate !== null) return 'kept';
    const { id: _id, ...rest } = p;
    const errors = validateStayProfile({ ...rest, entryDate: arrivalIso }, today);
    if (Object.keys(errors).length > 0) return 'skipped';
    await repo.put({ ...p, entryDate: arrivalIso });
    notifyStayChanged();
    return 'filled';
  } catch {
    return 'failed';
  }
}

/** storage null failed · loadArrival!==null kept · validateArrival 오류 skipped · saveArrival filled · throw failed */
export function fillArrivalFromEntry(entryIso: string, today: string, storage: ProgressStorage | null): SyncResult {
  if (!storage) return 'failed';
  try {
    if (loadArrival(storage) !== null) return 'kept';
    if (validateArrival(entryIso, today) !== null) return 'skipped';
    saveArrival(storage, entryIso);
    return 'filled';
  } catch {
    return 'failed';
  }
}
