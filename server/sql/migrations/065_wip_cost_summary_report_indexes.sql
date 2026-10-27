-- Migration 065: Supporting indexes for the WIP Cost Summary Report.
-- =============================================================================
-- The "Order-wise & Stage-wise WIP Cost Summary" report (Costing menu) joins:
--   production_plan_stages  (per plan+stage WIP qty)
--   production_plans        (sales order / article / color)
--   sales_orders / customers
--   material_issues + material_issue_items   (material WIP cost)
--   general_cost_headers + general_cost_items (general WIP cost)
--   machine_cost_headers + machine_cost_items (machine WIP cost)
--
-- No new tables are required — the report is a pure read-side aggregation over
-- existing operational data. This migration only adds indexes that speed up the
-- stage-wise / plan-wise grouping and the cost sub-selects.
--
-- Safe to re-run: each index is created only when it is absent.
-- =============================================================================
SET @db := DATABASE();

-- Helper that creates an index only if it does not already exist.
-- (Repeated inline below because MySQL has no "CREATE INDEX IF NOT EXISTS".)

-- production_plan_stages: grouped by plan + stage.
SET @exists := (SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='production_plan_stages'
    AND INDEX_NAME='idx_pps_plan_stage');
SET @sql := IF(@exists=0,
  'CREATE INDEX idx_pps_plan_stage ON production_plan_stages (plan_id, stage_name)',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- material_issues: matched by production_batch (= plan_no) + process_stage.
SET @exists := (SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='material_issues'
    AND INDEX_NAME='idx_mi_batch_stage');
SET @sql := IF(@exists=0,
  'CREATE INDEX idx_mi_batch_stage ON material_issues (production_batch, process_stage)',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- general_cost_headers: matched by production_plan_id (status-order id) + stage.
SET @exists := (SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='general_cost_headers'
    AND INDEX_NAME='idx_gch_plan_stage');
SET @sql := IF(@exists=0,
  'CREATE INDEX idx_gch_plan_stage ON general_cost_headers (production_plan_id, process_stage)',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- machine_cost_headers: matched by production_plan_id (status-order id) + stage.
SET @exists := (SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='machine_cost_headers'
    AND INDEX_NAME='idx_mch_plan_stage');
SET @sql := IF(@exists=0,
  'CREATE INDEX idx_mch_plan_stage ON machine_cost_headers (production_plan_id, process_stage)',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
