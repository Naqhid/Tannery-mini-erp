import pool from '../../config/db.js';

// Measurement (last-by-seq) stage cumulative Daily Production output for a plan.
const measurementOutputSql = (planCol) => `
  COALESCE((
    SELECT SUM(t.output_qty)
    FROM production_status_orders pso
    JOIN production_status_transactions t
      ON t.production_status_order_id = pso.id AND t.deleted_at IS NULL
    WHERE pso.production_plan_id = ${planCol} AND pso.deleted_at IS NULL
      AND pso.process_stage COLLATE utf8mb4_unicode_ci = (
        SELECT s2.stage_name FROM production_plan_stages s2
        WHERE s2.plan_id = ${planCol}
        ORDER BY s2.seq DESC, s2.id DESC LIMIT 1
      )
  ), 0)`;

// Plan-level WIP = sum of per-stage WIP, where each stage's WIP is
// (input − output − rejection). Negative values indicate data errors
// (output exceeds input) and are shown to flag issues.
const planWipSql = (planCol) => `
  COALESCE((
    SELECT SUM(stage_totals.in_qty - stage_totals.out_qty - stage_totals.rej_qty)
    FROM (
      SELECT pso.process_stage,
        SUM(t.input_qty) AS in_qty,
        SUM(t.output_qty) AS out_qty,
        SUM(t.rejection_qty) AS rej_qty
      FROM production_status_orders pso
      JOIN production_status_transactions t
        ON t.production_status_order_id = pso.id AND t.deleted_at IS NULL
      WHERE pso.production_plan_id = ${planCol} AND pso.deleted_at IS NULL
      GROUP BY pso.process_stage
    ) stage_totals
  ), 0)`;

// ─── Production Plan Summary ─────────────────────────────────────────────────
export async function planSummary({ from_date, to_date, customer_id, status, search, page = 1, limit = 10, sortBy, sortOrder }) {
  const params = [];
  let where = 'pp.deleted_at IS NULL';
  if (from_date) { where += ' AND pp.plan_date >= ?'; params.push(from_date); }
  if (to_date) { where += ' AND pp.plan_date <= ?'; params.push(to_date); }
  if (customer_id) { where += ' AND pp.customer_id = ?'; params.push(customer_id); }
  if (search) {
    where += ' AND (pp.plan_no LIKE ? OR c.name LIKE ? OR pp.article LIKE ? OR so.order_no LIKE ?)';
    const t = `%${search}%`; params.push(t, t, t, t);
  }

  const mOut = measurementOutputSql('pp.id');
  const mWip = planWipSql('pp.id');
  const statusExpr = `CASE
      WHEN (SELECT COUNT(*) FROM production_plan_stages s0 WHERE s0.plan_id = pp.id) = 0 THEN 'Planned'
      WHEN ${mOut} >= COALESCE(pp.planned_qty,0) AND COALESCE(pp.planned_qty,0) > 0 THEN 'Completed'
      WHEN ${mOut} > 0 THEN 'In Progress'
      ELSE 'Planned' END`;

  const ord = sortOrder === 'asc' ? 'ASC' : 'DESC';
  // Sort against the wrapped subquery's aliased columns (all prefixed with t.).
  const allowed = { plan_no: 't.plan_no', plan_date: 't.plan_date', customer_name: 't.customer_name', article: 't.article', planned_qty: 't.planned_qty', output_qty: 't.output_qty' };
  const orderClause = allowed[sortBy] ? `${allowed[sortBy]} ${ord}` : 't.plan_date DESC, t.id DESC';
  const offset = (page - 1) * limit;

  const selectSql = `
     SELECT pp.id, pp.plan_no, pp.plan_date, c.name AS customer_name, so.order_no AS sales_order_no,
       pp.article, pp.color, COALESCE(pp.planned_qty,0) AS planned_qty, pp.uom,
       ${mOut} AS output_qty,
       ${mWip} AS wip_qty,
       GREATEST(0, COALESCE(pp.planned_qty,0) - ${mOut}) AS balance_qty,
       ${statusExpr} AS status_val
     FROM production_plans pp
     LEFT JOIN customers c ON pp.customer_id = c.id
     LEFT JOIN sales_orders so ON pp.sales_order_id = so.id
     WHERE ${where}`;

  const rowsSql = `SELECT * FROM (${selectSql}) t ${status ? 'WHERE t.status_val = ?' : ''} ORDER BY ${orderClause} LIMIT ? OFFSET ?`;
  const rowParams = status ? [...params, status, Number(limit), Number(offset)] : [...params, Number(limit), Number(offset)];
  const [rows] = await pool.query(rowsSql, rowParams);

  const countSql = `SELECT COUNT(*) AS total FROM (${selectSql}) t ${status ? 'WHERE t.status_val = ?' : ''}`;
  const [[{ total }]] = await pool.query(countSql, status ? [...params, status] : params);

  return { rows, total };
}

// ─── Plan vs Actual Output ───────────────────────────────────────────────────
export async function planVsActual({ from_date, to_date, customer_id, search, page = 1, limit = 10 }) {
  const params = [];
  let where = 'pp.deleted_at IS NULL';
  if (from_date) { where += ' AND pp.plan_date >= ?'; params.push(from_date); }
  if (to_date) { where += ' AND pp.plan_date <= ?'; params.push(to_date); }
  if (customer_id) { where += ' AND pp.customer_id = ?'; params.push(customer_id); }
  if (search) {
    where += ' AND (pp.plan_no LIKE ? OR pp.article LIKE ? OR c.name LIKE ?)';
    const t = `%${search}%`; params.push(t, t, t);
  }
  const mOut = measurementOutputSql('pp.id');
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT pp.id, pp.plan_no, pp.plan_date, c.name AS customer_name, pp.article, pp.color, pp.uom,
       COALESCE(pp.planned_qty,0) AS planned_qty,
       ${mOut} AS actual_output,
       (COALESCE(pp.planned_qty,0) - ${mOut}) AS variance,
       CASE WHEN COALESCE(pp.planned_qty,0) > 0
         THEN ROUND((${mOut}) / pp.planned_qty * 100, 2) ELSE 0 END AS variance_percent
     FROM production_plans pp
     LEFT JOIN customers c ON pp.customer_id = c.id
     WHERE ${where}
     ORDER BY pp.plan_date DESC, pp.id DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM production_plans pp LEFT JOIN customers c ON pp.customer_id=c.id WHERE ${where}`, params
  );
  return { rows, total };
}

// ─── Production Plan Status ──────────────────────────────────────────────────
// Stage-wise completion for each plan.
export async function planStatus({ from_date, to_date, stage, search, page = 1, limit = 10 }) {
  const params = [];
  let where = 'pp.deleted_at IS NULL';
  if (from_date) { where += ' AND pp.plan_date >= ?'; params.push(from_date); }
  if (to_date) { where += ' AND pp.plan_date <= ?'; params.push(to_date); }
  if (stage) { where += ' AND s.stage_name = ?'; params.push(stage); }
  if (search) {
    where += ' AND (pp.plan_no LIKE ? OR pp.article LIKE ?)';
    const t = `%${search}%`; params.push(t, t);
  }
  const offset = (page - 1) * limit;

  const stageOutput = `
    COALESCE((
      SELECT SUM(t.output_qty) FROM production_status_orders pso
      JOIN production_status_transactions t ON t.production_status_order_id = pso.id AND t.deleted_at IS NULL
      WHERE pso.production_plan_id = pp.id AND pso.deleted_at IS NULL
        AND pso.process_stage COLLATE utf8mb4_unicode_ci = s.stage_name COLLATE utf8mb4_unicode_ci
    ), 0)`;
  const stageInput = `
    COALESCE((
      SELECT SUM(t.input_qty) FROM production_status_orders pso
      JOIN production_status_transactions t ON t.production_status_order_id = pso.id AND t.deleted_at IS NULL
      WHERE pso.production_plan_id = pp.id AND pso.deleted_at IS NULL
        AND pso.process_stage COLLATE utf8mb4_unicode_ci = s.stage_name COLLATE utf8mb4_unicode_ci
    ), 0)`;
  const stageRej = `
    COALESCE((
      SELECT SUM(t.rejection_qty) FROM production_status_orders pso
      JOIN production_status_transactions t ON t.production_status_order_id = pso.id AND t.deleted_at IS NULL
      WHERE pso.production_plan_id = pp.id AND pso.deleted_at IS NULL
        AND pso.process_stage COLLATE utf8mb4_unicode_ci = s.stage_name COLLATE utf8mb4_unicode_ci
    ), 0)`;

  const baseFrom = `
     FROM production_plan_stages s
     JOIN production_plans pp ON s.plan_id = pp.id
     WHERE ${where}`;

  const [rows] = await pool.query(
    `SELECT s.id, pp.plan_no, pp.plan_date, pp.article, pp.color, s.seq, s.stage_name,
       COALESCE(s.planned_qty,0) AS plan_qty, ${stageOutput} AS output_qty,
       (${stageInput} - ${stageOutput} - ${stageRej}) AS wip_qty,
       CASE WHEN COALESCE(s.planned_qty,0) > 0 THEN ROUND(${stageOutput}/s.planned_qty*100,2) ELSE 0 END AS completion_percent,
       CASE
         WHEN COALESCE(s.planned_qty,0) > 0 AND ${stageOutput} >= s.planned_qty THEN 'Completed'
         WHEN ${stageOutput} > 0 THEN 'In Progress'
         ELSE 'Pending' END AS status
     ${baseFrom}
     ORDER BY pp.plan_date DESC, pp.id DESC, s.seq ASC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total ${baseFrom}`, params);
  return { rows, total };
}

// ─── Order Production Plan ───────────────────────────────────────────────────
// Sales-order-linked production plans.
export async function orderProductionPlan({ from_date, to_date, customer_id, search, page = 1, limit = 10 }) {
  const params = [];
  let where = 'pp.deleted_at IS NULL AND pp.sales_order_id IS NOT NULL';
  if (from_date) { where += ' AND pp.plan_date >= ?'; params.push(from_date); }
  if (to_date) { where += ' AND pp.plan_date <= ?'; params.push(to_date); }
  if (customer_id) { where += ' AND pp.customer_id = ?'; params.push(customer_id); }
  if (search) {
    where += ' AND (so.order_no LIKE ? OR pp.plan_no LIKE ? OR pp.article LIKE ? OR c.name LIKE ?)';
    const t = `%${search}%`; params.push(t, t, t, t);
  }
  const mOut = measurementOutputSql('pp.id');
  const mWip = planWipSql('pp.id');
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT pp.id, so.order_no AS sales_order_no, pp.plan_no, pp.plan_date,
       c.name AS customer_name, pp.article, pp.color, pp.uom,
       COALESCE(pp.planned_qty,0) AS plan_qty,
       ${mOut} AS output_qty,
       ${mWip} AS wip_qty,
       pp.status
     FROM production_plans pp
     LEFT JOIN customers c ON pp.customer_id = c.id
     LEFT JOIN sales_orders so ON pp.sales_order_id = so.id
     WHERE ${where}
     ORDER BY pp.plan_date DESC, pp.id DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM production_plans pp
     LEFT JOIN customers c ON pp.customer_id=c.id
     LEFT JOIN sales_orders so ON pp.sales_order_id=so.id WHERE ${where}`, params
  );
  return { rows, total };
}

// ─── Daily Production Output ─────────────────────────────────────────────────
export async function dailyProductionOutput({ from_date, to_date, stage, search, page = 1, limit = 10 }) {
  const params = [];
  let where = 't.deleted_at IS NULL AND pso.deleted_at IS NULL';
  if (from_date) { where += ' AND t.production_date >= ?'; params.push(from_date); }
  if (to_date) { where += ' AND t.production_date <= ?'; params.push(to_date); }
  if (stage) { where += ' AND pso.process_stage = ?'; params.push(stage); }
  if (search) {
    where += ' AND (t.transaction_no LIKE ? OR pso.order_no LIKE ? OR pso.article LIKE ?)';
    const t2 = `%${search}%`; params.push(t2, t2, t2);
  }
  const offset = (page - 1) * limit;

  const baseFrom = `
     FROM production_status_transactions t
     JOIN production_status_orders pso ON t.production_status_order_id = pso.id
     WHERE ${where}`;

  const [rows] = await pool.query(
    `SELECT t.id, t.production_date, t.transaction_no, pso.order_no AS plan_no,
       pso.process_stage, pso.article, pso.color, t.uom,
       t.input_qty, t.output_qty, t.rejection_qty,
       (COALESCE(t.input_qty,0) - COALESCE(t.output_qty,0) - COALESCE(t.rejection_qty,0)) AS wip_qty
     ${baseFrom}
     ORDER BY t.production_date DESC, t.id DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total ${baseFrom}`, params);
  const [[totals]] = await pool.query(
    `SELECT COALESCE(SUM(t.input_qty),0) AS total_input, COALESCE(SUM(t.output_qty),0) AS total_output,
       COALESCE(SUM(t.rejection_qty),0) AS total_rejection ${baseFrom}`, params
  );
  return { rows, total, totals };
}

// ─── Stage-wise Production Report ────────────────────────────────────────────
export async function stageWiseProduction({ from_date, to_date, stage, search, page = 1, limit = 10 }) {
  const params = [];
  let where = 't.deleted_at IS NULL AND pso.deleted_at IS NULL';
  if (from_date) { where += ' AND t.production_date >= ?'; params.push(from_date); }
  if (to_date) { where += ' AND t.production_date <= ?'; params.push(to_date); }
  if (stage) { where += ' AND pso.process_stage = ?'; params.push(stage); }
  if (search) { where += ' AND pso.article LIKE ?'; params.push(`%${search}%`); }
  const offset = (page - 1) * limit;

  const baseFrom = `
     FROM production_status_transactions t
     JOIN production_status_orders pso ON t.production_status_order_id = pso.id
     WHERE ${where}
     GROUP BY pso.process_stage`;

  const [rows] = await pool.query(
    `SELECT pso.process_stage AS stage_name,
       COALESCE(SUM(t.input_qty),0) AS input_qty,
       COALESCE(SUM(t.output_qty),0) AS output_qty,
       COALESCE(SUM(t.rejection_qty),0) AS rejection_qty,
       (COALESCE(SUM(t.input_qty),0) - COALESCE(SUM(t.output_qty),0) - COALESCE(SUM(t.rejection_qty),0)) AS wip_qty,
       CASE WHEN SUM(t.input_qty) > 0 THEN ROUND(SUM(t.output_qty)/SUM(t.input_qty)*100,2) ELSE 0 END AS output_percent
     ${baseFrom}
     ORDER BY output_qty DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS c FROM (SELECT pso.process_stage
       FROM production_status_transactions t
       JOIN production_status_orders pso ON t.production_status_order_id = pso.id
       WHERE ${where} GROUP BY pso.process_stage) x`, params
  );
  const total = countRows[0]?.c || 0;
  return { rows, total };
}

// ─── Production WIP Report ───────────────────────────────────────────────────
// As-on WIP per plan+stage: input − output (qty that entered the stage but has
// not yet come out as finished/output).
export async function productionWip({ stage, search, page = 1, limit = 10 }) {
  const params = [];
  let where = 'pp.deleted_at IS NULL';
  if (stage) { where += ' AND s.stage_name = ?'; params.push(stage); }
  if (search) {
    where += ' AND (pp.plan_no LIKE ? OR pp.article LIKE ? OR so.order_no LIKE ?)';
    const t = `%${search}%`; params.push(t, t, t);
  }
  const offset = (page - 1) * limit;

  const stageOutput = `
    COALESCE((
      SELECT SUM(t.output_qty) FROM production_status_orders pso
      JOIN production_status_transactions t ON t.production_status_order_id = pso.id AND t.deleted_at IS NULL
      WHERE pso.production_plan_id = pp.id AND pso.deleted_at IS NULL
        AND pso.process_stage COLLATE utf8mb4_unicode_ci = s.stage_name COLLATE utf8mb4_unicode_ci
    ), 0)`;
  const stageInput = `
    COALESCE((
      SELECT SUM(t.input_qty) FROM production_status_orders pso
      JOIN production_status_transactions t ON t.production_status_order_id = pso.id AND t.deleted_at IS NULL
      WHERE pso.production_plan_id = pp.id AND pso.deleted_at IS NULL
        AND pso.process_stage COLLATE utf8mb4_unicode_ci = s.stage_name COLLATE utf8mb4_unicode_ci
    ), 0)`;
  const stageRej = `
    COALESCE((
      SELECT SUM(t.rejection_qty) FROM production_status_orders pso
      JOIN production_status_transactions t ON t.production_status_order_id = pso.id AND t.deleted_at IS NULL
      WHERE pso.production_plan_id = pp.id AND pso.deleted_at IS NULL
        AND pso.process_stage COLLATE utf8mb4_unicode_ci = s.stage_name COLLATE utf8mb4_unicode_ci
    ), 0)`;

  // WIP = input − output − rejection for the stage. Negative values flag data errors.
  const wipExpr = `(${stageInput} - ${stageOutput} - ${stageRej})`;

  const baseFrom = `
     FROM production_plan_stages s
     JOIN production_plans pp ON s.plan_id = pp.id
     LEFT JOIN sales_orders so ON pp.sales_order_id = so.id
     WHERE ${where} AND ${wipExpr} > 0`;

  const [rows] = await pool.query(
    `SELECT s.id, so.order_no AS sales_order_no, pp.plan_no, s.stage_name AS stage, pp.article, pp.color, pp.uom,
       ${stageInput} AS input_qty, ${stageOutput} AS output_qty, ${stageRej} AS rejection_qty,
       COALESCE(s.planned_qty,0) AS plan_qty,
       ${wipExpr} AS wip_qty
     ${baseFrom}
     ORDER BY pp.plan_date DESC, s.seq ASC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total ${baseFrom}`, params);
  return { rows, total };
}

// ─── Filter options ──────────────────────────────────────────────────────────
export async function getProductionFilters() {
  const [customers] = await pool.query(
    `SELECT DISTINCT c.id, c.name FROM customers c
     JOIN production_plans pp ON pp.customer_id = c.id AND pp.deleted_at IS NULL ORDER BY c.name`
  );
  const [stages] = await pool.query(
    `SELECT DISTINCT stage_name AS name FROM production_plan_stages
     WHERE stage_name IS NOT NULL AND stage_name <> '' ORDER BY stage_name`
  );
  return {
    customers: customers.map(c => ({ id: c.id, name: c.name })),
    stages: stages.map(s => s.name),
    statuses: ['Planned', 'In Progress', 'Completed'],
  };
}
