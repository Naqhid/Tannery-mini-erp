-- Migration 062: Backfill missing stock_ledger rows for posted material issues
-- that were imported directly (via earlier SQL imports) and so wrote only to
-- material_transactions, never to stock_ledger or warehouse_stock.
-- =============================================================================
-- PROBLEM
--   Material issues ISS-2026-00002 (id 19) and ISS-2026-00003 (id 20) have
--   status = 'Posted' and rows in material_transactions, but ZERO rows in
--   stock_ledger. The inventory stock-summary report reads only from
--   stock_ledger, so these issues never appear (Issue Qty shows 0 and
--   Opening == Closing). warehouse_stock was never deducted for them either,
--   so the three stock tables are internally inconsistent.
--
--   Re-posting from the UI does NOT work: the update path treats the record as
--   wasPosted=true and tries to reverse a deduction that never happened, then
--   fails the availability check ("Insufficient Stock").
--
-- PERMANENT FIX
--   Insert the missing 'Issue' rows into stock_ledger (one per issue line item,
--   out_qty = issue_qty). balance_qty / amount here are placeholders — the app
--   maintenance rebuild recomputes the true running balance and re-prices the
--   issue at the correct moving-average cost. Then remove the stale
--   material_transactions rows for these two issues so System B does not double
--   count when it is rebuilt. The ledger rows are the durable source of truth.
--
-- SCOPE / SAFETY
--   * Targets ONLY posted issues that currently have NO stock_ledger rows
--     (idempotent — re-running inserts nothing because rows will then exist).
--   * Does not touch Draft issues (they correctly have no stock effect).
--   * Additive to stock_ledger only; no reversal logic.
--
-- RUN AFTER A FULL DB BACKUP.
-- =============================================================================

-- Posted issues that have NO ledger rows yet (the ones needing backfill).
DROP TEMPORARY TABLE IF EXISTS _issue_backfill;
CREATE TEMPORARY TABLE _issue_backfill AS
SELECT mi.id AS issue_id, mi.issue_no, mi.issue_date, mi.warehouse_id, mi.created_by
FROM material_issues mi
WHERE mi.status = 'Posted'
  AND NOT EXISTS (
    SELECT 1 FROM stock_ledger sl
    WHERE sl.reference_type = 'material_issue' AND sl.reference_id = mi.id
  );

-- ---------------------------------------------------------------------------
-- Insert the durable 'Issue' ledger rows (out_qty = issue_qty). unit_cost and
-- amount are seeded from the stored issue-item values; balance_qty is a
-- placeholder. The application rebuild recomputes balance_qty and re-prices
-- unit_cost/amount at the moving-average cost at the issue date.
-- ---------------------------------------------------------------------------
INSERT INTO stock_ledger
  (transaction_date, transaction_type, reference_type, reference_id, reference_no,
   warehouse_id, material_id, uom, batch_no, expiry_date,
   in_qty, out_qty, unit_cost, amount, balance_qty, remarks, created_by)
SELECT
  b.issue_date, 'Issue', 'material_issue', b.issue_id, b.issue_no,
  b.warehouse_id, mii.material_id, mii.uom, NULL, NULL,
  0, mii.issue_qty, COALESCE(mii.unit_cost, 0), COALESCE(mii.amount, 0),
  -(COALESCE(mii.issue_qty, 0)),
  'Issue (posted-issue ledger backfill)', b.created_by
FROM _issue_backfill b
JOIN material_issue_items mii ON mii.issue_id = b.issue_id;

-- ---------------------------------------------------------------------------
-- Remove the stale material_transactions rows for these issues so the app
-- rebuild (System B) does not double count. The rebuild re-creates the correct
-- issue rows from the stock_ledger entries inserted above.
-- ---------------------------------------------------------------------------
DELETE mt FROM material_transactions mt
JOIN _issue_backfill b
  ON mt.reference_type = 'material_issue' AND mt.reference_id = b.issue_id;

-- Report what was backfilled.
SELECT
  (SELECT COUNT(*) FROM _issue_backfill)                                   AS issues_backfilled,
  (SELECT COUNT(*) FROM _issue_backfill b
     JOIN material_issue_items mii ON mii.issue_id = b.issue_id)           AS ledger_rows_inserted;

DROP TEMPORARY TABLE IF EXISTS _issue_backfill;

-- =============================================================================
-- IMPORTANT: after this migration, trigger the application maintenance rebuild
-- so warehouse_stock AND material_transactions are recomputed from stock_ledger
-- (and the issues are re-priced at the correct moving-average cost):
--
--     POST /api/stock-maintenance/rebuild        (requires write access)
--
-- After the rebuild, verify: warehouse_stock.current_qty and the stock_ledger
-- running balance for each affected (warehouse=8, material) should both be
-- reduced by the issued quantity, and the inventory stock-summary report should
-- show the Issue Qty populated.
-- =============================================================================
