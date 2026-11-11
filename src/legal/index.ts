import { STAY_LAW } from './data/stay';
import { WAGE_LAW } from './data/wage';
import type { LegalId, LegalValue } from './types';

export const ALL_LEGAL: readonly LegalValue<number | string>[] = [...WAGE_LAW, ...STAY_LAW];

const BY_ID: ReadonlyMap<LegalId, LegalValue<number | string>> = new Map(ALL_LEGAL.map((e) => [e.id, e]));

export function legalEntry(id: LegalId): LegalValue<number | string> {
  const e = BY_ID.get(id);
  if (!e) throw new Error(`legal: unknown id ${id}`);
  return e;
}

/** value 가 string 이면 throw */
export function legalNumber(id: LegalId): number {
  const { value } = legalEntry(id);
  if (typeof value !== 'number') throw new Error(`legal: ${id} is not a number`);
  return value;
}

/** nightStart/nightEnd/overstayNote 용. value 가 number 면 throw */
export function legalText(id: LegalId): string {
  const { value } = legalEntry(id);
  if (typeof value !== 'string') throw new Error(`legal: ${id} is not a string`);
  return value;
}

export function anyUnverified(ids: readonly LegalId[]): boolean {
  return ids.some((id) => legalEntry(id).status === 'unverified');
}
