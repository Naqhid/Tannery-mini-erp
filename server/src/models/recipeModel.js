import pool from '../config/db.js';

export async function getAll({ search, status }) {
  let where = '1=1';
  const params = [];
  if (search) {
    where += ' AND (r.name LIKE ? OR r.code LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term);
  }
  if (status) { where += ' AND r.status = ?'; params.push(status); }

  const [rows] = await pool.query(
    `SELECT r.* FROM recipes r WHERE ${where} ORDER BY r.id DESC`,
    params
  );
  return rows;
}

export async function getById(id) {
  const [rows] = await pool.query('SELECT * FROM recipes WHERE id = ?', [id]);
  return rows[0] || null;
}

export async function getByCode(code) {
  const [rows] = await pool.query('SELECT * FROM recipes WHERE code = ?', [code]);
  return rows[0] || null;
}

export async function getNextCode() {
  const [[row]] = await pool.query("SELECT code FROM recipes ORDER BY id DESC LIMIT 1");
  if (!row) return 'RC-00001';
  const num = parseInt(row.code.split('-')[1], 10) + 1;
  return `RC-${String(num).padStart(5, '0')}`;
}

export async function create(data) {
  const code = data.code || await getNextCode();
  const [result] = await pool.query(
    `INSERT INTO recipes (code, name, leather_type, thickness, process_type, color, finish_type, uom, status, valid_from, valid_to, version, description)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [code, data.name, data.leather_type, data.thickness, data.process_type,
     data.color, data.finish_type, data.uom, data.status || 'draft',
     data.valid_from, data.valid_to, data.version || 1, data.description]
  );
  return { id: result.insertId, code };
}

export async function update(id, data) {
  const [result] = await pool.query(
    `UPDATE recipes SET name=?, leather_type=?, thickness=?, process_type=?, color=?, finish_type=?, uom=?, status=?, valid_from=?, valid_to=?, version=?, description=? WHERE id=?`,
    [data.name, data.leather_type, data.thickness, data.process_type,
     data.color, data.finish_type, data.uom, data.status,
     data.valid_from, data.valid_to, data.version, data.description, id]
  );
  return result.affectedRows > 0;
}

export async function remove(id) {
  const [result] = await pool.query('DELETE FROM recipes WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

// --- Recipe Items ---
export async function getItems(recipeId) {
  const [rows] = await pool.query(
    `SELECT ri.*, m.code AS material_code, m.name AS material_name, m.uom
     FROM recipe_items ri
     JOIN materials m ON ri.material_id = m.id
     WHERE ri.recipe_id = ?
     ORDER BY ri.id`,
    [recipeId]
  );
  return rows;
}

export async function addItem(recipeId, data) {
  const [result] = await pool.query(
    'INSERT INTO recipe_items (recipe_id, material_id, qty) VALUES (?,?,?)',
    [recipeId, data.material_id, data.qty]
  );
  return { id: result.insertId };
}

export async function updateItem(id, data) {
  const [result] = await pool.query(
    'UPDATE recipe_items SET material_id=?, qty=? WHERE id=?',
    [data.material_id, data.qty, id]
  );
  return result.affectedRows > 0;
}

export async function removeItem(id) {
  const [result] = await pool.query('DELETE FROM recipe_items WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

// --- Process Stages ---
export async function getStages(recipeId) {
  const [rows] = await pool.query(
    'SELECT * FROM recipe_process_stages WHERE recipe_id = ? ORDER BY seq, id',
    [recipeId]
  );
  return rows;
}

export async function addStage(recipeId, data) {
  const [result] = await pool.query(
    `INSERT INTO recipe_process_stages (recipe_id, seq, process_stage, machine, duration, temperature, speed, qc_check, remarks)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [recipeId, data.seq, data.process_stage, data.machine, data.duration,
     data.temperature, data.speed, data.qc_check, data.remarks]
  );
  return { id: result.insertId };
}

export async function updateStage(id, data) {
  const [result] = await pool.query(
    `UPDATE recipe_process_stages SET seq=?, process_stage=?, machine=?, duration=?, temperature=?, speed=?, qc_check=?, remarks=? WHERE id=?`,
    [data.seq, data.process_stage, data.machine, data.duration,
     data.temperature, data.speed, data.qc_check, data.remarks, id]
  );
  return result.affectedRows > 0;
}

export async function removeStage(id) {
  const [result] = await pool.query('DELETE FROM recipe_process_stages WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function getStats() {
  const [[total]] = await pool.query('SELECT COUNT(*) AS total FROM recipes');
  const [[active]] = await pool.query("SELECT COUNT(*) AS total FROM recipes WHERE status='active'");
  return { total: total.total, active: active.total };
}
