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
  // Link to sales_orders via order_no to get selling price and production_plan costs
  const [rows] = await pool.query(
    `SELECT 
       o.id,
       COALESCE(so_info.customer_name, o.customer_name) AS customer_name,
       o.order_no,
       COALESCE(so_info.article, o.article) AS article,
       COALESCE(so_info.color, o.color) AS color,
       so_info.delivery_date,
       o.issued_qty AS order_qty_sqft,
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
     LEFT JOIN (
       SELECT so.order_no,
         soi.item_description AS article,
         soi.finish_color AS color,
         MAX(c.name) AS customer_name,
         MAX(soi.delivery_date) AS delivery_date
       FROM sales_orders so
       LEFT JOIN customers c ON so.customer_id = c.id
       JOIN sales_order_items soi ON soi.sales_order_id = so.id
       GROUP BY so.order_no, soi.item_description, soi.finish_color
     ) so_info
       ON so_info.order_no COLLATE utf8mb4_0900_ai_ci = o.order_no
       AND so_info.article COLLATE utf8mb4_0900_ai_ci = o.article
       AND COALESCE(so_info.color, '') COLLATE utf8mb4_0900_ai_ci = COALESCE(o.color, '')
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
    `SELECT id, order_no, customer_name, article, color, uom
     FROM production_status_orders WHERE id=? AND deleted_at IS NULL`,
    [orderId]
  );
  if (!seed) return null;

  const [stages] = await pool.query(
    `SELECT id, process_stage, uom, plan_date, customer_name, article, color,
            order_no, issued_qty AS order_qty, completed_qty, balance_qty,
            status
     FROM production_status_orders
     WHERE deleted_at IS NULL AND order_no=? AND article=? AND COALESCE(color,'')=COALESCE(?, '')
     ORDER BY id`,
    [seed.order_no, seed.article, seed.color]
  );

  const orderQty = stages.reduce((m, r) => Math.max(m, Number(r.order_qty) || 0), 0);
  const completedQty = stages.reduce((m, r) => Math.max(m, Number(r.completed_qty) || 0), 0);
  const balanceQty = Math.max(0, orderQty - completedQty);

  const stageDetails = [];
  for (const stage of stages) {
    const [generalRows] = await pool.query(
      `SELECT 'General Cost' AS cost_group, i.cost_category, i.uom,
              COALESCE(SUM(i.amount),0) AS actual_cost
       FROM general_cost_headers h
       JOIN general_cost_items i ON i.general_cost_id=h.id
       WHERE h.production_plan_id=?
       GROUP BY i.cost_category, i.uom
       ORDER BY MIN(i.sort_order), MIN(i.id)`, [stage.id]
    );
    const [machineRows] = await pool.query(
      `SELECT 'Machine Cost' AS cost_group, i.machine_name AS cost_category, i.uom,
              COALESCE(SUM(i.amount),0) AS actual_cost
       FROM machine_cost_headers h
       JOIN machine_cost_items i ON i.machine_cost_id=h.id
       WHERE h.production_plan_id=?
       GROUP BY i.machine_name, i.uom
       ORDER BY MIN(i.sort_order), MIN(i.id)`, [stage.id]
    );
    const outputQty = Number(stage.completed_qty) || 0;
    const rows = [...generalRows, ...machineRows].map(r => ({
      ...r,
      actual_cost: Number(r.actual_cost) || 0,
      cost_per_uom: outputQty > 0 ? (Number(r.actual_cost) || 0) / outputQty : 0,
    }));
    stageDetails.push({ ...stage, rows });
  }

  return {
    order: { ...seed, order_qty: orderQty, completed_qty: completedQty, balance_qty: balanceQty },
    stages: stageDetails,
  };
}
