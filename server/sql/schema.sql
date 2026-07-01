-- ============================================================
-- Tannery Mini ERP - Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS tannery_mini_erp
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE tannery_mini_erp;

-- ------------------------------------------------------------
-- 1. customers
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(20)   NOT NULL UNIQUE,
  name          VARCHAR(200)  NOT NULL,
  contact_person VARCHAR(150),
  phone         VARCHAR(30),
  email         VARCHAR(150),
  alt_phone     VARCHAR(30),
  city          VARCHAR(100),
  state         VARCHAR(100),
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  category      ENUM('export','domestic','wholesale') DEFAULT 'domestic',
  currency      ENUM('inr','usd','eur') DEFAULT 'inr',
  billing_address  TEXT,
  shipping_address TEXT,
  pin_code      VARCHAR(10),
  gstin         VARCHAR(20),
  pan           VARCHAR(15),
  payment_terms VARCHAR(10),
  credit_limit  VARCHAR(50),
  notes         TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 2. products
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(20)   NOT NULL UNIQUE,
  name          VARCHAR(200)  NOT NULL,
  category      VARCHAR(50)   NOT NULL DEFAULT 'Finished Leather',
  leather_type  ENUM('cow','buffalo','goat','sheep') NOT NULL DEFAULT 'cow',
  uom           VARCHAR(20)   DEFAULT 'Sq. Ft.',
  thickness     VARCHAR(30),
  color         VARCHAR(50),
  finish_type   VARCHAR(50),
  description   TEXT,
  standard_size VARCHAR(100),
  grade         ENUM('a','b','c') DEFAULT 'a',
  sales_price   DECIMAL(10,2) DEFAULT 0,
  hsn_code      VARCHAR(15),
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 3. suppliers
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS suppliers (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(20)   NOT NULL UNIQUE,
  name          VARCHAR(200)  NOT NULL,
  contact_person VARCHAR(150),
  phone         VARCHAR(30),
  email         VARCHAR(150),
  alt_phone     VARCHAR(30),
  city          VARCHAR(100),
  state         VARCHAR(100),
  address       TEXT,
  pincode       VARCHAR(10),
  website       VARCHAR(150),
  category      ENUM('chemical','raw','dye','finishing') DEFAULT 'chemical',
  supply_type   ENUM('raw','chemical','dye','finishing') DEFAULT 'chemical',
  gstin         VARCHAR(20),
  pan           VARCHAR(15),
  payment_terms VARCHAR(10),
  bank_name     VARCHAR(100),
  bank_account  VARCHAR(30),
  ifsc_code     VARCHAR(15),
  notes         TEXT,
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 4. materials  (referenced by pricing, recipe items, BOM items)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS materials (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(20)   NOT NULL UNIQUE,
  name          VARCHAR(200)  NOT NULL,
  uom           VARCHAR(20)  DEFAULT 'Kg',
  type          ENUM('Chemical','Raw','Dye','Finishing') DEFAULT 'Chemical',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 5. supplier_pricing
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS supplier_pricing (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  supplier_id   INT NOT NULL,
  material_id   INT NOT NULL,
  uom           VARCHAR(20)  DEFAULT 'Kg',
  price         DECIMAL(10,2) NOT NULL DEFAULT 0,
  valid_from    DATE,
  valid_to      DATE,
  status        ENUM('Approved','Pending') NOT NULL DEFAULT 'Pending',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pricing_supplier FOREIGN KEY (supplier_id)
    REFERENCES suppliers(id) ON DELETE CASCADE,
  CONSTRAINT fk_pricing_material FOREIGN KEY (material_id)
    REFERENCES materials(id) ON DELETE CASCADE,
  INDEX idx_pricing_supplier (supplier_id),
  INDEX idx_pricing_material (material_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 6. recipes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recipes (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(20)   NOT NULL UNIQUE,
  name          VARCHAR(200)  NOT NULL,
  leather_type  ENUM('cow','buffalo','goat','sheep') DEFAULT 'cow',
  thickness     VARCHAR(30),
  process_type  ENUM('finishing','tanning','dyeing') DEFAULT 'finishing',
  color         VARCHAR(50),
  finish_type   VARCHAR(50),
  uom           VARCHAR(20)  DEFAULT 'Sq. Ft.',
  status        ENUM('active','draft','inactive') DEFAULT 'draft',
  valid_from    DATE,
  valid_to      DATE,
  version       INT DEFAULT 1,
  description   TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 7. recipe_items
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recipe_items (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  recipe_id     INT NOT NULL,
  material_id   INT NOT NULL,
  qty           DECIMAL(12,3) NOT NULL DEFAULT 0,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ri_recipe FOREIGN KEY (recipe_id)
    REFERENCES recipes(id) ON DELETE CASCADE,
  CONSTRAINT fk_ri_material FOREIGN KEY (material_id)
    REFERENCES materials(id) ON DELETE RESTRICT,
  INDEX idx_ri_recipe (recipe_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 8. recipe_process_stages
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recipe_process_stages (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  recipe_id     INT NOT NULL,
  seq           INT NOT NULL DEFAULT 1,
  process_stage VARCHAR(150) NOT NULL,
  machine       VARCHAR(150),
  duration      INT DEFAULT 0,
  temperature   VARCHAR(20),
  speed         VARCHAR(30),
  qc_check      VARCHAR(100),
  remarks       TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ps_recipe FOREIGN KEY (recipe_id)
    REFERENCES recipes(id) ON DELETE CASCADE,
  INDEX idx_ps_recipe (recipe_id),
  INDEX idx_ps_seq (recipe_id, seq)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 9. boms
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS boms (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(20)   NOT NULL UNIQUE,
  name          VARCHAR(200)  NOT NULL,
  product_id    INT,
  recipe_id     INT,
  leather_type  ENUM('cow','buffalo','goat','sheep') DEFAULT 'cow',
  process_type  ENUM('finishing','tanning','dyeing') DEFAULT 'finishing',
  thickness     VARCHAR(30),
  uom           VARCHAR(20)  DEFAULT 'Sq. Ft.',
  valid_from    DATE,
  valid_to      DATE,
  status        ENUM('Active','Inactive','Draft') DEFAULT 'Draft',
  description   TEXT,
  version       INT DEFAULT 1,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_bom_product FOREIGN KEY (product_id)
    REFERENCES products(id) ON DELETE SET NULL,
  CONSTRAINT fk_bom_recipe FOREIGN KEY (recipe_id)
    REFERENCES recipes(id) ON DELETE SET NULL,
  INDEX idx_bom_product (product_id),
  INDEX idx_bom_recipe (recipe_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 10. bom_items
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bom_items (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  bom_id        INT NOT NULL,
  material_id   INT NOT NULL,
  type          VARCHAR(30) DEFAULT 'Chemical',
  uom           VARCHAR(20) DEFAULT 'Kg',
  qty           DECIMAL(12,3) NOT NULL DEFAULT 0,
  unit_cost     DECIMAL(10,2) NOT NULL DEFAULT 0,
  amount        DECIMAL(12,2) NOT NULL DEFAULT 0,
  remarks       TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_bi_bom FOREIGN KEY (bom_id)
    REFERENCES boms(id) ON DELETE CASCADE,
  CONSTRAINT fk_bi_material FOREIGN KEY (material_id)
    REFERENCES materials(id) ON DELETE RESTRICT,
  INDEX idx_bi_bom (bom_id)
) ENGINE=InnoDB;
