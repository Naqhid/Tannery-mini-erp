import pool from '../config/db.js';
import XLSX from 'xlsx';

/**
 * Export Materials, Material Receipts, and Material Issues to Excel
 * GET /api/export/materials-excel
 */
export async function exportMaterialsExcel(req, res) {
  try {
    // 1. Materials Master
    const [materials] = await pool.query(
      `SELECT m.id, m.code, m.name, m.type, m.uom, m.primary_uom_id, m.secondary_uom_id,
         m.currency, m.category, m.chemical_group, m.group_id, m.appearance, m.color,
         m.ph_value, m.flash_point, m.hsn_code, m.cas_number, m.shelf_life,
         m.storage_condition, m.hazardous, m.default_warehouse, m.opening_stock,
         m.opening_stock_uom, m.current_stock, m.reorder_level, m.maximum_level,
         m.standard_cost, m.last_purchase_price, m.preferred_supplier_id, m.lead_time,
         m.description, m.application, m.remarks, m.attachment_path, m.status,
         m.created_by, m.updated_by, m.created_at, m.updated_at,
         s.name AS preferred_supplier_name,
         pu.name AS primary_uom_name, su.name AS secondary_uom_name
       FROM materials m
       LEFT JOIN suppliers s ON m.preferred_supplier_id = s.id
       LEFT JOIN uom pu ON m.primary_uom_id = pu.id
       LEFT JOIN uom su ON m.secondary_uom_id = su.id
       ORDER BY m.id ASC`
    );

    // 2. Material Receipts (header)
    const [receipts] = await pool.query(
      `SELECT mr.id, mr.receipt_no, mr.receipt_date, mr.receipt_type, mr.supplier_id,
         mr.purchase_order_no, mr.po_date, mr.challan_no, mr.challan_date,
         mr.lr_grn_no, mr.lr_grn_date, mr.transporter, mr.gate_entry_no,
         mr.warehouse_id, mr.freight, mr.loading_charges, mr.other_charges,
         mr.gst_percent, mr.cgst_amount, mr.sgst_amount, mr.total_gst_amount,
         mr.total_other_charges, mr.total_amount, mr.grand_total,
         mr.remarks, mr.status, mr.created_by, mr.updated_by, mr.created_at,
         s.name AS supplier_name, w.name AS warehouse_name
       FROM material_receipts mr
       LEFT JOIN suppliers s ON mr.supplier_id = s.id
       LEFT JOIN warehouses w ON mr.warehouse_id = w.id
       ORDER BY mr.id ASC`
    );

    // 3. Material Receipt Items
    const [receiptItems] = await pool.query(
      `SELECT mri.id, mri.receipt_id, mri.material_id, mri.uom, mri.primary_uom,
         mri.secondary_uom, mri.order_qty, mri.primary_uom_qty, mri.secondary_uom_qty,
         mri.currency, mri.exchange_rate, mri.rate_fc, mri.rate_inr,
         mri.amount_fc, mri.amount_inr, mri.received_qty, mri.rate, mri.amount,
         mri.batch_no, mri.expiry_date,
         m.name AS material_name, m.code AS material_code,
         mr.receipt_no
       FROM material_receipt_items mri
       LEFT JOIN materials m ON mri.material_id = m.id
       LEFT JOIN material_receipts mr ON mri.receipt_id = mr.id
       ORDER BY mri.receipt_id ASC, mri.id ASC`
    );

    // 4. Material Issues (header)
    const [issues] = await pool.query(
      `SELECT mi.id, mi.issue_no, mi.issue_date, mi.department, mi.job_order_no,
         mi.production_batch, mi.batch_qty, mi.batch_uom, mi.batch_description,
         mi.costing_method, mi.warehouse_id, mi.required_date, mi.issued_by,
         mi.loading_unloading, mi.other_charges, mi.total_material_cost, mi.grand_total,
         mi.remarks, mi.status, mi.created_by, mi.updated_by, mi.created_at,
         w.name AS warehouse_name
       FROM material_issues mi
       LEFT JOIN warehouses w ON mi.warehouse_id = w.id
       ORDER BY mi.id ASC`
    );

    // 5. Material Issue Items
    const [issueItems] = await pool.query(
      `SELECT mii.id, mii.issue_id, mii.material_id, mii.uom, mii.required_qty,
         mii.issue_qty, mii.unit_cost, mii.amount, mii.remarks,
         m.name AS material_name, m.code AS material_code,
         mi.issue_no
       FROM material_issue_items mii
       LEFT JOIN materials m ON mii.material_id = m.id
       LEFT JOIN material_issues mi ON mii.issue_id = mi.id
       ORDER BY mii.issue_id ASC, mii.id ASC`
    );

    // Build workbook
    const wb = XLSX.utils.book_new();

    const wsMaterials = XLSX.utils.json_to_sheet(materials);
    XLSX.utils.book_append_sheet(wb, wsMaterials, 'Materials Master');

    const wsReceipts = XLSX.utils.json_to_sheet(receipts);
    XLSX.utils.book_append_sheet(wb, wsReceipts, 'Material Receipts');

    const wsReceiptItems = XLSX.utils.json_to_sheet(receiptItems);
    XLSX.utils.book_append_sheet(wb, wsReceiptItems, 'Receipt Items');

    const wsIssues = XLSX.utils.json_to_sheet(issues);
    XLSX.utils.book_append_sheet(wb, wsIssues, 'Material Issues');

    const wsIssueItems = XLSX.utils.json_to_sheet(issueItems);
    XLSX.utils.book_append_sheet(wb, wsIssueItems, 'Issue Items');

    // Generate buffer
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Send as downloadable file
    const filename = `Materials_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);
  } catch (err) {
    console.error('Excel export error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate Excel export', error: err.message });
  }
}
