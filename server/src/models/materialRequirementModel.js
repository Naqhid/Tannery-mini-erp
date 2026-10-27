import pool from '../config/db.js';

// ─── Material Requirement (Sale Order → BOM) ─────────────────────────────────
// Lists sale orders with their aggregated article / colour / quantity so the
// user can pick one and calculate its BOM material requirements.

/**
 * List sale orders (optionally filtered by search term). Returns one row per
 * sale order with its primary article/colour and total order quantity. All
 * data is live — nothing is hard-coded.
 */
export async function listOrders({ search } = {}) {
  const params = [];
  let where = '1=1';
  if (search) {
    where += ' AND (so.order_no LIKE ? OR c.name LIKE ? OR soi.item_description LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  const [rows] = await pool.query(
    `SELECT so.id,
        so.order_no,
        so.order_date,
        so.delivery_date,
        so.status,
        c.name AS customer_name,
        GROUP_CONCAT(DISTINCT NULLIF(TRIM(soi.item_description), '') ORDER BY soi.item_description SEPARATOR ', ') AS article,
        GROUP_CONCAT(DISTINCT NULLIF(TRIM(soi.finish_color), '') ORDER BY soi.finish_color SEPARATOR ', ') AS colour,
        COALESCE(SUM(soi.quantity), 0) AS order_qty,
        COUNT(soi.id) AS item_count
     FROM sales_orders so
     LEFT JOIN customers c ON so.customer_id = c.id
     LEFT JOIN sales_order_items soi ON soi.sales_order_id = so.id
     WHERE ${where}
     GROUP BY so.id, so.order_no, so.order_date, so.delivery_date, so.status, c.name
     ORDER BY so.order_date DESC, so.id DESC`,
    params
  );

  return rows.map(r => ({
    id: r.id,
    order_no: r.order_no,
    customer_name: r.customer_name || '—',
    article: r.article || '—',
    colour: r.colour || '—',
    order_qty: Number(r.order_qty) || 0,
    delivery_date: r.delivery_date,
    status: r.status || 'Draft',
    item_count: Number(r.item_count) || 0,
  }));
}

/**
 * Compute the BOM material requirements for a single sale order.
 *
 * For every sale-order item that is linked to a product, we take the latest
 * Active BOM of that product and multiply each BOM component's per-piece qty by
 * the ordered quantity. Requirements for the same material across items are
 * merged (summed). Required Qty = per-piece BOM qty × order qty.
 */
export async function getRequirements(orderId) {
  const [[order]] = await pool.query(
    `SELECT so.id, so.order_no, so.order_date, so.delivery_date, so.status,
        c.name AS customer_name
     FROM sales_orders so
     LEFT JOIN customers c ON so.customer_id = c.id
     WHERE so.id = ?`,
    [orderId]
  );
  if (!order) return null;

  const [items] = await pool.query(
    `SELECT id, product_id, item_description, finish_color, uom, quantity
     FROM sales_order_items
     WHERE sales_order_id = ?
     ORDER BY id`,
    [orderId]
  );

  const articles = [...new Set(items.map(i => (i.item_description || '').trim()).filter(Boolean))];
  const colours = [...new Set(items.map(i => (i.finish_color || '').trim()).filter(Boolean))];
  const totalOrderQty = items.reduce((s, i) => s + (Number(i.quantity) || 0), 0);

  // Merge requirements keyed by material.
  const reqMap = new Map();
  let missingBom = false;

  for (const item of items) {
    const orderQty = Number(item.quantity) || 0;
    if (!item.product_id || orderQty <= 0) {
      if (!item.product_id) missingBom = true;
      continue;
    }

    // Latest Active BOM for this product.
    const [[bom]] = await pool.query(
      `SELECT id FROM boms
       WHERE product_id = ? AND status = 'Active'
       ORDER BY version DESC, id DESC
       LIMIT 1`,
      [item.product_id]
    );
    if (!bom) { missingBom = true; continue; }

    // Material (chemical) components only — skip machine lines.
    const [bomItems] = await pool.query(
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

    for (const bi of bomItems) {
      const perPiece = Number(bi.per_piece_qty) || 0;
      const requiredQty = perPiece * orderQty;
      const key = String(bi.material_id);
      if (reqMap.has(key)) {
        reqMap.get(key).required_qty += requiredQty;
      } else {
        reqMap.set(key, {
          material_id: bi.material_id,
          material_code: bi.material_code || '—',
          material_description: bi.material_name || '—',
          uom: bi.uom || '—',
          per_piece_qty: perPiece,
          required_qty: requiredQty,
        });
      }
    }
  }

  const materials = [...reqMap.values()].map(r => ({
    ...r,
    // Blended per-piece so the UI column stays meaningful when multiple
    // articles contribute to the same material.
    per_piece_qty: totalOrderQty > 0 ? r.required_qty / totalOrderQty : r.per_piece_qty,
    required_qty: Number(r.required_qty.toFixed(4)),
  })).sort((a, b) => a.material_code.localeCompare(b.material_code));

  return {
    order: {
      id: order.id,
      order_no: order.order_no,
      customer_name: order.customer_name || '—',
      article: articles.join(', ') || '—',
      colour: colours.join(', ') || '—',
      order_qty: totalOrderQty,
      delivery_date: order.delivery_date,
      status: order.status || 'Draft',
    },
    materials,
    missingBom,
  };
}
