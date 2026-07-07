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
      g.name AS grade_name, h.name AS hsn_name, ss.name AS standard_size_name
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
      g.name AS grade_name, h.name AS hsn_name, ss.name AS standard_size_name
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
    WHERE p.id = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function getNextCode() {
  const [[row]] = await pool.query("SELECT code FROM products ORDER BY id DESC LIMIT 1");
  if (!row) return 'PRD-00001';
  const num = parseInt(row.code.split('-')[1], 10) + 1;
  return `PRD-${String(num).padStart(5, '0')}`;
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
    `INSERT INTO products (code, name, category, leather_type, uom, thickness, color, finish_type, description, standard_size, grade, hsn_code, status, category_id, leather_type_id, uom_id, thickness_id, color_id, finish_type_id, grade_id, hsn_code_id, standard_size_id, created_by)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [code, data.name, data.category || null, leatherType, data.uom || null, data.thickness || null,
     data.color || null, data.finish_type || null, data.description, data.standard_size || null,
     grade, data.hsn_code || null, data.status || 'Active',
     data.category_id || null, data.leather_type_id || null, data.uom_id || null,
     data.thickness_id || null, data.color_id || null, data.finish_type_id || null,
     data.grade_id || null, data.hsn_code_id || null, data.standard_size_id || null,
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
    `UPDATE products SET code=?, name=?, category=?, leather_type=?, uom=?, thickness=?, color=?, finish_type=?, description=?, standard_size=?, grade=?, hsn_code=?, status=?, category_id=?, leather_type_id=?, uom_id=?, thickness_id=?, color_id=?, finish_type_id=?, grade_id=?, hsn_code_id=?, standard_size_id=?, updated_by=? WHERE id=?`,
    [data.code, data.name, data.category || null, leatherType, data.uom || null, data.thickness || null,
     data.color || null, data.finish_type || null, data.description, data.standard_size || null,
     grade, data.hsn_code || null, data.status,
     data.category_id || null, data.leather_type_id || null, data.uom_id || null,
     data.thickness_id || null, data.color_id || null, data.finish_type_id || null,
     data.grade_id || null, data.hsn_code_id || null, data.standard_size_id || null,
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
    `SELECT id, code, name, leather_type, thickness, uom, leather_type_id, uom_id, thickness_id, finish_type_id, color_id FROM products WHERE status='Active' ORDER BY name ASC LIMIT 500`
  );
  return rows;
}
