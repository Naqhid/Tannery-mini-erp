import pool from '../config/db.js';

// ─── Orders (main list) ──────────────────────────────────────────────────────

export async function getOrders({ process_stage, show_completed, status_filter, search, has_transactions, page = 1, limit = 10, sortBy, sortOrder }) {
  const params = [];
  let where = 'o.deleted_at IS NULL';

  if (process_stage && process_stage !== 'All') {
    where += ' AND o.process_stage = ?';
    params.push(process_stage);
  }
  if (status_filter && status_filter !== 'All') {
    if (status_filter === 'Completed') {
      where += " AND o.status = 'Completed'";
    } else if (status_filter === 'Incomplete') {
      where += " AND o.status != 'Completed'";
    }
  } else if (show_completed === 'false' || show_completed === false) {
    where += " AND o.status != 'Completed'";
  }
  if (has_transactions === 'true') {
    where += ' AND o.issued_qty > 0';
  }
  if (search) {
    where += ' AND (o.order_no LIKE ? OR o.article LIKE ? OR o.color LIKE ? OR o.customer_name LIKE ?)';
    const t = `%${search}%`;
    params.push(t, t, t, t);
  }

  const allowedSort = ['order_no', 'article', 'color', 'issued_qty', 'completed_qty', 'balance_qty', 'status', 'customer_name'];
  const col = allowedSort.includes(sortBy) ? `o.${sortBy}` : 'o.id';
  const ord = sortOrder === 'asc' ? 'ASC' : 'DESC';
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT o.* FROM production_status_orders o WHERE ${where} ORDER BY ${col} ${ord} LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM production_status_orders o WHERE ${where}`,
    params
  );

  return { rows, total };
}

export async function getOrderById(id) {
  const [[row]] = await pool.query(
    `SELECT * FROM production_status_orders WHERE id = ? AND deleted_at IS NULL`, [id]
  );
  return row || null;
}

export async function createOrder(data, userId = null) {
  const balanceQty = Math.max(0, (parseFloat(data.issued_qty) || 0) - (parseFloat(data.completed_qty) || 0));
  const [result] = await pool.query(
    `INSERT INTO production_status_orders
     (order_no, customer_name, article, color, process_stage, issued_qty, completed_qty, balance_qty, uom, status, remarks, created_by, updated_by)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      data.order_no || null,
      data.customer_name || null,
      data.article || null,
      data.color || null,
      data.process_stage || null,
      parseFloat(data.issued_qty) || 0,
      parseFloat(data.completed_qty) || 0,
      balanceQty,
      data.uom || 'Pcs',
      data.status || 'In-Process',
      data.remarks || null,
      userId, userId
    ]
  );
  return { id: result.insertId };
}

export async function updateOrder(id, data, userId = null) {
  const balanceQty = Math.max(0, (parseFloat(data.issued_qty) || 0) - (parseFloat(data.completed_qty) || 0));
  const [result] = await pool.query(
    `UPDATE production_status_orders SET
       order_no=?, customer_name=?, article=?, color=?, process_stage=?,
       issued_qty=?, completed_qty=?, balance_qty=?, uom=?, status=?, remarks=?, updated_by=?
     WHERE id=? AND deleted_at IS NULL`,
    [
      data.order_no || null,
      data.customer_name || null,
      data.article || null,
      data.color || null,
      data.process_stage || null,
      parseFloat(data.issued_qty) || 0,
      parseFloat(data.completed_qty) || 0,
      balanceQty,
      data.uom || 'Pcs',
      data.status || 'In-Process',
      data.remarks || null,
      userId, id
    ]
  );
  return result.affectedRows > 0;
}

export async function deleteOrder(id, userId = null) {
  const [result] = await pool.query(
    `UPDATE production_status_orders SET deleted_at=NOW(), updated_by=? WHERE id=? AND deleted_at IS NULL`,
    [userId, id]
  );
  return result.affectedRows > 0;
}

/** Recalculate order totals from its transactions */
export async function recalcOrderTotals(orderId) {
  const [[totals]] = await pool.query(
    `SELECT
       COALESCE(SUM(input_qty), 0) AS total_input,
       COALESCE(SUM(output_qty), 0) AS total_output
     FROM production_status_transactions
     WHERE production_status_order_id = ? AND deleted_at IS NULL`,
    [orderId]
  );
  const issuedQty = totals.total_input;
  const completedQty = totals.total_output;
  const balanceQty = Math.max(0, issuedQty - completedQty);

  let status = 'In-Process';
  if (issuedQty === 0 && completedQty === 0) status = 'Pending';
  else if (balanceQty <= 0 && completedQty > 0) status = 'Completed';

  await pool.query(
    `UPDATE production_status_orders SET issued_qty=?, completed_qty=?, balance_qty=?, status=? WHERE id=?`,
    [issuedQty, completedQty, balanceQty, status, orderId]
  );
}

// ─── Transactions ────────────────────────────────────────────────────────────

export async function getTransactions({ production_status_order_id, page = 1, limit = 10, sortBy, sortOrder }) {
  const params = [production_status_order_id];
  const where = 't.production_status_order_id = ? AND t.deleted_at IS NULL';

  const allowedSort = ['production_date', 'transaction_no', 'opening_qty', 'input_qty', 'output_qty', 'wip_qty'];
  const col = allowedSort.includes(sortBy) ? `t.${sortBy}` : 't.production_date';
  const ord = sortOrder === 'asc' ? 'ASC' : 'DESC';
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT t.* FROM production_status_transactions t WHERE ${where} ORDER BY ${col} ${ord} LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM production_status_transactions t WHERE ${where}`, params
  );

  const [[summary]] = await pool.query(
    `SELECT
       COALESCE(SUM(t.opening_qty), 0) AS total_opening_qty,
       COALESCE(SUM(t.input_qty), 0) AS total_input_qty,
       COALESCE(SUM(t.output_qty), 0) AS total_output_qty,
       COALESCE(SUM(t.wip_qty), 0) AS total_wip_qty
     FROM production_status_transactions t WHERE ${where}`, params
  );

  return { rows, total, summary };
}

export async function getTransactionById(id) {
  const [[row]] = await pool.query(
    `SELECT * FROM production_status_transactions WHERE id = ? AND deleted_at IS NULL`, [id]
  );
  return row || null;
}

export async function getNextTransactionNo() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const prefix = `TXN-${yy}${mm}${dd}-`;

  const [[row]] = await pool.query(
    `SELECT transaction_no FROM production_status_transactions WHERE transaction_no LIKE ? ORDER BY id DESC LIMIT 1`,
    [`${prefix}%`]
  );

  if (!row) return `${prefix}0001`;
  const seq = parseInt(row.transaction_no.substring(prefix.length), 10) + 1;
  return `${prefix}${String(seq).padStart(4, '0')}`;
}

export async function createTransaction(data, userId = null) {
  const transactionNo = data.transaction_no || await getNextTransactionNo();

  const [result] = await pool.query(
    `INSERT INTO production_status_transactions
     (production_status_order_id, transaction_no, production_date, opening_qty, input_qty, output_qty, wip_qty, uom, remarks, created_by, updated_by)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [
      data.production_status_order_id,
      transactionNo,
      data.production_date || new Date().toISOString().split('T')[0],
      parseFloat(data.opening_qty) || 0,
      parseFloat(data.input_qty) || 0,
      parseFloat(data.output_qty) || 0,
      parseFloat(data.wip_qty) || 0,
      data.uom || 'Pcs',
      data.remarks || null,
      userId, userId
    ]
  );

  // Recalc parent order totals
  await recalcOrderTotals(data.production_status_order_id);

  return { id: result.insertId, transaction_no: transactionNo };
}

export async function updateTransaction(id, data, userId = null) {
  // Get the order id before update
  const [[existing]] = await pool.query('SELECT production_status_order_id FROM production_status_transactions WHERE id = ?', [id]);
  if (!existing) return false;

  const [result] = await pool.query(
    `UPDATE production_status_transactions SET
       production_date=?, opening_qty=?, input_qty=?, output_qty=?, wip_qty=?, remarks=?, updated_by=?
     WHERE id=? AND deleted_at IS NULL`,
    [
      data.production_date,
      parseFloat(data.opening_qty) || 0,
      parseFloat(data.input_qty) || 0,
      parseFloat(data.output_qty) || 0,
      parseFloat(data.wip_qty) || 0,
      data.remarks || null,
      userId, id
    ]
  );

  // Recalc parent order totals
  await recalcOrderTotals(existing.production_status_order_id);

  return result.affectedRows > 0;
}

export async function deleteTransaction(id, userId = null) {
  const [[existing]] = await pool.query('SELECT production_status_order_id FROM production_status_transactions WHERE id = ?', [id]);
  if (!existing) return false;

  const [result] = await pool.query(
    `UPDATE production_status_transactions SET deleted_at=NOW(), updated_by=? WHERE id=? AND deleted_at IS NULL`,
    [userId, id]
  );

  // Recalc parent order totals
  if (result.affectedRows > 0) {
    await recalcOrderTotals(existing.production_status_order_id);
  }

  return result.affectedRows > 0;
}
