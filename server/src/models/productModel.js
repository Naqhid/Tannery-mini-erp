import pool from '../config/db.js';

export async function getAll({ search, status, page, limit, sortBy, sortOrder }) {
  let where = '1=1';
  const params = [];

  if (search) {
    where += ' AND (p.name LIKE ? OR p.code LIKE ? OR p.category LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }
  if (status) {
    where += ' AND p.status = ?';
    params.push(status);
  }

  const allowedSortColumns = ['id', 'code', 'name', 'category', 'leather_type', 'thickness', 'status', 'created_at'];
  const column = allowedSortColumns.includes(sortBy) ? `p.${sortBy}` : 'p.id';
  const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT p.*,
      pc.name AS category_name, lt.name AS leather_type_name, u.name AS uom_name,
      th.name AS thickness_name, c.name AS color_name, ft.name AS finish_type_name,
      g.name AS grade_name, h.name AS hsn_name, ss.name AS standard_size_name,
      gm.name AS group_name, gm.hsn_code AS group_hsn_code, gm.gst_rate AS group_gst_rate,
      cust.name AS customer_name
    FROM products p
    LEFT JOIN product_categories pc ON p.category_id = pc.id
    LEFT JOIN leather_types lt ON p.leather_type_id = lt.id
    LEFT JOIN uom u ON p.uom_id = u.id
    LEFT JOIN thickness th ON p.thickness_id = th.id
    LEFT JOIN colors c ON p.color_id = c.id
    LEFT JOIN finish_types ft ON p.finish_type_id = ft.id
    LEFT JOIN grades g ON p.grade_id = g.id
    LEFT JOIN hsn_codes h ON p.hsn_code_id = h.id
    LEFT JOIN standard_sizes ss ON p.standard_size_id = ss.id
    LEFT JOIN group_master gm ON p.group_id = gm.id
    LEFT JOIN customers cust ON p.customer_id = cust.id
    WHERE ${where} ORDER BY ${column} ${order} LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM products p WHERE ${where}`,
    params
  );
  return { rows, total };
}

export async function getById(id) {
  const [rows] = await pool.query(
    `SELECT p.*,
      pc.name AS category_name, lt.name AS leather_type_name, u.name AS uom_name,
      th.name AS thickness_name, c.name AS color_name, ft.name AS finish_type_name,
      g.name AS grade_name, h.name AS hsn_name, ss.name AS standard_size_name,
      gm.name AS group_name, gm.hsn_code AS group_hsn_code, gm.gst_rate AS group_gst_rate,
      cust.name AS customer_name
    FROM products p
    LEFT JOIN product_categories pc ON p.category_id = pc.id
    LEFT JOIN leather_types lt ON p.leather_type_id = lt.id
    LEFT JOIN uom u ON p.uom_id = u.id
    LEFT JOIN thickness th ON p.thickness_id = th.id
    LEFT JOIN colors c ON p.color_id = c.id
    LEFT JOIN finish_types ft ON p.finish_type_id = ft.id
    LEFT JOIN grades g ON p.grade_id = g.id
    LEFT JOIN hsn_codes h ON p.hsn_code_id = h.id
    LEFT JOIN standard_sizes ss ON p.standard_size_id = ss.id
    LEFT JOIN group_master gm ON p.group_id = gm.id
    LEFT JOIN customers cust ON p.customer_id = cust.id
    WHERE p.id = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function getNextCode() {
  const [rows] = await pool.query("SELECT code FROM products WHERE code LIKE 'PRD-%'");
  let maxNum = 0;
  for (const r of rows) {
    const parts = String(r.code || '').split('-');
    const n = parseInt(parts[parts.length - 1], 10);
    if (!Number.isNaN(n) && n > maxNum) maxNum = n;
  }
  return `PRD-${String(maxNum + 1).padStart(5, '0')}`;
}

export async function create(data, createdBy = null) {
  const code = data.code || await getNextCode();

  // Normalize leather_type to valid ENUM value when using _id field
  let leatherType = data.leather_type || 'cow';
  const validLeatherTypes = ['cow', 'buffalo', 'goat', 'sheep'];
  if (!validLeatherTypes.includes(leatherType)) {
    // Try to extract from the name (e.g., "Calf Leather" -> check if contains a valid type)
    const lower = leatherType.toLowerCase();
    const matched = validLeatherTypes.find(t => lower.includes(t));
    leatherType = matched || 'cow';
  }

  // Normalize grade to valid ENUM value when using _id field
  let grade = data.grade || 'a';
  const validGrades = ['a', 'b', 'c'];
  if (!validGrades.includes(grade)) {
    const lower = grade.toLowerCase();
    const matched = validGrades.find(t => lower.startsWith(t) || lower.includes(`grade ${t}`) || lower.includes(`- ${t}`));
    grade = matched || 'a';
  }

  const [result] = await pool.query(
    `INSERT INTO products (code, name, category, leather_type, uom, thickness, color, finish_type, description, standard_size, grade, hsn_code, status, category_id, group_id, leather_type_id, uom_id, secondary_uom_id, thickness_id, color_id, finish_type_id, grade_id, hsn_code_id, standard_size_id, customer_id, created_by)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [code, data.name, data.category || 'General', leatherType, data.uom || null, data.thickness || null,
     data.color || null, data.finish_type || null, data.description, data.standard_size || null,
     grade, data.hsn_code || null, data.status || 'Active',
     data.category_id || null, data.group_id || null, data.leather_type_id || null, data.uom_id || null,
     data.secondary_uom_id || null,
     data.thickness_id || null, data.color_id || null, data.finish_type_id || null,
     data.grade_id || null, data.hsn_code_id || null, data.standard_size_id || null,
     data.customer_id || null,
     createdBy]
  );
  return { id: result.insertId, code };
}

export async function update(id, data, updatedBy = null) {
  // Normalize leather_type to valid ENUM value when using _id field
  let leatherType = data.leather_type || 'cow';
  const validLeatherTypes = ['cow', 'buffalo', 'goat', 'sheep'];
  if (!validLeatherTypes.includes(leatherType)) {
    const lower = leatherType.toLowerCase();
    const matched = validLeatherTypes.find(t => lower.includes(t));
    leatherType = matched || 'cow';
  }

  // Normalize grade to valid ENUM value when using _id field
  let grade = data.grade || 'a';
  const validGrades = ['a', 'b', 'c'];
  if (!validGrades.includes(grade)) {
    const lower = grade.toLowerCase();
    const matched = validGrades.find(t => lower.startsWith(t) || lower.includes(`grade ${t}`) || lower.includes(`- ${t}`));
    grade = matched || 'a';
  }

  const [result] = await pool.query(
    `UPDATE products SET code=?, name=?, category=?, leather_type=?, uom=?, thickness=?, color=?, finish_type=?, description=?, standard_size=?, grade=?, hsn_code=?, status=?, category_id=?, group_id=?, leather_type_id=?, uom_id=?, secondary_uom_id=?, thickness_id=?, color_id=?, finish_type_id=?, grade_id=?, hsn_code_id=?, standard_size_id=?, customer_id=?, updated_by=? WHERE id=?`,
    [data.code, data.name, data.category || null, leatherType, data.uom || null, data.thickness || null,
     data.color || null, data.finish_type || null, data.description, data.standard_size || null,
     grade, data.hsn_code || null, data.status,
     data.category_id || null, data.group_id || null, data.leather_type_id || null, data.uom_id || null,
     data.secondary_uom_id || null,
     data.thickness_id || null, data.color_id || null, data.finish_type_id || null,
     data.grade_id || null, data.hsn_code_id || null, data.standard_size_id || null,
     data.customer_id || null,
     updatedBy, id]
  );
  return result.affectedRows > 0;
}

export async function checkReferences(id) {
  // Check if product is used in BOMs
  const [[bomCount]] = await pool.query('SELECT COUNT(*) AS count FROM boms WHERE product_id = ?', [id]);
  if (bomCount.count > 0) return { hasReferences: true, table: 'BOMs' };

  // Check if product is used in Recipes
  const [[recipeCount]] = await pool.query('SELECT COUNT(*) AS count FROM recipes WHERE product_id = ?', [id]);
  if (recipeCount.count > 0) return { hasReferences: true, table: 'Recipes' };

  return { hasReferences: false };
}

export async function remove(id) {
  const refCheck = await checkReferences(id);
  if (refCheck.hasReferences) {
    const err = new Error(`Cannot delete this product. It is being used in ${refCheck.table}.`);
    err.code = 'REFERENCE_ERROR';
    throw err;
  }
  const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function getStats() {
  const [[total]] = await pool.query('SELECT COUNT(*) AS total FROM products');
  const [[active]] = await pool.query("SELECT COUNT(*) AS total FROM products WHERE status='Active'");
  return { total: total.total, active: active.total };
}

export async function getDropdown() {
  const [rows] = await pool.query(
    `SELECT p.id, p.code, p.name, p.leather_type, p.thickness, p.uom,
      p.leather_type_id, p.uom_id, p.thickness_id, p.finish_type_id, p.color_id,
      lt.name AS leather_type_name, u.name AS uom_name,
      th.name AS thickness_name, c.name AS color_name, ft.name AS finish_type_name
    FROM products p
    LEFT JOIN leather_types lt ON p.leather_type_id = lt.id
    LEFT JOIN uom u ON p.uom_id = u.id
    LEFT JOIN thickness th ON p.thickness_id = th.id
    LEFT JOIN colors c ON p.color_id = c.id
    LEFT JOIN finish_types ft ON p.finish_type_id = ft.id
    WHERE p.status='Active' ORDER BY p.name ASC LIMIT 500`
  );
  // Build a display name concatenating product name with color and finish
  return rows.map(r => {
    const parts = [r.name, r.color_name, r.finish_type_name].filter(Boolean);
    return { ...r, display_name: parts.join(' - ') };
  });
}

export async function softDelete(id) {
  const [result] = await pool.query(
    `UPDATE products SET deleted_at = CURRENT_TIMESTAMP, status = 'Inactive' WHERE id = ? AND deleted_at IS NULL`,
    [id]
  );
  return result.affectedRows > 0;
}

export async function restore(id) {
  const [result] = await pool.query(
    `UPDATE products SET deleted_at = NULL, status = 'Active' WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
}

export async function bulkSoftDelete(ids) {
  if (!ids || ids.length === 0) return 0;
  const placeholders = ids.map(() => '?').join(', ');
  const [result] = await pool.query(
    `UPDATE products SET deleted_at = CURRENT_TIMESTAMP, status = 'Inactive' WHERE id IN (${placeholders}) AND deleted_at IS NULL`,
    ids
  );
  return result.affectedRows;
}

export async function bulkUpdateStatus(ids, status) {
  if (!ids || ids.length === 0) return 0;
  const placeholders = ids.map(() => '?').join(', ');
  const [result] = await pool.query(
    `UPDATE products SET status = ? WHERE id IN (${placeholders}) AND deleted_at IS NULL`,
    [status, ...ids]
  );
  return result.affectedRows;
}

export async function bulkArchive(ids) { return bulkSoftDelete(ids); }

export async function duplicate(id) {
  const original = await getById(id);
  if (!original) return null;
  const newCode = await getNextCode();
  const data = { ...original, code: newCode, name: `${original.name} (Copy)` };
  delete data.id; delete data.created_at; delete data.updated_at; delete data.deleted_at;
  delete data.created_by; delete data.updated_by;
  // Remove joined field names
  delete data.category_name; delete data.leather_type_name; delete data.uom_name;
  delete data.thickness_name; delete data.color_name; delete data.finish_type_name;
  delete data.grade_name; delete data.hsn_name; delete data.standard_size_name;
  return create(data, null);
}

export async function checkDuplicate(data, excludeId = null) {
  if (!data.name) return null;
  let query = `SELECT id, code, name FROM products WHERE name = ? AND deleted_at IS NULL`;
  const values = [data.name];
  if (excludeId) { query += ' AND id != ?'; values.push(excludeId); }
  const [rows] = await pool.query(query, values);
  if (rows.length > 0) return { field: 'name', existing: rows[0] };
  return null;
}

export async function getAuditInfo(id) {
  const [rows] = await pool.query(
    `SELECT id, code, name, created_by, created_at, updated_by, updated_at, deleted_at FROM products WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}
