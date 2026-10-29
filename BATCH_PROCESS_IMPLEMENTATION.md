# Monthly Batch Process Implementation

## Overview

This implementation adds a complete Monthly Batch Process feature to the Tannery Mini ERP system. The batch process handles the monthly closing and opening stock processing, including calculating average rates, archiving transactions, and creating opening stocks for the next period.

## Formula Implemented

As requested, the system implements the following average rate calculation:

```
unit_cost = (opening_value + in_value) / (opening_qty + in_qty)
out_value = out_qty * unit_cost
balance_qty = opening_qty + in_qty - out_qty
balance_value = balance_qty * unit_cost
```

This calculation is applied for every line in the stock ledger based on the selected date range filter.

## Files Created/Modified

### 1. Backend - Controller
**File:** `/server/src/controllers/batchProcessController.js`

Contains all the batch process logic:
- `calculateAverageRates()` - Recalculates running averages for stock ledger entries
- `archiveTransactions()` - Archives historical transactions to stock_ledger_archive table
- `archiveClosingBalance()` - Saves closing balances to stock_closing_balance table
- `createOpeningStocks()` - Creates opening stock entries for the next period
- `executeMonthlyBatchProcess()` - Executes all steps in sequence
- Internal helper functions for transactional execution

**Key Features:**
- Uses the existing `rebuildStockValuation()` from stockLedgerModel.js which correctly implements the average rate formula
- Automatically defaults to previous month's date range if not specified
- Returns detailed results for each step
- Handles errors gracefully with rollback

### 2. Backend - Routes
**File:** `/server/src/routes/materialIssueRoutes.js` (modified)

Added the following endpoints:
- `POST /material-issues/batch-process/avg-rates` - Calculate average rates
- `POST /material-issues/batch-process/archive-transactions` - Archive transactions
- `POST /material-issues/batch-process/archive-closing` - Archive closing balances
- `POST /material-issues/batch-process/create-opening` - Create opening stocks
- `POST /material-issues/batch-process/execute` - Execute complete batch process

### 3. Frontend - UI
**File:** `/src/pages/MonthlyBatchProcess.tsx` (modified)

Enhanced the Monthly Batch Process page with:
- Date picker inputs for From Date and To Date
- "Use Previous Month" button to auto-fill previous month dates
- Real-time progress tracking for each step
- Detailed error and success messages
- Results summary showing counts for each step
- Improved visual feedback with status indicators

### 4. Database - Migration
**File:** `/server/sql/migrations/070_monthly_batch_process_tables.sql`

Creates necessary database tables:
- `stock_ledger_archive` - For archiving historical stock ledger entries
- `stock_closing_balance` - For storing monthly closing balances
- Adds `archived` column to `stock_ledger` table (optional)

## Date Range Filter

The batch process applies calculations based on a date range filter:
- **Default:** Previous month (first day to last day)
- **Custom:** Users can specify any date range
- **Filter:** All calculations are filtered from `from_date` to `to_date`

The date range is used to:
1. Identify which ledger entries to process
2. Filter transactions to archive
3. Determine closing balances as of the end date
4. Create opening stocks for the day after the end date

## Process Flow

### Step 1: Calculating the Average Rates
1. Gets all distinct (warehouse, material) pairs with transactions in the date range
2. For each pair, calls `rebuildStockValuation()` which:
   - Replays all ledger entries in date order
   - Calculates running balance (qty and value)
   - For inbound: uses entry's unit_cost to calculate in_value
   - For outbound: uses running average to price the outbound
   - Updates opening_qty, opening_value, balance_qty, balance_value, unit_cost, in_value, out_value
3. Returns detailed results showing calculated values for each entry

### Step 2: Archiving Transactions
1. Creates `stock_ledger_archive` table if it doesn't exist
2. Copies all ledger entries from the date range to the archive table
3. Adds `archived_at` timestamp to each archived entry
4. Optionally marks entries in the main table as archived

### Step 3: Archiving Closing Balance
1. Creates `stock_closing_balance` table if it doesn't exist
2. Gets the latest balance for each (warehouse, material) pair as of the end date
3. Calculates avg_unit_cost = balance_value / balance_qty
4. Stores closing balance with date, financial year, and reference information

### Step 4: Creating Opening Stocks
1. Determines the start date of the next period (day after to_date)
2. For each (warehouse, material) pair with non-zero balance:
   - Creates a stock_opening_entry
   - Creates a stock_opening_item with quantity, unit_cost, and amount
   - Adds an 'Opening' entry to the stock_ledger for the next period
   - Rebuilds valuation to ensure consistency
3. Returns the list of created opening entries

## API Endpoints

### Calculate Average Rates
```bash
POST /material-issues/batch-process/avg-rates
Body: { "from_date": "2024-09-01", "to_date": "2024-09-30" }
```

### Archive Transactions
```bash
POST /material-issues/batch-process/archive-transactions
Body: { "from_date": "2024-09-01", "to_date": "2024-09-30" }
```

### Archive Closing Balance
```bash
POST /material-issues/batch-process/archive-closing
Body: { "from_date": "2024-09-01", "to_date": "2024-09-30" }
```

### Create Opening Stocks
```bash
POST /material-issues/batch-process/create-opening
Body: { "from_date": "2024-09-01", "to_date": "2024-09-30" }
```

### Execute Complete Batch Process
```bash
POST /material-issues/batch-process/execute
Body: { "from_date": "2024-09-01", "to_date": "2024-09-30" }
```

## Usage

### From the UI:
1. Navigate to Inventory > Monthly Batch Process
2. Select From Date and To Date (or click "Use Previous Month")
3. Click "Execute" to run all steps in sequence
4. View progress and results for each step

### Programmatically:
You can call individual endpoints or the complete batch process endpoint.
Each step returns:
- `success: boolean` - Whether the step completed successfully
- `message: string` - Description of what was done
- `data: object` - Detailed results including counts and processed items

## Error Handling

- Each step runs in a transaction and rolls back on error
- Frontend shows error state for failed steps
- User can retry or continue from where they left off
- Detailed error messages are displayed for troubleshooting

## Security

All batch process endpoints require:
- User authentication (via `requireWriteAccess` middleware)
- POST method with authenticated user
- Only users with write access can execute batch processes

## Database Schema

### stock_ledger_archive
Same structure as stock_ledger plus:
- `archived_at` - Timestamp when the entry was archived

### stock_closing_balance
- `id` - Primary key
- `warehouse_id` - Warehouse reference
- `material_id` - Material reference
- `closing_date` - Date of the closing balance
- `financial_year` - Financial year identifier
- `closing_qty` - Closing quantity
- `closing_value` - Closing value
- `avg_unit_cost` - Average unit cost at closing
- `uom` - Unit of measure
- `reference_type` - Type of reference (default: 'monthly_batch')
- `reference_id` - ID of the reference (e.g., ledger entry ID)
- `created_at` - Creation timestamp

## Dependencies

- Existing `stock_ledger` table with all value columns (opening_qty, opening_value, in_value, out_value, balance_qty, balance_value)
- `rebuildStockValuation()` function from stockLedgerModel.js
- `rebuildAndReprice()` function from stockLedgerModel.js
- `addLedgerEntry()` function from stockLedgerModel.js
- Material and Warehouse master tables

## Testing

To test the implementation:

1. Ensure the database has stock_ledger entries with transactions
2. Run the migration to create archive and closing balance tables
3. Navigate to the Monthly Batch Process page
4. Select a date range with existing transactions
5. Click Execute and verify:
   - Step 1 shows calculated average rates
   - Step 2 archives transactions
   - Step 3 archives closing balances
   - Step 4 creates opening stocks

## Notes

- The implementation uses the existing `rebuildStockValuation()` which already correctly implements the average rate calculation formula
- The date range filter ensures calculations are applied only to transactions within the specified period
- The system creates opening stocks for the next period based on closing balances
- All operations are transactional and atomic within each step
