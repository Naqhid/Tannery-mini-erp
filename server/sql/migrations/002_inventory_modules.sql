-- ============================================================
-- Migration 002: Inventory Modules
--   Warehouse/Store Master, Stock Opening Entry,
--   Material Receipt Entry, Stock Transfer Entry,
--   Material Issue to Production Batch
-- ============================================================

USE tannery_mini_erp;

-- ------------------------------------------------------------
-- 1. warehouses
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS warehouses (
  id                      INT AUTO_INCREMENT PRIMARY KEY,
  code                    VARCHAR(20)   NOT NULL UNIQUE,
  name                    VARCHAR(200)  NOT NULL,
  short_name              VARCHAR(50)   DEFAULT NULL,
  warehouse_type          ENUM('Raw Material','Finished Goods','Semi-Finished','WIP','Consumable','Quarantine') DEFAULT 'Raw Material',
  parent_warehouse_id     INT           DEFAULT NULL,
  is_default              ENUM('Yes','No') DEFAULT 'No',
  location_address        TEXT          DEFAULT NULL,
  city                    VARCHAR(100)  DEFAULT NULL,
  state                   VARCHAR(100)  DEFAULT NULL,
  country                 VARCHAR(100)  DEFAULT NULL,
  pincode                 VARCHAR(10)   DEFAULT NULL,
  phone                   VARCHAR(30)   DEFAULT NULL,
  email                   VARCHAR(150)  DEFAULT NULL,
  store_keeper            VARCHAR(150)  DEFAULT NULL,
  cost_center             VARCHAR(100)  DEFAULT NULL,
  opening_date            DATE          DEFAULT NULL,
  total_area              DECIMAL(12,2) DEFAULT NULL,
  usable_area             DECIMAL(12,2) DEFAULT NULL,
  storage_condition       ENUM('Dry','Cold','Humid','Refrigerated','Ambient') DEFAULT 'Dry',
  temperature_control     ENUM('Yes','No') DEFAULT 'No',
  humidity_control        ENUM('Yes','No') DEFAULT 'No',
  handling_equipment      VARCHAR(200)  DEFAULT NULL,
  material_movement_type  ENUM('FIFO','LIFO','FEFO','Weighted Average') DEFAULT 'FIFO',
  allow_negative_stock    TINYINT(1)    DEFAULT 0,
  notes                   TEXT          DEFAULT NULL,
  remarks                 TEXT          DEFAULT NULL,
  status                  ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_by              INT           DEFAULT NULL,
  updated_by              INT           DEFAULT NULL,
  created_at              TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at              TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_wh_parent FOREIGN KEY (parent_warehouse_id)
    REFERENCES warehouses(id) ON DELETE SET NULL,
  INDEX idx_wh_parent (parent_warehouse_id),
  INDEX idx_wh_status (status)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 2. warehouse_attachments
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS warehouse_attachments (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  warehouse_id    INT           NOT NULL,
  document_type   VARCHAR(100)  DEFAULT NULL,
  file_name       VARCHAR(255)  NOT NULL,
  file_path       VARCHAR(500)  NOT NULL,
  file_type       VARCHAR(50)   DEFAULT NULL,
  file_size       INT           DEFAULT 0,
  uploaded_by     INT           DEFAULT NULL,
  uploaded_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_wa_warehouse FOREIGN KEY (warehouse_id)
    REFERENCES warehouses(id) ON DELETE CASCADE,
  INDEX idx_wa_warehouse (warehouse_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 3. warehouse_stock (running stock summary per warehouse-material)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS warehouse_stock (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  warehouse_id    INT           NOT NULL,
  material_id     INT           NOT NULL,
  uom             VARCHAR(30)   DEFAULT NULL,
  current_qty     DECIMAL(14,3) DEFAULT 0,
  avg_unit_cost   DECIMAL(14,4) DEFAULT 0,
  updated_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ws_warehouse FOREIGN KEY (warehouse_id)
    REFERENCES warehouses(id),
  CONSTRAINT fk_ws_material FOREIGN KEY (material_id)
    REFERENCES materials(id),
  UNIQUE KEY uk_ws (warehouse_id, material_id),
  INDEX idx_ws_warehouse (warehouse_id),
  INDEX idx_ws_material (material_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 4. stock_ledger (every inventory movement)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stock_ledger (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  transaction_date  DATE          NOT NULL,
  transaction_type  ENUM('Opening','Receipt','Transfer In','Transfer Out','Issue','Adjustment') NOT NULL,
  reference_type    VARCHAR(50)   NOT NULL,
  reference_id      INT           NOT NULL,
  reference_no      VARCHAR(50)   DEFAULT NULL,
  warehouse_id      INT           NOT NULL,
  material_id       INT           NOT NULL,
  uom               VARCHAR(30)   DEFAULT NULL,
  batch_no          VARCHAR(100)  DEFAULT NULL,
  expiry_date       DATE          DEFAULT NULL,
  in_qty            DECIMAL(14,3) DEFAULT 0,
  out_qty           DECIMAL(14,3) DEFAULT 0,
  unit_cost         DECIMAL(14,4) DEFAULT 0,
  amount            DECIMAL(16,2) DEFAULT 0,
  balance_qty       DECIMAL(14,3) DEFAULT 0,
  remarks           TEXT          DEFAULT NULL,
  created_by        INT           DEFAULT NULL,
  created_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sl_warehouse FOREIGN KEY (warehouse_id)
    REFERENCES warehouses(id),
  CONSTRAINT fk_sl_material FOREIGN KEY (material_id)
    REFERENCES materials(id),
  INDEX idx_sl_warehouse (warehouse_id),
  INDEX idx_sl_material (material_id),
  INDEX idx_sl_ref (reference_type, reference_id),
  INDEX idx_sl_date (transaction_date)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 5. stock_opening_entries
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stock_opening_entries (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  entry_no        VARCHAR(30)   NOT NULL UNIQUE,
  entry_date      DATE          NOT NULL,
  opening_date    DATE          NOT NULL,
  financial_year  VARCHAR(20)   DEFAULT NULL,
  warehouse_id    INT           NOT NULL,
  reference_no    VARCHAR(100)  DEFAULT NULL,
  costing_method  ENUM('FIFO','LIFO','Weighted Average','Standard Cost') DEFAULT 'FIFO',
  remarks         TEXT          DEFAULT NULL,
  total_amount    DECIMAL(16,2) DEFAULT 0,
  status          ENUM('Draft','Posted','Cancelled') DEFAULT 'Draft',
  created_by      INT           DEFAULT NULL,
  updated_by      INT           DEFAULT NULL,
  created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_soe_warehouse FOREIGN KEY (warehouse_id)
    REFERENCES warehouses(id),
  INDEX idx_soe_warehouse (warehouse_id),
  INDEX idx_soe_status (status)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 6. stock_opening_items
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stock_opening_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  entry_id    INT           NOT NULL,
  material_id INT           NOT NULL,
  uom         VARCHAR(30)   DEFAULT NULL,
  quantity    DECIMAL(14,3) NOT NULL DEFAULT 0,
  unit_cost   DECIMAL(14,4) NOT NULL DEFAULT 0,
  amount      DECIMAL(16,2) NOT NULL DEFAULT 0,
  batch_no    VARCHAR(100)  DEFAULT NULL,
  expiry_date DATE          DEFAULT NULL,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_soitem_entry FOREIGN KEY (entry_id)
    REFERENCES stock_opening_entries(id) ON DELETE CASCADE,
  CONSTRAINT fk_soitem_material FOREIGN KEY (material_id)
    REFERENCES materials(id),
  INDEX idx_soitem_entry (entry_id),
  INDEX idx_soitem_material (material_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 7. material_receipts
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS material_receipts (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  receipt_no        VARCHAR(30)   NOT NULL UNIQUE,
  receipt_date      DATE          NOT NULL,
  receipt_type      ENUM('Purchase Order','Direct Purchase','Transfer','Sample','Return') DEFAULT 'Direct Purchase',
  supplier_id       INT           DEFAULT NULL,
  purchase_order_no VARCHAR(100)  DEFAULT NULL,
  po_date           DATE          DEFAULT NULL,
  challan_no        VARCHAR(100)  DEFAULT NULL,
  challan_date      DATE          DEFAULT NULL,
  lr_grn_no         VARCHAR(100)  DEFAULT NULL,
  lr_grn_date       DATE          DEFAULT NULL,
  transporter       VARCHAR(150)  DEFAULT NULL,
  gate_entry_no     VARCHAR(100)  DEFAULT NULL,
  warehouse_id      INT           NOT NULL,
  freight           DECIMAL(12,2) DEFAULT 0,
  loading_charges   DECIMAL(12,2) DEFAULT 0,
  other_charges     DECIMAL(12,2) DEFAULT 0,
  total_amount      DECIMAL(16,2) DEFAULT 0,
  grand_total       DECIMAL(16,2) DEFAULT 0,
  remarks           TEXT          DEFAULT NULL,
  status            ENUM('Draft','Posted','Cancelled') DEFAULT 'Draft',
  created_by        INT           DEFAULT NULL,
  updated_by        INT           DEFAULT NULL,
  created_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_mr_supplier FOREIGN KEY (supplier_id)
    REFERENCES suppliers(id) ON DELETE SET NULL,
  CONSTRAINT fk_mr_warehouse FOREIGN KEY (warehouse_id)
    REFERENCES warehouses(id),
  INDEX idx_mr_supplier (supplier_id),
  INDEX idx_mr_warehouse (warehouse_id),
  INDEX idx_mr_status (status)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 8. material_receipt_items
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS material_receipt_items (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  receipt_id    INT           NOT NULL,
  material_id   INT           NOT NULL,
  uom           VARCHAR(30)   DEFAULT NULL,
  order_qty     DECIMAL(14,3) DEFAULT 0,
  received_qty  DECIMAL(14,3) NOT NULL DEFAULT 0,
  rate          DECIMAL(14,4) NOT NULL DEFAULT 0,
  amount        DECIMAL(16,2) NOT NULL DEFAULT 0,
  batch_no      VARCHAR(100)  DEFAULT NULL,
  expiry_date   DATE          DEFAULT NULL,
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_mritem_receipt FOREIGN KEY (receipt_id)
    REFERENCES material_receipts(id) ON DELETE CASCADE,
  CONSTRAINT fk_mritem_material FOREIGN KEY (material_id)
    REFERENCES materials(id),
  INDEX idx_mritem_receipt (receipt_id),
  INDEX idx_mritem_material (material_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 9. stock_transfers
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stock_transfers (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  transfer_no         VARCHAR(30)   NOT NULL UNIQUE,
  transfer_date       DATE          NOT NULL,
  from_warehouse_id   INT           NOT NULL,
  to_warehouse_id     INT           NOT NULL,
  reference_no        VARCHAR(100)  DEFAULT NULL,
  reference_date      DATE          DEFAULT NULL,
  transporter         VARCHAR(150)  DEFAULT NULL,
  delivery_challan_no VARCHAR(100)  DEFAULT NULL,
  total_qty           DECIMAL(14,3) DEFAULT 0,
  total_amount        DECIMAL(16,2) DEFAULT 0,
  remarks             TEXT          DEFAULT NULL,
  status              ENUM('Draft','Posted','Cancelled') DEFAULT 'Draft',
  created_by          INT           DEFAULT NULL,
  updated_by          INT           DEFAULT NULL,
  created_at          TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_st_from_wh FOREIGN KEY (from_warehouse_id)
    REFERENCES warehouses(id),
  CONSTRAINT fk_st_to_wh FOREIGN KEY (to_warehouse_id)
    REFERENCES warehouses(id),
  INDEX idx_st_from_wh (from_warehouse_id),
  INDEX idx_st_to_wh (to_warehouse_id),
  INDEX idx_st_status (status)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 10. stock_transfer_items
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stock_transfer_items (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  transfer_id     INT           NOT NULL,
  material_id     INT           NOT NULL,
  uom             VARCHAR(30)   DEFAULT NULL,
  available_qty   DECIMAL(14,3) DEFAULT 0,
  transfer_qty    DECIMAL(14,3) NOT NULL DEFAULT 0,
  unit_cost       DECIMAL(14,4) DEFAULT 0,
  amount          DECIMAL(16,2) DEFAULT 0,
  batch_no        VARCHAR(100)  DEFAULT NULL,
  remarks         TEXT          DEFAULT NULL,
  created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_stitem_transfer FOREIGN KEY (transfer_id)
    REFERENCES stock_transfers(id) ON DELETE CASCADE,
  CONSTRAINT fk_stitem_material FOREIGN KEY (material_id)
    REFERENCES materials(id),
  INDEX idx_stitem_transfer (transfer_id),
  INDEX idx_stitem_material (material_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 11. material_issues
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS material_issues (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  issue_no              VARCHAR(30)   NOT NULL UNIQUE,
  issue_date            DATE          NOT NULL,
  department            VARCHAR(150)  DEFAULT NULL,
  job_order_no          VARCHAR(100)  DEFAULT NULL,
  production_batch      VARCHAR(100)  DEFAULT NULL,
  batch_qty             DECIMAL(14,3) DEFAULT 0,
  batch_uom             VARCHAR(30)   DEFAULT NULL,
  batch_description     TEXT          DEFAULT NULL,
  costing_method        ENUM('FIFO','LIFO','Weighted Average','Standard Cost') DEFAULT 'FIFO',
  warehouse_id          INT           NOT NULL,
  required_date         DATE          DEFAULT NULL,
  issued_by             VARCHAR(150)  DEFAULT NULL,
  loading_unloading     DECIMAL(12,2) DEFAULT 0,
  other_charges         DECIMAL(12,2) DEFAULT 0,
  total_material_cost   DECIMAL(16,2) DEFAULT 0,
  grand_total           DECIMAL(16,2) DEFAULT 0,
  remarks               TEXT          DEFAULT NULL,
  status                ENUM('Draft','Posted','Cancelled') DEFAULT 'Draft',
  created_by            INT           DEFAULT NULL,
  updated_by            INT           DEFAULT NULL,
  created_at            TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_mi_warehouse FOREIGN KEY (warehouse_id)
    REFERENCES warehouses(id),
  INDEX idx_mi_warehouse (warehouse_id),
  INDEX idx_mi_status (status)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 12. material_issue_items
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS material_issue_items (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  issue_id      INT           NOT NULL,
  material_id   INT           NOT NULL,
  uom           VARCHAR(30)   DEFAULT NULL,
  required_qty  DECIMAL(14,3) DEFAULT 0,
  issue_qty     DECIMAL(14,3) NOT NULL DEFAULT 0,
  unit_cost     DECIMAL(14,4) DEFAULT 0,
  amount        DECIMAL(16,2) DEFAULT 0,
  remarks       TEXT          DEFAULT NULL,
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_miitem_issue FOREIGN KEY (issue_id)
    REFERENCES material_issues(id) ON DELETE CASCADE,
  CONSTRAINT fk_miitem_material FOREIGN KEY (material_id)
    REFERENCES materials(id),
  INDEX idx_miitem_issue (issue_id),
  INDEX idx_miitem_material (material_id)
) ENGINE=InnoDB;
