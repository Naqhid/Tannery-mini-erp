import pool from '../config/db.js';

export async function getAll({ search, type, category, status, supplier, page = 1, limit = 10, sortBy, sortOrder }) {
  let where = '1=1';
  const params = [];

  if (search) {
    where += ' AND (m.name LIKE ? OR m.code LIKE ? OR m.chemical_group LIKE ? OR s.name LIKE ? OR pc.name LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term, term, term);
  }
  if (type) { where += ' AND m.type = ?'; params.push(type); }
  if (category) {
    // Support filtering by category name or ID
    where += ' AND (m.category = ? OR pc.name = ?)';
    params.push(category, category);
  }
  if (status) { where += ' AND m.status = ?'; params.push(status); }
  if (supplier) { where += ' AND s.name LIKE ?'; params.push(`%${supplier}%`); }

  const allowedSortColumns = ['id', 'code', 'name', 'type', 'category', 'status', 'current_stock', 'last_purchase_price', 'standard_cost', 'opening_stock', 'created_at'];
  const column = allowedSortColumns.includes(sortBy) ? `m.${sortBy}` : 'm.id';
  const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT m.*, s.name AS preferred_supplier_name, g.name AS group_name, pc.name AS category_name
     FROM materials m
     LEFT JOIN suppliers s ON m.preferred_supplier_id = s.id
     LEFT JOIN group_master g ON m.group_id = g.id
     LEFT JOIN product_categories pc ON m.category = pc.id OR m.category = pc.name
     WHERE ${where} ORDER BY ${column} ${order} LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM materials m
     LEFT JOIN suppliers s ON m.preferred_supplier_id = s.id
     LEFT JOIN group_master g ON m.group_id = g.id
     LEFT JOIN product_categories pc ON m.category = pc.id OR m.category = pc.name
     WHERE ${where}`,
    params
  );
  return { rows, total };
}

export async function getById(id) {
  const [rows] = await pool.query(
    `SELECT m.*, s.name AS preferred_supplier_name,
       pu.name AS primary_uom_name, su.name AS secondary_uom_name
     FROM materials m
     LEFT JOIN suppliers s ON m.preferred_supplier_id = s.id
     LEFT JOIN uom pu ON m.primary_uom_id = pu.id
     LEFT JOIN uom su ON m.secondary_uom_id = su.id
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

async function resolveWarehouseId(warehouseName) {
  if (!warehouseName) return 0;
  // Try as numeric ID first
  const numericId = parseInt(warehouseName);
  if (numericId) {
    const [[wh]] = await pool.query('SELECT id FROM warehouses WHERE id = ? LIMIT 1', [numericId]);
    if (wh) return wh.id;
  }
  // Try exact name match
  const [[wh1]] = await pool.query('SELECT id FROM warehouses WHERE name = ? LIMIT 1', [warehouseName]);
  if (wh1) return wh1.id;
  // Try LIKE match
  const [[wh2]] = await pool.query('SELECT id FROM warehouses WHERE name LIKE ? LIMIT 1', [`%${warehouseName}%`]);
  if (wh2) return wh2.id;
  return 0;
}

export async function create(data, createdBy = null) {
  const code = data.code || await getNextCode();

  // Always resolve UOM name from primary_uom_id
  let uomText = data.uom || '';
  if (data.primary_uom_id) {
    const [[uomRow]] = await pool.query('SELECT name FROM uom WHERE id=?', [data.primary_uom_id]);
    if (uomRow) uomText = uomRow.name;
  }

  const [result] = await pool.query(
    `INSERT INTO materials (
      code, name, type, uom, primary_uom_id, secondary_uom_id, currency,
      category, chemical_group, group_id, appearance, color,
      ph_value, flash_point, hsn_code, cas_number, shelf_life, storage_condition,
      hazardous, default_warehouse, opening_stock, opening_stock_uom, current_stock,
      reorder_level, maximum_level, standard_cost, last_purchase_price,
      preferred_supplier_id, lead_time, description, application, remarks,
      attachment_path, status, created_by
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      code,
      data.name,
      data.type || 'Wet-end',
      uomText,
      data.primary_uom_id || null,
      data.secondary_uom_id || null,
      data.currency || 'INR',
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

  // Insert opening stock transaction if opening_stock > 0
  const openingQty = parseFloat(data.opening_stock) || 0;
  const avgRate = parseFloat(data.standard_cost) || 0;
  if (openingQty > 0) {
    const openingValue = openingQty * avgRate;
    const warehouseId = await resolveWarehouseId(data.default_warehouse);
    await pool.query(
      `INSERT INTO material_transactions 
        (transaction_date, transaction_type, reference_no, warehouse_id, item_id, 
         opening_stock, receipt_qty, receipt_value, balance_qty, avg_rate, balance_value, reference_type)
       VALUES (NOW(), 'OPENING', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'material_master')`,
      [
        code,
        warehouseId,
        result.insertId,
        openingQty,
        openingQty,
        openingValue,
        openingQty,
        avgRate,
        openingValue,
      ]
    );
  }

  return { id: result.insertId, code };
}

export async function update(id, data, updatedBy = null) {
  // Always resolve UOM name from primary_uom_id
  let uomText = data.uom || '';
  if (data.primary_uom_id) {
    const [[uomRow]] = await pool.query('SELECT name FROM uom WHERE id=?', [data.primary_uom_id]);
    if (uomRow) uomText = uomRow.name;
  }

  const [result] = await pool.query(
    `UPDATE materials SET
      name=?, type=?, uom=?, primary_uom_id=?, secondary_uom_id=?, currency=?,
      category=?, chemical_group=?, group_id=?, appearance=?, color=?,
      ph_value=?, flash_point=?, hsn_code=?, cas_number=?, shelf_life=?, storage_condition=?,
      hazardous=?, default_warehouse=?, opening_stock=?, opening_stock_uom=?,
      reorder_level=?, maximum_level=?, standard_cost=?, last_purchase_price=?,
      preferred_supplier_id=?, lead_time=?, description=?, application=?, remarks=?,
      attachment_path=?, status=?, updated_by=?
     WHERE id=?`,
    [
      data.name,
      data.type || 'Wet-end',
      uomText,
      data.primary_uom_id || null,
      data.secondary_uom_id || null,
      data.currency || 'INR',
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

  // Upsert opening stock transaction
  const openingQty = parseFloat(data.opening_stock) || 0;
  const avgRate = parseFloat(data.standard_cost) || 0;
  // Remove old opening transaction for this material
  await pool.query(
    `DELETE FROM material_transactions WHERE item_id = ? AND transaction_type = 'OPENING'`,
    [id]
  );
  // Insert new one if opening_stock > 0
  if (openingQty > 0) {
    const openingValue = openingQty * avgRate;
    const warehouseId = await resolveWarehouseId(data.default_warehouse);
    // Get material code
    const [[mat]] = await pool.query('SELECT code FROM materials WHERE id = ?', [id]);
    const refNo = mat ? mat.code : `MAT-${String(id).padStart(5, '0')}`;
    await pool.query(
      `INSERT INTO material_transactions 
        (transaction_date, transaction_type, reference_no, warehouse_id, item_id, 
         opening_stock, receipt_qty, receipt_value, balance_qty, avg_rate, balance_value, reference_type)
       VALUES (NOW(), 'OPENING', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'material_master')`,
      [
        refNo,
        warehouseId,
        id,
        openingQty,
        openingQty,
        openingValue,
        openingQty,
        avgRate,
        openingValue,
      ]
    );
  }

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
    `SELECT m.id, m.code, m.name, m.uom, m.type, m.category,
       m.primary_uom_id, m.secondary_uom_id, m.currency,
       m.standard_cost, m.last_purchase_price, m.preferred_supplier_id,
       pu.name AS primary_uom_name, su.name AS secondary_uom_name
     FROM materials m
     LEFT JOIN uom pu ON m.primary_uom_id = pu.id
     LEFT JOIN uom su ON m.secondary_uom_id = su.id
     WHERE m.status='Active' ORDER BY m.name ASC`
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
