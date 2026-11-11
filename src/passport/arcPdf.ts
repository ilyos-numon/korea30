import type { Content, TableCell, TDocumentDefinitions } from 'pdfmake/interfaces';
import { ARC_FORM_FIELDS, type FormField } from '../forms/arcForm';
import { DRAFT_FOOTER_KO } from '../pdf/download';
import type { ArcFormValues } from './arcMapping';

export const ARC_PDF_FILE_NAME = 'korea30-arc-application.pdf';

const TITLE = '외국인등록 신청서 (자체 작성 양식)';
const OFFICIAL_NOTICE = '공식 양식을 본뜬 자체 양식입니다. 출입국·외국인관서의 공식 서식이 우선합니다.';

function fieldCell(f: FormField, values: ArcFormValues): TableCell {
  const value = values[f.id as keyof ArcFormValues] ?? '';
  const isSign = f.id === 'sign';
  return {
    stack: [
      { text: `${f.no}. ${f.labelKo}`, style: 'label' },
      { text: value, style: 'value', margin: [0, 2, 0, isSign ? 28 : 0] },
    ],
    ...(f.span === 2 ? { colSpan: 2 } : {}),
  };
}

function bodyRows(values: ArcFormValues): TableCell[][] {
  const rows: TableCell[][] = [];
  let pending: TableCell | null = null;
  for (const f of ARC_FORM_FIELDS) {
    const cell = fieldCell(f, values);
    if (f.span === 2) {
      if (pending) {
        rows.push([pending, {}]);
        pending = null;
      }
      rows.push([cell, {}]);
    } else if (pending) {
      rows.push([pending, cell]);
      pending = null;
    } else {
      pending = cell;
    }
  }
  if (pending) rows.push([pending, {}]);
  return rows;
}

/** 순수 함수. 공식 양식 배치를 본뜬 자체 레이아웃 (칸 번호·라벨은 ARC_FORM_FIELDS 그대로) */
export function buildArcDoc(values: ArcFormValues, generatedOn: string): TDocumentDefinitions {
  const footer: Content = {
    stack: [
      { text: OFFICIAL_NOTICE },
      { text: DRAFT_FOOTER_KO },
    ],
    fontSize: 8,
    color: '#555555',
    margin: [40, 4, 40, 0],
  };
  return {
    pageSize: 'A4',
    pageMargins: [40, 48, 40, 64],
    info: { title: TITLE },
    content: [
      { text: TITLE, style: 'title' },
      { text: `작성일 ${generatedOn}`, style: 'meta' },
      {
        table: { widths: ['*', '*'], body: bodyRows(values) },
        layout: {
          paddingLeft: () => 6,
          paddingRight: () => 6,
          paddingTop: () => 5,
          paddingBottom: () => 5,
        },
      },
    ],
    footer,
    styles: {
      title: { fontSize: 16, bold: true, alignment: 'center', margin: [0, 0, 0, 6] },
      meta: { fontSize: 9, alignment: 'right', margin: [0, 0, 0, 8] },
      label: { fontSize: 8, color: '#444444' },
      value: { fontSize: 11 },
    },
  };
}
