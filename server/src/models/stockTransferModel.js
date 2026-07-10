import pool from '../config/db.js';
import { updateStock, addLedgerEntry, allowsNegativeStock } from './stockLedgerModel.js';

export async function getAll({ search, status, page = 1, limit = 10, sortBy, sortOrder }) {
  let where = '1=1';
  const params = [];
  if (search) {
    where += ' AND (st.transfer_no LIKE ? OR fw.name LIKE ? OR tw.name LIKE ?)';
    const t = `%${search}%`;
    params.push(t, t, t);
  }
  if (status) { where += ' AND st.status = ?'; params.push(status); }

  const allowed = ['id', 'transfer_no', 'transfer_date', 'total_amount', 'status', 'created_at'];
  const col = allowed.includes(sortBy) ? `st.\`${sortBy}\`` : 'st.`id`';
  const ord = sortOrder === 'asc' ? 'ASC' : 'DESC';
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT st.id, st.transfer_no, st.transfer_date, st.from_warehouse_id, st.to_warehouse_id,
       st.reference_no, st.reference_date, st.transporter, st.delivery_challan_no,
       st.total_qty, st.total_amount, st.status, st.created_at,
       fw.name AS from_warehouse_name, fw.code AS from_warehouse_code,
       tw.name AS to_warehouse_name, tw.code AS to_warehouse_code
     FROM stock_transfers st
     LEFT JOIN warehouses fw ON st.from_warehouse_id = fw.id
     LEFT JOIN warehouses tw ON st.to_warehouse_id = tw.id
     WHERE ${where} ORDER BY ${col} ${ord} LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM stock_transfers st WHERE ${where}`, params
  );
  return { rows, total };
}

export async function getById(id) {
  const [[transfer]] = await pool.query(
    `SELECT st.*, fw.name AS from_warehouse_name, fw.code AS from_warehouse_code,
       tw.name AS to_warehouse_name, tw.code AS to_warehouse_code
     FROM stock_transfers st
     LEFT JOIN warehouses fw ON st.from_warehouse_id = fw.id
     LEFT JOIN warehouses tw ON st.to_warehouse_id = tw.id
     WHERE st.id = ?`, [id]
  );
  if (!transfer) return null;
  const [items] = await pool.query(
    `SELECT sti.*, m.name AS material_name, m.code AS material_code
     FROM stock_transfer_items sti
     LEFT JOIN materials m ON sti.material_id = m.id
     WHERE sti.transfer_id = ? ORDER BY sti.id ASC`, [id]
  );
  return { ...transfer, items };
}

export async function getNextNo() {
  const year = new Date().getFullYear();
  const [[row]] = await pool.query(
    `SELECT transfer_no FROM stock_transfers WHERE transfer_no LIKE ? ORDER BY id DESC LIMIT 1`,
    [`STN-${year}-%`]
  );
  if (!row) return `STN-${year}-00001`;
  const num = parseInt(row.transfer_no.split('-')[2], 10) + 1;
  return `STN-${year}-${String(num).padStart(5, '0')}`;
}

export async function create(data, items = [], createdBy = null) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const transfer_no = data.transfer_no || await getNextNo();
    const totalQty = items.reduce((s, i) => s + (parseFloat(i.transfer_qty) || 0), 0);
    const totalAmount = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);

    // Validate stock availability
    const canNegative = await allowsNegativeStock(data.from_warehouse_id);
    for (const item of items) {
      const [[stock]] = await conn.query(
        'SELECT current_qty FROM warehouse_stock WHERE warehouse_id=? AND material_id=? FOR UPDATE',
        [data.from_warehouse_id, item.material_id]
      );
      const available = stock ? parseFloat(stock.current_qty) : 0;
      if (!canNegative && available < (parseFloat(item.transfer_qty) || 0)) {
        throw new Error(`Insufficient stock for material. Available: ${available}, Transfer: ${item.transfer_qty}`);
      }
    }

    const [result] = await conn.query(
      `INSERT INTO stock_transfers (
        transfer_no, transfer_date, from_warehouse_id, to_warehouse_id, reference_no,
        reference_date, transporter, delivery_challan_no, total_qty, total_amount,
        remarks, status, created_by
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        transfer_no, data.transfer_date, data.from_warehouse_id, data.to_warehouse_id,
        data.reference_no || null, data.reference_date || null, data.transporter || null,
        data.delivery_challan_no || null, totalQty, totalAmount, data.remarks || null,
        data.status || 'Posted', createdBy,
      ]
    );
    const transferId = result.insertId;

    for (const item of items) {
      await conn.query(
        `INSERT INTO stock_transfer_items (transfer_id, material_id, uom, available_qty, transfer_qty, unit_cost, amount, batch_no, remarks)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        [transferId, item.material_id, item.uom || null, item.available_qty || 0,
         item.transfer_qty || 0, item.unit_cost || 0, item.amount || 0,
         item.batch_no || null, item.remarks || null]
      );

      // Deduct from source
      await updateStock(conn, data.from_warehouse_id, item.material_id, item.uom, -(parseFloat(item.transfer_qty) || 0), 0);
      await addLedgerEntry(conn, {
        transaction_date: data.transfer_date,
        transaction_type: 'Transfer Out',
        reference_type: 'stock_transfer',
        reference_id: transferId,
        reference_no: transfer_no,
        warehouse_id: data.from_warehouse_id,
        material_id: item.material_id,
        uom: item.uom,
        batch_no: item.batch_no,
        in_qty: 0,
        out_qty: item.transfer_qty || 0,
        unit_cost: item.unit_cost || 0,
        amount: item.amount || 0,
        balance_qty: -(item.transfer_qty || 0),
        remarks: `Transfer to ${data.to_warehouse_name || ''}`,
        created_by: createdBy,
      });

      // Add to destination
      await updateStock(conn, data.to_warehouse_id, item.material_id, item.uom, item.transfer_qty || 0, item.unit_cost || 0);
      await addLedgerEntry(conn, {
        transaction_date: data.transfer_date,
        transaction_type: 'Transfer In',
        reference_type: 'stock_transfer',
        reference_id: transferId,
        reference_no: transfer_no,
        warehouse_id: data.to_warehouse_id,
        material_id: item.material_id,
        uom: item.uom,
        batch_no: item.batch_no,
        in_qty: item.transfer_qty || 0,
        out_qty: 0,
        unit_cost: item.unit_cost || 0,
        amount: item.amount || 0,
        balance_qty: item.transfer_qty || 0,
        remarks: `Transfer from ${data.from_warehouse_name || ''}`,
        created_by: createdBy,
      });
    }

    await conn.commit();
    return { id: transferId, transfer_no };
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

    // Reverse old movements
    const [oldItems] = await conn.query(
      'SELECT material_id, uom, transfer_qty FROM stock_transfer_items WHERE transfer_id=?', [id]
    );
    for (const old of oldItems) {
      await updateStock(conn, data.from_warehouse_id, old.material_id, old.uom, parseFloat(old.transfer_qty), 0);
      await updateStock(conn, data.to_warehouse_id, old.material_id, old.uom, -parseFloat(old.transfer_qty), 0);
    }
    await conn.query('DELETE FROM stock_transfer_items WHERE transfer_id=?', [id]);
    await conn.query('DELETE FROM stock_ledger WHERE reference_type=? AND reference_id=?', ['stock_transfer', id]);

    const totalQty = items.reduce((s, i) => s + (parseFloat(i.transfer_qty) || 0), 0);
    const totalAmount = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);

    await conn.query(
      `UPDATE stock_transfers SET
        transfer_date=?, from_warehouse_id=?, to_warehouse_id=?, reference_no=?, reference_date=?,
        transporter=?, delivery_challan_no=?, total_qty=?, total_amount=?, remarks=?, updated_by=?
       WHERE id=?`,
      [
        data.transfer_date, data.from_warehouse_id, data.to_warehouse_id,
        data.reference_no || null, data.reference_date || null, data.transporter || null,
        data.delivery_challan_no || null, totalQty, totalAmount, data.remarks || null, updatedBy, id,
      ]
    );

    for (const item of items) {
      await conn.query(
        `INSERT INTO stock_transfer_items (transfer_id, material_id, uom, available_qty, transfer_qty, unit_cost, amount, batch_no, remarks)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        [id, item.material_id, item.uom || null, item.available_qty || 0,
         item.transfer_qty || 0, item.unit_cost || 0, item.amount || 0,
         item.batch_no || null, item.remarks || null]
      );
      await updateStock(conn, data.from_warehouse_id, item.material_id, item.uom, -(parseFloat(item.transfer_qty) || 0), 0);
      await updateStock(conn, data.to_warehouse_id, item.material_id, item.uom, item.transfer_qty || 0, item.unit_cost || 0);
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
      'SELECT material_id, uom, transfer_qty, from_warehouse_id, to_warehouse_id FROM stock_transfer_items sti JOIN stock_transfers st ON sti.transfer_id = st.id WHERE sti.transfer_id=?',
      [id]
    );
    for (const item of items) {
      await updateStock(conn, item.from_warehouse_id, item.material_id, item.uom, parseFloat(item.transfer_qty), 0);
      await updateStock(conn, item.to_warehouse_id, item.material_id, item.uom, -parseFloat(item.transfer_qty), 0);
    }
    await conn.query('DELETE FROM stock_ledger WHERE reference_type=? AND reference_id=?', ['stock_transfer', id]);
    await conn.query('DELETE FROM stock_transfer_items WHERE transfer_id=?', [id]);
    const [result] = await conn.query('DELETE FROM stock_transfers WHERE id=?', [id]);

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
     FROM stock_transfers`
  );
  return data;
}
