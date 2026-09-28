import pool from '../config/db.js';

const n = (v) => Number(v) || 0;

/**
 * Resolve a material's `default_warehouse` value (which may be a numeric id or a
 * warehouse name) into a warehouse id. Returns 0 when it cannot be resolved.
 */
async function resolveWarehouseId(conn, warehouseRef) {
  if (!warehouseRef) return 0;
  const numericId = parseInt(warehouseRef, 10);
  if (numericId) {
    const [[wh]] = await conn.query('SELECT id FROM warehouses WHERE id = ? LIMIT 1', [numericId]);
    if (wh) return wh.id;
  }
  const [[wh1]] = await conn.query('SELECT id FROM warehouses WHERE name = ? LIMIT 1', [warehouseRef]);
  if (wh1) return wh1.id;
  const [[wh2]] = await conn.query('SELECT id FROM warehouses WHERE name LIKE ? LIMIT 1', [`%${warehouseRef}%`]);
  if (wh2) return wh2.id;
  return 0;
}

/**
 * Get the latest transaction for an item at/before a given date (same warehouse).
 */
export async function getLatestForItem(conn, { warehouseId, itemId, date }) {
  const [rows] = await conn.query(
    `SELECT * FROM material_transactions
     WHERE warehouse_id=? AND item_id=? AND DATE(transaction_date) <= DATE(?)
     ORDER BY transaction_date DESC, transaction_id DESC LIMIT 1`,
    [warehouseId, itemId, date]
  );
  return rows[0] || null;
}

export async function getLatestBalance(conn, { warehouseId, itemId }) {
  const [rows] = await conn.query(
    `SELECT * FROM material_transactions
     WHERE warehouse_id=? AND item_id=?
     ORDER BY transaction_date DESC, transaction_id DESC LIMIT 1`,
    [warehouseId, itemId]
  );
  return rows[0] || null;
}

/**
 * Determine opening_stock and opening_value for a new transaction.
 * 
 * CASE A: First-ever transaction for this item → fetch from Chemical/Material Master.
 * CASE B: First transaction of a new month → carry forward previous month closing.
 * CASE C: Subsequent transaction in same month → use previous transaction balance.
 */
async function resolveOpening(conn, { warehouseId, itemId, transactionDate }) {
  // Find the most recent prior transaction for this item in this warehouse
  const [prev] = await conn.query(
    `SELECT balance_qty, balance_value, transaction_date FROM material_transactions
     WHERE warehouse_id=? AND item_id=? AND transaction_date <= ?
     ORDER BY transaction_date DESC, transaction_id DESC LIMIT 1`,
    [warehouseId, itemId, transactionDate]
  );

  if (prev.length > 0) {
    // CASE B or C: carry forward previous balance for THIS warehouse.
    // NOTE: the material master already seeds a warehouse-scoped 'OPENING'
    // transaction (reference_type='material_master') into the material's
    // default_warehouse whenever opening_stock > 0. That row is picked up here
    // as the prior balance, so opening stock is handled without any extra
    // master-field fallback (which previously caused double-counting/drift).
    return {
      opening_stock: n(prev[0].balance_qty),
      opening_value: n(prev[0].balance_value),
    };
  }

  // No prior transaction in THIS warehouse for this item — starts empty here.
  // We deliberately do NOT re-seed from materials.opening_stock: that is already
  // represented by the material_master OPENING transaction in the default
  // warehouse. Re-seeding here would double count across warehouses/edits.
  return { opening_stock: 0, opening_value: 0 };
}

/**
 * Insert a Material Transaction. 
 * If opening_stock/opening_value are not provided (null), resolve them automatically.
 */
export async function insertTransaction(conn, row) {
  // Resolve opening if not explicitly provided
  if (row.opening_stock == null && row.opening_value == null) {
    const opening = await resolveOpening(conn, {
      warehouseId: row.warehouse_id,
      itemId: row.item_id,
      transactionDate: row.transaction_date,
    });
    row.opening_stock = opening.opening_stock;
    row.opening_value = opening.opening_value;
  }

  const [result] = await conn.query(
    `INSERT INTO material_transactions
     (transaction_date, transaction_type, reference_no, warehouse_id, item_id, batch_no,
      receipt_qty, opening_stock, opening_value, receipt_value, issue_qty, issue_value,
      balance_qty, avg_rate, balance_value, reference_type, reference_id)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      row.transaction_date, row.transaction_type, row.reference_no || null,
      row.warehouse_id, row.item_id, row.batch_no || null,
      n(row.receipt_qty), n(row.opening_stock), n(row.opening_value), n(row.receipt_value),
      n(row.issue_qty), n(row.issue_value), n(row.balance_qty), n(row.avg_rate),
      n(row.balance_value), row.reference_type || null, row.reference_id || null,
    ]
  );
  return result.insertId;
}

/**
 * Recalculate the running balance and weighted average for one material/warehouse.
 * Handles backdated transactions correctly by processing in chronological order.
 */
export async function recalculateMaterialTransactions(conn, warehouseId, itemId) {
  const [rows] = await conn.query(
    `SELECT * FROM material_transactions WHERE warehouse_id=? AND item_id=?
     ORDER BY transaction_date ASC, transaction_id ASC`,
    [warehouseId, itemId]
  );

  let qty = 0;
  let value = 0;
  let isFirst = true;

  for (const row of rows) {
    const receiptQty = n(row.receipt_qty);
    const issueQty = n(row.issue_qty);
    const receiptValue = n(row.receipt_value);

    let openingStock, openingValue;

    if (isFirst) {
      // First transaction gets its opening from what was originally set (Material Master values)
      openingStock = n(row.opening_stock);
      openingValue = n(row.opening_value);
      isFirst = false;
    } else {
      // Subsequent transactions carry forward previous balance
      openingStock = qty;
      openingValue = value;
    }

    qty = openingStock + receiptQty;
    value = openingValue + receiptValue;

    const rateBeforeIssue = qty > 0 ? value / qty : 0;
    const issueValue = issueQty * rateBeforeIssue;

    qty -= issueQty;
    value -= issueValue;

    if (Math.abs(qty) < 0.000001) qty = 0;
    if (Math.abs(value) < 0.005) value = 0;

    // Preserve last valid avg rate when balance reaches zero
    const avg = qty > 0 ? value / qty : (rateBeforeIssue > 0 ? rateBeforeIssue : 0);

    await conn.query(
      `UPDATE material_transactions
       SET opening_stock=?, opening_value=?, issue_value=?, balance_qty=?, avg_rate=?, balance_value=?
       WHERE transaction_id=?`,
      [openingStock, openingValue, issueValue, qty, avg, value, row.transaction_id]
    );
  }
}

/**
 * Replace all transactions for a given reference (e.g., material_receipt #5).
 * Prevents duplicates by deleting old ones first.
 */
export async function replaceReferenceTransactions(conn, referenceType, referenceId, rows) {
  const [old] = await conn.query(
    `SELECT DISTINCT warehouse_id, item_id FROM material_transactions
     WHERE reference_type=? AND reference_id=?`, [referenceType, referenceId]
  );
  await conn.query('DELETE FROM material_transactions WHERE reference_type=? AND reference_id=?', [referenceType, referenceId]);
  const affected = new Map(old.map((r) => [`${r.warehouse_id}:${r.item_id}`, r]));

  for (const row of rows) {
    await insertTransaction(conn, { ...row, reference_type: referenceType, reference_id: referenceId });
    affected.set(`${row.warehouse_id}:${row.item_id}`, { warehouse_id: row.warehouse_id, item_id: row.item_id });
  }

  // Recalculate all affected item balances (handles backdated insertions)
  for (const a of affected.values()) {
    await recalculateMaterialTransactions(conn, a.warehouse_id, a.item_id);
  }
}

export async function getIssueItemInfo({ warehouseId, itemId, date }) {
  const conn = await pool.getConnection();
  try {
    // Availability is STRICTLY scoped to the selected warehouse. We use this
    // warehouse's latest transaction balance only — never another warehouse's.
    // Opening stock is already represented as a warehouse-scoped 'OPENING'
    // transaction (written by the material master into the default warehouse),
    // so it is naturally picked up here for the correct warehouse. This
    // guarantees Warehouse A can never consume Warehouse B's stock.
    const latest = await getLatestForItem(conn, { warehouseId, itemId, date });

    if (latest) {
      return {
        available_qty: n(latest.balance_qty),
        avg_rate: n(latest.avg_rate),
        balance_date: latest.transaction_date,
      };
    }

    // No transaction in THIS warehouse. Fall back to the material master's
    // opening stock, but ONLY when the selected warehouse is this material's
    // configured default warehouse. This keeps availability warehouse-scoped:
    // opening stock only counts in the warehouse it belongs to.
    const [[material]] = await conn.query(
      `SELECT rate, last_purchase_price, standard_cost,
              opening_stock, default_warehouse
         FROM materials WHERE id=?`,
      [itemId]
    );
    const masterRate = material
      ? (n(material.rate) || n(material.last_purchase_price) || n(material.standard_cost))
      : 0;

    if (material && n(material.opening_stock) > 0 && material.default_warehouse) {
      const defaultWarehouseId = await resolveWarehouseId(conn, material.default_warehouse);
      if (defaultWarehouseId && Number(defaultWarehouseId) === Number(warehouseId)) {
        return {
          available_qty: n(material.opening_stock),
          avg_rate: masterRate,
          balance_date: null,
        };
      }
    }

    // Not the default warehouse (or no opening stock) → availability is 0 here.
    // We still surface the material-master rate for unit-cost/pricing purposes
    // only (it does NOT contribute to availability).
    return {
      available_qty: 0,
      avg_rate: masterRate,
      balance_date: null,
    };
  } finally { conn.release(); }
}

/**
 * Ensure that a material's master opening stock is materialized as a real
 * OPENING transaction (+ stock_ledger + warehouse_stock) for the given
 * warehouse, when no stock record yet exists there.
 *
 * This is used right before an issue is posted so that consuming the
 * "master opening stock" fallback leaves a consistent ledger chain instead of
 * a phantom negative balance. It only acts when:
 *   - there is NO existing material_transactions row for (warehouse, item), and
 *   - the material has opening_stock > 0, and
 *   - the given warehouse is the material's configured default warehouse.
 *
 * Runs on the passed-in connection so it joins the caller's transaction.
 * Returns true when it seeded opening stock, false otherwise.
 */
export async function ensureOpeningStockSeeded(conn, { warehouseId, itemId, date }) {
  // If any transaction already exists for this pair, nothing to seed.
  const [[existing]] = await conn.query(
    `SELECT transaction_id FROM material_transactions
      WHERE warehouse_id=? AND item_id=? LIMIT 1`,
    [warehouseId, itemId]
  );
  if (existing) return false;

  const [[material]] = await conn.query(
    `SELECT code, rate, last_purchase_price, standard_cost,
            opening_stock, default_warehouse
       FROM materials WHERE id=?`,
    [itemId]
  );
  if (!material) return false;

  const openingQty = n(material.opening_stock);
  if (openingQty <= 0 || !material.default_warehouse) return false;

  const defaultWarehouseId = await resolveWarehouseId(conn, material.default_warehouse);
  if (!defaultWarehouseId || Number(defaultWarehouseId) !== Number(warehouseId)) return false;

  const avgRate = n(material.rate) || n(material.last_purchase_price) || n(material.standard_cost);
  const openingValue = openingQty * avgRate;
  const txnDate = date || new Date().toISOString().split('T')[0];

  // a) stock_ledger row
  await conn.query(
    `INSERT INTO stock_ledger (
      transaction_date, transaction_type, reference_type, reference_id, reference_no,
      warehouse_id, material_id, uom, batch_no, expiry_date,
      in_qty, out_qty, unit_cost, amount, balance_qty, remarks, created_by
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      txnDate, 'Opening', 'material_master', itemId, material.code || null,
      warehouseId, itemId, null, null, null,
      openingQty, 0, avgRate, openingValue, openingQty,
      'Opening stock (material master)', null,
    ]
  );

  // b) warehouse_stock
  const [[ws]] = await conn.query(
    `SELECT id, current_qty FROM warehouse_stock WHERE warehouse_id=? AND material_id=? FOR UPDATE`,
    [warehouseId, itemId]
  );
  if (ws) {
    await conn.query(
      `UPDATE warehouse_stock SET current_qty=current_qty+?, avg_unit_cost=? WHERE id=?`,
      [openingQty, avgRate, ws.id]
    );
  } else {
    await conn.query(
      `INSERT INTO warehouse_stock (warehouse_id, material_id, uom, current_qty, avg_unit_cost)
       VALUES (?,?,?,?,?)`,
      [warehouseId, itemId, null, openingQty, avgRate]
    );
  }

  // c) material_transactions row (this is what the availability check reads)
  await conn.query(
    `INSERT INTO material_transactions
      (transaction_date, transaction_type, reference_no, warehouse_id, item_id,
       opening_stock, receipt_qty, receipt_value, balance_qty, avg_rate, balance_value, reference_type)
     VALUES (?, 'OPENING', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'material_master')`,
    [txnDate, material.code || null, warehouseId, itemId, 0, openingQty, openingValue, openingQty, avgRate, openingValue]
  );

  return true;
}
