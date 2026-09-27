-- Migration 056: Backfill material opening stock consistently across all three
-- stock tables (warehouse_stock, stock_ledger, material_transactions).
-- =============================================================================
-- BACKGROUND
--   The material master historically wrote opening stock ONLY into
--   material_transactions (reference_type='material_master'), leaving
--   warehouse_stock and stock_ledger out of sync. The application fix
--   (seedOpeningStock) now keeps all three in sync going forward, but existing
--   materials still need a one-time backfill. This migration does that.
--
-- RULES (safe by design)
--   * Only materials with: status='Active', not deleted, opening_stock > 0, and
--     a default_warehouse that resolves to a real warehouse (by name or code).
--   * The material's default warehouse must have NO real stock movement history
--     for that item (no receipts/issues/transfers/opening entries). We only
--     seed opening where the warehouse is otherwise empty for that item — so we
--     never inflate stock that already has genuine transactions.
--   * Any pre-existing 'material_master' rows for the item (the old drifted
--     opening) are removed first, then a fresh consistent opening is written.
--   * Rate used = materials.standard_cost (fallback: rate / last_purchase_price).
--   * Idempotent: re-running reproduces the same clean opening rows.
--
-- NOTE: run AFTER taking a full DB backup.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Build the working set of (material_id, warehouse_id, qty, rate) to seed.
-- A temporary table keeps the logic readable and the INSERTs consistent.
-- ---------------------------------------------------------------------------
DROP TEMPORARY TABLE IF EXISTS _opening_seed;
CREATE TEMPORARY TABLE _opening_seed AS
SELECT
  m.id                                   AS material_id,
  m.code                                 AS material_code,
  w.id                                   AS warehouse_id,
  CAST(m.opening_stock AS DECIMAL(18,3)) AS qty,
  CAST(COALESCE(NULLIF(m.standard_cost,0), m.rate, m.last_purchase_price, 0) AS DECIMAL(18,4)) AS rate
FROM materials m
JOIN warehouses w
  ON  w.name = m.default_warehouse COLLATE utf8mb4_unicode_ci
   OR w.code = m.default_warehouse COLLATE utf8mb4_unicode_ci
WHERE m.status = 'Active'
  AND m.deleted_at IS NULL
  AND m.opening_stock > 0
  AND m.default_warehouse IS NOT NULL
  AND m.default_warehouse <> ''
  -- Warehouse must have NO real (non material_master) movement for this item.
  AND NOT EXISTS (
    SELECT 1 FROM stock_ledger sl
    WHERE sl.material_id = m.id AND sl.warehouse_id = w.id
      AND sl.reference_type <> 'material_master'
  )
  AND NOT EXISTS (
    SELECT 1 FROM material_transactions mt
    WHERE mt.item_id = m.id AND mt.warehouse_id = w.id
      AND mt.reference_type <> 'material_master'
  );

-- ---------------------------------------------------------------------------
-- 1) Clean any pre-existing material_master opening rows for the seeded items
--    (removes old drifted data before writing the fresh consistent opening).
-- ---------------------------------------------------------------------------
DELETE sl FROM stock_ledger sl
JOIN _opening_seed s ON s.material_id = sl.material_id
WHERE sl.reference_type = 'material_master';

DELETE mt FROM material_transactions mt
JOIN _opening_seed s ON s.material_id = mt.item_id
WHERE mt.reference_type = 'material_master';

-- ---------------------------------------------------------------------------
-- 2) stock_ledger — one 'Opening' row per seeded (material, warehouse).
-- ---------------------------------------------------------------------------
INSERT INTO stock_ledger
  (transaction_date, transaction_type, reference_type, reference_id, reference_no,
   warehouse_id, material_id, uom, batch_no, expiry_date,
   in_qty, out_qty, unit_cost, amount, balance_qty, remarks, created_by)
SELECT
  CURDATE(), 'Opening', 'material_master', s.material_id, s.material_code,
  s.warehouse_id, s.material_id, NULL, NULL, NULL,
  s.qty, 0, s.rate, ROUND(s.qty * s.rate, 2), s.qty,
  'Opening stock (material master backfill)', NULL
FROM _opening_seed s;

-- ---------------------------------------------------------------------------
-- 3) warehouse_stock — upsert current balance to the opening qty/rate.
--    (Rows in the seed set have no other movement, so opening IS the balance.)
-- ---------------------------------------------------------------------------
INSERT INTO warehouse_stock (warehouse_id, material_id, uom, current_qty, avg_unit_cost)
SELECT s.warehouse_id, s.material_id, NULL, s.qty, s.rate
FROM _opening_seed s
ON DUPLICATE KEY UPDATE
  current_qty   = VALUES(current_qty),
  avg_unit_cost = VALUES(avg_unit_cost);

-- ---------------------------------------------------------------------------
-- 4) material_transactions — the OPENING row the availability check reads.
-- ---------------------------------------------------------------------------
INSERT INTO material_transactions
  (transaction_date, transaction_type, reference_no, warehouse_id, item_id,
   opening_stock, receipt_qty, receipt_value, issue_qty, issue_value,
   balance_qty, avg_rate, balance_value, reference_type, reference_id)
SELECT
  NOW(), 'OPENING', s.material_code, s.warehouse_id, s.material_id,
  0, s.qty, ROUND(s.qty * s.rate, 2), 0, 0,
  s.qty, s.rate, ROUND(s.qty * s.rate, 2), 'material_master', s.material_id
FROM _opening_seed s;

-- ---------------------------------------------------------------------------
-- Report what was seeded, then clean up the temp table.
-- ---------------------------------------------------------------------------
SELECT COUNT(*) AS materials_seeded,
       COALESCE(SUM(qty),0) AS total_qty,
       COALESCE(SUM(ROUND(qty*rate,2)),0) AS total_value
FROM _opening_seed;

DROP TEMPORARY TABLE IF EXISTS _opening_seed;
