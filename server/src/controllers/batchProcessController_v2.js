import pool from '../config/db.js';
import { rebuildStockValuation, rebuildAndReprice, addLedgerEntry } from '../models/stockLedgerModel.js';

/**
 * helper to get first and last date of previous month
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
 * helper to get date range from request body or default to previous month
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
      
      // Add archived_at column
      await conn.query(
        `ALTER TABLE ${tableInfo.archiveName} ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
      );
      
      // Add financial_year column if needed
      await conn.query(
        `ALTER TABLE ${tableInfo.archiveName} ADD COLUMN IF NOT EXISTS financial_year VARCHAR(20)`
      );
      
      console.log(`Created archive table: ${tableInfo.archiveName}`);
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
          console.log(`Created archive table: ${childTable.archiveName}`);
        }
      }
    }
  }
}

/**
 * Archive ALL transactions for the date range by moving them to duplicate archive tables
 */
export async function archiveAllTransactions(req, res, next) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    
    const { from_date, to_date } = getDateRangeFromRequest(req);
    const financialYear = `${new Date(from_date).getFullYear()}-${String(new Date(from_date).getMonth() + 1).padStart(2, '0')}`;
    
    // Ensure all archive tables exist
    await ensureArchiveTables(conn);
    
    let totalArchived = 0;
    const results = {};
    
    // Process each table in order
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
        console.log(`No records in ${tableInfo.name} for date range ${from_date} to ${to_date}`);
        continue;
      }
      
      const ids = records.map(r => r[tableInfo.idColumn]);
      const idList = ids.join(',');
      
      // Copy to archive table
      const [archiveResult] = await conn.query(
        `INSERT INTO ${tableInfo.archiveName} 
         SELECT *, ? AS archived_at, ? AS financial_year FROM ${tableInfo.name} 
         WHERE ${tableInfo.idColumn} IN (${idList})`,
        [new Date(), financialYear]
      );
      
      // Delete from main table
      const [deleteResult] = await conn.query(
        `DELETE FROM ${tableInfo.name} WHERE ${tableInfo.idColumn} IN (${idList})`
      );
      
      results[tableInfo.name] = {
        archived_count: archiveResult.affectedRows,
        deleted_count: deleteResult.affectedRows,
      };
      
      totalArchived += archiveResult.affectedRows;
      
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
            
            // Copy to archive
            await conn.query(
              `INSERT INTO ${childTable.archiveName} 
               SELECT *, ? AS archived_at, ${tableInfo.idColumn} AS original_id 
               FROM ${childTable.name} WHERE ${childTable.idColumn} IN (${childIdList})`,
              [new Date()]
            );
            
            // Delete from main
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
    
    await conn.commit();
    
    res.json({
      success: true,
      message: `Archived ${totalArchived} total records across all transaction tables from ${from_date} to ${to_date}`,
      data: {
        from_date,
        to_date,
        financial_year: financialYear,
        total_archived: totalArchived,
        results,
      },
    });
  } catch (err) {
    await conn.rollback();
    console.error('Error in archiveAllTransactions:', err);
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
    const financialYear = `${new Date(to_date).getFullYear()}-${String(new Date(to_date).getMonth() + 1).padStart(2, '0')}`;
    
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
          INDEX idx_date (closing_date),
          INDEX idx_reference (reference_type, reference_id)
        )`
      );
    }
    
    // Get closing balances for all (warehouse, material) pairs as of the end of the period
    // We need to get this from the stock_ledger_archive since we just archived the current ledger
    const [balances] = await conn.query(
      `SELECT warehouse_id, material_id, MAX(balance_qty) as balance_qty, 
              MAX(balance_value) as balance_value, uom
       FROM stock_ledger_archive
       WHERE transaction_date <= ?
         AND warehouse_id IS NOT NULL AND material_id IS NOT NULL
         AND archived_at >= ?  -- Only from the recently archived batch
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
      
      // Check if closing balance already exists
      const [existing] = await conn.query(
        `SELECT id FROM stock_closing_balance
         WHERE warehouse_id = ? AND material_id = ? AND closing_date = ? AND reference_type = 'monthly_batch'`,
        [balance.warehouse_id, balance.material_id, to_date]
      );
      
      if (existing && existing.length > 0) {
        // Update existing
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
        // Insert new
        await conn.query(
          `INSERT INTO stock_closing_balance
           (warehouse_id, material_id, closing_date, closing_qty, closing_value,
            avg_unit_cost, uom, financial_year, reference_type)
           VALUES (?,?,?,?,?,?,?,?,?,?)`,
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
    
    await conn.commit();
    
    res.json({
      success: true,
      message: `Archived closing balance for ${archivedCount} (warehouse, material) pairs as of ${to_date}`,
      data: {
        from_date,
        to_date,
        financial_year: financialYear,
        archived_count: archivedCount,
      },
    });
  } catch (err) {
    await conn.rollback();
    console.error('Error in archiveClosingBalance:', err);
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
    const financialYear = `${nextPeriodStart.getFullYear()}-${String(nextPeriodStart.getMonth() + 1).padStart(2, '0')}`;
    
    // Get closing balances from stock_closing_balance table
    const [balances] = await conn.query(
      `SELECT warehouse_id, material_id, closing_qty, closing_value, avg_unit_cost, uom
       FROM stock_closing_balance
       WHERE closing_date = ? AND reference_type = 'monthly_batch'
         AND (closing_qty > 0 OR closing_value > 0)
       ORDER BY warehouse_id, material_id`,
      [to_date]
    );
    
    let createdCount = 0;
    const results = [];
    
    for (const balance of balances) {
      const warehouseId = balance.warehouse_id;
      const materialId = balance.material_id;
      const qty = _n(balance.closing_qty);
      const value = _n(balance.closing_value);
      const avgUnitCost = _n(balance.avg_unit_cost);
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
          financialYear,
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
        financial_year: financialYear,
        created_count: createdCount,
        results,
      },
    });
  } catch (err) {
    await conn.rollback();
    console.error('Error in createOpeningStocks:', err);
    next(err);
  } finally {
    conn.release();
  }
}

/**
 * Calculate average rates for stock ledger entries within a date range.
 * This uses the existing rebuildStockValuation function which correctly implements
 * the average rate formula: unit_cost = (opening_value + in_value) / (opening_qty + in_qty)
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
 * Execute the complete monthly batch process in sequence
 */
export async function executeMonthlyBatchProcess(req, res, next) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    
    const { from_date, to_date } = getDateRangeFromRequest(req);
    const financialYear = `${new Date(from_date).getFullYear()}-${String(new Date(from_date).getMonth() + 1).padStart(2, '0')}`;
    
    const results = {};
    
    // Step 1: Calculate average rates
    const step1Result = await calculateAverageRatesInternal(conn, from_date, to_date);
    results.step1 = step1Result;
    
    // Step 2: Archive ALL transactions (move to duplicate tables)
    const step2Result = await archiveAllTransactionsInternal(conn, from_date, to_date, financialYear);
    results.step2 = step2Result;
    
    // Step 3: Archive closing balance
    const step3Result = await archiveClosingBalanceInternal(conn, from_date, to_date, financialYear);
    results.step3 = step3Result;
    
    // Step 4: Create opening stocks
    const step4Result = await createOpeningStocksInternal(conn, from_date, to_date, financialYear, req.user?.id || null);
    results.step4 = step4Result;
    
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

async function archiveAllTransactionsInternal(conn, from_date, to_date, financialYear) {
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
    
    // Delete from main table
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
          
          // Delete from main
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

async function archiveClosingBalanceInternal(conn, from_date, to_date, financialYear) {
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
  
  // Get closing balances from stock_ledger_archive (since we just archived current ledger)
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
         VALUES (?,?,?,?,?,?,?,?,?,?)`,
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

async function createOpeningStocksInternal(conn, from_date, to_date, financialYear, userId) {
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
