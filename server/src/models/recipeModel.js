import pool from '../config/db.js';

export async function getAll({ search, status, page, limit, sortBy, sortOrder }) {
  let where = '1=1';
  const params = [];
  if (search) {
    where += ' AND (r.name LIKE ? OR r.code LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term);
  }
  if (status) { where += ' AND r.status = ?'; params.push(status); }

  const allowedSortColumns = ['id', 'code', 'name', 'leather_type', 'process_type', 'status', 'version', 'created_at'];
  const column = allowedSortColumns.includes(sortBy) ? `r.${sortBy}` : 'r.id';
  const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT r.*,
      p.name AS product_name, p.code AS product_code,
      lt.name AS leather_type_name, ft.name AS finish_type_name,
      c.name AS color_name, u.name AS uom_name, th.name AS thickness_name
    FROM recipes r
    LEFT JOIN products p ON r.product_id = p.id
    LEFT JOIN leather_types lt ON r.leather_type_id = lt.id
    LEFT JOIN finish_types ft ON r.finish_type_id = ft.id
    LEFT JOIN colors c ON r.color_id = c.id
    LEFT JOIN uom u ON r.uom_id = u.id
    LEFT JOIN thickness th ON r.thickness_id = th.id
    WHERE ${where} ORDER BY ${column} ${order} LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM recipes r WHERE ${where}`,
    params
  );
  return { rows, total };
}

export async function getById(id) {
  const [rows] = await pool.query(
    `SELECT r.*,
      p.name AS product_name, p.code AS product_code,
      lt.name AS leather_type_name, ft.name AS finish_type_name,
      c.name AS color_name, u.name AS uom_name, th.name AS thickness_name
    FROM recipes r
    LEFT JOIN products p ON r.product_id = p.id
    LEFT JOIN leather_types lt ON r.leather_type_id = lt.id
    LEFT JOIN finish_types ft ON r.finish_type_id = ft.id
    LEFT JOIN colors c ON r.color_id = c.id
    LEFT JOIN uom u ON r.uom_id = u.id
    LEFT JOIN thickness th ON r.thickness_id = th.id
    WHERE r.id = ?`,
    [id]
  );
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

export async function create(data, createdBy = null) {
  const code = data.code || await getNextCode();
  const [result] = await pool.query(
    `INSERT INTO recipes (code, name, leather_type, thickness, process_type, color, finish_type, uom, status, valid_from, valid_to, version, description, product_id, leather_type_id, finish_type_id, color_id, uom_id, thickness_id, created_by)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [code, data.name, data.leather_type, data.thickness, data.process_type,
     data.color, data.finish_type, data.uom, data.status || 'draft',
     data.valid_from, data.valid_to, data.version || 1, data.description,
     data.product_id || null, data.leather_type_id || null, data.finish_type_id || null,
     data.color_id || null, data.uom_id || null, data.thickness_id || null,
     createdBy]
  );
  return { id: result.insertId, code };
}

export async function update(id, data, updatedBy = null) {
  const [result] = await pool.query(
    `UPDATE recipes SET code=?, name=?, leather_type=?, thickness=?, process_type=?, color=?, finish_type=?, uom=?, status=?, valid_from=?, valid_to=?, version=?, description=?, product_id=?, leather_type_id=?, finish_type_id=?, color_id=?, uom_id=?, thickness_id=?, updated_by=? WHERE id=?`,
    [data.code, data.name, data.leather_type, data.thickness, data.process_type,
     data.color, data.finish_type, data.uom, data.status,
     data.valid_from, data.valid_to, data.version, data.description,
     data.product_id || null, data.leather_type_id || null, data.finish_type_id || null,
     data.color_id || null, data.uom_id || null, data.thickness_id || null,
     updatedBy, id]
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

export async function addItem(recipeId, data, createdBy = null) {
  const [result] = await pool.query(
    'INSERT INTO recipe_items (recipe_id, material_id, qty, created_by) VALUES (?,?,?,?)',
    [recipeId, data.material_id, data.qty, createdBy]
  );
  return { id: result.insertId };
}

export async function updateItem(id, data, updatedBy = null) {
  const [result] = await pool.query(
    'UPDATE recipe_items SET material_id=?, qty=?, updated_by=? WHERE id=?',
    [data.material_id, data.qty, updatedBy, id]
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
    `SELECT rps.*, ps.name AS process_stage_name, m.name AS machine_name
     FROM recipe_process_stages rps
     LEFT JOIN process_stages ps ON rps.process_stage_id = ps.id
     LEFT JOIN machines m ON rps.machine_id = m.id
     WHERE rps.recipe_id = ?
     ORDER BY rps.seq, rps.id`,
    [recipeId]
  );
  return rows;
}

export async function addStage(recipeId, data, createdBy = null) {
  const [result] = await pool.query(
    `INSERT INTO recipe_process_stages (recipe_id, seq, process_stage, machine, duration, temperature, speed, qc_check, remarks, process_stage_id, machine_id)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [recipeId, data.seq, data.process_stage, data.machine, data.duration,
     data.temperature, data.speed, data.qc_check, data.remarks,
     data.process_stage_id || null, data.machine_id || null]
  );
  return { id: result.insertId };
}

export async function updateStage(id, data, updatedBy = null) {
  const [result] = await pool.query(
    `UPDATE recipe_process_stages SET seq=?, process_stage=?, machine=?, duration=?, temperature=?, speed=?, qc_check=?, remarks=?, process_stage_id=?, machine_id=? WHERE id=?`,
    [data.seq, data.process_stage, data.machine, data.duration,
     data.temperature, data.speed, data.qc_check, data.remarks,
     data.process_stage_id || null, data.machine_id || null, id]
  );
  return result.affectedRows > 0;
}

export async function removeStage(id) {
  const [result] = await pool.query('DELETE FROM recipe_process_stages WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

// --- Recipe Attachments ---
export async function getAttachments(recipeId) {
  const [rows] = await pool.query(
    'SELECT * FROM recipe_attachments WHERE recipe_id = ? ORDER BY uploaded_at DESC',
    [recipeId]
  );
  return rows;
}

export async function addAttachment(recipeId, data, uploadedBy = null) {
  const [result] = await pool.query(
    `INSERT INTO recipe_attachments (recipe_id, file_name, file_path, file_type, file_size, uploaded_by)
     VALUES (?,?,?,?,?,?)`,
    [recipeId, data.file_name, data.file_path, data.file_type, data.file_size, uploadedBy]
  );
  return { id: result.insertId };
}

export async function removeAttachment(id) {
  const [result] = await pool.query('DELETE FROM recipe_attachments WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

// --- Recipe Remarks ---
export async function getRemarks(recipeId) {
  const [rows] = await pool.query(
    'SELECT remarks FROM recipes WHERE id = ?',
    [recipeId]
  );
  return rows[0]?.remarks || '';
}

export async function updateRemarks(recipeId, remarks, updatedBy = null) {
  const [result] = await pool.query(
    'UPDATE recipes SET remarks=?, updated_by=? WHERE id=?',
    [remarks, updatedBy, recipeId]
  );
  return result.affectedRows > 0;
}

// --- BOM Items for Recipe ---
export async function getBOMItemsByProduct(productId) {
  const [rows] = await pool.query(
    `SELECT bi.*, m.code AS material_code, m.name AS material_name, m.uom, b.code AS bom_code, b.name AS bom_name
     FROM boms b
     JOIN bom_items bi ON b.id = bi.bom_id
     JOIN materials m ON bi.material_id = m.id
     WHERE b.product_id = ? AND b.status = 'Active'
     ORDER BY bi.id`,
    [productId]
  );
  return rows;
}

// --- Process Stage Parameters ---
export async function getStageParameters(processStageId) {
  const [rows] = await pool.query(
    'SELECT * FROM process_stage_parameters WHERE process_stage_id = ? ORDER BY seq, id',
    [processStageId]
  );
  return rows;
}

export async function getStats() {
  const [[total]] = await pool.query('SELECT COUNT(*) AS total FROM recipes');
  const [[active]] = await pool.query("SELECT COUNT(*) AS total FROM recipes WHERE status='active'");
  return { total: total.total, active: active.total };
}
