-- 05 Sep 2026: Rename opening_qty → opening_stock in material_transactions
-- The application code uses opening_stock/opening_value but the column was created as opening_qty.
ALTER TABLE material_transactions
  CHANGE COLUMN opening_qty opening_stock DECIMAL(18,3) NOT NULL DEFAULT 0;
