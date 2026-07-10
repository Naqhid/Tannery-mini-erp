import pool from '../config/db.js';

export async function getAll({ search, status, page, limit, sortBy, sortOrder }) {
  let where = '1=1';
  const params = [];
  if (search) {
    where += ' AND (b.name LIKE ? OR b.code LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term);
  }
  if (status) { where += ' AND b.status = ?'; params.push(status); }

  const allowedSortColumns = ['id', 'code', 'name', 'leather_type', 'process_type', 'status', 'version', 'created_at'];
  const column = allowedSortColumns.includes(sortBy) ? `b.${sortBy}` : 'b.id';
  const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT b.*, p.name AS product_name, p.code AS product_code,
      lt.name AS leather_type_name, u.name AS uom_name, th.name AS thickness_name
    FROM boms b
    LEFT JOIN products p ON b.product_id = p.id
    LEFT JOIN leather_types lt ON b.leather_type_id = lt.id
    LEFT JOIN uom u ON b.uom_id = u.id
    LEFT JOIN thickness th ON b.thickness_id = th.id
    WHERE ${where}
    ORDER BY ${column} ${order} LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM boms b WHERE ${where}`,
    params
  );
  return { rows, total };
}

export async function getById(id) {
  const [rows] = await pool.query(
    `SELECT b.*, p.name AS product_name, p.code AS product_code,
      lt.name AS leather_type_name, u.name AS uom_name, th.name AS thickness_name
    FROM boms b
    LEFT JOIN products p ON b.product_id = p.id
    LEFT JOIN leather_types lt ON b.leather_type_id = lt.id
    LEFT JOIN uom u ON b.uom_id = u.id
    LEFT JOIN thickness th ON b.thickness_id = th.id
    WHERE b.id = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function getByCode(code) {
  const [rows] = await pool.query('SELECT * FROM boms WHERE code = ?', [code]);
  return rows[0] || null;
}

export async function getNextCode() {
  const [[row]] = await pool.query("SELECT code FROM boms ORDER BY id DESC LIMIT 1");
  if (!row) return 'BOM-00001';
  const num = parseInt(row.code.split('-')[1], 10) + 1;
  return `BOM-${String(num).padStart(5, '0')}`;
}

export async function create(data, createdBy = null) {
  const code = data.code || await getNextCode();
  const [result] = await pool.query(
    `INSERT INTO boms (code, name, product_id, recipe_id, leather_type, process_type, thickness, uom, valid_from, valid_to, status, description, version, leather_type_id, uom_id, thickness_id, created_by)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [code, data.name, data.product_id, data.recipe_id, data.leather_type,
     data.process_type, data.thickness, data.uom, data.valid_from, data.valid_to,
     data.status || 'Draft', data.description, data.version || 1,
     data.leather_type_id || null, data.uom_id || null, data.thickness_id || null,
     createdBy]
  );
  return { id: result.insertId, code };
}

export async function update(id, data, updatedBy = null) {
  const [result] = await pool.query(
    `UPDATE boms SET code=?, name=?, product_id=?, recipe_id=?, leather_type=?, process_type=?, thickness=?, uom=?, valid_from=?, valid_to=?, status=?, description=?, version=?, leather_type_id=?, uom_id=?, thickness_id=?, updated_by=? WHERE id=?`,
    [data.code, data.name, data.product_id, data.recipe_id, data.leather_type,
     data.process_type, data.thickness, data.uom, data.valid_from, data.valid_to,
     data.status, data.description, data.version,
     data.leather_type_id || null, data.uom_id || null, data.thickness_id || null,
     updatedBy, id]
  );
  return result.affectedRows > 0;
}

export async function remove(id) {
  const [result] = await pool.query('DELETE FROM boms WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

// --- BOM Items ---
export async function getItems(bomId) {
  const [rows] = await pool.query(
    `SELECT bi.*, m.code AS material_code, m.name AS material_name
     FROM bom_items bi
     JOIN materials m ON bi.material_id = m.id
     WHERE bi.bom_id = ?
     ORDER BY bi.id`,
    [bomId]
  );
  return rows;
}

export async function addItem(bomId, data, createdBy = null) {
  const [result] = await pool.query(
    `INSERT INTO bom_items (bom_id, material_id, type, uom, qty, unit_cost, amount, remarks, supplier_id, created_by)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [bomId, data.material_id, data.type, data.uom, data.qty,
     data.unit_cost, data.amount, data.remarks, data.supplier_id || null, createdBy]
  );
  return { id: result.insertId };
}

export async function updateItem(id, data, updatedBy = null) {
  const [result] = await pool.query(
    `UPDATE bom_items SET material_id=?, type=?, uom=?, qty=?, unit_cost=?, amount=?, remarks=?, supplier_id=?, updated_by=? WHERE id=?`,
    [data.material_id, data.type, data.uom, data.qty, data.unit_cost, data.amount, data.remarks, data.supplier_id || null, updatedBy, id]
  );
  return result.affectedRows > 0;
}

export async function removeItem(id) {
  const [result] = await pool.query('DELETE FROM bom_items WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function getStats() {
  const [[total]] = await pool.query('SELECT COUNT(*) AS total FROM boms');
  const [[active]] = await pool.query("SELECT COUNT(*) AS total FROM boms WHERE status='Active'");
  return { total: total.total, active: active.total };
}
