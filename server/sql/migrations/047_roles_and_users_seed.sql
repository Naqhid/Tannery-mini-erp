-- 047_roles_and_users_seed.sql
-- Creates per-function roles, their page (menu) access, and users.
-- Idempotent: safe to run multiple times (locally and on deploy).
--
-- NOTES
-- 1) Menu access only controls which menu items a role SEES. A role with NO
--    rows in role_menu_access is treated by the app as "full access".
-- 2) All seeded users share the temporary password: Tannery@123
--    (bcrypt cost 10 hash below). Users should change it after first login.
-- 3) Ihtishaam is mapped to the existing Administrator role (code 'ADMIN').

-- ─── 1) Roles ────────────────────────────────────────────────────────────────
INSERT INTO roles (code, name, description, access_level, status) VALUES
  ('SALE_ORDER',  'Sale Order',          'Sales order entry',            'read_write', 'Active'),
  ('PROD_PLAN',   'Production Planner',  'Production planning',          'read_write', 'Active'),
  ('MAT_ISSUE',   'Material Issue',      'Material issue to production', 'read_write', 'Active'),
  ('DAILY_PROD',  'Daily Production',    'Daily production entry',       'read_write', 'Active'),
  ('COSTING_OH',  'Costing / Overheads', 'Costing & overheads',          'read_write', 'Active')
ON DUPLICATE KEY UPDATE
  name = VALUES(name), description = VALUES(description),
  access_level = VALUES(access_level), status = VALUES(status);

-- ─── 2) Menu access per role ─────────────────────────────────────────────────
-- Clear any previous access for these roles so re-runs stay consistent.
DELETE rma FROM role_menu_access rma
JOIN roles r ON r.id = rma.role_id
WHERE r.code IN ('SALE_ORDER','PROD_PLAN','MAT_ISSUE','DAILY_PROD','COSTING_OH');

-- Sale Order
INSERT INTO role_menu_access (role_id, menu_path)
SELECT id, '/dashboard'    FROM roles WHERE code='SALE_ORDER'
UNION ALL SELECT id, '/sales-orders' FROM roles WHERE code='SALE_ORDER';

-- Production Planner (Wet Blue plan)
INSERT INTO role_menu_access (role_id, menu_path)
SELECT id, '/dashboard'          FROM roles WHERE code='PROD_PLAN'
UNION ALL SELECT id, '/production-plan'     FROM roles WHERE code='PROD_PLAN'
UNION ALL SELECT id, '/production-plan/new' FROM roles WHERE code='PROD_PLAN';

-- Material Issue
INSERT INTO role_menu_access (role_id, menu_path)
SELECT id, '/dashboard'     FROM roles WHERE code='MAT_ISSUE'
UNION ALL SELECT id, '/material-issue' FROM roles WHERE code='MAT_ISSUE';

-- Daily Production (Machinery / Dyeing / Measuring / Packing operators)
INSERT INTO role_menu_access (role_id, menu_path)
SELECT id, '/dashboard'        FROM roles WHERE code='DAILY_PROD'
UNION ALL SELECT id, '/production-status' FROM roles WHERE code='DAILY_PROD';

-- Costing / Overheads / Freight
INSERT INTO role_menu_access (role_id, menu_path)
SELECT id, '/dashboard'     FROM roles WHERE code='COSTING_OH'
UNION ALL SELECT id, '/general-cost'   FROM roles WHERE code='COSTING_OH'
UNION ALL SELECT id, '/machine-cost'   FROM roles WHERE code='COSTING_OH'
UNION ALL SELECT id, '/costing-report' FROM roles WHERE code='COSTING_OH';

-- ─── 3) Users ────────────────────────────────────────────────────────────────
-- Temp password for all seeded users = Tannery@123 (bcrypt, cost 10).
SET @pwd := '$2a$10$wokvJgCPZnM.tPgbajHZ9OWH6cGCg8R8TL5Xumy5cSnZbjKrNoToW';

INSERT INTO users (username, password_hash, full_name, role_id, status) VALUES
  ('ihtishaam', @pwd, 'Ihtishaam',      (SELECT id FROM roles WHERE code='ADMIN'      LIMIT 1), 'Active'),
  ('abdullah',      @pwd, 'Abdullah Basha', (SELECT id FROM roles WHERE code='PROD_PLAN'  LIMIT 1), 'Active'),
  ('tabrez',    @pwd, 'Tabrez',         (SELECT id FROM roles WHERE code='MAT_ISSUE'  LIMIT 1), 'Active'),
  ('sami',      @pwd, 'Sami',           (SELECT id FROM roles WHERE code='DAILY_PROD' LIMIT 1), 'Active'),
  ('ameen',     @pwd, 'Ameen',          (SELECT id FROM roles WHERE code='DAILY_PROD' LIMIT 1), 'Active'),
  ('aadil',     @pwd, 'Aadil',          (SELECT id FROM roles WHERE code='DAILY_PROD' LIMIT 1), 'Active'),
  ('waseem',    @pwd, 'Waseem',         (SELECT id FROM roles WHERE code='DAILY_PROD' LIMIT 1), 'Active'),
  ('umar',      @pwd, 'Umar',           (SELECT id FROM roles WHERE code='DAILY_PROD' LIMIT 1), 'Active')
ON DUPLICATE KEY UPDATE
  full_name = VALUES(full_name), role_id = VALUES(role_id), status = VALUES(status);
