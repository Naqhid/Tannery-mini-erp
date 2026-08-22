import pool from '../config/db.js';

const n = (v) => Number(v) || 0;

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

export async function insertTransaction(conn, row) {
  // Initialise opening balance only for the first transaction of this item/warehouse.
  // Later transactions must not repeatedly add material master opening stock.
  if (row.opening_qty == null && row.opening_value == null) {
    const [[existing]] = await conn.query(
      `SELECT transaction_id FROM material_transactions WHERE warehouse_id=? AND item_id=? LIMIT 1`,
      [row.warehouse_id, row.item_id]
    );
    if (!existing) {
      const [[material]] = await conn.query(
        `SELECT opening_stock, opening_stock_value, current_stock, rate, last_purchase_price FROM materials WHERE id=?`,
        [row.item_id]
      );
      if (material) {
        const openingQty = n(material.opening_stock) || n(material.current_stock);
        const rate = n(material.rate) || n(material.last_purchase_price);
        row.opening_qty = openingQty;
        row.opening_value = n(material.opening_stock_value) || openingQty * rate;
      }
    }
  }
  const [result] = await conn.query(
    `INSERT INTO material_transactions
     (transaction_date, transaction_type, reference_no, warehouse_id, item_id, batch_no,
      receipt_qty, opening_qty, opening_value, receipt_value, issue_qty, issue_value,
      balance_qty, avg_rate, balance_value, reference_type, reference_id)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      row.transaction_date, row.transaction_type, row.reference_no || null,
      row.warehouse_id, row.item_id, row.batch_no || null,
      n(row.receipt_qty), n(row.opening_qty), n(row.opening_value), n(row.receipt_value),
      n(row.issue_qty), n(row.issue_value), n(row.balance_qty), n(row.avg_rate),
      n(row.balance_value), row.reference_type || null, row.reference_id || null,
    ]
  );
  return result.insertId;
}

// Recalculate the running balance and weighted average for one material/warehouse.
export async function recalculateMaterialTransactions(conn, warehouseId, itemId) {
  const [rows] = await conn.query(
    `SELECT * FROM material_transactions WHERE warehouse_id=? AND item_id=?
     ORDER BY transaction_date ASC, transaction_id ASC`,
    [warehouseId, itemId]
  );
  let qty = 0;
  let value = 0;
  for (const row of rows) {
    const receiptQty = n(row.receipt_qty);
    const openingQty = n(row.opening_qty);
    const openingValue = n(row.opening_value);
    const issueQty = n(row.issue_qty);
    const receiptValue = n(row.receipt_value);
    qty += openingQty + receiptQty;
    value += openingValue + receiptValue;
    const rateBeforeIssue = qty > 0 ? value / qty : 0;
    const issueValue = issueQty * rateBeforeIssue;
    qty -= issueQty;
    value -= issueValue;
    if (Math.abs(qty) < 0.000001) qty = 0;
    if (Math.abs(value) < 0.005) value = 0;
    const avg = qty > 0 ? value / qty : 0;
    await conn.query(
      `UPDATE material_transactions
       SET issue_value=?, balance_qty=?, avg_rate=?, balance_value=?
       WHERE transaction_id=?`,
      [issueValue, qty, avg, value, row.transaction_id]
    );
  }
}

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
  for (const a of affected.values()) await recalculateMaterialTransactions(conn, a.warehouse_id, a.item_id);
}

export async function getIssueItemInfo({ warehouseId, itemId, date }) {
  const conn = await pool.getConnection();
  try {
    let latest = await getLatestForItem(conn, { warehouseId, itemId, date });
    // Fallback: if no transaction found for specific warehouse, search across all warehouses
    if (!latest) {
      const [rows] = await conn.query(
        `SELECT * FROM material_transactions
         WHERE item_id=? AND DATE(transaction_date) <= DATE(?)
         ORDER BY transaction_date DESC, transaction_id DESC LIMIT 1`,
        [itemId, date]
      );
      latest = rows[0] || null;
    }
    return {
      available_qty: latest ? n(latest.balance_qty) : 0,
      avg_rate: latest ? n(latest.avg_rate) : 0,
      balance_date: latest ? latest.transaction_date : null,
    };
  } finally { conn.release(); }
}
