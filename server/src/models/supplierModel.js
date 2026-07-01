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
    `SELECT * FROM suppliers WHERE ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM suppliers WHERE ${where}`,
    params
  );
  return { rows, total };
}

export async function getById(id) {
  const [rows] = await pool.query('SELECT * FROM suppliers WHERE id = ?', [id]);
  return rows[0] || null;
}

export async function getNextCode() {
  const [[row]] = await pool.query("SELECT code FROM suppliers ORDER BY id DESC LIMIT 1");
  if (!row) return 'SUP-00001';
  const num = parseInt(row.code.split('-')[1], 10) + 1;
  return `SUP-${String(num).padStart(5, '0')}`;
}

export async function create(data) {
  const code = data.code || await getNextCode();
  const [result] = await pool.query(
    `INSERT INTO suppliers (code, name, contact_person, phone, email, alt_phone, city, state, address, pincode, website, category, supply_type, gstin, pan, payment_terms, bank_name, bank_account, ifsc_code, notes, status)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [code, data.name, data.contact_person, data.phone, data.email, data.alt_phone,
     data.city, data.state, data.address, data.pincode, data.website,
     data.category, data.supply_type, data.gstin, data.pan, data.payment_terms,
     data.bank_name, data.bank_account, data.ifsc_code, data.notes, data.status || 'Active']
  );
  return { id: result.insertId, code };
}

export async function update(id, data) {
  const [result] = await pool.query(
    `UPDATE suppliers SET name=?, contact_person=?, phone=?, email=?, alt_phone=?, city=?, state=?, address=?, pincode=?, website=?, category=?, supply_type=?, gstin=?, pan=?, payment_terms=?, bank_name=?, bank_account=?, ifsc_code=?, notes=?, status=? WHERE id=?`,
    [data.name, data.contact_person, data.phone, data.email, data.alt_phone,
     data.city, data.state, data.address, data.pincode, data.website,
     data.category, data.supply_type, data.gstin, data.pan, data.payment_terms,
     data.bank_name, data.bank_account, data.ifsc_code, data.notes, data.status, id]
  );
  return result.affectedRows > 0;
}

export async function remove(id) {
  const [result] = await pool.query('DELETE FROM suppliers WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function getStats() {
  const [[total]] = await pool.query('SELECT COUNT(*) AS total FROM suppliers');
  const [[active]] = await pool.query("SELECT COUNT(*) AS total FROM suppliers WHERE status='Active'");
  return { total: total.total, active: active.total };
}

// --- Supplier Pricing ---
export async function getPricing(supplierId) {
  const [rows] = await pool.query(
    `SELECT sp.*, m.code AS material_code, m.name AS material_name
     FROM supplier_pricing sp
     JOIN materials m ON sp.material_id = m.id
     WHERE sp.supplier_id = ?
     ORDER BY sp.id DESC`,
    [supplierId]
  );
  return rows;
}

export async function getAllPricing({ materialId, dateFrom, dateTo }) {
  let where = '1=1';
  const params = [];
  if (materialId) { where += ' AND sp.material_id = ?'; params.push(materialId); }
  if (dateFrom) { where += ' AND sp.valid_from >= ?'; params.push(dateFrom); }
  if (dateTo) { where += ' AND sp.valid_to <= ?'; params.push(dateTo); }

  const [rows] = await pool.query(
    `SELECT sp.*, m.code AS material_code, m.name AS material_name
     FROM supplier_pricing sp
     JOIN materials m ON sp.material_id = m.id
     WHERE ${where}
     ORDER BY sp.id DESC`,
    params
  );
  return rows;
}

export async function createPricing(data) {
  const [result] = await pool.query(
    `INSERT INTO supplier_pricing (supplier_id, material_id, uom, price, valid_from, valid_to, status)
     VALUES (?,?,?,?,?,?,?)`,
    [data.supplier_id, data.material_id, data.uom, data.price,
     data.valid_from, data.valid_to, data.status || 'Pending']
  );
  return { id: result.insertId };
}

export async function updatePricing(id, data) {
  const [result] = await pool.query(
    `UPDATE supplier_pricing SET supplier_id=?, material_id=?, uom=?, price=?, valid_from=?, valid_to=?, status=? WHERE id=?`,
    [data.supplier_id, data.material_id, data.uom, data.price,
     data.valid_from, data.valid_to, data.status, id]
  );
  return result.affectedRows > 0;
}

export async function deletePricing(id) {
  const [result] = await pool.query('DELETE FROM supplier_pricing WHERE id = ?', [id]);
  return result.affectedRows > 0;
}
