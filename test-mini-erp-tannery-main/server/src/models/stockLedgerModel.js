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
