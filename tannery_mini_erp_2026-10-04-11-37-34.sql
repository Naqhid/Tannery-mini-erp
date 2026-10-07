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
) ENGINE=InnoDB AUTO_INCREMENT=71 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cost_components`
--

LOCK TABLES `cost_components` WRITE;
/*!40000 ALTER TABLE `cost_components` DISABLE KEYS */;
INSERT INTO `cost_components` VALUES (1,'CC-00001','Labour Overheads',6,1,0.0000,'','Active',7,NULL,'2026-09-26 14:21:15','2026-09-26 14:21:15',NULL),(2,'CC-00002','By AIr',5,3,0.0000,'','Active',7,NULL,'2026-09-26 14:21:40','2026-09-26 14:21:40',NULL),(3,'CC-00003','By Train',5,3,0.0000,'','Active',7,NULL,'2026-09-26 14:21:58','2026-09-26 14:21:58',NULL),(4,'CC-00004','By Sea',5,3,10.0000,'','Active',7,7,'2026-09-26 14:22:15','2026-09-26 16:08:32',NULL),(5,'CC-00005','Domestic',4,9,0.0000,'','Active',7,NULL,'2026-09-26 14:22:36','2026-09-26 14:22:36',NULL),(6,'CC-00006','Export',4,10,0.0000,'','Active',7,NULL,'2026-09-26 14:22:56','2026-09-26 14:22:56',NULL),(7,'CC-00007','Inspection Table',16,NULL,0.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:40:01',NULL),(8,'CC-00008','Setting IND',14,6,2.2500,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(9,'CC-00009','Setting IMP',14,6,3.3000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(10,'CC-00010','Sammying IND',14,6,3.3000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(11,'CC-00011','Sammying IMP',14,6,5.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(12,'CC-00012','Hooking IND',14,6,1.2500,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(13,'CC-00013','Hooking IMP',14,6,1.6500,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(14,'CC-00014','Shaving IND',14,6,2.5000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(15,'CC-00015','Dry Shaving IND',14,6,2.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(16,'CC-00016','Shaving IMP',14,6,3.5000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(17,'CC-00017','Dry Shaving IMP',14,6,3.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(18,'CC-00018','Dry Setting IND',14,6,2.2500,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(19,'CC-00019','Buffing',14,6,2.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(20,'CC-00020','Dust-Off',14,6,0.6000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(21,'CC-00021','Molissa Staking',14,6,1.7500,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(22,'CC-00022','Wheel Staking ',14,6,2.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(23,'CC-00023','Dry Drum',14,NULL,200.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(24,'CC-00024','Jumbo Drum',14,NULL,2475.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(25,'CC-00025','Big Drum',14,6,1650.0000,'Imported from machine (migration 053)','Active',NULL,7,'2026-09-26 15:09:13','2026-09-27 07:16:11',NULL),(26,'CC-00026','Medium Drum',14,NULL,825.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(27,'CC-00027','Baby Drum',14,NULL,550.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(28,'CC-00028','Sample Drum',14,NULL,330.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(29,'CC-00029','Plating IND',15,6,2.5000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(30,'CC-00030','Plating IMP',15,6,3.5000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(31,'CC-00031','Measuring IND',15,6,0.7500,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(32,'CC-00032','Measuring IMP',15,6,1.2500,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(33,'CC-00033','Measuring Stamper',15,6,2.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(34,'CC-00034','Auto Spray',15,6,1.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(35,'CC-00035','Padding ',15,6,1.2000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(36,'CC-00036','Roller Plating',15,6,3.5000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(37,'CC-00037','ICO T&M',15,6,2.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(38,'CC-00038','Plating CLB',15,6,1.7500,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(39,'CC-00039','Shaving PAK',14,6,4.5000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(40,'CC-00040','Padam PAK',14,6,1.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(41,'CC-00041','Setting IND PAK',14,6,2.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(42,'CC-00042','Dry Shaving PAK',14,6,4.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(43,'CC-00043','Buffing PAK',14,6,3.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(44,'CC-00044','Dust-Off PAK',14,6,0.4000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(45,'CC-00045','Setting IMP PAK',14,6,2.5000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(46,'CC-00046','Dry Drum PAK',14,NULL,300.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(47,'CC-00047','Satilux PAK',15,6,3.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(48,'CC-00048','Plating IND PAK',15,6,3.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(49,'CC-00049','Plating IMP PAK',15,6,3.5000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(50,'CC-00050','Setting HUR',14,6,2.2500,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(51,'CC-00051','REV Setting HUR',14,6,3.5000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(52,'CC-00052','Vaccum',14,6,4.5000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(53,'CC-00053','Hooking HUR',14,6,1.2500,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(54,'CC-00054','Molissa HUR',14,6,1.7500,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(55,'CC-00055','TCP',14,6,1.7500,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(56,'CC-00056','WCM',14,6,1.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(70,'CC-00057','Labour Overheads (Copy)',6,1,0.0000,'','Active',NULL,NULL,'2026-09-28 11:00:43','2026-09-28 11:00:43',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (6,'CUST-00001','KPW','Mr MS','+918630309674','','','Agra','Uttar Pradesh','India','Active','domestic','inr','','','','','','90','','','2026-07-27 12:55:02','2026-09-26 05:23:29',NULL,NULL,NULL,7,16,NULL),(7,'CUST-00002','CRO','Mr SS','+919319852930','','','Agra','Uttar Pradesh','India','Active','domestic','inr','','','','','','90','','','2026-07-30 06:33:46','2026-07-30 06:33:46',NULL,NULL,NULL,7,NULL,NULL),(8,'CUST-00003','KFA','Mr KFA','+919944755730','','','Vaniyambadi','Tamil Nadu','India','Active','domestic','inr','','','','','','7','','','2026-07-30 06:35:35','2026-07-30 06:37:03',NULL,NULL,NULL,7,7,NULL),(9,'CUST-00004','STY','Mr PC','+919830277671','','','Kolkata','West Bengal','India','Active','domestic','inr','','','','','','60','','','2026-07-30 06:36:51','2026-07-30 06:36:51',NULL,NULL,NULL,7,NULL,NULL),(11,'CUST-00005','BE','BE','','','','','',NULL,'Active','domestic','inr','','','','','','30','','','2026-10-03 10:28:40','2026-10-03 10:28:40',NULL,NULL,NULL,16,NULL,NULL);
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
  `total_qty` decimal(14,3) NOT NULL DEFAULT '0.000',
  `cost_per_uom` decimal(14,4) NOT NULL DEFAULT '0.0000',
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
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_master`
--

LOCK TABLES `group_master` WRITE;
/*!40000 ALTER TABLE `group_master` DISABLE KEYS */;
INSERT INTO `group_master` VALUES (1,'GRP-00001','Finished Leather',1,'4107',5.00,'Finished leather group','Active',0,NULL,NULL,7,'2026-07-29 07:09:13','2026-07-29 14:35:32'),(2,'GRP-00002','Tanning Chemicals',15,'3202',18.00,'Tanning chemicals group','Active',0,NULL,NULL,7,'2026-07-29 07:09:13','2026-09-26 13:59:37'),(3,'GRP-00003','Dyes & Pigments',15,'3204',18.00,'Dyes and pigments group','Active',0,NULL,NULL,7,'2026-07-29 07:09:13','2026-09-26 13:59:19'),(4,'GRP-00004','Packing',13,'N/A',0.00,'','Active',0,NULL,7,NULL,'2026-08-11 14:48:45','2026-08-11 14:48:45'),(5,'GRP-00005','Freight',13,'N/A',0.00,'','Active',0,NULL,7,NULL,'2026-08-11 14:49:11','2026-08-11 14:49:11'),(6,'GRP-00006','Overheads',13,'N/A',0.00,'','Active',0,NULL,7,NULL,'2026-08-11 14:49:56','2026-08-11 14:49:56'),(7,'GRP-00007','Sheep Wet Blue',4,'54321',5.00,'','Active',0,NULL,7,7,'2026-09-01 16:01:38','2026-09-01 16:01:51'),(11,'GRP-00010','Wetblue Chemicals',15,'3202',5.00,NULL,'Active',0,NULL,NULL,7,'2026-09-25 11:10:18','2026-09-28 12:48:26'),(12,'GRP-00011','Finishing Chemicals',15,'3209',5.00,NULL,'Active',0,NULL,NULL,7,'2026-09-25 11:10:18','2026-09-28 12:48:46'),(13,'GRP-00012','Sheep Leather',1,'12345',18.00,'','Active',0,NULL,7,NULL,'2026-09-26 13:25:38','2026-09-26 13:25:38'),(14,'GRP-00013','Wet End Machines',16,'123455',18.00,'','Active',0,NULL,7,7,'2026-09-26 14:24:36','2026-09-26 15:12:08'),(15,'GRP-00014','Finishing Machines',16,'2424',5.00,'','Active',0,NULL,7,7,'2026-09-26 14:24:55','2026-09-28 12:47:10'),(16,'GRP-M0902','Manual',13,'',0.00,'Auto-created from machine type (migration 053)','Active',0,NULL,NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:09:13');
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `machine_cost_headers`
--

LOCK TABLES `machine_cost_headers` WRITE;
/*!40000 ALTER TABLE `machine_cost_headers` DISABLE KEYS */;
INSERT INTO `machine_cost_headers` VALUES (7,'MC-2026-09-0001',20,'2026-09-28',0.00,'Finishing',37993.00,10.8500,10.8500,'Posted',NULL,7,7,'2026-09-28 09:57:00','2026-09-28 10:01:03'),(8,'MC-2026-09-0002',21,'2026-09-29',0.00,'Wet End',27698.00,11.0900,11.0900,'Pending',NULL,16,16,'2026-09-29 12:35:00','2026-09-30 06:44:06');
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
  `total_qty` decimal(14,3) NOT NULL DEFAULT '0.000',
  `cost_per_uom` decimal(14,4) NOT NULL DEFAULT '0.0000',
  `amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `cost_per_piece` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `remarks` varchar(500) DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_mci_header` (`machine_cost_id`),
  CONSTRAINT `fk_mci_header` FOREIGN KEY (`machine_cost_id`) REFERENCES `machine_cost_headers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=75 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `machine_cost_items`
--

LOCK TABLES `machine_cost_items` WRITE;
/*!40000 ALTER TABLE `machine_cost_items` DISABLE KEYS */;
INSERT INTO `machine_cost_items` VALUES (33,7,'Sammying IND',14,'Wet End Machines','Piece',607.000,3.3000,2003.10,0.5700,NULL,1,'2026-09-28 10:00:44','2026-09-28 10:00:44'),(34,7,'Shaving IND',14,'Wet End Machines','Piece',607.000,2.5000,1517.50,0.4300,NULL,2,'2026-09-28 10:00:44','2026-09-28 10:00:44'),(35,7,'TCP',14,'Wet End Machines','Piece',607.000,1.7500,1062.25,0.3000,NULL,3,'2026-09-28 10:00:44','2026-09-28 10:00:44'),(36,7,'Medium Drum',14,'Wet End Machines','Sq.Ft.',10.000,825.0000,8250.00,2.3600,NULL,4,'2026-09-28 10:00:44','2026-09-28 10:00:44'),(37,7,'Setting IND',14,'Wet End Machines','Piece',607.000,2.2500,1365.75,0.3900,NULL,5,'2026-09-28 10:00:44','2026-09-28 10:00:44'),(38,7,'Hooking IND',14,'Wet End Machines','Piece',607.000,1.2500,758.75,0.2200,NULL,6,'2026-09-28 10:00:44','2026-09-28 10:00:44'),(39,7,'Molissa Staking',14,'Wet End Machines','Piece',607.000,1.7500,1062.25,0.3000,NULL,7,'2026-09-28 10:00:44','2026-09-28 10:00:44'),(40,7,'Buffing',14,'Wet End Machines','Piece',607.000,2.0000,1214.00,0.3500,NULL,8,'2026-09-28 10:00:44','2026-09-28 10:00:44'),(41,7,'Dust-Off',14,'Wet End Machines','Piece',607.000,0.6000,364.20,0.1000,NULL,9,'2026-09-28 10:00:44','2026-09-28 10:00:44'),(42,7,'Auto Spray',15,'Finishing Machines','Piece',12747.000,1.0000,12747.00,3.6400,NULL,10,'2026-09-28 10:00:44','2026-09-28 10:00:44'),(43,7,'Padding ',15,'Finishing Machines','Piece',1821.000,1.2000,2185.20,0.6200,NULL,11,'2026-09-28 10:00:44','2026-09-28 10:00:44'),(44,7,'Plating IND',15,'Finishing Machines','Piece',1214.000,2.5000,3035.00,0.8700,NULL,12,'2026-09-28 10:00:44','2026-09-28 10:00:44'),(45,7,'Measuring Stamper',15,'Finishing Machines','Piece',607.000,2.0000,1214.00,0.3500,NULL,13,'2026-09-28 10:00:44','2026-09-28 10:00:44'),(46,7,'WCM',14,'Wet End Machines','Piece',1214.000,1.0000,1214.00,0.3500,NULL,14,'2026-09-28 10:00:44','2026-09-28 10:00:44'),(62,8,'Sammying IND',14,'Wet End Machines','Piece',520.000,3.3000,1716.00,0.6900,NULL,1,'2026-09-30 06:44:06','2026-09-30 06:44:06'),(63,8,'Shaving IMP',14,'Wet End Machines','Piece',520.000,3.5000,1820.00,0.7300,NULL,2,'2026-09-30 06:44:06','2026-09-30 06:44:06'),(64,8,'TCP',14,'Wet End Machines','Piece',520.000,1.7500,910.00,0.3600,NULL,3,'2026-09-30 06:44:06','2026-09-30 06:44:06'),(65,8,'Medium Drum',14,'Wet End Machines','Sq.Ft.',10.000,825.0000,8250.00,3.3000,NULL,4,'2026-09-30 06:44:06','2026-09-30 06:44:06'),(66,8,'Setting IND',14,'Wet End Machines','Piece',520.000,2.2500,1170.00,0.4700,NULL,5,'2026-09-30 06:44:06','2026-09-30 06:44:06'),(67,8,'Hooking IND',14,'Wet End Machines','Piece',520.000,1.2500,650.00,0.2600,NULL,6,'2026-09-30 06:44:06','2026-09-30 06:44:06'),(68,8,'Molissa Staking',14,'Wet End Machines','Piece',520.000,1.7500,910.00,0.3600,NULL,7,'2026-09-30 06:44:06','2026-09-30 06:44:06'),(69,8,'Buffing',14,'Wet End Machines','Piece',520.000,2.0000,1040.00,0.4200,NULL,8,'2026-09-30 06:44:06','2026-09-30 06:44:06'),(70,8,'Dust-Off',14,'Wet End Machines','Piece',520.000,0.6000,312.00,0.1200,NULL,9,'2026-09-30 06:44:06','2026-09-30 06:44:06'),(71,8,'Auto Spray',15,'Finishing Machines','Piece',6240.000,1.0000,6240.00,2.5000,NULL,10,'2026-09-30 06:44:06','2026-09-30 06:44:06'),(72,8,'Plating IND',15,'Finishing Machines','Piece',1040.000,2.5000,2600.00,1.0400,NULL,11,'2026-09-30 06:44:06','2026-09-30 06:44:06'),(73,8,'Measuring Stamper',15,'Finishing Machines','Piece',520.000,2.0000,1040.00,0.4200,NULL,12,'2026-09-30 06:44:06','2026-09-30 06:44:06'),(74,8,'WCM',14,'Wet End Machines','Piece',1040.000,1.0000,1040.00,0.4200,NULL,13,'2026-09-30 06:44:06','2026-09-30 06:44:06');
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
INSERT INTO `machines` VALUES (1,'MACHINE-01','Inspection Table',NULL,0.00,0.00,NULL,'Manual','10 hides/hr',NULL,'Active','2026-07-05 14:29:55','2026-07-05 14:29:55',NULL,NULL,NULL),(2,'MACHINE-02','Buffing Machine',NULL,0.00,0.00,NULL,'Automatic','100 sqft/hr',NULL,'Inactive','2026-07-05 14:29:55','2026-07-29 13:33:18',NULL,NULL,'2026-07-29 13:33:18'),(3,'MACHINE-03','Spray Booth A',NULL,0.00,0.00,NULL,'Spray','200 sqft/hr',NULL,'Inactive','2026-07-05 14:29:55','2026-07-29 13:33:18',NULL,NULL,'2026-07-29 13:33:18'),(4,'MACHINE-04','Spray Booth B',NULL,0.00,0.00,NULL,'Spray','200 sqft/hr',NULL,'Inactive','2026-07-05 14:29:55','2026-07-29 13:33:18',NULL,NULL,'2026-07-29 13:33:18'),(5,'MACHINE-05','Tunnel Dryer',NULL,0.00,0.00,NULL,'Conveyor','500 sqft/hr',NULL,'Inactive','2026-07-05 14:29:55','2026-07-29 13:33:18',NULL,NULL,'2026-07-29 13:33:18'),(6,'MACHINE-06','Ironing Machine',NULL,0.00,0.00,NULL,'Heated Roller','300 sqft/hr',NULL,'Inactive','2026-07-05 14:29:55','2026-07-29 13:33:18',NULL,NULL,'2026-07-29 13:33:18'),(7,'MACHINE-07','Rotary Dryer',NULL,0.00,0.00,NULL,'Drum','200 sqft/hr',NULL,'Inactive','2026-07-05 14:29:55','2026-07-29 13:33:18',NULL,NULL,'2026-07-29 13:33:18'),(8,'MACHINE-08','QC Table',NULL,0.00,0.00,NULL,'Manual','50 hides/hr',NULL,'Inactive','2026-07-05 14:29:55','2026-07-29 13:33:18',NULL,NULL,'2026-07-29 13:33:18'),(9,'MACHINE-09','Packing Station',NULL,0.00,0.00,NULL,'Manual','100 hides/hr',NULL,'Inactive','2026-07-05 14:29:55','2026-07-29 13:33:18',NULL,NULL,'2026-07-29 13:33:18'),(10,'MAC-00010','testing',NULL,0.00,0.00,NULL,'dryer','200','','Inactive','2026-07-13 22:38:46','2026-07-29 13:33:00',1,NULL,'2026-07-29 13:33:00'),(11,'MAC-00011','test','Per Hour',44.00,0.00,NULL,'Wet End',NULL,'test','Inactive','2026-07-29 12:52:41','2026-07-29 13:32:48',7,NULL,'2026-07-29 13:32:48'),(12,'MAC-00012','Setting IND','Per Pcs',2.25,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:32:00','2026-07-29 13:32:00',7,NULL,NULL),(13,'MAC-00013','Setting IMP','Per Pcs',3.30,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:32:27','2026-07-29 13:32:27',7,NULL,NULL),(14,'MAC-00014','Sammying IND','Per Pcs',3.30,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:34:33','2026-07-29 13:34:33',7,NULL,NULL),(15,'MAC-00015','Sammying IMP','Per Pcs',5.00,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:34:53','2026-07-29 13:34:53',7,NULL,NULL),(16,'MAC-00016','Hooking IND','Per Pcs',1.25,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:35:24','2026-07-29 13:35:24',7,NULL,NULL),(17,'MAC-00017','Hooking IMP','Per Pcs',1.65,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:35:45','2026-07-29 13:35:45',7,NULL,NULL),(18,'MAC-00018','Shaving IND','Per Pcs',2.50,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:37:23','2026-07-29 13:37:23',7,NULL,NULL),(19,'MAC-00019','Dry Shaving IND','Per Pcs',2.00,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:37:43','2026-07-29 13:37:43',7,NULL,NULL),(20,'MAC-00020','Shaving IMP','Per Pcs',3.50,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:38:00','2026-07-29 13:38:00',7,NULL,NULL),(21,'MAC-00021','Dry Shaving IMP','Per Pcs',3.00,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:38:24','2026-07-29 13:38:24',7,NULL,NULL),(22,'MAC-00022','Dry Setting IND','Per Pcs',2.25,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:44:20','2026-07-29 13:44:20',7,NULL,NULL),(23,'MAC-00023','Buffing','Per Pcs',2.00,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:44:51','2026-07-29 13:44:51',7,NULL,NULL),(24,'MAC-00024','Dust-Off','Per Pcs',0.60,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:45:15','2026-07-29 13:45:15',7,NULL,NULL),(25,'MAC-00025','Molissa Staking','Per Pcs',1.75,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:45:52','2026-07-29 13:45:52',7,NULL,NULL),(26,'MAC-00026','Wheel Staking ','Per Pcs',2.00,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:46:12','2026-07-29 13:59:57',7,7,NULL),(27,'MAC-00027','Dry Drum','Per Hour',200.00,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:47:41','2026-07-29 13:47:41',7,NULL,NULL),(28,'MAC-00028','Jumbo Drum','Per Hour',2475.00,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:48:23','2026-07-29 13:57:06',7,7,NULL),(29,'MAC-00029','Big Drum','Per Hour',1650.00,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:48:47','2026-07-29 13:48:47',7,NULL,NULL),(30,'MAC-00030','Medium Drum','Per Hour',825.00,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:49:15','2026-07-29 13:49:15',7,NULL,NULL),(31,'MAC-00031','Baby Drum','Per Hour',550.00,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:49:53','2026-07-29 13:49:53',7,NULL,NULL),(32,'MAC-00032','Sample Drum','Per Hour',330.00,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 13:50:16','2026-07-29 13:50:16',7,NULL,NULL),(33,'MAC-00033','Plating IND','Per Pcs',2.50,0.00,NULL,'Finishing',NULL,'','Active','2026-07-29 13:57:48','2026-07-29 13:57:48',7,NULL,NULL),(34,'MAC-00034','Plating IMP','Per Pcs',3.50,0.00,NULL,'Finishing',NULL,'','Active','2026-07-29 13:58:00','2026-07-29 13:58:00',7,NULL,NULL),(35,'MAC-00035','Measuring IND','Per Pcs',0.75,0.00,NULL,'Finishing',NULL,'','Active','2026-07-29 14:00:40','2026-07-29 14:00:40',7,NULL,NULL),(36,'MAC-00036','Measuring IMP','Per Pcs',1.25,0.00,NULL,'Finishing',NULL,'','Active','2026-07-29 14:01:04','2026-07-29 14:01:04',7,NULL,NULL),(37,'MAC-00037','Measuring Stamper','Per Pcs',2.00,0.00,NULL,'Finishing',NULL,'','Active','2026-07-29 14:01:30','2026-07-29 14:01:30',7,NULL,NULL),(38,'MAC-00038','Auto Spray','Per Pcs',1.00,0.00,NULL,'Finishing',NULL,'','Active','2026-07-29 14:03:07','2026-07-29 14:03:07',7,NULL,NULL),(39,'MAC-00039','Padding ','Per Pcs',1.20,0.00,NULL,'Finishing',NULL,'','Active','2026-07-29 14:03:38','2026-07-29 14:03:38',7,NULL,NULL),(40,'MAC-00040','Roller Plating','Per Pcs',3.50,0.00,NULL,'Finishing',NULL,'','Active','2026-07-29 14:04:45','2026-07-29 14:04:45',7,NULL,NULL),(41,'MAC-00041','ICO T&M','Per Pcs',2.00,0.00,NULL,'Finishing',NULL,'','Active','2026-07-29 14:10:29','2026-07-29 14:10:29',7,NULL,NULL),(42,'MAC-00042','Plating CLB','Per Pcs',1.75,0.00,NULL,'Finishing',NULL,'','Active','2026-07-29 14:12:26','2026-07-29 14:12:26',7,NULL,NULL),(43,'MAC-00043','Shaving PAK','Per Pcs',4.50,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 14:14:44','2026-07-29 14:14:44',7,NULL,NULL),(44,'MAC-00044','Padam PAK','Per Pcs',1.00,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 14:15:16','2026-07-29 14:15:16',7,NULL,NULL),(45,'MAC-00045','Setting IND PAK','Per Pcs',2.00,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 14:15:32','2026-07-29 14:21:29',7,7,NULL),(46,'MAC-00046','Dry Shaving PAK','Per Pcs',4.00,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 14:16:16','2026-07-29 14:16:16',7,NULL,NULL),(47,'MAC-00047','Buffing PAK','Per Pcs',3.00,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 14:18:53','2026-07-29 14:18:53',7,NULL,NULL),(48,'MAC-00048','Dust-Off PAK','Per Pcs',0.40,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 14:19:42','2026-07-29 14:19:42',7,NULL,NULL),(49,'MAC-00049','Setting IMP PAK','Per Pcs',2.50,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 14:21:43','2026-07-29 14:21:43',7,NULL,NULL),(50,'MAC-00050','Dry Drum PAK','Per Hour',300.00,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 14:22:01','2026-07-29 14:22:01',7,NULL,NULL),(51,'MAC-00051','Satilux PAK','Per Pcs',3.00,0.00,NULL,'Finishing',NULL,'','Active','2026-07-29 14:22:34','2026-07-29 14:22:34',7,NULL,NULL),(52,'MAC-00052','Plating IND PAK','Per Pcs',3.00,0.00,NULL,'Finishing',NULL,'','Active','2026-07-29 14:22:53','2026-07-29 14:22:53',7,NULL,NULL),(53,'MAC-00053','Plating IMP PAK','Per Pcs',3.50,0.00,NULL,'Finishing',NULL,'','Active','2026-07-29 14:23:10','2026-07-29 14:23:10',7,NULL,NULL),(54,'MAC-00054','Setting HUR','Per Pcs',2.25,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 14:24:34','2026-07-29 14:24:34',7,NULL,NULL),(55,'MAC-00055','REV Setting HUR','Per Pcs',3.50,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 14:24:56','2026-07-29 14:24:56',7,NULL,NULL),(56,'MAC-00056','Vaccum','Per Pcs',4.50,0.00,1,'Wet End',NULL,'','Active','2026-07-29 14:25:10','2026-08-06 07:47:23',7,7,NULL),(57,'MAC-00057','Hooking HUR','Per Pcs',1.25,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 14:25:36','2026-07-29 14:25:36',7,NULL,NULL),(58,'MAC-00058','Molissa HUR','Per Pcs',1.75,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 14:26:05','2026-07-29 14:26:05',7,NULL,NULL),(59,'MAC-00059','Round Trimming','Per Pcs',1.00,0.00,NULL,'Wet End',NULL,'','Inactive','2026-07-29 14:29:16','2026-07-29 14:29:51',7,NULL,'2026-07-29 14:29:51'),(60,'MAC-00060','WB V CUT','Per Pcs',0.40,0.00,NULL,'Wet End',NULL,'','Inactive','2026-07-29 14:29:39','2026-07-29 14:29:53',7,NULL,'2026-07-29 14:29:53'),(61,'MAC-00061','TCP','Per Pcs',1.75,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 14:30:46','2026-07-29 14:30:46',7,NULL,NULL),(62,'MAC-00062','WCM','Per Pcs',1.00,0.00,NULL,'Wet End',NULL,'','Active','2026-07-29 14:31:55','2026-07-29 14:31:55',7,NULL,NULL),(63,'MAC-00063','FCM','Per Pcs',1.00,0.00,NULL,'Finishing',NULL,'','Inactive','2026-07-29 14:32:11','2026-09-26 14:25:43',7,NULL,'2026-09-26 14:25:43');
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
) ENGINE=InnoDB AUTO_INCREMENT=7419 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_issue_items`
--

LOCK TABLES `material_issue_items` WRITE;
/*!40000 ALTER TABLE `material_issue_items` DISABLE KEYS */;
INSERT INTO `material_issue_items` VALUES (194,20,123,'Kg',0.000,0.800,177.0000,141.60,NULL,'2026-09-28 09:49:38'),(195,20,118,'Kg',0.000,15.000,150.0000,2250.00,NULL,'2026-09-28 09:49:38'),(196,20,123,'Kg',0.000,10.000,177.0000,1770.00,NULL,'2026-09-28 09:49:38'),(197,20,121,'Kg',0.000,5.000,150.0000,750.00,NULL,'2026-09-28 09:49:38'),(198,20,170,'Kg',0.000,5.000,244.0000,1220.00,NULL,'2026-09-28 09:49:38'),(199,20,120,'Kg',0.000,5.000,667.0000,3335.00,NULL,'2026-09-28 09:49:38'),(200,20,125,'Kg',0.000,2.000,929.0000,1858.00,NULL,'2026-09-28 09:49:38'),(201,20,182,'Kg',0.000,16.000,711.0000,11376.00,NULL,'2026-09-28 09:49:38'),(202,20,158,'Kg',0.000,0.120,5204.0000,624.48,NULL,'2026-09-28 09:49:38'),(203,20,173,'Kg',0.000,1.875,811.0000,1520.63,NULL,'2026-09-28 09:49:38'),(204,20,120,'Kg',0.000,1.875,667.0000,1250.63,NULL,'2026-09-28 09:49:38'),(205,20,172,'Kg',0.000,2.250,381.0000,857.25,NULL,'2026-09-28 09:49:38'),(206,20,167,'Kg',0.000,1.050,675.0000,708.75,NULL,'2026-09-28 09:49:38'),(207,20,125,'Kg',0.000,0.750,929.0000,696.75,NULL,'2026-09-28 09:49:38'),(208,20,126,'Kg',0.000,0.300,1564.0000,469.20,NULL,'2026-09-28 09:49:38'),(242,19,9,'Kg',0.000,1.750,272.0000,476.00,NULL,'2026-09-28 10:51:15'),(243,19,10,'Kg',0.000,1.750,140.0000,245.00,NULL,'2026-09-28 10:51:15'),(244,19,52,'Kg',0.000,5.500,112.0000,616.00,NULL,'2026-09-28 10:51:15'),(245,19,51,'Kg',0.000,7.500,117.0000,877.50,NULL,'2026-09-28 10:51:15'),(246,19,44,'Kg',0.000,8.500,307.0000,2609.50,NULL,'2026-09-28 10:51:15'),(247,19,33,'Kg',0.000,3.000,256.0000,768.00,NULL,'2026-09-28 10:51:15'),(248,19,47,'Kg',0.000,4.000,55.0000,220.00,NULL,'2026-09-28 10:51:15'),(249,19,49,'Kg',0.000,1.700,50.0000,85.00,NULL,'2026-09-28 10:51:15'),(250,19,29,'Kg',0.000,7.500,187.0000,1402.50,NULL,'2026-09-28 10:51:15'),(251,19,50,'Kg',0.000,4.000,121.0000,484.00,NULL,'2026-09-28 10:51:15'),(252,19,49,'Kg',0.000,1.000,50.0000,50.00,NULL,'2026-09-28 10:51:15'),(253,19,30,'Kg',0.000,10.500,170.0000,1785.00,NULL,'2026-09-28 10:51:15'),(254,19,31,'Kg',0.000,7.500,139.0000,1042.50,NULL,'2026-09-28 10:51:15'),(255,19,43,'Kg',0.000,12.500,230.0000,2875.00,NULL,'2026-09-28 10:51:15'),(256,19,56,'Kg',0.000,7.500,160.0000,1200.00,NULL,'2026-09-28 10:51:15'),(257,19,61,'Kg',0.000,6.500,185.0000,1202.50,NULL,'2026-09-28 10:51:15'),(258,19,45,'Kg',0.000,12.500,169.0000,2112.50,NULL,'2026-09-28 10:51:15'),(259,19,40,'Kg',0.000,3.500,177.0000,619.50,NULL,'2026-09-28 10:51:15'),(260,19,42,'Kg',0.000,9.500,145.0000,1377.50,NULL,'2026-09-28 10:51:15'),(261,19,69,'Kg',0.000,5.500,330.0000,1815.00,NULL,'2026-09-28 10:51:15'),(262,19,182,'Kg',0.000,2.600,711.0000,1848.60,NULL,'2026-09-28 10:51:15'),(263,19,35,'Kg',0.000,7.500,346.0000,2595.00,NULL,'2026-09-28 10:51:15'),(264,19,116,'Kg',0.000,7.500,345.0000,2587.50,NULL,'2026-09-28 10:51:15'),(265,19,32,'Kg',0.000,4.000,288.0000,1152.00,NULL,'2026-09-28 10:51:15'),(266,19,115,'Kg',0.000,4.000,153.0000,612.00,NULL,'2026-09-28 10:51:15'),(267,19,114,'Kg',0.000,3.500,273.0000,955.50,NULL,'2026-09-28 10:51:15'),(268,19,10,'Kg',0.000,0.750,140.0000,105.00,NULL,'2026-09-28 10:51:15'),(269,19,29,'Kg',0.000,7.500,187.0000,1402.50,NULL,'2026-09-28 10:51:15'),(270,19,69,'Kg',0.000,1.000,330.0000,330.00,NULL,'2026-09-28 10:51:15'),(271,19,66,'Kg',0.000,3.250,125.0000,406.25,NULL,'2026-09-28 10:51:15'),(272,19,114,'Kg',0.000,2.500,273.0000,682.50,NULL,'2026-09-28 10:51:15'),(273,19,10,'Kg',0.000,1.000,140.0000,140.00,NULL,'2026-09-28 10:51:15'),(274,19,15,'Kg',0.000,3.000,287.0000,861.00,NULL,'2026-09-28 10:51:15'),(7382,21,9,'Kg',0.000,1.750,272.0000,476.00,NULL,'2026-10-03 10:40:45'),(7383,21,10,'Kg',0.000,1.750,140.0000,245.00,NULL,'2026-10-03 10:40:45'),(7384,21,106,'Kg',0.000,3.100,679.7800,2107.32,NULL,'2026-10-03 10:40:45'),(7385,21,209,'Kilogram',0.000,2.500,80.0000,200.00,NULL,'2026-10-03 10:40:45'),(7386,21,51,'Kg',0.000,3.500,117.0000,409.50,NULL,'2026-10-03 10:40:45'),(7387,21,52,'Kg',0.000,8.500,112.0000,952.00,NULL,'2026-10-03 10:40:45'),(7388,21,44,'Kg',0.000,8.500,307.0000,2609.50,NULL,'2026-10-03 10:40:45'),(7389,21,33,'Kg',0.000,3.500,256.0000,896.00,NULL,'2026-10-03 10:40:45'),(7390,21,47,'Kg',0.000,3.500,55.0000,192.50,NULL,'2026-10-03 10:40:45'),(7391,21,49,'Kg',0.000,1.700,50.0000,85.00,NULL,'2026-10-03 10:40:45'),(7392,21,29,'Kg',0.000,7.000,187.0000,1309.00,NULL,'2026-10-03 10:40:45'),(7393,21,49,'Kg',0.000,0.900,50.0000,45.00,NULL,'2026-10-03 10:40:45'),(7394,21,30,'Kg',0.000,9.500,170.0000,1615.00,NULL,'2026-10-03 10:40:45'),(7395,21,31,'Kg',0.000,6.500,139.0000,903.50,NULL,'2026-10-03 10:40:45'),(7396,21,46,'Kg',0.000,1.500,185.0000,277.50,NULL,'2026-10-03 10:40:45'),(7397,21,56,'Kg',0.000,6.500,160.0000,1040.00,NULL,'2026-10-03 10:40:45'),(7398,21,41,'Kg',0.000,6.600,216.0000,1425.60,NULL,'2026-10-03 10:40:45'),(7399,21,42,'Kg',0.000,9.500,148.0000,1406.00,NULL,'2026-10-03 10:40:45'),(7400,21,40,'Kg',0.000,3.500,177.0000,619.50,NULL,'2026-10-03 10:40:45'),(7401,21,106,'Kg',0.000,5.900,679.7800,4010.70,NULL,'2026-10-03 10:40:45'),(7402,21,35,'Kg',0.000,6.500,346.0000,2249.00,NULL,'2026-10-03 10:40:45'),(7403,21,11,'Kg',0.000,3.500,187.0000,654.50,NULL,'2026-10-03 10:40:45'),(7404,21,116,'Kg',0.000,3.500,345.0000,1207.50,NULL,'2026-10-03 10:40:45'),(7405,21,32,'Kg',0.000,3.500,288.0000,1008.00,NULL,'2026-10-03 10:40:45'),(7406,21,115,'Kg',0.000,3.500,153.0000,535.50,NULL,'2026-10-03 10:40:45'),(7407,21,29,'Kg',0.000,5.500,187.0000,1028.50,NULL,'2026-10-03 10:40:45'),(7408,21,209,'Kilogram',0.000,9.500,80.0000,760.00,NULL,'2026-10-03 10:40:45'),(7409,21,43,'Kg',0.000,1.750,230.0000,402.50,NULL,'2026-10-03 10:40:45'),(7410,21,106,'Kg',0.000,1.100,679.7800,747.76,NULL,'2026-10-03 10:40:45'),(7411,21,35,'Kg',0.000,0.750,346.0000,259.50,NULL,'2026-10-03 10:40:45'),(7412,21,32,'Kg',0.000,0.750,288.0000,216.00,NULL,'2026-10-03 10:40:45'),(7413,21,209,'Kilogram',0.000,4.000,80.0000,320.00,NULL,'2026-10-03 10:40:45'),(7414,21,50,'Kg',0.000,4.000,121.0000,484.00,NULL,'2026-10-03 10:40:45'),(7415,21,43,'Kg',0.000,9.500,230.0000,2185.00,NULL,'2026-10-03 10:40:45'),(7416,21,71,'Kg',0.000,6.500,308.0000,2002.00,NULL,'2026-10-03 10:40:45'),(7417,21,10,'Kg',0.000,0.750,140.0000,105.00,NULL,'2026-10-03 10:40:45'),(7418,21,210,'Kilogram',0.000,3.000,379.0000,1137.00,NULL,'2026-10-03 10:40:45');
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
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_issues`
--

LOCK TABLES `material_issues` WRITE;
/*!40000 ALTER TABLE `material_issues` DISABLE KEYS */;
INSERT INTO `material_issues` VALUES (19,'ISS-2026-00002','2026-09-28','Production',NULL,'PRP-000001','Wet End','Sheep  Full Grain White','White',3500.000,'Piece','Sheep  Full Grain White','FIFO',8,'2026-09-28','2026-09-28',NULL,0.00,0.00,35540.85,35540.85,NULL,'Posted',7,7,'2026-09-28 09:22:40','2026-09-28 10:51:15'),(20,'ISS-2026-00003','2026-09-28','Production',NULL,'PRP-000001','Wet End','Sheep  Full Grain White','White',3500.000,'Piece','Sheep  Full Grain White','FIFO',8,'2026-09-28','2026-09-28',NULL,0.00,0.00,28828.29,28828.29,NULL,'Posted',7,7,'2026-09-28 09:48:16','2026-09-28 09:49:38'),(21,'ISS-2026-00004','2026-09-28','Production',NULL,'PRP-000001','Measurement','Sheep  Full Grain White','White',3500.000,'Square Feet','Sheep  Full Grain White','FIFO',8,'2026-09-28','2026-09-28',NULL,0.00,0.00,36126.38,36126.38,NULL,'Draft',16,16,'2026-09-28 11:25:19','2026-10-01 12:25:22');
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
) ENGINE=InnoDB AUTO_INCREMENT=1442 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_receipt_items`
--

LOCK TABLES `material_receipt_items` WRITE;
/*!40000 ALTER TABLE `material_receipt_items` DISABLE KEYS */;
INSERT INTO `material_receipt_items` VALUES (32,12,211,'Piece','Piece','Square Feet',607.0000,3141.0000,'INR',1.000000,0.0000,232.6500,0.0000,141218.5500,0.000,607.000,0.0000,141218.55,NULL,NULL,'2026-09-28 08:39:44'),(1186,14,213,'Kilogram','Kilogram',NULL,2.0000,0.0000,'INR',1.000000,0.0000,786.9600,0.0000,1573.9200,0.000,2.000,0.0000,1573.92,NULL,NULL,'2026-09-30 11:56:26'),(1187,14,85,'Kg','Kg',NULL,2.0000,0.0000,'INR',1.000000,0.0000,808.0000,0.0000,1616.0000,0.000,2.000,0.0000,1616.00,NULL,NULL,'2026-09-30 11:56:26'),(1188,14,31,'Kg','Kg',NULL,100.0000,0.0000,'INR',1.000000,0.0000,139.0000,0.0000,13900.0000,0.000,100.000,0.0000,13900.00,NULL,NULL,'2026-09-30 11:56:26'),(1189,14,182,'Kg','Kg',NULL,100.0000,0.0000,'INR',1.000000,0.0000,711.0000,0.0000,71100.0000,0.000,100.000,0.0000,71100.00,NULL,NULL,'2026-09-30 11:56:26'),(1190,14,173,'Kg','Kg',NULL,30.0000,0.0000,'INR',1.000000,0.0000,811.0000,0.0000,24330.0000,0.000,30.000,0.0000,24330.00,NULL,NULL,'2026-09-30 11:56:26'),(1191,14,172,'Kg','Kg',NULL,30.0000,0.0000,'INR',1.000000,0.0000,381.0000,0.0000,11430.0000,0.000,30.000,0.0000,11430.00,NULL,NULL,'2026-09-30 11:56:26'),(1192,14,158,'Kg','Kg',NULL,1.0000,0.0000,'INR',1.000000,0.0000,5204.0000,0.0000,5204.0000,0.000,1.000,0.0000,5204.00,NULL,NULL,'2026-09-30 11:56:26'),(1193,14,125,'Kg','Kg',NULL,10.0000,0.0000,'INR',1.000000,0.0000,929.0000,0.0000,9290.0000,0.000,10.000,0.0000,9290.00,NULL,NULL,'2026-09-30 11:56:26'),(1194,14,167,'Kg','Kg',NULL,10.0000,0.0000,'INR',1.000000,0.0000,675.0000,0.0000,6750.0000,0.000,10.000,0.0000,6750.00,NULL,NULL,'2026-09-30 11:56:26'),(1195,14,126,'Kg','Kg',NULL,5.0000,0.0000,'INR',1.000000,0.0000,1564.0000,0.0000,7820.0000,0.000,5.000,0.0000,7820.00,NULL,NULL,'2026-09-30 11:56:26'),(1196,14,107,'Kg','Kg',NULL,25.0000,0.0000,'INR',1.000000,0.0000,540.0000,0.0000,13500.0000,0.000,25.000,0.0000,13500.00,NULL,NULL,'2026-09-30 11:56:26'),(1197,14,108,'Kg','Kg',NULL,25.0000,0.0000,'INR',1.000000,0.0000,450.0000,0.0000,11250.0000,0.000,25.000,0.0000,11250.00,NULL,NULL,'2026-09-30 11:56:26'),(1198,14,214,'Kilogram','Kilogram',NULL,1.0000,0.0000,'INR',1.000000,0.0000,663.0000,0.0000,663.0000,0.000,1.000,0.0000,663.00,NULL,NULL,'2026-09-30 11:56:26'),(1199,14,178,'Kg','Kg',NULL,30.0000,0.0000,'INR',1.000000,0.0000,196.0000,0.0000,5880.0000,0.000,30.000,0.0000,5880.00,NULL,NULL,'2026-09-30 11:56:26'),(1200,14,123,'Kg','Kg',NULL,120.0000,0.0000,'INR',1.000000,0.0000,177.0000,0.0000,21240.0000,0.000,120.000,0.0000,21240.00,NULL,NULL,'2026-09-30 11:56:26'),(1201,14,209,'Kilogram','Kilogram','Kilogram',350.0000,0.0000,'INR',1.000000,0.0000,86.0000,0.0000,30100.0000,0.000,350.000,0.0000,30100.00,NULL,NULL,'2026-09-30 11:56:26'),(1202,14,209,'Kilogram','Kilogram','Kilogram',210.0000,0.0000,'INR',1.000000,0.0000,80.0000,0.0000,16800.0000,0.000,210.000,0.0000,16800.00,NULL,NULL,'2026-09-30 11:56:26'),(1203,14,213,'Kilogram','Kilogram',NULL,10.0000,0.0000,'INR',1.000000,0.0000,0.0000,0.0000,0.0000,0.000,10.000,0.0000,0.00,NULL,NULL,'2026-09-30 11:56:26'),(1437,17,215,'Kilogram','Kilogram',NULL,10.0000,0.0000,'INR',1.000000,0.0000,479.0000,0.0000,4071.5000,0.000,10.000,0.0000,4071.50,NULL,NULL,'2026-09-30 16:34:31'),(1438,17,216,'Kg','Kg',NULL,5.0000,0.0000,'INR',1.000000,0.0000,603.0000,0.0000,3015.0000,0.000,5.000,0.0000,3015.00,NULL,NULL,'2026-09-30 16:34:31'),(1439,17,217,'Kg','Kg',NULL,2.0000,0.0000,'INR',1.000000,0.0000,794.0000,0.0000,1588.0000,0.000,2.000,0.0000,1588.00,NULL,NULL,'2026-09-30 16:34:31'),(1440,17,218,'Kg','Kg',NULL,2.0000,0.0000,'INR',1.000000,0.0000,628.0000,0.0000,1256.0000,0.000,2.000,0.0000,1256.00,NULL,NULL,'2026-09-30 16:34:31'),(1441,17,219,'Kg','Kg',NULL,3.0000,0.0000,'INR',1.000000,0.0000,371.0000,0.0000,1113.0000,0.000,3.000,0.0000,1113.00,NULL,NULL,'2026-09-30 16:34:31');
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
  `receipt_type` enum('Purchase Order','Direct Purchase','Transfer','Sample','Return','Physical Stock') DEFAULT 'Direct Purchase',
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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_receipts`
--

LOCK TABLES `material_receipts` WRITE;
/*!40000 ALTER TABLE `material_receipts` DISABLE KEYS */;
INSERT INTO `material_receipts` VALUES (12,'GRN-2026-00001','2026-09-28','Physical Stock',14,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,7,0.00,0.00,0.00,5.00,0.0000,0.0000,7060.9275,7060.9275,'IGST',0.0000,141218.55,148279.48,NULL,'Posted',7,7,'2026-09-28 08:39:40','2026-09-28 08:39:44'),(14,'GRN-2026-00002','2026-09-28','Physical Stock',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,8,0.00,0.00,0.00,5.00,0.0000,0.0000,12622.3460,12622.3460,'IGST',0.0000,252446.92,265069.27,NULL,'Draft',16,12,'2026-09-28 12:37:43','2026-09-30 10:17:51'),(17,'GRN-2026-00003','2026-09-26','Physical Stock',16,NULL,NULL,'PFC/26-27/1832','2026-09-26',NULL,NULL,NULL,NULL,8,440.00,0.00,0.00,18.00,0.0000,0.0000,1987.8300,1987.8300,'IGST',440.0000,11043.50,13471.33,NULL,'Draft',12,7,'2026-09-30 12:05:47','2026-09-30 16:34:31');
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
) ENGINE=InnoDB AUTO_INCREMENT=346 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_transactions`
--

LOCK TABLES `material_transactions` WRITE;
/*!40000 ALTER TABLE `material_transactions` DISABLE KEYS */;
INSERT INTO `material_transactions` VALUES (3,'2026-09-07 16:31:55','OPENING','MAT-00032',0,34,NULL,357.500,357.500,0.00,0.00,0.000,0.00,357.500,0.000000,0.00,'material_master',NULL,'2026-09-07 16:31:55','2026-09-07 16:31:55'),(4,'2026-09-07 16:32:22','OPENING','MAT-00121',0,122,NULL,172.000,172.000,0.00,0.00,0.000,0.00,172.000,0.000000,0.00,'material_master',NULL,'2026-09-07 16:32:22','2026-09-07 16:32:22'),(5,'2026-09-07 16:54:58','OPENING','MAT-00070',0,72,NULL,163.000,163.000,0.00,0.00,0.000,0.00,163.000,0.000000,0.00,'material_master',NULL,'2026-09-07 16:54:58','2026-09-07 16:54:58'),(6,'2026-09-07 16:55:22','OPENING','MAT-00035',0,37,NULL,155.000,155.000,0.00,0.00,0.000,0.00,155.000,0.000000,0.00,'material_master',NULL,'2026-09-07 16:55:22','2026-09-07 16:55:22'),(32,'2026-09-27 14:57:23','OPENING','MAT-00105',8,105,NULL,0.700,-0.700,0.00,641.34,0.000,0.00,0.700,0.000000,0.00,'material_master',NULL,'2026-09-27 14:57:23','2026-09-28 06:47:37'),(37,'2026-09-27 00:00:00','OPENING','MAT-00208',8,208,NULL,1.000,0.000,0.00,2034.00,0.000,0.00,1.000,2034.000000,2034.00,'material_master',208,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(38,'2026-09-27 00:00:00','OPENING','MAT-00207',8,207,NULL,1.000,0.000,0.00,1699.00,0.000,0.00,1.000,1699.000000,1699.00,'material_master',207,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(39,'2026-09-27 00:00:00','OPENING','MAT-00206',8,206,NULL,0.500,0.000,0.00,0.00,0.000,0.00,0.500,0.000000,0.00,'material_master',206,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(40,'2026-09-27 00:00:00','OPENING','MAT-00205',8,205,NULL,0.250,0.000,0.00,0.00,0.000,0.00,0.250,0.000000,0.00,'material_master',205,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(41,'2026-09-27 00:00:00','OPENING','MAT-00204',8,204,NULL,0.400,0.000,0.00,0.00,0.000,0.00,0.400,0.000000,0.00,'material_master',204,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(42,'2026-09-27 00:00:00','OPENING','MAT-00203',8,203,NULL,0.230,0.000,0.00,0.00,0.000,0.00,0.230,0.000000,0.00,'material_master',203,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(43,'2026-09-26 00:00:00','OPENING','MAT-00202',8,202,NULL,0.500,0.000,0.00,0.00,0.000,0.00,0.500,0.000000,0.00,'material_master',202,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(44,'2026-09-27 00:00:00','OPENING','MAT-00201',8,201,NULL,0.750,0.000,0.00,0.00,0.000,0.00,0.750,0.000000,0.00,'material_master',201,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(45,'2026-09-27 00:00:00','OPENING','MAT-00200',8,200,NULL,0.100,0.000,0.00,0.00,0.000,0.00,0.100,0.000000,0.00,'material_master',200,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(46,'2026-09-27 00:00:00','OPENING','MAT-00199',8,199,NULL,0.700,0.000,0.00,662.20,0.000,0.00,0.700,946.000000,662.20,'material_master',199,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(47,'2026-09-27 00:00:00','OPENING','MAT-00198',8,198,NULL,0.650,0.000,0.00,921.70,0.000,0.00,0.650,1418.000000,921.70,'material_master',198,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(48,'2026-09-27 00:00:00','OPENING','MAT-00197',8,197,NULL,0.500,0.000,0.00,2827.00,0.000,0.00,0.500,5654.000000,2827.00,'material_master',197,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(49,'2026-09-27 00:00:00','OPENING','MAT-00196',8,196,NULL,0.700,0.000,0.00,1028.30,0.000,0.00,0.700,1469.000000,1028.30,'material_master',196,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(50,'2026-09-27 00:00:00','OPENING','MAT-00195',8,195,NULL,0.800,0.000,0.00,10168.80,0.000,0.00,0.800,12711.000000,10168.80,'material_master',195,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(51,'2026-09-27 00:00:00','OPENING','MAT-00194',8,194,NULL,0.400,0.000,0.00,568.80,0.000,0.00,0.400,1422.000000,568.80,'material_master',194,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(52,'2026-09-27 00:00:00','OPENING','MAT-00193',8,193,NULL,5.000,0.000,0.00,2750.00,0.000,0.00,5.000,550.000000,2750.00,'material_master',193,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(53,'2026-09-27 00:00:00','OPENING','MAT-00192',8,192,NULL,15.000,0.000,0.00,4140.00,0.000,0.00,15.000,276.000000,4140.00,'material_master',192,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(54,'2026-09-27 00:00:00','OPENING','MAT-00191',8,191,NULL,3.000,0.000,0.00,1149.00,0.000,0.00,3.000,383.000000,1149.00,'material_master',191,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(55,'2026-09-27 00:00:00','OPENING','MAT-00190',8,190,NULL,5.000,0.000,0.00,2465.00,0.000,0.00,5.000,493.000000,2465.00,'material_master',190,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(56,'2026-09-27 00:00:00','OPENING','MAT-00189',8,189,NULL,4.500,0.000,0.00,1966.50,0.000,0.00,4.500,437.000000,1966.50,'material_master',189,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(57,'2026-09-27 00:00:00','OPENING','MAT-00188',8,188,NULL,1.500,0.000,0.00,1165.50,0.000,0.00,1.500,777.000000,1165.50,'material_master',188,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(58,'2026-09-27 00:00:00','OPENING','MAT-00187',8,187,NULL,5.700,0.000,0.00,7518.30,0.000,0.00,5.700,1319.000000,7518.30,'material_master',187,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(59,'2026-09-27 00:00:00','OPENING','MAT-00186',8,186,NULL,4.700,0.000,0.00,6218.10,0.000,0.00,4.700,1323.000000,6218.10,'material_master',186,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(60,'2026-09-27 00:00:00','OPENING','MAT-00185',8,185,NULL,0.500,0.000,0.00,376.50,0.000,0.00,0.500,753.000000,376.50,'material_master',185,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(61,'2026-09-27 00:00:00','OPENING','MAT-00183',8,183,NULL,1.500,0.000,0.00,756.00,0.000,0.00,1.500,504.000000,756.00,'material_master',183,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(62,'2026-09-27 00:00:00','OPENING','MAT-00182',8,182,NULL,50.000,0.000,0.00,35550.00,0.000,0.00,50.000,711.000000,35550.00,'material_master',182,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(63,'2026-09-27 00:00:00','OPENING','MAT-00181',8,181,NULL,2.000,0.000,0.00,0.00,0.000,0.00,2.000,0.000000,0.00,'material_master',181,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(64,'2026-09-27 00:00:00','OPENING','MAT-00180',8,180,NULL,10.000,0.000,0.00,6020.00,0.000,0.00,10.000,602.000000,6020.00,'material_master',180,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(65,'2026-09-27 00:00:00','OPENING','MAT-00179',8,179,NULL,0.300,0.000,0.00,153.00,0.000,0.00,0.300,510.000000,153.00,'material_master',179,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(66,'2026-09-27 00:00:00','OPENING','MAT-00178',8,178,NULL,0.500,0.000,0.00,98.00,0.000,0.00,0.500,196.000000,98.00,'material_master',178,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(67,'2026-09-27 00:00:00','OPENING','MAT-00177',8,177,NULL,0.600,0.000,0.00,140.40,0.000,0.00,0.600,234.000000,140.40,'material_master',177,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(68,'2026-09-27 00:00:00','OPENING','MAT-00176',8,176,NULL,0.350,0.000,0.00,0.00,0.000,0.00,0.350,0.000000,0.00,'material_master',176,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(69,'2026-09-27 00:00:00','OPENING','MAT-00175',8,175,NULL,0.700,0.000,0.00,490.00,0.000,0.00,0.700,700.000000,490.00,'material_master',175,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(70,'2026-09-27 00:00:00','OPENING','MAT-00174',8,174,NULL,3.000,0.000,0.00,1308.00,0.000,0.00,3.000,436.000000,1308.00,'material_master',174,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(71,'2026-09-27 00:00:00','OPENING','MAT-00173',8,173,NULL,8.000,0.000,0.00,6488.00,0.000,0.00,8.000,811.000000,6488.00,'material_master',173,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(72,'2026-09-27 00:00:00','OPENING','MAT-00172',8,172,NULL,17.000,0.000,0.00,6477.00,0.000,0.00,17.000,381.000000,6477.00,'material_master',172,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(73,'2026-09-27 00:00:00','OPENING','MAT-00171',8,171,NULL,25.000,0.000,0.00,4600.00,0.000,0.00,25.000,184.000000,4600.00,'material_master',171,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(74,'2026-09-27 00:00:00','OPENING','MAT-00170',8,170,NULL,21.000,0.000,0.00,5124.00,0.000,0.00,21.000,244.000000,5124.00,'material_master',170,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(75,'2026-09-27 00:00:00','OPENING','MAT-00169',8,169,NULL,3.500,0.000,0.00,1876.00,0.000,0.00,3.500,536.000000,1876.00,'material_master',169,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(76,'2026-09-27 00:00:00','OPENING','MAT-00168',8,168,NULL,1.500,0.000,0.00,607.50,0.000,0.00,1.500,405.000000,607.50,'material_master',168,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(77,'2026-09-27 00:00:00','OPENING','MAT-00167',8,167,NULL,5.500,0.000,0.00,3712.50,0.000,0.00,5.500,675.000000,3712.50,'material_master',167,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(78,'2026-09-27 00:00:00','OPENING','MAT-00166',8,166,NULL,0.350,0.000,0.00,164.15,0.000,0.00,0.350,469.000000,164.15,'material_master',166,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(79,'2026-09-27 00:00:00','OPENING','MAT-00165',8,165,NULL,0.250,0.000,0.00,146.75,0.000,0.00,0.250,587.000000,146.75,'material_master',165,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(80,'2026-09-27 00:00:00','OPENING','MAT-00164',8,164,NULL,0.900,0.000,0.00,0.00,0.000,0.00,0.900,0.000000,0.00,'material_master',164,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(81,'2026-09-27 00:00:00','OPENING','MAT-00163',8,163,NULL,1.000,0.000,0.00,0.00,0.000,0.00,1.000,0.000000,0.00,'material_master',163,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(82,'2026-09-27 00:00:00','OPENING','MAT-00162',8,162,NULL,2.000,0.000,0.00,912.00,0.000,0.00,2.000,456.000000,912.00,'material_master',162,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(83,'2026-09-27 00:00:00','OPENING','MAT-00161',8,161,NULL,1.000,0.000,0.00,0.00,0.000,0.00,1.000,0.000000,0.00,'material_master',161,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(84,'2026-09-27 00:00:00','OPENING','MAT-00160',8,160,NULL,1.500,0.000,0.00,0.00,0.000,0.00,1.500,0.000000,0.00,'material_master',160,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(85,'2026-09-27 00:00:00','OPENING','MAT-00159',8,159,NULL,2.600,0.000,0.00,0.00,0.000,0.00,2.600,0.000000,0.00,'material_master',159,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(86,'2026-09-27 00:00:00','OPENING','MAT-00158',8,158,NULL,0.570,0.000,0.00,2966.28,0.000,0.00,0.570,5204.000000,2966.28,'material_master',158,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(87,'2026-09-27 00:00:00','OPENING','MAT-00157',8,157,NULL,1.800,0.000,0.00,678.60,0.000,0.00,1.800,377.000000,678.60,'material_master',157,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(88,'2026-09-27 00:00:00','OPENING','MAT-00156',8,156,NULL,1.400,0.000,0.00,665.00,0.000,0.00,1.400,475.000000,665.00,'material_master',156,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(89,'2026-09-27 00:00:00','OPENING','MAT-00155',8,155,NULL,2.800,0.000,0.00,0.00,0.000,0.00,2.800,0.000000,0.00,'material_master',155,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(90,'2026-09-27 00:00:00','OPENING','MAT-00154',8,154,NULL,3.800,0.000,0.00,1383.20,0.000,0.00,3.800,364.000000,1383.20,'material_master',154,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(91,'2026-09-27 00:00:00','OPENING','MAT-00153',8,153,NULL,1.800,0.000,0.00,0.00,0.000,0.00,1.800,0.000000,0.00,'material_master',153,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(92,'2026-09-27 00:00:00','OPENING','MAT-00152',8,152,NULL,48.000,0.000,0.00,16704.00,0.000,0.00,48.000,348.000000,16704.00,'material_master',152,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(93,'2026-09-27 00:00:00','OPENING','MAT-00151',8,151,NULL,0.800,0.000,0.00,468.00,0.000,0.00,0.800,585.000000,468.00,'material_master',151,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(94,'2026-09-27 00:00:00','OPENING','MAT-00150',8,150,NULL,0.900,0.000,0.00,0.00,0.000,0.00,0.900,0.000000,0.00,'material_master',150,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(95,'2026-09-27 00:00:00','OPENING','MAT-00149',8,149,NULL,2.500,0.000,0.00,807.50,0.000,0.00,2.500,323.000000,807.50,'material_master',149,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(96,'2026-09-27 00:00:00','OPENING','MAT-00148',8,148,NULL,2.500,0.000,0.00,1197.50,0.000,0.00,2.500,479.000000,1197.50,'material_master',148,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(97,'2026-09-27 00:00:00','OPENING','MAT-00147',8,147,NULL,1.000,0.000,0.00,0.00,0.000,0.00,1.000,0.000000,0.00,'material_master',147,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(98,'2026-09-27 00:00:00','OPENING','MAT-00146',8,146,NULL,3.800,0.000,0.00,1987.40,0.000,0.00,3.800,523.000000,1987.40,'material_master',146,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(99,'2026-09-27 00:00:00','OPENING','MAT-00145',8,145,NULL,6.500,0.000,0.00,260.00,0.000,0.00,6.500,40.000000,260.00,'material_master',145,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(100,'2026-09-27 00:00:00','OPENING','MAT-00144',8,144,NULL,6.000,0.000,0.00,2964.00,0.000,0.00,6.000,494.000000,2964.00,'material_master',144,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(101,'2026-09-27 00:00:00','OPENING','MAT-00143',8,143,NULL,6.200,0.000,0.00,1829.00,0.000,0.00,6.200,295.000000,1829.00,'material_master',143,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(102,'2026-09-27 00:00:00','OPENING','MAT-00142',8,142,NULL,53.500,0.000,0.00,36968.50,0.000,0.00,53.500,691.000000,36968.50,'material_master',142,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(103,'2026-09-27 00:00:00','OPENING','MAT-00141',8,141,NULL,0.800,0.000,0.00,348.80,0.000,0.00,0.800,436.000000,348.80,'material_master',141,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(104,'2026-09-27 00:00:00','OPENING','MAT-00140',8,140,NULL,2.700,0.000,0.00,1682.10,0.000,0.00,2.700,623.000000,1682.10,'material_master',140,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(105,'2026-09-27 00:00:00','OPENING','MAT-00139',8,139,NULL,8.000,0.000,0.00,5400.00,0.000,0.00,8.000,675.000000,5400.00,'material_master',139,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(106,'2026-09-27 00:00:00','OPENING','MAT-00138',8,138,NULL,3.500,0.000,0.00,1764.00,0.000,0.00,3.500,504.000000,1764.00,'material_master',138,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(107,'2026-09-27 00:00:00','OPENING','MAT-00137',8,137,NULL,4.900,0.000,0.00,2420.60,0.000,0.00,4.900,494.000000,2420.60,'material_master',137,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(108,'2026-09-27 00:00:00','OPENING','MAT-00136',8,136,NULL,4.800,0.000,0.00,3177.60,0.000,0.00,4.800,662.000000,3177.60,'material_master',136,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(109,'2026-09-27 00:00:00','OPENING','MAT-00135',8,135,NULL,4.800,0.000,0.00,3278.40,0.000,0.00,4.800,683.000000,3278.40,'material_master',135,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(110,'2026-09-27 00:00:00','OPENING','MAT-00134',8,134,NULL,4.500,0.000,0.00,2790.00,0.000,0.00,4.500,620.000000,2790.00,'material_master',134,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(111,'2026-09-27 00:00:00','OPENING','MAT-00133',8,133,NULL,0.500,0.000,0.00,166.00,0.000,0.00,0.500,332.000000,166.00,'material_master',133,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(112,'2026-09-27 00:00:00','OPENING','MAT-00132',8,132,NULL,2.000,0.000,0.00,1682.00,0.000,0.00,2.000,841.000000,1682.00,'material_master',132,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(113,'2026-09-27 00:00:00','OPENING','MAT-00131',8,131,NULL,2.200,0.000,0.00,1988.80,0.000,0.00,2.200,904.000000,1988.80,'material_master',131,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(114,'2026-09-27 00:00:00','OPENING','MAT-00130',8,130,NULL,1.800,0.000,0.00,2970.00,0.000,0.00,1.800,1650.000000,2970.00,'material_master',130,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(115,'2026-09-27 00:00:00','OPENING','MAT-00129',8,129,NULL,1.800,0.000,0.00,1060.20,0.000,0.00,1.800,589.000000,1060.20,'material_master',129,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(116,'2026-09-27 00:00:00','OPENING','MAT-00128',8,128,NULL,1.300,0.000,0.00,1209.00,0.000,0.00,1.300,930.000000,1209.00,'material_master',128,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(117,'2026-09-27 00:00:00','OPENING','MAT-00127',8,127,NULL,1.500,0.000,0.00,1008.00,0.000,0.00,1.500,672.000000,1008.00,'material_master',127,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(118,'2026-09-27 00:00:00','OPENING','MAT-00126',8,126,NULL,0.850,0.000,0.00,1329.40,0.000,0.00,0.850,1564.000000,1329.40,'material_master',126,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(119,'2026-09-27 00:00:00','OPENING','MAT-00125',8,125,NULL,15.000,0.000,0.00,13935.00,0.000,0.00,15.000,929.000000,13935.00,'material_master',125,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(120,'2026-09-27 00:00:00','OPENING','MAT-00124',8,124,NULL,18.000,0.000,0.00,5652.00,0.000,0.00,18.000,314.000000,5652.00,'material_master',124,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(121,'2026-09-27 00:00:00','OPENING','MAT-00123',8,123,NULL,80.000,0.000,0.00,14160.00,0.000,0.00,80.000,177.000000,14160.00,'material_master',123,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(122,'2026-09-27 00:00:00','OPENING','MAT-00122',8,122,NULL,100.000,0.000,0.00,15000.00,0.000,0.00,100.000,150.000000,15000.00,'material_master',122,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(123,'2026-09-27 00:00:00','OPENING','MAT-00121',8,121,NULL,50.000,0.000,0.00,7500.00,0.000,0.00,50.000,150.000000,7500.00,'material_master',121,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(124,'2026-09-27 00:00:00','OPENING','MAT-00120',8,120,NULL,49.000,0.000,0.00,32683.00,0.000,0.00,49.000,667.000000,32683.00,'material_master',120,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(125,'2026-09-27 00:00:00','OPENING','MAT-00119',8,119,NULL,10.000,0.000,0.00,2670.00,0.000,0.00,10.000,267.000000,2670.00,'material_master',119,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(126,'2026-09-27 00:00:00','OPENING','MAT-00118',8,118,NULL,120.000,0.000,0.00,18000.00,0.000,0.00,120.000,150.000000,18000.00,'material_master',118,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(127,'2026-09-27 00:00:00','OPENING','MAT-00117',8,117,NULL,7.000,0.000,0.00,3759.00,0.000,0.00,7.000,537.000000,3759.00,'material_master',117,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(128,'2026-09-27 00:00:00','OPENING','MAT-00116',8,116,NULL,72.500,0.000,0.00,25012.50,0.000,0.00,72.500,345.000000,25012.50,'material_master',116,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(129,'2026-09-27 00:00:00','OPENING','MAT-00115',8,115,NULL,93.500,0.000,0.00,14305.50,0.000,0.00,93.500,153.000000,14305.50,'material_master',115,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(130,'2026-09-27 00:00:00','OPENING','MAT-00114',8,114,NULL,10.000,0.000,0.00,2730.00,0.000,0.00,10.000,273.000000,2730.00,'material_master',114,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(131,'2026-09-27 00:00:00','OPENING','MAT-00113',8,113,NULL,5.300,0.000,0.00,3730.14,0.000,0.00,5.300,703.800000,3730.14,'material_master',113,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(132,'2026-09-27 00:00:00','OPENING','MAT-00112',8,112,NULL,8.800,0.000,0.00,5161.90,0.000,0.00,8.800,586.580000,5161.90,'material_master',112,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(133,'2026-09-27 00:00:00','OPENING','MAT-00111',8,111,NULL,3.500,0.000,0.00,2610.58,0.000,0.00,3.500,745.880000,2610.58,'material_master',111,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(134,'2026-09-27 00:00:00','OPENING','MAT-00110',8,110,NULL,3.250,0.000,0.00,1873.85,0.000,0.00,3.250,576.570000,1873.85,'material_master',110,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(135,'2026-09-27 00:00:00','OPENING','MAT-00109',8,109,NULL,3.650,0.000,0.00,1987.46,0.000,0.00,3.650,544.510000,1987.46,'material_master',109,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(136,'2026-09-27 00:00:00','OPENING','MAT-00108',8,108,NULL,60.000,0.000,0.00,27000.00,0.000,0.00,60.000,450.000000,27000.00,'material_master',108,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(137,'2026-09-27 00:00:00','OPENING','MAT-00107',8,107,NULL,60.900,0.000,0.00,32886.00,0.000,0.00,60.900,540.000000,32886.00,'material_master',107,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(138,'2026-09-27 00:00:00','OPENING','MAT-00106',8,106,NULL,17.500,0.000,0.00,16857.93,0.000,0.00,17.500,963.310000,16857.93,'material_master',106,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(139,'2026-09-27 00:00:00','OPENING','MAT-00104',8,104,NULL,0.850,0.000,0.00,383.63,0.000,0.00,0.850,451.330000,383.63,'material_master',104,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(140,'2026-09-27 00:00:00','OPENING','MAT-00103',8,103,NULL,0.400,0.000,0.00,0.00,0.000,0.00,0.400,0.000000,0.00,'material_master',103,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(141,'2026-09-27 00:00:00','OPENING','MAT-00102',8,102,NULL,0.550,0.000,0.00,0.00,0.000,0.00,0.550,0.000000,0.00,'material_master',102,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(142,'2026-09-27 00:00:00','OPENING','MAT-00101',8,101,NULL,1.100,0.000,0.00,1408.64,0.000,0.00,1.100,1280.580000,1408.64,'material_master',101,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(143,'2026-09-27 00:00:00','OPENING','MAT-00100',8,100,NULL,1.800,0.000,0.00,1046.83,0.000,0.00,1.800,581.570000,1046.83,'material_master',100,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(144,'2026-09-27 00:00:00','OPENING','MAT-00099',8,99,NULL,0.400,0.000,0.00,264.29,0.000,0.00,0.400,660.720000,264.29,'material_master',99,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(145,'2026-09-27 00:00:00','OPENING','MAT-00098',8,98,NULL,0.100,0.000,0.00,64.77,0.000,0.00,0.100,647.700000,64.77,'material_master',98,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(146,'2026-09-27 00:00:00','OPENING','MAT-00097',8,97,NULL,1.700,0.000,0.00,815.35,0.000,0.00,1.700,479.620000,815.35,'material_master',97,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(147,'2026-09-27 00:00:00','OPENING','MAT-00096',8,96,NULL,0.650,0.000,0.00,284.45,0.000,0.00,0.650,437.620000,284.45,'material_master',96,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(148,'2026-09-27 00:00:00','OPENING','MAT-00095',8,95,NULL,0.300,0.000,0.00,151.33,0.000,0.00,0.300,504.430000,151.33,'material_master',95,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(149,'2026-09-27 00:00:00','OPENING','MAT-00094',8,94,NULL,0.090,0.000,0.00,65.61,0.000,0.00,0.090,729.000000,65.61,'material_master',94,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(150,'2026-09-27 00:00:00','OPENING','MAT-00093',8,93,NULL,0.200,0.000,0.00,74.44,0.000,0.00,0.200,372.200000,74.44,'material_master',93,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(151,'2026-09-27 00:00:00','OPENING','MAT-00092',8,92,NULL,0.220,0.000,0.00,907.06,0.000,0.00,0.220,4123.000000,907.06,'material_master',92,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(152,'2026-09-27 00:00:00','OPENING','MAT-00091',8,91,NULL,0.850,0.000,0.00,532.10,0.000,0.00,0.850,626.000000,532.10,'material_master',91,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(153,'2026-09-27 00:00:00','OPENING','MAT-00090',8,90,NULL,0.850,0.000,0.00,510.00,0.000,0.00,0.850,600.000000,510.00,'material_master',90,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(154,'2026-09-27 00:00:00','OPENING','MAT-00089',8,89,NULL,4.950,0.000,0.00,6499.35,0.000,0.00,4.950,1313.000000,6499.35,'material_master',89,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(155,'2026-09-27 00:00:00','OPENING','MAT-00088',8,88,NULL,2.000,0.000,0.00,1040.96,0.000,0.00,2.000,520.480000,1040.96,'material_master',88,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(156,'2026-09-27 00:00:00','OPENING','MAT-00087',8,87,NULL,0.450,0.000,0.00,548.10,0.000,0.00,0.450,1218.000000,548.10,'material_master',87,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(157,'2026-09-27 00:00:00','OPENING','MAT-00086',8,86,NULL,0.400,0.000,0.00,344.00,0.000,0.00,0.400,860.000000,344.00,'material_master',86,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(158,'2026-09-27 00:00:00','OPENING','MAT-00085',8,85,NULL,0.100,0.000,0.00,81.90,0.000,0.00,0.100,819.000000,81.90,'material_master',85,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(159,'2026-09-27 00:00:00','OPENING','MAT-00084',8,84,NULL,2.950,0.000,0.00,2840.85,0.000,0.00,2.950,963.000000,2840.85,'material_master',84,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(160,'2026-09-27 00:00:00','OPENING','MAT-00083',8,83,NULL,1.500,0.000,0.00,1160.94,0.000,0.00,1.500,773.960000,1160.94,'material_master',83,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(161,'2026-09-27 00:00:00','OPENING','MAT-00082',8,82,NULL,3.700,0.000,0.00,3319.57,0.000,0.00,3.700,897.180000,3319.57,'material_master',82,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(162,'2026-09-27 00:00:00','OPENING','MAT-00081',8,81,NULL,2.600,0.000,0.00,2134.70,0.000,0.00,2.600,821.040000,2134.70,'material_master',81,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(163,'2026-09-27 00:00:00','OPENING','MAT-00080',8,80,NULL,0.600,0.000,0.00,296.66,0.000,0.00,0.600,494.430000,296.66,'material_master',80,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(164,'2026-09-27 00:00:00','OPENING','MAT-00079',8,79,NULL,0.250,0.000,0.00,164.35,0.000,0.00,0.250,657.400000,164.35,'material_master',79,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(165,'2026-09-27 00:00:00','OPENING','MAT-00078',8,78,NULL,5.250,0.000,0.00,6084.75,0.000,0.00,5.250,1159.000000,6084.75,'material_master',78,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(166,'2026-09-27 00:00:00','OPENING','MAT-00077',8,77,NULL,0.600,0.000,0.00,269.55,0.000,0.00,0.600,449.250000,269.55,'material_master',77,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(167,'2026-09-27 00:00:00','OPENING','MAT-00076',8,76,NULL,3.300,0.000,0.00,2795.40,0.000,0.00,3.300,847.090000,2795.40,'material_master',76,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(168,'2026-09-27 00:00:00','OPENING','MAT-00075',8,75,NULL,0.350,0.000,0.00,361.00,0.000,0.00,0.350,1031.440000,361.00,'material_master',75,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(169,'2026-09-27 00:00:00','OPENING','MAT-00074',8,74,NULL,0.500,0.000,0.00,261.74,0.000,0.00,0.500,523.480000,261.74,'material_master',74,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(170,'2026-09-27 00:00:00','OPENING','MAT-00073',8,73,NULL,0.600,0.000,0.00,494.43,0.000,0.00,0.600,824.050000,494.43,'material_master',73,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(171,'2026-09-27 00:00:00','OPENING','MAT-00072',8,72,NULL,0.750,0.000,0.00,185.25,0.000,0.00,0.750,247.000000,185.25,'material_master',72,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(172,'2026-09-27 00:00:00','OPENING','MAT-00071',8,71,NULL,43.500,0.000,0.00,13398.00,0.000,0.00,43.500,308.000000,13398.00,'material_master',71,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(173,'2026-09-27 00:00:00','OPENING','MAT-00070',8,70,NULL,11.000,0.000,0.00,0.00,0.000,0.00,11.000,0.000000,0.00,'material_master',70,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(174,'2026-09-27 00:00:00','OPENING','MAT-00069',8,69,NULL,14.500,0.000,0.00,4785.00,0.000,0.00,14.500,330.000000,4785.00,'material_master',69,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(175,'2026-09-27 00:00:00','OPENING','MAT-00068',8,68,NULL,20.300,0.000,0.00,6171.20,0.000,0.00,20.300,304.000000,6171.20,'material_master',68,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(176,'2026-09-27 00:00:00','OPENING','MAT-00067',8,67,NULL,14.400,0.000,0.00,3801.60,0.000,0.00,14.400,264.000000,3801.60,'material_master',67,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(177,'2026-09-27 00:00:00','OPENING','MAT-00066',8,66,NULL,61.000,0.000,0.00,7625.00,0.000,0.00,61.000,125.000000,7625.00,'material_master',66,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(178,'2026-09-27 00:00:00','OPENING','MAT-00065',8,65,NULL,15.900,0.000,0.00,1987.50,0.000,0.00,15.900,125.000000,1987.50,'material_master',65,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(179,'2026-09-27 00:00:00','OPENING','MAT-00064',8,64,NULL,17.000,0.000,0.00,3315.00,0.000,0.00,17.000,195.000000,3315.00,'material_master',64,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(180,'2026-09-27 00:00:00','OPENING','MAT-00063',8,63,NULL,11.400,0.000,0.00,1687.20,0.000,0.00,11.400,148.000000,1687.20,'material_master',63,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(181,'2026-09-27 00:00:00','OPENING','MAT-00062',8,62,NULL,19.500,0.000,0.00,2827.50,0.000,0.00,19.500,145.000000,2827.50,'material_master',62,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(182,'2026-09-27 00:00:00','OPENING','MAT-00061',8,61,NULL,11.950,0.000,0.00,2210.75,0.000,0.00,11.950,185.000000,2210.75,'material_master',61,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(183,'2026-09-27 00:00:00','OPENING','MAT-00060',8,60,NULL,11.300,0.000,0.00,2994.50,0.000,0.00,11.300,265.000000,2994.50,'material_master',60,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(184,'2026-09-27 00:00:00','OPENING','MAT-00059',8,59,NULL,11.500,0.000,0.00,3197.00,0.000,0.00,11.500,278.000000,3197.00,'material_master',59,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(185,'2026-09-27 00:00:00','OPENING','MAT-00058',8,58,NULL,38.900,0.000,0.00,8013.40,0.000,0.00,38.900,206.000000,8013.40,'material_master',58,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(186,'2026-09-27 00:00:00','OPENING','MAT-00057',8,57,NULL,20.000,0.000,0.00,3600.00,0.000,0.00,20.000,180.000000,3600.00,'material_master',57,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(187,'2026-09-27 00:00:00','OPENING','MAT-00056',8,56,NULL,63.000,0.000,0.00,10080.00,0.000,0.00,63.000,160.000000,10080.00,'material_master',56,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(188,'2026-09-27 00:00:00','OPENING','MAT-00055',8,55,NULL,5.000,0.000,0.00,625.00,0.000,0.00,5.000,125.000000,625.00,'material_master',55,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(189,'2026-09-27 00:00:00','OPENING','MAT-00054',8,54,NULL,46.500,0.000,0.00,5533.50,0.000,0.00,46.500,119.000000,5533.50,'material_master',54,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(190,'2026-09-27 00:00:00','OPENING','MAT-00053',8,53,NULL,21.500,0.000,0.00,5848.00,0.000,0.00,21.500,272.000000,5848.00,'material_master',53,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(191,'2026-09-27 00:00:00','OPENING','MAT-00052',8,52,NULL,119.000,0.000,0.00,13328.00,0.000,0.00,119.000,112.000000,13328.00,'material_master',52,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(192,'2026-09-27 00:00:00','OPENING','MAT-00051',8,51,NULL,63.700,0.000,0.00,7452.90,0.000,0.00,63.700,117.000000,7452.90,'material_master',51,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(193,'2026-09-27 00:00:00','OPENING','MAT-00050',8,50,NULL,45.500,0.000,0.00,5505.50,0.000,0.00,45.500,121.000000,5505.50,'material_master',50,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(194,'2026-09-27 00:00:00','OPENING','MAT-00049',8,49,NULL,129.300,0.000,0.00,6465.00,0.000,0.00,129.300,50.000000,6465.00,'material_master',49,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(195,'2026-09-27 00:00:00','OPENING','MAT-00048',8,48,NULL,59.000,0.000,0.00,10384.00,0.000,0.00,59.000,176.000000,10384.00,'material_master',48,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(196,'2026-09-27 00:00:00','OPENING','MAT-00047',8,47,NULL,105.800,0.000,0.00,5819.00,0.000,0.00,105.800,55.000000,5819.00,'material_master',47,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(197,'2026-09-27 00:00:00','OPENING','MAT-00046',8,46,NULL,42.000,0.000,0.00,7770.00,0.000,0.00,42.000,185.000000,7770.00,'material_master',46,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(198,'2026-09-27 00:00:00','OPENING','MAT-00045',8,45,NULL,74.300,0.000,0.00,12556.70,0.000,0.00,74.300,169.000000,12556.70,'material_master',45,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(199,'2026-09-27 00:00:00','OPENING','MAT-00044',8,44,NULL,50.000,0.000,0.00,15350.00,0.000,0.00,50.000,307.000000,15350.00,'material_master',44,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(200,'2026-09-27 00:00:00','OPENING','MAT-00043',8,43,NULL,159.500,0.000,0.00,36685.00,0.000,0.00,159.500,230.000000,36685.00,'material_master',43,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(201,'2026-09-27 00:00:00','OPENING','MAT-00042',8,42,NULL,42.300,0.000,0.00,6133.50,0.000,0.00,42.300,145.000000,6133.50,'material_master',42,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(202,'2026-09-27 00:00:00','OPENING','MAT-00041',8,41,NULL,32.500,0.000,0.00,7020.00,0.000,0.00,32.500,216.000000,7020.00,'material_master',41,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(203,'2026-09-27 00:00:00','OPENING','MAT-00040',8,40,NULL,8.700,0.000,0.00,1539.90,0.000,0.00,8.700,177.000000,1539.90,'material_master',40,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(204,'2026-09-27 00:00:00','OPENING','MAT-00039',8,39,NULL,10.000,0.000,0.00,2300.00,0.000,0.00,10.000,230.000000,2300.00,'material_master',39,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(205,'2026-09-27 00:00:00','OPENING','MAT-00038',8,38,NULL,35.000,0.000,0.00,7175.00,0.000,0.00,35.000,205.000000,7175.00,'material_master',38,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(206,'2026-09-27 00:00:00','OPENING','MAT-00037',8,37,NULL,25.000,0.000,0.00,5250.00,0.000,0.00,25.000,210.000000,5250.00,'material_master',37,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(207,'2026-09-27 00:00:00','OPENING','MAT-00036',8,36,NULL,20.000,0.000,0.00,26060.00,0.000,0.00,20.000,1303.000000,26060.00,'material_master',36,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(208,'2026-09-27 00:00:00','OPENING','MAT-00035',8,35,NULL,30.000,0.000,0.00,10380.00,0.000,0.00,30.000,346.000000,10380.00,'material_master',35,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(209,'2026-09-27 00:00:00','OPENING','MAT-00034',8,34,NULL,80.000,0.000,0.00,16800.00,0.000,0.00,80.000,210.000000,16800.00,'material_master',34,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(210,'2026-09-27 00:00:00','OPENING','MAT-00033',8,33,NULL,130.000,0.000,0.00,33280.00,0.000,0.00,130.000,256.000000,33280.00,'material_master',33,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(211,'2026-09-27 00:00:00','OPENING','MAT-00032',8,32,NULL,70.000,0.000,0.00,20160.00,0.000,0.00,70.000,288.000000,20160.00,'material_master',32,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(212,'2026-09-27 00:00:00','OPENING','MAT-00031',8,31,NULL,30.000,0.000,0.00,4170.00,0.000,0.00,30.000,139.000000,4170.00,'material_master',31,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(213,'2026-09-27 00:00:00','OPENING','MAT-00030',8,30,NULL,70.000,0.000,0.00,11900.00,0.000,0.00,70.000,170.000000,11900.00,'material_master',30,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(214,'2026-09-27 00:00:00','OPENING','MAT-00029',8,29,NULL,96.000,0.000,0.00,17952.00,0.000,0.00,96.000,187.000000,17952.00,'material_master',29,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(215,'2026-09-27 00:00:00','OPENING','MAT-00028',8,28,NULL,2.400,0.000,0.00,542.40,0.000,0.00,2.400,226.000000,542.40,'material_master',28,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(216,'2026-09-27 00:00:00','OPENING','MAT-00027',8,27,NULL,2.500,0.000,0.00,590.00,0.000,0.00,2.500,236.000000,590.00,'material_master',27,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(217,'2026-09-27 00:00:00','OPENING','MAT-00026',8,26,NULL,3.000,0.000,0.00,1680.00,0.000,0.00,3.000,560.000000,1680.00,'material_master',26,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(218,'2026-09-27 00:00:00','OPENING','MAT-00025',8,25,NULL,6.000,0.000,0.00,1926.00,0.000,0.00,6.000,321.000000,1926.00,'material_master',25,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(219,'2026-09-27 00:00:00','OPENING','MAT-00024',8,24,NULL,0.500,0.000,0.00,103.00,0.000,0.00,0.500,206.000000,103.00,'material_master',24,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(220,'2026-09-27 00:00:00','OPENING','MAT-00023',8,23,NULL,10.900,0.000,0.00,1885.70,0.000,0.00,10.900,173.000000,1885.70,'material_master',23,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(221,'2026-09-27 00:00:00','OPENING','MAT-00022',8,22,NULL,21.300,0.000,0.00,5026.80,0.000,0.00,21.300,236.000000,5026.80,'material_master',22,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(222,'2026-09-27 00:00:00','OPENING','MAT-00021',8,21,NULL,1.800,0.000,0.00,417.60,0.000,0.00,1.800,232.000000,417.60,'material_master',21,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(223,'2026-09-27 00:00:00','OPENING','MAT-00020',8,20,NULL,85.000,0.000,0.00,32215.00,0.000,0.00,85.000,379.000000,32215.00,'material_master',20,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(224,'2026-09-27 00:00:00','OPENING','MAT-00019',8,19,NULL,5.500,0.000,0.00,2453.00,0.000,0.00,5.500,446.000000,2453.00,'material_master',19,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(225,'2026-09-27 00:00:00','OPENING','MAT-00018',8,18,NULL,3.000,0.000,0.00,1395.00,0.000,0.00,3.000,465.000000,1395.00,'material_master',18,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(226,'2026-09-27 00:00:00','OPENING','MAT-00017',8,17,NULL,5.000,0.000,0.00,2875.00,0.000,0.00,5.000,575.000000,2875.00,'material_master',17,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(227,'2026-09-27 00:00:00','OPENING','MAT-00016',8,16,NULL,4.600,0.000,0.00,1205.20,0.000,0.00,4.600,262.000000,1205.20,'material_master',16,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(228,'2026-09-27 00:00:00','OPENING','MAT-00015',8,15,NULL,9.400,0.000,0.00,2697.80,0.000,0.00,9.400,287.000000,2697.80,'material_master',15,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(229,'2026-09-27 00:00:00','OPENING','MAT-00014',8,14,NULL,150.000,0.000,0.00,33300.00,0.000,0.00,150.000,222.000000,33300.00,'material_master',14,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(230,'2026-09-27 00:00:00','OPENING','MAT-00013',8,13,NULL,33.000,0.000,0.00,19866.00,0.000,0.00,33.000,602.000000,19866.00,'material_master',13,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(231,'2026-09-27 00:00:00','OPENING','MAT-00012',8,12,NULL,30.000,0.000,0.00,3720.00,0.000,0.00,30.000,124.000000,3720.00,'material_master',12,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(232,'2026-09-27 00:00:00','OPENING','MAT-00011',8,11,NULL,148.000,0.000,0.00,27676.00,0.000,0.00,148.000,187.000000,27676.00,'material_master',11,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(233,'2026-09-27 00:00:00','OPENING','MAT-00010',8,10,NULL,145.000,0.000,0.00,20300.00,0.000,0.00,145.000,140.000000,20300.00,'material_master',10,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(234,'2026-09-27 00:00:00','OPENING','MAT-00009',8,9,NULL,139.800,0.000,0.00,38025.60,0.000,0.00,139.800,272.000000,38025.60,'material_master',9,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(235,'2026-09-27 00:00:00','OPENING','MAT-00008',8,8,NULL,50.000,0.000,0.00,10200.00,0.000,0.00,50.000,204.000000,10200.00,'material_master',8,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(236,'2026-09-27 00:00:00','OPENING','MAT-00007',8,7,NULL,13.700,0.000,0.00,5891.00,0.000,0.00,13.700,430.000000,5891.00,'material_master',7,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(237,'2026-09-27 00:00:00','OPENING','MAT-00006',8,6,NULL,16.900,0.000,0.00,5323.50,0.000,0.00,16.900,315.000000,5323.50,'material_master',6,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(238,'2026-09-27 00:00:00','OPENING','MAT-00005',8,5,NULL,25.500,0.000,0.00,4360.50,0.000,0.00,25.500,171.000000,4360.50,'material_master',5,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(239,'2026-09-27 00:00:00','OPENING','MAT-00004',8,4,NULL,11.300,0.000,0.00,904.00,0.000,0.00,11.300,80.000000,904.00,'material_master',4,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(240,'2026-09-27 00:00:00','OPENING','MAT-00003',8,3,NULL,27.500,0.000,0.00,3437.50,0.000,0.00,27.500,125.000000,3437.50,'material_master',3,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(241,'2026-09-27 00:00:00','OPENING','MAT-00002',8,2,NULL,14.000,0.000,0.00,4508.00,0.000,0.00,14.000,322.000000,4508.00,'material_master',2,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(242,'2026-09-27 00:00:00','OPENING','MAT-00001',8,1,NULL,14.700,0.000,0.00,5733.00,0.000,0.00,14.700,390.000000,5733.00,'material_master',1,'2026-09-27 16:05:59','2026-09-27 16:05:59'),(295,'2026-09-28 00:00:00','Receipt','GRN-2026-00001',7,211,NULL,607.000,0.000,0.00,141218.55,0.000,0.00,607.000,232.650000,141218.55,'material_receipt',12,'2026-09-28 08:39:44','2026-09-28 08:39:44'),(298,'2026-09-28 00:00:00','Issue','ISS-2026-00003',8,123,NULL,0.000,80.000,14160.00,0.00,0.800,141.60,79.200,177.000000,14018.40,'material_issue',20,'2026-09-28 09:49:38','2026-09-28 09:49:38'),(299,'2026-09-28 00:00:00','Issue','ISS-2026-00003',8,118,NULL,0.000,120.000,18000.00,0.00,15.000,2250.00,105.000,150.000000,15750.00,'material_issue',20,'2026-09-28 09:49:38','2026-09-28 09:49:38'),(300,'2026-09-28 00:00:00','Issue','ISS-2026-00003',8,123,NULL,0.000,79.200,14018.40,0.00,10.000,1770.00,69.200,177.000000,12248.40,'material_issue',20,'2026-09-28 09:49:38','2026-09-28 09:49:38'),(301,'2026-09-28 00:00:00','Issue','ISS-2026-00003',8,121,NULL,0.000,50.000,7500.00,0.00,5.000,750.00,45.000,150.000000,6750.00,'material_issue',20,'2026-09-28 09:49:38','2026-09-28 09:49:38'),(302,'2026-09-28 00:00:00','Issue','ISS-2026-00003',8,170,NULL,0.000,21.000,5124.00,0.00,5.000,1220.00,16.000,244.000000,3904.00,'material_issue',20,'2026-09-28 09:49:38','2026-09-28 09:49:38'),(303,'2026-09-28 00:00:00','Issue','ISS-2026-00003',8,120,NULL,0.000,49.000,32683.00,0.00,5.000,3335.00,44.000,667.000000,29348.00,'material_issue',20,'2026-09-28 09:49:38','2026-09-28 09:49:38'),(304,'2026-09-28 00:00:00','Issue','ISS-2026-00003',8,125,NULL,0.000,15.000,13935.00,0.00,2.000,1858.00,13.000,929.000000,12077.00,'material_issue',20,'2026-09-28 09:49:38','2026-09-28 09:49:38'),(305,'2026-09-28 00:00:00','Issue','ISS-2026-00003',8,182,NULL,0.000,50.000,35550.00,0.00,16.000,11376.00,34.000,711.000000,24174.00,'material_issue',20,'2026-09-28 09:49:38','2026-09-28 09:49:38'),(306,'2026-09-28 00:00:00','Issue','ISS-2026-00003',8,158,NULL,0.000,0.570,2966.28,0.00,0.120,624.48,0.450,5204.000000,2341.80,'material_issue',20,'2026-09-28 09:49:38','2026-09-28 09:49:38'),(307,'2026-09-28 00:00:00','Issue','ISS-2026-00003',8,173,NULL,0.000,8.000,6488.00,0.00,1.875,1520.63,6.125,811.000000,4967.38,'material_issue',20,'2026-09-28 09:49:38','2026-09-28 09:49:38'),(308,'2026-09-28 00:00:00','Issue','ISS-2026-00003',8,120,NULL,0.000,44.000,29348.00,0.00,1.875,1250.63,42.125,667.000000,28097.38,'material_issue',20,'2026-09-28 09:49:38','2026-09-28 09:49:38'),(309,'2026-09-28 00:00:00','Issue','ISS-2026-00003',8,172,NULL,0.000,17.000,6477.00,0.00,2.250,857.25,14.750,381.000000,5619.75,'material_issue',20,'2026-09-28 09:49:38','2026-09-28 09:49:38'),(310,'2026-09-28 00:00:00','Issue','ISS-2026-00003',8,167,NULL,0.000,5.500,3712.50,0.00,1.050,708.75,4.450,675.000000,3003.75,'material_issue',20,'2026-09-28 09:49:38','2026-09-28 09:49:38'),(311,'2026-09-28 00:00:00','Issue','ISS-2026-00003',8,125,NULL,0.000,13.000,12077.00,0.00,0.750,696.75,12.250,929.000000,11380.25,'material_issue',20,'2026-09-28 09:49:38','2026-09-28 09:49:38'),(312,'2026-09-28 00:00:00','Issue','ISS-2026-00003',8,126,NULL,0.000,0.850,1329.40,0.00,0.300,469.20,0.550,1564.000000,860.20,'material_issue',20,'2026-09-28 09:49:38','2026-09-28 09:49:38'),(313,'2026-09-28 00:00:00','Issue','ISS-2026-00002',8,9,NULL,0.000,139.800,38025.60,0.00,1.750,476.00,138.050,272.000000,37549.60,'material_issue',19,'2026-09-28 10:51:15','2026-09-28 10:51:15'),(314,'2026-09-28 00:00:00','Issue','ISS-2026-00002',8,10,NULL,0.000,145.000,20300.00,0.00,1.750,245.00,143.250,140.000000,20055.00,'material_issue',19,'2026-09-28 10:51:15','2026-09-28 10:51:15'),(315,'2026-09-28 00:00:00','Issue','ISS-2026-00002',8,52,NULL,0.000,119.000,13328.00,0.00,5.500,616.00,113.500,112.000000,12712.00,'material_issue',19,'2026-09-28 10:51:15','2026-09-28 10:51:15'),(316,'2026-09-28 00:00:00','Issue','ISS-2026-00002',8,51,NULL,0.000,63.700,7452.90,0.00,7.500,877.50,56.200,117.000000,6575.40,'material_issue',19,'2026-09-28 10:51:15','2026-09-28 10:51:15'),(317,'2026-09-28 00:00:00','Issue','ISS-2026-00002',8,44,NULL,0.000,50.000,15350.00,0.00,8.500,2609.50,41.500,307.000000,12740.50,'material_issue',19,'2026-09-28 10:51:15','2026-09-28 10:51:15'),(318,'2026-09-28 00:00:00','Issue','ISS-2026-00002',8,33,NULL,0.000,130.000,33280.00,0.00,3.000,768.00,127.000,256.000000,32512.00,'material_issue',19,'2026-09-28 10:51:15','2026-09-28 10:51:15'),(319,'2026-09-28 00:00:00','Issue','ISS-2026-00002',8,47,NULL,0.000,105.800,5819.00,0.00,4.000,220.00,101.800,55.000000,5599.00,'material_issue',19,'2026-09-28 10:51:15','2026-09-28 10:51:15'),(320,'2026-09-28 00:00:00','Issue','ISS-2026-00002',8,49,NULL,0.000,129.300,6465.00,0.00,1.700,85.00,127.600,50.000000,6380.00,'material_issue',19,'2026-09-28 10:51:15','2026-09-28 10:51:15'),(321,'2026-09-28 00:00:00','Issue','ISS-2026-00002',8,29,NULL,0.000,96.000,17952.00,0.00,7.500,1402.50,88.500,187.000000,16549.50,'material_issue',19,'2026-09-28 10:51:15','2026-09-28 10:51:15'),(322,'2026-09-28 00:00:00','Issue','ISS-2026-00002',8,50,NULL,0.000,45.500,5505.50,0.00,4.000,484.00,41.500,121.000000,5021.50,'material_issue',19,'2026-09-28 10:51:15','2026-09-28 10:51:15'),(323,'2026-09-28 00:00:00','Issue','ISS-2026-00002',8,49,NULL,0.000,127.600,6380.00,0.00,1.000,50.00,126.600,50.000000,6330.00,'material_issue',19,'2026-09-28 10:51:15','2026-09-28 10:51:15'),(324,'2026-09-28 00:00:00','Issue','ISS-2026-00002',8,30,NULL,0.000,70.000,11900.00,0.00,10.500,1785.00,59.500,170.000000,10115.00,'material_issue',19,'2026-09-28 10:51:15','2026-09-28 10:51:15'),(325,'2026-09-28 00:00:00','Issue','ISS-2026-00002',8,31,NULL,0.000,30.000,4170.00,0.00,7.500,1042.50,22.500,139.000000,3127.50,'material_issue',19,'2026-09-28 10:51:15','2026-09-28 10:51:15'),(326,'2026-09-28 00:00:00','Issue','ISS-2026-00002',8,43,NULL,0.000,159.500,36685.00,0.00,12.500,2875.00,147.000,230.000000,33810.00,'material_issue',19,'2026-09-28 10:51:15','2026-09-28 10:51:15'),(327,'2026-09-28 00:00:00','Issue','ISS-2026-00002',8,56,NULL,0.000,63.000,10080.00,0.00,7.500,1200.00,55.500,160.000000,8880.00,'material_issue',19,'2026-09-28 10:51:15','2026-09-28 10:51:15'),(328,'2026-09-28 00:00:00','Issue','ISS-2026-00002',8,61,NULL,0.000,11.950,2210.75,0.00,6.500,1202.50,5.450,185.000000,1008.25,'material_issue',19,'2026-09-28 10:51:15','2026-09-28 10:51:15'),(329,'2026-09-28 00:00:00','Issue','ISS-2026-00002',8,45,NULL,0.000,74.300,12556.70,0.00,12.500,2112.50,61.800,169.000000,10444.20,'material_issue',19,'2026-09-28 10:51:15','2026-09-28 10:51:15'),(330,'2026-09-28 00:00:00','Issue','ISS-2026-00002',8,40,NULL,0.000,8.700,1539.90,0.00,3.500,619.50,5.200,177.000000,920.40,'material_issue',19,'2026-09-28 10:51:15','2026-09-28 10:51:15'),(331,'2026-09-28 00:00:00','Issue','ISS-2026-00002',8,42,NULL,0.000,42.300,6133.50,0.00,9.500,1377.50,32.800,145.000000,4756.00,'material_issue',19,'2026-09-28 10:51:15','2026-09-28 10:51:15'),(332,'2026-09-28 00:00:00','Issue','ISS-2026-00002',8,69,NULL,0.000,14.500,4785.00,0.00,5.500,1815.00,9.000,330.000000,2970.00,'material_issue',19,'2026-09-28 10:51:15','2026-09-28 10:51:15'),(333,'2026-09-28 00:00:00','Issue','ISS-2026-00002',8,182,NULL,0.000,34.000,24174.00,0.00,2.600,1848.60,31.400,711.000000,22325.40,'material_issue',19,'2026-09-28 10:51:15','2026-09-28 10:51:15'),(334,'2026-09-28 00:00:00','Issue','ISS-2026-00002',8,35,NULL,0.000,30.000,10380.00,0.00,7.500,2595.00,22.500,346.000000,7785.00,'material_issue',19,'2026-09-28 10:51:15','2026-09-28 10:51:15'),(335,'2026-09-28 00:00:00','Issue','ISS-2026-00002',8,116,NULL,0.000,72.500,25012.50,0.00,7.500,2587.50,65.000,345.000000,22425.00,'material_issue',19,'2026-09-28 10:51:15','2026-09-28 10:51:15'),(336,'2026-09-28 00:00:00','Issue','ISS-2026-00002',8,32,NULL,0.000,70.000,20160.00,0.00,4.000,1152.00,66.000,288.000000,19008.00,'material_issue',19,'2026-09-28 10:51:15','2026-09-28 10:51:15'),(337,'2026-09-28 00:00:00','Issue','ISS-2026-00002',8,115,NULL,0.000,93.500,14305.50,0.00,4.000,612.00,89.500,153.000000,13693.50,'material_issue',19,'2026-09-28 10:51:15','2026-09-28 10:51:15'),(338,'2026-09-28 00:00:00','Issue','ISS-2026-00002',8,114,NULL,0.000,10.000,2730.00,0.00,3.500,955.50,6.500,273.000000,1774.50,'material_issue',19,'2026-09-28 10:51:15','2026-09-28 10:51:15'),(339,'2026-09-28 00:00:00','Issue','ISS-2026-00002',8,10,NULL,0.000,143.250,20055.00,0.00,0.750,105.00,142.500,140.000000,19950.00,'material_issue',19,'2026-09-28 10:51:15','2026-09-28 10:51:15'),(340,'2026-09-28 00:00:00','Issue','ISS-2026-00002',8,29,NULL,0.000,88.500,16549.50,0.00,7.500,1402.50,81.000,187.000000,15147.00,'material_issue',19,'2026-09-28 10:51:15','2026-09-28 10:51:15'),(341,'2026-09-28 00:00:00','Issue','ISS-2026-00002',8,69,NULL,0.000,9.000,2970.00,0.00,1.000,330.00,8.000,330.000000,2640.00,'material_issue',19,'2026-09-28 10:51:15','2026-09-28 10:51:15'),(342,'2026-09-28 00:00:00','Issue','ISS-2026-00002',8,66,NULL,0.000,61.000,7625.00,0.00,3.250,406.25,57.750,125.000000,7218.75,'material_issue',19,'2026-09-28 10:51:15','2026-09-28 10:51:15'),(343,'2026-09-28 00:00:00','Issue','ISS-2026-00002',8,114,NULL,0.000,6.500,1774.50,0.00,2.500,682.50,4.000,273.000000,1092.00,'material_issue',19,'2026-09-28 10:51:15','2026-09-28 10:51:15'),(344,'2026-09-28 00:00:00','Issue','ISS-2026-00002',8,10,NULL,0.000,142.500,19950.00,0.00,1.000,140.00,141.500,140.000000,19810.00,'material_issue',19,'2026-09-28 10:51:15','2026-09-28 10:51:15'),(345,'2026-09-28 00:00:00','Issue','ISS-2026-00002',8,15,NULL,0.000,9.400,2697.80,0.00,3.000,861.00,6.400,287.000000,1836.80,'material_issue',19,'2026-09-28 10:51:15','2026-09-28 10:51:15');
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
) ENGINE=InnoDB AUTO_INCREMENT=220 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `materials`
--

LOCK TABLES `materials` WRITE;
/*!40000 ALTER TABLE `materials` DISABLE KEYS */;
INSERT INTO `materials` VALUES (1,'MAT-00001','Felidurm MS','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',14.70,5733.00,NULL,14.70,0.00,0.00,390.00,390.00,390.000000,6,NULL,NULL,NULL,NULL,NULL),(2,'MAT-00002','Zymo Viesol GMR 2','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'35079099',NULL,NULL,NULL,0,'AKM Chemicals',14.00,4508.00,NULL,14.00,0.00,0.00,322.00,322.00,322.000000,2,NULL,NULL,NULL,NULL,NULL),(3,'MAT-00003','Oxalic Acid','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'29171100',NULL,NULL,NULL,0,'AKM Chemicals',27.50,3437.50,NULL,27.50,0.00,0.00,125.00,125.00,125.000000,3,NULL,NULL,NULL,NULL,NULL),(4,'MAT-00004','Sodium Metabisulphite','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'28321090',NULL,NULL,NULL,0,'AKM Chemicals',11.30,904.00,NULL,11.30,0.00,0.00,80.00,80.00,80.000000,3,NULL,NULL,NULL,NULL,NULL),(5,'MAT-00005','Buzyme 7702','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'35079099',NULL,NULL,NULL,0,'AKM Chemicals',25.50,4360.50,NULL,25.50,0.00,0.00,171.00,171.00,171.000000,2,NULL,NULL,NULL,NULL,NULL),(6,'MAT-00006','UNIA R528','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',16.90,5323.50,NULL,16.90,0.00,0.00,315.00,315.00,315.000000,4,NULL,NULL,NULL,NULL,NULL),(7,'MAT-00007','Fospol LC80','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',13.70,5891.00,NULL,13.70,0.00,0.00,430.00,430.00,430.000000,4,NULL,NULL,NULL,NULL,NULL),(8,'MAT-00008','Coripol SFC','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',50.00,10200.00,NULL,50.00,0.00,0.00,204.00,204.00,204.000000,16,NULL,NULL,NULL,NULL,NULL),(9,'MAT-00009','Busperse 7794','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34029090',NULL,NULL,NULL,0,'AKM Chemicals',139.80,38025.60,NULL,139.80,0.00,0.00,272.00,272.00,272.000000,4,NULL,NULL,NULL,NULL,NULL),(10,'MAT-00010','Lipidol UW 113','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',145.00,20300.00,NULL,145.00,0.00,0.00,140.00,140.00,140.000000,15,NULL,NULL,NULL,NULL,NULL),(11,'MAT-00011','Sasyol SJB','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34029090',NULL,NULL,NULL,0,'AKM Chemicals',148.00,27676.00,NULL,148.00,0.00,0.00,187.00,187.00,187.000000,10,NULL,NULL,NULL,NULL,NULL),(12,'MAT-00012','Tanicor FTG','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',30.00,3720.00,NULL,30.00,0.00,0.00,124.00,124.00,124.000000,6,NULL,NULL,NULL,NULL,NULL),(13,'MAT-00013','Kurtalix PALIQ','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34029090',NULL,NULL,NULL,0,'AKM Chemicals',33.00,19866.00,NULL,33.00,0.00,0.00,602.00,602.00,602.000000,11,NULL,NULL,NULL,NULL,NULL),(14,'MAT-00014','Vernaminol Liquor ASN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',150.00,33300.00,NULL,150.00,0.00,0.00,222.00,222.00,222.000000,6,NULL,NULL,NULL,NULL,NULL),(15,'MAT-00015','Magnopal RHN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',9.40,2697.80,NULL,9.40,0.00,0.00,287.00,287.00,287.000000,16,NULL,NULL,NULL,NULL,NULL),(16,'MAT-00016','Vernol Liquor PN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',4.60,1205.20,NULL,4.60,0.00,0.00,262.00,262.00,262.000000,6,NULL,NULL,NULL,NULL,NULL),(17,'MAT-00017','Polyol AK','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',5.00,2875.00,NULL,5.00,0.00,0.00,575.00,575.00,575.000000,15,NULL,NULL,NULL,NULL,NULL),(18,'MAT-00018','Synthol GS 606','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',3.00,1395.00,NULL,3.00,0.00,0.00,465.00,465.00,465.000000,15,NULL,NULL,NULL,NULL,NULL),(19,'MAT-00019','Ledosol OX LIQ','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',5.50,2453.00,NULL,5.50,0.00,0.00,446.00,446.00,446.000000,11,NULL,NULL,NULL,NULL,NULL),(20,'MAT-00020','Relugan GT 50','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',85.00,32215.00,NULL,85.00,0.00,0.00,379.00,379.00,379.000000,6,NULL,NULL,NULL,NULL,NULL),(21,'MAT-00021','Veprovod VA','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',1.80,417.60,NULL,1.80,0.00,0.00,232.00,232.00,232.000000,6,NULL,NULL,NULL,NULL,NULL),(22,'MAT-00022','Tanicor MLB','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',21.30,5026.80,NULL,21.30,0.00,0.00,236.00,236.00,236.000000,6,NULL,NULL,NULL,NULL,NULL),(23,'MAT-00023','Tergotan ER','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',10.90,1885.70,NULL,10.90,0.00,0.00,173.00,173.00,173.000000,6,NULL,NULL,NULL,NULL,NULL),(24,'MAT-00024','Fospol M3 Imp','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',0.50,103.00,NULL,0.50,0.00,0.00,206.00,206.00,206.000000,4,NULL,NULL,NULL,NULL,NULL),(25,'MAT-00025','Levotan CO2','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',6.00,1926.00,NULL,6.00,0.00,0.00,321.00,321.00,321.000000,16,NULL,NULL,NULL,NULL,NULL),(26,'MAT-00026','Atlas 30 CT','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',3.00,1680.00,NULL,3.00,0.00,0.00,560.00,560.00,560.000000,18,NULL,NULL,NULL,NULL,NULL),(27,'MAT-00027','Sasyol CSK','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',2.50,590.00,NULL,2.50,0.00,0.00,236.00,236.00,236.000000,10,NULL,NULL,NULL,NULL,NULL),(28,'MAT-00028','Tergotan ESN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',2.40,542.40,NULL,2.40,0.00,0.00,226.00,226.00,226.000000,6,NULL,NULL,NULL,NULL,NULL),(29,'MAT-00029','Butan 7822','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',96.00,17952.00,NULL,96.00,0.00,0.00,187.00,187.00,187.000000,4,NULL,NULL,NULL,NULL,NULL),(30,'MAT-00030','Retanal RCN40','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',70.00,11900.00,NULL,70.00,0.00,0.00,170.00,170.00,170.000000,4,NULL,NULL,NULL,NULL,NULL),(31,'MAT-00031','Dutan MR LIQ','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',30.00,4170.00,NULL,30.00,0.00,0.00,139.00,139.00,139.000000,2,NULL,NULL,NULL,NULL,NULL),(32,'MAT-00032','Butan Oil 1919','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',70.00,20160.00,NULL,70.00,0.00,0.00,288.00,288.00,288.000000,4,NULL,NULL,NULL,NULL,NULL),(33,'MAT-00033','Fos Fol M3','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34029090',NULL,NULL,NULL,0,'AKM Chemicals',130.00,33280.00,NULL,130.00,0.00,0.00,256.00,256.00,256.000000,4,NULL,NULL,NULL,NULL,NULL),(34,'MAT-00034','Lawgerat 94L','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',80.00,16800.00,NULL,80.00,0.00,0.00,210.00,210.00,210.000000,8,NULL,NULL,NULL,NULL,NULL),(35,'MAT-00035','Coripol UFB/W','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38089990',NULL,NULL,NULL,0,'AKM Chemicals',30.00,10380.00,NULL,30.00,0.00,0.00,346.00,346.00,346.000000,16,NULL,NULL,NULL,NULL,NULL),(36,'MAT-00036','Preventol ICI','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',20.00,26060.00,NULL,20.00,0.00,0.00,1303.00,1303.00,1303.000000,17,NULL,NULL,NULL,NULL,NULL),(37,'MAT-00037','Synthol BS150','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',25.00,5250.00,NULL,25.00,0.00,0.00,210.00,210.00,210.000000,15,NULL,NULL,NULL,NULL,NULL),(38,'MAT-00038','Coripol ESS','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',35.00,7175.00,NULL,35.00,0.00,0.00,205.00,205.00,205.000000,18,NULL,NULL,NULL,NULL,NULL),(39,'MAT-00039','Fos Fol CL','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',10.00,2300.00,NULL,10.00,0.00,0.00,230.00,230.00,230.000000,4,NULL,NULL,NULL,NULL,NULL),(40,'MAT-00040','Coritan VTP','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32029020',NULL,NULL,NULL,0,'AKM Chemicals',8.70,1539.90,NULL,8.70,0.00,0.00,177.00,177.00,177.000000,10,NULL,NULL,NULL,NULL,NULL),(41,'MAT-00041','GS Powder (ele)','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',32.50,7020.00,NULL,32.50,0.00,0.00,216.00,216.00,216.000000,9,NULL,NULL,NULL,NULL,NULL),(42,'MAT-00042','Butan 7864','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',42.30,6133.50,NULL,42.30,0.00,0.00,145.00,145.00,145.000000,4,NULL,NULL,NULL,NULL,NULL),(43,'MAT-00043','Vernatan OS','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',159.50,36685.00,NULL,159.50,0.00,0.00,230.00,230.00,230.000000,6,NULL,NULL,NULL,NULL,NULL),(44,'MAT-00044','Tanicor KW','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32029020',NULL,NULL,NULL,0,'AKM Chemicals',50.00,15350.00,NULL,50.00,0.00,0.00,307.00,307.00,307.000000,6,NULL,NULL,NULL,NULL,NULL),(45,'MAT-00045','Sasyntan CAN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32029020',NULL,NULL,NULL,0,'AKM Chemicals',74.30,12556.70,NULL,74.30,0.00,0.00,169.00,169.00,169.000000,10,NULL,NULL,NULL,NULL,NULL),(46,'MAT-00046','Tanigan OSO','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',42.00,7770.00,NULL,42.00,0.00,0.00,185.00,185.00,185.000000,16,NULL,NULL,NULL,NULL,NULL),(47,'MAT-00047','Acetate','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'29152990',NULL,NULL,NULL,0,'AKM Chemicals',105.80,5819.00,NULL,105.80,0.00,0.00,55.00,55.00,55.000000,3,NULL,NULL,NULL,NULL,NULL),(48,'MAT-00048','Coralon OT','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',59.00,10384.00,NULL,59.00,0.00,0.00,176.00,176.00,176.000000,6,NULL,NULL,NULL,NULL,NULL),(49,'MAT-00049','Soda','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'28362000',NULL,NULL,NULL,0,'AKM Chemicals',129.30,6465.00,NULL,129.30,0.00,0.00,50.00,50.00,50.000000,3,NULL,NULL,NULL,NULL,NULL),(50,'MAT-00050','Neutralan BA','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32029020',NULL,NULL,NULL,0,'AKM Chemicals',45.50,5505.50,NULL,45.50,0.00,0.00,121.00,121.00,121.000000,6,NULL,NULL,NULL,NULL,NULL),(51,'MAT-00051','Retanal CRO','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32029020',NULL,NULL,NULL,0,'AKM Chemicals',63.70,7452.90,NULL,63.70,0.00,0.00,117.00,117.00,117.000000,4,NULL,NULL,NULL,NULL,NULL),(52,'MAT-00052','Chrom','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'28332990',NULL,NULL,NULL,0,'AKM Chemicals',119.00,13328.00,NULL,119.00,0.00,0.00,112.00,112.00,112.000000,25,NULL,NULL,NULL,NULL,NULL),(53,'MAT-00053','Synektan DDS','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',21.50,5848.00,NULL,21.50,0.00,0.00,272.00,272.00,272.000000,6,NULL,NULL,NULL,NULL,NULL),(54,'MAT-00054','Didisyn NM','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',46.50,5533.50,NULL,46.50,0.00,0.00,119.00,119.00,119.000000,5,NULL,NULL,NULL,NULL,NULL),(55,'MAT-00055','D7','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',5.00,625.00,NULL,5.00,0.00,0.00,125.00,125.00,125.000000,6,NULL,NULL,NULL,NULL,NULL),(56,'MAT-00056','Pidisyntan TR','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',63.00,10080.00,NULL,63.00,0.00,0.00,160.00,160.00,160.000000,5,NULL,NULL,NULL,NULL,NULL),(57,'MAT-00057','Bot Veg GS','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32019000',NULL,NULL,NULL,0,'AKM Chemicals',20.00,3600.00,NULL,20.00,0.00,0.00,180.00,180.00,180.000000,7,NULL,NULL,NULL,NULL,NULL),(58,'MAT-00058','Bot Veg QB','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32019000',NULL,NULL,NULL,0,'AKM Chemicals',38.90,8013.40,NULL,38.90,0.00,0.00,206.00,206.00,206.000000,7,NULL,NULL,NULL,NULL,NULL),(59,'MAT-00059','Ledoresin MD','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32029090',NULL,NULL,NULL,0,'AKM Chemicals',11.50,3197.00,NULL,11.50,0.00,0.00,278.00,278.00,278.000000,11,NULL,NULL,NULL,NULL,NULL),(60,'MAT-00060','Ledosol PWN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',11.30,2994.50,NULL,11.30,0.00,0.00,265.00,265.00,265.000000,11,NULL,NULL,NULL,NULL,NULL),(61,'MAT-00061','Synektan VW','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',11.95,2210.75,NULL,11.95,0.00,0.00,185.00,185.00,185.000000,6,NULL,NULL,NULL,NULL,NULL),(62,'MAT-00062','Lawgetan MN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',19.50,2827.50,NULL,19.50,0.00,0.00,145.00,145.00,145.000000,8,NULL,NULL,NULL,NULL,NULL),(63,'MAT-00063','Lawgetan TR','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',11.40,1687.20,NULL,11.40,0.00,0.00,148.00,148.00,148.000000,8,NULL,NULL,NULL,NULL,NULL),(64,'MAT-00064','Lawgetan','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',17.00,3315.00,NULL,17.00,0.00,0.00,195.00,195.00,195.000000,8,NULL,NULL,NULL,NULL,NULL),(65,'MAT-00065','Vernatan BL','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',15.90,1987.50,NULL,15.90,0.00,0.00,125.00,125.00,125.000000,6,NULL,NULL,NULL,NULL,NULL),(66,'MAT-00066','Tanicor DLE','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',61.00,7625.00,NULL,61.00,0.00,0.00,125.00,125.00,125.000000,6,NULL,NULL,NULL,NULL,NULL),(67,'MAT-00067','Gambini ST Powder','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32029020',NULL,NULL,NULL,0,'AKM Chemicals',14.40,3801.60,NULL,14.40,0.00,0.00,264.00,264.00,264.000000,11,NULL,NULL,NULL,NULL,NULL),(68,'MAT-00068','Blancotan 2X Powder','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32029090',NULL,NULL,NULL,0,'AKM Chemicals',20.30,6171.20,NULL,20.30,0.00,0.00,304.00,304.00,304.000000,11,NULL,NULL,NULL,NULL,NULL),(69,'MAT-00069','Titanium Dioxide','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'28230010',NULL,NULL,NULL,0,'AKM Chemicals',14.50,4785.00,NULL,14.50,0.00,0.00,330.00,330.00,330.000000,13,NULL,NULL,NULL,NULL,NULL),(70,'MAT-00070','Chikatan CFT','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',11.00,0.00,NULL,11.00,0.00,0.00,0.00,0.00,0.000000,12,NULL,NULL,NULL,NULL,NULL),(71,'MAT-00071','Quebracho','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32011000',NULL,NULL,NULL,0,'AKM Chemicals',43.50,13398.00,NULL,43.50,0.00,0.00,308.00,308.00,308.000000,9,NULL,NULL,NULL,NULL,NULL),(72,'MAT-00072','Dermafix S','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',0.75,185.25,NULL,0.75,0.00,0.00,247.00,247.00,247.000000,6,NULL,NULL,NULL,NULL,NULL),(73,'MAT-00073','Green BG','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.60,494.43,NULL,0.60,0.00,0.00,824.05,824.05,824.050000,19,NULL,NULL,NULL,NULL,NULL),(74,'MAT-00074','Brill Blue FRL','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.50,261.74,NULL,0.50,0.00,0.00,523.48,523.48,523.480000,19,NULL,NULL,NULL,NULL,NULL),(75,'MAT-00075','Black EBR','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.35,361.00,NULL,0.35,0.00,0.00,1031.44,1031.44,1031.440000,19,NULL,NULL,NULL,NULL,NULL),(76,'MAT-00076','Blue NR','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',3.30,2795.40,NULL,3.30,0.00,0.00,847.09,847.09,847.090000,19,NULL,NULL,NULL,NULL,NULL),(77,'MAT-00077','Coripacide Blue RG','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.60,269.55,NULL,0.60,0.00,0.00,449.25,449.25,449.250000,19,NULL,NULL,NULL,NULL,NULL),(78,'MAT-00078','Y Brown RL','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',5.25,6084.75,NULL,5.25,0.00,0.00,1159.00,1159.00,1159.000000,19,NULL,NULL,NULL,NULL,NULL),(79,'MAT-00079','Brown R','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.25,164.35,NULL,0.25,0.00,0.00,657.40,657.40,657.400000,19,NULL,NULL,NULL,NULL,NULL),(80,'MAT-00080','Brown NG12','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041900',NULL,NULL,NULL,0,'AKM Chemicals',0.60,296.66,NULL,0.60,0.00,0.00,494.43,494.43,494.430000,19,NULL,NULL,NULL,NULL,NULL),(81,'MAT-00081','Brn MLRL','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',2.60,2134.70,NULL,2.60,0.00,0.00,821.04,821.04,821.040000,19,NULL,NULL,NULL,NULL,NULL),(82,'MAT-00082','Brn FBR','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',3.70,3319.57,NULL,3.70,0.00,0.00,897.18,897.18,897.180000,19,NULL,NULL,NULL,NULL,NULL),(83,'MAT-00083','Olive Brn G','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',1.50,1160.94,NULL,1.50,0.00,0.00,773.96,773.96,773.960000,19,NULL,NULL,NULL,NULL,NULL),(84,'MAT-00084','HR Brn NGB','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',2.95,2840.85,NULL,2.95,0.00,0.00,963.00,963.00,963.000000,6,NULL,NULL,NULL,NULL,NULL),(85,'MAT-00085','Brown BLB','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.10,81.90,NULL,0.10,0.00,0.00,819.00,819.00,819.000000,19,NULL,NULL,NULL,NULL,NULL),(86,'MAT-00086','Brn B','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.40,344.00,NULL,0.40,0.00,0.00,860.00,860.00,860.000000,19,NULL,NULL,NULL,NULL,NULL),(87,'MAT-00087','Dk Brn R','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.45,548.10,NULL,0.45,0.00,0.00,1218.00,1218.00,1218.000000,6,NULL,NULL,NULL,NULL,NULL),(88,'MAT-00088','Brn CFW','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',2.00,1040.96,NULL,2.00,0.00,0.00,520.48,520.48,520.480000,19,NULL,NULL,NULL,NULL,NULL),(89,'MAT-00089','Brown HGN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',4.95,6499.35,NULL,4.95,0.00,0.00,1313.00,1313.00,1313.000000,6,NULL,NULL,NULL,NULL,NULL),(90,'MAT-00090','103 Polynesian Beige','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.85,510.00,NULL,0.85,0.00,0.00,600.00,600.00,600.000000,20,NULL,NULL,NULL,NULL,NULL),(91,'MAT-00091','104 Sabia','Kilogram',3,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-28 16:19:35',NULL,'Active',NULL,7,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.85,532.10,NULL,0.85,0.00,0.00,626.00,626.00,626.000000,20,NULL,NULL,NULL,NULL,NULL),(92,'MAT-00092','Blue RF','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.22,907.06,NULL,0.22,0.00,0.00,4123.00,4123.00,4123.000000,6,NULL,NULL,NULL,NULL,NULL),(93,'MAT-00093','Grey MCWS','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.20,74.44,NULL,0.20,0.00,0.00,372.20,372.20,372.200000,19,NULL,NULL,NULL,NULL,NULL),(94,'MAT-00094','Brn FB3GN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.09,65.61,NULL,0.09,0.00,0.00,729.00,729.00,729.000000,6,NULL,NULL,NULL,NULL,NULL),(95,'MAT-00095','Brown NGB','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.30,151.33,NULL,0.30,0.00,0.00,504.43,504.43,504.430000,19,NULL,NULL,NULL,NULL,NULL),(96,'MAT-00096','Brown CBT','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.65,284.45,NULL,0.65,0.00,0.00,437.62,437.62,437.620000,19,NULL,NULL,NULL,NULL,NULL),(97,'MAT-00097','Beige UR','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',1.70,815.35,NULL,1.70,0.00,0.00,479.62,479.62,479.620000,19,NULL,NULL,NULL,NULL,NULL),(98,'MAT-00098','Red SG','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.10,64.77,NULL,0.10,0.00,0.00,647.70,647.70,647.700000,19,NULL,NULL,NULL,NULL,NULL),(99,'MAT-00099','Brown RN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.40,264.29,NULL,0.40,0.00,0.00,660.72,660.72,660.720000,19,NULL,NULL,NULL,NULL,NULL),(100,'MAT-00100','Bordeaux UCN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',1.80,1046.83,NULL,1.80,0.00,0.00,581.57,581.57,581.570000,19,NULL,NULL,NULL,NULL,NULL),(101,'MAT-00101','Red 2BN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',1.10,1408.64,NULL,1.10,0.00,0.00,1280.58,1280.58,1280.580000,19,NULL,NULL,NULL,NULL,NULL),(102,'MAT-00102','Inoderm Brn NT','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.55,0.00,NULL,0.55,0.00,0.00,0.00,0.00,0.000000,6,NULL,NULL,NULL,NULL,NULL),(103,'MAT-00103','Dk Green N','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.40,0.00,NULL,0.40,0.00,0.00,0.00,0.00,0.000000,6,NULL,NULL,NULL,NULL,NULL),(104,'MAT-00104','Violet BR','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.85,383.63,NULL,0.85,0.00,0.00,451.33,451.33,451.330000,19,NULL,NULL,NULL,NULL,NULL),(105,'MAT-00105','Coffee Brown CRB','Kilogram',3,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:30:28',NULL,'Active',NULL,7,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.70,641.34,NULL,0.70,0.00,0.00,916.20,916.20,916.200000,19,NULL,NULL,NULL,NULL,NULL),(106,'MAT-00106','Jet Black','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',17.50,16857.93,NULL,17.50,0.00,0.00,963.31,963.31,963.310000,19,NULL,NULL,NULL,NULL,NULL),(107,'MAT-00107','Powder Black PPS','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',60.90,32886.00,NULL,60.90,0.00,0.00,540.00,540.00,540.000000,13,NULL,NULL,NULL,NULL,NULL),(108,'MAT-00108','Powder Black PPR','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',60.00,27000.00,NULL,60.00,0.00,0.00,450.00,450.00,450.000000,13,NULL,NULL,NULL,NULL,NULL),(109,'MAT-00109','Beige U-NS','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',3.65,1987.46,NULL,3.65,0.00,0.00,544.51,544.51,544.510000,19,NULL,NULL,NULL,NULL,NULL),(110,'MAT-00110','Red Brown CRN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',3.25,1873.85,NULL,3.25,0.00,0.00,576.57,576.57,576.570000,19,NULL,NULL,NULL,NULL,NULL),(111,'MAT-00111','Navy Blue SRL','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',3.50,2610.58,NULL,3.50,0.00,0.00,745.88,745.88,745.880000,19,NULL,NULL,NULL,NULL,NULL),(112,'MAT-00112','Navy Blue RL','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',8.80,5161.90,NULL,8.80,0.00,0.00,586.58,586.58,586.580000,19,NULL,NULL,NULL,NULL,NULL),(113,'MAT-00113','Yellow 2RLN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',5.30,3730.14,NULL,5.30,0.00,0.00,703.80,703.80,703.800000,19,NULL,NULL,NULL,NULL,NULL),(114,'MAT-00114','Dermalix WWL','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34029090',NULL,NULL,NULL,0,'AKM Chemicals',10.00,2730.00,NULL,10.00,0.00,0.00,273.00,273.00,273.000000,6,NULL,NULL,NULL,NULL,NULL),(115,'MAT-00115','Repelan MA/B','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',93.50,14305.50,NULL,93.50,0.00,0.00,153.00,153.00,153.000000,4,NULL,NULL,NULL,NULL,NULL),(116,'MAT-00116','Sasyol ECW','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',72.50,25012.50,NULL,72.50,0.00,0.00,345.00,345.00,345.000000,10,NULL,NULL,NULL,NULL,NULL),(117,'MAT-00117','Sintoil GH','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',7.00,3759.00,NULL,7.00,0.00,0.00,537.00,537.00,537.000000,11,NULL,NULL,NULL,NULL,NULL),(118,'MAT-00118','RC-27165','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',120.00,18000.00,NULL,120.00,0.00,0.00,150.00,150.00,150.000000,6,NULL,NULL,NULL,NULL,NULL),(119,'MAT-00119','Hyper 93','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34029090',NULL,NULL,NULL,0,'AKM Chemicals',10.00,2670.00,NULL,10.00,0.00,0.00,267.00,267.00,267.000000,16,NULL,NULL,NULL,NULL,NULL),(120,'MAT-00120','BM 3058','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',49.00,32683.00,NULL,49.00,0.00,0.00,667.00,667.00,667.000000,21,NULL,NULL,NULL,NULL,NULL),(121,'MAT-00121','RA 27007','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',50.00,7500.00,NULL,50.00,0.00,0.00,150.00,150.00,150.000000,6,NULL,NULL,NULL,NULL,NULL),(122,'MAT-00122','RA 27066','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',100.00,15000.00,NULL,100.00,0.00,0.00,150.00,150.00,150.000000,6,NULL,NULL,NULL,NULL,NULL),(123,'MAT-00123','Corial Microbinder AM','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',80.00,14160.00,NULL,80.00,0.00,0.00,177.00,177.00,177.000000,6,NULL,NULL,NULL,NULL,NULL),(124,'MAT-00124','Argowax 4008','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34049000',NULL,NULL,NULL,0,'AKM Chemicals',18.00,5652.00,NULL,18.00,0.00,0.00,314.00,314.00,314.000000,21,NULL,NULL,NULL,NULL,NULL),(125,'MAT-00125','MTW 4506','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',15.00,13935.00,NULL,15.00,0.00,0.00,929.00,929.00,929.000000,21,NULL,NULL,NULL,NULL,NULL),(126,'MAT-00126','HM 183','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38249990',NULL,NULL,NULL,0,'AKM Chemicals',0.85,1329.40,NULL,0.85,0.00,0.00,1564.00,1564.00,1564.000000,6,NULL,NULL,NULL,NULL,NULL),(127,'MAT-00127','LL 3875','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',1.50,1008.00,NULL,1.50,0.00,0.00,672.00,672.00,672.000000,22,NULL,NULL,NULL,NULL,NULL),(128,'MAT-00128','LP 1488','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',1.30,1209.00,NULL,1.30,0.00,0.00,930.00,930.00,930.000000,22,NULL,NULL,NULL,NULL,NULL),(129,'MAT-00129','Mix Carteggio','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38249990',NULL,NULL,NULL,0,'AKM Chemicals',1.80,1060.20,NULL,1.80,0.00,0.00,589.00,589.00,589.000000,22,NULL,NULL,NULL,NULL,NULL),(130,'MAT-00130','LPM 1000','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',1.80,2970.00,NULL,1.80,0.00,0.00,1650.00,1650.00,1650.000000,22,NULL,NULL,NULL,NULL,NULL),(131,'MAT-00131','LP 1247','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',2.20,1988.80,NULL,2.20,0.00,0.00,904.00,904.00,904.000000,22,NULL,NULL,NULL,NULL,NULL),(132,'MAT-00132','LP 1238','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',2.00,1682.00,NULL,2.00,0.00,0.00,841.00,841.00,841.000000,22,NULL,NULL,NULL,NULL,NULL),(133,'MAT-00133','LH 44/B','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',0.50,166.00,NULL,0.50,0.00,0.00,332.00,332.00,332.000000,22,NULL,NULL,NULL,NULL,NULL),(134,'MAT-00134','LP 3452','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',4.50,2790.00,NULL,4.50,0.00,0.00,620.00,620.00,620.000000,22,NULL,NULL,NULL,NULL,NULL),(135,'MAT-00135','LP 1422','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',4.80,3278.40,NULL,4.80,0.00,0.00,683.00,683.00,683.000000,22,NULL,NULL,NULL,NULL,NULL),(136,'MAT-00136','LP 1298','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',4.80,3177.60,NULL,4.80,0.00,0.00,662.00,662.00,662.000000,22,NULL,NULL,NULL,NULL,NULL),(137,'MAT-00137','LT 1110','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',4.90,2420.60,NULL,4.90,0.00,0.00,494.00,494.00,494.000000,22,NULL,NULL,NULL,NULL,NULL),(138,'MAT-00138','LW 65377','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',3.50,1764.00,NULL,3.50,0.00,0.00,504.00,504.00,504.000000,6,NULL,NULL,NULL,NULL,NULL),(139,'MAT-00139','Filla 4477','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',8.00,5400.00,NULL,8.00,0.00,0.00,675.00,675.00,675.000000,21,NULL,NULL,NULL,NULL,NULL),(140,'MAT-00140','Aquarius 3577','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',2.70,1682.10,NULL,2.70,0.00,0.00,623.00,623.00,623.000000,21,NULL,NULL,NULL,NULL,NULL),(141,'MAT-00141','RA 1079','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',0.80,348.80,NULL,0.80,0.00,0.00,436.00,436.00,436.000000,6,NULL,NULL,NULL,NULL,NULL),(142,'MAT-00142','Argowax 611','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34049000',NULL,NULL,NULL,0,'AKM Chemicals',53.50,36968.50,NULL,53.50,0.00,0.00,691.00,691.00,691.000000,21,NULL,NULL,NULL,NULL,NULL),(143,'MAT-00143','LA 021','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',6.20,1829.00,NULL,6.20,0.00,0.00,295.00,295.00,295.000000,22,NULL,NULL,NULL,NULL,NULL),(144,'MAT-00144','LT 1178','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',6.00,2964.00,NULL,6.00,0.00,0.00,494.00,494.00,494.000000,22,NULL,NULL,NULL,NULL,NULL),(145,'MAT-00145','Liquor Ammonia','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'28142000',NULL,NULL,NULL,0,'AKM Chemicals',6.50,260.00,NULL,6.50,0.00,0.00,40.00,40.00,40.000000,23,NULL,NULL,NULL,NULL,NULL),(146,'MAT-00146','B123','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38249990',NULL,NULL,NULL,0,'AKM Chemicals',3.80,1987.40,NULL,3.80,0.00,0.00,523.00,523.00,523.000000,24,NULL,NULL,NULL,NULL,NULL),(147,'MAT-00147','IW08','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38249990',NULL,NULL,NULL,0,'AKM Chemicals',1.00,0.00,NULL,1.00,0.00,0.00,0.00,0.00,0.000000,16,NULL,NULL,NULL,NULL,NULL),(148,'MAT-00148','Rodapur ADX','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34029090',NULL,NULL,NULL,0,'AKM Chemicals',2.50,1197.50,NULL,2.50,0.00,0.00,479.00,479.00,479.000000,16,NULL,NULL,NULL,NULL,NULL),(149,'MAT-00149','Hycryl 55','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',2.50,807.50,NULL,2.50,0.00,0.00,323.00,323.00,323.000000,16,NULL,NULL,NULL,NULL,NULL),(150,'MAT-00150','BM 3159 CT','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',0.90,0.00,NULL,0.90,0.00,0.00,0.00,0.00,0.000000,21,NULL,NULL,NULL,NULL,NULL),(151,'MAT-00151','Soleda Roller 633 CT','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',0.80,468.00,NULL,0.80,0.00,0.00,585.00,585.00,585.000000,21,NULL,NULL,NULL,NULL,NULL),(152,'MAT-00152','Acrilan Soft 6','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',48.00,16704.00,NULL,48.00,0.00,0.00,348.00,348.00,348.000000,21,NULL,NULL,NULL,NULL,NULL),(153,'MAT-00153','Melio WO 606','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',1.80,0.00,NULL,1.80,0.00,0.00,0.00,0.00,0.000000,6,NULL,NULL,NULL,NULL,NULL),(154,'MAT-00154','Argowax 555 NT','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34049000',NULL,NULL,NULL,0,'AKM Chemicals',3.80,1383.20,NULL,3.80,0.00,0.00,364.00,364.00,364.000000,21,NULL,NULL,NULL,NULL,NULL),(155,'MAT-00155','Bioban 045','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38089990',NULL,NULL,NULL,0,'AKM Chemicals',2.80,0.00,NULL,2.80,0.00,0.00,0.00,0.00,0.000000,15,NULL,NULL,NULL,NULL,NULL),(156,'MAT-00156','LW 27703','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',1.40,665.00,NULL,1.40,0.00,0.00,475.00,475.00,475.000000,6,NULL,NULL,NULL,NULL,NULL),(157,'MAT-00157','LW 65701','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',1.80,678.60,NULL,1.80,0.00,0.00,377.00,377.00,377.000000,6,NULL,NULL,NULL,NULL,NULL),(158,'MAT-00158','Argo Fix 172','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',0.57,2966.28,NULL,0.57,0.00,0.00,5204.00,5204.00,5204.000000,21,NULL,NULL,NULL,NULL,NULL),(159,'MAT-00159','LF 1297','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',2.60,0.00,NULL,2.60,0.00,0.00,0.00,0.00,0.000000,22,NULL,NULL,NULL,NULL,NULL),(160,'MAT-00160','Lisofix M 300','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',1.50,0.00,NULL,1.50,0.00,0.00,0.00,0.00,0.000000,22,NULL,NULL,NULL,NULL,NULL),(161,'MAT-00161','Aqulan Top NG 02','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',1.00,0.00,NULL,1.00,0.00,0.00,0.00,0.00,0.000000,6,NULL,NULL,NULL,NULL,NULL),(162,'MAT-00162','Argowax 4004','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34049000',NULL,NULL,NULL,0,'AKM Chemicals',2.00,912.00,NULL,2.00,0.00,0.00,456.00,456.00,456.000000,21,NULL,NULL,NULL,NULL,NULL),(163,'MAT-00163','I KBEC','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38249990',NULL,NULL,NULL,0,'AKM Chemicals',1.00,0.00,NULL,1.00,0.00,0.00,0.00,0.00,0.000000,22,NULL,NULL,NULL,NULL,NULL),(164,'MAT-00164','Liso Top L1','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32089020',NULL,NULL,NULL,0,'AKM Chemicals',0.90,0.00,NULL,0.90,0.00,0.00,0.00,0.00,0.000000,22,NULL,NULL,NULL,NULL,NULL),(165,'MAT-00165','BM 3157 CT','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',0.25,146.75,NULL,0.25,0.00,0.00,587.00,587.00,587.000000,21,NULL,NULL,NULL,NULL,NULL),(166,'MAT-00166','Top U95 kT','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32089020',NULL,NULL,NULL,0,'AKM Chemicals',0.35,164.15,NULL,0.35,0.00,0.00,469.00,469.00,469.000000,16,NULL,NULL,NULL,NULL,NULL),(167,'MAT-00167','Lucido 1186','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',5.50,3712.50,NULL,5.50,0.00,0.00,675.00,675.00,675.000000,21,NULL,NULL,NULL,NULL,NULL),(168,'MAT-00168','Acrilan 2043 E','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',1.50,607.50,NULL,1.50,0.00,0.00,405.00,405.00,405.000000,21,NULL,NULL,NULL,NULL,NULL),(169,'MAT-00169','Argowax 4094','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34049000',NULL,NULL,NULL,0,'AKM Chemicals',3.50,1876.00,NULL,3.50,0.00,0.00,536.00,536.00,536.000000,21,NULL,NULL,NULL,NULL,NULL),(170,'MAT-00170','Hypro 85','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',21.00,5124.00,NULL,21.00,0.00,0.00,244.00,244.00,244.000000,16,NULL,NULL,NULL,NULL,NULL),(171,'MAT-00171','Hypro 86','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',25.00,4600.00,NULL,25.00,0.00,0.00,184.00,184.00,184.000000,16,NULL,NULL,NULL,NULL,NULL),(172,'MAT-00172','Top 1591','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32089020',NULL,NULL,NULL,0,'AKM Chemicals',17.00,6477.00,NULL,17.00,0.00,0.00,381.00,381.00,381.000000,21,NULL,NULL,NULL,NULL,NULL),(173,'MAT-00173','Aquarius 3700 N','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',8.00,6488.00,NULL,8.00,0.00,0.00,811.00,811.00,811.000000,21,NULL,NULL,NULL,NULL,NULL),(174,'MAT-00174','Filler NMR','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',3.00,1308.00,NULL,3.00,0.00,0.00,436.00,436.00,436.000000,21,NULL,NULL,NULL,NULL,NULL),(175,'MAT-00175','4139','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38249990',NULL,NULL,NULL,0,'AKM Chemicals',0.70,490.00,NULL,0.70,0.00,0.00,700.00,700.00,700.000000,21,NULL,NULL,NULL,NULL,NULL),(176,'MAT-00176','Q Wax 80','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34049000',NULL,NULL,NULL,0,'AKM Chemicals',0.35,0.00,NULL,0.35,0.00,0.00,0.00,0.00,0.000000,21,NULL,NULL,NULL,NULL,NULL),(177,'MAT-00177','4134','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38249990',NULL,NULL,NULL,0,'AKM Chemicals',0.60,140.40,NULL,0.60,0.00,0.00,234.00,234.00,234.000000,21,NULL,NULL,NULL,NULL,NULL),(178,'MAT-00178','Hy 88','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38249990',NULL,NULL,NULL,0,'AKM Chemicals',0.50,98.00,NULL,0.50,0.00,0.00,196.00,196.00,196.000000,21,NULL,NULL,NULL,NULL,NULL),(179,'MAT-00179','96','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.30,153.00,NULL,0.30,0.00,0.00,510.00,510.00,510.000000,21,NULL,NULL,NULL,NULL,NULL),(180,'MAT-00180','Iride Dark Brn LX','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',10.00,6020.00,NULL,10.00,0.00,0.00,602.00,602.00,602.000000,21,NULL,NULL,NULL,NULL,NULL),(181,'MAT-00181','Iride Lemon LX','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',2.00,0.00,NULL,2.00,0.00,0.00,0.00,0.00,0.000000,21,NULL,NULL,NULL,NULL,NULL),(182,'MAT-00182','Iride Bianco N','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',50.00,35550.00,NULL,50.00,0.00,0.00,711.00,711.00,711.000000,21,NULL,NULL,NULL,NULL,NULL),(183,'MAT-00183','Iride Brown LX','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',1.50,756.00,NULL,1.50,0.00,0.00,504.00,504.00,504.000000,21,NULL,NULL,NULL,NULL,NULL),(184,'MAT-00184','Iride Yellow LX','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.00,0.00,NULL,0.00,0.00,0.00,1098.00,1098.00,1098.000000,21,NULL,NULL,NULL,NULL,NULL),(185,'MAT-00185','Iride Green LX','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.50,376.50,NULL,0.50,0.00,0.00,753.00,753.00,753.000000,21,NULL,NULL,NULL,NULL,NULL),(186,'MAT-00186','Iride Fuxia LX','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',4.70,6218.10,NULL,4.70,0.00,0.00,1323.00,1323.00,1323.000000,21,NULL,NULL,NULL,NULL,NULL),(187,'MAT-00187','Iride Bordo LX','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',5.70,7518.30,NULL,5.70,0.00,0.00,1319.00,1319.00,1319.000000,21,NULL,NULL,NULL,NULL,NULL),(188,'MAT-00188','Iride Red LX','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',1.50,1165.50,NULL,1.50,0.00,0.00,777.00,777.00,777.000000,21,NULL,NULL,NULL,NULL,NULL),(189,'MAT-00189','Iride Black LX','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',4.50,1966.50,NULL,4.50,0.00,0.00,437.00,437.00,437.000000,21,NULL,NULL,NULL,NULL,NULL),(190,'MAT-00190','Iride Ocra','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',5.00,2465.00,NULL,5.00,0.00,0.00,493.00,493.00,493.000000,21,NULL,NULL,NULL,NULL,NULL),(191,'MAT-00191','AC 1 Eco Navy Blue','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',3.00,1149.00,NULL,3.00,0.00,0.00,383.00,383.00,383.000000,16,NULL,NULL,NULL,NULL,NULL),(192,'MAT-00192','AC 1 Eco Jet Black','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',15.00,4140.00,NULL,15.00,0.00,0.00,276.00,276.00,276.000000,16,NULL,NULL,NULL,NULL,NULL),(193,'MAT-00193','AC 1 Eco Yellow Brown','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',5.00,2750.00,NULL,5.00,0.00,0.00,550.00,550.00,550.000000,16,NULL,NULL,NULL,NULL,NULL),(194,'MAT-00194','Supronil Dk Brn LD 5924','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.40,568.80,NULL,0.40,0.00,0.00,1422.00,1422.00,1422.000000,6,NULL,NULL,NULL,NULL,NULL),(195,'MAT-00195','Supronil Yellow LD 5928','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.80,10168.80,NULL,0.80,0.00,0.00,12711.00,12711.00,12711.000000,6,NULL,NULL,NULL,NULL,NULL),(196,'MAT-00196','Supronil Orange LD 5957','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.70,1028.30,NULL,0.70,0.00,0.00,1469.00,1469.00,1469.000000,6,NULL,NULL,NULL,NULL,NULL),(197,'MAT-00197','Supronil Lemon LD 5927','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.50,2827.00,NULL,0.50,0.00,0.00,5654.00,5654.00,5654.000000,6,NULL,NULL,NULL,NULL,NULL),(198,'MAT-00198','Supronil Y/Brown LD 5985','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.65,921.70,NULL,0.65,0.00,0.00,1418.00,1418.00,1418.000000,6,NULL,NULL,NULL,NULL,NULL),(199,'MAT-00199','Supronil Black W LD 5932','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.70,662.20,NULL,0.70,0.00,0.00,946.00,946.00,946.000000,6,NULL,NULL,NULL,NULL,NULL),(200,'MAT-00200','Luxolin Green','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.10,0.00,NULL,0.10,0.00,0.00,0.00,0.00,0.000000,15,NULL,NULL,NULL,NULL,NULL),(201,'MAT-00201','Katiolux Brown','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.75,0.00,NULL,0.75,0.00,0.00,0.00,0.00,0.000000,25,NULL,NULL,NULL,NULL,NULL),(202,'MAT-00202','Pulver PS Silver','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041790',NULL,NULL,NULL,0,'AKM Chemicals',0.50,0.00,NULL,0.50,0.00,0.00,0.00,0.00,0.000000,26,NULL,NULL,NULL,NULL,NULL),(203,'MAT-00203','Pulver PS Blue','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.23,0.00,NULL,0.23,0.00,0.00,0.00,0.00,0.000000,26,NULL,NULL,NULL,NULL,NULL),(204,'MAT-00204','Pulver PS Red','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.40,0.00,NULL,0.40,0.00,0.00,0.00,0.00,0.000000,26,NULL,NULL,NULL,NULL,NULL),(205,'MAT-00205','Pulver PS Pale Gold','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041790',NULL,NULL,NULL,0,'AKM Chemicals',0.25,0.00,NULL,0.25,0.00,0.00,0.00,0.00,0.000000,26,NULL,NULL,NULL,NULL,NULL),(206,'MAT-00206','Hyper Gold','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041790',NULL,NULL,NULL,0,'AKM Chemicals',0.50,0.00,NULL,0.50,0.00,0.00,0.00,0.00,0.000000,16,NULL,NULL,NULL,NULL,NULL),(207,'MAT-00207','Supronil Red LD 5986','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',1.00,1699.00,NULL,1.00,0.00,0.00,1699.00,1699.00,1699.000000,6,NULL,NULL,NULL,NULL,NULL),(208,'MAT-00208','Supronil R/Brn LD 5981','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',1.00,2034.00,NULL,1.00,0.00,0.00,2034.00,2034.00,2034.000000,6,NULL,NULL,NULL,NULL,NULL),(209,'MAT-00209','Formic Acid','Kg',3,NULL,'INR','Wet-end',11,'2026-09-25 12:46:14','2026-09-30 12:10:13',NULL,'Active',16,7,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'AKM Chemicals',560.00,44800.00,'Kilogram',0.00,0.00,0.00,0.00,0.00,80.000000,3,NULL,NULL,NULL,NULL,NULL),(210,'MAT-00210','Relugan G724','Kg',3,NULL,'INR','Wet-end',11,'2026-09-26 05:44:13','2026-09-30 12:10:07',NULL,'Active',16,7,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'AKM Chemicals',10.00,3790.00,'Kilogram',0.00,0.00,0.00,0.00,0.00,379.000000,NULL,NULL,NULL,NULL,NULL,NULL),(211,'MAT-00211','Sheep Wet Blue','Piece',6,1,'INR','Wet-end',7,'2026-09-26 12:14:04','2026-09-28 09:09:18',NULL,'Active',7,7,NULL,'4',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'AKM Wetblue ',0.00,0.00,NULL,0.00,0.00,0.00,0.00,0.00,0.000000,14,NULL,NULL,NULL,NULL,NULL),(213,'MAT-00213','Brown RE ','Kg',3,NULL,'INR','Wet-end',3,'2026-09-28 12:23:27','2026-09-30 12:09:45',NULL,'Active',16,7,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'AKM Chemicals',0.00,0.00,'Kg',0.00,0.00,0.00,0.00,0.00,0.000000,19,NULL,NULL,NULL,NULL,NULL),(214,'MAT-00214','Brown F','Kg',3,NULL,'INR','Wet-end',3,'2026-09-28 12:50:52','2026-09-30 12:09:53',NULL,'Active',16,7,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'AKM Chemicals',0.00,0.00,'Kg',0.00,0.00,0.00,0.00,0.00,0.000000,19,NULL,NULL,NULL,NULL,NULL),(215,'MAT-00215','HYLA W 08','Kg',3,NULL,'INR','Finishing',12,'2026-09-30 12:04:35','2026-09-30 12:10:00',NULL,'Active',12,7,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'AKM Finishing Chemicals',10.00,4790.00,'Kilogram',10.00,0.00,0.00,0.00,0.00,479.000000,16,NULL,NULL,NULL,NULL,NULL),(216,'MAT-00216','RODA LAC 4130','Kg',3,NULL,'INR','Finishing',12,'2026-09-30 12:09:07','2026-09-30 12:09:07',NULL,'Active',12,NULL,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,5.00,3015.00,'Kg',5.00,0.00,0.00,0.00,0.00,603.000000,NULL,NULL,NULL,NULL,NULL,NULL),(217,'MAT-00217','RODA FEEL 980/N','Kg',3,NULL,'INR','Finishing',12,'2026-09-30 12:11:43','2026-09-30 12:11:43',NULL,'Active',12,NULL,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'AKM Finishing Chemicals',2.00,1588.00,'Kg',2.00,0.00,0.00,0.00,0.00,794.000000,NULL,NULL,NULL,NULL,NULL,NULL),(218,'MAT-00218','RODA FEEL KTA 950-I','Kg',3,NULL,'INR','Finishing',12,'2026-09-30 12:14:25','2026-09-30 12:14:25',NULL,'Active',12,NULL,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'AKM Finishing Chemicals',2.00,1256.00,'Kg',2.00,0.00,0.00,0.00,0.00,628.000000,NULL,NULL,NULL,NULL,NULL,NULL),(219,'MAT-00219','RODA WAX K 619-I','Kg',3,NULL,'INR','Finishing',12,'2026-09-30 12:17:53','2026-09-30 12:17:53',NULL,'Active',12,NULL,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'AKM Finishing Chemicals',3.00,1113.00,'Kg',3.00,0.00,0.00,0.00,0.00,371.000000,16,NULL,NULL,NULL,NULL,NULL);
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
-- Table structure for table `outbound_deliveries`
--

DROP TABLE IF EXISTS `outbound_deliveries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `outbound_deliveries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `outbound_no` varchar(50) NOT NULL,
  `outbound_date` date NOT NULL,
  `from_warehouse_id` int NOT NULL,
  `supplier_id` int NOT NULL,
  `reference_no` varchar(100) DEFAULT NULL,
  `reference_date` date DEFAULT NULL,
  `transporter` varchar(150) DEFAULT NULL,
  `delivery_challan_no` varchar(100) DEFAULT NULL,
  `total_qty` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `total_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `remarks` text,
  `status` varchar(30) NOT NULL DEFAULT 'Posted',
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `outbound_no` (`outbound_no`),
  KEY `idx_outbound_date` (`outbound_date`),
  KEY `idx_outbound_warehouse` (`from_warehouse_id`),
  KEY `idx_outbound_supplier` (`supplier_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `outbound_deliveries`
--

LOCK TABLES `outbound_deliveries` WRITE;
/*!40000 ALTER TABLE `outbound_deliveries` DISABLE KEYS */;
/*!40000 ALTER TABLE `outbound_deliveries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `outbound_delivery_items`
--

DROP TABLE IF EXISTS `outbound_delivery_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `outbound_delivery_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `outbound_delivery_id` int NOT NULL,
  `material_id` int NOT NULL,
  `uom` varchar(50) DEFAULT NULL,
  `available_qty` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `outbound_qty` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `unit_cost` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `batch_no` varchar(100) DEFAULT NULL,
  `remarks` text,
  PRIMARY KEY (`id`),
  KEY `idx_outbound_item_header` (`outbound_delivery_id`),
  KEY `idx_outbound_item_material` (`material_id`),
  CONSTRAINT `fk_outbound_item_header` FOREIGN KEY (`outbound_delivery_id`) REFERENCES `outbound_deliveries` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `outbound_delivery_items`
--

LOCK TABLES `outbound_delivery_items` WRITE;
/*!40000 ALTER TABLE `outbound_delivery_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `outbound_delivery_items` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_categories`
--

LOCK TABLES `product_categories` WRITE;
/*!40000 ALTER TABLE `product_categories` DISABLE KEYS */;
INSERT INTO `product_categories` VALUES (1,'FIN-LEATHER','Finished Leather','Fully finished leather ready for footwear and upholstery','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(2,'SEMI-FINISH','Semi Finished','Partially processed leather','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(3,'CRUST','Crust Leather','Unfinished tanned leather','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(4,'WET-BLUE','Wet Blue','Chrome tanned leather in wet condition','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(5,'SPLITS','Splits','Split layer leather','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(13,'CAT-00001','Cost Component','','Active','2026-08-11 14:48:00','2026-08-11 14:48:00',7,NULL,NULL),(15,'CAT-00003','Chemicals','','Active','2026-09-25 15:37:58','2026-09-25 15:37:58',7,NULL,NULL),(16,'CAT-00004','Machines','','Active','2026-09-26 14:24:18','2026-09-26 14:24:18',7,NULL,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=138 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `production_plan_stages`
--

LOCK TABLES `production_plan_stages` WRITE;
/*!40000 ALTER TABLE `production_plan_stages` DISABLE KEYS */;
INSERT INTO `production_plan_stages` VALUES (131,15,1,11,'Wet End',0.00,532.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'Planned',NULL,'2026-09-28 11:20:34','2026-09-28 11:20:34'),(136,14,1,13,'Measurement',0.00,3500.00,0.00,100.00,0.00,738.00,2762.00,0.00,0.00,'In Progress',NULL,'2026-10-01 12:22:00','2026-10-01 12:22:00'),(137,14,2,12,'Finishing',0.00,3500.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'Planned',NULL,'2026-10-01 12:22:00','2026-10-01 12:22:00');
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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `production_plans`
--

LOCK TABLES `production_plans` WRITE;
/*!40000 ALTER TABLE `production_plans` DISABLE KEYS */;
INSERT INTO `production_plans` VALUES (14,'PRP-000001','2026-09-28',16,NULL,8,NULL,'Sheep  Full Grain White','White',NULL,NULL,'Pcs',3500.00,92.00,NULL,0.00,3500.00,7000.00,0.00,0,0.00,0.00,0.00,7000.00,NULL,NULL,'Medium',NULL,'Completed',7,16,'2026-09-28 08:48:30','2026-10-01 12:22:00',NULL),(15,'PRP-000002','2026-09-28',17,NULL,8,NULL,'Sheep  Softy Black','Black',NULL,NULL,'Pcs',2500.00,92.00,NULL,0.00,2500.00,532.00,0.00,0,1968.00,0.00,0.00,532.00,NULL,NULL,'Medium',NULL,'In Progress',16,NULL,'2026-09-28 11:20:34','2026-09-28 11:20:34',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `production_status_orders`
--

LOCK TABLES `production_status_orders` WRITE;
/*!40000 ALTER TABLE `production_status_orders` DISABLE KEYS */;
INSERT INTO `production_status_orders` VALUES (20,14,'PRP-000001','2026-09-28','KFA',8,'Sheep  Full Grain White','White','Wet End',0.00,2762.00,0.00,'Pcs','Posted',NULL,7,7,7,'2026-09-28 08:48:30','2026-09-28 10:53:46','2026-09-28 10:53:46',NULL),(21,15,'PRP-000002','2026-09-28','KFA',8,'Sheep  Softy Black','Black','Wet End',0.00,2500.00,0.00,'Pcs','Completed',NULL,16,16,NULL,'2026-09-28 11:20:34','2026-09-29 12:06:41',NULL,NULL),(22,14,'PRP-000001','2026-09-28','KFA',8,'Sheep  Full Grain White','White','Measurement',165.00,106.00,6894.00,'Pcs','In Progress',NULL,7,7,NULL,'2026-09-30 07:21:09','2026-10-02 15:55:54',NULL,NULL),(23,14,'PRP-000001','2026-09-28','KFA',8,'Sheep  Full Grain White','White','Packing',0.00,0.00,0.00,'Pcs','Pending',NULL,7,7,NULL,'2026-09-30 07:21:09','2026-09-30 07:21:09',NULL,NULL),(24,14,'PRP-000001','2026-09-28','KFA',8,'Sheep  Full Grain White','White','Finishing',0.00,0.00,0.00,'Pcs','Pending',NULL,16,16,NULL,'2026-10-01 12:22:00','2026-10-01 12:22:00',NULL,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `production_status_transactions`
--

LOCK TABLES `production_status_transactions` WRITE;
/*!40000 ALTER TABLE `production_status_transactions` DISABLE KEYS */;
INSERT INTO `production_status_transactions` VALUES (14,20,'TXN-260928-0001','2026-09-28',0.00,3500.00,0.00,0.00,3500.00,'Pcs',NULL,7,7,'2026-09-28 08:52:40','2026-09-28 10:53:10','2026-09-28 10:53:10'),(15,20,'TXN-260928-0002','2026-09-28',3500.00,0.00,3500.00,0.00,0.00,'Pcs',NULL,7,7,'2026-09-28 09:52:03','2026-09-28 10:49:02','2026-09-28 10:49:02'),(16,20,'TXN-260928-0003','2026-09-28',3500.00,0.00,2762.00,738.00,0.00,'Pcs',NULL,7,7,'2026-09-28 10:48:15','2026-09-28 10:53:28',NULL),(17,21,'TXN-260929-0001','2026-09-29',0.00,0.00,2500.00,14.10,0.00,'Pcs',NULL,16,16,'2026-09-29 12:03:34','2026-09-29 12:06:41',NULL),(18,22,'TXN-261002-0001','2026-10-02',0.00,100.00,50.00,10.00,40.00,'Pcs',NULL,7,7,'2026-10-02 10:17:58','2026-10-02 10:17:58',NULL),(19,22,'TXN-261002-0002','2026-10-02',40.00,60.00,50.00,20.00,30.00,'Pcs',NULL,7,7,'2026-10-02 10:19:28','2026-10-02 10:19:28',NULL),(20,22,'TXN-261002-0003','2026-10-02',30.00,5.00,6.00,2.00,27.00,'Pcs',NULL,7,7,'2026-10-02 15:55:22','2026-10-02 15:55:22',NULL),(21,22,'TXN-261002-0004','2026-10-02',27.00,5.00,0.00,0.00,32.00,'Pcs',NULL,7,7,'2026-10-02 15:55:40','2026-10-02 15:55:54','2026-10-02 15:55:54');
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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'testing','Goat  Patent Green','Crust Leather','cow','Kilogram','Medium (1.0-1.2 mm)','Green','Patent','test','Synthetic Tanning Agents','a',1.00,'test','Inactive','2026-07-01 16:37:05','2026-09-14 09:29:37',3,NULL,3,3,NULL,2,10,7,1,NULL,5,NULL,NULL,1,NULL),(2,'PRD-00NaN','Buffalo  Patent Grey','General','cow',NULL,NULL,NULL,NULL,'demo',NULL,'a',0.00,NULL,'Active','2026-07-28 06:12:37','2026-09-14 09:29:37',1,NULL,2,NULL,NULL,4,6,7,3,5,1,NULL,7,NULL,NULL),(4,'PRD-00001','Sheep  Crust Natural','General','cow',NULL,NULL,NULL,NULL,'',NULL,'a',0.00,NULL,'Active','2026-08-10 12:21:06','2026-09-14 09:29:37',3,NULL,4,1,6,3,5,9,1,NULL,1,7,7,NULL,NULL),(5,'PRD-00002','Sheep  Crust Black','General','cow',NULL,NULL,NULL,NULL,'',NULL,'a',0.00,NULL,'Active','2026-08-10 12:23:16','2026-09-14 09:29:37',2,NULL,4,1,NULL,3,1,9,2,NULL,1,7,7,NULL,NULL),(6,'PRD-00003','Sheep  Softy Black','General','cow',NULL,NULL,NULL,NULL,'',NULL,'a',0.00,NULL,'Active','2026-09-01 15:37:55','2026-09-14 09:29:37',1,1,4,1,6,1,1,12,2,NULL,7,7,7,7,NULL),(7,'PRD-00004','Sheep  Softy off white','General','cow',NULL,NULL,NULL,NULL,'',NULL,'a',0.00,NULL,'Active','2026-09-01 15:41:27','2026-09-14 09:29:37',1,1,4,1,6,1,13,12,2,NULL,7,7,7,7,NULL),(8,'PRD-00005','Sheep  Softy Beige','General','cow',NULL,NULL,NULL,NULL,'',NULL,'a',0.00,NULL,'Active','2026-09-01 15:42:58','2026-09-14 09:29:37',1,1,4,1,6,1,7,12,2,NULL,7,7,7,7,NULL),(9,'PRD-00006','Sheep  Softy Bark','General','cow',NULL,NULL,NULL,NULL,'',NULL,'a',0.00,NULL,'Active','2026-09-01 15:44:34','2026-09-14 09:29:37',1,1,4,3,6,1,14,12,2,NULL,7,7,7,7,NULL),(10,'PRD-00007','Sheep  Pull-Up Bark','General','cow',NULL,NULL,NULL,NULL,'',NULL,'a',0.00,NULL,'Active','2026-09-05 14:04:11','2026-09-17 11:04:15',1,1,4,1,6,3,14,6,2,NULL,7,NULL,7,16,NULL),(11,'PRD-00008','Sheep  Nappa off white','General','cow',NULL,NULL,NULL,NULL,'',NULL,'a',0.00,NULL,'Active','2026-09-25 11:25:33','2026-09-26 13:29:45',1,13,4,6,6,2,13,3,2,NULL,2,NULL,16,7,NULL),(12,'PRD-00009','Sheep  sheep upper pearl white','General','cow',NULL,NULL,NULL,NULL,'',NULL,'a',0.00,NULL,'Active','2026-09-25 12:24:27','2026-09-25 12:24:27',1,1,4,9,NULL,5,12,13,NULL,NULL,NULL,NULL,16,NULL,NULL),(13,'PRD-00010','Sheep  Full Grain White','General','cow',NULL,NULL,NULL,NULL,'',NULL,'a',0.00,NULL,'Active','2026-09-26 11:31:26','2026-09-26 11:31:26',1,1,4,1,6,2,15,2,2,NULL,7,NULL,7,NULL,NULL),(15,'PRD-00012','Sheep  Red','General','cow',NULL,NULL,NULL,NULL,'',NULL,'a',0.00,NULL,'Active','2026-10-03 10:39:18','2026-10-03 11:23:08',1,13,4,1,NULL,2,9,NULL,2,NULL,1,NULL,16,16,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=871 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_menu_access`
--

LOCK TABLES `role_menu_access` WRITE;
/*!40000 ALTER TABLE `role_menu_access` DISABLE KEYS */;
INSERT INTO `role_menu_access` VALUES (716,9,'/dashboard','2026-09-16 09:11:51'),(717,9,'/sales-orders','2026-09-16 09:11:51'),(719,10,'/dashboard','2026-09-16 09:11:51'),(720,10,'/production-plan','2026-09-16 09:11:51'),(721,10,'/production-plan/new','2026-09-16 09:11:51'),(725,12,'/dashboard','2026-09-16 09:11:51'),(726,12,'/production-status','2026-09-16 09:11:51'),(728,13,'/dashboard','2026-09-16 09:11:51'),(729,13,'/general-cost','2026-09-16 09:11:51'),(730,13,'/machine-cost','2026-09-16 09:11:51'),(731,13,'/costing-report','2026-09-16 09:11:51'),(802,1,'/batch-completion','2026-09-29 10:57:44'),(803,1,'/batch-lot-tracking','2026-09-29 10:57:44'),(804,1,'/batch-process','2026-09-29 10:57:44'),(805,1,'/bom','2026-09-29 10:57:44'),(806,1,'/bom-revision','2026-09-29 10:57:44'),(807,1,'/business-units','2026-09-29 10:57:44'),(808,1,'/chemical-master','2026-09-29 10:57:44'),(809,1,'/color','2026-09-29 10:57:44'),(810,1,'/company','2026-09-29 10:57:44'),(811,1,'/cost-analysis','2026-09-29 10:57:44'),(812,1,'/cost-breakdown','2026-09-29 10:57:44'),(813,1,'/cost-components','2026-09-29 10:57:44'),(814,1,'/costing-report','2026-09-29 10:57:44'),(815,1,'/customer-master','2026-09-29 10:57:44'),(816,1,'/dashboard','2026-09-29 10:57:44'),(817,1,'/data-templates','2026-09-29 10:57:44'),(818,1,'/database-backups','2026-09-29 10:57:44'),(819,1,'/department-master','2026-09-29 10:57:44'),(820,1,'/finish-type','2026-09-29 10:57:44'),(821,1,'/general-cost','2026-09-29 10:57:44'),(822,1,'/grade','2026-09-29 10:57:44'),(823,1,'/grn','2026-09-29 10:57:44'),(824,1,'/group-master','2026-09-29 10:57:44'),(825,1,'/hsn-code','2026-09-29 10:57:44'),(826,1,'/inventory-reports','2026-09-29 10:57:44'),(827,1,'/leather-type','2026-09-29 10:57:44'),(828,1,'/location-rack','2026-09-29 10:57:44'),(829,1,'/machine','2026-09-29 10:57:44'),(830,1,'/machine-cost','2026-09-29 10:57:44'),(831,1,'/material-issue','2026-09-29 10:57:44'),(832,1,'/material-receipt','2026-09-29 10:57:44'),(833,1,'/material-requirement','2026-09-29 10:57:44'),(834,1,'/monthly-batch-process','2026-09-29 10:57:44'),(835,1,'/physical-stock-entry','2026-09-29 10:57:44'),(836,1,'/process-stage','2026-09-29 10:57:44'),(837,1,'/product-category','2026-09-29 10:57:44'),(838,1,'/product-master','2026-09-29 10:57:44'),(839,1,'/production-plan','2026-09-29 10:57:44'),(840,1,'/production-plan/new','2026-09-29 10:57:44'),(841,1,'/production-status','2026-09-29 10:57:44'),(842,1,'/purchase-orders','2026-09-29 10:57:44'),(843,1,'/rate-master','2026-09-29 10:57:44'),(844,1,'/recipe-creation','2026-09-29 10:57:44'),(845,1,'/reports','2026-09-29 10:57:44'),(846,1,'/reports/actual-production','2026-09-29 10:57:44'),(847,1,'/reports/inventory','2026-09-29 10:57:44'),(848,1,'/reports/production-plan','2026-09-29 10:57:44'),(849,1,'/reports/sales-order','2026-09-29 10:57:44'),(850,1,'/reports/stage-costing','2026-09-29 10:57:44'),(851,1,'/roles','2026-09-29 10:57:44'),(852,1,'/sales-orders','2026-09-29 10:57:44'),(853,1,'/standard-cost-bom','2026-09-29 10:57:44'),(854,1,'/standard-costing','2026-09-29 10:57:44'),(855,1,'/standard-size','2026-09-29 10:57:44'),(856,1,'/stock-opening-entry','2026-09-29 10:57:44'),(857,1,'/stock-transfer','2026-09-29 10:57:44'),(858,1,'/supplier-invoice','2026-09-29 10:57:44'),(859,1,'/supplier-master','2026-09-29 10:57:44'),(860,1,'/supplier-price-approval','2026-09-29 10:57:44'),(861,1,'/supplier-pricing-history','2026-09-29 10:57:44'),(862,1,'/supplier-return','2026-09-29 10:57:44'),(863,1,'/tax-master','2026-09-29 10:57:44'),(864,1,'/thickness','2026-09-29 10:57:44'),(865,1,'/uom','2026-09-29 10:57:44'),(866,1,'/users','2026-09-29 10:57:44'),(867,1,'/warehouse-master','2026-09-29 10:57:44'),(868,1,'/outbound-delivery','2026-09-29 10:57:44'),(869,11,'/material-issue','2026-09-30 11:39:32'),(870,11,'/material-receipt','2026-09-30 11:39:32');
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
INSERT INTO `roles` VALUES (1,'ADMIN','Administrator','Full system access with all permissions',NULL,'read_write','Active','2026-07-05 14:29:03','2026-07-27 08:38:35',NULL,7,NULL),(2,'MANAGER','Manager','Manage operations and approve transactions',NULL,'read_write','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(3,'USER','User','Basic access to view and create records',NULL,'read_write','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(4,'VIEWER','Viewer','Read-only access',NULL,'read_only','Active','2026-07-05 14:29:03','2026-07-17 15:31:05',NULL,1,NULL),(7,'admin1','imaaz','test',NULL,'read_write','Inactive','2026-07-13 23:41:45','2026-07-17 13:59:16',1,NULL,'2026-07-17 13:59:16'),(8,'8928','Imaaz','',NULL,'read_write','Inactive','2026-07-17 13:59:38','2026-07-22 05:25:17',1,NULL,'2026-07-22 05:25:17'),(9,'SALE_ORDER','Sale Order','Sales order entry',NULL,'read_write','Active','2026-09-16 09:11:51','2026-09-16 09:11:51',NULL,NULL,NULL),(10,'PROD_PLAN','Production Planner','Production planning',NULL,'read_write','Active','2026-09-16 09:11:51','2026-09-16 09:11:51',NULL,NULL,NULL),(11,'MAT_ISSUE','Material Issue','Material issue to production',NULL,'read_write','Active','2026-09-16 09:11:51','2026-09-28 11:00:03',NULL,7,NULL),(12,'DAILY_PROD','Daily Production','Daily production entry',NULL,'read_write','Active','2026-09-16 09:11:51','2026-09-16 09:11:51',NULL,NULL,NULL),(13,'COSTING_OH','Costing / Overheads','Costing & overheads',NULL,'read_write','Active','2026-09-16 09:11:51','2026-09-16 09:11:51',NULL,NULL,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales_order_items`
--

LOCK TABLES `sales_order_items` WRITE;
/*!40000 ALTER TABLE `sales_order_items` DISABLE KEYS */;
INSERT INTO `sales_order_items` VALUES (31,16,'PRD-00010','Sheep  Full Grain White',13,NULL,'Sheep ','White','Medium (1.0-1.2 mm)','Square Feet',3141.00,NULL,110.0000,0.00,345510.00,'2026-09-28 10:50:12'),(35,17,'PRD-00003','Sheep  Softy Black',6,NULL,'Sheep ','Black','Thin (0.8-1.0 mm)','Square Feet',2500.00,'2026-09-21',110.0000,0.00,275000.00,'2026-09-29 07:18:54');
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
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales_orders`
--

LOCK TABLES `sales_orders` WRITE;
/*!40000 ALTER TABLE `sales_orders` DISABLE KEYS */;
INSERT INTO `sales_orders` VALUES (16,'SO-2026-00001',8,'2026-09-11',NULL,'AKM-153','Standard','Mr KFA',NULL,'Advance','INR',NULL,NULL,'Confirmed',NULL,0.00,0.00,5.00,345510.00,17275.50,8637.75,8637.75,0.00,'CGST_SGST',362785.50,NULL,7,7,'2026-09-26 11:32:57','2026-09-28 10:50:12'),(17,'SO-2026-00002',8,'2026-09-28',NULL,'AKM154','Standard','Mr KFA',NULL,'Advance','INR',NULL,NULL,'Confirmed',NULL,0.00,0.00,5.00,275000.00,13750.00,6875.00,6875.00,0.00,'CGST_SGST',288750.00,NULL,16,16,'2026-09-28 11:09:06','2026-09-29 12:03:34');
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `standard_cost_sheets`
--

LOCK TABLES `standard_cost_sheets` WRITE;
/*!40000 ALTER TABLE `standard_cost_sheets` DISABLE KEYS */;
INSERT INTO `standard_cost_sheets` VALUES (1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0.00,0.00,'Wet End',1,'KFA092601',1,'INR','Sq.Ft.',0.0000,0.00,0.00,0.0000,0.0000,'Draft',7,7,7,'2026-09-28 10:54:12','2026-09-28 10:54:12'),(2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0.00,0.00,'Wet End',1,'KFA092602',1,'INR','Sq.Ft.',0.0000,0.00,0.00,0.0000,0.0000,'Draft',7,7,7,'2026-09-28 10:54:23','2026-09-28 10:54:23'),(3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0.00,0.00,'Wet End',1,'KFA092603',1,'INR','Sq.Ft.',0.0000,0.00,0.00,0.0000,0.0000,'Draft',7,7,7,'2026-09-28 10:54:40','2026-09-28 10:54:40'),(4,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0.00,0.00,'Wet End',1,'KFA092604',1,'INR','Sq.Ft.',0.0000,0.00,0.00,0.0000,0.0000,'Draft',7,7,7,'2026-09-28 13:02:00','2026-09-28 13:02:00'),(5,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0.00,0.00,'Wet End',1,'KFA092605',1,'INR','Sq.Ft.',0.0000,0.00,0.00,0.0000,0.0000,'Draft',16,16,16,'2026-09-30 06:50:17','2026-09-30 06:50:17'),(6,NULL,NULL,15,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0.00,0.00,'BOM',1,'KFA102601',1,'INR','Sq.Ft.',0.0000,27698.00,-27698.00,0.0000,27698.0000,'Approved',7,7,7,'2026-10-02 10:55:47','2026-10-02 10:55:47');
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
) ENGINE=InnoDB AUTO_INCREMENT=283 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_ledger`
--

LOCK TABLES `stock_ledger` WRITE;
/*!40000 ALTER TABLE `stock_ledger` DISABLE KEYS */;
INSERT INTO `stock_ledger` VALUES (21,'2026-09-27','Opening','material_master',105,'MAT-00105',8,105,NULL,NULL,NULL,0.700,0.000,916.2000,641.34,0.700,'Opening stock (material master)',NULL,'2026-09-27 14:57:23'),(25,'2026-09-27','Opening','material_master',208,'MAT-00208',8,208,NULL,NULL,NULL,1.000,0.000,2034.0000,2034.00,1.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(26,'2026-09-27','Opening','material_master',207,'MAT-00207',8,207,NULL,NULL,NULL,1.000,0.000,1699.0000,1699.00,1.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(27,'2026-09-27','Opening','material_master',206,'MAT-00206',8,206,NULL,NULL,NULL,0.500,0.000,0.0000,0.00,0.500,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(28,'2026-09-27','Opening','material_master',205,'MAT-00205',8,205,NULL,NULL,NULL,0.250,0.000,0.0000,0.00,0.250,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(29,'2026-09-27','Opening','material_master',204,'MAT-00204',8,204,NULL,NULL,NULL,0.400,0.000,0.0000,0.00,0.400,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(30,'2026-09-27','Opening','material_master',203,'MAT-00203',8,203,NULL,NULL,NULL,0.230,0.000,0.0000,0.00,0.230,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(31,'2026-09-26','Opening','material_master',202,'MAT-00202',8,202,NULL,NULL,NULL,0.500,0.000,0.0000,0.00,0.500,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(32,'2026-09-27','Opening','material_master',201,'MAT-00201',8,201,NULL,NULL,NULL,0.750,0.000,0.0000,0.00,0.750,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(33,'2026-09-27','Opening','material_master',200,'MAT-00200',8,200,NULL,NULL,NULL,0.100,0.000,0.0000,0.00,0.100,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(34,'2026-09-27','Opening','material_master',199,'MAT-00199',8,199,NULL,NULL,NULL,0.700,0.000,946.0000,662.20,0.700,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(35,'2026-09-27','Opening','material_master',198,'MAT-00198',8,198,NULL,NULL,NULL,0.650,0.000,1418.0000,921.70,0.650,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(36,'2026-09-27','Opening','material_master',197,'MAT-00197',8,197,NULL,NULL,NULL,0.500,0.000,5654.0000,2827.00,0.500,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(37,'2026-09-27','Opening','material_master',196,'MAT-00196',8,196,NULL,NULL,NULL,0.700,0.000,1469.0000,1028.30,0.700,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(38,'2026-09-27','Opening','material_master',195,'MAT-00195',8,195,NULL,NULL,NULL,0.800,0.000,12711.0000,10168.80,0.800,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(39,'2026-09-27','Opening','material_master',194,'MAT-00194',8,194,NULL,NULL,NULL,0.400,0.000,1422.0000,568.80,0.400,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(40,'2026-09-27','Opening','material_master',193,'MAT-00193',8,193,NULL,NULL,NULL,5.000,0.000,550.0000,2750.00,5.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(41,'2026-09-27','Opening','material_master',192,'MAT-00192',8,192,NULL,NULL,NULL,15.000,0.000,276.0000,4140.00,15.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(42,'2026-09-27','Opening','material_master',191,'MAT-00191',8,191,NULL,NULL,NULL,3.000,0.000,383.0000,1149.00,3.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(43,'2026-09-27','Opening','material_master',190,'MAT-00190',8,190,NULL,NULL,NULL,5.000,0.000,493.0000,2465.00,5.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(44,'2026-09-27','Opening','material_master',189,'MAT-00189',8,189,NULL,NULL,NULL,4.500,0.000,437.0000,1966.50,4.500,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(45,'2026-09-27','Opening','material_master',188,'MAT-00188',8,188,NULL,NULL,NULL,1.500,0.000,777.0000,1165.50,1.500,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(46,'2026-09-27','Opening','material_master',187,'MAT-00187',8,187,NULL,NULL,NULL,5.700,0.000,1319.0000,7518.30,5.700,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(47,'2026-09-27','Opening','material_master',186,'MAT-00186',8,186,NULL,NULL,NULL,4.700,0.000,1323.0000,6218.10,4.700,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(48,'2026-09-27','Opening','material_master',185,'MAT-00185',8,185,NULL,NULL,NULL,0.500,0.000,753.0000,376.50,0.500,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(49,'2026-09-27','Opening','material_master',183,'MAT-00183',8,183,NULL,NULL,NULL,1.500,0.000,504.0000,756.00,1.500,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(50,'2026-09-27','Opening','material_master',182,'MAT-00182',8,182,NULL,NULL,NULL,50.000,0.000,711.0000,35550.00,50.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(51,'2026-09-27','Opening','material_master',181,'MAT-00181',8,181,NULL,NULL,NULL,2.000,0.000,0.0000,0.00,2.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(52,'2026-09-27','Opening','material_master',180,'MAT-00180',8,180,NULL,NULL,NULL,10.000,0.000,602.0000,6020.00,10.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(53,'2026-09-27','Opening','material_master',179,'MAT-00179',8,179,NULL,NULL,NULL,0.300,0.000,510.0000,153.00,0.300,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(54,'2026-09-27','Opening','material_master',178,'MAT-00178',8,178,NULL,NULL,NULL,0.500,0.000,196.0000,98.00,0.500,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(55,'2026-09-27','Opening','material_master',177,'MAT-00177',8,177,NULL,NULL,NULL,0.600,0.000,234.0000,140.40,0.600,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(56,'2026-09-27','Opening','material_master',176,'MAT-00176',8,176,NULL,NULL,NULL,0.350,0.000,0.0000,0.00,0.350,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(57,'2026-09-27','Opening','material_master',175,'MAT-00175',8,175,NULL,NULL,NULL,0.700,0.000,700.0000,490.00,0.700,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(58,'2026-09-27','Opening','material_master',174,'MAT-00174',8,174,NULL,NULL,NULL,3.000,0.000,436.0000,1308.00,3.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(59,'2026-09-27','Opening','material_master',173,'MAT-00173',8,173,NULL,NULL,NULL,8.000,0.000,811.0000,6488.00,8.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(60,'2026-09-27','Opening','material_master',172,'MAT-00172',8,172,NULL,NULL,NULL,17.000,0.000,381.0000,6477.00,17.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(61,'2026-09-27','Opening','material_master',171,'MAT-00171',8,171,NULL,NULL,NULL,25.000,0.000,184.0000,4600.00,25.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(62,'2026-09-27','Opening','material_master',170,'MAT-00170',8,170,NULL,NULL,NULL,21.000,0.000,244.0000,5124.00,21.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(63,'2026-09-27','Opening','material_master',169,'MAT-00169',8,169,NULL,NULL,NULL,3.500,0.000,536.0000,1876.00,3.500,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(64,'2026-09-27','Opening','material_master',168,'MAT-00168',8,168,NULL,NULL,NULL,1.500,0.000,405.0000,607.50,1.500,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(65,'2026-09-27','Opening','material_master',167,'MAT-00167',8,167,NULL,NULL,NULL,5.500,0.000,675.0000,3712.50,5.500,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(66,'2026-09-27','Opening','material_master',166,'MAT-00166',8,166,NULL,NULL,NULL,0.350,0.000,469.0000,164.15,0.350,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(67,'2026-09-27','Opening','material_master',165,'MAT-00165',8,165,NULL,NULL,NULL,0.250,0.000,587.0000,146.75,0.250,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(68,'2026-09-27','Opening','material_master',164,'MAT-00164',8,164,NULL,NULL,NULL,0.900,0.000,0.0000,0.00,0.900,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(69,'2026-09-27','Opening','material_master',163,'MAT-00163',8,163,NULL,NULL,NULL,1.000,0.000,0.0000,0.00,1.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(70,'2026-09-27','Opening','material_master',162,'MAT-00162',8,162,NULL,NULL,NULL,2.000,0.000,456.0000,912.00,2.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(71,'2026-09-27','Opening','material_master',161,'MAT-00161',8,161,NULL,NULL,NULL,1.000,0.000,0.0000,0.00,1.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(72,'2026-09-27','Opening','material_master',160,'MAT-00160',8,160,NULL,NULL,NULL,1.500,0.000,0.0000,0.00,1.500,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(73,'2026-09-27','Opening','material_master',159,'MAT-00159',8,159,NULL,NULL,NULL,2.600,0.000,0.0000,0.00,2.600,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(74,'2026-09-27','Opening','material_master',158,'MAT-00158',8,158,NULL,NULL,NULL,0.570,0.000,5204.0000,2966.28,0.570,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(75,'2026-09-27','Opening','material_master',157,'MAT-00157',8,157,NULL,NULL,NULL,1.800,0.000,377.0000,678.60,1.800,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(76,'2026-09-27','Opening','material_master',156,'MAT-00156',8,156,NULL,NULL,NULL,1.400,0.000,475.0000,665.00,1.400,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(77,'2026-09-27','Opening','material_master',155,'MAT-00155',8,155,NULL,NULL,NULL,2.800,0.000,0.0000,0.00,2.800,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(78,'2026-09-27','Opening','material_master',154,'MAT-00154',8,154,NULL,NULL,NULL,3.800,0.000,364.0000,1383.20,3.800,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(79,'2026-09-27','Opening','material_master',153,'MAT-00153',8,153,NULL,NULL,NULL,1.800,0.000,0.0000,0.00,1.800,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(80,'2026-09-27','Opening','material_master',152,'MAT-00152',8,152,NULL,NULL,NULL,48.000,0.000,348.0000,16704.00,48.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(81,'2026-09-27','Opening','material_master',151,'MAT-00151',8,151,NULL,NULL,NULL,0.800,0.000,585.0000,468.00,0.800,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(82,'2026-09-27','Opening','material_master',150,'MAT-00150',8,150,NULL,NULL,NULL,0.900,0.000,0.0000,0.00,0.900,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(83,'2026-09-27','Opening','material_master',149,'MAT-00149',8,149,NULL,NULL,NULL,2.500,0.000,323.0000,807.50,2.500,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(84,'2026-09-27','Opening','material_master',148,'MAT-00148',8,148,NULL,NULL,NULL,2.500,0.000,479.0000,1197.50,2.500,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(85,'2026-09-27','Opening','material_master',147,'MAT-00147',8,147,NULL,NULL,NULL,1.000,0.000,0.0000,0.00,1.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(86,'2026-09-27','Opening','material_master',146,'MAT-00146',8,146,NULL,NULL,NULL,3.800,0.000,523.0000,1987.40,3.800,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(87,'2026-09-27','Opening','material_master',145,'MAT-00145',8,145,NULL,NULL,NULL,6.500,0.000,40.0000,260.00,6.500,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(88,'2026-09-27','Opening','material_master',144,'MAT-00144',8,144,NULL,NULL,NULL,6.000,0.000,494.0000,2964.00,6.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(89,'2026-09-27','Opening','material_master',143,'MAT-00143',8,143,NULL,NULL,NULL,6.200,0.000,295.0000,1829.00,6.200,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(90,'2026-09-27','Opening','material_master',142,'MAT-00142',8,142,NULL,NULL,NULL,53.500,0.000,691.0000,36968.50,53.500,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(91,'2026-09-27','Opening','material_master',141,'MAT-00141',8,141,NULL,NULL,NULL,0.800,0.000,436.0000,348.80,0.800,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(92,'2026-09-27','Opening','material_master',140,'MAT-00140',8,140,NULL,NULL,NULL,2.700,0.000,623.0000,1682.10,2.700,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(93,'2026-09-27','Opening','material_master',139,'MAT-00139',8,139,NULL,NULL,NULL,8.000,0.000,675.0000,5400.00,8.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(94,'2026-09-27','Opening','material_master',138,'MAT-00138',8,138,NULL,NULL,NULL,3.500,0.000,504.0000,1764.00,3.500,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(95,'2026-09-27','Opening','material_master',137,'MAT-00137',8,137,NULL,NULL,NULL,4.900,0.000,494.0000,2420.60,4.900,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(96,'2026-09-27','Opening','material_master',136,'MAT-00136',8,136,NULL,NULL,NULL,4.800,0.000,662.0000,3177.60,4.800,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(97,'2026-09-27','Opening','material_master',135,'MAT-00135',8,135,NULL,NULL,NULL,4.800,0.000,683.0000,3278.40,4.800,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(98,'2026-09-27','Opening','material_master',134,'MAT-00134',8,134,NULL,NULL,NULL,4.500,0.000,620.0000,2790.00,4.500,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(99,'2026-09-27','Opening','material_master',133,'MAT-00133',8,133,NULL,NULL,NULL,0.500,0.000,332.0000,166.00,0.500,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(100,'2026-09-27','Opening','material_master',132,'MAT-00132',8,132,NULL,NULL,NULL,2.000,0.000,841.0000,1682.00,2.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(101,'2026-09-27','Opening','material_master',131,'MAT-00131',8,131,NULL,NULL,NULL,2.200,0.000,904.0000,1988.80,2.200,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(102,'2026-09-27','Opening','material_master',130,'MAT-00130',8,130,NULL,NULL,NULL,1.800,0.000,1650.0000,2970.00,1.800,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(103,'2026-09-27','Opening','material_master',129,'MAT-00129',8,129,NULL,NULL,NULL,1.800,0.000,589.0000,1060.20,1.800,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(104,'2026-09-27','Opening','material_master',128,'MAT-00128',8,128,NULL,NULL,NULL,1.300,0.000,930.0000,1209.00,1.300,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(105,'2026-09-27','Opening','material_master',127,'MAT-00127',8,127,NULL,NULL,NULL,1.500,0.000,672.0000,1008.00,1.500,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(106,'2026-09-27','Opening','material_master',126,'MAT-00126',8,126,NULL,NULL,NULL,0.850,0.000,1564.0000,1329.40,0.850,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(107,'2026-09-27','Opening','material_master',125,'MAT-00125',8,125,NULL,NULL,NULL,15.000,0.000,929.0000,13935.00,15.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(108,'2026-09-27','Opening','material_master',124,'MAT-00124',8,124,NULL,NULL,NULL,18.000,0.000,314.0000,5652.00,18.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(109,'2026-09-27','Opening','material_master',123,'MAT-00123',8,123,NULL,NULL,NULL,80.000,0.000,177.0000,14160.00,80.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(110,'2026-09-27','Opening','material_master',122,'MAT-00122',8,122,NULL,NULL,NULL,100.000,0.000,150.0000,15000.00,100.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(111,'2026-09-27','Opening','material_master',121,'MAT-00121',8,121,NULL,NULL,NULL,50.000,0.000,150.0000,7500.00,50.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(112,'2026-09-27','Opening','material_master',120,'MAT-00120',8,120,NULL,NULL,NULL,49.000,0.000,667.0000,32683.00,49.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(113,'2026-09-27','Opening','material_master',119,'MAT-00119',8,119,NULL,NULL,NULL,10.000,0.000,267.0000,2670.00,10.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(114,'2026-09-27','Opening','material_master',118,'MAT-00118',8,118,NULL,NULL,NULL,120.000,0.000,150.0000,18000.00,120.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(115,'2026-09-27','Opening','material_master',117,'MAT-00117',8,117,NULL,NULL,NULL,7.000,0.000,537.0000,3759.00,7.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(116,'2026-09-27','Opening','material_master',116,'MAT-00116',8,116,NULL,NULL,NULL,72.500,0.000,345.0000,25012.50,72.500,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(117,'2026-09-27','Opening','material_master',115,'MAT-00115',8,115,NULL,NULL,NULL,93.500,0.000,153.0000,14305.50,93.500,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(118,'2026-09-27','Opening','material_master',114,'MAT-00114',8,114,NULL,NULL,NULL,10.000,0.000,273.0000,2730.00,10.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(119,'2026-09-27','Opening','material_master',113,'MAT-00113',8,113,NULL,NULL,NULL,5.300,0.000,703.8000,3730.14,5.300,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(120,'2026-09-27','Opening','material_master',112,'MAT-00112',8,112,NULL,NULL,NULL,8.800,0.000,586.5800,5161.90,8.800,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(121,'2026-09-27','Opening','material_master',111,'MAT-00111',8,111,NULL,NULL,NULL,3.500,0.000,745.8800,2610.58,3.500,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(122,'2026-09-27','Opening','material_master',110,'MAT-00110',8,110,NULL,NULL,NULL,3.250,0.000,576.5700,1873.85,3.250,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(123,'2026-09-27','Opening','material_master',109,'MAT-00109',8,109,NULL,NULL,NULL,3.650,0.000,544.5100,1987.46,3.650,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(124,'2026-09-27','Opening','material_master',108,'MAT-00108',8,108,NULL,NULL,NULL,60.000,0.000,450.0000,27000.00,60.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(125,'2026-09-27','Opening','material_master',107,'MAT-00107',8,107,NULL,NULL,NULL,60.900,0.000,540.0000,32886.00,60.900,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(126,'2026-09-27','Opening','material_master',106,'MAT-00106',8,106,NULL,NULL,NULL,17.500,0.000,963.3100,16857.93,17.500,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(127,'2026-09-27','Opening','material_master',104,'MAT-00104',8,104,NULL,NULL,NULL,0.850,0.000,451.3300,383.63,0.850,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(128,'2026-09-27','Opening','material_master',103,'MAT-00103',8,103,NULL,NULL,NULL,0.400,0.000,0.0000,0.00,0.400,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(129,'2026-09-27','Opening','material_master',102,'MAT-00102',8,102,NULL,NULL,NULL,0.550,0.000,0.0000,0.00,0.550,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(130,'2026-09-27','Opening','material_master',101,'MAT-00101',8,101,NULL,NULL,NULL,1.100,0.000,1280.5800,1408.64,1.100,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(131,'2026-09-27','Opening','material_master',100,'MAT-00100',8,100,NULL,NULL,NULL,1.800,0.000,581.5700,1046.83,1.800,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(132,'2026-09-27','Opening','material_master',99,'MAT-00099',8,99,NULL,NULL,NULL,0.400,0.000,660.7200,264.29,0.400,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(133,'2026-09-27','Opening','material_master',98,'MAT-00098',8,98,NULL,NULL,NULL,0.100,0.000,647.7000,64.77,0.100,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(134,'2026-09-27','Opening','material_master',97,'MAT-00097',8,97,NULL,NULL,NULL,1.700,0.000,479.6200,815.35,1.700,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(135,'2026-09-27','Opening','material_master',96,'MAT-00096',8,96,NULL,NULL,NULL,0.650,0.000,437.6200,284.45,0.650,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(136,'2026-09-27','Opening','material_master',95,'MAT-00095',8,95,NULL,NULL,NULL,0.300,0.000,504.4300,151.33,0.300,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(137,'2026-09-27','Opening','material_master',94,'MAT-00094',8,94,NULL,NULL,NULL,0.090,0.000,729.0000,65.61,0.090,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(138,'2026-09-27','Opening','material_master',93,'MAT-00093',8,93,NULL,NULL,NULL,0.200,0.000,372.2000,74.44,0.200,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(139,'2026-09-27','Opening','material_master',92,'MAT-00092',8,92,NULL,NULL,NULL,0.220,0.000,4123.0000,907.06,0.220,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(140,'2026-09-27','Opening','material_master',91,'MAT-00091',8,91,NULL,NULL,NULL,0.850,0.000,626.0000,532.10,0.850,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(141,'2026-09-27','Opening','material_master',90,'MAT-00090',8,90,NULL,NULL,NULL,0.850,0.000,600.0000,510.00,0.850,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(142,'2026-09-27','Opening','material_master',89,'MAT-00089',8,89,NULL,NULL,NULL,4.950,0.000,1313.0000,6499.35,4.950,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(143,'2026-09-27','Opening','material_master',88,'MAT-00088',8,88,NULL,NULL,NULL,2.000,0.000,520.4800,1040.96,2.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(144,'2026-09-27','Opening','material_master',87,'MAT-00087',8,87,NULL,NULL,NULL,0.450,0.000,1218.0000,548.10,0.450,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(145,'2026-09-27','Opening','material_master',86,'MAT-00086',8,86,NULL,NULL,NULL,0.400,0.000,860.0000,344.00,0.400,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(146,'2026-09-27','Opening','material_master',85,'MAT-00085',8,85,NULL,NULL,NULL,0.100,0.000,819.0000,81.90,0.100,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(147,'2026-09-27','Opening','material_master',84,'MAT-00084',8,84,NULL,NULL,NULL,2.950,0.000,963.0000,2840.85,2.950,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(148,'2026-09-27','Opening','material_master',83,'MAT-00083',8,83,NULL,NULL,NULL,1.500,0.000,773.9600,1160.94,1.500,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(149,'2026-09-27','Opening','material_master',82,'MAT-00082',8,82,NULL,NULL,NULL,3.700,0.000,897.1800,3319.57,3.700,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(150,'2026-09-27','Opening','material_master',81,'MAT-00081',8,81,NULL,NULL,NULL,2.600,0.000,821.0400,2134.70,2.600,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(151,'2026-09-27','Opening','material_master',80,'MAT-00080',8,80,NULL,NULL,NULL,0.600,0.000,494.4300,296.66,0.600,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(152,'2026-09-27','Opening','material_master',79,'MAT-00079',8,79,NULL,NULL,NULL,0.250,0.000,657.4000,164.35,0.250,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(153,'2026-09-27','Opening','material_master',78,'MAT-00078',8,78,NULL,NULL,NULL,5.250,0.000,1159.0000,6084.75,5.250,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(154,'2026-09-27','Opening','material_master',77,'MAT-00077',8,77,NULL,NULL,NULL,0.600,0.000,449.2500,269.55,0.600,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(155,'2026-09-27','Opening','material_master',76,'MAT-00076',8,76,NULL,NULL,NULL,3.300,0.000,847.0900,2795.40,3.300,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(156,'2026-09-27','Opening','material_master',75,'MAT-00075',8,75,NULL,NULL,NULL,0.350,0.000,1031.4400,361.00,0.350,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(157,'2026-09-27','Opening','material_master',74,'MAT-00074',8,74,NULL,NULL,NULL,0.500,0.000,523.4800,261.74,0.500,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(158,'2026-09-27','Opening','material_master',73,'MAT-00073',8,73,NULL,NULL,NULL,0.600,0.000,824.0500,494.43,0.600,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(159,'2026-09-27','Opening','material_master',72,'MAT-00072',8,72,NULL,NULL,NULL,0.750,0.000,247.0000,185.25,0.750,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(160,'2026-09-27','Opening','material_master',71,'MAT-00071',8,71,NULL,NULL,NULL,43.500,0.000,308.0000,13398.00,43.500,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(161,'2026-09-27','Opening','material_master',70,'MAT-00070',8,70,NULL,NULL,NULL,11.000,0.000,0.0000,0.00,11.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(162,'2026-09-27','Opening','material_master',69,'MAT-00069',8,69,NULL,NULL,NULL,14.500,0.000,330.0000,4785.00,14.500,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(163,'2026-09-27','Opening','material_master',68,'MAT-00068',8,68,NULL,NULL,NULL,20.300,0.000,304.0000,6171.20,20.300,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(164,'2026-09-27','Opening','material_master',67,'MAT-00067',8,67,NULL,NULL,NULL,14.400,0.000,264.0000,3801.60,14.400,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(165,'2026-09-27','Opening','material_master',66,'MAT-00066',8,66,NULL,NULL,NULL,61.000,0.000,125.0000,7625.00,61.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(166,'2026-09-27','Opening','material_master',65,'MAT-00065',8,65,NULL,NULL,NULL,15.900,0.000,125.0000,1987.50,15.900,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(167,'2026-09-27','Opening','material_master',64,'MAT-00064',8,64,NULL,NULL,NULL,17.000,0.000,195.0000,3315.00,17.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(168,'2026-09-27','Opening','material_master',63,'MAT-00063',8,63,NULL,NULL,NULL,11.400,0.000,148.0000,1687.20,11.400,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(169,'2026-09-27','Opening','material_master',62,'MAT-00062',8,62,NULL,NULL,NULL,19.500,0.000,145.0000,2827.50,19.500,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(170,'2026-09-27','Opening','material_master',61,'MAT-00061',8,61,NULL,NULL,NULL,11.950,0.000,185.0000,2210.75,11.950,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(171,'2026-09-27','Opening','material_master',60,'MAT-00060',8,60,NULL,NULL,NULL,11.300,0.000,265.0000,2994.50,11.300,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(172,'2026-09-27','Opening','material_master',59,'MAT-00059',8,59,NULL,NULL,NULL,11.500,0.000,278.0000,3197.00,11.500,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(173,'2026-09-27','Opening','material_master',58,'MAT-00058',8,58,NULL,NULL,NULL,38.900,0.000,206.0000,8013.40,38.900,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(174,'2026-09-27','Opening','material_master',57,'MAT-00057',8,57,NULL,NULL,NULL,20.000,0.000,180.0000,3600.00,20.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(175,'2026-09-27','Opening','material_master',56,'MAT-00056',8,56,NULL,NULL,NULL,63.000,0.000,160.0000,10080.00,63.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(176,'2026-09-27','Opening','material_master',55,'MAT-00055',8,55,NULL,NULL,NULL,5.000,0.000,125.0000,625.00,5.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(177,'2026-09-27','Opening','material_master',54,'MAT-00054',8,54,NULL,NULL,NULL,46.500,0.000,119.0000,5533.50,46.500,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(178,'2026-09-27','Opening','material_master',53,'MAT-00053',8,53,NULL,NULL,NULL,21.500,0.000,272.0000,5848.00,21.500,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(179,'2026-09-27','Opening','material_master',52,'MAT-00052',8,52,NULL,NULL,NULL,119.000,0.000,112.0000,13328.00,119.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(180,'2026-09-27','Opening','material_master',51,'MAT-00051',8,51,NULL,NULL,NULL,63.700,0.000,117.0000,7452.90,63.700,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(181,'2026-09-27','Opening','material_master',50,'MAT-00050',8,50,NULL,NULL,NULL,45.500,0.000,121.0000,5505.50,45.500,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(182,'2026-09-27','Opening','material_master',49,'MAT-00049',8,49,NULL,NULL,NULL,129.300,0.000,50.0000,6465.00,129.300,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(183,'2026-09-27','Opening','material_master',48,'MAT-00048',8,48,NULL,NULL,NULL,59.000,0.000,176.0000,10384.00,59.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(184,'2026-09-27','Opening','material_master',47,'MAT-00047',8,47,NULL,NULL,NULL,105.800,0.000,55.0000,5819.00,105.800,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(185,'2026-09-27','Opening','material_master',46,'MAT-00046',8,46,NULL,NULL,NULL,42.000,0.000,185.0000,7770.00,42.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(186,'2026-09-27','Opening','material_master',45,'MAT-00045',8,45,NULL,NULL,NULL,74.300,0.000,169.0000,12556.70,74.300,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(187,'2026-09-27','Opening','material_master',44,'MAT-00044',8,44,NULL,NULL,NULL,50.000,0.000,307.0000,15350.00,50.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(188,'2026-09-27','Opening','material_master',43,'MAT-00043',8,43,NULL,NULL,NULL,159.500,0.000,230.0000,36685.00,159.500,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(189,'2026-09-27','Opening','material_master',42,'MAT-00042',8,42,NULL,NULL,NULL,42.300,0.000,145.0000,6133.50,42.300,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(190,'2026-09-27','Opening','material_master',41,'MAT-00041',8,41,NULL,NULL,NULL,32.500,0.000,216.0000,7020.00,32.500,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(191,'2026-09-27','Opening','material_master',40,'MAT-00040',8,40,NULL,NULL,NULL,8.700,0.000,177.0000,1539.90,8.700,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(192,'2026-09-27','Opening','material_master',39,'MAT-00039',8,39,NULL,NULL,NULL,10.000,0.000,230.0000,2300.00,10.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(193,'2026-09-27','Opening','material_master',38,'MAT-00038',8,38,NULL,NULL,NULL,35.000,0.000,205.0000,7175.00,35.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(194,'2026-09-27','Opening','material_master',37,'MAT-00037',8,37,NULL,NULL,NULL,25.000,0.000,210.0000,5250.00,25.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(195,'2026-09-27','Opening','material_master',36,'MAT-00036',8,36,NULL,NULL,NULL,20.000,0.000,1303.0000,26060.00,20.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(196,'2026-09-27','Opening','material_master',35,'MAT-00035',8,35,NULL,NULL,NULL,30.000,0.000,346.0000,10380.00,30.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(197,'2026-09-27','Opening','material_master',34,'MAT-00034',8,34,NULL,NULL,NULL,80.000,0.000,210.0000,16800.00,80.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(198,'2026-09-27','Opening','material_master',33,'MAT-00033',8,33,NULL,NULL,NULL,130.000,0.000,256.0000,33280.00,130.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(199,'2026-09-27','Opening','material_master',32,'MAT-00032',8,32,NULL,NULL,NULL,70.000,0.000,288.0000,20160.00,70.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(200,'2026-09-27','Opening','material_master',31,'MAT-00031',8,31,NULL,NULL,NULL,30.000,0.000,139.0000,4170.00,30.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(201,'2026-09-27','Opening','material_master',30,'MAT-00030',8,30,NULL,NULL,NULL,70.000,0.000,170.0000,11900.00,70.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(202,'2026-09-27','Opening','material_master',29,'MAT-00029',8,29,NULL,NULL,NULL,96.000,0.000,187.0000,17952.00,96.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(203,'2026-09-27','Opening','material_master',28,'MAT-00028',8,28,NULL,NULL,NULL,2.400,0.000,226.0000,542.40,2.400,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(204,'2026-09-27','Opening','material_master',27,'MAT-00027',8,27,NULL,NULL,NULL,2.500,0.000,236.0000,590.00,2.500,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(205,'2026-09-27','Opening','material_master',26,'MAT-00026',8,26,NULL,NULL,NULL,3.000,0.000,560.0000,1680.00,3.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(206,'2026-09-27','Opening','material_master',25,'MAT-00025',8,25,NULL,NULL,NULL,6.000,0.000,321.0000,1926.00,6.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(207,'2026-09-27','Opening','material_master',24,'MAT-00024',8,24,NULL,NULL,NULL,0.500,0.000,206.0000,103.00,0.500,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(208,'2026-09-27','Opening','material_master',23,'MAT-00023',8,23,NULL,NULL,NULL,10.900,0.000,173.0000,1885.70,10.900,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(209,'2026-09-27','Opening','material_master',22,'MAT-00022',8,22,NULL,NULL,NULL,21.300,0.000,236.0000,5026.80,21.300,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(210,'2026-09-27','Opening','material_master',21,'MAT-00021',8,21,NULL,NULL,NULL,1.800,0.000,232.0000,417.60,1.800,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(211,'2026-09-27','Opening','material_master',20,'MAT-00020',8,20,NULL,NULL,NULL,85.000,0.000,379.0000,32215.00,85.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(212,'2026-09-27','Opening','material_master',19,'MAT-00019',8,19,NULL,NULL,NULL,5.500,0.000,446.0000,2453.00,5.500,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(213,'2026-09-27','Opening','material_master',18,'MAT-00018',8,18,NULL,NULL,NULL,3.000,0.000,465.0000,1395.00,3.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(214,'2026-09-27','Opening','material_master',17,'MAT-00017',8,17,NULL,NULL,NULL,5.000,0.000,575.0000,2875.00,5.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(215,'2026-09-27','Opening','material_master',16,'MAT-00016',8,16,NULL,NULL,NULL,4.600,0.000,262.0000,1205.20,4.600,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(216,'2026-09-27','Opening','material_master',15,'MAT-00015',8,15,NULL,NULL,NULL,9.400,0.000,287.0000,2697.80,9.400,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(217,'2026-09-27','Opening','material_master',14,'MAT-00014',8,14,NULL,NULL,NULL,150.000,0.000,222.0000,33300.00,150.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(218,'2026-09-27','Opening','material_master',13,'MAT-00013',8,13,NULL,NULL,NULL,33.000,0.000,602.0000,19866.00,33.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(219,'2026-09-27','Opening','material_master',12,'MAT-00012',8,12,NULL,NULL,NULL,30.000,0.000,124.0000,3720.00,30.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(220,'2026-09-27','Opening','material_master',11,'MAT-00011',8,11,NULL,NULL,NULL,148.000,0.000,187.0000,27676.00,148.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(221,'2026-09-27','Opening','material_master',10,'MAT-00010',8,10,NULL,NULL,NULL,145.000,0.000,140.0000,20300.00,145.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(222,'2026-09-27','Opening','material_master',9,'MAT-00009',8,9,NULL,NULL,NULL,139.800,0.000,272.0000,38025.60,139.800,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(223,'2026-09-27','Opening','material_master',8,'MAT-00008',8,8,NULL,NULL,NULL,50.000,0.000,204.0000,10200.00,50.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(224,'2026-09-27','Opening','material_master',7,'MAT-00007',8,7,NULL,NULL,NULL,13.700,0.000,430.0000,5891.00,13.700,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(225,'2026-09-27','Opening','material_master',6,'MAT-00006',8,6,NULL,NULL,NULL,16.900,0.000,315.0000,5323.50,16.900,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(226,'2026-09-27','Opening','material_master',5,'MAT-00005',8,5,NULL,NULL,NULL,25.500,0.000,171.0000,4360.50,25.500,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(227,'2026-09-27','Opening','material_master',4,'MAT-00004',8,4,NULL,NULL,NULL,11.300,0.000,80.0000,904.00,11.300,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(228,'2026-09-27','Opening','material_master',3,'MAT-00003',8,3,NULL,NULL,NULL,27.500,0.000,125.0000,3437.50,27.500,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(229,'2026-09-27','Opening','material_master',2,'MAT-00002',8,2,NULL,NULL,NULL,14.000,0.000,322.0000,4508.00,14.000,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(230,'2026-09-27','Opening','material_master',1,'MAT-00001',8,1,NULL,NULL,NULL,14.700,0.000,390.0000,5733.00,14.700,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(282,'2026-09-28','Receipt','material_receipt',12,'GRN-2026-00001',7,211,'Piece',NULL,NULL,607.000,0.000,232.6500,141218.55,607.000,'Material receipt',7,'2026-09-28 08:39:44');
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
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `supply_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
INSERT INTO `uom` VALUES (1,'SQFT','Square Feet','Area measurement in square feet','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(2,'SQM','Square Meter','Area measurement in square meters','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(3,'KG','Kg','Weight measurement in kilograms','Active','2026-07-05 14:29:03','2026-09-30 12:09:06',NULL,7,NULL),(4,'LTR','Liter','Liquid volume in liters','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(5,'MTR','Meter','Linear measurement in meters','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(6,'PIECE','Piece','Individual unit count','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(7,'DOZEN','Dozen','Pack of 12 units','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(9,'UOM-00NaN','Bundle','','Active','2026-08-11 14:51:34','2026-08-11 14:51:34',7,NULL,NULL),(10,'UOM-00001','Box','','Active','2026-08-11 14:51:42','2026-08-11 14:51:42',7,NULL,NULL),(11,'UOM-00002','none','none','Active','2026-08-22 06:18:01','2026-08-22 06:18:01',7,NULL,NULL);
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
INSERT INTO `users` VALUES (7,'akmadmin','$2a$10$d/6u5QHlAmduzPJucmCB5ekmmd7BC.p72sdF0/v3WmahOBCrs8uD6','akmadmin@gmail.com','Admin Akm',1,NULL,NULL,'Active','2026-10-04 11:35:55','2026-07-22 05:21:44','2026-10-04 11:35:55',1,NULL),(8,'ihtishaam','$2a$10$wokvJgCPZnM.tPgbajHZ9OWH6cGCg8R8TL5Xumy5cSnZbjKrNoToW',NULL,'Ihtishaam',1,NULL,NULL,'Active',NULL,'2026-09-16 09:11:51','2026-09-16 09:11:51',NULL,NULL),(9,'abdullah','$2a$10$TMixMR2xrVR939XeCuTDEulH3la0Ynw8YFI2nxLWTNxQhLzGZyM8W',NULL,'Abdullah Basha',1,NULL,NULL,'Active','2026-10-04 06:26:30','2026-09-16 09:11:51','2026-10-04 06:26:30',NULL,7),(10,'tabrez','$2a$10$wokvJgCPZnM.tPgbajHZ9OWH6cGCg8R8TL5Xumy5cSnZbjKrNoToW',NULL,'Tabrez',11,NULL,NULL,'Active',NULL,'2026-09-16 09:11:51','2026-09-16 09:11:51',NULL,NULL),(11,'sami','$2a$10$wokvJgCPZnM.tPgbajHZ9OWH6cGCg8R8TL5Xumy5cSnZbjKrNoToW',NULL,'Sami',12,NULL,NULL,'Active',NULL,'2026-09-16 09:11:51','2026-09-16 09:11:51',NULL,NULL),(12,'ameen','$2a$10$morOH0c7Vbd/T8rgWuZg6eyLEJkBeBiOsgLB6HTR95zQyOfVMzJcG',NULL,'Ameen',11,NULL,NULL,'Active','2026-09-30 11:55:31','2026-09-16 09:11:51','2026-09-30 11:55:31',NULL,7),(13,'aadil','$2a$10$wokvJgCPZnM.tPgbajHZ9OWH6cGCg8R8TL5Xumy5cSnZbjKrNoToW',NULL,'Aadil',12,NULL,NULL,'Active',NULL,'2026-09-16 09:11:51','2026-09-16 09:11:51',NULL,NULL),(14,'waseem','$2a$10$wokvJgCPZnM.tPgbajHZ9OWH6cGCg8R8TL5Xumy5cSnZbjKrNoToW',NULL,'Waseem',12,NULL,NULL,'Active',NULL,'2026-09-16 09:11:51','2026-09-16 09:11:51',NULL,NULL),(15,'umar','$2a$10$wokvJgCPZnM.tPgbajHZ9OWH6cGCg8R8TL5Xumy5cSnZbjKrNoToW',NULL,'Umar',12,NULL,NULL,'Active',NULL,'2026-09-16 09:11:51','2026-09-16 09:11:51',NULL,NULL),(16,'Salman','$2a$10$AmjXGgzYJk5vB7S9cgAPC.sDx3AJHmvkez583pIPXDmkKXepEt1um','sallu7037@gmail.com','Mohammed Salman',1,NULL,NULL,'Active','2026-10-04 06:40:18','2026-09-17 10:43:45','2026-10-04 06:40:18',7,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=83 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `warehouse_stock`
--

LOCK TABLES `warehouse_stock` WRITE;
/*!40000 ALTER TABLE `warehouse_stock` DISABLE KEYS */;
INSERT INTO `warehouse_stock` VALUES (3,1,1,'test',-2.000,0.0000,'2026-09-26 12:15:54'),(4,2,1,'test',2.000,2.0000,'2026-07-11 07:42:59'),(14,1,199,'Piece',0.000,0.0000,'2026-09-26 12:15:52'),(15,3,35,'Kg',-4.500,0.0000,'2026-09-16 12:48:32'),(16,3,36,'Kg',-4.500,0.0000,'2026-09-16 12:48:32'),(17,3,5,'Kg',-10.500,0.0000,'2026-09-16 12:48:32'),(18,3,23,'Kg',-35.000,0.0000,'2026-09-16 12:48:32'),(19,3,49,'Kg',-1.000,0.0000,'2026-09-16 12:48:32'),(20,3,24,'Kg',-16.000,0.0000,'2026-09-16 12:48:32'),(21,3,18,'Kg',-12.500,0.0000,'2026-09-16 12:48:32'),(22,3,62,'Kg',-2.750,0.0000,'2026-09-16 12:48:32'),(23,3,16,'Kg',-24.500,0.0000,'2026-09-16 12:48:32'),(24,3,28,'Kg',-5.500,0.0000,'2026-09-16 12:48:32'),(25,3,126,'Kg',-10.000,0.0000,'2026-09-16 12:51:43'),(26,3,171,'Kg',-2.200,0.0000,'2026-09-16 12:51:43'),(27,1,167,'Kg',-5.000,0.0000,'2026-09-22 11:17:19'),(28,1,9,'Kg',0.000,0.0000,'2026-09-26 11:33:08'),(29,1,10,'Kg',0.000,0.0000,'2026-09-26 11:33:08'),(30,1,3,'Kg',0.000,0.0000,'2026-09-26 11:33:08'),(31,1,52,'Kg',0.000,0.0000,'2026-09-26 11:33:08'),(32,1,51,'Kg',0.000,0.0000,'2026-09-26 11:33:09'),(33,1,44,'Kg',0.000,0.0000,'2026-09-26 11:33:09'),(34,1,33,'Kg',0.000,0.0000,'2026-09-26 11:33:09'),(35,1,47,'Kg',0.000,0.0000,'2026-09-26 11:33:09'),(36,1,49,'Kg',0.000,0.0000,'2026-09-26 11:33:08'),(37,1,29,'Kg',0.000,0.0000,'2026-09-26 11:33:09'),(38,1,50,'Kg',0.000,0.0000,'2026-09-26 11:33:09'),(39,1,30,'Kg',0.000,0.0000,'2026-09-26 11:33:09'),(40,1,46,'Kg',0.000,0.0000,'2026-09-26 11:33:09'),(41,7,211,'Piece',607.000,232.6500,'2026-09-28 08:52:03'),(42,7,181,'Kg',0.000,0.0000,'2026-09-27 07:19:04'),(43,8,105,'Kilogram',0.700,916.2000,'2026-09-28 06:47:37'),(44,8,202,'Kg',1.500,0.0000,'2026-09-28 06:02:24'),(45,8,123,'Kg',80.000,177.0000,'2026-09-28 09:49:38'),(46,8,118,'Kg',120.000,150.0000,'2026-09-28 09:49:38'),(47,8,121,'Kg',50.000,150.0000,'2026-09-28 09:49:38'),(48,8,170,'Kg',21.000,244.0000,'2026-09-28 09:49:38'),(49,8,120,'Kg',49.000,667.0000,'2026-09-28 09:49:38'),(50,8,125,'Kg',15.000,929.0000,'2026-09-28 09:49:38'),(51,8,182,'Kg',50.000,711.0000,'2026-09-28 10:51:15'),(52,8,158,'Kg',0.570,5204.0000,'2026-09-28 09:49:38'),(53,8,173,'Kg',8.000,811.0000,'2026-09-28 09:49:38'),(54,8,172,'Kg',17.000,381.0000,'2026-09-28 09:49:38'),(55,8,167,'Kg',5.500,675.0000,'2026-09-28 09:49:38'),(56,8,126,'Kg',0.850,1564.0000,'2026-09-28 09:49:38'),(57,8,9,'Kg',139.800,272.0000,'2026-09-28 10:51:15'),(58,8,10,'Kg',145.000,140.0000,'2026-09-28 10:51:15'),(59,8,52,'Kg',119.000,112.0000,'2026-09-28 10:51:15'),(60,8,51,'Kg',63.700,117.0000,'2026-09-28 10:51:15'),(61,8,44,'Kg',50.000,307.0000,'2026-09-28 10:51:15'),(62,8,33,'Kg',130.000,256.0000,'2026-09-28 10:51:15'),(63,8,47,'Kg',105.800,55.0000,'2026-09-28 10:51:15'),(64,8,49,'Kg',129.300,50.0000,'2026-09-28 10:51:15'),(65,8,29,'Kg',96.000,187.0000,'2026-09-28 10:51:15'),(66,8,50,'Kg',45.500,121.0000,'2026-09-28 10:51:15'),(67,8,30,'Kg',70.000,170.0000,'2026-09-28 10:51:15'),(68,8,31,'Kg',30.000,139.0000,'2026-09-28 10:51:15'),(69,8,43,'Kg',159.500,230.0000,'2026-09-28 10:51:15'),(70,8,56,'Kg',63.000,160.0000,'2026-09-28 10:51:15'),(71,8,61,'Kg',11.950,185.0000,'2026-09-28 10:51:15'),(72,8,45,'Kg',74.300,169.0000,'2026-09-28 10:51:15'),(73,8,40,'Kg',8.700,177.0000,'2026-09-28 10:51:15'),(74,8,42,'Kg',42.300,145.0000,'2026-09-28 10:51:15'),(75,8,69,'Kg',14.500,330.0000,'2026-09-28 10:51:15'),(76,8,35,'Kg',30.000,346.0000,'2026-09-28 10:51:15'),(77,8,116,'Kg',72.500,345.0000,'2026-09-28 10:51:15'),(78,8,32,'Kg',70.000,288.0000,'2026-09-28 10:51:15'),(79,8,115,'Kg',93.500,153.0000,'2026-09-28 10:51:15'),(80,8,114,'Kg',10.000,273.0000,'2026-09-28 10:51:15'),(81,8,66,'Kg',61.000,125.0000,'2026-09-28 10:51:15'),(82,8,15,'Kg',9.400,287.0000,'2026-09-28 10:51:16');
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
INSERT INTO `warehouses` VALUES (1,'test','Wet Blue','Wet Blue','Raw Material',NULL,'Yes','Vaniyambadi','Ambur','Tamil Nadu','India','5543121','23456789','test','Wet Blue','CC-FG-01','2026-07-11',2.00,2.00,'Dry','No','Yes','Wet Blue','Weighted Average',0,'test','test','Active',NULL,7,'2026-07-11 07:19:35','2026-09-01 15:56:12'),(2,'test-new','test-new','test-new','Raw Material',1,'No','test-new','Vaniyambadi','Tamil Nadu','India','75422','23456','test','test-new','CC-FG-01','2026-07-14',NULL,NULL,'Dry','No','No',NULL,'FIFO',0,NULL,'test-new','Active',NULL,NULL,'2026-07-11 07:42:23','2026-07-11 07:42:23'),(3,'8283','test',NULL,'Raw Material',NULL,'No','nzbcbmcb',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Dry','No','No',NULL,'FIFO',0,NULL,NULL,'Active',NULL,NULL,'2026-07-16 21:03:50','2026-07-16 21:03:50'),(4,'WH-01','Test',NULL,'Raw Material',NULL,'No','test1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Dry','No','No',NULL,'FIFO',0,NULL,NULL,'Active',NULL,NULL,'2026-07-16 21:05:53','2026-07-16 21:05:53'),(6,'gytrye','vnvn',NULL,'Raw Material',NULL,'No','nvn',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Dry','No','No',NULL,'FIFO',0,NULL,NULL,'Active',NULL,NULL,'2026-07-16 21:09:52','2026-07-16 21:09:52'),(7,'WH-002','AKM Wetblue ',NULL,'Raw Material',NULL,'No',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Dry','No','No',NULL,'FIFO',0,NULL,NULL,'Active',7,NULL,'2026-09-26 11:34:56','2026-09-26 11:34:56'),(8,'WH-003','AKM Finishing Chemicals',NULL,'Raw Material',NULL,'No',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Ameen ','CC-RAW-01',NULL,NULL,NULL,'Dry','No','No',NULL,'FIFO',0,NULL,NULL,'Active',7,7,'2026-09-26 12:34:00','2026-09-30 12:01:35');
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

-- Dump completed on 2026-10-04 11:37:35
