-- General Cost Module: Per-order costing with cost components
-- Linked to production_plans (which contain customer, article, color, order qty, etc.)

-- 1. General Cost Header table (one per production plan / order)
CREATE TABLE IF NOT EXISTS general_cost_headers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_no VARCHAR(50) NOT NULL,
  production_plan_id INT NOT NULL,
  production_date DATE NOT NULL,
  production_qty DECIMAL(15,2) NOT NULL DEFAULT 0,
  process_stage VARCHAR(100) NULL DEFAULT 'All',
  total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_cost_per_piece DECIMAL(15,4) NOT NULL DEFAULT 0,
  cost_after_adjustments DECIMAL(15,4) NOT NULL DEFAULT 0,
  status ENUM('Pending','In-Process','Completed','Posted') NOT NULL DEFAULT 'Pending',
  remarks TEXT NULL,
  created_by INT NULL,
  updated_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_transaction_no (transaction_no),
  KEY idx_gch_plan (production_plan_id),
  KEY idx_gch_status (status),
  CONSTRAINT fk_gch_plan FOREIGN KEY (production_plan_id) REFERENCES production_plans(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. General Cost Items table (cost component line items)
CREATE TABLE IF NOT EXISTS general_cost_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  general_cost_id INT NOT NULL,
  cost_category VARCHAR(200) NOT NULL,
  uom VARCHAR(50) NOT NULL DEFAULT 'Sq.Ft.',
  amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  cost_per_piece DECIMAL(15,4) NOT NULL DEFAULT 0,
  remarks VARCHAR(500) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_gci_header (general_cost_id),
  CONSTRAINT fk_gci_header FOREIGN KEY (general_cost_id) REFERENCES general_cost_headers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
