-- ============================================================
-- Tannery Mini ERP - Seed Data for New Tables
-- ============================================================

USE tannery_mini_erp;

-- ============================================================
-- 1. DEFAULT ADMIN USER
-- ============================================================

-- Password: admin@123 (bcrypt hash)
INSERT INTO users (username, password_hash, email, full_name, status) VALUES
('admin', '$2b$12$LQv3c1yqBWVHxkd0L5tW4.j2o8.qJ3ZqX7K7K1ZqJ3ZqJ3ZqJ3ZqJ3ZqJ3ZqJ3Zq', 'admin@tannery.com', 'System Administrator', 'Active')
ON DUPLICATE KEY UPDATE username=username;

-- ============================================================
-- 2. DEFAULT ROLES
-- ============================================================

INSERT INTO roles (code, name, description, status) VALUES
('ADMIN', 'Administrator', 'Full system access with all permissions', 'Active'),
('MANAGER', 'Manager', 'Manage operations and approve transactions', 'Active'),
('USER', 'User', 'Basic access to view and create records', 'Active'),
('VIEWER', 'Viewer', 'Read-only access', 'Active')
ON DUPLICATE KEY UPDATE code=code;

-- Update admin user role
UPDATE users SET role_id = (SELECT id FROM roles WHERE code = 'ADMIN') WHERE username = 'admin';

-- ============================================================
-- 3. DEFAULT COMPANY
-- ============================================================

INSERT INTO companies (code, name, address, city, state, country, pin_code, phone, email, gstin, status) VALUES
('CORIX', 'Corix Leather Industries', 'No. 1, Leather Complex, Vellore', 'Vellore', 'Tamil Nadu', 'India', '632001', '+91 416 2234567', 'info@corixleather.com', '33AAACC1234A1Z5', 'Active')
ON DUPLICATE KEY UPDATE code=code;

-- ============================================================
-- 4. BUSINESS UNITS
-- ============================================================

INSERT INTO business_units (code, name, company_id, address, city, state, country, status) VALUES
('BU-FINISH', 'Finishing Unit', (SELECT id FROM companies WHERE code='CORIX'), 'Vellore Industrial Estate', 'Vellore', 'Tamil Nadu', 'India', 'Active'),
('BU-TANNING', 'Tanning Unit', (SELECT id FROM companies WHERE code='CORIX'), 'Ranipet SIPCOT', 'Ranipet', 'Tamil Nadu', 'India', 'Active')
ON DUPLICATE KEY UPDATE code=code;

-- ============================================================
-- 5. COUNTRIES
-- ============================================================

INSERT INTO countries (code, name, phone_code, status) VALUES
('IN', 'India', '+91', 'Active'),
('US', 'United States', '+1', 'Active'),
('UK', 'United Kingdom', '+44', 'Active'),
('DE', 'Germany', '+49', 'Active'),
('IT', 'Italy', '+39', 'Active'),
('CN', 'China', '+86', 'Active'),
('BD', 'Bangladesh', '+880', 'Active'),
('PK', 'Pakistan', '+92', 'Active'),
('AE', 'United Arab Emirates', '+971', 'Active'),
('ZA', 'South Africa', '+27', 'Active')
ON DUPLICATE KEY UPDATE code=code;

-- ============================================================
-- 6. STATES (INDIA)
-- ============================================================

INSERT INTO states (code, name, country_id, status) VALUES
('TN', 'Tamil Nadu', (SELECT id FROM countries WHERE code='IN'), 'Active'),
('KA', 'Karnataka', (SELECT id FROM countries WHERE code='IN'), 'Active'),
('MH', 'Maharashtra', (SELECT id FROM countries WHERE code='IN'), 'Active'),
('KL', 'Kerala', (SELECT id FROM countries WHERE code='IN'), 'Active'),
('AP', 'Andhra Pradesh', (SELECT id FROM countries WHERE code='IN'), 'Active'),
('GJ', 'Gujarat', (SELECT id FROM countries WHERE code='IN'), 'Active'),
('WB', 'West Bengal', (SELECT id FROM countries WHERE code='IN'), 'Active'),
('UP', 'Uttar Pradesh', (SELECT id FROM countries WHERE code='IN'), 'Active'),
('RJ', 'Rajasthan', (SELECT id FROM countries WHERE code='IN'), 'Active'),
('DL', 'Delhi', (SELECT id FROM countries WHERE code='IN'), 'Active')
ON DUPLICATE KEY UPDATE code=code;

-- ============================================================
-- 7. CITIES (Tamil Nadu & Nearby)
-- ============================================================

INSERT INTO cities (name, state_id, country_id, pincode, status) VALUES
('Chennai', (SELECT id FROM states WHERE code='TN'), (SELECT id FROM countries WHERE code='IN'), '600001', 'Active'),
('Vellore', (SELECT id FROM states WHERE code='TN'), (SELECT id FROM countries WHERE code='IN'), '632001', 'Active'),
('Ranipet', (SELECT id FROM states WHERE code='TN'), (SELECT id FROM countries WHERE code='IN'), '632401', 'Active'),
('Ambur', (SELECT id FROM states WHERE code='TN'), (SELECT id FROM countries WHERE code='IN'), '635802', 'Active'),
('Vaniyambadi', (SELECT id FROM states WHERE code='TN'), (SELECT id FROM countries WHERE code='IN'), '635751', 'Active'),
('Erode', (SELECT id FROM states WHERE code='TN'), (SELECT id FROM countries WHERE code='IN'), '638001', 'Active'),
('Coimbatore', (SELECT id FROM states WHERE code='TN'), (SELECT id FROM countries WHERE code='IN'), '641001', 'Active'),
('Trichy', (SELECT id FROM states WHERE code='TN'), (SELECT id FROM countries WHERE code='IN'), '620001', 'Active'),
('Madurai', (SELECT id FROM states WHERE code='TN'), (SELECT id FROM countries WHERE code='IN'), '625001', 'Active'),
('Bangalore', (SELECT id FROM states WHERE code='KA'), (SELECT id FROM countries WHERE code='IN'), '560001', 'Active'),
('Mumbai', (SELECT id FROM states WHERE code='MH'), (SELECT id FROM countries WHERE code='IN'), '400001', 'Active'),
('Pune', (SELECT id FROM states WHERE code='MH'), (SELECT id FROM countries WHERE code='IN'), '411001', 'Active'),
('Kochi', (SELECT id FROM states WHERE code='KL'), (SELECT id FROM countries WHERE code='IN'), '682001', 'Active'),
('Hyderabad', (SELECT id FROM states WHERE code='AP'), (SELECT id FROM countries WHERE code='IN'), '500001', 'Active')
ON DUPLICATE KEY UPDATE name=name;

-- ============================================================
-- 8. PRODUCT CATEGORIES
-- ============================================================

INSERT INTO product_categories (code, name, description, status) VALUES
('FIN-LEATHER', 'Finished Leather', 'Fully finished leather ready for footwear and upholstery', 'Active'),
('SEMI-FINISH', 'Semi Finished', 'Partially processed leather', 'Active'),
('CRUST', 'Crust Leather', 'Unfinished tanned leather', 'Active'),
('WET-BLUE', 'Wet Blue', 'Chrome tanned leather in wet condition', 'Active'),
('SPLITS', 'Splits', 'Split layer leather', 'Active')
ON DUPLICATE KEY UPDATE code=code;

-- ============================================================
-- 9. LEATHER TYPES
-- ============================================================

INSERT INTO leather_types (code, name, description, status) VALUES
('COW', 'Cow Leather', 'Leather made from cow hides', 'Active'),
('BUFFALO', 'Buffalo Leather', 'Leather made from buffalo hides', 'Active'),
('GOAT', 'Goat Leather', 'Leather made from goat skins', 'Active'),
('SHEEP', 'Sheep Leather', 'Leather made from sheep skins', 'Active'),
('CALF', 'Calf Leather', 'Leather made from calf hides', 'Active')
ON DUPLICATE KEY UPDATE code=code;

-- ============================================================
-- 10. UOM
-- ============================================================

INSERT INTO uom (code, name, description, status) VALUES
('SQFT', 'Square Feet', 'Area measurement in square feet', 'Active'),
('SQM', 'Square Meter', 'Area measurement in square meters', 'Active'),
('KG', 'Kilogram', 'Weight measurement in kilograms', 'Active'),
('LTR', 'Liter', 'Liquid volume in liters', 'Active'),
('MTR', 'Meter', 'Linear measurement in meters', 'Active'),
('PIECE', 'Piece', 'Individual unit count', 'Active'),
('DOZEN', 'Dozen', 'Pack of 12 units', 'Active')
ON DUPLICATE KEY UPDATE code=code;

-- ============================================================
-- 11. THICKNESS
-- ============================================================

INSERT INTO thickness (code, name, value_mm, description, status) VALUES
('THIN', 'Thin (0.8-1.0 mm)', 0.90, 'Thin leather for lining and garments', 'Active'),
('MEDIUM', 'Medium (1.0-1.2 mm)', 1.10, 'Standard thickness for footwear', 'Active'),
('STD', 'Standard (1.2-1.4 mm)', 1.30, 'Most common thickness for leather goods', 'Active'),
('THICK', 'Thick (1.4-1.6 mm)', 1.50, 'Thick leather for bags and belts', 'Active'),
('HEAVY', 'Heavy (1.6-2.0 mm)', 1.80, 'Heavy leather for industrial use', 'Active')
ON DUPLICATE KEY UPDATE code=code;

-- ============================================================
-- 12. STANDARD SIZES
-- ============================================================

INSERT INTO standard_sizes (code, name, description, status) VALUES
('CUSTOM', 'As per Customer Requirement', 'Size as specified by customer', 'Active'),
('STD-20', 'Standard 20 Sq. Ft.', 'Standard hide size approx 20 sq. ft.', 'Active'),
('STD-25', 'Standard 25 Sq. Ft.', 'Large hide size approx 25 sq. ft.', 'Active'),
('STD-30', 'Standard 30 Sq. Ft.', 'Extra large hide size approx 30 sq. ft.', 'Active'),
('HALF', 'Half Hide', 'Half hide cut', 'Active')
ON DUPLICATE KEY UPDATE code=code;

-- ============================================================
-- 13. COLORS
-- ============================================================

INSERT INTO colors (code, name, hex_code, description, status) VALUES
('BLACK', 'Black', '#000000', 'Classic black color', 'Active'),
('BROWN', 'Brown', '#8B4513', 'Natural brown color', 'Active'),
('DARK-BRN', 'Dark Brown', '#654321', 'Deep brown color', 'Active'),
('TAN', 'Tan', '#D2B48C', 'Light tan color', 'Active'),
('NATURAL', 'Natural', '#F5F5DC', 'Untreated natural color', 'Active'),
('GREY', 'Grey', '#808080', 'Grey color', 'Active'),
('BEIGE', 'Beige', '#F5F5DC', 'Beige color', 'Active'),
('NAVY', 'Navy Blue', '#000080', 'Navy blue color', 'Active'),
('RED', 'Red', '#8B0000', 'Dark red color', 'Active'),
('GREEN', 'Green', '#006400', 'Dark green color', 'Active')
ON DUPLICATE KEY UPDATE code=code;

-- ============================================================
-- 14. FINISH TYPES
-- ============================================================

INSERT INTO finish_types (code, name, description, status) VALUES
('SEMI-ANILINE', 'Semi Aniline', 'Breathable finish with slight pigment coating', 'Active'),
('FULL-GRAIN', 'Full Grain', 'Natural finish preserving grain', 'Active'),
('NAPPA', 'Nappa', 'Soft smooth finish', 'Active'),
('SUEDE', 'Suede', 'Brushed napped finish', 'Active'),
('NUBUCK', 'Nubuck', 'Buffed grain surface', 'Active'),
('PULL-UP', 'Pull-Up', 'Waxed finish that lightens when stretched', 'Active'),
('PATENT', 'Patent', 'High gloss finish', 'Active'),
('CORRECTED', 'Corrected Grain', 'Buffed and corrected surface', 'Active'),
('CRUST', 'Crust', 'Unfinished leather', 'Active'),
('GLAZED', 'Glazed', 'Polished glossy finish', 'Active')
ON DUPLICATE KEY UPDATE code=code;

-- ============================================================
-- 15. GRADES
-- ============================================================

INSERT INTO grades (code, name, `rank`, description, status) VALUES
('A', 'A Grade - Premium', 1, 'Highest quality, no defects', 'Active'),
('B', 'B Grade - Standard', 2, 'Good quality, minor natural marks', 'Active'),
('C', 'C Grade - Economy', 3, 'Functional quality with visible marks', 'Active'),
('REJECT', 'Reject Grade', 4, 'Below standard quality', 'Active')
ON DUPLICATE KEY UPDATE code=code;

-- ============================================================
-- 16. HSN CODES
-- ============================================================

INSERT INTO hsn_codes (code, name, gst_rate, description, status) VALUES
('4107', 'Finished Leather', 18.00, 'Finished leather, further prepared after tanning', 'Active'),
('4104', 'Semi-Processed Leather', 18.00, 'Semi-processed tanned leather', 'Active'),
('4105', 'Wet Blue Leather', 18.00, 'Chrome tanned leather (wet blue)', 'Active'),
('4106', 'Crust Leather', 18.00, 'Tanned but not finished leather', 'Active'),
('3208', 'Synthetic Tanning Agents', 18.00, 'Synthetic tanning preparations', 'Active'),
('3209', 'Finishing Agents', 18.00, 'Leather finishing preparations', 'Active')
ON DUPLICATE KEY UPDATE code=code;

-- ============================================================
-- 17. PROCESS STAGES
-- ============================================================

INSERT INTO process_stages (code, name, description, seq, status) VALUES
('INS-01', 'Leather Inspection', 'Inspect incoming leather for defects', 10, 'Active'),
('BUFF-01', 'Buffing', 'Buff leather surface for smoothness', 20, 'Active'),
('SPRAY-01', 'Spray Base Coat', 'Apply base coat spraying', 30, 'Active'),
('DRY-01', 'Drying', 'Dry leather in tunnel dryer', 40, 'Active'),
('IRON-01', 'Ironing', 'Apply heat and pressure', 50, 'Active'),
('SPRAY-02', 'Top Coat', 'Apply top finish coating', 60, 'Active'),
('DRY-02', 'Final Drying', 'Final drying process', 70, 'Active'),
('INS-02', 'Final Inspection', 'QC check for finished leather', 80, 'Active'),
('PACK-01', 'Packing', 'Pack and label finished leather', 90, 'Active')
ON DUPLICATE KEY UPDATE code=code;

-- ============================================================
-- 18. MACHINES / EQUIPMENT
-- ============================================================

INSERT INTO machines (code, name, machine_type, capacity, status) VALUES
('MACHINE-01', 'Inspection Table', 'Manual', '10 hides/hr', 'Active'),
('MACHINE-02', 'Buffing Machine', 'Automatic', '100 sqft/hr', 'Active'),
('MACHINE-03', 'Spray Booth A', 'Spray', '200 sqft/hr', 'Active'),
('MACHINE-04', 'Spray Booth B', 'Spray', '200 sqft/hr', 'Active'),
('MACHINE-05', 'Tunnel Dryer', 'Conveyor', '500 sqft/hr', 'Active'),
('MACHINE-06', 'Ironing Machine', 'Heated Roller', '300 sqft/hr', 'Active'),
('MACHINE-07', 'Rotary Dryer', 'Drum', '200 sqft/hr', 'Active'),
('MACHINE-08', 'QC Table', 'Manual', '50 hides/hr', 'Active'),
('MACHINE-09', 'Packing Station', 'Manual', '100 hides/hr', 'Active')
ON DUPLICATE KEY UPDATE code=code;

-- ============================================================
-- 19. PROCESS STAGE PARAMETERS
-- ============================================================

INSERT INTO process_stage_parameters (process_stage_id, parameter_name, unit, default_value, min_value, max_value, required, seq) VALUES
-- Spray Base Coat parameters
((SELECT id FROM process_stages WHERE code='SPRAY-01'), 'Spray Pressure', 'bar', '3.5', '2.0', '5.0', TRUE, 1),
((SELECT id FROM process_stages WHERE code='SPRAY-01'), 'Nozzle Size', 'mm', '1.5', '1.0', '2.5', TRUE, 2),
((SELECT id FROM process_stages WHERE code='SPRAY-01'), 'Viscosity', 'sec', '20', '15', '30', TRUE, 3),
-- Drying parameters
((SELECT id FROM process_stages WHERE code='DRY-01'), 'Temperature', '°C', '65', '50', '80', TRUE, 1),
((SELECT id FROM process_stages WHERE code='DRY-01'), 'Airflow Speed', 'm/s', '2.0', '1.0', '5.0', TRUE, 2),
((SELECT id FROM process_stages WHERE code='DRY-01'), 'Duration', 'min', '20', '10', '40', TRUE, 3),
-- Ironing parameters
((SELECT id FROM process_stages WHERE code='IRON-01'), 'Temperature', '°C', '95', '80', '120', TRUE, 1),
((SELECT id FROM process_stages WHERE code='IRON-01'), 'Pressure', 'bar', '4.0', '2.0', '6.0', TRUE, 2),
((SELECT id FROM process_stages WHERE code='IRON-01'), 'Roller Speed', 'm/min', '5', '3', '10', TRUE, 3),
-- Top Coat parameters
((SELECT id FROM process_stages WHERE code='SPRAY-02'), 'Spray Pressure', 'bar', '3.0', '2.0', '4.5', TRUE, 1),
((SELECT id FROM process_stages WHERE code='SPRAY-02'), 'Passes', 'count', '2', '1', '4', TRUE, 2)
ON DUPLICATE KEY UPDATE parameter_name=parameter_name;

-- ============================================================
-- END OF SEED DATA
-- ============================================================
