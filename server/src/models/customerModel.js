import pool from '../config/db.js';

export async function getAll({ search, status, page, limit, sortBy, sortOrder }) {
  let where = '1=1';
  const params = [];

  if (search) {
    where += ' AND (c.name LIKE ? OR c.code LIKE ? OR c.contact_person LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }
  if (status) {
    where += ' AND c.status = ?';
    params.push(status);
  }

  const allowedSortColumns = ['id', 'code', 'name', 'contact_person', 'phone', 'email', 'city', 'status', 'created_at'];
  const column = allowedSortColumns.includes(sortBy) ? `c.${sortBy}` : 'c.id';
  const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT c.*,
      co.name AS country_name, s.name AS state_name, ci.name AS city_name
    FROM customers c
    LEFT JOIN countries co ON c.country_id = co.id
    LEFT JOIN states s ON c.state_id = s.id
    LEFT JOIN cities ci ON c.city_id = ci.id
    WHERE ${where} ORDER BY ${column} ${order} LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM customers c WHERE ${where}`,
    params
  );
  return { rows, total };
}

export async function getById(id) {
  const [rows] = await pool.query(
    `SELECT c.*,
      co.name AS country_name, s.name AS state_name, ci.name AS city_name
    FROM customers c
    LEFT JOIN countries co ON c.country_id = co.id
    LEFT JOIN states s ON c.state_id = s.id
    LEFT JOIN cities ci ON c.city_id = ci.id
    WHERE c.id = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function getByCode(code) {
  const [rows] = await pool.query('SELECT * FROM customers WHERE code = ?', [code]);
  return rows[0] || null;
}

export async function getNextCode() {
  const [rows] = await pool.query("SELECT code FROM customers WHERE code LIKE 'CUST-%'");
  let maxNum = 0;
  for (const r of rows) {
    const parts = String(r.code || '').split('-');
    const n = parseInt(parts[parts.length - 1], 10);
    if (!Number.isNaN(n) && n > maxNum) maxNum = n;
  }
  return `CUST-${String(maxNum + 1).padStart(5, '0')}`;
}

export async function create(data, createdBy = null) {
  const code = data.code || await getNextCode();
  const [result] = await pool.query(
    `INSERT INTO customers (code, name, contact_person, phone, email, alt_phone, city, state, country, status, category, currency, billing_address, shipping_address, pin_code, gstin, pan, payment_terms, credit_limit, notes, country_id, state_id, city_id, created_by)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [code, data.name, data.contact_person, data.phone, data.email, data.alt_phone,
     data.city, data.state, data.country || null, data.status || 'Active', data.category, data.currency,
     data.billing_address, data.shipping_address, data.pin_code, data.gstin, data.pan,
     data.payment_terms, data.credit_limit, data.notes,
     data.country_id || null, data.state_id || null, data.city_id || null,
     createdBy]
  );
  return { id: result.insertId, code };
}

export async function update(id, data, updatedBy = null) {
  const [result] = await pool.query(
    `UPDATE customers SET code=?, name=?, contact_person=?, phone=?, email=?, alt_phone=?, city=?, state=?, country=?, status=?, category=?, currency=?, billing_address=?, shipping_address=?, pin_code=?, gstin=?, pan=?, payment_terms=?, credit_limit=?, notes=?, country_id=?, state_id=?, city_id=?, updated_by=? WHERE id=?`,
    [data.code, data.name, data.contact_person, data.phone, data.email, data.alt_phone,
     data.city, data.state, data.country || null, data.status, data.category, data.currency,
     data.billing_address, data.shipping_address, data.pin_code, data.gstin, data.pan,
     data.payment_terms, data.credit_limit, data.notes,
     data.country_id || null, data.state_id || null, data.city_id || null,
     updatedBy, id]
  );
  return result.affectedRows > 0;
}

export async function checkReferences(id) {
  // Check if customer has financial transaction data
  const [rows] = await pool.query(
    `SELECT payment_terms, credit_limit, gstin, pan FROM customers WHERE id = ?`,
    [id]
  );
  if (rows.length > 0) {
    const customer = rows[0];
    const hasFinancialData = (customer.credit_limit && customer.credit_limit.trim() !== '') ||
                             (customer.gstin && customer.gstin.trim() !== '') ||
                             (customer.pan && customer.pan.trim() !== '');
    if (hasFinancialData) {
      return { hasReferences: true, table: 'Financial Transactions' };
    }
  }
  return { hasReferences: false };
}

export async function hasFinancialData(id) {
  const [rows] = await pool.query(
    `SELECT payment_terms, credit_limit, gstin, pan FROM customers WHERE id = ?`,
    [id]
  );
  if (rows.length === 0) return false;
  const customer = rows[0];
  return (customer.credit_limit && customer.credit_limit.trim() !== '') ||
         (customer.gstin && customer.gstin.trim() !== '') ||
         (customer.pan && customer.pan.trim() !== '');
}

export async function remove(id) {
  const refCheck = await checkReferences(id);
  if (refCheck.hasReferences) {
    const err = new Error(`Cannot delete this customer. It is being used in ${refCheck.table}.`);
    err.code = 'REFERENCE_ERROR';
    throw err;
  }
  const [result] = await pool.query('DELETE FROM customers WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function getStats() {
  const [[total]] = await pool.query('SELECT COUNT(*) AS total FROM customers');
  const [[active]] = await pool.query("SELECT COUNT(*) AS total FROM customers WHERE status='Active'");
  const [[inactive]] = await pool.query("SELECT COUNT(*) AS total FROM customers WHERE status='Inactive'");
  return { total: total.total, active: active.total, inactive: inactive.total };
}

export async function softDelete(id) {
  const [result] = await pool.query(
    `UPDATE customers SET deleted_at = CURRENT_TIMESTAMP, status = 'Inactive' WHERE id = ? AND deleted_at IS NULL`,
    [id]
  );
  return result.affectedRows > 0;
}

export async function restore(id) {
  const [result] = await pool.query(
    `UPDATE customers SET deleted_at = NULL, status = 'Active' WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
}

export async function bulkSoftDelete(ids) {
  if (!ids || ids.length === 0) return 0;
  const placeholders = ids.map(() => '?').join(', ');
  const [result] = await pool.query(
    `UPDATE customers SET deleted_at = CURRENT_TIMESTAMP, status = 'Inactive' WHERE id IN (${placeholders}) AND deleted_at IS NULL`,
    ids
  );
  return result.affectedRows;
}

export async function bulkUpdateStatus(ids, status) {
  if (!ids || ids.length === 0) return 0;
  const placeholders = ids.map(() => '?').join(', ');
  const [result] = await pool.query(
    `UPDATE customers SET status = ? WHERE id IN (${placeholders}) AND deleted_at IS NULL`,
    [status, ...ids]
  );
  return result.affectedRows;
}

export async function bulkArchive(ids) {
  return bulkSoftDelete(ids);
}

export async function duplicate(id) {
  const original = await getById(id);
  if (!original) return null;
  const newCode = await getNextCode();
  const data = { ...original, code: newCode, name: `${original.name} (Copy)` };
  delete data.id;
  delete data.created_at;
  delete data.updated_at;
  delete data.deleted_at;
  delete data.created_by;
  delete data.updated_by;
  delete data.country_name;
  delete data.state_name;
  delete data.city_name;
  return create(data, null);
}

export async function checkDuplicate(data, excludeId = null) {
  if (!data.name) return null;
  let query = `SELECT id, code, name FROM customers WHERE name = ? AND deleted_at IS NULL`;
  const values = [data.name];
  if (excludeId) {
    query += ' AND id != ?';
    values.push(excludeId);
  }
  const [rows] = await pool.query(query, values);
  if (rows.length > 0) {
    return { field: 'name', existing: rows[0] };
  }
  return null;
}

export async function getAuditInfo(id) {
  const [rows] = await pool.query(
    `SELECT id, code, name, created_by, created_at, updated_by, updated_at, deleted_at FROM customers WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function dropdown() {
  const [rows] = await pool.query(
    `SELECT id, code, name FROM customers WHERE status = 'Active' AND deleted_at IS NULL ORDER BY name ASC`
  );
  return rows;
}
