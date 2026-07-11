import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportConfig {
  title: string;
  subtitle?: string;
  columns: string[];
  rows: string[][];
  accentColor?: [number, number, number];
  fileName?: string;
}

function buildPDF(config: ExportConfig): jsPDF {
  const {
    title,
    subtitle,
    columns,
    rows,
    accentColor = [99, 102, 241], // indigo
  } = config;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header bar
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(0, 0, pageWidth, 18, 'F');

  // Company name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('AKM LEATHER', 14, 12);

  // Title on right
  doc.setFontSize(11);
  doc.text(title, pageWidth - 14, 12, { align: 'right' });

  // Subtitle
  if (subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(subtitle, 14, 25);
  }

  // Date
  doc.setFontSize(8);
  doc.setTextColor(130, 130, 130);
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  doc.text(`Generated: ${dateStr}`, pageWidth - 14, 25, { align: 'right' });

  // Table
  autoTable(doc, {
    startY: 30,
    head: [columns],
    body: rows,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3,
      lineColor: [220, 220, 220],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [accentColor[0], accentColor[1], accentColor[2]],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    bodyStyles: {
      textColor: [50, 50, 50],
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, pageH - 8, { align: 'right' });
    doc.text('AKM Leather - Tannery ERP', 14, pageH - 8);
  }

  return doc;
}

export function previewPDF(config: ExportConfig): void {
  const doc = buildPDF(config);
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

export function downloadPDF(config: ExportConfig): void {
  const doc = buildPDF(config);
  const fileName = config.fileName || `${config.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
