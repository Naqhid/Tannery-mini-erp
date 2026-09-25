import pool from '../config/db.js';
import * as customerModel from '../models/customerModel.js';
import * as productModel from '../models/productModel.js';
import * as supplierModel from '../models/supplierModel.js';
import * as recipeModel from '../models/recipeModel.js';
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
     LIMIT 6`
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

// ─── Production schedule (active plans with progress) ─────────────────────────
async function getProductionSchedule() {
  const [rows] = await pool.query(
    `SELECT pp.id, pp.plan_no AS batch, pp.article AS recipe,
       COALESCE(pp.status, 'Planned') AS status,
       COALESCE(pp.planned_qty, pp.order_qty, 0) AS planned_qty,
       COALESCE((
         SELECT SUM(t.output_qty)
         FROM production_status_orders pso
         JOIN production_status_transactions t
           ON t.production_status_order_id = pso.id AND t.deleted_at IS NULL
         WHERE pso.production_plan_id = pp.id AND pso.deleted_at IS NULL
       ), 0) AS output_qty,
       (SELECT pso2.process_stage
          FROM production_status_orders pso2
          WHERE pso2.production_plan_id = pp.id AND pso2.deleted_at IS NULL
          ORDER BY pso2.id DESC LIMIT 1) AS stage
     FROM production_plans pp
     WHERE pp.deleted_at IS NULL
       AND COALESCE(pp.status, '') NOT IN ('Completed', 'Cancelled')
     ORDER BY pp.plan_date DESC, pp.id DESC
     LIMIT 5`
  );
  return rows.map(r => {
    const planned = Number(r.planned_qty) || 0;
    const output = Number(r.output_qty) || 0;
    const progress = planned > 0 ? Math.min(100, Math.round((output / planned) * 100)) : 0;
    return {
      batch: r.batch,
      recipe: r.recipe || '—',
      stage: r.stage || r.status || 'Planned',
      progress,
    };
  });
}

export async function getDashboardStats() {
  const [
    customerStats, productStats, supplierStats, recipeStats, bomStats,
    recentOrders, lowStock, productionSchedule,
  ] = await Promise.all([
    customerModel.getStats(),
    productModel.getStats(),
    supplierModel.getStats(),
    recipeModel.getStats(),
    bomModel.getStats(),
    getRecentOrders(),
    getLowStock(),
    getProductionSchedule(),
  ]);

  return {
    stats: [
      { label: 'Total Customers', value: String(customerStats.total), change: '+12%', up: true },
      { label: 'Active Products', value: String(productStats.active), change: '+5%', up: true },
      { label: 'Total Suppliers', value: String(supplierStats.total), change: '+3%', up: true },
      { label: 'Active Recipes', value: String(recipeStats.active), change: '+8%', up: true },
    ],
    recentOrders,
    lowStock,
    productionSchedule,
    counts: {
      customers: customerStats,
      products: productStats,
      suppliers: supplierStats,
      recipes: recipeStats,
      boms: bomStats,
    },
  };
}
