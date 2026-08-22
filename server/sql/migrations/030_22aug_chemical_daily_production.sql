-- 22 Aug 2026: Chemical stock/rate + Daily Production enhancements

-- Chemical/material internal stock valuation fields
ALTER TABLE materials ADD COLUMN rate DECIMAL(18,6) NOT NULL DEFAULT 0 AFTER last_purchase_price;
ALTER TABLE materials ADD COLUMN opening_stock_value DECIMAL(18,2) NOT NULL DEFAULT 0 AFTER opening_stock;

-- Existing Corix import used current_stock and last_purchase_price. Promote those values to opening/rate.
UPDATE materials
SET rate = CASE WHEN COALESCE(rate,0)=0 THEN COALESCE(last_purchase_price,0) ELSE rate END,
    opening_stock = CASE WHEN COALESCE(opening_stock,0)=0 THEN COALESCE(current_stock,0) ELSE opening_stock END,
    opening_stock_value = CASE
      WHEN COALESCE(opening_stock_value,0)=0 THEN
        (CASE WHEN COALESCE(opening_stock,0)=0 THEN COALESCE(current_stock,0) ELSE opening_stock END) *
        (CASE WHEN COALESCE(rate,0)=0 THEN COALESCE(last_purchase_price,0) ELSE rate END)
      ELSE opening_stock_value END;

ALTER TABLE material_transactions ADD COLUMN opening_value DECIMAL(18,2) NOT NULL DEFAULT 0 AFTER opening_qty;

-- Process stage UOM drives production plan/daily production UOM.
ALTER TABLE process_stages ADD COLUMN uom VARCHAR(20) NULL AFTER seq;

-- Daily Production transaction enhancements.
ALTER TABLE production_status_transactions ADD COLUMN rejection_qty DECIMAL(15,2) NOT NULL DEFAULT 0 AFTER output_qty;

-- Parent production-status records linked to production plans and posting workflow.
ALTER TABLE production_status_orders ADD COLUMN production_plan_id INT NULL AFTER id;
ALTER TABLE production_status_orders ADD COLUMN plan_date DATE NULL AFTER order_no;
ALTER TABLE production_status_orders ADD COLUMN customer_id INT NULL AFTER customer_name;
ALTER TABLE production_status_orders ADD COLUMN posted_at TIMESTAMP NULL DEFAULT NULL AFTER updated_at;
ALTER TABLE production_status_orders ADD COLUMN posted_by INT NULL AFTER updated_by;
CREATE INDEX idx_pso_plan ON production_status_orders (production_plan_id);
