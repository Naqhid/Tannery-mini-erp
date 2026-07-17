-- ============================================================
-- Migration 005: Production Plan Redesign with Stages/Batches
-- ============================================================
-- This migration adds article, color, finish fields to production_plans
-- and creates production_plan_stages table for batch line items (stages)

-- Add article, color, finish, customer_order_no to production_plans
ALTER TABLE production_plans
  ADD COLUMN IF NOT EXISTS article VARCHAR(100) DEFAULT NULL AFTER product_id,
  ADD COLUMN IF NOT EXISTS color VARCHAR(100) DEFAULT NULL AFTER article,
  ADD COLUMN IF NOT EXISTS finish VARCHAR(100) DEFAULT NULL AFTER color,
  ADD COLUMN IF NOT EXISTS customer_order_no VARCHAR(100) DEFAULT NULL AFTER sales_order_id;

-- Create production_plan_stages table (Plan Line Items / Stages)
CREATE TABLE IF NOT EXISTS production_plan_stages (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  plan_id          INT NOT NULL,
  seq              INT NOT NULL DEFAULT 1,
  stage_id         INT DEFAULT NULL,
  stage_name       VARCHAR(200) DEFAULT NULL,
  capacity         DECIMAL(12,2) DEFAULT 0,
  planned_qty      DECIMAL(12,2) DEFAULT 0,
  planned_percent  DECIMAL(6,2) DEFAULT 100.00,
  receipt_qty      DECIMAL(12,2) DEFAULT 0,
  rejection_qty    DECIMAL(12,2) DEFAULT 0,
  output_qty       DECIMAL(12,2) DEFAULT 0,
  output_percent   DECIMAL(6,2) DEFAULT 0,
  wip_qty          DECIMAL(12,2) DEFAULT 0,
  status           VARCHAR(30) DEFAULT 'In-Process',
  remarks          TEXT,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pps_plan FOREIGN KEY (plan_id) REFERENCES production_plans(id) ON DELETE CASCADE,
  CONSTRAINT fk_pps_stage FOREIGN KEY (stage_id) REFERENCES process_stages(id) ON DELETE SET NULL,
  INDEX idx_pps_plan (plan_id),
  INDEX idx_pps_stage (stage_id)
) ENGINE=InnoDB;
