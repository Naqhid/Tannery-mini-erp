import pool from '../config/db.js';

const LIST_FIELDS = `
  w.id, w.code, w.name, w.short_name, w.warehouse_type, w.parent_warehouse_id,
  w.is_default, w.location_address, w.city, w.state, w.country, w.pincode,
  w.phone, w.email, w.store_keeper, w.cost_center, w.opening_date,
  w.total_area, w.usable_area, w.storage_condition, w.temperature_control,
  w.humidity_control, w.handling_equipment, w.material_movement_type,
  w.allow_negative_stock, w.notes, w.remarks, w.status, w.created_at, w.updated_at,
  pw.name AS parent_warehouse_name
`;

export async function getAll({ search, status, page = 1, limit = 10, sortBy = 'id', sortOrder = 'desc' }) {
  let where = '1=1';
  const params = [];

  if (search) {
    where += ' AND (w.name LIKE ? OR w.code LIKE ? OR w.short_name LIKE ? OR w.city LIKE ?)';
    const t = `%${search}%`;
    params.push(t, t, t, t);
  }
  if (status) { where += ' AND w.status = ?'; params.push(status); }

  const allowed = ['id', 'code', 'name', 'warehouse_type', 'status', 'created_at'];
  const col = allowed.includes(sortBy) ? `w.\`${sortBy}\`` : 'w.`id`';
  const ord = sortOrder === 'asc' ? 'ASC' : 'DESC';
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT ${LIST_FIELDS}
     FROM warehouses w
     LEFT JOIN warehouses pw ON w.parent_warehouse_id = pw.id
     WHERE ${where} ORDER BY ${col} ${ord} LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM warehouses w WHERE ${where}`, params
  );
  return { rows, total };
}

export async function getById(id) {
  const [[wh]] = await pool.query(
    `SELECT ${LIST_FIELDS}
     FROM warehouses w
     LEFT JOIN warehouses pw ON w.parent_warehouse_id = pw.id
     WHERE w.id = ?`, [id]
  );
  if (!wh) return null;
  const [attachments] = await pool.query(
    `SELECT * FROM warehouse_attachments WHERE warehouse_id = ? ORDER BY uploaded_at ASC`, [id]
  );
  return { ...wh, attachments };
}

export async function getNextCode() {
  const [[row]] = await pool.query(
    `SELECT code FROM warehouses ORDER BY id DESC LIMIT 1`
  );
  if (!row) return 'WH-001';
  const num = parseInt((row.code.split('-')[1] || '0'), 10) + 1;
  return `WH-${String(num).padStart(3, '0')}`;
}

export async function getDropdown() {
  const [rows] = await pool.query(
    `SELECT id, code, name, warehouse_type, allow_negative_stock FROM warehouses WHERE status='Active' ORDER BY name ASC`
  );
  return rows;
}

export async function getStats() {
  const [[data]] = await pool.query(
    `SELECT COUNT(*) AS total,
       SUM(status='Active') AS active,
       SUM(status='Inactive') AS inactive
     FROM warehouses`
  );
  return data;
}

export async function create(data, createdBy = null) {
  const code = data.code || await getNextCode();
  const [result] = await pool.query(
    `INSERT INTO warehouses (
      code, name, short_name, warehouse_type, parent_warehouse_id, is_default,
      location_address, city, state, country, pincode, phone, email,
      store_keeper, cost_center, opening_date, total_area, usable_area,
      storage_condition, temperature_control, humidity_control, handling_equipment,
      material_movement_type, allow_negative_stock, notes, remarks, status, created_by
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      code, data.name, data.short_name || null, data.warehouse_type || 'Raw Material',
      data.parent_warehouse_id || null, data.is_default || 'No',
      data.location_address || null, data.city || null, data.state || null,
      data.country || null, data.pincode || null, data.phone || null, data.email || null,
      data.store_keeper || null, data.cost_center || null, data.opening_date || null,
      data.total_area || null, data.usable_area || null,
      data.storage_condition || 'Dry', data.temperature_control || 'No',
      data.humidity_control || 'No', data.handling_equipment || null,
      data.material_movement_type || 'FIFO', data.allow_negative_stock ? 1 : 0,
      data.notes || null, data.remarks || null, data.status || 'Active', createdBy,
    ]
  );
  return { id: result.insertId, code };
}

export async function update(id, data, updatedBy = null) {
  const [result] = await pool.query(
    `UPDATE warehouses SET
      name=?, short_name=?, warehouse_type=?, parent_warehouse_id=?, is_default=?,
      location_address=?, city=?, state=?, country=?, pincode=?, phone=?, email=?,
      store_keeper=?, cost_center=?, opening_date=?, total_area=?, usable_area=?,
      storage_condition=?, temperature_control=?, humidity_control=?, handling_equipment=?,
      material_movement_type=?, allow_negative_stock=?, notes=?, remarks=?, status=?, updated_by=?
     WHERE id=?`,
    [
      data.name, data.short_name || null, data.warehouse_type || 'Raw Material',
      data.parent_warehouse_id || null, data.is_default || 'No',
      data.location_address || null, data.city || null, data.state || null,
      data.country || null, data.pincode || null, data.phone || null, data.email || null,
      data.store_keeper || null, data.cost_center || null, data.opening_date || null,
      data.total_area || null, data.usable_area || null,
      data.storage_condition || 'Dry', data.temperature_control || 'No',
      data.humidity_control || 'No', data.handling_equipment || null,
      data.material_movement_type || 'FIFO', data.allow_negative_stock ? 1 : 0,
      data.notes || null, data.remarks || null, data.status || 'Active', updatedBy, id,
    ]
  );
  return result.affectedRows > 0;
}

export async function remove(id) {
  const [[txCheck]] = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM stock_opening_entries WHERE warehouse_id=?) +
       (SELECT COUNT(*) FROM material_receipts WHERE warehouse_id=?) +
       (SELECT COUNT(*) FROM stock_transfers WHERE from_warehouse_id=? OR to_warehouse_id=?) +
       (SELECT COUNT(*) FROM material_issues WHERE warehouse_id=?)
     AS total`, [id, id, id, id, id]
  );
  if (txCheck.total > 0) return { deleted: false, reason: 'Warehouse has existing transactions and cannot be deleted.' };
  const [result] = await pool.query('DELETE FROM warehouses WHERE id=?', [id]);
  return { deleted: result.affectedRows > 0 };
}

export async function addAttachment(warehouseId, fileData, uploadedBy = null) {
  const [result] = await pool.query(
    `INSERT INTO warehouse_attachments (warehouse_id, document_type, file_name, file_path, file_type, file_size, uploaded_by)
     VALUES (?,?,?,?,?,?,?)`,
    [warehouseId, fileData.document_type || null, fileData.file_name, fileData.file_path,
     fileData.file_type || null, fileData.file_size || 0, uploadedBy]
  );
  return { id: result.insertId };
}

export async function deleteAttachment(attachmentId) {
  const [result] = await pool.query('DELETE FROM warehouse_attachments WHERE id=?', [attachmentId]);
  return result.affectedRows > 0;
}
