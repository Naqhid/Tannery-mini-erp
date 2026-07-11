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
  const [[row]] = await pool.query(
    "SELECT code FROM customers ORDER BY id DESC LIMIT 1"
  );
  if (!row) return 'CUST-00001';
  const num = parseInt(row.code.split('-')[1], 10) + 1;
  return `CUST-${String(num).padStart(5, '0')}`;
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
