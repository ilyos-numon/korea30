import { describe, expect, it } from 'vitest';
import { ICAO_TO_KO, toArcFormValues, validateArcExtra, type ArcExtraInput } from './arcMapping';
import type { PassportData } from './mrz';
import { FORM_FIELD_IDS } from '../i18n/ids';

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

const EXTRA: ArcExtraInput = {
  addressKr: '○○시 ○○구 ○○로 12, 301호',
  phone: '010-1234-5678',
  addressHome: 'Utopia City',
  workplace: '○○산업 / 123-45-67890',
  passportIssueDate: '2002-04-16',
};

describe('toArcFormValues', () => {
  it('has a key for all 13 form fields', () => {
    const v = toArcFormValues(SPECIMEN, EXTRA);
    expect(Object.keys(v).sort()).toEqual([...FORM_FIELD_IDS].sort());
    expect(FORM_FIELD_IDS).toHaveLength(13);
    for (const id of FORM_FIELD_IDS) expect(typeof v[id]).toBe('string');
  });

  it('maps the specimen into form values', () => {
    expect(toArcFormValues(SPECIMEN, EXTRA)).toEqual({
      'apply-type': '외국인 등록',
      surname: 'ERIKSSON',
      'given-names': 'ANNA MARIA',
      birth: '1974.08.12',
      sex: '여(F)',
      nationality: '유토피아(견본)',
      'passport-no': 'L898902C3',
      'passport-dates': '발급 2002.04.16 / 만료 2012.04.15',
      'address-kr': EXTRA.addressKr,
      phone: EXTRA.phone,
      'address-home': EXTRA.addressHome,
      workplace: EXTRA.workplace,
      sign: '',
    });
  });

  it('maps sex M and X', () => {
    expect(toArcFormValues({ ...SPECIMEN, sex: 'M' }, EXTRA).sex).toBe('남(M)');
    expect(toArcFormValues({ ...SPECIMEN, sex: 'X' }, EXTRA).sex).toBe('X');
  });

  it('uses Korean country names and falls back to the ICAO code', () => {
    expect(toArcFormValues({ ...SPECIMEN, nationality: 'VNM' }, EXTRA).nationality).toBe('베트남');
    expect(toArcFormValues({ ...SPECIMEN, nationality: 'CHN' }, EXTRA).nationality).toBe('중국');
    expect(toArcFormValues({ ...SPECIMEN, nationality: 'FRA' }, EXTRA).nationality).toBe('FRA');
  });
});

describe('ICAO_TO_KO', () => {
  it('covers the planned countries', () => {
    for (const code of ['CHN', 'VNM', 'USA', 'THA', 'UZB', 'RUS', 'PHL', 'KHM', 'NPL', 'IDN', 'MNG', 'KAZ', 'KGZ', 'MMR', 'LKA', 'UTO']) {
      expect(ICAO_TO_KO[code]).toBeTruthy();
    }
    expect(ICAO_TO_KO.UZB).toBe('우즈베키스탄');
  });
});

describe('validateArcExtra', () => {
  it('accepts complete input', () => {
    expect(validateArcExtra(EXTRA)).toEqual({});
  });

  it('requires addressKr, phone, passportIssueDate only', () => {
    const errs = validateArcExtra({ addressKr: ' ', phone: '', addressHome: '', workplace: '', passportIssueDate: '' });
    expect(errs).toEqual({ addressKr: 'required', phone: 'required', passportIssueDate: 'required' });
  });

  it('rejects malformed or impossible issue dates', () => {
    expect(validateArcExtra({ ...EXTRA, passportIssueDate: '2024/01/10' }).passportIssueDate).toBe('badDate');
    expect(validateArcExtra({ ...EXTRA, passportIssueDate: '2024-02-30' }).passportIssueDate).toBe('badDate');
  });

  it('rejects malformed phone numbers', () => {
    expect(validateArcExtra({ ...EXTRA, phone: 'abc' }).phone).toBe('badPhone');
    expect(validateArcExtra({ ...EXTRA, phone: '01012345678' })).toEqual({});
  });
});
