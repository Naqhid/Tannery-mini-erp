import pool from '../config/db.js';
import { updateStock, addLedgerEntry, allowsNegativeStock } from './stockLedgerModel.js';

export async function getAll({ search, status, warehouse_id, page = 1, limit = 10, sortBy, sortOrder }) {
  let where = '1=1';
  const params = [];
  if (search) {
    where += ' AND (mi.issue_no LIKE ? OR mi.production_batch LIKE ? OR mi.job_order_no LIKE ? OR w.name LIKE ?)';
    const t = `%${search}%`;
    params.push(t, t, t, t);
  }
  if (status) { where += ' AND mi.status = ?'; params.push(status); }
  if (warehouse_id) { where += ' AND mi.warehouse_id = ?'; params.push(warehouse_id); }

  const allowed = ['id', 'issue_no', 'issue_date', 'grand_total', 'status', 'created_at'];
  const col = allowed.includes(sortBy) ? `mi.\`${sortBy}\`` : 'mi.`id`';
  const ord = sortOrder === 'asc' ? 'ASC' : 'DESC';
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT mi.id, mi.issue_no, mi.issue_date, mi.department, mi.job_order_no,
       mi.production_batch, mi.batch_qty, mi.batch_uom, mi.warehouse_id,
       mi.costing_method, mi.issued_by, mi.total_material_cost, mi.grand_total,
       mi.status, mi.created_at,
       w.name AS warehouse_name, w.code AS warehouse_code
     FROM material_issues mi
     LEFT JOIN warehouses w ON mi.warehouse_id = w.id
     WHERE ${where} ORDER BY ${col} ${ord} LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM material_issues mi
     LEFT JOIN warehouses w ON mi.warehouse_id = w.id
     WHERE ${where}`, params
  );
  return { rows, total };
}

export async function getById(id) {
  const [[issue]] = await pool.query(
    `SELECT mi.*, w.name AS warehouse_name, w.code AS warehouse_code
     FROM material_issues mi
     LEFT JOIN warehouses w ON mi.warehouse_id = w.id
     WHERE mi.id = ?`, [id]
  );
  if (!issue) return null;
  const [items] = await pool.query(
    `SELECT mii.*, m.name AS material_name, m.code AS material_code
     FROM material_issue_items mii
     LEFT JOIN materials m ON mii.material_id = m.id
     WHERE mii.issue_id = ? ORDER BY mii.id ASC`, [id]
  );
  return { ...issue, items };
}

export async function getNextNo() {
  const year = new Date().getFullYear();
  const [[row]] = await pool.query(
    `SELECT issue_no FROM material_issues WHERE issue_no LIKE ? ORDER BY id DESC LIMIT 1`,
    [`ISS-${year}-%`]
  );
  if (!row) return `ISS-${year}-00001`;
  const num = parseInt(row.issue_no.split('-')[2], 10) + 1;
  return `ISS-${year}-${String(num).padStart(5, '0')}`;
}

export async function create(data, items = [], createdBy = null) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const issue_no = data.issue_no || await getNextNo();
    const totalCost = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
    const grandTotal = totalCost + (parseFloat(data.loading_unloading) || 0) + (parseFloat(data.other_charges) || 0);

    // Validate stock availability
    const canNegative = await allowsNegativeStock(data.warehouse_id);
    for (const item of items) {
      const [[stock]] = await conn.query(
        'SELECT current_qty FROM warehouse_stock WHERE warehouse_id=? AND material_id=? FOR UPDATE',
        [data.warehouse_id, item.material_id]
      );
      const available = stock ? parseFloat(stock.current_qty) : 0;
      if (!canNegative && available < (parseFloat(item.issue_qty) || 0)) {
        throw new Error(`Insufficient stock for material. Available: ${available}, Issue: ${item.issue_qty}`);
      }
    }

    const [result] = await conn.query(
      `INSERT INTO material_issues (
        issue_no, issue_date, department, job_order_no, production_batch, batch_qty,
        batch_uom, batch_description, costing_method, warehouse_id, required_date,
        issued_by, loading_unloading, other_charges, total_material_cost, grand_total,
        remarks, status, created_by
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        issue_no, data.issue_date, data.department || null, data.job_order_no || null,
        data.production_batch || null, data.batch_qty || 0, data.batch_uom || null,
        data.batch_description || null, data.costing_method || 'FIFO', data.warehouse_id,
        data.required_date || null, data.issued_by || null, data.loading_unloading || 0,
        data.other_charges || 0, totalCost, grandTotal, data.remarks || null,
        data.status || 'Posted', createdBy,
      ]
    );
    const issueId = result.insertId;

    for (const item of items) {
      await conn.query(
        `INSERT INTO material_issue_items (issue_id, material_id, uom, required_qty, issue_qty, unit_cost, amount, remarks)
         VALUES (?,?,?,?,?,?,?,?)`,
        [issueId, item.material_id, item.uom || null, item.required_qty || 0,
         item.issue_qty || 0, item.unit_cost || 0, item.amount || 0, item.remarks || null]
      );

      await updateStock(conn, data.warehouse_id, item.material_id, item.uom, -(parseFloat(item.issue_qty) || 0), 0);

      await addLedgerEntry(conn, {
        transaction_date: data.issue_date,
        transaction_type: 'Issue',
        reference_type: 'material_issue',
        reference_id: issueId,
        reference_no: issue_no,
        warehouse_id: data.warehouse_id,
        material_id: item.material_id,
        uom: item.uom,
        in_qty: 0,
        out_qty: item.issue_qty || 0,
        unit_cost: item.unit_cost || 0,
        amount: item.amount || 0,
        balance_qty: -(item.issue_qty || 0),
        remarks: `Issue to batch ${data.production_batch || ''}`,
        created_by: createdBy,
      });
    }

    await conn.commit();
    return { id: issueId, issue_no };
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

    // Reverse old stock
    const [oldItems] = await conn.query(
      'SELECT material_id, uom, issue_qty FROM material_issue_items WHERE issue_id=?', [id]
    );
    for (const old of oldItems) {
      await updateStock(conn, data.warehouse_id, old.material_id, old.uom, parseFloat(old.issue_qty), 0);
    }
    await conn.query('DELETE FROM material_issue_items WHERE issue_id=?', [id]);
    await conn.query('DELETE FROM stock_ledger WHERE reference_type=? AND reference_id=?', ['material_issue', id]);

    const totalCost = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
    const grandTotal = totalCost + (parseFloat(data.loading_unloading) || 0) + (parseFloat(data.other_charges) || 0);

    await conn.query(
      `UPDATE material_issues SET
        issue_date=?, department=?, job_order_no=?, production_batch=?, batch_qty=?,
        batch_uom=?, batch_description=?, costing_method=?, warehouse_id=?, required_date=?,
        issued_by=?, loading_unloading=?, other_charges=?, total_material_cost=?,
        grand_total=?, remarks=?, updated_by=? WHERE id=?`,
      [
        data.issue_date, data.department || null, data.job_order_no || null,
        data.production_batch || null, data.batch_qty || 0, data.batch_uom || null,
        data.batch_description || null, data.costing_method || 'FIFO', data.warehouse_id,
        data.required_date || null, data.issued_by || null, data.loading_unloading || 0,
        data.other_charges || 0, totalCost, grandTotal, data.remarks || null, updatedBy, id,
      ]
    );

    for (const item of items) {
      await conn.query(
        `INSERT INTO material_issue_items (issue_id, material_id, uom, required_qty, issue_qty, unit_cost, amount, remarks)
         VALUES (?,?,?,?,?,?,?,?)`,
        [id, item.material_id, item.uom || null, item.required_qty || 0,
         item.issue_qty || 0, item.unit_cost || 0, item.amount || 0, item.remarks || null]
      );
      await updateStock(conn, data.warehouse_id, item.material_id, item.uom, -(parseFloat(item.issue_qty) || 0), 0);
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
      'SELECT material_id, uom, issue_qty, warehouse_id FROM material_issue_items mii JOIN material_issues mi ON mii.issue_id = mi.id WHERE mii.issue_id=?',
      [id]
    );
    for (const item of items) {
      await updateStock(conn, item.warehouse_id, item.material_id, item.uom, parseFloat(item.issue_qty), 0);
    }
    await conn.query('DELETE FROM stock_ledger WHERE reference_type=? AND reference_id=?', ['material_issue', id]);
    await conn.query('DELETE FROM material_issue_items WHERE issue_id=?', [id]);
    const [result] = await conn.query('DELETE FROM material_issues WHERE id=?', [id]);

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
     FROM material_issues`
  );
  return data;
}
