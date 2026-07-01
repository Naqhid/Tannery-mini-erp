import pool from '../config/db.js';

export async function getAll({ search, status }) {
  let where = '1=1';
  const params = [];
  if (search) {
    where += ' AND (b.name LIKE ? OR b.code LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term);
  }
  if (status) { where += ' AND b.status = ?'; params.push(status); }

  const [rows] = await pool.query(
    `SELECT b.*, p.name AS product_name
     FROM boms b
     LEFT JOIN products p ON b.product_id = p.id
     WHERE ${where}
     ORDER BY b.id DESC`,
    params
  );
  return rows;
}

export async function getById(id) {
  const [rows] = await pool.query(
    `SELECT b.*, p.name AS product_name
     FROM boms b
     LEFT JOIN products p ON b.product_id = p.id
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

export async function create(data) {
  const code = data.code || await getNextCode();
  const [result] = await pool.query(
    `INSERT INTO boms (code, name, product_id, recipe_id, leather_type, process_type, thickness, uom, valid_from, valid_to, status, description, version)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [code, data.name, data.product_id, data.recipe_id, data.leather_type,
     data.process_type, data.thickness, data.uom, data.valid_from, data.valid_to,
     data.status || 'Draft', data.description, data.version || 1]
  );
  return { id: result.insertId, code };
}

export async function update(id, data) {
  const [result] = await pool.query(
    `UPDATE boms SET name=?, product_id=?, recipe_id=?, leather_type=?, process_type=?, thickness=?, uom=?, valid_from=?, valid_to=?, status=?, description=?, version=? WHERE id=?`,
    [data.name, data.product_id, data.recipe_id, data.leather_type,
     data.process_type, data.thickness, data.uom, data.valid_from, data.valid_to,
     data.status, data.description, data.version, id]
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

export async function addItem(bomId, data) {
  const [result] = await pool.query(
    `INSERT INTO bom_items (bom_id, material_id, type, uom, qty, unit_cost, amount, remarks)
     VALUES (?,?,?,?,?,?,?,?)`,
    [bomId, data.material_id, data.type, data.uom, data.qty,
     data.unit_cost, data.amount, data.remarks]
  );
  return { id: result.insertId };
}

export async function updateItem(id, data) {
  const [result] = await pool.query(
    `UPDATE bom_items SET material_id=?, type=?, uom=?, qty=?, unit_cost=?, amount=?, remarks=? WHERE id=?`,
    [data.material_id, data.type, data.uom, data.qty, data.unit_cost, data.amount, data.remarks, id]
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
