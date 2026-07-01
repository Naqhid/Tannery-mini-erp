import pool from '../config/db.js';

export async function getAll({ search, status, page, limit }) {
  let where = '1=1';
  const params = [];

  if (search) {
    where += ' AND (name LIKE ? OR code LIKE ? OR contact_person LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }
  if (status) {
    where += ' AND status = ?';
    params.push(status);
  }

  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT * FROM customers WHERE ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM customers WHERE ${where}`,
    params
  );
  return { rows, total };
}

export async function getById(id) {
  const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);
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

export async function create(data) {
  const code = data.code || await getNextCode();
  const [result] = await pool.query(
    `INSERT INTO customers (code, name, contact_person, phone, email, alt_phone, city, state, status, category, currency, billing_address, shipping_address, pin_code, gstin, pan, payment_terms, credit_limit, notes)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [code, data.name, data.contact_person, data.phone, data.email, data.alt_phone,
     data.city, data.state, data.status || 'Active', data.category, data.currency,
     data.billing_address, data.shipping_address, data.pin_code, data.gstin, data.pan,
     data.payment_terms, data.credit_limit, data.notes]
  );
  return { id: result.insertId, code };
}

export async function update(id, data) {
  const [result] = await pool.query(
    `UPDATE customers SET name=?, contact_person=?, phone=?, email=?, alt_phone=?, city=?, state=?, status=?, category=?, currency=?, billing_address=?, shipping_address=?, pin_code=?, gstin=?, pan=?, payment_terms=?, credit_limit=?, notes=? WHERE id=?`,
    [data.name, data.contact_person, data.phone, data.email, data.alt_phone,
     data.city, data.state, data.status, data.category, data.currency,
     data.billing_address, data.shipping_address, data.pin_code, data.gstin, data.pan,
     data.payment_terms, data.credit_limit, data.notes, id]
  );
  return result.affectedRows > 0;
}

export async function remove(id) {
  const [result] = await pool.query('DELETE FROM customers WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function getStats() {
  const [[total]] = await pool.query('SELECT COUNT(*) AS total FROM customers');
  const [[active]] = await pool.query("SELECT COUNT(*) AS total FROM customers WHERE status='Active'");
  const [[inactive]] = await pool.query("SELECT COUNT(*) AS total FROM customers WHERE status='Inactive'");
  return { total: total.total, active: active.total, inactive: inactive.total };
}
