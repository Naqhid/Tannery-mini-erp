import pool from '../config/db.js';

/**
 * Get Costing Report data - sources from production_status_orders.
 * Columns: Customer, Order-No, Article, Color, Order-qty Sqft, Completed qty Sq.ft,
 *          Cost per Sqft, Selling Price per Sqft, Variance per sq.ft
 * 
 * Cost data is pulled from general_cost_headers + machine_cost_headers + bom material
 * linked via production_plans (joined by sales_order_id -> sales_orders.order_no = o.order_no).
 * Selling price comes from sales_order_items.
 */
export async function getReport({ search, customer, article, color, page = 1, limit = 10, sortBy, sortOrder }) {
  const params = [];
  let where = 'o.deleted_at IS NULL';

  if (search) {
    where += ' AND (o.customer_name LIKE ? OR o.order_no LIKE ? OR o.article LIKE ? OR o.color LIKE ?)';
    const t = `%${search}%`;
    params.push(t, t, t, t);
  }
  if (customer) {
    where += ' AND o.customer_name = ?';
    params.push(customer);
  }
  if (article) {
    where += ' AND o.article = ?';
    params.push(article);
  }
  if (color) {
    where += ' AND o.color = ?';
    params.push(color);
  }

  const allowedSort = ['customer_name', 'order_no', 'article', 'color', 'order_qty_sqft', 'completed_qty_sqft', 'cost_per_sqft', 'selling_price_per_sqft', 'variance_per_sqft'];
  let orderClause = 'o.id DESC';
  if (allowedSort.includes(sortBy)) {
    const ord = sortOrder === 'asc' ? 'ASC' : 'DESC';
    if (sortBy === 'customer_name') orderClause = `o.customer_name ${ord}`;
    else if (sortBy === 'order_no') orderClause = `o.order_no ${ord}`;
    else if (sortBy === 'article') orderClause = `o.article ${ord}`;
    else if (sortBy === 'color') orderClause = `o.color ${ord}`;
    else if (sortBy === 'order_qty_sqft') orderClause = `o.issued_qty ${ord}`;
    else if (sortBy === 'completed_qty_sqft') orderClause = `o.completed_qty ${ord}`;
    else orderClause = `o.id ${ord}`;
  }

  const offset = (page - 1) * limit;

  // Main query: pull from production_status_orders
  // Sales order is linked via the production plan:
  //   production_status_orders.production_plan_id -> production_plans.id
  //   production_plans.sales_order_id -> sales_orders.id
  // Order No, Customer, Article, Color, Order Date and Delivery Date are sourced
  // from the sales order (falling back to the planning values when unlinked).
  const [rows] = await pool.query(
    `SELECT 
       o.id,
       COALESCE(so2.customer_name_resolved, o.customer_name) AS customer_name,
       COALESCE(so2.sales_order_no, o.order_no) AS order_no,
       COALESCE(so_item.article, o.article) AS article,
       COALESCE(so_item.color, o.color) AS color,
       so2.order_date,
       so_item.delivery_date,
       COALESCE(so_item.order_qty, o.issued_qty) AS order_qty_sqft,
       o.completed_qty AS completed_qty_sqft,
       COALESCE(cost_agg.total_general_cost, 0) AS total_general_cost,
       COALESCE(cost_agg.total_machine_cost, 0) AS total_machine_cost,
       COALESCE(cost_agg.total_material_cost, 0) AS total_material_cost,
       CASE 
         WHEN o.completed_qty > 0 
         THEN (COALESCE(cost_agg.total_general_cost, 0) + COALESCE(cost_agg.total_machine_cost, 0) + COALESCE(cost_agg.total_material_cost, 0)) / o.completed_qty
         ELSE 0 
       END AS cost_per_sqft,
       COALESCE(so_agg.selling_price, 0) AS selling_price_per_sqft,
       CASE 
         WHEN o.completed_qty > 0 
         THEN ((COALESCE(cost_agg.total_general_cost, 0) + COALESCE(cost_agg.total_machine_cost, 0) + COALESCE(cost_agg.total_material_cost, 0)) / o.completed_qty) - COALESCE(so_agg.selling_price, 0)
         ELSE 0 
       END AS variance_per_sqft
     FROM production_status_orders o
     LEFT JOIN (
       SELECT 
         so.order_no,
         SUM(COALESCE(gc_sub.gc_total, 0)) AS total_general_cost,
         SUM(COALESCE(mc_sub.mc_total, 0)) AS total_machine_cost,
         0 AS total_material_cost
       FROM sales_orders so
       JOIN production_plans pp ON pp.sales_order_id = so.id AND pp.deleted_at IS NULL
       LEFT JOIN (
         SELECT production_plan_id, SUM(total_amount) AS gc_total
         FROM general_cost_headers GROUP BY production_plan_id
       ) gc_sub ON gc_sub.production_plan_id = pp.id
       LEFT JOIN (
         SELECT production_plan_id, SUM(total_amount) AS mc_total
         FROM machine_cost_headers GROUP BY production_plan_id
       ) mc_sub ON mc_sub.production_plan_id = pp.id
       GROUP BY so.order_no
     ) cost_agg ON cost_agg.order_no COLLATE utf8mb4_0900_ai_ci = o.order_no
     LEFT JOIN (
       SELECT so.order_no, AVG(soi.unit_price) AS selling_price
       FROM sales_orders so
       JOIN sales_order_items soi ON soi.sales_order_id = so.id
       GROUP BY so.order_no
     ) so_agg ON so_agg.order_no COLLATE utf8mb4_0900_ai_ci = o.order_no
     LEFT JOIN production_plans pp2 ON pp2.id = o.production_plan_id AND pp2.deleted_at IS NULL
     LEFT JOIN (
       SELECT so.id AS sales_order_id, so.order_no AS sales_order_no, so.order_date,
         c.name AS customer_name_resolved
       FROM sales_orders so
       LEFT JOIN customers c ON so.customer_id = c.id
     ) so2 ON so2.sales_order_id = pp2.sales_order_id
     LEFT JOIN (
       SELECT soi.sales_order_id,
         soi.item_description AS article,
         soi.finish_color AS color,
         SUM(soi.quantity) AS order_qty,
         MAX(soi.delivery_date) AS delivery_date
       FROM sales_order_items soi
       GROUP BY soi.sales_order_id, soi.item_description, soi.finish_color
     ) so_item
       ON so_item.sales_order_id = pp2.sales_order_id
       AND so_item.article COLLATE utf8mb4_0900_ai_ci = o.article COLLATE utf8mb4_0900_ai_ci
       AND COALESCE(so_item.color, '') COLLATE utf8mb4_0900_ai_ci = COALESCE(o.color, '') COLLATE utf8mb4_0900_ai_ci
     WHERE ${where}
     ORDER BY ${orderClause}
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM production_status_orders o
     WHERE ${where}`,
    params
  );

  return { rows, total };
}

/**
 * Get filter options for the Costing Report page
 */
export async function getFilterOptions() {
  const [customers] = await pool.query(
    `SELECT DISTINCT customer_name AS name FROM production_status_orders
     WHERE deleted_at IS NULL AND customer_name IS NOT NULL AND customer_name != ''
     ORDER BY customer_name`
  );
  const [articles] = await pool.query(
    `SELECT DISTINCT article FROM production_status_orders
     WHERE deleted_at IS NULL AND article IS NOT NULL AND article != ''
     ORDER BY article`
  );
  const [colors] = await pool.query(
    `SELECT DISTINCT color FROM production_status_orders
     WHERE deleted_at IS NULL AND color IS NOT NULL AND color != ''
     ORDER BY color`
  );

  return {
    customers: customers.map(r => r.name),
    articles: articles.map(r => r.article),
    colors: colors.map(r => r.color),
  };
}

/**
 * Actual standard cost detail for a production-status order.  The detail is
 * stage-wise and uses the production plan/status as the single source of truth.
 */
export async function getActualCostDetail(orderId) {
  const [[seed]] = await pool.query(
    `SELECT id, order_no, customer_name, article, color, uom, production_plan_id
     FROM production_status_orders WHERE id=? AND deleted_at IS NULL`,
    [orderId]
  );
  if (!seed) return null;
  return buildDetailFromSeed(seed);
}

/**
 * Resolve the actual standard cost detail directly from a production plan.
 * Picks any one production_status_orders row seeded by production_plan_id, then
 * reuses the SAME aggregation logic (grouping on order_no + article + color).
 */
export async function getActualCostDetailByPlan(planId) {
  const [[seed]] = await pool.query(
    `SELECT id, order_no, customer_name, article, color, uom, production_plan_id
     FROM production_status_orders
     WHERE production_plan_id=? AND deleted_at IS NULL
     ORDER BY id LIMIT 1`,
    [planId]
  );

  // No production_status_orders row exists yet for this plan. Fall back to the
  // production plan itself so the detail page can still render header info.
  if (!seed) {
    const [[plan]] = await pool.query(
      `SELECT pp.id AS production_plan_id, pp.article,
              so.order_no AS order_no, c.name AS customer_name
       FROM production_plans pp
       LEFT JOIN sales_orders so ON so.id = pp.sales_order_id
       LEFT JOIN customers c ON c.id = so.customer_id
       WHERE pp.id=? AND pp.deleted_at IS NULL`,
      [planId]
    );
    if (!plan) return null;
    return {
      order: {
        production_plan_id: Number(planId),
        order_no: plan.order_no || '',
        customer_name: plan.customer_name || '',
        article: plan.article || '',
        color: '',
        uom: '',
        order_qty: 0,
        completed_qty: 0,
        balance_qty: 0,
      },
      stages: [],
    };
  }

  return buildDetailFromSeed(seed);
}

/**
 * Shared aggregation: given a seed production_status_orders row, group all
 * matching rows on order_no + article + color and build the stage-wise cost
 * detail. Used by both getActualCostDetail and getActualCostDetailByPlan.
 */
async function buildDetailFromSeed(seed) {
  // Note: scalar subqueries are used for the process-stage UOM/seq (instead of
  // LEFT JOINs) so that duplicate rows in process_stages / production_plan_stages
  // can never multiply a stage into several summary/detail blocks.
  const [stages] = await pool.query(
    `SELECT pso.id, pso.process_stage, pso.plan_date, pso.customer_name,
            pso.article, pso.color, pso.order_no, pso.issued_qty AS order_qty,
            pso.completed_qty, pso.balance_qty, pso.status, pso.production_plan_id,
            -- UOM shown against each stage comes from the Daily Production status
            -- (process stage master), falling back to the order uom.
            COALESCE((
              SELECT ps.uom FROM process_stages ps
              WHERE ps.name COLLATE utf8mb4_unicode_ci = pso.process_stage COLLATE utf8mb4_unicode_ci
              ORDER BY (ps.status='Active') DESC, ps.id LIMIT 1
            ), pso.uom) AS uom,
            -- Rejection qty from Daily Production for this stage.
            COALESCE((
              SELECT SUM(t.rejection_qty) FROM production_status_transactions t
              WHERE t.production_status_order_id = pso.id AND t.deleted_at IS NULL
            ), 0) AS rejection_qty,
            -- Sequence follows the Process Stage master ordering.
            COALESCE((
              SELECT ps.seq FROM process_stages ps
              WHERE ps.name COLLATE utf8mb4_unicode_ci = pso.process_stage COLLATE utf8mb4_unicode_ci
              ORDER BY (ps.status='Active') DESC, ps.id LIMIT 1
            ), (
              SELECT pps.seq FROM production_plan_stages pps
              WHERE pps.plan_id = pso.production_plan_id
                AND pps.stage_name COLLATE utf8mb4_unicode_ci = pso.process_stage COLLATE utf8mb4_unicode_ci
              ORDER BY pps.id LIMIT 1
            ), 999999) AS stage_seq
     FROM production_status_orders pso
     WHERE pso.deleted_at IS NULL AND pso.order_no=? AND pso.article=? AND COALESCE(pso.color,'')=COALESCE(?, '')
     ORDER BY stage_seq ASC, pso.id ASC`,
    [seed.order_no, seed.article, seed.color]
  );

  // Resolve the real Sales Order No and ordered quantity from the linked sales
  // order (production_status_orders.order_no actually stores the plan number).
  let salesOrderNo = seed.order_no;
  let salesOrderQty = 0;
  if (seed.production_plan_id) {
    const [[so]] = await pool.query(
      `SELECT so.order_no,
              COALESCE((
                SELECT SUM(soi.quantity) FROM sales_order_items soi
                WHERE soi.sales_order_id = so.id
                  AND soi.item_description COLLATE utf8mb4_unicode_ci = ? COLLATE utf8mb4_unicode_ci
                  AND COALESCE(soi.finish_color,'') COLLATE utf8mb4_unicode_ci = COALESCE(?, '') COLLATE utf8mb4_unicode_ci
              ), 0) AS order_qty
       FROM production_plans pp
       JOIN sales_orders so ON so.id = pp.sales_order_id
       WHERE pp.id = ? AND pp.deleted_at IS NULL`,
      [seed.article, seed.color, seed.production_plan_id]
    );
    if (so) {
      if (so.order_no) salesOrderNo = so.order_no;
      salesOrderQty = Number(so.order_qty) || 0;
    }
  }

  // Completed Qty must match the Production Plan page: cumulative Daily
  // Production output of the plan's measurement (last) stage, summed across all
  // production plans linked to this sales order + article + color.
  let completedQty = 0;
  if (seed.production_plan_id) {
    const [[row]] = await pool.query(
      `SELECT COALESCE(SUM(t.output_qty), 0) AS completed_qty
       FROM production_plans pp
       JOIN sales_orders so ON so.id = pp.sales_order_id
       JOIN production_plans pp2 ON pp2.sales_order_id = so.id AND pp2.deleted_at IS NULL
         AND pp2.article COLLATE utf8mb4_unicode_ci = ? COLLATE utf8mb4_unicode_ci
       JOIN production_status_orders pso
         ON pso.production_plan_id = pp2.id AND pso.deleted_at IS NULL
        AND pso.process_stage COLLATE utf8mb4_unicode_ci = (
          SELECT s2.stage_name FROM production_plan_stages s2
          WHERE s2.plan_id = pp2.id ORDER BY s2.seq DESC, s2.id DESC LIMIT 1
        )
       JOIN production_status_transactions t
         ON t.production_status_order_id = pso.id AND t.deleted_at IS NULL
       WHERE pp.id = ? AND pp.deleted_at IS NULL`,
      [seed.article, seed.production_plan_id]
    );
    completedQty = Number(row?.completed_qty) || 0;
  }
  // Fall back to the recorded completed_qty on the status orders when no Daily
  // Production transactions exist yet.
  if (completedQty <= 0) {
    completedQty = stages.reduce((m, r) => Math.max(m, Number(r.completed_qty) || 0), 0);
  }
  // Prefer the sales order quantity; fall back to the max issued qty across stages.
  const orderQty = salesOrderQty > 0
    ? salesOrderQty
    : stages.reduce((m, r) => Math.max(m, Number(r.order_qty) || 0), 0);
  const balanceQty = Math.max(0, orderQty - completedQty);

  // Resolve the plan number so Material Issues (which link by plan_no +
  // process_stage) can be aggregated per stage.
  let planNo = null;
  if (seed.production_plan_id) {
    const [[pp]] = await pool.query(
      `SELECT plan_no FROM production_plans WHERE id=? AND deleted_at IS NULL`,
      [seed.production_plan_id]
    );
    planNo = pp?.plan_no || null;
  }

  const stageDetails = [];
  const summary = [];
  for (const stage of stages) {
    // Material Issues for this plan + stage. Item Group comes from the
    // material's group_master; Item Name is the material name.
    const [materialRows] = await pool.query(
      `SELECT 'Material Issue' AS data_source,
              COALESCE(g.name, '') AS item_group,
              m.name AS item_name,
              i.uom,
              COALESCE(SUM(i.amount),0) AS actual_cost
       FROM material_issues h
       JOIN material_issue_items i ON i.issue_id=h.id
       JOIN materials m ON m.id = i.material_id
       LEFT JOIN group_master g ON m.group_id = g.id
       WHERE h.production_batch = ?
         AND COALESCE(h.process_stage,'') COLLATE utf8mb4_0900_ai_ci = COALESCE(?, '') COLLATE utf8mb4_0900_ai_ci
       GROUP BY g.name, m.name, i.uom
       ORDER BY g.name, m.name`,
      [planNo, stage.process_stage]
    );
    const [generalRows] = await pool.query(
      `SELECT 'General Cost' AS data_source,
              COALESCE(mg.group_name, '') AS item_group,
              i.cost_category AS item_name, i.uom,
              COALESCE(SUM(i.amount),0) AS actual_cost
       FROM general_cost_headers h
       JOIN general_cost_items i ON i.general_cost_id=h.id
       LEFT JOIN (
         SELECT mm.name AS material_name, gm.name AS group_name
         FROM materials mm LEFT JOIN group_master gm ON mm.group_id = gm.id
       ) mg ON mg.material_name COLLATE utf8mb4_0900_ai_ci = i.cost_category COLLATE utf8mb4_0900_ai_ci
       WHERE h.production_plan_id=?
       GROUP BY mg.group_name, i.cost_category, i.uom
       ORDER BY MIN(i.sort_order), MIN(i.id)`, [stage.id]
    );
    const [machineRows] = await pool.query(
      `SELECT 'Machine Cost' AS data_source,
              COALESCE(g.name, i.group_name, '') AS item_group,
              i.machine_name AS item_name, i.uom,
              COALESCE(SUM(i.amount),0) AS actual_cost
       FROM machine_cost_headers h
       JOIN machine_cost_items i ON i.machine_cost_id=h.id
       LEFT JOIN group_master g ON i.group_id = g.id
       WHERE h.production_plan_id=?
       GROUP BY COALESCE(g.name, i.group_name, ''), i.machine_name, i.uom
       ORDER BY MIN(i.sort_order), MIN(i.id)`, [stage.id]
    );
    const outputQty = Number(stage.completed_qty) || 0;
    const perUom = (amt) => outputQty > 0 ? amt / outputQty : 0;
    const rows = [...materialRows, ...machineRows, ...generalRows].map(r => ({
      data_source: r.data_source,
      item_group: r.item_group || '',
      item_name: r.item_name || '',
      // Kept for backward compatibility with any existing consumers.
      cost_group: r.data_source,
      cost_category: r.item_name || '',
      uom: r.uom,
      actual_cost: Number(r.actual_cost) || 0,
      cost_per_uom: perUom(Number(r.actual_cost) || 0),
    }));
    stageDetails.push({ ...stage, rows });

    // --- Per-stage Summary (mirrors the Excel breakdown) ---
    // In the Summary, Cost/Sqft = amount / overall completed (measurement) qty,
    // NOT the per-stage output qty.
    const perSqft = (amt) => completedQty > 0 ? amt / completedQty : 0;
    const sumBy = (list) => list.reduce((a, r) => a + (Number(r.actual_cost) || 0), 0);
    const materialCost = sumBy(materialRows);
    const generalCost = sumBy(generalRows);
    const machineCost = sumBy(machineRows);
    const stageTotal = materialCost + generalCost + machineCost;
    const rejectionQty = Number(stage.rejection_qty) || 0;
    // Rejection cost = per-sqft cost of the stage * rejection qty.
    const stageCostPerPiece = perSqft(stageTotal);
    const rejectionAmount = stageCostPerPiece * rejectionQty;

    summary.push({
      process_stage: stage.process_stage,
      uom: stage.uom,
      output_qty: outputQty,
      rejection_qty: rejectionQty,
      lines: [
        { label: 'Material Cost', amount: materialCost, cost_per_piece: perSqft(materialCost) },
        { label: 'General Cost', amount: generalCost, cost_per_piece: perSqft(generalCost) },
        { label: 'Machine Cost', amount: machineCost, cost_per_piece: perSqft(machineCost) },
      ],
      total: { amount: stageTotal, cost_per_piece: stageCostPerPiece },
      rejection: { qty: rejectionQty, amount: rejectionAmount, cost_per_piece: perSqft(rejectionAmount) },
      total_with_rejection: {
        amount: stageTotal + rejectionAmount,
        cost_per_piece: stageCostPerPiece + perSqft(rejectionAmount),
      },
    });
  }

  // Overall order-level excess/shortage: order qty vs the final (measurement)
  // completed qty. Positive => shortage, negative => excess.
  const excessShortage = orderQty - completedQty;

  return {
    order: {
      ...seed,
      order_no: salesOrderNo,
      production_plan_id: seed.production_plan_id,
      order_qty: orderQty,
      completed_qty: completedQty,
      balance_qty: balanceQty,
    },
    stages: stageDetails,
    summary,
    summary_meta: {
      order_qty: orderQty,
      completed_qty: completedQty,
      excess_shortage: excessShortage,
    },
  };
}
