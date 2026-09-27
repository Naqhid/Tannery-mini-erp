import pool from '../config/db.js';

const n = (v) => Number(v) || 0;

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
    // CASE B or C: carry forward previous balance for THIS warehouse
    return {
      opening_stock: n(prev[0].balance_qty),
      opening_value: n(prev[0].balance_value),
    };
  }

  // No prior transaction in THIS warehouse. Seed the opening from the material
  // master's opening_stock — but ONLY when the material's default_warehouse
  // matches this warehouse. This keeps opening stock warehouse-scoped and
  // consistent with getIssueItemInfo's availability fallback, so the balance
  // computed at post time matches what the availability check showed.
  const [[material]] = await conn.query(
    `SELECT opening_stock, opening_stock_value, current_stock, default_warehouse, rate, last_purchase_price
     FROM materials WHERE id=?`,
    [itemId]
  );
  if (material && material.default_warehouse) {
    const [[wh]] = await conn.query(
      `SELECT name, code FROM warehouses WHERE id=?`,
      [warehouseId]
    );
    if (wh) {
      const dw = String(material.default_warehouse).trim().toLowerCase();
      const matchesName = wh.name && dw === String(wh.name).trim().toLowerCase();
      const matchesCode = wh.code && dw === String(wh.code).trim().toLowerCase();
      if (matchesName || matchesCode) {
        const openingQty = n(material.opening_stock) || n(material.current_stock);
        const rate = n(material.rate) || n(material.last_purchase_price);
        return {
          opening_stock: openingQty,
          opening_value: n(material.opening_stock_value) || openingQty * rate,
        };
      }
    }
  }

  // Otherwise this warehouse starts empty for this item.
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
    // Availability is STRICTLY scoped to the selected warehouse. We first use
    // this warehouse's latest transaction balance — never another warehouse's.
    // If there is no transaction yet, we fall back to the material master's
    // opening_stock, but only when that material's default_warehouse is this
    // warehouse (see below). Warehouse A can never consume Warehouse B's stock.
    const latest = await getLatestForItem(conn, { warehouseId, itemId, date });

    if (latest) {
      return {
        available_qty: n(latest.balance_qty),
        avg_rate: n(latest.avg_rate),
        balance_date: latest.transaction_date,
      };
    }

    // No transaction in THIS warehouse yet. Fall back to the material master's
    // opening_stock, but ONLY when the material's default_warehouse matches the
    // warehouse being issued from. This keeps availability warehouse-scoped:
    // opening stock is treated as belonging to the material's default warehouse
    // only, so Warehouse A still can never use Warehouse B's opening stock.
    const [[material]] = await conn.query(
      `SELECT opening_stock, default_warehouse, rate, last_purchase_price FROM materials WHERE id=?`,
      [itemId]
    );
    const masterRate = material ? (n(material.rate) || n(material.last_purchase_price)) : 0;

    let openingForThisWarehouse = 0;
    if (material && material.default_warehouse) {
      // Resolve the selected warehouse's name/code to compare with default_warehouse
      // (which is stored as a text name/code on the material master).
      const [[wh]] = await conn.query(
        `SELECT name, code FROM warehouses WHERE id=?`,
        [warehouseId]
      );
      if (wh) {
        const dw = String(material.default_warehouse).trim().toLowerCase();
        const matchesName = wh.name && dw === String(wh.name).trim().toLowerCase();
        const matchesCode = wh.code && dw === String(wh.code).trim().toLowerCase();
        if (matchesName || matchesCode) {
          openingForThisWarehouse = n(material.opening_stock);
        }
      }
    }

    return {
      available_qty: openingForThisWarehouse,
      avg_rate: masterRate,
      balance_date: null,
    };
  } finally { conn.release(); }
}
