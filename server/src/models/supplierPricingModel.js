import pool from '../config/db.js';

const ALLOWED_SORT = ['id', 'supplier_id', 'material_id', 'unit_price', 'valid_from', 'valid_to', 'status', 'created_at'];

export async function getAll({ search, supplier_id, material_id, item_group, status, from_date, to_date, page = 1, limit = 10, sortBy, sortOrder } = {}) {
  const params = [];
  let where = 'sp.deleted_at IS NULL';

  if (search) {
    where += ' AND (m.code LIKE ? OR m.name LIKE ? OR s.code LIKE ? OR s.name LIKE ? OR sp.supplier_part_no LIKE ?)';
    const t = `%${search}%`;
    params.push(t, t, t, t, t);
  }
  if (supplier_id) { where += ' AND sp.supplier_id = ?'; params.push(supplier_id); }
  if (material_id) { where += ' AND sp.material_id = ?'; params.push(material_id); }
  if (item_group) { where += ' AND sp.item_group LIKE ?'; params.push(`%${item_group}%`); }
  if (status) { where += ' AND sp.status = ?'; params.push(status); }
  if (from_date) { where += ' AND sp.valid_from >= ?'; params.push(from_date); }
  if (to_date) { where += ' AND sp.valid_to <= ?'; params.push(to_date); }

  const col = ALLOWED_SORT.includes(sortBy) ? `sp.\`${sortBy}\`` : 'sp.`id`';
  const ord = sortOrder === 'asc' ? 'ASC' : 'DESC';
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT sp.id, sp.supplier_id, sp.material_id, sp.item_group, sp.supplier_part_no,
       sp.uom, sp.unit_price, sp.currency, sp.min_order_qty, sp.price_type,
       sp.valid_from, sp.valid_to, sp.status, sp.remarks,
       sp.approved_by, sp.approved_date, sp.approval_notes,
       sp.last_approved_price, sp.last_approved_date,
       s.code AS supplier_code, s.name AS supplier_name, s.contact_person AS supplier_contact,
       m.code AS material_code, m.name AS material_name, m.type AS material_type,
       u.name AS uom_name,
       cu.name AS currency_name,
       au.full_name AS approved_by_name
     FROM supplier_pricing sp
     LEFT JOIN suppliers s ON sp.supplier_id = s.id
     LEFT JOIN materials m ON sp.material_id = m.id
     LEFT JOIN uom u ON sp.uom = u.code
     LEFT JOIN currencies cu ON sp.currency = cu.code
     LEFT JOIN users au ON sp.approved_by = au.id
     WHERE ${where}
     ORDER BY ${col} ${ord}
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM supplier_pricing sp WHERE ${where}`, params
  );

  return { rows, total };
}

export async function getById(id) {
  const [[pricing]] = await pool.query(
    `SELECT sp.*,
       s.code AS supplier_code, s.name AS supplier_name, s.email AS supplier_email, s.phone AS supplier_phone,
       m.code AS material_code, m.name AS material_name, m.type AS material_type, m.uom AS material_uom,
       u.name AS uom_name
     FROM supplier_pricing sp
     LEFT JOIN suppliers s ON sp.supplier_id = s.id
     LEFT JOIN materials m ON sp.material_id = m.id
     LEFT JOIN uom u ON sp.uom = u.code
     WHERE sp.id = ? AND sp.deleted_at IS NULL`, [id]
  );
  if (!pricing) return null;

  // Get price breaks
  const [priceBreaks] = await pool.query(
    `SELECT * FROM price_breaks WHERE pricing_id = ? ORDER BY seq ASC`, [id]
  );

  // Get attachments
  const [attachments] = await pool.query(
    `SELECT * FROM supplier_pricing_attachments WHERE pricing_id = ? ORDER BY id ASC`, [id]
  );

  // Get price change history
  const [history] = await pool.query(
    `SELECT pch.*,
        uh.full_name AS changed_by_name
      FROM price_change_history pch
      LEFT JOIN users uh ON pch.changed_by = uh.id
      WHERE pch.pricing_id = ? OR pch.material_id = ? OR pch.supplier_id = ?
      ORDER BY pch.created_at DESC`,
    [id, pricing.material_id, pricing.supplier_id]
  );

  return { ...pricing, price_breaks: priceBreaks, attachments, history };
}

export async function getNextRequestNo() {
  const year = new Date().getFullYear();
  const [[row]] = await pool.query(
    `SELECT request_no FROM price_approval_requests WHERE request_no LIKE ? ORDER BY id DESC LIMIT 1`,
    [`PRQ-${year}-%`]
  );
  if (!row) return `PRQ-${year}-00001`;
  const num = parseInt(row.request_no.split('-')[2], 10) + 1;
  return `PRQ-${year}-${String(num).padStart(5, '0')}`;
}

export async function getStats() {
  const [[row]] = await pool.query(
    `SELECT
       COUNT(*) AS total,
       SUM(status = 'Draft') AS draft,
       SUM(status = 'Pending') AS pending,
       SUM(status = 'Approved') AS approved,
       SUM(status = 'Rejected') AS rejected,
       SUM(status = 'Expired') AS expired
     FROM supplier_pricing WHERE deleted_at IS NULL`
  );
  return row;
}

export async function create(data, priceBreaks = [], attachments = [], createdBy = null) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Insert main pricing record
    const [result] = await conn.query(
      `INSERT INTO supplier_pricing (
        supplier_id, material_id, item_group, supplier_part_no, uom, unit_price,
        currency, min_order_qty, price_type, valid_from, valid_to, status,
        remarks, created_by
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        data.supplier_id,
        data.material_id,
        data.item_group || null,
        data.supplier_part_no || null,
        data.uom || 'KG',
        parseFloat(data.unit_price) || 0,
        data.currency || 'INR',
        parseFloat(data.min_order_qty) || 0,
        data.price_type || 'Purchase Price',
        data.valid_from || null,
        data.valid_to || null,
        data.status || 'Pending',
        data.remarks || null,
        createdBy
      ]
    );
    const pricingId = result.insertId;

    // Insert price breaks
    for (const pb of priceBreaks) {
      const netPrice = parseFloat(pb.unit_price) || 0;
      const discountPercent = parseFloat(pb.discount_percent) || 0;
      const discountAmount = netPrice * (discountPercent / 100);
      
      await conn.query(
        `INSERT INTO price_breaks (
          pricing_id, seq, from_qty, to_qty, uom, unit_price, discount_percent, discount_amount, net_price
        ) VALUES (?,?,?,?,?,?,?,?,?)`,
        [
          pricingId,
          pb.seq || 1,
          parseFloat(pb.from_qty) || 0,
          parseFloat(pb.to_qty) || 0,
          pb.uom || 'KG',
          parseFloat(pb.unit_price) || 0,
          discountPercent,
          discountAmount,
          netPrice - discountAmount
        ]
      );
    }

    // Insert attachments
    for (const att of attachments) {
      await conn.query(
        `INSERT INTO supplier_pricing_attachments (
          pricing_id, file_name, file_path, file_type, file_size, uploaded_by, remarks
        ) VALUES (?,?,?,?,?,?,?)`,
        [
          pricingId,
          att.file_name,
          att.file_path,
          att.file_type || null,
          parseInt(att.file_size) || 0,
          createdBy,
          att.remarks || null
        ]
      );
    }

    // Insert price change history
    if (data.last_approved_price && data.last_approved_price > 0) {
      const changePercent = data.unit_price > 0 ? 
        parseFloat(((parseFloat(data.unit_price) - parseFloat(data.last_approved_price)) / parseFloat(data.last_approved_price) * 100).toFixed(2)) : 0;
      const changeType = changePercent > 0 ? 'Increase' : changePercent < 0 ? 'Decrease' : 'No Change';

      await conn.query(
        `INSERT INTO price_change_history (
          pricing_id, material_id, supplier_id, old_price, new_price, change_percent, change_type,
          change_reason, effective_from, effective_to, changed_by
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        [
          pricingId,
          data.material_id,
          data.supplier_id,
          parseFloat(data.last_approved_price) || 0,
          parseFloat(data.unit_price) || 0,
          changePercent,
          changeType,
          data.remarks || 'New price entry',
          data.valid_from || null,
          data.valid_to || null,
          createdBy
        ]
      );
    }

    await conn.commit();
    return { id: pricingId };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function update(id, data, priceBreaks = [], attachments = [], updatedBy = null) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Update main pricing record
    await conn.query(
      `UPDATE supplier_pricing SET
        supplier_id=?, material_id=?, item_group=?, supplier_part_no=?, uom=?,
        unit_price=?, currency=?, min_order_qty=?, price_type=?, valid_from=?,
        valid_to=?, status=?, remarks=?, updated_by=?
       WHERE id=? AND deleted_at IS NULL`,
      [
        data.supplier_id,
        data.material_id,
        data.item_group || null,
        data.supplier_part_no || null,
        data.uom || 'KG',
        parseFloat(data.unit_price) || 0,
        data.currency || 'INR',
        parseFloat(data.min_order_qty) || 0,
        data.price_type || 'Purchase Price',
        data.valid_from || null,
        data.valid_to || null,
        data.status || 'Pending',
        data.remarks || null,
        updatedBy,
        id
      ]
    );

    // Delete existing price breaks and insert new ones
    await conn.query('DELETE FROM price_breaks WHERE pricing_id = ?', [id]);

    for (const pb of priceBreaks) {
      const netPrice = parseFloat(pb.unit_price) || 0;
      const discountPercent = parseFloat(pb.discount_percent) || 0;
      const discountAmount = netPrice * (discountPercent / 100);

      await conn.query(
        `INSERT INTO price_breaks (
          pricing_id, seq, from_qty, to_qty, uom, unit_price, discount_percent, discount_amount, net_price
        ) VALUES (?,?,?,?,?,?,?,?,?)`,
        [
          id,
          pb.seq || 1,
          parseFloat(pb.from_qty) || 0,
          parseFloat(pb.to_qty) || 0,
          pb.uom || 'KG',
          parseFloat(pb.unit_price) || 0,
          discountPercent,
          discountAmount,
          netPrice - discountAmount
        ]
      );
    }

    // Handle attachments - delete and re-insert for simplicity
    // In production, you might want to handle this differently (e.g., track which were deleted)
    await conn.query('DELETE FROM supplier_pricing_attachments WHERE pricing_id = ?', [id]);

    for (const att of attachments) {
      await conn.query(
        `INSERT INTO supplier_pricing_attachments (
          pricing_id, file_name, file_path, file_type, file_size, uploaded_by, remarks
        ) VALUES (?,?,?,?,?,?,?)`,
        [
          id,
          att.file_name,
          att.file_path,
          att.file_type || null,
          parseInt(att.file_size) || 0,
          updatedBy,
          att.remarks || null
        ]
      );
    }

    // Update price change history if status changed to Approved
    if (data.status === 'Approved') {
      const [[oldPricing]] = await conn.query(
        `SELECT unit_price, last_approved_price FROM supplier_pricing WHERE id = ?`, [id]
      );

      if (oldPricing) {
        const changePercent = oldPricing.unit_price > 0 ? 
          parseFloat(((parseFloat(data.unit_price) - parseFloat(oldPricing.unit_price)) / parseFloat(oldPricing.unit_price) * 100).toFixed(2)) : 0;
        const changeType = changePercent > 0 ? 'Increase' : changePercent < 0 ? 'Decrease' : 'No Change';

        await conn.query(
          `INSERT INTO price_change_history (
            pricing_id, material_id, supplier_id, old_price, new_price, change_percent, change_type,
            change_reason, effective_from, effective_to, changed_by
          ) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
          [
            id,
            data.material_id,
            data.supplier_id,
            parseFloat(oldPricing.unit_price) || 0,
            parseFloat(data.unit_price) || 0,
            changePercent,
            changeType,
            data.remarks || 'Price approved',
            data.valid_from || null,
            data.valid_to || null,
            updatedBy
          ]
        );

        // Update last approved fields
        await conn.query(
          `UPDATE supplier_pricing SET
            last_approved_price=?, last_approved_date=?, approved_by=?, approved_date=?, approval_notes=?
           WHERE id=?`,
          [
            parseFloat(data.unit_price) || 0,
            new Date().toISOString().split('T')[0],
            updatedBy,
            new Date().toISOString().split('T')[0],
            data.approval_notes || null,
            id
          ]
        );
      }
    }

    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function softDelete(id) {
  const [result] = await pool.query(
    `UPDATE supplier_pricing SET deleted_at = CURRENT_TIMESTAMP, status = 'Inactive' WHERE id = ? AND deleted_at IS NULL`,
    [id]
  );
  return result.affectedRows > 0;
}

export async function bulkSoftDelete(ids) {
  if (!ids || ids.length === 0) return 0;
  const placeholders = ids.map(() => '?').join(', ');
  const [result] = await pool.query(
    `UPDATE supplier_pricing SET deleted_at = CURRENT_TIMESTAMP, status = 'Inactive' WHERE id IN (${placeholders}) AND deleted_at IS NULL`,
    ids
  );
  return result.affectedRows;
}

export async function bulkUpdateStatus(ids, status) {
  if (!ids || ids.length === 0) return 0;
  const placeholders = ids.map(() => '?').join(', ');
  const [result] = await pool.query(
    `UPDATE supplier_pricing SET status = ? WHERE id IN (${placeholders}) AND deleted_at IS NULL`,
    [status, ...ids]
  );
  return result.affectedRows;
}

export async function approve(id, approvalData, approvedBy = null) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Get current pricing to calculate change
    const [[pricing]] = await conn.query(
      `SELECT * FROM supplier_pricing WHERE id = ? AND deleted_at IS NULL`, [id]
    );

    if (!pricing) {
      throw new Error('Pricing record not found');
    }

    // Update the pricing record
    await conn.query(
      `UPDATE supplier_pricing SET
        status=?, approved_by=?, approved_date=?, approval_notes=?, updated_by=?
       WHERE id=? AND deleted_at IS NULL`,
      [
        'Approved',
        approvedBy,
        new Date().toISOString().split('T')[0],
        approvalData.approval_notes || null,
        approvedBy,
        id
      ]
    );

    // Insert price change history
    const changePercent = pricing.last_approved_price > 0 ? 
      parseFloat(((parseFloat(pricing.unit_price) - parseFloat(pricing.last_approved_price)) / parseFloat(pricing.last_approved_price) * 100).toFixed(2)) : 0;
    const changeType = changePercent > 0 ? 'Increase' : changePercent < 0 ? 'Decrease' : 'No Change';

    await conn.query(
      `INSERT INTO price_change_history (
        pricing_id, material_id, supplier_id, old_price, new_price, change_percent, change_type,
        change_reason, effective_from, effective_to, changed_by
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [
        id,
        pricing.material_id,
        pricing.supplier_id,
        parseFloat(pricing.last_approved_price) || 0,
        parseFloat(pricing.unit_price) || 0,
        changePercent,
        changeType,
        approvalData.approval_notes || 'Price approved',
        pricing.valid_from || null,
        pricing.valid_to || null,
        approvedBy
      ]
    );

    // Update last approved fields
    await conn.query(
      `UPDATE supplier_pricing SET
        last_approved_price=?, last_approved_date=?, unit_price=?
       WHERE id=?`,
      [
        parseFloat(pricing.unit_price) || 0,
        new Date().toISOString().split('T')[0],
        parseFloat(pricing.unit_price) || 0,
        id
      ]
    );

    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function reject(id, rejectionReason, rejectedBy = null) {
  const [result] = await pool.query(
    `UPDATE supplier_pricing SET
      status=?, remarks=?, updated_by=?
     WHERE id=? AND deleted_at IS NULL`,
    ['Rejected', rejectionReason, rejectedBy, id]
  );
  return result.affectedRows > 0;
}

export async function getSupplierPricingHistory(supplierId, materialId = null) {
  const params = [supplierId];
  let where = 'sp.supplier_id = ? AND sp.deleted_at IS NULL';
  if (materialId) {
    where += ' AND sp.material_id = ?';
    params.push(materialId);
  }

  const [rows] = await pool.query(
    `SELECT sp.*,
       m.code AS material_code, m.name AS material_name
     FROM supplier_pricing sp
     JOIN materials m ON sp.material_id = m.id
     WHERE ${where}
     ORDER BY sp.valid_from DESC, sp.created_at DESC`,
    params
  );
  return rows;
}

export async function getPriceComparison(materialId, supplierId) {
  // Get current approved price
  const [[currentPrice]] = await pool.query(
    `SELECT sp.unit_price, sp.currency, sp.valid_from, sp.valid_to
     FROM supplier_pricing sp
     WHERE sp.material_id = ? AND sp.supplier_id = ? AND sp.status = 'Approved' AND sp.deleted_at IS NULL
     ORDER BY sp.valid_from DESC LIMIT 1`,
    [materialId, supplierId]
  );

  // Get last approved price
  const [[lastApproved]] = await pool.query(
    `SELECT sp.last_approved_price, sp.last_approved_date
     FROM supplier_pricing sp
     WHERE sp.material_id = ? AND sp.supplier_id = ? AND sp.deleted_at IS NULL
     ORDER BY sp.id DESC LIMIT 1`,
    [materialId, supplierId]
  );

  return {
    current: currentPrice || { unit_price: 0, currency: 'INR' },
    last_approved: lastApproved || { last_approved_price: 0, last_approved_date: null }
  };
}

export async function getPriceTrend(materialId, months = 6) {
  const [rows] = await pool.query(
    `SELECT
       pch.effective_from,
       pch.new_price,
       pch.currency,
       pch.change_percent,
       pch.change_type
     FROM price_change_history pch
     WHERE pch.material_id = ?
     ORDER BY pch.effective_from DESC
     LIMIT ?`,
    [materialId, months]
  );
  return rows;
}

export async function dropdown(supplierId = null) {
  const params = [];
  let where = 'sp.deleted_at IS NULL AND sp.status = "Approved"';
  if (supplierId) {
    where += ' AND sp.supplier_id = ?';
    params.push(supplierId);
  }

  const [rows] = await pool.query(
    `SELECT
       sp.id,
       sp.supplier_id,
       sp.material_id,
       sp.unit_price,
       sp.currency,
       s.code AS supplier_code,
       s.name AS supplier_name,
       m.code AS material_code,
       m.name AS material_name
     FROM supplier_pricing sp
     JOIN suppliers s ON sp.supplier_id = s.id
     JOIN materials m ON sp.material_id = m.id
     WHERE ${where}
     ORDER BY s.name, m.name`,
    params
  );
  return rows;
}
