-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: tannery_mini_erp
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audit_log`
--

DROP TABLE IF EXISTS `audit_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `table_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `record_id` int NOT NULL,
  `action` enum('INSERT','UPDATE','DELETE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `changed_by` int DEFAULT NULL,
  `changed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_audit_table` (`table_name`),
  KEY `idx_audit_record` (`table_name`,`record_id`),
  KEY `idx_audit_date` (`changed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_log`
--

LOCK TABLES `audit_log` WRITE;
/*!40000 ALTER TABLE `audit_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `batch_line_items`
--

DROP TABLE IF EXISTS `batch_line_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `batch_line_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `batch_id` int NOT NULL,
  `seq` int DEFAULT '1',
  `customer_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order_no` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `article_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `article_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `finish` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `receipt_qty` decimal(12,2) DEFAULT '0.00',
  `uom` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'SQ.FT.',
  `output_qty` decimal(12,2) DEFAULT '0.00',
  `output_uom` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'SQ.FT.',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Pending',
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_bli_batch` (`batch_id`),
  KEY `idx_bli_seq` (`batch_id`,`seq`),
  CONSTRAINT `fk_bli_batch` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `batch_line_items`
--

LOCK TABLES `batch_line_items` WRITE;
/*!40000 ALTER TABLE `batch_line_items` DISABLE KEYS */;
INSERT INTO `batch_line_items` VALUES (1,1,1,'Leather World Co.','SO-2024-0015','LTH-1001','Cow Leather','Full Chrome','Black',800.00,'SQ.FT.',760.00,'SQ.FT.','Completed',NULL,'2026-07-20 18:34:45','2026-07-20 18:34:45'),(2,1,2,'Leather World Co.','SO-2024-0015','LTH-1001','Cow Leather','Semi Chrome','Brown',200.00,'SQ.FT.',200.00,'SQ.FT.','Completed',NULL,'2026-07-20 18:34:45','2026-07-20 18:34:45'),(3,1,3,'Leather World Co.','SO-2024-0015','LTH-1001','Cow Leather','Vegetable','Tan',400.00,'SQ.FT.',380.00,'SQ.FT.','Completed',NULL,'2026-07-20 18:34:45','2026-07-20 18:34:45'),(4,1,4,'Leather World Co.','SO-2024-0015','LTH-1001','Cow Leather','Full Chrome','Navy Blue',350.00,'SQ.FT.',330.00,'SQ.FT.','Completed',NULL,'2026-07-20 18:34:45','2026-07-20 18:34:45'),(5,1,5,'Leather World Co.','SO-2024-0015','LTH-1001','Cow Leather','Pull Up','Dark Brown',300.00,'SQ.FT.',280.00,'SQ.FT.','Completed',NULL,'2026-07-20 18:34:45','2026-07-20 18:34:45'),(6,2,1,'Global Leathers Ltd.','SO-2024-0018','LTH-1002','Buffalo Leather','Semi Chrome','Black',800.00,'SQ.FT.',570.00,'SQ.FT.','Completed',NULL,'2026-07-20 18:34:45','2026-07-20 18:34:45');
/*!40000 ALTER TABLE `batch_line_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `batches`
--

DROP TABLE IF EXISTS `batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `batches` (
  `id` int NOT NULL AUTO_INCREMENT,
  `batch_no` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `production_plan_id` int DEFAULT NULL,
  `sales_order_id` int DEFAULT NULL,
  `customer_id` int DEFAULT NULL,
  `order_no` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `article_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `article_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `production_date` date DEFAULT NULL,
  `stage` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Tanning',
  `current_stage` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Tanning',
  `total_receipt_qty` decimal(12,2) DEFAULT '0.00',
  `total_output_qty` decimal(12,2) DEFAULT '0.00',
  `yield_percent` decimal(5,2) DEFAULT '0.00',
  `status` enum('Draft','In-Process','Completed','On-Hold','Cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `batch_no` (`batch_no`),
  KEY `fk_batch_so` (`sales_order_id`),
  KEY `fk_batch_customer` (`customer_id`),
  KEY `idx_batch_number` (`batch_no`),
  KEY `idx_batch_plan` (`production_plan_id`),
  KEY `idx_batch_date` (`production_date`),
  KEY `idx_batch_status` (`status`),
  KEY `idx_batch_deleted` (`deleted_at`),
  CONSTRAINT `fk_batch_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_batch_plan` FOREIGN KEY (`production_plan_id`) REFERENCES `production_plans` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_batch_so` FOREIGN KEY (`sales_order_id`) REFERENCES `sales_orders` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `batches`
--

LOCK TABLES `batches` WRITE;
/*!40000 ALTER TABLE `batches` DISABLE KEYS */;
INSERT INTO `batches` VALUES (6,'BTCH-202405-0012',NULL,NULL,NULL,'SO-2024-0015','LTH-1001','Cow Leather','2024-05-20','Tanning','Tanning',2450.00,2320.00,94.69,'Completed','Batch for Leather World Co.',1,NULL,NULL,'2026-07-20 18:34:45','2026-07-20 18:34:45'),(7,'BTCH-202405-0013',NULL,NULL,NULL,'SO-2024-0018','LTH-1002','Buffalo Leather','2024-05-20','Tanning','Tanning',800.00,760.00,95.00,'Completed','Batch for Global Leathers Ltd.',1,NULL,NULL,'2026-07-20 18:34:45','2026-07-20 18:34:45'),(8,'BTCH-202405-0014',NULL,NULL,NULL,'SO-2024-0021','LTH-1003','Sheep Leather','2024-05-21','Finishing','Finishing',400.00,380.00,95.00,'In-Process','Batch for Premium Shoes Pvt. Ltd.',1,NULL,NULL,'2026-07-20 18:34:45','2026-07-20 18:34:45'),(9,'BTCH-202405-0015',NULL,NULL,NULL,'SO-2024-0023','LTH-1004','Goat Leather','2024-05-21','Dyeing','Dyeing',350.00,330.00,94.29,'In-Process','Batch for Fashion Footwear Inc.',1,NULL,NULL,'2026-07-20 18:34:45','2026-07-20 18:34:45'),(10,'BTCH-202405-0016',NULL,NULL,NULL,'SO-2024-0025','LTH-1005','Cow Leather','2024-05-22','Tanning','Tanning',300.00,280.00,93.33,'In-Process','Batch for Elite Exports',1,NULL,NULL,'2026-07-20 18:34:45','2026-07-20 18:34:45');
/*!40000 ALTER TABLE `batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bom_items`
--

DROP TABLE IF EXISTS `bom_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bom_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bom_id` int NOT NULL,
  `material_id` int NOT NULL,
  `type` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT 'Chemical',
  `uom` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'Kg',
  `qty` decimal(12,3) NOT NULL DEFAULT '0.000',
  `unit_cost` decimal(10,2) NOT NULL DEFAULT '0.00',
  `amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `supplier_id` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `scrap_percent` decimal(10,2) NOT NULL DEFAULT '0.00',
  `effective_from` date DEFAULT NULL,
  `effective_to` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_bi_material` (`material_id`),
  KEY `idx_bi_bom` (`bom_id`),
  KEY `fk_bi_supplier` (`supplier_id`),
  CONSTRAINT `fk_bi_bom` FOREIGN KEY (`bom_id`) REFERENCES `boms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bi_material` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_bi_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bom_items`
--

LOCK TABLES `bom_items` WRITE;
/*!40000 ALTER TABLE `bom_items` DISABLE KEYS */;
INSERT INTO `bom_items` VALUES (1,1,5,'Chemicals','KG',3.000,4.00,12.00,'test','2026-07-31 11:17:05','2026-07-31 11:36:31',1,1,1,3.00,'2026-06-23','2026-06-30');
/*!40000 ALTER TABLE `bom_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bom_versions`
--

DROP TABLE IF EXISTS `bom_versions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bom_versions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bom_id` int NOT NULL,
  `version_no` int NOT NULL DEFAULT '1',
  `revision_no` int NOT NULL DEFAULT '1',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `effective_from` date DEFAULT NULL,
  `effective_to` date DEFAULT NULL,
  `change_reason` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `snapshot` json NOT NULL,
  `created_by` int DEFAULT NULL,
  `released_by` int DEFAULT NULL,
  `released_on` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_bom_version_revision` (`bom_id`,`version_no`,`revision_no`),
  KEY `idx_bom_versions_bom_id` (`bom_id`),
  CONSTRAINT `fk_bom_versions_bom` FOREIGN KEY (`bom_id`) REFERENCES `boms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bom_versions`
--

LOCK TABLES `bom_versions` WRITE;
/*!40000 ALTER TABLE `bom_versions` DISABLE KEYS */;
INSERT INTO `bom_versions` VALUES (1,1,1,1,'Superseded','2026-06-27','2026-07-04',NULL,'{\"bom\": {\"id\": 1, \"uom\": \"sqft\", \"code\": \"testing\", \"name\": \"testing\", \"status\": \"Active\", \"uom_id\": null, \"version\": 1, \"valid_to\": \"2026-07-03T18:30:00.000Z\", \"recipe_id\": null, \"thickness\": \"1.2-1.4\", \"created_at\": \"2026-07-03T17:34:10.000Z\", \"created_by\": null, \"product_id\": null, \"updated_at\": \"2026-07-31T11:10:00.000Z\", \"updated_by\": 1, \"valid_from\": \"2026-06-26T18:30:00.000Z\", \"description\": \"test\", \"leather_type\": \"cow\", \"process_type\": \"finishing\", \"thickness_id\": null, \"leather_type_id\": null}, \"items\": []}',1,1,'2026-07-31 16:40:00','2026-07-31 11:10:00'),(2,1,1,2,'Superseded','2026-06-26','2026-07-03',NULL,'{\"bom\": {\"id\": 1, \"uom\": \"sqft\", \"code\": \"testing\", \"name\": \"testing\", \"status\": \"Active\", \"uom_id\": null, \"version\": 1, \"valid_to\": \"2026-07-02T18:30:00.000Z\", \"recipe_id\": null, \"thickness\": \"1.2-1.4\", \"created_at\": \"2026-07-03T17:34:10.000Z\", \"created_by\": null, \"product_id\": null, \"updated_at\": \"2026-07-31T11:10:09.000Z\", \"updated_by\": 1, \"valid_from\": \"2026-06-25T18:30:00.000Z\", \"description\": \"test\", \"leather_type\": \"cow\", \"process_type\": \"finishing\", \"thickness_id\": null, \"leather_type_id\": null}, \"items\": []}',1,1,'2026-07-31 16:40:09','2026-07-31 11:10:09'),(3,1,1,3,'Superseded','2026-06-25','2026-07-02',NULL,'{\"bom\": {\"id\": 1, \"uom\": \"sqft\", \"code\": \"testing\", \"name\": \"testing\", \"status\": \"Active\", \"uom_id\": null, \"version\": 1, \"valid_to\": \"2026-07-01T18:30:00.000Z\", \"recipe_id\": null, \"thickness\": \"1.2-1.4\", \"created_at\": \"2026-07-03T17:34:10.000Z\", \"created_by\": null, \"product_id\": null, \"updated_at\": \"2026-07-31T11:16:38.000Z\", \"updated_by\": 1, \"valid_from\": \"2026-06-24T18:30:00.000Z\", \"description\": \"test\", \"leather_type\": \"cow\", \"process_type\": \"tanning\", \"thickness_id\": null, \"leather_type_id\": null}, \"items\": []}',1,1,'2026-07-31 16:46:38','2026-07-31 11:16:38'),(4,1,1,4,'Superseded','2026-06-25','2026-07-02','Component added','{\"bom\": {\"id\": 1, \"uom\": \"sqft\", \"code\": \"testing\", \"name\": \"testing\", \"status\": \"Active\", \"uom_id\": null, \"version\": 1, \"valid_to\": \"2026-07-01T18:30:00.000Z\", \"recipe_id\": null, \"thickness\": \"1.2-1.4\", \"created_at\": \"2026-07-03T17:34:10.000Z\", \"created_by\": null, \"product_id\": null, \"updated_at\": \"2026-07-31T11:16:38.000Z\", \"updated_by\": 1, \"valid_from\": \"2026-06-24T18:30:00.000Z\", \"description\": \"test\", \"leather_type\": \"cow\", \"process_type\": \"tanning\", \"thickness_id\": null, \"leather_type_id\": null}, \"items\": [{\"id\": 1, \"qty\": \"3.000\", \"uom\": \"KG\", \"type\": \"Chemicals\", \"amount\": \"12.00\", \"bom_id\": 1, \"remarks\": \"test\", \"unit_cost\": \"4.00\", \"created_at\": \"2026-07-31T11:17:05.000Z\", \"created_by\": 1, \"updated_at\": \"2026-07-31T11:17:05.000Z\", \"updated_by\": null, \"material_id\": 5, \"supplier_id\": 3, \"effective_to\": \"2026-06-30T18:30:00.000Z\", \"scrap_percent\": \"3.00\", \"effective_from\": \"2026-06-23T18:30:00.000Z\"}]}',1,1,'2026-07-31 16:47:05','2026-07-31 11:17:05'),(5,1,1,5,'Superseded','2026-06-24','2026-07-01',NULL,'{\"bom\": {\"id\": 1, \"uom\": \"sqft\", \"code\": \"testing\", \"name\": \"testing\", \"status\": \"Active\", \"uom_id\": null, \"version\": 1, \"valid_to\": \"2026-06-30T18:30:00.000Z\", \"recipe_id\": null, \"thickness\": \"1.2-1.4\", \"created_at\": \"2026-07-03T17:34:10.000Z\", \"created_by\": null, \"product_id\": 3, \"updated_at\": \"2026-07-31T11:25:16.000Z\", \"updated_by\": 1, \"valid_from\": \"2026-06-23T18:30:00.000Z\", \"description\": \"test\", \"leather_type\": \"cow\", \"process_type\": \"tanning\", \"thickness_id\": 5, \"leather_type_id\": 3}, \"items\": [{\"id\": 1, \"qty\": \"3.000\", \"uom\": \"KG\", \"type\": \"Chemicals\", \"amount\": \"12.00\", \"bom_id\": 1, \"remarks\": \"test\", \"unit_cost\": \"4.00\", \"created_at\": \"2026-07-31T11:17:05.000Z\", \"created_by\": 1, \"updated_at\": \"2026-07-31T11:17:05.000Z\", \"updated_by\": null, \"material_id\": 5, \"supplier_id\": 3, \"effective_to\": \"2026-06-30T18:30:00.000Z\", \"scrap_percent\": \"3.00\", \"effective_from\": \"2026-06-23T18:30:00.000Z\"}]}',1,1,'2026-07-31 16:55:16','2026-07-31 11:25:16'),(6,1,1,6,'Active','2026-06-24','2026-07-01','Component updated','{\"bom\": {\"id\": 1, \"uom\": \"sqft\", \"code\": \"testing\", \"name\": \"testing\", \"status\": \"Active\", \"uom_id\": null, \"version\": 1, \"valid_to\": \"2026-06-30T18:30:00.000Z\", \"recipe_id\": null, \"thickness\": \"1.2-1.4\", \"created_at\": \"2026-07-03T17:34:10.000Z\", \"created_by\": null, \"product_id\": 3, \"updated_at\": \"2026-07-31T11:25:16.000Z\", \"updated_by\": 1, \"valid_from\": \"2026-06-23T18:30:00.000Z\", \"description\": \"test\", \"leather_type\": \"cow\", \"process_type\": \"tanning\", \"thickness_id\": 5, \"leather_type_id\": 3}, \"items\": [{\"id\": 1, \"qty\": \"3.000\", \"uom\": \"KG\", \"type\": \"Chemicals\", \"amount\": \"12.00\", \"bom_id\": 1, \"remarks\": \"test\", \"unit_cost\": \"4.00\", \"created_at\": \"2026-07-31T11:17:05.000Z\", \"created_by\": 1, \"updated_at\": \"2026-07-31T11:36:31.000Z\", \"updated_by\": 1, \"material_id\": 5, \"supplier_id\": 1, \"effective_to\": \"2026-06-29T18:30:00.000Z\", \"scrap_percent\": \"3.00\", \"effective_from\": \"2026-06-22T18:30:00.000Z\"}]}',1,1,'2026-07-31 17:06:31','2026-07-31 11:36:31');
/*!40000 ALTER TABLE `bom_versions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `boms`
--

DROP TABLE IF EXISTS `boms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `boms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` int DEFAULT NULL,
  `recipe_id` int DEFAULT NULL,
  `leather_type` enum('cow','buffalo','goat','sheep') COLLATE utf8mb4_unicode_ci DEFAULT 'cow',
  `process_type` enum('finishing','tanning','dyeing') COLLATE utf8mb4_unicode_ci DEFAULT 'finishing',
  `thickness` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uom` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'Sq. Ft.',
  `valid_from` date DEFAULT NULL,
  `valid_to` date DEFAULT NULL,
  `status` enum('Active','Inactive','Draft') COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
  `description` text COLLATE utf8mb4_unicode_ci,
  `version` int DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `leather_type_id` int DEFAULT NULL,
  `uom_id` int DEFAULT NULL,
  `thickness_id` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_bom_product` (`product_id`),
  KEY `idx_bom_recipe` (`recipe_id`),
  CONSTRAINT `fk_bom_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_bom_product_new` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_bom_recipe` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `boms`
--

LOCK TABLES `boms` WRITE;
/*!40000 ALTER TABLE `boms` DISABLE KEYS */;
INSERT INTO `boms` VALUES (1,'testing','testing',3,NULL,'cow','tanning','1.2-1.4','sqft','2026-06-24','2026-07-01','Active','test',1,'2026-07-03 17:34:10','2026-07-31 11:25:16',3,NULL,5,NULL,1);
/*!40000 ALTER TABLE `boms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `business_units`
--

DROP TABLE IF EXISTS `business_units`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `business_units` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_id` int NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pin_code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_bu_code` (`code`),
  KEY `idx_bu_company` (`company_id`),
  KEY `idx_bu_deleted` (`deleted_at`),
  CONSTRAINT `fk_bu_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `business_units`
--

LOCK TABLES `business_units` WRITE;
/*!40000 ALTER TABLE `business_units` DISABLE KEYS */;
INSERT INTO `business_units` VALUES (1,'BU-FINISH','Finishing Unit',3,'Vellore Industrial Estate','Vellore','Tamil Nadu','India',NULL,NULL,NULL,'Inactive','2026-07-05 14:29:03','2026-07-22 06:03:01',NULL,3,'2026-07-22 06:03:01');
/*!40000 ALTER TABLE `business_units` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cities`
--

DROP TABLE IF EXISTS `cities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state_id` int NOT NULL,
  `country_id` int NOT NULL,
  `pincode` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_city_state` (`state_id`),
  KEY `idx_city_country` (`country_id`),
  CONSTRAINT `fk_city_country` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_city_state` FOREIGN KEY (`state_id`) REFERENCES `states` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cities`
--

LOCK TABLES `cities` WRITE;
/*!40000 ALTER TABLE `cities` DISABLE KEYS */;
INSERT INTO `cities` VALUES (1,'Chennai',1,1,'600001','Active','2026-07-05 14:29:03','2026-07-05 14:29:03'),(2,'Vellore',1,1,'632001','Active','2026-07-05 14:29:03','2026-07-05 14:29:03'),(3,'Ranipet',1,1,'632401','Active','2026-07-05 14:29:03','2026-07-05 14:29:03'),(4,'Ambur',1,1,'635802','Active','2026-07-05 14:29:03','2026-07-05 14:29:03'),(5,'Vaniyambadi',1,1,'635751','Active','2026-07-05 14:29:03','2026-07-05 14:29:03'),(6,'Erode',1,1,'638001','Active','2026-07-05 14:29:03','2026-07-05 14:29:03'),(7,'Coimbatore',1,1,'641001','Active','2026-07-05 14:29:03','2026-07-05 14:29:03'),(8,'Trichy',1,1,'620001','Active','2026-07-05 14:29:03','2026-07-05 14:29:03'),(9,'Madurai',1,1,'625001','Active','2026-07-05 14:29:03','2026-07-05 14:29:03'),(10,'Bangalore',2,1,'560001','Active','2026-07-05 14:29:03','2026-07-05 14:29:03'),(11,'Mumbai',3,1,'400001','Active','2026-07-05 14:29:03','2026-07-05 14:29:03'),(12,'Pune',3,1,'411001','Active','2026-07-05 14:29:03','2026-07-05 14:29:03'),(13,'Kochi',4,1,'682001','Active','2026-07-05 14:29:03','2026-07-05 14:29:03'),(14,'Hyderabad',5,1,'500001','Active','2026-07-05 14:29:03','2026-07-05 14:29:03'),(15,'Chennai',1,1,'600001','Active','2026-07-05 14:29:54','2026-07-05 14:29:54'),(16,'Vellore',1,1,'632001','Active','2026-07-05 14:29:54','2026-07-05 14:29:54'),(17,'Ranipet',1,1,'632401','Active','2026-07-05 14:29:54','2026-07-05 14:29:54'),(18,'Ambur',1,1,'635802','Active','2026-07-05 14:29:54','2026-07-05 14:29:54'),(19,'Vaniyambadi',1,1,'635751','Active','2026-07-05 14:29:54','2026-07-05 14:29:54'),(20,'Erode',1,1,'638001','Active','2026-07-05 14:29:54','2026-07-05 14:29:54'),(21,'Coimbatore',1,1,'641001','Active','2026-07-05 14:29:54','2026-07-05 14:29:54'),(22,'Trichy',1,1,'620001','Active','2026-07-05 14:29:54','2026-07-05 14:29:54'),(23,'Madurai',1,1,'625001','Active','2026-07-05 14:29:54','2026-07-05 14:29:54'),(24,'Bangalore',2,1,'560001','Active','2026-07-05 14:29:54','2026-07-05 14:29:54'),(25,'Mumbai',3,1,'400001','Active','2026-07-05 14:29:54','2026-07-05 14:29:54'),(26,'Pune',3,1,'411001','Active','2026-07-05 14:29:54','2026-07-05 14:29:54'),(27,'Kochi',4,1,'682001','Active','2026-07-05 14:29:54','2026-07-05 14:29:54'),(28,'Hyderabad',5,1,'500001','Active','2026-07-05 14:29:54','2026-07-05 14:29:54');
/*!40000 ALTER TABLE `cities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `colors`
--

DROP TABLE IF EXISTS `colors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `colors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hex_code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_color_code` (`code`),
  KEY `idx_clr_deleted` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `colors`
--

LOCK TABLES `colors` WRITE;
/*!40000 ALTER TABLE `colors` DISABLE KEYS */;
INSERT INTO `colors` VALUES (1,'BLACK','Black','#000000','Classic black color','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(2,'BROWN','Brown','#8B4513','Natural brown color','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(3,'DARK-BRN','Dark Brown','#654321','Deep brown color','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(4,'TAN','Tan','#D2B48C','Light tan color','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(5,'NATURAL','Natural','#F5F5DC','Untreated natural color','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(6,'GREY','Grey','#808080','Grey color','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(7,'BEIGE','Beige','#F5F5DC','Beige color','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(8,'NAVY','Navy Blue','#000080','Navy blue color','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(9,'RED','Red','#8B0000','Dark red color','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(10,'GREEN','Green','#006400','Dark green color','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(12,'CLR-00NaN','Green (Copy)','#006400','Dark green color','Inactive','2026-07-11 14:35:07','2026-07-11 14:35:37',NULL,NULL,'2026-07-11 14:35:37');
/*!40000 ALTER TABLE `colors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `companies`
--

DROP TABLE IF EXISTS `companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `companies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pin_code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gstin` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pan` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo` text COLLATE utf8mb4_unicode_ci,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_company_code` (`code`),
  KEY `idx_comp_deleted` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `companies`
--

LOCK TABLES `companies` WRITE;
/*!40000 ALTER TABLE `companies` DISABLE KEYS */;
INSERT INTO `companies` VALUES (1,'CORIX','Corix Leather Industries','No. 1, Leather Complex, Vellore','Vellore','Tamil Nadu','India','632001','+91 416 2234567','info@corixleather.com','33AAACC1234A1Z5',NULL,NULL,NULL,'Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(3,'123','Mkm',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-07-07 14:14:44','2026-07-07 14:14:44',3,NULL,NULL);
/*!40000 ALTER TABLE `companies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `countries`
--

DROP TABLE IF EXISTS `countries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `countries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone_code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_country_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `countries`
--

LOCK TABLES `countries` WRITE;
/*!40000 ALTER TABLE `countries` DISABLE KEYS */;
INSERT INTO `countries` VALUES (1,'IN','India','+91','Active','2026-07-05 14:29:03','2026-07-05 14:29:03'),(2,'US','United States','+1','Active','2026-07-05 14:29:03','2026-07-05 14:29:03'),(3,'UK','United Kingdom','+44','Active','2026-07-05 14:29:03','2026-07-05 14:29:03'),(4,'DE','Germany','+49','Active','2026-07-05 14:29:03','2026-07-05 14:29:03'),(5,'IT','Italy','+39','Active','2026-07-05 14:29:03','2026-07-05 14:29:03'),(6,'CN','China','+86','Active','2026-07-05 14:29:03','2026-07-05 14:29:03'),(7,'BD','Bangladesh','+880','Active','2026-07-05 14:29:03','2026-07-05 14:29:03'),(8,'PK','Pakistan','+92','Active','2026-07-05 14:29:03','2026-07-05 14:29:03'),(9,'AE','United Arab Emirates','+971','Active','2026-07-05 14:29:03','2026-07-05 14:29:03'),(10,'ZA','South Africa','+27','Active','2026-07-05 14:29:03','2026-07-05 14:29:03');
/*!40000 ALTER TABLE `countries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `currencies`
--

DROP TABLE IF EXISTS `currencies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `currencies` (
  `code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `symbol` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT '',
  PRIMARY KEY (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `currencies`
--

LOCK TABLES `currencies` WRITE;
/*!40000 ALTER TABLE `currencies` DISABLE KEYS */;
INSERT INTO `currencies` VALUES ('EUR','Euro','?'),('INR','Indian Rupee',''),('USD','US Dollar','$');
/*!40000 ALTER TABLE `currencies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_person` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alt_phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `category` enum('export','domestic','wholesale') COLLATE utf8mb4_unicode_ci DEFAULT 'domestic',
  `currency` enum('inr','usd','eur') COLLATE utf8mb4_unicode_ci DEFAULT 'inr',
  `billing_address` text COLLATE utf8mb4_unicode_ci,
  `shipping_address` text COLLATE utf8mb4_unicode_ci,
  `pin_code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gstin` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pan` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_terms` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `credit_limit` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `country_id` int DEFAULT NULL,
  `state_id` int DEFAULT NULL,
  `city_id` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `fk_customer_country` (`country_id`),
  KEY `fk_customer_state` (`state_id`),
  KEY `fk_customer_city` (`city_id`),
  KEY `idx_cust_deleted` (`deleted_at`),
  CONSTRAINT `fk_customer_city` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_customer_country` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_customer_state` FOREIGN KEY (`state_id`) REFERENCES `states` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,'01','Mohammed Naqhid Chowdri','Mohammed Naqhid Chowdri','123456789','test@gmail.com','987654321','Ambur','Tamil Nadu','India','Active','domestic','inr','test','test','635802','27AAPFU0939F1ZV','ABCDE1234F','30','test','','2026-07-01 16:31:24','2026-07-15 14:09:55',NULL,NULL,NULL,NULL,NULL,NULL),(3,'test','tes new','test','123456789','test@gmail.com','123456789','Ambur','Tamil Nadu','India','Active','domestic','inr','testing new','testing one','test','27ABCPS1234L1Z5','ABCPS1234L','30','test','test','2026-07-11 12:47:05','2026-07-21 06:26:58',NULL,NULL,NULL,NULL,1,NULL);
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `delivery_note_items`
--

DROP TABLE IF EXISTS `delivery_note_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `delivery_note_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `delivery_note_id` int NOT NULL,
  `sales_order_item_id` int DEFAULT NULL,
  `item_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `item_description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uom` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ordered_qty` decimal(12,2) DEFAULT '0.00',
  `shipped_qty` decimal(12,2) DEFAULT '0.00',
  `pending_qty` decimal(12,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_dni_note` (`delivery_note_id`),
  CONSTRAINT `fk_dni_note` FOREIGN KEY (`delivery_note_id`) REFERENCES `delivery_notes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_note_items`
--

LOCK TABLES `delivery_note_items` WRITE;
/*!40000 ALTER TABLE `delivery_note_items` DISABLE KEYS */;
INSERT INTO `delivery_note_items` VALUES (1,1,NULL,'5','test','Sq.Ft.',2.00,2.00,0.00,'2026-07-08 07:00:14');
/*!40000 ALTER TABLE `delivery_note_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `delivery_notes`
--

DROP TABLE IF EXISTS `delivery_notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `delivery_notes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `delivery_no` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sales_order_id` int NOT NULL,
  `delivery_date` date DEFAULT NULL,
  `delivery_from` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transporter` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vehicle_no` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lr_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `no_of_packages` int DEFAULT NULL,
  `delivery_to` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `delivery_instructions` text COLLATE utf8mb4_unicode_ci,
  `status` enum('Draft','Dispatched','Delivered') COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `delivery_no` (`delivery_no`),
  KEY `idx_dn_order` (`sales_order_id`),
  CONSTRAINT `fk_dn_order` FOREIGN KEY (`sales_order_id`) REFERENCES `sales_orders` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_notes`
--

LOCK TABLES `delivery_notes` WRITE;
/*!40000 ALTER TABLE `delivery_notes` DISABLE KEYS */;
INSERT INTO `delivery_notes` VALUES (1,'6',1,'2026-07-09','test','test','test','test',2,'test','test','Draft',3,NULL,'2026-07-08 07:00:14','2026-07-08 07:00:14');
/*!40000 ALTER TABLE `delivery_notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finish_types`
--

DROP TABLE IF EXISTS `finish_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `finish_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_finishtype_code` (`code`),
  KEY `idx_ft_deleted` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finish_types`
--

LOCK TABLES `finish_types` WRITE;
/*!40000 ALTER TABLE `finish_types` DISABLE KEYS */;
INSERT INTO `finish_types` VALUES (1,'SEMI-ANILINE','Semi Aniline','Breathable finish with slight pigment coating','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(2,'FULL-GRAIN','Full Grain','Natural finish preserving grain','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(3,'NAPPA','Nappa','Soft smooth finish','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(4,'SUEDE','Suede','Brushed napped finish','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(5,'NUBUCK','Nubuck','Buffed grain surface','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(6,'PULL-UP','Pull-Up','Waxed finish that lightens when stretched','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(7,'PATENT','Patent','High gloss finish','Active','2026-07-05 14:29:03','2026-07-21 06:58:48',NULL,1,NULL),(8,'CORRECTED','Corrected Grain','Buffed and corrected surface','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(9,'CRUST','Crust','Unfinished leather','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(10,'GLAZED','Glazed','Polished glossy finish','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL);
/*!40000 ALTER TABLE `finish_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grades`
--

DROP TABLE IF EXISTS `grades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grades` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rank` int DEFAULT '1',
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_grade_code` (`code`),
  KEY `idx_gr_deleted` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grades`
--

LOCK TABLES `grades` WRITE;
/*!40000 ALTER TABLE `grades` DISABLE KEYS */;
INSERT INTO `grades` VALUES (1,'A','A Grade - Premium',1,'Highest quality, no defects','Active','2026-07-05 14:29:54','2026-07-05 14:29:54',NULL,NULL,NULL),(2,'B','B Grade - Standard',2,'Good quality, minor natural marks','Active','2026-07-05 14:29:54','2026-07-05 14:29:54',NULL,NULL,NULL),(3,'C','C Grade - Economy',3,'Functional quality with visible marks','Active','2026-07-05 14:29:54','2026-07-05 14:29:54',NULL,NULL,NULL),(4,'REJECT','Reject Grade',4,'Below standard quality','Active','2026-07-05 14:29:54','2026-07-05 14:29:54',NULL,NULL,NULL),(5,'test grade','test grade',1,'test grade','Active','2026-07-07 06:50:11','2026-07-07 06:50:11',NULL,NULL,NULL);
/*!40000 ALTER TABLE `grades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `group_master`
--

DROP TABLE IF EXISTS `group_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_master` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` int DEFAULT NULL,
  `hsn_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gst_rate` decimal(5,2) NOT NULL DEFAULT '18.00',
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `group_master_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `product_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_master`
--

LOCK TABLES `group_master` WRITE;
/*!40000 ALTER TABLE `group_master` DISABLE KEYS */;
INSERT INTO `group_master` VALUES (1,'GRP-00001','Finished Leather',NULL,'4107',12.00,'Finished leather group','Active',0,NULL,NULL,NULL,'2026-07-29 06:21:54','2026-07-29 06:21:54'),(2,'GRP-00002','Tanning Chemicals',NULL,'3202',18.00,'Tanning chemicals group','Active',0,NULL,NULL,NULL,'2026-07-29 06:21:54','2026-07-29 06:21:54'),(3,'GRP-00003','Dyes & Pigments',NULL,'3204',18.00,'Dyes and pigments group','Active',0,NULL,NULL,NULL,'2026-07-29 06:21:54','2026-07-29 06:21:54'),(4,'GRP-00004','test',1,'test',5.00,'test','Active',0,NULL,1,NULL,'2026-07-29 06:27:29','2026-07-29 06:27:29');
/*!40000 ALTER TABLE `group_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hsn_codes`
--

DROP TABLE IF EXISTS `hsn_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hsn_codes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `gst_rate` decimal(5,2) DEFAULT '18.00',
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_hsn_code` (`code`),
  KEY `idx_hsn_deleted` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hsn_codes`
--

LOCK TABLES `hsn_codes` WRITE;
/*!40000 ALTER TABLE `hsn_codes` DISABLE KEYS */;
INSERT INTO `hsn_codes` VALUES (1,'4107','Finished Leather','Finished leather, further prepared after tanning',18.00,'Active','2026-07-05 14:29:55','2026-07-05 14:29:55',NULL,NULL,NULL),(2,'4104','Semi-Processed Leather','Semi-processed tanned leather',18.00,'Active','2026-07-05 14:29:55','2026-07-22 06:03:57',NULL,NULL,NULL),(3,'4105','Wet Blue Leather','Chrome tanned leather (wet blue)',18.00,'Active','2026-07-05 14:29:55','2026-07-05 14:29:55',NULL,NULL,NULL),(4,'4106','Crust Leather','Tanned but not finished leather',18.00,'Active','2026-07-05 14:29:55','2026-07-05 14:29:55',NULL,NULL,NULL),(5,'3208','Synthetic Tanning Agents','Synthetic tanning preparations',18.00,'Active','2026-07-05 14:29:55','2026-07-05 14:29:55',NULL,NULL,NULL),(6,'3209','Finishing Agents','Leather finishing preparations',18.00,'Active','2026-07-05 14:29:55','2026-07-05 14:29:55',NULL,NULL,NULL);
/*!40000 ALTER TABLE `hsn_codes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoice_no` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sales_order_id` int NOT NULL,
  `invoice_date` date DEFAULT NULL,
  `invoice_amount` decimal(14,2) DEFAULT '0.00',
  `paid_amount` decimal(14,2) DEFAULT '0.00',
  `balance` decimal(14,2) DEFAULT '0.00',
  `status` enum('Pending','Partially Paid','Paid','Cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'Pending',
  `due_date` date DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoice_no` (`invoice_no`),
  KEY `idx_inv_order` (`sales_order_id`),
  CONSTRAINT `fk_inv_order` FOREIGN KEY (`sales_order_id`) REFERENCES `sales_orders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leather_types`
--

DROP TABLE IF EXISTS `leather_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leather_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_leathertype_code` (`code`),
  KEY `idx_lt_deleted` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leather_types`
--

LOCK TABLES `leather_types` WRITE;
/*!40000 ALTER TABLE `leather_types` DISABLE KEYS */;
INSERT INTO `leather_types` VALUES (1,'COW','Cow Leather','Leather made from cow hides','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(2,'BUFFALO','Buffalo Leather','Leather made from buffalo hides','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(3,'GOAT','Goat Leather','Leather made from goat skins','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(4,'SHEEP','Sheep Leather','Leather made from sheep skins','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(5,'CALF','Calf Leather','Leather made from calf hides','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL);
/*!40000 ALTER TABLE `leather_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `machines`
--

DROP TABLE IF EXISTS `machines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `machines` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `uom_type` enum('Per Hour','Per Pcs') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rate_indian` decimal(10,2) NOT NULL DEFAULT '0.00',
  `rate_imported` decimal(10,2) NOT NULL DEFAULT '0.00',
  `machine_type` enum('Wet End','Finishing') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` enum('Active','Inactive','Maintenance') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_machine_code` (`code`),
  KEY `idx_mac_deleted` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `machines`
--

LOCK TABLES `machines` WRITE;
/*!40000 ALTER TABLE `machines` DISABLE KEYS */;
INSERT INTO `machines` VALUES (1,'MACHINE-01','Inspection Table',NULL,0.00,0.00,NULL,NULL,'Active','2026-07-05 14:29:55','2026-07-29 08:44:27',NULL,NULL,NULL),(2,'MACHINE-02','Buffing Machine',NULL,0.00,0.00,NULL,NULL,'Active','2026-07-05 14:29:55','2026-07-29 08:44:27',NULL,NULL,NULL),(3,'MACHINE-03','Spray Booth A',NULL,0.00,0.00,NULL,NULL,'Active','2026-07-05 14:29:55','2026-07-29 08:44:27',NULL,NULL,NULL),(4,'MACHINE-04','Spray Booth B',NULL,0.00,0.00,NULL,NULL,'Active','2026-07-05 14:29:55','2026-07-29 08:44:27',NULL,NULL,NULL),(5,'MACHINE-05','Tunnel Dryer',NULL,0.00,0.00,NULL,NULL,'Active','2026-07-05 14:29:55','2026-07-29 08:44:27',NULL,NULL,NULL),(6,'MACHINE-06','Ironing Machine',NULL,0.00,0.00,NULL,NULL,'Active','2026-07-05 14:29:55','2026-07-29 08:44:27',NULL,NULL,NULL),(7,'MACHINE-07','Rotary Dryer',NULL,0.00,0.00,NULL,NULL,'Active','2026-07-05 14:29:55','2026-07-29 08:44:27',NULL,NULL,NULL),(8,'MACHINE-08','QC Table','Per Pcs',20.00,0.00,'Wet End','new','Active','2026-07-05 14:29:55','2026-07-29 12:47:13',NULL,1,NULL),(9,'MACHINE-09','Packing Station','Per Hour',20.00,0.00,'Wet End','test','Active','2026-07-05 14:29:55','2026-07-29 08:57:08',NULL,1,NULL);
/*!40000 ALTER TABLE `machines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `material_attachments`
--

DROP TABLE IF EXISTS `material_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `material_attachments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `material_id` int NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size` int DEFAULT '0',
  `uploaded_by` int DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_mattach_material` (`material_id`),
  CONSTRAINT `fk_mattach_material` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_attachments`
--

LOCK TABLES `material_attachments` WRITE;
/*!40000 ALTER TABLE `material_attachments` DISABLE KEYS */;
/*!40000 ALTER TABLE `material_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `material_issue_items`
--

DROP TABLE IF EXISTS `material_issue_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `material_issue_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `issue_id` int NOT NULL,
  `material_id` int NOT NULL,
  `uom` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `required_qty` decimal(14,3) DEFAULT '0.000',
  `issue_qty` decimal(14,3) NOT NULL DEFAULT '0.000',
  `unit_cost` decimal(14,4) DEFAULT '0.0000',
  `amount` decimal(16,2) DEFAULT '0.00',
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_miitem_issue` (`issue_id`),
  KEY `idx_miitem_material` (`material_id`),
  CONSTRAINT `fk_miitem_issue` FOREIGN KEY (`issue_id`) REFERENCES `material_issues` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_miitem_material` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_issue_items`
--

LOCK TABLES `material_issue_items` WRITE;
/*!40000 ALTER TABLE `material_issue_items` DISABLE KEYS */;
INSERT INTO `material_issue_items` VALUES (2,1,1,'test',3.000,1.000,3.5000,3.50,'test','2026-07-10 12:58:15');
/*!40000 ALTER TABLE `material_issue_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `material_issues`
--

DROP TABLE IF EXISTS `material_issues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `material_issues` (
  `id` int NOT NULL AUTO_INCREMENT,
  `issue_no` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `issue_date` date NOT NULL,
  `department` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `job_order_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `production_batch` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `batch_qty` decimal(14,3) DEFAULT '0.000',
  `batch_uom` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `batch_description` text COLLATE utf8mb4_unicode_ci,
  `costing_method` enum('FIFO','LIFO','Weighted Average','Standard Cost') COLLATE utf8mb4_unicode_ci DEFAULT 'FIFO',
  `warehouse_id` int NOT NULL,
  `required_date` date DEFAULT NULL,
  `issued_by` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `loading_unloading` decimal(12,2) DEFAULT '0.00',
  `other_charges` decimal(12,2) DEFAULT '0.00',
  `total_material_cost` decimal(16,2) DEFAULT '0.00',
  `grand_total` decimal(16,2) DEFAULT '0.00',
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `status` enum('Draft','Posted','Cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `issue_no` (`issue_no`),
  KEY `idx_mi_warehouse` (`warehouse_id`),
  KEY `idx_mi_status` (`status`),
  CONSTRAINT `fk_mi_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_issues`
--

LOCK TABLES `material_issues` WRITE;
/*!40000 ALTER TABLE `material_issues` DISABLE KEYS */;
INSERT INTO `material_issues` VALUES (1,'ISS-2026-00001','2026-07-09','Dyeing','JO-2024-0185','CUT-2024-0501',2.000,'5','test','FIFO',2,'2026-07-10','Store Keeper',0.00,0.00,3.50,3.50,NULL,'Posted',NULL,NULL,'2026-07-10 12:58:00','2026-07-10 12:58:15');
/*!40000 ALTER TABLE `material_issues` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `material_receipt_items`
--

DROP TABLE IF EXISTS `material_receipt_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `material_receipt_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `receipt_id` int NOT NULL,
  `material_id` int NOT NULL,
  `uom` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order_qty` decimal(14,3) DEFAULT '0.000',
  `received_qty` decimal(14,3) NOT NULL DEFAULT '0.000',
  `rate` decimal(14,4) NOT NULL DEFAULT '0.0000',
  `amount` decimal(16,2) NOT NULL DEFAULT '0.00',
  `batch_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_mritem_receipt` (`receipt_id`),
  KEY `idx_mritem_material` (`material_id`),
  CONSTRAINT `fk_mritem_material` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`),
  CONSTRAINT `fk_mritem_receipt` FOREIGN KEY (`receipt_id`) REFERENCES `material_receipts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_receipt_items`
--

LOCK TABLES `material_receipt_items` WRITE;
/*!40000 ALTER TABLE `material_receipt_items` DISABLE KEYS */;
INSERT INTO `material_receipt_items` VALUES (1,1,1,'test',2.000,2.000,3.0000,6.00,'6','2026-07-11','2026-07-10 09:56:02');
/*!40000 ALTER TABLE `material_receipt_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `material_receipts`
--

DROP TABLE IF EXISTS `material_receipts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `material_receipts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `receipt_no` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `receipt_date` date NOT NULL,
  `receipt_type` enum('Purchase Order','Direct Purchase','Transfer','Sample','Return') COLLATE utf8mb4_unicode_ci DEFAULT 'Direct Purchase',
  `supplier_id` int DEFAULT NULL,
  `purchase_order_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `po_date` date DEFAULT NULL,
  `challan_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `challan_date` date DEFAULT NULL,
  `lr_grn_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lr_grn_date` date DEFAULT NULL,
  `transporter` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gate_entry_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `warehouse_id` int NOT NULL,
  `freight` decimal(12,2) DEFAULT '0.00',
  `loading_charges` decimal(12,2) DEFAULT '0.00',
  `other_charges` decimal(12,2) DEFAULT '0.00',
  `total_amount` decimal(16,2) DEFAULT '0.00',
  `grand_total` decimal(16,2) DEFAULT '0.00',
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `status` enum('Draft','Posted','Cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `receipt_no` (`receipt_no`),
  KEY `idx_mr_supplier` (`supplier_id`),
  KEY `idx_mr_warehouse` (`warehouse_id`),
  KEY `idx_mr_status` (`status`),
  CONSTRAINT `fk_mr_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_mr_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_receipts`
--

LOCK TABLES `material_receipts` WRITE;
/*!40000 ALTER TABLE `material_receipts` DISABLE KEYS */;
INSERT INTO `material_receipts` VALUES (1,'GRN-2026-00001','2026-07-10','Direct Purchase',1,'test','2026-07-10','test','2026-07-10','test','2026-07-10','test','test',1,2.00,2.00,2.00,6.00,12.00,'test','Posted',NULL,NULL,'2026-07-10 09:56:02','2026-07-10 09:56:02');
/*!40000 ALTER TABLE `material_receipts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `materials`
--

DROP TABLE IF EXISTS `materials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `materials` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `uom` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'Kg',
  `type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Chemical',
  `group_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `uom_id` int DEFAULT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'Active',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `chemical_group` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `appearance` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ph_value` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `flash_point` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hsn_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cas_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shelf_life` int DEFAULT NULL,
  `storage_condition` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hazardous` tinyint(1) DEFAULT '0',
  `default_warehouse` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `opening_stock` decimal(12,2) DEFAULT '0.00',
  `opening_stock_uom` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `current_stock` decimal(12,2) DEFAULT '0.00',
  `reorder_level` decimal(12,2) DEFAULT '0.00',
  `maximum_level` decimal(12,2) DEFAULT '0.00',
  `standard_cost` decimal(12,2) DEFAULT '0.00',
  `last_purchase_price` decimal(12,2) DEFAULT '0.00',
  `preferred_supplier_id` int DEFAULT NULL,
  `lead_time` int DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `application` text COLLATE utf8mb4_unicode_ci,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `attachment_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_mat_deleted` (`deleted_at`),
  KEY `fk_materials_group` (`group_id`),
  CONSTRAINT `fk_materials_group` FOREIGN KEY (`group_id`) REFERENCES `group_master` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `materials`
--

LOCK TABLES `materials` WRITE;
/*!40000 ALTER TABLE `materials` DISABLE KEYS */;
INSERT INTO `materials` VALUES (1,'test','test','test','Auxiliary',NULL,'2026-07-07 20:03:03','2026-07-07 20:03:03',NULL,'Active',3,NULL,NULL,'test','Dyes','test','test','test','test','test','test',NULL,'Room Temperature',0,'Main Warehouse',2.00,'4',2.00,2.00,2.00,3.00,4.00,1,3,'test','test','test',NULL),(2,'CHEM-001','Chrome Powder','KG','Chemicals',NULL,'2026-07-22 13:09:56','2026-07-22 13:09:56',NULL,'Active',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0.00,NULL,0.00,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL),(3,'CHEM-002','Syntan DS','KG','Chemicals',NULL,'2026-07-22 13:09:56','2026-07-22 13:09:56',NULL,'Active',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0.00,NULL,0.00,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL),(4,'CHEM-003','Formic Acid 85%','LTR','Chemicals',NULL,'2026-07-22 13:09:56','2026-07-22 13:09:56',NULL,'Active',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0.00,NULL,0.00,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL),(5,'CHEM-004','Fatliquor FL-100','KG','Chemicals',NULL,'2026-07-22 13:09:56','2026-07-22 13:09:56',NULL,'Active',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0.00,NULL,0.00,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL),(6,'DYE-001','Leather Dye Black','LTR','Dyes',NULL,'2026-07-22 13:09:56','2026-07-22 13:09:56',NULL,'Active',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0.00,NULL,0.00,0.00,0.00,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `materials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_receipts`
--

DROP TABLE IF EXISTS `payment_receipts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_receipts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `receipt_no` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sales_order_id` int NOT NULL,
  `receipt_date` date NOT NULL,
  `payment_mode` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Bank Transfer',
  `amount` decimal(14,2) DEFAULT '0.00',
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `receipt_no` (`receipt_no`),
  KEY `idx_pr_order` (`sales_order_id`),
  CONSTRAINT `fk_pr_order` FOREIGN KEY (`sales_order_id`) REFERENCES `sales_orders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_receipts`
--

LOCK TABLES `payment_receipts` WRITE;
/*!40000 ALTER TABLE `payment_receipts` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_receipts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `physical_stock_entries`
--

DROP TABLE IF EXISTS `physical_stock_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `physical_stock_entries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `entry_no` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entry_date` date NOT NULL,
  `stock_date` date NOT NULL,
  `warehouse_id` int DEFAULT NULL,
  `location_rack` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `godown` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `batch_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `from_item_code` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `to_item_code` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `item_group` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `item_id` int DEFAULT NULL,
  `uom` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'KG',
  `reference_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_items` int DEFAULT '0',
  `matched_items` int DEFAULT '0',
  `variance_items` int DEFAULT '0',
  `total_variance_qty` decimal(12,3) DEFAULT '0.000',
  `total_variance_value` decimal(14,2) DEFAULT '0.00',
  `status` enum('Draft','In-Progress','Completed','Cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `entry_no` (`entry_no`),
  KEY `idx_pse_entry_no` (`entry_no`),
  KEY `idx_pse_date` (`entry_date`),
  KEY `idx_pse_warehouse` (`warehouse_id`),
  KEY `idx_pse_status` (`status`),
  KEY `idx_pse_deleted` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `physical_stock_entries`
--

LOCK TABLES `physical_stock_entries` WRITE;
/*!40000 ALTER TABLE `physical_stock_entries` DISABLE KEYS */;
INSERT INTO `physical_stock_entries` VALUES (1,'PSE-2024-00045','2024-05-20','2024-05-20',NULL,'All','Main Store',NULL,NULL,NULL,'All',NULL,'All','Ref / Document No.',6,2,4,-7.000,-1320.00,'Completed','Enter remarks (optional)...',1,NULL,NULL,'2026-07-20 18:39:59','2026-07-20 18:39:59');
/*!40000 ALTER TABLE `physical_stock_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `physical_stock_entry_items`
--

DROP TABLE IF EXISTS `physical_stock_entry_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `physical_stock_entry_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `entry_id` int NOT NULL,
  `seq` int DEFAULT '1',
  `item_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `item_description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uom` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'KG',
  `batch_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location_rack` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `system_qty` decimal(12,3) DEFAULT '0.000',
  `physical_qty` decimal(12,3) DEFAULT '0.000',
  `variance_qty` decimal(12,3) DEFAULT '0.000',
  `variance_value` decimal(14,2) DEFAULT '0.00',
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_psei_entry` (`entry_id`),
  KEY `idx_psei_item_code` (`item_code`),
  KEY `idx_psei_batch` (`batch_no`),
  KEY `idx_psei_seq` (`entry_id`,`seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `physical_stock_entry_items`
--

LOCK TABLES `physical_stock_entry_items` WRITE;
/*!40000 ALTER TABLE `physical_stock_entry_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `physical_stock_entry_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `price_approval_items`
--

DROP TABLE IF EXISTS `price_approval_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `price_approval_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `request_id` int NOT NULL,
  `seq` int DEFAULT '1',
  `supplier_id` int NOT NULL,
  `material_id` int NOT NULL,
  `supplier_part_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `item_group` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uom` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'KG',
  `current_price` decimal(12,2) DEFAULT '0.00',
  `requested_price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'INR',
  `change_amount` decimal(12,2) DEFAULT '0.00',
  `change_percent` decimal(5,2) DEFAULT '0.00',
  `effective_from` date DEFAULT NULL,
  `effective_to` date DEFAULT NULL,
  `last_approved_price` decimal(12,2) DEFAULT '0.00',
  `last_approved_date` date DEFAULT NULL,
  `status` enum('Pending','Approved','Rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'Pending',
  `approval_notes` text COLLATE utf8mb4_unicode_ci,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pai_request` (`request_id`),
  KEY `idx_pai_supplier` (`supplier_id`),
  KEY `idx_pai_material` (`material_id`),
  KEY `idx_pai_status` (`status`),
  KEY `idx_pai_seq` (`request_id`,`seq`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `price_approval_items`
--

LOCK TABLES `price_approval_items` WRITE;
/*!40000 ALTER TABLE `price_approval_items` DISABLE KEYS */;
INSERT INTO `price_approval_items` VALUES (1,1,1,1,1,'CP-1001','Chemicals','KG',210.00,205.00,'INR',-5.00,-2.38,'2024-05-16',NULL,210.00,'2024-05-01','Pending','Monthly revision','Price effective from 16 May 2024','2026-07-20 18:39:59','2026-07-20 18:39:59');
/*!40000 ALTER TABLE `price_approval_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `price_approval_requests`
--

DROP TABLE IF EXISTS `price_approval_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `price_approval_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `request_no` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `request_date` date NOT NULL,
  `requested_by` int NOT NULL,
  `department` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Purchase',
  `total_items` int DEFAULT '0',
  `status` enum('Draft','Pending','Under Review','Approved','Rejected','Partially Approved') COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
  `approval_notes` text COLLATE utf8mb4_unicode_ci,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `request_no` (`request_no`),
  KEY `idx_par_request_no` (`request_no`),
  KEY `idx_par_status` (`status`),
  KEY `idx_par_date` (`request_date`),
  KEY `idx_par_requested_by` (`requested_by`),
  KEY `idx_par_deleted` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `price_approval_requests`
--

LOCK TABLES `price_approval_requests` WRITE;
/*!40000 ALTER TABLE `price_approval_requests` DISABLE KEYS */;
INSERT INTO `price_approval_requests` VALUES (1,'PRQ-2024-0012','2024-05-16',1,'Purchase',1,'Pending','Supplier has given revised price list for May 2024. Approval requested.','Price revision',1,NULL,NULL,'2026-07-20 18:39:59','2026-07-20 18:39:59');
/*!40000 ALTER TABLE `price_approval_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `price_approval_workflow`
--

DROP TABLE IF EXISTS `price_approval_workflow`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `price_approval_workflow` (
  `id` int NOT NULL AUTO_INCREMENT,
  `request_id` int NOT NULL,
  `item_id` int DEFAULT NULL,
  `action_type` enum('Submitted','Approved','Rejected','Revised','Cancelled') COLLATE utf8mb4_unicode_ci NOT NULL,
  `action_by` int NOT NULL,
  `action_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `from_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `to_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_paw_request` (`request_id`),
  KEY `idx_paw_item` (`item_id`),
  KEY `idx_paw_action_date` (`action_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `price_approval_workflow`
--

LOCK TABLES `price_approval_workflow` WRITE;
/*!40000 ALTER TABLE `price_approval_workflow` DISABLE KEYS */;
/*!40000 ALTER TABLE `price_approval_workflow` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `price_breaks`
--

DROP TABLE IF EXISTS `price_breaks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `price_breaks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pricing_id` int NOT NULL,
  `seq` int DEFAULT '1',
  `from_qty` decimal(12,2) DEFAULT '0.00',
  `to_qty` decimal(12,2) DEFAULT '0.00',
  `uom` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'KG',
  `unit_price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `discount_percent` decimal(5,2) DEFAULT '0.00',
  `discount_amount` decimal(12,2) DEFAULT '0.00',
  `net_price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pb_pricing` (`pricing_id`),
  KEY `idx_pb_seq` (`pricing_id`,`seq`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `price_breaks`
--

LOCK TABLES `price_breaks` WRITE;
/*!40000 ALTER TABLE `price_breaks` DISABLE KEYS */;
INSERT INTO `price_breaks` VALUES (1,7,1,100.00,499.99,'KG',205.00,0.00,0.00,205.00,'2026-07-22 12:37:39','2026-07-22 12:37:39'),(2,7,1,500.00,999.99,'KG',198.00,3.41,6.75,191.25,'2026-07-22 12:37:40','2026-07-22 12:37:40'),(3,7,1,1.00,0.00,'KG',190.00,7.32,13.91,176.09,'2026-07-22 12:37:40','2026-07-22 12:37:40'),(4,19,1,2.00,0.00,'KG',2.00,3.00,0.06,1.94,'2026-07-22 14:13:50','2026-07-22 14:13:50');
/*!40000 ALTER TABLE `price_breaks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `price_change_history`
--

DROP TABLE IF EXISTS `price_change_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `price_change_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pricing_id` int DEFAULT NULL,
  `material_id` int NOT NULL,
  `supplier_id` int NOT NULL,
  `old_price` decimal(12,2) DEFAULT '0.00',
  `new_price` decimal(12,2) DEFAULT '0.00',
  `change_percent` decimal(5,2) DEFAULT '0.00',
  `change_type` enum('Increase','Decrease','No Change') COLLATE utf8mb4_unicode_ci DEFAULT 'No Change',
  `change_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `effective_from` date DEFAULT NULL,
  `effective_to` date DEFAULT NULL,
  `changed_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pch_pricing` (`pricing_id`),
  KEY `idx_pch_material` (`material_id`),
  KEY `idx_pch_supplier` (`supplier_id`),
  KEY `idx_pch_effective` (`effective_from`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `price_change_history`
--

LOCK TABLES `price_change_history` WRITE;
/*!40000 ALTER TABLE `price_change_history` DISABLE KEYS */;
INSERT INTO `price_change_history` VALUES (1,8,2,2,0.00,220.00,0.00,'No Change','Price revision','2024-01-04',NULL,1,'2026-07-22 13:43:37'),(2,9,2,2,220.00,210.00,-4.55,'Decrease','Monthly revision','2024-05-01',NULL,1,'2026-07-22 13:43:37'),(3,10,2,2,210.00,205.00,-2.38,'Decrease','Current Price','2024-05-16',NULL,1,'2026-07-22 13:43:37');
/*!40000 ALTER TABLE `price_change_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `process_stage_parameters`
--

DROP TABLE IF EXISTS `process_stage_parameters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `process_stage_parameters` (
  `id` int NOT NULL AUTO_INCREMENT,
  `process_stage_id` int NOT NULL,
  `parameter_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `default_value` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `min_value` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `max_value` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `required` tinyint(1) DEFAULT '0',
  `seq` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_psp_stage` (`process_stage_id`),
  CONSTRAINT `fk_psp_stage` FOREIGN KEY (`process_stage_id`) REFERENCES `process_stages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `process_stage_parameters`
--

LOCK TABLES `process_stage_parameters` WRITE;
/*!40000 ALTER TABLE `process_stage_parameters` DISABLE KEYS */;
INSERT INTO `process_stage_parameters` VALUES (1,3,'Spray Pressure','bar','3.5','2.0','5.0',1,1,'2026-07-05 14:29:55','2026-07-05 14:29:55'),(2,3,'Nozzle Size','mm','1.5','1.0','2.5',1,2,'2026-07-05 14:29:55','2026-07-05 14:29:55'),(3,3,'Viscosity','sec','20','15','30',1,3,'2026-07-05 14:29:55','2026-07-05 14:29:55'),(4,4,'Temperature','┬░C','65','50','80',1,1,'2026-07-05 14:29:55','2026-07-05 14:29:55'),(5,4,'Airflow Speed','m/s','2.0','1.0','5.0',1,2,'2026-07-05 14:29:55','2026-07-05 14:29:55'),(6,4,'Duration','min','20','10','40',1,3,'2026-07-05 14:29:55','2026-07-05 14:29:55'),(7,5,'Temperature','┬░C','95','80','120',1,1,'2026-07-05 14:29:55','2026-07-05 14:29:55'),(8,5,'Pressure','bar','4.0','2.0','6.0',1,2,'2026-07-05 14:29:55','2026-07-05 14:29:55'),(9,5,'Roller Speed','m/min','5','3','10',1,3,'2026-07-05 14:29:55','2026-07-05 14:29:55'),(10,6,'Spray Pressure','bar','3.0','2.0','4.5',1,1,'2026-07-05 14:29:55','2026-07-05 14:29:55'),(11,6,'Passes','count','2','1','4',1,2,'2026-07-05 14:29:55','2026-07-05 14:29:55');
/*!40000 ALTER TABLE `process_stage_parameters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `process_stages`
--

DROP TABLE IF EXISTS `process_stages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `process_stages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `seq` int DEFAULT '0',
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_processstage_code` (`code`),
  KEY `idx_ps_deleted` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `process_stages`
--

LOCK TABLES `process_stages` WRITE;
/*!40000 ALTER TABLE `process_stages` DISABLE KEYS */;
INSERT INTO `process_stages` VALUES (1,'INS-01','Leather Inspection','Inspect incoming leather for defects',10,'Active','2026-07-05 14:29:55','2026-07-05 14:29:55',NULL,NULL,NULL),(2,'BUFF-01','Buffing','Buff leather surface for smoothness',20,'Active','2026-07-05 14:29:55','2026-07-05 14:29:55',NULL,NULL,NULL),(3,'SPRAY-01','Spray Base Coat','Apply base coat spraying',30,'Active','2026-07-05 14:29:55','2026-07-05 14:29:55',NULL,NULL,NULL),(4,'DRY-01','Drying','Dry leather in tunnel dryer',40,'Active','2026-07-05 14:29:55','2026-07-11 12:02:57',NULL,NULL,NULL),(5,'IRON-01','Ironing','Apply heat and pressure',50,'Active','2026-07-05 14:29:55','2026-07-05 14:29:55',NULL,NULL,NULL),(6,'SPRAY-02','Top Coat','Apply top finish coating',60,'Active','2026-07-05 14:29:55','2026-07-05 14:29:55',NULL,NULL,NULL),(7,'DRY-02','Final Drying','Final drying process.',70,'Active','2026-07-05 14:29:55','2026-07-21 07:00:03',NULL,1,NULL),(8,'INS-02','Final Inspection','QC check for finished leather',80,'Active','2026-07-05 14:29:55','2026-07-05 14:29:55',NULL,NULL,NULL),(9,'PACK-01','Packing','Pack and label finished leather.',90,'Active','2026-07-05 14:29:55','2026-07-11 11:23:11',NULL,NULL,NULL),(10,'PS-00002','Leather Inspection (Copy)','Inspect incoming leather for defects',10,'Inactive','2026-07-11 11:23:42','2026-07-11 11:23:53',NULL,NULL,'2026-07-11 11:23:53');
/*!40000 ALTER TABLE `process_stages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_categories`
--

DROP TABLE IF EXISTS `product_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_prodcat_code` (`code`),
  KEY `idx_pc_deleted` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_categories`
--

LOCK TABLES `product_categories` WRITE;
/*!40000 ALTER TABLE `product_categories` DISABLE KEYS */;
INSERT INTO `product_categories` VALUES (1,'FIN-LEATHER','Finished Leather','Fully finished leather ready for footwear and upholstery','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(2,'SEMI-FINISH','Semi Finished','Partially processed leather','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(3,'CRUST','Crust Leather','Unfinished tanned leather','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(4,'WET-BLUE','Wet Blue','Chrome tanned leather in wet condition','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(5,'SPLITS','Splits','Split layer leather','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(11,'test-product-cat','test-product-cat','test-product-cat','Active','2026-07-05 14:30:08','2026-07-05 14:30:08',NULL,NULL,NULL);
/*!40000 ALTER TABLE `product_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `production_batches`
--

DROP TABLE IF EXISTS `production_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `production_batches` (
  `id` int NOT NULL AUTO_INCREMENT,
  `plan_id` int NOT NULL,
  `batch_no` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `batch_qty` decimal(12,2) DEFAULT '0.00',
  `status` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT 'Pending',
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_pb_plan` (`plan_id`),
  CONSTRAINT `fk_pb_plan` FOREIGN KEY (`plan_id`) REFERENCES `production_plans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `production_batches`
--

LOCK TABLES `production_batches` WRITE;
/*!40000 ALTER TABLE `production_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `production_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `production_plan_items`
--

DROP TABLE IF EXISTS `production_plan_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `production_plan_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `plan_id` int NOT NULL,
  `material_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `uom` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `required_qty` decimal(12,2) DEFAULT '0.00',
  `issued_qty` decimal(12,2) DEFAULT '0.00',
  `balance_qty` decimal(12,2) DEFAULT '0.00',
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ppi_plan` (`plan_id`),
  CONSTRAINT `fk_ppi_plan` FOREIGN KEY (`plan_id`) REFERENCES `production_plans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `production_plan_items`
--

LOCK TABLES `production_plan_items` WRITE;
/*!40000 ALTER TABLE `production_plan_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `production_plan_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `production_plan_stages`
--

DROP TABLE IF EXISTS `production_plan_stages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `production_plan_stages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `plan_id` int NOT NULL,
  `seq` int NOT NULL DEFAULT '1',
  `stage_id` int DEFAULT NULL,
  `stage_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `capacity` decimal(12,2) DEFAULT '0.00',
  `planned_qty` decimal(12,2) DEFAULT '0.00',
  `planned_percent` decimal(6,2) DEFAULT '100.00',
  `receipt_qty` decimal(12,2) DEFAULT '0.00',
  `rejection_qty` decimal(12,2) DEFAULT '0.00',
  `output_qty` decimal(12,2) DEFAULT '0.00',
  `output_percent` decimal(6,2) DEFAULT '0.00',
  `wip_qty` decimal(12,2) DEFAULT '0.00',
  `status` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT 'In-Process',
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pps_plan` (`plan_id`),
  CONSTRAINT `fk_pps_plan` FOREIGN KEY (`plan_id`) REFERENCES `production_plans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `production_plan_stages`
--

LOCK TABLES `production_plan_stages` WRITE;
/*!40000 ALTER TABLE `production_plan_stages` DISABLE KEYS */;
INSERT INTO `production_plan_stages` VALUES (19,3,1,9,'Packing',0.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'In-Process',NULL,'2026-07-24 14:19:40','2026-07-24 14:19:40'),(20,3,2,8,'Final Inspection',0.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'In-Process',NULL,'2026-07-24 14:19:40','2026-07-24 14:19:40'),(21,3,3,7,'Final Drying',0.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'In-Process',NULL,'2026-07-24 14:19:40','2026-07-24 14:19:40'),(22,3,4,6,'Top Coat',0.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'In-Process',NULL,'2026-07-24 14:19:40','2026-07-24 14:19:40'),(23,3,5,5,'Ironing',0.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'In-Process',NULL,'2026-07-24 14:19:40','2026-07-24 14:19:40'),(24,3,6,4,'Drying',0.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'In-Process',NULL,'2026-07-24 14:19:40','2026-07-24 14:19:40'),(25,3,7,3,'Spray Base Coat',0.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'In-Process',NULL,'2026-07-24 14:19:40','2026-07-24 14:19:40'),(26,3,8,2,'Buffing',0.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'In-Process',NULL,'2026-07-24 14:19:40','2026-07-24 14:19:40'),(27,3,9,1,'Leather Inspection',0.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'In-Process',NULL,'2026-07-24 14:19:40','2026-07-24 14:19:40'),(28,4,1,9,'Packing',2.00,2.00,100.00,2.00,2.00,0.00,0.00,2.00,'In-Process',NULL,'2026-07-24 14:20:03','2026-07-24 14:20:03'),(29,4,2,8,'Final Inspection',0.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'In-Process',NULL,'2026-07-24 14:20:03','2026-07-24 14:20:03'),(30,4,3,7,'Final Drying',0.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'In-Process',NULL,'2026-07-24 14:20:03','2026-07-24 14:20:03'),(31,4,4,6,'Top Coat',0.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'In-Process',NULL,'2026-07-24 14:20:03','2026-07-24 14:20:03'),(32,4,5,5,'Ironing',0.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'In-Process',NULL,'2026-07-24 14:20:03','2026-07-24 14:20:03'),(33,4,6,4,'Drying',0.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'In-Process',NULL,'2026-07-24 14:20:03','2026-07-24 14:20:03'),(34,4,7,3,'Spray Base Coat',0.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'In-Process',NULL,'2026-07-24 14:20:03','2026-07-24 14:20:03'),(35,4,8,2,'Buffing',0.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'In-Process',NULL,'2026-07-24 14:20:03','2026-07-24 14:20:03'),(36,4,9,1,'Leather Inspection',0.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'In-Process',NULL,'2026-07-24 14:20:03','2026-07-24 14:20:03');
/*!40000 ALTER TABLE `production_plan_stages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `production_plans`
--

DROP TABLE IF EXISTS `production_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `production_plans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `plan_no` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `plan_date` date NOT NULL,
  `sales_order_id` int DEFAULT NULL,
  `customer_order_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `article` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `finish` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `warehouse_id` int DEFAULT NULL,
  `uom` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'Sq.Ft.',
  `order_qty` decimal(12,2) DEFAULT '0.00',
  `planned_qty` decimal(12,2) DEFAULT '0.00',
  `batch_qty` decimal(12,2) DEFAULT '0.00',
  `no_of_batches` int DEFAULT '0',
  `balance_qty` decimal(12,2) DEFAULT '0.00',
  `output_qty` decimal(12,2) DEFAULT '0.00',
  `output_percent` decimal(6,2) DEFAULT '0.00',
  `wip_qty` decimal(12,2) DEFAULT '0.00',
  `planned_start_date` date DEFAULT NULL,
  `planned_end_date` date DEFAULT NULL,
  `priority` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'Medium',
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `plan_no` (`plan_no`),
  KEY `idx_pp_status` (`status`),
  KEY `idx_pp_deleted` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `production_plans`
--

LOCK TABLES `production_plans` WRITE;
/*!40000 ALTER TABLE `production_plans` DISABLE KEYS */;
INSERT INTO `production_plans` VALUES (3,'PLAN-2026-00001','2026-07-16',1,NULL,1,NULL,'test','test','test',NULL,'Sq.Ft.',2.00,0.00,0.00,0,2.00,0.00,0.00,0.00,NULL,NULL,'Medium',NULL,'Draft',1,1,'2026-07-17 09:26:04','2026-07-24 14:19:40',NULL),(4,'PLAN-2026-00002','2026-07-16',1,NULL,1,NULL,'test','test','test',NULL,'Sq.Ft.',3.00,0.00,0.00,0,3.00,0.00,0.00,0.00,NULL,NULL,'Medium',NULL,'Draft',1,1,'2026-07-17 09:26:22','2026-07-24 14:20:03',NULL);
/*!40000 ALTER TABLE `production_plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `leather_type` enum('cow','buffalo','goat','sheep') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'cow',
  `uom` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'Sq. Ft.',
  `thickness` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `finish_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `standard_size` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `grade` enum('a','b','c') COLLATE utf8mb4_unicode_ci DEFAULT 'a',
  `sales_price` decimal(10,2) DEFAULT '0.00',
  `hsn_code` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `category_id` int DEFAULT NULL,
  `group_id` int DEFAULT NULL,
  `leather_type_id` int DEFAULT NULL,
  `uom_id` int DEFAULT NULL,
  `thickness_id` int DEFAULT NULL,
  `color_id` int DEFAULT NULL,
  `finish_type_id` int DEFAULT NULL,
  `grade_id` int DEFAULT NULL,
  `hsn_code_id` int DEFAULT NULL,
  `standard_size_id` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `fk_product_category` (`category_id`),
  KEY `fk_product_leathertype` (`leather_type_id`),
  KEY `fk_product_uom` (`uom_id`),
  KEY `fk_product_thickness` (`thickness_id`),
  KEY `fk_product_color` (`color_id`),
  KEY `fk_product_finish` (`finish_type_id`),
  KEY `fk_product_grade` (`grade_id`),
  KEY `fk_product_hsn` (`hsn_code_id`),
  KEY `fk_product_stdsize` (`standard_size_id`),
  KEY `idx_prod_deleted` (`deleted_at`),
  KEY `fk_products_group` (`group_id`),
  CONSTRAINT `fk_product_category` FOREIGN KEY (`category_id`) REFERENCES `product_categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_product_color` FOREIGN KEY (`color_id`) REFERENCES `colors` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_product_finish` FOREIGN KEY (`finish_type_id`) REFERENCES `finish_types` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_product_grade` FOREIGN KEY (`grade_id`) REFERENCES `grades` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_product_hsn` FOREIGN KEY (`hsn_code_id`) REFERENCES `hsn_codes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_product_leathertype` FOREIGN KEY (`leather_type_id`) REFERENCES `leather_types` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_product_stdsize` FOREIGN KEY (`standard_size_id`) REFERENCES `standard_sizes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_product_thickness` FOREIGN KEY (`thickness_id`) REFERENCES `thickness` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_product_uom` FOREIGN KEY (`uom_id`) REFERENCES `uom` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_products_group` FOREIGN KEY (`group_id`) REFERENCES `group_master` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'testing','test','Crust Leather','cow','Kilogram','Medium (1.0-1.2 mm)','Green','Patent','test','Synthetic Tanning Agents','a',1.00,'test','Active','2026-07-01 16:37:05','2026-07-07 09:23:59',3,NULL,5,3,2,10,7,1,NULL,5,NULL,NULL,NULL),(3,'PRD-00NaN','demo','General','cow',NULL,NULL,NULL,NULL,'demo',NULL,'a',0.00,NULL,'Active','2026-07-28 06:04:20','2026-07-28 06:04:20',3,NULL,3,NULL,5,3,2,1,5,4,1,NULL,NULL);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rate_master`
--

DROP TABLE IF EXISTS `rate_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rate_master` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rate_type` enum('Machine','Labour','Chemical','Overhead','Process','Other') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Machine',
  `component_ref_id` int DEFAULT NULL COMMENT 'Reference to machine/material/process id',
  `uom` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Per Hour, Per Pcs, Per Kg, Per Ltr, etc.',
  `rate_indian` decimal(10,2) NOT NULL DEFAULT '0.00',
  `rate_imported` decimal(10,2) NOT NULL DEFAULT '0.00',
  `effective_from` date DEFAULT NULL,
  `effective_to` date DEFAULT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rate_master`
--

LOCK TABLES `rate_master` WRITE;
/*!40000 ALTER TABLE `rate_master` DISABLE KEYS */;
INSERT INTO `rate_master` VALUES (1,'RATE-00001','Spray Machine Rate','Machine',NULL,'Per Hour',150.00,250.00,NULL,NULL,'Spray machine operating rate','Active',0,NULL,NULL,NULL,'2026-07-29 06:59:06','2026-07-29 06:59:06'),(2,'RATE-00002','Dryer Machine Rate','Machine',NULL,'Per Hour',120.00,200.00,NULL,NULL,'Dryer machine operating rate','Active',0,NULL,NULL,NULL,'2026-07-29 06:59:06','2026-07-29 06:59:06'),(3,'RATE-00003','Skilled Labour Rate','Labour',NULL,'Per Hour',80.00,80.00,NULL,NULL,'Skilled labour hourly rate','Active',0,NULL,NULL,NULL,'2026-07-29 06:59:06','2026-07-29 06:59:06'),(4,'RATE-00004','Chrome Tanning Process','Process',NULL,'Per Pcs',25.00,40.00,NULL,NULL,'Chrome tanning process rate','Active',0,NULL,NULL,NULL,'2026-07-29 06:59:06','2026-07-29 06:59:06'),(5,'test','test','Labour',NULL,'test',22.00,45.00,'2026-07-29','2026-07-30','test','Active',0,NULL,1,1,'2026-07-29 07:01:42','2026-07-29 07:04:59');
/*!40000 ALTER TABLE `rate_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recipe_attachments`
--

DROP TABLE IF EXISTS `recipe_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipe_attachments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `recipe_id` int NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size` int DEFAULT NULL,
  `uploaded_by` int DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_attach_recipe` (`recipe_id`),
  CONSTRAINT `fk_attach_recipe` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipe_attachments`
--

LOCK TABLES `recipe_attachments` WRITE;
/*!40000 ALTER TABLE `recipe_attachments` DISABLE KEYS */;
INSERT INTO `recipe_attachments` VALUES (1,1,'company-logo.png','uploads/recipes/1783422375962-819746762.png','image/png',631627,NULL,'2026-07-07 11:06:16'),(2,1,'qrcode-EMP-1001.jpeg','uploads/recipes/1783439363804-33589735.jpeg','image/jpeg',21001,3,'2026-07-07 15:49:23');
/*!40000 ALTER TABLE `recipe_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recipe_items`
--

DROP TABLE IF EXISTS `recipe_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipe_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `recipe_id` int NOT NULL,
  `material_id` int NOT NULL,
  `qty` decimal(12,3) NOT NULL DEFAULT '0.000',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_ri_material` (`material_id`),
  KEY `idx_ri_recipe` (`recipe_id`),
  CONSTRAINT `fk_ri_material` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_ri_recipe` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipe_items`
--

LOCK TABLES `recipe_items` WRITE;
/*!40000 ALTER TABLE `recipe_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `recipe_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recipe_process_stages`
--

DROP TABLE IF EXISTS `recipe_process_stages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipe_process_stages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `recipe_id` int NOT NULL,
  `seq` int NOT NULL DEFAULT '1',
  `process_stage` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `machine` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration` int DEFAULT '0',
  `temperature` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `speed` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `qc_check` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `process_stage_id` int DEFAULT NULL,
  `machine_id` int DEFAULT NULL,
  `ez_check` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_ps_recipe` (`recipe_id`),
  KEY `idx_ps_seq` (`recipe_id`,`seq`),
  KEY `fk_rps_processstage` (`process_stage_id`),
  KEY `fk_rps_machine` (`machine_id`),
  CONSTRAINT `fk_ps_recipe` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rps_machine` FOREIGN KEY (`machine_id`) REFERENCES `machines` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_rps_processstage` FOREIGN KEY (`process_stage_id`) REFERENCES `process_stages` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipe_process_stages`
--

LOCK TABLES `recipe_process_stages` WRITE;
/*!40000 ALTER TABLE `recipe_process_stages` DISABLE KEYS */;
INSERT INTO `recipe_process_stages` VALUES (1,1,1,'Buffing','Packing Station',5,'4','6','1','test','2026-07-07 10:26:02','2026-07-07 10:26:02',2,9,0),(2,1,2,'Drying','Inspection Table',5,'h','7','1','test','2026-07-07 15:48:48','2026-07-07 15:48:48',4,1,0);
/*!40000 ALTER TABLE `recipe_process_stages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recipes`
--

DROP TABLE IF EXISTS `recipes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `leather_type` enum('cow','buffalo','goat','sheep') COLLATE utf8mb4_unicode_ci DEFAULT 'cow',
  `thickness` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `process_type` enum('finishing','tanning','dyeing') COLLATE utf8mb4_unicode_ci DEFAULT 'finishing',
  `color` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `finish_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uom` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'Sq. Ft.',
  `status` enum('active','draft','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `valid_from` date DEFAULT NULL,
  `valid_to` date DEFAULT NULL,
  `version` int DEFAULT '1',
  `description` text COLLATE utf8mb4_unicode_ci,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `product_id` int DEFAULT NULL,
  `leather_type_id` int DEFAULT NULL,
  `finish_type_id` int DEFAULT NULL,
  `color_id` int DEFAULT NULL,
  `uom_id` int DEFAULT NULL,
  `thickness_id` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `fk_recipe_product` (`product_id`),
  KEY `fk_recipe_leathertype` (`leather_type_id`),
  KEY `fk_recipe_finish` (`finish_type_id`),
  KEY `fk_recipe_color` (`color_id`),
  KEY `fk_recipe_uom` (`uom_id`),
  KEY `fk_recipe_thickness` (`thickness_id`),
  CONSTRAINT `fk_recipe_color` FOREIGN KEY (`color_id`) REFERENCES `colors` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_recipe_finish` FOREIGN KEY (`finish_type_id`) REFERENCES `finish_types` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_recipe_leathertype` FOREIGN KEY (`leather_type_id`) REFERENCES `leather_types` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_recipe_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_recipe_thickness` FOREIGN KEY (`thickness_id`) REFERENCES `thickness` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_recipe_uom` FOREIGN KEY (`uom_id`) REFERENCES `uom` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipes`
--

LOCK TABLES `recipes` WRITE;
/*!40000 ALTER TABLE `recipes` DISABLE KEYS */;
INSERT INTO `recipes` VALUES (1,'Testing new','testing new','cow','Medium (1.0-1.2 mm)','finishing','test','semi-aniline','Kilogram','active','2026-06-22','2026-07-30',3,'test','testing other','2026-07-03 17:09:16','2026-07-31 06:19:06',1,5,7,10,3,2,NULL,1);
/*!40000 ALTER TABLE `recipes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_menu_access`
--

DROP TABLE IF EXISTS `role_menu_access`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_menu_access` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_id` int NOT NULL,
  `menu_path` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_menu` (`role_id`,`menu_path`),
  CONSTRAINT `role_menu_access_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=205 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_menu_access`
--

LOCK TABLES `role_menu_access` WRITE;
/*!40000 ALTER TABLE `role_menu_access` DISABLE KEYS */;
INSERT INTO `role_menu_access` VALUES (64,4,'/dashboard','2026-07-23 07:46:53'),(157,1,'/batch-completion','2026-07-29 07:00:39'),(158,1,'/batch-lot-tracking','2026-07-29 07:00:39'),(159,1,'/batch-process','2026-07-29 07:00:39'),(160,1,'/bom','2026-07-29 07:00:39'),(161,1,'/bom-revision','2026-07-29 07:00:39'),(162,1,'/business-units','2026-07-29 07:00:39'),(163,1,'/chemical-master','2026-07-29 07:00:39'),(164,1,'/color','2026-07-29 07:00:39'),(165,1,'/company','2026-07-29 07:00:39'),(166,1,'/cost-analysis','2026-07-29 07:00:39'),(167,1,'/customer-master','2026-07-29 07:00:39'),(168,1,'/dashboard','2026-07-29 07:00:39'),(169,1,'/database-backups','2026-07-29 07:00:39'),(170,1,'/finish-type','2026-07-29 07:00:39'),(171,1,'/grade','2026-07-29 07:00:39'),(172,1,'/grn','2026-07-29 07:00:39'),(173,1,'/group-master','2026-07-29 07:00:39'),(174,1,'/hsn-code','2026-07-29 07:00:39'),(175,1,'/inventory-reports','2026-07-29 07:00:39'),(176,1,'/leather-type','2026-07-29 07:00:39'),(177,1,'/machine','2026-07-29 07:00:39'),(178,1,'/material-issue','2026-07-29 07:00:39'),(179,1,'/material-receipt','2026-07-29 07:00:39'),(180,1,'/material-requirement','2026-07-29 07:00:39'),(181,1,'/physical-stock-entry','2026-07-29 07:00:39'),(182,1,'/process-stage','2026-07-29 07:00:39'),(183,1,'/product-category','2026-07-29 07:00:39'),(184,1,'/product-master','2026-07-29 07:00:39'),(185,1,'/production-plan','2026-07-29 07:00:39'),(186,1,'/purchase-orders','2026-07-29 07:00:39'),(187,1,'/recipe-creation','2026-07-29 07:00:39'),(188,1,'/reports','2026-07-29 07:00:39'),(189,1,'/roles','2026-07-29 07:00:39'),(190,1,'/sales-orders','2026-07-29 07:00:39'),(191,1,'/standard-size','2026-07-29 07:00:39'),(192,1,'/stock-opening-entry','2026-07-29 07:00:39'),(193,1,'/stock-transfer','2026-07-29 07:00:39'),(194,1,'/supplier-invoice','2026-07-29 07:00:39'),(195,1,'/supplier-master','2026-07-29 07:00:39'),(196,1,'/supplier-price-approval','2026-07-29 07:00:39'),(197,1,'/supplier-pricing-history','2026-07-29 07:00:39'),(198,1,'/supplier-return','2026-07-29 07:00:39'),(199,1,'/tax-master','2026-07-29 07:00:39'),(200,1,'/thickness','2026-07-29 07:00:39'),(201,1,'/uom','2026-07-29 07:00:39'),(202,1,'/users','2026-07-29 07:00:39'),(203,1,'/warehouse-master','2026-07-29 07:00:39'),(204,1,'/rate-master','2026-07-29 07:00:39');
/*!40000 ALTER TABLE `role_menu_access` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `permissions` json DEFAULT NULL,
  `access_level` enum('read_write','read_only') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'read_write',
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_role_code` (`code`),
  KEY `idx_role_deleted` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'ADMIN','Administrator','Full system access with all permissions',NULL,'read_write','Active','2026-07-05 14:29:03','2026-07-27 08:32:13',NULL,1,NULL),(2,'MANAGER','Manager','Manage operations and approve transactions',NULL,'read_write','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(3,'USER','User','Basic access to view and create records',NULL,'read_write','Active','2026-07-05 14:29:03','2026-07-17 14:33:56',NULL,1,NULL),(4,'VIEWER','Viewer','Read-only access',NULL,'read_only','Active','2026-07-05 14:29:03','2026-07-23 07:46:53',NULL,1,NULL);
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales_order_attachments`
--

DROP TABLE IF EXISTS `sales_order_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales_order_attachments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sales_order_id` int NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Others',
  `uploaded_by` int DEFAULT NULL,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_soa_order` (`sales_order_id`),
  CONSTRAINT `fk_soa_order` FOREIGN KEY (`sales_order_id`) REFERENCES `sales_orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales_order_attachments`
--

LOCK TABLES `sales_order_attachments` WRITE;
/*!40000 ALTER TABLE `sales_order_attachments` DISABLE KEYS */;
INSERT INTO `sales_order_attachments` VALUES (1,1,'company-logo.png','/uploads/sales-orders/1783494118058-578523401.png','PNG','Others',3,NULL,'2026-07-08 07:01:58');
/*!40000 ALTER TABLE `sales_order_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales_order_items`
--

DROP TABLE IF EXISTS `sales_order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales_order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sales_order_id` int NOT NULL,
  `item_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `item_description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `leather_type_id` int DEFAULT NULL,
  `leather_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `finish_color` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `thickness` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uom` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` decimal(12,2) DEFAULT '0.00',
  `unit_price` decimal(12,4) DEFAULT '0.0000',
  `discount_percent` decimal(5,2) DEFAULT '0.00',
  `amount` decimal(14,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_soi_order` (`sales_order_id`),
  CONSTRAINT `fk_soi_order` FOREIGN KEY (`sales_order_id`) REFERENCES `sales_orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales_order_items`
--

LOCK TABLES `sales_order_items` WRITE;
/*!40000 ALTER TABLE `sales_order_items` DISABLE KEYS */;
INSERT INTO `sales_order_items` VALUES (6,1,'5','test',NULL,NULL,'test','test','5','Sq.Ft.',2.00,2.0000,2.00,3.92,'2026-07-28 08:25:20');
/*!40000 ALTER TABLE `sales_order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales_orders`
--

DROP TABLE IF EXISTS `sales_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales_orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_no` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` int NOT NULL,
  `order_date` date NOT NULL,
  `delivery_date` date DEFAULT NULL,
  `customer_po_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Standard',
  `contact_person` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `delivery_address` text COLLATE utf8mb4_unicode_ci,
  `payment_terms` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `currency` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'INR',
  `price_list` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sales_person` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Draft','Confirmed','Processing','Shipped','Delivered','Cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
  `terms_conditions` text COLLATE utf8mb4_unicode_ci,
  `discount` decimal(12,2) DEFAULT '0.00',
  `freight` decimal(12,2) DEFAULT '0.00',
  `tax_percent` decimal(5,2) DEFAULT '18.00',
  `sub_total` decimal(14,2) DEFAULT '0.00',
  `tax_amount` decimal(12,2) DEFAULT '0.00',
  `grand_total` decimal(14,2) DEFAULT '0.00',
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_no` (`order_no`),
  KEY `idx_so_customer` (`customer_id`),
  KEY `idx_so_status` (`status`),
  KEY `idx_so_order_date` (`order_date`),
  CONSTRAINT `fk_so_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales_orders`
--

LOCK TABLES `sales_orders` WRITE;
/*!40000 ALTER TABLE `sales_orders` DISABLE KEYS */;
INSERT INTO `sales_orders` VALUES (1,'SO-2026-00001',1,'2026-07-01','2026-07-02','4','Standard','Mohammed Naqhid Chowdri','test','60 Days','INR','Standard Export Price List','testing','Draft',NULL,0.00,0.00,5.00,3.92,0.20,4.12,'test',3,1,'2026-07-07 20:05:15','2026-07-28 08:25:20');
/*!40000 ALTER TABLE `sales_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `standard_sizes`
--

DROP TABLE IF EXISTS `standard_sizes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `standard_sizes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_stdsize_code` (`code`),
  KEY `idx_ss_deleted` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `standard_sizes`
--

LOCK TABLES `standard_sizes` WRITE;
/*!40000 ALTER TABLE `standard_sizes` DISABLE KEYS */;
INSERT INTO `standard_sizes` VALUES (1,'CUSTOM','As per Customer Requirement','Size as specified by customer','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(2,'STD-20','Standard 20 Sq. Ft.','Standard hide size approx 20 sq. ft.','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(3,'STD-25','Standard 25 Sq. Ft.','Large hide size approx 25 sq. ft.','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(4,'STD-30','Standard 30 Sq. Ft.','Extra large hide size approx 30 sq. ft.','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(5,'HALF','Half Hide','Half hide cut','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL);
/*!40000 ALTER TABLE `standard_sizes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `states`
--

DROP TABLE IF EXISTS `states`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `states` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `country_id` int NOT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_state_country` (`code`,`country_id`),
  KEY `idx_state_code` (`code`),
  KEY `idx_state_country` (`country_id`),
  CONSTRAINT `fk_state_country` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `states`
--

LOCK TABLES `states` WRITE;
/*!40000 ALTER TABLE `states` DISABLE KEYS */;
INSERT INTO `states` VALUES (1,'TN','Tamil Nadu',1,'Active','2026-07-05 14:29:03','2026-07-05 14:29:03'),(2,'KA','Karnataka',1,'Active','2026-07-05 14:29:03','2026-07-05 14:29:03'),(3,'MH','Maharashtra',1,'Active','2026-07-05 14:29:03','2026-07-05 14:29:03'),(4,'KL','Kerala',1,'Active','2026-07-05 14:29:03','2026-07-05 14:29:03'),(5,'AP','Andhra Pradesh',1,'Active','2026-07-05 14:29:03','2026-07-05 14:29:03'),(6,'GJ','Gujarat',1,'Active','2026-07-05 14:29:03','2026-07-05 14:29:03'),(7,'WB','West Bengal',1,'Active','2026-07-05 14:29:03','2026-07-05 14:29:03'),(8,'UP','Uttar Pradesh',1,'Active','2026-07-05 14:29:03','2026-07-05 14:29:03'),(9,'RJ','Rajasthan',1,'Active','2026-07-05 14:29:03','2026-07-05 14:29:03'),(10,'DL','Delhi',1,'Active','2026-07-05 14:29:03','2026-07-05 14:29:03');
/*!40000 ALTER TABLE `states` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `status_history`
--

DROP TABLE IF EXISTS `status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `status_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `table_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `record_id` int NOT NULL,
  `old_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `new_status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `changed_by` int DEFAULT NULL,
  `changed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `reason` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `idx_status_table` (`table_name`),
  KEY `idx_status_record` (`table_name`,`record_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `status_history`
--

LOCK TABLES `status_history` WRITE;
/*!40000 ALTER TABLE `status_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `status_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_ledger`
--

DROP TABLE IF EXISTS `stock_ledger`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_ledger` (
  `id` int NOT NULL AUTO_INCREMENT,
  `transaction_date` date NOT NULL,
  `transaction_type` enum('Opening','Receipt','Transfer In','Transfer Out','Issue','Adjustment') COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_id` int NOT NULL,
  `reference_no` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `warehouse_id` int NOT NULL,
  `material_id` int NOT NULL,
  `uom` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `batch_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `in_qty` decimal(14,3) DEFAULT '0.000',
  `out_qty` decimal(14,3) DEFAULT '0.000',
  `unit_cost` decimal(14,4) DEFAULT '0.0000',
  `amount` decimal(16,2) DEFAULT '0.00',
  `balance_qty` decimal(14,3) DEFAULT '0.000',
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sl_warehouse` (`warehouse_id`),
  KEY `idx_sl_material` (`material_id`),
  KEY `idx_sl_ref` (`reference_type`,`reference_id`),
  KEY `idx_sl_date` (`transaction_date`),
  CONSTRAINT `fk_sl_material` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`),
  CONSTRAINT `fk_sl_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_ledger`
--

LOCK TABLES `stock_ledger` WRITE;
/*!40000 ALTER TABLE `stock_ledger` DISABLE KEYS */;
INSERT INTO `stock_ledger` VALUES (2,'2026-07-09','Opening','stock_opening',1,'OPN-2026-00001--6',1,1,'test','test','2026-07-09',2.000,0.000,2.0000,4.00,2.000,'Opening stock entry (updated)',NULL,'2026-07-10 09:54:14'),(3,'2026-07-10','Receipt','material_receipt',1,'GRN-2026-00001',1,1,'test','6','2026-07-11',2.000,0.000,3.0000,6.00,2.000,'Material receipt',NULL,'2026-07-10 09:56:02'),(4,'2026-07-10','Transfer Out','stock_transfer',1,'STN-2026-00001',1,1,'test','new one ',NULL,0.000,2.000,2.5000,5.00,-2.000,'Transfer to ',NULL,'2026-07-10 12:46:03'),(5,'2026-07-10','Transfer In','stock_transfer',1,'STN-2026-00001',2,1,'test','new one ',NULL,2.000,0.000,2.5000,5.00,2.000,'Transfer from ',NULL,'2026-07-10 12:46:03');
/*!40000 ALTER TABLE `stock_ledger` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_opening_entries`
--

DROP TABLE IF EXISTS `stock_opening_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_opening_entries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `entry_no` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entry_date` date NOT NULL,
  `opening_date` date NOT NULL,
  `financial_year` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `warehouse_id` int NOT NULL,
  `reference_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `costing_method` enum('FIFO','LIFO','Weighted Average','Standard Cost') COLLATE utf8mb4_unicode_ci DEFAULT 'FIFO',
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `total_amount` decimal(16,2) DEFAULT '0.00',
  `status` enum('Draft','Posted','Cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `entry_no` (`entry_no`),
  KEY `idx_soe_warehouse` (`warehouse_id`),
  KEY `idx_soe_status` (`status`),
  CONSTRAINT `fk_soe_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_opening_entries`
--

LOCK TABLES `stock_opening_entries` WRITE;
/*!40000 ALTER TABLE `stock_opening_entries` DISABLE KEYS */;
INSERT INTO `stock_opening_entries` VALUES (1,'OPN-2026-00001','2026-07-09','2026-07-09','2025-2026',1,'test','FIFO','test',4.00,'Posted',NULL,NULL,'2026-07-10 09:53:46','2026-07-10 09:54:14');
/*!40000 ALTER TABLE `stock_opening_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_opening_items`
--

DROP TABLE IF EXISTS `stock_opening_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_opening_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `entry_id` int NOT NULL,
  `material_id` int NOT NULL,
  `uom` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` decimal(14,3) NOT NULL DEFAULT '0.000',
  `unit_cost` decimal(14,4) NOT NULL DEFAULT '0.0000',
  `amount` decimal(16,2) NOT NULL DEFAULT '0.00',
  `batch_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_soitem_entry` (`entry_id`),
  KEY `idx_soitem_material` (`material_id`),
  CONSTRAINT `fk_soitem_entry` FOREIGN KEY (`entry_id`) REFERENCES `stock_opening_entries` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_soitem_material` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_opening_items`
--

LOCK TABLES `stock_opening_items` WRITE;
/*!40000 ALTER TABLE `stock_opening_items` DISABLE KEYS */;
INSERT INTO `stock_opening_items` VALUES (2,1,1,'test',2.000,2.0000,4.00,'test','2026-07-09','2026-07-10 09:54:14');
/*!40000 ALTER TABLE `stock_opening_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_transfer_items`
--

DROP TABLE IF EXISTS `stock_transfer_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_transfer_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `transfer_id` int NOT NULL,
  `material_id` int NOT NULL,
  `uom` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `available_qty` decimal(14,3) DEFAULT '0.000',
  `transfer_qty` decimal(14,3) NOT NULL DEFAULT '0.000',
  `unit_cost` decimal(14,4) DEFAULT '0.0000',
  `amount` decimal(16,2) DEFAULT '0.00',
  `batch_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_stitem_transfer` (`transfer_id`),
  KEY `idx_stitem_material` (`material_id`),
  CONSTRAINT `fk_stitem_material` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`),
  CONSTRAINT `fk_stitem_transfer` FOREIGN KEY (`transfer_id`) REFERENCES `stock_transfers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_transfer_items`
--

LOCK TABLES `stock_transfer_items` WRITE;
/*!40000 ALTER TABLE `stock_transfer_items` DISABLE KEYS */;
INSERT INTO `stock_transfer_items` VALUES (1,1,1,'test',4.000,2.000,2.5000,5.00,'new one ','new one ','2026-07-10 12:46:03');
/*!40000 ALTER TABLE `stock_transfer_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_transfers`
--

DROP TABLE IF EXISTS `stock_transfers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_transfers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `transfer_no` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `transfer_date` date NOT NULL,
  `from_warehouse_id` int NOT NULL,
  `to_warehouse_id` int NOT NULL,
  `reference_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_date` date DEFAULT NULL,
  `transporter` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `delivery_challan_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_qty` decimal(14,3) DEFAULT '0.000',
  `total_amount` decimal(16,2) DEFAULT '0.00',
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `status` enum('Draft','Posted','Cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transfer_no` (`transfer_no`),
  KEY `idx_st_from_wh` (`from_warehouse_id`),
  KEY `idx_st_to_wh` (`to_warehouse_id`),
  KEY `idx_st_status` (`status`),
  CONSTRAINT `fk_st_from_wh` FOREIGN KEY (`from_warehouse_id`) REFERENCES `warehouses` (`id`),
  CONSTRAINT `fk_st_to_wh` FOREIGN KEY (`to_warehouse_id`) REFERENCES `warehouses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_transfers`
--

LOCK TABLES `stock_transfers` WRITE;
/*!40000 ALTER TABLE `stock_transfers` DISABLE KEYS */;
INSERT INTO `stock_transfers` VALUES (1,'STN-2026-00001','2026-07-10',1,2,'new one ','2026-07-10','new one ','new one ',2.000,5.00,NULL,'Posted',NULL,NULL,'2026-07-10 12:46:03','2026-07-10 12:46:03');
/*!40000 ALTER TABLE `stock_transfers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supplier_pricing`
--

DROP TABLE IF EXISTS `supplier_pricing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier_pricing` (
  `id` int NOT NULL AUTO_INCREMENT,
  `supplier_id` int NOT NULL,
  `material_id` int NOT NULL,
  `uom` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'Kg',
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `valid_from` date DEFAULT NULL,
  `valid_to` date DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `item_group` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `supplier_part_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unit_price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'INR',
  `min_order_qty` decimal(12,2) DEFAULT '0.00',
  `price_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Purchase Price',
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `approved_by` int DEFAULT NULL,
  `approved_date` date DEFAULT NULL,
  `approval_notes` text COLLATE utf8mb4_unicode_ci,
  `last_approved_price` decimal(12,2) DEFAULT '0.00',
  `last_approved_date` date DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_pricing_supplier` (`supplier_id`),
  KEY `idx_pricing_material` (`material_id`),
  CONSTRAINT `fk_pricing_material` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pricing_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supplier_pricing`
--

LOCK TABLES `supplier_pricing` WRITE;
/*!40000 ALTER TABLE `supplier_pricing` DISABLE KEYS */;
INSERT INTO `supplier_pricing` VALUES (7,1,1,'NOS',0.00,'2026-07-22','2026-07-22','Approved','2026-07-22 12:37:39','2026-07-22 12:37:39',1,NULL,'Dyes','543',2.00,'INR',2.00,'Purchase Price','tst',NULL,NULL,NULL,0.00,NULL,NULL),(8,2,2,'KG',220.00,'2024-01-04','2024-04-30','Approved','2026-07-22 13:10:53','2026-07-22 13:10:53',1,NULL,'Chemicals','CP-1001',220.00,'INR',0.00,'Purchase Price','Price revision',1,'2024-01-04',NULL,220.00,'2024-01-04',NULL),(9,2,2,'KG',210.00,'2024-05-01','2024-05-15','Approved','2026-07-22 13:10:53','2026-07-22 13:10:53',1,NULL,'Chemicals','CP-1001',210.00,'INR',0.00,'Purchase Price','Monthly revision',1,'2024-05-02',NULL,210.00,'2024-05-02',NULL),(10,2,2,'KG',205.00,'2024-05-16',NULL,'Approved','2026-07-22 13:10:53','2026-07-22 13:10:53',1,NULL,'Chemicals','CP-1001',205.00,'INR',0.00,'Purchase Price','Current Price',1,'2024-05-15',NULL,205.00,'2024-05-15',NULL),(11,2,3,'KG',185.00,'2024-01-04','2024-04-30','Approved','2026-07-22 13:10:53','2026-07-22 13:10:53',1,NULL,'Chemicals','ST-2001',185.00,'INR',0.00,'Purchase Price','Quarterly revision',1,'2024-03-28',NULL,185.00,'2024-03-28',NULL),(12,2,3,'KG',180.00,'2024-05-01',NULL,'Approved','2026-07-22 13:10:53','2026-07-22 13:10:53',1,NULL,'Chemicals','ST-2001',180.00,'INR',0.00,'Purchase Price','Price reduced',1,'2024-04-30',NULL,180.00,'2024-04-30',NULL),(13,2,4,'LTR',65.00,'2024-01-04','2024-04-15','Approved','2026-07-22 13:10:53','2026-07-22 13:10:53',1,NULL,'Chemicals','FA-3001',65.00,'INR',0.00,'Purchase Price','New contract',1,'2024-01-04',NULL,65.00,'2024-01-04',NULL),(14,2,4,'LTR',62.00,'2024-06-04',NULL,'Approved','2026-07-22 13:10:53','2026-07-22 13:10:53',1,NULL,'Chemicals','FA-3001',62.00,'INR',0.00,'Purchase Price','Price reduced',1,'2024-06-04',NULL,62.00,'2024-06-04',NULL),(15,2,5,'KG',145.00,'2024-01-03','2024-03-31','Expired','2026-07-22 13:10:53','2026-07-22 13:10:53',1,NULL,'Chemicals','FL-4001',145.00,'INR',0.00,'Purchase Price','Old price',1,'2024-02-28',NULL,145.00,'2024-02-28',NULL),(16,2,2,'KG',220.00,'2024-01-04','2024-04-30','Approved','2026-07-22 13:40:51','2026-07-22 13:40:51',1,NULL,'Chemicals','CP-1001',220.00,'INR',0.00,'Purchase Price','Price revision',1,'2024-01-04',NULL,220.00,'2024-01-04',NULL),(17,3,6,'LTR',450.00,'2024-01-01','2024-06-30','Approved','2026-07-22 13:52:06','2026-07-22 13:52:06',1,NULL,'Dyes','KD-001',450.00,'INR',0.00,'Purchase Price','Initial price',1,'2024-01-01',NULL,450.00,'2024-01-01',NULL),(18,3,6,'LTR',420.00,'2024-07-01',NULL,'Approved','2026-07-22 13:52:06','2026-07-22 13:52:06',1,NULL,'Dyes','KD-001',420.00,'INR',0.00,'Purchase Price','Price reduced',1,'2024-07-01',NULL,420.00,'2024-07-01',NULL),(19,4,5,'KG',0.00,'2026-07-22','2026-07-22','Approved','2026-07-22 14:13:50','2026-07-22 14:13:50',1,NULL,'Chemicals','test',2.00,'INR',2.00,'Purchase Price','test',NULL,NULL,NULL,0.00,NULL,NULL);
/*!40000 ALTER TABLE `supplier_pricing` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supplier_pricing_attachments`
--

DROP TABLE IF EXISTS `supplier_pricing_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier_pricing_attachments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pricing_id` int NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size` int DEFAULT '0',
  `uploaded_by` int DEFAULT NULL,
  `uploaded_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_spa_pricing` (`pricing_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supplier_pricing_attachments`
--

LOCK TABLES `supplier_pricing_attachments` WRITE;
/*!40000 ALTER TABLE `supplier_pricing_attachments` DISABLE KEYS */;
/*!40000 ALTER TABLE `supplier_pricing_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_person` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alt_phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `pincode` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` enum('chemical','raw','dye','finishing') COLLATE utf8mb4_unicode_ci DEFAULT 'chemical',
  `supply_type` enum('raw','chemical','dye','finishing') COLLATE utf8mb4_unicode_ci DEFAULT 'chemical',
  `gstin` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pan` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_terms` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_account` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ifsc_code` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `country_id` int DEFAULT NULL,
  `state_id` int DEFAULT NULL,
  `city_id` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_sup_deleted` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES (1,'testing','testing','test','1234566789','test@gmail.com','765431133','Vaniyambadi','Tamil Nadu','India','','12345','test','chemical','chemical','27ABCPS1234L1Z5','ABCPS1234L','30','test','test','test','test','Active','2026-07-01 16:38:38','2026-07-15 13:10:32',NULL,NULL,NULL,NULL,NULL,NULL),(2,'SUP-001','ABC Chemicals Pvt. Ltd.','Rajesh Kumar','044-12345678','info@abcchem.com',NULL,'Chennai','Tamil Nadu','India',NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-07-22 13:08:48','2026-07-22 13:08:48',NULL,NULL,NULL,NULL,NULL,NULL),(3,'SUP-002','Krishna Dyes & Chemicals','Suresh Patel','044-98765432','sales@krishnadyes.com',NULL,'Mumbai','Maharashtra','India',NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-07-22 13:08:48','2026-07-22 13:08:48',NULL,NULL,NULL,NULL,NULL,NULL),(4,'SUP-003','Modi Leather Supplies','Anil Modi','011-55667788','contact@modileather.in',NULL,'Delhi','Delhi','India',NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-07-22 13:08:48','2026-07-22 13:08:48',NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tax_master`
--

DROP TABLE IF EXISTS `tax_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tax_master` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tax_category` enum('Goods','Services','Stationary') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Goods',
  `hsn_code_id` int DEFAULT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gst_percent` decimal(5,2) NOT NULL DEFAULT '18.00',
  `cess_percent` decimal(5,2) NOT NULL DEFAULT '0.00',
  `effective_from` date DEFAULT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `hsn_code_id` (`hsn_code_id`),
  CONSTRAINT `tax_master_ibfk_1` FOREIGN KEY (`hsn_code_id`) REFERENCES `hsn_codes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tax_master`
--

LOCK TABLES `tax_master` WRITE;
/*!40000 ALTER TABLE `tax_master` DISABLE KEYS */;
INSERT INTO `tax_master` VALUES (1,'TAX-001','GST 18%','Goods',NULL,'Standard GST for goods',18.00,0.00,NULL,'Active',0,NULL,NULL,'2026-07-28 07:14:20','2026-07-28 07:14:20',NULL),(2,'TAX-002','GST 12%','Goods',NULL,'Reduced GST for goods',12.00,0.00,NULL,'Active',0,NULL,NULL,'2026-07-28 07:14:20','2026-07-28 07:14:20',NULL),(3,'TAX-003','GST 5%','Goods',NULL,'Low GST for essential goods',5.00,0.00,'2026-07-28','Active',0,NULL,1,'2026-07-28 07:14:20','2026-07-28 08:23:35',NULL),(4,'TAX-004','GST 28%','Goods',NULL,'Luxury goods GST',28.00,0.00,NULL,'Active',0,NULL,NULL,'2026-07-28 07:14:20','2026-07-28 07:14:20',NULL),(5,'TAX-005','GST 18% Services','Services',NULL,'Standard GST for services',18.00,0.00,NULL,'Active',0,NULL,NULL,'2026-07-28 07:14:20','2026-07-28 07:14:20',NULL),(6,'TAX-00006','goods','Goods',NULL,'test',18.00,0.00,NULL,'Active',0,1,1,'2026-07-28 07:24:57','2026-07-28 07:25:58',NULL),(7,'TAX-00007','5','Goods',NULL,'',5.00,5.00,'2026-07-27','Inactive',0,1,NULL,'2026-07-28 07:29:46','2026-07-28 07:47:38','2026-07-28 07:47:38');
/*!40000 ALTER TABLE `tax_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `thickness`
--

DROP TABLE IF EXISTS `thickness`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `thickness` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value_mm` decimal(5,2) DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_thickness_code` (`code`),
  KEY `idx_th_deleted` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `thickness`
--

LOCK TABLES `thickness` WRITE;
/*!40000 ALTER TABLE `thickness` DISABLE KEYS */;
INSERT INTO `thickness` VALUES (1,'THIN','Thin (0.8-1.0 mm)',0.90,'Thin leather for lining and garments','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(2,'MEDIUM','Medium (1.0-1.2 mm)',1.10,'Standard thickness for footwear','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(3,'STD','Standard (1.2-1.4 mm)',1.30,'Most common thickness for leather goods','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(4,'THICK','Thick (1.4-1.6 mm)',1.50,'Thick leather for bags and belts','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(5,'HEAVY','Heavy (1.6-2.0 mm)',1.80,'Heavy leather for industrial use','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL);
/*!40000 ALTER TABLE `thickness` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `uom`
--

DROP TABLE IF EXISTS `uom`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uom` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_uom_code` (`code`),
  KEY `idx_uom_deleted` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `uom`
--

LOCK TABLES `uom` WRITE;
/*!40000 ALTER TABLE `uom` DISABLE KEYS */;
INSERT INTO `uom` VALUES (1,'SQFT','Square Feet','Area measurement in square feet','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(2,'SQM','Square Meter','Area measurement in square meters','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(3,'KG','Kilogram','Weight measurement in kilograms','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(4,'LTR','Liter','Liquid volume in liters','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(5,'MTR','Meter','Linear measurement in meters','Inactive','2026-07-05 14:29:03','2026-07-11 11:19:52',NULL,NULL,NULL),(6,'PIECE','Piece','Individual unit count','Inactive','2026-07-05 14:29:03','2026-07-11 11:19:52',NULL,NULL,NULL),(7,'DOZEN','Dozen','Pack of 12 units','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL);
/*!40000 ALTER TABLE `uom` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `full_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_id` int DEFAULT NULL,
  `company_id` int DEFAULT NULL,
  `business_unit_id` int DEFAULT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `idx_user_username` (`username`),
  KEY `idx_user_status` (`status`),
  KEY `fk_user_role` (`role_id`),
  KEY `fk_user_company` (`company_id`),
  KEY `fk_user_bu` (`business_unit_id`),
  CONSTRAINT `fk_user_bu` FOREIGN KEY (`business_unit_id`) REFERENCES `business_units` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_user_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_user_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2b$12$LQv3c1yqBWVHxkd0L5tW4.j2o8.qJ3ZqX7K7K1ZqJ3ZqJ3ZqJ3ZqJ3ZqJ3ZqJ3Zq','admin@tannery.com','System Administrator',1,NULL,NULL,'Active','2026-07-31 12:30:40','2026-07-05 14:29:03','2026-07-31 12:30:40',NULL,NULL),(3,'Naqhid','$2a$10$PgwHvLueDa0pbIFY8eiqGO1QIHCiqW5nQJR.tC6wS.7RSe8sRrm66','naqhid@example.com','Naqhid',1,1,NULL,'Active','2026-07-11 15:50:38','2026-07-07 13:59:01','2026-07-11 15:50:38',NULL,3),(4,'Test','$2a$10$cbcFeAo7HPTdzLCXCTxuxOTKHW2jyoyZ3wun0lNrFgy.eSXuM4ndW','test@gmail.com','Testing',4,NULL,NULL,'Active','2026-07-23 07:52:44','2026-07-17 14:38:20','2026-07-31 06:19:25',1,1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `warehouse_attachments`
--

DROP TABLE IF EXISTS `warehouse_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `warehouse_attachments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `warehouse_id` int NOT NULL,
  `document_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size` int DEFAULT '0',
  `uploaded_by` int DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_wa_warehouse` (`warehouse_id`),
  CONSTRAINT `fk_wa_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `warehouse_attachments`
--

LOCK TABLES `warehouse_attachments` WRITE;
/*!40000 ALTER TABLE `warehouse_attachments` DISABLE KEYS */;
INSERT INTO `warehouse_attachments` VALUES (1,1,NULL,'Warehouse Store master.png','/uploads/warehouses/1783680455446-481212547.png','image/png',1278345,NULL,'2026-07-10 10:47:35');
/*!40000 ALTER TABLE `warehouse_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `warehouse_bins`
--

DROP TABLE IF EXISTS `warehouse_bins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `warehouse_bins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `warehouse_id` int NOT NULL,
  `bin_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bin_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rack_no` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shelf_no` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `capacity` decimal(12,2) DEFAULT NULL,
  `uom` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_wb_code` (`warehouse_id`,`bin_code`),
  KEY `idx_wb_warehouse` (`warehouse_id`),
  KEY `idx_wb_status` (`status`),
  CONSTRAINT `fk_wb_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `warehouse_bins`
--

LOCK TABLES `warehouse_bins` WRITE;
/*!40000 ALTER TABLE `warehouse_bins` DISABLE KEYS */;
INSERT INTO `warehouse_bins` VALUES (2,1,'001','test','1','1',1.00,'2','Active',NULL,'2026-07-10 12:04:53','2026-07-10 12:04:53'),(3,2,'new one ','new one ','32','5',2.00,'3','Active',NULL,'2026-07-10 12:45:18','2026-07-10 12:45:18');
/*!40000 ALTER TABLE `warehouse_bins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `warehouse_stock`
--

DROP TABLE IF EXISTS `warehouse_stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `warehouse_stock` (
  `id` int NOT NULL AUTO_INCREMENT,
  `warehouse_id` int NOT NULL,
  `material_id` int NOT NULL,
  `uom` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `current_qty` decimal(14,3) DEFAULT '0.000',
  `avg_unit_cost` decimal(14,4) DEFAULT '0.0000',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ws` (`warehouse_id`,`material_id`),
  KEY `idx_ws_warehouse` (`warehouse_id`),
  KEY `idx_ws_material` (`material_id`),
  CONSTRAINT `fk_ws_material` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`),
  CONSTRAINT `fk_ws_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `warehouse_stock`
--

LOCK TABLES `warehouse_stock` WRITE;
/*!40000 ALTER TABLE `warehouse_stock` DISABLE KEYS */;
INSERT INTO `warehouse_stock` VALUES (1,1,1,'test',2.000,2.5000,'2026-07-10 12:46:03'),(2,2,1,'test',1.000,2.5000,'2026-07-10 12:58:15');
/*!40000 ALTER TABLE `warehouse_stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `warehouse_user_access`
--

DROP TABLE IF EXISTS `warehouse_user_access`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `warehouse_user_access` (
  `id` int NOT NULL AUTO_INCREMENT,
  `warehouse_id` int NOT NULL,
  `user_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Store Keeper',
  `access_level` enum('Full','View Only','Limited') COLLATE utf8mb4_unicode_ci DEFAULT 'Full',
  `can_receive` tinyint(1) DEFAULT '1',
  `can_issue` tinyint(1) DEFAULT '1',
  `can_transfer` tinyint(1) DEFAULT '1',
  `can_adjust` tinyint(1) DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_wua_warehouse` (`warehouse_id`),
  CONSTRAINT `fk_wua_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `warehouse_user_access`
--

LOCK TABLES `warehouse_user_access` WRITE;
/*!40000 ALTER TABLE `warehouse_user_access` DISABLE KEYS */;
INSERT INTO `warehouse_user_access` VALUES (1,1,'test','Store Keeper','Full',1,1,1,0,NULL,'2026-07-10 12:04:53','2026-07-10 12:04:53');
/*!40000 ALTER TABLE `warehouse_user_access` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `warehouses`
--

DROP TABLE IF EXISTS `warehouses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `warehouses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `short_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `warehouse_type` enum('Raw Material','Finished Goods','Semi-Finished','WIP','Consumable','Quarantine') COLLATE utf8mb4_unicode_ci DEFAULT 'Raw Material',
  `parent_warehouse_id` int DEFAULT NULL,
  `is_default` enum('Yes','No') COLLATE utf8mb4_unicode_ci DEFAULT 'No',
  `location_address` text COLLATE utf8mb4_unicode_ci,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pincode` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `store_keeper` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cost_center` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `opening_date` date DEFAULT NULL,
  `total_area` decimal(12,2) DEFAULT NULL,
  `usable_area` decimal(12,2) DEFAULT NULL,
  `storage_condition` enum('Dry','Cold','Humid','Refrigerated','Ambient') COLLATE utf8mb4_unicode_ci DEFAULT 'Dry',
  `temperature_control` enum('Yes','No') COLLATE utf8mb4_unicode_ci DEFAULT 'No',
  `humidity_control` enum('Yes','No') COLLATE utf8mb4_unicode_ci DEFAULT 'No',
  `handling_equipment` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `material_movement_type` enum('FIFO','LIFO','FEFO','Weighted Average') COLLATE utf8mb4_unicode_ci DEFAULT 'FIFO',
  `allow_negative_stock` tinyint(1) DEFAULT '0',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_wh_parent` (`parent_warehouse_id`),
  KEY `idx_wh_status` (`status`),
  CONSTRAINT `fk_wh_parent` FOREIGN KEY (`parent_warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `warehouses`
--

LOCK TABLES `warehouses` WRITE;
/*!40000 ALTER TABLE `warehouses` DISABLE KEYS */;
INSERT INTO `warehouses` VALUES (1,'test','test','test','Raw Material',NULL,'Yes','test','Ambur','Tamil Nadu','India','635802','test','test','test','test','2026-07-05',2.00,2.00,'Dry','Yes','Yes','test','FIFO',1,NULL,'test','Active',NULL,NULL,'2026-07-10 09:51:13','2026-07-10 12:04:53'),(2,'new one ','new one ','new one ','Raw Material',NULL,'Yes','new one ','Ambur','Tamil Nadu','India','new one ','123456789','new one ','new one ','CC-FG-01','2026-07-10',2.00,2.00,'Dry','No','No','new one ','FIFO',0,'new one ','new one ','Active',NULL,NULL,'2026-07-10 12:45:18','2026-07-10 12:45:18');
/*!40000 ALTER TABLE `warehouses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'tannery_mini_erp'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-31 19:12:42
