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

// Live stock per material, derived from stock_ledger (single source of truth):
// the latest running balance per (warehouse, material), summed across all
// warehouses. Exposes material_id, live_qty and live_value. Used by every
// dashboard stock metric so the whole dashboard reads the ledger, not the
// decoupled materials.current_stock master field.
const LEDGER_LIVE_STOCK = `(
  SELECT sl.material_id,
         SUM(sl.balance_qty) AS live_qty,
         SUM(sl.balance_value) AS live_value
    FROM stock_ledger sl
    JOIN (
      SELECT warehouse_id, material_id, MAX(transaction_date) AS md
        FROM stock_ledger GROUP BY warehouse_id, material_id
    ) ld ON ld.warehouse_id=sl.warehouse_id AND ld.material_id=sl.material_id AND ld.md=sl.transaction_date
    JOIN (
      SELECT warehouse_id, material_id, transaction_date, MAX(id) AS mid
        FROM stock_ledger GROUP BY warehouse_id, material_id, transaction_date
    ) li ON li.warehouse_id=sl.warehouse_id AND li.material_id=sl.material_id
        AND li.transaction_date=sl.transaction_date AND li.mid=sl.id
   GROUP BY sl.material_id
)`;

// ─── Low stock alerts (materials at/below reorder level) ──────────────────────
async function getLowStock() {
  const [rows] = await pool.query(
    `SELECT m.id, m.name AS item, m.uom,
       COALESCE(ls.live_qty, 0) AS current_qty, m.reorder_level AS threshold
     FROM materials m
     LEFT JOIN ${LEDGER_LIVE_STOCK} ls ON ls.material_id = m.id
     WHERE m.status = 'Active'
       AND COALESCE(m.reorder_level, 0) > 0
       AND COALESCE(ls.live_qty, 0) <= m.reorder_level
     ORDER BY (COALESCE(ls.live_qty, 0) / NULLIF(m.reorder_level, 0)) ASC
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
  // Per stage, use the WIP of the LATEST production transaction (most recent
  // record by date, then id) for each plan+stage, and sum those latest WIP
  // values across open plans. This reflects the current running WIP per stage
  // rather than a derived "remaining" figure. Limited to the stages present.
  const [rows] = await pool.query(
    `SELECT pps.stage_name AS stage,
       SUM(COALESCE(latest.wip_qty, 0)) AS wip_qty,
       SUM(COALESCE(pps.planned_qty, 0)) AS planned_qty,
       COUNT(DISTINCT pps.plan_id) AS order_count
     FROM production_plan_stages pps
     JOIN production_plans pp ON pp.id = pps.plan_id AND pp.deleted_at IS NULL
     LEFT JOIN (
       SELECT pso.production_plan_id, pso.process_stage, t.wip_qty
       FROM production_status_orders pso
       JOIN production_status_transactions t ON t.production_status_order_id = pso.id AND t.deleted_at IS NULL
       WHERE pso.deleted_at IS NULL
         -- Keep only the latest transaction per order (by date, then id).
         AND t.id = (
           SELECT t2.id FROM production_status_transactions t2
           WHERE t2.production_status_order_id = pso.id AND t2.deleted_at IS NULL
           ORDER BY t2.production_date DESC, t2.id DESC LIMIT 1
         )
     ) latest
       ON latest.production_plan_id = pps.plan_id
       AND latest.process_stage COLLATE utf8mb4_unicode_ci = pps.stage_name COLLATE utf8mb4_unicode_ci
     WHERE COALESCE(pp.status, '') NOT IN ('Completed', 'Cancelled', 'Canceled')
     GROUP BY pps.stage_name
     HAVING wip_qty > 0
     ORDER BY wip_qty DESC, pps.stage_name ASC
     LIMIT 4`
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
       -- Total ordered quantity (not the number of orders) across sales orders
       -- that are not yet shipped/delivered/cancelled.
       (SELECT COALESCE(SUM(soi.quantity), 0)
          FROM sales_orders so
          JOIN sales_order_items soi ON soi.sales_order_id = so.id
         WHERE so.status NOT IN ('Shipped', 'Delivered', 'Cancelled')) AS sales_orders_not_shipped,
       -- "Open orders in process" — total planned quantity (not the number of
       -- plans) across production plans that are still open.
       (SELECT COALESCE(SUM(COALESCE(planned_qty, order_qty, 0)), 0) FROM production_plans
         WHERE deleted_at IS NULL
           AND COALESCE(status, '') NOT IN ('Completed', 'Cancelled', 'Canceled')) AS open_orders,
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

// ─── Sales order quantity trend (last 6 months, grouped by month, live) ──────
async function getSalesOrderTrend() {
  const [rows] = await pool.query(
    `SELECT DATE_FORMAT(so.order_date, '%Y-%m') AS ym,
       COALESCE(SUM(soi.quantity), 0) AS value,
       COUNT(DISTINCT so.id) AS order_count
     FROM sales_orders so
     LEFT JOIN sales_order_items soi ON soi.sales_order_id = so.id
     WHERE so.order_date >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 5 MONTH), '%Y-%m-01')
     GROUP BY DATE_FORMAT(so.order_date, '%Y-%m')
     ORDER BY DATE_FORMAT(so.order_date, '%Y-%m') ASC`
  );

  // Build a continuous 6-month window (oldest → current) so the chart always
  // spans the full range. Months without any orders are shown as 0 instead of
  // being dropped, which previously collapsed the line to just a couple of
  // points when only recent months had orders.
  const byMonth = new Map(rows.map((r) => [r.ym, r]));
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const out = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    const hit = byMonth.get(ym);
    out.push({
      label,
      value: hit ? Number(hit.value) || 0 : 0,
      orderCount: hit ? Number(hit.order_count) || 0 : 0,
    });
  }
  return out;
}

// ─── Production output trend (last 6 months, grouped by month) ───────────────
async function getProductionOutputTrend() {
  const [rows] = await pool.query(
    `SELECT DATE_FORMAT(t.production_date, '%Y-%m') AS ym,
       COALESCE(SUM(t.output_qty), 0) AS value
     FROM production_status_transactions t
     JOIN production_status_orders pso ON pso.id = t.production_status_order_id
     WHERE t.deleted_at IS NULL AND pso.deleted_at IS NULL
       AND t.production_date >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 5 MONTH), '%Y-%m-01')
     GROUP BY DATE_FORMAT(t.production_date, '%Y-%m')
     ORDER BY DATE_FORMAT(t.production_date, '%Y-%m') ASC`
  );

  const byMonth = new Map(rows.map((row) => [row.ym, row]));
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const out = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const ym = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const hit = byMonth.get(ym);
    out.push({
      label: `${MONTHS[date.getMonth()]} ${date.getFullYear()}`,
      value: hit ? Number(hit.value) || 0 : 0,
    });
  }
  return out;
}

// ─── Stage-level actual costs for mobile dashboard snapshots ─────────────────
async function getStageCosts() {
  const [rows] = await pool.query(
    `SELECT pso.id, pp.article, pso.process_stage AS stage, pso.uom,
       COALESCE(pso.completed_qty, 0) AS completed_qty,
       GREATEST(0, COALESCE(pso.issued_qty, 0) - COALESCE(pso.completed_qty, 0) -
         COALESCE((SELECT SUM(t.rejection_qty)
           FROM production_status_transactions t
           WHERE t.production_status_order_id = pso.id AND t.deleted_at IS NULL), 0)) AS wip_qty,
       COALESCE((SELECT SUM(mii.amount)
         FROM material_issues mi
         JOIN material_issue_items mii ON mii.issue_id = mi.id
         WHERE mi.production_batch COLLATE utf8mb4_0900_ai_ci = pp.plan_no COLLATE utf8mb4_0900_ai_ci
           AND COALESCE(mi.process_stage, '') COLLATE utf8mb4_0900_ai_ci = COALESCE(pso.process_stage, '') COLLATE utf8mb4_0900_ai_ci), 0) AS material_cost,
       COALESCE((SELECT SUM(gh.total_amount) FROM general_cost_headers gh WHERE gh.production_plan_id = pso.id), 0) AS general_cost,
       COALESCE((SELECT SUM(mh.total_amount) FROM machine_cost_headers mh WHERE mh.production_plan_id = pso.id), 0) AS machine_cost
     FROM production_status_orders pso
     JOIN production_plans pp ON pp.id = pso.production_plan_id AND pp.deleted_at IS NULL
     WHERE pso.deleted_at IS NULL
     ORDER BY pso.id DESC
     LIMIT 500`
  );

  return rows.map((row) => {
    const materialCost = Number(row.material_cost) || 0;
    const generalCost = Number(row.general_cost) || 0;
    const machineCost = Number(row.machine_cost) || 0;
    const completedQty = Number(row.completed_qty) || 0;
    const totalCost = materialCost + generalCost + machineCost;
    return {
      id: row.id,
      article: row.article || '—',
      stage: row.stage || '—',
      uom: row.uom || '',
      completed_qty: completedQty,
      wip_qty: Number(row.wip_qty) || 0,
      material_cost: materialCost,
      general_cost: generalCost,
      machine_cost: machineCost,
      total_cost: totalCost,
      cost_per_pc: completedQty > 0 ? totalCost / completedQty : 0,
    };
  });
}

// ─── Inventory value by material type (live valuation) ───────────────────────
async function getInventoryValue() {
  const [rows] = await pool.query(
    `SELECT COALESCE(NULLIF(TRIM(m.type), ''), 'Other') AS category,
       COALESCE(SUM(COALESCE(ls.live_value, 0)), 0) AS value
     FROM materials m
     LEFT JOIN ${LEDGER_LIVE_STOCK} ls ON ls.material_id = m.id
     WHERE m.status = 'Active'
     GROUP BY COALESCE(NULLIF(TRIM(m.type), ''), 'Other')
     HAVING value > 0
     ORDER BY value DESC`
  );
  const breakdown = rows.map(r => ({ category: r.category, value: Number(r.value) || 0 }));
  const total = breakdown.reduce((s, r) => s + r.value, 0);
  return { total, breakdown };
}

// ─── Top 5 products by sales order quantity (live) ───────────────────────────
async function getTopProducts() {
  const [rows] = await pool.query(
    `SELECT soi.item_description AS product,
       COALESCE(SUM(soi.quantity), 0) AS value
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
       -- Draft sales orders (not yet confirmed).
       (SELECT COUNT(*) FROM sales_orders
         WHERE status = 'Draft') AS draft_sales_orders,
       (SELECT COUNT(*) FROM material_receipts WHERE status = 'Draft') AS pending_goods_receipt,
       (SELECT COUNT(*) FROM material_issues WHERE status = 'Draft') AS pending_material_issues,
       (SELECT COUNT(*) FROM materials m
         LEFT JOIN ${LEDGER_LIVE_STOCK} ls ON ls.material_id = m.id
         WHERE m.status = 'Active' AND COALESCE(m.reorder_level,0) > 0
           AND COALESCE(ls.live_qty,0) <= m.reorder_level) AS low_stock_items,
       (SELECT COUNT(*) FROM production_plans
         WHERE deleted_at IS NULL
           AND COALESCE(status,'') NOT IN ('Completed','Cancelled','Canceled')) AS open_production_plans`
  );
  return {
    nearestDeliveryOrders: Number(row.nearest_delivery_orders) || 0,
    draftSalesOrders: Number(row.draft_sales_orders) || 0,
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
    kpiCounts, salesTrend, productionOutputTrend, inventoryValue, stageCosts,
    topProducts, recentReceipts, quickSummary,
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
    getProductionOutputTrend(),
    getInventoryValue(),
    getStageCosts(),
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
    productionOutputTrend,
    inventoryValue,
    stageCosts,
    topProducts,
    recentReceipts,
    quickSummary,
  };
}
