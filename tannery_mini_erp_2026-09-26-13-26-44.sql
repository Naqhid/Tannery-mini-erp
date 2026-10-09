-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: tannery_mini_erp
-- ------------------------------------------------------
-- Server version	8.0.46-0ubuntu0.24.04.3

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
  `table_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `record_id` int NOT NULL,
  `action` enum('INSERT','UPDATE','DELETE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `changed_by` int DEFAULT NULL,
  `changed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `customer_name` varchar(200) DEFAULT NULL,
  `order_no` varchar(50) DEFAULT NULL,
  `article_code` varchar(50) DEFAULT NULL,
  `article_name` varchar(200) DEFAULT NULL,
  `finish` varchar(100) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `receipt_qty` decimal(12,2) DEFAULT '0.00',
  `uom` varchar(20) DEFAULT 'SQ.FT.',
  `output_qty` decimal(12,2) DEFAULT '0.00',
  `output_uom` varchar(20) DEFAULT 'SQ.FT.',
  `status` varchar(50) DEFAULT 'Pending',
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_bli_batch` (`batch_id`),
  KEY `idx_bli_seq` (`batch_id`,`seq`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `batch_line_items`
--

LOCK TABLES `batch_line_items` WRITE;
/*!40000 ALTER TABLE `batch_line_items` DISABLE KEYS */;
INSERT INTO `batch_line_items` VALUES (1,1,1,'Leather World Co.','SO-2024-0015','LTH-1001','Cow Leather','Full Chrome','Black',800.00,'SQ.FT.',760.00,'SQ.FT.','Completed',NULL,'2026-07-21 07:07:33','2026-07-21 07:07:33'),(2,1,2,'Leather World Co.','SO-2024-0015','LTH-1001','Cow Leather','Semi Chrome','Brown',200.00,'SQ.FT.',200.00,'SQ.FT.','Completed',NULL,'2026-07-21 07:07:33','2026-07-21 07:07:33'),(3,1,3,'Leather World Co.','SO-2024-0015','LTH-1001','Cow Leather','Vegetable','Tan',400.00,'SQ.FT.',380.00,'SQ.FT.','Completed',NULL,'2026-07-21 07:07:33','2026-07-21 07:07:33'),(4,1,4,'Leather World Co.','SO-2024-0015','LTH-1001','Cow Leather','Full Chrome','Navy Blue',350.00,'SQ.FT.',330.00,'SQ.FT.','Completed',NULL,'2026-07-21 07:07:33','2026-07-21 07:07:33'),(5,1,5,'Leather World Co.','SO-2024-0015','LTH-1001','Cow Leather','Pull Up','Dark Brown',300.00,'SQ.FT.',280.00,'SQ.FT.','Completed',NULL,'2026-07-21 07:07:33','2026-07-21 07:07:33'),(6,2,1,'Global Leathers Ltd.','SO-2024-0018','LTH-1002','Buffalo Leather','Semi Chrome','Black',800.00,'SQ.FT.',570.00,'SQ.FT.','Completed',NULL,'2026-07-21 07:07:33','2026-07-21 07:07:33'),(7,6,1,'Leather World Co.','SO-2024-0015','LTH-1001','Cow Leather','Full Chrome','Black',800.00,'SQ.FT.',760.00,'SQ.FT.','Completed',NULL,'2026-08-07 08:51:23','2026-08-07 08:51:23'),(8,6,2,'Global Leathers Ltd.','SO-2024-0018','LTH-1002','Buffalo Leather','Semi Chrome','Brown',600.00,'SQ.FT.',570.00,'SQ.FT.','Completed',NULL,'2026-08-07 08:51:23','2026-08-07 08:51:23'),(9,6,3,'Premium Shoes Pvt. Ltd.','SO-2024-0021','LTH-1003','Sheep Leather','Vegetable','Tan',400.00,'SQ.FT.',380.00,'SQ.FT.','Completed',NULL,'2026-08-07 08:51:23','2026-08-07 08:51:23'),(10,6,4,'Fashion Footwear Inc.','SO-2024-0023','LTH-1004','Goat Leather','Full Chrome','Navy Blue',350.00,'SQ.FT.',330.00,'SQ.FT.','In-Process',NULL,'2026-08-07 08:51:23','2026-08-07 08:51:23'),(11,6,5,'Elite Exports','SO-2024-0025','LTH-1005','Cow Leather','Pull Up','Dark Brown',300.00,'SQ.FT.',280.00,'SQ.FT.','In-Process',NULL,'2026-08-07 08:51:23','2026-08-07 08:51:23');
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
  `batch_no` varchar(50) NOT NULL,
  `production_plan_id` int DEFAULT NULL,
  `sales_order_id` int DEFAULT NULL,
  `customer_id` int DEFAULT NULL,
  `order_no` varchar(50) DEFAULT NULL,
  `article_code` varchar(50) DEFAULT NULL,
  `article_name` varchar(200) DEFAULT NULL,
  `production_date` date DEFAULT NULL,
  `stage` varchar(100) DEFAULT 'Tanning',
  `current_stage` varchar(100) DEFAULT 'Tanning',
  `total_receipt_qty` decimal(12,2) DEFAULT '0.00',
  `total_output_qty` decimal(12,2) DEFAULT '0.00',
  `yield_percent` decimal(5,2) DEFAULT '0.00',
  `status` enum('Draft','In-Process','Completed','On-Hold','Cancelled') DEFAULT 'Draft',
  `remarks` text,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `batch_no` (`batch_no`),
  KEY `idx_batch_number` (`batch_no`),
  KEY `idx_batch_plan` (`production_plan_id`),
  KEY `idx_batch_date` (`production_date`),
  KEY `idx_batch_status` (`status`),
  KEY `idx_batch_deleted` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `batches`
--

LOCK TABLES `batches` WRITE;
/*!40000 ALTER TABLE `batches` DISABLE KEYS */;
INSERT INTO `batches` VALUES (1,'BTCH-202405-0012',NULL,NULL,NULL,'SO-2024-0015','LTH-1001','Cow Leather','2024-05-20','Tanning','Tanning',2450.00,2320.00,94.69,'Completed','Batch for Leather World Co.',1,NULL,NULL,'2026-07-21 07:07:33','2026-07-21 07:07:33'),(2,'BTCH-202405-0013',NULL,NULL,NULL,'SO-2024-0018','LTH-1002','Buffalo Leather','2024-05-20','Tanning','Tanning',800.00,760.00,95.00,'Completed','Batch for Global Leathers Ltd.',1,NULL,NULL,'2026-07-21 07:07:33','2026-07-21 07:07:33'),(3,'BTCH-202405-0014',NULL,NULL,NULL,'SO-2024-0021','LTH-1003','Sheep Leather','2024-05-21','Finishing','Finishing',400.00,380.00,95.00,'In-Process','Batch for Premium Shoes Pvt. Ltd.',1,NULL,NULL,'2026-07-21 07:07:33','2026-07-21 07:07:33'),(4,'BTCH-202405-0015',NULL,NULL,NULL,'SO-2024-0023','LTH-1004','Goat Leather','2024-05-21','Dyeing','Dyeing',350.00,330.00,94.29,'In-Process','Batch for Fashion Footwear Inc.',1,NULL,NULL,'2026-07-21 07:07:33','2026-07-21 07:07:33'),(5,'BTCH-202405-0016',NULL,NULL,NULL,'SO-2024-0025','LTH-1005','Cow Leather','2024-05-22','Tanning','Tanning',300.00,280.00,93.33,'In-Process','Batch for Elite Exports',1,NULL,NULL,'2026-07-21 07:07:33','2026-07-21 07:07:33'),(6,'BTCH-240520-0012',NULL,NULL,NULL,NULL,NULL,NULL,'2024-05-20','Tanning','Tanning',2450.00,2320.00,94.69,'In-Process',NULL,NULL,NULL,NULL,'2026-08-07 08:51:23','2026-08-07 08:51:23'),(7,'2026-00004-001',4,7,6,NULL,NULL,'test','2026-08-10','testing','testing',0.00,0.00,0.00,'Draft',NULL,7,NULL,NULL,'2026-08-10 07:15:12','2026-08-10 07:15:12'),(8,'2026-00005-001',NULL,NULL,NULL,NULL,NULL,NULL,'2026-08-10','testing','testing',0.00,0.00,0.00,'Draft',NULL,7,NULL,NULL,'2026-08-10 07:20:28','2026-08-10 07:20:28');
/*!40000 ALTER TABLE `batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bom_attachments`
--

DROP TABLE IF EXISTS `bom_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bom_attachments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bom_id` int NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `file_size` int DEFAULT '0',
  `uploaded_by` int DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_bom_attachments_bom` (`bom_id`),
  CONSTRAINT `fk_bom_attachments_bom` FOREIGN KEY (`bom_id`) REFERENCES `boms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bom_attachments`
--

LOCK TABLES `bom_attachments` WRITE;
/*!40000 ALTER TABLE `bom_attachments` DISABLE KEYS */;
/*!40000 ALTER TABLE `bom_attachments` ENABLE KEYS */;
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
  `material_id` int DEFAULT NULL,
  `machine_id` int DEFAULT NULL,
  `type` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Chemical',
  `bom_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uom` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Kg',
  `qty` decimal(12,3) NOT NULL DEFAULT '0.000',
  `unit_cost` decimal(10,2) NOT NULL DEFAULT '0.00',
  `amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
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
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bom_items`
--

LOCK TABLES `bom_items` WRITE;
/*!40000 ALTER TABLE `bom_items` DISABLE KEYS */;
INSERT INTO `bom_items` VALUES (1,1,1,NULL,'Manual','finishing','Kg',4.000,4.00,16.00,'testing','2026-07-31 11:32:49','2026-09-15 11:08:39',1,7,7,0.00,'2026-07-02','2026-07-09'),(6,1,NULL,56,'Wet End','finishing','Kg',6.000,4.50,27.00,'testing','2026-08-06 12:47:43','2026-09-15 11:08:39',1,7,NULL,0.00,'2026-07-02','2026-07-09'),(7,2,35,NULL,'Wet-end','Wet End Chemicals','Kg',3.500,267.00,934.50,'','2026-08-11 07:13:43','2026-09-15 11:08:39',4,7,NULL,0.00,NULL,NULL),(8,2,59,NULL,'Wet-end','Wet End Chemicals','Kg',5.000,306.00,1530.00,'','2026-08-11 07:13:43','2026-09-15 11:08:39',4,7,NULL,0.00,NULL,NULL),(9,2,36,NULL,'Wet-end','Wet End Chemicals','Kg',3.500,140.00,490.00,'','2026-08-11 07:13:43','2026-09-15 11:08:39',15,7,NULL,0.00,NULL,NULL),(10,2,72,NULL,'Wet-end','Wet End Chemicals','Kg',2.700,80.00,216.00,'','2026-08-11 07:13:43','2026-09-15 11:08:39',13,7,NULL,0.00,NULL,NULL),(11,2,118,NULL,'Wet-end','Wet End Chemicals','Kg',6.100,606.64,3700.50,'','2026-08-11 07:13:43','2026-09-15 11:08:39',19,7,NULL,0.00,NULL,NULL),(12,2,71,NULL,'Wet-end','Wet End Chemicals','Kg',4.000,379.00,1516.00,'','2026-08-11 07:13:43','2026-09-15 11:08:39',6,7,NULL,0.00,NULL,NULL),(13,2,13,NULL,'Wet-end','Wet End Chemicals','Kg',13.500,307.00,4144.50,'','2026-08-11 07:13:43','2026-09-15 11:08:39',6,7,NULL,0.00,NULL,NULL),(14,2,10,NULL,'Wet-end','Wet End Chemicals','Kg',7.000,55.00,385.00,'','2026-08-11 07:13:43','2026-09-15 11:08:39',3,7,NULL,0.00,NULL,NULL),(15,2,14,NULL,'Wet-end','Wet End Chemicals','Kg',3.500,45.00,157.50,'','2026-08-11 07:13:43','2026-09-15 11:08:39',3,7,NULL,0.00,NULL,NULL),(16,2,61,NULL,'Wet-end','Wet End Chemicals','Kg',10.500,187.00,1963.50,'','2026-08-11 07:13:43','2026-09-15 11:08:39',4,7,NULL,0.00,NULL,NULL),(17,2,12,NULL,'Wet-end','Wet End Chemicals','Kg',6.750,121.00,816.75,'','2026-08-11 07:13:43','2026-09-15 11:08:39',6,7,NULL,0.00,NULL,NULL),(18,2,14,NULL,'Wet-end','Wet End Chemicals','Kg',1.750,45.00,78.75,'','2026-08-11 07:13:43','2026-09-15 11:08:39',3,7,NULL,0.00,NULL,NULL),(19,2,41,NULL,'Wet-end','Wet End Chemicals','Kg',18.500,244.00,4514.00,'','2026-08-11 07:13:43','2026-09-15 11:08:39',6,7,NULL,0.00,NULL,NULL),(20,2,7,NULL,'Wet-end','Wet End Chemicals','Kg',18.500,160.00,2960.00,'','2026-08-11 07:13:43','2026-09-15 11:08:39',5,7,NULL,0.00,NULL,NULL),(21,2,9,NULL,'Wet-end','Wet End Chemicals','Kg',20.500,125.00,2562.50,'','2026-08-11 07:13:43','2026-09-15 11:08:39',7,7,NULL,0.00,NULL,NULL),(22,2,22,NULL,'Wet-end','Wet End Chemicals','Kg',7.500,261.00,1957.50,'','2026-08-11 07:13:43','2026-09-15 11:08:39',11,7,NULL,0.00,NULL,NULL),(36,19,34,NULL,'Wet-end','Finishing','Kilogram',0.250,112.00,28.00,'','2026-09-14 11:15:05','2026-09-17 11:08:39',14,7,16,0.00,NULL,NULL),(37,19,122,NULL,'Finishing','Wet End','Kilogram',0.250,150.00,37.50,'','2026-09-14 11:15:05','2026-09-15 11:08:39',6,7,NULL,0.00,NULL,NULL),(38,19,72,NULL,'Wet-end','Wet End','Kilogram',0.300,80.00,24.00,'','2026-09-14 11:15:05','2026-09-15 11:08:39',13,7,NULL,0.00,NULL,NULL),(39,19,37,NULL,'Wet-end','Wet End','Kilogram',0.400,222.00,88.80,'','2026-09-14 11:15:05','2026-09-15 11:08:39',6,7,NULL,0.00,NULL,NULL);
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
  `status` varchar(20) NOT NULL DEFAULT 'Active',
  `effective_from` date DEFAULT NULL,
  `effective_to` date DEFAULT NULL,
  `change_reason` varchar(500) DEFAULT NULL,
  `snapshot` json NOT NULL,
  `created_by` int DEFAULT NULL,
  `released_by` int DEFAULT NULL,
  `released_on` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_bom_version_revision` (`bom_id`,`version_no`,`revision_no`),
  KEY `idx_bom_versions_bom_id` (`bom_id`),
  CONSTRAINT `fk_bom_versions_bom` FOREIGN KEY (`bom_id`) REFERENCES `boms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bom_versions`
--

LOCK TABLES `bom_versions` WRITE;
/*!40000 ALTER TABLE `bom_versions` DISABLE KEYS */;
INSERT INTO `bom_versions` VALUES (1,1,1,1,'Superseded','2026-07-02','2026-07-09','Initial migration snapshot','{\"bom\": {\"id\": 1, \"code\": \"testing\", \"name\": \"test\", \"status\": \"Active\", \"version\": 1}, \"items\": []}',NULL,NULL,'2026-07-03 17:34:10','2026-07-31 11:31:51'),(2,1,1,2,'Superseded','2026-07-02','2026-07-09','Component added','{\"bom\": {\"id\": 1, \"uom\": \"sqft\", \"code\": \"testing\", \"name\": \"test\", \"status\": \"Active\", \"uom_id\": null, \"version\": 1, \"valid_to\": \"2026-07-09T00:00:00.000Z\", \"recipe_id\": null, \"thickness\": \"1.2-1.4\", \"created_at\": \"2026-07-03T17:34:10.000Z\", \"created_by\": null, \"product_id\": null, \"updated_at\": \"2026-07-03T17:34:20.000Z\", \"updated_by\": null, \"valid_from\": \"2026-07-02T00:00:00.000Z\", \"description\": \"test\", \"leather_type\": \"cow\", \"process_type\": \"finishing\", \"thickness_id\": null, \"leather_type_id\": null}, \"items\": [{\"id\": 1, \"qty\": \"4.000\", \"uom\": \"test\", \"type\": \"Auxiliary\", \"amount\": \"16.00\", \"bom_id\": 1, \"remarks\": \"test\", \"unit_cost\": \"4.00\", \"created_at\": \"2026-07-31T11:32:49.000Z\", \"created_by\": 7, \"updated_at\": \"2026-07-31T11:32:49.000Z\", \"updated_by\": null, \"material_id\": 1, \"supplier_id\": 1, \"effective_to\": \"2026-07-09T00:00:00.000Z\", \"scrap_percent\": \"50.00\", \"effective_from\": \"2026-07-02T00:00:00.000Z\"}]}',7,7,'2026-07-31 11:32:49','2026-07-31 11:32:49'),(3,1,1,3,'Superseded','2026-07-02','2026-07-09','Component added','{\"bom\": {\"id\": 1, \"uom\": \"sqft\", \"code\": \"testing\", \"name\": \"test\", \"status\": \"Active\", \"uom_id\": null, \"version\": 1, \"valid_to\": \"2026-07-09T00:00:00.000Z\", \"recipe_id\": null, \"thickness\": \"1.2-1.4\", \"created_at\": \"2026-07-03T17:34:10.000Z\", \"created_by\": null, \"product_id\": null, \"updated_at\": \"2026-07-03T17:34:20.000Z\", \"updated_by\": null, \"valid_from\": \"2026-07-02T00:00:00.000Z\", \"description\": \"test\", \"leather_type\": \"cow\", \"process_type\": \"finishing\", \"thickness_id\": null, \"leather_type_id\": null}, \"items\": [{\"id\": 1, \"qty\": \"4.000\", \"uom\": \"test\", \"type\": \"Auxiliary\", \"amount\": \"16.00\", \"bom_id\": 1, \"remarks\": \"test\", \"unit_cost\": \"4.00\", \"created_at\": \"2026-07-31T11:32:49.000Z\", \"created_by\": 7, \"updated_at\": \"2026-07-31T11:32:49.000Z\", \"updated_by\": null, \"material_id\": 1, \"supplier_id\": 1, \"effective_to\": \"2026-07-09T00:00:00.000Z\", \"scrap_percent\": \"50.00\", \"effective_from\": \"2026-07-02T00:00:00.000Z\"}, {\"id\": 2, \"qty\": \"5.000\", \"uom\": \"3\", \"type\": \"Chemical\", \"amount\": \"35.00\", \"bom_id\": 1, \"remarks\": \"\", \"unit_cost\": \"7.00\", \"created_at\": \"2026-07-31T11:39:13.000Z\", \"created_by\": 7, \"updated_at\": \"2026-07-31T11:39:13.000Z\", \"updated_by\": null, \"material_id\": 2, \"supplier_id\": 1, \"effective_to\": \"2026-07-09T00:00:00.000Z\", \"scrap_percent\": \"3.00\", \"effective_from\": \"2026-07-02T00:00:00.000Z\"}]}',7,7,'2026-07-31 11:39:13','2026-07-31 11:39:13'),(4,1,1,4,'Superseded','2026-07-02','2026-07-09','Component removed','{\"bom\": {\"id\": 1, \"uom\": \"sqft\", \"code\": \"testing\", \"name\": \"test\", \"status\": \"Active\", \"uom_id\": null, \"version\": 1, \"valid_to\": \"2026-07-09T00:00:00.000Z\", \"recipe_id\": null, \"thickness\": \"1.2-1.4\", \"created_at\": \"2026-07-03T17:34:10.000Z\", \"created_by\": null, \"product_id\": null, \"updated_at\": \"2026-07-03T17:34:20.000Z\", \"updated_by\": null, \"valid_from\": \"2026-07-02T00:00:00.000Z\", \"description\": \"test\", \"leather_type\": \"cow\", \"process_type\": \"finishing\", \"thickness_id\": null, \"leather_type_id\": null}, \"items\": [{\"id\": 1, \"qty\": \"4.000\", \"uom\": \"test\", \"type\": \"Auxiliary\", \"amount\": \"16.00\", \"bom_id\": 1, \"remarks\": \"test\", \"unit_cost\": \"4.00\", \"created_at\": \"2026-07-31T11:32:49.000Z\", \"created_by\": 7, \"updated_at\": \"2026-07-31T11:32:49.000Z\", \"updated_by\": null, \"material_id\": 1, \"supplier_id\": 1, \"effective_to\": \"2026-07-09T00:00:00.000Z\", \"scrap_percent\": \"50.00\", \"effective_from\": \"2026-07-02T00:00:00.000Z\"}]}',NULL,NULL,'2026-07-31 11:39:16','2026-07-31 11:39:16'),(5,1,1,5,'Superseded','2026-07-02','2026-07-09','Component updated','{\"bom\": {\"id\": 1, \"uom\": \"sqft\", \"code\": \"testing\", \"name\": \"test\", \"status\": \"Active\", \"uom_id\": null, \"version\": 1, \"valid_to\": \"2026-07-09T00:00:00.000Z\", \"recipe_id\": null, \"thickness\": \"1.2-1.4\", \"created_at\": \"2026-07-03T17:34:10.000Z\", \"created_by\": null, \"product_id\": null, \"updated_at\": \"2026-07-03T17:34:20.000Z\", \"updated_by\": null, \"valid_from\": \"2026-07-02T00:00:00.000Z\", \"description\": \"test\", \"leather_type\": \"cow\", \"process_type\": \"finishing\", \"thickness_id\": null, \"leather_type_id\": null}, \"items\": [{\"id\": 1, \"qty\": \"4.000\", \"uom\": \"test\", \"type\": \"Auxiliary\", \"amount\": \"16.00\", \"bom_id\": 1, \"remarks\": \"testing\", \"unit_cost\": \"4.00\", \"created_at\": \"2026-07-31T11:32:49.000Z\", \"created_by\": 7, \"updated_at\": \"2026-07-31T11:39:25.000Z\", \"updated_by\": 7, \"material_id\": 1, \"supplier_id\": 1, \"effective_to\": \"2026-07-09T00:00:00.000Z\", \"scrap_percent\": \"50.00\", \"effective_from\": \"2026-07-02T00:00:00.000Z\"}]}',7,7,'2026-07-31 11:39:25','2026-07-31 11:39:25'),(6,1,1,6,'Superseded','2026-07-02','2026-07-09','Component updated','{\"bom\": {\"id\": 1, \"uom\": \"sqft\", \"code\": \"testing\", \"name\": \"test\", \"status\": \"Active\", \"uom_id\": null, \"version\": 1, \"valid_to\": \"2026-07-09T00:00:00.000Z\", \"recipe_id\": null, \"thickness\": \"1.2-1.4\", \"created_at\": \"2026-07-03T17:34:10.000Z\", \"created_by\": null, \"product_id\": null, \"updated_at\": \"2026-07-03T17:34:20.000Z\", \"updated_by\": null, \"valid_from\": \"2026-07-02T00:00:00.000Z\", \"description\": \"test\", \"leather_type\": \"cow\", \"process_type\": \"finishing\", \"thickness_id\": null, \"leather_type_id\": null}, \"items\": [{\"id\": 1, \"qty\": \"4.000\", \"uom\": \"Kg\", \"type\": \"Manual\", \"amount\": \"16.00\", \"bom_id\": 1, \"remarks\": \"testing\", \"unit_cost\": \"4.00\", \"created_at\": \"2026-07-31T11:32:49.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-06T12:47:30.000Z\", \"updated_by\": 7, \"material_id\": 1, \"supplier_id\": 1, \"effective_to\": \"2026-07-09T00:00:00.000Z\", \"scrap_percent\": \"0.00\", \"effective_from\": \"2026-07-02T00:00:00.000Z\"}]}',7,7,'2026-08-06 12:47:30','2026-08-06 12:47:30'),(7,1,1,7,'Active','2026-07-02','2026-07-09','Component added','{\"bom\": {\"id\": 1, \"uom\": \"sqft\", \"code\": \"testing\", \"name\": \"test\", \"status\": \"Active\", \"uom_id\": null, \"version\": 1, \"valid_to\": \"2026-07-09T00:00:00.000Z\", \"recipe_id\": null, \"thickness\": \"1.2-1.4\", \"created_at\": \"2026-07-03T17:34:10.000Z\", \"created_by\": null, \"product_id\": null, \"updated_at\": \"2026-07-03T17:34:20.000Z\", \"updated_by\": null, \"valid_from\": \"2026-07-02T00:00:00.000Z\", \"description\": \"test\", \"leather_type\": \"cow\", \"process_type\": \"finishing\", \"thickness_id\": null, \"leather_type_id\": null}, \"items\": [{\"id\": 1, \"qty\": \"4.000\", \"uom\": \"Kg\", \"type\": \"Manual\", \"amount\": \"16.00\", \"bom_id\": 1, \"remarks\": \"testing\", \"unit_cost\": \"4.00\", \"created_at\": \"2026-07-31T11:32:49.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-06T12:47:30.000Z\", \"updated_by\": 7, \"material_id\": 1, \"supplier_id\": 1, \"effective_to\": \"2026-07-09T00:00:00.000Z\", \"scrap_percent\": \"0.00\", \"effective_from\": \"2026-07-02T00:00:00.000Z\"}, {\"id\": 6, \"qty\": \"6.000\", \"uom\": \"Kg\", \"type\": \"Wet End\", \"amount\": \"27.00\", \"bom_id\": 1, \"remarks\": \"testing\", \"unit_cost\": \"4.50\", \"created_at\": \"2026-08-06T12:47:43.000Z\", \"created_by\": 7, \"machine_id\": 56, \"updated_at\": \"2026-08-06T12:47:43.000Z\", \"updated_by\": null, \"material_id\": null, \"supplier_id\": 1, \"effective_to\": \"2026-07-09T00:00:00.000Z\", \"scrap_percent\": \"0.00\", \"effective_from\": \"2026-07-02T00:00:00.000Z\"}]}',7,7,'2026-08-06 12:47:43','2026-08-06 12:47:43'),(8,2,1,1,'Superseded','2026-08-11','2026-08-31','Initial BOM created','{\"bom\": {\"id\": 2, \"uom\": \"\", \"code\": \"CRO0001\", \"name\": \"Crust Marina-V1\", \"status\": \"Active\", \"uom_id\": 1, \"version\": 1, \"valid_to\": \"2026-08-31T00:00:00.000Z\", \"recipe_id\": null, \"thickness\": \"\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"product_id\": 5, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"valid_from\": \"2026-08-11T00:00:00.000Z\", \"customer_id\": 7, \"description\": \"\", \"leather_type\": \"cow\", \"process_type\": \"Wet End Chemicals\", \"thickness_id\": 3, \"leather_type_id\": 4}, \"items\": []}',7,7,'2026-08-11 07:13:43','2026-08-11 07:13:43'),(9,2,1,2,'Superseded','2026-08-11','2026-08-31','Component added','{\"bom\": {\"id\": 2, \"uom\": \"\", \"code\": \"CRO0001\", \"name\": \"Crust Marina-V1\", \"status\": \"Active\", \"uom_id\": 1, \"version\": 1, \"valid_to\": \"2026-08-31T00:00:00.000Z\", \"recipe_id\": null, \"thickness\": \"\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"product_id\": 5, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"valid_from\": \"2026-08-11T00:00:00.000Z\", \"customer_id\": 7, \"description\": \"\", \"leather_type\": \"cow\", \"process_type\": \"Wet End Chemicals\", \"thickness_id\": 3, \"leather_type_id\": 4}, \"items\": [{\"id\": 7, \"qty\": \"3.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"934.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"267.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 35, \"supplier_id\": 4, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}]}',7,7,'2026-08-11 07:13:43','2026-08-11 07:13:43'),(10,2,1,3,'Superseded','2026-08-11','2026-08-31','Component added','{\"bom\": {\"id\": 2, \"uom\": \"\", \"code\": \"CRO0001\", \"name\": \"Crust Marina-V1\", \"status\": \"Active\", \"uom_id\": 1, \"version\": 1, \"valid_to\": \"2026-08-31T00:00:00.000Z\", \"recipe_id\": null, \"thickness\": \"\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"product_id\": 5, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"valid_from\": \"2026-08-11T00:00:00.000Z\", \"customer_id\": 7, \"description\": \"\", \"leather_type\": \"cow\", \"process_type\": \"Wet End Chemicals\", \"thickness_id\": 3, \"leather_type_id\": 4}, \"items\": [{\"id\": 7, \"qty\": \"3.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"934.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"267.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 35, \"supplier_id\": 4, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 8, \"qty\": \"5.000\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"1530.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"306.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 59, \"supplier_id\": 4, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}]}',7,7,'2026-08-11 07:13:43','2026-08-11 07:13:43'),(12,2,1,4,'Superseded','2026-08-11','2026-08-31','Component added','{\"bom\": {\"id\": 2, \"uom\": \"\", \"code\": \"CRO0001\", \"name\": \"Crust Marina-V1\", \"status\": \"Active\", \"uom_id\": 1, \"version\": 1, \"valid_to\": \"2026-08-31T00:00:00.000Z\", \"recipe_id\": null, \"thickness\": \"\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"product_id\": 5, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"valid_from\": \"2026-08-11T00:00:00.000Z\", \"customer_id\": 7, \"description\": \"\", \"leather_type\": \"cow\", \"process_type\": \"Wet End Chemicals\", \"thickness_id\": 3, \"leather_type_id\": 4}, \"items\": [{\"id\": 7, \"qty\": \"3.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"934.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"267.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 35, \"supplier_id\": 4, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 8, \"qty\": \"5.000\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"1530.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"306.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 59, \"supplier_id\": 4, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 9, \"qty\": \"3.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"490.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"140.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 36, \"supplier_id\": 15, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 10, \"qty\": \"2.700\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"216.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"80.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 72, \"supplier_id\": 13, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 11, \"qty\": \"6.100\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"3700.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"606.64\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 118, \"supplier_id\": 19, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}]}',7,7,'2026-08-11 07:13:43','2026-08-11 07:13:43'),(16,2,1,5,'Superseded','2026-08-11','2026-08-31','Component added','{\"bom\": {\"id\": 2, \"uom\": \"\", \"code\": \"CRO0001\", \"name\": \"Crust Marina-V1\", \"status\": \"Active\", \"uom_id\": 1, \"version\": 1, \"valid_to\": \"2026-08-31T00:00:00.000Z\", \"recipe_id\": null, \"thickness\": \"\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"product_id\": 5, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"valid_from\": \"2026-08-11T00:00:00.000Z\", \"customer_id\": 7, \"description\": \"\", \"leather_type\": \"cow\", \"process_type\": \"Wet End Chemicals\", \"thickness_id\": 3, \"leather_type_id\": 4}, \"items\": [{\"id\": 7, \"qty\": \"3.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"934.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"267.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 35, \"supplier_id\": 4, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 8, \"qty\": \"5.000\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"1530.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"306.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 59, \"supplier_id\": 4, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 9, \"qty\": \"3.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"490.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"140.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 36, \"supplier_id\": 15, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 10, \"qty\": \"2.700\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"216.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"80.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 72, \"supplier_id\": 13, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 11, \"qty\": \"6.100\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"3700.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"606.64\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 118, \"supplier_id\": 19, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 12, \"qty\": \"4.000\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"1516.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"379.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 71, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 13, \"qty\": \"13.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"4144.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"307.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 13, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 14, \"qty\": \"7.000\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"385.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"55.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 10, \"supplier_id\": 3, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}]}',7,7,'2026-08-11 07:13:43','2026-08-11 07:13:43'),(18,2,1,6,'Superseded','2026-08-11','2026-08-31','Component added','{\"bom\": {\"id\": 2, \"uom\": \"\", \"code\": \"CRO0001\", \"name\": \"Crust Marina-V1\", \"status\": \"Active\", \"uom_id\": 1, \"version\": 1, \"valid_to\": \"2026-08-31T00:00:00.000Z\", \"recipe_id\": null, \"thickness\": \"\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"product_id\": 5, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"valid_from\": \"2026-08-11T00:00:00.000Z\", \"customer_id\": 7, \"description\": \"\", \"leather_type\": \"cow\", \"process_type\": \"Wet End Chemicals\", \"thickness_id\": 3, \"leather_type_id\": 4}, \"items\": [{\"id\": 7, \"qty\": \"3.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"934.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"267.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 35, \"supplier_id\": 4, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 8, \"qty\": \"5.000\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"1530.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"306.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 59, \"supplier_id\": 4, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 9, \"qty\": \"3.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"490.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"140.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 36, \"supplier_id\": 15, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 10, \"qty\": \"2.700\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"216.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"80.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 72, \"supplier_id\": 13, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 11, \"qty\": \"6.100\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"3700.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"606.64\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 118, \"supplier_id\": 19, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 12, \"qty\": \"4.000\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"1516.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"379.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 71, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 13, \"qty\": \"13.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"4144.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"307.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 13, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 14, \"qty\": \"7.000\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"385.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"55.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 10, \"supplier_id\": 3, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 15, \"qty\": \"3.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"157.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"45.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 14, \"supplier_id\": 3, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 16, \"qty\": \"10.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"1963.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"187.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 61, \"supplier_id\": 4, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}]}',7,7,'2026-08-11 07:13:43','2026-08-11 07:13:43'),(20,2,1,7,'Superseded','2026-08-11','2026-08-31','Component added','{\"bom\": {\"id\": 2, \"uom\": \"\", \"code\": \"CRO0001\", \"name\": \"Crust Marina-V1\", \"status\": \"Active\", \"uom_id\": 1, \"version\": 1, \"valid_to\": \"2026-08-31T00:00:00.000Z\", \"recipe_id\": null, \"thickness\": \"\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"product_id\": 5, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"valid_from\": \"2026-08-11T00:00:00.000Z\", \"customer_id\": 7, \"description\": \"\", \"leather_type\": \"cow\", \"process_type\": \"Wet End Chemicals\", \"thickness_id\": 3, \"leather_type_id\": 4}, \"items\": [{\"id\": 7, \"qty\": \"3.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"934.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"267.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 35, \"supplier_id\": 4, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 8, \"qty\": \"5.000\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"1530.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"306.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 59, \"supplier_id\": 4, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 9, \"qty\": \"3.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"490.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"140.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 36, \"supplier_id\": 15, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 10, \"qty\": \"2.700\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"216.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"80.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 72, \"supplier_id\": 13, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 11, \"qty\": \"6.100\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"3700.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"606.64\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 118, \"supplier_id\": 19, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 12, \"qty\": \"4.000\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"1516.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"379.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 71, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 13, \"qty\": \"13.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"4144.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"307.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 13, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 14, \"qty\": \"7.000\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"385.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"55.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 10, \"supplier_id\": 3, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 15, \"qty\": \"3.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"157.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"45.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 14, \"supplier_id\": 3, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 16, \"qty\": \"10.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"1963.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"187.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 61, \"supplier_id\": 4, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 17, \"qty\": \"6.750\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"816.75\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"121.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 12, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 18, \"qty\": \"1.750\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"78.75\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"45.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 14, \"supplier_id\": 3, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 19, \"qty\": \"18.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"4514.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"244.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 41, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}]}',7,7,'2026-08-11 07:13:43','2026-08-11 07:13:43'),(23,2,1,8,'Superseded','2026-08-11','2026-08-31','Component added','{\"bom\": {\"id\": 2, \"uom\": \"\", \"code\": \"CRO0001\", \"name\": \"Crust Marina-V1\", \"status\": \"Active\", \"uom_id\": 1, \"version\": 1, \"valid_to\": \"2026-08-31T00:00:00.000Z\", \"recipe_id\": null, \"thickness\": \"\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"product_id\": 5, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"valid_from\": \"2026-08-11T00:00:00.000Z\", \"customer_id\": 7, \"description\": \"\", \"leather_type\": \"cow\", \"process_type\": \"Wet End Chemicals\", \"thickness_id\": 3, \"leather_type_id\": 4}, \"items\": [{\"id\": 7, \"qty\": \"3.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"934.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"267.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 35, \"supplier_id\": 4, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 8, \"qty\": \"5.000\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"1530.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"306.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 59, \"supplier_id\": 4, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 9, \"qty\": \"3.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"490.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"140.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 36, \"supplier_id\": 15, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 10, \"qty\": \"2.700\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"216.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"80.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 72, \"supplier_id\": 13, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 11, \"qty\": \"6.100\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"3700.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"606.64\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 118, \"supplier_id\": 19, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 12, \"qty\": \"4.000\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"1516.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"379.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 71, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 13, \"qty\": \"13.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"4144.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"307.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 13, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 14, \"qty\": \"7.000\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"385.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"55.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 10, \"supplier_id\": 3, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 15, \"qty\": \"3.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"157.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"45.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 14, \"supplier_id\": 3, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 16, \"qty\": \"10.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"1963.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"187.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 61, \"supplier_id\": 4, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 17, \"qty\": \"6.750\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"816.75\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"121.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 12, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 18, \"qty\": \"1.750\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"78.75\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"45.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 14, \"supplier_id\": 3, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 19, \"qty\": \"18.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"4514.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"244.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 41, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 20, \"qty\": \"18.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"2960.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"160.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 7, \"supplier_id\": 5, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 21, \"qty\": \"20.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"2562.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"125.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 9, \"supplier_id\": 7, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}]}',7,7,'2026-08-11 07:13:43','2026-08-11 07:13:43'),(25,2,1,9,'Superseded','2026-08-11','2026-08-31',NULL,'{\"bom\": {\"id\": 2, \"uom\": \"\", \"code\": \"CRO0001\", \"name\": \"Crust Marina-V1\", \"status\": \"Active\", \"uom_id\": 1, \"version\": 2, \"valid_to\": \"2026-08-31T00:00:00.000Z\", \"recipe_id\": null, \"thickness\": \"\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"product_id\": 5, \"updated_at\": \"2026-08-11T07:17:21.000Z\", \"updated_by\": 7, \"valid_from\": \"2026-08-11T00:00:00.000Z\", \"customer_id\": 7, \"description\": \"\", \"leather_type\": \"cow\", \"process_type\": \"Wet End Chemicals\", \"thickness_id\": 3, \"leather_type_id\": 4}, \"items\": [{\"id\": 7, \"qty\": \"3.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"934.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"267.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 35, \"supplier_id\": 4, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 8, \"qty\": \"5.000\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"1530.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"306.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 59, \"supplier_id\": 4, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 9, \"qty\": \"3.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"490.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"140.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 36, \"supplier_id\": 15, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 10, \"qty\": \"2.700\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"216.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"80.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 72, \"supplier_id\": 13, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 11, \"qty\": \"6.100\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"3700.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"606.64\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 118, \"supplier_id\": 19, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 12, \"qty\": \"4.000\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"1516.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"379.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 71, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 13, \"qty\": \"13.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"4144.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"307.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 13, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 14, \"qty\": \"7.000\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"385.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"55.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 10, \"supplier_id\": 3, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 15, \"qty\": \"3.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"157.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"45.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 14, \"supplier_id\": 3, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 16, \"qty\": \"10.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"1963.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"187.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 61, \"supplier_id\": 4, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 17, \"qty\": \"6.750\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"816.75\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"121.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 12, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 18, \"qty\": \"1.750\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"78.75\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"45.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 14, \"supplier_id\": 3, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 19, \"qty\": \"18.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"4514.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"244.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 41, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 20, \"qty\": \"18.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"2960.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"160.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 7, \"supplier_id\": 5, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 21, \"qty\": \"20.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"2562.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"125.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 9, \"supplier_id\": 7, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 22, \"qty\": \"7.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"1957.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"261.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 22, \"supplier_id\": 11, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}]}',7,7,'2026-08-11 07:17:21','2026-08-11 07:17:21'),(26,2,1,10,'Superseded','2026-08-11','2026-08-31','Component added','{\"bom\": {\"id\": 2, \"uom\": \"\", \"code\": \"CRO0001\", \"name\": \"Crust Marina-V1\", \"status\": \"Active\", \"uom_id\": 1, \"version\": 2, \"valid_to\": \"2026-08-31T00:00:00.000Z\", \"recipe_id\": null, \"thickness\": \"\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"product_id\": 5, \"updated_at\": \"2026-08-11T07:17:21.000Z\", \"updated_by\": 7, \"valid_from\": \"2026-08-11T00:00:00.000Z\", \"customer_id\": 7, \"description\": \"\", \"leather_type\": \"cow\", \"process_type\": \"Wet End Chemicals\", \"thickness_id\": 3, \"leather_type_id\": 4}, \"items\": [{\"id\": 7, \"qty\": \"3.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"934.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"267.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 35, \"supplier_id\": 4, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 8, \"qty\": \"5.000\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"1530.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"306.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 59, \"supplier_id\": 4, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 9, \"qty\": \"3.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"490.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"140.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 36, \"supplier_id\": 15, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 10, \"qty\": \"2.700\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"216.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"80.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 72, \"supplier_id\": 13, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 11, \"qty\": \"6.100\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"3700.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"606.64\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 118, \"supplier_id\": 19, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 12, \"qty\": \"4.000\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"1516.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"379.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 71, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 13, \"qty\": \"13.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"4144.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"307.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 13, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 14, \"qty\": \"7.000\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"385.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"55.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 10, \"supplier_id\": 3, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 15, \"qty\": \"3.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"157.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"45.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 14, \"supplier_id\": 3, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 16, \"qty\": \"10.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"1963.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"187.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 61, \"supplier_id\": 4, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 17, \"qty\": \"6.750\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"816.75\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"121.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 12, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 18, \"qty\": \"1.750\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"78.75\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"45.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 14, \"supplier_id\": 3, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 19, \"qty\": \"18.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"4514.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"244.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 41, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 20, \"qty\": \"18.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"2960.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"160.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 7, \"supplier_id\": 5, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 21, \"qty\": \"20.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"2562.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"125.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 9, \"supplier_id\": 7, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 22, \"qty\": \"7.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"1957.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"261.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 22, \"supplier_id\": 11, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 23, \"qty\": \"6.000\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"3756.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"626.00\", \"created_at\": \"2026-08-11T07:21:21.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:21:21.000Z\", \"updated_by\": null, \"material_id\": 86, \"supplier_id\": 20, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}]}',7,7,'2026-08-11 07:21:21','2026-08-11 07:21:21'),(27,2,1,11,'Superseded','2026-08-11','2026-08-31',NULL,'{\"bom\": {\"id\": 2, \"uom\": \"\", \"code\": \"CRO0001\", \"name\": \"Crust Marina-V1\", \"status\": \"Active\", \"uom_id\": 1, \"version\": 3, \"valid_to\": \"2026-08-31T00:00:00.000Z\", \"recipe_id\": null, \"thickness\": \"\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"product_id\": 5, \"updated_at\": \"2026-08-11T07:21:21.000Z\", \"updated_by\": 7, \"valid_from\": \"2026-08-11T00:00:00.000Z\", \"customer_id\": 7, \"description\": \"\", \"leather_type\": \"cow\", \"process_type\": \"Wet End Chemicals\", \"thickness_id\": 3, \"leather_type_id\": 4}, \"items\": [{\"id\": 7, \"qty\": \"3.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"934.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"267.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 35, \"supplier_id\": 4, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 8, \"qty\": \"5.000\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"1530.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"306.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 59, \"supplier_id\": 4, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 9, \"qty\": \"3.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"490.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"140.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 36, \"supplier_id\": 15, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 10, \"qty\": \"2.700\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"216.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"80.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 72, \"supplier_id\": 13, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 11, \"qty\": \"6.100\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"3700.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"606.64\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 118, \"supplier_id\": 19, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 12, \"qty\": \"4.000\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"1516.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"379.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 71, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 13, \"qty\": \"13.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"4144.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"307.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 13, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 14, \"qty\": \"7.000\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"385.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"55.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 10, \"supplier_id\": 3, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 15, \"qty\": \"3.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"157.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"45.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 14, \"supplier_id\": 3, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 16, \"qty\": \"10.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"1963.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"187.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 61, \"supplier_id\": 4, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 17, \"qty\": \"6.750\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"816.75\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"121.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 12, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 18, \"qty\": \"1.750\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"78.75\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"45.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 14, \"supplier_id\": 3, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 19, \"qty\": \"18.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"4514.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"244.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 41, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 20, \"qty\": \"18.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"2960.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"160.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 7, \"supplier_id\": 5, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 21, \"qty\": \"20.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"2562.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"125.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 9, \"supplier_id\": 7, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 22, \"qty\": \"7.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"1957.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"261.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 22, \"supplier_id\": 11, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 23, \"qty\": \"6.000\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"3756.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"626.00\", \"created_at\": \"2026-08-11T07:21:21.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:21:21.000Z\", \"updated_by\": null, \"material_id\": 86, \"supplier_id\": 20, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}]}',7,7,'2026-08-11 07:21:21','2026-08-11 07:21:21'),(28,2,1,12,'Superseded','2026-08-11','2026-08-31','Component removed','{\"bom\": {\"id\": 2, \"uom\": \"\", \"code\": \"CRO0001\", \"name\": \"Crust Marina-V1\", \"status\": \"Active\", \"uom_id\": 1, \"version\": 3, \"valid_to\": \"2026-08-31T00:00:00.000Z\", \"recipe_id\": null, \"thickness\": \"\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"product_id\": 5, \"updated_at\": \"2026-08-11T07:21:21.000Z\", \"updated_by\": 7, \"valid_from\": \"2026-08-11T00:00:00.000Z\", \"customer_id\": 7, \"description\": \"\", \"leather_type\": \"cow\", \"process_type\": \"Wet End Chemicals\", \"thickness_id\": 3, \"leather_type_id\": 4}, \"items\": [{\"id\": 7, \"qty\": \"3.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"934.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"267.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 35, \"supplier_id\": 4, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 8, \"qty\": \"5.000\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"1530.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"306.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 59, \"supplier_id\": 4, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 9, \"qty\": \"3.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"490.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"140.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 36, \"supplier_id\": 15, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 10, \"qty\": \"2.700\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"216.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"80.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 72, \"supplier_id\": 13, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 11, \"qty\": \"6.100\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"3700.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"606.64\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 118, \"supplier_id\": 19, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 12, \"qty\": \"4.000\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"1516.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"379.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 71, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 13, \"qty\": \"13.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"4144.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"307.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 13, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 14, \"qty\": \"7.000\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"385.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"55.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 10, \"supplier_id\": 3, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 15, \"qty\": \"3.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"157.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"45.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 14, \"supplier_id\": 3, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 16, \"qty\": \"10.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"1963.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"187.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 61, \"supplier_id\": 4, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 17, \"qty\": \"6.750\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"816.75\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"121.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 12, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 18, \"qty\": \"1.750\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"78.75\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"45.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 14, \"supplier_id\": 3, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 19, \"qty\": \"18.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"4514.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"244.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 41, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 20, \"qty\": \"18.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"2960.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"160.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 7, \"supplier_id\": 5, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 21, \"qty\": \"20.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"2562.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"125.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 9, \"supplier_id\": 7, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 22, \"qty\": \"7.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"1957.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"261.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 22, \"supplier_id\": 11, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}]}',NULL,NULL,'2026-08-11 07:21:29','2026-08-11 07:21:29'),(29,2,1,13,'Superseded','2026-08-11','2026-08-31',NULL,'{\"bom\": {\"id\": 2, \"uom\": \"\", \"code\": \"CRO0001\", \"name\": \"Crust Marina-V1\", \"status\": \"Active\", \"uom_id\": 1, \"version\": 4, \"valid_to\": \"2026-08-31T00:00:00.000Z\", \"recipe_id\": null, \"thickness\": \"\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"product_id\": 5, \"updated_at\": \"2026-08-11T07:21:32.000Z\", \"updated_by\": 7, \"valid_from\": \"2026-08-11T00:00:00.000Z\", \"customer_id\": 7, \"description\": \"\", \"leather_type\": \"cow\", \"process_type\": \"Wet End Chemicals\", \"thickness_id\": 3, \"leather_type_id\": 4}, \"items\": [{\"id\": 7, \"qty\": \"3.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"934.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"267.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 35, \"supplier_id\": 4, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 8, \"qty\": \"5.000\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"1530.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"306.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 59, \"supplier_id\": 4, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 9, \"qty\": \"3.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"490.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"140.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 36, \"supplier_id\": 15, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 10, \"qty\": \"2.700\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"216.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"80.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 72, \"supplier_id\": 13, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 11, \"qty\": \"6.100\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"3700.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"606.64\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 118, \"supplier_id\": 19, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 12, \"qty\": \"4.000\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"1516.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"379.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 71, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 13, \"qty\": \"13.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"4144.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"307.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 13, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 14, \"qty\": \"7.000\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"385.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"55.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 10, \"supplier_id\": 3, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 15, \"qty\": \"3.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"157.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"45.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 14, \"supplier_id\": 3, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 16, \"qty\": \"10.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"1963.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"187.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 61, \"supplier_id\": 4, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 17, \"qty\": \"6.750\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"816.75\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"121.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 12, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 18, \"qty\": \"1.750\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"78.75\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"45.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 14, \"supplier_id\": 3, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 19, \"qty\": \"18.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"4514.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"244.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 41, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 20, \"qty\": \"18.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"2960.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"160.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 7, \"supplier_id\": 5, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 21, \"qty\": \"20.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"2562.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"125.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 9, \"supplier_id\": 7, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 22, \"qty\": \"7.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"1957.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"261.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 22, \"supplier_id\": 11, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}]}',7,7,'2026-08-11 07:21:32','2026-08-11 07:21:32'),(30,2,1,14,'Active','2026-08-11','2026-08-31',NULL,'{\"bom\": {\"id\": 2, \"uom\": \"\", \"code\": \"CRO082601\", \"name\": \"Crust Marina-V1\", \"status\": \"Active\", \"uom_id\": 1, \"version\": 5, \"valid_to\": \"2026-08-31T00:00:00.000Z\", \"recipe_id\": null, \"thickness\": \"\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"product_id\": 5, \"updated_at\": \"2026-08-11T07:41:20.000Z\", \"updated_by\": 7, \"valid_from\": \"2026-08-11T00:00:00.000Z\", \"customer_id\": 7, \"description\": \"\", \"leather_type\": \"cow\", \"process_type\": \"Wet End Chemicals\", \"thickness_id\": 3, \"leather_type_id\": 4}, \"items\": [{\"id\": 7, \"qty\": \"3.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"934.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"267.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 35, \"supplier_id\": 4, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 8, \"qty\": \"5.000\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"1530.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"306.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 59, \"supplier_id\": 4, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 9, \"qty\": \"3.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"490.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"140.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 36, \"supplier_id\": 15, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 10, \"qty\": \"2.700\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"216.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"80.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 72, \"supplier_id\": 13, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 11, \"qty\": \"6.100\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"3700.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"606.64\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 118, \"supplier_id\": 19, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 12, \"qty\": \"4.000\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"1516.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"379.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 71, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 13, \"qty\": \"13.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"4144.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"307.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 13, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 14, \"qty\": \"7.000\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"385.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"55.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 10, \"supplier_id\": 3, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 15, \"qty\": \"3.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"157.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"45.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 14, \"supplier_id\": 3, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 16, \"qty\": \"10.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"1963.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"187.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 61, \"supplier_id\": 4, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 17, \"qty\": \"6.750\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"816.75\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"121.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 12, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 18, \"qty\": \"1.750\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"78.75\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"45.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 14, \"supplier_id\": 3, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 19, \"qty\": \"18.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"4514.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"244.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 41, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 20, \"qty\": \"18.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"2960.00\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"160.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 7, \"supplier_id\": 5, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 21, \"qty\": \"20.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"2562.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"125.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 9, \"supplier_id\": 7, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 22, \"qty\": \"7.500\", \"uom\": \"Kg\", \"type\": \"Wet-end\", \"amount\": \"1957.50\", \"bom_id\": 2, \"remarks\": \"\", \"unit_cost\": \"261.00\", \"created_at\": \"2026-08-11T07:13:43.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-08-11T07:13:43.000Z\", \"updated_by\": null, \"material_id\": 22, \"supplier_id\": 11, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}]}',7,7,'2026-08-11 07:41:20','2026-08-11 07:41:20'),(46,19,1,1,'Superseded','2026-09-14','2026-10-14','Initial BOM created','{\"bom\": {\"id\": 19, \"uom\": \"Square Feet\", \"code\": \"CRO092604\", \"name\": \"Sheep  Softy Black-V1\", \"status\": \"Active\", \"uom_id\": 1, \"version\": 1, \"valid_to\": \"2026-10-14T00:00:00.000Z\", \"recipe_id\": null, \"thickness\": \"\", \"created_at\": \"2026-09-14T11:15:05.000Z\", \"created_by\": 7, \"product_id\": 6, \"updated_at\": \"2026-09-14T11:15:05.000Z\", \"updated_by\": null, \"valid_from\": \"2026-09-14T00:00:00.000Z\", \"customer_id\": 7, \"description\": \"\", \"leather_type\": \"cow\", \"process_type\": \"Wet End\", \"thickness_id\": 1, \"leather_type_id\": 4}, \"items\": []}',7,7,'2026-09-14 11:15:05','2026-09-14 11:15:05'),(47,19,1,2,'Superseded','2026-09-14','2026-10-14','Component added','{\"bom\": {\"id\": 19, \"uom\": \"Square Feet\", \"code\": \"CRO092604\", \"name\": \"Sheep  Softy Black-V1\", \"status\": \"Active\", \"uom_id\": 1, \"version\": 1, \"valid_to\": \"2026-10-14T00:00:00.000Z\", \"recipe_id\": null, \"thickness\": \"\", \"created_at\": \"2026-09-14T11:15:05.000Z\", \"created_by\": 7, \"product_id\": 6, \"updated_at\": \"2026-09-14T11:15:05.000Z\", \"updated_by\": null, \"valid_from\": \"2026-09-14T00:00:00.000Z\", \"customer_id\": 7, \"description\": \"\", \"leather_type\": \"cow\", \"process_type\": \"Wet End\", \"thickness_id\": 1, \"leather_type_id\": 4}, \"items\": [{\"id\": 36, \"qty\": \"0.250\", \"uom\": \"Kilogram\", \"type\": \"Wet-end\", \"amount\": \"28.00\", \"bom_id\": 19, \"remarks\": \"\", \"unit_cost\": \"112.00\", \"created_at\": \"2026-09-14T11:15:05.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-09-14T11:15:05.000Z\", \"updated_by\": null, \"material_id\": 34, \"supplier_id\": 14, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}]}',7,7,'2026-09-14 11:15:05','2026-09-14 11:15:05'),(48,19,1,3,'Superseded','2026-09-14','2026-10-14','Component added','{\"bom\": {\"id\": 19, \"uom\": \"Square Feet\", \"code\": \"CRO092604\", \"name\": \"Sheep  Softy Black-V1\", \"status\": \"Active\", \"uom_id\": 1, \"version\": 1, \"valid_to\": \"2026-10-14T00:00:00.000Z\", \"recipe_id\": null, \"thickness\": \"\", \"created_at\": \"2026-09-14T11:15:05.000Z\", \"created_by\": 7, \"product_id\": 6, \"updated_at\": \"2026-09-14T11:15:05.000Z\", \"updated_by\": null, \"valid_from\": \"2026-09-14T00:00:00.000Z\", \"customer_id\": 7, \"description\": \"\", \"leather_type\": \"cow\", \"process_type\": \"Wet End\", \"thickness_id\": 1, \"leather_type_id\": 4}, \"items\": [{\"id\": 36, \"qty\": \"0.250\", \"uom\": \"Kilogram\", \"type\": \"Wet-end\", \"amount\": \"28.00\", \"bom_id\": 19, \"remarks\": \"\", \"unit_cost\": \"112.00\", \"created_at\": \"2026-09-14T11:15:05.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-09-14T11:15:05.000Z\", \"updated_by\": null, \"material_id\": 34, \"supplier_id\": 14, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 37, \"qty\": \"0.250\", \"uom\": \"Kilogram\", \"type\": \"Finishing\", \"amount\": \"37.50\", \"bom_id\": 19, \"remarks\": \"\", \"unit_cost\": \"150.00\", \"created_at\": \"2026-09-14T11:15:05.000Z\", \"created_by\": 7, \"machine_id\": 122, \"updated_at\": \"2026-09-14T11:15:05.000Z\", \"updated_by\": null, \"material_id\": null, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}]}',7,7,'2026-09-14 11:15:05','2026-09-14 11:15:05'),(49,19,1,4,'Superseded','2026-09-14','2026-10-14','Component added','{\"bom\": {\"id\": 19, \"uom\": \"Square Feet\", \"code\": \"CRO092604\", \"name\": \"Sheep  Softy Black-V1\", \"status\": \"Active\", \"uom_id\": 1, \"version\": 1, \"valid_to\": \"2026-10-14T00:00:00.000Z\", \"recipe_id\": null, \"thickness\": \"\", \"created_at\": \"2026-09-14T11:15:05.000Z\", \"created_by\": 7, \"product_id\": 6, \"updated_at\": \"2026-09-14T11:15:05.000Z\", \"updated_by\": null, \"valid_from\": \"2026-09-14T00:00:00.000Z\", \"customer_id\": 7, \"description\": \"\", \"leather_type\": \"cow\", \"process_type\": \"Wet End\", \"thickness_id\": 1, \"leather_type_id\": 4}, \"items\": [{\"id\": 36, \"qty\": \"0.250\", \"uom\": \"Kilogram\", \"type\": \"Wet-end\", \"amount\": \"28.00\", \"bom_id\": 19, \"remarks\": \"\", \"unit_cost\": \"112.00\", \"created_at\": \"2026-09-14T11:15:05.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-09-14T11:15:05.000Z\", \"updated_by\": null, \"material_id\": 34, \"supplier_id\": 14, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 37, \"qty\": \"0.250\", \"uom\": \"Kilogram\", \"type\": \"Finishing\", \"amount\": \"37.50\", \"bom_id\": 19, \"remarks\": \"\", \"unit_cost\": \"150.00\", \"created_at\": \"2026-09-14T11:15:05.000Z\", \"created_by\": 7, \"machine_id\": 122, \"updated_at\": \"2026-09-14T11:15:05.000Z\", \"updated_by\": null, \"material_id\": null, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 38, \"qty\": \"0.300\", \"uom\": \"Kilogram\", \"type\": \"Wet-end\", \"amount\": \"24.00\", \"bom_id\": 19, \"remarks\": \"\", \"unit_cost\": \"80.00\", \"created_at\": \"2026-09-14T11:15:05.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-09-14T11:15:05.000Z\", \"updated_by\": null, \"material_id\": 72, \"supplier_id\": 13, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 39, \"qty\": \"0.400\", \"uom\": \"Kilogram\", \"type\": \"Wet-end\", \"amount\": \"88.80\", \"bom_id\": 19, \"remarks\": \"\", \"unit_cost\": \"222.00\", \"created_at\": \"2026-09-14T11:15:05.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-09-14T11:15:05.000Z\", \"updated_by\": null, \"material_id\": 37, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}]}',7,7,'2026-09-14 11:15:05','2026-09-14 11:15:05'),(50,19,1,5,'Superseded','2026-09-14','2026-10-14','Component added','{\"bom\": {\"id\": 19, \"uom\": \"Square Feet\", \"code\": \"CRO092604\", \"name\": \"Sheep  Softy Black-V1\", \"status\": \"Active\", \"uom_id\": 1, \"version\": 1, \"valid_to\": \"2026-10-14T00:00:00.000Z\", \"recipe_id\": null, \"thickness\": \"\", \"created_at\": \"2026-09-14T11:15:05.000Z\", \"created_by\": 7, \"product_id\": 6, \"updated_at\": \"2026-09-14T11:15:05.000Z\", \"updated_by\": null, \"valid_from\": \"2026-09-14T00:00:00.000Z\", \"customer_id\": 7, \"description\": \"\", \"leather_type\": \"cow\", \"process_type\": \"Wet End\", \"thickness_id\": 1, \"leather_type_id\": 4}, \"items\": [{\"id\": 36, \"qty\": \"0.250\", \"uom\": \"Kilogram\", \"type\": \"Wet-end\", \"amount\": \"28.00\", \"bom_id\": 19, \"remarks\": \"\", \"unit_cost\": \"112.00\", \"created_at\": \"2026-09-14T11:15:05.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-09-14T11:15:05.000Z\", \"updated_by\": null, \"material_id\": 34, \"supplier_id\": 14, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 37, \"qty\": \"0.250\", \"uom\": \"Kilogram\", \"type\": \"Finishing\", \"amount\": \"37.50\", \"bom_id\": 19, \"remarks\": \"\", \"unit_cost\": \"150.00\", \"created_at\": \"2026-09-14T11:15:05.000Z\", \"created_by\": 7, \"machine_id\": 122, \"updated_at\": \"2026-09-14T11:15:05.000Z\", \"updated_by\": null, \"material_id\": null, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 38, \"qty\": \"0.300\", \"uom\": \"Kilogram\", \"type\": \"Wet-end\", \"amount\": \"24.00\", \"bom_id\": 19, \"remarks\": \"\", \"unit_cost\": \"80.00\", \"created_at\": \"2026-09-14T11:15:05.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-09-14T11:15:05.000Z\", \"updated_by\": null, \"material_id\": 72, \"supplier_id\": 13, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 39, \"qty\": \"0.400\", \"uom\": \"Kilogram\", \"type\": \"Wet-end\", \"amount\": \"88.80\", \"bom_id\": 19, \"remarks\": \"\", \"unit_cost\": \"222.00\", \"created_at\": \"2026-09-14T11:15:05.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-09-14T11:15:05.000Z\", \"updated_by\": null, \"material_id\": 37, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}]}',7,7,'2026-09-14 11:15:05','2026-09-14 11:15:05'),(51,19,1,6,'Superseded','2026-09-14','2026-10-14',NULL,'{\"bom\": {\"id\": 19, \"uom\": \"Square Feet\", \"code\": \"STY092601\", \"name\": \"Sheep  Softy Black-V1\", \"status\": \"Active\", \"uom_id\": 1, \"version\": 1, \"valid_to\": \"2026-10-14T00:00:00.000Z\", \"recipe_id\": null, \"thickness\": null, \"created_at\": \"2026-09-14T11:15:05.000Z\", \"created_by\": 7, \"product_id\": 6, \"updated_at\": \"2026-09-14T12:50:07.000Z\", \"updated_by\": 7, \"valid_from\": \"2026-09-14T00:00:00.000Z\", \"customer_id\": 9, \"description\": null, \"leather_type\": \"cow\", \"process_type\": \"Wet End\", \"thickness_id\": 1, \"leather_type_id\": 4}, \"items\": [{\"id\": 36, \"qty\": \"0.250\", \"uom\": \"Kilogram\", \"type\": \"Wet-end\", \"amount\": \"28.00\", \"bom_id\": 19, \"remarks\": \"\", \"unit_cost\": \"112.00\", \"created_at\": \"2026-09-14T11:15:05.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-09-14T11:15:05.000Z\", \"updated_by\": null, \"material_id\": 34, \"supplier_id\": 14, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 37, \"qty\": \"0.250\", \"uom\": \"Kilogram\", \"type\": \"Finishing\", \"amount\": \"37.50\", \"bom_id\": 19, \"remarks\": \"\", \"unit_cost\": \"150.00\", \"created_at\": \"2026-09-14T11:15:05.000Z\", \"created_by\": 7, \"machine_id\": 122, \"updated_at\": \"2026-09-14T11:15:05.000Z\", \"updated_by\": null, \"material_id\": null, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 38, \"qty\": \"0.300\", \"uom\": \"Kilogram\", \"type\": \"Wet-end\", \"amount\": \"24.00\", \"bom_id\": 19, \"remarks\": \"\", \"unit_cost\": \"80.00\", \"created_at\": \"2026-09-14T11:15:05.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-09-14T11:15:05.000Z\", \"updated_by\": null, \"material_id\": 72, \"supplier_id\": 13, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 39, \"qty\": \"0.400\", \"uom\": \"Kilogram\", \"type\": \"Wet-end\", \"amount\": \"88.80\", \"bom_id\": 19, \"remarks\": \"\", \"unit_cost\": \"222.00\", \"created_at\": \"2026-09-14T11:15:05.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-09-14T11:15:05.000Z\", \"updated_by\": null, \"material_id\": 37, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}]}',7,7,'2026-09-14 12:50:07','2026-09-14 12:50:07'),(52,19,1,7,'Active','2026-09-14','2026-10-14','Component updated','{\"bom\": {\"id\": 19, \"uom\": \"Square Feet\", \"code\": \"STY092601\", \"name\": \"Sheep  Softy Black-V1\", \"status\": \"Active\", \"uom_id\": 1, \"version\": 1, \"valid_to\": \"2026-10-14T00:00:00.000Z\", \"recipe_id\": null, \"thickness\": null, \"created_at\": \"2026-09-14T11:15:05.000Z\", \"created_by\": 7, \"product_id\": 6, \"updated_at\": \"2026-09-14T12:50:07.000Z\", \"updated_by\": 7, \"valid_from\": \"2026-09-14T00:00:00.000Z\", \"customer_id\": 9, \"description\": null, \"leather_type\": \"cow\", \"process_type\": \"Wet End\", \"thickness_id\": 1, \"leather_type_id\": 4}, \"items\": [{\"id\": 36, \"qty\": \"0.250\", \"uom\": \"Kilogram\", \"type\": \"Wet-end\", \"amount\": \"28.00\", \"bom_id\": 19, \"remarks\": \"\", \"bom_type\": \"Finishing\", \"unit_cost\": \"112.00\", \"created_at\": \"2026-09-14T11:15:05.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-09-17T11:08:39.000Z\", \"updated_by\": 16, \"material_id\": 34, \"supplier_id\": 14, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 37, \"qty\": \"0.250\", \"uom\": \"Kilogram\", \"type\": \"Finishing\", \"amount\": \"37.50\", \"bom_id\": 19, \"remarks\": \"\", \"bom_type\": \"Wet End\", \"unit_cost\": \"150.00\", \"created_at\": \"2026-09-14T11:15:05.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-09-15T11:08:39.000Z\", \"updated_by\": null, \"material_id\": 122, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 38, \"qty\": \"0.300\", \"uom\": \"Kilogram\", \"type\": \"Wet-end\", \"amount\": \"24.00\", \"bom_id\": 19, \"remarks\": \"\", \"bom_type\": \"Wet End\", \"unit_cost\": \"80.00\", \"created_at\": \"2026-09-14T11:15:05.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-09-15T11:08:39.000Z\", \"updated_by\": null, \"material_id\": 72, \"supplier_id\": 13, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}, {\"id\": 39, \"qty\": \"0.400\", \"uom\": \"Kilogram\", \"type\": \"Wet-end\", \"amount\": \"88.80\", \"bom_id\": 19, \"remarks\": \"\", \"bom_type\": \"Wet End\", \"unit_cost\": \"222.00\", \"created_at\": \"2026-09-14T11:15:05.000Z\", \"created_by\": 7, \"machine_id\": null, \"updated_at\": \"2026-09-15T11:08:39.000Z\", \"updated_by\": null, \"material_id\": 37, \"supplier_id\": 6, \"effective_to\": null, \"scrap_percent\": \"0.00\", \"effective_from\": null}]}',16,16,'2026-09-17 11:08:39','2026-09-17 11:08:39');
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
  `code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` int DEFAULT NULL,
  `customer_id` int DEFAULT NULL,
  `recipe_id` int DEFAULT NULL,
  `leather_type` enum('cow','buffalo','goat','sheep') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'cow',
  `process_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Wet End Chemicals',
  `thickness` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uom` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Sq. Ft.',
  `valid_from` date DEFAULT NULL,
  `valid_to` date DEFAULT NULL,
  `status` enum('Active','Inactive','Draft') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
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
  KEY `fk_boms_customer` (`customer_id`),
  CONSTRAINT `fk_bom_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_bom_product_new` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_bom_recipe` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_boms_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `boms`
--

LOCK TABLES `boms` WRITE;
/*!40000 ALTER TABLE `boms` DISABLE KEYS */;
INSERT INTO `boms` VALUES (1,'testing','test',NULL,NULL,NULL,'cow','finishing','1.2-1.4','sqft','2026-07-02','2026-07-09','Active','test',1,'2026-07-03 17:34:10','2026-07-03 17:34:20',NULL,NULL,NULL,NULL,NULL),(2,'CRO082601','Crust Marina-V1',5,7,NULL,'cow','Wet End Chemicals','','','2026-08-11','2026-08-31','Active','',5,'2026-08-11 07:13:43','2026-08-11 07:41:20',4,1,3,7,7),(19,'STY092601','Sheep  Softy Black-V1',6,9,NULL,'cow','Wet End',NULL,'Square Feet','2026-09-14','2026-10-14','Active',NULL,1,'2026-09-14 11:15:05','2026-09-14 12:50:07',4,1,1,7,7);
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
  `code` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_id` int NOT NULL,
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pin_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Active','Inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `business_units`
--

LOCK TABLES `business_units` WRITE;
/*!40000 ALTER TABLE `business_units` DISABLE KEYS */;
INSERT INTO `business_units` VALUES (7,'BU-00001','MKM BU',3,'Kacheri road, Vaniyambadi ','Vaniyambadi ','Tamil Nadu',NULL,NULL,'','','Inactive','2026-07-22 06:09:38','2026-07-30 07:17:49',7,NULL,'2026-07-30 07:17:49');
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
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `state_id` int NOT NULL,
  `country_id` int NOT NULL,
  `pincode` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Active','Inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
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
  `code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `hex_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('Active','Inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_color_code` (`code`),
  KEY `idx_clr_deleted` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `colors`
--

LOCK TABLES `colors` WRITE;
/*!40000 ALTER TABLE `colors` DISABLE KEYS */;
INSERT INTO `colors` VALUES (1,'BLACK','Black','#000000','Classic black color','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(2,'BROWN','Brown','#8B4513','Natural brown color','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(3,'DARK-BRN','Dark Brown','#654321','Deep brown color','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(4,'TAN','Tan','#D2B48C','Light tan color','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(5,'NATURAL','Natural','#F5F5DC','Untreated natural color','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(6,'GREY','Grey','#808080','Grey color','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(7,'BEIGE','Beige','#F5F5DC','Beige color','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(8,'NAVY','Navy Blue','#000080','Navy blue color','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(9,'RED','Red','#8B0000','Dark red color','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(10,'GREEN','Green','#006400','Dark green color','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(12,'CLR-00NaN','pearl white','#098928','test','Active','2026-07-13 22:22:15','2026-07-13 22:22:15',1,NULL,NULL),(13,'CLR-00001','off white','#FAF9F6','color','Active','2026-09-01 15:33:43','2026-09-01 15:33:43',7,NULL,NULL),(14,'CLR-00002','Bark','#261105','color','Active','2026-09-01 15:34:23','2026-09-01 15:34:23',7,NULL,NULL),(15,'CLR-00003','White','','','Active','2026-09-26 11:30:21','2026-09-26 11:30:21',7,NULL,NULL);
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
  `code` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pin_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gstin` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pan` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('Active','Inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_company_code` (`code`),
  KEY `idx_comp_deleted` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `companies`
--

LOCK TABLES `companies` WRITE;
/*!40000 ALTER TABLE `companies` DISABLE KEYS */;
INSERT INTO `companies` VALUES (1,'CORIX','Corix Leather Industries','No. 1, Leather Complex, Vellore','Vellore','Tamil Nadu','India','632001','+91 416 2234567','info@corixleather.com','33AAACC1234A1Z5',NULL,NULL,NULL,'Inactive','2026-07-05 14:29:03','2026-07-22 06:08:01',NULL,NULL,'2026-07-22 06:08:01'),(3,'123','MKM Tannery','Vaniyambadi','vaniyambadi','Tamil Nadu','India',NULL,'09840294305','mnaqhid@gmail.com',NULL,NULL,NULL,NULL,'Active','2026-07-07 14:14:44','2026-07-22 06:08:54',3,7,NULL),(4,'009','cpm','','','','',NULL,'','','',NULL,NULL,NULL,'Inactive','2026-07-13 23:45:35','2026-07-22 06:07:56',1,NULL,'2026-07-22 06:07:56'),(5,'AKM','AKM Leather Private Limited','1st Floor, 159/A, Cutchery Road Extension, Valyampet','Vaniyamabadi','Tamil Nadu','India ',NULL,'+918056562581','office@akmleather.com','33AALCA5738P1Z4',NULL,NULL,NULL,'Active','2026-07-30 07:17:31','2026-07-30 07:17:31',7,NULL,NULL);
/*!40000 ALTER TABLE `companies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cost_components`
--

DROP TABLE IF EXISTS `cost_components`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cost_components` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `group_id` int DEFAULT NULL,
  `uom_id` int DEFAULT NULL,
  `cost_per_uom` decimal(14,4) NOT NULL DEFAULT '0.0000',
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_cost_components_code` (`code`),
  KEY `idx_cost_components_group` (`group_id`),
  KEY `idx_cost_components_uom` (`uom_id`),
  CONSTRAINT `fk_cost_components_group` FOREIGN KEY (`group_id`) REFERENCES `group_master` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_cost_components_uom` FOREIGN KEY (`uom_id`) REFERENCES `uom` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cost_components`
--

LOCK TABLES `cost_components` WRITE;
/*!40000 ALTER TABLE `cost_components` DISABLE KEYS */;
/*!40000 ALTER TABLE `cost_components` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `countries`
--

DROP TABLE IF EXISTS `countries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `countries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Active','Inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
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
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_person` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alt_phone` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Active','Inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `category` enum('export','domestic','wholesale') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'domestic',
  `currency` enum('inr','usd','eur') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'inr',
  `billing_address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `shipping_address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `pin_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gstin` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pan` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_terms` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `credit_limit` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (6,'CUST-00001','KPW','Mr MS','+918630309674','','','Agra','Uttar Pradesh','India','Active','domestic','inr','','','','','','90','','','2026-07-27 12:55:02','2026-09-26 05:23:29',NULL,NULL,NULL,7,16,NULL),(7,'CUST-00002','CRO','Mr SS','+919319852930','','','Agra','Uttar Pradesh','India','Active','domestic','inr','','','','','','90','','','2026-07-30 06:33:46','2026-07-30 06:33:46',NULL,NULL,NULL,7,NULL,NULL),(8,'CUST-00003','KFA','Mr KFA','+919944755730','','','Vaniyambadi','Tamil Nadu','India','Active','domestic','inr','','','','','','7','','','2026-07-30 06:35:35','2026-07-30 06:37:03',NULL,NULL,NULL,7,7,NULL),(9,'CUST-00004','STY','Mr PC','+919830277671','','','Kolkata','West Bengal','India','Active','domestic','inr','','','','','','60','','','2026-07-30 06:36:51','2026-07-30 06:36:51',NULL,NULL,NULL,7,NULL,NULL);
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
  `item_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `item_description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uom` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ordered_qty` decimal(12,2) DEFAULT '0.00',
  `shipped_qty` decimal(12,2) DEFAULT '0.00',
  `pending_qty` decimal(12,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_dni_note` (`delivery_note_id`),
  CONSTRAINT `fk_dni_note` FOREIGN KEY (`delivery_note_id`) REFERENCES `delivery_notes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_note_items`
--

LOCK TABLES `delivery_note_items` WRITE;
/*!40000 ALTER TABLE `delivery_note_items` DISABLE KEYS */;
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
  `delivery_no` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sales_order_id` int NOT NULL,
  `delivery_date` date DEFAULT NULL,
  `delivery_from` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transporter` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vehicle_no` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lr_no` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `no_of_packages` int DEFAULT NULL,
  `delivery_to` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `delivery_instructions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('Draft','Dispatched','Delivered') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `delivery_no` (`delivery_no`),
  KEY `idx_dn_order` (`sales_order_id`),
  CONSTRAINT `fk_dn_order` FOREIGN KEY (`sales_order_id`) REFERENCES `sales_orders` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_notes`
--

LOCK TABLES `delivery_notes` WRITE;
/*!40000 ALTER TABLE `delivery_notes` DISABLE KEYS */;
/*!40000 ALTER TABLE `delivery_notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,'DEPT-001','Production',NULL,'Active',NULL,NULL,NULL,'2026-09-06 09:35:53','2026-09-06 09:35:53'),(2,'DEPT-002','Quality Control',NULL,'Active',NULL,NULL,NULL,'2026-09-06 09:35:53','2026-09-06 09:35:53'),(3,'DEPT-003','Warehouse',NULL,'Active',NULL,NULL,NULL,'2026-09-06 09:35:53','2026-09-06 09:35:53'),(4,'DEPT-004','Dispatch',NULL,'Active',NULL,NULL,NULL,'2026-09-06 09:35:53','2026-09-06 09:35:53');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finish_types`
--

DROP TABLE IF EXISTS `finish_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `finish_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('Active','Inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_finishtype_code` (`code`),
  KEY `idx_ft_deleted` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finish_types`
--

LOCK TABLES `finish_types` WRITE;
/*!40000 ALTER TABLE `finish_types` DISABLE KEYS */;
INSERT INTO `finish_types` VALUES (1,'SEMI-ANILINE','Semi Aniline','Breathable finish with slight pigment coating','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(2,'FULL-GRAIN','Full Grain','Natural finish preserving grain','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(3,'NAPPA','Nappa','Soft smooth finish','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(4,'SUEDE','Suede','Brushed napped finish','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(5,'NUBUCK','Nubuck','Buffed grain surface','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(6,'PULL-UP','Pull-Up','Waxed finish that lightens when stretched','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(7,'PATENT','Patent','High gloss finish','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(8,'CORRECTED','Corrected Grain','Buffed and corrected surface','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(9,'CRUST','Crust','Unfinished leather','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(10,'GLAZED','Glazed','Polished glossy finish','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(12,'FT-00NaN','Softy','','Active','2026-09-01 15:36:00','2026-09-01 15:36:00',7,NULL,NULL),(13,'FT-00001','sheep upper','','Active','2026-09-25 12:21:18','2026-09-25 12:22:37',16,16,NULL);
/*!40000 ALTER TABLE `finish_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `general_cost_headers`
--

DROP TABLE IF EXISTS `general_cost_headers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `general_cost_headers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `transaction_no` varchar(50) NOT NULL,
  `production_plan_id` int NOT NULL,
  `production_date` date NOT NULL,
  `production_qty` decimal(15,2) NOT NULL DEFAULT '0.00',
  `process_stage` varchar(100) DEFAULT 'All',
  `total_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `total_cost_per_piece` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `cost_after_adjustments` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `status` enum('Pending','In-Process','Completed','Posted') NOT NULL DEFAULT 'Pending',
  `remarks` text,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_transaction_no` (`transaction_no`),
  KEY `idx_gch_plan` (`production_plan_id`),
  KEY `idx_gch_status` (`status`),
  CONSTRAINT `fk_gch_ps_order` FOREIGN KEY (`production_plan_id`) REFERENCES `production_status_orders` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `general_cost_headers`
--

LOCK TABLES `general_cost_headers` WRITE;
/*!40000 ALTER TABLE `general_cost_headers` DISABLE KEYS */;
INSERT INTO `general_cost_headers` VALUES (4,'GC-2026-09-0001',6,'2026-09-05',0.00,'Measurement',0.00,0.0000,0.0000,'Pending',NULL,7,7,'2026-09-05 16:19:46','2026-09-05 16:19:46'),(9,'GC-2026-09-0002',9,'2026-09-05',0.00,'Wet End',2.00,0.1300,0.1300,'Pending',NULL,7,7,'2026-09-05 16:26:38','2026-09-05 16:27:51'),(10,'GC-2026-09-0003',9,'2026-09-05',0.00,'Wet End',5.00,0.3300,0.3300,'Pending',NULL,7,7,'2026-09-05 16:29:15','2026-09-05 16:29:15'),(11,'GC-2026-09-0004',10,'2026-09-06',0.00,'Packing',10.00,1.0000,1.0000,'Pending',NULL,7,7,'2026-09-06 11:17:58','2026-09-06 11:17:58'),(12,'GC-2026-09-0005',11,'2026-09-06',0.00,'Finishing',7.00,1.0000,1.0000,'Pending',NULL,7,7,'2026-09-06 13:35:49','2026-09-06 13:35:49'),(13,'GC-2026-09-0006',14,'2026-09-16',0.00,'Measurement',25855.00,4.8900,4.8900,'Pending',NULL,7,7,'2026-09-16 13:09:19','2026-09-16 13:14:22'),(14,'GC-2026-09-0007',15,'2026-09-22',0.00,'Wet End',310.00,18.2400,18.2400,'Pending',NULL,7,7,'2026-09-22 11:48:03','2026-09-22 11:48:03'),(15,'GC-2026-09-0008',17,'2026-09-22',0.00,'Finishing',3800.00,69.0900,69.0900,'Pending',NULL,7,7,'2026-09-22 11:48:48','2026-09-22 11:48:48');
/*!40000 ALTER TABLE `general_cost_headers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `general_cost_items`
--

DROP TABLE IF EXISTS `general_cost_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `general_cost_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `general_cost_id` int NOT NULL,
  `cost_category` varchar(200) NOT NULL,
  `uom` varchar(50) NOT NULL DEFAULT 'Sq.Ft.',
  `amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `cost_per_piece` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `remarks` varchar(500) DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_gci_header` (`general_cost_id`),
  CONSTRAINT `fk_gci_header` FOREIGN KEY (`general_cost_id`) REFERENCES `general_cost_headers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `general_cost_items`
--

LOCK TABLES `general_cost_items` WRITE;
/*!40000 ALTER TABLE `general_cost_items` DISABLE KEYS */;
INSERT INTO `general_cost_items` VALUES (5,4,'By Train','Sq.Ft.',0.00,0.0000,NULL,1,'2026-09-05 16:19:46','2026-09-05 16:19:46'),(7,9,'By Sea','Sq.Ft.',2.00,0.1300,NULL,1,'2026-09-05 16:27:51','2026-09-05 16:27:51'),(8,10,'By Sea','Sq.Ft.',5.00,0.3300,NULL,1,'2026-09-05 16:29:15','2026-09-05 16:29:15'),(9,11,'By Sea','Sq.Ft.',10.00,1.0000,NULL,1,'2026-09-06 11:17:59','2026-09-06 11:17:59'),(10,12,'Domestic','Bundle',5.00,0.7100,NULL,1,'2026-09-06 13:35:49','2026-09-06 13:35:49'),(11,12,'Overheads','Sq.Ft.',2.00,0.2900,NULL,2,'2026-09-06 13:35:49','2026-09-06 13:35:49'),(13,13,'Overheads','Sq.Ft.',15855.00,3.0000,NULL,1,'2026-09-16 13:14:22','2026-09-16 13:14:22'),(14,13,'Domestic','Bundle',10000.00,1.8900,NULL,2,'2026-09-16 13:14:22','2026-09-16 13:14:22'),(15,13,'','Sq.Ft.',0.00,0.0000,NULL,3,'2026-09-16 13:14:22','2026-09-16 13:14:22'),(16,14,'By Train','Sq.Ft.',310.00,18.2400,NULL,1,'2026-09-22 11:48:03','2026-09-22 11:48:03'),(17,15,'By Train','Sq.Ft.',3800.00,69.0900,NULL,1,'2026-09-22 11:48:48','2026-09-22 11:48:48');
/*!40000 ALTER TABLE `general_cost_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grades`
--

DROP TABLE IF EXISTS `grades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grades` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `rank` int DEFAULT '1',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('Active','Inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_grade_code` (`code`),
  KEY `idx_gr_deleted` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grades`
--

LOCK TABLES `grades` WRITE;
/*!40000 ALTER TABLE `grades` DISABLE KEYS */;
INSERT INTO `grades` VALUES (1,'A','A Grade - Premium',1,'Highest quality, no defects','Active','2026-07-05 14:29:54','2026-07-05 14:29:54',NULL,NULL,NULL),(2,'B','B Grade - Standard',2,'Good quality, minor natural marks','Active','2026-07-05 14:29:54','2026-07-05 14:29:54',NULL,NULL,NULL),(3,'C','C Grade - Economy',3,'Functional quality with visible marks','Active','2026-07-05 14:29:54','2026-07-05 14:29:54',NULL,NULL,NULL),(4,'REJECT','Reject Grade',4,'Below standard quality','Active','2026-07-05 14:29:54','2026-07-05 14:29:54',NULL,NULL,NULL),(5,'test grade','test grade',1,'test grade','Active','2026-07-07 06:50:11','2026-07-07 06:50:11',NULL,NULL,NULL),(7,'test grade 1','test grade 1',1,'','Active','2026-07-13 22:32:41','2026-07-13 22:32:41',1,NULL,NULL);
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
  `code` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `category_id` int DEFAULT NULL,
  `hsn_code` varchar(20) DEFAULT NULL,
  `gst_rate` decimal(5,2) NOT NULL DEFAULT '18.00',
  `description` varchar(255) DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_master`
--

LOCK TABLES `group_master` WRITE;
/*!40000 ALTER TABLE `group_master` DISABLE KEYS */;
INSERT INTO `group_master` VALUES (1,'GRP-00001','Finished Leather',1,'4107',5.00,'Finished leather group','Active',0,NULL,NULL,7,'2026-07-29 07:09:13','2026-07-29 14:35:32'),(2,'GRP-00002','Tanning Chemicals',NULL,'3202',18.00,'Tanning chemicals group','Active',0,NULL,NULL,NULL,'2026-07-29 07:09:13','2026-07-29 07:09:13'),(3,'GRP-00003','Dyes & Pigments',NULL,'3204',18.00,'Dyes and pigments group','Active',0,NULL,NULL,NULL,'2026-07-29 07:09:13','2026-07-29 07:09:13'),(4,'GRP-00004','Packing',13,'N/A',0.00,'','Active',0,NULL,7,NULL,'2026-08-11 14:48:45','2026-08-11 14:48:45'),(5,'GRP-00005','Freight',13,'N/A',0.00,'','Active',0,NULL,7,NULL,'2026-08-11 14:49:11','2026-08-11 14:49:11'),(6,'GRP-00006','Overheads',13,'N/A',0.00,'','Active',0,NULL,7,NULL,'2026-08-11 14:49:56','2026-08-11 14:49:56'),(7,'GRP-00007','Sheep Wet Blue',4,'54321',5.00,'','Active',0,NULL,7,7,'2026-09-01 16:01:38','2026-09-01 16:01:51'),(8,'GRP-00008','WET END',4,'5014',5.00,'','Active',0,NULL,7,NULL,'2026-09-22 10:51:27','2026-09-22 10:51:27'),(9,'GRP-00009','Chemical 123',4,'5491',5.00,'','Active',0,NULL,7,NULL,'2026-09-22 10:53:03','2026-09-22 10:53:03'),(11,'GRP-00010','Wetblue Chemicals',NULL,'3202',18.00,NULL,'Active',0,NULL,NULL,NULL,'2026-09-25 11:10:18','2026-09-25 11:10:18'),(12,'GRP-00011','Finishing Chemicals',NULL,'3209',18.00,NULL,'Active',0,NULL,NULL,NULL,'2026-09-25 11:10:18','2026-09-25 11:10:18'),(13,'GRP-00012','Sheep Leather',1,'12345',18.00,'','Active',0,NULL,7,NULL,'2026-09-26 13:25:38','2026-09-26 13:25:38');
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
  `code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `gst_rate` decimal(5,2) DEFAULT '18.00',
  `status` enum('Active','Inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_hsn_code` (`code`),
  KEY `idx_hsn_deleted` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hsn_codes`
--

LOCK TABLES `hsn_codes` WRITE;
/*!40000 ALTER TABLE `hsn_codes` DISABLE KEYS */;
INSERT INTO `hsn_codes` VALUES (1,'4107','Finished Leather','Finished leather, further prepared after tanning',18.00,'Active','2026-07-05 14:29:55','2026-07-05 14:29:55',NULL,NULL,NULL),(2,'4104','Semi-Processed Leather','Semi-processed tanned leather',18.00,'Active','2026-07-05 14:29:55','2026-07-05 14:29:55',NULL,NULL,NULL),(3,'4105','Wet Blue Leather','Chrome tanned leather (wet blue)',18.00,'Active','2026-07-05 14:29:55','2026-07-05 14:29:55',NULL,NULL,NULL),(4,'4106','Crust Leather','Tanned but not finished leather',18.00,'Active','2026-07-05 14:29:55','2026-07-05 14:29:55',NULL,NULL,NULL),(5,'3208','Synthetic Tanning Agents','Synthetic tanning preparations',18.00,'Active','2026-07-05 14:29:55','2026-07-05 14:29:55',NULL,NULL,NULL),(6,'3209','Finishing Agents','Leather finishing preparations',18.00,'Active','2026-07-05 14:29:55','2026-07-05 14:29:55',NULL,NULL,NULL),(7,'7654','tanning agent','test',18.00,'Active','2026-07-13 22:29:32','2026-07-13 22:29:32',1,NULL,NULL);
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
  `invoice_no` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sales_order_id` int NOT NULL,
  `invoice_date` date DEFAULT NULL,
  `invoice_amount` decimal(14,2) DEFAULT '0.00',
  `paid_amount` decimal(14,2) DEFAULT '0.00',
  `balance` decimal(14,2) DEFAULT '0.00',
  `status` enum('Pending','Partially Paid','Paid','Cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Pending',
  `due_date` date DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoice_no` (`invoice_no`),
  KEY `idx_inv_order` (`sales_order_id`),
  CONSTRAINT `fk_inv_order` FOREIGN KEY (`sales_order_id`) REFERENCES `sales_orders` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('Active','Inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
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
INSERT INTO `leather_types` VALUES (1,'COW','Cow ','Leather made from cow hides','Active','2026-07-05 14:29:03','2026-09-05 07:40:59',NULL,7,NULL),(2,'BUFFALO','Buffalo ','Leather made from buffalo hides','Active','2026-07-05 14:29:03','2026-09-05 07:40:51',NULL,7,NULL),(3,'GOAT','Goat ','Leather made from goat skins','Active','2026-07-05 14:29:03','2026-09-05 07:40:45',NULL,7,NULL),(4,'SHEEP','Sheep ','Leather made from sheep skins','Active','2026-07-05 14:29:03','2026-09-05 07:40:38',NULL,7,NULL),(5,'CALF','Calf ','Leather made from calf hides','Active','2026-07-05 14:29:03','2026-09-05 07:40:32',NULL,7,NULL);
/*!40000 ALTER TABLE `leather_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `location_racks`
--

DROP TABLE IF EXISTS `location_racks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `location_racks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(30) NOT NULL,
  `name` varchar(150) NOT NULL,
  `warehouse_id` int DEFAULT NULL,
  `description` text,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_location_rack_code` (`code`),
  KEY `idx_location_rack_warehouse` (`warehouse_id`),
  KEY `idx_location_rack_deleted` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `location_racks`
--

LOCK TABLES `location_racks` WRITE;
/*!40000 ALTER TABLE `location_racks` DISABLE KEYS */;
INSERT INTO `location_racks` VALUES (1,'LOC-00001','test',4,'test','Active','2026-08-23 00:47:11','2026-08-23 00:47:11',7,NULL,NULL);
/*!40000 ALTER TABLE `location_racks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `machine_cost_headers`
--

DROP TABLE IF EXISTS `machine_cost_headers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `machine_cost_headers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `transaction_no` varchar(50) NOT NULL,
  `production_plan_id` int NOT NULL,
  `production_date` date NOT NULL,
  `production_qty` decimal(15,2) NOT NULL DEFAULT '0.00',
  `process_stage` varchar(100) DEFAULT 'All',
  `total_amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `total_cost_per_piece` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `cost_after_adjustments` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `status` enum('Pending','In-Process','Completed','Posted') NOT NULL DEFAULT 'Pending',
  `remarks` text,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_mc_transaction_no` (`transaction_no`),
  KEY `idx_mch_plan` (`production_plan_id`),
  KEY `idx_mch_status` (`status`),
  CONSTRAINT `fk_mch_ps_order` FOREIGN KEY (`production_plan_id`) REFERENCES `production_status_orders` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `machine_cost_headers`
--

LOCK TABLES `machine_cost_headers` WRITE;
/*!40000 ALTER TABLE `machine_cost_headers` DISABLE KEYS */;
INSERT INTO `machine_cost_headers` VALUES (2,'MC-2026-09-0001',10,'2026-09-06',0.00,'Packing',20.00,2.0000,2.0000,'Pending',NULL,7,7,'2026-09-06 10:50:36','2026-09-06 11:27:46'),(3,'MC-2026-09-0002',9,'2026-09-06',0.00,'Wet End',2430.00,2430.0000,2430.0000,'Pending',NULL,7,7,'2026-09-06 13:38:13','2026-09-06 13:38:13'),(4,'MC-2026-09-0003',11,'2026-09-06',0.00,'Finishing',14.00,14.0000,14.0000,'Pending',NULL,7,7,'2026-09-06 13:39:02','2026-09-06 13:39:02'),(5,'MC-2026-09-0004',12,'2026-09-16',0.00,'Wet End',38644.90,38644.9000,38644.9000,'Pending',NULL,7,7,'2026-09-16 13:00:44','2026-09-16 13:00:44'),(6,'MC-2026-09-0005',17,'2026-09-22',0.00,'Finishing',4633.75,4633.7500,4633.7500,'Pending',NULL,7,7,'2026-09-22 11:52:06','2026-09-22 11:52:06');
/*!40000 ALTER TABLE `machine_cost_headers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `machine_cost_items`
--

DROP TABLE IF EXISTS `machine_cost_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `machine_cost_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `machine_cost_id` int NOT NULL,
  `machine_name` varchar(200) NOT NULL,
  `group_id` int DEFAULT NULL,
  `group_name` varchar(255) DEFAULT NULL,
  `uom` varchar(50) NOT NULL DEFAULT 'Sq.Ft.',
  `amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `cost_per_piece` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `remarks` varchar(500) DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_mci_header` (`machine_cost_id`),
  CONSTRAINT `fk_mci_header` FOREIGN KEY (`machine_cost_id`) REFERENCES `machine_cost_headers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `machine_cost_items`
--

LOCK TABLES `machine_cost_items` WRITE;
/*!40000 ALTER TABLE `machine_cost_items` DISABLE KEYS */;
INSERT INTO `machine_cost_items` VALUES (3,2,'Buffing',NULL,NULL,'Per Pcs',20.00,2.0000,NULL,1,'2026-09-06 11:27:46','2026-09-06 11:27:46'),(4,3,'Dry Drum PAK',NULL,NULL,'Per Hour',2400.00,160.0000,NULL,1,'2026-09-06 13:38:13','2026-09-06 13:38:13'),(5,3,'Buffing',NULL,NULL,'Per Pcs',30.00,2.0000,NULL,2,'2026-09-06 13:38:13','2026-09-06 13:38:13'),(6,4,'Hooking IND',NULL,NULL,'Per Pcs',8.75,1.2500,NULL,1,'2026-09-06 13:39:02','2026-09-06 13:39:02'),(7,4,'Measuring IND',NULL,NULL,'Per Pcs',5.25,0.7500,NULL,2,'2026-09-06 13:39:02','2026-09-06 13:39:02'),(8,5,'Sammying IND',NULL,NULL,'Per Pcs',3174.60,3.3000,NULL,1,'2026-09-16 13:00:44','2026-09-16 13:00:44'),(9,5,'Shaving IND',NULL,NULL,'Per Pcs',2405.00,2.5000,NULL,2,'2026-09-16 13:00:44','2026-09-16 13:00:44'),(10,5,'TCP',NULL,NULL,'Per Pcs',1683.50,1.7500,NULL,3,'2026-09-16 13:00:44','2026-09-16 13:00:44'),(11,5,'Big Drum',NULL,NULL,'Per Hour',13200.00,13.7200,NULL,4,'2026-09-16 13:00:44','2026-09-16 13:00:44'),(12,5,'Setting IND',NULL,NULL,'Per Pcs',2164.50,2.2500,NULL,5,'2026-09-16 13:00:44','2026-09-16 13:00:44'),(13,5,'Hooking IND',NULL,NULL,'Per Pcs',1202.50,1.2500,NULL,6,'2026-09-16 13:00:44','2026-09-16 13:00:44'),(14,5,'Vaccum',NULL,NULL,'Per Pcs',4329.00,4.5000,NULL,7,'2026-09-16 13:00:44','2026-09-16 13:00:44'),(15,5,'Molissa Staking',NULL,NULL,'Per Pcs',1683.50,1.7500,NULL,8,'2026-09-16 13:00:44','2026-09-16 13:00:44'),(16,5,'Buffing PAK',NULL,NULL,'Per Pcs',2886.00,3.0000,NULL,9,'2026-09-16 13:00:44','2026-09-16 13:00:44'),(17,5,'Dust-Off PAK',NULL,NULL,'Per Pcs',384.80,0.4000,NULL,10,'2026-09-16 13:00:44','2026-09-16 13:00:44'),(18,5,'Auto Spray',NULL,NULL,'Per Pcs',4810.00,5.0000,NULL,11,'2026-09-16 13:00:44','2026-09-16 13:00:44'),(19,5,'Measuring IND',NULL,NULL,'Per Pcs',721.50,0.7500,NULL,12,'2026-09-16 13:00:44','2026-09-16 13:00:44'),(20,6,'Auto Spray',1,'Finished Leather','Per Pcs',55.00,1.0000,NULL,1,'2026-09-22 11:52:06','2026-09-22 11:52:06'),(21,6,'Baby Drum',1,'Finished Leather','Per Hour',4400.00,80.0000,NULL,2,'2026-09-22 11:52:06','2026-09-22 11:52:06'),(22,6,'Dry Shaving IND',1,'Finished Leather','Per Pcs',110.00,2.0000,NULL,3,'2026-09-22 11:52:06','2026-09-22 11:52:06'),(23,6,'Measuring IMP',1,'Finished Leather','Per Pcs',68.75,1.2500,NULL,4,'2026-09-22 11:52:06','2026-09-22 11:52:06');
/*!40000 ALTER TABLE `machine_cost_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `machines`
--

DROP TABLE IF EXISTS `machines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `machines` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `uom_type` enum('Per Hour','Per Pcs') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rate_indian` decimal(10,2) NOT NULL DEFAULT '0.00',
  `rate_imported` decimal(10,2) NOT NULL DEFAULT '0.00',
  `supplier_id` int DEFAULT NULL,
  `machine_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `capacity` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('Active','Inactive','Maintenance') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_machine_code` (`code`),
  KEY `idx_mac_deleted` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `machines`
--

LOCK TABLES `machines` WRITE;
/*!40000 ALTER TABLE `machines` DISABLE KEYS */;
INSERT INTO `machines` VALUES (1,'MACHINE-01','Inspection Table',NULL,0.00,0.00,NULL,'Manual','10 hides/hr',NULL,'Active','2026-07-05 14:29:55','2026-07-05 14:29:55',NULL,NULL,NULL),(2,'MACHINE-02','Buffing Machine',NULL,0.00,0.00,NULL,'Automatic','100 sqft/hr',NULL,'Inactive','2026-07-05 14:29:55','2026-07-29 13:33:18',NULL,NULL,'2026-07-29 13:33:18'),(3,'MACHINE-03','Spray Booth A',NULL,0.00,0.00,NULL,'Spray','200 sqft/hr',NULL,'Inactive','2026-07-05 14:29:55','2026-07-29 13:33:18',NULL,NULL,'2026-07-29 13:33:18'),(4,'MACHINE-04','Spray Booth B',NULL,0.00,0.00,NULL,'Spray','200 sqft/hr',NULL,'Inactive','2026-07-05 14:29:55','2026-07-29 13:33:18',NULL,NULL,'2026-07-29 13:33:18'),(5,'MACHINE-05','Tunnel Dryer',NULL,0.00,0.00,NULL,'Conveyor','500 sqft/hr',NULL,'Inactive','2026-07-05 14:29:55','2026-07-29 13:33:18',NULL,NULL,'2026-07-29 13:33:18'),(6,'MACHINE-06','Ironing Machine',NULL,0.00,0.00,NULL,'Heated Roller','300 sqft/hr',NULL,'Inactive','2026-07-05 14:29:55','2026-07-29 13:33:18',NULL,NULL,'2026-07-29 13:33:18'),(7,'MACHINE-07','Rotary Dryer',NULL,0.00,0.00,NULL,'Drum','200 sqft/hr',NULL,'Inactive','2026-07-05 14:29:55','2026-07-29 13:33:18',NULL,NULL,'2026-07-29 13:33:18'),(8,'MACHINE-08','QC Table',NULL,0.00,0.00,NULL,'Manual','50 hides/hr',NULL,'Inactive','2026-07-05 14:29:55','2026-07-29 13:33:18',NULL,NULL,'2026-07-29 13:33:18'),(9,'MACHINE-09','Packing Station',NULL,0.00,0.00,NULL,'Manual','100 hides/hr',NULL,'Inactive','2026-07-05 14:29:55','2026-07-29 13:33:18',NULL,NULL,'2026-07-29 13:33:18'),(10,'MAC-00010','testing',NULL,0.00,0.00,NULL,'dryer','200','','Inactive','2026-07-13 22:38:46','2026-07-29 13:33:00',1,NULL,'2026-07-29 13:33:00'),(11,'MAC-00011','test','Per Hour',44.00,0.00,NULL,'Wet End',NULL,'test','Inactive','2026-07-29 12:52:41','2026-07-29 13:32:48',7,NULL,'2026-07-29 13:32:48'),(12,'MAC-00012','Setting IND','Per Pcs',2.25,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:32:00','2026-07-29 13:32:00',7,NULL,NULL),(13,'MAC-00013','Setting IMP','Per Pcs',3.30,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:32:27','2026-07-29 13:32:27',7,NULL,NULL),(14,'MAC-00014','Sammying IND','Per Pcs',3.30,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:34:33','2026-07-29 13:34:33',7,NULL,NULL),(15,'MAC-00015','Sammying IMP','Per Pcs',5.00,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:34:53','2026-07-29 13:34:53',7,NULL,NULL),(16,'MAC-00016','Hooking IND','Per Pcs',1.25,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:35:24','2026-07-29 13:35:24',7,NULL,NULL),(17,'MAC-00017','Hooking IMP','Per Pcs',1.65,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:35:45','2026-07-29 13:35:45',7,NULL,NULL),(18,'MAC-00018','Shaving IND','Per Pcs',2.50,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:37:23','2026-07-29 13:37:23',7,NULL,NULL),(19,'MAC-00019','Dry Shaving IND','Per Pcs',2.00,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:37:43','2026-07-29 13:37:43',7,NULL,NULL),(20,'MAC-00020','Shaving IMP','Per Pcs',3.50,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:38:00','2026-07-29 13:38:00',7,NULL,NULL),(21,'MAC-00021','Dry Shaving IMP','Per Pcs',3.00,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:38:24','2026-07-29 13:38:24',7,NULL,NULL),(22,'MAC-00022','Dry Setting IND','Per Pcs',2.25,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:44:20','2026-07-29 13:44:20',7,NULL,NULL),(23,'MAC-00023','Buffing','Per Pcs',2.00,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:44:51','2026-07-29 13:44:51',7,NULL,NULL),(24,'MAC-00024','Dust-Off','Per Pcs',0.60,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:45:15','2026-07-29 13:45:15',7,NULL,NULL),(25,'MAC-00025','Molissa Staking','Per Pcs',1.75,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:45:52','2026-07-29 13:45:52',7,NULL,NULL),(26,'MAC-00026','Wheel Staking ','Per Pcs',2.00,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:46:12','2026-07-29 13:59:57',7,7,NULL),(27,'MAC-00027','Dry Drum','Per Hour',200.00,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:47:41','2026-07-29 13:47:41',7,NULL,NULL),(28,'MAC-00028','Jumbo Drum','Per Hour',2475.00,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:48:23','2026-07-29 13:57:06',7,7,NULL),(29,'MAC-00029','Big Drum','Per Hour',1650.00,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:48:47','2026-07-29 13:48:47',7,NULL,NULL),(30,'MAC-00030','Medium Drum','Per Hour',825.00,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:49:15','2026-07-29 13:49:15',7,NULL,NULL),(31,'MAC-00031','Baby Drum','Per Hour',550.00,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:49:53','2026-07-29 13:49:53',7,NULL,NULL),(32,'MAC-00032','Sample Drum','Per Hour',330.00,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:50:16','2026-07-29 13:50:16',7,NULL,NULL),(33,'MAC-00033','Plating IND','Per Pcs',2.50,0.00,NULL,'Finishing',NULL,'','Active','2026-07-29 13:57:48','2026-07-29 13:57:48',7,NULL,NULL),(34,'MAC-00034','Plating IMP','Per Pcs',3.50,0.00,NULL,'Finishing',NULL,'','Active','2026-07-29 13:58:00','2026-07-29 13:58:00',7,NULL,NULL),(35,'MAC-00035','Measuring IND','Per Pcs',0.75,0.00,NULL,'Finishing',NULL,'','Active','2026-07-29 14:00:40','2026-07-29 14:00:40',7,NULL,NULL),(36,'MAC-00036','Measuring IMP','Per Pcs',1.25,0.00,NULL,'Finishing',NULL,'','Active','2026-07-29 14:01:04','2026-07-29 14:01:04',7,NULL,NULL),(37,'MAC-00037','Measuring Stamper','Per Pcs',2.00,0.00,NULL,'Finishing',NULL,'','Active','2026-07-29 14:01:30','2026-07-29 14:01:30',7,NULL,NULL),(38,'MAC-00038','Auto Spray','Per Pcs',1.00,0.00,NULL,'Finishing',NULL,'','Active','2026-07-29 14:03:07','2026-07-29 14:03:07',7,NULL,NULL),(39,'MAC-00039','Padding ','Per Pcs',1.20,0.00,NULL,'Finishing',NULL,'','Active','2026-07-29 14:03:38','2026-07-29 14:03:38',7,NULL,NULL),(40,'MAC-00040','Roller Plating','Per Pcs',3.50,0.00,NULL,'Finishing',NULL,'','Active','2026-07-29 14:04:45','2026-07-29 14:04:45',7,NULL,NULL),(41,'MAC-00041','ICO T&M','Per Pcs',2.00,0.00,NULL,'Finishing',NULL,'','Active','2026-07-29 14:10:29','2026-07-29 14:10:29',7,NULL,NULL),(42,'MAC-00042','Plating CLB','Per Pcs',1.75,0.00,NULL,'Finishing',NULL,'','Active','2026-07-29 14:12:26','2026-07-29 14:12:26',7,NULL,NULL),(43,'MAC-00043','Shaving PAK','Per Pcs',4.50,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 14:14:44','2026-07-29 14:14:44',7,NULL,NULL),(44,'MAC-00044','Padam PAK','Per Pcs',1.00,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 14:15:16','2026-07-29 14:15:16',7,NULL,NULL),(45,'MAC-00045','Setting IND PAK','Per Pcs',2.00,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 14:15:32','2026-07-29 14:21:29',7,7,NULL),(46,'MAC-00046','Dry Shaving PAK','Per Pcs',4.00,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 14:16:16','2026-07-29 14:16:16',7,NULL,NULL),(47,'MAC-00047','Buffing PAK','Per Pcs',3.00,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 14:18:53','2026-07-29 14:18:53',7,NULL,NULL),(48,'MAC-00048','Dust-Off PAK','Per Pcs',0.40,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 14:19:42','2026-07-29 14:19:42',7,NULL,NULL),(49,'MAC-00049','Setting IMP PAK','Per Pcs',2.50,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 14:21:43','2026-07-29 14:21:43',7,NULL,NULL),(50,'MAC-00050','Dry Drum PAK','Per Hour',300.00,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 14:22:01','2026-07-29 14:22:01',7,NULL,NULL),(51,'MAC-00051','Satilux PAK','Per Pcs',3.00,0.00,NULL,'Finishing',NULL,'','Active','2026-07-29 14:22:34','2026-07-29 14:22:34',7,NULL,NULL),(52,'MAC-00052','Plating IND PAK','Per Pcs',3.00,0.00,NULL,'Finishing',NULL,'','Active','2026-07-29 14:22:53','2026-07-29 14:22:53',7,NULL,NULL),(53,'MAC-00053','Plating IMP PAK','Per Pcs',3.50,0.00,NULL,'Finishing',NULL,'','Active','2026-07-29 14:23:10','2026-07-29 14:23:10',7,NULL,NULL),(54,'MAC-00054','Setting HUR','Per Pcs',2.25,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 14:24:34','2026-07-29 14:24:34',7,NULL,NULL),(55,'MAC-00055','REV Setting HUR','Per Pcs',3.50,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 14:24:56','2026-07-29 14:24:56',7,NULL,NULL),(56,'MAC-00056','Vaccum','Per Pcs',4.50,0.00,1,'Wet End',NULL,'','Active','2026-07-29 14:25:10','2026-08-06 07:47:23',7,7,NULL),(57,'MAC-00057','Hooking HUR','Per Pcs',1.25,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 14:25:36','2026-07-29 14:25:36',7,NULL,NULL),(58,'MAC-00058','Molissa HUR','Per Pcs',1.75,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 14:26:05','2026-07-29 14:26:05',7,NULL,NULL),(59,'MAC-00059','Round Trimming','Per Pcs',1.00,0.00,NULL,'Wet End',NULL,'','Inactive','2026-07-29 14:29:16','2026-07-29 14:29:51',7,NULL,'2026-07-29 14:29:51'),(60,'MAC-00060','WB V CUT','Per Pcs',0.40,0.00,NULL,'Wet End',NULL,'','Inactive','2026-07-29 14:29:39','2026-07-29 14:29:53',7,NULL,'2026-07-29 14:29:53'),(61,'MAC-00061','TCP','Per Pcs',1.75,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 14:30:46','2026-07-29 14:30:46',7,NULL,NULL),(62,'MAC-00062','WCM','Per Pcs',1.00,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 14:31:55','2026-07-29 14:31:55',7,NULL,NULL),(63,'MAC-00063','FCM','Per Pcs',1.00,0.00,NULL,'Finishing',NULL,'','Active','2026-07-29 14:32:11','2026-07-29 14:32:11',7,NULL,NULL);
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
  `file_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `uom` varchar(30) DEFAULT NULL,
  `required_qty` decimal(14,3) DEFAULT '0.000',
  `issue_qty` decimal(14,3) NOT NULL DEFAULT '0.000',
  `unit_cost` decimal(14,4) DEFAULT '0.0000',
  `amount` decimal(16,2) DEFAULT '0.00',
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_miitem_issue` (`issue_id`),
  KEY `idx_miitem_material` (`material_id`),
  CONSTRAINT `fk_miitem_issue` FOREIGN KEY (`issue_id`) REFERENCES `material_issues` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_miitem_material` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=98 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_issue_items`
--

LOCK TABLES `material_issue_items` WRITE;
/*!40000 ALTER TABLE `material_issue_items` DISABLE KEYS */;
INSERT INTO `material_issue_items` VALUES (1,1,1,'test',2.000,2.000,0.0000,0.00,'test-new','2026-07-11 07:43:42'),(3,2,199,'Piece',0.000,25.000,25.0000,625.00,NULL,'2026-09-05 16:10:19'),(4,3,34,'Kg',0.000,10.000,112.0000,1120.00,NULL,'2026-09-06 12:07:26'),(5,3,122,'Kg',0.000,5.000,150.0000,750.00,NULL,'2026-09-06 12:07:26'),(8,4,72,'Kg',0.000,2.000,80.0000,160.00,NULL,'2026-09-06 12:32:26'),(9,4,37,'Kg',0.000,1.000,222.0000,222.00,NULL,'2026-09-06 12:32:26'),(10,5,72,'Kg',0.000,5.000,80.0000,400.00,NULL,'2026-09-07 16:53:37'),(11,5,37,'Kg',0.000,5.000,222.0000,1110.00,NULL,'2026-09-07 16:53:37'),(13,6,199,'Piece',0.000,962.000,267.1234,256972.74,NULL,'2026-09-16 12:40:44'),(25,7,35,'Kg',0.000,4.500,267.0000,1201.50,NULL,'2026-09-16 12:48:32'),(26,7,36,'Kg',0.000,4.500,140.0000,630.00,NULL,'2026-09-16 12:48:32'),(27,7,5,'Kg',0.000,10.500,125.0000,1312.50,NULL,'2026-09-16 12:48:32'),(28,7,23,'Kg',0.000,10.500,258.0000,2709.00,NULL,'2026-09-16 12:48:32'),(29,7,49,'Kg',0.000,1.000,446.0000,446.00,NULL,'2026-09-16 12:48:32'),(30,7,24,'Kg',0.000,16.000,396.0000,6336.00,NULL,'2026-09-16 12:48:32'),(31,7,23,'Kg',0.000,24.500,258.0000,6321.00,NULL,'2026-09-16 12:48:32'),(32,7,18,'Kg',0.000,12.500,176.0000,2200.00,NULL,'2026-09-16 12:48:32'),(33,7,62,'Kg',0.000,2.750,176.0000,484.00,NULL,'2026-09-16 12:48:32'),(34,7,16,'Kg',0.000,24.500,216.0000,5292.00,NULL,'2026-09-16 12:48:32'),(35,7,28,'Kg',0.000,5.500,265.0000,1457.50,NULL,'2026-09-16 12:48:32'),(39,8,126,'Kg',0.000,10.000,184.0000,1840.00,NULL,'2026-09-16 12:51:43'),(40,8,171,'Kg',0.000,1.200,1416.0000,1699.20,NULL,'2026-09-16 12:51:43'),(41,8,171,'Kg',0.000,1.000,1416.0000,1416.00,NULL,'2026-09-16 12:51:43'),(45,9,167,'Kg',1.000,2.000,338.0000,676.00,NULL,'2026-09-22 11:17:19'),(46,9,167,'Kg',3.000,1.000,338.0000,338.00,NULL,'2026-09-22 11:17:19'),(47,9,167,'Kg',3.000,2.000,338.0000,676.00,NULL,'2026-09-22 11:17:19'),(87,11,211,'Piece',0.000,607.000,50.0000,30350.00,NULL,'2026-09-26 12:28:06'),(88,12,9,'Kg',0.000,1.750,272.0000,476.00,NULL,'2026-09-26 12:42:07'),(89,12,10,'Kg',0.000,1.750,140.0000,245.00,NULL,'2026-09-26 12:42:07'),(90,12,209,'Kilogram',0.000,0.000,0.0000,0.00,NULL,'2026-09-26 12:42:07'),(91,12,210,'Kilogram',0.000,0.000,0.0000,0.00,NULL,'2026-09-26 12:42:07'),(92,12,52,'Kg',0.000,5.500,112.0000,616.00,NULL,'2026-09-26 12:42:07'),(93,12,51,'Kg',0.000,7.500,117.0000,877.50,NULL,'2026-09-26 12:42:07'),(94,12,44,'Kg',0.000,8.500,307.0000,2609.50,NULL,'2026-09-26 12:42:07'),(95,12,33,'Kg',0.000,3.000,256.0000,768.00,NULL,'2026-09-26 12:42:07'),(96,12,47,'Kg',0.000,4.000,55.0000,220.00,NULL,'2026-09-26 12:42:07'),(97,12,49,'Kg',0.000,0.000,446.0000,0.00,NULL,'2026-09-26 12:42:07');
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
  `issue_no` varchar(30) NOT NULL,
  `issue_date` date NOT NULL,
  `department` varchar(150) DEFAULT NULL,
  `job_order_no` varchar(100) DEFAULT NULL,
  `production_batch` varchar(100) DEFAULT NULL,
  `process_stage` varchar(100) DEFAULT NULL,
  `article` varchar(255) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `batch_qty` decimal(14,3) DEFAULT '0.000',
  `batch_uom` varchar(30) DEFAULT NULL,
  `batch_description` text,
  `costing_method` enum('FIFO','LIFO','Weighted Average','Standard Cost') DEFAULT 'FIFO',
  `warehouse_id` int NOT NULL,
  `required_date` date DEFAULT NULL,
  `planned_date` date DEFAULT NULL,
  `issued_by` varchar(150) DEFAULT NULL,
  `loading_unloading` decimal(12,2) DEFAULT '0.00',
  `other_charges` decimal(12,2) DEFAULT '0.00',
  `total_material_cost` decimal(16,2) DEFAULT '0.00',
  `grand_total` decimal(16,2) DEFAULT '0.00',
  `remarks` text,
  `status` enum('Draft','Posted','Cancelled') DEFAULT 'Draft',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `issue_no` (`issue_no`),
  KEY `idx_mi_warehouse` (`warehouse_id`),
  KEY `idx_mi_status` (`status`),
  CONSTRAINT `fk_mi_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_issues`
--

LOCK TABLES `material_issues` WRITE;
/*!40000 ALTER TABLE `material_issues` DISABLE KEYS */;
INSERT INTO `material_issues` VALUES (1,'ISS-2026-00001','2026-07-11','Dyeing','JO-2024-0185','CUT-2024-0501',NULL,NULL,NULL,2.000,'7','test-new','FIFO',1,'2026-07-25',NULL,'Store Keeper',0.00,0.00,0.00,0.00,'test-new','Posted',NULL,NULL,'2026-07-11 07:43:42','2026-09-26 12:15:54'),(2,'ISS-2026-00002','2026-09-05','Wet End',NULL,'PRP-000003',NULL,'Sheep Softy','Softy / Black',25.000,'Pcs','Sheep Softy','FIFO',1,'2026-09-05','2026-09-05',NULL,0.00,0.00,625.00,625.00,NULL,'Posted',7,7,'2026-09-05 16:10:11','2026-09-05 16:10:19'),(3,'ISS-2026-00003','2026-09-06','Production',NULL,'PRP-000003','Wet End','Sheep Softy','Softy / Black',7.000,'Piece','Sheep Softy','FIFO',4,'2026-09-04','2026-09-04',NULL,0.00,0.00,1870.00,1870.00,NULL,'Draft',7,NULL,'2026-09-06 12:07:26','2026-09-06 12:07:26'),(4,'ISS-2026-00004','2026-09-06','Production',NULL,'PRP-000003','Measurement','Sheep Softy','Softy / Black',8.000,'Square Feet','Sheep Softy','FIFO',3,'2026-09-04','2026-09-04',NULL,0.00,0.00,382.00,382.00,NULL,'Draft',7,7,'2026-09-06 12:30:56','2026-09-06 12:32:26'),(5,'ISS-2026-00005','2026-09-07','Production',NULL,'PRP-000003','Finishing','Sheep Softy','Softy / Black',7.000,'Piece','Sheep Softy','FIFO',1,'2026-09-04','2026-09-04',NULL,0.00,0.00,1510.00,1510.00,NULL,'Draft',7,NULL,'2026-09-07 16:53:37','2026-09-07 16:53:37'),(6,'ISS-2026-00006','2026-09-16','Production',NULL,'PRP-000004','Wet End','Sheep  Crust Natural','Natural',962.000,'Piece','Sheep  Crust Natural','FIFO',1,'2026-09-16','2026-09-16',NULL,0.00,0.00,256972.74,256972.74,NULL,'Posted',7,7,'2026-09-16 12:40:40','2026-09-16 12:40:44'),(7,'ISS-2026-00007','2026-09-16','Production',NULL,'PRP-000004','Wet End','Sheep  Crust Natural','Natural',962.000,'Piece','Sheep  Crust Natural','FIFO',3,'2026-09-16','2026-09-16',NULL,0.00,0.00,28389.50,28389.50,NULL,'Posted',7,7,'2026-09-16 12:48:28','2026-09-16 12:48:32'),(8,'ISS-2026-00008','2026-09-16','Production',NULL,'PRP-000004','Wet End','Sheep  Crust Natural','Natural',962.000,'Piece','Sheep  Crust Natural','FIFO',3,'2026-09-16','2026-09-16',NULL,0.00,0.00,4955.20,4955.20,NULL,'Posted',7,7,'2026-09-16 12:51:40','2026-09-16 12:51:43'),(9,'ISS-2026-00009','2026-09-25','Production',NULL,'PRP-000006','Wet End','Sheep  Crust Black','Black',55.000,'Piece','Sheep  Crust Black','FIFO',1,'2026-09-22','2026-09-22',NULL,0.00,0.00,1690.00,1690.00,NULL,'Posted',7,7,'2026-09-22 11:17:05','2026-09-22 11:17:19'),(11,'ISS-2026-00010','2026-09-26','Production',NULL,'PRP-000008','Wet End','Sheep  Full Grain White','White',3500.000,'Piece','Sheep  Full Grain White','FIFO',7,'2026-09-26','2026-09-26',NULL,258.50,0.00,30350.00,30608.50,NULL,'Posted',7,7,'2026-09-26 12:27:08','2026-09-26 12:28:06'),(12,'ISS-2026-00011','2026-09-26','Production',NULL,'PRP-000008','Wet End','Sheep  Full Grain White','White',3500.000,'Piece','Sheep  Full Grain White','FIFO',8,'2026-09-26','2026-09-26',NULL,0.00,0.00,5812.00,5812.00,NULL,'Draft',7,NULL,'2026-09-26 12:42:07','2026-09-26 12:42:07');
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
  `uom` varchar(30) DEFAULT NULL,
  `primary_uom` varchar(50) DEFAULT NULL,
  `secondary_uom` varchar(50) DEFAULT NULL,
  `primary_uom_qty` decimal(12,4) NOT NULL DEFAULT '0.0000',
  `secondary_uom_qty` decimal(12,4) NOT NULL DEFAULT '0.0000',
  `currency` varchar(10) NOT NULL DEFAULT 'INR',
  `exchange_rate` decimal(12,6) NOT NULL DEFAULT '1.000000',
  `rate_fc` decimal(12,4) NOT NULL DEFAULT '0.0000',
  `rate_inr` decimal(12,4) NOT NULL DEFAULT '0.0000',
  `amount_fc` decimal(14,4) NOT NULL DEFAULT '0.0000',
  `amount_inr` decimal(14,4) NOT NULL DEFAULT '0.0000',
  `order_qty` decimal(14,3) DEFAULT '0.000',
  `received_qty` decimal(14,3) NOT NULL DEFAULT '0.000',
  `rate` decimal(14,4) NOT NULL DEFAULT '0.0000',
  `amount` decimal(16,2) NOT NULL DEFAULT '0.00',
  `batch_no` varchar(100) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_mritem_receipt` (`receipt_id`),
  KEY `idx_mritem_material` (`material_id`),
  CONSTRAINT `fk_mritem_material` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`),
  CONSTRAINT `fk_mritem_receipt` FOREIGN KEY (`receipt_id`) REFERENCES `material_receipts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_receipt_items`
--

LOCK TABLES `material_receipt_items` WRITE;
/*!40000 ALTER TABLE `material_receipt_items` DISABLE KEYS */;
INSERT INTO `material_receipt_items` VALUES (18,5,211,'Piece','Piece','Square Feet',607.0000,3141.0000,'INR',1.000000,50.0000,50.0000,30350.0000,30350.0000,0.000,607.000,50.0000,30350.00,NULL,NULL,'2026-09-26 12:18:52');
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
  `receipt_no` varchar(30) NOT NULL,
  `receipt_date` date NOT NULL,
  `receipt_type` enum('Purchase Order','Direct Purchase','Transfer','Sample','Return') DEFAULT 'Direct Purchase',
  `supplier_id` int DEFAULT NULL,
  `purchase_order_no` varchar(100) DEFAULT NULL,
  `po_date` date DEFAULT NULL,
  `challan_no` varchar(100) DEFAULT NULL,
  `challan_date` date DEFAULT NULL,
  `lr_grn_no` varchar(100) DEFAULT NULL,
  `lr_grn_date` date DEFAULT NULL,
  `transporter` varchar(150) DEFAULT NULL,
  `gate_entry_no` varchar(100) DEFAULT NULL,
  `warehouse_id` int NOT NULL,
  `freight` decimal(12,2) DEFAULT '0.00',
  `loading_charges` decimal(12,2) DEFAULT '0.00',
  `other_charges` decimal(12,2) DEFAULT '0.00',
  `gst_percent` decimal(5,2) NOT NULL DEFAULT '0.00',
  `cgst_amount` decimal(14,4) NOT NULL DEFAULT '0.0000',
  `sgst_amount` decimal(14,4) NOT NULL DEFAULT '0.0000',
  `igst_amount` decimal(14,4) NOT NULL DEFAULT '0.0000',
  `total_gst_amount` decimal(14,4) NOT NULL DEFAULT '0.0000',
  `tax_type` varchar(10) NOT NULL DEFAULT 'IGST',
  `total_other_charges` decimal(14,4) NOT NULL DEFAULT '0.0000',
  `total_amount` decimal(16,2) DEFAULT '0.00',
  `grand_total` decimal(16,2) DEFAULT '0.00',
  `remarks` text,
  `status` enum('Draft','Posted','Cancelled') DEFAULT 'Draft',
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_receipts`
--

LOCK TABLES `material_receipts` WRITE;
/*!40000 ALTER TABLE `material_receipts` DISABLE KEYS */;
INSERT INTO `material_receipts` VALUES (5,'GRN-2026-00001','2026-09-26','Direct Purchase',14,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,7,0.00,0.00,0.00,5.00,0.0000,0.0000,1517.5000,1517.5000,'IGST',0.0000,30350.00,31867.50,NULL,'Posted',7,7,'2026-09-26 12:18:45','2026-09-26 12:18:52');
/*!40000 ALTER TABLE `material_receipts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `material_transactions`
--

DROP TABLE IF EXISTS `material_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `material_transactions` (
  `transaction_id` bigint NOT NULL AUTO_INCREMENT,
  `transaction_date` datetime NOT NULL,
  `transaction_type` varchar(30) NOT NULL,
  `reference_no` varchar(30) DEFAULT NULL,
  `warehouse_id` bigint NOT NULL,
  `item_id` bigint NOT NULL,
  `batch_no` varchar(30) DEFAULT NULL,
  `receipt_qty` decimal(18,3) NOT NULL DEFAULT '0.000',
  `opening_stock` decimal(18,3) NOT NULL DEFAULT '0.000',
  `opening_value` decimal(18,2) NOT NULL DEFAULT '0.00',
  `receipt_value` decimal(18,2) NOT NULL DEFAULT '0.00',
  `issue_qty` decimal(18,3) NOT NULL DEFAULT '0.000',
  `issue_value` decimal(18,2) NOT NULL DEFAULT '0.00',
  `balance_qty` decimal(18,3) NOT NULL DEFAULT '0.000',
  `avg_rate` decimal(18,6) NOT NULL DEFAULT '0.000000',
  `balance_value` decimal(18,2) NOT NULL DEFAULT '0.00',
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`transaction_id`),
  KEY `idx_mt_item_wh_date` (`item_id`,`warehouse_id`,`transaction_date`,`transaction_id`),
  KEY `idx_mt_reference` (`reference_type`,`reference_id`),
  KEY `idx_mt_date` (`transaction_date`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_transactions`
--

LOCK TABLES `material_transactions` WRITE;
/*!40000 ALTER TABLE `material_transactions` DISABLE KEYS */;
INSERT INTO `material_transactions` VALUES (2,'2026-09-05 00:00:00','Issue','ISS-2026-00002',1,199,NULL,0.000,100.000,2500.00,0.00,25.000,625.00,75.000,25.000000,1875.00,'material_issue',2,'2026-09-05 16:10:19','2026-09-05 16:10:19'),(3,'2026-09-07 16:31:55','OPENING','MAT-00032',0,34,NULL,357.500,357.500,0.00,0.00,0.000,0.00,357.500,0.000000,0.00,'material_master',NULL,'2026-09-07 16:31:55','2026-09-07 16:31:55'),(4,'2026-09-07 16:32:22','OPENING','MAT-00121',0,122,NULL,172.000,172.000,0.00,0.00,0.000,0.00,172.000,0.000000,0.00,'material_master',NULL,'2026-09-07 16:32:22','2026-09-07 16:32:22'),(5,'2026-09-07 16:54:58','OPENING','MAT-00070',0,72,NULL,163.000,163.000,0.00,0.00,0.000,0.00,163.000,0.000000,0.00,'material_master',NULL,'2026-09-07 16:54:58','2026-09-07 16:54:58'),(6,'2026-09-07 16:55:22','OPENING','MAT-00035',0,37,NULL,155.000,155.000,0.00,0.00,0.000,0.00,155.000,0.000000,0.00,'material_master',NULL,'2026-09-07 16:55:22','2026-09-07 16:55:22'),(8,'2026-09-16 00:00:00','Issue','ISS-2026-00006',1,199,NULL,0.000,75.000,1875.00,0.00,962.000,24050.00,-887.000,25.000000,-22175.00,'material_issue',6,'2026-09-16 12:40:44','2026-09-26 12:15:46'),(9,'2026-09-16 00:00:00','Issue','ISS-2026-00007',3,35,NULL,0.000,70.000,18690.00,0.00,4.500,1201.50,65.500,267.000000,17488.50,'material_issue',7,'2026-09-16 12:48:32','2026-09-16 12:48:32'),(10,'2026-09-16 00:00:00','Issue','ISS-2026-00007',3,36,NULL,0.000,100.000,14000.00,0.00,4.500,630.00,95.500,140.000000,13370.00,'material_issue',7,'2026-09-16 12:48:32','2026-09-16 12:48:32'),(11,'2026-09-16 00:00:00','Issue','ISS-2026-00007',3,5,NULL,0.000,44.500,5562.50,0.00,10.500,1312.50,34.000,125.000000,4250.00,'material_issue',7,'2026-09-16 12:48:32','2026-09-16 12:48:32'),(12,'2026-09-16 00:00:00','Issue','ISS-2026-00007',3,23,NULL,0.000,30.500,7869.00,0.00,10.500,2709.00,20.000,258.000000,5160.00,'material_issue',7,'2026-09-16 12:48:32','2026-09-16 12:48:32'),(13,'2026-09-16 00:00:00','Issue','ISS-2026-00007',3,49,NULL,0.000,1.000,446.00,0.00,1.000,446.00,0.000,446.000000,0.00,'material_issue',7,'2026-09-16 12:48:32','2026-09-16 12:48:32'),(14,'2026-09-16 00:00:00','Issue','ISS-2026-00007',3,24,NULL,0.000,16.000,6336.00,0.00,16.000,6336.00,0.000,396.000000,0.00,'material_issue',7,'2026-09-16 12:48:32','2026-09-16 12:48:32'),(15,'2026-09-16 00:00:00','Issue','ISS-2026-00007',3,23,NULL,0.000,20.000,5160.00,0.00,24.500,6321.00,-4.500,258.000000,-1161.00,'material_issue',7,'2026-09-16 12:48:32','2026-09-16 12:48:32'),(16,'2026-09-16 00:00:00','Issue','ISS-2026-00007',3,18,NULL,0.000,25.000,4400.00,0.00,12.500,2200.00,12.500,176.000000,2200.00,'material_issue',7,'2026-09-16 12:48:32','2026-09-16 12:48:32'),(17,'2026-09-16 00:00:00','Issue','ISS-2026-00007',3,62,NULL,0.000,25.000,4400.00,0.00,2.750,484.00,22.250,176.000000,3916.00,'material_issue',7,'2026-09-16 12:48:32','2026-09-16 12:48:32'),(18,'2026-09-16 00:00:00','Issue','ISS-2026-00007',3,16,NULL,0.000,25.000,5400.00,0.00,24.500,5292.00,0.500,216.000000,108.00,'material_issue',7,'2026-09-16 12:48:32','2026-09-16 12:48:32'),(19,'2026-09-16 00:00:00','Issue','ISS-2026-00007',3,28,NULL,0.000,5.500,1457.50,0.00,5.500,1457.50,0.000,265.000000,0.00,'material_issue',7,'2026-09-16 12:48:32','2026-09-16 12:48:32'),(20,'2026-09-16 00:00:00','Issue','ISS-2026-00008',3,126,NULL,0.000,12.000,2208.00,0.00,10.000,1840.00,2.000,184.000000,368.00,'material_issue',8,'2026-09-16 12:51:43','2026-09-16 12:51:43'),(21,'2026-09-16 00:00:00','Issue','ISS-2026-00008',3,171,NULL,0.000,1.200,1699.20,0.00,1.200,1699.20,0.000,1416.000000,0.00,'material_issue',8,'2026-09-16 12:51:43','2026-09-16 12:51:43'),(22,'2026-09-16 00:00:00','Issue','ISS-2026-00008',3,171,NULL,0.000,0.000,0.00,0.00,1.000,0.00,-1.000,0.000000,0.00,'material_issue',8,'2026-09-16 12:51:43','2026-09-16 12:51:43'),(23,'2026-09-25 00:00:00','Issue','ISS-2026-00009',1,167,NULL,0.000,3.000,1014.00,0.00,2.000,676.00,1.000,338.000000,338.00,'material_issue',9,'2026-09-22 11:17:19','2026-09-22 11:17:19'),(24,'2026-09-25 00:00:00','Issue','ISS-2026-00009',1,167,NULL,0.000,1.000,338.00,0.00,1.000,338.00,0.000,338.000000,0.00,'material_issue',9,'2026-09-22 11:17:19','2026-09-22 11:17:19'),(25,'2026-09-25 00:00:00','Issue','ISS-2026-00009',1,167,NULL,0.000,0.000,0.00,0.00,2.000,0.00,-2.000,0.000000,0.00,'material_issue',9,'2026-09-22 11:17:19','2026-09-22 11:17:19'),(26,'2026-09-26 00:00:00','Receipt','GRN-2026-00001',7,211,NULL,607.000,0.000,0.00,30350.00,0.000,0.00,607.000,50.000000,30350.00,'material_receipt',5,'2026-09-26 12:18:52','2026-09-26 12:18:52'),(27,'2026-09-26 00:00:00','Issue','ISS-2026-00010',7,211,NULL,0.000,607.000,30350.00,0.00,607.000,30350.00,0.000,50.000000,0.00,'material_issue',11,'2026-09-26 12:28:06','2026-09-26 12:28:06');
/*!40000 ALTER TABLE `material_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `materials`
--

DROP TABLE IF EXISTS `materials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `materials` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `uom` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Kg',
  `primary_uom_id` int DEFAULT NULL,
  `secondary_uom_id` int DEFAULT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'INR',
  `type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Chemical',
  `group_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `uom_id` int DEFAULT NULL,
  `status` enum('Active','Inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Active',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `category` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `chemical_group` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `appearance` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ph_value` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `flash_point` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hsn_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cas_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shelf_life` int DEFAULT NULL,
  `storage_condition` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hazardous` tinyint(1) DEFAULT '0',
  `default_warehouse` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `opening_stock` decimal(12,2) DEFAULT '0.00',
  `opening_stock_value` decimal(18,2) NOT NULL DEFAULT '0.00',
  `opening_stock_uom` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `current_stock` decimal(12,2) DEFAULT '0.00',
  `reorder_level` decimal(12,2) DEFAULT '0.00',
  `maximum_level` decimal(12,2) DEFAULT '0.00',
  `standard_cost` decimal(12,2) DEFAULT '0.00',
  `last_purchase_price` decimal(12,2) DEFAULT '0.00',
  `rate` decimal(18,6) NOT NULL DEFAULT '0.000000',
  `preferred_supplier_id` int DEFAULT NULL,
  `lead_time` int DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `application` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `attachment_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_mat_deleted` (`deleted_at`),
  KEY `fk_materials_group` (`group_id`),
  KEY `fk_materials_primary_uom` (`primary_uom_id`),
  KEY `fk_materials_secondary_uom` (`secondary_uom_id`),
  CONSTRAINT `fk_materials_group` FOREIGN KEY (`group_id`) REFERENCES `group_master` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_materials_primary_uom` FOREIGN KEY (`primary_uom_id`) REFERENCES `uom` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_materials_secondary_uom` FOREIGN KEY (`secondary_uom_id`) REFERENCES `uom` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=212 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `materials`
--

LOCK TABLES `materials` WRITE;
/*!40000 ALTER TABLE `materials` DISABLE KEYS */;
INSERT INTO `materials` VALUES (1,'MAT-00001','Felidurm MS','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,NULL,14.70,5733.00,NULL,14.70,0.00,0.00,390.00,390.00,390.000000,6,NULL,NULL,NULL,NULL,NULL),(2,'MAT-00002','Zymo Viesol GMR 2','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'35079099',NULL,NULL,NULL,0,NULL,14.00,4508.00,NULL,14.00,0.00,0.00,322.00,322.00,322.000000,2,NULL,NULL,NULL,NULL,NULL),(3,'MAT-00003','Oxalic Acid','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'29171100',NULL,NULL,NULL,0,NULL,27.50,3437.50,NULL,27.50,0.00,0.00,125.00,125.00,125.000000,3,NULL,NULL,NULL,NULL,NULL),(4,'MAT-00004','Sodium Metabisulphite','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'28321090',NULL,NULL,NULL,0,NULL,11.30,904.00,NULL,11.30,0.00,0.00,80.00,80.00,80.000000,3,NULL,NULL,NULL,NULL,NULL),(5,'MAT-00005','Buzyme 7702','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'35079099',NULL,NULL,NULL,0,NULL,25.50,4360.50,NULL,25.50,0.00,0.00,171.00,171.00,171.000000,2,NULL,NULL,NULL,NULL,NULL),(6,'MAT-00006','UNIA R528','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,NULL,16.90,5323.50,NULL,16.90,0.00,0.00,315.00,315.00,315.000000,4,NULL,NULL,NULL,NULL,NULL),(7,'MAT-00007','Fospol LC80','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,NULL,13.70,5891.00,NULL,13.70,0.00,0.00,430.00,430.00,430.000000,4,NULL,NULL,NULL,NULL,NULL),(8,'MAT-00008','Coripol SFC','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,NULL,50.00,10200.00,NULL,50.00,0.00,0.00,204.00,204.00,204.000000,16,NULL,NULL,NULL,NULL,NULL),(9,'MAT-00009','Busperse 7794','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34029090',NULL,NULL,NULL,0,NULL,139.80,38025.60,NULL,139.80,0.00,0.00,272.00,272.00,272.000000,4,NULL,NULL,NULL,NULL,NULL),(10,'MAT-00010','Lipidol UW 113','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,NULL,145.00,20300.00,NULL,145.00,0.00,0.00,140.00,140.00,140.000000,15,NULL,NULL,NULL,NULL,NULL),(11,'MAT-00011','Sasyol SJB','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34029090',NULL,NULL,NULL,0,NULL,148.00,27676.00,NULL,148.00,0.00,0.00,187.00,187.00,187.000000,10,NULL,NULL,NULL,NULL,NULL),(12,'MAT-00012','Tanicor FTG','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,30.00,3720.00,NULL,30.00,0.00,0.00,124.00,124.00,124.000000,6,NULL,NULL,NULL,NULL,NULL),(13,'MAT-00013','Kurtalix PALIQ','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34029090',NULL,NULL,NULL,0,NULL,33.00,19866.00,NULL,33.00,0.00,0.00,602.00,602.00,602.000000,11,NULL,NULL,NULL,NULL,NULL),(14,'MAT-00014','Vernaminol Liquor ASN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,NULL,150.00,33300.00,NULL,150.00,0.00,0.00,222.00,222.00,222.000000,6,NULL,NULL,NULL,NULL,NULL),(15,'MAT-00015','Magnopal RHN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,9.40,2697.80,NULL,9.40,0.00,0.00,287.00,287.00,287.000000,16,NULL,NULL,NULL,NULL,NULL),(16,'MAT-00016','Vernol Liquor PN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,NULL,4.60,1205.20,NULL,4.60,0.00,0.00,262.00,262.00,262.000000,6,NULL,NULL,NULL,NULL,NULL),(17,'MAT-00017','Polyol AK','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,NULL,5.00,2875.00,NULL,5.00,0.00,0.00,575.00,575.00,575.000000,15,NULL,NULL,NULL,NULL,NULL),(18,'MAT-00018','Synthol GS 606','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,NULL,3.00,1395.00,NULL,3.00,0.00,0.00,465.00,465.00,465.000000,15,NULL,NULL,NULL,NULL,NULL),(19,'MAT-00019','Ledosol OX LIQ','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,NULL,5.50,2453.00,NULL,5.50,0.00,0.00,446.00,446.00,446.000000,11,NULL,NULL,NULL,NULL,NULL),(20,'MAT-00020','Relugan GT 50','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,85.00,32215.00,NULL,85.00,0.00,0.00,379.00,379.00,379.000000,6,NULL,NULL,NULL,NULL,NULL),(21,'MAT-00021','Veprovod VA','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,NULL,1.80,417.60,NULL,1.80,0.00,0.00,232.00,232.00,232.000000,6,NULL,NULL,NULL,NULL,NULL),(22,'MAT-00022','Tanicor MLB','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,21.30,5026.80,NULL,21.30,0.00,0.00,236.00,236.00,236.000000,6,NULL,NULL,NULL,NULL,NULL),(23,'MAT-00023','Tergotan ER','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,10.90,1885.70,NULL,10.90,0.00,0.00,173.00,173.00,173.000000,6,NULL,NULL,NULL,NULL,NULL),(24,'MAT-00024','Fospol M3 Imp','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,NULL,0.50,103.00,NULL,0.50,0.00,0.00,206.00,206.00,206.000000,4,NULL,NULL,NULL,NULL,NULL),(25,'MAT-00025','Levotan CO2','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,6.00,1926.00,NULL,6.00,0.00,0.00,321.00,321.00,321.000000,16,NULL,NULL,NULL,NULL,NULL),(26,'MAT-00026','Atlas 30 CT','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,NULL,3.00,1680.00,NULL,3.00,0.00,0.00,560.00,560.00,560.000000,18,NULL,NULL,NULL,NULL,NULL),(27,'MAT-00027','Sasyol CSK','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,2.50,590.00,NULL,2.50,0.00,0.00,236.00,236.00,236.000000,10,NULL,NULL,NULL,NULL,NULL),(28,'MAT-00028','Tergotan ESN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,2.40,542.40,NULL,2.40,0.00,0.00,226.00,226.00,226.000000,6,NULL,NULL,NULL,NULL,NULL),(29,'MAT-00029','Butan 7822','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,96.00,17952.00,NULL,96.00,0.00,0.00,187.00,187.00,187.000000,4,NULL,NULL,NULL,NULL,NULL),(30,'MAT-00030','Retanal RCN40','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,70.00,11900.00,NULL,70.00,0.00,0.00,170.00,170.00,170.000000,4,NULL,NULL,NULL,NULL,NULL),(31,'MAT-00031','Dutan MR LIQ','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,NULL,30.00,4170.00,NULL,30.00,0.00,0.00,139.00,139.00,139.000000,2,NULL,NULL,NULL,NULL,NULL),(32,'MAT-00032','Butan Oil 1919','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,NULL,70.00,20160.00,NULL,70.00,0.00,0.00,288.00,288.00,288.000000,4,NULL,NULL,NULL,NULL,NULL),(33,'MAT-00033','Fos Fol M3','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34029090',NULL,NULL,NULL,0,NULL,130.00,33280.00,NULL,130.00,0.00,0.00,256.00,256.00,256.000000,4,NULL,NULL,NULL,NULL,NULL),(34,'MAT-00034','Lawgerat 94L','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,NULL,80.00,16800.00,NULL,80.00,0.00,0.00,210.00,210.00,210.000000,8,NULL,NULL,NULL,NULL,NULL),(35,'MAT-00035','Coripol UFB/W','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38089990',NULL,NULL,NULL,0,NULL,30.00,10380.00,NULL,30.00,0.00,0.00,346.00,346.00,346.000000,16,NULL,NULL,NULL,NULL,NULL),(36,'MAT-00036','Preventol ICI','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,NULL,20.00,26060.00,NULL,20.00,0.00,0.00,1303.00,1303.00,1303.000000,17,NULL,NULL,NULL,NULL,NULL),(37,'MAT-00037','Synthol BS150','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,NULL,25.00,5250.00,NULL,25.00,0.00,0.00,210.00,210.00,210.000000,15,NULL,NULL,NULL,NULL,NULL),(38,'MAT-00038','Coripol ESS','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,NULL,35.00,7175.00,NULL,35.00,0.00,0.00,205.00,205.00,205.000000,18,NULL,NULL,NULL,NULL,NULL),(39,'MAT-00039','Fos Fol CL','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,NULL,10.00,2300.00,NULL,10.00,0.00,0.00,230.00,230.00,230.000000,4,NULL,NULL,NULL,NULL,NULL),(40,'MAT-00040','Coritan VTP','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32029020',NULL,NULL,NULL,0,NULL,8.70,1539.90,NULL,8.70,0.00,0.00,177.00,177.00,177.000000,10,NULL,NULL,NULL,NULL,NULL),(41,'MAT-00041','GS Powder (ele)','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,32.50,7020.00,NULL,32.50,0.00,0.00,216.00,216.00,216.000000,9,NULL,NULL,NULL,NULL,NULL),(42,'MAT-00042','Butan 7864','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,42.30,6133.50,NULL,42.30,0.00,0.00,145.00,145.00,145.000000,4,NULL,NULL,NULL,NULL,NULL),(43,'MAT-00043','Vernatan OS','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,159.50,36685.00,NULL,159.50,0.00,0.00,230.00,230.00,230.000000,6,NULL,NULL,NULL,NULL,NULL),(44,'MAT-00044','Tanicor KW','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32029020',NULL,NULL,NULL,0,NULL,50.00,15350.00,NULL,50.00,0.00,0.00,307.00,307.00,307.000000,6,NULL,NULL,NULL,NULL,NULL),(45,'MAT-00045','Sasyntan CAN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32029020',NULL,NULL,NULL,0,NULL,74.30,12556.70,NULL,74.30,0.00,0.00,169.00,169.00,169.000000,10,NULL,NULL,NULL,NULL,NULL),(46,'MAT-00046','Tanigan OSO','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,42.00,7770.00,NULL,42.00,0.00,0.00,185.00,185.00,185.000000,16,NULL,NULL,NULL,NULL,NULL),(47,'MAT-00047','Acetate','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'29152990',NULL,NULL,NULL,0,NULL,105.80,5819.00,NULL,105.80,0.00,0.00,55.00,55.00,55.000000,3,NULL,NULL,NULL,NULL,NULL),(48,'MAT-00048','Coralon OT','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,NULL,59.00,10384.00,NULL,59.00,0.00,0.00,176.00,176.00,176.000000,6,NULL,NULL,NULL,NULL,NULL),(49,'MAT-00049','Soda','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'28362000',NULL,NULL,NULL,0,NULL,129.30,6465.00,NULL,129.30,0.00,0.00,50.00,50.00,50.000000,3,NULL,NULL,NULL,NULL,NULL),(50,'MAT-00050','Neutralan BA','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32029020',NULL,NULL,NULL,0,NULL,45.50,5505.50,NULL,45.50,0.00,0.00,121.00,121.00,121.000000,6,NULL,NULL,NULL,NULL,NULL),(51,'MAT-00051','Retanal CRO','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32029020',NULL,NULL,NULL,0,NULL,63.70,7452.90,NULL,63.70,0.00,0.00,117.00,117.00,117.000000,4,NULL,NULL,NULL,NULL,NULL),(52,'MAT-00052','Chrom','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'28332990',NULL,NULL,NULL,0,NULL,119.00,13328.00,NULL,119.00,0.00,0.00,112.00,112.00,112.000000,25,NULL,NULL,NULL,NULL,NULL),(53,'MAT-00053','Synektan DDS','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,21.50,5848.00,NULL,21.50,0.00,0.00,272.00,272.00,272.000000,6,NULL,NULL,NULL,NULL,NULL),(54,'MAT-00054','Didisyn NM','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,46.50,5533.50,NULL,46.50,0.00,0.00,119.00,119.00,119.000000,5,NULL,NULL,NULL,NULL,NULL),(55,'MAT-00055','D7','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,NULL,5.00,625.00,NULL,5.00,0.00,0.00,125.00,125.00,125.000000,6,NULL,NULL,NULL,NULL,NULL),(56,'MAT-00056','Pidisyntan TR','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,63.00,10080.00,NULL,63.00,0.00,0.00,160.00,160.00,160.000000,5,NULL,NULL,NULL,NULL,NULL),(57,'MAT-00057','Bot Veg GS','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32019000',NULL,NULL,NULL,0,NULL,20.00,3600.00,NULL,20.00,0.00,0.00,180.00,180.00,180.000000,7,NULL,NULL,NULL,NULL,NULL),(58,'MAT-00058','Bot Veg QB','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32019000',NULL,NULL,NULL,0,NULL,38.90,8013.40,NULL,38.90,0.00,0.00,206.00,206.00,206.000000,7,NULL,NULL,NULL,NULL,NULL),(59,'MAT-00059','Ledoresin MD','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32029090',NULL,NULL,NULL,0,NULL,11.50,3197.00,NULL,11.50,0.00,0.00,278.00,278.00,278.000000,11,NULL,NULL,NULL,NULL,NULL),(60,'MAT-00060','Ledosol PWN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,NULL,11.30,2994.50,NULL,11.30,0.00,0.00,265.00,265.00,265.000000,11,NULL,NULL,NULL,NULL,NULL),(61,'MAT-00061','Synektan VW','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,11.95,2210.75,NULL,11.95,0.00,0.00,185.00,185.00,185.000000,6,NULL,NULL,NULL,NULL,NULL),(62,'MAT-00062','Lawgetan MN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,19.50,2827.50,NULL,19.50,0.00,0.00,145.00,145.00,145.000000,8,NULL,NULL,NULL,NULL,NULL),(63,'MAT-00063','Lawgetan TR','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,11.40,1687.20,NULL,11.40,0.00,0.00,148.00,148.00,148.000000,8,NULL,NULL,NULL,NULL,NULL),(64,'MAT-00064','Lawgetan','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,17.00,3315.00,NULL,17.00,0.00,0.00,195.00,195.00,195.000000,8,NULL,NULL,NULL,NULL,NULL),(65,'MAT-00065','Vernatan BL','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,15.90,1987.50,NULL,15.90,0.00,0.00,125.00,125.00,125.000000,6,NULL,NULL,NULL,NULL,NULL),(66,'MAT-00066','Tanicor DLE','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,61.00,7625.00,NULL,61.00,0.00,0.00,125.00,125.00,125.000000,6,NULL,NULL,NULL,NULL,NULL),(67,'MAT-00067','Gambini ST Powder','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32029020',NULL,NULL,NULL,0,NULL,14.40,3801.60,NULL,14.40,0.00,0.00,264.00,264.00,264.000000,11,NULL,NULL,NULL,NULL,NULL),(68,'MAT-00068','Blancotan 2X Powder','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32029090',NULL,NULL,NULL,0,NULL,20.30,6171.20,NULL,20.30,0.00,0.00,304.00,304.00,304.000000,11,NULL,NULL,NULL,NULL,NULL),(69,'MAT-00069','Titanium Dioxide','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'28230010',NULL,NULL,NULL,0,NULL,14.50,4785.00,NULL,14.50,0.00,0.00,330.00,330.00,330.000000,13,NULL,NULL,NULL,NULL,NULL),(70,'MAT-00070','Chikatan CFT','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,11.00,0.00,NULL,11.00,0.00,0.00,0.00,0.00,0.000000,12,NULL,NULL,NULL,NULL,NULL),(71,'MAT-00071','Quebracho','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32011000',NULL,NULL,NULL,0,NULL,43.50,13398.00,NULL,43.50,0.00,0.00,308.00,308.00,308.000000,9,NULL,NULL,NULL,NULL,NULL),(72,'MAT-00072','Dermafix S','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,NULL,0.75,185.25,NULL,0.75,0.00,0.00,247.00,247.00,247.000000,6,NULL,NULL,NULL,NULL,NULL),(73,'MAT-00073','Green BG','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,0.60,494.43,NULL,0.60,0.00,0.00,824.05,824.05,824.050000,19,NULL,NULL,NULL,NULL,NULL),(74,'MAT-00074','Brill Blue FRL','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,0.50,261.74,NULL,0.50,0.00,0.00,523.48,523.48,523.480000,19,NULL,NULL,NULL,NULL,NULL),(75,'MAT-00075','Black EBR','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,0.35,361.00,NULL,0.35,0.00,0.00,1031.44,1031.44,1031.440000,19,NULL,NULL,NULL,NULL,NULL),(76,'MAT-00076','Blue NR','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,3.30,2795.40,NULL,3.30,0.00,0.00,847.09,847.09,847.090000,19,NULL,NULL,NULL,NULL,NULL),(77,'MAT-00077','Coripacide Blue RG','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,0.60,269.55,NULL,0.60,0.00,0.00,449.25,449.25,449.250000,19,NULL,NULL,NULL,NULL,NULL),(78,'MAT-00078','Y Brown RL','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,5.25,6084.75,NULL,5.25,0.00,0.00,1159.00,1159.00,1159.000000,19,NULL,NULL,NULL,NULL,NULL),(79,'MAT-00079','Brown R','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,0.25,164.35,NULL,0.25,0.00,0.00,657.40,657.40,657.400000,19,NULL,NULL,NULL,NULL,NULL),(80,'MAT-00080','Brown NG12','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041900',NULL,NULL,NULL,0,NULL,0.60,296.66,NULL,0.60,0.00,0.00,494.43,494.43,494.430000,19,NULL,NULL,NULL,NULL,NULL),(81,'MAT-00081','Brn MLRL','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,2.60,2134.70,NULL,2.60,0.00,0.00,821.04,821.04,821.040000,19,NULL,NULL,NULL,NULL,NULL),(82,'MAT-00082','Brn FBR','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,3.70,3319.57,NULL,3.70,0.00,0.00,897.18,897.18,897.180000,19,NULL,NULL,NULL,NULL,NULL),(83,'MAT-00083','Olive Brn G','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,1.50,1160.94,NULL,1.50,0.00,0.00,773.96,773.96,773.960000,19,NULL,NULL,NULL,NULL,NULL),(84,'MAT-00084','HR Brn NGB','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,2.95,2840.85,NULL,2.95,0.00,0.00,963.00,963.00,963.000000,6,NULL,NULL,NULL,NULL,NULL),(85,'MAT-00085','Brown BLB','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,0.10,81.90,NULL,0.10,0.00,0.00,819.00,819.00,819.000000,19,NULL,NULL,NULL,NULL,NULL),(86,'MAT-00086','Brn B','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,0.40,344.00,NULL,0.40,0.00,0.00,860.00,860.00,860.000000,19,NULL,NULL,NULL,NULL,NULL),(87,'MAT-00087','Dk Brn R','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,0.45,548.10,NULL,0.45,0.00,0.00,1218.00,1218.00,1218.000000,6,NULL,NULL,NULL,NULL,NULL),(88,'MAT-00088','Brn CFW','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,2.00,1040.96,NULL,2.00,0.00,0.00,520.48,520.48,520.480000,19,NULL,NULL,NULL,NULL,NULL),(89,'MAT-00089','Brown HGN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,4.95,6499.35,NULL,4.95,0.00,0.00,1313.00,1313.00,1313.000000,6,NULL,NULL,NULL,NULL,NULL),(90,'MAT-00090','103 Polynesian Beige','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,0.85,510.00,NULL,0.85,0.00,0.00,600.00,600.00,600.000000,20,NULL,NULL,NULL,NULL,NULL),(91,'MAT-00091','104 Sabia','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,0.85,532.10,NULL,0.85,0.00,0.00,626.00,626.00,626.000000,20,NULL,NULL,NULL,NULL,NULL),(92,'MAT-00092','Blue RF','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,0.22,907.06,NULL,0.22,0.00,0.00,4123.00,4123.00,4123.000000,6,NULL,NULL,NULL,NULL,NULL),(93,'MAT-00093','Grey MCWS','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,0.20,74.44,NULL,0.20,0.00,0.00,372.20,372.20,372.200000,19,NULL,NULL,NULL,NULL,NULL),(94,'MAT-00094','Brn FB3GN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,0.09,65.61,NULL,0.09,0.00,0.00,729.00,729.00,729.000000,6,NULL,NULL,NULL,NULL,NULL),(95,'MAT-00095','Brown NGB','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,0.30,151.33,NULL,0.30,0.00,0.00,504.43,504.43,504.430000,19,NULL,NULL,NULL,NULL,NULL),(96,'MAT-00096','Brown CBT','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,0.65,284.45,NULL,0.65,0.00,0.00,437.62,437.62,437.620000,19,NULL,NULL,NULL,NULL,NULL),(97,'MAT-00097','Beige UR','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,1.70,815.35,NULL,1.70,0.00,0.00,479.62,479.62,479.620000,19,NULL,NULL,NULL,NULL,NULL),(98,'MAT-00098','Red SG','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,0.10,64.77,NULL,0.10,0.00,0.00,647.70,647.70,647.700000,19,NULL,NULL,NULL,NULL,NULL),(99,'MAT-00099','Brown RN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,0.40,264.29,NULL,0.40,0.00,0.00,660.72,660.72,660.720000,19,NULL,NULL,NULL,NULL,NULL),(100,'MAT-00100','Bordeaux UCN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,1.80,1046.83,NULL,1.80,0.00,0.00,581.57,581.57,581.570000,19,NULL,NULL,NULL,NULL,NULL),(101,'MAT-00101','Red 2BN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,1.10,1408.64,NULL,1.10,0.00,0.00,1280.58,1280.58,1280.580000,19,NULL,NULL,NULL,NULL,NULL),(102,'MAT-00102','Inoderm Brn NT','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,0.55,0.00,NULL,0.55,0.00,0.00,0.00,0.00,0.000000,6,NULL,NULL,NULL,NULL,NULL),(103,'MAT-00103','Dk Green N','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,0.40,0.00,NULL,0.40,0.00,0.00,0.00,0.00,0.000000,6,NULL,NULL,NULL,NULL,NULL),(104,'MAT-00104','Violet BR','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,0.85,383.63,NULL,0.85,0.00,0.00,451.33,451.33,451.330000,19,NULL,NULL,NULL,NULL,NULL),(105,'MAT-00105','Coffee Brown CRB','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,0.70,641.34,NULL,0.70,0.00,0.00,916.20,916.20,916.200000,19,NULL,NULL,NULL,NULL,NULL),(106,'MAT-00106','Jet Black','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,17.50,16857.93,NULL,17.50,0.00,0.00,963.31,963.31,963.310000,19,NULL,NULL,NULL,NULL,NULL),(107,'MAT-00107','Powder Black PPS','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,60.90,32886.00,NULL,60.90,0.00,0.00,540.00,540.00,540.000000,13,NULL,NULL,NULL,NULL,NULL),(108,'MAT-00108','Powder Black PPR','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,60.00,27000.00,NULL,60.00,0.00,0.00,450.00,450.00,450.000000,13,NULL,NULL,NULL,NULL,NULL),(109,'MAT-00109','Beige U-NS','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,3.65,1987.46,NULL,3.65,0.00,0.00,544.51,544.51,544.510000,19,NULL,NULL,NULL,NULL,NULL),(110,'MAT-00110','Red Brown CRN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,3.25,1873.85,NULL,3.25,0.00,0.00,576.57,576.57,576.570000,19,NULL,NULL,NULL,NULL,NULL),(111,'MAT-00111','Navy Blue SRL','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,3.50,2610.58,NULL,3.50,0.00,0.00,745.88,745.88,745.880000,19,NULL,NULL,NULL,NULL,NULL),(112,'MAT-00112','Navy Blue RL','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,8.80,5161.90,NULL,8.80,0.00,0.00,586.58,586.58,586.580000,19,NULL,NULL,NULL,NULL,NULL),(113,'MAT-00113','Yellow 2RLN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,5.30,3730.14,NULL,5.30,0.00,0.00,703.80,703.80,703.800000,19,NULL,NULL,NULL,NULL,NULL),(114,'MAT-00114','Dermalix WWL','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34029090',NULL,NULL,NULL,0,NULL,10.00,2730.00,NULL,10.00,0.00,0.00,273.00,273.00,273.000000,6,NULL,NULL,NULL,NULL,NULL),(115,'MAT-00115','Repelan MA/B','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,NULL,93.50,14305.50,NULL,93.50,0.00,0.00,153.00,153.00,153.000000,4,NULL,NULL,NULL,NULL,NULL),(116,'MAT-00116','Sasyol ECW','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,NULL,72.50,25012.50,NULL,72.50,0.00,0.00,345.00,345.00,345.000000,10,NULL,NULL,NULL,NULL,NULL),(117,'MAT-00117','Sintoil GH','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,NULL,7.00,3759.00,NULL,7.00,0.00,0.00,537.00,537.00,537.000000,11,NULL,NULL,NULL,NULL,NULL),(118,'MAT-00118','RC-27165','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,120.00,18000.00,NULL,120.00,0.00,0.00,150.00,150.00,150.000000,6,NULL,NULL,NULL,NULL,NULL),(119,'MAT-00119','Hyper 93','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34029090',NULL,NULL,NULL,0,NULL,10.00,2670.00,NULL,10.00,0.00,0.00,267.00,267.00,267.000000,16,NULL,NULL,NULL,NULL,NULL),(120,'MAT-00120','BM 3058','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,NULL,49.00,32683.00,NULL,49.00,0.00,0.00,667.00,667.00,667.000000,21,NULL,NULL,NULL,NULL,NULL),(121,'MAT-00121','RA 27007','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,NULL,50.00,7500.00,NULL,50.00,0.00,0.00,150.00,150.00,150.000000,6,NULL,NULL,NULL,NULL,NULL),(122,'MAT-00122','RA 27066','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,100.00,15000.00,NULL,100.00,0.00,0.00,150.00,150.00,150.000000,6,NULL,NULL,NULL,NULL,NULL),(123,'MAT-00123','Corial Microbinder AM','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,80.00,14160.00,NULL,80.00,0.00,0.00,177.00,177.00,177.000000,6,NULL,NULL,NULL,NULL,NULL),(124,'MAT-00124','Argowax 4008','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34049000',NULL,NULL,NULL,0,NULL,18.00,5652.00,NULL,18.00,0.00,0.00,314.00,314.00,314.000000,21,NULL,NULL,NULL,NULL,NULL),(125,'MAT-00125','MTW 4506','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,NULL,15.00,13935.00,NULL,15.00,0.00,0.00,929.00,929.00,929.000000,21,NULL,NULL,NULL,NULL,NULL),(126,'MAT-00126','HM 183','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38249990',NULL,NULL,NULL,0,NULL,0.85,1329.40,NULL,0.85,0.00,0.00,1564.00,1564.00,1564.000000,6,NULL,NULL,NULL,NULL,NULL),(127,'MAT-00127','LL 3875','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,NULL,1.50,1008.00,NULL,1.50,0.00,0.00,672.00,672.00,672.000000,22,NULL,NULL,NULL,NULL,NULL),(128,'MAT-00128','LP 1488','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,1.30,1209.00,NULL,1.30,0.00,0.00,930.00,930.00,930.000000,22,NULL,NULL,NULL,NULL,NULL),(129,'MAT-00129','Mix Carteggio','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38249990',NULL,NULL,NULL,0,NULL,1.80,1060.20,NULL,1.80,0.00,0.00,589.00,589.00,589.000000,22,NULL,NULL,NULL,NULL,NULL),(130,'MAT-00130','LPM 1000','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,1.80,2970.00,NULL,1.80,0.00,0.00,1650.00,1650.00,1650.000000,22,NULL,NULL,NULL,NULL,NULL),(131,'MAT-00131','LP 1247','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,2.20,1988.80,NULL,2.20,0.00,0.00,904.00,904.00,904.000000,22,NULL,NULL,NULL,NULL,NULL),(132,'MAT-00132','LP 1238','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,2.00,1682.00,NULL,2.00,0.00,0.00,841.00,841.00,841.000000,22,NULL,NULL,NULL,NULL,NULL),(133,'MAT-00133','LH 44/B','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,NULL,0.50,166.00,NULL,0.50,0.00,0.00,332.00,332.00,332.000000,22,NULL,NULL,NULL,NULL,NULL),(134,'MAT-00134','LP 3452','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,4.50,2790.00,NULL,4.50,0.00,0.00,620.00,620.00,620.000000,22,NULL,NULL,NULL,NULL,NULL),(135,'MAT-00135','LP 1422','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,4.80,3278.40,NULL,4.80,0.00,0.00,683.00,683.00,683.000000,22,NULL,NULL,NULL,NULL,NULL),(136,'MAT-00136','LP 1298','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,4.80,3177.60,NULL,4.80,0.00,0.00,662.00,662.00,662.000000,22,NULL,NULL,NULL,NULL,NULL),(137,'MAT-00137','LT 1110','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,NULL,4.90,2420.60,NULL,4.90,0.00,0.00,494.00,494.00,494.000000,22,NULL,NULL,NULL,NULL,NULL),(138,'MAT-00138','LW 65377','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,NULL,3.50,1764.00,NULL,3.50,0.00,0.00,504.00,504.00,504.000000,6,NULL,NULL,NULL,NULL,NULL),(139,'MAT-00139','Filla 4477','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,8.00,5400.00,NULL,8.00,0.00,0.00,675.00,675.00,675.000000,21,NULL,NULL,NULL,NULL,NULL),(140,'MAT-00140','Aquarius 3577','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,2.70,1682.10,NULL,2.70,0.00,0.00,623.00,623.00,623.000000,21,NULL,NULL,NULL,NULL,NULL),(141,'MAT-00141','RA 1079','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,0.80,348.80,NULL,0.80,0.00,0.00,436.00,436.00,436.000000,6,NULL,NULL,NULL,NULL,NULL),(142,'MAT-00142','Argowax 611','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34049000',NULL,NULL,NULL,0,NULL,53.50,36968.50,NULL,53.50,0.00,0.00,691.00,691.00,691.000000,21,NULL,NULL,NULL,NULL,NULL),(143,'MAT-00143','LA 021','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,NULL,6.20,1829.00,NULL,6.20,0.00,0.00,295.00,295.00,295.000000,22,NULL,NULL,NULL,NULL,NULL),(144,'MAT-00144','LT 1178','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,NULL,6.00,2964.00,NULL,6.00,0.00,0.00,494.00,494.00,494.000000,22,NULL,NULL,NULL,NULL,NULL),(145,'MAT-00145','Liquor Ammonia','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'28142000',NULL,NULL,NULL,0,NULL,6.50,260.00,NULL,6.50,0.00,0.00,40.00,40.00,40.000000,23,NULL,NULL,NULL,NULL,NULL),(146,'MAT-00146','B123','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38249990',NULL,NULL,NULL,0,NULL,3.80,1987.40,NULL,3.80,0.00,0.00,523.00,523.00,523.000000,24,NULL,NULL,NULL,NULL,NULL),(147,'MAT-00147','IW08','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38249990',NULL,NULL,NULL,0,NULL,1.00,0.00,NULL,1.00,0.00,0.00,0.00,0.00,0.000000,16,NULL,NULL,NULL,NULL,NULL),(148,'MAT-00148','Rodapur ADX','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34029090',NULL,NULL,NULL,0,NULL,2.50,1197.50,NULL,2.50,0.00,0.00,479.00,479.00,479.000000,16,NULL,NULL,NULL,NULL,NULL),(149,'MAT-00149','Hycryl 55','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,2.50,807.50,NULL,2.50,0.00,0.00,323.00,323.00,323.000000,16,NULL,NULL,NULL,NULL,NULL),(150,'MAT-00150','BM 3159 CT','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,NULL,0.90,0.00,NULL,0.90,0.00,0.00,0.00,0.00,0.000000,21,NULL,NULL,NULL,NULL,NULL),(151,'MAT-00151','Soleda Roller 633 CT','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,NULL,0.80,468.00,NULL,0.80,0.00,0.00,585.00,585.00,585.000000,21,NULL,NULL,NULL,NULL,NULL),(152,'MAT-00152','Acrilan Soft 6','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,48.00,16704.00,NULL,48.00,0.00,0.00,348.00,348.00,348.000000,21,NULL,NULL,NULL,NULL,NULL),(153,'MAT-00153','Melio WO 606','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,NULL,1.80,0.00,NULL,1.80,0.00,0.00,0.00,0.00,0.000000,6,NULL,NULL,NULL,NULL,NULL),(154,'MAT-00154','Argowax 555 NT','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34049000',NULL,NULL,NULL,0,NULL,3.80,1383.20,NULL,3.80,0.00,0.00,364.00,364.00,364.000000,21,NULL,NULL,NULL,NULL,NULL),(155,'MAT-00155','Bioban 045','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38089990',NULL,NULL,NULL,0,NULL,2.80,0.00,NULL,2.80,0.00,0.00,0.00,0.00,0.000000,15,NULL,NULL,NULL,NULL,NULL),(156,'MAT-00156','LW 27703','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,NULL,1.40,665.00,NULL,1.40,0.00,0.00,475.00,475.00,475.000000,6,NULL,NULL,NULL,NULL,NULL),(157,'MAT-00157','LW 65701','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,NULL,1.80,678.60,NULL,1.80,0.00,0.00,377.00,377.00,377.000000,6,NULL,NULL,NULL,NULL,NULL),(158,'MAT-00158','Argo Fix 172','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,NULL,0.57,2966.28,NULL,0.57,0.00,0.00,5204.00,5204.00,5204.000000,21,NULL,NULL,NULL,NULL,NULL),(159,'MAT-00159','LF 1297','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,NULL,2.60,0.00,NULL,2.60,0.00,0.00,0.00,0.00,0.000000,22,NULL,NULL,NULL,NULL,NULL),(160,'MAT-00160','Lisofix M 300','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,NULL,1.50,0.00,NULL,1.50,0.00,0.00,0.00,0.00,0.000000,22,NULL,NULL,NULL,NULL,NULL),(161,'MAT-00161','Aqulan Top NG 02','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,NULL,1.00,0.00,NULL,1.00,0.00,0.00,0.00,0.00,0.000000,6,NULL,NULL,NULL,NULL,NULL),(162,'MAT-00162','Argowax 4004','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34049000',NULL,NULL,NULL,0,NULL,2.00,912.00,NULL,2.00,0.00,0.00,456.00,456.00,456.000000,21,NULL,NULL,NULL,NULL,NULL),(163,'MAT-00163','I KBEC','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38249990',NULL,NULL,NULL,0,NULL,1.00,0.00,NULL,1.00,0.00,0.00,0.00,0.00,0.000000,22,NULL,NULL,NULL,NULL,NULL),(164,'MAT-00164','Liso Top L1','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32089020',NULL,NULL,NULL,0,NULL,0.90,0.00,NULL,0.90,0.00,0.00,0.00,0.00,0.000000,22,NULL,NULL,NULL,NULL,NULL),(165,'MAT-00165','BM 3157 CT','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,NULL,0.25,146.75,NULL,0.25,0.00,0.00,587.00,587.00,587.000000,21,NULL,NULL,NULL,NULL,NULL),(166,'MAT-00166','Top U95 kT','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32089020',NULL,NULL,NULL,0,NULL,0.35,164.15,NULL,0.35,0.00,0.00,469.00,469.00,469.000000,16,NULL,NULL,NULL,NULL,NULL),(167,'MAT-00167','Lucido 1186','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,NULL,5.50,3712.50,NULL,5.50,0.00,0.00,675.00,675.00,675.000000,21,NULL,NULL,NULL,NULL,NULL),(168,'MAT-00168','Acrilan 2043 E','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,1.50,607.50,NULL,1.50,0.00,0.00,405.00,405.00,405.000000,21,NULL,NULL,NULL,NULL,NULL),(169,'MAT-00169','Argowax 4094','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34049000',NULL,NULL,NULL,0,NULL,3.50,1876.00,NULL,3.50,0.00,0.00,536.00,536.00,536.000000,21,NULL,NULL,NULL,NULL,NULL),(170,'MAT-00170','Hypro 85','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,NULL,21.00,5124.00,NULL,21.00,0.00,0.00,244.00,244.00,244.000000,16,NULL,NULL,NULL,NULL,NULL),(171,'MAT-00171','Hypro 86','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,NULL,25.00,4600.00,NULL,25.00,0.00,0.00,184.00,184.00,184.000000,16,NULL,NULL,NULL,NULL,NULL),(172,'MAT-00172','Top 1591','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32089020',NULL,NULL,NULL,0,NULL,17.00,6477.00,NULL,17.00,0.00,0.00,381.00,381.00,381.000000,21,NULL,NULL,NULL,NULL,NULL),(173,'MAT-00173','Aquarius 3700 N','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,8.00,6488.00,NULL,8.00,0.00,0.00,811.00,811.00,811.000000,21,NULL,NULL,NULL,NULL,NULL),(174,'MAT-00174','Filler NMR','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,NULL,3.00,1308.00,NULL,3.00,0.00,0.00,436.00,436.00,436.000000,21,NULL,NULL,NULL,NULL,NULL),(175,'MAT-00175','4139','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38249990',NULL,NULL,NULL,0,NULL,0.70,490.00,NULL,0.70,0.00,0.00,700.00,700.00,700.000000,21,NULL,NULL,NULL,NULL,NULL),(176,'MAT-00176','Q Wax 80','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34049000',NULL,NULL,NULL,0,NULL,0.35,0.00,NULL,0.35,0.00,0.00,0.00,0.00,0.000000,21,NULL,NULL,NULL,NULL,NULL),(177,'MAT-00177','4134','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38249990',NULL,NULL,NULL,0,NULL,0.60,140.40,NULL,0.60,0.00,0.00,234.00,234.00,234.000000,21,NULL,NULL,NULL,NULL,NULL),(178,'MAT-00178','Hy 88','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38249990',NULL,NULL,NULL,0,NULL,0.50,98.00,NULL,0.50,0.00,0.00,196.00,196.00,196.000000,21,NULL,NULL,NULL,NULL,NULL),(179,'MAT-00179','96','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,0.30,153.00,NULL,0.30,0.00,0.00,510.00,510.00,510.000000,21,NULL,NULL,NULL,NULL,NULL),(180,'MAT-00180','Iride Dark Brn LX','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,10.00,6020.00,NULL,10.00,0.00,0.00,602.00,602.00,602.000000,21,NULL,NULL,NULL,NULL,NULL),(181,'MAT-00181','Iride Lemon LX','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,2.00,0.00,NULL,2.00,0.00,0.00,0.00,0.00,0.000000,21,NULL,NULL,NULL,NULL,NULL),(182,'MAT-00182','Iride Bianco N','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,50.00,35550.00,NULL,50.00,0.00,0.00,711.00,711.00,711.000000,21,NULL,NULL,NULL,NULL,NULL),(183,'MAT-00183','Iride Brown LX','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,1.50,756.00,NULL,1.50,0.00,0.00,504.00,504.00,504.000000,21,NULL,NULL,NULL,NULL,NULL),(184,'MAT-00184','Iride Yellow LX','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,0.00,0.00,NULL,0.00,0.00,0.00,1098.00,1098.00,1098.000000,21,NULL,NULL,NULL,NULL,NULL),(185,'MAT-00185','Iride Green LX','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,0.50,376.50,NULL,0.50,0.00,0.00,753.00,753.00,753.000000,21,NULL,NULL,NULL,NULL,NULL),(186,'MAT-00186','Iride Fuxia LX','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,4.70,6218.10,NULL,4.70,0.00,0.00,1323.00,1323.00,1323.000000,21,NULL,NULL,NULL,NULL,NULL),(187,'MAT-00187','Iride Bordo LX','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,5.70,7518.30,NULL,5.70,0.00,0.00,1319.00,1319.00,1319.000000,21,NULL,NULL,NULL,NULL,NULL),(188,'MAT-00188','Iride Red LX','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,1.50,1165.50,NULL,1.50,0.00,0.00,777.00,777.00,777.000000,21,NULL,NULL,NULL,NULL,NULL),(189,'MAT-00189','Iride Black LX','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,4.50,1966.50,NULL,4.50,0.00,0.00,437.00,437.00,437.000000,21,NULL,NULL,NULL,NULL,NULL),(190,'MAT-00190','Iride Ocra','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,5.00,2465.00,NULL,5.00,0.00,0.00,493.00,493.00,493.000000,21,NULL,NULL,NULL,NULL,NULL),(191,'MAT-00191','AC 1 Eco Navy Blue','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,3.00,1149.00,NULL,3.00,0.00,0.00,383.00,383.00,383.000000,16,NULL,NULL,NULL,NULL,NULL),(192,'MAT-00192','AC 1 Eco Jet Black','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,15.00,4140.00,NULL,15.00,0.00,0.00,276.00,276.00,276.000000,16,NULL,NULL,NULL,NULL,NULL),(193,'MAT-00193','AC 1 Eco Yellow Brown','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,5.00,2750.00,NULL,5.00,0.00,0.00,550.00,550.00,550.000000,16,NULL,NULL,NULL,NULL,NULL),(194,'MAT-00194','Supronil Dk Brn LD 5924','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,0.40,568.80,NULL,0.40,0.00,0.00,1422.00,1422.00,1422.000000,6,NULL,NULL,NULL,NULL,NULL),(195,'MAT-00195','Supronil Yellow LD 5928','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,0.80,10168.80,NULL,0.80,0.00,0.00,12711.00,12711.00,12711.000000,6,NULL,NULL,NULL,NULL,NULL),(196,'MAT-00196','Supronil Orange LD 5957','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,0.70,1028.30,NULL,0.70,0.00,0.00,1469.00,1469.00,1469.000000,6,NULL,NULL,NULL,NULL,NULL),(197,'MAT-00197','Supronil Lemon LD 5927','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,0.50,2827.00,NULL,0.50,0.00,0.00,5654.00,5654.00,5654.000000,6,NULL,NULL,NULL,NULL,NULL),(198,'MAT-00198','Supronil Y/Brown LD 5985','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,0.65,921.70,NULL,0.65,0.00,0.00,1418.00,1418.00,1418.000000,6,NULL,NULL,NULL,NULL,NULL),(199,'MAT-00199','Supronil Black W LD 5932','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,0.70,662.20,NULL,0.70,0.00,0.00,946.00,946.00,946.000000,6,NULL,NULL,NULL,NULL,NULL),(200,'MAT-00200','Luxolin Green','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,0.10,0.00,NULL,0.10,0.00,0.00,0.00,0.00,0.000000,15,NULL,NULL,NULL,NULL,NULL),(201,'MAT-00201','Katiolux Brown','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,0.75,0.00,NULL,0.75,0.00,0.00,0.00,0.00,0.000000,25,NULL,NULL,NULL,NULL,NULL),(202,'MAT-00202','Pulver PS Silver','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041790',NULL,NULL,NULL,0,NULL,0.50,0.00,NULL,0.50,0.00,0.00,0.00,0.00,0.000000,26,NULL,NULL,NULL,NULL,NULL),(203,'MAT-00203','Pulver PS Blue','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,0.23,0.00,NULL,0.23,0.00,0.00,0.00,0.00,0.000000,26,NULL,NULL,NULL,NULL,NULL),(204,'MAT-00204','Pulver PS Red','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,0.40,0.00,NULL,0.40,0.00,0.00,0.00,0.00,0.000000,26,NULL,NULL,NULL,NULL,NULL),(205,'MAT-00205','Pulver PS Pale Gold','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041790',NULL,NULL,NULL,0,NULL,0.25,0.00,NULL,0.25,0.00,0.00,0.00,0.00,0.000000,26,NULL,NULL,NULL,NULL,NULL),(206,'MAT-00206','Hyper Gold','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041790',NULL,NULL,NULL,0,NULL,0.50,0.00,NULL,0.50,0.00,0.00,0.00,0.00,0.000000,16,NULL,NULL,NULL,NULL,NULL),(207,'MAT-00207','Supronil Red LD 5986','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,1.00,1699.00,NULL,1.00,0.00,0.00,1699.00,1699.00,1699.000000,6,NULL,NULL,NULL,NULL,NULL),(208,'MAT-00208','Supronil R/Brn LD 5981','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-25 15:43:08',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,NULL,1.00,2034.00,NULL,1.00,0.00,0.00,2034.00,2034.00,2034.000000,6,NULL,NULL,NULL,NULL,NULL),(209,'MAT-00209','Formic Acid','Kilogram',3,3,'INR','Wet-end',7,'2026-09-25 12:46:14','2026-09-25 15:43:08',NULL,'Active',16,16,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0.00,0.00,NULL,0.00,0.00,0.00,0.00,0.00,0.000000,3,NULL,NULL,NULL,NULL,NULL),(210,'MAT-00210','Relugan G724','Kilogram',3,3,'INR','Wet-end',8,'2026-09-26 05:44:13','2026-09-26 05:44:13',NULL,'Active',16,NULL,NULL,'4',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0.00,0.00,NULL,0.00,0.00,0.00,0.00,0.00,0.000000,NULL,NULL,NULL,NULL,NULL,NULL),(211,'MAT-00211','Sheep Wet Blue','Piece',6,1,'INR','Wet-end',7,'2026-09-26 12:14:04','2026-09-26 12:46:26',NULL,'Active',7,7,NULL,'4',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'AKM Wetblue ',0.00,0.00,NULL,0.00,0.00,0.00,0.00,0.00,0.000000,14,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `materials` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_materials_before_insert_stock_value` BEFORE INSERT ON `materials` FOR EACH ROW BEGIN
  SET NEW.opening_stock_value = COALESCE(NEW.opening_stock, 0) * COALESCE(NEW.rate, 0);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_materials_before_update_stock_value` BEFORE UPDATE ON `materials` FOR EACH ROW BEGIN
  SET NEW.opening_stock_value = COALESCE(NEW.opening_stock, 0) * COALESCE(NEW.rate, 0);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `payment_receipts`
--

DROP TABLE IF EXISTS `payment_receipts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_receipts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `receipt_no` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sales_order_id` int NOT NULL,
  `receipt_date` date NOT NULL,
  `payment_mode` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Bank Transfer',
  `amount` decimal(14,2) DEFAULT '0.00',
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `receipt_no` (`receipt_no`),
  KEY `idx_pr_order` (`sales_order_id`),
  CONSTRAINT `fk_pr_order` FOREIGN KEY (`sales_order_id`) REFERENCES `sales_orders` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `entry_no` varchar(50) NOT NULL,
  `entry_date` date NOT NULL,
  `stock_date` date NOT NULL,
  `warehouse_id` int DEFAULT NULL,
  `location_rack` varchar(100) DEFAULT NULL,
  `godown` varchar(100) DEFAULT NULL,
  `batch_no` varchar(100) DEFAULT NULL,
  `from_item_code` varchar(100) DEFAULT NULL,
  `to_item_code` varchar(100) DEFAULT NULL,
  `item_group` varchar(100) DEFAULT NULL,
  `item_id` int DEFAULT NULL,
  `uom` varchar(20) DEFAULT 'KG',
  `reference_no` varchar(100) DEFAULT NULL,
  `total_items` int DEFAULT '0',
  `matched_items` int DEFAULT '0',
  `variance_items` int DEFAULT '0',
  `total_variance_qty` decimal(12,3) DEFAULT '0.000',
  `total_variance_value` decimal(14,2) DEFAULT '0.00',
  `status` enum('Draft','In-Progress','Completed','Cancelled') DEFAULT 'Draft',
  `remarks` text,
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `physical_stock_entries`
--

LOCK TABLES `physical_stock_entries` WRITE;
/*!40000 ALTER TABLE `physical_stock_entries` DISABLE KEYS */;
INSERT INTO `physical_stock_entries` VALUES (1,'PSE-2024-00045','2024-05-20','2024-05-20',NULL,'All','Main Store',NULL,NULL,NULL,'All',NULL,'All','Ref / Document No.',6,2,4,-7.000,-1320.00,'Completed','Enter remarks (optional)...',1,NULL,NULL,'2026-07-21 07:07:33','2026-07-21 07:07:33');
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
  `item_code` varchar(50) NOT NULL,
  `item_description` varchar(255) DEFAULT NULL,
  `uom` varchar(20) DEFAULT 'KG',
  `batch_no` varchar(100) DEFAULT NULL,
  `location_rack` varchar(100) DEFAULT NULL,
  `system_qty` decimal(12,3) DEFAULT '0.000',
  `physical_qty` decimal(12,3) DEFAULT '0.000',
  `variance_qty` decimal(12,3) DEFAULT '0.000',
  `variance_value` decimal(14,2) DEFAULT '0.00',
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_psei_entry` (`entry_id`),
  KEY `idx_psei_item_code` (`item_code`),
  KEY `idx_psei_batch` (`batch_no`),
  KEY `idx_psei_seq` (`entry_id`,`seq`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `physical_stock_entry_items`
--

LOCK TABLES `physical_stock_entry_items` WRITE;
/*!40000 ALTER TABLE `physical_stock_entry_items` DISABLE KEYS */;
INSERT INTO `physical_stock_entry_items` VALUES (1,1,1,'RAW-001','Cow Leather - Black','SQ.FT','BATCH-240501','A-01-01',125.000,120.000,-5.000,-1250.00,NULL,'2026-07-21 07:07:33','2026-07-21 07:07:33'),(2,1,2,'RAW-002','Sheep Leather - White','SQ.FT','BATCH-240528','A-01-02',200.000,200.000,0.000,0.00,NULL,'2026-07-21 07:07:33','2026-07-21 07:07:33'),(3,1,3,'CHEM-001','Chrome Powder','KG','BATCH-240503','B-02-01',50.000,48.000,-2.000,-320.00,NULL,'2026-07-21 07:07:33','2026-07-21 07:07:33'),(4,1,4,'CHEM-005','Retanning Agent','KG','BATCH-240530','B-02-02',75.000,80.000,5.000,750.00,NULL,'2026-07-21 07:07:33','2026-07-21 07:07:33'),(5,1,5,'PKG-010','Plastic Bag Large','NOS','BATCH-240501','C-03-01',1000.000,1000.000,0.000,0.00,NULL,'2026-07-21 07:07:33','2026-07-21 07:07:33'),(6,1,6,'ACC-002','Edge Paint - Black','LTR','BATCH-240525','B-02-03',30.000,25.000,-5.000,-500.00,NULL,'2026-07-21 07:07:33','2026-07-21 07:07:33');
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
  `supplier_part_no` varchar(100) DEFAULT NULL,
  `item_group` varchar(100) DEFAULT NULL,
  `uom` varchar(20) DEFAULT 'KG',
  `current_price` decimal(12,2) DEFAULT '0.00',
  `requested_price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `currency` varchar(10) DEFAULT 'INR',
  `change_amount` decimal(12,2) DEFAULT '0.00',
  `change_percent` decimal(5,2) DEFAULT '0.00',
  `effective_from` date DEFAULT NULL,
  `effective_to` date DEFAULT NULL,
  `last_approved_price` decimal(12,2) DEFAULT '0.00',
  `last_approved_date` date DEFAULT NULL,
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `approval_notes` text,
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pai_request` (`request_id`),
  KEY `idx_pai_supplier` (`supplier_id`),
  KEY `idx_pai_material` (`material_id`),
  KEY `idx_pai_status` (`status`),
  KEY `idx_pai_seq` (`request_id`,`seq`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `price_approval_items`
--

LOCK TABLES `price_approval_items` WRITE;
/*!40000 ALTER TABLE `price_approval_items` DISABLE KEYS */;
INSERT INTO `price_approval_items` VALUES (1,1,1,1,1,'CP-1001','Chemicals','KG',210.00,205.00,'INR',-5.00,-2.38,'2024-05-16',NULL,210.00,'2024-05-01','Pending','Monthly revision','Price effective from 16 May 2024','2026-07-21 07:07:33','2026-07-21 07:07:33'),(2,2,1,2,5,NULL,'Chemicals','LTR',64.00,60.00,'INR',-4.00,-6.25,'2024-05-18',NULL,64.00,'2024-04-01','Pending','Price reduced','Quarterly revision','2026-07-21 07:07:33','2026-07-21 07:07:33'),(3,3,1,3,2,'ST-2001','Chemicals','KG',48.00,52.00,'INR',4.00,8.33,'2024-05-20',NULL,48.00,'2024-05-10','Pending','New supplier','New contract','2026-07-21 07:07:33','2026-07-21 07:07:33'),(4,4,1,1,6,'FL-4001','Chemicals','KG',95.00,92.00,'INR',-3.00,-3.16,'2024-05-21',NULL,95.00,'2024-04-01','Pending','Price adjustment','Old price','2026-07-21 07:07:33','2026-07-21 07:07:33');
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
  `request_no` varchar(50) NOT NULL,
  `request_date` date NOT NULL,
  `requested_by` int NOT NULL,
  `department` varchar(100) DEFAULT 'Purchase',
  `total_items` int DEFAULT '0',
  `status` enum('Draft','Pending','Under Review','Approved','Rejected','Partially Approved') DEFAULT 'Draft',
  `approval_notes` text,
  `remarks` text,
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `price_approval_requests`
--

LOCK TABLES `price_approval_requests` WRITE;
/*!40000 ALTER TABLE `price_approval_requests` DISABLE KEYS */;
INSERT INTO `price_approval_requests` VALUES (1,'PRQ-2024-0012','2024-05-16',1,'Purchase',1,'Pending','Supplier has given revised price list for May 2024. Approval requested.','Price revision',1,NULL,NULL,'2026-07-21 07:07:33','2026-07-21 07:07:33'),(2,'PRQ-2024-0013','2024-05-16',1,'Purchase',1,'Pending','Price adjustment for new contract','FineChem industries price update',1,NULL,NULL,'2026-07-21 07:07:33','2026-07-21 07:07:33'),(3,'PRQ-2024-0014','2024-05-17',1,'Purchase',1,'Pending','New supplier pricing','Tannery Supplies Ltd. - Sodium Sulphide',1,NULL,NULL,'2026-07-21 07:07:33','2026-07-21 07:07:33'),(4,'PRQ-2024-0015','2024-05-17',1,'Purchase',1,'Pending','Price adjustment','Cow Leather - Wet Blue price update',1,NULL,NULL,'2026-07-21 07:07:33','2026-07-21 07:07:33');
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
  `action_type` enum('Submitted','Approved','Rejected','Revised','Cancelled') NOT NULL,
  `action_by` int NOT NULL,
  `action_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `notes` text,
  `from_status` varchar(50) DEFAULT NULL,
  `to_status` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_paw_request` (`request_id`),
  KEY `idx_paw_item` (`item_id`),
  KEY `idx_paw_action_date` (`action_date`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `price_approval_workflow`
--

LOCK TABLES `price_approval_workflow` WRITE;
/*!40000 ALTER TABLE `price_approval_workflow` DISABLE KEYS */;
INSERT INTO `price_approval_workflow` VALUES (1,1,1,'Submitted',1,'2026-07-21 07:07:33','Submitted for approval','Draft','Pending','2026-07-21 07:07:33');
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
  `uom` varchar(20) DEFAULT 'KG',
  `unit_price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `discount_percent` decimal(5,2) DEFAULT '0.00',
  `discount_amount` decimal(12,2) DEFAULT '0.00',
  `net_price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pb_pricing` (`pricing_id`),
  KEY `idx_pb_seq` (`pricing_id`,`seq`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `price_breaks`
--

LOCK TABLES `price_breaks` WRITE;
/*!40000 ALTER TABLE `price_breaks` DISABLE KEYS */;
INSERT INTO `price_breaks` VALUES (1,1,1,100.00,499.99,'KG',205.00,0.00,0.00,205.00,'2026-07-21 07:07:33','2026-07-21 07:07:33'),(2,1,2,500.00,999.99,'KG',198.00,3.41,6.99,198.00,'2026-07-21 07:07:33','2026-07-21 07:07:33'),(3,1,3,1000.00,999999.99,'KG',190.00,7.32,14.64,190.00,'2026-07-21 07:07:33','2026-07-21 07:07:33');
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
  `change_type` enum('Increase','Decrease','No Change') DEFAULT 'No Change',
  `change_reason` varchar(255) DEFAULT NULL,
  `effective_from` date DEFAULT NULL,
  `effective_to` date DEFAULT NULL,
  `changed_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pch_pricing` (`pricing_id`),
  KEY `idx_pch_material` (`material_id`),
  KEY `idx_pch_supplier` (`supplier_id`),
  KEY `idx_pch_effective` (`effective_from`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `price_change_history`
--

LOCK TABLES `price_change_history` WRITE;
/*!40000 ALTER TABLE `price_change_history` DISABLE KEYS */;
INSERT INTO `price_change_history` VALUES (1,NULL,1,1,220.00,210.00,-4.55,'Decrease','Monthly revision','2024-04-01','2024-04-30',1,'2026-07-21 07:07:33'),(2,NULL,1,1,210.00,200.00,-4.76,'Decrease','Monthly revision','2024-05-01','2024-05-30',1,'2026-07-21 07:07:33'),(3,NULL,2,1,180.00,185.00,2.78,'Increase','Quarterly revision','2024-05-01','2024-05-31',1,'2026-07-21 07:07:33'),(4,NULL,6,1,145.00,130.00,-10.34,'Decrease','Price reduced','2024-05-01','2024-05-31',1,'2026-07-21 07:07:33');
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
  `parameter_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `default_value` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `min_value` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `max_value` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
INSERT INTO `process_stage_parameters` VALUES (1,3,'Spray Pressure','bar','3.5','2.0','5.0',1,1,'2026-07-05 14:29:55','2026-07-05 14:29:55'),(2,3,'Nozzle Size','mm','1.5','1.0','2.5',1,2,'2026-07-05 14:29:55','2026-07-05 14:29:55'),(3,3,'Viscosity','sec','20','15','30',1,3,'2026-07-05 14:29:55','2026-07-05 14:29:55'),(4,4,'Temperature','Ôö¼ÔûæC','65','50','80',1,1,'2026-07-05 14:29:55','2026-07-05 14:29:55'),(5,4,'Airflow Speed','m/s','2.0','1.0','5.0',1,2,'2026-07-05 14:29:55','2026-07-05 14:29:55'),(6,4,'Duration','min','20','10','40',1,3,'2026-07-05 14:29:55','2026-07-05 14:29:55'),(7,5,'Temperature','Ôö¼ÔûæC','95','80','120',1,1,'2026-07-05 14:29:55','2026-07-05 14:29:55'),(8,5,'Pressure','bar','4.0','2.0','6.0',1,2,'2026-07-05 14:29:55','2026-07-05 14:29:55'),(9,5,'Roller Speed','m/min','5','3','10',1,3,'2026-07-05 14:29:55','2026-07-05 14:29:55'),(10,6,'Spray Pressure','bar','3.0','2.0','4.5',1,1,'2026-07-05 14:29:55','2026-07-05 14:29:55'),(11,6,'Passes','count','2','1','4',1,2,'2026-07-05 14:29:55','2026-07-05 14:29:55');
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
  `code` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `seq` int DEFAULT '0',
  `uom` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Active','Inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_processstage_code` (`code`),
  KEY `idx_ps_deleted` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `process_stages`
--

LOCK TABLES `process_stages` WRITE;
/*!40000 ALTER TABLE `process_stages` DISABLE KEYS */;
INSERT INTO `process_stages` VALUES (1,'INS-01','Leather Inspection','Inspect incoming leather for defects',10,NULL,'Inactive','2026-07-05 14:29:55','2026-09-01 16:07:50',NULL,NULL,'2026-09-01 16:07:50'),(2,'BUFF-01','Buffing','Buff leather surface for smoothness',20,NULL,'Inactive','2026-07-05 14:29:55','2026-09-01 16:07:50',NULL,NULL,'2026-09-01 16:07:50'),(3,'SPRAY-01','Spray Base Coat','Apply base coat spraying',30,NULL,'Inactive','2026-07-05 14:29:55','2026-09-01 16:07:50',NULL,NULL,'2026-09-01 16:07:50'),(4,'DRY-01','Drying','Dry leather in tunnel dryer',40,NULL,'Inactive','2026-07-05 14:29:55','2026-09-01 16:07:50',NULL,7,'2026-09-01 16:07:50'),(5,'IRON-01','Ironing','Apply heat and pressure',50,NULL,'Inactive','2026-07-05 14:29:55','2026-09-01 16:07:50',NULL,NULL,'2026-09-01 16:07:50'),(6,'SPRAY-02','Top Coat','Apply top finish coating',60,NULL,'Inactive','2026-07-05 14:29:55','2026-09-01 16:07:50',NULL,NULL,'2026-09-01 16:07:50'),(7,'DRY-02','Final Drying','Final drying process',70,NULL,'Inactive','2026-07-05 14:29:55','2026-09-01 16:07:50',NULL,NULL,'2026-09-01 16:07:50'),(8,'INS-02','Final Inspection','QC check for finished leather',80,NULL,'Inactive','2026-07-05 14:29:55','2026-09-01 16:07:50',NULL,NULL,'2026-09-01 16:07:50'),(10,'PS-00002','testing','',60,NULL,'Inactive','2026-07-13 22:36:31','2026-09-01 16:07:50',1,1,'2026-09-01 16:07:50'),(11,'PS-00003','Wet End','Wet End',1,'Piece','Active','2026-09-01 16:08:32','2026-09-01 16:08:32',7,NULL,NULL),(12,'PS-00004','Finishing','',2,'Piece','Active','2026-09-01 16:08:52','2026-09-01 16:08:52',7,NULL,NULL),(13,'PS-00005','Measurement','',3,'Square Feet','Active','2026-09-01 16:09:10','2026-09-01 16:09:10',7,NULL,NULL),(14,'PS-00006','Packing','',4,'Piece','Active','2026-09-01 16:09:28','2026-09-01 16:09:28',7,NULL,NULL);
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
  `code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('Active','Inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_prodcat_code` (`code`),
  KEY `idx_pc_deleted` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_categories`
--

LOCK TABLES `product_categories` WRITE;
/*!40000 ALTER TABLE `product_categories` DISABLE KEYS */;
INSERT INTO `product_categories` VALUES (1,'FIN-LEATHER','Finished Leather','Fully finished leather ready for footwear and upholstery','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(2,'SEMI-FINISH','Semi Finished','Partially processed leather','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(3,'CRUST','Crust Leather','Unfinished tanned leather','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(4,'WET-BLUE','Wet Blue','Chrome tanned leather in wet condition','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(5,'SPLITS','Splits','Split layer leather','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(11,'test-product-cat','test-product-ca','test-product-cat','Inactive','2026-07-05 14:30:08','2026-09-25 15:33:37',NULL,1,'2026-09-25 15:33:37'),(12,'CAT-00NaN','test','test','Inactive','2026-07-13 22:15:37','2026-09-25 15:33:32',1,1,'2026-09-25 15:33:32'),(13,'CAT-00001','Cost Component','','Active','2026-08-11 14:48:00','2026-08-11 14:48:00',7,NULL,NULL),(14,'CAT-00002','Sheep Wet blue','','Active','2026-09-25 11:23:12','2026-09-25 11:23:12',16,NULL,NULL),(15,'CAT-00003','Chemicals','','Active','2026-09-25 15:37:58','2026-09-25 15:37:58',7,NULL,NULL);
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
  `batch_no` varchar(30) DEFAULT NULL,
  `batch_qty` decimal(12,2) DEFAULT '0.00',
  `status` varchar(30) DEFAULT 'Pending',
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_pb_plan` (`plan_id`),
  CONSTRAINT `fk_pb_plan` FOREIGN KEY (`plan_id`) REFERENCES `production_plans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `uom` varchar(20) DEFAULT NULL,
  `required_qty` decimal(12,2) DEFAULT '0.00',
  `issued_qty` decimal(12,2) DEFAULT '0.00',
  `balance_qty` decimal(12,2) DEFAULT '0.00',
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ppi_plan` (`plan_id`),
  CONSTRAINT `fk_ppi_plan` FOREIGN KEY (`plan_id`) REFERENCES `production_plans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `stage_name` varchar(200) DEFAULT NULL,
  `capacity` decimal(12,2) DEFAULT '0.00',
  `planned_qty` decimal(12,2) DEFAULT '0.00',
  `issue_input_qty` decimal(18,2) DEFAULT '0.00',
  `planned_percent` decimal(6,2) DEFAULT '100.00',
  `receipt_qty` decimal(12,2) DEFAULT '0.00',
  `rejection_qty` decimal(12,2) DEFAULT '0.00',
  `output_qty` decimal(12,2) DEFAULT '0.00',
  `output_percent` decimal(6,2) DEFAULT '0.00',
  `wip_qty` decimal(12,2) DEFAULT '0.00',
  `status` varchar(30) DEFAULT 'In-Process',
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pps_plan` (`plan_id`),
  CONSTRAINT `fk_pps_plan` FOREIGN KEY (`plan_id`) REFERENCES `production_plans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=130 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `production_plan_stages`
--

LOCK TABLES `production_plan_stages` WRITE;
/*!40000 ALTER TABLE `production_plan_stages` DISABLE KEYS */;
INSERT INTO `production_plan_stages` VALUES (99,6,1,9,'Packing',0.00,6.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'Planned',NULL,'2026-08-24 07:00:38','2026-08-24 07:00:38'),(100,7,1,11,'Wet End',0.00,400.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'Planned',NULL,'2026-09-01 16:11:59','2026-09-01 16:11:59'),(101,7,2,12,'Finishing',0.00,400.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'Planned',NULL,'2026-09-01 16:12:00','2026-09-01 16:12:00'),(102,7,3,13,'Measurement',0.00,2500.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'Planned',NULL,'2026-09-01 16:12:00','2026-09-01 16:12:00'),(103,7,4,14,'Packing',0.00,400.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'Planned',NULL,'2026-09-01 16:12:00','2026-09-01 16:12:00'),(110,8,1,13,'Measurement',0.00,8.00,75.00,100.00,0.00,0.00,75.00,0.00,0.00,'Completed',NULL,'2026-09-06 12:08:58','2026-09-06 12:08:58'),(111,8,2,11,'Wet End',0.00,7.00,15.00,100.00,0.00,0.00,15.00,0.00,0.00,'Completed',NULL,'2026-09-06 12:08:58','2026-09-06 12:08:58'),(112,8,3,14,'Packing',0.00,10.00,10.00,100.00,0.00,0.00,10.00,0.00,0.00,'Completed',NULL,'2026-09-06 12:08:58','2026-09-06 12:08:58'),(113,8,4,12,'Finishing',0.00,7.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'Planned',NULL,'2026-09-06 12:08:58','2026-09-06 12:08:58'),(114,9,1,11,'Wet End',0.00,962.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'Planned',NULL,'2026-09-16 12:21:27','2026-09-16 12:21:27'),(116,10,1,13,'Measurement',0.00,961.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'Planned',NULL,'2026-09-16 13:06:43','2026-09-16 13:06:43'),(123,11,1,11,'Wet End',0.00,55.00,45.00,100.00,0.00,4.00,17.00,0.00,24.00,'In Progress',NULL,'2026-09-22 11:23:45','2026-09-22 11:23:45'),(124,11,2,12,'Finishing',0.00,60.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'Planned',NULL,'2026-09-22 11:23:45','2026-09-22 11:23:45'),(125,12,1,11,'Wet End',0.00,565.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'Planned',NULL,'2026-09-25 12:30:10','2026-09-25 12:30:10'),(129,13,1,11,'Wet End',0.00,3500.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'Planned',NULL,'2026-09-26 12:24:51','2026-09-26 12:24:51');
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
  `plan_no` varchar(30) NOT NULL,
  `plan_date` date NOT NULL,
  `sales_order_id` int DEFAULT NULL,
  `customer_order_no` varchar(100) DEFAULT NULL,
  `customer_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `article` varchar(100) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `finish` varchar(100) DEFAULT NULL,
  `warehouse_id` int DEFAULT NULL,
  `uom` varchar(20) DEFAULT 'Sq.Ft.',
  `order_qty` decimal(12,2) DEFAULT '0.00',
  `expected_yield` decimal(5,2) DEFAULT '92.00',
  `planner` varchar(100) DEFAULT NULL,
  `completed_qty` decimal(18,2) DEFAULT '0.00',
  `sales_order_qty` decimal(18,2) DEFAULT '0.00',
  `planned_qty` decimal(12,2) DEFAULT '0.00',
  `batch_qty` decimal(12,2) DEFAULT '0.00',
  `no_of_batches` int DEFAULT '0',
  `balance_qty` decimal(12,2) DEFAULT '0.00',
  `output_qty` decimal(12,2) DEFAULT '0.00',
  `output_percent` decimal(6,2) DEFAULT '0.00',
  `wip_qty` decimal(12,2) DEFAULT '0.00',
  `planned_start_date` date DEFAULT NULL,
  `planned_end_date` date DEFAULT NULL,
  `priority` varchar(20) DEFAULT 'Medium',
  `remarks` text,
  `status` varchar(30) DEFAULT 'Draft',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `plan_no` (`plan_no`),
  KEY `idx_pp_status` (`status`),
  KEY `idx_pp_deleted` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `production_plans`
--

LOCK TABLES `production_plans` WRITE;
/*!40000 ALTER TABLE `production_plans` DISABLE KEYS */;
INSERT INTO `production_plans` VALUES (6,'PRP-000001','2026-08-24',8,NULL,7,NULL,'test',NULL,NULL,NULL,'Pcs',0.00,92.00,NULL,7.00,6.00,6.00,0.00,0,0.00,0.00,0.00,6.00,NULL,NULL,'Medium','test','Completed',7,NULL,'2026-08-24 07:00:38','2026-08-24 07:00:38',NULL),(7,'PRP-000002','2026-09-01',11,NULL,9,NULL,'Sheep Softy','Softy / Black',NULL,NULL,'Pcs',2500.00,92.00,NULL,0.00,2500.00,3700.00,0.00,0,0.00,0.00,0.00,3700.00,NULL,NULL,'Medium',NULL,'Completed',7,NULL,'2026-09-01 16:11:59','2026-09-01 16:11:59',NULL),(8,'PRP-000003','2026-09-04',11,NULL,9,NULL,'Sheep Softy','Softy / Black',NULL,NULL,'Pcs',2500.00,92.00,NULL,0.00,2500.00,32.00,0.00,0,2468.00,0.00,0.00,32.00,NULL,NULL,'Medium',NULL,'In Progress',7,7,'2026-09-04 16:33:44','2026-09-06 12:08:58',NULL),(9,'PRP-000004','2026-09-16',12,NULL,7,NULL,'Sheep  Crust Natural','Natural',NULL,NULL,'Pcs',5000.00,92.00,NULL,0.00,5000.00,962.00,0.00,0,4038.00,0.00,0.00,962.00,NULL,NULL,'Medium',NULL,'In Progress',7,NULL,'2026-09-16 12:21:27','2026-09-16 12:21:27',NULL),(10,'PRP-000005','2026-09-16',12,NULL,7,NULL,'Sheep  Crust Natural','Natural',NULL,NULL,'Pcs',5000.00,92.00,NULL,0.00,5000.00,961.00,0.00,0,4039.00,0.00,0.00,961.00,NULL,NULL,'Medium',NULL,'In Progress',7,7,'2026-09-16 13:03:10','2026-09-16 13:06:43',NULL),(11,'PRP-000006','2026-09-22',13,NULL,9,NULL,'Sheep  Crust Black','Black',NULL,NULL,'Pcs',55.00,92.00,NULL,0.00,55.00,115.00,0.00,0,0.00,0.00,0.00,115.00,NULL,NULL,'Medium',NULL,'Completed',7,7,'2026-09-22 11:05:53','2026-09-22 11:23:45',NULL),(12,'PRP-000007','2026-09-25',15,NULL,8,NULL,'Sheep  sheep upper pearl white','pearl white',NULL,NULL,'Pcs',565.00,92.00,NULL,0.00,565.00,565.00,0.00,0,0.00,0.00,0.00,565.00,NULL,NULL,'Medium',NULL,'Completed',16,NULL,'2026-09-25 12:30:10','2026-09-25 12:30:10',NULL),(13,'PRP-000008','2026-09-26',16,NULL,8,NULL,'Sheep  Full Grain White','White',NULL,NULL,'Pcs',3500.00,92.00,NULL,0.00,3500.00,3500.00,0.00,0,0.00,0.00,0.00,3500.00,NULL,NULL,'Medium',NULL,'Completed',7,7,'2026-09-26 12:21:56','2026-09-26 12:24:51',NULL);
/*!40000 ALTER TABLE `production_plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `production_status_orders`
--

DROP TABLE IF EXISTS `production_status_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `production_status_orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `production_plan_id` int DEFAULT NULL,
  `order_no` varchar(50) DEFAULT NULL,
  `plan_date` date DEFAULT NULL,
  `customer_name` varchar(200) DEFAULT NULL,
  `customer_id` int DEFAULT NULL,
  `article` varchar(200) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `process_stage` varchar(100) DEFAULT NULL,
  `issued_qty` decimal(15,2) NOT NULL DEFAULT '0.00',
  `completed_qty` decimal(15,2) NOT NULL DEFAULT '0.00',
  `balance_qty` decimal(15,2) NOT NULL DEFAULT '0.00',
  `uom` varchar(20) DEFAULT 'Pcs',
  `status` varchar(50) DEFAULT 'In-Process',
  `remarks` text,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `posted_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `posted_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_pso_order` (`order_no`),
  KEY `idx_pso_stage` (`process_stage`),
  KEY `idx_pso_status` (`status`),
  KEY `idx_pso_plan` (`production_plan_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `production_status_orders`
--

LOCK TABLES `production_status_orders` WRITE;
/*!40000 ALTER TABLE `production_status_orders` DISABLE KEYS */;
INSERT INTO `production_status_orders` VALUES (3,6,'PRP-000001','2026-08-24','CRO',7,'test',NULL,'Packing',0.00,0.00,0.00,'Pcs','Pending',NULL,7,7,NULL,'2026-08-24 07:00:38','2026-08-24 07:00:38',NULL,NULL),(4,7,'PRP-000002','2026-09-01','STY',9,'Sheep Softy','Softy / Black','Wet End',0.00,0.00,0.00,'Pcs','Pending',NULL,7,7,NULL,'2026-09-01 16:12:00','2026-09-01 16:12:00',NULL,NULL),(5,7,'PRP-000002','2026-09-01','STY',9,'Sheep Softy','Softy / Black','Finishing',0.00,0.00,0.00,'Pcs','Pending',NULL,7,7,NULL,'2026-09-01 16:12:00','2026-09-01 16:12:00',NULL,NULL),(6,7,'PRP-000002','2026-09-01','STY',9,'Sheep Softy','Softy / Black','Measurement',0.00,0.00,0.00,'Pcs','Pending',NULL,7,7,NULL,'2026-09-01 16:12:00','2026-09-01 16:12:00',NULL,NULL),(7,7,'PRP-000002','2026-09-01','STY',9,'Sheep Softy','Softy / Black','Packing',75.00,78.00,3622.00,'Pcs','In Progress',NULL,7,7,NULL,'2026-09-01 16:12:00','2026-09-05 14:31:23',NULL,NULL),(8,8,'PRP-000003','2026-09-04','STY',9,'Sheep Softy','Softy / Black','Measurement',75.00,75.00,0.00,'Pcs','Completed',NULL,7,7,NULL,'2026-09-04 16:33:44','2026-09-04 17:16:59',NULL,NULL),(9,8,'PRP-000003','2026-09-04','STY',9,'Sheep Softy','Softy / Black','Wet End',15.00,15.00,0.00,'Pcs','Posted',NULL,7,7,7,'2026-09-04 16:34:20','2026-09-04 17:07:46','2026-09-04 17:07:46',NULL),(10,8,'PRP-000003','2026-09-04','STY',9,'Sheep Softy','Softy / Black','Packing',10.00,10.00,0.00,'Pcs','In Progress',NULL,7,7,NULL,'2026-09-05 14:25:22','2026-09-05 14:27:54',NULL,NULL),(11,8,'PRP-000003','2026-09-04','STY',9,'Sheep Softy','Softy / Black','Finishing',7.00,7.00,0.00,'Pcs','In Progress',NULL,7,7,NULL,'2026-09-06 12:08:58','2026-09-06 13:33:38',NULL,NULL),(12,9,'PRP-000004','2026-09-16','CRO',7,'Sheep  Crust Natural','Natural','Wet End',962.00,962.00,0.00,'Pcs','Posted',NULL,7,7,7,'2026-09-16 12:21:27','2026-09-16 12:42:00','2026-09-16 12:42:00',NULL),(13,10,'PRP-000005','2026-09-16','CRO',7,'Sheep  Crust Natural','Natural','Measurement',0.00,0.00,0.00,'Pcs','Posted',NULL,7,7,7,'2026-09-16 13:03:10','2026-09-16 13:06:05','2026-09-16 13:04:50','2026-09-16 13:06:05'),(14,10,'PRP-000005','2026-09-16','CRO',7,'Sheep  Crust Natural','Natural','Measurement',5285.00,5285.00,0.00,'Pcs','Posted',NULL,7,7,7,'2026-09-16 13:06:43','2026-09-16 13:07:14','2026-09-16 13:07:14',NULL),(15,11,'PRP-000006','2026-09-22','STY',9,'Sheep  Crust Black','Black','Wet End',45.00,17.00,28.00,'Pcs','Posted',NULL,7,7,7,'2026-09-22 11:05:53','2026-09-22 11:20:01','2026-09-22 11:20:01',NULL),(16,11,'PRP-000006','2026-09-22','STY',9,'Sheep  Crust Black','Black','Finishing',0.00,0.00,0.00,'Pcs','Posted',NULL,7,7,7,'2026-09-22 11:05:53','2026-09-22 11:22:11','2026-09-22 11:20:11','2026-09-22 11:22:11'),(17,11,'PRP-000006','2026-09-22','STY',9,'Sheep  Crust Black','Black','Finishing',60.00,55.00,5.00,'Pcs','Posted',NULL,7,7,7,'2026-09-22 11:23:39','2026-09-22 11:25:19','2026-09-22 11:25:19',NULL),(18,12,'PRP-000007','2026-09-25','KFA',8,'Sheep  sheep upper pearl white','pearl white','Wet End',566.00,565.00,1.00,'Pcs','Completed',NULL,16,16,NULL,'2026-09-25 12:30:10','2026-09-25 12:32:11',NULL,NULL),(19,13,'PRP-000008','2026-09-26','KFA',8,'Sheep  Full Grain White','White','Wet End',607.00,607.00,0.00,'Pcs','Posted',NULL,7,7,7,'2026-09-26 12:21:56','2026-09-26 12:28:59','2026-09-26 12:28:59',NULL);
/*!40000 ALTER TABLE `production_status_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `production_status_transactions`
--

DROP TABLE IF EXISTS `production_status_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `production_status_transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `production_status_order_id` int NOT NULL,
  `transaction_no` varchar(50) NOT NULL,
  `production_date` date NOT NULL,
  `opening_qty` decimal(15,2) NOT NULL DEFAULT '0.00',
  `input_qty` decimal(15,2) NOT NULL DEFAULT '0.00',
  `output_qty` decimal(15,2) NOT NULL DEFAULT '0.00',
  `rejection_qty` decimal(15,2) NOT NULL DEFAULT '0.00',
  `wip_qty` decimal(15,2) NOT NULL DEFAULT '0.00',
  `uom` varchar(20) DEFAULT 'Pcs',
  `remarks` text,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_txn_no` (`transaction_no`),
  KEY `idx_pst_order` (`production_status_order_id`),
  KEY `idx_pst_date` (`production_date`),
  CONSTRAINT `fk_pst_ps_order` FOREIGN KEY (`production_status_order_id`) REFERENCES `production_status_orders` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `production_status_transactions`
--

LOCK TABLES `production_status_transactions` WRITE;
/*!40000 ALTER TABLE `production_status_transactions` DISABLE KEYS */;
INSERT INTO `production_status_transactions` VALUES (3,9,'TXN-260904-0001','2026-09-04',0.00,15.00,15.00,0.00,0.00,'Pcs',NULL,7,7,'2026-09-04 17:07:23','2026-09-04 17:07:23',NULL),(4,8,'TXN-260904-0002','2026-09-04',0.00,75.00,75.00,0.00,0.00,'Pcs',NULL,7,7,'2026-09-04 17:16:59','2026-09-04 17:16:59',NULL),(5,10,'TXN-260905-0001','2026-09-05',0.00,10.00,10.00,0.00,0.00,'Pcs',NULL,7,7,'2026-09-05 14:27:50','2026-09-05 14:27:50',NULL),(6,7,'TXN-260905-0002','2026-09-05',0.00,75.00,78.00,0.00,0.00,'Pcs',NULL,7,7,'2026-09-05 14:31:23','2026-09-05 14:31:23',NULL),(7,11,'TXN-260906-0001','2026-09-06',0.00,7.00,7.00,0.00,0.00,'Pcs',NULL,7,7,'2026-09-06 13:33:35','2026-09-06 13:33:35',NULL),(8,12,'TXN-260916-0001','2026-09-16',0.00,962.00,962.00,0.00,0.00,'Pcs',NULL,7,7,'2026-09-16 12:41:53','2026-09-16 12:41:53',NULL),(9,14,'TXN-260916-0002','2026-09-16',0.00,5285.00,5285.00,0.00,0.00,'Pcs',NULL,7,7,'2026-09-16 13:07:07','2026-09-16 13:07:07',NULL),(10,15,'TXN-260922-0001','2026-09-22',0.00,45.00,17.00,4.00,24.00,'Pcs',NULL,7,7,'2026-09-22 11:19:43','2026-09-22 11:19:43',NULL),(11,17,'TXN-260922-0002','2026-09-22',0.00,60.00,55.00,5.00,0.00,'Pcs',NULL,7,7,'2026-09-22 11:25:01','2026-09-22 11:25:01',NULL),(12,18,'TXN-260925-0001','2026-09-25',0.00,566.00,565.00,1.00,0.00,'Pcs',NULL,16,16,'2026-09-25 12:31:30','2026-09-25 12:31:58',NULL),(13,19,'TXN-260926-0001','2026-09-26',0.00,607.00,607.00,0.00,0.00,'Pcs',NULL,7,7,'2026-09-26 12:28:49','2026-09-26 12:28:49',NULL);
/*!40000 ALTER TABLE `production_status_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `leather_type` enum('cow','buffalo','goat','sheep') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'cow',
  `uom` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Sq. Ft.',
  `thickness` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `finish_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `standard_size` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `grade` enum('a','b','c') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'a',
  `sales_price` decimal(10,2) DEFAULT '0.00',
  `hsn_code` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Active','Inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `category_id` int DEFAULT NULL,
  `group_id` int DEFAULT NULL,
  `leather_type_id` int DEFAULT NULL,
  `uom_id` int DEFAULT NULL,
  `secondary_uom_id` int DEFAULT NULL,
  `thickness_id` int DEFAULT NULL,
  `color_id` int DEFAULT NULL,
  `finish_type_id` int DEFAULT NULL,
  `grade_id` int DEFAULT NULL,
  `hsn_code_id` int DEFAULT NULL,
  `standard_size_id` int DEFAULT NULL,
  `customer_id` int DEFAULT NULL,
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
  KEY `fk_products_customer` (`customer_id`),
  CONSTRAINT `fk_product_category` FOREIGN KEY (`category_id`) REFERENCES `product_categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_product_color` FOREIGN KEY (`color_id`) REFERENCES `colors` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_product_finish` FOREIGN KEY (`finish_type_id`) REFERENCES `finish_types` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_product_grade` FOREIGN KEY (`grade_id`) REFERENCES `grades` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_product_hsn` FOREIGN KEY (`hsn_code_id`) REFERENCES `hsn_codes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_product_leathertype` FOREIGN KEY (`leather_type_id`) REFERENCES `leather_types` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_product_stdsize` FOREIGN KEY (`standard_size_id`) REFERENCES `standard_sizes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_product_thickness` FOREIGN KEY (`thickness_id`) REFERENCES `thickness` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_product_uom` FOREIGN KEY (`uom_id`) REFERENCES `uom` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_products_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_products_group` FOREIGN KEY (`group_id`) REFERENCES `group_master` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'testing','Goat  Patent Green','Crust Leather','cow','Kilogram','Medium (1.0-1.2 mm)','Green','Patent','test','Synthetic Tanning Agents','a',1.00,'test','Inactive','2026-07-01 16:37:05','2026-09-14 09:29:37',3,NULL,3,3,NULL,2,10,7,1,NULL,5,NULL,NULL,1,NULL),(2,'PRD-00NaN','Buffalo  Patent Grey','General','cow',NULL,NULL,NULL,NULL,'demo',NULL,'a',0.00,NULL,'Active','2026-07-28 06:12:37','2026-09-14 09:29:37',1,NULL,2,NULL,NULL,4,6,7,3,5,1,NULL,7,NULL,NULL),(4,'PRD-00001','Sheep  Crust Natural','General','cow',NULL,NULL,NULL,NULL,'',NULL,'a',0.00,NULL,'Active','2026-08-10 12:21:06','2026-09-14 09:29:37',3,NULL,4,1,6,3,5,9,1,NULL,1,7,7,NULL,NULL),(5,'PRD-00002','Sheep  Crust Black','General','cow',NULL,NULL,NULL,NULL,'',NULL,'a',0.00,NULL,'Active','2026-08-10 12:23:16','2026-09-14 09:29:37',2,NULL,4,1,NULL,3,1,9,2,NULL,1,7,7,NULL,NULL),(6,'PRD-00003','Sheep  Softy Black','General','cow',NULL,NULL,NULL,NULL,'',NULL,'a',0.00,NULL,'Active','2026-09-01 15:37:55','2026-09-14 09:29:37',1,1,4,1,6,1,1,12,2,NULL,7,7,7,7,NULL),(7,'PRD-00004','Sheep  Softy off white','General','cow',NULL,NULL,NULL,NULL,'',NULL,'a',0.00,NULL,'Active','2026-09-01 15:41:27','2026-09-14 09:29:37',1,1,4,1,6,1,13,12,2,NULL,7,7,7,7,NULL),(8,'PRD-00005','Sheep  Softy Beige','General','cow',NULL,NULL,NULL,NULL,'',NULL,'a',0.00,NULL,'Active','2026-09-01 15:42:58','2026-09-14 09:29:37',1,1,4,1,6,1,7,12,2,NULL,7,7,7,7,NULL),(9,'PRD-00006','Sheep  Softy Bark','General','cow',NULL,NULL,NULL,NULL,'',NULL,'a',0.00,NULL,'Active','2026-09-01 15:44:34','2026-09-14 09:29:37',1,1,4,3,6,1,14,12,2,NULL,7,7,7,7,NULL),(10,'PRD-00007','Sheep  Pull-Up Bark','General','cow',NULL,NULL,NULL,NULL,'',NULL,'a',0.00,NULL,'Active','2026-09-05 14:04:11','2026-09-17 11:04:15',1,1,4,1,6,3,14,6,2,NULL,7,NULL,7,16,NULL),(11,'PRD-00008','Sheep  Nappa off white','General','cow',NULL,NULL,NULL,NULL,'',NULL,'a',0.00,NULL,'Active','2026-09-25 11:25:33','2026-09-25 11:25:33',14,2,4,6,6,2,13,3,2,NULL,2,NULL,16,NULL,NULL),(12,'PRD-00009','Sheep  sheep upper pearl white','General','cow',NULL,NULL,NULL,NULL,'',NULL,'a',0.00,NULL,'Active','2026-09-25 12:24:27','2026-09-25 12:24:27',1,1,4,9,NULL,5,12,13,NULL,NULL,NULL,NULL,16,NULL,NULL),(13,'PRD-00010','Sheep  Full Grain White','General','cow',NULL,NULL,NULL,NULL,'',NULL,'a',0.00,NULL,'Active','2026-09-26 11:31:26','2026-09-26 11:31:26',1,1,4,1,6,2,15,2,2,NULL,7,NULL,7,NULL,NULL);
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
  `code` varchar(20) NOT NULL,
  `name` varchar(150) NOT NULL,
  `rate_type` enum('Machine','Labour','Chemical','Overhead','Process','Other') NOT NULL DEFAULT 'Machine',
  `component_ref_id` int DEFAULT NULL COMMENT 'Reference to machine/material/process id',
  `uom` varchar(50) DEFAULT NULL COMMENT 'Per Hour, Per Pcs, Per Kg, Per Ltr, etc.',
  `rate_indian` decimal(10,2) NOT NULL DEFAULT '0.00',
  `rate_imported` decimal(10,2) NOT NULL DEFAULT '0.00',
  `effective_from` date DEFAULT NULL,
  `effective_to` date DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rate_master`
--

LOCK TABLES `rate_master` WRITE;
/*!40000 ALTER TABLE `rate_master` DISABLE KEYS */;
INSERT INTO `rate_master` VALUES (1,'RATE-00001','Spray Machine Rate','Machine',NULL,'Per Hour',150.00,250.00,NULL,NULL,'Spray machine operating rate','Active',0,NULL,NULL,NULL,'2026-07-29 07:09:19','2026-07-29 07:09:19'),(2,'RATE-00002','Dryer Machine Rate','Machine',NULL,'Per Hour',120.00,200.00,NULL,NULL,'Dryer machine operating rate','Active',0,NULL,NULL,NULL,'2026-07-29 07:09:19','2026-07-29 07:09:19'),(3,'RATE-00003','Skilled Labour Rate','Labour',NULL,'Per Hour',80.00,80.00,NULL,NULL,'Skilled labour hourly rate','Active',0,NULL,NULL,NULL,'2026-07-29 07:09:19','2026-07-29 07:09:19'),(4,'RATE-00004','Chrome Tanning Process','Process',NULL,'Per Pcs',25.00,40.00,NULL,NULL,'Chrome tanning process rate','Active',0,NULL,NULL,NULL,'2026-07-29 07:09:19','2026-07-29 07:09:19');
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
  `file_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `process_stage` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `machine` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration` int DEFAULT '0',
  `temperature` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `speed` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `qc_check` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
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
  `code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `leather_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `thickness` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `process_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'finishing',
  `color` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `finish_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uom` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Sq. Ft.',
  `status` enum('active','draft','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `valid_from` date DEFAULT NULL,
  `valid_to` date DEFAULT NULL,
  `version` int DEFAULT '1',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `product_id` int DEFAULT NULL,
  `bom_id` int DEFAULT NULL,
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
  KEY `fk_recipe_bom` (`bom_id`),
  CONSTRAINT `fk_recipe_bom` FOREIGN KEY (`bom_id`) REFERENCES `boms` (`id`) ON DELETE SET NULL,
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
INSERT INTO `recipes` VALUES (1,'Testing new','testing','cow','Medium (1.0-1.2 mm)','finishing','test','semi-aniline','Kilogram','active','2026-06-24','2026-07-10',1,'test','testing other','2026-07-03 17:09:16','2026-07-07 15:49:42',1,NULL,5,7,10,3,2,NULL,3);
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
  `menu_path` varchar(200) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_menu` (`role_id`,`menu_path`),
  CONSTRAINT `role_menu_access_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=801 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_menu_access`
--

LOCK TABLES `role_menu_access` WRITE;
/*!40000 ALTER TABLE `role_menu_access` DISABLE KEYS */;
INSERT INTO `role_menu_access` VALUES (716,9,'/dashboard','2026-09-16 09:11:51'),(717,9,'/sales-orders','2026-09-16 09:11:51'),(719,10,'/dashboard','2026-09-16 09:11:51'),(720,10,'/production-plan','2026-09-16 09:11:51'),(721,10,'/production-plan/new','2026-09-16 09:11:51'),(722,11,'/dashboard','2026-09-16 09:11:51'),(723,11,'/material-issue','2026-09-16 09:11:51'),(725,12,'/dashboard','2026-09-16 09:11:51'),(726,12,'/production-status','2026-09-16 09:11:51'),(728,13,'/dashboard','2026-09-16 09:11:51'),(729,13,'/general-cost','2026-09-16 09:11:51'),(730,13,'/machine-cost','2026-09-16 09:11:51'),(731,13,'/costing-report','2026-09-16 09:11:51'),(735,1,'/batch-completion','2026-09-26 07:10:12'),(736,1,'/batch-lot-tracking','2026-09-26 07:10:12'),(737,1,'/batch-process','2026-09-26 07:10:12'),(738,1,'/bom','2026-09-26 07:10:12'),(739,1,'/bom-revision','2026-09-26 07:10:12'),(740,1,'/business-units','2026-09-26 07:10:12'),(741,1,'/chemical-master','2026-09-26 07:10:12'),(742,1,'/color','2026-09-26 07:10:12'),(743,1,'/company','2026-09-26 07:10:12'),(744,1,'/cost-analysis','2026-09-26 07:10:12'),(745,1,'/cost-breakdown','2026-09-26 07:10:12'),(746,1,'/costing-report','2026-09-26 07:10:12'),(747,1,'/customer-master','2026-09-26 07:10:12'),(748,1,'/dashboard','2026-09-26 07:10:12'),(749,1,'/data-templates','2026-09-26 07:10:12'),(750,1,'/database-backups','2026-09-26 07:10:12'),(751,1,'/department-master','2026-09-26 07:10:12'),(752,1,'/finish-type','2026-09-26 07:10:12'),(753,1,'/general-cost','2026-09-26 07:10:12'),(754,1,'/grade','2026-09-26 07:10:12'),(755,1,'/grn','2026-09-26 07:10:12'),(756,1,'/group-master','2026-09-26 07:10:12'),(757,1,'/hsn-code','2026-09-26 07:10:12'),(758,1,'/inventory-reports','2026-09-26 07:10:12'),(759,1,'/leather-type','2026-09-26 07:10:12'),(760,1,'/location-rack','2026-09-26 07:10:12'),(761,1,'/machine','2026-09-26 07:10:12'),(762,1,'/machine-cost','2026-09-26 07:10:12'),(763,1,'/material-issue','2026-09-26 07:10:12'),(764,1,'/material-receipt','2026-09-26 07:10:12'),(765,1,'/material-requirement','2026-09-26 07:10:12'),(766,1,'/monthly-batch-process','2026-09-26 07:10:12'),(767,1,'/physical-stock-entry','2026-09-26 07:10:12'),(768,1,'/process-stage','2026-09-26 07:10:12'),(769,1,'/product-category','2026-09-26 07:10:12'),(770,1,'/product-master','2026-09-26 07:10:12'),(771,1,'/production-plan','2026-09-26 07:10:12'),(772,1,'/production-plan/new','2026-09-26 07:10:12'),(773,1,'/production-status','2026-09-26 07:10:12'),(774,1,'/purchase-orders','2026-09-26 07:10:12'),(775,1,'/rate-master','2026-09-26 07:10:12'),(776,1,'/recipe-creation','2026-09-26 07:10:12'),(777,1,'/reports','2026-09-26 07:10:12'),(778,1,'/reports/actual-production','2026-09-26 07:10:12'),(779,1,'/reports/inventory','2026-09-26 07:10:12'),(780,1,'/reports/production-plan','2026-09-26 07:10:12'),(781,1,'/reports/sales-order','2026-09-26 07:10:12'),(782,1,'/reports/stage-costing','2026-09-26 07:10:12'),(783,1,'/roles','2026-09-26 07:10:12'),(784,1,'/sales-orders','2026-09-26 07:10:12'),(785,1,'/standard-cost-bom','2026-09-26 07:10:12'),(786,1,'/standard-costing','2026-09-26 07:10:12'),(787,1,'/standard-size','2026-09-26 07:10:12'),(788,1,'/stock-opening-entry','2026-09-26 07:10:12'),(789,1,'/stock-transfer','2026-09-26 07:10:12'),(790,1,'/supplier-invoice','2026-09-26 07:10:12'),(791,1,'/supplier-master','2026-09-26 07:10:12'),(792,1,'/supplier-price-approval','2026-09-26 07:10:12'),(793,1,'/supplier-pricing-history','2026-09-26 07:10:12'),(794,1,'/supplier-return','2026-09-26 07:10:12'),(795,1,'/tax-master','2026-09-26 07:10:12'),(796,1,'/thickness','2026-09-26 07:10:12'),(797,1,'/uom','2026-09-26 07:10:12'),(798,1,'/users','2026-09-26 07:10:12'),(799,1,'/warehouse-master','2026-09-26 07:10:12'),(800,1,'/cost-components','2026-09-26 07:10:12');
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
  `code` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `permissions` json DEFAULT NULL,
  `access_level` enum('read_write','read_only') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'read_write',
  `status` enum('Active','Inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_role_code` (`code`),
  KEY `idx_role_deleted` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'ADMIN','Administrator','Full system access with all permissions',NULL,'read_write','Active','2026-07-05 14:29:03','2026-07-27 08:38:35',NULL,7,NULL),(2,'MANAGER','Manager','Manage operations and approve transactions',NULL,'read_write','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(3,'USER','User','Basic access to view and create records',NULL,'read_write','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(4,'VIEWER','Viewer','Read-only access',NULL,'read_only','Active','2026-07-05 14:29:03','2026-07-17 15:31:05',NULL,1,NULL),(7,'admin1','imaaz','test',NULL,'read_write','Inactive','2026-07-13 23:41:45','2026-07-17 13:59:16',1,NULL,'2026-07-17 13:59:16'),(8,'8928','Imaaz','',NULL,'read_write','Inactive','2026-07-17 13:59:38','2026-07-22 05:25:17',1,NULL,'2026-07-22 05:25:17'),(9,'SALE_ORDER','Sale Order','Sales order entry',NULL,'read_write','Active','2026-09-16 09:11:51','2026-09-16 09:11:51',NULL,NULL,NULL),(10,'PROD_PLAN','Production Planner','Production planning',NULL,'read_write','Active','2026-09-16 09:11:51','2026-09-16 09:11:51',NULL,NULL,NULL),(11,'MAT_ISSUE','Material Issue','Material issue to production',NULL,'read_write','Active','2026-09-16 09:11:51','2026-09-16 09:11:51',NULL,NULL,NULL),(12,'DAILY_PROD','Daily Production','Daily production entry',NULL,'read_write','Active','2026-09-16 09:11:51','2026-09-16 09:11:51',NULL,NULL,NULL),(13,'COSTING_OH','Costing / Overheads','Costing & overheads',NULL,'read_write','Active','2026-09-16 09:11:51','2026-09-16 09:11:51',NULL,NULL,NULL);
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
  `file_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Others',
  `uploaded_by` int DEFAULT NULL,
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_soa_order` (`sales_order_id`),
  CONSTRAINT `fk_soa_order` FOREIGN KEY (`sales_order_id`) REFERENCES `sales_orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales_order_attachments`
--

LOCK TABLES `sales_order_attachments` WRITE;
/*!40000 ALTER TABLE `sales_order_attachments` DISABLE KEYS */;
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
  `item_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `item_description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `leather_type_id` int DEFAULT NULL,
  `leather_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `finish_color` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `thickness` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uom` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` decimal(12,2) DEFAULT '0.00',
  `delivery_date` date DEFAULT NULL,
  `unit_price` decimal(12,4) DEFAULT '0.0000',
  `discount_percent` decimal(5,2) DEFAULT '0.00',
  `amount` decimal(14,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_soi_order` (`sales_order_id`),
  CONSTRAINT `fk_soi_order` FOREIGN KEY (`sales_order_id`) REFERENCES `sales_orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales_order_items`
--

LOCK TABLES `sales_order_items` WRITE;
/*!40000 ALTER TABLE `sales_order_items` DISABLE KEYS */;
INSERT INTO `sales_order_items` VALUES (29,16,'PRD-00010','Sheep  Full Grain White',13,NULL,'Sheep ','White','Medium (1.0-1.2 mm)','Square Feet',3500.00,NULL,110.0000,0.00,385000.00,'2026-09-26 11:32:57');
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
  `order_no` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` int NOT NULL,
  `order_date` date NOT NULL,
  `delivery_date` date DEFAULT NULL,
  `customer_po_no` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Standard',
  `contact_person` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `delivery_address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `payment_terms` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `currency` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'INR',
  `price_list` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sales_person` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Draft','Confirmed','Processing','Shipped','Delivered','Cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
  `terms_conditions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `discount` decimal(12,2) DEFAULT '0.00',
  `freight` decimal(12,2) DEFAULT '0.00',
  `tax_percent` decimal(5,2) DEFAULT '18.00',
  `sub_total` decimal(14,2) DEFAULT '0.00',
  `tax_amount` decimal(12,2) DEFAULT '0.00',
  `cgst_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `sgst_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `igst_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `tax_type` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'IGST',
  `grand_total` decimal(14,2) DEFAULT '0.00',
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales_orders`
--

LOCK TABLES `sales_orders` WRITE;
/*!40000 ALTER TABLE `sales_orders` DISABLE KEYS */;
INSERT INTO `sales_orders` VALUES (16,'SO-2026-00001',8,'2026-09-11',NULL,'AKM-153','Standard','Mr KFA',NULL,'Advance','INR',NULL,NULL,'Confirmed',NULL,0.00,0.00,5.00,385000.00,19250.00,9625.00,9625.00,0.00,'CGST_SGST',404250.00,NULL,7,NULL,'2026-09-26 11:32:57','2026-09-26 12:28:49');
/*!40000 ALTER TABLE `sales_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `standard_cost_items`
--

DROP TABLE IF EXISTS `standard_cost_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `standard_cost_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cost_sheet_id` int NOT NULL,
  `cost_component_id` int NOT NULL,
  `cost_component_group_id` int DEFAULT NULL,
  `cost_value` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `actual_cost` decimal(15,2) NOT NULL DEFAULT '0.00',
  `bom_cost` decimal(15,2) NOT NULL DEFAULT '0.00',
  `variance` decimal(15,2) NOT NULL DEFAULT '0.00',
  `cost_percentage` decimal(7,4) NOT NULL DEFAULT '0.0000',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sci_sheet` (`cost_sheet_id`),
  KEY `idx_sci_component` (`cost_component_id`),
  CONSTRAINT `fk_sci_component` FOREIGN KEY (`cost_component_id`) REFERENCES `materials` (`id`),
  CONSTRAINT `fk_sci_sheet` FOREIGN KEY (`cost_sheet_id`) REFERENCES `standard_cost_sheets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `standard_cost_items`
--

LOCK TABLES `standard_cost_items` WRITE;
/*!40000 ALTER TABLE `standard_cost_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `standard_cost_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `standard_cost_sheets`
--

DROP TABLE IF EXISTS `standard_cost_sheets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `standard_cost_sheets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int DEFAULT NULL,
  `bom_id` int DEFAULT NULL,
  `production_plan_id` int DEFAULT NULL,
  `effective_from` date DEFAULT NULL,
  `description` text,
  `customer_name` varchar(200) DEFAULT NULL,
  `article` varchar(200) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `order_no` varchar(50) DEFAULT NULL,
  `order_qty` decimal(15,2) DEFAULT '0.00',
  `completed_qty` decimal(15,2) DEFAULT '0.00',
  `balance_qty` decimal(15,2) DEFAULT '0.00',
  `bom_type` varchar(50) NOT NULL,
  `bom_version` int NOT NULL DEFAULT '1',
  `cost_sheet_no` varchar(50) NOT NULL,
  `cost_sheet_version` int NOT NULL DEFAULT '1',
  `currency` varchar(10) NOT NULL DEFAULT 'INR',
  `basis_unit` varchar(20) NOT NULL DEFAULT 'Sq.Ft.',
  `total_bom_cost` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `total_actual_cost` decimal(15,2) NOT NULL DEFAULT '0.00',
  `total_variance` decimal(15,2) NOT NULL DEFAULT '0.00',
  `total_other_cost` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `standard_cost` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `status` enum('Draft','Approved','Posted') NOT NULL DEFAULT 'Draft',
  `prepared_by` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_cost_sheet_no` (`cost_sheet_no`),
  UNIQUE KEY `uq_product_bom_version` (`product_id`,`bom_id`,`cost_sheet_version`),
  KEY `idx_scs_product` (`product_id`),
  KEY `idx_scs_bom` (`bom_id`),
  KEY `idx_scs_status` (`status`),
  CONSTRAINT `fk_scs_bom` FOREIGN KEY (`bom_id`) REFERENCES `boms` (`id`),
  CONSTRAINT `fk_scs_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `standard_cost_sheets`
--

LOCK TABLES `standard_cost_sheets` WRITE;
/*!40000 ALTER TABLE `standard_cost_sheets` DISABLE KEYS */;
/*!40000 ALTER TABLE `standard_cost_sheets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `standard_sizes`
--

DROP TABLE IF EXISTS `standard_sizes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `standard_sizes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('Active','Inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_stdsize_code` (`code`),
  KEY `idx_ss_deleted` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `standard_sizes`
--

LOCK TABLES `standard_sizes` WRITE;
/*!40000 ALTER TABLE `standard_sizes` DISABLE KEYS */;
INSERT INTO `standard_sizes` VALUES (1,'CUSTOM','As per Customer Requirement','Size as specified by customer','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(2,'STD-20','Standard 20 Sq. Ft.','Standard hide size approx 20 sq. ft.','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(3,'STD-25','Standard 25 Sq. Ft.','Large hide size approx 25 sq. ft.','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(4,'STD-30','Standard 30 Sq. Ft.','Extra large hide size approx 30 sq. ft.','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(5,'HALF','Half Hide','Half hide cut','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(7,'SZ-00NaN','4/6','4/6','Active','2026-09-01 15:29:32','2026-09-01 15:29:32',7,NULL,NULL);
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
  `code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `country_id` int NOT NULL,
  `status` enum('Active','Inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
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
  `table_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `record_id` int NOT NULL,
  `old_status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `new_status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `changed_by` int DEFAULT NULL,
  `changed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
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
  `transaction_type` enum('Opening','Receipt','Transfer In','Transfer Out','Issue','Adjustment') NOT NULL,
  `reference_type` varchar(50) NOT NULL,
  `reference_id` int NOT NULL,
  `reference_no` varchar(50) DEFAULT NULL,
  `warehouse_id` int NOT NULL,
  `material_id` int NOT NULL,
  `uom` varchar(30) DEFAULT NULL,
  `batch_no` varchar(100) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `in_qty` decimal(14,3) DEFAULT '0.000',
  `out_qty` decimal(14,3) DEFAULT '0.000',
  `unit_cost` decimal(14,4) DEFAULT '0.0000',
  `amount` decimal(16,2) DEFAULT '0.00',
  `balance_qty` decimal(14,3) DEFAULT '0.000',
  `remarks` text,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sl_warehouse` (`warehouse_id`),
  KEY `idx_sl_material` (`material_id`),
  KEY `idx_sl_ref` (`reference_type`,`reference_id`),
  KEY `idx_sl_date` (`transaction_date`),
  CONSTRAINT `fk_sl_material` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`),
  CONSTRAINT `fk_sl_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_ledger`
--

LOCK TABLES `stock_ledger` WRITE;
/*!40000 ALTER TABLE `stock_ledger` DISABLE KEYS */;
INSERT INTO `stock_ledger` VALUES (3,'2026-07-11','Opening','stock_opening',2,'OPN-2026-00001',1,1,'test','5','2026-07-30',2.000,0.000,2.0000,4.00,2.000,'Opening stock entry',NULL,'2026-07-11 07:40:09'),(5,'2026-07-11','Transfer Out','stock_transfer',1,'STN-2026-00001',1,1,'test',NULL,NULL,0.000,2.000,2.0000,4.00,0.000,'Transfer to ',NULL,'2026-07-11 07:42:59'),(6,'2026-07-11','Transfer In','stock_transfer',1,'STN-2026-00001',2,1,'test',NULL,NULL,2.000,0.000,2.0000,4.00,2.000,'Transfer from ',NULL,'2026-07-11 07:42:59'),(7,'2026-07-11','Issue','material_issue',1,'ISS-2026-00001',1,1,'test',NULL,NULL,0.000,2.000,0.0000,0.00,-2.000,'Issue to batch CUT-2024-0501',NULL,'2026-07-11 07:43:42'),(19,'2026-09-26','Receipt','material_receipt',5,'GRN-2026-00001',7,211,'Piece',NULL,NULL,607.000,0.000,50.0000,30350.00,607.000,'Material receipt',7,'2026-09-26 12:18:52');
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
  `entry_no` varchar(30) NOT NULL,
  `entry_date` date NOT NULL,
  `opening_date` date NOT NULL,
  `financial_year` varchar(20) DEFAULT NULL,
  `warehouse_id` int NOT NULL,
  `reference_no` varchar(100) DEFAULT NULL,
  `costing_method` enum('FIFO','LIFO','Weighted Average','Standard Cost') DEFAULT 'FIFO',
  `remarks` text,
  `total_amount` decimal(16,2) DEFAULT '0.00',
  `status` enum('Draft','Posted','Cancelled') DEFAULT 'Draft',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `entry_no` (`entry_no`),
  KEY `idx_soe_warehouse` (`warehouse_id`),
  KEY `idx_soe_status` (`status`),
  CONSTRAINT `fk_soe_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_opening_entries`
--

LOCK TABLES `stock_opening_entries` WRITE;
/*!40000 ALTER TABLE `stock_opening_entries` DISABLE KEYS */;
INSERT INTO `stock_opening_entries` VALUES (2,'OPN-2026-00001','2026-07-11','2026-07-11','2023-2024',1,NULL,'FIFO','test',4.00,'Posted',NULL,NULL,'2026-07-11 07:40:09','2026-07-11 07:40:09');
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
  `uom` varchar(30) DEFAULT NULL,
  `quantity` decimal(14,3) NOT NULL DEFAULT '0.000',
  `unit_cost` decimal(14,4) NOT NULL DEFAULT '0.0000',
  `amount` decimal(16,2) NOT NULL DEFAULT '0.00',
  `batch_no` varchar(100) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_soitem_entry` (`entry_id`),
  KEY `idx_soitem_material` (`material_id`),
  CONSTRAINT `fk_soitem_entry` FOREIGN KEY (`entry_id`) REFERENCES `stock_opening_entries` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_soitem_material` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_opening_items`
--

LOCK TABLES `stock_opening_items` WRITE;
/*!40000 ALTER TABLE `stock_opening_items` DISABLE KEYS */;
INSERT INTO `stock_opening_items` VALUES (2,2,1,'test',2.000,2.0000,4.00,'5','2026-07-30','2026-07-11 07:40:09');
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
  `uom` varchar(30) DEFAULT NULL,
  `available_qty` decimal(14,3) DEFAULT '0.000',
  `transfer_qty` decimal(14,3) NOT NULL DEFAULT '0.000',
  `unit_cost` decimal(14,4) DEFAULT '0.0000',
  `amount` decimal(16,2) DEFAULT '0.00',
  `batch_no` varchar(100) DEFAULT NULL,
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_stitem_transfer` (`transfer_id`),
  KEY `idx_stitem_material` (`material_id`),
  CONSTRAINT `fk_stitem_material` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`),
  CONSTRAINT `fk_stitem_transfer` FOREIGN KEY (`transfer_id`) REFERENCES `stock_transfers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_transfer_items`
--

LOCK TABLES `stock_transfer_items` WRITE;
/*!40000 ALTER TABLE `stock_transfer_items` DISABLE KEYS */;
INSERT INTO `stock_transfer_items` VALUES (1,1,1,'test',4.000,2.000,2.0000,4.00,NULL,'test-new','2026-07-11 07:42:59');
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
  `transfer_no` varchar(30) NOT NULL,
  `transfer_date` date NOT NULL,
  `from_warehouse_id` int NOT NULL,
  `to_warehouse_id` int NOT NULL,
  `reference_no` varchar(100) DEFAULT NULL,
  `reference_date` date DEFAULT NULL,
  `transporter` varchar(150) DEFAULT NULL,
  `delivery_challan_no` varchar(100) DEFAULT NULL,
  `total_qty` decimal(14,3) DEFAULT '0.000',
  `total_amount` decimal(16,2) DEFAULT '0.00',
  `remarks` text,
  `status` enum('Draft','Posted','Cancelled') DEFAULT 'Draft',
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_transfers`
--

LOCK TABLES `stock_transfers` WRITE;
/*!40000 ALTER TABLE `stock_transfers` DISABLE KEYS */;
INSERT INTO `stock_transfers` VALUES (1,'STN-2026-00001','2026-07-11',1,2,'5422','2026-07-07','test-new',NULL,2.000,4.00,'test-new','Posted',NULL,NULL,'2026-07-11 07:42:59','2026-07-11 07:42:59');
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
  `uom` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Kg',
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `valid_from` date DEFAULT NULL,
  `valid_to` date DEFAULT NULL,
  `status` enum('Approved','Pending') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_pricing_supplier` (`supplier_id`),
  KEY `idx_pricing_material` (`material_id`),
  CONSTRAINT `fk_pricing_material` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pricing_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supplier_pricing`
--

LOCK TABLES `supplier_pricing` WRITE;
/*!40000 ALTER TABLE `supplier_pricing` DISABLE KEYS */;
INSERT INTO `supplier_pricing` VALUES (1,1,1,'KG',200.00,'2024-05-01','2024-05-30','Approved','2026-07-21 07:07:33','2026-07-21 07:07:33',1,NULL),(2,1,1,'KG',210.00,'2024-04-01','2024-04-30','Approved','2026-07-21 07:07:33','2026-07-21 07:07:33',1,NULL),(3,1,1,'KG',220.00,'2024-03-01','2024-03-31','Approved','2026-07-21 07:07:33','2026-07-21 07:07:33',1,NULL),(4,1,2,'KG',185.00,'2024-05-01','2024-05-31','Approved','2026-07-21 07:07:33','2026-07-21 07:07:33',1,NULL),(5,1,3,'LTR',65.00,'2024-05-01','2024-05-31','Approved','2026-07-21 07:07:33','2026-07-21 07:07:33',1,NULL),(6,1,4,'KG',145.00,'2024-05-01','2024-05-31','Approved','2026-07-21 07:07:33','2026-07-21 07:07:33',1,NULL),(7,1,5,'LTR',62.00,'2024-04-16','2024-04-30','Pending','2026-07-21 07:07:33','2026-07-21 07:07:33',1,NULL),(8,1,6,'KG',130.00,'2024-05-01','2024-05-31','Pending','2026-07-21 07:07:33','2026-07-21 07:07:33',1,NULL);
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
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `file_size` int DEFAULT '0',
  `uploaded_by` int DEFAULT NULL,
  `uploaded_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_spa_pricing` (`pricing_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_person` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alt_phone` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `pincode` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` enum('chemical','raw','dye','finishing') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'chemical',
  `supply_type` enum('raw','chemical','dye','finishing') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'chemical',
  `gstin` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pan` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_terms` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_account` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ifsc_code` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('Active','Inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
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
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES (1,'testing','test','test','1234566789','test@gmail.com','765431133','test','test',NULL,'','654321','test','chemical','chemical','test','test','30','test','test','test','test','Active','2026-07-01 16:38:38','2026-07-02 16:56:39',NULL,NULL,NULL,NULL,NULL,NULL),(2,'SUP-004','Navochem',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:49','2026-08-10 06:14:49',NULL,NULL,NULL,NULL,NULL,NULL),(3,'SUP-005','Shama Enterprises',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:49','2026-08-10 06:14:49',NULL,NULL,NULL,NULL,NULL,NULL),(4,'SUP-006','MS Traders',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:49','2026-08-10 06:14:49',NULL,NULL,NULL,NULL,NULL,NULL),(5,'SUP-007','Shankar Chemicals',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:49','2026-08-10 06:14:49',NULL,NULL,NULL,NULL,NULL,NULL),(6,'SUP-008','Meghdoot',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:49','2026-08-10 06:14:49',NULL,NULL,NULL,NULL,NULL,NULL),(7,'SUP-009','TFB Exim(1) PVT LTD',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:49','2026-08-10 06:14:49',NULL,NULL,NULL,NULL,NULL,NULL),(8,'SUP-010','Imad import Chemicals',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:49','2026-08-10 06:14:49',NULL,NULL,NULL,NULL,NULL,NULL),(9,'SUP-011','Raitan PVT LTD',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:49','2026-08-10 06:14:49',NULL,NULL,NULL,NULL,NULL,NULL),(10,'SUP-012','AVT Enterprises',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:49','2026-08-10 06:14:49',NULL,NULL,NULL,NULL,NULL,NULL),(11,'SUP-013','Fortune International',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:49','2026-08-10 06:14:49',NULL,NULL,NULL,NULL,NULL,NULL),(12,'SUP-014','Bharath Enterprises',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:49','2026-08-10 06:14:49',NULL,NULL,NULL,NULL,NULL,NULL),(13,'SUP-015','Ponpure Chemicals',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:49','2026-08-10 06:14:49',NULL,NULL,NULL,NULL,NULL,NULL),(14,'SUP-016','Limra',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:49','2026-08-10 06:14:49',NULL,NULL,NULL,NULL,NULL,NULL),(15,'SUP-017','Perfect Colours',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:49','2026-08-10 06:14:49',NULL,NULL,NULL,NULL,NULL,NULL),(16,'SUP-018','Perfect Finishing Chemicals',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:50','2026-08-10 06:14:50',NULL,NULL,NULL,NULL,NULL,NULL),(17,'SUP-019','Mangilia Enterprise',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:50','2026-08-10 06:14:50',NULL,NULL,NULL,NULL,NULL,NULL),(18,'SUP-020','Meenakshi & Co',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:50','2026-08-10 06:14:50',NULL,NULL,NULL,NULL,NULL,NULL),(19,'SUP-021','Shankar Dye Chem',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:50','2026-08-10 06:14:50',NULL,NULL,NULL,NULL,NULL,NULL),(20,'SUP-022','Ambition Colours & Chemicals',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:50','2026-08-10 06:14:50',NULL,NULL,NULL,NULL,NULL,NULL),(21,'SUP-023','Color Shoppe',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:50','2026-08-10 06:14:50',NULL,NULL,NULL,NULL,NULL,NULL),(22,'SUP-024','Itakem Fine Chem',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:50','2026-08-10 06:14:50',NULL,NULL,NULL,NULL,NULL,NULL),(23,'SUP-025','Basic Vendor',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:50','2026-08-10 06:14:50',NULL,NULL,NULL,NULL,NULL,NULL),(24,'SUP-026','Sathya Colours PVT LTD',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:50','2026-08-10 06:14:50',NULL,NULL,NULL,NULL,NULL,NULL),(25,'SUP-027','Leer Chem',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:50','2026-08-10 06:14:50',NULL,NULL,NULL,NULL,NULL,NULL),(26,'SUP-028','Color Pelle',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:50','2026-08-10 06:14:50',NULL,NULL,NULL,NULL,NULL,NULL);
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
  `code` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `tax_category` enum('Goods','Services','Stationary') NOT NULL DEFAULT 'Goods',
  `hsn_code_id` int DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `gst_percent` decimal(5,2) NOT NULL DEFAULT '18.00',
  `cess_percent` decimal(5,2) NOT NULL DEFAULT '0.00',
  `effective_from` date DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `hsn_code_id` (`hsn_code_id`),
  CONSTRAINT `tax_master_ibfk_1` FOREIGN KEY (`hsn_code_id`) REFERENCES `hsn_codes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tax_master`
--

LOCK TABLES `tax_master` WRITE;
/*!40000 ALTER TABLE `tax_master` DISABLE KEYS */;
INSERT INTO `tax_master` VALUES (1,'TAX-001','GST 18%','Goods',NULL,'Standard GST for goods',18.00,0.00,NULL,'Active',0,NULL,NULL,NULL,'2026-07-28 08:29:29','2026-07-28 08:29:29'),(2,'TAX-002','GST 12%','Goods',NULL,'Reduced GST for goods',12.00,0.00,NULL,'Active',0,NULL,NULL,NULL,'2026-07-28 08:29:29','2026-07-28 08:29:29'),(3,'TAX-003','GST 5%','Goods',NULL,'Low GST for essential goods',5.00,0.00,NULL,'Active',0,NULL,NULL,NULL,'2026-07-28 08:29:29','2026-07-28 08:29:29'),(4,'TAX-004','GST 28%','Goods',NULL,'Luxury goods GST',28.00,0.00,NULL,'Active',0,NULL,NULL,NULL,'2026-07-28 08:29:29','2026-07-28 08:29:29'),(5,'TAX-005','GST 18% Services','Services',NULL,'Standard GST for services',18.00,0.00,NULL,'Active',0,NULL,NULL,NULL,'2026-07-28 08:29:29','2026-07-28 08:29:29');
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
  `code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value_mm` decimal(5,2) DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('Active','Inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_thickness_code` (`code`),
  KEY `idx_th_deleted` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `thickness`
--

LOCK TABLES `thickness` WRITE;
/*!40000 ALTER TABLE `thickness` DISABLE KEYS */;
INSERT INTO `thickness` VALUES (1,'THIN','Thin (0.8-1.0 mm)',0.90,'Thin leather for lining and garments','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(2,'MEDIUM','Medium (1.0-1.2 mm)',1.10,'Standard thickness for footwear','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(3,'STD','Standard (1.2-1.4 mm)',1.30,'Most common thickness for leather goods','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(4,'THICK','Thick (1.4-1.6 mm)',1.50,'Thick leather for bags and belts','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(5,'HEAVY','Heavy (1.6-2.0 mm)',1.80,'Heavy leather for industrial use','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(7,'TH-00NaN','thick',1.10,'','Active','2026-07-13 22:26:07','2026-07-13 22:26:07',1,NULL,NULL);
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
  `code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('Active','Inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_uom_code` (`code`),
  KEY `idx_uom_deleted` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `uom`
--

LOCK TABLES `uom` WRITE;
/*!40000 ALTER TABLE `uom` DISABLE KEYS */;
INSERT INTO `uom` VALUES (1,'SQFT','Square Feet','Area measurement in square feet','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(2,'SQM','Square Meter','Area measurement in square meters','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(3,'KG','Kilogram','Weight measurement in kilograms','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(4,'LTR','Liter','Liquid volume in liters','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(5,'MTR','Meter','Linear measurement in meters','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(6,'PIECE','Piece','Individual unit count','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(7,'DOZEN','Dozen','Pack of 12 units','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(9,'UOM-00NaN','Bundle','','Active','2026-08-11 14:51:34','2026-08-11 14:51:34',7,NULL,NULL),(10,'UOM-00001','Box','','Active','2026-08-11 14:51:42','2026-08-11 14:51:42',7,NULL,NULL),(11,'UOM-00002','none','none','Active','2026-08-22 06:18:01','2026-08-22 06:18:01',7,NULL,NULL);
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
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `full_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_id` int DEFAULT NULL,
  `company_id` int DEFAULT NULL,
  `business_unit_id` int DEFAULT NULL,
  `status` enum('Active','Inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (7,'akmadmin','$2a$10$d/6u5QHlAmduzPJucmCB5ekmmd7BC.p72sdF0/v3WmahOBCrs8uD6','akmadmin@gmail.com','Admin Akm',1,NULL,NULL,'Active','2026-09-26 12:05:23','2026-07-22 05:21:44','2026-09-26 12:05:23',1,NULL),(8,'ihtishaam','$2a$10$wokvJgCPZnM.tPgbajHZ9OWH6cGCg8R8TL5Xumy5cSnZbjKrNoToW',NULL,'Ihtishaam',1,NULL,NULL,'Active',NULL,'2026-09-16 09:11:51','2026-09-16 09:11:51',NULL,NULL),(9,'abdullah','$2a$10$wokvJgCPZnM.tPgbajHZ9OWH6cGCg8R8TL5Xumy5cSnZbjKrNoToW',NULL,'Abdullah Basha',10,NULL,NULL,'Active',NULL,'2026-09-16 09:11:51','2026-09-16 09:11:51',NULL,NULL),(10,'tabrez','$2a$10$wokvJgCPZnM.tPgbajHZ9OWH6cGCg8R8TL5Xumy5cSnZbjKrNoToW',NULL,'Tabrez',11,NULL,NULL,'Active',NULL,'2026-09-16 09:11:51','2026-09-16 09:11:51',NULL,NULL),(11,'sami','$2a$10$wokvJgCPZnM.tPgbajHZ9OWH6cGCg8R8TL5Xumy5cSnZbjKrNoToW',NULL,'Sami',12,NULL,NULL,'Active',NULL,'2026-09-16 09:11:51','2026-09-16 09:11:51',NULL,NULL),(12,'ameen','$2a$10$wokvJgCPZnM.tPgbajHZ9OWH6cGCg8R8TL5Xumy5cSnZbjKrNoToW',NULL,'Ameen',12,NULL,NULL,'Active',NULL,'2026-09-16 09:11:51','2026-09-16 09:11:51',NULL,NULL),(13,'aadil','$2a$10$wokvJgCPZnM.tPgbajHZ9OWH6cGCg8R8TL5Xumy5cSnZbjKrNoToW',NULL,'Aadil',12,NULL,NULL,'Active',NULL,'2026-09-16 09:11:51','2026-09-16 09:11:51',NULL,NULL),(14,'waseem','$2a$10$wokvJgCPZnM.tPgbajHZ9OWH6cGCg8R8TL5Xumy5cSnZbjKrNoToW',NULL,'Waseem',12,NULL,NULL,'Active',NULL,'2026-09-16 09:11:51','2026-09-16 09:11:51',NULL,NULL),(15,'umar','$2a$10$wokvJgCPZnM.tPgbajHZ9OWH6cGCg8R8TL5Xumy5cSnZbjKrNoToW',NULL,'Umar',12,NULL,NULL,'Active',NULL,'2026-09-16 09:11:51','2026-09-16 09:11:51',NULL,NULL),(16,'Salman','$2a$10$AmjXGgzYJk5vB7S9cgAPC.sDx3AJHmvkez583pIPXDmkKXepEt1um','sallu7037@gmail.com','Mohammed Salman',1,NULL,NULL,'Active','2026-09-26 10:51:36','2026-09-17 10:43:45','2026-09-26 10:51:36',7,NULL);
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
  `document_type` varchar(100) DEFAULT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `file_size` int DEFAULT '0',
  `uploaded_by` int DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_wa_warehouse` (`warehouse_id`),
  CONSTRAINT `fk_wa_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `warehouse_attachments`
--

LOCK TABLES `warehouse_attachments` WRITE;
/*!40000 ALTER TABLE `warehouse_attachments` DISABLE KEYS */;
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
  `bin_code` varchar(30) NOT NULL,
  `bin_name` varchar(100) DEFAULT NULL,
  `rack_no` varchar(30) DEFAULT NULL,
  `shelf_no` varchar(30) DEFAULT NULL,
  `capacity` decimal(12,2) DEFAULT NULL,
  `uom` varchar(30) DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_wb_code` (`warehouse_id`,`bin_code`),
  KEY `idx_wb_warehouse` (`warehouse_id`),
  KEY `idx_wb_status` (`status`),
  CONSTRAINT `fk_wb_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `warehouse_bins`
--

LOCK TABLES `warehouse_bins` WRITE;
/*!40000 ALTER TABLE `warehouse_bins` DISABLE KEYS */;
INSERT INTO `warehouse_bins` VALUES (11,6,'bin 02','test','n90','m90',4.00,'77','Active',NULL,'2026-07-17 12:43:47','2026-07-17 12:43:47'),(12,1,'665','test','r01','s01',2.00,'5','Active',7,'2026-09-01 15:56:12','2026-09-01 15:56:12');
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
  `uom` varchar(30) DEFAULT NULL,
  `current_qty` decimal(14,3) DEFAULT '0.000',
  `avg_unit_cost` decimal(14,4) DEFAULT '0.0000',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ws` (`warehouse_id`,`material_id`),
  KEY `idx_ws_warehouse` (`warehouse_id`),
  KEY `idx_ws_material` (`material_id`),
  CONSTRAINT `fk_ws_material` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`),
  CONSTRAINT `fk_ws_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `warehouse_stock`
--

LOCK TABLES `warehouse_stock` WRITE;
/*!40000 ALTER TABLE `warehouse_stock` DISABLE KEYS */;
INSERT INTO `warehouse_stock` VALUES (3,1,1,'test',-2.000,0.0000,'2026-09-26 12:15:54'),(4,2,1,'test',2.000,2.0000,'2026-07-11 07:42:59'),(14,1,199,'Piece',0.000,0.0000,'2026-09-26 12:15:52'),(15,3,35,'Kg',-4.500,0.0000,'2026-09-16 12:48:32'),(16,3,36,'Kg',-4.500,0.0000,'2026-09-16 12:48:32'),(17,3,5,'Kg',-10.500,0.0000,'2026-09-16 12:48:32'),(18,3,23,'Kg',-35.000,0.0000,'2026-09-16 12:48:32'),(19,3,49,'Kg',-1.000,0.0000,'2026-09-16 12:48:32'),(20,3,24,'Kg',-16.000,0.0000,'2026-09-16 12:48:32'),(21,3,18,'Kg',-12.500,0.0000,'2026-09-16 12:48:32'),(22,3,62,'Kg',-2.750,0.0000,'2026-09-16 12:48:32'),(23,3,16,'Kg',-24.500,0.0000,'2026-09-16 12:48:32'),(24,3,28,'Kg',-5.500,0.0000,'2026-09-16 12:48:32'),(25,3,126,'Kg',-10.000,0.0000,'2026-09-16 12:51:43'),(26,3,171,'Kg',-2.200,0.0000,'2026-09-16 12:51:43'),(27,1,167,'Kg',-5.000,0.0000,'2026-09-22 11:17:19'),(28,1,9,'Kg',0.000,0.0000,'2026-09-26 11:33:08'),(29,1,10,'Kg',0.000,0.0000,'2026-09-26 11:33:08'),(30,1,3,'Kg',0.000,0.0000,'2026-09-26 11:33:08'),(31,1,52,'Kg',0.000,0.0000,'2026-09-26 11:33:08'),(32,1,51,'Kg',0.000,0.0000,'2026-09-26 11:33:09'),(33,1,44,'Kg',0.000,0.0000,'2026-09-26 11:33:09'),(34,1,33,'Kg',0.000,0.0000,'2026-09-26 11:33:09'),(35,1,47,'Kg',0.000,0.0000,'2026-09-26 11:33:09'),(36,1,49,'Kg',0.000,0.0000,'2026-09-26 11:33:08'),(37,1,29,'Kg',0.000,0.0000,'2026-09-26 11:33:09'),(38,1,50,'Kg',0.000,0.0000,'2026-09-26 11:33:09'),(39,1,30,'Kg',0.000,0.0000,'2026-09-26 11:33:09'),(40,1,46,'Kg',0.000,0.0000,'2026-09-26 11:33:09'),(41,7,211,'Piece',607.000,50.0000,'2026-09-26 12:28:06');
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
  `user_name` varchar(150) NOT NULL,
  `role` varchar(100) DEFAULT 'Store Keeper',
  `access_level` enum('Full','View Only','Limited') DEFAULT 'Full',
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `warehouse_user_access`
--

LOCK TABLES `warehouse_user_access` WRITE;
/*!40000 ALTER TABLE `warehouse_user_access` DISABLE KEYS */;
INSERT INTO `warehouse_user_access` VALUES (2,6,'test','Store Manager','View Only',1,1,1,1,NULL,'2026-07-17 12:43:47','2026-07-17 12:43:47'),(3,6,'test1','Store Keeper','Full',1,1,1,1,NULL,'2026-07-17 12:43:47','2026-07-17 12:43:47'),(4,1,'test','Store Keeper','Full',1,1,1,0,7,'2026-09-01 15:56:12','2026-09-01 15:56:12');
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
  `code` varchar(20) NOT NULL,
  `name` varchar(200) NOT NULL,
  `short_name` varchar(50) DEFAULT NULL,
  `warehouse_type` enum('Raw Material','Finished Goods','Semi-Finished','WIP','Consumable','Quarantine') DEFAULT 'Raw Material',
  `parent_warehouse_id` int DEFAULT NULL,
  `is_default` enum('Yes','No') DEFAULT 'No',
  `location_address` text,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `store_keeper` varchar(150) DEFAULT NULL,
  `cost_center` varchar(100) DEFAULT NULL,
  `opening_date` date DEFAULT NULL,
  `total_area` decimal(12,2) DEFAULT NULL,
  `usable_area` decimal(12,2) DEFAULT NULL,
  `storage_condition` enum('Dry','Cold','Humid','Refrigerated','Ambient') DEFAULT 'Dry',
  `temperature_control` enum('Yes','No') DEFAULT 'No',
  `humidity_control` enum('Yes','No') DEFAULT 'No',
  `handling_equipment` varchar(200) DEFAULT NULL,
  `material_movement_type` enum('FIFO','LIFO','FEFO','Weighted Average') DEFAULT 'FIFO',
  `allow_negative_stock` tinyint(1) DEFAULT '0',
  `notes` text,
  `remarks` text,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_wh_parent` (`parent_warehouse_id`),
  KEY `idx_wh_status` (`status`),
  CONSTRAINT `fk_wh_parent` FOREIGN KEY (`parent_warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `warehouses`
--

LOCK TABLES `warehouses` WRITE;
/*!40000 ALTER TABLE `warehouses` DISABLE KEYS */;
INSERT INTO `warehouses` VALUES (1,'test','Wet Blue','Wet Blue','Raw Material',NULL,'Yes','Vaniyambadi','Ambur','Tamil Nadu','India','5543121','23456789','test','Wet Blue','CC-FG-01','2026-07-11',2.00,2.00,'Dry','No','Yes','Wet Blue','Weighted Average',0,'test','test','Active',NULL,7,'2026-07-11 07:19:35','2026-09-01 15:56:12'),(2,'test-new','test-new','test-new','Raw Material',1,'No','test-new','Vaniyambadi','Tamil Nadu','India','75422','23456','test','test-new','CC-FG-01','2026-07-14',NULL,NULL,'Dry','No','No',NULL,'FIFO',0,NULL,'test-new','Active',NULL,NULL,'2026-07-11 07:42:23','2026-07-11 07:42:23'),(3,'8283','test',NULL,'Raw Material',NULL,'No','nzbcbmcb',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Dry','No','No',NULL,'FIFO',0,NULL,NULL,'Active',NULL,NULL,'2026-07-16 21:03:50','2026-07-16 21:03:50'),(4,'WH-01','Test',NULL,'Raw Material',NULL,'No','test1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Dry','No','No',NULL,'FIFO',0,NULL,NULL,'Active',NULL,NULL,'2026-07-16 21:05:53','2026-07-16 21:05:53'),(6,'gytrye','vnvn',NULL,'Raw Material',NULL,'No','nvn',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Dry','No','No',NULL,'FIFO',0,NULL,NULL,'Active',NULL,NULL,'2026-07-16 21:09:52','2026-07-16 21:09:52'),(7,'WH-002','AKM Wetblue ',NULL,'Raw Material',NULL,'No',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Dry','No','No',NULL,'FIFO',0,NULL,NULL,'Active',7,NULL,'2026-09-26 11:34:56','2026-09-26 11:34:56'),(8,'WH-003','AKM Chemicals',NULL,'Raw Material',NULL,'No',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Ameen ','CC-RAW-01',NULL,NULL,NULL,'Dry','No','No',NULL,'FIFO',0,NULL,NULL,'Active',7,NULL,'2026-09-26 12:34:00','2026-09-26 12:34:00');
/*!40000 ALTER TABLE `warehouses` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-26 13:26:45
