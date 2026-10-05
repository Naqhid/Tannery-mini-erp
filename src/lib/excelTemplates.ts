import * as XLSX from 'xlsx';

interface TemplateColumn {
  header: string;
  width: number;
  example?: string;
  note?: string;
}

function downloadTemplate(columns: TemplateColumn[], sheetName: string, fileName: string) {
  const headers = columns.map(c => c.header);
  const examples = columns.map(c => c.example || '');
  const notes = columns.map(c => c.note || '');

  const worksheetData = [headers, examples, notes];

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths
  worksheet['!cols'] = columns.map(c => ({ wch: c.width }));

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

// ─── Product Template ───
export function downloadProductTemplate() {
  const columns: TemplateColumn[] = [
    { header: 'Name *', width: 30, example: 'Black Nappa Leather', note: 'Required' },
    { header: 'Category', width: 20, example: 'Finished Leather', note: 'Must match existing category name' },
    { header: 'Group', width: 20, example: 'Finished Leather', note: 'Must match existing group name' },
    { header: 'Leather Type', width: 15, example: 'cow', note: 'cow / buffalo / goat / sheep' },
    { header: 'UOM', width: 12, example: 'Sq.Ft', note: 'Must match existing UOM name' },
    { header: 'Thickness', width: 15, example: '1.0-1.2mm', note: 'Must match existing thickness name' },
    { header: 'Color', width: 15, example: 'Black', note: 'Must match existing color name' },
    { header: 'Finish Type', width: 15, example: 'Semi Aniline', note: 'Must match existing finish type' },
    { header: 'Standard Size', width: 15, example: '10-15 Sq.Ft', note: 'Must match existing size name' },
    { header: 'Grade', width: 10, example: 'a', note: 'a / b / c' },
    { header: 'HSN Code', width: 12, example: '4107', note: 'Must match existing HSN code' },
    { header: 'Description', width: 40, example: 'Premium quality black nappa finish', note: 'Optional' },
    { header: 'Status', width: 10, example: 'Active', note: 'Active / Inactive' },
  ];
  downloadTemplate(columns, 'Products', 'Product_Import_Template');
}

// ─── Product Category Template ───
export function downloadCategoryTemplate() {
  const columns: TemplateColumn[] = [
    { header: 'Name *', width: 30, example: 'Finished Leather', note: 'Required, must be unique' },
    { header: 'Description', width: 50, example: 'All types of finished leather products', note: 'Optional' },
    { header: 'Status', width: 10, example: 'Active', note: 'Active / Inactive' },
  ];
  downloadTemplate(columns, 'Categories', 'Category_Import_Template');
}

// ─── Group Master Template ───
export function downloadGroupTemplate() {
  const columns: TemplateColumn[] = [
    { header: 'Name *', width: 30, example: 'Finished Leather', note: 'Required, must be unique' },
    { header: 'Category', width: 20, example: 'Finished Leather', note: 'Must match existing category name' },
    { header: 'HSN Code', width: 15, example: '4107', note: 'HSN/SAC code' },
    { header: 'GST Rate (%)', width: 12, example: '12.00', note: 'Number, e.g. 5, 12, 18, 28' },
    { header: 'Description', width: 40, example: 'Finished leather group', note: 'Optional' },
    { header: 'Status', width: 10, example: 'Active', note: 'Active / Inactive' },
  ];
  downloadTemplate(columns, 'Groups', 'Group_Import_Template');
}

// ─── Chemical / Material Template ───
export function downloadChemicalTemplate() {
  const columns: TemplateColumn[] = [
    { header: 'Name *', width: 30, example: 'Formic Acid 85%', note: 'Required' },
    { header: 'Type *', width: 15, example: 'Wet-end', note: 'Wet-end / Finishing' },
    { header: 'Category', width: 20, example: 'Tanning Chemicals', note: 'Must match existing category name' },
    { header: 'Group', width: 20, example: 'Tanning Chemicals', note: 'Must match existing group name' },
    { header: 'Primary UOM *', width: 15, example: 'Kilogram', note: 'Must match existing UOM name' },
    { header: 'Secondary UOM', width: 15, example: 'Litre', note: 'Must match existing UOM name' },
    { header: 'Currency', width: 10, example: 'INR', note: 'INR / USD / EUR / GBP' },
    { header: 'Color', width: 12, example: 'Clear', note: 'Optional' },
    { header: 'pH Value', width: 10, example: '2.5', note: 'Optional' },
    { header: 'Flash Point (°C)', width: 15, example: '69', note: 'Optional' },
    { header: 'CAS Number', width: 15, example: '64-18-6', note: 'Optional' },
    { header: 'Shelf Life (Months)', width: 18, example: '24', note: 'Optional' },
    { header: 'Storage Condition', width: 20, example: 'Cool & Dry', note: 'Room Temperature / Cool & Dry / Refrigerated / Flammable Storage / Ventilated Area' },
    { header: 'Hazardous', width: 10, example: 'No', note: 'Yes / No' },
    { header: 'Default Warehouse', width: 20, example: 'Chemical Store', note: 'Optional' },
    { header: 'Reorder Level', width: 12, example: '100', note: 'Optional, number' },
    { header: 'Maximum Level', width: 12, example: '1000', note: 'Optional, number' },
    { header: 'Preferred Supplier', width: 25, example: 'Modi Leather Supplies', note: 'Must match existing supplier name' },
    { header: 'Lead Time (Days)', width: 15, example: '7', note: 'Optional' },
    { header: 'Description', width: 40, example: 'Used in pickling process', note: 'Optional' },
    { header: 'Application / Use', width: 40, example: 'Pickling, neutralization', note: 'Optional' },
    { header: 'Remarks', width: 40, example: 'Handle with care', note: 'Optional' },
    { header: 'Status', width: 10, example: 'Active', note: 'Active / Inactive' },
  ];
  downloadTemplate(columns, 'Chemicals', 'Chemical_Material_Import_Template');
}

// ─── Warehouse Template ───
export function downloadWarehouseTemplate() {
  const columns: TemplateColumn[] = [
    { header: 'Name *', width: 25, example: 'Main Store', note: 'Required' },
    { header: 'Short Name', width: 15, example: 'MS', note: 'Optional abbreviation' },
    { header: 'Warehouse Type', width: 18, example: 'Raw Material', note: 'Raw Material / Finished Goods / WIP / Chemical / General' },
    { header: 'Location Address', width: 35, example: '123 Industrial Area, Phase 2', note: 'Optional' },
    { header: 'City', width: 15, example: 'Chennai', note: 'Optional' },
    { header: 'State', width: 15, example: 'Tamil Nadu', note: 'Optional' },
    { header: 'Country', width: 15, example: 'India', note: 'Optional' },
    { header: 'Pincode', width: 10, example: '600001', note: 'Optional' },
    { header: 'Phone', width: 15, example: '9876543210', note: 'Optional' },
    { header: 'Email', width: 25, example: 'store@company.com', note: 'Optional' },
    { header: 'Store Keeper', width: 20, example: 'John Doe', note: 'Optional' },
    { header: 'Storage Condition', width: 18, example: 'Dry', note: 'Dry / Cold / Humid' },
    { header: 'Material Movement', width: 15, example: 'FIFO', note: 'FIFO / LIFO / FEFO' },
    { header: 'Allow Negative Stock', width: 20, example: 'No', note: 'Yes / No' },
    { header: 'Status', width: 10, example: 'Active', note: 'Active / Inactive' },
  ];
  downloadTemplate(columns, 'Warehouses', 'Warehouse_Import_Template');
}
