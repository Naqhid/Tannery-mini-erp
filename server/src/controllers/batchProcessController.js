import pool from '../config/db.js';
import { rebuildStockValuation, rebuildAndReprice, addLedgerEntry } from '../models/stockLedgerModel.js';

/**
 * Helper to get first and last date of previous month
 */
function getPreviousMonthDateRange() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  let prevMonth = currentMonth - 1;
  let prevYear = currentYear;
  
  if (prevMonth < 0) {
    prevMonth = 11;
    prevYear = currentYear - 1;
  }
  
  // First day of previous month
  const firstDay = new Date(prevYear, prevMonth, 1);
  // Last day of previous month
  const lastDay = new Date(prevYear, prevMonth + 1, 0);
  
  return {
    from_date: firstDay.toISOString().split('T')[0],
    to_date: lastDay.toISOString().split('T')[0],
  };
}

/**
 * Helper to get date range based on request body or default to previous month
 */
function getDateRangeFromRequest(req) {
  const { from_date, to_date } = req.body;
  
  if (from_date && to_date) {
    return { from_date, to_date };
  }
  
  return getPreviousMonthDateRange();
}

/**
 * Calculate average rates for stock ledger entries within a date range.
 * This uses the existing rebuildStockValuation function which implements
 * the correct running average calculation (FIFO/Average Cost method).
 * 
 * Formula: unit_cost = (opening_value + in_value) / (opening_qty + in_qty)
 * Then: out_value = out_qty * unit_cost
 * Then: balance_qty = opening_qty + in_qty - out_qty
 * Then: balance_value = balance_qty * unit_cost
 */
export async function calculateAverageRates(req, res, next) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    
    const { from_date, to_date } = getDateRangeFromRequest(req);
    
    // Get all distinct (warehouse_id, material_id) pairs that have transactions in the date range
    const [pairs] = await conn.query(
      `SELECT DISTINCT warehouse_id, material_id
       FROM stock_ledger
       WHERE transaction_date BETWEEN ? AND ?
         AND warehouse_id IS NOT NULL AND material_id IS NOT NULL`,
      [from_date, to_date]
    );
    
    let processedCount = 0;
    const results = [];
    
    for (const pair of pairs) {
      const warehouseId = pair.warehouse_id;
      const materialId = pair.material_id;
      
      // Use the existing rebuildStockValuation which correctly implements the average rate formula
      await rebuildStockValuation(conn, warehouseId, materialId);
      
      // Get the updated entries to count and return results
      const [entries] = await conn.query(
        `SELECT id, warehouse_id, material_id, transaction_date,
                opening_qty, opening_value, in_qty, in_value,
                out_qty, out_value, unit_cost, balance_qty, balance_value
         FROM stock_ledger
         WHERE warehouse_id = ? AND material_id = ?
           AND transaction_date BETWEEN ? AND ?
         ORDER BY transaction_date ASC, id ASC`,
        [warehouseId, materialId, from_date, to_date]
      );
      
      for (const entry of entries) {
        results.push({
          ledger_id: entry.id,
          material_id: entry.material_id,
          warehouse_id: entry.warehouse_id,
          transaction_date: entry.transaction_date,
          unit_cost: Number(entry.unit_cost.toFixed(4)),
          in_value: Number(entry.in_value.toFixed(2)),
          out_value: Number(entry.out_value.toFixed(2)),
          opening_qty: Number(entry.opening_qty.toFixed(3)),
          opening_value: Number(entry.opening_value.toFixed(2)),
          balance_qty: Number(entry.balance_qty.toFixed(3)),
          balance_value: Number(entry.balance_value.toFixed(2)),
        });
      }
      
      processedCount += entries.length;
    }
    
    await conn.commit();
    
    res.json({
      success: true,
      message: `Average rates calculated for ${processedCount} ledger entries`,
      data: {
        from_date,
        to_date,
        processed_count: processedCount,
        results,
      },
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

/**
 * Archive transactions by moving them to a history table
 */
export async function archiveTransactions(req, res, next) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    
    const { from_date, to_date } = getDateRangeFromRequest(req);
    
    // Get all ledger entries in the date range
    const [entries] = await conn.query(
      `SELECT * FROM stock_ledger
       WHERE transaction_date BETWEEN ? AND ?`,
      [from_date, to_date]
    );
    
    let archivedCount = 0;
    
    // Check if stock_ledger_archive table exists
    const [tables] = await conn.query(
      `SHOW TABLES LIKE 'stock_ledger_archive'`
    );
    
    const archiveTableExists = tables && tables.length > 0;
    
    if (!archiveTableExists) {
      // Create the archive table
      await conn.query(
        `CREATE TABLE stock_ledger_archive LIKE stock_ledger`
      );
      await conn.query(
        `ALTER TABLE stock_ledger_archive ADD COLUMN archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
      );
    }
    
    // Archive each entry
    for (const entry of entries) {
      if (archiveTableExists) {
        await conn.query(
          `INSERT INTO stock_ledger_archive SELECT ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?`,
          [
            entry.id, entry.transaction_date, entry.transaction_type, entry.reference_type,
            entry.reference_id, entry.reference_no, entry.warehouse_id, entry.material_id,
            entry.uom, entry.batch_no, entry.expiry_date, entry.in_qty, entry.in_value,
            entry.out_qty, entry.out_value, entry.unit_cost, entry.amount,
            entry.opening_qty, entry.opening_value, entry.balance_qty, entry.balance_value,
            entry.remarks, entry.created_by, entry.created_at, entry.updated_at,
          ]
        );
      }
      
      // Mark as archived by setting a flag (if column exists)
      try {
        await conn.query(
          `ALTER TABLE stock_ledger ADD COLUMN IF NOT EXISTS archived TINYINT(1) DEFAULT 0`
        );
        await conn.query(
          `UPDATE stock_ledger SET archived = 1 WHERE id = ?`,
          [entry.id]
        );
      } catch (e) {
        // If we can't add the column, just skip marking as archived
        console.log('Could not mark as archived:', e.message);
      }
      
      archivedCount++;
    }
    
    await conn.commit();
    
    res.json({
      success: true,
      message: `Archived ${archivedCount} transactions from ${from_date} to ${to_date}`,
      data: {
        from_date,
        to_date,
        archived_count: archivedCount,
      },
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

/**
 * Archive closing balance for each (warehouse, material) pair
 */
export async function archiveClosingBalance(req, res, next) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    
    const { from_date, to_date } = getDateRangeFromRequest(req);
    
    // Get closing balances for all (warehouse, material) pairs as of the end of the period
    const [balances] = await conn.query(
      `SELECT warehouse_id, material_id, balance_qty, balance_value,
              transaction_date, MAX(id) as ledger_id
       FROM stock_ledger
       WHERE transaction_date <= ?
         AND warehouse_id IS NOT NULL AND material_id IS NOT NULL
       GROUP BY warehouse_id, material_id, balance_qty, balance_value, transaction_date
       ORDER BY warehouse_id, material_id`,
      [to_date]
    );
    
    // Check if stock_closing_balance table exists
    const [tables] = await conn.query(
      `SHOW TABLES LIKE 'stock_closing_balance'`
    );
    
    const closingTableExists = tables && tables.length > 0;
    
    if (!closingTableExists) {
      await conn.query(
        `CREATE TABLE IF NOT EXISTS stock_closing_balance (
          id INT AUTO_INCREMENT PRIMARY KEY,
          warehouse_id INT NOT NULL,
          material_id INT NOT NULL,
          closing_date DATE NOT NULL,
          financial_year VARCHAR(50),
          closing_qty DECIMAL(14,3) NOT NULL DEFAULT 0,
          closing_value DECIMAL(16,2) NOT NULL DEFAULT 0,
          avg_unit_cost DECIMAL(12,4) NOT NULL DEFAULT 0,
          uom VARCHAR(20),
          reference_type VARCHAR(50) DEFAULT 'monthly_batch',
          reference_id INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_wm_date (warehouse_id, material_id, closing_date),
          INDEX idx_date (closing_date)
        )`
      );
    }
    
    let archivedCount = 0;
    const closingDate = to_date;
    
    // Archive closing balances
    for (const balance of balances) {
      const avgUnitCost = balance.balance_qty > 0 
        ? Number((balance.balance_value / balance.balance_qty).toFixed(4))
        : 0;
      
      // Check if closing balance already exists for this period
      const [existing] = await conn.query(
        `SELECT id FROM stock_closing_balance
         WHERE warehouse_id = ? AND material_id = ? AND closing_date = ? AND reference_type = 'monthly_batch'`,
        [balance.warehouse_id, balance.material_id, closingDate]
      );
      
      if (existing && existing.length > 0) {
        // Update existing
        await conn.query(
          `UPDATE stock_closing_balance
           SET closing_qty = ?, closing_value = ?, avg_unit_cost = ?, uom = ?,
               financial_year = ?, reference_id = ?, created_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [
            Number(balance.balance_qty.toFixed(3)),
            Number(balance.balance_value.toFixed(2)),
            avgUnitCost,
            balance.uom || null,
            `${new Date(closingDate).getFullYear()}-${String(new Date(closingDate).getMonth() + 1).padStart(2, '0')}`,
            balance.ledger_id || null,
            existing[0].id,
          ]
        );
      } else {
        // Insert new
        await conn.query(
          `INSERT INTO stock_closing_balance
           (warehouse_id, material_id, closing_date, closing_qty, closing_value,
            avg_unit_cost, uom, financial_year, reference_type, reference_id)
           VALUES (?,?,?,?,?,?,?,?,?,?)`,
          [
            balance.warehouse_id,
            balance.material_id,
            closingDate,
            Number(balance.balance_qty.toFixed(3)),
            Number(balance.balance_value.toFixed(2)),
            avgUnitCost,
            balance.uom || null,
            `${new Date(closingDate).getFullYear()}-${String(new Date(closingDate).getMonth() + 1).padStart(2, '0')}`,
            'monthly_batch',
            balance.ledger_id || null,
          ]
        );
      }
      
      archivedCount++;
    }
    
    await conn.commit();
    
    res.json({
      success: true,
      message: `Archived closing balance for ${archivedCount} (warehouse, material) pairs as of ${to_date}`,
      data: {
        from_date,
        to_date,
        archived_count: archivedCount,
      },
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

/**
 * Create opening stocks for the next period based on closing balances
 */
export async function createOpeningStocks(req, res, next) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    
    const { from_date, to_date } = getDateRangeFromRequest(req);
    
    // Calculate the first date of the next period
    const nextPeriodStart = new Date(to_date);
    nextPeriodStart.setDate(nextPeriodStart.getDate() + 1);
    const nextPeriodStartStr = nextPeriodStart.toISOString().split('T')[0];
    
    // Get closing balances
    const [balances] = await conn.query(
      `SELECT warehouse_id, material_id, balance_qty, balance_value, uom,
              transaction_date, MAX(id) as ledger_id
       FROM stock_ledger
       WHERE transaction_date <= ?
         AND warehouse_id IS NOT NULL AND material_id IS NOT NULL
       GROUP BY warehouse_id, material_id, balance_qty, balance_value, uom, transaction_date
       HAVING balance_qty > 0 OR balance_value > 0
       ORDER BY warehouse_id, material_id`,
      [to_date]
    );
    
    let createdCount = 0;
    const results = [];
    
    for (const balance of balances) {
      const avgUnitCost = balance.balance_qty > 0 
        ? Number((balance.balance_value / balance.balance_qty).toFixed(4))
        : 0;
      
      const warehouseId = balance.warehouse_id;
      const materialId = balance.material_id;
      const qty = Number(balance.balance_qty.toFixed(3));
      const value = Number(balance.balance_value.toFixed(2));
      const uom = balance.uom || 'KG';
      
      // Create stock opening entry
      const entryNo = `OPN-${nextPeriodStart.getFullYear()}-${String(nextPeriodStart.getMonth() + 1).padStart(2, '0')}-${String(createdCount + 1).padStart(5, '0')}`;
      
      const [result] = await conn.query(
        `INSERT INTO stock_opening_entries
         (entry_no, entry_date, opening_date, financial_year, warehouse_id,
          reference_no, costing_method, remarks, total_amount, status, created_by)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        [
          entryNo,
          nextPeriodStartStr,
          nextPeriodStartStr,
          `${nextPeriodStart.getFullYear()}-${String(nextPeriodStart.getMonth() + 1).padStart(2, '0')}`,
          warehouseId,
          `Monthly Batch Process - ${from_date} to ${to_date}`,
          'Average Cost',
          `Auto-generated from monthly batch process`,
          value,
          'Posted',
          req.user?.id || null,
        ]
      );
      
      const entryId = result.insertId;
      
      // Create stock opening item
      await conn.query(
        `INSERT INTO stock_opening_items
         (entry_id, material_id, uom, quantity, unit_cost, amount, batch_no, expiry_date)
         VALUES (?,?,?,?,?,?,?,?)`,
        [
          entryId,
          materialId,
          uom,
          qty,
          avgUnitCost,
          value,
          null,
          null,
        ]
      );
      
      // Add to stock ledger
      await addLedgerEntry(conn, {
        transaction_date: nextPeriodStartStr,
        transaction_type: 'Opening',
        reference_type: 'stock_opening',
        reference_id: entryId,
        reference_no: entryNo,
        warehouse_id: warehouseId,
        material_id: materialId,
        uom: uom,
        batch_no: null,
        expiry_date: null,
        in_qty: qty,
        out_qty: 0,
        unit_cost: avgUnitCost,
        amount: value,
        opening_qty: qty,
        opening_value: value,
        balance_qty: qty,
        balance_value: value,
        remarks: `Opening stock from monthly batch process (${from_date} to ${to_date})`,
        created_by: req.user?.id || null,
      });
      
      // Rebuild valuation for this (warehouse, material) pair
      await rebuildAndReprice(conn, warehouseId, materialId);
      
      createdCount++;
      results.push({
        entry_id: entryId,
        entry_no: entryNo,
        warehouse_id: warehouseId,
        material_id: materialId,
        opening_qty: qty,
        opening_value: value,
        avg_unit_cost: avgUnitCost,
      });
    }
    
    await conn.commit();
    
    res.json({
      success: true,
      message: `Created ${createdCount} opening stock entries for next period starting ${nextPeriodStartStr}`,
      data: {
        from_date,
        to_date,
        next_period_start: nextPeriodStartStr,
        created_count: createdCount,
        results,
      },
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

/**
 * Execute the complete monthly batch process in sequence
 */
export async function executeMonthlyBatchProcess(req, res, next) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    
    const { from_date, to_date } = getDateRangeFromRequest(req);
    const results = {};
    
    // Step 1: Calculate average rates
    results.step1 = await calculateAverageRatesInternal(conn, from_date, to_date);
    
    // Step 2: Archive transactions
    results.step2 = await archiveTransactionsInternal(conn, from_date, to_date);
    
    // Step 3: Archive closing balance
    results.step3 = await archiveClosingBalanceInternal(conn, from_date, to_date);
    
    // Step 4: Create opening stocks
    results.step4 = await createOpeningStocksInternal(conn, from_date, to_date, req.user?.id || null);
    
    await conn.commit();
    
    res.json({
      success: true,
      message: 'Monthly batch process completed successfully',
      data: {
        from_date,
        to_date,
        results,
      },
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

// Internal versions for transactional execution
async function calculateAverageRatesInternal(conn, from_date, to_date) {
  const [pairs] = await conn.query(
    `SELECT DISTINCT warehouse_id, material_id
     FROM stock_ledger
     WHERE transaction_date BETWEEN ? AND ?
       AND warehouse_id IS NOT NULL AND material_id IS NOT NULL`,
    [from_date, to_date]
  );
  
  let processedCount = 0;
  
  for (const pair of pairs) {
    const warehouseId = pair.warehouse_id;
    const materialId = pair.material_id;
    
    const [entries] = await conn.query(
      `SELECT id, in_qty, out_qty, unit_cost, in_value, out_value, transaction_type
       FROM stock_ledger
       WHERE warehouse_id = ? AND material_id = ?
         AND transaction_date BETWEEN ? AND ?
       ORDER BY transaction_date ASC, id ASC`,
      [warehouseId, materialId, from_date, to_date]
    );
    
    if (entries.length === 0) continue;
    
    await rebuildStockValuation(conn, warehouseId, materialId);
    processedCount += entries.length;
  }
  
  return { processed_count: processedCount, message: `Average rates calculated for ${processedCount} entries` };
}

async function archiveTransactionsInternal(conn, from_date, to_date) {
  const [entries] = await conn.query(
    `SELECT * FROM stock_ledger
     WHERE transaction_date BETWEEN ? AND ?`,
    [from_date, to_date]
  );
  
  let archivedCount = 0;
  
  const [tables] = await conn.query(`SHOW TABLES LIKE 'stock_ledger_archive'`);
  const archiveTableExists = tables && tables.length > 0;
  
  if (!archiveTableExists) {
    await conn.query(`CREATE TABLE stock_ledger_archive LIKE stock_ledger`);
    await conn.query(`ALTER TABLE stock_ledger_archive ADD COLUMN archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
  }
  
  for (const entry of entries) {
    // Insert into archive table
    const columns = [
      'transaction_date', 'transaction_type', 'reference_type', 'reference_id', 'reference_no',
      'warehouse_id', 'material_id', 'uom', 'batch_no', 'expiry_date',
      'in_qty', 'in_value', 'out_qty', 'out_value', 'unit_cost', 'amount',
      'opening_qty', 'opening_value', 'balance_qty', 'balance_value',
      'remarks', 'created_by', 'created_at', 'updated_at', 'archived_at'
    ];
    
    const values = [
      entry.transaction_date, entry.transaction_type, entry.reference_type,
      entry.reference_id, entry.reference_no,
      entry.warehouse_id, entry.material_id, entry.uom, entry.batch_no, entry.expiry_date,
      entry.in_qty, entry.in_value, entry.out_qty, entry.out_value,
      entry.unit_cost, entry.amount,
      entry.opening_qty, entry.opening_value, entry.balance_qty, entry.balance_value,
      entry.remarks, entry.created_by, entry.created_at, entry.updated_at, new Date(),
    ];
    
    await conn.query(
      `INSERT INTO stock_ledger_archive (${columns.map(c => c).join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
      values
    );
    archivedCount++;
  }
  
  return { archived_count: archivedCount, message: `Archived ${archivedCount} transactions` };
}

async function archiveClosingBalanceInternal(conn, from_date, to_date) {
  const [balances] = await conn.query(
    `SELECT warehouse_id, material_id, MAX(balance_qty) as balance_qty, 
            MAX(balance_value) as balance_value, uom
     FROM stock_ledger
     WHERE transaction_date <= ?
       AND warehouse_id IS NOT NULL AND material_id IS NOT NULL
     GROUP BY warehouse_id, material_id, uom`,
    [to_date]
  );
  
  const [tables] = await conn.query(`SHOW TABLES LIKE 'stock_closing_balance'`);
  const closingTableExists = tables && tables.length > 0;
  
  if (!closingTableExists) {
    await conn.query(
      `CREATE TABLE IF NOT EXISTS stock_closing_balance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        warehouse_id INT NOT NULL,
        material_id INT NOT NULL,
        closing_date DATE NOT NULL,
        financial_year VARCHAR(50),
        closing_qty DECIMAL(14,3) NOT NULL DEFAULT 0,
        closing_value DECIMAL(16,2) NOT NULL DEFAULT 0,
        avg_unit_cost DECIMAL(12,4) NOT NULL DEFAULT 0,
        uom VARCHAR(20),
        reference_type VARCHAR(50) DEFAULT 'monthly_batch',
        reference_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_wm_date (warehouse_id, material_id, closing_date),
        INDEX idx_date (closing_date)
      )`
    );
  }
  
  let archivedCount = 0;
  const closingDate = to_date;
  const financialYear = `${new Date(closingDate).getFullYear()}-${String(new Date(closingDate).getMonth() + 1).padStart(2, '0')}`;
  
  for (const balance of balances) {
    const avgUnitCost = balance.balance_qty > 0 
      ? Number((balance.balance_value / balance.balance_qty).toFixed(4))
      : 0;
    
    const [existing] = await conn.query(
      `SELECT id FROM stock_closing_balance
       WHERE warehouse_id = ? AND material_id = ? AND closing_date = ? AND reference_type = 'monthly_batch'`,
      [balance.warehouse_id, balance.material_id, closingDate]
    );
    
    const qty = Number(balance.balance_qty.toFixed(3));
    const value = Number(balance.balance_value.toFixed(2));
    
    if (existing && existing.length > 0) {
      await conn.query(
        `UPDATE stock_closing_balance
         SET closing_qty = ?, closing_value = ?, avg_unit_cost = ?, uom = ?,
             financial_year = ?, created_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [qty, value, avgUnitCost, balance.uom || null, financialYear, existing[0].id]
      );
    } else {
      await conn.query(
        `INSERT INTO stock_closing_balance
         (warehouse_id, material_id, closing_date, closing_qty, closing_value,
          avg_unit_cost, uom, financial_year, reference_type)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        [
          balance.warehouse_id,
          balance.material_id,
          closingDate,
          qty,
          value,
          avgUnitCost,
          balance.uom || null,
          financialYear,
          'monthly_batch',
        ]
      );
    }
    archivedCount++;
  }
  
  return { archived_count: archivedCount, message: `Archived closing balance for ${archivedCount} pairs` };
}

async function createOpeningStocksInternal(conn, from_date, to_date, userId) {
  const nextPeriodStart = new Date(to_date);
  nextPeriodStart.setDate(nextPeriodStart.getDate() + 1);
  const nextPeriodStartStr = nextPeriodStart.toISOString().split('T')[0];
  
  const [balances] = await conn.query(
    `SELECT warehouse_id, material_id, balance_qty, balance_value, uom
     FROM stock_ledger
     WHERE transaction_date <= ?
       AND warehouse_id IS NOT NULL AND material_id IS NOT NULL
     GROUP BY warehouse_id, material_id, balance_qty, balance_value, uom
     HAVING balance_qty > 0 OR balance_value > 0
     ORDER BY warehouse_id, material_id`,
    [to_date]
  );
  
  let createdCount = 0;
  
  for (const balance of balances) {
    const avgUnitCost = balance.balance_qty > 0 
      ? Number((balance.balance_value / balance.balance_qty).toFixed(4))
      : 0;
    
    const warehouseId = balance.warehouse_id;
    const materialId = balance.material_id;
    const qty = Number(balance.balance_qty.toFixed(3));
    const value = Number(balance.balance_value.toFixed(2));
    const uom = balance.uom || 'KG';
    
    const financialYear = `${nextPeriodStart.getFullYear()}-${String(nextPeriodStart.getMonth() + 1).padStart(2, '0')}`;
    const entryNo = `OPN-${nextPeriodStart.getFullYear()}-${String(nextPeriodStart.getMonth() + 1).padStart(2, '0')}-${String(createdCount + 1).padStart(5, '0')}`;
    
    const [result] = await conn.query(
      `INSERT INTO stock_opening_entries
       (entry_no, entry_date, opening_date, financial_year, warehouse_id,
        reference_no, costing_method, remarks, total_amount, status, created_by)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [
        entryNo,
        nextPeriodStartStr,
        nextPeriodStartStr,
        financialYear,
        warehouseId,
        `Monthly Batch Process - ${from_date} to ${to_date}`,
        'Average Cost',
        `Auto-generated from monthly batch process`,
        value,
        'Posted',
        userId,
      ]
    );
    
    const entryId = result.insertId;
    
    await conn.query(
      `INSERT INTO stock_opening_items
       (entry_id, material_id, uom, quantity, unit_cost, amount, batch_no, expiry_date)
       VALUES (?,?,?,?,?,?,?,?)`,
      [entryId, materialId, uom, qty, avgUnitCost, value, null, null]
    );
    
    await addLedgerEntry(conn, {
      transaction_date: nextPeriodStartStr,
      transaction_type: 'Opening',
      reference_type: 'stock_opening',
      reference_id: entryId,
      reference_no: entryNo,
      warehouse_id: warehouseId,
      material_id: materialId,
      uom: uom,
      batch_no: null,
      expiry_date: null,
      in_qty: qty,
      out_qty: 0,
      unit_cost: avgUnitCost,
      amount: value,
      opening_qty: qty,
      opening_value: value,
      balance_qty: qty,
      balance_value: value,
      remarks: `Opening stock from monthly batch process (${from_date} to ${to_date})`,
      created_by: userId,
    });
    
    await rebuildAndReprice(conn, warehouseId, materialId);
    createdCount++;
  }
  
  return { created_count: createdCount, message: `Created ${createdCount} opening stock entries` };
}
