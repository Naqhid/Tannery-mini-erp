-- Migration 059: Supplier outbound deliveries (returns to supplier)
-- ===================================================================
CREATE TABLE IF NOT EXISTS outbound_deliveries (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  outbound_no VARCHAR(50) NOT NULL UNIQUE,
  outbound_date DATE NOT NULL,
  from_warehouse_id INT NOT NULL,
  supplier_id INT NOT NULL,
  reference_no VARCHAR(100) NULL,
  reference_date DATE NULL,
  transporter VARCHAR(150) NULL,
  delivery_challan_no VARCHAR(100) NULL,
  total_qty DECIMAL(18,4) NOT NULL DEFAULT 0,
  total_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
  remarks TEXT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'Posted',
  created_by INT NULL,
  updated_by INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_outbound_date (outbound_date),
  INDEX idx_outbound_warehouse (from_warehouse_id),
  INDEX idx_outbound_supplier (supplier_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS outbound_delivery_items (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  outbound_delivery_id INT NOT NULL,
  material_id INT NOT NULL,
  uom VARCHAR(50) NULL,
  available_qty DECIMAL(18,4) NOT NULL DEFAULT 0,
  outbound_qty DECIMAL(18,4) NOT NULL DEFAULT 0,
  unit_cost DECIMAL(18,4) NOT NULL DEFAULT 0,
  amount DECIMAL(18,2) NOT NULL DEFAULT 0,
  batch_no VARCHAR(100) NULL,
  remarks TEXT NULL,
  INDEX idx_outbound_item_header (outbound_delivery_id),
  INDEX idx_outbound_item_material (material_id),
  CONSTRAINT fk_outbound_item_header FOREIGN KEY (outbound_delivery_id)
    REFERENCES outbound_deliveries(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
