import pool from '../config/db.js';

export async function getAll({ search, type }) {
  let where = '1=1';
  const params = [];
  if (search) {
    where += ' AND (name LIKE ? OR code LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term);
  }
  if (type) { where += ' AND type = ?'; params.push(type); }

  const [rows] = await pool.query(
    `SELECT * FROM materials WHERE ${where} ORDER BY id DESC`,
    params
  );
  return rows;
}

export async function getById(id) {
  const [rows] = await pool.query('SELECT * FROM materials WHERE id = ?', [id]);
  return rows[0] || null;
}

export async function getNextCode() {
  const [[row]] = await pool.query("SELECT code FROM materials ORDER BY id DESC LIMIT 1");
  if (!row) return 'MAT-00001';
  const num = parseInt(row.code.split('-')[1], 10) + 1;
  return `MAT-${String(num).padStart(5, '0')}`;
}

export async function create(data, createdBy = null) {
  const code = data.code || await getNextCode();
  const [result] = await pool.query(
    'INSERT INTO materials (code, name, uom, type, created_by) VALUES (?,?,?,?,?)',
    [code, data.name, data.uom || 'Kg', data.type || 'Chemical', createdBy]
  );
  return { id: result.insertId, code };
}

export async function update(id, data, updatedBy = null) {
  const [result] = await pool.query(
    'UPDATE materials SET name=?, uom=?, type=?, updated_by=? WHERE id=?',
    [data.name, data.uom, data.type, updatedBy, id]
  );
  return result.affectedRows > 0;
}

export async function checkReferences(id) {
  const [[bomCount]] = await pool.query('SELECT COUNT(*) AS count FROM bom_items WHERE material_id = ?', [id]);
  if (bomCount.count > 0) return { hasReferences: true, table: 'BOM Items' };
  const [[recipeCount]] = await pool.query('SELECT COUNT(*) AS count FROM recipe_items WHERE material_id = ?', [id]);
  if (recipeCount.count > 0) return { hasReferences: true, table: 'Recipe Items' };
  const [[pricingCount]] = await pool.query('SELECT COUNT(*) AS count FROM supplier_pricing WHERE material_id = ?', [id]);
  if (pricingCount.count > 0) return { hasReferences: true, table: 'Supplier Pricing' };
  return { hasReferences: false };
}

export async function remove(id) {
  const refCheck = await checkReferences(id);
  if (refCheck.hasReferences) {
    const err = new Error(`Cannot delete this material. It is being used in ${refCheck.table}.`);
    err.code = 'REFERENCE_ERROR';
    throw err;
  }
  const [result] = await pool.query('DELETE FROM materials WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function getDropdown() {
  const [rows] = await pool.query(
    `SELECT id, code, name, uom, type FROM materials ORDER BY name ASC`
  );
  return rows;
}
