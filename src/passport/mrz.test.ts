import { describe, expect, it } from 'vitest';
import { normalizeMrzText, parsePassportMrz } from './mrz';

// ICAO Doc 9303 Part 4 TD3 specimen
const L1 = 'P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<';
const L2 = 'L898902C36UTO7408122F1204159ZE184226B<<<<<10';
const SPECIMEN = `${L1}\n${L2}`;
const TODAY = '2026-10-27';

describe('normalizeMrzText', () => {
  it('returns the two specimen lines unchanged', () => {
    expect(normalizeMrzText(SPECIMEN)).toEqual([L1, L2]);
  });

  it('normalizes OCR noise: «, spaces, lowercase', () => {
    const noisy = `  p«utoeriksson««anna«maria«««««««««««««««««««\nL898902C36 UTO 7408122F 1204159ZE184226B<<<<<10  `;
    expect(normalizeMrzText(noisy)).toEqual([L1, L2]);
  });

  it('skips non-MRZ text above the zone', () => {
    const text = `PASSPORT\nUtopia\nSurname ERIKSSON\n${L1}\n${L2}\n`;
    expect(normalizeMrzText(text)).toEqual([L1, L2]);
  });

  it('pads lines that lost trailing fillers', () => {
    const shortL1 = L1.slice(0, 40);
    expect(normalizeMrzText(`${shortL1}\n${L2}`)).toEqual([L1, L2]);
  });

  it('splits a single pasted 88-char line', () => {
    expect(normalizeMrzText(`${L1}${L2}`)).toEqual([L1, L2]);
  });

  it('returns fewer than 2 lines when only one line is present', () => {
    expect(normalizeMrzText(L1).length).toBeLessThan(2);
  });
});

describe('parsePassportMrz', () => {
  it('parses the ICAO TD3 specimen', () => {
    const r = parsePassportMrz(SPECIMEN, TODAY);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data).toEqual({
      documentNumber: 'L898902C3',
      surname: 'ERIKSSON',
      givenNames: 'ANNA MARIA',
      nationality: 'UTO',
      issuingState: 'UTO',
      birthDate: '1974-08-12',
      expiryDate: '2012-04-15',
      sex: 'F',
    });
    expect(r.corrected).toBe(false);
  });

  it('parses noisy OCR text', () => {
    const r = parsePassportMrz(`${L1.toLowerCase().replace(/</g, '«')}\r\n l898902c36 uto7408122f1204159ze184226b«««««10`, TODAY);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.documentNumber).toBe('L898902C3');
  });

  it('autocorrects O→0 in numeric fields and flags corrected', () => {
    const r = parsePassportMrz(`${L1}\n${L2.replace('7408122', '74O8122')}`, TODAY);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.corrected).toBe(true);
    expect(r.data.birthDate).toBe('1974-08-12');
  });

  it('reports checksum failure with partial data', () => {
    const r = parsePassportMrz(`${L1}\n${L2.replace('L898902C36', 'L898902C37')}`, TODAY);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error).toBe('checksum');
    expect(r.partial.surname).toBe('ERIKSSON');
    expect(r.partial.birthDate).toBe('1974-08-12');
  });

  it('reports unreadable for a single line', () => {
    const r = parsePassportMrz(L1, TODAY);
    expect(r).toEqual({ ok: false, error: 'unreadable', partial: {} });
  });

  it('reports unreadable for empty or garbage text', () => {
    expect(parsePassportMrz('', TODAY)).toMatchObject({ ok: false, error: 'unreadable' });
    expect(parsePassportMrz('hello world', TODAY)).toMatchObject({ ok: false, error: 'unreadable' });
  });

  it('reports notTd3 for a TD1 identity card', () => {
    const td1 = 'I<UTOD231458907<<<<<<<<<<<<<<<\n7408122F1204159UTO<<<<<<<<<<<6\nERIKSSON<<ANNA<MARIA<<<<<<<<<<';
    expect(parsePassportMrz(td1, TODAY)).toMatchObject({ ok: false, error: 'notTd3' });
  });

  it('decides the birth century from today', () => {
    // 2000-01-01 born, expiry 2030-01-01, checksums computed for this line
    const l1 = 'P<UTOTEST<<KIM<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<';
    const l2 = 'A123456784UTO0001018M3001019<<<<<<<<<<<<<<02';
    const r = parsePassportMrz(`${l1}\n${l2}`, TODAY);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data.birthDate).toBe('2000-01-01');
    expect(r.data.expiryDate).toBe('2030-01-01');
    expect(r.data.sex).toBe('M');
    // YY > today's YY → 19YY, otherwise 20YY
    const older = parsePassportMrz(SPECIMEN, '2073-01-01');
    expect(older.ok && older.data.birthDate).toBe('1974-08-12');
    const newer = parsePassportMrz(SPECIMEN, '2075-01-01');
    expect(newer.ok && newer.data.birthDate).toBe('2074-08-12');
  });

  it('maps "<" sex to X', () => {
    const l1 = 'P<UTOTEST<<KIM<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<';
    const l2 = 'A123456784UTO0001018<3001019<<<<<<<<<<<<<<02';
    const r = parsePassportMrz(`${l1}\n${l2}`, TODAY);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.sex).toBe('X');
  });
});
