import pool from '../config/db.js';
import { updateStock, addLedgerEntry, allowsNegativeStock } from './stockLedgerModel.js';
import { getIssueItemInfo, replaceReferenceTransactions } from './materialTransactionModel.js';

export async function getAll({ search, status, warehouse_id, page = 1, limit = 10, sortBy, sortOrder }) {
  let where = '1=1';
  const params = [];
  if (search) {
    where += ' AND (mi.issue_no LIKE ? OR mi.production_batch LIKE ? OR mi.job_order_no LIKE ? OR w.name LIKE ?)';
    const t = `%${search}%`;
    params.push(t, t, t, t);
  }
  if (status) { where += ' AND mi.status = ?'; params.push(status); }
  if (warehouse_id) { where += ' AND mi.warehouse_id = ?'; params.push(warehouse_id); }

  const allowed = ['id', 'issue_no', 'issue_date', 'grand_total', 'status', 'created_at'];
  const col = allowed.includes(sortBy) ? `mi.\`${sortBy}\`` : 'mi.`id`';
  const ord = sortOrder === 'asc' ? 'ASC' : 'DESC';
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT mi.*,
       w.name AS warehouse_name, w.code AS warehouse_code
     FROM material_issues mi
     LEFT JOIN warehouses w ON mi.warehouse_id = w.id
     WHERE ${where} ORDER BY ${col} ${ord} LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM material_issues mi
     LEFT JOIN warehouses w ON mi.warehouse_id = w.id
     WHERE ${where}`, params
  );
  return { rows, total };
}

export async function getById(id) {
  const [[issue]] = await pool.query(
    `SELECT mi.*, w.name AS warehouse_name, w.code AS warehouse_code
     FROM material_issues mi
     LEFT JOIN warehouses w ON mi.warehouse_id = w.id
     WHERE mi.id = ?`, [id]
  );
  if (!issue) return null;
  const [items] = await pool.query(
    `SELECT mii.*, m.name AS material_name, m.code AS material_code
     FROM material_issue_items mii
     LEFT JOIN materials m ON mii.material_id = m.id
     WHERE mii.issue_id = ? ORDER BY mii.id ASC`, [id]
  );
  return { ...issue, items };
}

export async function getNextNo() {
  const year = new Date().getFullYear();
  const [[row]] = await pool.query(
    `SELECT issue_no FROM material_issues WHERE issue_no LIKE ? ORDER BY id DESC LIMIT 1`,
    [`ISS-${year}-%`]
  );
  if (!row) return `ISS-${year}-00001`;
  const num = parseInt(row.issue_no.split('-')[2], 10) + 1;
  return `ISS-${year}-${String(num).padStart(5, '0')}`;
}

export async function create(data, items = [], createdBy = null) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const issue_no = data.issue_no || await getNextNo();
    const totalCost = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
    const grandTotal = totalCost + (parseFloat(data.loading_unloading) || 0) + (parseFloat(data.other_charges) || 0);

    // Validate against the latest running balance in material_transactions.
    for (const item of items) {
      const info = await getIssueItemInfo({ warehouseId: data.warehouse_id, itemId: item.material_id, date: data.issue_date });
      const requested = parseFloat(item.issue_qty) || 0;
      if (requested > info.available_qty + 0.000001) {
        throw new Error(`Insufficient stock. Available stock: ${info.available_qty}. Current balance: ${info.available_qty}. Requested issue quantity: ${requested}`);
      }
      // Server-side source of truth for average rate and amount.
      item.unit_cost = info.avg_rate;
      item.amount = Number((requested * info.avg_rate).toFixed(2));
    }

    const [result] = await conn.query(
      `INSERT INTO material_issues (
        issue_no, issue_date, department, job_order_no, production_batch, article, color, batch_qty,
        batch_uom, batch_description, costing_method, warehouse_id, required_date, planned_date,
        issued_by, loading_unloading, other_charges, total_material_cost, grand_total,
        remarks, status, created_by
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        issue_no, data.issue_date, data.department || null, data.job_order_no || null,
        data.production_batch || null, data.article || data.batch_description || null, data.color || null, data.batch_qty || 0, data.batch_uom || null,
        data.batch_description || null, data.costing_method || 'FIFO', data.warehouse_id,
        data.required_date || data.planned_date || null, data.planned_date || data.required_date || null, data.issued_by || null, data.loading_unloading || 0,
        data.other_charges || 0, totalCost, grandTotal, data.remarks || null,
        data.status || 'Posted', createdBy,
      ]
    );
    const issueId = result.insertId;

    for (const item of items) {
      await conn.query(
        `INSERT INTO material_issue_items (issue_id, material_id, uom, required_qty, issue_qty, unit_cost, amount, remarks)
         VALUES (?,?,?,?,?,?,?,?)`,
        [issueId, item.material_id, item.uom || null, item.required_qty || 0,
         item.issue_qty || 0, item.unit_cost || 0, item.amount || 0, item.remarks || null]
      );

      await updateStock(conn, data.warehouse_id, item.material_id, item.uom, -(parseFloat(item.issue_qty) || 0), 0);

      await addLedgerEntry(conn, {
        transaction_date: data.issue_date,
        transaction_type: 'Issue',
        reference_type: 'material_issue',
        reference_id: issueId,
        reference_no: issue_no,
        warehouse_id: data.warehouse_id,
        material_id: item.material_id,
        uom: item.uom,
        in_qty: 0,
        out_qty: item.issue_qty || 0,
        unit_cost: item.unit_cost || 0,
        amount: item.amount || 0,
        balance_qty: -(item.issue_qty || 0),
        remarks: `Issue to batch ${data.production_batch || ''}`,
        created_by: createdBy,
      });
    }

    await replaceReferenceTransactions(conn, 'material_issue', issueId, items.map((item) => ({
      transaction_date: data.issue_date,
      transaction_type: 'Issue',
      reference_no: issue_no,
      warehouse_id: data.warehouse_id,
      item_id: item.material_id,
      receipt_qty: 0,
      opening_qty: 0,
      receipt_value: 0,
      issue_qty: parseFloat(item.issue_qty) || 0,
      issue_value: parseFloat(item.amount) || 0,
    })));

    await conn.commit();
    return { id: issueId, issue_no };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function update(id, data, items = [], updatedBy = null) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Reverse old stock
    const [oldItems] = await conn.query(
      'SELECT material_id, uom, issue_qty FROM material_issue_items WHERE issue_id=?', [id]
    );
    for (const old of oldItems) {
      await updateStock(conn, data.warehouse_id, old.material_id, old.uom, parseFloat(old.issue_qty), 0);
    }
    await conn.query('DELETE FROM material_issue_items WHERE issue_id=?', [id]);
    await conn.query('DELETE FROM stock_ledger WHERE reference_type=? AND reference_id=?', ['material_issue', id]);
    // Remove current reference from transaction table first so stock validation does not count the old issue.
    await replaceReferenceTransactions(conn, 'material_issue', id, []);
    for (const item of items) {
      const info = await getIssueItemInfo({ warehouseId: data.warehouse_id, itemId: item.material_id, date: data.issue_date });
      const requested = parseFloat(item.issue_qty) || 0;
      if (requested > info.available_qty + 0.000001) {
        throw new Error(`Insufficient stock. Available stock: ${info.available_qty}. Current balance: ${info.available_qty}. Requested issue quantity: ${requested}`);
      }
      item.unit_cost = info.avg_rate;
      item.amount = Number((requested * info.avg_rate).toFixed(2));
    }
    const totalCost = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
    const grandTotal = totalCost + (parseFloat(data.loading_unloading) || 0) + (parseFloat(data.other_charges) || 0);

    await conn.query(
      `UPDATE material_issues SET
        issue_date=?, department=?, job_order_no=?, production_batch=?, article=?, color=?, batch_qty=?,
        batch_uom=?, batch_description=?, costing_method=?, warehouse_id=?, required_date=?, planned_date=?,
        issued_by=?, loading_unloading=?, other_charges=?, total_material_cost=?,
        grand_total=?, remarks=?, updated_by=? WHERE id=?`,
      [
        data.issue_date, data.department || null, data.job_order_no || null,
        data.production_batch || null, data.article || data.batch_description || null, data.color || null, data.batch_qty || 0, data.batch_uom || null,
        data.batch_description || null, data.costing_method || 'FIFO', data.warehouse_id,
        data.required_date || data.planned_date || null, data.planned_date || data.required_date || null, data.issued_by || null, data.loading_unloading || 0,
        data.other_charges || 0, totalCost, grandTotal, data.remarks || null, updatedBy, id,
      ]
    );

    for (const item of items) {
      await conn.query(
        `INSERT INTO material_issue_items (issue_id, material_id, uom, required_qty, issue_qty, unit_cost, amount, remarks)
         VALUES (?,?,?,?,?,?,?,?)`,
        [id, item.material_id, item.uom || null, item.required_qty || 0,
         item.issue_qty || 0, item.unit_cost || 0, item.amount || 0, item.remarks || null]
      );
      await updateStock(conn, data.warehouse_id, item.material_id, item.uom, -(parseFloat(item.issue_qty) || 0), 0);
    }

    const [[issueHeader]] = await conn.query('SELECT issue_no FROM material_issues WHERE id=?', [id]);
    await replaceReferenceTransactions(conn, 'material_issue', id, items.map((item) => ({
      transaction_date: data.issue_date,
      transaction_type: 'Issue',
      reference_no: issueHeader?.issue_no || null,
      warehouse_id: data.warehouse_id,
      item_id: item.material_id,
      receipt_qty: 0,
      opening_qty: 0,
      receipt_value: 0,
      issue_qty: parseFloat(item.issue_qty) || 0,
      issue_value: parseFloat(item.amount) || 0,
    })));
    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function remove(id) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [items] = await conn.query(
      'SELECT material_id, uom, issue_qty, warehouse_id FROM material_issue_items mii JOIN material_issues mi ON mii.issue_id = mi.id WHERE mii.issue_id=?',
      [id]
    );
    for (const item of items) {
      await updateStock(conn, item.warehouse_id, item.material_id, item.uom, parseFloat(item.issue_qty), 0);
    }
    await conn.query('DELETE FROM stock_ledger WHERE reference_type=? AND reference_id=?', ['material_issue', id]);
    await replaceReferenceTransactions(conn, 'material_issue', id, []);
    await conn.query('DELETE FROM material_issue_items WHERE issue_id=?', [id]);
    const [result] = await conn.query('DELETE FROM material_issues WHERE id=?', [id]);

    await conn.commit();
    return result.affectedRows > 0;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function getStats() {
  const [[data]] = await pool.query(
    `SELECT COUNT(*) AS total,
       SUM(status='Posted') AS posted,
       SUM(status='Draft') AS draft,
       SUM(grand_total) AS total_value
     FROM material_issues`
  );
  return data;
}

// --- Batches Dropdown for Material Issue ---
export async function getBatchesDropdown() {
  const [rows] = await pool.query(
    `SELECT b.id, b.batch_no, b.article_name, b.total_receipt_qty,
       pp.product_id, pp.batch_qty, pp.uom AS batch_uom,
       p.name AS product_name, p.code AS product_code
     FROM batches b
     LEFT JOIN production_plans pp ON b.production_plan_id = pp.id
     LEFT JOIN products p ON pp.product_id = p.id
     WHERE b.deleted_at IS NULL AND b.status IN ('In Progress', 'Pending', 'Draft')
     ORDER BY b.id DESC`
  );
  return rows;
}

// --- BOM Items for Material Issue (by product) ---
export async function getBOMItemsByProduct(productId) {
  const [rows] = await pool.query(
    `SELECT bi.material_id, bi.qty, bi.uom, bi.unit_cost,
       m.code AS material_code, m.name AS material_name
     FROM boms b
     JOIN bom_items bi ON b.id = bi.bom_id
     JOIN materials m ON bi.material_id = m.id
     WHERE b.product_id = ? AND b.status = 'Active'
     ORDER BY bi.id`,
    [productId]
  );
  return rows;
}

export async function getPreviousIssueByArticle(article, excludeId = null) {
  if (!article) return null;
  const params = [article];
  let extra = '';
  if (excludeId) { extra = ' AND mi.id <> ?'; params.push(excludeId); }
  const [[header]] = await pool.query(
    `SELECT mi.* FROM material_issues mi WHERE mi.article=?${extra} ORDER BY mi.issue_date DESC, mi.id DESC LIMIT 1`, params
  );
  if (!header) return null;
  const [items] = await pool.query(
    `SELECT mii.*, m.name AS material_name, m.code AS material_code
     FROM material_issue_items mii JOIN materials m ON mii.material_id=m.id
     WHERE mii.issue_id=? ORDER BY mii.id`, [header.id]
  );
  return { ...header, items };
}
