-- Material transaction ledger based on Materials_Master 21Aug26.xlsx
CREATE TABLE IF NOT EXISTS material_transactions (
  transaction_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  transaction_date DATETIME NOT NULL,
  transaction_type VARCHAR(30) NOT NULL,
  reference_no VARCHAR(30) NULL,
  warehouse_id BIGINT NOT NULL,
  item_id BIGINT NOT NULL,
  batch_no VARCHAR(30) NULL,
  receipt_qty DECIMAL(18,3) NOT NULL DEFAULT 0,
  opening_qty DECIMAL(18,3) NOT NULL DEFAULT 0,
  receipt_value DECIMAL(18,2) NOT NULL DEFAULT 0,
  issue_qty DECIMAL(18,3) NOT NULL DEFAULT 0,
  issue_value DECIMAL(18,2) NOT NULL DEFAULT 0,
  balance_qty DECIMAL(18,3) NOT NULL DEFAULT 0,
  avg_rate DECIMAL(18,6) NOT NULL DEFAULT 0,
  balance_value DECIMAL(18,2) NOT NULL DEFAULT 0,
  reference_type VARCHAR(50) NULL,
  reference_id BIGINT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_mt_item_wh_date (item_id, warehouse_id, transaction_date, transaction_id),
  KEY idx_mt_reference (reference_type, reference_id),
  KEY idx_mt_date (transaction_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE material_issues ADD COLUMN article VARCHAR(255) NULL AFTER production_batch;
ALTER TABLE material_issues ADD COLUMN color VARCHAR(100) NULL AFTER article;
ALTER TABLE material_issues ADD COLUMN planned_date DATE NULL AFTER required_date;
