-- Migration 068: Drop warehouse_stock and material_transactions.
-- =============================================================================
-- stock_ledger is now the SINGLE SOURCE OF TRUTH for stock (see migration 067
-- and the refactor of stockLedgerModel / materialTransactionModel). No code
-- reads or writes these two tables any more:
--   - warehouse_stock      (old live-balance mirror)
--   - material_transactions(old "availability engine")
-- Live stock, average rate and the opening→in→out→balance picture are all
-- derived from stock_ledger.
--
-- DESTRUCTIVE but reversible from the DB backups taken before this change.
-- Idempotent: DROP ... IF EXISTS.
-- =============================================================================
DROP TABLE IF EXISTS material_transactions;
DROP TABLE IF EXISTS warehouse_stock;
