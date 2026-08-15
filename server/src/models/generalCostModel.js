import pool from '../config/db.js';

/**
 * Get all production plans for the General Cost list view.
 * Shows order-level info with completion status.
 */
export async function getOrders({ search, status, process_stage, show_completed, has_entry, page = 1, limit = 10, sortBy, sortOrder }) {
  const params = [];
  let where = 'pp.deleted_at IS NULL';

  if (search) {
    where += ' AND (c.name LIKE ? OR so.order_no LIKE ? OR pp.article LIKE ? OR pp.color LIKE ? OR pp.plan_no LIKE ?)';
    const t = `%${search}%`;
    params.push(t, t, t, t, t);
  }
  if (status && status !== 'All') {
    where += ' AND pp.status = ?';
    params.push(status);
  }
  if (show_completed === 'false' || show_completed === false) {
    where += " AND pp.status != 'Completed'";
  }
  if (process_stage && process_stage !== 'All') {
    where += ' AND pst.process_stage_name = ?';
    params.push(process_stage);
  }
  if (has_entry === 'true') {
    where += ' AND gch.id IS NOT NULL';
  }

  const allowedSort = ['id', 'customer_name', 'order_no', 'article', 'color', 'order_qty', 'status', 'created_at'];
  const col = allowedSort.includes(sortBy) ? (sortBy === 'customer_name' ? 'c.name' : sortBy === 'order_no' ? 'so.order_no' : `pp.${sortBy}`) : 'pp.id';
  const ord = sortOrder === 'asc' ? 'ASC' : 'DESC';
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT pp.id, pp.plan_no, pp.order_qty,
       COALESCE(pst_agg.total_output, pp.output_qty) AS completed_qty,
       GREATEST(0, pp.order_qty - COALESCE(pst_agg.total_output, pp.output_qty)) AS balance_qty,
       pp.article, pp.color, pp.status, pp.uom,
       c.name AS customer_name,
       so.order_no AS order_no,
       gch.id AS general_cost_id, gch.transaction_no, gch.status AS cost_status
     FROM production_plans pp
     LEFT JOIN customers c ON pp.customer_id = c.id
     LEFT JOIN sales_orders so ON pp.sales_order_id = so.id
     LEFT JOIN general_cost_headers gch ON gch.production_plan_id = pp.id
     LEFT JOIN production_status_transactions pst ON pst.production_plan_id = pp.id AND pst.deleted_at IS NULL
     LEFT JOIN (
       SELECT production_plan_id,
         SUM(output_qty) AS total_output
       FROM production_status_transactions
       WHERE deleted_at IS NULL
       ${process_stage && process_stage !== 'All' ? 'AND process_stage_name = ?' : ''}
       GROUP BY production_plan_id
     ) pst_agg ON pst_agg.production_plan_id = pp.id
     WHERE ${where}
     GROUP BY pp.id, pp.plan_no, pp.order_qty, pp.article, pp.color, pp.status, pp.uom,
       c.name, so.order_no, gch.id, gch.transaction_no, gch.status, pst_agg.total_output, pp.output_qty
     ORDER BY ${col} ${ord}
     LIMIT ? OFFSET ?`,
    [...(process_stage && process_stage !== 'All' ? [process_stage] : []), ...params, Number(limit), Number(offset)]
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(DISTINCT pp.id) AS total
     FROM production_plans pp
     LEFT JOIN customers c ON pp.customer_id = c.id
     LEFT JOIN sales_orders so ON pp.sales_order_id = so.id
     LEFT JOIN general_cost_headers gch ON gch.production_plan_id = pp.id
     LEFT JOIN production_status_transactions pst ON pst.production_plan_id = pp.id AND pst.deleted_at IS NULL
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
       pp.plan_no, pp.order_qty, pp.planned_qty,
       COALESCE((SELECT SUM(g2.production_qty) FROM general_cost_headers g2 WHERE g2.production_plan_id = gch.production_plan_id AND g2.id != gch.id), 0) AS completed_qty,
       GREATEST(0, pp.order_qty - COALESCE((SELECT SUM(g2.production_qty) FROM general_cost_headers g2 WHERE g2.production_plan_id = gch.production_plan_id), 0)) AS balance_qty,
       pp.article, pp.color, pp.status AS plan_status, pp.uom,
       c.name AS customer_name,
       so.order_no AS order_no,
       u.full_name AS created_by_name
     FROM general_cost_headers gch
     JOIN production_plans pp ON gch.production_plan_id = pp.id
     LEFT JOIN customers c ON pp.customer_id = c.id
     LEFT JOIN sales_orders so ON pp.sales_order_id = so.id
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
 * Get general cost by production plan ID
 */
export async function getByPlanId(planId) {
  const [[header]] = await pool.query(
    `SELECT gch.*,
       pp.plan_no, pp.order_qty, pp.output_qty AS completed_qty,
       GREATEST(0, pp.order_qty - pp.output_qty) AS balance_qty,
       pp.article, pp.color, pp.status AS plan_status, pp.uom,
       c.name AS customer_name,
       so.order_no AS order_no,
       u.full_name AS created_by_name
     FROM general_cost_headers gch
     JOIN production_plans pp ON gch.production_plan_id = pp.id
     LEFT JOIN customers c ON pp.customer_id = c.id
     LEFT JOIN sales_orders so ON pp.sales_order_id = so.id
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
