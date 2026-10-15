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
       CASE WHEN ${outputQty} > 0 THEN ${totalCostExpr} / ${outputQty} ELSE 0 END AS cost_per_pc,
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
  // Stages from production_plan_stages, production_status_orders and material_issues
  // so every stage used anywhere in costing is selectable. Collations are
  // normalised across the UNION branches to avoid "illegal mix of collations".
  const [stages] = await pool.query(
    `SELECT DISTINCT name FROM (
       SELECT stage_name COLLATE utf8mb4_0900_ai_ci AS name FROM production_plan_stages
        WHERE stage_name IS NOT NULL AND stage_name <> ''
       UNION
       SELECT process_stage COLLATE utf8mb4_0900_ai_ci AS name FROM production_status_orders
        WHERE deleted_at IS NULL AND process_stage IS NOT NULL AND process_stage <> ''
       UNION
       SELECT process_stage COLLATE utf8mb4_0900_ai_ci AS name FROM material_issues
        WHERE process_stage IS NOT NULL AND process_stage <> ''
     ) t
     ORDER BY name`
  );
  return {
    customers: customers.map(c => c.name),
    stages: stages.map(s => s.name),
  };
}

// ─── WIP Cost Summary (Order-wise & Stage-wise) ──────────────────────────────
// One row per sales order + process stage. Mirrors the "ORDER-WISE & STAGE-WISE
// WIP COST SUMMARY" sheet. For each (sales order, stage):
//   WIP Qty          = Σ stage WIP across all production plans of the order
//                      (planned_qty − output_qty, floored at 0 per plan+stage)
//   Material WIP Cost = (Σ issue amount / Σ issue qty) for the order+stage × WIP qty
//                      i.e. unit material issue cost × WIP qty
//   General WIP Cost = (Σ general_cost_items.cost_per_uom for order+stage) × WIP qty
//   Machine WIP Cost = (Σ machine_cost_items.cost_per_uom for order+stage) × WIP qty
//   Total WIP Cost   = Material + General + Machine
// Only stages that still carry WIP (> 0) are returned.
const CO = 'COLLATE utf8mb4_0900_ai_ci';

export async function wipCostSummary({ stage, search, page = 1, limit = 10 }) {
  const params = [];
  let where = 'pp.deleted_at IS NULL';
  if (stage) { where += ` AND s.stage_name ${CO} = ? ${CO}`; params.push(stage); }
  if (search) {
    where += ` AND (so.order_no LIKE ? OR pp.article LIKE ? OR c.name LIKE ? OR s.stage_name LIKE ?)`;
    const t = `%${search}%`; params.push(t, t, t, t);
  }
  const offset = (page - 1) * limit;

  // Step 1 — grouped base: one row per sales order + stage with the summed WIP
  // qty (per plan+stage WIP floored at 0, summed across all plans of the order).
  // Collation-normalised order_no / stage keys are carried out so the cost
  // sub-queries in step 2 can correlate against them deterministically.
  const grouped = `
     SELECT
        COALESCE(MIN(so.order_no), MIN(pp.plan_no)) AS order_no,
        COALESCE(MIN(c.name), '—') AS customer_name,
        MIN(pp.article) AS article,
        MIN(pp.color) AS color,
        s.stage_name AS process_stage,
        -- Order stages by the company-wide production sequence defined in the
        -- master process_stages table (Wet End -> Measurement -> Finishing ->
        -- Packing), falling back to the plan's own stage seq only when the
        -- stage is not in the master. This keeps every order's stages in the
        -- same canonical order regardless of how each plan was created.
        MIN(COALESCE(
          (SELECT ps.seq FROM process_stages ps
            WHERE ps.name ${CO} = s.stage_name ${CO}
            ORDER BY (ps.status='Active') DESC, ps.id ASC LIMIT 1),
          s.seq,
          999999
        )) AS stage_seq,
        SUM(GREATEST(0, COALESCE(s.planned_qty,0) - COALESCE(s.output_qty,0))) AS wip_qty
     FROM production_plan_stages s
     JOIN production_plans pp ON s.plan_id = pp.id AND pp.deleted_at IS NULL
     LEFT JOIN sales_orders so ON pp.sales_order_id = so.id
     LEFT JOIN customers c ON so.customer_id = c.id
     WHERE ${where}
     GROUP BY COALESCE(so.order_no, pp.plan_no), s.stage_name
     HAVING wip_qty > 0`;

  // Step 2 — attach the per-UOM / per-piece unit costs for each order+stage.
  // Unit material issue cost = Σ issue amount / Σ issue qty for the order+stage.
  const matUnitCost = `
    COALESCE((
      SELECT CASE WHEN SUM(mii.issue_qty) > 0
                  THEN SUM(mii.amount) / SUM(mii.issue_qty) ELSE 0 END
      FROM material_issues mi2
      JOIN material_issue_items mii ON mii.issue_id = mi2.id
      JOIN production_plans pp2 ON mi2.production_batch ${CO} = pp2.plan_no ${CO}
      LEFT JOIN sales_orders so2 ON pp2.sales_order_id = so2.id
      WHERE COALESCE(so2.order_no, pp2.plan_no) ${CO} = g.order_no ${CO}
        AND COALESCE(mi2.process_stage,'') ${CO} = g.process_stage ${CO}
    ), 0)`;
  // Σ cost_per_uom from general cost entries recorded for the order+stage.
  const genUnitCost = `
    COALESCE((
      SELECT SUM(gci.cost_per_uom)
      FROM general_cost_headers gch
      JOIN general_cost_items gci ON gci.general_cost_id = gch.id
      JOIN production_status_orders pso2 ON gch.production_plan_id = pso2.id
      JOIN production_plans pp2 ON pso2.production_plan_id = pp2.id
      LEFT JOIN sales_orders so2 ON pp2.sales_order_id = so2.id
      WHERE COALESCE(so2.order_no, pp2.plan_no) ${CO} = g.order_no ${CO}
        AND COALESCE(gch.process_stage,'') ${CO} = g.process_stage ${CO}
    ), 0)`;
  // Σ cost_per_uom from machine cost entries recorded for the order+stage.
  const machUnitCost = `
    COALESCE((
      SELECT SUM(mci.cost_per_uom)
      FROM machine_cost_headers mch
      JOIN machine_cost_items mci ON mci.machine_cost_id = mch.id
      JOIN production_status_orders pso3 ON mch.production_plan_id = pso3.id
      JOIN production_plans pp3 ON pso3.production_plan_id = pp3.id
      LEFT JOIN sales_orders so3 ON pp3.sales_order_id = so3.id
      WHERE COALESCE(so3.order_no, pp3.plan_no) ${CO} = g.order_no ${CO}
        AND COALESCE(mch.process_stage,'') ${CO} = g.process_stage ${CO}
    ), 0)`;

  const [rows] = await pool.query(
    `SELECT
        g.order_no, g.customer_name, g.article, g.color, g.process_stage,
        g.stage_seq, g.wip_qty,
        g.wip_qty * (${matUnitCost})  AS material_wip_cost,
        g.wip_qty * (${genUnitCost})  AS general_wip_cost,
        g.wip_qty * (${machUnitCost}) AS machine_wip_cost,
        g.wip_qty * ((${matUnitCost}) + (${genUnitCost}) + (${machUnitCost})) AS total_wip_cost
     FROM ( ${grouped} ) g
     ORDER BY g.order_no ASC, g.stage_seq ASC`,
    params
  );

  const total = rows.length;
  const paged = rows.slice(offset, offset + Number(limit));
  const totals = rows.reduce((a, r) => ({
    wip_qty: a.wip_qty + Number(r.wip_qty || 0),
    material_wip_cost: a.material_wip_cost + Number(r.material_wip_cost || 0),
    general_wip_cost: a.general_wip_cost + Number(r.general_wip_cost || 0),
    machine_wip_cost: a.machine_wip_cost + Number(r.machine_wip_cost || 0),
    total_wip_cost: a.total_wip_cost + Number(r.total_wip_cost || 0),
  }), { wip_qty: 0, material_wip_cost: 0, general_wip_cost: 0, machine_wip_cost: 0, total_wip_cost: 0 });

  return { rows: paged, total, totals };
}
