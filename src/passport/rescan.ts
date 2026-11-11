import type { FormFieldId } from '../i18n/ids';
import type { ArcFormValues } from './arcMapping';

/** overrides 중 base 와 값이 다른 칸 id (정렬: Object.keys 순서) */
export function keptEdits(overrides: Partial<Record<FormFieldId, string>>, base: ArcFormValues): FormFieldId[] {
  return (Object.keys(overrides) as FormFieldId[]).filter((id) => overrides[id] !== base[id]);
}
