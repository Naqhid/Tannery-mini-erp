import pool from '../config/db.js';
import { updateStock, addLedgerEntry, allowsNegativeStock, rebuildAndReprice } from './stockLedgerModel.js';

const asNumber = (value) => Number(value) || 0;
const itemQty = (item) => asNumber(item.outbound_qty);

export async function getAll({ search, status, page = 1, limit = 10, sortBy, sortOrder } = {}) {
  let where = '1=1';
  const params = [];
  if (search) {
    where += ' AND (od.outbound_no LIKE ? OR s.name LIKE ? OR w.name LIKE ?)';
    const pattern = `%${search}%`;
    params.push(pattern, pattern, pattern);
  }
  if (status) { where += ' AND od.status = ?'; params.push(status); }
  const allowedSort = ['id', 'outbound_no', 'outbound_date', 'total_amount', 'status', 'created_at'];
  const column = allowedSort.includes(sortBy) ? `od.\`${sortBy}\`` : 'od.`id`';
  const order = sortOrder === 'asc' ? 'ASC' : 'DESC';
  const offset = (Number(page) - 1) * Number(limit);
  const [rows] = await pool.query(
    `SELECT od.*, w.name AS from_warehouse_name, w.code AS from_warehouse_code,
       s.name AS supplier_name, s.code AS supplier_code
     FROM outbound_deliveries od
     LEFT JOIN warehouses w ON w.id = od.from_warehouse_id
     LEFT JOIN suppliers s ON s.id = od.supplier_id
     WHERE ${where} ORDER BY ${column} ${order} LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM outbound_deliveries od
     LEFT JOIN suppliers s ON s.id = od.supplier_id
     LEFT JOIN warehouses w ON w.id = od.from_warehouse_id
     WHERE ${where}`,
    params
  );
  return { rows, total };
}

export async function getById(id) {
  const [[delivery]] = await pool.query(
    `SELECT od.*, w.name AS from_warehouse_name, w.code AS from_warehouse_code,
       s.name AS supplier_name, s.code AS supplier_code
     FROM outbound_deliveries od
     LEFT JOIN warehouses w ON w.id = od.from_warehouse_id
     LEFT JOIN suppliers s ON s.id = od.supplier_id
     WHERE od.id = ?`, [id]
  );
  if (!delivery) return null;
  const [items] = await pool.query(
    `SELECT odi.*, m.name AS material_name, m.code AS material_code
     FROM outbound_delivery_items odi
     LEFT JOIN materials m ON m.id = odi.material_id
     WHERE odi.outbound_delivery_id = ? ORDER BY odi.id ASC`, [id]
  );
  return { ...delivery, items };
}

export async function getNextNo() {
  const year = new Date().getFullYear();
  const [[row]] = await pool.query(
    'SELECT outbound_no FROM outbound_deliveries WHERE outbound_no LIKE ? ORDER BY id DESC LIMIT 1',
    [`OBD-${year}-%`]
  );
  if (!row) return `OBD-${year}-00001`;
  const next = (parseInt(row.outbound_no.split('-')[2], 10) || 0) + 1;
  return `OBD-${year}-${String(next).padStart(5, '0')}`;
}

export async function getNextChallanNo() {
  const year = new Date().getFullYear();
  const [[row]] = await pool.query(
    'SELECT delivery_challan_no FROM outbound_deliveries WHERE delivery_challan_no LIKE ? ORDER BY id DESC LIMIT 1',
    [`DCN-${year}-%`]
  );
  if (!row) return `DCN-${year}-00001`;
  const next = (parseInt(row.delivery_challan_no.split('-')[2], 10) || 0) + 1;
  return `DCN-${year}-${String(next).padStart(5, '0')}`;
}

async function insertOutboundItems(conn, id, data, items, userId) {
  const allowNegative = await allowsNegativeStock(data.from_warehouse_id);
  const totalQty = items.reduce((sum, item) => sum + itemQty(item), 0);
  const totalAmount = items.reduce((sum, item) => sum + asNumber(item.amount), 0);

  for (const item of items) {
    const qty = itemQty(item);
    if (qty <= 0) throw new Error('Outbound quantity must be greater than zero.');
    const [[stock]] = await conn.query(
      'SELECT current_qty FROM warehouse_stock WHERE warehouse_id = ? AND material_id = ? FOR UPDATE',
      [data.from_warehouse_id, item.material_id]
    );
    const available = asNumber(stock?.current_qty);
    if (!allowNegative && available + 0.001 < qty) {
      throw new Error(`Insufficient stock for ${item.material_name || 'material'}. Available: ${available}, outbound: ${qty}`);
    }
    await conn.query(
      `INSERT INTO outbound_delivery_items
       (outbound_delivery_id, material_id, uom, available_qty, outbound_qty, unit_cost, amount, batch_no, remarks)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [id, item.material_id, item.uom || null, asNumber(item.available_qty), qty,
        asNumber(item.unit_cost), asNumber(item.amount), item.batch_no || null, item.remarks || null]
    );
    await updateStock(conn, data.from_warehouse_id, item.material_id, item.uom, -qty, 0);
    await addLedgerEntry(conn, {
      transaction_date: data.outbound_date,
      transaction_type: 'Outbound Delivery',
      reference_type: 'outbound_delivery',
      reference_id: id,
      reference_no: data.outbound_no,
      warehouse_id: data.from_warehouse_id,
      material_id: item.material_id,
      uom: item.uom,
      batch_no: item.batch_no,
      in_qty: 0,
      out_qty: qty,
      unit_cost: asNumber(item.unit_cost),
      amount: asNumber(item.amount),
      balance_qty: -qty,
      remarks: `Outbound delivery to ${data.supplier_name || 'supplier'}`,
      created_by: userId,
    });
  }

  await conn.query(
    'UPDATE outbound_deliveries SET total_qty = ?, total_amount = ? WHERE id = ?',
    [totalQty, totalAmount, id]
  );
  for (const item of items) await rebuildAndReprice(conn, data.from_warehouse_id, item.material_id);
}

export async function create(data, items = [], createdBy = null) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const outboundNo = data.outbound_no || await getNextNo();
    const [[supplier]] = await conn.query('SELECT name FROM suppliers WHERE id = ?', [data.supplier_id]);
    const outboundData = { ...data, outbound_no: outboundNo, supplier_name: supplier?.name || '' };
    const [result] = await conn.query(
      `INSERT INTO outbound_deliveries
       (outbound_no, outbound_date, from_warehouse_id, supplier_id, reference_no, reference_date,
        transporter, delivery_challan_no, remarks, status, created_by)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [outboundNo, data.outbound_date, data.from_warehouse_id, data.supplier_id,
        data.reference_no || null, data.reference_date || null, data.transporter || null,
        data.delivery_challan_no || null, data.remarks || null, 'Posted', createdBy]
    );
    await insertOutboundItems(conn, result.insertId, outboundData, items, createdBy);
    await conn.commit();
    return { id: result.insertId, outbound_no: outboundNo };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export async function update(id, data, items = [], updatedBy = null) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[previous]] = await conn.query('SELECT from_warehouse_id, outbound_no FROM outbound_deliveries WHERE id = ? FOR UPDATE', [id]);
    if (!previous) { await conn.rollback(); return false; }
    const [oldItems] = await conn.query(
      'SELECT material_id, uom, outbound_qty FROM outbound_delivery_items WHERE outbound_delivery_id = ?', [id]
    );
    for (const item of oldItems) {
      await updateStock(conn, previous.from_warehouse_id, item.material_id, item.uom, asNumber(item.outbound_qty), 0);
    }
    await conn.query('DELETE FROM stock_ledger WHERE reference_type = ? AND reference_id = ?', ['outbound_delivery', id]);
    await conn.query('DELETE FROM outbound_delivery_items WHERE outbound_delivery_id = ?', [id]);
    const [[supplier]] = await conn.query('SELECT name FROM suppliers WHERE id = ?', [data.supplier_id]);
    const outboundData = { ...data, outbound_no: previous.outbound_no, supplier_name: supplier?.name || '' };
    await conn.query(
      `UPDATE outbound_deliveries SET outbound_date = ?, from_warehouse_id = ?, supplier_id = ?,
        reference_no = ?, reference_date = ?, transporter = ?, delivery_challan_no = ?, remarks = ?, updated_by = ?
       WHERE id = ?`,
      [data.outbound_date, data.from_warehouse_id, data.supplier_id,
        data.reference_no || null, data.reference_date || null, data.transporter || null,
        data.delivery_challan_no || null, data.remarks || null, updatedBy, id]
    );
    await insertOutboundItems(conn, id, outboundData, items, updatedBy);
    const pairs = new Map();
    for (const item of oldItems) pairs.set(`${previous.from_warehouse_id}:${item.material_id}`, { warehouseId: previous.from_warehouse_id, materialId: item.material_id });
    for (const item of items) pairs.set(`${data.from_warehouse_id}:${item.material_id}`, { warehouseId: data.from_warehouse_id, materialId: item.material_id });
    for (const pair of pairs.values()) await rebuildAndReprice(conn, pair.warehouseId, pair.materialId);
    await conn.commit();
    return true;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export async function remove(id) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[delivery]] = await conn.query('SELECT from_warehouse_id FROM outbound_deliveries WHERE id = ? FOR UPDATE', [id]);
    if (!delivery) { await conn.rollback(); return false; }
    const [items] = await conn.query(
      'SELECT material_id, uom, outbound_qty FROM outbound_delivery_items WHERE outbound_delivery_id = ?', [id]
    );
    for (const item of items) {
      await updateStock(conn, delivery.from_warehouse_id, item.material_id, item.uom, asNumber(item.outbound_qty), 0);
    }
    await conn.query('DELETE FROM stock_ledger WHERE reference_type = ? AND reference_id = ?', ['outbound_delivery', id]);
    await conn.query('DELETE FROM outbound_delivery_items WHERE outbound_delivery_id = ?', [id]);
    const [result] = await conn.query('DELETE FROM outbound_deliveries WHERE id = ?', [id]);
    for (const item of items) await rebuildAndReprice(conn, delivery.from_warehouse_id, item.material_id);
    await conn.commit();
    return result.affectedRows > 0;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export async function getStats() {
  const [[stats]] = await pool.query(
    `SELECT COUNT(*) AS total, SUM(status = 'Posted') AS posted,
       SUM(status = 'Draft') AS draft, COALESCE(SUM(total_amount), 0) AS total_value
     FROM outbound_deliveries`
  );
  return stats;
}
