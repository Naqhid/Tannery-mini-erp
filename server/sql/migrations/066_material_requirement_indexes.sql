-- Migration 066: Supporting indexes for the Material Requirement page.
-- =============================================================================
-- The Material Requirement page (BOM / Recipe menu) calculates BOM material
-- requirements for a selected sale order. It joins:
--   sales_orders / customers        (order header + customer)
--   sales_order_items               (article, colour, quantity, product_id)
--   boms                            (latest Active BOM per product)
--   bom_items / materials           (per-piece component quantities)
--
-- No new tables are required — the page is a pure read-side aggregation over
-- existing operational data (Required Qty = BOM per-piece qty x order qty).
-- This migration only adds indexes that speed up the lookups.
--
-- Safe to re-run: each index is created only when it is absent.
-- =============================================================================
SET @db := DATABASE();

-- sales_order_items: filtered by sales_order_id and read with product_id.
SET @exists := (SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='sales_order_items'
    AND INDEX_NAME='idx_soi_order_product');
SET @sql := IF(@exists=0,
  'CREATE INDEX idx_soi_order_product ON sales_order_items (sales_order_id, product_id)',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- boms: "latest Active BOM for a product" lookup (product_id + status, newest version).
SET @exists := (SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='boms'
    AND INDEX_NAME='idx_boms_product_status_version');
SET @sql := IF(@exists=0,
  'CREATE INDEX idx_boms_product_status_version ON boms (product_id, status, version)',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- bom_items: component lookup by bom_id + material_id.
SET @exists := (SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='bom_items'
    AND INDEX_NAME='idx_bi_bom_material');
SET @sql := IF(@exists=0,
  'CREATE INDEX idx_bi_bom_material ON bom_items (bom_id, material_id)',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
