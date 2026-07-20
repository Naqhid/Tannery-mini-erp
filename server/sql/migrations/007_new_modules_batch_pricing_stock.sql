-- ============================================================
-- Migration 007: New Modules - Batch/Lot Tracking, Supplier Pricing, Physical Stock
-- Description: Adds tables for Batch/Lot Tracking, Supplier Pricing History,
--              Price Approval, Add New Price, and Physical Stock Entry modules
-- ============================================================

-- ============================================================
-- 1. BATCH / LOT TRACKING TABLES
-- ============================================================

-- Batch/Lot Master Table
CREATE TABLE IF NOT EXISTS batches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  batch_no VARCHAR(50) NOT NULL UNIQUE,
  production_plan_id INT,
  sales_order_id INT,
  customer_id INT,
  order_no VARCHAR(50),
  article_code VARCHAR(50),
  article_name VARCHAR(200),
  production_date DATE,
  stage VARCHAR(100) DEFAULT 'Tanning',
  current_stage VARCHAR(100) DEFAULT 'Tanning',
  total_receipt_qty DECIMAL(12,2) DEFAULT 0,
  total_output_qty DECIMAL(12,2) DEFAULT 0,
  yield_percent DECIMAL(5,2) DEFAULT 0,
  status ENUM('Draft','In-Process','Completed','On-Hold','Cancelled') DEFAULT 'Draft',
  remarks TEXT,
  created_by INT,
  updated_by INT,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_batch_plan FOREIGN KEY (production_plan_id)
    REFERENCES production_plans(id) ON DELETE SET NULL,
  CONSTRAINT fk_batch_so FOREIGN KEY (sales_order_id)
    REFERENCES sales_orders(id) ON DELETE SET NULL,
  CONSTRAINT fk_batch_customer FOREIGN KEY (customer_id)
    REFERENCES customers(id) ON DELETE SET NULL,
  INDEX idx_batch_number (batch_no),
  INDEX idx_batch_plan (production_plan_id),
  INDEX idx_batch_date (production_date),
  INDEX idx_batch_status (status),
  INDEX idx_batch_deleted (deleted_at)
) ENGINE=InnoDB;

-- Batch/Lot Line Items (detailed items per batch)
CREATE TABLE IF NOT EXISTS batch_line_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  batch_id INT NOT NULL,
  seq INT DEFAULT 1,
  customer_name VARCHAR(200),
  order_no VARCHAR(50),
  article_code VARCHAR(50),
  article_name VARCHAR(200),
  finish VARCHAR(100),
  color VARCHAR(100),
  receipt_qty DECIMAL(12,2) DEFAULT 0,
  uom VARCHAR(20) DEFAULT 'SQ.FT.',
  output_qty DECIMAL(12,2) DEFAULT 0,
  output_uom VARCHAR(20) DEFAULT 'SQ.FT.',
  status VARCHAR(50) DEFAULT 'Pending',
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_bli_batch FOREIGN KEY (batch_id)
    REFERENCES batches(id) ON DELETE CASCADE,
  INDEX idx_bli_batch (batch_id),
  INDEX idx_bli_seq (batch_id, seq)
) ENGINE=InnoDB;

-- ============================================================
-- 2. SUPPLIER PRICING HISTORY TABLES
-- ============================================================

-- Extended Supplier Pricing Table (enhanced from existing supplier_pricing)
-- Using ALTER TABLE to add new columns to existing table
ALTER TABLE supplier_pricing
  ADD COLUMN IF NOT EXISTS item_group VARCHAR(100) AFTER material_id,
  ADD COLUMN IF NOT EXISTS supplier_part_no VARCHAR(100) AFTER item_group,
  ADD COLUMN IF NOT EXISTS unit_price DECIMAL(12,2) DEFAULT 0 AFTER uom,
  ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'INR' AFTER unit_price,
  ADD COLUMN IF NOT EXISTS min_order_qty DECIMAL(12,2) DEFAULT 0 AFTER currency,
  ADD COLUMN IF NOT EXISTS price_type ENUM('Purchase Price','Contract Price') DEFAULT 'Purchase Price' AFTER min_order_qty,
  ADD COLUMN IF NOT EXISTS remarks TEXT AFTER status,
  ADD COLUMN IF NOT EXISTS approved_by INT AFTER remarks,
  ADD COLUMN IF NOT EXISTS approved_date DATE AFTER approved_by,
  ADD COLUMN IF NOT EXISTS approval_notes TEXT AFTER approved_date,
  ADD COLUMN IF NOT EXISTS last_approved_price DECIMAL(12,2) DEFAULT 0 AFTER approval_notes,
  ADD COLUMN IF NOT EXISTS last_approved_date DATE AFTER last_approved_price,
  ADD COLUMN IF NOT EXISTS created_by INT AFTER updated_at,
  ADD COLUMN IF NOT EXISTS updated_by INT AFTER created_by,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL AFTER updated_by;

-- Update the price column to unit_price if it exists and unit_price doesn't
-- This ensures data consistency
UPDATE supplier_pricing SET unit_price = price WHERE unit_price = 0 AND price > 0;

-- Add foreign keys for new columns if they don't exist
ALTER TABLE supplier_pricing
  ADD CONSTRAINT IF NOT EXISTS fk_sp_approved_by FOREIGN KEY (approved_by)
    REFERENCES users(id) ON DELETE SET NULL,
  ADD CONSTRAINT IF NOT EXISTS fk_sp_created_by FOREIGN KEY (created_by)
    REFERENCES users(id) ON DELETE SET NULL,
  ADD CONSTRAINT IF NOT EXISTS fk_sp_updated_by FOREIGN KEY (updated_by)
    REFERENCES users(id) ON DELETE SET NULL;

-- Add indexes for better performance
ALTER TABLE supplier_pricing
  ADD INDEX IF NOT EXISTS idx_sp_status (status),
  ADD INDEX IF NOT EXISTS idx_sp_valid_from (valid_from),
  ADD INDEX IF NOT EXISTS idx_sp_valid_to (valid_to),
  ADD INDEX IF NOT EXISTS idx_sp_deleted (deleted_at);

-- Price Breaks (Quantity Based Pricing - child table for supplier_pricing)
CREATE TABLE IF NOT EXISTS price_breaks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pricing_id INT NOT NULL,
  seq INT DEFAULT 1,
  from_qty DECIMAL(12,2) DEFAULT 0,
  to_qty DECIMAL(12,2) DEFAULT 0,
  uom VARCHAR(20) DEFAULT 'KG',
  unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  net_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pb_pricing FOREIGN KEY (pricing_id)
    REFERENCES supplier_pricing(id) ON DELETE CASCADE,
  INDEX idx_pb_pricing (pricing_id),
  INDEX idx_pb_seq (pricing_id, seq)
) ENGINE=InnoDB;

-- Price Change History (audit trail for price changes)
CREATE TABLE IF NOT EXISTS price_change_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pricing_id INT,
  material_id INT NOT NULL,
  supplier_id INT NOT NULL,
  old_price DECIMAL(12,2) DEFAULT 0,
  new_price DECIMAL(12,2) DEFAULT 0,
  change_percent DECIMAL(5,2) DEFAULT 0,
  change_type ENUM('Increase','Decrease','No Change') DEFAULT 'No Change',
  change_reason VARCHAR(255),
  effective_from DATE,
  effective_to DATE,
  changed_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pch_pricing FOREIGN KEY (pricing_id)
    REFERENCES supplier_pricing(id) ON DELETE SET NULL,
  CONSTRAINT fk_pch_material FOREIGN KEY (material_id)
    REFERENCES materials(id) ON DELETE CASCADE,
  CONSTRAINT fk_pch_supplier FOREIGN KEY (supplier_id)
    REFERENCES suppliers(id) ON DELETE CASCADE,
  CONSTRAINT fk_pch_changed_by FOREIGN KEY (changed_by)
    REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_pch_pricing (pricing_id),
  INDEX idx_pch_material (material_id),
  INDEX idx_pch_supplier (supplier_id),
  INDEX idx_pch_effective (effective_from)
) ENGINE=InnoDB;

-- Supplier Pricing Attachments
CREATE TABLE IF NOT EXISTS supplier_pricing_attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pricing_id INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(50),
  file_size INT DEFAULT 0,
  uploaded_by INT,
  uploaded_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_spa_pricing FOREIGN KEY (pricing_id)
    REFERENCES supplier_pricing(id) ON DELETE CASCADE,
  CONSTRAINT fk_spa_uploaded_by FOREIGN KEY (uploaded_by)
    REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_spa_pricing (pricing_id)
) ENGINE=InnoDB;

-- ============================================================
-- 3. PRICE APPROVAL WORKFLOW TABLES
-- ============================================================

-- Price Approval Requests (Header)
CREATE TABLE IF NOT EXISTS price_approval_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_no VARCHAR(50) NOT NULL UNIQUE,
  request_date DATE NOT NULL,
  requested_by INT NOT NULL,
  department VARCHAR(100) DEFAULT 'Purchase',
  total_items INT DEFAULT 0,
  status ENUM('Draft','Pending','Under Review','Approved','Rejected','Partially Approved') DEFAULT 'Draft',
  approval_notes TEXT,
  remarks TEXT,
  created_by INT,
  updated_by INT,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_par_requested_by FOREIGN KEY (requested_by)
    REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_par_created_by FOREIGN KEY (created_by)
    REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_par_request_no (request_no),
  INDEX idx_par_status (status),
  INDEX idx_par_date (request_date),
  INDEX idx_par_requested_by (requested_by),
  INDEX idx_par_deleted (deleted_at)
) ENGINE=InnoDB;

-- Price Approval Request Items (Line items for approval)
CREATE TABLE IF NOT EXISTS price_approval_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  seq INT DEFAULT 1,
  supplier_id INT NOT NULL,
  material_id INT NOT NULL,
  supplier_part_no VARCHAR(100),
  item_group VARCHAR(100),
  uom VARCHAR(20) DEFAULT 'KG',
  current_price DECIMAL(12,2) DEFAULT 0,
  requested_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'INR',
  change_amount DECIMAL(12,2) DEFAULT 0,
  change_percent DECIMAL(5,2) DEFAULT 0,
  effective_from DATE,
  effective_to DATE,
  last_approved_price DECIMAL(12,2) DEFAULT 0,
  last_approved_date DATE,
  status ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
  approval_notes TEXT,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pai_request FOREIGN KEY (request_id)
    REFERENCES price_approval_requests(id) ON DELETE CASCADE,
  CONSTRAINT fk_pai_supplier FOREIGN KEY (supplier_id)
    REFERENCES suppliers(id) ON DELETE CASCADE,
  CONSTRAINT fk_pai_material FOREIGN KEY (material_id)
    REFERENCES materials(id) ON DELETE CASCADE,
  INDEX idx_pai_request (request_id),
  INDEX idx_pai_supplier (supplier_id),
  INDEX idx_pai_material (material_id),
  INDEX idx_pai_status (status),
  INDEX idx_pai_seq (request_id, seq)
) ENGINE=InnoDB;

-- Price Approval Workflow (approval steps and actions)
CREATE TABLE IF NOT EXISTS price_approval_workflow (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  item_id INT,
  action_type ENUM('Submitted','Approved','Rejected','Revised','Cancelled') NOT NULL,
  action_by INT NOT NULL,
  action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  from_status VARCHAR(50),
  to_status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_paw_request FOREIGN KEY (request_id)
    REFERENCES price_approval_requests(id) ON DELETE CASCADE,
  CONSTRAINT fk_paw_item FOREIGN KEY (item_id)
    REFERENCES price_approval_items(id) ON DELETE SET NULL,
  CONSTRAINT fk_paw_action_by FOREIGN KEY (action_by)
    REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_paw_request (request_id),
  INDEX idx_paw_item (item_id),
  INDEX idx_paw_action_date (action_date)
) ENGINE=InnoDB;

-- ============================================================
-- 4. PHYSICAL STOCK ENTRY TABLES
-- ============================================================

-- Physical Stock Entry Header
CREATE TABLE IF NOT EXISTS physical_stock_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entry_no VARCHAR(50) NOT NULL UNIQUE,
  entry_date DATE NOT NULL,
  stock_date DATE NOT NULL,
  warehouse_id INT,
  location_rack VARCHAR(100),
  godown VARCHAR(100),
  batch_no VARCHAR(100),
  from_item_code VARCHAR(100),
  to_item_code VARCHAR(100),
  item_group VARCHAR(100),
  item_id INT,
  uom VARCHAR(20) DEFAULT 'KG',
  reference_no VARCHAR(100),
  total_items INT DEFAULT 0,
  matched_items INT DEFAULT 0,
  variance_items INT DEFAULT 0,
  total_variance_qty DECIMAL(12,3) DEFAULT 0,
  total_variance_value DECIMAL(14,2) DEFAULT 0,
  status ENUM('Draft','In-Progress','Completed','Cancelled') DEFAULT 'Draft',
  remarks TEXT,
  created_by INT,
  updated_by INT,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pse_warehouse FOREIGN KEY (warehouse_id)
    REFERENCES warehouses(id) ON DELETE SET NULL,
  CONSTRAINT fk_pse_item FOREIGN KEY (item_id)
    REFERENCES materials(id) ON DELETE SET NULL,
  CONSTRAINT fk_pse_created_by FOREIGN KEY (created_by)
    REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_pse_entry_no (entry_no),
  INDEX idx_pse_date (entry_date),
  INDEX idx_pse_warehouse (warehouse_id),
  INDEX idx_pse_status (status),
  INDEX idx_pse_deleted (deleted_at)
) ENGINE=InnoDB;

-- Physical Stock Entry Items (detailed line items)
CREATE TABLE IF NOT EXISTS physical_stock_entry_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entry_id INT NOT NULL,
  seq INT DEFAULT 1,
  item_code VARCHAR(50) NOT NULL,
  item_description VARCHAR(255),
  uom VARCHAR(20) DEFAULT 'KG',
  batch_no VARCHAR(100),
  location_rack VARCHAR(100),
  system_qty DECIMAL(12,3) DEFAULT 0,
  physical_qty DECIMAL(12,3) DEFAULT 0,
  variance_qty DECIMAL(12,3) DEFAULT 0,
  variance_value DECIMAL(14,2) DEFAULT 0,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_psei_entry FOREIGN KEY (entry_id)
    REFERENCES physical_stock_entries(id) ON DELETE CASCADE,
  INDEX idx_psei_entry (entry_id),
  INDEX idx_psei_item_code (item_code),
  INDEX idx_psei_batch (batch_no),
  INDEX idx_psei_seq (entry_id, seq)
) ENGINE=InnoDB;

-- ============================================================
-- 5. PRODUCTION BATCHES (if not exists - for Batch/Lot Tracking integration)
-- ============================================================

-- Production Batches (linked to production plans)
CREATE TABLE IF NOT EXISTS production_batches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  batch_no VARCHAR(50) NOT NULL UNIQUE,
  plan_id INT NOT NULL,
  sales_order_id INT,
  customer_id INT,
  order_no VARCHAR(50),
  article_code VARCHAR(50),
  article_name VARCHAR(200),
  color VARCHAR(100),
  finish VARCHAR(100),
  production_date DATE,
  stage_id INT,
  stage_name VARCHAR(100),
  capacity DECIMAL(12,2) DEFAULT 0,
  planned_qty DECIMAL(12,2) DEFAULT 0,
  receipt_qty DECIMAL(12,2) DEFAULT 0,
  rejection_qty DECIMAL(12,2) DEFAULT 0,
  output_qty DECIMAL(12,2) DEFAULT 0,
  wip_qty DECIMAL(12,2) DEFAULT 0,
  output_percent DECIMAL(5,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'In-Process',
  remarks TEXT,
  created_by INT,
  updated_by INT,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pb_plan FOREIGN KEY (plan_id)
    REFERENCES production_plans(id) ON DELETE CASCADE,
  CONSTRAINT fk_pb_so FOREIGN KEY (sales_order_id)
    REFERENCES sales_orders(id) ON DELETE SET NULL,
  CONSTRAINT fk_pb_customer FOREIGN KEY (customer_id)
    REFERENCES customers(id) ON DELETE SET NULL,
  CONSTRAINT fk_pb_stage FOREIGN KEY (stage_id)
    REFERENCES process_stages(id) ON DELETE SET NULL,
  CONSTRAINT fk_pb_created_by FOREIGN KEY (created_by)
    REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_pb_batch_no (batch_no),
  INDEX idx_pb_plan (plan_id),
  INDEX idx_pb_date (production_date),
  INDEX idx_pb_status (status),
  INDEX idx_pb_deleted (deleted_at)
) ENGINE=InnoDB;

-- ============================================================
-- 6. AUDIT COLUMNS UPDATE FOR EXISTING TABLES
-- ============================================================

-- Add audit columns to materials if not exists
ALTER TABLE materials
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
  ADD COLUMN IF NOT EXISTS created_by INT,
  ADD COLUMN IF NOT EXISTS updated_by INT;

-- Add audit columns to warehouses if not exists
ALTER TABLE warehouses
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
  ADD COLUMN IF NOT EXISTS created_by INT,
  ADD COLUMN IF NOT EXISTS updated_by INT;

-- Add audit columns to production_plans if not exists
ALTER TABLE production_plans
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
  ADD COLUMN IF NOT EXISTS created_by INT,
  ADD COLUMN IF NOT EXISTS updated_by INT;

-- ============================================================
-- 7. SEED DATA FOR NEW MODULES
-- ============================================================

-- Insert sample price approval request statuses if needed
-- (Statuses are handled as ENUM values in the schema)
