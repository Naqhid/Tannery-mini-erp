-- 23 Aug 2026 production / actual costing changes
-- Safe schema support for production status naming and actual costing integration.
-- Run after migration 030.

-- Production status already stores plan_date/customer/UOM. Ensure rejection/WIP precision.
ALTER TABLE production_status_transactions
  MODIFY opening_qty DECIMAL(18,2) NOT NULL DEFAULT 0,
  MODIFY input_qty DECIMAL(18,2) NOT NULL DEFAULT 0,
  MODIFY output_qty DECIMAL(18,2) NOT NULL DEFAULT 0,
  MODIFY rejection_qty DECIMAL(18,2) NOT NULL DEFAULT 0,
  MODIFY wip_qty DECIMAL(18,2) NOT NULL DEFAULT 0;

-- Helpful indexes for plan/stage/date lookups used by Daily Production and costing.
CREATE INDEX idx_ps_orders_plan_stage ON production_status_orders (production_plan_id, process_stage, deleted_at);
CREATE INDEX idx_ps_txn_order_date ON production_status_transactions (production_status_order_id, production_date, deleted_at);
