import pool from '../config/db.js';

// ─── Material Transfer Note (Production Plan → BOM norms × Planned Qty) ───────
// Lists production plans so the user can pick one and prepare its material
// transfer note. The transfer details are derived live from the plan's product
// BOM (norm per piece), the plan's planned quantity, and any material issues
// already recorded against the plan.

const ALLOWED_SORT = ['plan_no', 'plan_date', 'planned_qty', 'status'];

// Aggregate the plan's process-stage names (ordered by sequence) for display.
// Both name sources are coerced to a common collation so a row with an empty
// stage_name (falling back to process_stages.name) never triggers an
// "Illegal mix of collations" error.
const STAGE_NAME_EXPR = `COALESCE(
  NULLIF(TRIM(CONVERT(pps.stage_name USING utf8mb4)) COLLATE utf8mb4_unicode_ci, ''),
  CONVERT(ps.name USING utf8mb4) COLLATE utf8mb4_unicode_ci
)`;

const STAGE_NAMES_SQL = `
  COALESCE((
    SELECT GROUP_CONCAT(
      ${STAGE_NAME_EXPR}
      ORDER BY pps.seq ASC, pps.id ASC SEPARATOR ', '
    )
    FROM production_plan_stages pps
    LEFT JOIN process_stages ps ON pps.stage_id = ps.id
    WHERE pps.plan_id = pp.id
  ), '')`;

// Completed qty = cumulative Daily Production output of the measurement stage
// (last stage by sequence). Mirrors logic used elsewhere so status matches.
const COMPLETED_SQL = `
  COALESCE((
    SELECT SUM(t.output_qty)
    FROM production_status_orders pso
    JOIN production_status_transactions t
      ON t.production_status_order_id = pso.id AND t.deleted_at IS NULL
    WHERE pso.production_plan_id = pp.id AND pso.deleted_at IS NULL
      AND pso.process_stage COLLATE utf8mb4_unicode_ci = (
        SELECT s2.stage_name FROM production_plan_stages s2
        WHERE s2.plan_id = pp.id ORDER BY s2.seq DESC, s2.id DESC LIMIT 1
      )
  ), 0)`;

// List production plans available for a material transfer note.
export async function listPlans({ search, status, stage, page = 1, limit = 10, sortBy, sortOrder } = {}) {
  const params = [];
  let where = 'pp.deleted_at IS NULL';

  if (search) {
    where += ' AND (pp.plan_no LIKE ? OR c.name LIKE ? OR pp.article LIKE ? OR pp.color LIKE ? OR so.order_no LIKE ?)';
    const t = `%${search}%`;
    params.push(t, t, t, t, t);
  }
  if (stage) {
    where += ` AND EXISTS (
      SELECT 1 FROM production_plan_stages pps2
      LEFT JOIN process_stages ps2 ON pps2.stage_id = ps2.id
      WHERE pps2.plan_id = pp.id
        AND COALESCE(
          NULLIF(TRIM(CONVERT(pps2.stage_name USING utf8mb4)) COLLATE utf8mb4_unicode_ci, ''),
          CONVERT(ps2.name USING utf8mb4) COLLATE utf8mb4_unicode_ci
        ) = CONVERT(? USING utf8mb4) COLLATE utf8mb4_unicode_ci
    )`;
    params.push(stage);
  }

  const col = ALLOWED_SORT.includes(sortBy) ? sortBy : 'plan_no';
  const ord = sortOrder === 'asc' ? 'ASC' : 'DESC';
  const offset = (page - 1) * limit;

  const statusExpr = `CASE
      WHEN ${COMPLETED_SQL} <= 0 THEN 'New'
      WHEN COALESCE(pp.planned_qty, 0) > 0 AND ${COMPLETED_SQL} >= COALESCE(pp.planned_qty, 0) THEN 'Completed'
      ELSE 'Inprocess'
    END`;

  const havingStatus = status ? ' AND derived_status = ?' : '';
  const orderCol = col === 'status' ? 'derived_status' : col;

  const sql = `
    SELECT * FROM (
      SELECT
        pp.id,
        pp.plan_no,
        pp.plan_date,
        pp.article,
        pp.color,
        COALESCE(pp.planned_qty, 0) AS planned_qty,
        COALESCE(pp.uom, 'Pcs') AS uom,
        ${STAGE_NAMES_SQL} AS stage,
        c.name AS customer_name,
        so.order_no AS sales_order_no,
        ${statusExpr} AS derived_status
      FROM production_plans pp
      LEFT JOIN customers c ON pp.customer_id = c.id
      LEFT JOIN sales_orders so ON pp.sales_order_id = so.id
      WHERE ${where}
    ) AS q
    WHERE 1=1${havingStatus}
    ORDER BY q.\`${orderCol}\` ${ord}
    LIMIT ? OFFSET ?`;

  const listParams = [...params];
  if (status) listParams.push(status);
  listParams.push(Number(limit), Number(offset));

  const [rows] = await pool.query(sql, listParams);

  const countSql = `
    SELECT COUNT(*) AS total FROM (
      SELECT ${statusExpr} AS derived_status
      FROM production_plans pp
      LEFT JOIN customers c ON pp.customer_id = c.id
      LEFT JOIN sales_orders so ON pp.sales_order_id = so.id
      WHERE ${where}
    ) AS q
    WHERE 1=1${havingStatus}`;
  const countParams = [...params];
  if (status) countParams.push(status);
  const [[{ total }]] = await pool.query(countSql, countParams);

  return { rows, total };
}

// Distinct process-stage names used by active plans — powers the Stage filter.
// stage_name and process_stages.name can carry different collations, so both
// are coerced to utf8mb4_unicode_ci before comparison to avoid the
// "Illegal mix of collations" error.
export async function getStageOptions() {
  const [rows] = await pool.query(
    `SELECT DISTINCT COALESCE(
        NULLIF(TRIM(CONVERT(pps.stage_name USING utf8mb4)) COLLATE utf8mb4_unicode_ci, ''),
        CONVERT(ps.name USING utf8mb4) COLLATE utf8mb4_unicode_ci
      ) AS stage
     FROM production_plan_stages pps
     LEFT JOIN process_stages ps ON pps.stage_id = ps.id
     JOIN production_plans pp ON pps.plan_id = pp.id AND pp.deleted_at IS NULL
     HAVING stage IS NOT NULL AND stage <> ''
     ORDER BY stage`
  );
  return rows.map((r) => r.stage);
}

// Build the material transfer note detail for a production plan.
//   Required Qty = BOM norm (per-piece qty) × plan planned_qty.
//   Transfer Qty = sum of material issues recorded for this plan (matched by
//                  plan_no on material_issues.production_batch); 0 at start.
export async function getPlanTransfer(planId) {
  const [[plan]] = await pool.query(
    `SELECT pp.id, pp.plan_no, pp.plan_date, pp.article, pp.color, pp.product_id,
        COALESCE(pp.planned_qty, 0) AS planned_qty, COALESCE(pp.uom, 'Pcs') AS uom,
        pp.warehouse_id,
        c.name AS customer_name,
        so.order_no AS sales_order_no,
        w.name AS warehouse_name,
        ${STAGE_NAMES_SQL} AS stage,
        ${COMPLETED_SQL} AS completed_qty
     FROM production_plans pp
     LEFT JOIN customers c ON pp.customer_id = c.id
     LEFT JOIN sales_orders so ON pp.sales_order_id = so.id
     LEFT JOIN warehouses w ON pp.warehouse_id = w.id
     WHERE pp.id = ? AND pp.deleted_at IS NULL`,
    [planId]
  );
  if (!plan) return null;

  const plannedQty = Number(plan.planned_qty) || 0;
  const completed = Number(plan.completed_qty) || 0;
  const status = completed <= 0 ? 'New' : (plannedQty > 0 && completed >= plannedQty ? 'Completed' : 'Inprocess');

  // BOM norms (per-piece quantities) for the plan's product — material lines.
  let bomItems = [];
  let missingBom = false;
  if (plan.product_id) {
    const [[bom]] = await pool.query(
      `SELECT id FROM boms WHERE product_id = ? AND status = 'Active'
       ORDER BY version DESC, id DESC LIMIT 1`,
      [plan.product_id]
    );
    if (bom) {
      const [rows] = await pool.query(
        `SELECT bi.material_id,
            m.code AS material_code,
            m.name AS material_name,
            COALESCE(bi.uom, m.uom) AS uom,
            COALESCE(bi.qty, 0) AS per_piece_qty
         FROM bom_items bi
         JOIN materials m ON bi.material_id = m.id
         WHERE bi.bom_id = ? AND bi.material_id IS NOT NULL
         ORDER BY m.code`,
        [bom.id]
      );
      bomItems = rows;
    } else {
      missingBom = true;
    }
  } else {
    missingBom = true;
  }

  // Transferred (issued) qty per material for this plan.
  const [issued] = await pool.query(
    `SELECT mii.material_id, COALESCE(SUM(mii.issue_qty), 0) AS transferred_qty
     FROM material_issues mi
     JOIN material_issue_items mii ON mii.issue_id = mi.id
     WHERE mi.deleted_at IS NULL
       AND mi.production_batch = ?
     GROUP BY mii.material_id`,
    [plan.plan_no]
  );
  const issuedMap = {};
  for (const r of issued) issuedMap[String(r.material_id)] = Number(r.transferred_qty) || 0;

  const materials = bomItems.map((bi) => {
    const perPiece = Number(bi.per_piece_qty) || 0;
    const requiredQty = Number((perPiece * plannedQty).toFixed(4));
    const transferQty = issuedMap[String(bi.material_id)] || 0;
    return {
      material_id: bi.material_id,
      material_code: bi.material_code || '—',
      material_description: bi.material_name || '—',
      uom: bi.uom || '—',
      per_piece_qty: perPiece,
      required_qty: requiredQty,
      transfer_qty: Number(transferQty.toFixed(4)),
    };
  });

  return {
    plan: {
      id: plan.id,
      plan_no: plan.plan_no,
      plan_date: plan.plan_date,
      customer_name: plan.customer_name || '—',
      sales_order_no: plan.sales_order_no || '—',
      article: plan.article || '—',
      colour: plan.color || '—',
      planned_qty: plannedQty,
      uom: plan.uom || 'Pcs',
      stage: plan.stage || '—',
      warehouse_name: plan.warehouse_name || '',
      status,
    },
    materials,
    missingBom,
  };
}
