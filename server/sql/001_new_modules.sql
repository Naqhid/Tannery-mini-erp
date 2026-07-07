-- ============================================================
-- Migration: 001_new_modules.sql
-- Description: Extended materials table + Sales Order module tables
-- ============================================================

-- ------------------------------------------------------------
-- 1. Extend materials table for Chemical/Material Master
-- ------------------------------------------------------------
ALTER TABLE materials
  ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'Chemical',
  ADD COLUMN IF NOT EXISTS chemical_group VARCHAR(100),
  ADD COLUMN IF NOT EXISTS appearance VARCHAR(100),
  ADD COLUMN IF NOT EXISTS color VARCHAR(50),
  ADD COLUMN IF NOT EXISTS ph_value DECIMAL(4,2),
  ADD COLUMN IF NOT EXISTS flash_point VARCHAR(50),
  ADD COLUMN IF NOT EXISTS hsn_code VARCHAR(15),
  ADD COLUMN IF NOT EXISTS cas_number VARCHAR(50),
  ADD COLUMN IF NOT EXISTS shelf_life VARCHAR(50),
  ADD COLUMN IF NOT EXISTS storage_condition TEXT,
  ADD COLUMN IF NOT EXISTS hazardous ENUM('Yes','No') DEFAULT 'No',
  ADD COLUMN IF NOT EXISTS warehouse VARCHAR(100),
  ADD COLUMN IF NOT EXISTS opening_stock DECIMAL(12,3) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reorder_level DECIMAL(12,3) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_level DECIMAL(12,3) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS standard_cost DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_purchase_price DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS preferred_supplier_id INT,
  ADD COLUMN IF NOT EXISTS lead_time INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS application TEXT,
  ADD COLUMN IF NOT EXISTS remarks TEXT,
  ADD COLUMN IF NOT EXISTS attachment_path VARCHAR(255),
  ADD COLUMN IF NOT EXISTS status ENUM('Active','Inactive') DEFAULT 'Active';

-- Add index for preferred supplier FK
ALTER TABLE materials ADD INDEX idx_material_supplier (preferred_supplier_id);

-- ------------------------------------------------------------
-- 2. Sales Orders
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sales_orders (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  order_no      VARCHAR(20)   NOT NULL UNIQUE,
  customer_id   INT NOT NULL,
  order_date    DATE NOT NULL,
  delivery_date DATE,
  payment_terms VARCHAR(50),
  sales_person  VARCHAR(100),
  status        ENUM('Draft','Confirmed','Processing','Shipped','Delivered','Cancelled') DEFAULT 'Draft',
  sub_total     DECIMAL(14,2) DEFAULT 0,
  tax_percent   DECIMAL(5,2) DEFAULT 0,
  tax_amount    DECIMAL(14,2) DEFAULT 0,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(14,2) DEFAULT 0,
  grand_total   DECIMAL(14,2) DEFAULT 0,
  remarks       TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_so_customer FOREIGN KEY (customer_id)
    REFERENCES customers(id) ON DELETE RESTRICT,
  INDEX idx_so_customer (customer_id),
  INDEX idx_so_status (status),
  INDEX idx_so_date (order_date)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 3. Sales Order Items
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sales_order_items (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  order_id      INT NOT NULL,
  product_id    INT,
  description   VARCHAR(255),
  uom           VARCHAR(20),
  qty           DECIMAL(12,3) NOT NULL DEFAULT 0,
  rate          DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  tax_percent   DECIMAL(5,2) DEFAULT 0,
  tax_amount    DECIMAL(12,2) DEFAULT 0,
  amount        DECIMAL(14,2) NOT NULL DEFAULT 0,
  remarks       TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_soi_order FOREIGN KEY (order_id)
    REFERENCES sales_orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_soi_product FOREIGN KEY (product_id)
    REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_soi_order (order_id),
  INDEX idx_soi_product (product_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 4. Sales Order Deliveries
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sales_order_deliveries (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  order_id      INT NOT NULL,
  delivery_no   VARCHAR(20) NOT NULL,
  delivery_date DATE NOT NULL,
  vehicle_no    VARCHAR(30),
  driver_name   VARCHAR(100),
  driver_phone  VARCHAR(30),
  transport_name VARCHAR(100),
  lr_number     VARCHAR(50),
  lr_date       DATE,
  status        ENUM('Pending','In Transit','Delivered') DEFAULT 'Pending',
  delivered_qty DECIMAL(12,3) DEFAULT 0,
  remarks       TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT FK_sod_order FOREIGN KEY (order_id)
    REFERENCES sales_orders(id) ON DELETE CASCADE,
  INDEX idx_sod_order (order_id),
  INDEX idx_sod_delivery_no (delivery_no)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 5. Sales Order Delivery Items
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sales_order_delivery_items (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  delivery_id   INT NOT NULL,
  order_item_id INT NOT NULL,
  qty           DECIMAL(12,3) NOT NULL DEFAULT 0,
  remarks       TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sodi_delivery FOREIGN KEY (delivery_id)
    REFERENCES sales_order_deliveries(id) ON DELETE CASCADE,
  CONSTRAINT fk_sodi_item FOREIGN KEY (order_item_id)
    REFERENCES sales_order_items(id) ON DELETE CASCADE,
  INDEX idx_sodi_delivery (delivery_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 6. Sales Order Payments
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sales_order_payments (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  order_id      INT NOT NULL,
  receipt_no    VARCHAR(20) NOT NULL,
  receipt_date  DATE NOT NULL,
  payment_mode  ENUM('Cash','Bank Transfer','Cheque','Card','UPI','Other') DEFAULT 'Cash',
  amount        DECIMAL(14,2) NOT NULL DEFAULT 0,
  bank_name     VARCHAR(100),
  cheque_no     VARCHAR(50),
  cheque_date   DATE,
  transaction_ref VARCHAR(100),
  remarks       TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_sop_order FOREIGN KEY (order_id)
    REFERENCES sales_orders(id) ON DELETE CASCADE,
  INDEX idx_sop_order (order_id),
  INDEX idx_sop_receipt_no (receipt_no)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 7. Sales Order Attachments
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sales_order_attachments (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  order_id      INT NOT NULL,
  file_name     VARCHAR(255) NOT NULL,
  file_path     VARCHAR(500) NOT NULL,
  file_type     VARCHAR(50),
  file_size     INT DEFAULT 0,
  category      VARCHAR(50) DEFAULT 'General',
  remarks       TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_soa_order FOREIGN KEY (order_id)
    REFERENCES sales_orders(id) ON DELETE CASCADE,
  INDEX idx_soa_order (order_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 8. Recipe Attachments
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recipe_attachments (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  recipe_id     INT NOT NULL,
  file_name     VARCHAR(255) NOT NULL,
  file_path     VARCHAR(500) NOT NULL,
  file_type     VARCHAR(50),
  file_size     INT DEFAULT 0,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ra_recipe FOREIGN KEY (recipe_id)
    REFERENCES recipes(id) ON DELETE CASCADE,
  INDEX idx_ra_recipe (recipe_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 9. Alter recipe_process_stages to add machine_id FK
-- ------------------------------------------------------------
ALTER TABLE recipe_process_stages
  ADD COLUMN IF NOT EXISTS process_stage_id INT,
  ADD COLUMN IF NOT EXISTS machine_id INT,
  ADD COLUMN IF NOT EXISTS qc_check_boolean BOOLEAN DEFAULT FALSE;

-- Update qc_check_boolean from existing qc_check column
UPDATE recipe_process_stages SET qc_check_boolean = TRUE WHERE qc_check = 'Yes' OR qc_check = '1';

-- Add foreign keys
ALTER TABLE recipe_process_stages
  ADD CONSTRAINT fk_rps_stage FOREIGN KEY (process_stage_id)
    REFERENCES process_stages(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_rps_machine FOREIGN KEY (machine_id)
    REFERENCES machines(id) ON DELETE SET NULL;

-- ------------------------------------------------------------
-- 10. Alter recipes table to add product_id FK
-- ------------------------------------------------------------
ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS product_id INT,
  ADD CONSTRAINT fk_recipe_product FOREIGN KEY (product_id)
    REFERENCES products(id) ON DELETE SET NULL;

-- Add index
ALTER TABLE recipes ADD INDEX idx_recipe_product (product_id);

-- ------------------------------------------------------------
-- 11. Update business_units to make company_id NOT NULL (optional - can be enforced at app level)
-- ------------------------------------------------------------
-- Note: We handle this validation at the application level
-- ALTER TABLE business_units MODIFY company_id INT NOT NULL;
