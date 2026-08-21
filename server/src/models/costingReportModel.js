import pool from '../config/db.js';

/**
 * Get Costing Report data - aggregates material, machine, and general costs per order.
 * Columns: Customer, Order-No, Article, Color, Order-qty Sqft, Completed qty Sq.ft,
 *          Cost per Sqft, Selling Price per Sqft, Variance per sq.ft
 */
export async function getReport({ search, customer, article, color, page = 1, limit = 10, sortBy, sortOrder }) {
  const params = [];
  let where = 'pp.deleted_at IS NULL';

  if (search) {
    where += ' AND (c.name LIKE ? OR so.order_no LIKE ? OR pp.article LIKE ? OR pp.color LIKE ?)';
    const t = `%${search}%`;
    params.push(t, t, t, t);
  }
  if (customer) {
    where += ' AND c.name LIKE ?';
    params.push(`%${customer}%`);
  }
  if (article) {
    where += ' AND pp.article LIKE ?';
    params.push(`%${article}%`);
  }
  if (color) {
    where += ' AND pp.color LIKE ?';
    params.push(`%${color}%`);
  }

  const allowedSort = ['customer_name', 'order_no', 'article', 'color', 'order_qty_sqft', 'completed_qty_sqft', 'cost_per_sqft', 'selling_price_per_sqft', 'variance_per_sqft'];
  let orderClause = 'pp.id DESC';
  if (allowedSort.includes(sortBy)) {
    const ord = sortOrder === 'asc' ? 'ASC' : 'DESC';
    if (sortBy === 'customer_name') orderClause = `c.name ${ord}`;
    else if (sortBy === 'order_no') orderClause = `so.order_no ${ord}`;
    else orderClause = `${sortBy} ${ord}`;
  }

  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT 
       pp.id,
       c.name AS customer_name,
       so.order_no,
       pp.article,
       pp.color,
       pp.order_qty AS order_qty_sqft,
       COALESCE(pst_agg.total_output_sqft, 0) AS completed_qty_sqft,
       COALESCE(gc_agg.total_general_cost, 0) AS total_general_cost,
       COALESCE(mc_agg.total_machine_cost, 0) AS total_machine_cost,
       COALESCE(bom_agg.total_material_cost, 0) AS total_material_cost,
       CASE 
         WHEN COALESCE(pst_agg.total_output_sqft, 0) > 0 
         THEN (COALESCE(gc_agg.total_general_cost, 0) + COALESCE(mc_agg.total_machine_cost, 0) + COALESCE(bom_agg.total_material_cost, 0)) / pst_agg.total_output_sqft
         ELSE 0 
       END AS cost_per_sqft,
       COALESCE(soi_agg.avg_unit_price, 0) AS selling_price_per_sqft,
       CASE 
         WHEN COALESCE(pst_agg.total_output_sqft, 0) > 0 
         THEN ((COALESCE(gc_agg.total_general_cost, 0) + COALESCE(mc_agg.total_machine_cost, 0) + COALESCE(bom_agg.total_material_cost, 0)) / pst_agg.total_output_sqft) - COALESCE(soi_agg.avg_unit_price, 0)
         ELSE 0 
       END AS variance_per_sqft
     FROM production_plans pp
     LEFT JOIN customers c ON pp.customer_id = c.id
     LEFT JOIN sales_orders so ON pp.sales_order_id = so.id
     LEFT JOIN (
       SELECT production_plan_id, SUM(output_qty) AS total_output_sqft
       FROM production_status_transactions
       WHERE deleted_at IS NULL
       GROUP BY production_plan_id
     ) pst_agg ON pst_agg.production_plan_id = pp.id
     LEFT JOIN (
       SELECT gch.production_plan_id, SUM(gch.total_amount) AS total_general_cost
       FROM general_cost_headers gch
       GROUP BY gch.production_plan_id
     ) gc_agg ON gc_agg.production_plan_id = pp.id
     LEFT JOIN (
       SELECT mch.production_plan_id, SUM(mch.total_amount) AS total_machine_cost
       FROM machine_cost_headers mch
       GROUP BY mch.production_plan_id
     ) mc_agg ON mc_agg.production_plan_id = pp.id
     LEFT JOIN (
       SELECT pp2.id AS production_plan_id, 
         COALESCE(SUM(bi.qty * (1 + COALESCE(bi.scrap_percent, 0) / 100) * COALESCE(bi.unit_cost, 0)), 0) AS total_material_cost
       FROM production_plans pp2
       LEFT JOIN boms b ON pp2.bom_id = b.id
       LEFT JOIN bom_items bi ON bi.bom_id = b.id
       GROUP BY pp2.id
     ) bom_agg ON bom_agg.production_plan_id = pp.id
     LEFT JOIN (
       SELECT soi.sales_order_id, AVG(soi.unit_price) AS avg_unit_price
       FROM sales_order_items soi
       GROUP BY soi.sales_order_id
     ) soi_agg ON soi_agg.sales_order_id = pp.sales_order_id
     WHERE ${where}
     ORDER BY ${orderClause}
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM production_plans pp
     LEFT JOIN customers c ON pp.customer_id = c.id
     LEFT JOIN sales_orders so ON pp.sales_order_id = so.id
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
    `SELECT DISTINCT c.name FROM production_plans pp
     JOIN customers c ON pp.customer_id = c.id
     WHERE pp.deleted_at IS NULL AND c.name IS NOT NULL
     ORDER BY c.name`
  );
  const [articles] = await pool.query(
    `SELECT DISTINCT article FROM production_plans
     WHERE deleted_at IS NULL AND article IS NOT NULL AND article != ''
     ORDER BY article`
  );
  const [colors] = await pool.query(
    `SELECT DISTINCT color FROM production_plans
     WHERE deleted_at IS NULL AND color IS NOT NULL AND color != ''
     ORDER BY color`
  );

  return {
    customers: customers.map(r => r.name),
    articles: articles.map(r => r.article),
    colors: colors.map(r => r.color),
  };
}
