-- ============================================================
-- Tannery Mini ERP - Database Schema Updates
-- Apply these changes to the existing database
-- ============================================================

USE tannery_mini_erp;

-- ============================================================
-- 1. USERS & AUTHENTICATION
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50)   NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  email         VARCHAR(150),
  full_name     VARCHAR(200)  NOT NULL,
  role_id       INT,
  company_id    INT,
  business_unit_id INT,
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  last_login    TIMESTAMP NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by    INT,
  updated_by    INT,
  INDEX idx_user_username (username),
  INDEX idx_user_status (status)
) ENGINE=InnoDB;

-- ============================================================
-- 2. ROLES
-- ============================================================

CREATE TABLE IF NOT EXISTS roles (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(30)   NOT NULL UNIQUE,
  name          VARCHAR(100)  NOT NULL,
  description   TEXT,
  permissions   JSON,
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by    INT,
  updated_by    INT,
  INDEX idx_role_code (code)
) ENGINE=InnoDB;

-- ============================================================
-- 3. COMPANIES
-- ============================================================

CREATE TABLE IF NOT EXISTS companies (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(30)   NOT NULL UNIQUE,
  name          VARCHAR(200)  NOT NULL,
  address       TEXT,
  city          VARCHAR(100),
  state         VARCHAR(100),
  country       VARCHAR(100),
  pin_code      VARCHAR(10),
  phone         VARCHAR(30),
  email         VARCHAR(150),
  gstin         VARCHAR(20),
  pan           VARCHAR(15),
  website       VARCHAR(150),
  logo          TEXT,
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by    INT,
  updated_by    INT,
  INDEX idx_company_code (code)
) ENGINE=InnoDB;

-- ============================================================
-- 4. BUSINESS UNITS
-- ============================================================

CREATE TABLE IF NOT EXISTS business_units (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(30)   NOT NULL UNIQUE,
  name          VARCHAR(200)  NOT NULL,
  company_id    INT NOT NULL,
  address       TEXT,
  city          VARCHAR(100),
  state         VARCHAR(100),
  country       VARCHAR(100),
  pin_code      VARCHAR(10),
  phone         VARCHAR(30),
  email         VARCHAR(150),
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by    INT,
  updated_by    INT,
  CONSTRAINT fk_bu_company FOREIGN KEY (company_id)
    REFERENCES companies(id) ON DELETE RESTRICT,
  INDEX idx_bu_code (code),
  INDEX idx_bu_company (company_id)
) ENGINE=InnoDB;

-- ============================================================
-- 5. COUNTRIES
-- ============================================================

CREATE TABLE IF NOT EXISTS countries (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(10)   NOT NULL UNIQUE,
  name          VARCHAR(100)  NOT NULL,
  phone_code    VARCHAR(10),
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_country_code (code)
) ENGINE=InnoDB;

-- ============================================================
-- 6. STATES
-- ============================================================

CREATE TABLE IF NOT EXISTS states (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(10)   NOT NULL,
  name          VARCHAR(100)  NOT NULL,
  country_id    INT NOT NULL,
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_state_country FOREIGN KEY (country_id)
    REFERENCES countries(id) ON DELETE RESTRICT,
  INDEX idx_state_code (code),
  INDEX idx_state_country (country_id),
  UNIQUE KEY uk_state_country (code, country_id)
) ENGINE=InnoDB;

-- ============================================================
-- 7. CITIES
-- ============================================================

CREATE TABLE IF NOT EXISTS cities (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  state_id      INT NOT NULL,
  country_id    INT NOT NULL,
  pincode       VARCHAR(10),
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_city_state FOREIGN KEY (state_id)
    REFERENCES states(id) ON DELETE RESTRICT,
  CONSTRAINT fk_city_country FOREIGN KEY (country_id)
    REFERENCES countries(id) ON DELETE RESTRICT,
  INDEX idx_city_state (state_id),
  INDEX idx_city_country (country_id)
) ENGINE=InnoDB;

-- ============================================================
-- 8. PRODUCT CATEGORIES
-- ============================================================

CREATE TABLE IF NOT EXISTS product_categories (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(20)   NOT NULL UNIQUE,
  name          VARCHAR(100)  NOT NULL,
  description   TEXT,
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by    INT,
  updated_by    INT,
  INDEX idx_prodcat_code (code)
) ENGINE=InnoDB;

-- ============================================================
-- 9. LEATHER TYPES
-- ============================================================

CREATE TABLE IF NOT EXISTS leather_types (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(20)   NOT NULL UNIQUE,
  name          VARCHAR(100)  NOT NULL,
  description   TEXT,
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by    INT,
  updated_by    INT,
  INDEX idx_leathertype_code (code)
) ENGINE=InnoDB;

-- ============================================================
-- 10. UOM (UNIT OF MEASURE)
-- ============================================================

CREATE TABLE IF NOT EXISTS uom (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(20)   NOT NULL UNIQUE,
  name          VARCHAR(100)  NOT NULL,
  description   TEXT,
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by    INT,
  updated_by    INT,
  INDEX idx_uom_code (code)
) ENGINE=InnoDB;

-- ============================================================
-- 11. THICKNESS
-- ============================================================

CREATE TABLE IF NOT EXISTS thickness (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(20)   NOT NULL UNIQUE,
  name          VARCHAR(100)  NOT NULL,
  value_mm      DECIMAL(5,2),
  description   TEXT,
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by    INT,
  updated_by    INT,
  INDEX idx_thickness_code (code)
) ENGINE=InnoDB;

-- ============================================================
-- 12. STANDARD SIZES
-- ============================================================

CREATE TABLE IF NOT EXISTS standard_sizes (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(20)   NOT NULL UNIQUE,
  name          VARCHAR(100)  NOT NULL,
  description   TEXT,
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by    INT,
  updated_by    INT,
  INDEX idx_stdsize_code (code)
) ENGINE=InnoDB;

-- ============================================================
-- 13. COLORS
-- ============================================================

CREATE TABLE IF NOT EXISTS colors (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(20)   NOT NULL UNIQUE,
  name          VARCHAR(100)  NOT NULL,
  hex_code      VARCHAR(10),
  description   TEXT,
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by    INT,
  updated_by    INT,
  INDEX idx_color_code (code)
) ENGINE=InnoDB;

-- ============================================================
-- 14. FINISH TYPES
-- ============================================================

CREATE TABLE IF NOT EXISTS finish_types (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(20)   NOT NULL UNIQUE,
  name          VARCHAR(100)  NOT NULL,
  description   TEXT,
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by    INT,
  updated_by    INT,
  INDEX idx_finishtype_code (code)
) ENGINE=InnoDB;

-- ============================================================
-- 15. GRADES
-- ============================================================

CREATE TABLE IF NOT EXISTS grades (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(20)   NOT NULL UNIQUE,
  name          VARCHAR(100)  NOT NULL,
  `rank`        INT DEFAULT 1,
  description   TEXT,
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by    INT,
  updated_by    INT,
  INDEX idx_grade_code (code)
) ENGINE=InnoDB;

-- ============================================================
-- 16. HSN CODES
-- ============================================================

CREATE TABLE IF NOT EXISTS hsn_codes (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(20)   NOT NULL UNIQUE,
  name          VARCHAR(200)  NOT NULL,
  description   TEXT,
  gst_rate      DECIMAL(5,2) DEFAULT 18.00,
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by    INT,
  updated_by    INT,
  INDEX idx_hsn_code (code)
) ENGINE=InnoDB;

-- ============================================================
-- 17. PROCESS STAGES
-- ============================================================

CREATE TABLE IF NOT EXISTS process_stages (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(30)   NOT NULL UNIQUE,
  name          VARCHAR(150)  NOT NULL,
  description   TEXT,
  seq           INT DEFAULT 0,
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by    INT,
  updated_by    INT,
  INDEX idx_processstage_code (code)
) ENGINE=InnoDB;

-- ============================================================
-- 18. MACHINES / EQUIPMENT
-- ============================================================

CREATE TABLE IF NOT EXISTS machines (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  code          VARCHAR(30)   NOT NULL UNIQUE,
  name          VARCHAR(150)  NOT NULL,
  machine_type  VARCHAR(100),
  capacity      VARCHAR(100),
  description   TEXT,
  status        ENUM('Active','Inactive','Maintenance') NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by    INT,
  updated_by    INT,
  INDEX idx_machine_code (code)
) ENGINE=InnoDB;

-- ============================================================
-- 19. PROCESS STAGE PARAMETERS
-- ============================================================

CREATE TABLE IF NOT EXISTS process_stage_parameters (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  process_stage_id INT NOT NULL,
  parameter_name VARCHAR(100) NOT NULL,
  unit          VARCHAR(50),
  default_value VARCHAR(100),
  min_value     VARCHAR(100),
  max_value     VARCHAR(100),
  required      BOOLEAN DEFAULT FALSE,
  seq           INT DEFAULT 0,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_psp_stage FOREIGN KEY (process_stage_id)
    REFERENCES process_stages(id) ON DELETE CASCADE,
  INDEX idx_psp_stage (process_stage_id)
) ENGINE=InnoDB;

-- ============================================================
-- 20. RECIPE ATTACHMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS recipe_attachments (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  recipe_id     INT NOT NULL,
  file_name     VARCHAR(255) NOT NULL,
  file_path     VARCHAR(500) NOT NULL,
  file_type     VARCHAR(50),
  file_size     INT,
  uploaded_by   INT,
  uploaded_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_attach_recipe FOREIGN KEY (recipe_id)
    REFERENCES recipes(id) ON DELETE CASCADE,
  INDEX idx_attach_recipe (recipe_id)
) ENGINE=InnoDB;

-- ============================================================
-- 21. AUDIT LOG
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_log (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  table_name    VARCHAR(100) NOT NULL,
  record_id     INT NOT NULL,
  action        ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  old_values    JSON,
  new_values    JSON,
  changed_by    INT,
  changed_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address    VARCHAR(45),
  INDEX idx_audit_table (table_name),
  INDEX idx_audit_record (table_name, record_id),
  INDEX idx_audit_date (changed_at)
) ENGINE=InnoDB;

-- ============================================================
-- 22. STATUS CHANGE HISTORY
-- ============================================================

CREATE TABLE IF NOT EXISTS status_history (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  table_name    VARCHAR(100) NOT NULL,
  record_id     INT NOT NULL,
  old_status    VARCHAR(50),
  new_status     VARCHAR(50) NOT NULL,
  changed_by    INT,
  changed_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reason        TEXT,
  INDEX idx_status_table (table_name),
  INDEX idx_status_record (table_name, record_id)
) ENGINE=InnoDB;

-- ============================================================
-- 23. UPDATE EXISTING TABLES - ADD AUDIT AND FOREIGN KEY COLUMNS
-- ============================================================

-- Helper procedure to safely add columns (ignores if already exists)
DELIMITER //
DROP PROCEDURE IF EXISTS safe_add_column//
CREATE PROCEDURE safe_add_column(IN tbl VARCHAR(64), IN col VARCHAR(64), IN col_def VARCHAR(255))
BEGIN
  SET @q = CONCAT('ALTER TABLE ', tbl, ' ADD COLUMN ', col, ' ', col_def);
  PREPARE stmt FROM @q;
  EXECUTE stmt;
  DEALLOCATE PREPARE stmt;
END//

DROP PROCEDURE IF EXISTS safe_add_constraint//
CREATE PROCEDURE safe_add_constraint(IN tbl VARCHAR(64), IN cname VARCHAR(64), IN cdef VARCHAR(500))
BEGIN
  SET @q = CONCAT('ALTER TABLE ', tbl, ' ADD CONSTRAINT ', cname, ' ', cdef);
  PREPARE stmt FROM @q;
  EXECUTE stmt;
  DEALLOCATE PREPARE stmt;
END//
DELIMITER ;

-- Add audit columns to customers
SET @ignore_errors = 1;

-- We'll use a simpler approach: just run ALTER and ignore duplicate column errors
-- by wrapping in a procedure

DELIMITER //
DROP PROCEDURE IF EXISTS apply_schema_updates//
CREATE PROCEDURE apply_schema_updates()
BEGIN
  DECLARE CONTINUE HANDLER FOR 1060 BEGIN END; -- Duplicate column
  DECLARE CONTINUE HANDLER FOR 1061 BEGIN END; -- Duplicate key
  DECLARE CONTINUE HANDLER FOR 1022 BEGIN END; -- Duplicate key entry
  DECLARE CONTINUE HANDLER FOR 4028 BEGIN END; -- Duplicate constraint

  -- customers
  ALTER TABLE customers ADD COLUMN country_id INT;
  ALTER TABLE customers ADD COLUMN state_id INT;
  ALTER TABLE customers ADD COLUMN city_id INT;
  ALTER TABLE customers ADD COLUMN created_by INT;
  ALTER TABLE customers ADD COLUMN updated_by INT;

  -- products
  ALTER TABLE products ADD COLUMN category_id INT;
  ALTER TABLE products ADD COLUMN leather_type_id INT;
  ALTER TABLE products ADD COLUMN uom_id INT;
  ALTER TABLE products ADD COLUMN thickness_id INT;
  ALTER TABLE products ADD COLUMN color_id INT;
  ALTER TABLE products ADD COLUMN finish_type_id INT;
  ALTER TABLE products ADD COLUMN grade_id INT;
  ALTER TABLE products ADD COLUMN hsn_code_id INT;
  ALTER TABLE products ADD COLUMN standard_size_id INT;
  ALTER TABLE products ADD COLUMN created_by INT;
  ALTER TABLE products ADD COLUMN updated_by INT;

  -- suppliers
  ALTER TABLE suppliers ADD COLUMN country_id INT;
  ALTER TABLE suppliers ADD COLUMN state_id INT;
  ALTER TABLE suppliers ADD COLUMN city_id INT;
  ALTER TABLE suppliers ADD COLUMN created_by INT;
  ALTER TABLE suppliers ADD COLUMN updated_by INT;

  -- materials
  ALTER TABLE materials ADD COLUMN uom_id INT;
  ALTER TABLE materials ADD COLUMN status ENUM('Active','Inactive') DEFAULT 'Active';
  ALTER TABLE materials ADD COLUMN created_by INT;
  ALTER TABLE materials ADD COLUMN updated_by INT;

  -- supplier_pricing
  ALTER TABLE supplier_pricing ADD COLUMN created_by INT;
  ALTER TABLE supplier_pricing ADD COLUMN updated_by INT;

  -- recipes
  ALTER TABLE recipes ADD COLUMN product_id INT;
  ALTER TABLE recipes ADD COLUMN leather_type_id INT;
  ALTER TABLE recipes ADD COLUMN finish_type_id INT;
  ALTER TABLE recipes ADD COLUMN color_id INT;
  ALTER TABLE recipes ADD COLUMN uom_id INT;
  ALTER TABLE recipes ADD COLUMN thickness_id INT;
  ALTER TABLE recipes ADD COLUMN created_by INT;
  ALTER TABLE recipes ADD COLUMN updated_by INT;

  -- recipe_process_stages
  ALTER TABLE recipe_process_stages ADD COLUMN process_stage_id INT;
  ALTER TABLE recipe_process_stages ADD COLUMN machine_id INT;
  ALTER TABLE recipe_process_stages ADD COLUMN ez_check BOOLEAN DEFAULT FALSE;

  -- boms
  ALTER TABLE boms ADD COLUMN product_id INT;
  ALTER TABLE boms ADD COLUMN leather_type_id INT;
  ALTER TABLE boms ADD COLUMN uom_id INT;
  ALTER TABLE boms ADD COLUMN thickness_id INT;
  ALTER TABLE boms ADD COLUMN created_by INT;
  ALTER TABLE boms ADD COLUMN updated_by INT;

  -- bom_items
  ALTER TABLE bom_items ADD COLUMN supplier_id INT;
  ALTER TABLE bom_items ADD COLUMN created_by INT;
  ALTER TABLE bom_items ADD COLUMN updated_by INT;

END//
DELIMITER ;

CALL apply_schema_updates();
DROP PROCEDURE IF EXISTS apply_schema_updates;
DROP PROCEDURE IF EXISTS safe_add_column;
DROP PROCEDURE IF EXISTS safe_add_constraint;

-- Add foreign key constraints (ignore if already exist)
DELIMITER //
DROP PROCEDURE IF EXISTS apply_fk_constraints//
CREATE PROCEDURE apply_fk_constraints()
BEGIN
  DECLARE CONTINUE HANDLER FOR 1005 BEGIN END;
  DECLARE CONTINUE HANDLER FOR 1022 BEGIN END;
  DECLARE CONTINUE HANDLER FOR 1061 BEGIN END;
  DECLARE CONTINUE HANDLER FOR 1826 BEGIN END; -- Duplicate FK
  DECLARE CONTINUE HANDLER FOR SQLSTATE '23000' BEGIN END;
  DECLARE CONTINUE HANDLER FOR SQLSTATE 'HY000' BEGIN END;

  -- customers FK
  ALTER TABLE customers ADD CONSTRAINT fk_customer_country FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE SET NULL;
  ALTER TABLE customers ADD CONSTRAINT fk_customer_state FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE SET NULL;
  ALTER TABLE customers ADD CONSTRAINT fk_customer_city FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL;

  -- products FK
  ALTER TABLE products ADD CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL;
  ALTER TABLE products ADD CONSTRAINT fk_product_leathertype FOREIGN KEY (leather_type_id) REFERENCES leather_types(id) ON DELETE SET NULL;
  ALTER TABLE products ADD CONSTRAINT fk_product_uom FOREIGN KEY (uom_id) REFERENCES uom(id) ON DELETE SET NULL;
  ALTER TABLE products ADD CONSTRAINT fk_product_thickness FOREIGN KEY (thickness_id) REFERENCES thickness(id) ON DELETE SET NULL;
  ALTER TABLE products ADD CONSTRAINT fk_product_color FOREIGN KEY (color_id) REFERENCES colors(id) ON DELETE SET NULL;
  ALTER TABLE products ADD CONSTRAINT fk_product_finish FOREIGN KEY (finish_type_id) REFERENCES finish_types(id) ON DELETE SET NULL;
  ALTER TABLE products ADD CONSTRAINT fk_product_grade FOREIGN KEY (grade_id) REFERENCES grades(id) ON DELETE SET NULL;
  ALTER TABLE products ADD CONSTRAINT fk_product_hsn FOREIGN KEY (hsn_code_id) REFERENCES hsn_codes(id) ON DELETE SET NULL;
  ALTER TABLE products ADD CONSTRAINT fk_product_stdsize FOREIGN KEY (standard_size_id) REFERENCES standard_sizes(id) ON DELETE SET NULL;

  -- recipes FK
  ALTER TABLE recipes ADD CONSTRAINT fk_recipe_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;
  ALTER TABLE recipes ADD CONSTRAINT fk_recipe_leathertype FOREIGN KEY (leather_type_id) REFERENCES leather_types(id) ON DELETE SET NULL;
  ALTER TABLE recipes ADD CONSTRAINT fk_recipe_finish FOREIGN KEY (finish_type_id) REFERENCES finish_types(id) ON DELETE SET NULL;
  ALTER TABLE recipes ADD CONSTRAINT fk_recipe_color FOREIGN KEY (color_id) REFERENCES colors(id) ON DELETE SET NULL;
  ALTER TABLE recipes ADD CONSTRAINT fk_recipe_uom FOREIGN KEY (uom_id) REFERENCES uom(id) ON DELETE SET NULL;
  ALTER TABLE recipes ADD CONSTRAINT fk_recipe_thickness FOREIGN KEY (thickness_id) REFERENCES thickness(id) ON DELETE SET NULL;

  -- recipe_process_stages FK
  ALTER TABLE recipe_process_stages ADD CONSTRAINT fk_rps_processstage FOREIGN KEY (process_stage_id) REFERENCES process_stages(id) ON DELETE SET NULL;
  ALTER TABLE recipe_process_stages ADD CONSTRAINT fk_rps_machine FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE SET NULL;

  -- boms FK
  ALTER TABLE boms ADD CONSTRAINT fk_bom_product_new FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

  -- bom_items FK
  ALTER TABLE bom_items ADD CONSTRAINT fk_bi_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL;

  -- users FK
  ALTER TABLE users ADD CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL;
  ALTER TABLE users ADD CONSTRAINT fk_user_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;
  ALTER TABLE users ADD CONSTRAINT fk_user_bu FOREIGN KEY (business_unit_id) REFERENCES business_units(id) ON DELETE SET NULL;

END//
DELIMITER ;

CALL apply_fk_constraints();
DROP PROCEDURE IF EXISTS apply_fk_constraints;

-- ============================================================
-- END OF SCHEMA UPDATES
-- ============================================================
