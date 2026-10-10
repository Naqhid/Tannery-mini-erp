import pool from '../config/db.js';
import { addLedgerEntry, rebuildAndReprice } from './stockLedgerModel.js';

const ALLOWED_SORT = ['id', 'entry_no', 'entry_date', 'stock_date', 'status', 'total_items', 'created_at'];

// Post a Completed physical stock entry's variances into the stock ledger as
// "Stock Adjustment" rows: a positive variance goes to in_qty, a negative one
// to out_qty (as a positive magnitude). The item's existing average cost is
// used for valuation, then valuation is rebuilt per material/warehouse.
async function postAdjustmentToLedger(conn, entryId, entry, items, createdBy) {
  // Remove any prior adjustment rows for this entry so a re-save never
  // double-counts, then re-insert the current variances.
  const [prev] = await conn.query(
    'SELECT DISTINCT warehouse_id, material_id FROM stock_ledger WHERE reference_type=? AND reference_id=?',
    ['physical_stock', entryId]
  );
  await conn.query('DELETE FROM stock_ledger WHERE reference_type=? AND reference_id=?', ['physical_stock', entryId]);

  const warehouseId = entry.warehouse_id || null;
  const affected = new Map();
  for (const p of prev) affected.set(`${p.warehouse_id}:${p.material_id}`, { w: p.warehouse_id, m: p.material_id });

  for (const item of items) {
    const materialId = item.material_id || null;
    if (!materialId || !warehouseId) continue;
    const variance = Number(parseFloat(item.variance_qty) || 0);
    if (Math.abs(variance) < 0.000001) continue; // no adjustment needed

    const unitCost = Number(parseFloat(item.avg_rate) || 0);
    const inQty = variance > 0 ? variance : 0;
    const outQty = variance < 0 ? Math.abs(variance) : 0;

    await addLedgerEntry(conn, {
      transaction_date: entry.stock_date || entry.entry_date || new Date().toISOString().split('T')[0],
      transaction_type: 'Stock Adjustment',
      reference_type: 'physical_stock',
      reference_id: entryId,
      reference_no: entry.entry_no || null,
      warehouse_id: warehouseId,
      material_id: materialId,
      uom: item.uom || null,
      batch_no: item.batch_no || null,
      in_qty: inQty,
      out_qty: outQty,
      unit_cost: unitCost,
      amount: Number((Math.abs(variance) * unitCost).toFixed(2)),
      balance_qty: 0, // recomputed by rebuildAndReprice
      remarks: `Physical stock adjustment (${entry.entry_no || ''})`,
      created_by: createdBy,
    });
    affected.set(`${warehouseId}:${materialId}`, { w: warehouseId, m: materialId });
  }

  // Rebuild date-ordered valuation + warehouse_stock for every touched pair.
  for (const p of affected.values()) {
    await rebuildAndReprice(conn, p.w, p.m);
  }
}

export async function getAll({ search, entry_no, warehouse_id, status, from_date, to_date, page = 1, limit = 10, sortBy, sortOrder } = {}) {
  const params = [];
  let where = 'pse.deleted_at IS NULL';

  if (search) {
    where += ' AND (pse.entry_no LIKE ? OR pse.reference_no LIKE ? OR w.name LIKE ?)';
    const t = `%${search}%`;
    params.push(t, t, t);
  }
  if (entry_no) { where += ' AND pse.entry_no = ?'; params.push(entry_no); }
  if (warehouse_id) { where += ' AND pse.warehouse_id = ?'; params.push(warehouse_id); }
  if (status) { where += ' AND pse.status = ?'; params.push(status); }
  if (from_date) { where += ' AND pse.entry_date >= ?'; params.push(from_date); }
  if (to_date) { where += ' AND pse.entry_date <= ?'; params.push(to_date); }

  const col = ALLOWED_SORT.includes(sortBy) ? `pse.\`${sortBy}\`` : 'pse.`id`';
  const ord = sortOrder === 'asc' ? 'ASC' : 'DESC';
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT pse.id, pse.entry_no, pse.entry_date, pse.stock_date, pse.warehouse_id,
       pse.location_rack, pse.godown, pse.batch_no, pse.from_item_code, pse.to_item_code,
       pse.item_group, pse.item_id, pse.uom, pse.reference_no,
       pse.total_items, pse.matched_items, pse.variance_items,
       pse.total_variance_qty, pse.total_variance_value, pse.status, pse.remarks,
       w.name AS warehouse_name
     FROM physical_stock_entries pse
     LEFT JOIN warehouses w ON pse.warehouse_id = w.id
     WHERE ${where}
     ORDER BY ${col} ${ord}
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM physical_stock_entries pse WHERE ${where}`, params
  );

  return { rows, total };
}

export async function getById(id) {
  const [[entry]] = await pool.query(
    `SELECT pse.*,
       w.name AS warehouse_name, w.code AS warehouse_code,
       m.code AS item_code, m.name AS item_name
     FROM physical_stock_entries pse
     LEFT JOIN warehouses w ON pse.warehouse_id = w.id
     LEFT JOIN materials m ON pse.item_id = m.id
     WHERE pse.id = ? AND pse.deleted_at IS NULL`, [id]
  );
  if (!entry) return null;

  const [items] = await pool.query(
    `SELECT psei.*,
       m.code AS material_code, m.name AS material_name
     FROM physical_stock_entry_items psei
     LEFT JOIN materials m ON psei.item_code = m.code
     WHERE psei.entry_id = ?
     ORDER BY psei.seq ASC`,
    [id]
  );

  return { ...entry, items };
}

export async function getNextEntryNo() {
  const year = new Date().getFullYear();
  const [[row]] = await pool.query(
    `SELECT entry_no FROM physical_stock_entries WHERE entry_no LIKE ? ORDER BY id DESC LIMIT 1`,
    [`PSE-${year}-%`]
  );
  if (!row) return `PSE-${year}-00001`;
  const num = parseInt(row.entry_no.split('-')[2], 10) + 1;
  return `PSE-${year}-${String(num).padStart(5, '0')}`;
}

export async function getStats() {
  const [[row]] = await pool.query(
    `SELECT
       COUNT(*) AS total,
       SUM(status = 'Draft') AS draft,
       SUM(status = 'In-Progress') AS in_progress,
       SUM(status = 'Completed') AS completed,
       SUM(status = 'Cancelled') AS cancelled
     FROM physical_stock_entries WHERE deleted_at IS NULL`
  );
  return row;
}

export async function create(data, items = [], createdBy = null) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const entry_no = data.entry_no || await getNextEntryNo();
    
    // Calculate summary statistics
    let totalItems = items.length;
    let matchedItems = 0;
    let varianceItems = 0;
    let totalVarianceQty = 0;
    let totalVarianceValue = 0;

    for (const item of items) {
      const systemQty = parseFloat(item.system_qty) || 0;
      const physicalQty = parseFloat(item.physical_qty) || 0;
      const varianceQty = physicalQty - systemQty;
      
      if (varianceQty === 0) matchedItems++;
      if (varianceQty !== 0) varianceItems++;
      
      totalVarianceQty += varianceQty;
      // For value, we'd need the unit price, but we'll just use qty for now
      totalVarianceValue += varianceQty; // This would be varianceQty * unitPrice in a real implementation
    }

    const [result] = await conn.query(
      `INSERT INTO physical_stock_entries (
        entry_no, entry_date, stock_date, warehouse_id, location_rack, godown,
        batch_no, from_item_code, to_item_code, item_group, item_id, uom,
        reference_no, total_items, matched_items, variance_items,
        total_variance_qty, total_variance_value, status, remarks, created_by
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        entry_no,
        data.entry_date || new Date().toISOString().split('T')[0],
        data.stock_date || new Date().toISOString().split('T')[0],
        data.warehouse_id || null,
        data.location_rack || 'All',
        data.godown || 'Main Store',
        data.batch_no || null,
        data.from_item_code || null,
        data.to_item_code || null,
        data.item_group || 'All',
        data.item_id || null,
        data.uom || 'KG',
        data.reference_no || null,
        totalItems,
        matchedItems,
        varianceItems,
        totalVarianceQty,
        totalVarianceValue,
        data.status || 'Draft',
        data.remarks || null,
        createdBy
      ]
    );
    const entryId = result.insertId;

    // Insert items
    for (const item of items) {
      const systemQty = parseFloat(item.system_qty) || 0;
      const physicalQty = parseFloat(item.physical_qty) || 0;
      const varianceQty = physicalQty - systemQty;
      const varianceValue = varianceQty; // Would be varianceQty * unitPrice with actual pricing

      await conn.query(
        `INSERT INTO physical_stock_entry_items (
          entry_id, seq, item_code, item_description, uom, batch_no, location_rack,
          system_qty, physical_qty, variance_qty, variance_value, remarks
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          entryId,
          item.seq || 1,
          item.item_code,
          item.item_description || null,
          item.uom || 'KG',
          item.batch_no || null,
          item.location_rack || null,
          parseFloat(item.system_qty) || 0,
          parseFloat(item.physical_qty) || 0,
          varianceQty,
          varianceValue,
          item.remarks || null
        ]
      );
    }

    // When the entry is Completed (posted), reflect the variances in the stock
    // ledger as Stock Adjustment movements.
    if ((data.status || 'Draft') === 'Completed') {
      await postAdjustmentToLedger(conn, entryId, { ...data, entry_no }, items, createdBy);
    }

    await conn.commit();
    return { id: entryId, entry_no };
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

    // Calculate summary statistics
    let totalItems = items.length;
    let matchedItems = 0;
    let varianceItems = 0;
    let totalVarianceQty = 0;
    let totalVarianceValue = 0;

    for (const item of items) {
      const systemQty = parseFloat(item.system_qty) || 0;
      const physicalQty = parseFloat(item.physical_qty) || 0;
      const varianceQty = physicalQty - systemQty;
      
      if (varianceQty === 0) matchedItems++;
      if (varianceQty !== 0) varianceItems++;
      
      totalVarianceQty += varianceQty;
      totalVarianceValue += varianceQty;
    }

    await conn.query(
      `UPDATE physical_stock_entries SET
        entry_no=?, entry_date=?, stock_date=?, warehouse_id=?, location_rack=?,
        godown=?, batch_no=?, from_item_code=?, to_item_code=?, item_group=?,
        item_id=?, uom=?, reference_no=?, total_items=?, matched_items=?,
        variance_items=?, total_variance_qty=?, total_variance_value=?, status=?, remarks=?, updated_by=?
       WHERE id=? AND deleted_at IS NULL`,
      [
        data.entry_no,
        data.entry_date,
        data.stock_date,
        data.warehouse_id || null,
        data.location_rack || 'All',
        data.godown || 'Main Store',
        data.batch_no || null,
        data.from_item_code || null,
        data.to_item_code || null,
        data.item_group || 'All',
        data.item_id || null,
        data.uom || 'KG',
        data.reference_no || null,
        totalItems,
        matchedItems,
        varianceItems,
        totalVarianceQty,
        totalVarianceValue,
        data.status || 'Draft',
        data.remarks || null,
        updatedBy,
        id
      ]
    );

    // Delete existing items and insert new ones
    await conn.query('DELETE FROM physical_stock_entry_items WHERE entry_id = ?', [id]);

    for (const item of items) {
      const systemQty = parseFloat(item.system_qty) || 0;
      const physicalQty = parseFloat(item.physical_qty) || 0;
      const varianceQty = physicalQty - systemQty;
      const varianceValue = varianceQty;

      await conn.query(
        `INSERT INTO physical_stock_entry_items (
          entry_id, seq, item_code, item_description, uom, batch_no, location_rack,
          system_qty, physical_qty, variance_qty, variance_value, remarks
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          id,
          item.seq || 1,
          item.item_code,
          item.item_description || null,
          item.uom || 'KG',
          item.batch_no || null,
          item.location_rack || null,
          parseFloat(item.system_qty) || 0,
          parseFloat(item.physical_qty) || 0,
          varianceQty,
          varianceValue,
          item.remarks || null
        ]
      );
    }

    if ((data.status || 'Draft') === 'Completed') {
      // Posted → (re)write the Stock Adjustment ledger rows for this entry.
      await postAdjustmentToLedger(conn, id, { ...data, entry_no: data.entry_no }, items, updatedBy);
    } else {
      // Not posted → ensure no stale ledger rows linger, and rebuild valuation
      // for any materials that previously had adjustment rows.
      const [prev] = await conn.query(
        'SELECT DISTINCT warehouse_id, material_id FROM stock_ledger WHERE reference_type=? AND reference_id=?',
        ['physical_stock', id]
      );
      if (prev.length) {
        await conn.query('DELETE FROM stock_ledger WHERE reference_type=? AND reference_id=?', ['physical_stock', id]);
        for (const p of prev) await rebuildAndReprice(conn, p.warehouse_id, p.material_id);
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
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    // Reverse any posted Stock Adjustment ledger rows for this entry, then
    // rebuild valuation for the affected materials.
    const [prev] = await conn.query(
      'SELECT DISTINCT warehouse_id, material_id FROM stock_ledger WHERE reference_type=? AND reference_id=?',
      ['physical_stock', id]
    );
    if (prev.length) {
      await conn.query('DELETE FROM stock_ledger WHERE reference_type=? AND reference_id=?', ['physical_stock', id]);
      for (const p of prev) await rebuildAndReprice(conn, p.warehouse_id, p.material_id);
    }
    const [result] = await conn.query(
      `UPDATE physical_stock_entries SET deleted_at = CURRENT_TIMESTAMP, status = 'Cancelled' WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
    await conn.commit();
    return result.affectedRows > 0;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function bulkSoftDelete(ids) {
  if (!ids || ids.length === 0) return 0;
  const placeholders = ids.map(() => '?').join(', ');
  const [result] = await pool.query(
    `UPDATE physical_stock_entries SET deleted_at = CURRENT_TIMESTAMP, status = 'Cancelled' WHERE id IN (${placeholders}) AND deleted_at IS NULL`,
    ids
  );
  return result.affectedRows;
}

export async function bulkUpdateStatus(ids, status) {
  if (!ids || ids.length === 0) return 0;
  const placeholders = ids.map(() => '?').join(', ');
  const [result] = await pool.query(
    `UPDATE physical_stock_entries SET status = ? WHERE id IN (${placeholders}) AND deleted_at IS NULL`,
    [status, ...ids]
  );
  return result.affectedRows;
}

export async function getEntrySummary(entryId) {
  const [[summary]] = await pool.query(
    `SELECT
       pse.entry_no,
       pse.entry_date,
       pse.stock_date,
       pse.total_items,
       pse.matched_items,
       pse.variance_items,
       pse.total_variance_qty,
       pse.total_variance_value
     FROM physical_stock_entries pse
     WHERE pse.id = ? AND pse.deleted_at IS NULL`,
    [entryId]
  );
  return summary || null;
}

export async function getItemSystemStock(itemCode, warehouseId = null, batchNo = null) {
  // This would typically query the stock ledger or inventory tables
  // For now, we'll return a default value
  // In a real implementation, this would query the actual stock balance
  return { system_qty: 0, uom: 'KG' };
}

export async function exportData(entryId) {
  const [rows] = await pool.query(
    `SELECT psei.*,
       m.name AS material_name
     FROM physical_stock_entry_items psei
     LEFT JOIN materials m ON psei.item_code = m.code
     WHERE psei.entry_id = ?
     ORDER BY psei.seq ASC`,
    [entryId]
  );
  return rows;
}

export async function getDashboardStats() {
  const [[stats]] = await pool.query(
    `SELECT
       COUNT(*) AS total_entries,
       SUM(status = 'Completed') AS completed_entries,
       SUM(total_variance_qty) AS total_variance_qty,
       SUM(total_variance_value) AS total_variance_value
     FROM physical_stock_entries WHERE deleted_at IS NULL`
  );
  return stats;
}
