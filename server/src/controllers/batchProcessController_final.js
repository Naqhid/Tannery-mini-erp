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
  
  const firstDay = new Date(prevYear, prevMonth, 1);
  const lastDay = new Date(prevYear, prevMonth + 1, 0);
  
  return {
    from_date: firstDay.toISOString().split('T')[0],
    to_date: lastDay.toISOString().split('T')[0],
  };
}

/**
 * Helper to get date range from request body or default to previous month
 */
function getDateRangeFromRequest(req) {
  const { from_date, to_date } = req.body;
  
  if (from_date && to_date) {
    return { from_date, to_date };
  }
  
  return getPreviousMonthDateRange();
}

const _n = (v) => Number(v) || 0;

/**
 * List of all transaction tables that need to be archived
 */
const TRANSACTION_TABLES = {
  stock_ledger: {
    name: 'stock_ledger',
    archiveName: 'stock_ledger_archive',
    dateColumn: 'transaction_date',
    idColumn: 'id',
  },
  material_receipts: {
    name: 'material_receipts',
    archiveName: 'material_receipts_archive',
    dateColumn: 'receipt_date',
    idColumn: 'id',
    childTables: [
      {
        name: 'material_receipt_items',
        archiveName: 'material_receipt_items_archive',
        parentIdColumn: 'receipt_id',
        idColumn: 'id',
      }
    ]
  },
  material_issues: {
    name: 'material_issues',
    archiveName: 'material_issues_archive',
    dateColumn: 'issue_date',
    idColumn: 'id',
    childTables: [
      {
        name: 'material_issue_items',
        archiveName: 'material_issue_items_archive',
        parentIdColumn: 'issue_id',
        idColumn: 'id',
      }
    ]
  },
  stock_transfers: {
    name: 'stock_transfers',
    archiveName: 'stock_transfers_archive',
    dateColumn: 'transfer_date',
    idColumn: 'id',
    childTables: [
      {
        name: 'stock_transfer_items',
        archiveName: 'stock_transfer_items_archive',
        parentIdColumn: 'transfer_id',
        idColumn: 'id',
      }
    ]
  },
  outbound_deliveries: {
    name: 'outbound_deliveries',
    archiveName: 'outbound_deliveries_archive',
    dateColumn: 'delivery_date',
    idColumn: 'id',
    childTables: [
      {
        name: 'outbound_delivery_items',
        archiveName: 'outbound_delivery_items_archive',
        parentIdColumn: 'delivery_id',
        idColumn: 'id',
      }
    ]
  },
  physical_stock_entries: {
    name: 'physical_stock_entries',
    archiveName: 'physical_stock_entries_archive',
    dateColumn: 'entry_date',
    idColumn: 'id',
    childTables: [
      {
        name: 'physical_stock_items',
        archiveName: 'physical_stock_items_archive',
        parentIdColumn: 'entry_id',
        idColumn: 'id',
      }
    ]
  },
};

/**
 * Ensure batch process config table exists
 */
async function ensureBatchConfigTable(conn) {
  const [tables] = await conn.query(
    `SHOW TABLES LIKE 'batch_process_config'`
  );
  
  if (tables.length === 0) {
    await conn.query(
      `CREATE TABLE batch_process_config (
        id INT AUTO_INCREMENT PRIMARY KEY,
        config_key VARCHAR(100) NOT NULL UNIQUE,
        config_value TEXT,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        updated_by INT DEFAULT NULL,
        INDEX idx_key (config_key)
      )`
    );
    
    // Initialize with default values
    await conn.query(
      `INSERT INTO batch_process_config (config_key, config_value) 
       VALUES ('last_execution_date', NULL), ('last_execution_month', NULL), ('lock_execution', '0')
       ON DUPLICATE KEY UPDATE config_value = VALUES(config_value)`
    );
  }
}

/**
 * Check if batch process has already been executed for the period
 */
async function checkAlreadyExecuted(conn, from_date, to_date) {
  await ensureBatchConfigTable(conn);
  
  const [config] = await conn.query(
    `SELECT config_value FROM batch_process_config WHERE config_key = 'last_execution_month'`
  );
  
  const lastExecutedMonth = config[0]?.config_value;
  
  if (lastExecutedMonth) {
    const lastMonth = new Date(lastExecutedMonth);
    const currentMonth = new Date(from_date);
    
    // Check if this is the same month
    if (lastMonth.getFullYear() === currentMonth.getFullYear() &&
        lastMonth.getMonth() === currentMonth.getMonth()) {
      return { alreadyExecuted: true, lastExecuted: lastExecutedMonth };
    }
  }
  
  return { alreadyExecuted: false, lastExecuted: null };
}

/**
 * Record that batch process has been executed
 */
async function recordExecution(conn, from_date, to_date, userId) {
  await ensureBatchConfigTable(conn);
  
  const executionDate = new Date().toISOString().split('T')[0];
  const executionMonth = `${new Date(from_date).getFullYear()}-${String(new Date(from_date).getMonth() + 1).padStart(2, '0')}`;
  
  await conn.query(
    `INSERT INTO batch_process_config (config_key, config_value, updated_by) 
     VALUES ('last_execution_date', ?, ?), ('last_execution_month', ?, ?), ('lock_execution', '1', ?)
     ON DUPLICATE KEY UPDATE config_value = VALUES(config_value), updated_by = VALUES(updated_by)`,
    [executionDate, userId, executionMonth, userId, userId]
  );
}

/**
 * Get last execution info
 */
export async function getLastExecution(req, res, next) {
  const conn = await pool.getConnection();
  try {
    await ensureBatchConfigTable(conn);
    
    const [lastDate] = await conn.query(
      `SELECT config_value FROM batch_process_config WHERE config_key = 'last_execution_date'`
    );
    
    const [lastMonth] = await conn.query(
      `SELECT config_value FROM batch_process_config WHERE config_key = 'last_execution_month'`
    );
    
    res.json({
      success: true,
      data: {
        last_execution_date: lastDate[0]?.config_value || null,
        last_execution_month: lastMonth[0]?.config_value || null,
      },
    });
  } catch (err) {
    next(err);
  } finally {
    conn.release();
  }
}

/**
 * Update material master from stock ledger
 * For each material, get the last entry's balance_qty, balance_value, unit_cost
 * and update materials table: opening_stock, opening_stock_value, rate
 */
async function updateMaterialMasterFromLedger(conn, to_date, financialYear = null, userId = null) {
  // Get the last entry for each material from stock_ledger_archive as of to_date
  const [lastEntries] = await conn.query(
    `SELECT 
       sl.material_id,
       m.id as material_id,
       sl.balance_qty,
       sl.balance_value,
       CASE WHEN sl.balance_qty > 0 THEN sl.balance_value / sl.balance_qty ELSE 0 END as unit_cost,
       sl.uom
     FROM stock_ledger_archive sl
     JOIN (
       SELECT material_id, MAX(transaction_date) as max_date
       FROM stock_ledger_archive
       WHERE transaction_date <= ?
         AND material_id IS NOT NULL
       GROUP BY material_id
     ) latest ON sl.material_id = latest.material_id AND sl.transaction_date = latest.max_date
     JOIN materials m ON sl.material_id = m.id
     WHERE sl.transaction_date <= ?
       AND sl.material_id IS NOT NULL
     ORDER BY sl.material_id`,
    [to_date, to_date]
  );
  
  let updatedCount = 0;
  
  for (const entry of lastEntries) {
    const materialId = entry.material_id;
    const balanceQty = _n(entry.balance_qty);
    const balanceValue = _n(entry.balance_value);
    const unitCost = _n(entry.unit_cost);
    const uom = entry.uom || 'KG';
    
    // Update materials table with closing balance info
    await conn.query(
      `UPDATE materials SET 
         opening_stock = ?,
         opening_stock_value = ?,
         rate = ?,
         opening_stock_uom = ?,
         closing_balance_date = ?,
         closing_balance_financial_year = ?,
         closing_balance_updated_by = ?,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        Number(balanceQty.toFixed(3)),
        Number(balanceValue.toFixed(2)),
        Number(unitCost.toFixed(6)),
        uom,
        to_date,
        financialYear,
        userId,
        materialId,
      ]
    );
    
    updatedCount++;
  }
  
  return { updated_count: updatedCount, message: `Updated ${updatedCount} materials from stock ledger` };
}

/**
 * Ensure archive tables exist
 */
async function ensureArchiveTables(conn) {
  for (const tableName in TRANSACTION_TABLES) {
    const tableInfo = TRANSACTION_TABLES[tableName];
    
    // Check if main table exists
    const [mainTables] = await conn.query(
      `SHOW TABLES LIKE ?`,
      [tableInfo.name]
    );
    
    if (mainTables.length === 0) {
      console.log(`Main table ${tableInfo.name} does not exist, skipping`);
      continue;
    }
    
    // Check if archive table exists, create if not
    const [archiveTables] = await conn.query(
      `SHOW TABLES LIKE ?`,
      [tableInfo.archiveName]
    );
    
    if (archiveTables.length === 0) {
      await conn.query(
        `CREATE TABLE ${tableInfo.archiveName} LIKE ${tableInfo.name}`
      );
      
      await conn.query(
        `ALTER TABLE ${tableInfo.archiveName} ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
      );
      await conn.query(
        `ALTER TABLE ${tableInfo.archiveName} ADD COLUMN IF NOT EXISTS financial_year VARCHAR(20)`
      );
    }
    
    // Handle child tables
    if (tableInfo.childTables) {
      for (const childTable of tableInfo.childTables) {
        const [childArchiveTables] = await conn.query(
          `SHOW TABLES LIKE ?`,
          [childTable.archiveName]
        );
        
        if (childArchiveTables.length === 0) {
          await conn.query(
            `CREATE TABLE ${childTable.archiveName} LIKE ${childTable.name}`
          );
          await conn.query(
            `ALTER TABLE ${childTable.archiveName} ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
          );
          await conn.query(
            `ALTER TABLE ${childTable.archiveName} ADD COLUMN IF NOT EXISTS original_id INT`
          );
        }
      }
    }
  }
}

/**
 * Archive ALL transactions for the date range by moving them to duplicate archive tables
 */
async function archiveAllTransactions(conn, from_date, to_date, financialYear) {
  const results = {};
  let totalArchived = 0;
  
  for (const tableName in TRANSACTION_TABLES) {
    const tableInfo = TRANSACTION_TABLES[tableName];
    
    // Check if main table exists
    const [mainTables] = await conn.query(
      `SHOW TABLES LIKE ?`,
      [tableInfo.name]
    );
    
    if (mainTables.length === 0) {
      console.log(`Table ${tableInfo.name} does not exist, skipping`);
      continue;
    }
    
    // Get IDs of records to archive
    const [records] = await conn.query(
      `SELECT ${tableInfo.idColumn} FROM ${tableInfo.name} 
       WHERE ${tableInfo.dateColumn} BETWEEN ? AND ?`,
      [from_date, to_date]
    );
    
    if (records.length === 0) {
      continue;
    }
    
    const ids = records.map(r => r[tableInfo.idColumn]);
    const idList = ids.join(',');
    
    // Ensure archive table exists
    const [archiveTables] = await conn.query(
      `SHOW TABLES LIKE ?`,
      [tableInfo.archiveName]
    );
    
    if (archiveTables.length === 0) {
      await conn.query(
        `CREATE TABLE ${tableInfo.archiveName} LIKE ${tableInfo.name}`
      );
      await conn.query(
        `ALTER TABLE ${tableInfo.archiveName} ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
      );
      await conn.query(
        `ALTER TABLE ${tableInfo.archiveName} ADD COLUMN IF NOT EXISTS financial_year VARCHAR(20)`
      );
    }
    
    // Copy to archive table
    await conn.query(
      `INSERT INTO ${tableInfo.archiveName} 
       SELECT *, ? AS archived_at, ? AS financial_year FROM ${tableInfo.name} 
       WHERE ${tableInfo.idColumn} IN (${idList})`,
      [new Date(), financialYear]
    );
    
    // DELETE from main table - THIS MOVES THE DATA
    await conn.query(
      `DELETE FROM ${tableInfo.name} WHERE ${tableInfo.idColumn} IN (${idList})`
    );
    
    results[tableInfo.name] = {
      archived_count: records.length,
      deleted_count: records.length,
    };
    
    totalArchived += records.length;
    
    // Handle child tables
    if (tableInfo.childTables) {
      for (const childTable of tableInfo.childTables) {
        const [childRecords] = await conn.query(
          `SELECT ${childTable.idColumn} FROM ${childTable.name} 
           WHERE ${childTable.parentIdColumn} IN (${idList})`
        );
        
        if (childRecords.length > 0) {
          const childIds = childRecords.map(r => r[childTable.idColumn]);
          const childIdList = childIds.join(',');
          
          // Ensure child archive table exists
          const [childArchiveTables] = await conn.query(
            `SHOW TABLES LIKE ?`,
            [childTable.archiveName]
          );
          
          if (childArchiveTables.length === 0) {
            await conn.query(
              `CREATE TABLE ${childTable.archiveName} LIKE ${childTable.name}`
            );
            await conn.query(
              `ALTER TABLE ${childTable.archiveName} ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
            );
            await conn.query(
              `ALTER TABLE ${childTable.archiveName} ADD COLUMN IF NOT EXISTS original_id INT`
            );
          }
          
          // Copy to archive
          await conn.query(
            `INSERT INTO ${childTable.archiveName} 
             SELECT *, ? AS archived_at, ${childTable.parentIdColumn} AS original_id 
             FROM ${childTable.name} WHERE ${childTable.idColumn} IN (${childIdList})`,
            [new Date()]
          );
          
          // DELETE from main - THIS MOVES THE DATA
          await conn.query(
            `DELETE FROM ${childTable.name} WHERE ${childTable.idColumn} IN (${childIdList})`
          );
          
          results[childTable.name] = {
            archived_count: childRecords.length,
            deleted_count: childRecords.length,
          };
          
          totalArchived += childRecords.length;
        }
      }
    }
  }
  
  return { total_archived: totalArchived, message: `Archived ${totalArchived} records`, results };
}

/**
 * Archive closing balance for each (warehouse, material) pair
 */
async function archiveClosingBalance(conn, from_date, to_date, financialYear) {
  // Ensure stock_closing_balance table exists
  const [tables] = await conn.query(
    `SHOW TABLES LIKE 'stock_closing_balance'`
  );
  
  if (tables.length === 0) {
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
  
  // Get closing balances from stock_ledger_archive
  const [balances] = await conn.query(
    `SELECT warehouse_id, material_id, MAX(balance_qty) as balance_qty, 
            MAX(balance_value) as balance_value, uom
     FROM stock_ledger_archive
     WHERE transaction_date <= ?
       AND warehouse_id IS NOT NULL AND material_id IS NOT NULL
       AND archived_at >= ?
     GROUP BY warehouse_id, material_id, uom`,
    [to_date, from_date]
  );
  
  let archivedCount = 0;
  
  for (const balance of balances) {
    const avgUnitCost = balance.balance_qty > 0 
      ? _n(balance.balance_value) / _n(balance.balance_qty)
      : 0;
    
    const qty = _n(balance.balance_qty);
    const value = _n(balance.balance_value);
    
    const [existing] = await conn.query(
      `SELECT id FROM stock_closing_balance
       WHERE warehouse_id = ? AND material_id = ? AND closing_date = ? AND reference_type = 'monthly_batch'`,
      [balance.warehouse_id, balance.material_id, to_date]
    );
    
    if (existing && existing.length > 0) {
      await conn.query(
        `UPDATE stock_closing_balance
         SET closing_qty = ?, closing_value = ?, avg_unit_cost = ?, uom = ?,
             financial_year = ?, created_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          Number(qty.toFixed(3)),
          Number(value.toFixed(2)),
          Number(avgUnitCost.toFixed(4)),
          balance.uom || null,
          financialYear,
          existing[0].id,
        ]
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
          to_date,
          Number(qty.toFixed(3)),
          Number(value.toFixed(2)),
          Number(avgUnitCost.toFixed(4)),
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

/**
 * Create opening stocks for the next period based on closing balances
 */
async function createOpeningStocks(conn, from_date, to_date, financialYear, userId) {
  const nextPeriodStart = new Date(to_date);
  nextPeriodStart.setDate(nextPeriodStart.getDate() + 1);
  const nextPeriodStartStr = nextPeriodStart.toISOString().split('T')[0];
  
  // Get closing balances
  const [balances] = await conn.query(
    `SELECT warehouse_id, material_id, closing_qty, closing_value, avg_unit_cost, uom
     FROM stock_closing_balance
     WHERE closing_date = ? AND reference_type = 'monthly_batch'
       AND (closing_qty > 0 OR closing_value > 0)
     ORDER BY warehouse_id, material_id`,
    [to_date]
  );
  
  let createdCount = 0;
  
  for (const balance of balances) {
    const warehouseId = balance.warehouse_id;
    const materialId = balance.material_id;
    const qty = _n(balance.closing_qty);
    const value = _n(balance.closing_value);
    const avgUnitCost = _n(balance.avg_unit_cost);
    const uom = balance.uom || 'KG';
    
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

/**
 * Calculate average rates for stock ledger entries within a date range
 */
export async function calculateAverageRates(req, res, next) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    
    const { from_date, to_date } = getDateRangeFromRequest(req);
    
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
      await rebuildStockValuation(conn, pair.warehouse_id, pair.material_id);
      
      const [entries] = await conn.query(
        `SELECT id, warehouse_id, material_id, transaction_date,
                opening_qty, opening_value, in_qty, in_value,
                out_qty, out_value, unit_cost, balance_qty, balance_value
         FROM stock_ledger
         WHERE warehouse_id = ? AND material_id = ?
           AND transaction_date BETWEEN ? AND ?
         ORDER BY transaction_date ASC, id ASC`,
        [pair.warehouse_id, pair.material_id, from_date, to_date]
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
 * Execute the complete monthly batch process
 */
export async function executeMonthlyBatchProcess(req, res, next) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    
    const { from_date, to_date } = getDateRangeFromRequest(req);
    const userId = req.user?.id || null;
    const financialYear = `${new Date(from_date).getFullYear()}-${String(new Date(from_date).getMonth() + 1).padStart(2, '0')}`;
    
    // Check if already executed for this period
    const { alreadyExecuted, lastExecuted } = await checkAlreadyExecuted(conn, from_date, to_date);
    
    if (alreadyExecuted) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message: `Month end job already executed for ${lastExecuted}. Please select a different period.`,
        already_executed: true,
        last_execution_month: lastExecuted,
      });
    }
    
    const results = {};
    
    // Step 1: Calculate average rates
    const step1Result = await calculateAverageRatesInternal(conn, from_date, to_date);
    results.step1 = step1Result;
    
    // Step 2: Archive ALL transactions (MOVE data from current to archive tables)
    const step2Result = await archiveAllTransactions(conn, from_date, to_date, financialYear);
    results.step2 = step2Result;
    
    // Step 3: Archive closing balance
    const step3Result = await archiveClosingBalance(conn, from_date, to_date, financialYear);
    results.step3 = step3Result;
    
    // Step 4: Update material master from stock ledger
    const step4Result = await updateMaterialMasterFromLedger(conn, to_date, financialYear, userId);
    results.step4 = step4Result;
    
    // Step 5: Create opening stocks
    const step5Result = await createOpeningStocksInternal(conn, from_date, to_date, financialYear, userId);
    results.step5 = step5Result;
    
    // Step 6: Record execution
    await recordExecution(conn, from_date, to_date, userId);
    
    await conn.commit();
    
    res.json({
      success: true,
      message: 'Monthly batch process completed successfully',
      data: {
        from_date,
        to_date,
        financial_year: financialYear,
        results,
      },
    });
  } catch (err) {
    await conn.rollback();
    console.error('Error in executeMonthlyBatchProcess:', err);
    next(err);
  } finally {
    conn.release();
  }
}

/**
 * Get batch process status
 */
export async function getBatchProcessStatus(req, res, next) {
  const conn = await pool.getConnection();
  try {
    await ensureBatchConfigTable(conn);
    
    const [lastDate] = await conn.query(
      `SELECT config_value FROM batch_process_config WHERE config_key = 'last_execution_date'`
    );
    
    const [lastMonth] = await conn.query(
      `SELECT config_value FROM batch_process_config WHERE config_key = 'last_execution_month'`
    );
    
    const [lock] = await conn.query(
      `SELECT config_value FROM batch_process_config WHERE config_key = 'lock_execution'`
    );
    
    res.json({
      success: true,
      data: {
        last_execution_date: lastDate[0]?.config_value || null,
        last_execution_month: lastMonth[0]?.config_value || null,
        is_locked: lock[0]?.config_value === '1' || false,
      },
    });
  } catch (err) {
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
    await rebuildStockValuation(conn, pair.warehouse_id, pair.material_id);
    
    const [entries] = await conn.query(
      `SELECT id FROM stock_ledger 
       WHERE warehouse_id = ? AND material_id = ?
         AND transaction_date BETWEEN ? AND ?`,
      [pair.warehouse_id, pair.material_id, from_date, to_date]
    );
    
    processedCount += entries.length;
  }
  
  return { processed_count: processedCount, message: `Average rates calculated for ${processedCount} entries` };
}

async function createOpeningStocksInternal(conn, from_date, to_date, financialYear, userId) {
  const nextPeriodStart = new Date(to_date);
  nextPeriodStart.setDate(nextPeriodStart.getDate() + 1);
  const nextPeriodStartStr = nextPeriodStart.toISOString().split('T')[0];
  
  const [balances] = await conn.query(
    `SELECT warehouse_id, material_id, closing_qty, closing_value, avg_unit_cost, uom
     FROM stock_closing_balance
     WHERE closing_date = ? AND reference_type = 'monthly_batch'
       AND (closing_qty > 0 OR closing_value > 0)
     ORDER BY warehouse_id, material_id`,
    [to_date]
  );
  
  let createdCount = 0;
  
  for (const balance of balances) {
    const warehouseId = balance.warehouse_id;
    const materialId = balance.material_id;
    const qty = _n(balance.closing_qty);
    const value = _n(balance.closing_value);
    const avgUnitCost = _n(balance.avg_unit_cost);
    const uom = balance.uom || 'KG';
    
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

// Export all functions
export {
  getLastExecution,
  getBatchProcessStatus,
  executeMonthlyBatchProcess,
  calculateAverageRates,
  archiveAllTransactions,
  archiveClosingBalance,
  updateMaterialMasterFromLedger,
  createOpeningStocks,
};
