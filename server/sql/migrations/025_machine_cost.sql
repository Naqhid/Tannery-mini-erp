-- Machine Cost Module: Per-order machine costing with line items
-- Linked to production_plans (which contain customer, article, color, order qty, etc.)

-- 1. Machine Cost Header table (one per production plan / order)
CREATE TABLE IF NOT EXISTS machine_cost_headers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_no VARCHAR(50) NOT NULL,
  production_plan_id INT NOT NULL,
  production_date DATE NOT NULL,
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
  UNIQUE KEY uq_mc_transaction_no (transaction_no),
  KEY idx_mch_plan (production_plan_id),
  KEY idx_mch_status (status),
  CONSTRAINT fk_mch_plan FOREIGN KEY (production_plan_id) REFERENCES production_plans(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Machine Cost Items table (machine line items)
CREATE TABLE IF NOT EXISTS machine_cost_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  machine_cost_id INT NOT NULL,
  machine_name VARCHAR(200) NOT NULL,
  uom VARCHAR(50) NOT NULL DEFAULT 'Sq.Ft.',
  amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  cost_per_piece DECIMAL(15,4) NOT NULL DEFAULT 0,
  remarks VARCHAR(500) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_mci_header (machine_cost_id),
  CONSTRAINT fk_mci_header FOREIGN KEY (machine_cost_id) REFERENCES machine_cost_headers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
