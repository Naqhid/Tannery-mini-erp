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
