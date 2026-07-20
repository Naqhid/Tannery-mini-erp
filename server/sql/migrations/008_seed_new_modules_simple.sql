-- ============================================================
-- Migration 008: Seed Data for New Modules (Simple Version)
-- Description: Sample seed data for new modules without foreign key constraints
-- ============================================================

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. SEED DATA FOR BATCH / LOT TRACKING
-- ============================================================

-- Insert sample batches (using NULL for foreign keys to avoid constraint issues)
INSERT INTO batches (batch_no, production_plan_id, customer_id, order_no, article_code, article_name, production_date, stage, current_stage, total_receipt_qty, total_output_qty, yield_percent, status, remarks, created_by, created_at) 
VALUES 
('BTCH-202405-0012', NULL, NULL, 'SO-2024-0015', 'LTH-1001', 'Cow Leather', '2024-05-20', 'Tanning', 'Tanning', 2450.00, 2320.00, 94.69, 'Completed', 'Batch for Leather World Co.', 1, NOW()),
('BTCH-202405-0013', NULL, NULL, 'SO-2024-0018', 'LTH-1002', 'Buffalo Leather', '2024-05-20', 'Tanning', 'Tanning', 800.00, 760.00, 95.00, 'Completed', 'Batch for Global Leathers Ltd.', 1, NOW()),
('BTCH-202405-0014', NULL, NULL, 'SO-2024-0021', 'LTH-1003', 'Sheep Leather', '2024-05-21', 'Finishing', 'Finishing', 400.00, 380.00, 95.00, 'In-Process', 'Batch for Premium Shoes Pvt. Ltd.', 1, NOW()),
('BTCH-202405-0015', NULL, NULL, 'SO-2024-0023', 'LTH-1004', 'Goat Leather', '2024-05-21', 'Dyeing', 'Dyeing', 350.00, 330.00, 94.29, 'In-Process', 'Batch for Fashion Footwear Inc.', 1, NOW()),
('BTCH-202405-0016', NULL, NULL, 'SO-2024-0025', 'LTH-1005', 'Cow Leather', '2024-05-22', 'Tanning', 'Tanning', 300.00, 280.00, 93.33, 'In-Process', 'Batch for Elite Exports', 1, NOW());

-- Insert batch line items for BTCH-202405-0012
INSERT INTO batch_line_items (batch_id, seq, customer_name, order_no, article_code, article_name, finish, color, receipt_qty, uom, output_qty, output_uom, status, created_at) 
VALUES 
(1, 1, 'Leather World Co.', 'SO-2024-0015', 'LTH-1001', 'Cow Leather', 'Full Chrome', 'Black', 800.00, 'SQ.FT.', 760.00, 'SQ.FT.', 'Completed', NOW()),
(1, 2, 'Leather World Co.', 'SO-2024-0015', 'LTH-1001', 'Cow Leather', 'Semi Chrome', 'Brown', 200.00, 'SQ.FT.', 200.00, 'SQ.FT.', 'Completed', NOW()),
(1, 3, 'Leather World Co.', 'SO-2024-0015', 'LTH-1001', 'Cow Leather', 'Vegetable', 'Tan', 400.00, 'SQ.FT.', 380.00, 'SQ.FT.', 'Completed', NOW()),
(1, 4, 'Leather World Co.', 'SO-2024-0015', 'LTH-1001', 'Cow Leather', 'Full Chrome', 'Navy Blue', 350.00, 'SQ.FT.', 330.00, 'SQ.FT.', 'Completed', NOW()),
(1, 5, 'Leather World Co.', 'SO-2024-0015', 'LTH-1001', 'Cow Leather', 'Pull Up', 'Dark Brown', 300.00, 'SQ.FT.', 280.00, 'SQ.FT.', 'Completed', NOW());

-- Insert batch line items for BTCH-202405-0013
INSERT INTO batch_line_items (batch_id, seq, customer_name, order_no, article_code, article_name, finish, color, receipt_qty, uom, output_qty, output_uom, status, created_at) 
VALUES 
(2, 1, 'Global Leathers Ltd.', 'SO-2024-0018', 'LTH-1002', 'Buffalo Leather', 'Semi Chrome', 'Black', 800.00, 'SQ.FT.', 570.00, 'SQ.FT.', 'Completed', NOW());

-- ============================================================
-- 2. SEED DATA FOR SUPPLIER PRICING
-- ============================================================

-- Insert sample supplier pricing records (check if supplier_pricing table has unit_price column)
INSERT INTO supplier_pricing (supplier_id, material_id, uom, price, valid_from, valid_to, status, created_by, created_at) 
VALUES 
(1, 1, 'KG', 200.00, '2024-05-01', '2024-05-30', 'Approved', 1, NOW()),
(1, 1, 'KG', 210.00, '2024-04-01', '2024-04-30', 'Approved', 1, NOW()),
(1, 1, 'KG', 220.00, '2024-03-01', '2024-03-31', 'Approved', 1, NOW()),
(1, 2, 'KG', 185.00, '2024-05-01', '2024-05-31', 'Approved', 1, NOW()),
(1, 3, 'LTR', 65.00, '2024-05-01', '2024-05-31', 'Approved', 1, NOW()),
(1, 4, 'KG', 145.00, '2024-05-01', '2024-05-31', 'Approved', 1, NOW()),
(1, 5, 'LTR', 62.00, '2024-04-16', '2024-04-30', 'Expired', 1, NOW()),
(1, 6, 'KG', 130.00, '2024-05-01', '2024-05-31', 'Pending', 1, NOW());

-- Insert price breaks for the first pricing record
INSERT INTO price_breaks (pricing_id, seq, from_qty, to_qty, uom, unit_price, discount_percent, discount_amount, net_price) 
VALUES 
(1, 1, 100.00, 499.99, 'KG', 205.00, 0.00, 0.00, 205.00),
(1, 2, 500.00, 999.99, 'KG', 198.00, 3.41, 6.99, 198.00),
(1, 3, 1000.00, 999999.99, 'KG', 190.00, 7.32, 14.64, 190.00);

-- Insert price change history (using NULL for pricing_id to avoid constraint issues)
INSERT INTO price_change_history (pricing_id, material_id, supplier_id, old_price, new_price, change_percent, change_type, change_reason, effective_from, effective_to, changed_by, created_at) 
VALUES 
(NULL, 1, 1, 220.00, 210.00, -4.55, 'Decrease', 'Monthly revision', '2024-04-01', '2024-04-30', 1, NOW()),
(NULL, 1, 1, 210.00, 200.00, -4.76, 'Decrease', 'Monthly revision', '2024-05-01', '2024-05-30', 1, NOW()),
(NULL, 2, 1, 180.00, 185.00, 2.78, 'Increase', 'Quarterly revision', '2024-05-01', '2024-05-31', 1, NOW()),
(NULL, 6, 1, 145.00, 130.00, -10.34, 'Decrease', 'Price reduced', '2024-05-01', '2024-05-31', 1, NOW());

-- ============================================================
-- 3. SEED DATA FOR PRICE APPROVAL
-- ============================================================

-- Insert sample price approval requests
INSERT INTO price_approval_requests (request_no, request_date, requested_by, department, total_items, status, approval_notes, remarks, created_by, created_at) 
VALUES 
('PRQ-2024-0012', '2024-05-16', 1, 'Purchase', 1, 'Pending', 'Supplier has given revised price list for May 2024. Approval requested.', 'Price revision', 1, NOW()),
('PRQ-2024-0013', '2024-05-16', 1, 'Purchase', 1, 'Pending', 'Price adjustment for new contract', 'FineChem industries price update', 1, NOW()),
('PRQ-2024-0014', '2024-05-17', 1, 'Purchase', 1, 'Pending', 'New supplier pricing', 'Tannery Supplies Ltd. - Sodium Sulphide', 1, NOW()),
('PRQ-2024-0015', '2024-05-17', 1, 'Purchase', 1, 'Pending', 'Price adjustment', 'Cow Leather - Wet Blue price update', 1, NOW());

-- Insert price approval items (using NULL or existing IDs for foreign keys)
INSERT INTO price_approval_items (request_id, seq, supplier_id, material_id, supplier_part_no, item_group, uom, current_price, requested_price, currency, change_amount, change_percent, effective_from, effective_to, last_approved_price, last_approved_date, status, approval_notes, remarks, created_at) 
VALUES 
(1, 1, 1, 1, 'CP-1001', 'Chemicals', 'KG', 210.00, 205.00, 'INR', -5.00, -2.38, '2024-05-16', NULL, 210.00, '2024-05-01', 'Pending', 'Monthly revision', 'Price effective from 16 May 2024', NOW()),
(2, 1, 2, 5, NULL, 'Chemicals', 'LTR', 64.00, 60.00, 'INR', -4.00, -6.25, '2024-05-18', NULL, 64.00, '2024-04-01', 'Pending', 'Price reduced', 'Quarterly revision', NOW()),
(3, 1, 3, 2, 'ST-2001', 'Chemicals', 'KG', 48.00, 52.00, 'INR', 4.00, 8.33, '2024-05-20', NULL, 48.00, '2024-05-10', 'Pending', 'New supplier', 'New contract', NOW()),
(4, 1, 1, 6, 'FL-4001', 'Chemicals', 'KG', 95.00, 92.00, 'INR', -3.00, -3.16, '2024-05-21', NULL, 95.00, '2024-04-01', 'Pending', 'Price adjustment', 'Old price', NOW());

-- Insert price approval workflow history
INSERT INTO price_approval_workflow (request_id, item_id, action_type, action_by, action_date, notes, from_status, to_status, created_at) 
VALUES 
(1, 1, 'Submitted', 1, NOW(), 'Submitted for approval', 'Draft', 'Pending', NOW());

-- ============================================================
-- 4. SEED DATA FOR PHYSICAL STOCK ENTRY
-- ============================================================

-- Insert sample physical stock entries (using NULL for foreign keys)
INSERT INTO physical_stock_entries (entry_no, entry_date, stock_date, warehouse_id, location_rack, godown, batch_no, from_item_code, to_item_code, item_group, item_id, uom, reference_no, total_items, matched_items, variance_items, total_variance_qty, total_variance_value, status, remarks, created_by, created_at) 
VALUES 
('PSE-2024-00045', '2024-05-20', '2024-05-20', NULL, 'All', 'Main Store', NULL, NULL, NULL, 'All', NULL, 'All', 'Ref / Document No.', 6, 2, 4, -7.00, -1320.00, 'Completed', 'Enter remarks (optional)...', 1, NOW());

-- Insert physical stock entry items
INSERT INTO physical_stock_entry_items (entry_id, seq, item_code, item_description, uom, batch_no, location_rack, system_qty, physical_qty, variance_qty, variance_value, remarks, created_at) 
VALUES 
(1, 1, 'RAW-001', 'Cow Leather - Black', 'SQ.FT', 'BATCH-240501', 'A-01-01', 125.00, 120.00, -5.00, -1250.00, NULL, NOW()),
(1, 2, 'RAW-002', 'Sheep Leather - White', 'SQ.FT', 'BATCH-240528', 'A-01-02', 200.00, 200.00, 0.00, 0.00, NULL, NOW()),
(1, 3, 'CHEM-001', 'Chrome Powder', 'KG', 'BATCH-240503', 'B-02-01', 50.00, 48.00, -2.00, -320.00, NULL, NOW()),
(1, 4, 'CHEM-005', 'Retanning Agent', 'KG', 'BATCH-240530', 'B-02-02', 75.00, 80.00, 5.00, 750.00, NULL, NOW()),
(1, 5, 'PKG-010', 'Plastic Bag Large', 'NOS', 'BATCH-240501', 'C-03-01', 1000.00, 1000.00, 0.00, 0.00, NULL, NOW()),
(1, 6, 'ACC-002', 'Edge Paint - Black', 'LTR', 'BATCH-240525', 'B-02-03', 30.00, 25.00, -5.00, -500.00, NULL, NOW());

-- ============================================================
-- 5. SEED DATA FOR PRODUCTION BATCHES
-- ============================================================

-- Insert sample production batches (using NULL for foreign keys)
INSERT INTO production_batches (batch_no, plan_id, sales_order_id, customer_id, order_no, article_code, article_name, color, finish, production_date, stage_id, stage_name, capacity, planned_qty, receipt_qty, rejection_qty, output_qty, wip_qty, output_percent, status, remarks, created_by, created_at) 
VALUES 
('PB-202405-0001', NULL, NULL, NULL, 'SO-2024-0015', 'LTH-1001', 'Cow Leather', 'Black', 'Full Chrome', '2024-05-20', NULL, 'Tanning', 2500.00, 2500.00, 2450.00, 0.00, 2320.00, 130.00, 92.80, 'In-Process', 'Batch in tanning stage', 1, NOW());

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;