-- ============================================================
-- Migration 007: New Modules - Batch/Lot Tracking, Supplier Pricing, Physical Stock
-- Description: Adds tables for Batch/Lot Tracking, Supplier Pricing History,
--              Price Approval, Add New Price, and Physical Stock Entry modules
-- Simplified version that doesn't modify existing columns that already exist
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
  INDEX idx_batch_number (batch_no),
  INDEX idx_batch_plan (production_plan_id),
  INDEX idx_batch_date (production_date),
  INDEX idx_batch_status (status),
  INDEX idx_batch_deleted (deleted_at)
) ENGINE=InnoDB;

-- Add foreign keys later if referenced tables exist
-- ALTER TABLE batches ADD CONSTRAINT fk_batch_plan FOREIGN KEY (production_plan_id) REFERENCES production_plans(id) ON DELETE SET NULL;
-- ALTER TABLE batches ADD CONSTRAINT fk_batch_so FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE SET NULL;
-- ALTER TABLE batches ADD CONSTRAINT fk_batch_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;

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
  INDEX idx_bli_batch (batch_id),
  INDEX idx_bli_seq (batch_id, seq)
) ENGINE=InnoDB;

-- Add foreign key later if batches table exists
-- ALTER TABLE batch_line_items ADD CONSTRAINT fk_bli_batch FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE;

-- ============================================================
-- 2. SUPPLIER PRICING HISTORY TABLES
-- ============================================================

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
  INDEX idx_pb_pricing (pricing_id),
  INDEX idx_pb_seq (pricing_id, seq)
) ENGINE=InnoDB;

-- Add foreign key later if supplier_pricing table exists
-- ALTER TABLE price_breaks ADD CONSTRAINT fk_pb_pricing FOREIGN KEY (pricing_id) REFERENCES supplier_pricing(id) ON DELETE CASCADE;

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
  INDEX idx_pch_pricing (pricing_id),
  INDEX idx_pch_material (material_id),
  INDEX idx_pch_supplier (supplier_id),
  INDEX idx_pch_effective (effective_from)
) ENGINE=InnoDB;

-- Add foreign keys later if referenced tables exist
-- ALTER TABLE price_change_history ADD CONSTRAINT fk_pch_pricing FOREIGN KEY (pricing_id) REFERENCES supplier_pricing(id) ON DELETE SET NULL;
-- ALTER TABLE price_change_history ADD CONSTRAINT fk_pch_material FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE;
-- ALTER TABLE price_change_history ADD CONSTRAINT fk_pch_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE;
-- ALTER TABLE price_change_history ADD CONSTRAINT fk_pch_changed_by FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL;

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
  INDEX idx_spa_pricing (pricing_id)
) ENGINE=InnoDB;

-- Add foreign keys later if referenced tables exist
-- ALTER TABLE supplier_pricing_attachments ADD CONSTRAINT fk_spa_pricing FOREIGN KEY (pricing_id) REFERENCES supplier_pricing(id) ON DELETE CASCADE;
-- ALTER TABLE supplier_pricing_attachments ADD CONSTRAINT fk_spa_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL;

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
  INDEX idx_par_request_no (request_no),
  INDEX idx_par_status (status),
  INDEX idx_par_date (request_date),
  INDEX idx_par_requested_by (requested_by),
  INDEX idx_par_deleted (deleted_at)
) ENGINE=InnoDB;

-- Add foreign keys later if users table exists
-- ALTER TABLE price_approval_requests ADD CONSTRAINT fk_par_requested_by FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE SET NULL;
-- ALTER TABLE price_approval_requests ADD CONSTRAINT fk_par_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

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
  INDEX idx_pai_request (request_id),
  INDEX idx_pai_supplier (supplier_id),
  INDEX idx_pai_material (material_id),
  INDEX idx_pai_status (status),
  INDEX idx_pai_seq (request_id, seq)
) ENGINE=InnoDB;

-- Add foreign keys later if referenced tables exist
-- ALTER TABLE price_approval_items ADD CONSTRAINT fk_pai_request FOREIGN KEY (request_id) REFERENCES price_approval_requests(id) ON DELETE CASCADE;
-- ALTER TABLE price_approval_items ADD CONSTRAINT fk_pai_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE;
-- ALTER TABLE price_approval_items ADD CONSTRAINT fk_pai_material FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE;

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
  INDEX idx_paw_request (request_id),
  INDEX idx_paw_item (item_id),
  INDEX idx_paw_action_date (action_date)
) ENGINE=InnoDB;

-- Add foreign keys later if referenced tables exist
-- ALTER TABLE price_approval_workflow ADD CONSTRAINT fk_paw_request FOREIGN KEY (request_id) REFERENCES price_approval_requests(id) ON DELETE CASCADE;
-- ALTER TABLE price_approval_workflow ADD CONSTRAINT fk_paw_item FOREIGN KEY (item_id) REFERENCES price_approval_items(id) ON DELETE SET NULL;
-- ALTER TABLE price_approval_workflow ADD CONSTRAINT fk_paw_action_by FOREIGN KEY (action_by) REFERENCES users(id) ON DELETE SET NULL;

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
  INDEX idx_pse_entry_no (entry_no),
  INDEX idx_pse_date (entry_date),
  INDEX idx_pse_warehouse (warehouse_id),
  INDEX idx_pse_status (status),
  INDEX idx_pse_deleted (deleted_at)
) ENGINE=InnoDB;

-- Add foreign keys later if referenced tables exist
-- ALTER TABLE physical_stock_entries ADD CONSTRAINT fk_pse_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE SET NULL;
-- ALTER TABLE physical_stock_entries ADD CONSTRAINT fk_pse_item FOREIGN KEY (item_id) REFERENCES materials(id) ON DELETE SET NULL;
-- ALTER TABLE physical_stock_entries ADD CONSTRAINT fk_pse_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

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
  INDEX idx_psei_entry (entry_id),
  INDEX idx_psei_item_code (item_code),
  INDEX idx_psei_batch (batch_no),
  INDEX idx_psei_seq (entry_id, seq)
) ENGINE=InnoDB;

-- Add foreign key later if physical_stock_entries table exists
-- ALTER TABLE physical_stock_entry_items ADD CONSTRAINT fk_psei_entry FOREIGN KEY (entry_id) REFERENCES physical_stock_entries(id) ON DELETE CASCADE;

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
  INDEX idx_pb_batch_no (batch_no),
  INDEX idx_pb_plan (plan_id),
  INDEX idx_pb_date (production_date),
  INDEX idx_pb_status (status),
  INDEX idx_pb_deleted (deleted_at)
) ENGINE=InnoDB;

-- Add foreign keys later if referenced tables exist
-- ALTER TABLE production_batches ADD CONSTRAINT fk_pb_plan FOREIGN KEY (plan_id) REFERENCES production_plans(id) ON DELETE CASCADE;
-- ALTER TABLE production_batches ADD CONSTRAINT fk_pb_so FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE SET NULL;
-- ALTER TABLE production_batches ADD CONSTRAINT fk_pb_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;
-- ALTER TABLE production_batches ADD CONSTRAINT fk_pb_stage FOREIGN KEY (stage_id) REFERENCES process_stages(id) ON DELETE SET NULL;
-- ALTER TABLE production_batches ADD CONSTRAINT fk_pb_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- ============================================================
-- 7. SEED DATA FOR NEW MODULES
-- ============================================================

-- Insert sample price approval request statuses if needed
-- (Statuses are handled as ENUM values in the schema)