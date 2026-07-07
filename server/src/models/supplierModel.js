import pool from '../config/db.js';

export async function getAll({ search, status, page, limit, sortBy, sortOrder }) {
  let where = '1=1';
  const params = [];

  if (search) {
    where += ' AND (s.name LIKE ? OR s.code LIKE ? OR s.contact_person LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }
  if (status) {
    where += ' AND s.status = ?';
    params.push(status);
  }

  const allowedSortColumns = ['id', 'code', 'name', 'contact_person', 'phone', 'email', 'city', 'state', 'status', 'created_at'];
  const column = allowedSortColumns.includes(sortBy) ? `s.${sortBy}` : 's.id';
  const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT s.*, co.name AS country_name, st.name AS state_name, ci.name AS city_name
     FROM suppliers s
     LEFT JOIN countries co ON s.country_id = co.id
     LEFT JOIN states st ON s.state_id = st.id
     LEFT JOIN cities ci ON s.city_id = ci.id
     WHERE ${where} ORDER BY ${column} ${order} LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM suppliers s WHERE ${where}`,
    params
  );
  return { rows, total };
}

export async function getById(id) {
  const [rows] = await pool.query(
    `SELECT s.*, co.name AS country_name, st.name AS state_name, ci.name AS city_name
     FROM suppliers s
     LEFT JOIN countries co ON s.country_id = co.id
     LEFT JOIN states st ON s.state_id = st.id
     LEFT JOIN cities ci ON s.city_id = ci.id
     WHERE s.id = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function getNextCode() {
  const [[row]] = await pool.query("SELECT code FROM suppliers ORDER BY id DESC LIMIT 1");
  if (!row) return 'SUP-00001';
  const num = parseInt(row.code.split('-')[1], 10) + 1;
  return `SUP-${String(num).padStart(5, '0')}`;
}

export async function create(data, createdBy = null) {
  const code = data.code || await getNextCode();
  const [result] = await pool.query(
    `INSERT INTO suppliers (code, name, contact_person, phone, email, alt_phone, city, state, country, address, pincode, website, category, supply_type, gstin, pan, payment_terms, bank_name, bank_account, ifsc_code, notes, status, country_id, state_id, city_id, created_by)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [code, data.name, data.contact_person, data.phone, data.email, data.alt_phone,
     data.city, data.state, data.country || null, data.address, data.pincode, data.website,
     data.category, data.supply_type, data.gstin, data.pan, data.payment_terms,
     data.bank_name, data.bank_account, data.ifsc_code, data.notes, data.status || 'Active',
     data.country_id || null, data.state_id || null, data.city_id || null, createdBy]
  );
  return { id: result.insertId, code };
}

export async function update(id, data, updatedBy = null) {
  const [result] = await pool.query(
    `UPDATE suppliers SET code=?, name=?, contact_person=?, phone=?, email=?, alt_phone=?, city=?, state=?, country=?, address=?, pincode=?, website=?, category=?, supply_type=?, gstin=?, pan=?, payment_terms=?, bank_name=?, bank_account=?, ifsc_code=?, notes=?, status=?, country_id=?, state_id=?, city_id=?, updated_by=? WHERE id=?`,
    [data.code, data.name, data.contact_person, data.phone, data.email, data.alt_phone,
     data.city, data.state, data.country || null, data.address, data.pincode, data.website,
     data.category, data.supply_type, data.gstin, data.pan, data.payment_terms,
     data.bank_name, data.bank_account, data.ifsc_code, data.notes, data.status,
     data.country_id || null, data.state_id || null, data.city_id || null,
     updatedBy, id]
  );
  return result.affectedRows > 0;
}

export async function checkReferences(id) {
  const [[pricingCount]] = await pool.query('SELECT COUNT(*) AS count FROM supplier_pricing WHERE supplier_id = ?', [id]);
  if (pricingCount.count > 0) return { hasReferences: true, table: 'Supplier Pricing' };
  // Check if supplier has financial transaction data
  const [rows] = await pool.query(
    `SELECT bank_account, gstin, pan FROM suppliers WHERE id = ?`,
    [id]
  );
  if (rows.length > 0) {
    const supplier = rows[0];
    const hasFinancialData = (supplier.bank_account && supplier.bank_account.trim() !== '') ||
                             (supplier.gstin && supplier.gstin.trim() !== '') ||
                             (supplier.pan && supplier.pan.trim() !== '');
    if (hasFinancialData) {
      return { hasReferences: true, table: 'Financial Transactions' };
    }
  }
  return { hasReferences: false };
}

export async function remove(id) {
  const refCheck = await checkReferences(id);
  if (refCheck.hasReferences) {
    const err = new Error(`Cannot delete this supplier. It is being used in ${refCheck.table}.`);
    err.code = 'REFERENCE_ERROR';
    throw err;
  }
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
