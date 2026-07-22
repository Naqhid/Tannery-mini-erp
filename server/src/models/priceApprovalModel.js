import pool from '../config/db.js';

const ALLOWED_SORT = ['id', 'request_no', 'request_date', 'status', 'requested_by', 'total_items', 'created_at'];

export async function getAll({ search, status, supplier_id, item_group, from_date, to_date, page = 1, limit = 10, sortBy, sortOrder } = {}) {
  const params = [];
  let where = 'par.deleted_at IS NULL';

  if (search) {
    where += ' AND (par.request_no LIKE ? OR s.name LIKE ? OR m.name LIKE ? OR m.code LIKE ? OR pai.supplier_part_no LIKE ?)';
    const t = `%${search}%`;
    params.push(t, t, t, t, t);
  }
  if (status) { where += ' AND pai.status = ?'; params.push(status); }
  if (supplier_id) { where += ' AND pai.supplier_id = ?'; params.push(supplier_id); }
  if (item_group) { where += ' AND pai.item_group = ?'; params.push(item_group); }
  if (from_date) { where += ' AND par.request_date >= ?'; params.push(from_date); }
  if (to_date) { where += ' AND par.request_date <= ?'; params.push(to_date); }

  const col = ALLOWED_SORT.includes(sortBy) ? `par.\`${sortBy}\`` : 'pai.`id`';
  const ord = sortOrder === 'asc' ? 'ASC' : 'DESC';
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT pai.id, pai.request_id, par.request_no, par.request_date,
       s.code AS supplier_code, s.name AS supplier_name,
       m.code AS material_code, m.name AS material_name,
       pai.item_group, pai.uom,
       pai.current_price, pai.requested_price, pai.change_percent,
       pai.effective_from, pai.status,
       ru.full_name AS requested_by, par.remarks,
       pai.supplier_part_no
     FROM price_approval_items pai
     JOIN price_approval_requests par ON pai.request_id = par.id
     LEFT JOIN users ru ON par.requested_by = ru.id
     LEFT JOIN suppliers s ON pai.supplier_id = s.id
     LEFT JOIN materials m ON pai.material_id = m.id
     WHERE ${where}
     ORDER BY ${col} ${ord}
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM price_approval_items pai JOIN price_approval_requests par ON pai.request_id = par.id WHERE ${where}`, params
  );

  return { rows, total };
}

export async function getById(id) {
  const [[request]] = await pool.query(
    `SELECT par.*,
       ru.full_name AS requested_by_name, ru.username AS requested_by_username,
       au.full_name AS approved_by_name
     FROM price_approval_requests par
     LEFT JOIN users ru ON par.requested_by = ru.id
     LEFT JOIN users au ON par.approved_by = au.id
     WHERE par.id = ? AND par.deleted_at IS NULL`, [id]
  );
  if (!request) return null;

  // Get items
  const [items] = await pool.query(
    `SELECT pai.*,
       s.code AS supplier_code, s.name AS supplier_name, s.email AS supplier_email,
       m.code AS material_code, m.name AS material_name, m.type AS material_type,
       cu.name AS currency_name
     FROM price_approval_items pai
     LEFT JOIN suppliers s ON pai.supplier_id = s.id
     LEFT JOIN materials m ON pai.material_id = m.id
     LEFT JOIN currencies cu ON pai.currency = cu.code
     WHERE pai.request_id = ?
     ORDER BY pai.seq ASC`,
    [id]
  );

  // Get workflow history
  const [workflow] = await pool.query(
    `SELECT paw.*,
       u.full_name AS action_by_name
     FROM price_approval_workflow paw
     LEFT JOIN users u ON paw.action_by = u.id
     WHERE paw.request_id = ?
     ORDER BY paw.action_date DESC`,
    [id]
  );

  return { ...request, items, workflow };
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
       SUM(status = 'Under Review') AS under_review,
       SUM(status = 'Approved') AS approved,
       SUM(status = 'Rejected') AS rejected,
       SUM(status = 'Partially Approved') AS partially_approved
     FROM price_approval_requests WHERE deleted_at IS NULL`
  );
  return row;
}

export async function create(data, items = [], createdBy = null) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const request_no = data.request_no || await getNextRequestNo();

    // Insert header
    const [result] = await conn.query(
      `INSERT INTO price_approval_requests (
        request_no, request_date, requested_by, department,
        total_items, status, approval_notes, remarks, created_by
      ) VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        request_no,
        data.request_date || new Date().toISOString().split('T')[0],
        data.requested_by || createdBy,
        data.department || 'Purchase',
        items.length,
        data.status || 'Draft',
        data.approval_notes || null,
        data.remarks || null,
        createdBy
      ]
    );
    const requestId = result.insertId;

    // Insert items
    for (const item of items) {
      const changeAmount = parseFloat(item.requested_price) - parseFloat(item.current_price);
      const changePercent = item.current_price > 0 ? 
        parseFloat((changeAmount / parseFloat(item.current_price) * 100).toFixed(2)) : 0;

      await conn.query(
        `INSERT INTO price_approval_items (
          request_id, seq, supplier_id, material_id, supplier_part_no, item_group,
          uom, current_price, requested_price, currency, change_amount, change_percent,
          effective_from, effective_to, last_approved_price, last_approved_date,
          status, approval_notes, remarks
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          requestId,
          item.seq || 1,
          item.supplier_id,
          item.material_id,
          item.supplier_part_no || null,
          item.item_group || null,
          item.uom || 'KG',
          parseFloat(item.current_price) || 0,
          parseFloat(item.requested_price) || 0,
          item.currency || 'INR',
          changeAmount,
          changePercent,
          item.effective_from || null,
          item.effective_to || null,
          parseFloat(item.last_approved_price) || 0,
          item.last_approved_date || null,
          item.status || 'Pending',
          item.approval_notes || null,
          item.remarks || null
        ]
      );
    }

    // Insert workflow entry
    await conn.query(
      `INSERT INTO price_approval_workflow (
        request_id, action_type, action_by, notes, from_status, to_status
      ) VALUES (?,?,?,?,?,?)`,
      [
        requestId,
        'Submitted',
        createdBy,
        data.remarks || 'Request submitted',
        'Draft',
        'Pending'
      ]
    );

    // Update request status if items were added
    if (items.length > 0) {
      await conn.query(
        `UPDATE price_approval_requests SET total_items = ?, status = ? WHERE id = ?`,
        [items.length, 'Pending', requestId]
      );
    }

    await conn.commit();
    return { id: requestId, request_no };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function update(id, data, items = [], updatedBy = null) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Update header
    await conn.query(
      `UPDATE price_approval_requests SET
        request_no=?, request_date=?, requested_by=?, department=?,
        status=?, approval_notes=?, remarks=?, updated_by=?
       WHERE id=? AND deleted_at IS NULL`,
      [
        data.request_no,
        data.request_date,
        data.requested_by,
        data.department || 'Purchase',
        data.status || 'Pending',
        data.approval_notes || null,
        data.remarks || null,
        updatedBy,
        id
      ]
    );

    // Delete existing items and insert new ones
    await conn.query('DELETE FROM price_approval_items WHERE request_id = ?', [id]);

    for (const item of items) {
      const changeAmount = parseFloat(item.requested_price) - parseFloat(item.current_price);
      const changePercent = item.current_price > 0 ? 
        parseFloat((changeAmount / parseFloat(item.current_price) * 100).toFixed(2)) : 0;

      await conn.query(
        `INSERT INTO price_approval_items (
          request_id, seq, supplier_id, material_id, supplier_part_no, item_group,
          uom, current_price, requested_price, currency, change_amount, change_percent,
          effective_from, effective_to, last_approved_price, last_approved_date,
          status, approval_notes, remarks
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          id,
          item.seq || 1,
          item.supplier_id,
          item.material_id,
          item.supplier_part_no || null,
          item.item_group || null,
          item.uom || 'KG',
          parseFloat(item.current_price) || 0,
          parseFloat(item.requested_price) || 0,
          item.currency || 'INR',
          changeAmount,
          changePercent,
          item.effective_from || null,
          item.effective_to || null,
          parseFloat(item.last_approved_price) || 0,
          item.last_approved_date || null,
          item.status || 'Pending',
          item.approval_notes || null,
          item.remarks || null
        ]
      );
    }

    // Update total items
    await conn.query(
      `UPDATE price_approval_requests SET total_items = ? WHERE id = ?`,
      [items.length, id]
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

export async function softDelete(id) {
  const [result] = await pool.query(
    `UPDATE price_approval_requests SET deleted_at = CURRENT_TIMESTAMP, status = 'Cancelled' WHERE id = ? AND deleted_at IS NULL`,
    [id]
  );
  return result.affectedRows > 0;
}

export async function bulkSoftDelete(ids) {
  if (!ids || ids.length === 0) return 0;
  const placeholders = ids.map(() => '?').join(', ');
  const [result] = await pool.query(
    `UPDATE price_approval_requests SET deleted_at = CURRENT_TIMESTAMP, status = 'Cancelled' WHERE id IN (${placeholders}) AND deleted_at IS NULL`,
    ids
  );
  return result.affectedRows;
}

export async function approveSelected(requestId, itemIds, approvalData, approvedBy = null) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Get the request
    const [[request]] = await conn.query(
      `SELECT * FROM price_approval_requests WHERE id = ? AND deleted_at IS NULL`,
      [requestId]
    );

    if (!request) {
      throw new Error('Approval request not found');
    }

    // Get items to approve
    const placeholders = itemIds.map(() => '?').join(', ');
    const [items] = await conn.query(
      `SELECT * FROM price_approval_items WHERE id IN (${placeholders}) AND request_id = ?`,
      [...itemIds, requestId]
    );

    // Update item statuses
    if (items.length > 0) {
      await conn.query(
        `UPDATE price_approval_items SET
          status=?, approval_notes=?, updated_at=CURRENT_TIMESTAMP
         WHERE id IN (${placeholders}) AND request_id = ?`,
        ['Approved', approvalData.approval_notes || null, ...itemIds, requestId]
      );

      // Update corresponding supplier_pricing records
      for (const item of items) {
        // Check if there's an existing pending pricing record
        const [[existingPricing]] = await conn.query(
          `SELECT id FROM supplier_pricing 
           WHERE supplier_id = ? AND material_id = ? AND status = 'Pending' AND deleted_at IS NULL
           ORDER BY id DESC LIMIT 1`,
          [item.supplier_id, item.material_id]
        );

        if (existingPricing) {
          // Update existing pricing record
          await conn.query(
            `UPDATE supplier_pricing SET
              unit_price=?, status=?, approved_by=?, approved_date=?, approval_notes=?,
              last_approved_price=?, last_approved_date=?, updated_by=?, updated_at=CURRENT_TIMESTAMP
             WHERE id=? AND deleted_at IS NULL`,
            [
              parseFloat(item.requested_price) || 0,
              'Approved',
              approvedBy,
              new Date().toISOString().split('T')[0],
              approvalData.approval_notes || null,
              parseFloat(item.requested_price) || 0,
              new Date().toISOString().split('T')[0],
              approvedBy,
              existingPricing.id
            ]
          );
        } else {
          // Create new supplier pricing record
          const [pricingResult] = await conn.query(
            `INSERT INTO supplier_pricing (
              supplier_id, material_id, item_group, supplier_part_no, uom, unit_price,
              currency, min_order_qty, price_type, valid_from, valid_to, status,
              remarks, approved_by, approved_date, approval_notes, last_approved_price, last_approved_date,
              created_by, created_at
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              item.supplier_id,
              item.material_id,
              item.item_group || null,
              item.supplier_part_no || null,
              item.uom || 'KG',
              parseFloat(item.requested_price) || 0,
              item.currency || 'INR',
              parseFloat(item.min_order_qty) || 0,
              'Purchase Price',
              item.effective_from || null,
              item.effective_to || null,
              'Approved',
              item.remarks || null,
              approvedBy,
              new Date().toISOString().split('T')[0],
              approvalData.approval_notes || null,
              parseFloat(item.requested_price) || 0,
              new Date().toISOString().split('T')[0],
              approvedBy,
              new Date().toISOString()
            ]
          );

          // Insert price change history
          await conn.query(
            `INSERT INTO price_change_history (
              pricing_id, material_id, supplier_id, old_price, new_price, change_percent, change_type,
              change_reason, effective_from, effective_to, changed_by
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
            [
              pricingResult.insertId,
              item.material_id,
              item.supplier_id,
              parseFloat(item.current_price) || 0,
              parseFloat(item.requested_price) || 0,
              parseFloat(item.change_percent) || 0,
              item.change_percent > 0 ? 'Increase' : item.change_percent < 0 ? 'Decrease' : 'No Change',
              approvalData.approval_notes || 'Price approved via workflow',
              item.effective_from || null,
              item.effective_to || null,
              approvedBy
            ]
          );
        }
      }
    }

    // Insert workflow entry
    await conn.query(
      `INSERT INTO price_approval_workflow (
        request_id, action_type, action_by, notes, from_status, to_status
      ) VALUES (?,?,?,?,?,?)`,
      [
        requestId,
        'Approve Selected',
        approvedBy,
        approvalData.approval_notes || `Approved ${items.length} items`,
        request.status,
        'Partially Approved'
      ]
    );

    // Update request status
    const [[countApproved]] = await conn.query(
      `SELECT COUNT(*) AS approved_count, COUNT(*) AS total_count 
       FROM price_approval_items WHERE request_id = ?`,
      [requestId]
    );

    const [[countRejected]] = await conn.query(
      `SELECT COUNT(*) AS rejected_count 
       FROM price_approval_items WHERE request_id = ? AND status = 'Rejected'`,
      [requestId]
    );

    let newStatus = 'Partially Approved';
    if (countApproved.approved_count === countApproved.total_count) {
      newStatus = 'Approved';
    } else if (countRejected.rejected_count === countApproved.total_count) {
      newStatus = 'Rejected';
    }

    await conn.query(
      `UPDATE price_approval_requests SET status = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [newStatus, approvedBy, requestId]
    );

    await conn.commit();
    return { success: true, approvedCount: items.length };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function rejectSelected(requestId, itemIds, rejectionReason, rejectedBy = null) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Get the request
    const [[request]] = await conn.query(
      `SELECT * FROM price_approval_requests WHERE id = ? AND deleted_at IS NULL`,
      [requestId]
    );

    if (!request) {
      throw new Error('Approval request not found');
    }

    // Get items to reject
    const placeholders = itemIds.map(() => '?').join(', ');
    const [items] = await conn.query(
      `SELECT * FROM price_approval_items WHERE id IN (${placeholders}) AND request_id = ?`,
      [...itemIds, requestId]
    );

    // Update item statuses
    if (items.length > 0) {
      await conn.query(
        `UPDATE price_approval_items SET
          status=?, remarks=?, updated_at=CURRENT_TIMESTAMP
         WHERE id IN (${placeholders}) AND request_id = ?`,
        [rejectionReason, rejectionReason, ...itemIds, requestId]
      );

      // Insert workflow entry
      await conn.query(
        `INSERT INTO price_approval_workflow (
          request_id, action_type, action_by, notes, from_status, to_status
        ) VALUES (?,?,?,?,?,?)`,
        [
          requestId,
          'Reject Selected',
          rejectedBy,
          rejectionReason || `Rejected ${items.length} items`,
          request.status,
          'Partially Rejected'
        ]
      );

      // Update request status
      const [[countApproved]] = await conn.query(
        `SELECT COUNT(*) AS approved_count, COUNT(*) AS total_count 
         FROM price_approval_items WHERE request_id = ?`,
        [requestId]
      );

      const [[countRejected]] = await conn.query(
        `SELECT COUNT(*) AS rejected_count 
         FROM price_approval_items WHERE request_id = ? AND status = 'Rejected'`,
        [requestId]
      );

      let newStatus = 'Partially Approved';
      if (countApproved.approved_count === countApproved.total_count) {
        newStatus = 'Approved';
      } else if (countRejected.rejected_count === countApproved.total_count) {
        newStatus = 'Rejected';
      }

      await conn.query(
        `UPDATE price_approval_requests SET status = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [newStatus, rejectedBy, requestId]
      );
    }

    await conn.commit();
    return { success: true, rejectedCount: items.length };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function getPendingApprovals() {
  const [rows] = await pool.query(
    `SELECT par.id, par.request_no, par.request_date,
       par.total_items, par.status,
       COUNT(pai.id) AS actual_items,
       SUM(CASE WHEN pai.status = 'Pending' THEN 1 ELSE 0 END) AS pending_items,
       SUM(CASE WHEN pai.status = 'Approved' THEN 1 ELSE 0 END) AS approved_items,
       SUM(CASE WHEN pai.status = 'Rejected' THEN 1 ELSE 0 END) AS rejected_items
     FROM price_approval_requests par
     LEFT JOIN price_approval_items pai ON par.id = pai.request_id
     WHERE par.deleted_at IS NULL 
       AND par.status IN ('Pending', 'Under Review', 'Partially Approved')
     GROUP BY par.id
     ORDER BY par.request_date DESC`
  );
  return rows;
}

export async function getApprovalDetails(requestId) {
  const request = await getById(requestId);
  if (!request) return null;

  // Get stats
  const [[stats]] = await pool.query(
    `SELECT
       COUNT(*) AS total_items,
       SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending_count,
       SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) AS approved_count,
       SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) AS rejected_count,
       SUM(CASE WHEN status = 'Approved' THEN change_amount ELSE 0 END) AS total_approved_value
     FROM price_approval_items WHERE request_id = ?`,
    [requestId]
  );

  return { ...request, stats };
}
