import { describe, expect, it } from 'vitest';
import type { ContentStack, ContentTable, ContentText } from 'pdfmake/interfaces';
import { ARC_PDF_FILE_NAME, buildArcDoc } from './arcPdf';
import { toArcFormValues, type ArcExtraInput } from './arcMapping';
import type { PassportData } from './mrz';
import { ARC_FORM_FIELDS } from '../forms/arcForm';
import { DRAFT_FOOTER_KO } from '../pdf/download';

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

const VALUES = toArcFormValues(SPECIMEN, EXTRA);

interface Cell {
  no: number;
  label: string;
  value: string;
  colSpan: number;
}

function findTable(doc: ReturnType<typeof buildArcDoc>): ContentTable {
  const content = Array.isArray(doc.content) ? doc.content : [doc.content];
  const table = content.find((c) => typeof c === 'object' && c !== null && 'table' in c);
  if (!table) throw new Error('no table');
  return table as ContentTable;
}

function cells(doc: ReturnType<typeof buildArcDoc>): Cell[] {
  const out: Cell[] = [];
  for (const row of findTable(doc).table.body) {
    for (const cell of row) {
      if (typeof cell !== 'object' || cell === null || !('stack' in cell)) continue;
      const stack = (cell as ContentStack).stack as ContentText[];
      const label = String(stack[0].text);
      const m = /^(\d+)\. (.*)$/.exec(label);
      if (!m) throw new Error(`bad label ${label}`);
      out.push({
        no: Number(m[1]),
        label: m[2],
        value: String(stack[1].text),
        colSpan: (cell as { colSpan?: number }).colSpan ?? 1,
      });
    }
  }
  return out;
}

function allText(node: unknown): string {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(allText).join('\n');
  if (node && typeof node === 'object') {
    const o = node as Record<string, unknown>;
    return ['text', 'stack', 'columns'].map((k) => (k in o ? allText(o[k]) : '')).join('\n');
  }
  return '';
}

describe('buildArcDoc', () => {
  it('lists fields 1~13 in order with labelKo from ARC_FORM_FIELDS', () => {
    const cs = cells(buildArcDoc(VALUES, '2026-10-27'));
    expect(cs.map((c) => c.no)).toEqual(Array.from({ length: 13 }, (_, i) => i + 1));
    expect(cs.map((c) => c.label)).toEqual(ARC_FORM_FIELDS.map((f) => f.labelKo));
  });

  it('fills each cell with the mapped value', () => {
    const cs = cells(buildArcDoc(VALUES, '2026-10-27'));
    ARC_FORM_FIELDS.forEach((f, i) => {
      expect(cs[i].value).toBe(VALUES[f.id as keyof typeof VALUES]);
    });
    expect(cs[1].value).toBe('ERIKSSON');
    expect(cs[7].value).toBe('발급 2002.04.16 / 만료 2012.04.15');
  });

  it('leaves the sign cell blank', () => {
    const cs = cells(buildArcDoc(VALUES, '2026-10-27'));
    const sign = cs.find((c) => c.no === 13);
    expect(sign?.value).toBe('');
  });

  it('makes span-2 fields full width and every row 2 columns', () => {
    const doc = buildArcDoc(VALUES, '2026-10-27');
    const cs = cells(doc);
    ARC_FORM_FIELDS.forEach((f, i) => expect(cs[i].colSpan).toBe(f.span));
    for (const row of findTable(doc).table.body) expect(row).toHaveLength(2);
  });

  it('has a title and generated date', () => {
    const doc = buildArcDoc(VALUES, '2026-10-27');
    const text = allText(doc.content);
    expect(text).toContain('외국인등록 신청서 (자체 작성 양식)');
    expect(text).toContain('2026-10-27');
  });

  it('footer carries the official-form notice and the draft notice', () => {
    const doc = buildArcDoc(VALUES, '2026-10-27');
    const footer =
      typeof doc.footer === 'function' ? doc.footer(1, 1, { width: 595, height: 842 } as never) : doc.footer;
    const text = allText(footer);
    expect(text).toContain('공식 양식을 본뜬 자체 양식입니다. 출입국·외국인관서의 공식 서식이 우선합니다.');
    expect(text).toContain(DRAFT_FOOTER_KO);
  });

  it('exposes the download file name', () => {
    expect(ARC_PDF_FILE_NAME).toBe('korea30-arc-application.pdf');
  });
});
