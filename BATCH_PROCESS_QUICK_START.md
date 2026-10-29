# Monthly Batch Process - Quick Start Guide

## What was implemented?

A complete Monthly Batch Process feature that:
1. **Calculates average rates** for stock ledger entries using the formula:
   - `unit_cost = (opening_value + in_value) / (opening_qty + in_qty)`
   - Then calculates: `out_value`, `balance_qty`, `balance_value`
2. **Archives transactions** from the selected period
3. **Archives closing balances** for each warehouse-material pair
4. **Creates opening stocks** for the next period

## How to use it?

### Step 1: Run Database Migration
Before using the batch process, run the migration to create required tables:

```bash
# Run migration 070_monthly_batch_process_tables.sql
# This creates stock_ledger_archive and stock_closing_balance tables
```

### Step 2: Navigate to Monthly Batch Process
1. Open the Tannery ERP application
2. Go to **Inventory > Monthly Batch Process**
3. You'll see the batch process page with:
   - Date picker for From Date and To Date
   - "Use Previous Month" button (auto-fills previous month)
   - "Execute" button to run the process

### Step 3: Select Date Range
- By default, the system selects the **previous month** (first day to last day)
- You can manually select any date range using the date pickers
- Click "Use Previous Month" to quickly set dates to last month

### Step 4: Execute the Process
Click the **Execute** button. The system will run all 4 steps in sequence:

1. ✅ **Calculating the average rates** - Recalculates running averages
2. ✅ **Archiving transactions** - Archives historical transactions
3. ✅ **Archiving closing balance** - Saves closing balances
4. ✅ **Creating opening stocks** - Creates opening stocks for next period

Each step shows:
- ✅ Status (Pending / Running / Completed / Error)
- Progress bar with percentage
- Detailed message about what was processed
- Count of processed items

### Step 5: Review Results
After completion, you'll see:
- ✅ Success message at the bottom
- Results summary showing counts for each step
- Detailed information for each processed item

## API Endpoints (for developers)

If you want to call the endpoints directly:

```bash
# Calculate average rates
POST /material-issues/batch-process/avg-rates
Body: {"from_date": "2024-09-01", "to_date": "2024-09-30"}

# Archive transactions  
POST /material-issues/batch-process/archive-transactions
Body: {"from_date": "2024-09-01", "to_date": "2024-09-30"}

# Archive closing balance
POST /material-issues/batch-process/archive-closing
Body: {"from_date": "2024-09-01", "to_date": "2024-09-30"}

# Create opening stocks
POST /material-issues/batch-process/create-opening
Body: {"from_date": "2024-09-01", "to_date": "2024-09-30"}

# Execute all steps at once
POST /material-issues/batch-process/execute
Body: {"from_date": "2024-09-01", "to_date": "2024-09-30"}
```

## Formula Details

The average rate calculation follows this exact formula for every line:

```
1. unit_cost = (opening_value + in_value) / (opening_qty + in_qty)
2. out_value = out_qty * unit_cost
3. balance_qty = opening_qty + in_qty - out_qty
4. balance_value = balance_qty * unit_cost
```

This is applied:
- For every line in the stock ledger
- Based on the date range filter (from_date to to_date)
- Using the existing rebuildStockValuation function which correctly implements this logic

## Files Changed

- `server/src/controllers/batchProcessController.js` - New controller with all logic
- `server/src/routes/materialIssueRoutes.js` - Added batch process endpoints
- `src/pages/MonthlyBatchProcess.tsx` - Enhanced UI with date pickers and progress
- `server/sql/migrations/070_monthly_batch_process_tables.sql` - Database migration
- `BATCH_PROCESS_IMPLEMENTATION.md` - Full documentation

## Troubleshooting

If you encounter issues:

1. **Migration not run**: Run migration 070 first to create required tables
2. **No transactions in date range**: Select a date range that has stock ledger entries
3. **Permission denied**: Ensure you have write access
4. **Date format**: Use YYYY-MM-DD format for dates

## Need Help?

Check the full documentation in `BATCH_PROCESS_IMPLEMENTATION.md` for:
- Detailed implementation notes
- Database schema
- Security information
- Error handling
