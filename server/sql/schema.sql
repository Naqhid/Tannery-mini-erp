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
  country       VARCHAR(100),
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
  country       VARCHAR(100),
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
  remarks       TEXT,
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

-- ------------------------------------------------------------
-- 11. countries
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS countries (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(20)   NOT NULL UNIQUE,
  name          VARCHAR(200)  NOT NULL,
  phone_code    VARCHAR(10),
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 12. states
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS states (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(20)   NOT NULL UNIQUE,
  name          VARCHAR(200)  NOT NULL,
  country_id    INT NOT NULL,
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_state_country FOREIGN KEY (country_id)
    REFERENCES countries(id) ON DELETE CASCADE,
  INDEX idx_state_country (country_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 13. cities
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cities (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(200)  NOT NULL,
  state_id      INT NOT NULL,
  country_id    INT NOT NULL,
  pincode       VARCHAR(10),
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_city_state FOREIGN KEY (state_id)
    REFERENCES states(id) ON DELETE CASCADE,
  CONSTRAINT fk_city_country FOREIGN KEY (country_id)
    REFERENCES countries(id) ON DELETE CASCADE,
  INDEX idx_city_state (state_id),
  INDEX idx_city_country (country_id)
) ENGINE=InnoDB;


-- ------------------------------------------------------------
-- 14. product_categories
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_categories (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(20)   NOT NULL UNIQUE,
  name          VARCHAR(200)  NOT NULL,
  description   TEXT,
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 15. leather_types
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leather_types (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(20)   NOT NULL UNIQUE,
  name          VARCHAR(200)  NOT NULL,
  description   TEXT,
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 16. uom (Unit of Measurement)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS uom (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(20)   NOT NULL UNIQUE,
  name          VARCHAR(200)  NOT NULL,
  description   TEXT,
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 17. thickness
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS thickness (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(20)   NOT NULL UNIQUE,
  name          VARCHAR(200)  NOT NULL,
  value_mm      DECIMAL(5,2),
  description   TEXT,
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 18. standard_sizes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS standard_sizes (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(20)   NOT NULL UNIQUE,
  name          VARCHAR(200)  NOT NULL,
  description   TEXT,
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 19. colors
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS colors (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(20)   NOT NULL UNIQUE,
  name          VARCHAR(200)  NOT NULL,
  hex_code      VARCHAR(10),
  description   TEXT,
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 20. finish_types
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS finish_types (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(20)   NOT NULL UNIQUE,
  name          VARCHAR(200)  NOT NULL,
  description   TEXT,
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 21. grades
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS grades (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(20)   NOT NULL UNIQUE,
  name          VARCHAR(200)  NOT NULL,
  rank          INT DEFAULT 0,
  description   TEXT,
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 22. hsn_codes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hsn_codes (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(20)   NOT NULL UNIQUE,
  name          VARCHAR(200)  NOT NULL,
  description   TEXT,
  gst_rate      DECIMAL(5,2) DEFAULT 0,
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 23. process_stages
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS process_stages (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(20)   NOT NULL UNIQUE,
  name          VARCHAR(200)  NOT NULL,
  description   TEXT,
  seq           INT DEFAULT 0,
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 24. machines
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS machines (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(20)   NOT NULL UNIQUE,
  name          VARCHAR(200)  NOT NULL,
  machine_type  VARCHAR(100),
  capacity      VARCHAR(100),
  description   TEXT,
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 25. roles
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(20)   NOT NULL UNIQUE,
  name          VARCHAR(200)  NOT NULL,
  description   TEXT,
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 26. companies
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS companies (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(20)   NOT NULL UNIQUE,
  name          VARCHAR(200)  NOT NULL,
  address       TEXT,
  city          VARCHAR(100),
  state         VARCHAR(100),
  country       VARCHAR(100),
  phone         VARCHAR(30),
  email         VARCHAR(150),
  gstin         VARCHAR(20),
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 27. business_units
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS business_units (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(20)   NOT NULL UNIQUE,
  name          VARCHAR(200)  NOT NULL,
  company_id    INT,
  address       TEXT,
  city          VARCHAR(100),
  state         VARCHAR(100),
  phone         VARCHAR(30),
  email         VARCHAR(150),
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_bu_company FOREIGN KEY (company_id)
    REFERENCES companies(id) ON DELETE SET NULL,
  INDEX idx_bu_company (company_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 28. users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(100)  NOT NULL UNIQUE,
  password      VARCHAR(255)  NOT NULL,
  name          VARCHAR(200)  NOT NULL,
  email         VARCHAR(150),
  phone         VARCHAR(30),
  role_id       INT,
  company_id    INT,
  business_unit_id INT,
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_role FOREIGN KEY (role_id)
    REFERENCES roles(id) ON DELETE SET NULL,
  CONSTRAINT fk_user_company FOREIGN KEY (company_id)
    REFERENCES companies(id) ON DELETE SET NULL,
  CONSTRAINT fk_user_bu FOREIGN KEY (business_unit_id)
    REFERENCES business_units(id) ON DELETE SET NULL
) ENGINE=InnoDB;
