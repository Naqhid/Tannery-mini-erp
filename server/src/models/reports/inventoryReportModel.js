import pool from '../../config/db.js';

// ─── Stock Summary ───────────────────────────────────────────────────────────
// Stock summary with opening/receipt/issue/transfer/outbound/closing qty and value
// Data source: chemical material master + stock ledger table
export async function stockSummary({ warehouse_id, group_id, as_on_date, search, page = 1, limit = 10, sortBy, sortOrder }) {
  // Period = the current month (or the month of as_on_date if given).
  //  - Opening  = running balance of everything BEFORE the 1st of that month.
  //  - Movements = receipts/issues/transfers/outbound WITHIN the month, up to
  //                the as-on date (defaults to today).
  //  - Closing  = opening + receipt - issue - transfer - outbound.
  const periodEnd = as_on_date ? new Date(as_on_date) : new Date();
  const toISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const periodStart = new Date(periodEnd.getFullYear(), periodEnd.getMonth(), 1);
  const startStr = toISO(periodStart);   // first day of the month
  const endStr = toISO(periodEnd);       // as-on date (inclusive)

  // Warehouse scope (shared by opening and movement joins).
  const whClause = warehouse_id ? ' AND sl.warehouse_id = ?' : '';

  // Column-list builder: opening is pre-period balance; movements are in-period.
  const metricCols = `
    COALESCE(SUM(CASE WHEN sl.transaction_date < ? THEN sl.in_qty - sl.out_qty ELSE 0 END), 0) AS opening_qty,
    COALESCE(SUM(CASE WHEN sl.transaction_date < ? THEN sl.amount ELSE 0 END), 0) AS opening_value,
    COALESCE(SUM(CASE WHEN sl.transaction_date BETWEEN ? AND ? AND sl.transaction_type IN ('Receipt', 'Material Receipt', 'Purchase Receipt') THEN sl.in_qty ELSE 0 END), 0) AS receipt_qty,
    COALESCE(SUM(CASE WHEN sl.transaction_date BETWEEN ? AND ? AND sl.transaction_type IN ('Receipt', 'Material Receipt', 'Purchase Receipt') THEN sl.amount ELSE 0 END), 0) AS receipt_value,
    COALESCE(SUM(CASE WHEN sl.transaction_date BETWEEN ? AND ? AND sl.transaction_type IN ('Issue', 'Material Issue') THEN sl.out_qty ELSE 0 END), 0) AS issue_qty,
    COALESCE(SUM(CASE WHEN sl.transaction_date BETWEEN ? AND ? AND sl.transaction_type IN ('Issue', 'Material Issue') THEN sl.amount ELSE 0 END), 0) AS issue_value,
    COALESCE(SUM(CASE WHEN sl.transaction_date BETWEEN ? AND ? AND sl.transaction_type IN ('Transfer Out', 'Stock Transfer') THEN sl.out_qty ELSE 0 END), 0) AS transfer_qty,
    COALESCE(SUM(CASE WHEN sl.transaction_date BETWEEN ? AND ? AND sl.transaction_type IN ('Transfer Out', 'Stock Transfer') THEN sl.amount ELSE 0 END), 0) AS transfer_value,
    COALESCE(SUM(CASE WHEN sl.transaction_date BETWEEN ? AND ? AND sl.transaction_type = 'Outbound Delivery' THEN sl.out_qty ELSE 0 END), 0) AS outbound_qty,
    COALESCE(SUM(CASE WHEN sl.transaction_date BETWEEN ? AND ? AND sl.transaction_type = 'Outbound Delivery' THEN sl.amount ELSE 0 END), 0) AS outbound_value`;

  // Params that fill the metric CASE expressions, in order.
  const metricParams = [
    startStr,                 // opening_qty  (< start)
    startStr,                 // opening_value(< start)
    startStr, endStr,         // receipt_qty
    startStr, endStr,         // receipt_value
    startStr, endStr,         // issue_qty
    startStr, endStr,         // issue_value
    startStr, endStr,         // transfer_qty
    startStr, endStr,         // transfer_value
    startStr, endStr,         // outbound_qty
    startStr, endStr,         // outbound_value
  ];

  // Params for ONE closing block (qty or value): 1 opening boundary + 4
  // movement ranges (receipt, issue, transfer, outbound). closing_qty and
  // closing_value share the identical shape, so this is used twice.
  const closingBlockParams = [
    startStr,                 // opening (< start)
    startStr, endStr,         // receipt
    startStr, endStr,         // issue
    startStr, endStr,         // transfer
    startStr, endStr,         // outbound
  ];
  const closingParams = [...closingBlockParams, ...closingBlockParams]; // qty + value

  // WHERE for the materials master (drives which items are listed).
  let where = "m.status = 'Active'";
  const whereParams = [];
  if (group_id) { where += ' AND m.group_id = ?'; whereParams.push(group_id); }
  if (search) {
    where += ' AND (m.name LIKE ? OR m.code LIKE ?)';
    const t = `%${search}%`; whereParams.push(t, t);
  }

  // The join carries the warehouse filter; metrics then slice by date.
  const slJoin = `LEFT JOIN stock_ledger sl ON sl.material_id = m.id${whClause}`;
  const joinParams = warehouse_id ? [warehouse_id] : [];

  const sortMap = {
    material_code: 'm.code',
    material_name: 'm.name',
    group_name: 'g.name',
    uom: 'm.uom',
    opening_qty: 'opening_qty',
    receipt_qty: 'receipt_qty',
    issue_qty: 'issue_qty',
    transfer_qty: 'transfer_qty',
    outbound_qty: 'outbound_qty',
    closing_qty: 'closing_qty',
    closing_value: 'closing_value',
  };
  const ord = sortOrder === 'asc' ? 'ASC' : 'DESC';
  const orderClause = sortMap[sortBy] ? `${sortMap[sortBy]} ${ord}` : 'm.name ASC';
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT 
       m.id AS material_id,
       m.code AS material_code,
       m.name AS material_name,
       g.name AS group_name,
       m.uom,
       ${metricCols},
       (
         COALESCE(SUM(CASE WHEN sl.transaction_date < ? THEN sl.in_qty - sl.out_qty ELSE 0 END), 0)
         + COALESCE(SUM(CASE WHEN sl.transaction_date BETWEEN ? AND ? AND sl.transaction_type IN ('Receipt', 'Material Receipt', 'Purchase Receipt') THEN sl.in_qty ELSE 0 END), 0)
         - COALESCE(SUM(CASE WHEN sl.transaction_date BETWEEN ? AND ? AND sl.transaction_type IN ('Issue', 'Material Issue') THEN sl.out_qty ELSE 0 END), 0)
         - COALESCE(SUM(CASE WHEN sl.transaction_date BETWEEN ? AND ? AND sl.transaction_type IN ('Transfer Out', 'Stock Transfer') THEN sl.out_qty ELSE 0 END), 0)
         - COALESCE(SUM(CASE WHEN sl.transaction_date BETWEEN ? AND ? AND sl.transaction_type = 'Outbound Delivery' THEN sl.out_qty ELSE 0 END), 0)
       ) AS closing_qty,
       (
         COALESCE(SUM(CASE WHEN sl.transaction_date < ? THEN sl.amount ELSE 0 END), 0)
         + COALESCE(SUM(CASE WHEN sl.transaction_date BETWEEN ? AND ? AND sl.transaction_type IN ('Receipt', 'Material Receipt', 'Purchase Receipt') THEN sl.amount ELSE 0 END), 0)
         - COALESCE(SUM(CASE WHEN sl.transaction_date BETWEEN ? AND ? AND sl.transaction_type IN ('Issue', 'Material Issue') THEN sl.amount ELSE 0 END), 0)
         - COALESCE(SUM(CASE WHEN sl.transaction_date BETWEEN ? AND ? AND sl.transaction_type IN ('Transfer Out', 'Stock Transfer') THEN sl.amount ELSE 0 END), 0)
         - COALESCE(SUM(CASE WHEN sl.transaction_date BETWEEN ? AND ? AND sl.transaction_type = 'Outbound Delivery' THEN sl.amount ELSE 0 END), 0)
       ) AS closing_value
     FROM materials m
     LEFT JOIN group_master g ON m.group_id = g.id
     ${slJoin}
     WHERE ${where}
     GROUP BY m.id, m.code, m.name, g.name, m.uom
     ORDER BY ${orderClause}
     LIMIT ? OFFSET ?`,
    [...metricParams, ...closingParams, ...joinParams, ...whereParams, Number(limit), Number(offset)]
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(DISTINCT m.id) AS total
     FROM materials m
     LEFT JOIN group_master g ON m.group_id = g.id
     ${slJoin}
     WHERE ${where}`,
    [...joinParams, ...whereParams]
  );

  const [totalsRows] = await pool.query(
    `SELECT 
       ${metricCols},
       (
         COALESCE(SUM(CASE WHEN sl.transaction_date < ? THEN sl.in_qty - sl.out_qty ELSE 0 END), 0)
         + COALESCE(SUM(CASE WHEN sl.transaction_date BETWEEN ? AND ? AND sl.transaction_type IN ('Receipt', 'Material Receipt', 'Purchase Receipt') THEN sl.in_qty ELSE 0 END), 0)
         - COALESCE(SUM(CASE WHEN sl.transaction_date BETWEEN ? AND ? AND sl.transaction_type IN ('Issue', 'Material Issue') THEN sl.out_qty ELSE 0 END), 0)
         - COALESCE(SUM(CASE WHEN sl.transaction_date BETWEEN ? AND ? AND sl.transaction_type IN ('Transfer Out', 'Stock Transfer') THEN sl.out_qty ELSE 0 END), 0)
         - COALESCE(SUM(CASE WHEN sl.transaction_date BETWEEN ? AND ? AND sl.transaction_type = 'Outbound Delivery' THEN sl.out_qty ELSE 0 END), 0)
       ) AS closing_qty,
       (
         COALESCE(SUM(CASE WHEN sl.transaction_date < ? THEN sl.amount ELSE 0 END), 0)
         + COALESCE(SUM(CASE WHEN sl.transaction_date BETWEEN ? AND ? AND sl.transaction_type IN ('Receipt', 'Material Receipt', 'Purchase Receipt') THEN sl.amount ELSE 0 END), 0)
         - COALESCE(SUM(CASE WHEN sl.transaction_date BETWEEN ? AND ? AND sl.transaction_type IN ('Issue', 'Material Issue') THEN sl.amount ELSE 0 END), 0)
         - COALESCE(SUM(CASE WHEN sl.transaction_date BETWEEN ? AND ? AND sl.transaction_type IN ('Transfer Out', 'Stock Transfer') THEN sl.amount ELSE 0 END), 0)
         - COALESCE(SUM(CASE WHEN sl.transaction_date BETWEEN ? AND ? AND sl.transaction_type = 'Outbound Delivery' THEN sl.amount ELSE 0 END), 0)
       ) AS closing_value
     FROM materials m
     ${slJoin}
     WHERE ${where}`,
    [...metricParams, ...closingParams, ...joinParams, ...whereParams]
  );

  const totals = {
    opening_qty: Number(totalsRows[0]?.opening_qty || 0),
    opening_value: Number(totalsRows[0]?.opening_value || 0),
    receipt_qty: Number(totalsRows[0]?.receipt_qty || 0),
    receipt_value: Number(totalsRows[0]?.receipt_value || 0),
    issue_qty: Number(totalsRows[0]?.issue_qty || 0),
    issue_value: Number(totalsRows[0]?.issue_value || 0),
    transfer_qty: Number(totalsRows[0]?.transfer_qty || 0),
    transfer_value: Number(totalsRows[0]?.transfer_value || 0),
    outbound_qty: Number(totalsRows[0]?.outbound_qty || 0),
    outbound_value: Number(totalsRows[0]?.outbound_value || 0),
    closing_qty: Number(totalsRows[0]?.closing_qty || 0),
    closing_value: Number(totalsRows[0]?.closing_value || 0),
  };

  return { rows, total, totals };
}

// ─── Stock Valuation ─────────────────────────────────────────────────────────
// Same source as summary but focussed on value; positive qty only.
export async function stockValuation({ warehouse_id, group_id, origin, search, page = 1, limit = 10, sortBy, sortOrder }) {
  const params = [];
  let where = 'ws.current_qty <> 0';
  if (warehouse_id) { where += ' AND ws.warehouse_id = ?'; params.push(warehouse_id); }
  if (group_id) { where += ' AND m.group_id = ?'; params.push(group_id); }
  if (origin === 'local') {
    where += ' AND (m.currency = ? OR m.currency IS NULL OR m.currency = "")'; params.push('INR');
  } else if (origin === 'import') {
    where += ' AND m.currency IS NOT NULL AND m.currency <> "" AND m.currency <> ?'; params.push('INR');
  }
  if (search) {
    where += ' AND (m.name LIKE ? OR m.code LIKE ?)';
    const t = `%${search}%`; params.push(t, t);
  }

  const sortMap = {
    material_code: 'm.code',
    material_name: 'm.name',
    group_name: 'g.name',
    warehouse_name: 'w.name',
    uom: 'ws.uom',
    closing_qty: 'closing_qty',
    avg_rate: 'avg_rate',
    stock_value: 'stock_value',
  };
  const ord = sortOrder === 'asc' ? 'ASC' : 'DESC';
  const orderClause = sortMap[sortBy] ? `${sortMap[sortBy]} ${ord}` : 'stock_value DESC';
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
export async function receiptRegister({ from_date, to_date, warehouse_id, supplier_id, origin, search, page = 1, limit = 10, sortBy, sortOrder }) {
  const params = [];
  let where = '1=1';
  if (from_date) { where += ' AND mr.receipt_date >= ?'; params.push(from_date); }
  if (to_date) { where += ' AND mr.receipt_date <= ?'; params.push(to_date); }
  if (warehouse_id) { where += ' AND mr.warehouse_id = ?'; params.push(warehouse_id); }
  if (supplier_id) { where += ' AND mr.supplier_id = ?'; params.push(supplier_id); }
  if (origin === 'local') {
    where += ' AND (m.currency = ? OR m.currency IS NULL OR m.currency = "")'; params.push('INR');
  } else if (origin === 'import') {
    where += ' AND m.currency IS NOT NULL AND m.currency <> "" AND m.currency <> ?'; params.push('INR');
  }
  if (search) {
    where += ' AND (mr.receipt_no LIKE ? OR s.name LIKE ? OR m.name LIKE ?)';
    const t = `%${search}%`; params.push(t, t, t);
  }

  // Map every displayed column key to a safe ORDER BY expression so all
  // columns are sortable from the UI without risking ambiguous-column errors.
  const sortMap = {
    receipt_no: 'mr.receipt_no',
    receipt_date: 'mr.receipt_date',
    po_no: 'mr.purchase_order_no',
    supplier_name: 's.name',
    warehouse_name: 'w.name',
    material_code: 'm.code',
    material_name: 'm.name',
    uom: 'mri.uom',
    qty: 'qty',
    rate: 'rate',
    amount: 'amount',
    tax_total_gst: 'tax_total_gst',
  };
  const ord = sortOrder === 'asc' ? 'ASC' : 'DESC';
  const orderClause = sortMap[sortBy] ? `${sortMap[sortBy]} ${ord}` : 'mr.receipt_date DESC, mr.id DESC';
  const offset = (page - 1) * limit;

  const baseFrom = `
     FROM material_receipt_items mri
     JOIN material_receipts mr ON mri.receipt_id = mr.id
     LEFT JOIN suppliers s ON mr.supplier_id = s.id
     LEFT JOIN warehouses w ON mr.warehouse_id = w.id
     LEFT JOIN materials m ON mri.material_id = m.id
     LEFT JOIN (
       SELECT receipt_id, SUM(COALESCE(amount_inr, amount, 0)) AS receipt_total
       FROM material_receipt_items GROUP BY receipt_id
     ) rt ON rt.receipt_id = mr.id
     WHERE ${where}`;

  const [rows] = await pool.query(
    `SELECT mri.id, mr.receipt_no, mr.receipt_date, mr.purchase_order_no AS po_no, mr.po_date,
       s.name AS supplier_name, w.name AS warehouse_name,
       m.code AS material_code, m.name AS material_name, mri.uom,
       COALESCE(mri.received_qty, mri.primary_uom_qty, 0) AS qty,
       COALESCE(mri.rate_inr, mri.rate, 0) AS rate,
       COALESCE(mri.amount_inr, mri.amount, 0) AS amount,
       -- GST is stored on the receipt header (material_receipts), not per line
       -- item. Allocate the header GST to each line proportionally by its
       -- amount share so the per-row figure is meaningful and the sum matches
       -- the receipt total.
       (COALESCE(mr.cgst_amount, 0) * (COALESCE(mri.amount_inr, mri.amount, 0) / NULLIF(rt.receipt_total, 0))) AS cgst_amount,
       (COALESCE(mr.sgst_amount, 0) * (COALESCE(mri.amount_inr, mri.amount, 0) / NULLIF(rt.receipt_total, 0))) AS sgst_amount,
       (COALESCE(mr.igst_amount, 0) * (COALESCE(mri.amount_inr, mri.amount, 0) / NULLIF(rt.receipt_total, 0))) AS igst_amount,
       (COALESCE(mr.total_gst_amount, 0) * (COALESCE(mri.amount_inr, mri.amount, 0) / NULLIF(rt.receipt_total, 0))) AS tax_total_gst,
       mr.status
     ${baseFrom}
     ORDER BY ${orderClause}
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );

  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total ${baseFrom}`, params);
  const [[totals]] = await pool.query(
    `SELECT COALESCE(SUM(COALESCE(mri.received_qty, mri.primary_uom_qty, 0)),0) AS total_qty,
       COALESCE(SUM(COALESCE(mri.amount_inr, mri.amount, 0)),0) AS total_amount,
       COALESCE(SUM(COALESCE(mr.total_gst_amount, 0) * (COALESCE(mri.amount_inr, mri.amount, 0) / NULLIF(rt.receipt_total, 0))),0) AS total_tax_gst ${baseFrom}`, params
  );

  return { rows, total, totals };
}

// ─── Material Issue Register ─────────────────────────────────────────────────
export async function issueRegister({ from_date, to_date, warehouse_id, process_stage, origin, search, page = 1, limit = 10, sortBy, sortOrder }) {
  const params = [];
  let where = 'mi.deleted_at IS NULL';
  if (from_date) { where += ' AND mi.issue_date >= ?'; params.push(from_date); }
  if (to_date) { where += ' AND mi.issue_date <= ?'; params.push(to_date); }
  if (warehouse_id) { where += ' AND mi.warehouse_id = ?'; params.push(warehouse_id); }
  if (process_stage) { where += ' AND mi.process_stage = ?'; params.push(process_stage); }
  if (origin === 'local') {
    where += ' AND (m.currency = ? OR m.currency IS NULL OR m.currency = "")'; params.push('INR');
  } else if (origin === 'import') {
    where += ' AND m.currency IS NOT NULL AND m.currency <> "" AND m.currency <> ?'; params.push('INR');
  }
  if (search) {
    where += ' AND (mi.issue_no LIKE ? OR mi.production_batch LIKE ? OR m.name LIKE ?)';
    const t = `%${search}%`; params.push(t, t, t);
  }

  const sortMap = {
    issue_no: 'mi.issue_no',
    issue_date: 'mi.issue_date',
    plan_no: 'mi.production_batch',
    process_stage: 'mi.process_stage',
    article: 'mi.article',
    material_name: 'm.name',
    uom: 'mii.uom',
    qty: 'qty',
    rate: 'rate',
    amount: 'amount',
  };
  const ord = sortOrder === 'asc' ? 'ASC' : 'DESC';
  const orderClause = sortMap[sortBy] ? `${sortMap[sortBy]} ${ord}` : 'mi.issue_date DESC, mi.id DESC';
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

  const sortMap = {
    transaction_date: 'sl.transaction_date',
    transaction_type: 'sl.transaction_type',
    reference_no: 'sl.reference_no',
    material_code: 'm.code',
    material_name: 'm.name',
    warehouse_name: 'w.name',
    uom: 'sl.uom',
    in_qty: 'sl.in_qty',
    out_qty: 'sl.out_qty',
    rate: 'rate',
    amount: 'sl.amount',
    balance_qty: 'sl.balance_qty',
  };
  const ord = sortOrder === 'asc' ? 'ASC' : 'DESC';
  const orderClause = sortMap[sortBy] ? `${sortMap[sortBy]} ${ord}` : 'sl.transaction_date DESC, sl.id DESC';
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

  const sortMap = {
    transaction_date: 'sl.transaction_date',
    reference_no: 'sl.reference_no',
    material_code: 'm.code',
    material_name: 'm.name',
    uom: 'sl.uom',
    opening_qty: 'opening_qty',
    receipt_qty: 'receipt_qty',
    issue_qty: 'issue_qty',
    transfer_qty: 'transfer_qty',
    outbound_qty: 'outbound_qty',
    closing_qty: 'closing_qty',
    rate: 'rate',
    amount: 'sl.amount',
    remarks: 'sl.remarks',
  };
  const ord = sortOrder === 'asc' ? 'ASC' : 'DESC';
  const orderClause = sortMap[sortBy] ? `${sortMap[sortBy]} ${ord}` : 'sl.transaction_date DESC, sl.id DESC';
  const offset = (page - 1) * limit;

  const baseFrom = `
     FROM stock_ledger sl
     LEFT JOIN materials m ON sl.material_id = m.id
     LEFT JOIN warehouses w ON sl.warehouse_id = w.id
     LEFT JOIN users u ON sl.created_by = u.id
     LEFT JOIN outbound_deliveries od ON sl.reference_type = 'Outbound Delivery' AND sl.reference_no = od.outbound_no
     WHERE ${where}`;

  const [rows] = await pool.query(
    `SELECT sl.id, sl.transaction_date, sl.transaction_type,
       sl.reference_no,
       od.delivery_challan_no,
       m.code AS material_code, m.name AS material_name,
       sl.uom,
       -- Opening/closing are the RUNNING balance carried across every
       -- transaction (date-ordered), not a single row's net. balance_qty is
       -- the running balance AFTER this transaction; opening is that balance
       -- minus this transaction's own movement.
       (sl.balance_qty - (sl.in_qty - sl.out_qty)) AS opening_qty,
       CASE WHEN sl.transaction_type IN ('Receipt', 'Material Receipt', 'Purchase Receipt') THEN sl.in_qty ELSE 0 END AS receipt_qty,
       CASE WHEN sl.transaction_type IN ('Issue', 'Material Issue') THEN sl.out_qty ELSE 0 END AS issue_qty,
       CASE WHEN sl.transaction_type IN ('Transfer Out', 'Stock Transfer') THEN sl.out_qty ELSE 0 END AS transfer_qty,
       CASE WHEN sl.transaction_type = 'Outbound Delivery' THEN sl.out_qty ELSE 0 END AS outbound_qty,
       sl.balance_qty AS closing_qty,
       sl.unit_cost AS rate, sl.amount,
       sl.remarks, u.full_name AS created_by_name, sl.created_at
     ${baseFrom}
     ORDER BY ${orderClause}
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );

  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total ${baseFrom}`, params);
  const [[totals]] = await pool.query(
    `SELECT 
       COALESCE(SUM(CASE WHEN sl.transaction_type IN ('Receipt', 'Material Receipt', 'Purchase Receipt') THEN sl.in_qty ELSE 0 END),0) AS total_receipt,
       COALESCE(SUM(CASE WHEN sl.transaction_type IN ('Issue', 'Material Issue') THEN sl.out_qty ELSE 0 END),0) AS total_issue,
       COALESCE(SUM(CASE WHEN sl.transaction_type IN ('Transfer Out', 'Stock Transfer') THEN sl.out_qty ELSE 0 END),0) AS total_transfer,
       COALESCE(SUM(CASE WHEN sl.transaction_type = 'Outbound Delivery' THEN sl.out_qty ELSE 0 END),0) AS total_outbound,
       COALESCE(SUM(sl.amount),0) AS total_amount ${baseFrom}`, params
  );

  // Opening = running balance BEFORE the earliest transaction in the filtered
  // range; Closing = running balance AFTER the latest. Summing running balances
  // would be meaningless, so take the boundary rows (date, then id order).
  const [[firstRow]] = await pool.query(
    `SELECT (sl.balance_qty - (sl.in_qty - sl.out_qty)) AS opening_qty
     ${baseFrom}
     ORDER BY sl.transaction_date ASC, sl.id ASC LIMIT 1`, params
  );
  const [[lastRow]] = await pool.query(
    `SELECT sl.balance_qty AS closing_qty
     ${baseFrom}
     ORDER BY sl.transaction_date DESC, sl.id DESC LIMIT 1`, params
  );
  totals.total_opening = Number(firstRow?.opening_qty || 0);
  totals.total_closing = Number(lastRow?.closing_qty || 0);

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

// ─── Inventory Consistency Check (READ-ONLY DIAGNOSTIC) ──────────────────────
// Compares the current on-hand quantity across the three stock tables:
//   1. warehouse_stock.current_qty          (the live balance table)
//   2. latest material_transactions.balance_qty per (warehouse, item)
//   3. running SUM(in_qty - out_qty) from stock_ledger per (warehouse, material)
// and flags any (warehouse, material) where they disagree.
//
// This does NOT modify any data. It only reports discrepancies so an operator
// can investigate. No automatic repair is performed.
export async function inventoryConsistencyCheck({ tolerance = 0.001 } = {}) {
  // 1) warehouse_stock balances
  const [wsRows] = await pool.query(
    `SELECT ws.warehouse_id, ws.material_id, ws.current_qty
     FROM warehouse_stock ws`
  );

  // 2) latest material_transactions balance per (warehouse, item)
  const [mtRows] = await pool.query(
    `SELECT t.warehouse_id, t.item_id AS material_id, t.balance_qty
     FROM material_transactions t
     JOIN (
       SELECT warehouse_id, item_id, MAX(transaction_date) AS max_date
       FROM material_transactions
       GROUP BY warehouse_id, item_id
     ) latest
       ON latest.warehouse_id = t.warehouse_id
      AND latest.item_id = t.item_id
      AND latest.max_date = t.transaction_date
     JOIN (
       SELECT warehouse_id, item_id, transaction_date, MAX(transaction_id) AS max_id
       FROM material_transactions
       GROUP BY warehouse_id, item_id, transaction_date
     ) latest_id
       ON latest_id.warehouse_id = t.warehouse_id
      AND latest_id.item_id = t.item_id
      AND latest_id.transaction_date = t.transaction_date
      AND latest_id.max_id = t.transaction_id`
  );

  // 3) stock_ledger running balance per (warehouse, material)
  const [slRows] = await pool.query(
    `SELECT warehouse_id, material_id,
            COALESCE(SUM(in_qty),0) - COALESCE(SUM(out_qty),0) AS ledger_qty
     FROM stock_ledger
     WHERE warehouse_id IS NOT NULL AND material_id IS NOT NULL
     GROUP BY warehouse_id, material_id`
  );

  // Build lookup maps keyed by "warehouse:material"
  const key = (w, m) => `${w}:${m}`;
  const wsMap = new Map(wsRows.map(r => [key(r.warehouse_id, r.material_id), Number(r.current_qty) || 0]));
  const mtMap = new Map(mtRows.map(r => [key(r.warehouse_id, r.material_id), Number(r.balance_qty) || 0]));
  const slMap = new Map(slRows.map(r => [key(r.warehouse_id, r.material_id), Number(r.ledger_qty) || 0]));

  // Union of all keys present in any table
  const allKeys = new Set([...wsMap.keys(), ...mtMap.keys(), ...slMap.keys()]);

  const discrepancies = [];
  for (const k of allKeys) {
    const [warehouse_id, material_id] = k.split(':').map(Number);
    const wsQty = wsMap.has(k) ? wsMap.get(k) : null;
    const mtQty = mtMap.has(k) ? mtMap.get(k) : null;
    const slQty = slMap.has(k) ? slMap.get(k) : null;

    const types = [];
    const diff = (a, b) => a != null && b != null && Math.abs(a - b) > tolerance;
    if (diff(wsQty, mtQty)) types.push('warehouse_stock != material_transactions');
    if (diff(wsQty, slQty)) types.push('warehouse_stock != stock_ledger');
    if (diff(mtQty, slQty)) types.push('material_transactions != stock_ledger');
    // Presence mismatches (row missing from one table but not another)
    const present = [wsQty, mtQty, slQty].filter(v => v != null).length;
    if (present > 0 && present < 3) types.push('missing_in_one_or_more_tables');

    if (types.length > 0) {
      discrepancies.push({ warehouse_id, material_id, wsQty, mtQty, slQty, types });
    }
  }

  if (discrepancies.length === 0) {
    return { checked: allKeys.size, discrepancies: [] };
  }

  // Enrich with material + warehouse names for the flagged rows only
  const matIds = [...new Set(discrepancies.map(d => d.material_id))];
  const whIds = [...new Set(discrepancies.map(d => d.warehouse_id))];
  const [mats] = matIds.length
    ? await pool.query(`SELECT id, code, name FROM materials WHERE id IN (?)`, [matIds])
    : [[]];
  const [whs] = whIds.length
    ? await pool.query(`SELECT id, name FROM warehouses WHERE id IN (?)`, [whIds])
    : [[]];
  const matMap = new Map(mats.map(m => [m.id, m]));
  const whMap = new Map(whs.map(w => [w.id, w]));

  const rows = discrepancies.map(d => {
    const m = matMap.get(d.material_id) || {};
    const w = whMap.get(d.warehouse_id) || {};
    return {
      material_id: d.material_id,
      material_code: m.code || null,
      material_name: m.name || null,
      warehouse_id: d.warehouse_id,
      warehouse_name: w.name || null,
      warehouse_stock_qty: d.wsQty,
      material_transaction_qty: d.mtQty,
      stock_ledger_qty: d.slQty,
      difference: {
        ws_vs_mt: d.wsQty != null && d.mtQty != null ? Number((d.wsQty - d.mtQty).toFixed(3)) : null,
        ws_vs_sl: d.wsQty != null && d.slQty != null ? Number((d.wsQty - d.slQty).toFixed(3)) : null,
        mt_vs_sl: d.mtQty != null && d.slQty != null ? Number((d.mtQty - d.slQty).toFixed(3)) : null,
      },
      discrepancy_type: d.types.join('; '),
    };
  });

  return { checked: allKeys.size, discrepancies: rows };
}
