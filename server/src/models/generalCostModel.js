import pool from '../config/db.js';

/**
 * Get all production status orders for the General Cost list view.
 * Data source: production_status_orders (from Production Status page).
 */
export async function getOrders({ search, status, process_stage, show_completed, has_entry, page = 1, limit = 10, sortBy, sortOrder }) {
  const params = [];
  let where = 'o.deleted_at IS NULL';

  if (search) {
    where += ' AND (o.customer_name LIKE ? OR o.order_no LIKE ? OR o.article LIKE ? OR o.color LIKE ?)';
    const t = `%${search}%`;
    params.push(t, t, t, t);
  }
  if (status && status !== 'All') {
    where += ' AND o.status = ?';
    params.push(status);
  }
  if (show_completed === 'false' || show_completed === false) {
    where += " AND o.status != 'Completed'";
  }
  if (process_stage && process_stage !== 'All') {
    where += ' AND o.process_stage = ?';
    params.push(process_stage);
  }
  if (has_entry === 'true') {
    where += ' AND gch.id IS NOT NULL';
  }

  const allowedSort = ['id', 'customer_name', 'order_no', 'article', 'color', 'issued_qty', 'completed_qty', 'status', 'created_at'];
  const col = allowedSort.includes(sortBy) ? `o.${sortBy}` : 'o.id';
  const ord = sortOrder === 'asc' ? 'ASC' : 'DESC';
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT o.id, o.order_no, o.customer_name, o.article, o.color,
       o.process_stage, o.issued_qty AS order_qty,
       o.completed_qty, o.balance_qty, o.status, o.uom,
       gch.id AS general_cost_id, gch.transaction_no, gch.status AS cost_status
     FROM production_status_orders o
     LEFT JOIN general_cost_headers gch ON gch.production_plan_id = o.id
     WHERE ${where}
     ORDER BY ${col} ${ord}
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM production_status_orders o
     LEFT JOIN general_cost_headers gch ON gch.production_plan_id = o.id
     WHERE ${where}`,
    params
  );

  return { rows, total };
}

/**
 * Get a single general cost entry by ID (with items)
 */
export async function getById(id) {
  const [[header]] = await pool.query(
    `SELECT gch.*,
       o.order_no, o.issued_qty AS order_qty, o.issued_qty AS planned_qty,
       o.completed_qty AS output_qty,
       COALESCE((SELECT SUM(g2.production_qty) FROM general_cost_headers g2 WHERE g2.production_plan_id = gch.production_plan_id AND g2.id != gch.id), 0) AS completed_qty,
       GREATEST(0, o.issued_qty - COALESCE((SELECT SUM(g2.production_qty) FROM general_cost_headers g2 WHERE g2.production_plan_id = gch.production_plan_id), 0)) AS balance_qty,
       o.article, o.color, o.status AS plan_status, o.uom,
       o.customer_name,
       u.full_name AS created_by_name
     FROM general_cost_headers gch
     JOIN production_status_orders o ON gch.production_plan_id = o.id
     LEFT JOIN users u ON gch.created_by = u.id
     WHERE gch.id = ?`,
    [id]
  );
  if (!header) return null;

  const [items] = await pool.query(
    `SELECT * FROM general_cost_items WHERE general_cost_id = ? ORDER BY sort_order, id`,
    [id]
  );

  return { ...header, items };
}

/**
 * Get general cost by production status order ID
 */
export async function getByPlanId(planId) {
  const [[header]] = await pool.query(
    `SELECT gch.*,
       o.order_no, o.issued_qty AS order_qty, o.issued_qty AS planned_qty,
       o.completed_qty AS output_qty,
       o.completed_qty,
       o.balance_qty,
       o.article, o.color, o.status AS plan_status, o.uom,
       o.customer_name,
       u.full_name AS created_by_name
     FROM general_cost_headers gch
     JOIN production_status_orders o ON gch.production_plan_id = o.id
     LEFT JOIN users u ON gch.created_by = u.id
     WHERE gch.production_plan_id = ?`,
    [planId]
  );
  if (!header) return null;

  const [items] = await pool.query(
    `SELECT * FROM general_cost_items WHERE general_cost_id = ? ORDER BY sort_order, id`,
    [header.id]
  );

  return { ...header, items };
}

/**
 * Generate next transaction number: GC-YYYY-MM-NNNN
 */
export async function getNextTransactionNo() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `GC-${yyyy}-${mm}-`;

  const [[row]] = await pool.query(
    `SELECT transaction_no FROM general_cost_headers
     WHERE transaction_no LIKE ? ORDER BY id DESC LIMIT 1`,
    [`${prefix}%`]
  );

  if (!row) return `${prefix}0001`;
  const seq = parseInt(row.transaction_no.substring(prefix.length), 10) + 1;
  return `${prefix}${String(seq).padStart(4, '0')}`;
}

/**
 * Create a general cost entry
 */
export async function create(data, userId = null) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const transactionNo = await getNextTransactionNo();

    // Calculate totals
    const items = data.items || [];
    const orderQty = Number(data.order_qty) || 1;
    const totalAmount = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const totalCostPerPiece = items.reduce((sum, item) => sum + (Number(item.cost_per_piece) || 0), 0);

    const [result] = await conn.query(
      `INSERT INTO general_cost_headers
       (transaction_no, production_plan_id, production_date, production_qty, process_stage, total_amount, total_cost_per_piece, cost_after_adjustments, status, remarks, created_by, updated_by)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        transactionNo,
        data.production_plan_id,
        data.production_date || new Date().toISOString().split('T')[0],
        data.production_qty || 0,
        data.process_stage || 'All',
        totalAmount,
        totalCostPerPiece,
        data.cost_after_adjustments || totalCostPerPiece,
        data.status || 'Pending',
        data.remarks || null,
        userId, userId
      ]
    );

    const headerId = result.insertId;

    // Insert items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await conn.query(
        `INSERT INTO general_cost_items (general_cost_id, cost_category, uom, amount, cost_per_piece, remarks, sort_order)
         VALUES (?,?,?,?,?,?,?)`,
        [headerId, item.cost_category, item.uom || 'Sq.Ft.', item.amount || 0, item.cost_per_piece || 0, item.remarks || null, i + 1]
      );
    }

    await conn.commit();
    return { id: headerId, transaction_no: transactionNo, total_amount: totalAmount, total_cost_per_piece: totalCostPerPiece };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally { conn.release(); }
}

/**
 * Update a general cost entry
 */
export async function update(id, data, userId = null) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Check if posted
    const [[current]] = await conn.query('SELECT status FROM general_cost_headers WHERE id = ?', [id]);
    if (!current) throw new Error('General Cost entry not found');
    if (current.status === 'Posted') throw new Error('Cannot edit a posted entry');

    const items = data.items || [];
    const totalAmount = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const totalCostPerPiece = items.reduce((sum, item) => sum + (Number(item.cost_per_piece) || 0), 0);

    await conn.query(
      `UPDATE general_cost_headers SET
         process_stage=?, production_qty=?, total_amount=?, total_cost_per_piece=?, cost_after_adjustments=?, remarks=?, updated_by=?
       WHERE id=?`,
      [
        data.process_stage || 'All',
        data.production_qty || 0,
        totalAmount, totalCostPerPiece,
        data.cost_after_adjustments || totalCostPerPiece,
        data.remarks || null,
        userId, id
      ]
    );

    // Replace items
    await conn.query('DELETE FROM general_cost_items WHERE general_cost_id = ?', [id]);
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await conn.query(
        `INSERT INTO general_cost_items (general_cost_id, cost_category, uom, amount, cost_per_piece, remarks, sort_order)
         VALUES (?,?,?,?,?,?,?)`,
        [id, item.cost_category, item.uom || 'Sq.Ft.', item.amount || 0, item.cost_per_piece || 0, item.remarks || null, i + 1]
      );
    }

    await conn.commit();
    return { id, total_amount: totalAmount, total_cost_per_piece: totalCostPerPiece };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally { conn.release(); }
}

/**
 * Post a general cost entry (lock it)
 */
export async function post(id, userId = null) {
  const [[current]] = await pool.query('SELECT status FROM general_cost_headers WHERE id = ?', [id]);
  if (!current) throw new Error('General Cost entry not found');
  if (current.status === 'Posted') throw new Error('Already posted');
  const [result] = await pool.query(
    'UPDATE general_cost_headers SET status=?, updated_by=? WHERE id=?',
    ['Posted', userId, id]
  );
  return result.affectedRows > 0;
}

/**
 * Delete a general cost entry
 */
export async function remove(id) {
  const [[current]] = await pool.query('SELECT status FROM general_cost_headers WHERE id = ?', [id]);
  if (!current) return false;
  if (current.status === 'Posted') throw new Error('Cannot delete a posted entry');
  const [result] = await pool.query('DELETE FROM general_cost_headers WHERE id = ?', [id]);
  return result.affectedRows > 0;
}
