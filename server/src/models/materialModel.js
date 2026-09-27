import pool from '../config/db.js';
import { updateStock, addLedgerEntry, rebuildAndReprice } from './stockLedgerModel.js';
import { recalculateMaterialTransactions } from './materialTransactionModel.js';

/**
 * Seed (or re-seed) a material's opening stock CONSISTENTLY across all three
 * stock tables: warehouse_stock, stock_ledger and material_transactions.
 *
 * Root-cause fix: previously the material master wrote only a lone
 * material_transactions 'OPENING' row, so warehouse_stock/stock_ledger were out
 * of sync — and a later rebuildAndReprice (which recomputes warehouse_stock from
 * stock_ledger) would wipe the opening balance, causing drift between tables.
 *
 * Behaviour:
 *   - Always first REVERSES any prior material-master opening for this item
 *     (across all three tables), so edits never stack/drift.
 *   - Then, if openingQty > 0 and the default warehouse resolves, writes a fresh
 *     'Opening' ledger row + stock update + transaction, and rebuilds valuation.
 *   - Opening is scoped to the material's default warehouse only.
 */
async function seedOpeningStock({ materialId, code, openingQty, avgRate, defaultWarehouse }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1) Reverse any previous material-master opening for this item, in every
    //    warehouse it may have touched, then remove the ledger/transaction rows.
    const [prevLedger] = await conn.query(
      `SELECT DISTINCT warehouse_id, material_id, uom
         FROM stock_ledger
        WHERE reference_type = 'material_master' AND material_id = ?`,
      [materialId]
    );
    const prevWarehouses = new Set();
    for (const p of prevLedger) {
      prevWarehouses.add(p.warehouse_id);
      // Subtract what the old opening added.
      const [[row]] = await conn.query(
        `SELECT in_qty FROM stock_ledger
          WHERE reference_type='material_master' AND material_id=? AND warehouse_id=?
          ORDER BY id DESC LIMIT 1`,
        [materialId, p.warehouse_id]
      );
      const prevQty = row ? Number(row.in_qty) || 0 : 0;
      if (prevQty) {
        await updateStock(conn, p.warehouse_id, materialId, p.uom, -prevQty, 0);
      }
    }
    await conn.query(
      `DELETE FROM stock_ledger WHERE reference_type='material_master' AND material_id=?`,
      [materialId]
    );
    await conn.query(
      `DELETE FROM material_transactions WHERE reference_type='material_master' AND item_id=?`,
      [materialId]
    );

    // Recompute both engines for every previously-affected warehouse so their
    // balances settle correctly after the reversal (e.g. when the default
    // warehouse changed, the old warehouse must drop back to its true balance).
    for (const w of prevWarehouses) {
      await rebuildAndReprice(conn, w, materialId);
      await recalculateMaterialTransactions(conn, w, materialId);
    }

    // 2) Seed the new opening (if any) into the resolved default warehouse.
    const warehouseId = await resolveWarehouseId(defaultWarehouse);
    if (openingQty > 0 && warehouseId) {
      const openingValue = openingQty * avgRate;
      // a) ledger row
      await addLedgerEntry(conn, {
        transaction_date: new Date().toISOString().split('T')[0],
        transaction_type: 'Opening',
        reference_type: 'material_master',
        reference_id: materialId,
        reference_no: code,
        warehouse_id: warehouseId,
        material_id: materialId,
        uom: null,
        in_qty: openingQty,
        out_qty: 0,
        unit_cost: avgRate,
        amount: openingValue,
        balance_qty: openingQty,
        remarks: 'Opening stock (material master)',
        created_by: null,
      });
      // b) warehouse_stock
      await updateStock(conn, warehouseId, materialId, null, openingQty, avgRate);
      // c) material_transactions row
      await conn.query(
        `INSERT INTO material_transactions
          (transaction_date, transaction_type, reference_no, warehouse_id, item_id,
           opening_stock, receipt_qty, receipt_value, balance_qty, avg_rate, balance_value, reference_type)
         VALUES (NOW(), 'OPENING', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'material_master')`,
        [code, warehouseId, materialId, 0, openingQty, openingValue, openingQty, avgRate, openingValue]
      );
      // d) date-ordered rebuild of BOTH engines so balances stay consistent:
      //    System A (stock_ledger + warehouse_stock) and System B
      //    (material_transactions, which the issue availability check reads).
      await rebuildAndReprice(conn, warehouseId, materialId);
      await recalculateMaterialTransactions(conn, warehouseId, materialId);
    } else if (warehouseId) {
      // Opening removed (qty 0): still recompute both engines for this pair so
      // any residual balances are corrected after the reversal above.
      await rebuildAndReprice(conn, warehouseId, materialId);
      await recalculateMaterialTransactions(conn, warehouseId, materialId);
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

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

  const allowedSortColumns = ['id', 'code', 'name', 'type', 'category', 'status', 'current_stock', 'last_purchase_price', 'standard_cost', 'opening_stock', 'opening_stock_value', 'hsn_code', 'created_at'];
  // group_name comes from the joined group_master table (aliased g).
  const column = sortBy === 'group_name'
    ? 'g.name'
    : (allowedSortColumns.includes(sortBy) ? `m.${sortBy}` : 'm.id');
  const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT m.*, s.name AS preferred_supplier_name, g.name AS group_name, pc.name AS category_name,
       EXISTS(SELECT 1 FROM stock_ledger sl WHERE sl.material_id = m.id) AS has_ledger
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
  const [rows] = await pool.query("SELECT code FROM materials WHERE code LIKE 'MAT-%'");
  let maxNum = 0;
  for (const r of rows) {
    const parts = String(r.code || '').split('-');
    const n = parseInt(parts[parts.length - 1], 10);
    if (!Number.isNaN(n) && n > maxNum) maxNum = n;
  }
  return `MAT-${String(maxNum + 1).padStart(5, '0')}`;
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

  // Seed opening stock consistently across warehouse_stock, stock_ledger and
  // material_transactions (scoped to the default warehouse).
  const openingQty = parseFloat(data.opening_stock) || 0;
  const avgRate = parseFloat(data.standard_cost) || 0;
  await seedOpeningStock({
    materialId: result.insertId,
    code,
    openingQty,
    avgRate,
    defaultWarehouse: data.default_warehouse,
  });

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

  // Re-seed opening stock consistently across all three stock tables. This
  // reverses the previous material-master opening first, then applies the new
  // one — so editing opening stock / default warehouse never drifts.
  const openingQty = parseFloat(data.opening_stock) || 0;
  const avgRate = parseFloat(data.standard_cost) || 0;
  const [[mat]] = await pool.query('SELECT code FROM materials WHERE id = ?', [id]);
  const refNo = mat ? mat.code : `MAT-${String(id).padStart(5, '0')}`;
  await seedOpeningStock({
    materialId: id,
    code: refNo,
    openingQty,
    avgRate,
    defaultWarehouse: data.default_warehouse,
  });

  return result.affectedRows > 0;
}

export async function checkReferences(id) {
  const [[ledgerCount]] = await pool.query('SELECT COUNT(*) AS count FROM stock_ledger WHERE material_id = ?', [id]);
  if (ledgerCount.count > 0) return { hasReferences: true, table: 'Stock Ledger' };
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
    `SELECT m.id, m.code, m.name, m.uom, m.type, m.category, m.group_id,
       m.primary_uom_id, m.secondary_uom_id, m.currency,
       m.standard_cost, m.last_purchase_price, m.preferred_supplier_id,
       pu.name AS primary_uom_name, su.name AS secondary_uom_name,
       pc.name AS category_name, g.name AS group_name, g.gst_rate AS group_gst_rate
     FROM materials m
     LEFT JOIN uom pu ON m.primary_uom_id = pu.id
     LEFT JOIN uom su ON m.secondary_uom_id = su.id
     LEFT JOIN product_categories pc ON m.category = pc.id OR m.category = pc.name
     LEFT JOIN group_master g ON m.group_id = g.id
     WHERE m.status='Active' ORDER BY m.name ASC`
  );
  // Build a display name concatenating material name with its category
  return rows.map(r => {
    const category = r.category_name || r.category || '';
    return { ...r, display_name: category ? `${r.name} (${category})` : r.name };
  });
}

/**
 * Resolve the unit cost for a material used to auto-populate BOM lines.
 * Only two sources, in this order:
 *   1. Latest stock_ledger.unit_cost for the material (most recent transaction).
 *   2. Fallback to the material master `rate` column.
 * No other source is used.
 * Returns { unit_cost, source } where source is 'stock_ledger' or 'material_rate'.
 */
export async function getMaterialLatestCost(materialId) {
  const [[ledger]] = await pool.query(
    `SELECT unit_cost FROM stock_ledger
     WHERE material_id = ? AND unit_cost IS NOT NULL AND unit_cost > 0
     ORDER BY transaction_date DESC, id DESC
     LIMIT 1`,
    [materialId]
  );
  if (ledger && Number(ledger.unit_cost) > 0) {
    return { unit_cost: Number(ledger.unit_cost), source: 'stock_ledger' };
  }

  // Fallback (only) to the material master rate column.
  const [[mat]] = await pool.query(
    `SELECT rate FROM materials WHERE id = ?`,
    [materialId]
  );
  return { unit_cost: Number(mat?.rate) || 0, source: 'material_rate' };
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
