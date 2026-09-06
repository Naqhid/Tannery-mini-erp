-- Department Master table
CREATE TABLE IF NOT EXISTS `departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `departments_code_unique` (`code`),
  UNIQUE KEY `departments_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default departments
INSERT IGNORE INTO `departments` (`code`, `name`, `status`) VALUES
('DEPT-001', 'Production', 'Active'),
('DEPT-002', 'Quality Control', 'Active'),
('DEPT-003', 'Warehouse', 'Active'),
('DEPT-004', 'Dispatch', 'Active');
