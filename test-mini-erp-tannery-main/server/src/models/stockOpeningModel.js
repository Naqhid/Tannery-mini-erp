import pool from '../config/db.js';
import { updateStock, addLedgerEntry } from './stockLedgerModel.js';

export async function getAll({ search, status, warehouse_id, page = 1, limit = 10, sortBy, sortOrder }) {
  let where = '1=1';
  const params = [];
  if (search) {
    where += ' AND (soe.entry_no LIKE ? OR w.name LIKE ?)';
    const t = `%${search}%`;
    params.push(t, t);
  }
  if (status) { where += ' AND soe.status = ?'; params.push(status); }
  if (warehouse_id) { where += ' AND soe.warehouse_id = ?'; params.push(warehouse_id); }

  const allowed = ['id', 'entry_no', 'entry_date', 'total_amount', 'status', 'created_at'];
  const col = allowed.includes(sortBy) ? `soe.\`${sortBy}\`` : 'soe.`id`';
  const ord = sortOrder === 'asc' ? 'ASC' : 'DESC';
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT soe.id, soe.entry_no, soe.entry_date, soe.opening_date, soe.financial_year,
       soe.warehouse_id, soe.reference_no, soe.costing_method, soe.remarks,
       soe.total_amount, soe.status, soe.created_at,
       w.name AS warehouse_name, w.code AS warehouse_code
     FROM stock_opening_entries soe
     LEFT JOIN warehouses w ON soe.warehouse_id = w.id
     WHERE ${where} ORDER BY ${col} ${ord} LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM stock_opening_entries soe WHERE ${where}`, params
  );
  return { rows, total };
}

export async function getById(id) {
  const [[entry]] = await pool.query(
    `SELECT soe.*, w.name AS warehouse_name, w.code AS warehouse_code
     FROM stock_opening_entries soe
     LEFT JOIN warehouses w ON soe.warehouse_id = w.id
     WHERE soe.id = ?`, [id]
  );
  if (!entry) return null;
  const [items] = await pool.query(
    `SELECT soi.*, m.name AS material_name, m.code AS material_code
     FROM stock_opening_items soi
     LEFT JOIN materials m ON soi.material_id = m.id
     WHERE soi.entry_id = ? ORDER BY soi.id ASC`, [id]
  );
  return { ...entry, items };
}

export async function getNextNo() {
  const year = new Date().getFullYear();
  const [[row]] = await pool.query(
    `SELECT entry_no FROM stock_opening_entries WHERE entry_no LIKE ? ORDER BY id DESC LIMIT 1`,
    [`OPN-${year}-%`]
  );
  if (!row) return `OPN-${year}-00001`;
  const num = parseInt(row.entry_no.split('-')[2], 10) + 1;
  return `OPN-${year}-${String(num).padStart(5, '0')}`;
}

export async function create(data, items = [], createdBy = null) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const entry_no = data.entry_no || await getNextNo();
    const totalAmount = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);

    const [result] = await conn.query(
      `INSERT INTO stock_opening_entries (
        entry_no, entry_date, opening_date, financial_year, warehouse_id,
        reference_no, costing_method, remarks, total_amount, status, created_by
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [
        entry_no, data.entry_date || new Date().toISOString().split('T')[0],
        data.opening_date || data.entry_date || new Date().toISOString().split('T')[0],
        data.financial_year || null, data.warehouse_id,
        data.reference_no || null, data.costing_method || 'FIFO',
        data.remarks || null, totalAmount, data.status || 'Posted', createdBy,
      ]
    );
    const entryId = result.insertId;

    for (const item of items) {
      await conn.query(
        `INSERT INTO stock_opening_items (entry_id, material_id, uom, quantity, unit_cost, amount, batch_no, expiry_date)
         VALUES (?,?,?,?,?,?,?,?)`,
        [entryId, item.material_id, item.uom || null, item.quantity || 0,
         item.unit_cost || 0, item.amount || 0, item.batch_no || null, item.expiry_date || null]
      );

      await updateStock(conn, data.warehouse_id, item.material_id, item.uom, item.quantity || 0, item.unit_cost || 0);

      await addLedgerEntry(conn, {
        transaction_date: data.opening_date || data.entry_date,
        transaction_type: 'Opening',
        reference_type: 'stock_opening',
        reference_id: entryId,
        reference_no: entry_no,
        warehouse_id: data.warehouse_id,
        material_id: item.material_id,
        uom: item.uom,
        batch_no: item.batch_no,
        expiry_date: item.expiry_date,
        in_qty: item.quantity || 0,
        out_qty: 0,
        unit_cost: item.unit_cost || 0,
        amount: item.amount || 0,
        balance_qty: item.quantity || 0,
        remarks: 'Opening stock entry',
        created_by: createdBy,
      });
    }

    await conn.commit();
    return { id: entryId, entry_no };
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

    await conn.query(
      `UPDATE stock_opening_entries SET
        entry_date=?, opening_date=?, financial_year=?, warehouse_id=?, reference_no=?,
        costing_method=?, remarks=?, total_amount=?, updated_by=?
       WHERE id=?`,
      [
        data.entry_date, data.opening_date, data.financial_year || null, data.warehouse_id,
        data.reference_no || null, data.costing_method || 'FIFO', data.remarks || null,
        totalAmount, updatedBy, id,
      ]
    );

    // Reverse old stock movements
    const [oldItems] = await conn.query(
      'SELECT material_id, uom, quantity FROM stock_opening_items WHERE entry_id=?', [id]
    );
    for (const old of oldItems) {
      await updateStock(conn, data.warehouse_id, old.material_id, old.uom, -parseFloat(old.quantity), 0);
    }
    await conn.query('DELETE FROM stock_opening_items WHERE entry_id=?', [id]);
    await conn.query('DELETE FROM stock_ledger WHERE reference_type=? AND reference_id=?', ['stock_opening', id]);

    // Insert new items + stock
    for (const item of items) {
      await conn.query(
        `INSERT INTO stock_opening_items (entry_id, material_id, uom, quantity, unit_cost, amount, batch_no, expiry_date)
         VALUES (?,?,?,?,?,?,?,?)`,
        [id, item.material_id, item.uom || null, item.quantity || 0,
         item.unit_cost || 0, item.amount || 0, item.batch_no || null, item.expiry_date || null]
      );
      await updateStock(conn, data.warehouse_id, item.material_id, item.uom, item.quantity || 0, item.unit_cost || 0);
      await addLedgerEntry(conn, {
        transaction_date: data.opening_date,
        transaction_type: 'Opening',
        reference_type: 'stock_opening',
        reference_id: id,
        reference_no: data.entry_no,
        warehouse_id: data.warehouse_id,
        material_id: item.material_id,
        uom: item.uom,
        batch_no: item.batch_no,
        expiry_date: item.expiry_date,
        in_qty: item.quantity || 0,
        out_qty: 0,
        unit_cost: item.unit_cost || 0,
        amount: item.amount || 0,
        balance_qty: item.quantity || 0,
        remarks: 'Opening stock entry (updated)',
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
      'SELECT material_id, uom, quantity, warehouse_id FROM stock_opening_items soi JOIN stock_opening_entries soe ON soi.entry_id = soe.id WHERE soi.entry_id=?',
      [id]
    );
    for (const item of items) {
      await updateStock(conn, item.warehouse_id, item.material_id, item.uom, -parseFloat(item.quantity), 0);
    }
    await conn.query('DELETE FROM stock_ledger WHERE reference_type=? AND reference_id=?', ['stock_opening', id]);
    await conn.query('DELETE FROM stock_opening_items WHERE entry_id=?', [id]);
    const [result] = await conn.query('DELETE FROM stock_opening_entries WHERE id=?', [id]);

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
       SUM(total_amount) AS total_value
     FROM stock_opening_entries`
  );
  return data;
}
