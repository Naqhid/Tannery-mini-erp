import pool from '../config/db.js';

export async function getAll({ search, status, page, limit, sortBy, sortOrder }) {
  let where = '1=1';
  const params = [];
  if (search) {
    where += ' AND (scs.cost_sheet_no LIKE ? OR p.name LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term);
  }
  if (status) { where += ' AND scs.status = ?'; params.push(status); }

  const allowedSortColumns = ['id', 'cost_sheet_no', 'cost_sheet_version', 'standard_cost', 'status', 'created_at'];
  const column = allowedSortColumns.includes(sortBy) ? `scs.${sortBy}` : 'scs.id';
  const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT scs.*, p.name AS product_name, p.code AS product_code,
       b.name AS bom_name, b.code AS bom_code, b.process_type AS bom_type,
       u.full_name AS prepared_by_name
     FROM standard_cost_sheets scs
     LEFT JOIN products p ON scs.product_id = p.id
     LEFT JOIN boms b ON scs.bom_id = b.id
     LEFT JOIN users u ON scs.prepared_by = u.id
     WHERE ${where}
     ORDER BY ${column} ${order} LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM standard_cost_sheets scs
     LEFT JOIN products p ON scs.product_id = p.id
     WHERE ${where}`,
    params
  );
  return { rows, total };
}

export async function getById(id) {
  const [rows] = await pool.query(
    `SELECT scs.*, p.name AS product_name, p.code AS product_code,
       b.name AS bom_name, b.code AS bom_code, b.process_type AS bom_type,
       u.full_name AS prepared_by_name
     FROM standard_cost_sheets scs
     LEFT JOIN products p ON scs.product_id = p.id
     LEFT JOIN boms b ON scs.bom_id = b.id
     LEFT JOIN users u ON scs.prepared_by = u.id
     WHERE scs.id = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function getItems(costSheetId) {
  const [rows] = await pool.query(
    `SELECT sci.*, m.name AS cost_component_name, m.code AS cost_component_code,
       g.name AS group_name
     FROM standard_cost_items sci
     LEFT JOIN materials m ON sci.cost_component_id = m.id
     LEFT JOIN group_master g ON sci.cost_component_group_id = g.id
     WHERE sci.cost_sheet_id = ?
     ORDER BY sci.id`,
    [costSheetId]
  );
  return rows;
}

export async function getNextCostSheetNo(customerName = null) {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yy = String(now.getFullYear()).slice(-2);
  const monthYear = `${mm}${yy}`;

  let prefix = 'CST';
  if (customerName) {
    const p = customerName.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
    if (p.length >= 3) prefix = p;
  }
  const baseCode = `${prefix}${monthYear}`;
  const [[row]] = await pool.query(
    "SELECT cost_sheet_no FROM standard_cost_sheets WHERE cost_sheet_no LIKE ? ORDER BY LENGTH(cost_sheet_no) DESC, cost_sheet_no DESC LIMIT 1",
    [`${baseCode}%`]
  );
  if (!row) return `${baseCode}01`;
  const seqPart = row.cost_sheet_no.substring(baseCode.length);
  const seq = (parseInt(seqPart, 10) || 0) + 1;
  return `${baseCode}${String(seq).padStart(2, '0')}`;
}

export async function calculateBomCost(bomId) {
  const [[result]] = await pool.query(
    `SELECT COALESCE(SUM(qty * (1 + COALESCE(scrap_percent, 0) / 100) * COALESCE(unit_cost, 0)), 0) AS total_bom_cost
     FROM bom_items WHERE bom_id = ?`,
    [bomId]
  );
  return Number(result.total_bom_cost) || 0;
}

export async function create(data, userId = null) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Calculate BOM cost
    const totalBomCost = await calculateBomCost(data.bom_id);

    // Calculate total other cost from items
    const totalOtherCost = (data.items || []).reduce((sum, item) => sum + (Number(item.cost_value) || 0), 0);
    const standardCost = totalBomCost + totalOtherCost;

    // Get next version for this product + bom combination
    const [[maxVer]] = await conn.query(
      'SELECT MAX(cost_sheet_version) AS max_ver FROM standard_cost_sheets WHERE product_id = ? AND bom_id = ?',
      [data.product_id, data.bom_id]
    );
    const costSheetVersion = (maxVer?.max_ver || 0) + 1;

    // Generate cost sheet number
    let customerName = null;
    if (data.customer_name) {
      customerName = data.customer_name;
    } else {
      const [[prod]] = await conn.query(
        'SELECT c.name AS customer_name FROM products p LEFT JOIN customers c ON p.customer_id = c.id WHERE p.id = ?',
        [data.product_id]
      );
      customerName = prod?.customer_name || null;
    }
    const costSheetNo = await getNextCostSheetNo(customerName);

    // Get BOM details
    const [[bom]] = await conn.query('SELECT process_type, version FROM boms WHERE id = ?', [data.bom_id]);

    const [result] = await conn.query(
      `INSERT INTO standard_cost_sheets 
       (product_id, bom_id, bom_type, bom_version, cost_sheet_no, cost_sheet_version, currency, basis_unit, total_bom_cost, total_other_cost, standard_cost, status, prepared_by, created_by, updated_by)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [data.product_id, data.bom_id, bom?.process_type || data.bom_type || 'Wet End',
       bom?.version || data.bom_version || 1,
       costSheetNo, costSheetVersion,
       data.currency || 'INR', data.basis_unit || 'Sq.Ft.',
       totalBomCost, totalOtherCost, standardCost,
       'Draft', userId, userId, userId]
    );
    const costSheetId = result.insertId;

    // Insert cost component items
    if (data.items && data.items.length > 0) {
      for (const item of data.items) {
        const costPercentage = standardCost > 0 ? (Number(item.cost_value) / standardCost) * 100 : 0;
        await conn.query(
          `INSERT INTO standard_cost_items (cost_sheet_id, cost_component_id, cost_component_group_id, cost_value, cost_percentage)
           VALUES (?,?,?,?,?)`,
          [costSheetId, item.cost_component_id, item.cost_component_group_id || null,
           item.cost_value, costPercentage]
        );
      }
    }

    await conn.commit();
    return { id: costSheetId, cost_sheet_no: costSheetNo, cost_sheet_version: costSheetVersion, total_bom_cost: totalBomCost, total_other_cost: totalOtherCost, standard_cost: standardCost };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally { conn.release(); }
}

export async function update(id, data, userId = null) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Check if posted - cannot edit
    const [[current]] = await conn.query('SELECT status, cost_sheet_version, product_id, bom_id FROM standard_cost_sheets WHERE id = ?', [id]);
    if (!current) throw new Error('Cost sheet not found');
    if (current.status === 'Posted') throw new Error('Cannot edit a posted cost sheet');

    // Recalculate BOM cost
    const bomId = data.bom_id || current.bom_id;
    const totalBomCost = await calculateBomCost(bomId);
    const totalOtherCost = (data.items || []).reduce((sum, item) => sum + (Number(item.cost_value) || 0), 0);
    const standardCost = totalBomCost + totalOtherCost;

    // Update header (version does NOT change on normal edit)
    await conn.query(
      `UPDATE standard_cost_sheets SET
         bom_id=?, bom_version=?, currency=?, basis_unit=?,
         total_bom_cost=?, total_other_cost=?, standard_cost=?, updated_by=?
       WHERE id=?`,
      [bomId, data.bom_version || current.bom_version,
       data.currency || 'INR', data.basis_unit || 'Sq.Ft.',
       totalBomCost, totalOtherCost, standardCost, userId, id]
    );

    // Replace items
    await conn.query('DELETE FROM standard_cost_items WHERE cost_sheet_id = ?', [id]);
    if (data.items && data.items.length > 0) {
      for (const item of data.items) {
        const costPercentage = standardCost > 0 ? (Number(item.cost_value) / standardCost) * 100 : 0;
        await conn.query(
          `INSERT INTO standard_cost_items (cost_sheet_id, cost_component_id, cost_component_group_id, cost_value, cost_percentage)
           VALUES (?,?,?,?,?)`,
          [id, item.cost_component_id, item.cost_component_group_id || null,
           item.cost_value, costPercentage]
        );
      }
    }

    await conn.commit();
    return { id, total_bom_cost: totalBomCost, total_other_cost: totalOtherCost, standard_cost: standardCost };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally { conn.release(); }
}

export async function updateStatus(id, status, userId = null) {
  const [result] = await pool.query(
    'UPDATE standard_cost_sheets SET status=?, updated_by=? WHERE id=?',
    [status, userId, id]
  );
  return result.affectedRows > 0;
}

export async function postCostSheet(id, userId = null) {
  const [[current]] = await pool.query('SELECT status FROM standard_cost_sheets WHERE id = ?', [id]);
  if (!current) throw new Error('Cost sheet not found');
  if (current.status === 'Posted') throw new Error('Cost sheet is already posted');
  
  const [result] = await pool.query(
    'UPDATE standard_cost_sheets SET status=?, updated_by=? WHERE id=?',
    ['Posted', userId, id]
  );
  return result.affectedRows > 0;
}

export async function importRevision(sourceCostSheetId, userId = null) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Get source
    const [[source]] = await conn.query('SELECT * FROM standard_cost_sheets WHERE id = ?', [sourceCostSheetId]);
    if (!source) throw new Error('Source cost sheet not found');

    // Get source items
    const [sourceItems] = await conn.query('SELECT * FROM standard_cost_items WHERE cost_sheet_id = ?', [sourceCostSheetId]);

    // Get next version
    const [[maxVer]] = await conn.query(
      'SELECT MAX(cost_sheet_version) AS max_ver FROM standard_cost_sheets WHERE product_id = ? AND bom_id = ?',
      [source.product_id, source.bom_id]
    );
    const nextVersion = (maxVer?.max_ver || 0) + 1;

    // Generate new cost sheet number
    let customerName = null;
    const [[prod]] = await conn.query(
      'SELECT c.name AS customer_name FROM products p LEFT JOIN customers c ON p.customer_id = c.id WHERE p.id = ?',
      [source.product_id]
    );
    customerName = prod?.customer_name || null;
    const costSheetNo = await getNextCostSheetNo(customerName);

    // Recalculate BOM cost
    const totalBomCost = await calculateBomCost(source.bom_id);
    const totalOtherCost = sourceItems.reduce((sum, item) => sum + Number(item.cost_value), 0);
    const standardCost = totalBomCost + totalOtherCost;

    // Create new version
    const [result] = await conn.query(
      `INSERT INTO standard_cost_sheets 
       (product_id, bom_id, bom_type, bom_version, cost_sheet_no, cost_sheet_version, currency, basis_unit, total_bom_cost, total_other_cost, standard_cost, status, prepared_by, created_by, updated_by)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [source.product_id, source.bom_id, source.bom_type, source.bom_version,
       costSheetNo, nextVersion, source.currency, source.basis_unit,
       totalBomCost, totalOtherCost, standardCost,
       'Draft', userId, userId, userId]
    );
    const newId = result.insertId;

    // Copy items
    for (const item of sourceItems) {
      const costPercentage = standardCost > 0 ? (Number(item.cost_value) / standardCost) * 100 : 0;
      await conn.query(
        `INSERT INTO standard_cost_items (cost_sheet_id, cost_component_id, cost_component_group_id, cost_value, cost_percentage)
         VALUES (?,?,?,?,?)`,
        [newId, item.cost_component_id, item.cost_component_group_id, item.cost_value, costPercentage]
      );
    }

    await conn.commit();
    return { id: newId, cost_sheet_no: costSheetNo, cost_sheet_version: nextVersion, total_bom_cost: totalBomCost, total_other_cost: totalOtherCost, standard_cost: standardCost };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally { conn.release(); }
}

export async function getPreviousVersion(productId, bomId, currentVersion) {
  const [rows] = await pool.query(
    `SELECT * FROM standard_cost_sheets 
     WHERE product_id = ? AND bom_id = ? AND cost_sheet_version < ?
     ORDER BY cost_sheet_version DESC LIMIT 1`,
    [productId, bomId, currentVersion]
  );
  return rows[0] || null;
}

export async function getVariance(costSheetId) {
  const current = await getById(costSheetId);
  if (!current) return null;

  const previous = await getPreviousVersion(current.product_id, current.bom_id, current.cost_sheet_version);
  if (!previous) {
    return { current_cost: current.standard_cost, previous_cost: null, variance: null, variance_percent: null, message: 'No previous standard cost available' };
  }

  const variance = Number(current.standard_cost) - Number(previous.standard_cost);
  const variancePercent = Number(previous.standard_cost) > 0
    ? (variance / Number(previous.standard_cost)) * 100
    : null;

  return {
    current_cost: Number(current.standard_cost),
    previous_cost: Number(previous.standard_cost),
    variance: Math.round(variance * 100) / 100,
    variance_percent: variancePercent !== null ? Math.round(variancePercent * 100) / 100 : 'N/A',
    previous_version: previous.cost_sheet_version,
  };
}

export async function remove(id) {
  const [[current]] = await pool.query('SELECT status FROM standard_cost_sheets WHERE id = ?', [id]);
  if (!current) return false;
  if (current.status === 'Posted') throw new Error('Cannot delete a posted cost sheet');
  const [result] = await pool.query('DELETE FROM standard_cost_sheets WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

/**
 * Get order cost summary for a product:
 * - Completed Sq.ft (from production_status_transactions)
 * - Cost Per Sq.ft (total general + machine + material cost / completed qty)
 * - Selling Price Per Sq.ft (from sales order items)
 * - Variance Cost Per Sq.ft (cost - selling price)
 */
export async function getOrderCostSummary(productId) {
  const [[result]] = await pool.query(
    `SELECT 
       COALESCE(pst_agg.total_output_sqft, 0) AS completed_sqft,
       COALESCE(gc_agg.total_general_cost, 0) AS total_general_cost,
       COALESCE(mc_agg.total_machine_cost, 0) AS total_machine_cost,
       COALESCE(bom_agg.total_material_cost, 0) AS total_material_cost,
       CASE 
         WHEN COALESCE(pst_agg.total_output_sqft, 0) > 0 
         THEN (COALESCE(gc_agg.total_general_cost, 0) + COALESCE(mc_agg.total_machine_cost, 0) + COALESCE(bom_agg.total_material_cost, 0)) / pst_agg.total_output_sqft
         ELSE 0 
       END AS cost_per_sqft,
       COALESCE(soi_agg.avg_unit_price, 0) AS selling_price_per_sqft,
       CASE 
         WHEN COALESCE(pst_agg.total_output_sqft, 0) > 0 
         THEN ((COALESCE(gc_agg.total_general_cost, 0) + COALESCE(mc_agg.total_machine_cost, 0) + COALESCE(bom_agg.total_material_cost, 0)) / pst_agg.total_output_sqft) - COALESCE(soi_agg.avg_unit_price, 0)
         ELSE 0 
       END AS variance_per_sqft
     FROM products p
     LEFT JOIN (
       SELECT pp.product_id, SUM(pst.output_qty) AS total_output_sqft
       FROM production_plans pp
       JOIN production_status_transactions pst ON pst.production_plan_id = pp.id AND pst.deleted_at IS NULL
       WHERE pp.deleted_at IS NULL
       GROUP BY pp.product_id
     ) pst_agg ON pst_agg.product_id = p.id
     LEFT JOIN (
       SELECT pp.product_id, SUM(gch.total_amount) AS total_general_cost
       FROM production_plans pp
       JOIN general_cost_headers gch ON gch.production_plan_id = pp.id
       WHERE pp.deleted_at IS NULL
       GROUP BY pp.product_id
     ) gc_agg ON gc_agg.product_id = p.id
     LEFT JOIN (
       SELECT pp.product_id, SUM(mch.total_amount) AS total_machine_cost
       FROM production_plans pp
       JOIN machine_cost_headers mch ON mch.production_plan_id = pp.id
       WHERE pp.deleted_at IS NULL
       GROUP BY pp.product_id
     ) mc_agg ON mc_agg.product_id = p.id
     LEFT JOIN (
       SELECT pp.product_id,
         COALESCE(SUM(bi.qty * (1 + COALESCE(bi.scrap_percent, 0) / 100) * COALESCE(bi.unit_cost, 0)), 0) AS total_material_cost
       FROM production_plans pp
       LEFT JOIN boms b ON pp.bom_id = b.id
       LEFT JOIN bom_items bi ON bi.bom_id = b.id
       WHERE pp.deleted_at IS NULL
       GROUP BY pp.product_id
     ) bom_agg ON bom_agg.product_id = p.id
     LEFT JOIN (
       SELECT pp.product_id, AVG(soi.unit_price) AS avg_unit_price
       FROM production_plans pp
       JOIN sales_orders so ON pp.sales_order_id = so.id
       JOIN sales_order_items soi ON soi.sales_order_id = so.id
       WHERE pp.deleted_at IS NULL
       GROUP BY pp.product_id
     ) soi_agg ON soi_agg.product_id = p.id
     WHERE p.id = ?`,
    [productId]
  );

  if (!result) {
    return { completed_sqft: 0, cost_per_sqft: 0, selling_price_per_sqft: 0, variance_per_sqft: 0 };
  }

  return {
    completed_sqft: Number(result.completed_sqft) || 0,
    cost_per_sqft: Number(result.cost_per_sqft) || 0,
    selling_price_per_sqft: Number(result.selling_price_per_sqft) || 0,
    variance_per_sqft: Number(result.variance_per_sqft) || 0,
  };
}
