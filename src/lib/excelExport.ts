import * as XLSX from 'xlsx';

interface ExcelExportOptions {
  data: any[];
  columns: { key: string; header: string }[];
  fileName: string;
}

export function exportToExcel({ data, columns, fileName }: ExcelExportOptions): void {
  // Create headers row
  const headers = columns.map(col => col.header);

  // Create data rows
  const rows = data.map(row =>
    columns.map(col => {
      const value = row[col.key];
      return value !== null && value !== undefined ? value : '';
    })
  );

  // Combine headers and data
  const worksheetData = [headers, ...rows];

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths
  const colWidths = columns.map(col => ({ wch: Math.max(col.header.length, 15) }));
  worksheet['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // Generate and download
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

// ─── Sectioned Excel (header details + multiple titled blocks in one sheet) ──

export interface ExcelKeyValue { label: string; value: string | number; }
export interface ExcelSection {
  heading: string;
  columns: string[];
  rows: (string | number)[][];
}
export interface SectionedExcelOptions {
  title: string;
  details?: ExcelKeyValue[];
  sections: ExcelSection[];
  fileName: string;
}

export function exportSectionedToExcel({ title, details = [], sections, fileName }: SectionedExcelOptions): void {
  const aoa: (string | number)[][] = [];

  // Title row
  aoa.push([title]);
  aoa.push([]);

  // Details block as label/value pairs, two pairs per row.
  if (details.length > 0) {
    for (let i = 0; i < details.length; i += 2) {
      const a = details[i];
      const b = details[i + 1];
      aoa.push([a.label, a.value, '', b ? b.label : '', b ? b.value : '']);
    }
    aoa.push([]);
  }

  // Each section: heading, column headers, rows, blank separator.
  for (const section of sections) {
    aoa.push([section.heading]);
    aoa.push(section.columns);
    for (const r of section.rows) aoa.push(r);
    aoa.push([]);
  }

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(aoa);

  // Reasonable default column widths.
  const maxCols = aoa.reduce((m, r) => Math.max(m, r.length), 0);
  worksheet['!cols'] = Array.from({ length: maxCols }, () => ({ wch: 20 }));

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Standard Cost');
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

export function previewExcelData(data: any[], columns: { key: string; header: string }[]): string {
  const headers = columns.map(col => col.header);
  const rows = data.map(row =>
    columns.map(col => {
      const value = row[col.key];
      return value !== null && value !== undefined ? String(value) : '';
    })
  );

  const worksheetData = [headers, ...rows];
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  return XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });
}
