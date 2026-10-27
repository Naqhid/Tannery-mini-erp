import pool from '../config/db.js';

// =============================================================================
// STOCK LEDGER = THE SINGLE SOURCE OF TRUTH FOR STOCK.
// -----------------------------------------------------------------------------
// Live stock, average rate and the daily opening→in→out→balance picture are ALL
// derived from stock_ledger. There is no separate warehouse_stock table and no
// parallel material_transactions "availability engine" — every reader asks the
// ledger.
//
// Per (warehouse, material), rows are replayed in transaction-date then id
// order. On each row we stamp:
//   opening_qty / opening_value  = running balance BEFORE the row
//   in_value                     = in_qty * unit_cost (inbound)
//   out_value                    = out_qty * running average (outbound, repriced)
//   balance_qty / balance_value  = running balance AFTER the row
//   unit_cost / amount           = kept for inbound; repriced for outbound
// avg_rate for any row = balance_value / balance_qty.
// The FIRST row per (warehouse, material) seeds opening_qty/opening_value from
// the chemical material master (materials.opening_stock / opening_stock_value)
// when that row is an 'Opening' row with no explicit opening already set.
// Each row's balance becomes the next row's opening → natural day-to-day
// carry forward for the same item.
// =============================================================================

const _n = (v) => Number(v) || 0;

/**
 * No-op shim kept for backward compatibility with callers that used to push an
 * incremental warehouse_stock update. The ledger is now rebuilt date-ordered by
 * rebuildAndReprice, so per-row incremental stock maintenance is unnecessary.
 * Kept as an exported function so existing imports keep working.
 */
export async function updateStock() {
  // Intentionally empty: stock is derived from stock_ledger via rebuildAndReprice.
}

/**
 * Inserts a ledger entry within a transaction. Value columns are left at their
 * defaults here and are authoritatively (re)computed by rebuildStockValuation.
 */
export async function addLedgerEntry(conn, entry) {
  await conn.query(
    `INSERT INTO stock_ledger (
      transaction_date, transaction_type, reference_type, reference_id, reference_no,
      warehouse_id, material_id, uom, batch_no, expiry_date,
      in_qty, in_value, out_qty, out_value, unit_cost, amount,
      opening_qty, opening_value, balance_qty, balance_value, remarks, created_by
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      entry.transaction_date, entry.transaction_type, entry.reference_type,
      entry.reference_id, entry.reference_no || null,
      entry.warehouse_id, entry.material_id, entry.uom || null,
      entry.batch_no || null, entry.expiry_date || null,
      entry.in_qty || 0, entry.in_value || 0,
      entry.out_qty || 0, entry.out_value || 0,
      entry.unit_cost || 0, entry.amount || 0,
      entry.opening_qty || 0, entry.opening_value || 0,
      entry.balance_qty || 0, entry.balance_value || 0,
      entry.remarks || null, entry.created_by || null,
    ]
  );
}

/**
 * Rebuild the running opening/in/out/balance columns and moving-average cost for
 * one (warehouse, material) by replaying every stock_ledger row in
 * transaction-date then id order. This is the single authority for live stock.
 *
 * Must be called inside an active transaction (pass the same `conn`).
 * Returns { qty, value, avg_unit_cost } of the final balance.
 */
export async function rebuildStockValuation(conn, warehouseId, materialId) {
  const [rows] = await conn.query(
    `SELECT id, in_qty, out_qty, unit_cost, transaction_type
       FROM stock_ledger
      WHERE warehouse_id = ? AND material_id = ?
      ORDER BY transaction_date ASC, id ASC`,
    [warehouseId, materialId]
  );

  if (!rows.length) return { qty: 0, value: 0, avg_unit_cost: 0 };

  // Opening stock from the chemical material master is materialized as an
  // explicit 'Opening' ledger row (reference_type='material_master') carrying
  // the master's opening qty/value in its in_qty/amount. We therefore do NOT
  // re-seed opening from the master here — doing so would double-count it. The
  // ledger is fully self-contained: each row's opening is simply the running
  // balance carried from the previous row.

  let qty = 0;      // running quantity
  let value = 0;    // running total value

  for (const row of rows) {
    const inQty = _n(row.in_qty);
    const outQty = _n(row.out_qty);

    // Opening (balance BEFORE this row) = running balance so far.
    const openingQty = qty;
    const openingValue = value;

    if (inQty > 0) {
      // Inbound: use the row's own unit cost to move the weighted average.
      const inCost = _n(row.unit_cost);
      const inValue = inQty * inCost;
      qty += inQty;
      value += inValue;
      if (Math.abs(qty) < 0.0005) qty = 0;
      await conn.query(
        `UPDATE stock_ledger
            SET opening_qty=?, opening_value=?, in_value=?, out_value=0,
                amount=?, balance_qty=?, balance_value=?
          WHERE id=?`,
        [
          Number(openingQty.toFixed(3)), Number(openingValue.toFixed(2)),
          Number(inValue.toFixed(2)), Number(inValue.toFixed(2)),
          Number(qty.toFixed(3)), Number(value.toFixed(2)), row.id,
        ]
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
        `UPDATE stock_ledger
            SET opening_qty=?, opening_value=?, out_value=?, in_value=0,
                unit_cost=?, amount=?, balance_qty=?, balance_value=?
          WHERE id=?`,
        [
          Number(openingQty.toFixed(3)), Number(openingValue.toFixed(2)),
          Number(outValue.toFixed(2)), Number(avg.toFixed(4)),
          Number(outValue.toFixed(2)), Number(qty.toFixed(3)),
          Number(value.toFixed(2)), row.id,
        ]
      );
    } else {
      // No movement (defensive) — still stamp opening + running balance.
      await conn.query(
        `UPDATE stock_ledger
            SET opening_qty=?, opening_value=?, balance_qty=?, balance_value=?
          WHERE id=?`,
        [
          Number(openingQty.toFixed(3)), Number(openingValue.toFixed(2)),
          Number(qty.toFixed(3)), Number(value.toFixed(2)), row.id,
        ]
      );
    }
  }

  const finalQty = Number(qty.toFixed(3));
  const finalValue = Number(value.toFixed(2));
  const finalAvg = qty > 0 ? Number((value / qty).toFixed(4)) : 0;
  return { qty: finalQty, value: finalValue, avg_unit_cost: finalAvg };
}

/**
 * Re-price posted MATERIAL ISSUES for a (warehouse, material) so their stored
 * cost matches the freshly rebuilt moving-average in the ledger.
 * Must run AFTER rebuildStockValuation for the same pair, inside the same conn.
 */
export async function repriceIssuesForItem(conn, warehouseId, materialId) {
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
 * Single entry point transaction models call after changing the ledger.
 */
export async function rebuildAndReprice(conn, warehouseId, materialId) {
  await rebuildStockValuation(conn, warehouseId, materialId);
  await repriceIssuesForItem(conn, warehouseId, materialId);
}

/**
 * Rebuild valuation for every (warehouse, material) pair passed in.
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
 * (warehouse, material) that appears in the stock ledger. Runs atomically.
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
 * Live stock for a (warehouse, material) = the LATEST ledger row's running
 * balance (item + date sort). Returns { current_qty, avg_unit_cost, uom }.
 */
export async function getStock(warehouseId, materialId) {
  const [[row]] = await pool.query(
    `SELECT balance_qty AS current_qty, balance_value,
            uom
       FROM stock_ledger
      WHERE warehouse_id=? AND material_id=?
      ORDER BY transaction_date DESC, id DESC
      LIMIT 1`,
    [warehouseId, materialId]
  );
  if (!row) return { current_qty: 0, avg_unit_cost: 0, uom: null };
  const qty = _n(row.current_qty);
  const avg = qty > 0 ? _n(row.balance_value) / qty : 0;
  return { current_qty: qty, avg_unit_cost: Number(avg.toFixed(4)), uom: row.uom || null };
}

/**
 * All live stock for a warehouse (for transfer/issue pages). One row per
 * material = its latest ledger balance, only where balance_qty > 0.
 */
export async function getWarehouseStock(warehouseId) {
  const [rows] = await pool.query(
    `SELECT sl.material_id, m.name AS material_name, m.code AS material_code,
            sl.uom, sl.balance_qty AS current_qty,
            CASE WHEN sl.balance_qty > 0 THEN sl.balance_value / sl.balance_qty ELSE 0 END AS avg_unit_cost
       FROM stock_ledger sl
       JOIN (
         SELECT warehouse_id, material_id, MAX(transaction_date) AS md
           FROM stock_ledger
          WHERE warehouse_id=?
          GROUP BY warehouse_id, material_id
       ) last_date
         ON last_date.warehouse_id=sl.warehouse_id
        AND last_date.material_id=sl.material_id
        AND last_date.md=sl.transaction_date
       JOIN (
         SELECT warehouse_id, material_id, transaction_date, MAX(id) AS mid
           FROM stock_ledger
          WHERE warehouse_id=?
          GROUP BY warehouse_id, material_id, transaction_date
       ) last_id
         ON last_id.warehouse_id=sl.warehouse_id
        AND last_id.material_id=sl.material_id
        AND last_id.transaction_date=sl.transaction_date
        AND last_id.mid=sl.id
       JOIN materials m ON sl.material_id = m.id
      WHERE sl.warehouse_id=? AND sl.balance_qty > 0
      ORDER BY m.name ASC`,
    [warehouseId, warehouseId, warehouseId]
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
