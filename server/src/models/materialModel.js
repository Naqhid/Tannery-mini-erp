import pool from '../config/db.js';

export async function getAll({ search, type, category, status, page = 1, limit = 10, sortBy, sortOrder }) {
  let where = '1=1';
  const params = [];

  if (search) {
    where += ' AND (m.name LIKE ? OR m.code LIKE ? OR m.chemical_group LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }
  if (type) { where += ' AND m.type = ?'; params.push(type); }
  if (category) { where += ' AND m.category = ?'; params.push(category); }
  if (status) { where += ' AND m.status = ?'; params.push(status); }

  const allowedSortColumns = ['id', 'code', 'name', 'type', 'category', 'status', 'created_at'];
  const column = allowedSortColumns.includes(sortBy) ? `m.${sortBy}` : 'm.id';
  const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT m.*, s.name AS preferred_supplier_name
     FROM materials m
     LEFT JOIN suppliers s ON m.preferred_supplier_id = s.id
     WHERE ${where} ORDER BY ${column} ${order} LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM materials m WHERE ${where}`,
    params
  );
  return { rows, total };
}

export async function getById(id) {
  const [rows] = await pool.query(
    `SELECT m.*, s.name AS preferred_supplier_name
     FROM materials m
     LEFT JOIN suppliers s ON m.preferred_supplier_id = s.id
     WHERE m.id = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function getNextCode() {
  const [[row]] = await pool.query("SELECT code FROM materials ORDER BY id DESC LIMIT 1");
  if (!row) return 'MAT-00001';
  const parts = row.code.split('-');
  const num = parseInt(parts[parts.length - 1], 10) + 1;
  return `MAT-${String(num).padStart(5, '0')}`;
}

export async function create(data, createdBy = null) {
  const code = data.code || await getNextCode();
  const [result] = await pool.query(
    `INSERT INTO materials (
      code, name, type, uom, category, chemical_group, group_id, appearance, color,
      ph_value, flash_point, hsn_code, cas_number, shelf_life, storage_condition,
      hazardous, default_warehouse, opening_stock, opening_stock_uom, current_stock,
      reorder_level, maximum_level, standard_cost, last_purchase_price,
      preferred_supplier_id, lead_time, description, application, remarks,
      attachment_path, status, created_by
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      code,
      data.name,
      data.type || 'Chemical',
      data.uom || '',
      data.category || null,
      data.chemical_group || null,
      data.group_id || null,
      data.appearance || null,
      data.color || null,
      data.ph_value || null,
      data.flash_point || null,
      data.hsn_code || null,
      data.cas_number || null,
      data.shelf_life || null,
      data.storage_condition || null,
      data.hazardous ? 1 : 0,
      data.default_warehouse || null,
      data.opening_stock || 0,
      data.opening_stock_uom || null,
      data.opening_stock || 0,
      data.reorder_level || 0,
      data.maximum_level || 0,
      data.standard_cost || 0,
      data.last_purchase_price || 0,
      data.preferred_supplier_id || null,
      data.lead_time || null,
      data.description || null,
      data.application || null,
      data.remarks || null,
      data.attachment_path || null,
      data.status || 'Active',
      createdBy,
    ]
  );
  return { id: result.insertId, code };
}

export async function update(id, data, updatedBy = null) {
  const [result] = await pool.query(
    `UPDATE materials SET
      name=?, type=?, uom=?, category=?, chemical_group=?, group_id=?, appearance=?, color=?,
      ph_value=?, flash_point=?, hsn_code=?, cas_number=?, shelf_life=?, storage_condition=?,
      hazardous=?, default_warehouse=?, opening_stock=?, opening_stock_uom=?,
      reorder_level=?, maximum_level=?, standard_cost=?, last_purchase_price=?,
      preferred_supplier_id=?, lead_time=?, description=?, application=?, remarks=?,
      attachment_path=?, status=?, updated_by=?
     WHERE id=?`,
    [
      data.name,
      data.type || 'Chemical',
      data.uom || '',
      data.category || null,
      data.chemical_group || null,
      data.group_id || null,
      data.appearance || null,
      data.color || null,
      data.ph_value || null,
      data.flash_point || null,
      data.hsn_code || null,
      data.cas_number || null,
      data.shelf_life || null,
      data.storage_condition || null,
      data.hazardous ? 1 : 0,
      data.default_warehouse || null,
      data.opening_stock || 0,
      data.opening_stock_uom || null,
      data.reorder_level || 0,
      data.maximum_level || 0,
      data.standard_cost || 0,
      data.last_purchase_price || 0,
      data.preferred_supplier_id || null,
      data.lead_time || null,
      data.description || null,
      data.application || null,
      data.remarks || null,
      data.attachment_path || null,
      data.status || 'Active',
      updatedBy,
      id,
    ]
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
    `SELECT id, code, name, uom, type, category FROM materials WHERE status='Active' ORDER BY name ASC`
  );
  return rows;
}

export async function getStats() {
  const [[data]] = await pool.query(
    `SELECT COUNT(*) AS total,
       SUM(status='Active') AS active,
       SUM(type='Chemical') AS chemicals,
       SUM(type='Auxiliary') AS auxiliaries,
       SUM(type='Packing Material') AS packing
     FROM materials`
  );
  return data;
}

export async function updateAttachment(id, filePath) {
  await pool.query('UPDATE materials SET attachment_path=? WHERE id=?', [filePath, id]);
}
