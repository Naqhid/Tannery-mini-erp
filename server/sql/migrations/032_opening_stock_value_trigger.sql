-- Migration 032: Add DB triggers to auto-calculate opening_stock_value
-- opening_stock_value = opening_stock * rate (calculated inside DB, not backend)

DROP TRIGGER IF EXISTS trg_materials_before_insert_stock_value;
DROP TRIGGER IF EXISTS trg_materials_before_update_stock_value;

DELIMITER $$

CREATE TRIGGER trg_materials_before_insert_stock_value
BEFORE INSERT ON materials
FOR EACH ROW
BEGIN
  SET NEW.opening_stock_value = COALESCE(NEW.opening_stock, 0) * COALESCE(NEW.rate, 0);
END$$

CREATE TRIGGER trg_materials_before_update_stock_value
BEFORE UPDATE ON materials
FOR EACH ROW
BEGIN
  SET NEW.opening_stock_value = COALESCE(NEW.opening_stock, 0) * COALESCE(NEW.rate, 0);
END$$

DELIMITER ;
