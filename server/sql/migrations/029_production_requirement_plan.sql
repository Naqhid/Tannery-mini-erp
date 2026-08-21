-- Rename and extend production_plans for Production Requirement Plan (PRP)
-- Add new columns for PRP functionality

ALTER TABLE production_plans 
  ADD COLUMN expected_yield DECIMAL(5,2) DEFAULT 92.00 AFTER order_qty,
  ADD COLUMN planner VARCHAR(100) NULL AFTER expected_yield,
  ADD COLUMN completed_qty DECIMAL(18,2) DEFAULT 0 AFTER planner,
  ADD COLUMN sales_order_qty DECIMAL(18,2) DEFAULT 0 AFTER completed_qty;

-- Update production_plan_stages to support Pcs-based tracking
ALTER TABLE production_plan_stages
  ADD COLUMN issue_input_qty DECIMAL(18,2) DEFAULT 0 AFTER planned_qty;

-- Update plan_no prefix from PLAN- to PRP-
-- (This is optional, new plans will use PRP- format going forward)
