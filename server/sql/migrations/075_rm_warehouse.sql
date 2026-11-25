-- Migration 075: RM Warehouse (raw leather QR tagging, grading, put-away, pick list & dispatch)
-- Idempotent: safe to run multiple times.

CREATE TABLE IF NOT EXISTS rmw_lots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lot_no VARCHAR(50) NOT NULL,
  supplier_name VARCHAR(200) NOT NULL,
  article VARCHAR(200) NOT NULL,
  receipt_date DATE NOT NULL,
  qty INT NOT NULL,
  qr_generated TINYINT(1) NOT NULL DEFAULT 0,
  qr_generated_at DATETIME NULL,
  created_by INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_rmw_lot_no (lot_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS rmw_pick_lists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pick_no VARCHAR(30) NOT NULL,
  dispatch_ref VARCHAR(100) NOT NULL,
  customer_name VARCHAR(200) NOT NULL,
  article VARCHAR(200) NULL,
  grade CHAR(1) NULL,
  qty INT NOT NULL,
  status ENUM('Open','Dispatched') NOT NULL DEFAULT 'Open',
  dispatched_at DATETIME NULL,
  created_by INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_rmw_pick_no (pick_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS rmw_pieces (
  id INT AUTO_INCREMENT PRIMARY KEY,
  piece_code VARCHAR(80) NOT NULL,
  lot_id INT NOT NULL,
  grade CHAR(1) NULL,
  sqft DECIMAL(10,2) NULL,
  graded_at DATETIME NULL,
  rack_location VARCHAR(100) NULL,
  stored_at DATETIME NULL,
  pick_list_id INT NULL,
  picked TINYINT(1) NOT NULL DEFAULT 0,
  status ENUM('Received','Graded','Stored','Allocated','Dispatched') NOT NULL DEFAULT 'Received',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_rmw_piece_code (piece_code),
  KEY idx_rmw_piece_lot (lot_id),
  KEY idx_rmw_piece_status (status),
  KEY idx_rmw_piece_pick (pick_list_id),
  CONSTRAINT fk_rmw_piece_lot FOREIGN KEY (lot_id) REFERENCES rmw_lots(id) ON DELETE CASCADE,
  CONSTRAINT fk_rmw_piece_pick FOREIGN KEY (pick_list_id) REFERENCES rmw_pick_lists(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
