-- Role Menu Access table
-- Stores which menu paths each role has access to
CREATE TABLE IF NOT EXISTS role_menu_access (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  role_id   INT NOT NULL,
  menu_path VARCHAR(200) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_role_menu (role_id, menu_path),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Seed: Give ADMIN and SUPERADMIN access to all paths
INSERT IGNORE INTO role_menu_access (role_id, menu_path)
SELECT r.id, paths.path
FROM roles r
CROSS JOIN (
  SELECT '/dashboard' AS path UNION ALL
  SELECT '/sales-orders' UNION ALL
  SELECT '/customer-master' UNION ALL
  SELECT '/supplier-master' UNION ALL
  SELECT '/product-master' UNION ALL
  SELECT '/chemical-master' UNION ALL
  SELECT '/product-category' UNION ALL
  SELECT '/leather-type' UNION ALL
  SELECT '/uom' UNION ALL
  SELECT '/thickness' UNION ALL
  SELECT '/standard-size' UNION ALL
  SELECT '/color' UNION ALL
  SELECT '/finish-type' UNION ALL
  SELECT '/grade' UNION ALL
  SELECT '/hsn-code' UNION ALL
  SELECT '/process-stage' UNION ALL
  SELECT '/machine' UNION ALL
  SELECT '/warehouse-master' UNION ALL
  SELECT '/bom' UNION ALL
  SELECT '/recipe-creation' UNION ALL
  SELECT '/bom-revision' UNION ALL
  SELECT '/material-requirement' UNION ALL
  SELECT '/purchase-orders' UNION ALL
  SELECT '/grn' UNION ALL
  SELECT '/supplier-invoice' UNION ALL
  SELECT '/supplier-return' UNION ALL
  SELECT '/supplier-pricing-history' UNION ALL
  SELECT '/supplier-price-approval' UNION ALL
  SELECT '/stock-opening-entry' UNION ALL
  SELECT '/material-receipt' UNION ALL
  SELECT '/physical-stock-entry' UNION ALL
  SELECT '/stock-transfer' UNION ALL
  SELECT '/material-issue' UNION ALL
  SELECT '/production-plan' UNION ALL
  SELECT '/batch-process' UNION ALL
  SELECT '/batch-completion' UNION ALL
  SELECT '/batch-lot-tracking' UNION ALL
  SELECT '/reports' UNION ALL
  SELECT '/inventory-reports' UNION ALL
  SELECT '/cost-analysis' UNION ALL
  SELECT '/users' UNION ALL
  SELECT '/roles' UNION ALL
  SELECT '/company' UNION ALL
  SELECT '/business-units'
) paths
WHERE r.code IN ('ADMIN', 'SUPERADMIN');
