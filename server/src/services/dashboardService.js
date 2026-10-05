import pool from '../config/db.js';
import * as customerModel from '../models/customerModel.js';
import * as productModel from '../models/productModel.js';
import * as supplierModel from '../models/supplierModel.js';
import * as bomModel from '../models/bomModel.js';

// ─── Recent sales orders (latest 5) ──────────────────────────────────────────
async function getRecentOrders() {
  const [rows] = await pool.query(
    `SELECT so.id, so.order_no, so.order_date, so.status,
       c.name AS customer_name,
       COALESCE((SELECT SUM(soi.quantity) FROM sales_order_items soi WHERE soi.sales_order_id = so.id), 0) AS total_quantity,
       (SELECT soi.item_description FROM sales_order_items soi WHERE soi.sales_order_id = so.id ORDER BY soi.id LIMIT 1) AS product
     FROM sales_orders so
     LEFT JOIN customers c ON so.customer_id = c.id
     ORDER BY so.order_date DESC, so.id DESC
     LIMIT 5`
  );
  return rows;
}

// ─── Low stock alerts (materials at/below reorder level) ──────────────────────
async function getLowStock() {
  const [rows] = await pool.query(
    `SELECT m.id, m.name AS item, m.uom,
       m.current_stock AS current_qty, m.reorder_level AS threshold
     FROM materials m
     WHERE m.status = 'Active'
       AND COALESCE(m.reorder_level, 0) > 0
       AND COALESCE(m.current_stock, 0) <= m.reorder_level
     ORDER BY (m.current_stock / NULLIF(m.reorder_level, 0)) ASC
     `
  );
  return rows.map(r => {
    const cur = Number(r.current_qty) || 0;
    const thr = Number(r.threshold) || 0;
    const percent = thr > 0 ? Math.min(100, Math.round((cur / thr) * 100)) : 0;
    return {
      id: r.id,
      item: r.item,
      qty: `${cur} ${r.uom || ''}`.trim(),
      threshold: `${thr} ${r.uom || ''}`.trim(),
      status: percent <= 50 ? 'Critical' : 'Low',
      percent,
    };
  });
}

// ─── Production order counts and details ─────────────────────────────────────
async function getProductionOrders() {
  const [rows] = await pool.query(
    `SELECT pp.id, pp.plan_no, pp.article, pp.color, pp.plan_date,
       CASE
         WHEN (SELECT COUNT(*) FROM production_plan_stages ps0 WHERE ps0.plan_id = pp.id) > 0
          AND (SELECT COUNT(*) FROM production_plan_stages ps1
               WHERE ps1.plan_id = pp.id AND ps1.planned_qty > 0
                 AND COALESCE((SELECT SUM(t1.output_qty) FROM production_status_orders pso1
                   JOIN production_status_transactions t1 ON t1.production_status_order_id = pso1.id AND t1.deleted_at IS NULL
                   WHERE pso1.production_plan_id = pp.id AND pso1.deleted_at IS NULL
                     AND pso1.process_stage COLLATE utf8mb4_unicode_ci = ps1.stage_name COLLATE utf8mb4_unicode_ci), 0) >= ps1.planned_qty) =
              (SELECT COUNT(*) FROM production_plan_stages ps2 WHERE ps2.plan_id = pp.id)
           THEN 'Completed'
         WHEN EXISTS (SELECT 1 FROM production_status_orders pso2
                      JOIN production_status_transactions t2 ON t2.production_status_order_id = pso2.id AND t2.deleted_at IS NULL
                      WHERE pso2.production_plan_id = pp.id AND pso2.deleted_at IS NULL AND t2.output_qty > 0)
           THEN 'In Progress'
         ELSE COALESCE(pp.status, 'Planned')
       END AS status,
       COALESCE(pp.planned_qty, pp.order_qty, 0) AS planned_qty,
       pp.uom, c.name AS customer_name, so.order_no AS sales_order_no
     FROM production_plans pp
     LEFT JOIN customers c ON c.id = pp.customer_id
     LEFT JOIN sales_orders so ON so.id = pp.sales_order_id
     WHERE pp.deleted_at IS NULL
       AND COALESCE(pp.status, '') NOT IN ('Cancelled', 'Canceled')
     ORDER BY pp.plan_date DESC, pp.id DESC
     `
  );
  const normalized = rows.map((row) => ({
    ...row,
    status: String(row.status || 'Planned').trim(),
    planned_qty: Number(row.planned_qty) || 0,
  }));
  const completed = normalized.filter((row) => row.status.toLowerCase() === 'completed');
  const pendingOrInProgress = normalized.filter((row) => ['pending', 'planned', 'draft', 'in progress', 'in-progress'].includes(row.status.toLowerCase()));
  return {
    counts: { pendingOrInProgress: pendingOrInProgress.length, completed: completed.length },
    orders: { pendingOrInProgress, completed },
  };
}

// ─── Highest remaining work-in-progress by production stage ───────────────────
async function getHighestWipStages() {
  const [rows] = await pool.query(
    `SELECT pps.stage_name AS stage,
       SUM(GREATEST(COALESCE(pps.planned_qty, 0) - COALESCE(stage_totals.output_qty, 0) - COALESCE(stage_totals.rejection_qty, 0), 0)) AS wip_qty,
       SUM(COALESCE(pps.planned_qty, 0)) AS planned_qty,
       COUNT(DISTINCT pps.plan_id) AS order_count
     FROM production_plan_stages pps
     JOIN production_plans pp ON pp.id = pps.plan_id AND pp.deleted_at IS NULL
     LEFT JOIN (
       SELECT pso.production_plan_id, pso.process_stage,
         SUM(t.output_qty) AS output_qty, SUM(t.rejection_qty) AS rejection_qty
       FROM production_status_orders pso
       JOIN production_status_transactions t ON t.production_status_order_id = pso.id AND t.deleted_at IS NULL
       WHERE pso.deleted_at IS NULL
       GROUP BY pso.production_plan_id, pso.process_stage
     ) stage_totals
       ON stage_totals.production_plan_id = pps.plan_id
       AND stage_totals.process_stage COLLATE utf8mb4_unicode_ci = pps.stage_name COLLATE utf8mb4_unicode_ci
     WHERE COALESCE(pp.status, '') NOT IN ('Completed', 'Cancelled', 'Canceled')
     GROUP BY pps.stage_name
     HAVING wip_qty > 0
     ORDER BY wip_qty DESC, pps.stage_name ASC
     LIMIT 5`
  );
  return rows.map((row) => ({
    stage: row.stage,
    wip_qty: Number(row.wip_qty) || 0,
    planned_qty: Number(row.planned_qty) || 0,
    order_count: Number(row.order_count) || 0,
  }));
}

// ─── KPI counts for the top cards (live) ─────────────────────────────────────
async function getKpiCounts() {
  const [[row]] = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM sales_orders
         WHERE status NOT IN ('Shipped', 'Delivered', 'Cancelled')) AS sales_orders_not_shipped,
       (SELECT COUNT(*) FROM sales_orders
         WHERE status IN ('Processing', 'Confirmed')) AS open_orders,
       (SELECT COUNT(*) FROM customers WHERE status = 'Active') AS customers_total,
       (SELECT COUNT(*) FROM products WHERE status = 'Active') AS products_total,
       (SELECT COUNT(*) FROM materials WHERE status = 'Active') AS materials_active,
       (SELECT COUNT(*) FROM suppliers WHERE status = 'Active') AS suppliers_active`
  );
  return {
    salesOrdersNotShipped: Number(row.sales_orders_not_shipped) || 0,
    openOrders: Number(row.open_orders) || 0,
    customersTotal: Number(row.customers_total) || 0,
    productsTotal: Number(row.products_total) || 0,
    materialsActive: Number(row.materials_active) || 0,
    suppliersActive: Number(row.suppliers_active) || 0,
  };
}

// ─── Sales order value trend (ALL orders, grouped by month, live) ────────────
async function getSalesOrderTrend() {
  const [rows] = await pool.query(
    `SELECT DATE_FORMAT(order_date, '%Y-%m') AS ym,
       DATE_FORMAT(order_date, '%b %Y') AS label,
       COALESCE(SUM(grand_total), 0) AS value,
       COUNT(*) AS order_count
     FROM sales_orders
     GROUP BY DATE_FORMAT(order_date, '%Y-%m'), DATE_FORMAT(order_date, '%b %Y')
     ORDER BY DATE_FORMAT(order_date, '%Y-%m') ASC`
  );
  return rows.map(r => ({ label: r.label, value: Number(r.value) || 0, orderCount: Number(r.order_count) || 0 }));
}

// ─── Inventory value by material type (live valuation) ───────────────────────
async function getInventoryValue() {
  const [rows] = await pool.query(
    `SELECT COALESCE(NULLIF(TRIM(type), ''), 'Other') AS category,
       COALESCE(SUM(COALESCE(current_stock, 0) * COALESCE(rate, 0)), 0) AS value
     FROM materials
     WHERE status = 'Active'
     GROUP BY COALESCE(NULLIF(TRIM(type), ''), 'Other')
     HAVING value > 0
     ORDER BY value DESC`
  );
  const breakdown = rows.map(r => ({ category: r.category, value: Number(r.value) || 0 }));
  const total = breakdown.reduce((s, r) => s + r.value, 0);
  return { total, breakdown };
}

// ─── Top 5 products by sales order value (live) ──────────────────────────────
async function getTopProducts() {
  const [rows] = await pool.query(
    `SELECT soi.item_description AS product,
       COALESCE(SUM(soi.quantity * COALESCE(soi.unit_price, 0)), 0) AS value
     FROM sales_order_items soi
     WHERE soi.item_description IS NOT NULL AND soi.item_description <> ''
     GROUP BY soi.item_description
     ORDER BY value DESC
     LIMIT 5`
  );
  return rows.map(r => ({ product: r.product, value: Number(r.value) || 0 }));
}

// ─── Recent goods receipts (latest 5, live) ──────────────────────────────────
async function getRecentReceipts() {
  const [rows] = await pool.query(
    `SELECT mr.id, mr.receipt_no, mr.receipt_date, mr.grand_total, mr.status,
       s.name AS supplier_name
     FROM material_receipts mr
     LEFT JOIN suppliers s ON mr.supplier_id = s.id
     ORDER BY mr.receipt_date DESC, mr.id DESC
     LIMIT 5`
  );
  return rows.map(r => ({
    id: r.id, receipt_no: r.receipt_no, receipt_date: r.receipt_date,
    supplier_name: r.supplier_name || '—', amount: Number(r.grand_total) || 0, status: r.status,
  }));
}

// ─── Quick summary counts (live) ─────────────────────────────────────────────
async function getQuickSummary() {
  const [[row]] = await pool.query(
    `SELECT
       -- Orders whose delivery date is within the next 7 days and not yet
       -- delivered/cancelled (the "nearest" delivery orders).
       (SELECT COUNT(*) FROM sales_orders
         WHERE delivery_date IS NOT NULL
           AND delivery_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
           AND status NOT IN ('Delivered', 'Cancelled')) AS nearest_delivery_orders,
       -- Sales orders that are not yet completed (not Delivered/Cancelled).
       (SELECT COUNT(*) FROM sales_orders
         WHERE status NOT IN ('Delivered', 'Cancelled')) AS pending_sales_orders,
       (SELECT COUNT(*) FROM material_receipts WHERE status = 'Draft') AS pending_goods_receipt,
       (SELECT COUNT(*) FROM material_issues WHERE status = 'Draft') AS pending_material_issues,
       (SELECT COUNT(*) FROM materials
         WHERE status = 'Active' AND COALESCE(reorder_level,0) > 0
           AND COALESCE(current_stock,0) <= reorder_level) AS low_stock_items,
       (SELECT COUNT(*) FROM production_plans
         WHERE deleted_at IS NULL
           AND COALESCE(status,'') NOT IN ('Completed','Cancelled','Canceled')) AS open_production_plans`
  );
  return {
    nearestDeliveryOrders: Number(row.nearest_delivery_orders) || 0,
    pendingSalesOrders: Number(row.pending_sales_orders) || 0,
    pendingGoodsReceipt: Number(row.pending_goods_receipt) || 0,
    pendingMaterialIssues: Number(row.pending_material_issues) || 0,
    lowStockItems: Number(row.low_stock_items) || 0,
    openProductionPlans: Number(row.open_production_plans) || 0,
  };
}

export async function getDashboardStats() {
  const [
    customerStats, productStats, supplierStats, bomStats,
    recentOrders, lowStock, productionOrders, highestWipStages,
    kpiCounts, salesTrend, inventoryValue, topProducts, recentReceipts, quickSummary,
  ] = await Promise.all([
    customerModel.getStats(),
    productModel.getStats(),
    supplierModel.getStats(),
    bomModel.getStats(),
    getRecentOrders(),
    getLowStock(),
    getProductionOrders(),
    getHighestWipStages(),
    getKpiCounts(),
    getSalesOrderTrend(),
    getInventoryValue(),
    getTopProducts(),
    getRecentReceipts(),
    getQuickSummary(),
  ]);

  return {
    stats: [
      { label: 'Total Customers', value: String(customerStats.total), change: '+12%', up: true },
      { label: 'Active Products', value: String(productStats.active), change: '+5%', up: true },
      { label: 'Total Suppliers', value: String(supplierStats.total), change: '+3%', up: true },
    ],
    recentOrders,
    lowStock,
    productionOrders,
    highestWipStages,
    counts: {
      customers: customerStats,
      products: productStats,
      suppliers: supplierStats,
      boms: bomStats,
    },
    // New live dashboard data (charts + KPI cards + quick summary).
    kpiCounts,
    salesTrend,
    inventoryValue,
    topProducts,
    recentReceipts,
    quickSummary,
  };
}
