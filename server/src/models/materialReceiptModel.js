import pool from '../config/db.js';
import { updateStock, addLedgerEntry } from './stockLedgerModel.js';

export async function getAll({ search, status, warehouse_id, page = 1, limit = 10, sortBy, sortOrder }) {
  let where = '1=1';
  const params = [];
  if (search) {
    where += ' AND (mr.receipt_no LIKE ? OR s.name LIKE ? OR w.name LIKE ?)';
    const t = `%${search}%`;
    params.push(t, t, t);
  }
  if (status) { where += ' AND mr.status = ?'; params.push(status); }
  if (warehouse_id) { where += ' AND mr.warehouse_id = ?'; params.push(warehouse_id); }

  const allowed = ['id', 'receipt_no', 'receipt_date', 'grand_total', 'status', 'created_at'];
  const col = allowed.includes(sortBy) ? `mr.\`${sortBy}\`` : 'mr.`id`';
  const ord = sortOrder === 'asc' ? 'ASC' : 'DESC';
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT mr.id, mr.receipt_no, mr.receipt_date, mr.receipt_type, mr.supplier_id,
       mr.purchase_order_no, mr.challan_no, mr.lr_grn_no, mr.warehouse_id,
       mr.freight, mr.loading_charges, mr.other_charges, mr.total_amount, mr.grand_total,
       mr.status, mr.created_at,
       s.name AS supplier_name, s.code AS supplier_code,
       w.name AS warehouse_name, w.code AS warehouse_code
     FROM material_receipts mr
     LEFT JOIN suppliers s ON mr.supplier_id = s.id
     LEFT JOIN warehouses w ON mr.warehouse_id = w.id
     WHERE ${where} ORDER BY ${col} ${ord} LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM material_receipts mr WHERE ${where}`, params
  );
  return { rows, total };
}

export async function getById(id) {
  const [[receipt]] = await pool.query(
    `SELECT mr.*, s.name AS supplier_name, s.code AS supplier_code,
       w.name AS warehouse_name, w.code AS warehouse_code
     FROM material_receipts mr
     LEFT JOIN suppliers s ON mr.supplier_id = s.id
     LEFT JOIN warehouses w ON mr.warehouse_id = w.id
     WHERE mr.id = ?`, [id]
  );
  if (!receipt) return null;
  const [items] = await pool.query(
    `SELECT mri.*, m.name AS material_name, m.code AS material_code
     FROM material_receipt_items mri
     LEFT JOIN materials m ON mri.material_id = m.id
     WHERE mri.receipt_id = ? ORDER BY mri.id ASC`, [id]
  );
  return { ...receipt, items };
}

export async function getNextNo() {
  const year = new Date().getFullYear();
  const [[row]] = await pool.query(
    `SELECT receipt_no FROM material_receipts WHERE receipt_no LIKE ? ORDER BY id DESC LIMIT 1`,
    [`GRN-${year}-%`]
  );
  if (!row) return `GRN-${year}-00001`;
  const num = parseInt(row.receipt_no.split('-')[2], 10) + 1;
  return `GRN-${year}-${String(num).padStart(5, '0')}`;
}

export async function create(data, items = [], createdBy = null) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const receipt_no = data.receipt_no || await getNextNo();
    const totalAmount = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
    const grandTotal = totalAmount + (parseFloat(data.freight) || 0) + (parseFloat(data.loading_charges) || 0) + (parseFloat(data.other_charges) || 0);

    const [result] = await conn.query(
      `INSERT INTO material_receipts (
        receipt_no, receipt_date, receipt_type, supplier_id, purchase_order_no, po_date,
        challan_no, challan_date, lr_grn_no, lr_grn_date, transporter, gate_entry_no,
        warehouse_id, freight, loading_charges, other_charges, total_amount, grand_total,
        remarks, status, created_by
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        receipt_no, data.receipt_date, data.receipt_type || 'Direct Purchase',
        data.supplier_id || null, data.purchase_order_no || null, data.po_date || null,
        data.challan_no || null, data.challan_date || null, data.lr_grn_no || null,
        data.lr_grn_date || null, data.transporter || null, data.gate_entry_no || null,
        data.warehouse_id, data.freight || 0, data.loading_charges || 0, data.other_charges || 0,
        totalAmount, grandTotal, data.remarks || null, data.status || 'Posted', createdBy,
      ]
    );
    const receiptId = result.insertId;

    for (const item of items) {
      await conn.query(
        `INSERT INTO material_receipt_items (receipt_id, material_id, uom, order_qty, received_qty, rate, amount, batch_no, expiry_date)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        [receiptId, item.material_id, item.uom || null, item.order_qty || 0,
         item.received_qty || 0, item.rate || 0, item.amount || 0,
         item.batch_no || null, item.expiry_date || null]
      );

      await updateStock(conn, data.warehouse_id, item.material_id, item.uom, item.received_qty || 0, item.rate || 0);

      await addLedgerEntry(conn, {
        transaction_date: data.receipt_date,
        transaction_type: 'Receipt',
        reference_type: 'material_receipt',
        reference_id: receiptId,
        reference_no: receipt_no,
        warehouse_id: data.warehouse_id,
        material_id: item.material_id,
        uom: item.uom,
        batch_no: item.batch_no,
        expiry_date: item.expiry_date,
        in_qty: item.received_qty || 0,
        out_qty: 0,
        unit_cost: item.rate || 0,
        amount: item.amount || 0,
        balance_qty: item.received_qty || 0,
        remarks: 'Material receipt',
        created_by: createdBy,
      });
    }

    await conn.commit();
    return { id: receiptId, receipt_no };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function update(id, data, items = [], updatedBy = null) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const totalAmount = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
    const grandTotal = totalAmount + (parseFloat(data.freight) || 0) + (parseFloat(data.loading_charges) || 0) + (parseFloat(data.other_charges) || 0);

    await conn.query(
      `UPDATE material_receipts SET
        receipt_date=?, receipt_type=?, supplier_id=?, purchase_order_no=?, po_date=?,
        challan_no=?, challan_date=?, lr_grn_no=?, lr_grn_date=?, transporter=?, gate_entry_no=?,
        warehouse_id=?, freight=?, loading_charges=?, other_charges=?, total_amount=?,
        grand_total=?, remarks=?, updated_by=? WHERE id=?`,
      [
        data.receipt_date, data.receipt_type || 'Direct Purchase', data.supplier_id || null,
        data.purchase_order_no || null, data.po_date || null, data.challan_no || null,
        data.challan_date || null, data.lr_grn_no || null, data.lr_grn_date || null,
        data.transporter || null, data.gate_entry_no || null, data.warehouse_id,
        data.freight || 0, data.loading_charges || 0, data.other_charges || 0,
        totalAmount, grandTotal, data.remarks || null, updatedBy, id,
      ]
    );

    // Reverse old stock
    const [oldItems] = await conn.query(
      'SELECT material_id, uom, received_qty FROM material_receipt_items WHERE receipt_id=?', [id]
    );
    for (const old of oldItems) {
      await updateStock(conn, data.warehouse_id, old.material_id, old.uom, -parseFloat(old.received_qty), 0);
    }
    await conn.query('DELETE FROM material_receipt_items WHERE receipt_id=?', [id]);
    await conn.query('DELETE FROM stock_ledger WHERE reference_type=? AND reference_id=?', ['material_receipt', id]);

    for (const item of items) {
      await conn.query(
        `INSERT INTO material_receipt_items (receipt_id, material_id, uom, order_qty, received_qty, rate, amount, batch_no, expiry_date)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        [id, item.material_id, item.uom || null, item.order_qty || 0,
         item.received_qty || 0, item.rate || 0, item.amount || 0,
         item.batch_no || null, item.expiry_date || null]
      );
      await updateStock(conn, data.warehouse_id, item.material_id, item.uom, item.received_qty || 0, item.rate || 0);
      await addLedgerEntry(conn, {
        transaction_date: data.receipt_date,
        transaction_type: 'Receipt',
        reference_type: 'material_receipt',
        reference_id: id,
        reference_no: data.receipt_no,
        warehouse_id: data.warehouse_id,
        material_id: item.material_id,
        uom: item.uom,
        batch_no: item.batch_no,
        expiry_date: item.expiry_date,
        in_qty: item.received_qty || 0,
        out_qty: 0,
        unit_cost: item.rate || 0,
        amount: item.amount || 0,
        balance_qty: item.received_qty || 0,
        remarks: 'Material receipt (updated)',
        created_by: updatedBy,
      });
    }

    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function remove(id) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [items] = await conn.query(
      'SELECT material_id, uom, received_qty, warehouse_id FROM material_receipt_items mri JOIN material_receipts mr ON mri.receipt_id = mr.id WHERE mri.receipt_id=?',
      [id]
    );
    for (const item of items) {
      await updateStock(conn, item.warehouse_id, item.material_id, item.uom, -parseFloat(item.received_qty), 0);
    }
    await conn.query('DELETE FROM stock_ledger WHERE reference_type=? AND reference_id=?', ['material_receipt', id]);
    await conn.query('DELETE FROM material_receipt_items WHERE receipt_id=?', [id]);
    const [result] = await conn.query('DELETE FROM material_receipts WHERE id=?', [id]);

    await conn.commit();
    return result.affectedRows > 0;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function getStats() {
  const [[data]] = await pool.query(
    `SELECT COUNT(*) AS total,
       SUM(status='Posted') AS posted,
       SUM(status='Draft') AS draft,
       SUM(grand_total) AS total_value
     FROM material_receipts`
  );
  return data;
}
