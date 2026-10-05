import pool from '../../config/db.js';

// ─── Sales Order Summary ─────────────────────────────────────────────────────
export async function salesOrderSummary({ from_date, to_date, customer_id, status, search, page = 1, limit = 10 }) {
  const params = [];
  let where = '1=1';
  if (from_date) { where += ' AND so.order_date >= ?'; params.push(from_date); }
  if (to_date) { where += ' AND so.order_date <= ?'; params.push(to_date); }
  if (customer_id) { where += ' AND so.customer_id = ?'; params.push(customer_id); }
  if (status) { where += ' AND so.status = ?'; params.push(status); }
  if (search) {
    where += ' AND (so.order_no LIKE ? OR c.name LIKE ? OR soi.item_description LIKE ?)';
    const t = `%${search}%`; params.push(t, t, t);
  }
  const offset = (page - 1) * limit;

  const baseFrom = `
     FROM sales_order_items soi
     JOIN sales_orders so ON soi.sales_order_id = so.id
     LEFT JOIN customers c ON so.customer_id = c.id
     WHERE ${where}`;

  const [rows] = await pool.query(
    `SELECT soi.id, so.order_no, so.order_date, c.name AS customer_name,
       soi.item_description AS article, soi.finish_color AS color, soi.uom,
       COALESCE(soi.quantity,0) AS order_qty,
       COALESCE(soi.unit_price,0) AS unit_price,
       COALESCE(soi.amount,0) AS amount,
       so.status
     ${baseFrom}
     ORDER BY so.order_date DESC, so.id DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total ${baseFrom}`, params);
  const [[totals]] = await pool.query(
    `SELECT COALESCE(SUM(soi.quantity),0) AS total_qty, COALESCE(SUM(soi.amount),0) AS total_amount ${baseFrom}`, params
  );
  return { rows, total, totals };
}

// ─── Order Fulfillment Report ────────────────────────────────────────────────
// Ordered vs shipped (delivery notes) vs pending, per order line.
export async function orderFulfillment({ from_date, to_date, customer_id, search, page = 1, limit = 10 }) {
  const params = [];
  let where = '1=1';
  if (from_date) { where += ' AND so.order_date >= ?'; params.push(from_date); }
  if (to_date) { where += ' AND so.order_date <= ?'; params.push(to_date); }
  if (customer_id) { where += ' AND so.customer_id = ?'; params.push(customer_id); }
  if (search) {
    where += ' AND (so.order_no LIKE ? OR c.name LIKE ? OR soi.item_description LIKE ?)';
    const t = `%${search}%`; params.push(t, t, t);
  }
  const offset = (page - 1) * limit;

  // Shipped qty from delivery_note_items matched by order + article (collation-safe).
  const shippedSql = `
    COALESCE((
      SELECT SUM(dni.shipped_qty)
      FROM delivery_notes dn
      JOIN delivery_note_items dni ON dni.delivery_note_id = dn.id
      WHERE dn.sales_order_id = so.id
        AND dni.item_description COLLATE utf8mb4_unicode_ci = soi.item_description COLLATE utf8mb4_unicode_ci
    ), 0)`;

  const baseFrom = `
     FROM sales_order_items soi
     JOIN sales_orders so ON soi.sales_order_id = so.id
     LEFT JOIN customers c ON so.customer_id = c.id
     WHERE ${where}`;

  const [rows] = await pool.query(
    `SELECT soi.id, so.order_no, so.order_date, so.delivery_date, c.name AS customer_name,
       soi.item_description AS article, soi.finish_color AS color, soi.uom,
       COALESCE(soi.quantity,0) AS order_qty,
       ${shippedSql} AS shipped_qty,
       GREATEST(0, COALESCE(soi.quantity,0) - ${shippedSql}) AS pending_qty,
       CASE WHEN COALESCE(soi.quantity,0) > 0 THEN ROUND(${shippedSql}/soi.quantity*100,2) ELSE 0 END AS fulfillment_percent,
       so.status
     ${baseFrom}
     ORDER BY so.order_date DESC, so.id DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total ${baseFrom}`, params);
  return { rows, total };
}

// ─── Open Sales Order Report ─────────────────────────────────────────────────
// Orders not fully delivered / not cancelled.
export async function openSalesOrders({ customer_id, search, page = 1, limit = 10 }) {
  const params = [];
  let where = `so.status NOT IN ('Cancelled','Delivered')`;
  if (customer_id) { where += ' AND so.customer_id = ?'; params.push(customer_id); }
  if (search) {
    where += ' AND (so.order_no LIKE ? OR c.name LIKE ? OR soi.item_description LIKE ?)';
    const t = `%${search}%`; params.push(t, t, t);
  }
  const offset = (page - 1) * limit;

  // Completed = actual production output (measurement/last stage) for the plans
  // linked to this SO + article. This is 0 until production actually produces
  // output, so it will not show phantom "shipped" quantity.
  const completedSql = `
    COALESCE((
      SELECT SUM(t.output_qty)
      FROM production_plans pp
      JOIN production_status_orders pso ON pso.production_plan_id = pp.id AND pso.deleted_at IS NULL
        AND pso.process_stage COLLATE utf8mb4_unicode_ci = (
          SELECT s2.stage_name FROM production_plan_stages s2 WHERE s2.plan_id = pp.id
          ORDER BY s2.seq DESC, s2.id DESC LIMIT 1)
      JOIN production_status_transactions t ON t.production_status_order_id = pso.id AND t.deleted_at IS NULL
      WHERE pp.sales_order_id = so.id AND pp.deleted_at IS NULL
        AND pp.article COLLATE utf8mb4_unicode_ci = soi.item_description COLLATE utf8mb4_unicode_ci
    ), 0)`;

  const baseFrom = `
     FROM sales_order_items soi
     JOIN sales_orders so ON soi.sales_order_id = so.id
     LEFT JOIN customers c ON so.customer_id = c.id
     WHERE ${where} AND (COALESCE(soi.quantity,0) - ${completedSql}) > 0`;

  const [rows] = await pool.query(
    `SELECT soi.id, so.order_no, so.order_date, so.delivery_date, c.name AS customer_name,
       soi.item_description AS article, soi.finish_color AS color, soi.uom,
       COALESCE(soi.quantity,0) AS order_qty,
       ${completedSql} AS completed_qty,
       GREATEST(0, COALESCE(soi.quantity,0) - ${completedSql}) AS balance_qty,
       so.status AS production_status
     ${baseFrom}
     ORDER BY so.delivery_date ASC, so.id DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total ${baseFrom}`, params);
  return { rows, total };
}

// ─── Sales Order Production Tracking ─────────────────────────────────────────
// Links SO items to production plans/status for output tracking.
export async function salesOrderProductionTracking({ customer_id, search, page = 1, limit = 10 }) {
  const params = [];
  let where = '1=1';
  if (customer_id) { where += ' AND so.customer_id = ?'; params.push(customer_id); }
  if (search) {
    where += ' AND (so.order_no LIKE ? OR soi.item_description LIKE ? OR c.name LIKE ?)';
    const t = `%${search}%`; params.push(t, t, t);
  }
  const offset = (page - 1) * limit;

  // Planned & completed qty from production plans linked to this SO + article.
  const plannedSql = `
    COALESCE((
      SELECT SUM(pp.planned_qty) FROM production_plans pp
      WHERE pp.sales_order_id = so.id AND pp.deleted_at IS NULL
        AND pp.article COLLATE utf8mb4_unicode_ci = soi.item_description COLLATE utf8mb4_unicode_ci
    ), 0)`;
  const outputSql = `
    COALESCE((
      SELECT SUM(t.output_qty)
      FROM production_plans pp
      JOIN production_status_orders pso ON pso.production_plan_id = pp.id AND pso.deleted_at IS NULL
        AND pso.process_stage COLLATE utf8mb4_unicode_ci = (
          SELECT s2.stage_name FROM production_plan_stages s2 WHERE s2.plan_id = pp.id
          ORDER BY s2.seq DESC, s2.id DESC LIMIT 1)
      JOIN production_status_transactions t ON t.production_status_order_id = pso.id AND t.deleted_at IS NULL
      WHERE pp.sales_order_id = so.id AND pp.deleted_at IS NULL
        AND pp.article COLLATE utf8mb4_unicode_ci = soi.item_description COLLATE utf8mb4_unicode_ci
    ), 0)`;
  // WIP = sum of per-stage (input − output − rejection) across the plans linked
  // to this SO + article, each stage clamped at 0. Applies the WIP rule at the
  // stage level and aggregates (no dependency on stage sequence).
  const wipSql = `
    COALESCE((
      SELECT SUM(GREATEST(0, st.in_qty - st.out_qty - st.rej_qty))
      FROM (
        SELECT pso.process_stage,
          SUM(t.input_qty) AS in_qty, SUM(t.output_qty) AS out_qty, SUM(t.rejection_qty) AS rej_qty
        FROM production_plans pp
        JOIN production_status_orders pso ON pso.production_plan_id = pp.id AND pso.deleted_at IS NULL
        JOIN production_status_transactions t ON t.production_status_order_id = pso.id AND t.deleted_at IS NULL
        WHERE pp.sales_order_id = so.id AND pp.deleted_at IS NULL
          AND pp.article COLLATE utf8mb4_unicode_ci = soi.item_description COLLATE utf8mb4_unicode_ci
        GROUP BY pso.process_stage
      ) st
    ), 0)`;

  const baseFrom = `
     FROM sales_order_items soi
     JOIN sales_orders so ON soi.sales_order_id = so.id
     LEFT JOIN customers c ON so.customer_id = c.id
     WHERE ${where}`;

  const [rows] = await pool.query(
    `SELECT soi.id, so.order_no, c.name AS customer_name,
       soi.item_description AS article, soi.finish_color AS color, soi.uom,
       COALESCE(soi.quantity,0) AS order_qty,
       ${plannedSql} AS plan_qty,
       ${outputSql} AS output_qty,
       ${wipSql} AS wip_qty,
       GREATEST(0, COALESCE(soi.quantity,0) - ${outputSql}) AS order_balance,
       so.status
     ${baseFrom}
     ORDER BY so.order_date DESC, so.id DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total ${baseFrom}`, params);
  return { rows, total };
}

// ─── Filter options ──────────────────────────────────────────────────────────
export async function getSalesFilters() {
  const [customers] = await pool.query(
    `SELECT DISTINCT c.id, c.name FROM customers c
     JOIN sales_orders so ON so.customer_id = c.id ORDER BY c.name`
  );
  const [statuses] = await pool.query(
    `SELECT DISTINCT status AS name FROM sales_orders WHERE status IS NOT NULL AND status <> '' ORDER BY status`
  );
  return {
    customers: customers.map(c => ({ id: c.id, name: c.name })),
    statuses: statuses.map(s => s.name),
  };
}
