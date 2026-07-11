-- ============================================================
-- Migration 001: New Modules - Chemical/Material Master,
--   Sales Orders, Delivery & Shipping, Payment Details,
--   Attachments, and Business Unit / Company relationship
-- ============================================================

USE tannery_mini_erp;

-- ------------------------------------------------------------
-- 1. Expand materials table
-- ------------------------------------------------------------
ALTER TABLE materials
  MODIFY COLUMN type VARCHAR(100) DEFAULT 'Chemical',
  ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS chemical_group VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS appearance VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS color VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ph_value VARCHAR(50) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS flash_point VARCHAR(50) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS hsn_code VARCHAR(50) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS cas_number VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS shelf_life INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS storage_condition VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS hazardous TINYINT(1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS default_warehouse VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS opening_stock DECIMAL(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS opening_stock_uom VARCHAR(50) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS current_stock DECIMAL(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS reorder_level DECIMAL(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS maximum_level DECIMAL(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS standard_cost DECIMAL(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS last_purchase_price DECIMAL(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS preferred_supplier_id INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS lead_time INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS description TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS application TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS remarks TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS attachment_path VARCHAR(500) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS uom_id INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS status ENUM('Active','Inactive') DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS created_by INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS updated_by INT DEFAULT NULL;

-- ------------------------------------------------------------
-- 2. Enforce company_id required in business_units at app level
--    (DB already has FK; we keep NULL allowed for safety)
-- ------------------------------------------------------------

-- ------------------------------------------------------------
-- 3. recipe_attachments table (if not exists)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recipe_attachments (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  recipe_id     INT NOT NULL,
  file_name     VARCHAR(255) NOT NULL,
  file_path     VARCHAR(500) NOT NULL,
  file_type     VARCHAR(50)  DEFAULT NULL,
  file_size     INT          DEFAULT 0,
  uploaded_by   INT          DEFAULT NULL,
  uploaded_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rattach_recipe FOREIGN KEY (recipe_id)
    REFERENCES recipes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 4. material_attachments table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS material_attachments (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  material_id   INT NOT NULL,
  file_name     VARCHAR(255) NOT NULL,
  file_path     VARCHAR(500) NOT NULL,
  file_type     VARCHAR(50)  DEFAULT NULL,
  file_size     INT          DEFAULT 0,
  uploaded_by   INT          DEFAULT NULL,
  uploaded_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_mattach_material FOREIGN KEY (material_id)
    REFERENCES materials(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 5. sales_orders table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sales_orders (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  order_no        VARCHAR(30)   NOT NULL UNIQUE,
  customer_id     INT           NOT NULL,
  order_date      DATE          NOT NULL,
  delivery_date   DATE          DEFAULT NULL,
  customer_po_no  VARCHAR(100)  DEFAULT NULL,
  order_type      VARCHAR(50)   DEFAULT 'Standard',
  contact_person  VARCHAR(100)  DEFAULT NULL,
  delivery_address TEXT         DEFAULT NULL,
  payment_terms   VARCHAR(50)   DEFAULT NULL,
  currency        VARCHAR(20)   DEFAULT 'INR',
  price_list      VARCHAR(100)  DEFAULT NULL,
  sales_person    VARCHAR(100)  DEFAULT NULL,
  status          ENUM('Draft','Confirmed','Processing','Shipped','Delivered','Cancelled') DEFAULT 'Draft',
  terms_conditions TEXT         DEFAULT NULL,
  discount        DECIMAL(12,2) DEFAULT 0.00,
  freight         DECIMAL(12,2) DEFAULT 0.00,
  tax_percent     DECIMAL(5,2)  DEFAULT 18.00,
  sub_total       DECIMAL(14,2) DEFAULT 0.00,
  tax_amount      DECIMAL(12,2) DEFAULT 0.00,
  grand_total     DECIMAL(14,2) DEFAULT 0.00,
  remarks         TEXT          DEFAULT NULL,
  created_by      INT           DEFAULT NULL,
  updated_by      INT           DEFAULT NULL,
  created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_so_customer FOREIGN KEY (customer_id)
    REFERENCES customers(id),
  INDEX idx_so_customer (customer_id),
  INDEX idx_so_status (status),
  INDEX idx_so_order_date (order_date)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 6. sales_order_items table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sales_order_items (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  sales_order_id    INT           NOT NULL,
  item_code         VARCHAR(50)   DEFAULT NULL,
  item_description  VARCHAR(255)  DEFAULT NULL,
  product_id        INT           DEFAULT NULL,
  leather_type_id   INT           DEFAULT NULL,
  leather_type      VARCHAR(100)  DEFAULT NULL,
  finish_color      VARCHAR(100)  DEFAULT NULL,
  thickness         VARCHAR(50)   DEFAULT NULL,
  uom               VARCHAR(50)   DEFAULT NULL,
  quantity          DECIMAL(12,2) DEFAULT 0.00,
  unit_price        DECIMAL(12,4) DEFAULT 0.0000,
  discount_percent  DECIMAL(5,2)  DEFAULT 0.00,
  amount            DECIMAL(14,2) DEFAULT 0.00,
  created_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_soi_order FOREIGN KEY (sales_order_id)
    REFERENCES sales_orders(id) ON DELETE CASCADE,
  INDEX idx_soi_order (sales_order_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 7. delivery_notes table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS delivery_notes (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  delivery_no         VARCHAR(30)  NOT NULL UNIQUE,
  sales_order_id      INT          NOT NULL,
  delivery_date       DATE         DEFAULT NULL,
  delivery_from       VARCHAR(100) DEFAULT NULL,
  transporter         VARCHAR(100) DEFAULT NULL,
  vehicle_no          VARCHAR(50)  DEFAULT NULL,
  lr_no               VARCHAR(100) DEFAULT NULL,
  no_of_packages      INT          DEFAULT NULL,
  delivery_to         VARCHAR(255) DEFAULT NULL,
  delivery_instructions TEXT       DEFAULT NULL,
  status              ENUM('Draft','Dispatched','Delivered') DEFAULT 'Draft',
  created_by          INT          DEFAULT NULL,
  updated_by          INT          DEFAULT NULL,
  created_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_dn_order FOREIGN KEY (sales_order_id)
    REFERENCES sales_orders(id),
  INDEX idx_dn_order (sales_order_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 8. delivery_note_items table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS delivery_note_items (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  delivery_note_id      INT           NOT NULL,
  sales_order_item_id   INT           DEFAULT NULL,
  item_code             VARCHAR(50)   DEFAULT NULL,
  item_description      VARCHAR(255)  DEFAULT NULL,
  uom                   VARCHAR(50)   DEFAULT NULL,
  ordered_qty           DECIMAL(12,2) DEFAULT 0.00,
  shipped_qty           DECIMAL(12,2) DEFAULT 0.00,
  pending_qty           DECIMAL(12,2) DEFAULT 0.00,
  created_at            TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_dni_note FOREIGN KEY (delivery_note_id)
    REFERENCES delivery_notes(id) ON DELETE CASCADE,
  INDEX idx_dni_note (delivery_note_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 9. payment_receipts table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payment_receipts (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  receipt_no      VARCHAR(30)   NOT NULL UNIQUE,
  sales_order_id  INT           NOT NULL,
  receipt_date    DATE          NOT NULL,
  payment_mode    VARCHAR(50)   DEFAULT 'Bank Transfer',
  amount          DECIMAL(14,2) DEFAULT 0.00,
  remarks         TEXT          DEFAULT NULL,
  created_by      INT           DEFAULT NULL,
  created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pr_order FOREIGN KEY (sales_order_id)
    REFERENCES sales_orders(id),
  INDEX idx_pr_order (sales_order_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 10. invoices table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoices (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  invoice_no      VARCHAR(30)   NOT NULL UNIQUE,
  sales_order_id  INT           NOT NULL,
  invoice_date    DATE          DEFAULT NULL,
  invoice_amount  DECIMAL(14,2) DEFAULT 0.00,
  paid_amount     DECIMAL(14,2) DEFAULT 0.00,
  balance         DECIMAL(14,2) DEFAULT 0.00,
  status          ENUM('Pending','Partially Paid','Paid','Cancelled') DEFAULT 'Pending',
  due_date        DATE          DEFAULT NULL,
  created_by      INT           DEFAULT NULL,
  created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_inv_order FOREIGN KEY (sales_order_id)
    REFERENCES sales_orders(id),
  INDEX idx_inv_order (sales_order_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 11. sales_order_attachments table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sales_order_attachments (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  sales_order_id  INT           NOT NULL,
  file_name       VARCHAR(255)  NOT NULL,
  file_path       VARCHAR(500)  NOT NULL,
  file_type       VARCHAR(50)   DEFAULT NULL,
  category        VARCHAR(100)  DEFAULT 'Others',
  uploaded_by     INT           DEFAULT NULL,
  remarks         TEXT          DEFAULT NULL,
  uploaded_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_soa_order FOREIGN KEY (sales_order_id)
    REFERENCES sales_orders(id) ON DELETE CASCADE,
  INDEX idx_soa_order (sales_order_id)
) ENGINE=InnoDB;
