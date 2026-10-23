import pool from '../config/db.js';

// =============================================================================
// LEGACY SHIM — material_transactions is GONE.
// -----------------------------------------------------------------------------
// stock_ledger is now the single source of truth for stock. These functions
// keep their old signatures so existing callers (material receipt / issue /
// physical stock) don't need to change, but every read now comes from the
// stock_ledger and the old write helpers are no-ops (the ledger rows + the
// date-ordered rebuild in stockLedgerModel already maintain balances).
// =============================================================================

const n = (v) => Number(v) || 0;

/**
 * Availability + costing info for issuing an item, read from the LEDGER.
 *
 * Returns the item's CURRENT on-hand in the selected warehouse — the latest
 * ledger row's running balance (item + date sort). Average rate is derived from
 * balance_value / balance_qty. Opening stock from the material master is already
 * folded into the ledger's first-row opening by rebuildStockValuation, so there
 * is no separate master fallback here.
 */
export async function getIssueItemInfo({ warehouseId, itemId }) {
  const [[row]] = await pool.query(
    `SELECT balance_qty, balance_value, transaction_date
       FROM stock_ledger
      WHERE warehouse_id=? AND material_id=?
      ORDER BY transaction_date DESC, id DESC
      LIMIT 1`,
    [warehouseId, itemId]
  );

  if (row) {
    const qty = n(row.balance_qty);
    const avg = qty > 0 ? n(row.balance_value) / qty : 0;
    return {
      available_qty: qty,
      avg_rate: Number(avg.toFixed(4)),
      balance_date: row.transaction_date,
    };
  }

  // No ledger row yet for this (warehouse, material). Surface the master rate
  // for pricing only; availability is 0 until a receipt/opening posts a row.
  // If the warehouse is the material's default warehouse and it has opening
  // stock, the first posted movement's rebuild will seed that opening — but we
  // also expose it here so a first issue in the default warehouse can price and
  // validate against the master opening.
  const [[m]] = await pool.query(
    `SELECT opening_stock, opening_stock_value, rate, last_purchase_price,
            standard_cost, default_warehouse
       FROM materials WHERE id=?`,
    [itemId]
  );
  if (!m) return { available_qty: 0, avg_rate: 0, balance_date: null };

  const masterRate = n(m.rate) || n(m.last_purchase_price) || n(m.standard_cost);
  const openingQty = n(m.opening_stock);
  if (openingQty > 0 && m.default_warehouse) {
    let defId = parseInt(m.default_warehouse, 10) || 0;
    if (!defId) {
      const [[w]] = await pool.query(
        'SELECT id FROM warehouses WHERE name=? OR name LIKE ? LIMIT 1',
        [m.default_warehouse, `%${m.default_warehouse}%`]
      );
      defId = w ? w.id : 0;
    }
    if (defId && Number(defId) === Number(warehouseId)) {
      const openVal = n(m.opening_stock_value) || openingQty * masterRate;
      const avg = openingQty > 0 ? openVal / openingQty : masterRate;
      return { available_qty: openingQty, avg_rate: Number(avg.toFixed(4)), balance_date: null };
    }
  }
  return { available_qty: 0, avg_rate: Number(masterRate.toFixed(4)), balance_date: null };
}

/**
 * No-op. Stock is maintained entirely in stock_ledger. Receipt/Issue models
 * write their ledger rows and then call rebuildAndReprice, which recomputes the
 * running opening/in/out/balance. Kept so existing imports keep working.
 */
export async function replaceReferenceTransactions() {
  // Intentionally empty — material_transactions no longer exists.
}

/**
 * No-op. Opening stock is seeded directly onto the first ledger row per
 * (warehouse, material) by rebuildStockValuation (from the material master),
 * so there is nothing to pre-seed. Returns false (nothing seeded).
 */
export async function ensureOpeningStockSeeded() {
  return false;
}

/**
 * No-op kept for backward compatibility. The ledger rebuild handles running
 * balances; there is no separate material_transactions table to recalculate.
 */
export async function recalculateMaterialTransactions() {
  // Intentionally empty.
}
