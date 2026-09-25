import pool from '../../config/db.js';

// ─── Stock Summary ───────────────────────────────────────────────────────────
// Current on-hand quantity & value per material/warehouse (as-on = now).
export async function stockSummary({ warehouse_id, group_id, search, page = 1, limit = 10, sortBy, sortOrder }) {
  const params = [];
  let where = "m.status = 'Active'";
  if (group_id) { where += ' AND m.group_id = ?'; params.push(group_id); }
  if (search) {
    where += ' AND (m.name LIKE ? OR m.code LIKE ?)';
    const t = `%${search}%`; params.push(t, t);
  }
  // Driven from the materials master so EVERY chemical/material row appears,
  // even ones that only have opening stock and no warehouse_stock rows yet.
  // On-hand qty = SUM(warehouse_stock.current_qty) across warehouses, falling
  // back to the master current_stock. Rate falls back to the master rate.
  const whJoin = warehouse_id
    ? `LEFT JOIN warehouse_stock ws ON ws.material_id = m.id AND ws.warehouse_id = ?`
    : `LEFT JOIN warehouse_stock ws ON ws.material_id = m.id`;

  const allowed = ['material_name', 'material_code', 'current_qty', 'avg_unit_cost', 'stock_value'];
  const ord = sortOrder === 'asc' ? 'ASC' : 'DESC';
  const col = allowed.includes(sortBy) ? sortBy : 'material_name';
  const orderClause = col === 'material_name' && !sortBy ? 'm.name ASC' : `${col} ${ord}`;
  const offset = (page - 1) * limit;

  const whParams = warehouse_id ? [warehouse_id] : [];

  const selectFrom = `
     FROM materials m
     ${whJoin}
     LEFT JOIN group_master g ON m.group_id = g.id
     WHERE ${where}
     GROUP BY m.id`;

  const [rows] = await pool.query(
    `SELECT m.id, m.id AS material_id, m.code AS material_code, m.name AS material_name,
       g.name AS group_name, m.uom,
       COALESCE(NULLIF(SUM(ws.current_qty), 0), m.current_stock, 0) AS current_qty,
       COALESCE(MAX(ws.avg_unit_cost), m.rate, 0) AS avg_unit_cost,
       COALESCE(NULLIF(SUM(ws.current_qty), 0), m.current_stock, 0) * COALESCE(MAX(ws.avg_unit_cost), m.rate, 0) AS stock_value
     ${selectFrom}
     ORDER BY ${orderClause}
     LIMIT ? OFFSET ?`,
    [...whParams, ...params, Number(limit), Number(offset)]
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM materials m WHERE ${where}`,
    params
  );

  const [totalsRows] = await pool.query(
    `SELECT
       COALESCE(NULLIF(SUM(ws.current_qty), 0), m.current_stock, 0) AS qty,
       COALESCE(NULLIF(SUM(ws.current_qty), 0), m.current_stock, 0) * COALESCE(MAX(ws.avg_unit_cost), m.rate, 0) AS val
     ${selectFrom}`,
    [...whParams, ...params]
  );
  const totals = {
    total_qty: totalsRows.reduce((a, r) => a + Number(r.qty || 0), 0),
    total_value: totalsRows.reduce((a, r) => a + Number(r.val || 0), 0),
  };

  return { rows, total, totals };
}

// ─── Stock Valuation ─────────────────────────────────────────────────────────
// Same source as summary but focussed on value; positive qty only.
export async function stockValuation({ warehouse_id, group_id, search, page = 1, limit = 10, sortBy, sortOrder }) {
  const params = [];
  let where = 'ws.current_qty <> 0';
  if (warehouse_id) { where += ' AND ws.warehouse_id = ?'; params.push(warehouse_id); }
  if (group_id) { where += ' AND m.group_id = ?'; params.push(group_id); }
  if (search) {
    where += ' AND (m.name LIKE ? OR m.code LIKE ?)';
    const t = `%${search}%`; params.push(t, t);
  }

  const allowed = ['material_name', 'material_code', 'closing_qty', 'avg_rate', 'stock_value'];
  const ord = sortOrder === 'asc' ? 'ASC' : 'DESC';
  const col = allowed.includes(sortBy) ? sortBy : null;
  const orderClause = col ? `${col} ${ord}` : 'stock_value DESC';
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT ws.id, m.code AS material_code, m.name AS material_name,
       g.name AS group_name, w.name AS warehouse_name, ws.uom,
       ws.current_qty AS closing_qty, ws.avg_unit_cost AS avg_rate,
       (ws.current_qty * ws.avg_unit_cost) AS stock_value
     FROM warehouse_stock ws
     JOIN materials m ON ws.material_id = m.id
     LEFT JOIN group_master g ON m.group_id = g.id
     LEFT JOIN warehouses w ON ws.warehouse_id = w.id
     WHERE ${where}
     ORDER BY ${orderClause}
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM warehouse_stock ws
     JOIN materials m ON ws.material_id = m.id WHERE ${where}`, params
  );
  const [[totals]] = await pool.query(
    `SELECT COALESCE(SUM(ws.current_qty * ws.avg_unit_cost),0) AS total_value
     FROM warehouse_stock ws JOIN materials m ON ws.material_id = m.id WHERE ${where}`, params
  );

  return { rows, total, totals };
}

// ─── Material Receipt Register ───────────────────────────────────────────────
export async function receiptRegister({ from_date, to_date, warehouse_id, supplier_id, search, page = 1, limit = 10, sortBy, sortOrder }) {
  const params = [];
  let where = '1=1';
  if (from_date) { where += ' AND mr.receipt_date >= ?'; params.push(from_date); }
  if (to_date) { where += ' AND mr.receipt_date <= ?'; params.push(to_date); }
  if (warehouse_id) { where += ' AND mr.warehouse_id = ?'; params.push(warehouse_id); }
  if (supplier_id) { where += ' AND mr.supplier_id = ?'; params.push(supplier_id); }
  if (search) {
    where += ' AND (mr.receipt_no LIKE ? OR s.name LIKE ? OR m.name LIKE ?)';
    const t = `%${search}%`; params.push(t, t, t);
  }

  const allowed = ['receipt_no', 'receipt_date', 'supplier_name', 'material_name', 'amount'];
  const ord = sortOrder === 'asc' ? 'ASC' : 'DESC';
  const orderClause = allowed.includes(sortBy) ? `${sortBy} ${ord}` : 'mr.receipt_date DESC, mr.id DESC';
  const offset = (page - 1) * limit;

  const baseFrom = `
     FROM material_receipt_items mri
     JOIN material_receipts mr ON mri.receipt_id = mr.id
     LEFT JOIN suppliers s ON mr.supplier_id = s.id
     LEFT JOIN warehouses w ON mr.warehouse_id = w.id
     LEFT JOIN materials m ON mri.material_id = m.id
     WHERE ${where}`;

  const [rows] = await pool.query(
    `SELECT mri.id, mr.receipt_no, mr.receipt_date, mr.purchase_order_no AS po_no, mr.po_date,
       s.name AS supplier_name, w.name AS warehouse_name,
       m.code AS material_code, m.name AS material_name, mri.uom,
       COALESCE(mri.received_qty, mri.primary_uom_qty, 0) AS qty,
       COALESCE(mri.rate_inr, mri.rate, 0) AS rate,
       COALESCE(mri.amount_inr, mri.amount, 0) AS amount,
       mr.status
     ${baseFrom}
     ORDER BY ${orderClause}
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );

  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total ${baseFrom}`, params);
  const [[totals]] = await pool.query(
    `SELECT COALESCE(SUM(COALESCE(mri.received_qty, mri.primary_uom_qty, 0)),0) AS total_qty,
       COALESCE(SUM(COALESCE(mri.amount_inr, mri.amount, 0)),0) AS total_amount ${baseFrom}`, params
  );

  return { rows, total, totals };
}

// ─── Material Issue Register ─────────────────────────────────────────────────
export async function issueRegister({ from_date, to_date, warehouse_id, process_stage, search, page = 1, limit = 10, sortBy, sortOrder }) {
  const params = [];
  let where = '1=1';
  if (from_date) { where += ' AND mi.issue_date >= ?'; params.push(from_date); }
  if (to_date) { where += ' AND mi.issue_date <= ?'; params.push(to_date); }
  if (warehouse_id) { where += ' AND mi.warehouse_id = ?'; params.push(warehouse_id); }
  if (process_stage) { where += ' AND mi.process_stage = ?'; params.push(process_stage); }
  if (search) {
    where += ' AND (mi.issue_no LIKE ? OR mi.production_batch LIKE ? OR m.name LIKE ?)';
    const t = `%${search}%`; params.push(t, t, t);
  }

  const allowed = ['issue_no', 'issue_date', 'process_stage', 'material_name', 'amount'];
  const ord = sortOrder === 'asc' ? 'ASC' : 'DESC';
  const orderClause = allowed.includes(sortBy) ? `${sortBy} ${ord}` : 'mi.issue_date DESC, mi.id DESC';
  const offset = (page - 1) * limit;

  const baseFrom = `
     FROM material_issue_items mii
     JOIN material_issues mi ON mii.issue_id = mi.id
     LEFT JOIN warehouses w ON mi.warehouse_id = w.id
     LEFT JOIN materials m ON mii.material_id = m.id
     WHERE ${where}`;

  const [rows] = await pool.query(
    `SELECT mii.id, mi.issue_no, mi.issue_date, mi.production_batch AS plan_no,
       mi.process_stage, mi.article, mi.color, w.name AS warehouse_name,
       m.code AS material_code, m.name AS material_name, mii.uom,
       COALESCE(mii.issue_qty, 0) AS qty,
       COALESCE(mii.unit_cost, 0) AS rate,
       COALESCE(mii.amount, 0) AS amount,
       mi.status
     ${baseFrom}
     ORDER BY ${orderClause}
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );

  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total ${baseFrom}`, params);
  const [[totals]] = await pool.query(
    `SELECT COALESCE(SUM(COALESCE(mii.issue_qty,0)),0) AS total_qty,
       COALESCE(SUM(COALESCE(mii.amount,0)),0) AS total_amount ${baseFrom}`, params
  );

  return { rows, total, totals };
}

// ─── Stock Movement Report (from stock_ledger) ───────────────────────────────
export async function stockMovement({ from_date, to_date, warehouse_id, material_id, transaction_type, search, page = 1, limit = 10, sortBy, sortOrder }) {
  const params = [];
  let where = '1=1';
  if (from_date) { where += ' AND sl.transaction_date >= ?'; params.push(from_date); }
  if (to_date) { where += ' AND sl.transaction_date <= ?'; params.push(to_date); }
  if (warehouse_id) { where += ' AND sl.warehouse_id = ?'; params.push(warehouse_id); }
  if (material_id) { where += ' AND sl.material_id = ?'; params.push(material_id); }
  if (transaction_type) { where += ' AND sl.transaction_type = ?'; params.push(transaction_type); }
  if (search) {
    where += ' AND (sl.reference_no LIKE ? OR m.name LIKE ?)';
    const t = `%${search}%`; params.push(t, t);
  }

  const allowed = ['transaction_date', 'transaction_type', 'material_name', 'reference_no'];
  const ord = sortOrder === 'asc' ? 'ASC' : 'DESC';
  const orderClause = allowed.includes(sortBy) ? `${sortBy} ${ord}` : 'sl.transaction_date DESC, sl.id DESC';
  const offset = (page - 1) * limit;

  const baseFrom = `
     FROM stock_ledger sl
     LEFT JOIN materials m ON sl.material_id = m.id
     LEFT JOIN warehouses w ON sl.warehouse_id = w.id
     WHERE ${where}`;

  const [rows] = await pool.query(
    `SELECT sl.id, sl.transaction_date, sl.transaction_type, sl.reference_no,
       m.code AS material_code, m.name AS material_name, w.name AS warehouse_name,
       sl.uom, sl.in_qty, sl.out_qty, sl.unit_cost AS rate, sl.amount,
       sl.balance_qty
     ${baseFrom}
     ORDER BY ${orderClause}
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );

  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total ${baseFrom}`, params);
  const [[totals]] = await pool.query(
    `SELECT COALESCE(SUM(sl.in_qty),0) AS total_in, COALESCE(SUM(sl.out_qty),0) AS total_out,
       COALESCE(SUM(sl.amount),0) AS total_amount ${baseFrom}`, params
  );

  return { rows, total, totals };
}

// ─── Stock Ledger Report (full raw ledger — every column) ────────────────────
export async function stockLedger({ from_date, to_date, warehouse_id, material_id, transaction_type, search, page = 1, limit = 10, sortBy, sortOrder }) {
  const params = [];
  let where = '1=1';
  if (from_date) { where += ' AND sl.transaction_date >= ?'; params.push(from_date); }
  if (to_date) { where += ' AND sl.transaction_date <= ?'; params.push(to_date); }
  if (warehouse_id) { where += ' AND sl.warehouse_id = ?'; params.push(warehouse_id); }
  if (material_id) { where += ' AND sl.material_id = ?'; params.push(material_id); }
  if (transaction_type) { where += ' AND sl.transaction_type = ?'; params.push(transaction_type); }
  if (search) {
    where += ' AND (sl.reference_no LIKE ? OR sl.reference_type LIKE ? OR sl.batch_no LIKE ? OR m.name LIKE ? OR m.code LIKE ?)';
    const t = `%${search}%`; params.push(t, t, t, t, t);
  }

  const allowed = ['transaction_date', 'transaction_type', 'material_name', 'reference_no', 'reference_type', 'created_at'];
  const ord = sortOrder === 'asc' ? 'ASC' : 'DESC';
  const orderClause = allowed.includes(sortBy) ? `${sortBy} ${ord}` : 'sl.transaction_date DESC, sl.id DESC';
  const offset = (page - 1) * limit;

  const baseFrom = `
     FROM stock_ledger sl
     LEFT JOIN materials m ON sl.material_id = m.id
     LEFT JOIN warehouses w ON sl.warehouse_id = w.id
     LEFT JOIN users u ON sl.created_by = u.id
     WHERE ${where}`;

  const [rows] = await pool.query(
    `SELECT sl.id, sl.transaction_date, sl.transaction_type,
       sl.reference_type, sl.reference_id, sl.reference_no,
       m.code AS material_code, m.name AS material_name,
       w.name AS warehouse_name, sl.uom,
       sl.batch_no, sl.expiry_date,
       sl.in_qty, sl.out_qty, sl.unit_cost AS rate, sl.amount, sl.balance_qty,
       sl.remarks, u.full_name AS created_by_name, sl.created_at
     ${baseFrom}
     ORDER BY ${orderClause}
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );

  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total ${baseFrom}`, params);
  const [[totals]] = await pool.query(
    `SELECT COALESCE(SUM(sl.in_qty),0) AS total_in, COALESCE(SUM(sl.out_qty),0) AS total_out,
       COALESCE(SUM(sl.amount),0) AS total_amount ${baseFrom}`, params
  );

  return { rows, total, totals };
}

// ─── Filter options ──────────────────────────────────────────────────────────
export async function getInventoryFilters() {
  const [warehouses] = await pool.query(`SELECT id, name FROM warehouses ORDER BY name`);
  const [groups] = await pool.query(`SELECT id, name FROM group_master ORDER BY name`);
  const [suppliers] = await pool.query(`SELECT id, name FROM suppliers ORDER BY name`);
  const [stages] = await pool.query(
    `SELECT DISTINCT process_stage AS name FROM material_issues
     WHERE process_stage IS NOT NULL AND process_stage <> '' ORDER BY process_stage`
  );
  const [txnTypes] = await pool.query(
    `SELECT DISTINCT transaction_type AS name FROM stock_ledger
     WHERE transaction_type IS NOT NULL AND transaction_type <> '' ORDER BY transaction_type`
  );
  return {
    warehouses: warehouses.map(w => ({ id: w.id, name: w.name })),
    groups: groups.map(g => ({ id: g.id, name: g.name })),
    suppliers: suppliers.map(s => ({ id: s.id, name: s.name })),
    stages: stages.map(s => s.name),
    transaction_types: txnTypes.map(t => t.name),
  };
}
