-- Migration 069 (revised): Backfill missing material_issue rows into stock_ledger.
-- =============================================================================
-- Root cause of the wrong live stock: in the restored dump, POSTED material
-- issues were never written to stock_ledger (they only lived in the old
-- material_transactions table, which has been dropped). So the ledger held only
-- Opening + Receipt rows — its balances were too HIGH by the un-recorded issue
-- quantities (e.g. material 210 @ wh 8 showed 10 instead of 6 = 10 − issue 4).
--
-- The correct fix is to RECONSTRUCT the missing history: insert a real 'Issue'
-- ledger row for every posted material_issue_items line that has no matching
-- stock_ledger row. A follow-up date-ordered rebuild (run by the app /
-- stockLedgerModel.rebuildAllStock) then recomputes opening/in/out/balance and
-- re-prices issues — landing each item on its correct live balance.
--
-- This SUPERSEDES the earlier lump "SC-069" stock-correction approach: those
-- rows are removed first so issues are not double-counted.
--
-- Idempotent: backfilled issue rows are tagged remarks='SL069 issue backfill';
-- re-running removes any previous SC-069 and SL069-backfill rows first.
-- =============================================================================

-- 1) Undo the earlier lump correction (if present) and any previous backfill.
DELETE FROM stock_ledger
 WHERE reference_type='stock_correction' AND reference_no='SC-069';
DELETE FROM stock_ledger
 WHERE reference_type='material_issue' AND remarks='SL069 issue backfill';

-- 2) Backfill a real 'Issue' ledger row for every POSTED material_issue_items
--    line that currently has no stock_ledger row. balance_qty/opening/values are
--    left at defaults and are authoritatively recomputed by the rebuild step.
INSERT INTO stock_ledger
  (transaction_date, transaction_type, reference_type, reference_id, reference_no,
   warehouse_id, material_id, uom, in_qty, in_value, out_qty, out_value,
   unit_cost, amount, opening_qty, opening_value, balance_qty, balance_value,
   remarks, created_by)
SELECT
  mi.issue_date, 'Issue', 'material_issue', mi.id, mi.issue_no,
  mi.warehouse_id, mii.material_id, mii.uom,
  0, 0,
  mii.issue_qty, ROUND(mii.issue_qty * mii.unit_cost, 2),
  mii.unit_cost, mii.amount,
  0, 0, 0, 0,
  'SL069 issue backfill', mi.created_by
FROM material_issues mi
JOIN material_issue_items mii ON mii.issue_id = mi.id
WHERE mi.deleted_at IS NULL
  AND mi.status = 'Posted'
  AND mii.issue_qty > 0
  AND NOT EXISTS (
    SELECT 1 FROM stock_ledger sl
     WHERE sl.reference_type='material_issue'
       AND sl.reference_id=mi.id
       AND sl.material_id=mii.material_id
  );

-- NOTE: After this migration, run a full ledger rebuild so opening/in/out/
-- balance and issue repricing are recomputed date-ordered. In the app this is
-- stockLedgerModel.rebuildAllStock(); it is also triggered by the verify step.
