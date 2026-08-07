import pool from '../config/db.js';

const ALLOWED_SORT = ['id', 'batch_no', 'production_date', 'status', 'total_receipt_qty', 'total_output_qty', 'yield_percent', 'created_at'];

export async function getAll({ search, status, production_plan_id, customer_id, from_date, to_date, page = 1, limit = 10, sortBy, sortOrder } = {}) {
  const params = [];
  let where = 'b.deleted_at IS NULL';

  if (search) {
    where += ' AND (b.batch_no LIKE ? OR b.article_code LIKE ? OR b.article_name LIKE ? OR b.order_no LIKE ? OR c.name LIKE ?)';
    const t = `%${search}%`;
    params.push(t, t, t, t, t);
  }
  if (status) { where += ' AND b.status = ?'; params.push(status); }
  if (production_plan_id) { where += ' AND b.production_plan_id = ?'; params.push(production_plan_id); }
  if (customer_id) { where += ' AND b.customer_id = ?'; params.push(customer_id); }
  if (from_date) { where += ' AND b.production_date >= ?'; params.push(from_date); }
  if (to_date) { where += ' AND b.production_date <= ?'; params.push(to_date); }

  const col = ALLOWED_SORT.includes(sortBy) ? `b.\`${sortBy}\`` : 'b.`id`';
  const ord = sortOrder === 'asc' ? 'ASC' : 'DESC';
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT b.id, b.batch_no, b.production_plan_id, b.sales_order_id, b.customer_id,
       b.order_no, b.article_code, b.article_name, b.production_date, b.stage, b.current_stage,
       b.total_receipt_qty, b.total_output_qty, b.yield_percent, b.status, b.remarks,
       c.name AS customer_name,
       pp.plan_no AS production_plan_no,
       so.order_no AS sales_order_no
     FROM batches b
     LEFT JOIN customers c ON b.customer_id = c.id
     LEFT JOIN production_plans pp ON b.production_plan_id = pp.id
     LEFT JOIN sales_orders so ON b.sales_order_id = so.id
     WHERE ${where}
     ORDER BY ${col} ${ord}
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM batches b WHERE ${where}`, params
  );

  return { rows, total };
}

export async function getById(id) {
  const [[batch]] = await pool.query(
    `SELECT b.*,
       c.name AS customer_name, c.code AS customer_code,
       pp.plan_no AS production_plan_no,
       so.order_no AS sales_order_no
     FROM batches b
     LEFT JOIN customers c ON b.customer_id = c.id
     LEFT JOIN production_plans pp ON b.production_plan_id = pp.id
     LEFT JOIN sales_orders so ON b.sales_order_id = so.id
     WHERE b.id = ? AND b.deleted_at IS NULL`, [id]
  );
  if (!batch) return null;

  const [items] = await pool.query(
    `SELECT * FROM batch_line_items WHERE batch_id = ? ORDER BY seq ASC`, [id]
  );

  return { ...batch, items };
}

export async function getNextBatchNo() {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const [[row]] = await pool.query(
    `SELECT batch_no FROM batches WHERE batch_no LIKE ? ORDER BY id DESC LIMIT 1`,
    [`BTCH-${year}${month}-%`]
  );
  if (!row) return `BTCH-${year}${month}-00001`;
  const num = parseInt(row.batch_no.split('-')[2], 10) + 1;
  return `BTCH-${year}${month}-${String(num).padStart(5, '0')}`;
}

export async function getStats() {
  const [[row]] = await pool.query(
    `SELECT
       COUNT(*) AS total,
       SUM(status = 'Draft') AS draft,
       SUM(status = 'In-Process') AS in_process,
       SUM(status = 'Completed') AS completed,
       SUM(status = 'On-Hold') AS on_hold,
       SUM(status = 'Cancelled') AS cancelled
     FROM batches WHERE deleted_at IS NULL`
  );
  return row;
}

export async function create(data, items = [], createdBy = null) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const batch_no = data.batch_no || await getNextBatchNo();
    
    // Calculate yield percentage
    const totalReceiptQty = parseFloat(data.total_receipt_qty) || 0;
    const totalOutputQty = parseFloat(data.total_output_qty) || 0;
    const yieldPercent = totalReceiptQty > 0 ? parseFloat(((totalOutputQty / totalReceiptQty) * 100).toFixed(2)) : 0;

    const [result] = await conn.query(
      `INSERT INTO batches (
        batch_no, production_plan_id, sales_order_id, customer_id, order_no,
        article_code, article_name, production_date, stage, current_stage,
        total_receipt_qty, total_output_qty, yield_percent, status, remarks,
        created_by
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        batch_no,
        data.production_plan_id || null,
        data.sales_order_id || null,
        data.customer_id || null,
        data.order_no || null,
        data.article_code || null,
        data.article_name || null,
        data.production_date || null,
        data.stage || 'Tanning',
        data.current_stage || 'Tanning',
        parseFloat(data.total_receipt_qty) || 0,
        parseFloat(data.total_output_qty) || 0,
        yieldPercent,
        data.status || 'Draft',
        data.remarks || null,
        createdBy
      ]
    );
    const batchId = result.insertId;

    // Insert line items
    for (const item of items) {
      await conn.query(
        `INSERT INTO batch_line_items (
          batch_id, seq, customer_name, order_no, article_code, article_name,
          finish, color, receipt_qty, uom, output_qty, output_uom, status, remarks
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          batchId,
          item.seq || 1,
          item.customer_name || null,
          item.order_no || null,
          item.article_code || null,
          item.article_name || null,
          item.finish || null,
          item.color || null,
          parseFloat(item.receipt_qty) || 0,
          item.uom || 'SQ.FT.',
          parseFloat(item.output_qty) || 0,
          item.output_uom || 'SQ.FT.',
          item.status || 'Pending',
          item.remarks || null
        ]
      );
    }

    await conn.commit();
    return { id: batchId, batch_no };
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

    // Calculate yield percentage
    const totalReceiptQty = parseFloat(data.total_receipt_qty) || 0;
    const totalOutputQty = parseFloat(data.total_output_qty) || 0;
    const yieldPercent = totalReceiptQty > 0 ? parseFloat(((totalOutputQty / totalReceiptQty) * 100).toFixed(2)) : 0;

    await conn.query(
      `UPDATE batches SET
        batch_no=?, production_plan_id=?, sales_order_id=?, customer_id=?, order_no=?,
        article_code=?, article_name=?, production_date=?, stage=?, current_stage=?,
        total_receipt_qty=?, total_output_qty=?, yield_percent=?, status=?, remarks=?, updated_by=?
       WHERE id=? AND deleted_at IS NULL`,
      [
        data.batch_no,
        data.production_plan_id || null,
        data.sales_order_id || null,
        data.customer_id || null,
        data.order_no || null,
        data.article_code || null,
        data.article_name || null,
        data.production_date || null,
        data.stage || 'Tanning',
        data.current_stage || 'Tanning',
        parseFloat(data.total_receipt_qty) || 0,
        parseFloat(data.total_output_qty) || 0,
        yieldPercent,
        data.status || 'Draft',
        data.remarks || null,
        updatedBy,
        id
      ]
    );

    // Delete existing items and insert new ones
    await conn.query('DELETE FROM batch_line_items WHERE batch_id = ?', [id]);

    for (const item of items) {
      await conn.query(
        `INSERT INTO batch_line_items (
          batch_id, seq, customer_name, order_no, article_code, article_name,
          finish, color, receipt_qty, uom, output_qty, output_uom, status, remarks
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          id,
          item.seq || 1,
          item.customer_name || null,
          item.order_no || null,
          item.article_code || null,
          item.article_name || null,
          item.finish || null,
          item.color || null,
          parseFloat(item.receipt_qty) || 0,
          item.uom || 'SQ.FT.',
          parseFloat(item.output_qty) || 0,
          item.output_uom || 'SQ.FT.',
          item.status || 'Pending',
          item.remarks || null
        ]
      );
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

export async function softDelete(id) {
  const [result] = await pool.query(
    `UPDATE batches SET deleted_at = CURRENT_TIMESTAMP, status = 'Cancelled' WHERE id = ? AND deleted_at IS NULL`,
    [id]
  );
  return result.affectedRows > 0;
}

export async function bulkSoftDelete(ids) {
  if (!ids || ids.length === 0) return 0;
  const placeholders = ids.map(() => '?').join(', ');
  const [result] = await pool.query(
    `UPDATE batches SET deleted_at = CURRENT_TIMESTAMP, status = 'Cancelled' WHERE id IN (${placeholders}) AND deleted_at IS NULL`,
    ids
  );
  return result.affectedRows;
}

export async function bulkUpdateStatus(ids, status) {
  if (!ids || ids.length === 0) return 0;
  const placeholders = ids.map(() => '?').join(', ');
  const [result] = await pool.query(
    `UPDATE batches SET status = ? WHERE id IN (${placeholders}) AND deleted_at IS NULL`,
    [status, ...ids]
  );
  return result.affectedRows;
}

export async function getBatchByBarcode(barcode) {
  const [rows] = await pool.query(
    `SELECT b.* FROM batches b WHERE b.batch_no = ? AND b.deleted_at IS NULL LIMIT 1`,
    [barcode]
  );
  return rows[0] || null;
}

export async function searchBatchForTracking({ barcode, batch_no, production_date, stage }) {
  const params = [];
  let where = 'b.deleted_at IS NULL';

  const searchTerm = barcode || batch_no;
  if (searchTerm) {
    where += ' AND (b.batch_no LIKE ? OR b.batch_no = ?)';
    params.push(`%${searchTerm}%`, searchTerm);
  }
  if (production_date) {
    where += ' AND b.production_date = ?';
    params.push(production_date);
  }
  if (stage) {
    where += ' AND (b.stage = ? OR b.current_stage = ?)';
    params.push(stage, stage);
  }

  const [[batch]] = await pool.query(
    `SELECT b.*,
       c.name AS customer_name, c.code AS customer_code,
       pp.plan_no AS production_plan_no,
       so.order_no AS sales_order_no
     FROM batches b
     LEFT JOIN customers c ON b.customer_id = c.id
     LEFT JOIN production_plans pp ON b.production_plan_id = pp.id
     LEFT JOIN sales_orders so ON b.sales_order_id = so.id
     WHERE ${where}
     ORDER BY b.id DESC
     LIMIT 1`,
    params
  );

  if (!batch) return null;

  const [items] = await pool.query(
    `SELECT * FROM batch_line_items WHERE batch_id = ? ORDER BY seq ASC`, [batch.id]
  );

  // Recalculate totals from line items if items exist
  if (items.length > 0) {
    const totalReceipt = items.reduce((sum, i) => sum + parseFloat(i.receipt_qty || 0), 0);
    const totalOutput = items.reduce((sum, i) => sum + parseFloat(i.output_qty || 0), 0);
    const yieldPct = totalReceipt > 0 ? (totalOutput / totalReceipt) * 100 : 0;
    batch.total_receipt_qty = totalReceipt;
    batch.total_output_qty = totalOutput;
    batch.yield_percent = parseFloat(yieldPct.toFixed(2));
  }

  return { ...batch, items };
}

export async function getBatchSummary(batchId) {
  const [[summary]] = await pool.query(
    `SELECT
       b.batch_no,
       b.current_stage,
       b.production_date,
       b.total_receipt_qty,
       b.total_output_qty,
       b.yield_percent,
       COUNT(bli.id) AS total_line_items
     FROM batches b
     LEFT JOIN batch_line_items bli ON b.id = bli.batch_id
     WHERE b.id = ? AND b.deleted_at IS NULL
     GROUP BY b.id`,
    [batchId]
  );
  return summary || null;
}
