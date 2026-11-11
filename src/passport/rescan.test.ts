import { describe, expect, it } from 'vitest';
import { keptEdits } from './rescan';
import { toArcFormValues, type ArcExtraInput } from './arcMapping';
import type { PassportData } from './mrz';

const SPECIMEN: PassportData = {
  documentNumber: 'L898902C3',
  surname: 'ERIKSSON',
  givenNames: 'ANNA MARIA',
  nationality: 'UTO',
  issuingState: 'UTO',
  birthDate: '1974-08-12',
  expiryDate: '2012-04-15',
  sex: 'F',
};

const EXTRA: ArcExtraInput = { addressKr: '', phone: '', addressHome: '', workplace: '', passportIssueDate: '' };

const BASE = toArcFormValues(SPECIMEN, EXTRA);

describe('keptEdits', () => {
  it('returns ids whose override differs from the new reading', () => {
    expect(keptEdits({ surname: 'KIM' }, BASE)).toEqual(['surname']);
  });

  it('ignores overrides equal to the new reading', () => {
    expect(keptEdits({ surname: 'ERIKSSON' }, BASE)).toEqual([]);
  });

  it('returns nothing for empty overrides', () => {
    expect(keptEdits({}, BASE)).toEqual([]);
  });

  it('keeps Object.keys order', () => {
    expect(keptEdits({ phone: '010', surname: 'KIM', birth: BASE.birth }, BASE)).toEqual(['phone', 'surname']);
  });
});
