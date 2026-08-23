import pool from '../config/db.js';

const ALLOWED_SORT = ['id', 'plan_no', 'plan_date', 'status', 'order_qty', 'planned_qty', 'created_at'];

export async function getAll({ search, status, customer_id, product_id, article, color, finish, sales_order_no, customer_order_no, from_date, to_date, page = 1, limit = 10, sortBy, sortOrder } = {}) {
  const params = [];
  let where = 'pp.deleted_at IS NULL';

  if (search) {
    where += ' AND (pp.plan_no LIKE ? OR c.name LIKE ? OR p.name LIKE ? OR so.order_no LIKE ? OR pp.customer_order_no LIKE ?)';
    const t = `%${search}%`;
    params.push(t, t, t, t, t);
  }
  if (status) { where += ' AND pp.status = ?'; params.push(status); }
  if (customer_id) { where += ' AND pp.customer_id = ?'; params.push(customer_id); }
  if (product_id) { where += ' AND pp.product_id = ?'; params.push(product_id); }
  if (article) { where += ' AND pp.article LIKE ?'; params.push(`%${article}%`); }
  if (color) { where += ' AND pp.color LIKE ?'; params.push(`%${color}%`); }
  if (finish) { where += ' AND pp.finish LIKE ?'; params.push(`%${finish}%`); }
  if (sales_order_no) { where += ' AND so.order_no LIKE ?'; params.push(`%${sales_order_no}%`); }
  if (customer_order_no) { where += ' AND pp.customer_order_no LIKE ?'; params.push(`%${customer_order_no}%`); }
  if (from_date) { where += ' AND pp.plan_date >= ?'; params.push(from_date); }
  if (to_date) { where += ' AND pp.plan_date <= ?'; params.push(to_date); }

  const col = ALLOWED_SORT.includes(sortBy) ? `pp.\`${sortBy}\`` : 'pp.`id`';
  const ord = sortOrder === 'asc' ? 'ASC' : 'DESC';
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT pp.id, pp.plan_no, pp.plan_date, pp.planned_start_date, pp.planned_end_date,
       pp.order_qty, pp.planned_qty, pp.batch_qty, pp.no_of_batches,
       pp.balance_qty, pp.output_qty, pp.output_percent, pp.wip_qty,
       pp.article, pp.color, pp.finish, pp.customer_order_no,
       pp.priority, pp.status, pp.uom, pp.created_at,
       c.id AS customer_id, c.name AS customer_name,
       p.id AS product_id, p.name AS product_name, p.code AS product_code,
       so.order_no AS sales_order_no
     FROM production_plans pp
     LEFT JOIN customers c ON pp.customer_id = c.id
     LEFT JOIN products p ON pp.product_id = p.id
     LEFT JOIN sales_orders so ON pp.sales_order_id = so.id
     WHERE ${where}
     ORDER BY ${col} ${ord}
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM production_plans pp
     LEFT JOIN customers c ON pp.customer_id = c.id
     LEFT JOIN products p ON pp.product_id = p.id
     LEFT JOIN sales_orders so ON pp.sales_order_id = so.id
     WHERE ${where}`, params
  );

  return { rows, total };
}

export async function getById(id) {
  const [[plan]] = await pool.query(
    `SELECT pp.*,
       c.name AS customer_name,
       p.name AS product_name, p.code AS product_code,
       so.order_no AS sales_order_no,
       w.name AS warehouse_name
     FROM production_plans pp
     LEFT JOIN customers c ON pp.customer_id = c.id
     LEFT JOIN products p ON pp.product_id = p.id
     LEFT JOIN sales_orders so ON pp.sales_order_id = so.id
     LEFT JOIN warehouses w ON pp.warehouse_id = w.id
     WHERE pp.id = ? AND pp.deleted_at IS NULL`, [id]
  );
  if (!plan) return null;

  const [items] = await pool.query(
    `SELECT ppi.*,
       m.name AS material_name, m.code AS material_code,
       pr.name AS product_name, pr.code AS prod_code
     FROM production_plan_items ppi
     LEFT JOIN materials m ON ppi.material_id = m.id
     LEFT JOIN products pr ON ppi.product_id = pr.id
     WHERE ppi.plan_id = ? ORDER BY ppi.id ASC`, [id]
  );

  const [stages] = await pool.query(
    `SELECT pps.*, ps.name AS process_stage_name, ps.code AS process_stage_code, ps.uom AS stage_uom
     FROM production_plan_stages pps
     LEFT JOIN process_stages ps ON pps.stage_id = ps.id
     WHERE pps.plan_id = ? ORDER BY pps.seq ASC`, [id]
  );

  // Aggregate Daily Production transactions per stage for this plan
  const [dpAgg] = await pool.query(
    `SELECT pso.process_stage,
       COALESCE(SUM(t.input_qty), 0) AS agg_input_qty,
       COALESCE(SUM(t.output_qty), 0) AS agg_output_qty,
       COALESCE(SUM(t.rejection_qty), 0) AS agg_rejection_qty
     FROM production_status_orders pso
     JOIN production_status_transactions t ON t.production_status_order_id = pso.id AND t.deleted_at IS NULL
     WHERE pso.production_plan_id = ? AND pso.deleted_at IS NULL
     GROUP BY pso.process_stage`, [id]
  );
  const aggMap = {};
  for (const row of dpAgg) {
    aggMap[row.process_stage] = row;
  }

  // Merge aggregated data into stages
  for (const stage of stages) {
    const stageName = stage.stage_name || stage.process_stage_name;
    const agg = aggMap[stageName];
    if (agg) {
      stage.issue_input_qty = parseFloat(agg.agg_input_qty) || 0;
      stage.output_qty = parseFloat(agg.agg_output_qty) || 0;
      stage.rejection_qty = parseFloat(agg.agg_rejection_qty) || 0;
      stage.wip_qty = Math.max(0, (parseFloat(stage.planned_qty) || 0) - stage.output_qty - stage.rejection_qty);
    }
  }

  const [batches] = await pool.query(
    `SELECT * FROM production_batches
     WHERE plan_id = ? AND deleted_at IS NULL ORDER BY id ASC`, [id]
  );

  return { ...plan, items, stages, batches };
}

export async function getNextNo() {
  const [[row]] = await pool.query(
    `SELECT plan_no FROM production_plans WHERE plan_no LIKE 'PRP-%' ORDER BY id DESC LIMIT 1`
  );
  if (!row) return `PRP-000001`;
  const numPart = row.plan_no.replace('PRP-', '');
  const num = parseInt(numPart, 10) + 1;
  return `PRP-${String(num).padStart(6, '0')}`;
}

export async function getStats() {
  const [[row]] = await pool.query(
    `SELECT
       COUNT(*) AS total,
       SUM(status = 'Draft') AS draft,
       SUM(status = 'Planned') AS planned,
       SUM(status = 'In Progress') AS in_progress,
       SUM(status = 'Completed') AS completed
     FROM production_plans WHERE deleted_at IS NULL`
  );
  return row;
}

function calcDerived(data) {
  const orderQty = parseFloat(data.order_qty) || 0;
  const plannedQty = parseFloat(data.planned_qty) || 0;
  const batchQty = parseFloat(data.batch_qty) || 0;
  const outputQty = parseFloat(data.output_qty) || 0;

  const noOfBatches = batchQty > 0 ? Math.ceil(plannedQty / batchQty) : 0;
  const balanceQty = Math.max(0, orderQty - plannedQty);
  const outputPercent = plannedQty > 0 ? parseFloat(((outputQty / plannedQty) * 100).toFixed(2)) : 0;
  const wipQty = Math.max(0, plannedQty - outputQty);

  return { noOfBatches, balanceQty, outputPercent, wipQty };
}

export async function create(data, items = [], stages = [], createdBy = null) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const plan_no = data.plan_no || await getNextNo();
    const { noOfBatches, balanceQty, outputPercent, wipQty } = calcDerived(data);

    const [result] = await conn.query(
      `INSERT INTO production_plans (
        plan_no, plan_date, sales_order_id, customer_id, product_id, warehouse_id, uom,
        article, color, finish, customer_order_no,
        order_qty, expected_yield, planner, completed_qty, sales_order_qty,
        planned_qty, batch_qty, no_of_batches, balance_qty,
        output_qty, output_percent, wip_qty,
        planned_start_date, planned_end_date, priority, remarks, status, created_by
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        plan_no,
        data.plan_date || new Date().toISOString().split('T')[0],
        data.sales_order_id || null,
        data.customer_id || null,
        data.product_id || null,
        data.warehouse_id || null,
        data.uom || 'Pcs',
        data.article || null,
        data.color || null,
        data.finish || null,
        data.customer_order_no || null,
        parseFloat(data.order_qty) || 0,
        parseFloat(data.expected_yield) || 92,
        data.planner || null,
        parseFloat(data.completed_qty) || 0,
        parseFloat(data.sales_order_qty) || 0,
        parseFloat(data.planned_qty) || 0,
        parseFloat(data.batch_qty) || 0,
        noOfBatches,
        balanceQty,
        parseFloat(data.output_qty) || 0,
        outputPercent,
        wipQty,
        data.planned_start_date || null,
        data.planned_end_date || null,
        data.priority || 'Medium',
        data.remarks || null,
        data.status || 'Draft',
        createdBy,
      ]
    );
    const planId = result.insertId;

    // Insert material items
    for (const item of items) {
      const reqQty = parseFloat(item.required_qty) || 0;
      const issuedQty = parseFloat(item.issued_qty) || 0;
      await conn.query(
        `INSERT INTO production_plan_items (plan_id, material_id, product_id, uom, required_qty, issued_qty, balance_qty, remarks)
         VALUES (?,?,?,?,?,?,?,?)`,
        [planId, item.material_id || null, item.product_id || null, item.uom || null,
         reqQty, issuedQty, Math.max(0, reqQty - issuedQty), item.remarks || null]
      );
    }

    // Insert stages and auto-create Daily Production entries
    for (const stage of stages) {
      await conn.query(
        `INSERT INTO production_plan_stages (plan_id, seq, stage_id, stage_name, capacity, planned_qty, issue_input_qty, planned_percent, receipt_qty, rejection_qty, output_qty, output_percent, wip_qty, status, remarks)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          planId,
          parseInt(stage.seq) || 1,
          stage.stage_id || null,
          stage.stage_name || null,
          parseFloat(stage.capacity) || 0,
          parseFloat(stage.planned_qty) || 0,
          parseFloat(stage.issue_input_qty) || 0,
          parseFloat(stage.planned_percent) || 100,
          parseFloat(stage.receipt_qty) || 0,
          parseFloat(stage.rejection_qty) || 0,
          parseFloat(stage.output_qty) || 0,
          parseFloat(stage.output_percent) || 0,
          parseFloat(stage.wip_qty) || 0,
          stage.status || 'In-Process',
          stage.remarks || null,
        ]
      );

      // Auto-create Daily Production entry for this plan+stage if stage has a name
      if (stage.stage_name || stage.stage_id) {
        const stageName = stage.stage_name || '';
        // Check if a Daily Production entry already exists for this plan+stage
        const [[existing]] = await conn.query(
          `SELECT id FROM production_status_orders WHERE production_plan_id=? AND process_stage=? AND deleted_at IS NULL`,
          [planId, stageName]
        );
        if (!existing) {
          // Fetch customer name
          let customerName = '';
          if (data.customer_id) {
            const [[cust]] = await conn.query('SELECT name FROM customers WHERE id=?', [data.customer_id]);
            if (cust) customerName = cust.name;
          }
          await conn.query(
            `INSERT INTO production_status_orders
             (order_no, production_plan_id, plan_date, customer_name, customer_id, article, color, process_stage, issued_qty, completed_qty, balance_qty, uom, status, created_by, updated_by)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              plan_no, planId, data.plan_date || null,
              customerName, data.customer_id || null,
              data.article || null, data.color || null, stageName,
              0, 0, 0, 'Pcs', 'Pending', createdBy, createdBy,
            ]
          );
        }
      }
    }

    // If no stages but plan was created, create a single Daily Production entry
    if (stages.length === 0) {
      let customerName = '';
      if (data.customer_id) {
        const [[cust]] = await conn.query('SELECT name FROM customers WHERE id=?', [data.customer_id]);
        if (cust) customerName = cust.name;
      }
      await conn.query(
        `INSERT INTO production_status_orders
         (order_no, production_plan_id, plan_date, customer_name, customer_id, article, color, process_stage, issued_qty, completed_qty, balance_qty, uom, status, created_by, updated_by)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          plan_no, planId, data.plan_date || null,
          customerName, data.customer_id || null,
          data.article || null, data.color || null, null,
          0, 0, 0, 'Pcs', 'Pending', createdBy, createdBy,
        ]
      );
    }

    await conn.commit();
    return { id: planId, plan_no };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function update(id, data, items = [], stages = [], updatedBy = null) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { noOfBatches, balanceQty, outputPercent, wipQty } = calcDerived(data);

    const [res] = await conn.query(
      `UPDATE production_plans SET
        plan_date=?, sales_order_id=?, customer_id=?, product_id=?, warehouse_id=?, uom=?,
        article=?, color=?, finish=?, customer_order_no=?,
        order_qty=?, expected_yield=?, planner=?, completed_qty=?, sales_order_qty=?,
        planned_qty=?, batch_qty=?, no_of_batches=?, balance_qty=?,
        output_qty=?, output_percent=?, wip_qty=?,
        planned_start_date=?, planned_end_date=?, priority=?, remarks=?, status=?,
        updated_by=?, updated_at=NOW()
      WHERE id=? AND deleted_at IS NULL`,
      [
        data.plan_date, data.sales_order_id || null, data.customer_id || null,
        data.product_id || null, data.warehouse_id || null, data.uom || 'Pcs',
        data.article || null, data.color || null, data.finish || null, data.customer_order_no || null,
        parseFloat(data.order_qty) || 0,
        parseFloat(data.expected_yield) || 92,
        data.planner || null,
        parseFloat(data.completed_qty) || 0,
        parseFloat(data.sales_order_qty) || 0,
        parseFloat(data.planned_qty) || 0,
        parseFloat(data.batch_qty) || 0, noOfBatches, balanceQty,
        parseFloat(data.output_qty) || 0, outputPercent, wipQty,
        data.planned_start_date || null, data.planned_end_date || null,
        data.priority || 'Medium', data.remarks || null, data.status || 'Draft',
        updatedBy, id,
      ]
    );
    if (!res.affectedRows) { await conn.rollback(); return false; }

    // Re-insert material items
    await conn.query(`DELETE FROM production_plan_items WHERE plan_id = ?`, [id]);
    for (const item of items) {
      const reqQty = parseFloat(item.required_qty) || 0;
      const issuedQty = parseFloat(item.issued_qty) || 0;
      await conn.query(
        `INSERT INTO production_plan_items (plan_id, material_id, product_id, uom, required_qty, issued_qty, balance_qty, remarks)
         VALUES (?,?,?,?,?,?,?,?)`,
        [id, item.material_id || null, item.product_id || null, item.uom || null,
         reqQty, issuedQty, Math.max(0, reqQty - issuedQty), item.remarks || null]
      );
    }

    // Re-insert stages and ensure Daily Production entries exist
    await conn.query(`DELETE FROM production_plan_stages WHERE plan_id = ?`, [id]);

    // Get plan header info for Daily Production entries
    const [[planHeader]] = await conn.query('SELECT plan_no, plan_date, customer_id, article, color FROM production_plans WHERE id=?', [id]);
    let customerName = '';
    if (data.customer_id || planHeader?.customer_id) {
      const custId = data.customer_id || planHeader?.customer_id;
      const [[cust]] = await conn.query('SELECT name FROM customers WHERE id=?', [custId]);
      if (cust) customerName = cust.name;
    }

    for (const stage of stages) {
      await conn.query(
        `INSERT INTO production_plan_stages (plan_id, seq, stage_id, stage_name, capacity, planned_qty, issue_input_qty, planned_percent, receipt_qty, rejection_qty, output_qty, output_percent, wip_qty, status, remarks)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          id,
          parseInt(stage.seq) || 1,
          stage.stage_id || null,
          stage.stage_name || null,
          parseFloat(stage.capacity) || 0,
          parseFloat(stage.planned_qty) || 0,
          parseFloat(stage.issue_input_qty) || 0,
          parseFloat(stage.planned_percent) || 100,
          parseFloat(stage.receipt_qty) || 0,
          parseFloat(stage.rejection_qty) || 0,
          parseFloat(stage.output_qty) || 0,
          parseFloat(stage.output_percent) || 0,
          parseFloat(stage.wip_qty) || 0,
          stage.status || 'In-Process',
          stage.remarks || null,
        ]
      );

      // Auto-create Daily Production entry for this plan+stage if not exists
      if (stage.stage_name || stage.stage_id) {
        const stageName = stage.stage_name || '';
        const [[existing]] = await conn.query(
          `SELECT id FROM production_status_orders WHERE production_plan_id=? AND process_stage=? AND deleted_at IS NULL`,
          [id, stageName]
        );
        if (!existing) {
          await conn.query(
            `INSERT INTO production_status_orders
             (order_no, production_plan_id, plan_date, customer_name, customer_id, article, color, process_stage, issued_qty, completed_qty, balance_qty, uom, status, created_by, updated_by)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              planHeader?.plan_no || null, id, data.plan_date || planHeader?.plan_date || null,
              customerName, data.customer_id || planHeader?.customer_id || null,
              data.article || planHeader?.article || null, data.color || planHeader?.color || null, stageName,
              0, 0, 0, 'Pcs', 'Pending', updatedBy, updatedBy,
            ]
          );
        }
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

export async function softDelete(id, deletedBy = null) {
  const [res] = await pool.query(
    `UPDATE production_plans SET deleted_at=NOW(), updated_by=? WHERE id=? AND deleted_at IS NULL`,
    [deletedBy, id]
  );
  return res.affectedRows > 0;
}

export async function bulkDelete(ids, deletedBy = null) {
  if (!ids || !ids.length) return 0;
  const [res] = await pool.query(
    `UPDATE production_plans SET deleted_at=NOW(), updated_by=? WHERE id IN (?) AND deleted_at IS NULL`,
    [deletedBy, ids]
  );
  return res.affectedRows;
}

// Get dropdown data for filters
export async function getFilterOptions() {
  const [articles] = await pool.query(
    `SELECT DISTINCT article FROM production_plans WHERE article IS NOT NULL AND article != '' AND deleted_at IS NULL ORDER BY article`
  );
  const [colors] = await pool.query(
    `SELECT DISTINCT color FROM production_plans WHERE color IS NOT NULL AND color != '' AND deleted_at IS NULL ORDER BY color`
  );
  const [finishes] = await pool.query(
    `SELECT DISTINCT finish FROM production_plans WHERE finish IS NOT NULL AND finish != '' AND deleted_at IS NULL ORDER BY finish`
  );
  return {
    articles: articles.map(r => r.article),
    colors: colors.map(r => r.color),
    finishes: finishes.map(r => r.finish),
  };
}
