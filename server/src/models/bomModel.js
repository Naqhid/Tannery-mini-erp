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
      lt.name AS leather_type_name, u.name AS uom_name, th.name AS thickness_name,
      c.name AS color_name, ft.name AS finish_type_name
    FROM boms b
    LEFT JOIN products p ON b.product_id = p.id
    LEFT JOIN customers cust ON b.customer_id = cust.id
    LEFT JOIN leather_types lt ON b.leather_type_id = lt.id
    LEFT JOIN uom u ON b.uom_id = u.id
    LEFT JOIN thickness th ON b.thickness_id = th.id
    LEFT JOIN colors c ON p.color_id = c.id
    LEFT JOIN finish_types ft ON p.finish_type_id = ft.id
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
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yy = String(now.getFullYear()).slice(-2);
  const monthYear = `${mm}${yy}`;

  if (customerName) {
    const prefix = customerName.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
    if (prefix.length < 3) {
      throw new Error('Customer name must have at least 3 alphabetic characters for BOM code prefix');
    }
    const baseCode = `${prefix}${monthYear}`;
    // Find the latest sequence for this prefix+MMYY
    const [[row]] = await pool.query(
      "SELECT code FROM boms WHERE code LIKE ? ORDER BY LENGTH(code) DESC, code DESC LIMIT 1",
      [`${baseCode}%`]
    );
    if (!row) return `${baseCode}01`;
    const seqPart = row.code.substring(baseCode.length);
    const seq = (parseInt(seqPart, 10) || 0) + 1;
    return `${baseCode}${String(seq).padStart(2, '0')}`;
  }
  // Fallback if no customer name
  const [[row]] = await pool.query("SELECT code FROM boms ORDER BY id DESC LIMIT 1");
  if (!row) return `BOM${monthYear}01`;
  return `BOM${monthYear}01`;
}

export async function create(data, createdBy = null) {
  let code = data.code || await getNextCode(data.customer_name || null);
  let attempts = 0;
  while (attempts < 5) {
    try {
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
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY' && attempts < 4) {
        attempts++;
        code = await getNextCode(data.customer_name || null);
      } else {
        throw err;
      }
    }
  }
}

export async function update(id, data, updatedBy = null) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    // Get existing BOM to preserve code if not provided
    const [[existing]] = await conn.query('SELECT code FROM boms WHERE id=?', [id]);
    if (!existing) { await conn.rollback(); return false; }
    const code = data.code || existing.code;
    // Version does NOT auto-increment on edit - only changes via Import BOM process
    const [result] = await conn.query(
      `UPDATE boms SET code=?, name=?, product_id=?, customer_id=?, recipe_id=?, leather_type=?, process_type=?, thickness=?, uom=?, valid_from=?, valid_to=?, status=?, description=?, leather_type_id=?, uom_id=?, thickness_id=?, updated_by=? WHERE id=?`,
      [code, data.name, data.product_id, data.customer_id || null, data.recipe_id || null, data.leather_type || null,
       data.process_type || null, data.thickness || null, data.uom || null, data.valid_from || null, data.valid_to || null,
       data.status || 'Active', data.description || null,
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

// --- BOM Attachments ---
export async function getAttachments(bomId) {
  const [rows] = await pool.query(
    'SELECT * FROM bom_attachments WHERE bom_id = ? ORDER BY uploaded_at DESC',
    [bomId]
  );
  return rows;
}

export async function addAttachment(bomId, data, uploadedBy = null) {
  const [result] = await pool.query(
    'INSERT INTO bom_attachments (bom_id, file_name, file_path, file_type, file_size, uploaded_by) VALUES (?,?,?,?,?,?)',
    [bomId, data.file_name, data.file_path, data.file_type || null, data.file_size || 0, uploadedBy]
  );
  return { id: result.insertId };
}

export async function removeAttachment(id) {
  const [result] = await pool.query('DELETE FROM bom_attachments WHERE id = ?', [id]);
  return result.affectedRows > 0;
}


// --- BOM Import (creates new version) ---
export async function importBom(sourceBomId, createdBy = null) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Get source BOM
    const [[source]] = await conn.query('SELECT * FROM boms WHERE id = ?', [sourceBomId]);
    if (!source) throw new Error('Source BOM not found');

    // Get source items
    const [sourceItems] = await conn.query('SELECT * FROM bom_items WHERE bom_id = ? ORDER BY id', [sourceBomId]);

    // Determine next version for this Product + BOM_Type
    const [[maxVer]] = await conn.query(
      'SELECT MAX(version) AS max_version FROM boms WHERE product_id = ? AND process_type = ?',
      [source.product_id, source.process_type]
    );
    const nextVersion = (maxVer?.max_version || 0) + 1;

    // Generate new code
    let customerName = null;
    if (source.customer_id) {
      const [[cust]] = await conn.query('SELECT name FROM customers WHERE id = ?', [source.customer_id]);
      customerName = cust?.name || null;
    }
    const code = await getNextCode(customerName);

    // Create new BOM with incremented version
    const [result] = await conn.query(
      `INSERT INTO boms (code, name, product_id, customer_id, recipe_id, leather_type, process_type, thickness, uom, valid_from, valid_to, status, description, version, leather_type_id, uom_id, thickness_id, created_by)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [code, source.name, source.product_id, source.customer_id, source.recipe_id, source.leather_type,
       source.process_type, source.thickness, source.uom, source.valid_from, source.valid_to,
       'Draft', source.description, nextVersion,
       source.leather_type_id, source.uom_id, source.thickness_id, createdBy]
    );
    const newBomId = result.insertId;

    // Copy all items from source
    for (const item of sourceItems) {
      await conn.query(
        `INSERT INTO bom_items (bom_id, material_id, machine_id, type, uom, qty, unit_cost, amount, scrap_percent, effective_from, effective_to, remarks, supplier_id, created_by)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [newBomId, item.material_id, item.machine_id, item.type, item.uom, item.qty,
         item.unit_cost, item.amount, item.scrap_percent, item.effective_from, item.effective_to,
         item.remarks, item.supplier_id, createdBy]
      );
    }

    // Create initial revision for the new BOM
    await createRevisionSnapshot(conn, newBomId, createdBy, `Imported from BOM ${source.code} (Version ${source.version})`);

    await conn.commit();
    return { id: newBomId, code, version: nextVersion };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally { conn.release(); }
}

// --- Get BOMs by product (for filtering) ---
export async function getByProduct(productId) {
  const [rows] = await pool.query(
    `SELECT b.id, b.code, b.name, b.process_type, b.version, b.status, b.product_id,
       p.name AS product_name
     FROM boms b
     LEFT JOIN products p ON b.product_id = p.id
     WHERE b.product_id = ?
     ORDER BY b.process_type, b.version DESC`,
    [productId]
  );
  return rows;
}

// --- Get latest BOM by product ---
export async function getLatestByProduct(productId) {
  const [rows] = await pool.query(
    `SELECT b.*, p.name AS product_name
     FROM boms b
     LEFT JOIN products p ON b.product_id = p.id
     WHERE b.product_id = ? AND b.status = 'Active'
     ORDER BY b.version DESC
     LIMIT 1`,
    [productId]
  );
  return rows[0] || null;
}
