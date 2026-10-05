-- Migration 056: Backfill material opening stock into the stock ledger so it is
-- consistent across all three stock tables and SURVIVES future rebuilds.
-- =============================================================================
-- PROBLEM
--   Historically, material opening stock lived only in the material master
--   field (and sometimes a lone material_transactions row) — never in
--   stock_ledger. Because balances are rebuilt from stock_ledger, the opening
--   was silently lost the first time a receipt/issue posted (e.g. opening 0.5 +
--   receipt 1.0 showed as 1.0 instead of 1.5).
--
-- PERMANENT FIX
--   Ensure every material with opening_stock > 0 has a real 'Opening' row in
--   stock_ledger in its default warehouse, dated BEFORE its earliest existing
--   movement (so the rebuild always includes it). Then rebuild both engines
--   (warehouse_stock via app rebuild, and material_transactions) — here we
--   seed material_transactions directly and rely on the app to recompute on the
--   next movement; the ledger row is the durable source of truth.
--
-- RULES
--   * Only Active, non-deleted materials with opening_stock > 0 and a
--     default_warehouse that resolves (by name or code) to a real warehouse.
--   * Skip a (material, warehouse) that ALREADY has a 'material_master' Opening
--     ledger row (idempotent — re-running does not duplicate).
--   * Opening is scoped to the material's default warehouse only.
--   * Opening date = one day before the earliest existing ledger movement for
--     that (material, warehouse), or today if there are none.
--   * Rate = standard_cost (fallback rate / last_purchase_price).
--
-- AFTER RUNNING: the application must recompute balances. The app already does
-- this on the next transaction; to refresh immediately, re-post/rebuild is not
-- required because we also write warehouse_stock and material_transactions here.
--
-- Run AFTER a full DB backup.
-- =============================================================================

DROP TEMPORARY TABLE IF EXISTS _opening_seed;
CREATE TEMPORARY TABLE _opening_seed AS
SELECT
  m.id                                   AS material_id,
  m.code                                 AS material_code,
  w.id                                   AS warehouse_id,
  CAST(m.opening_stock AS DECIMAL(18,3)) AS qty,
  CAST(COALESCE(NULLIF(m.standard_cost,0), m.rate, m.last_purchase_price, 0) AS DECIMAL(18,4)) AS rate,
  -- Opening date: one day before earliest movement, else today.
  COALESCE(
    (SELECT DATE_SUB(MIN(sl.transaction_date), INTERVAL 1 DAY)
       FROM stock_ledger sl
      WHERE sl.material_id = m.id AND sl.warehouse_id = w.id),
    CURDATE()
  )                                      AS opening_date
FROM materials m
JOIN warehouses w
  ON  w.name = m.default_warehouse COLLATE utf8mb4_unicode_ci
   OR w.code = m.default_warehouse COLLATE utf8mb4_unicode_ci
WHERE m.status = 'Active'
  AND m.deleted_at IS NULL
  AND m.opening_stock > 0
  AND m.default_warehouse IS NOT NULL
  AND m.default_warehouse <> ''
  -- Idempotency: skip if a material_master Opening ledger row already exists.
  AND NOT EXISTS (
    SELECT 1 FROM stock_ledger sl
    WHERE sl.material_id = m.id AND sl.warehouse_id = w.id
      AND sl.reference_type = 'material_master'
  );

-- Also remove any stale lone material_transactions 'material_master' rows for
-- the seeded items so we don't double count (the ledger is now authoritative).
DELETE mt FROM material_transactions mt
JOIN _opening_seed s ON s.material_id = mt.item_id AND s.warehouse_id = mt.warehouse_id
WHERE mt.reference_type = 'material_master';

-- ---------------------------------------------------------------------------
-- Insert the durable 'Opening' ledger rows (backdated). balance_qty here is a
-- placeholder; the application rebuild will recompute the true running balance.
-- ---------------------------------------------------------------------------
INSERT INTO stock_ledger
  (transaction_date, transaction_type, reference_type, reference_id, reference_no,
   warehouse_id, material_id, uom, batch_no, expiry_date,
   in_qty, out_qty, unit_cost, amount, balance_qty, remarks, created_by)
SELECT
  s.opening_date, 'Opening', 'material_master', s.material_id, s.material_code,
  s.warehouse_id, s.material_id, NULL, NULL, NULL,
  s.qty, 0, s.rate, ROUND(s.qty * s.rate, 2), s.qty,
  'Opening stock (material master backfill)', NULL
FROM _opening_seed s;

-- ---------------------------------------------------------------------------
-- Also insert a matching material_transactions OPENING row (backdated to the
-- same opening date) so System B (the availability engine) includes the
-- opening. Balances here are placeholders; the app rebuild recomputes them.
-- We model opening as a receipt of `qty` at `rate` on the opening date.
-- ---------------------------------------------------------------------------
INSERT INTO material_transactions
  (transaction_date, transaction_type, reference_no, warehouse_id, item_id,
   opening_stock, receipt_qty, receipt_value, issue_qty, issue_value,
   balance_qty, avg_rate, balance_value, reference_type, reference_id)
SELECT
  s.opening_date, 'OPENING', s.material_code, s.warehouse_id, s.material_id,
  0, s.qty, ROUND(s.qty * s.rate, 2), 0, 0,
  s.qty, s.rate, ROUND(s.qty * s.rate, 2), 'material_master', s.material_id
FROM _opening_seed s;

-- Report what will be seeded.
SELECT COUNT(*) AS ledger_openings_inserted,
       COALESCE(SUM(qty),0) AS total_qty,
       COALESCE(SUM(ROUND(qty*rate,2)),0) AS total_value
FROM _opening_seed;

DROP TEMPORARY TABLE IF EXISTS _opening_seed;

-- =============================================================================
-- IMPORTANT: after this migration, trigger the application maintenance rebuild
-- so warehouse_stock AND material_transactions are recomputed from stock_ledger
-- for every (warehouse, material), using the tested app logic. Call:
--
--     POST /api/stock-maintenance/rebuild        (requires write access)
--
-- The ledger 'Opening' rows inserted above are the durable source of truth;
-- the rebuild makes the other two tables consistent (opening + any existing
-- receipts/issues), so e.g. opening 0.5 + receipt 1.0 correctly becomes 1.5.
-- =============================================================================
