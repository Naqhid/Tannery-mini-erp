import pool from '../../config/db.js';

// Aggregate actual costs (material issues + general + machine) per production plan,
// joined to sales order info. Used across the stage-costing reports.
// stageWhere allows optional stage filtering.

// ─── WIP Cost Sheet ──────────────────────────────────────────────────────────
// Per plan+stage: input/output/wip qty with accumulated cost so far (WIP value).
export async function wipCostSheet({ stage, search, page = 1, limit = 10 }) {
  const params = [];
  let where = 'pp.deleted_at IS NULL';
  if (stage) { where += ' AND pso.process_stage = ?'; params.push(stage); }
  if (search) {
    where += ' AND (pp.plan_no LIKE ? OR pp.article LIKE ? OR so.order_no LIKE ?)';
    const t = `%${search}%`; params.push(t, t, t);
  }
  const offset = (page - 1) * limit;

  // Material cost issued for this plan+stage.
  const matCost = `
    COALESCE((
      SELECT SUM(mii.amount) FROM material_issues mi2
      JOIN material_issue_items mii ON mii.issue_id = mi2.id
      WHERE mi2.production_batch COLLATE utf8mb4_0900_ai_ci = pp.plan_no COLLATE utf8mb4_0900_ai_ci
        AND COALESCE(mi2.process_stage,'') COLLATE utf8mb4_0900_ai_ci = COALESCE(pso.process_stage,'') COLLATE utf8mb4_0900_ai_ci
    ), 0)`;
  const genCost = `
    COALESCE((SELECT SUM(gh.total_amount) FROM general_cost_headers gh WHERE gh.production_plan_id = pso.id), 0)`;
  const machCost = `
    COALESCE((SELECT SUM(mh.total_amount) FROM machine_cost_headers mh WHERE mh.production_plan_id = pso.id), 0)`;

  // WIP is derived (input - output), never the stored balance_qty which can go
  // stale when issued/completed qty change without a recalc.
  const wipExpr = `GREATEST(0, COALESCE(pso.issued_qty,0) - COALESCE(pso.completed_qty,0))`;

  const baseFrom = `
     FROM production_status_orders pso
     JOIN production_plans pp ON pso.production_plan_id = pp.id AND pp.deleted_at IS NULL
     LEFT JOIN sales_orders so ON pp.sales_order_id = so.id
     WHERE ${where} AND pso.deleted_at IS NULL AND ${wipExpr} > 0`;

  const [rows] = await pool.query(
    `SELECT pso.id, COALESCE(so.order_no, pp.plan_no) AS order_no, pp.plan_no,
       pso.process_stage AS stage, pso.article, pso.color, pso.uom,
       pso.issued_qty AS input_qty, pso.completed_qty AS output_qty, ${wipExpr} AS wip_qty,
       ${matCost} AS material_cost, ${genCost} AS general_cost, ${machCost} AS machine_cost,
       (${matCost} + ${genCost} + ${machCost}) AS total_cost,
       CASE WHEN pso.completed_qty > 0 THEN (${matCost} + ${genCost} + ${machCost}) / pso.completed_qty ELSE 0 END AS cost_per_pc
     ${baseFrom}
     ORDER BY pso.id DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total ${baseFrom}`, params);
  return { rows, total };
}

// ─── Full Order Cost Sheet ───────────────────────────────────────────────────
// Order-level rollup: total material/general/machine cost, output & cost/pc.
export async function fullOrderCostSheet({ customer, search, page = 1, limit = 10 }) {
  const params = [];
  let where = 'o.deleted_at IS NULL';
  if (customer) { where += ' AND o.customer_name = ?'; params.push(customer); }
  if (search) {
    where += ' AND (o.order_no LIKE ? OR o.article LIKE ? OR o.customer_name LIKE ?)';
    const t = `%${search}%`; params.push(t, t, t);
  }
  const offset = (page - 1) * limit;

  const matCost = `
    COALESCE((
      SELECT SUM(mii.amount) FROM material_issues mi2
      JOIN material_issue_items mii ON mii.issue_id = mi2.id
      WHERE mi2.production_batch COLLATE utf8mb4_0900_ai_ci = (
        SELECT pp.plan_no FROM production_plans pp WHERE pp.id = o.production_plan_id) COLLATE utf8mb4_0900_ai_ci
    ), 0)`;
  const genCost = `COALESCE((SELECT SUM(gh.total_amount) FROM general_cost_headers gh WHERE gh.production_plan_id = o.production_plan_id), 0)`;
  const machCost = `COALESCE((SELECT SUM(mh.total_amount) FROM machine_cost_headers mh WHERE mh.production_plan_id = o.production_plan_id), 0)`;

  // One row per order (group across stages) — use the order line.
  const baseFrom = `
     FROM (
       SELECT MIN(pso.id) AS id, pso.order_no, pso.customer_name, pso.article, pso.color, pso.uom,
              pso.production_plan_id, MAX(pso.completed_qty) AS completed_qty
       FROM production_status_orders pso
       WHERE pso.deleted_at IS NULL AND pso.production_plan_id IS NOT NULL
       GROUP BY pso.order_no, pso.article, pso.color, pso.production_plan_id, pso.customer_name, pso.uom
     ) o
     WHERE ${where}`;

  const [rows] = await pool.query(
    `SELECT o.id, o.order_no, o.customer_name, o.article, o.color, o.uom,
       o.completed_qty AS output_qty,
       ${matCost} AS material_cost, ${genCost} AS general_cost, ${machCost} AS machine_cost,
       (${matCost} + ${genCost} + ${machCost}) AS total_cost,
       CASE WHEN o.completed_qty > 0 THEN (${matCost} + ${genCost} + ${machCost}) / o.completed_qty ELSE 0 END AS cost_per_pc
     ${baseFrom}
     ORDER BY o.id DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [countRows] = await pool.query(`SELECT COUNT(*) AS c FROM (SELECT o.id ${baseFrom}) x`, params);
  const total = countRows[0]?.c || 0;
  return { rows, total };
}

// ─── Stage Cost Summary ──────────────────────────────────────────────────────
// Aggregated cost per process stage across all orders (with date filter on plan_date).
export async function stageCostSummary({ from_date, to_date, stage, search, page = 1, limit = 10 }) {
  const params = [];
  let where = 'pso.deleted_at IS NULL AND pp.deleted_at IS NULL';
  if (from_date) { where += ' AND pp.plan_date >= ?'; params.push(from_date); }
  if (to_date) { where += ' AND pp.plan_date <= ?'; params.push(to_date); }
  if (stage) { where += ' AND pso.process_stage = ?'; params.push(stage); }
  if (search) { where += ' AND pso.process_stage LIKE ?'; params.push(`%${search}%`); }
  const offset = (page - 1) * limit;

  const matCost = `
    COALESCE((
      SELECT SUM(mii.amount) FROM material_issues mi2
      JOIN material_issue_items mii ON mii.issue_id = mi2.id
      WHERE mi2.production_batch COLLATE utf8mb4_0900_ai_ci = pp.plan_no COLLATE utf8mb4_0900_ai_ci
        AND COALESCE(mi2.process_stage,'') COLLATE utf8mb4_0900_ai_ci = COALESCE(pso.process_stage,'') COLLATE utf8mb4_0900_ai_ci
    ), 0)`;
  const genCost = `COALESCE((SELECT SUM(gh.total_amount) FROM general_cost_headers gh WHERE gh.production_plan_id = pso.id), 0)`;
  const machCost = `COALESCE((SELECT SUM(mh.total_amount) FROM machine_cost_headers mh WHERE mh.production_plan_id = pso.id), 0)`;

  const baseFrom = `
     FROM production_status_orders pso
     JOIN production_plans pp ON pso.production_plan_id = pp.id
     WHERE ${where}`;

  const [rows] = await pool.query(
    `SELECT pso.process_stage AS stage,
       SUM(${matCost}) AS material_cost,
       SUM(${genCost}) AS general_cost,
       SUM(${machCost}) AS machine_cost,
       SUM(${matCost} + ${genCost} + ${machCost}) AS total_cost,
       SUM(pso.completed_qty) AS output_qty,
       CASE WHEN SUM(pso.completed_qty) > 0
         THEN SUM(${matCost} + ${genCost} + ${machCost}) / SUM(pso.completed_qty) ELSE 0 END AS cost_per_uom
     ${baseFrom}
     GROUP BY pso.process_stage
     ORDER BY total_cost DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS c FROM (SELECT pso.process_stage ${baseFrom} GROUP BY pso.process_stage) x`, params
  );
  const total = countRows[0]?.c || 0;
  return { rows, total };
}

// ─── Standard vs Actual Cost ─────────────────────────────────────────────────
// From standard_cost_sheets + items: cost component standard(bom) vs actual + variance.
export async function standardVsActual({ from_date, to_date, search, page = 1, limit = 10 }) {
  const params = [];
  let where = '1=1';
  if (from_date) { where += ' AND scs.created_at >= ?'; params.push(from_date); }
  if (to_date) { where += ' AND scs.created_at <= ?'; params.push(`${to_date} 23:59:59`); }
  if (search) {
    where += ' AND (scs.cost_sheet_no LIKE ? OR p.name LIKE ? OR m.name LIKE ?)';
    const t = `%${search}%`; params.push(t, t, t);
  }
  const offset = (page - 1) * limit;

  const baseFrom = `
     FROM standard_cost_items sci
     JOIN standard_cost_sheets scs ON sci.cost_sheet_id = scs.id
     LEFT JOIN products p ON scs.product_id = p.id
     LEFT JOIN materials m ON sci.cost_component_id = m.id
     LEFT JOIN group_master g ON sci.cost_component_group_id = g.id
     WHERE ${where}`;

  const [rows] = await pool.query(
    `SELECT sci.id, scs.cost_sheet_no, p.name AS product_name,
       COALESCE(g.name,'') AS cost_group,
       COALESCE(m.name, 'Component') AS cost_component,
       COALESCE(sci.bom_cost,0) AS standard_cost,
       COALESCE(sci.actual_cost,0) AS actual_cost,
       COALESCE(sci.variance, sci.bom_cost - sci.actual_cost, 0) AS variance,
       CASE WHEN COALESCE(sci.bom_cost,0) <> 0
         THEN ROUND((COALESCE(sci.bom_cost,0) - COALESCE(sci.actual_cost,0)) / sci.bom_cost * 100, 2)
         ELSE 0 END AS variance_percent
     ${baseFrom}
     ORDER BY scs.id DESC, sci.id ASC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total ${baseFrom}`, params);
  const [[totals]] = await pool.query(
    `SELECT COALESCE(SUM(sci.bom_cost),0) AS total_standard,
       COALESCE(SUM(sci.actual_cost),0) AS total_actual,
       COALESCE(SUM(COALESCE(sci.variance, sci.bom_cost - sci.actual_cost)),0) AS total_variance ${baseFrom}`, params
  );
  return { rows, total, totals };
}

// ─── Filter options ──────────────────────────────────────────────────────────
export async function getCostingFilters() {
  const [customers] = await pool.query(
    `SELECT DISTINCT customer_name AS name FROM production_status_orders
     WHERE deleted_at IS NULL AND customer_name IS NOT NULL AND customer_name <> '' ORDER BY customer_name`
  );
  const [stages] = await pool.query(
    `SELECT DISTINCT process_stage AS name FROM production_status_orders
     WHERE deleted_at IS NULL AND process_stage IS NOT NULL AND process_stage <> '' ORDER BY process_stage`
  );
  return {
    customers: customers.map(c => c.name),
    stages: stages.map(s => s.name),
  };
}
