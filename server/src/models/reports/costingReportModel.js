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

  // Rejection qty for this stage from Daily Production transactions.
  const rejExpr = `
    COALESCE((
      SELECT SUM(t.rejection_qty) FROM production_status_transactions t
      WHERE t.production_status_order_id = pso.id AND t.deleted_at IS NULL
    ), 0)`;
  // WIP is derived (input − output − rejection), never the stored balance_qty
  // which can go stale when issued/completed qty change without a recalc.
  // Negative values flag data errors (output exceeds input).
  const wipExpr = `(COALESCE(pso.issued_qty,0) - COALESCE(pso.completed_qty,0) - ${rejExpr})`;

  // Output qty of the MEASUREMENT stage for the same production plan. This is the
  // finished sq.ft used as the denominator for cost/sq.ft across all stages.
  const measurementOutput = `
    COALESCE((
      SELECT SUM(pso_m.completed_qty) FROM production_status_orders pso_m
      WHERE pso_m.production_plan_id = pp.id AND pso_m.deleted_at IS NULL
        AND pso_m.process_stage COLLATE utf8mb4_0900_ai_ci = 'Measurement'
    ), 0)`;

  // Selling price (rate) from the sales order line matching this article.
  // Only meaningful at the Measurement stage — other stages show 0.
  const sellingPrice = `
    COALESCE((
      SELECT AVG(soi.unit_price) FROM sales_order_items soi
      WHERE soi.sales_order_id = so.id
        AND soi.item_description COLLATE utf8mb4_0900_ai_ci = pso.article COLLATE utf8mb4_0900_ai_ci
    ), 0)`;

  const totalCostExpr = `(${matCost} + ${genCost} + ${machCost})`;

  // Only In Progress stages: production has started (output > 0) AND WIP remains
  // (input != output). Show both positive and negative WIP to flag data errors.
  const baseFrom = `
     FROM production_status_orders pso
     JOIN production_plans pp ON pso.production_plan_id = pp.id AND pp.deleted_at IS NULL
     LEFT JOIN sales_orders so ON pp.sales_order_id = so.id
     WHERE ${where} AND pso.deleted_at IS NULL
       AND COALESCE(pso.completed_qty,0) > 0 AND ${wipExpr} <> 0`;

  const [rows] = await pool.query(
    `SELECT pso.id, COALESCE(so.order_no, pp.plan_no) AS order_no, pp.plan_no,
       pso.process_stage AS stage, pso.article, pso.color, pso.uom,
       pso.issued_qty AS input_qty, pso.completed_qty AS output_qty, ${wipExpr} AS wip_qty,
       ${rejExpr} AS rejection_qty,
       ${matCost} AS material_cost, ${genCost} AS general_cost, ${machCost} AS machine_cost,
       ${totalCostExpr} AS total_cost,
       CASE WHEN pso.completed_qty > 0 THEN ${totalCostExpr} / pso.completed_qty ELSE 0 END AS cost_per_pc,
       -- Selling price only applies at the Measurement stage.
       CASE WHEN pso.process_stage COLLATE utf8mb4_0900_ai_ci = 'Measurement' THEN ${sellingPrice} ELSE 0 END AS selling_price,
       -- Cost per sq.ft = total cost / measurement-stage output (finished sqft).
       CASE WHEN ${measurementOutput} > 0 THEN ${totalCostExpr} / ${measurementOutput} ELSE 0 END AS cost_per_sqft,
       -- Variance = selling price − cost/sqft (only meaningful at Measurement).
       CASE WHEN pso.process_stage COLLATE utf8mb4_0900_ai_ci = 'Measurement'
            THEN ${sellingPrice} - (CASE WHEN ${measurementOutput} > 0 THEN ${totalCostExpr} / ${measurementOutput} ELSE 0 END)
            ELSE 0 END AS variance
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
  let where = '1=1';
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
// One row per production order (across all its stages). Shows customer, order no,
// order qty, output qty, total cost, cost/sqft, selling price and variance.
// Cost/sqft = total cost / finished (measurement-stage) output.
export async function stageCostSummary({ from_date, to_date, stage, search, page = 1, limit = 10 }) {
  const params = [];
  let where = 'pp.deleted_at IS NULL';
  if (from_date) { where += ' AND pp.plan_date >= ?'; params.push(from_date); }
  if (to_date) { where += ' AND pp.plan_date <= ?'; params.push(to_date); }
  if (search) {
    where += ' AND (pp.plan_no LIKE ? OR pp.article LIKE ? OR so.order_no LIKE ? OR so.customer_id IN (SELECT id FROM customers WHERE name LIKE ?))';
    const t = `%${search}%`; params.push(t, t, t, t);
  }
  const offset = (page - 1) * limit;

  // Total material cost issued for the whole plan (all stages).
  const matCost = `
    COALESCE((
      SELECT SUM(mii.amount) FROM material_issues mi2
      JOIN material_issue_items mii ON mii.issue_id = mi2.id
      WHERE mi2.production_batch COLLATE utf8mb4_0900_ai_ci = pp.plan_no COLLATE utf8mb4_0900_ai_ci
    ), 0)`;
  // General + machine cost across all stage orders of the plan.
  const genCost = `
    COALESCE((
      SELECT SUM(gh.total_amount) FROM general_cost_headers gh
      JOIN production_status_orders pso2 ON gh.production_plan_id = pso2.id
      WHERE pso2.production_plan_id = pp.id AND pso2.deleted_at IS NULL
    ), 0)`;
  const machCost = `
    COALESCE((
      SELECT SUM(mh.total_amount) FROM machine_cost_headers mh
      JOIN production_status_orders pso3 ON mh.production_plan_id = pso3.id
      WHERE pso3.production_plan_id = pp.id AND pso3.deleted_at IS NULL
    ), 0)`;

  // Finished output = Measurement-stage completed qty (sqft) for the plan.
  const outputQty = `
    COALESCE((
      SELECT SUM(pso_m.completed_qty) FROM production_status_orders pso_m
      WHERE pso_m.production_plan_id = pp.id AND pso_m.deleted_at IS NULL
        AND pso_m.process_stage COLLATE utf8mb4_0900_ai_ci = 'Measurement'
    ), 0)`;

  // Selling price from the matching sales order line for the plan article.
  const sellingPrice = `
    COALESCE((
      SELECT AVG(soi.unit_price) FROM sales_order_items soi
      WHERE soi.sales_order_id = so.id
        AND soi.item_description COLLATE utf8mb4_0900_ai_ci = pp.article COLLATE utf8mb4_0900_ai_ci
    ), 0)`;

  const totalCostExpr = `(${matCost} + ${genCost} + ${machCost})`;
  const costPerSqftExpr = `CASE WHEN ${outputQty} > 0 THEN ${totalCostExpr} / ${outputQty} ELSE 0 END`;

  const baseFrom = `
     FROM production_plans pp
     LEFT JOIN sales_orders so ON pp.sales_order_id = so.id
     LEFT JOIN customers c ON so.customer_id = c.id
     WHERE ${where}`;

  const [rows] = await pool.query(
    `SELECT pp.id AS plan_id, pp.plan_no,
       COALESCE(so.order_no, pp.plan_no) AS order_no,
       COALESCE(c.name, '—') AS customer_name,
       pp.article, pp.color,
       COALESCE(pp.order_qty, pp.planned_qty, 0) AS order_qty,
       ${outputQty} AS output_qty,
       ${totalCostExpr} AS total_cost,
       ${costPerSqftExpr} AS cost_per_sqft,
       ${sellingPrice} AS selling_price,
       (${sellingPrice} - (${costPerSqftExpr})) AS variance
     ${baseFrom}
     ORDER BY pp.id DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS c FROM (SELECT pp.id ${baseFrom}) x`, params
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
