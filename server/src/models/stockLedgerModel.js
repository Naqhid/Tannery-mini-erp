import pool from '../config/db.js';

/**
 * Updates warehouse_stock within a transaction.
 * Uses weighted average cost when qty increases, keeps existing cost when qty decreases.
 * @param {object} conn - active DB connection (from pool.getConnection)
 */
export async function updateStock(conn, warehouseId, materialId, uom, qtyChange, unitCost = 0) {
  const [[existing]] = await conn.query(
    `SELECT id, current_qty, avg_unit_cost FROM warehouse_stock WHERE warehouse_id=? AND material_id=? FOR UPDATE`,
    [warehouseId, materialId]
  );

  if (existing) {
    const newQty = parseFloat(existing.current_qty) + parseFloat(qtyChange);
    let newCost = parseFloat(existing.avg_unit_cost);

    if (qtyChange > 0 && unitCost > 0) {
      const oldVal = parseFloat(existing.current_qty) * parseFloat(existing.avg_unit_cost);
      const addVal = parseFloat(qtyChange) * parseFloat(unitCost);
      newCost = (oldVal + addVal) / Math.max(newQty, 0.0001);
    }

    await conn.query(
      `UPDATE warehouse_stock SET current_qty=?, avg_unit_cost=?, uom=COALESCE(?, uom) WHERE id=?`,
      [newQty, newCost, uom || null, existing.id]
    );
  } else {
    await conn.query(
      `INSERT INTO warehouse_stock (warehouse_id, material_id, uom, current_qty, avg_unit_cost)
       VALUES (?,?,?,?,?)`,
      [warehouseId, materialId, uom || null, qtyChange, unitCost]
    );
  }
}

/**
 * Inserts a ledger entry within a transaction.
 */
export async function addLedgerEntry(conn, entry) {
  await conn.query(
    `INSERT INTO stock_ledger (
      transaction_date, transaction_type, reference_type, reference_id, reference_no,
      warehouse_id, material_id, uom, batch_no, expiry_date,
      in_qty, out_qty, unit_cost, amount, balance_qty, remarks, created_by
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      entry.transaction_date, entry.transaction_type, entry.reference_type,
      entry.reference_id, entry.reference_no || null,
      entry.warehouse_id, entry.material_id, entry.uom || null,
      entry.batch_no || null, entry.expiry_date || null,
      entry.in_qty || 0, entry.out_qty || 0, entry.unit_cost || 0,
      entry.amount || 0, entry.balance_qty || 0, entry.remarks || null,
      entry.created_by || null,
    ]
  );
}

const _n = (v) => Number(v) || 0;

/**
 * Rebuild running balances + moving-average cost for one (warehouse, material)
 * by replaying every stock_ledger row in TRANSACTION-DATE order.
 *
 * This is the fix for backdated / out-of-order transactions: instead of trusting
 * the incremental value written when a row was inserted, we recompute the whole
 * timeline from scratch so a transaction inserted "in the past" correctly shifts
 * all later balances and average rates.
 *
 * Rules:
 *   - Inbound rows (in_qty > 0) that carry a unit_cost move the weighted average.
 *   - Outbound rows (out_qty > 0) are valued at the running average AT THEIR DATE;
 *     their unit_cost/amount are re-priced so issue costing stays consistent.
 *   - stock_ledger.balance_qty is set to the true running quantity after each row.
 *   - warehouse_stock is updated to the final qty + average cost.
 *
 * Must be called inside an active transaction (pass the same `conn`).
 */
export async function rebuildStockValuation(conn, warehouseId, materialId) {
  const [rows] = await conn.query(
    `SELECT id, in_qty, out_qty, unit_cost, transaction_type
       FROM stock_ledger
      WHERE warehouse_id = ? AND material_id = ?
      ORDER BY transaction_date ASC, id ASC`,
    [warehouseId, materialId]
  );

  let qty = 0;      // running quantity
  let value = 0;    // running total value
  let lastUom = null;

  for (const row of rows) {
    const inQty = _n(row.in_qty);
    const outQty = _n(row.out_qty);

    if (inQty > 0) {
      // Inbound: use the row's own unit cost to move the weighted average.
      const inCost = _n(row.unit_cost);
      qty += inQty;
      value += inQty * inCost;
      // Snap tiny residuals to zero.
      if (Math.abs(qty) < 0.0005) qty = 0;
      await conn.query(
        `UPDATE stock_ledger SET amount = ?, balance_qty = ? WHERE id = ?`,
        [Number((inQty * inCost).toFixed(2)), Number(qty.toFixed(3)), row.id]
      );
    } else if (outQty > 0) {
      // Outbound: price at the running average at this point in time.
      const avg = qty > 0 ? value / qty : 0;
      const outValue = outQty * avg;
      qty -= outQty;
      value -= outValue;
      if (Math.abs(qty) < 0.0005) qty = 0;
      if (Math.abs(value) < 0.005) value = 0;
      await conn.query(
        `UPDATE stock_ledger SET unit_cost = ?, amount = ?, balance_qty = ? WHERE id = ?`,
        [Number(avg.toFixed(4)), Number(outValue.toFixed(2)), Number(qty.toFixed(3)), row.id]
      );
    } else {
      // No movement (defensive) — still stamp the running balance.
      await conn.query(`UPDATE stock_ledger SET balance_qty = ? WHERE id = ?`, [Number(qty.toFixed(3)), row.id]);
    }
  }

  const finalQty = Number(qty.toFixed(3));
  const finalAvg = qty > 0 ? Number((value / qty).toFixed(4)) : 0;

  // Fetch a uom to persist (keep existing if we have one).
  const [[uomRow]] = await conn.query(
    `SELECT uom FROM stock_ledger WHERE warehouse_id = ? AND material_id = ?
     ORDER BY transaction_date DESC, id DESC LIMIT 1`,
    [warehouseId, materialId]
  );
  lastUom = uomRow?.uom || null;

  const [[existing]] = await conn.query(
    `SELECT id FROM warehouse_stock WHERE warehouse_id = ? AND material_id = ? FOR UPDATE`,
    [warehouseId, materialId]
  );
  if (existing) {
    await conn.query(
      `UPDATE warehouse_stock SET current_qty = ?, avg_unit_cost = ?, uom = COALESCE(?, uom) WHERE id = ?`,
      [finalQty, finalAvg, lastUom, existing.id]
    );
  } else {
    await conn.query(
      `INSERT INTO warehouse_stock (warehouse_id, material_id, uom, current_qty, avg_unit_cost)
       VALUES (?,?,?,?,?)`,
      [warehouseId, materialId, lastUom, finalQty, finalAvg]
    );
  }

  return { qty: finalQty, avg_unit_cost: finalAvg };
}

/**
 * Re-price posted MATERIAL ISSUES for a (warehouse, material) so their stored
 * cost matches the freshly rebuilt moving-average in the ledger.
 *
 * Costing reports read material_issue_items.amount (frozen at post time). After a
 * backdated receipt/opening shifts historical average rates, the rebuilt
 * stock_ledger issue rows already carry the corrected unit_cost/amount — this
 * copies those corrected values back onto the issue line items (and refreshes
 * the issue header totals) so costing stays consistent.
 *
 * Must run AFTER rebuildStockValuation for the same pair, inside the same conn.
 */
export async function repriceIssuesForItem(conn, warehouseId, materialId) {
  // Corrected issue costs now live on the ledger rows for this item.
  const [ledgerIssues] = await conn.query(
    `SELECT reference_id, unit_cost, out_qty, amount
       FROM stock_ledger
      WHERE warehouse_id = ? AND material_id = ?
        AND reference_type = 'material_issue' AND out_qty > 0`,
    [warehouseId, materialId]
  );

  const touchedIssues = new Set();
  for (const lr of ledgerIssues) {
    await conn.query(
      `UPDATE material_issue_items
          SET unit_cost = ?, amount = ?
        WHERE issue_id = ? AND material_id = ?`,
      [_n(lr.unit_cost), _n(lr.amount), lr.reference_id, materialId]
    );
    touchedIssues.add(lr.reference_id);
  }

  // Refresh header totals for each affected issue.
  for (const issueId of touchedIssues) {
    await conn.query(
      `UPDATE material_issues mi
          SET total_material_cost = (
                SELECT COALESCE(SUM(amount), 0) FROM material_issue_items WHERE issue_id = mi.id
              ),
              grand_total = (
                SELECT COALESCE(SUM(amount), 0) FROM material_issue_items WHERE issue_id = mi.id
              ) + COALESCE(mi.loading_unloading, 0) + COALESCE(mi.other_charges, 0)
        WHERE mi.id = ?`,
      [issueId]
    );
  }

  return touchedIssues.size;
}

/**
 * Rebuild valuation AND re-price dependent issues for a (warehouse, material).
 * This is the single entry point transaction models should call after changing
 * the ledger, so both the live stock AND downstream issue costing stay correct.
 */
export async function rebuildAndReprice(conn, warehouseId, materialId) {
  await rebuildStockValuation(conn, warehouseId, materialId);
  await repriceIssuesForItem(conn, warehouseId, materialId);
}

/**
 * Convenience: rebuild valuation for every (warehouse, material) touched by a
 * given reference (e.g. all lines of a stock transfer that spans two warehouses).
 * Pass the affected pairs explicitly.
 */
export async function rebuildForPairs(conn, pairs) {
  const seen = new Set();
  for (const p of pairs) {
    const key = `${p.warehouseId}:${p.materialId}`;
    if (seen.has(key) || p.warehouseId == null || p.materialId == null) continue;
    seen.add(key);
    await rebuildStockValuation(conn, p.warehouseId, p.materialId);
  }
}

/**
 * One-time / maintenance: rebuild valuation and re-price issues for EVERY
 * (warehouse, material) that appears in the stock ledger. Use this to correct
 * historical data that was built incrementally before date-ordered rebuilding
 * existed (e.g. legacy backdated edits).
 *
 * Runs in a single transaction so the whole recompute is atomic.
 */
export async function rebuildAllStock() {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [pairs] = await conn.query(
      `SELECT DISTINCT warehouse_id, material_id FROM stock_ledger
        WHERE warehouse_id IS NOT NULL AND material_id IS NOT NULL`
    );
    for (const p of pairs) {
      await rebuildStockValuation(conn, p.warehouse_id, p.material_id);
      await repriceIssuesForItem(conn, p.warehouse_id, p.material_id);
    }
    await conn.commit();
    return { pairs: pairs.length };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Gets the current stock for a material in a warehouse.
 */
export async function getStock(warehouseId, materialId) {
  const [[row]] = await pool.query(
    `SELECT current_qty, avg_unit_cost, uom FROM warehouse_stock WHERE warehouse_id=? AND material_id=?`,
    [warehouseId, materialId]
  );
  return row || { current_qty: 0, avg_unit_cost: 0, uom: null };
}

/**
 * Gets all stock for a warehouse (for transfer/issue pages).
 */
export async function getWarehouseStock(warehouseId) {
  const [rows] = await pool.query(
    `SELECT ws.material_id, m.name AS material_name, m.code AS material_code,
       ws.uom, ws.current_qty, ws.avg_unit_cost
     FROM warehouse_stock ws
     JOIN materials m ON ws.material_id = m.id
     WHERE ws.warehouse_id=? AND ws.current_qty > 0
     ORDER BY m.name ASC`,
    [warehouseId]
  );
  return rows;
}

/**
 * Checks if warehouse allows negative stock.
 */
export async function allowsNegativeStock(warehouseId) {
  const [[row]] = await pool.query(
    `SELECT allow_negative_stock FROM warehouses WHERE id=?`, [warehouseId]
  );
  return row ? row.allow_negative_stock === 1 : false;
}
