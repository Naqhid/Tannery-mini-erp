-- Production Status Module (standalone, not linked to production plans)

-- Drop old tables if they exist (idempotent)
DROP TABLE IF EXISTS production_status_transactions;
DROP TABLE IF EXISTS production_status_orders;

-- 1. Production Status Orders - main order-level entries
CREATE TABLE production_status_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_no VARCHAR(50) NULL,
  customer_name VARCHAR(200) NULL,
  article VARCHAR(200) NULL,
  color VARCHAR(100) NULL,
  process_stage VARCHAR(100) NULL,
  issued_qty DECIMAL(15,2) NOT NULL DEFAULT 0,
  completed_qty DECIMAL(15,2) NOT NULL DEFAULT 0,
  balance_qty DECIMAL(15,2) NOT NULL DEFAULT 0,
  uom VARCHAR(20) DEFAULT 'Pcs',
  status VARCHAR(50) DEFAULT 'In-Process',
  remarks TEXT NULL,
  created_by INT NULL,
  updated_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  KEY idx_pso_order (order_no),
  KEY idx_pso_stage (process_stage),
  KEY idx_pso_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Production Status Transactions - daily input/output per order
CREATE TABLE production_status_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  production_status_order_id INT NOT NULL,
  transaction_no VARCHAR(50) NOT NULL,
  production_date DATE NOT NULL,
  opening_qty DECIMAL(15,2) NOT NULL DEFAULT 0,
  input_qty DECIMAL(15,2) NOT NULL DEFAULT 0,
  output_qty DECIMAL(15,2) NOT NULL DEFAULT 0,
  wip_qty DECIMAL(15,2) NOT NULL DEFAULT 0,
  uom VARCHAR(20) DEFAULT 'Pcs',
  remarks TEXT NULL,
  created_by INT NULL,
  updated_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  UNIQUE KEY uq_txn_no (transaction_no),
  KEY idx_pst_order (production_status_order_id),
  KEY idx_pst_date (production_date),
  CONSTRAINT fk_pst_ps_order FOREIGN KEY (production_status_order_id) REFERENCES production_status_orders(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
