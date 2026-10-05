import pool from '../config/db.js';
import { isOrderCostLocked } from './standardCostModel.js';


async function assertProductionQtyWithinPlan(conn, productionPlanId, productionQty, currentId = null, processStage = null) {
  const [[plan]] = await conn.query('SELECT production_plan_id, issued_qty, process_stage FROM production_status_orders WHERE id=? AND deleted_at IS NULL', [productionPlanId]);
  if (!plan) throw new Error('Production plan/order not found');

  // The cap is PER STAGE so each stage can be costed independently. Prefer the
  // stage's planned qty from the plan; fall back to the order's issued qty.
  const stage = processStage || plan.process_stage || null;
  let max = Number(plan.issued_qty) || 0;
  if (stage) {
    const [[s]] = await conn.query(
      `SELECT COALESCE(SUM(planned_qty),0) AS planned FROM production_plan_stages
        WHERE plan_id = ? AND stage_name COLLATE utf8mb4_unicode_ci = ? COLLATE utf8mb4_unicode_ci`,
      [plan.production_plan_id, stage]
    );
    const planned = Number(s?.planned) || 0;
    if (planned > 0) max = planned;
  }

  // Only sum cost headers of the SAME order + stage against this cap.
  const params = [productionPlanId];
  let stageClause = '';
  if (stage) { stageClause = ' AND COALESCE(process_stage, \'\') COLLATE utf8mb4_unicode_ci = ? COLLATE utf8mb4_unicode_ci'; params.push(stage); }
  let exclude = '';
  if (currentId) { exclude = ' AND id <> ?'; params.push(currentId); }
  const [[used]] = await conn.query(`SELECT COALESCE(SUM(production_qty),0) AS qty FROM machine_cost_headers WHERE production_plan_id=?${stageClause}${exclude}`, params);
  const requested = Number(productionQty) || 0;
  if (requested > Math.max(0, max - (Number(used.qty) || 0)) + 0.000001) {
    throw new Error(`Output quantity cannot be greater than planned quantity. Available planned balance: ${Math.max(0, max - (Number(used.qty) || 0))}`);
  }
}

/**
 * Get all production status orders for the Machine Cost list view.
 * Data source: production_status_orders grouped by production_plan_id.
 */
export async function getOrders({ search, status, process_stage, show_completed, has_entry, page = 1, limit = 10, sortBy, sortOrder }) {
  const params = [];
  let where = 'o.deleted_at IS NULL';
  if (search) {
    where += ' AND (o.customer_name LIKE ? OR pp.plan_no LIKE ? OR o.article LIKE ? OR o.color LIKE ?)';
    const t = `%${search}%`; params.push(t, t, t, t);
  }
  if (status && status !== 'All') { where += ' AND o.status = ?'; params.push(status); }
  if (show_completed === 'false' || show_completed === false) { where += " AND o.status != 'Completed'"; }
  if (process_stage && process_stage !== 'All') { where += ' AND o.process_stage = ?'; params.push(process_stage); }
  if (has_entry === 'true') { where += ' AND mch.id IS NOT NULL'; }
  const ord = sortOrder === 'asc' ? 'ASC' : 'DESC';
  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT pp.id AS plan_id, pp.plan_no, MAX(o.customer_name) AS customer_name, MAX(o.article) AS article, MAX(o.color) AS color,
       -- Collapsed row shows ONLY the Wet End stage planned qty (the first
       -- process stage), not the sum across every stage.
       COALESCE((
         SELECT s.planned_qty FROM production_plan_stages s
         WHERE s.plan_id = pp.id
           AND s.stage_name COLLATE utf8mb4_unicode_ci = 'Wet End' COLLATE utf8mb4_unicode_ci
         ORDER BY s.seq ASC LIMIT 1
       ), 0) AS order_qty, SUM(o.completed_qty) AS completed_qty, SUM(o.balance_qty) AS balance_qty,
       CASE WHEN SUM(CASE WHEN o.status = 'Completed' THEN 1 ELSE 0 END) = COUNT(o.id) THEN 'Completed'
         WHEN SUM(CASE WHEN o.status IN ('In Progress', 'In-Process') THEN 1 ELSE 0 END) > 0 THEN 'In Progress'
         WHEN SUM(CASE WHEN o.status = 'Posted' THEN 1 ELSE 0 END) > 0 THEN 'Posted' ELSE 'Pending' END AS status,
       MAX(o.uom) AS uom, COUNT(DISTINCT mch.id) AS cost_entry_count
     FROM production_status_orders o
     JOIN production_plans pp ON pp.id = o.production_plan_id AND pp.deleted_at IS NULL
     LEFT JOIN machine_cost_headers mch ON mch.production_plan_id = o.id
     WHERE ${where} GROUP BY pp.id, pp.plan_no ORDER BY pp.plan_no ${ord} LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(DISTINCT pp.id) AS total FROM production_status_orders o
     JOIN production_plans pp ON pp.id = o.production_plan_id AND pp.deleted_at IS NULL
     LEFT JOIN machine_cost_headers mch ON mch.production_plan_id = o.id WHERE ${where}`, params
  );
  return { rows, total };
}

export async function getOrdersByPlan(planId) {
  const [rows] = await pool.query(
    `SELECT o.id, o.order_no, o.customer_name, o.article, o.color, o.process_stage,
       COALESCE((
         SELECT s.planned_qty FROM production_plan_stages s
         WHERE s.plan_id = o.production_plan_id
           AND s.stage_name COLLATE utf8mb4_unicode_ci = o.process_stage COLLATE utf8mb4_unicode_ci
         ORDER BY s.seq ASC LIMIT 1
       ), o.issued_qty, 0) AS order_qty,
       o.completed_qty, o.balance_qty, o.status, o.uom, mch.id AS machine_cost_id, mch.transaction_no, mch.status AS cost_status
     FROM production_status_orders o LEFT JOIN machine_cost_headers mch ON mch.production_plan_id = o.id
     WHERE o.production_plan_id = ? AND o.deleted_at IS NULL
     -- Order stages by their defined production sequence (plan stage seq first,
     -- then the master process_stages seq), matching how stages are shown
     -- elsewhere, rather than alphabetically.
     ORDER BY COALESCE((
         SELECT s.seq FROM production_plan_stages s
         WHERE s.plan_id = o.production_plan_id
           AND s.stage_name COLLATE utf8mb4_unicode_ci = o.process_stage COLLATE utf8mb4_unicode_ci
         ORDER BY s.seq ASC LIMIT 1
       ), (
         SELECT ps.seq FROM process_stages ps
         WHERE ps.name COLLATE utf8mb4_unicode_ci = o.process_stage COLLATE utf8mb4_unicode_ci
         ORDER BY (ps.status='Active') DESC, ps.id ASC LIMIT 1
       ), 999999) ASC, o.id ASC`, [planId]
  );
  return rows;
}

/**
 * Return the list of STAGES for the production plan behind a status-order, so
 * the Machine Cost form can let the user cost each stage separately. For every
 * stage we include its planned qty (from production_plan_stages), its Daily
 * Production output qty, and any existing machine cost header for that
 * order + stage (so the form can load/edit it).
 *
 * @param orderId  a production_status_orders.id (what the form holds as production_plan_id)
 */
export async function getStagesForOrder(orderId) {
  const [[order]] = await pool.query(
    `SELECT id, production_plan_id, process_stage FROM production_status_orders WHERE id=? AND deleted_at IS NULL`,
    [orderId]
  );
  if (!order) return [];
  const planId = order.production_plan_id;

  // Stage list = plan stages UNION the status order's own stage UNION all active
  // master process stages, so the user can cost ANY stage, not only the ones the
  // plan was created with. planned_qty comes from the plan stage when defined.
  const [rows] = await pool.query(
    `SELECT stage_name AS process_stage, SUM(planned_qty) AS planned_qty, MIN(seq) AS seq FROM (
        SELECT s.stage_name COLLATE utf8mb4_unicode_ci AS stage_name, COALESCE(s.planned_qty,0) AS planned_qty, s.seq AS seq
          FROM production_plan_stages s
         WHERE s.plan_id = ?
        UNION ALL
        SELECT o.process_stage COLLATE utf8mb4_unicode_ci AS stage_name, 0 AS planned_qty, 999998 AS seq
          FROM production_status_orders o
         WHERE o.production_plan_id = ? AND o.deleted_at IS NULL
           AND o.process_stage IS NOT NULL AND o.process_stage <> ''
        UNION ALL
        SELECT ps.name COLLATE utf8mb4_unicode_ci AS stage_name, 0 AS planned_qty, COALESCE(ps.seq, 999999) AS seq
          FROM process_stages ps
         WHERE ps.status = 'Active' AND ps.name IS NOT NULL AND ps.name <> ''
     ) u
     GROUP BY stage_name
     ORDER BY MIN(seq)`,
    [planId, planId]
  );

  // Per-stage output qty from Daily Production transactions, and existing cost id.
  const result = [];
  for (const r of rows) {
    const [[out]] = await pool.query(
      `SELECT COALESCE(SUM(t.output_qty),0) AS output_qty
         FROM production_status_orders o
         JOIN production_status_transactions t
           ON t.production_status_order_id = o.id AND t.deleted_at IS NULL
        WHERE o.production_plan_id = ? AND o.deleted_at IS NULL
          AND o.process_stage COLLATE utf8mb4_unicode_ci = ? COLLATE utf8mb4_unicode_ci`,
      [planId, r.process_stage]
    );
    const [[cost]] = await pool.query(
      `SELECT mch.id AS machine_cost_id, mch.transaction_no, mch.status
         FROM machine_cost_headers mch
        WHERE mch.production_plan_id = ?
          AND COALESCE(mch.process_stage,'') COLLATE utf8mb4_unicode_ci = ? COLLATE utf8mb4_unicode_ci
        ORDER BY mch.id DESC LIMIT 1`,
      [orderId, r.process_stage]
    );
    result.push({
      process_stage: r.process_stage,
      planned_qty: Number(r.planned_qty) || 0,
      output_qty: Number(out?.output_qty) || 0,
      machine_cost_id: cost?.machine_cost_id || null,
      transaction_no: cost?.transaction_no || null,
      cost_status: cost?.status || null,
    });
  }
  return result;
}

export async function getById(id) {
  const [[header]] = await pool.query(
    `SELECT mch.*,
       o.order_no,
       COALESCE((
         SELECT s.planned_qty FROM production_plan_stages s
         WHERE s.plan_id = o.production_plan_id
           AND s.stage_name COLLATE utf8mb4_unicode_ci = o.process_stage COLLATE utf8mb4_unicode_ci
         ORDER BY s.seq ASC LIMIT 1
       ), o.issued_qty, 0) AS planned_qty,
       COALESCE((
         SELECT s.planned_qty FROM production_plan_stages s
         WHERE s.plan_id = o.production_plan_id
           AND s.stage_name COLLATE utf8mb4_unicode_ci = o.process_stage COLLATE utf8mb4_unicode_ci
         ORDER BY s.seq ASC LIMIT 1
       ), o.issued_qty, 0) AS order_qty,
       o.completed_qty AS output_qty,
       COALESCE((SELECT SUM(m2.production_qty) FROM machine_cost_headers m2 WHERE m2.production_plan_id = mch.production_plan_id), 0) AS completed_qty,
       GREATEST(0, o.issued_qty - COALESCE((SELECT SUM(m2.production_qty) FROM machine_cost_headers m2 WHERE m2.production_plan_id = mch.production_plan_id), 0)) AS balance_qty,
       o.article, o.color, o.status AS plan_status, o.uom,
       o.customer_name,
       u.full_name AS created_by_name
     FROM machine_cost_headers mch
     JOIN production_status_orders o ON mch.production_plan_id = o.id
     LEFT JOIN users u ON mch.created_by = u.id
     WHERE mch.id = ?`,
    [id]
  );
  if (!header) return null;

  const [items] = await pool.query(
    `SELECT mci.*, COALESCE(g.name, mci.group_name) AS group_name
     FROM machine_cost_items mci
     LEFT JOIN group_master g ON mci.group_id = g.id
     WHERE mci.machine_cost_id = ? ORDER BY mci.sort_order, mci.id`,
    [id]
  );

  return { ...header, items };
}

/**
 * Return the machine cost items of the most recent entry for the same article
 * (optionally same process stage), excluding a given entry. Used by the
 * "Import from Previous Cost" button, mirroring Material Issue's import.
 */
export async function getPreviousCostItems({ article, process_stage, exclude_id = null }) {
  if (!article) return null;
  const params = [article];
  let stageClause = '';
  if (process_stage && process_stage !== 'All') { stageClause = ' AND mch.process_stage = ?'; params.push(process_stage); }
  let excludeClause = '';
  if (exclude_id) { excludeClause = ' AND mch.id <> ?'; params.push(exclude_id); }

  const [[header]] = await pool.query(
    `SELECT mch.id, mch.transaction_no, mch.process_stage
       FROM machine_cost_headers mch
       JOIN production_status_orders o ON mch.production_plan_id = o.id
      WHERE o.article COLLATE utf8mb4_unicode_ci = ? COLLATE utf8mb4_unicode_ci
        ${stageClause}${excludeClause}
      ORDER BY mch.id DESC LIMIT 1`,
    params
  );
  if (!header) return null;

  const [items] = await pool.query(
    `SELECT mci.machine_name, mci.group_id, COALESCE(g.name, mci.group_name) AS group_name,
       mci.uom, mci.total_qty, mci.cost_per_uom, mci.amount, mci.cost_per_piece, mci.remarks
     FROM machine_cost_items mci
     LEFT JOIN group_master g ON mci.group_id = g.id
     WHERE mci.machine_cost_id = ? ORDER BY mci.sort_order, mci.id`,
    [header.id]
  );
  return { source_transaction_no: header.transaction_no, process_stage: header.process_stage, items };
}

export async function getNextTransactionNo() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `MC-${yyyy}-${mm}-`;

  const [[row]] = await pool.query(
    `SELECT transaction_no FROM machine_cost_headers
     WHERE transaction_no LIKE ? ORDER BY id DESC LIMIT 1`,
    [`${prefix}%`]
  );

  if (!row) return `${prefix}0001`;
  const seq = parseInt(row.transaction_no.substring(prefix.length), 10) + 1;
  return `${prefix}${String(seq).padStart(4, '0')}`;
}

export async function create(data, userId = null) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await assertProductionQtyWithinPlan(conn, data.production_plan_id, data.production_qty || 0, null, data.process_stage);

    const transactionNo = await getNextTransactionNo();
    const items = data.items || [];
    const totalAmount = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const outputQty = data.output_qty || data.production_qty || 1;
    const totalCostPerPiece = outputQty > 0 ? Number((totalAmount / outputQty).toFixed(2)) : 0;

    const [result] = await conn.query(
      `INSERT INTO machine_cost_headers
       (transaction_no, production_plan_id, production_date, process_stage, production_qty, total_amount, total_cost_per_piece, cost_after_adjustments, status, remarks, created_by, updated_by)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        transactionNo,
        data.production_plan_id,
        data.production_date || new Date().toISOString().split('T')[0],
        data.process_stage || 'All',
        data.production_qty || 0,
        totalAmount,
        totalCostPerPiece,
        data.cost_after_adjustments || totalCostPerPiece,
        data.status || 'Pending',
        data.remarks || null,
        userId, userId
      ]
    );

    const headerId = result.insertId;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await conn.query(
        `INSERT INTO machine_cost_items (machine_cost_id, machine_name, group_id, group_name, uom, total_qty, cost_per_uom, amount, cost_per_piece, remarks, sort_order)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        [headerId, item.machine_name, item.group_id || null, item.group_name || null, item.uom || 'Sq.Ft.', item.total_qty || 0, item.cost_per_uom || 0, item.amount || 0, item.cost_per_piece || 0, item.remarks || null, i + 1]
      );
    }

    await conn.commit();
    return { id: headerId, transaction_no: transactionNo, total_amount: totalAmount, total_cost_per_piece: totalCostPerPiece };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally { conn.release(); }
}

export async function update(id, data, userId = null) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[current]] = await conn.query('SELECT status, production_plan_id FROM machine_cost_headers WHERE id = ?', [id]);
    if (!current) throw new Error('Machine Cost entry not found');
    if (current.status === 'Posted') throw new Error('Cannot edit a posted entry');

    const planOrderId = data.production_plan_id || current.production_plan_id;
    if (await isOrderCostLocked(conn, planOrderId)) {
      throw new Error('Cannot edit: the standard cost for this order is Approved and locked');
    }

    await assertProductionQtyWithinPlan(conn, planOrderId, data.production_qty || 0, id, data.process_stage);

    const items = data.items || [];
    const totalAmount = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const totalCostPerPiece = items.reduce((sum, item) => sum + (Number(item.cost_per_piece) || 0), 0);

    await conn.query(
      `UPDATE machine_cost_headers SET
         process_stage=?, production_qty=?, total_amount=?, total_cost_per_piece=?, cost_after_adjustments=?, remarks=?, updated_by=?
       WHERE id=?`,
      [data.process_stage || 'All', data.production_qty || 0, totalAmount, totalCostPerPiece, data.cost_after_adjustments || totalCostPerPiece, data.remarks || null, userId, id]
    );

    await conn.query('DELETE FROM machine_cost_items WHERE machine_cost_id = ?', [id]);
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await conn.query(
        `INSERT INTO machine_cost_items (machine_cost_id, machine_name, group_id, group_name, uom, total_qty, cost_per_uom, amount, cost_per_piece, remarks, sort_order)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        [id, item.machine_name, item.group_id || null, item.group_name || null, item.uom || 'Sq.Ft.', item.total_qty || 0, item.cost_per_uom || 0, item.amount || 0, item.cost_per_piece || 0, item.remarks || null, i + 1]
      );
    }

    await conn.commit();
    return { id, total_amount: totalAmount, total_cost_per_piece: totalCostPerPiece };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally { conn.release(); }
}

export async function post(id, userId = null) {
  const [[current]] = await pool.query('SELECT status FROM machine_cost_headers WHERE id = ?', [id]);
  if (!current) throw new Error('Machine Cost entry not found');
  if (current.status === 'Posted') throw new Error('Already posted');
  const [result] = await pool.query('UPDATE machine_cost_headers SET status=?, updated_by=? WHERE id=?', ['Posted', userId, id]);
  return result.affectedRows > 0;
}

export async function remove(id) {
  const [[current]] = await pool.query('SELECT status, production_plan_id FROM machine_cost_headers WHERE id = ?', [id]);
  if (!current) return false;
  if (current.status === 'Posted') throw new Error('Cannot delete a posted entry');
  if (await isOrderCostLocked(pool, current.production_plan_id)) {
    throw new Error('Cannot delete: the standard cost for this order is Approved and locked');
  }
  const [result] = await pool.query('DELETE FROM machine_cost_headers WHERE id = ?', [id]);
  return result.affectedRows > 0;
}
