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
      cust.name AS customer_name,
      lt.name AS leather_type_name, u.name AS uom_name, th.name AS thickness_name
    FROM boms b
    LEFT JOIN products p ON b.product_id = p.id
    LEFT JOIN customers cust ON b.customer_id = cust.id
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
      cust.name AS customer_name,
      lt.name AS leather_type_name, u.name AS uom_name, th.name AS thickness_name
    FROM boms b
    LEFT JOIN products p ON b.product_id = p.id
    LEFT JOIN customers cust ON b.customer_id = cust.id
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

export async function getNextCode(customerName = null) {
  if (customerName) {
    const prefix = customerName.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
    const [[row]] = await pool.query(
      "SELECT code FROM boms WHERE code LIKE ? ORDER BY code DESC LIMIT 1",
      [`${prefix}%`]
    );
    if (!row) return `${prefix}0001`;
    const numPart = row.code.substring(prefix.length);
    const num = parseInt(numPart, 10) + 1;
    return `${prefix}${String(num).padStart(4, '0')}`;
  }
  const [[row]] = await pool.query("SELECT code FROM boms ORDER BY id DESC LIMIT 1");
  if (!row) return 'BOM-00001';
  const num = parseInt(row.code.split('-')[1], 10) + 1;
  return `BOM-${String(num).padStart(5, '0')}`;
}

export async function create(data, createdBy = null) {
  const code = data.code || await getNextCode(data.customer_name || null);
  const [result] = await pool.query(
    `INSERT INTO boms (code, name, product_id, customer_id, recipe_id, leather_type, process_type, thickness, uom, valid_from, valid_to, status, description, version, leather_type_id, uom_id, thickness_id, created_by)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [code, data.name, data.product_id, data.customer_id || null, data.recipe_id, data.leather_type,
     data.process_type, data.thickness, data.uom, data.valid_from, data.valid_to,
     data.status || 'Draft', data.description, data.version || 1,
     data.leather_type_id || null, data.uom_id || null, data.thickness_id || null,
     createdBy]
  );
  await createRevision(result.insertId, createdBy, 'Initial BOM created');
  return { id: result.insertId, code };
}

export async function update(id, data, updatedBy = null) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    // Auto-increment version on each update
    const [[current]] = await conn.query('SELECT version FROM boms WHERE id=?', [id]);
    const newVersion = (current?.version || 0) + 1;
    const [result] = await conn.query(
      `UPDATE boms SET code=?, name=?, product_id=?, customer_id=?, recipe_id=?, leather_type=?, process_type=?, thickness=?, uom=?, valid_from=?, valid_to=?, status=?, description=?, version=?, leather_type_id=?, uom_id=?, thickness_id=?, updated_by=? WHERE id=?`,
      [data.code, data.name, data.product_id, data.customer_id || null, data.recipe_id, data.leather_type,
       data.process_type, data.thickness, data.uom, data.valid_from, data.valid_to,
       data.status, data.description, newVersion,
       data.leather_type_id || null, data.uom_id || null, data.thickness_id || null,
       updatedBy, id]
    );
    if (result.affectedRows) await createRevisionSnapshot(conn, id, updatedBy, data.change_reason);
    await conn.commit();
    return result.affectedRows > 0;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally { conn.release(); }
}

export async function remove(id) {
  const [result] = await pool.query('DELETE FROM boms WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

// --- BOM Items ---
export async function getItems(bomId) {
  const [rows] = await pool.query(
    `SELECT bi.*,
       COALESCE(m.code, mac.code) AS material_code,
       COALESCE(m.name, mac.name) AS material_name,
       s.name AS supplier_name
     FROM bom_items bi
     LEFT JOIN materials m ON bi.material_id = m.id
     LEFT JOIN machines mac ON bi.machine_id = mac.id
     LEFT JOIN suppliers s ON bi.supplier_id = s.id
     WHERE bi.bom_id = ?
     ORDER BY bi.id`,
    [bomId]
  );
  return rows;
}

export async function addItem(bomId, data, createdBy = null) {
  const isMachine = data.type === 'Machine' || data.type === 'Wet End' || data.type === 'Finishing';
  const [result] = await pool.query(
    `INSERT INTO bom_items (bom_id, material_id, machine_id, type, uom, qty, unit_cost, amount, scrap_percent, effective_from, effective_to, remarks, supplier_id, created_by)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [bomId, isMachine ? null : data.material_id, isMachine ? data.material_id : null, data.type, data.uom, data.qty,
     data.unit_cost, data.amount, data.scrap_percent || 0, data.effective_from || null, data.effective_to || null,
     data.remarks, data.supplier_id || null, createdBy]
  );
  await createRevision(bomId, createdBy, 'Component added');
  return { id: result.insertId };
}

export async function updateItem(id, data, updatedBy = null) {
  const isMachine = data.type === 'Machine' || data.type === 'Wet End' || data.type === 'Finishing';
  const [result] = await pool.query(
    `UPDATE bom_items SET material_id=?, machine_id=?, type=?, uom=?, qty=?, unit_cost=?, amount=?, scrap_percent=?, effective_from=?, effective_to=?, remarks=?, supplier_id=?, updated_by=? WHERE id=?`,
    [isMachine ? null : data.material_id, isMachine ? data.material_id : null, data.type, data.uom, data.qty, data.unit_cost, data.amount, data.scrap_percent || 0, data.effective_from || null, data.effective_to || null, data.remarks, data.supplier_id || null, updatedBy, id]
  );
  if (result.affectedRows) {
    const [[item]] = await pool.query('SELECT bom_id FROM bom_items WHERE id=?', [id]);
    if (item) await createRevision(item.bom_id, updatedBy, 'Component updated');
  }
  return result.affectedRows > 0;
}

export async function removeItem(id) {
  const [[item]] = await pool.query('SELECT bom_id FROM bom_items WHERE id=?', [id]);
  const [result] = await pool.query('DELETE FROM bom_items WHERE id = ?', [id]);
  if (result.affectedRows && item) await createRevision(item.bom_id, null, 'Component removed');
  return result.affectedRows > 0;
}

async function createRevisionSnapshot(conn, bomId, userId = null, changeReason = null) {
  const [[bom]] = await conn.query('SELECT * FROM boms WHERE id=?', [bomId]);
  const [items] = await conn.query('SELECT * FROM bom_items WHERE bom_id=? ORDER BY id', [bomId]);
  const [[latest]] = await conn.query('SELECT version_no, revision_no FROM bom_versions WHERE bom_id=? ORDER BY version_no DESC, revision_no DESC LIMIT 1', [bomId]);
  const versionNo = latest?.version_no || Number(bom.version) || 1;
  const revisionNo = latest ? latest.revision_no + 1 : 1;
  await conn.query("UPDATE bom_versions SET status='Superseded' WHERE bom_id=? AND status='Active'", [bomId]);
  await conn.query(
    `INSERT INTO bom_versions (bom_id, version_no, revision_no, status, effective_from, effective_to, change_reason, snapshot, created_by, released_by, released_on)
     VALUES (?,?,?,?,?,?,?,?,?,?,NOW())`,
    [bomId, versionNo, revisionNo, 'Active', bom.valid_from || null, bom.valid_to || null, changeReason || null,
      JSON.stringify({ bom, items }), userId, userId]
  );
}

export async function createRevision(bomId, userId = null, changeReason = null) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await createRevisionSnapshot(conn, bomId, userId, changeReason);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally { conn.release(); }
}

export async function getVersions(bomId) {
  const [rows] = await pool.query(
    `SELECT id, version_no, revision_no, status, effective_from, effective_to, change_reason,
      created_by, released_by, released_on, created_at
     FROM bom_versions WHERE bom_id=? ORDER BY version_no DESC, revision_no DESC`,
    [bomId]
  );
  return rows;
}

export async function getStats() {
  const [[total]] = await pool.query('SELECT COUNT(*) AS total FROM boms');
  const [[active]] = await pool.query("SELECT COUNT(*) AS total FROM boms WHERE status='Active'");
  return { total: total.total, active: active.total };
}
