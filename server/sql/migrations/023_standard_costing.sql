-- Standard Costing Module: Tables for cost sheets and cost components
-- Safe for existing production data (IF NOT EXISTS, conditional checks)

-- 1. Standard Cost Sheets table
CREATE TABLE IF NOT EXISTS standard_cost_sheets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  bom_id INT NOT NULL,
  bom_type VARCHAR(50) NOT NULL,
  bom_version INT NOT NULL DEFAULT 1,
  cost_sheet_no VARCHAR(50) NOT NULL,
  cost_sheet_version INT NOT NULL DEFAULT 1,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  basis_unit VARCHAR(20) NOT NULL DEFAULT 'Sq.Ft.',
  total_bom_cost DECIMAL(15,4) NOT NULL DEFAULT 0,
  total_other_cost DECIMAL(15,4) NOT NULL DEFAULT 0,
  standard_cost DECIMAL(15,4) NOT NULL DEFAULT 0,
  status ENUM('Draft','Approved','Posted') NOT NULL DEFAULT 'Draft',
  prepared_by INT NULL,
  created_by INT NULL,
  updated_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_cost_sheet_no (cost_sheet_no),
  UNIQUE KEY uq_product_bom_version (product_id, bom_id, cost_sheet_version),
  KEY idx_scs_product (product_id),
  KEY idx_scs_bom (bom_id),
  KEY idx_scs_status (status),
  CONSTRAINT fk_scs_product FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT fk_scs_bom FOREIGN KEY (bom_id) REFERENCES boms(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Standard Cost Items table (individual cost component line items)
CREATE TABLE IF NOT EXISTS standard_cost_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cost_sheet_id INT NOT NULL,
  cost_component_id INT NOT NULL,
  cost_component_group_id INT NULL,
  cost_value DECIMAL(15,4) NOT NULL DEFAULT 0,
  cost_percentage DECIMAL(7,4) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_sci_sheet (cost_sheet_id),
  KEY idx_sci_component (cost_component_id),
  CONSTRAINT fk_sci_sheet FOREIGN KEY (cost_sheet_id) REFERENCES standard_cost_sheets(id) ON DELETE CASCADE,
  CONSTRAINT fk_sci_component FOREIGN KEY (cost_component_id) REFERENCES materials(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
