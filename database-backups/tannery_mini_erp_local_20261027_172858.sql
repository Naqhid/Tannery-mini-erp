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
  `bom_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  KEY `idx_bi_bom_material` (`bom_id`,`material_id`),
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
  `process_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Wet End Chemicals',
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
  KEY `idx_boms_product_status_version` (`product_id`,`status`,`version`),
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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `colors`
--

LOCK TABLES `colors` WRITE;
/*!40000 ALTER TABLE `colors` DISABLE KEYS */;
INSERT INTO `colors` VALUES (1,'BLACK','Black','#000000','Classic black color','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(2,'BROWN','Brown','#8B4513','Natural brown color','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(3,'DARK-BRN','Dark Brown','#654321','Deep brown color','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(4,'TAN','Tan','#D2B48C','Light tan color','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(5,'NATURAL','Natural','#F5F5DC','Untreated natural color','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(6,'GREY','Grey','#808080','Grey color','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(7,'BEIGE','Beige','#F5F5DC','Beige color','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(8,'NAVY','Navy Blue','#000080','Navy blue color','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(9,'RED','Red','#8B0000','Dark red color','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(10,'GREEN','Green','#006400','Dark green color','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(12,'CLR-00NaN','pearl white','#098928','test','Active','2026-07-13 22:22:15','2026-07-13 22:22:15',1,NULL,NULL),(13,'CLR-00001','off white','#FAF9F6','color','Active','2026-09-01 15:33:43','2026-09-01 15:33:43',7,NULL,NULL),(14,'CLR-00002','Bark','#261105','color','Active','2026-09-01 15:34:23','2026-09-01 15:34:23',7,NULL,NULL),(15,'CLR-00003','White','','','Active','2026-09-26 11:30:21','2026-09-26 11:30:21',7,NULL,NULL),(16,'CLR-00004','Red Daliya','','','Active','2026-10-11 06:32:57','2026-10-11 06:32:57',7,NULL,NULL);
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
  `code` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `group_id` int DEFAULT NULL,
  `uom_id` int DEFAULT NULL,
  `cost_per_uom` decimal(14,4) NOT NULL DEFAULT '0.0000',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
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
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cost_components`
--

LOCK TABLES `cost_components` WRITE;
/*!40000 ALTER TABLE `cost_components` DISABLE KEYS */;
INSERT INTO `cost_components` VALUES (1,'CC-00001','Labour Overheads',6,1,0.0000,'','Active',7,NULL,'2026-09-26 14:21:15','2026-09-26 14:21:15',NULL),(2,'CC-00002','By Air',5,3,0.1000,'','Active',7,7,'2026-09-26 14:21:40','2026-10-22 12:40:58',NULL),(3,'CC-00003','By Train',5,3,0.0000,'','Active',7,NULL,'2026-09-26 14:21:58','2026-09-26 14:21:58',NULL),(4,'CC-00004','By Sea',5,3,10.0000,'','Active',7,7,'2026-09-26 14:22:15','2026-09-26 16:08:32',NULL),(5,'CC-00005','Domestic',4,9,0.0000,'','Active',7,NULL,'2026-09-26 14:22:36','2026-09-26 14:22:36',NULL),(6,'CC-00006','Export',4,10,0.0000,'','Active',7,NULL,'2026-09-26 14:22:56','2026-09-26 14:22:56',NULL),(7,'CC-00007','Inspection Table',16,NULL,0.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:40:01',NULL),(8,'CC-00008','Setting IND',14,6,2.2500,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(9,'CC-00009','Setting IMP',14,6,3.3000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(10,'CC-00010','Sammying IND',14,6,3.3000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(11,'CC-00011','Sammying IMP',14,6,5.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(12,'CC-00012','Hooking IND',14,6,1.2500,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(13,'CC-00013','Hooking IMP',14,6,1.6500,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(14,'CC-00014','Shaving IND',14,6,2.5000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(15,'CC-00015','Dry Shaving IND',14,6,2.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(16,'CC-00016','Shaving IMP',14,6,3.5000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(17,'CC-00017','Dry Shaving IMP',14,6,3.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(18,'CC-00018','Dry Setting IND',14,6,2.2500,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(19,'CC-00019','Buffing',14,6,2.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(20,'CC-00020','Dust-Off',14,6,0.6000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(21,'CC-00021','Molissa Staking',14,6,1.7500,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(22,'CC-00022','Wheel Staking ',14,6,2.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(23,'CC-00023','Dry Drum',14,NULL,200.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(24,'CC-00024','Jumbo Drum',14,NULL,2475.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(25,'CC-00025','Big Drum',14,6,1650.0000,'Imported from machine (migration 053)','Active',NULL,7,'2026-09-26 15:09:13','2026-09-27 07:16:11',NULL),(26,'CC-00026','Medium Drum',14,NULL,825.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(27,'CC-00027','Baby Drum',14,NULL,550.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(28,'CC-00028','Sample Drum',14,NULL,330.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(29,'CC-00029','Plating IND',15,6,2.5000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(30,'CC-00030','Plating IMP',15,6,3.5000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(31,'CC-00031','Measuring IND',15,6,0.7500,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(32,'CC-00032','Measuring IMP',15,6,1.2500,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(33,'CC-00033','Measuring Stamper',15,6,2.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(34,'CC-00034','Auto Spray',15,6,1.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(35,'CC-00035','Padding ',15,6,1.2000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(36,'CC-00036','Roller Plating',15,6,3.5000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(37,'CC-00037','ICO T&M',15,6,2.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(38,'CC-00038','Plating CLB',15,6,1.7500,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(39,'CC-00039','Shaving PAK',14,6,4.5000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(40,'CC-00040','Padam PAK',14,6,1.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(41,'CC-00041','Setting IND PAK',14,6,2.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(42,'CC-00042','Dry Shaving PAK',14,6,4.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(43,'CC-00043','Buffing PAK',14,6,3.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(44,'CC-00044','Dust-Off PAK',14,6,0.4000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(45,'CC-00045','Setting IMP PAK',14,6,2.5000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(46,'CC-00046','Dry Drum PAK',14,NULL,300.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(47,'CC-00047','Satilux PAK',15,6,3.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(48,'CC-00048','Plating IND PAK',15,6,3.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(49,'CC-00049','Plating IMP PAK',15,6,3.5000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(50,'CC-00050','Setting HUR',14,6,2.2500,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(51,'CC-00051','REV Setting HUR',14,6,3.5000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(52,'CC-00052','Vaccum',14,6,4.5000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(53,'CC-00053','Hooking HUR',14,6,1.2500,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(54,'CC-00054','Molissa HUR',14,6,1.7500,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(55,'CC-00055','TCP',14,6,1.7500,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(56,'CC-00056','WCM',14,6,1.0000,'Imported from machine (migration 053)','Active',NULL,NULL,'2026-09-26 15:09:13','2026-09-26 15:56:53',NULL),(70,'CC-00057','Labour Overheads (Copy)',6,1,0.0000,'','Active',NULL,NULL,'2026-09-28 11:00:43','2026-09-28 11:00:43',NULL),(71,'CC-00058','Dry Buffing/dust off',14,6,2.6000,'','Active',16,NULL,'2026-10-22 12:29:25','2026-10-22 12:29:25',NULL),(72,'CC-00059','Trimming + v cut pisar',15,6,1.7500,'','Active',16,NULL,'2026-10-22 12:33:56','2026-10-22 12:33:56',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (6,'CUST-00001','KPW','Mr MS','','','','Agra','Uttar Pradesh','India','Active','domestic','inr','','','','','','90','','','2026-07-27 12:55:02','2026-10-11 06:37:11',NULL,NULL,NULL,7,7,NULL),(7,'CUST-00002','CRO','Mr SS','','','','Agra','Uttar Pradesh','India','Active','domestic','inr','','','','','','90','','','2026-07-30 06:33:46','2026-10-11 06:37:17',NULL,NULL,NULL,7,7,NULL),(8,'CUST-00003','KFA','Mr KFA','','','','Vaniyambadi','Tamil Nadu','India','Active','domestic','inr','','','','','','7','','','2026-07-30 06:35:35','2026-10-11 06:37:21',NULL,NULL,NULL,7,7,NULL),(9,'CUST-00004','STY','Mr PC','','','','Kolkata','West Bengal','India','Active','domestic','inr','','','','','','60','','','2026-07-30 06:36:51','2026-10-11 06:37:26',NULL,NULL,NULL,7,7,NULL),(12,'CUST-00005','UFM','UFM','','','','Gurgaon','Haryana','India','Active','domestic','inr','','','','','','30','','','2026-10-05 05:44:50','2026-10-11 06:37:49',NULL,NULL,NULL,16,7,NULL),(13,'CUST-00006','BE','Mr PM','','','','Agra','Uttar Pradesh','India','Active','domestic','inr','','','','','','30','','','2026-10-11 06:31:44','2026-10-11 06:38:08',NULL,NULL,NULL,7,7,NULL),(14,'CUST-00007','ACC','Mr TQ','','','','Vaniyambadi','Tamil Nadu','India','Active','domestic','inr','','','635751','','','15','','','2026-10-11 06:43:59','2026-10-11 06:43:59',NULL,NULL,NULL,7,NULL,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finish_types`
--

LOCK TABLES `finish_types` WRITE;
/*!40000 ALTER TABLE `finish_types` DISABLE KEYS */;
INSERT INTO `finish_types` VALUES (1,'SEMI-ANILINE','Semi Aniline','Breathable finish with slight pigment coating','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(2,'FULL-GRAIN','Full Grain','Natural finish preserving grain','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(3,'NAPPA','Nappa','Soft smooth finish','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(4,'SUEDE','Suede','Brushed napped finish','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(5,'NUBUCK','Nubuck','Buffed grain surface','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(6,'PULL-UP','Pull-Up','Waxed finish that lightens when stretched','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(7,'PATENT','Patent','High gloss finish','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(8,'CORRECTED','Corrected Grain','Buffed and corrected surface','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(9,'CRUST','Crust','Unfinished leather','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(10,'GLAZED','Glazed','Polished glossy finish','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(12,'FT-00NaN','Softy','','Active','2026-09-01 15:36:00','2026-09-01 15:36:00',7,NULL,NULL),(13,'FT-00001','sheep upper','','Active','2026-09-25 12:21:18','2026-09-25 12:22:37',16,16,NULL),(14,'FT-00002','Munjaro','','Active','2026-10-11 06:35:09','2026-10-11 06:35:09',7,NULL,NULL);
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
  KEY `idx_gch_plan_stage` (`production_plan_id`,`process_stage`),
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
INSERT INTO `grades` VALUES (1,'A','A Grade - Premium',1,'Highest quality, no defects','Active','2026-07-05 14:29:54','2026-07-05 14:29:54',NULL,NULL,NULL),(2,'B','B Grade - Standard',2,'Good quality, minor natural marks','Active','2026-07-05 14:29:54','2026-07-05 14:29:54',NULL,NULL,NULL),(3,'C','C Grade - Economy',3,'Functional quality with visible marks','Active','2026-07-05 14:29:54','2026-07-05 14:29:54',NULL,NULL,NULL),(4,'REJECT','Reject Grade',4,'Below standard quality','Active','2026-07-05 14:29:54','2026-07-05 14:29:54',NULL,NULL,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leather_types`
--

LOCK TABLES `leather_types` WRITE;
/*!40000 ALTER TABLE `leather_types` DISABLE KEYS */;
INSERT INTO `leather_types` VALUES (1,'COW','Cow ','Leather made from cow hides','Active','2026-07-05 14:29:03','2026-09-05 07:40:59',NULL,7,NULL),(2,'BUFFALO','Buffalo ','Leather made from buffalo hides','Active','2026-07-05 14:29:03','2026-09-05 07:40:51',NULL,7,NULL),(3,'GOAT','Goat ','Leather made from goat skins','Active','2026-07-05 14:29:03','2026-09-05 07:40:45',NULL,7,NULL),(4,'SHEEP','Sheep ','Leather made from sheep skins','Active','2026-07-05 14:29:03','2026-09-05 07:40:38',NULL,7,NULL),(5,'CALF','Calf ','Leather made from calf hides','Active','2026-07-05 14:29:03','2026-09-05 07:40:32',NULL,7,NULL),(7,'LT-00001','Sheep Munjaro','','Active','2026-10-11 06:39:40','2026-10-11 06:39:40',7,NULL,NULL),(8,'LT-00002','Sheep Lining','','Active','2026-10-11 06:44:42','2026-10-11 06:44:42',7,NULL,NULL);
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
  KEY `idx_mch_plan_stage` (`production_plan_id`,`process_stage`),
  CONSTRAINT `fk_mch_ps_order` FOREIGN KEY (`production_plan_id`) REFERENCES `production_status_orders` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `machine_cost_headers`
--

LOCK TABLES `machine_cost_headers` WRITE;
/*!40000 ALTER TABLE `machine_cost_headers` DISABLE KEYS */;
INSERT INTO `machine_cost_headers` VALUES (7,'MC-2026-09-0001',20,'2026-09-28',0.00,'Finishing',37993.00,10.8500,10.8500,'Posted',NULL,7,7,'2026-09-28 09:57:00','2026-09-28 10:01:03'),(8,'MC-2026-09-0002',21,'2026-09-29',0.00,'Wet End',27698.00,11.0900,11.0900,'Pending',NULL,16,16,'2026-09-29 12:35:00','2026-09-30 06:44:06'),(9,'MC-2026-10-0001',46,'2026-10-22',3.00,'Finishing',36748.50,12249.5000,12249.5000,'Pending',NULL,16,16,'2026-10-22 12:25:56','2026-10-22 13:27:34');
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
) ENGINE=InnoDB AUTO_INCREMENT=130 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `machine_cost_items`
--

LOCK TABLES `machine_cost_items` WRITE;
/*!40000 ALTER TABLE `machine_cost_items` DISABLE KEYS */;
INSERT INTO `machine_cost_items` VALUES (33,7,'Sammying IND',14,'Wet End Machines','Piece',607.000,3.3000,2003.10,0.5700,NULL,1,'2026-09-28 10:00:44','2026-09-28 10:00:44'),(34,7,'Shaving IND',14,'Wet End Machines','Piece',607.000,2.5000,1517.50,0.4300,NULL,2,'2026-09-28 10:00:44','2026-09-28 10:00:44'),(35,7,'TCP',14,'Wet End Machines','Piece',607.000,1.7500,1062.25,0.3000,NULL,3,'2026-09-28 10:00:44','2026-09-28 10:00:44'),(36,7,'Medium Drum',14,'Wet End Machines','Sq.Ft.',10.000,825.0000,8250.00,2.3600,NULL,4,'2026-09-28 10:00:44','2026-09-28 10:00:44'),(37,7,'Setting IND',14,'Wet End Machines','Piece',607.000,2.2500,1365.75,0.3900,NULL,5,'2026-09-28 10:00:44','2026-09-28 10:00:44'),(38,7,'Hooking IND',14,'Wet End Machines','Piece',607.000,1.2500,758.75,0.2200,NULL,6,'2026-09-28 10:00:44','2026-09-28 10:00:44'),(39,7,'Molissa Staking',14,'Wet End Machines','Piece',607.000,1.7500,1062.25,0.3000,NULL,7,'2026-09-28 10:00:44','2026-09-28 10:00:44'),(40,7,'Buffing',14,'Wet End Machines','Piece',607.000,2.0000,1214.00,0.3500,NULL,8,'2026-09-28 10:00:44','2026-09-28 10:00:44'),(41,7,'Dust-Off',14,'Wet End Machines','Piece',607.000,0.6000,364.20,0.1000,NULL,9,'2026-09-28 10:00:44','2026-09-28 10:00:44'),(42,7,'Auto Spray',15,'Finishing Machines','Piece',12747.000,1.0000,12747.00,3.6400,NULL,10,'2026-09-28 10:00:44','2026-09-28 10:00:44'),(43,7,'Padding ',15,'Finishing Machines','Piece',1821.000,1.2000,2185.20,0.6200,NULL,11,'2026-09-28 10:00:44','2026-09-28 10:00:44'),(44,7,'Plating IND',15,'Finishing Machines','Piece',1214.000,2.5000,3035.00,0.8700,NULL,12,'2026-09-28 10:00:44','2026-09-28 10:00:44'),(45,7,'Measuring Stamper',15,'Finishing Machines','Piece',607.000,2.0000,1214.00,0.3500,NULL,13,'2026-09-28 10:00:44','2026-09-28 10:00:44'),(46,7,'WCM',14,'Wet End Machines','Piece',1214.000,1.0000,1214.00,0.3500,NULL,14,'2026-09-28 10:00:44','2026-09-28 10:00:44'),(62,8,'Sammying IND',14,'Wet End Machines','Piece',520.000,3.3000,1716.00,0.6900,NULL,1,'2026-09-30 06:44:06','2026-09-30 06:44:06'),(63,8,'Shaving IMP',14,'Wet End Machines','Piece',520.000,3.5000,1820.00,0.7300,NULL,2,'2026-09-30 06:44:06','2026-09-30 06:44:06'),(64,8,'TCP',14,'Wet End Machines','Piece',520.000,1.7500,910.00,0.3600,NULL,3,'2026-09-30 06:44:06','2026-09-30 06:44:06'),(65,8,'Medium Drum',14,'Wet End Machines','Sq.Ft.',10.000,825.0000,8250.00,3.3000,NULL,4,'2026-09-30 06:44:06','2026-09-30 06:44:06'),(66,8,'Setting IND',14,'Wet End Machines','Piece',520.000,2.2500,1170.00,0.4700,NULL,5,'2026-09-30 06:44:06','2026-09-30 06:44:06'),(67,8,'Hooking IND',14,'Wet End Machines','Piece',520.000,1.2500,650.00,0.2600,NULL,6,'2026-09-30 06:44:06','2026-09-30 06:44:06'),(68,8,'Molissa Staking',14,'Wet End Machines','Piece',520.000,1.7500,910.00,0.3600,NULL,7,'2026-09-30 06:44:06','2026-09-30 06:44:06'),(69,8,'Buffing',14,'Wet End Machines','Piece',520.000,2.0000,1040.00,0.4200,NULL,8,'2026-09-30 06:44:06','2026-09-30 06:44:06'),(70,8,'Dust-Off',14,'Wet End Machines','Piece',520.000,0.6000,312.00,0.1200,NULL,9,'2026-09-30 06:44:06','2026-09-30 06:44:06'),(71,8,'Auto Spray',15,'Finishing Machines','Piece',6240.000,1.0000,6240.00,2.5000,NULL,10,'2026-09-30 06:44:06','2026-09-30 06:44:06'),(72,8,'Plating IND',15,'Finishing Machines','Piece',1040.000,2.5000,2600.00,1.0400,NULL,11,'2026-09-30 06:44:06','2026-09-30 06:44:06'),(73,8,'Measuring Stamper',15,'Finishing Machines','Piece',520.000,2.0000,1040.00,0.4200,NULL,12,'2026-09-30 06:44:06','2026-09-30 06:44:06'),(74,8,'WCM',14,'Wet End Machines','Piece',1040.000,1.0000,1040.00,0.4200,NULL,13,'2026-09-30 06:44:06','2026-09-30 06:44:06'),(116,9,'Sammying IMP',14,'Wet End Machines','Piece',422.000,5.0000,2110.00,703.3300,NULL,1,'2026-10-22 13:27:34','2026-10-22 13:27:34'),(117,9,'Dry Shaving IMP',14,'Wet End Machines','Piece',422.000,3.0000,1266.00,422.0000,NULL,2,'2026-10-22 13:27:34','2026-10-22 13:27:34'),(118,9,'Big Drum',14,'Wet End Machines','Piece',9.000,1650.0000,14850.00,4950.0000,NULL,3,'2026-10-22 13:27:34','2026-10-22 13:27:34'),(119,9,'Setting IMP',14,'Wet End Machines','Piece',422.000,3.3000,1392.60,464.2000,NULL,4,'2026-10-22 13:27:34','2026-10-22 13:27:34'),(120,9,'Hooking IMP',14,'Wet End Machines','Piece',422.000,1.6500,696.30,232.1000,NULL,5,'2026-10-22 13:27:34','2026-10-22 13:27:34'),(121,9,'Molissa Staking',14,'Wet End Machines','Piece',422.000,1.7500,738.50,246.1700,NULL,6,'2026-10-22 13:27:34','2026-10-22 13:27:34'),(122,9,'Dry Setting IND',14,'Wet End Machines','Piece',422.000,2.2500,949.50,316.5000,NULL,7,'2026-10-22 13:27:34','2026-10-22 13:27:34'),(123,9,'Dry Buffing/dust off',14,'Wet End Machines','Piece',422.000,2.6000,1097.20,365.7300,NULL,8,'2026-10-22 13:27:34','2026-10-22 13:27:34'),(124,9,'Trimming + v cut pisar',15,'Finishing Machines','Piece',422.000,1.7500,738.50,246.1700,NULL,9,'2026-10-22 13:27:34','2026-10-22 13:27:34'),(125,9,'Auto Spray',15,'Finishing Machines','Piece',8500.000,1.0000,8500.00,2833.3300,NULL,10,'2026-10-22 13:27:34','2026-10-22 13:27:34'),(126,9,'Roller Plating',15,'Finishing Machines','Piece',844.000,3.5000,2954.00,984.6700,NULL,11,'2026-10-22 13:27:34','2026-10-22 13:27:34'),(127,9,'Padding ',15,'Finishing Machines','Piece',422.000,1.2000,506.40,168.8000,NULL,12,'2026-10-22 13:27:34','2026-10-22 13:27:34'),(128,9,'Measuring IMP',15,'Finishing Machines','Piece',422.000,1.2500,527.50,175.8300,NULL,13,'2026-10-22 13:27:34','2026-10-22 13:27:34'),(129,9,'WCM',14,'Wet End Machines','Piece',422.002,1.0000,422.00,140.6700,NULL,14,'2026-10-22 13:27:34','2026-10-22 13:27:34');
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
  `uom_type` enum('Per Hour','Per Pcs') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=22426 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_issue_items`
--

LOCK TABLES `material_issue_items` WRITE;
/*!40000 ALTER TABLE `material_issue_items` DISABLE KEYS */;
INSERT INTO `material_issue_items` VALUES (194,20,123,'Kg',0.000,0.800,177.0000,1770.00,NULL,'2026-09-28 09:49:38'),(195,20,118,'Kg',0.000,15.000,150.0000,2250.00,NULL,'2026-09-28 09:49:38'),(196,20,123,'Kg',0.000,10.000,177.0000,1770.00,NULL,'2026-09-28 09:49:38'),(197,20,121,'Kg',0.000,5.000,150.0000,750.00,NULL,'2026-09-28 09:49:38'),(198,20,170,'Kg',0.000,5.000,244.0000,1220.00,NULL,'2026-09-28 09:49:38'),(199,20,120,'Kg',0.000,5.000,667.0000,1250.63,NULL,'2026-09-28 09:49:38'),(200,20,125,'Kg',0.000,2.000,929.0000,696.75,NULL,'2026-09-28 09:49:38'),(201,20,182,'Kg',0.000,16.000,711.0000,11376.00,NULL,'2026-09-28 09:49:38'),(202,20,158,'Kg',0.000,0.120,5204.0000,624.48,NULL,'2026-09-28 09:49:38'),(203,20,173,'Kg',0.000,1.875,811.0000,1520.63,NULL,'2026-09-28 09:49:38'),(204,20,120,'Kg',0.000,1.875,667.0000,1250.63,NULL,'2026-09-28 09:49:38'),(205,20,172,'Kg',0.000,2.250,381.0000,857.25,NULL,'2026-09-28 09:49:38'),(206,20,167,'Kg',0.000,1.050,675.0000,708.75,NULL,'2026-09-28 09:49:38'),(207,20,125,'Kg',0.000,0.750,929.0000,696.75,NULL,'2026-09-28 09:49:38'),(208,20,126,'Kg',0.000,0.300,1564.0000,469.20,NULL,'2026-09-28 09:49:38'),(242,19,9,'Kg',0.000,1.750,272.0000,476.00,NULL,'2026-09-28 10:51:15'),(243,19,10,'Kg',0.000,1.750,143.9716,143.97,NULL,'2026-09-28 10:51:15'),(244,19,52,'Kg',0.000,5.500,139.5602,767.58,NULL,'2026-09-28 10:51:15'),(245,19,51,'Kg',0.000,7.500,128.0567,960.43,NULL,'2026-09-28 10:51:15'),(246,19,44,'Kg',0.000,8.500,307.0000,2609.50,NULL,'2026-09-28 10:51:15'),(247,19,33,'Kg',0.000,3.000,269.4737,808.42,NULL,'2026-09-28 10:51:15'),(248,19,47,'Kg',0.000,4.000,58.6002,234.40,NULL,'2026-09-28 10:51:15'),(249,19,49,'Kg',0.000,1.700,53.5182,53.52,NULL,'2026-09-28 10:51:15'),(250,19,29,'Kg',0.000,7.500,200.5810,1504.36,NULL,'2026-09-28 10:51:15'),(251,19,50,'Kg',0.000,4.000,141.1667,564.67,NULL,'2026-09-28 10:51:15'),(252,19,49,'Kg',0.000,1.000,53.5182,53.52,NULL,'2026-09-28 10:51:15'),(253,19,30,'Kg',0.000,10.500,206.9565,2173.04,NULL,'2026-09-28 10:51:15'),(254,19,31,'Kg',0.000,7.500,177.4468,1330.85,NULL,'2026-09-28 10:51:15'),(255,19,43,'Kg',0.000,12.500,230.0000,2875.00,NULL,'2026-09-28 10:51:15'),(256,19,56,'Kg',0.000,7.500,178.4071,1338.05,NULL,'2026-09-28 10:51:15'),(257,19,61,'Kg',0.000,6.500,185.0000,1202.50,NULL,'2026-09-28 10:51:15'),(258,19,45,'Kg',0.000,12.500,169.0000,2112.50,NULL,'2026-09-28 10:51:15'),(259,19,40,'Kg',0.000,3.500,699.9545,2449.84,NULL,'2026-09-28 10:51:15'),(260,19,42,'Kg',0.000,9.500,171.3268,1627.60,NULL,'2026-09-28 10:51:15'),(261,19,69,'Kg',0.000,5.500,330.0000,330.00,NULL,'2026-09-28 10:51:15'),(262,19,182,'Kg',0.000,2.600,711.0000,1848.60,NULL,'2026-09-28 10:51:15'),(263,19,35,'Kg',0.000,7.500,346.0000,2595.00,NULL,'2026-09-28 10:51:15'),(264,19,116,'Kg',0.000,7.500,416.8750,3126.56,NULL,'2026-09-28 10:51:15'),(265,19,32,'Kg',0.000,4.000,317.4803,1269.92,NULL,'2026-09-28 10:51:15'),(266,19,115,'Kg',0.000,4.000,173.4000,693.60,NULL,'2026-09-28 10:51:15'),(267,19,114,'Kg',0.000,3.500,273.0000,682.50,NULL,'2026-09-28 10:51:15'),(268,19,10,'Kg',0.000,0.750,143.9716,143.97,NULL,'2026-09-28 10:51:15'),(269,19,29,'Kg',0.000,7.500,200.5810,1504.36,NULL,'2026-09-28 10:51:15'),(270,19,69,'Kg',0.000,1.000,330.0000,330.00,NULL,'2026-09-28 10:51:15'),(271,19,66,'Kg',0.000,3.250,125.0000,406.25,NULL,'2026-09-28 10:51:15'),(272,19,114,'Kg',0.000,2.500,273.0000,682.50,NULL,'2026-09-28 10:51:15'),(273,19,10,'Kg',0.000,1.000,143.9716,143.97,NULL,'2026-09-28 10:51:15'),(274,19,15,'Kg',0.000,3.000,287.0000,861.00,NULL,'2026-09-28 10:51:15'),(12711,21,9,'Kg',0.000,1.750,272.0000,476.00,NULL,'2026-10-11 06:30:17'),(12712,21,10,'Kg',0.000,1.750,140.0000,245.00,NULL,'2026-10-11 06:30:17'),(12713,21,106,'Kg',0.000,3.100,679.7800,2107.32,NULL,'2026-10-11 06:30:17'),(12714,21,209,'Kilogram',0.000,2.500,80.0000,200.00,NULL,'2026-10-11 06:30:17'),(12715,21,51,'Kg',0.000,3.500,117.0000,409.50,NULL,'2026-10-11 06:30:17'),(12716,21,52,'Kg',0.000,8.500,112.0000,952.00,NULL,'2026-10-11 06:30:17'),(12717,21,44,'Kg',0.000,8.500,307.0000,2609.50,NULL,'2026-10-11 06:30:17'),(12718,21,33,'Kg',0.000,3.500,256.0000,896.00,NULL,'2026-10-11 06:30:17'),(12719,21,47,'Kg',0.000,3.500,55.0000,192.50,NULL,'2026-10-11 06:30:17'),(12720,21,49,'Kg',0.000,1.700,50.0000,85.00,NULL,'2026-10-11 06:30:17'),(12721,21,29,'Kg',0.000,7.000,187.0000,1309.00,NULL,'2026-10-11 06:30:17'),(12722,21,49,'Kg',0.000,0.900,50.0000,45.00,NULL,'2026-10-11 06:30:17'),(12723,21,30,'Kg',0.000,9.500,170.0000,1615.00,NULL,'2026-10-11 06:30:17'),(12724,21,31,'Kg',0.000,6.500,139.0000,903.50,NULL,'2026-10-11 06:30:17'),(12725,21,46,'Kg',0.000,1.500,185.0000,277.50,NULL,'2026-10-11 06:30:17'),(12726,21,56,'Kg',0.000,6.500,160.0000,1040.00,NULL,'2026-10-11 06:30:17'),(12727,21,41,'Kg',0.000,6.600,216.0000,1425.60,NULL,'2026-10-11 06:30:17'),(12728,21,42,'Kg',0.000,9.500,148.0000,1406.00,NULL,'2026-10-11 06:30:17'),(12729,21,40,'Kg',0.000,3.500,177.0000,619.50,NULL,'2026-10-11 06:30:17'),(12730,21,106,'Kg',0.000,5.900,679.7800,4010.70,NULL,'2026-10-11 06:30:17'),(12731,21,35,'Kg',0.000,6.500,346.0000,2249.00,NULL,'2026-10-11 06:30:17'),(12732,21,11,'Kg',0.000,3.500,187.0000,654.50,NULL,'2026-10-11 06:30:17'),(12733,21,116,'Kg',0.000,3.500,345.0000,1207.50,NULL,'2026-10-11 06:30:17'),(12734,21,32,'Kg',0.000,3.500,288.0000,1008.00,NULL,'2026-10-11 06:30:17'),(12735,21,115,'Kg',0.000,3.500,153.0000,535.50,NULL,'2026-10-11 06:30:17'),(12736,21,29,'Kg',0.000,5.500,187.0000,1028.50,NULL,'2026-10-11 06:30:17'),(12737,21,209,'Kilogram',0.000,9.500,80.0000,760.00,NULL,'2026-10-11 06:30:17'),(12738,21,43,'Kg',0.000,1.750,230.0000,402.50,NULL,'2026-10-11 06:30:17'),(12739,21,106,'Kg',0.000,1.100,679.7800,747.76,NULL,'2026-10-11 06:30:17'),(12740,21,35,'Kg',0.000,0.750,346.0000,259.50,NULL,'2026-10-11 06:30:17'),(12741,21,32,'Kg',0.000,0.750,288.0000,216.00,NULL,'2026-10-11 06:30:17'),(12742,21,209,'Kilogram',0.000,4.000,80.0000,320.00,NULL,'2026-10-11 06:30:17'),(12743,21,50,'Kg',0.000,4.000,121.0000,484.00,NULL,'2026-10-11 06:30:17'),(12744,21,43,'Kg',0.000,9.500,230.0000,2185.00,NULL,'2026-10-11 06:30:17'),(12745,21,71,'Kg',0.000,6.500,308.0000,2002.00,NULL,'2026-10-11 06:30:17'),(12746,21,10,'Kg',0.000,0.750,140.0000,105.00,NULL,'2026-10-11 06:30:17'),(12747,21,210,'Kilogram',0.000,3.000,379.0000,1137.00,NULL,'2026-10-11 06:30:17'),(15829,25,107,'Kg',0.000,3.050,0.0000,0.00,NULL,'2026-10-11 06:58:50'),(15830,25,108,'Kg',0.000,3.050,0.0000,0.00,NULL,'2026-10-11 06:58:50'),(15831,25,115,'Kg',0.000,4.500,0.0000,0.00,NULL,'2026-10-11 06:58:50'),(15832,25,209,'Kg',0.000,5.000,0.0000,0.00,NULL,'2026-10-11 06:58:50'),(15833,25,210,'Kg',0.000,4.000,379.0000,1516.00,NULL,'2026-10-11 06:58:50'),(15834,25,52,'Kg',0.000,23.500,0.0000,0.00,NULL,'2026-10-11 06:58:50'),(15835,25,51,'Kg',0.000,5.500,0.0000,0.00,NULL,'2026-10-11 06:58:50'),(15836,25,46,'Kg',0.000,5.500,0.0000,0.00,NULL,'2026-10-11 06:58:50'),(15837,25,33,'Kg',0.000,6.500,0.0000,0.00,NULL,'2026-10-11 06:58:50'),(15838,25,47,'Kg',0.000,6.500,0.0000,0.00,NULL,'2026-10-11 06:58:50'),(15839,25,49,'Kg',0.000,2.000,0.0000,0.00,NULL,'2026-10-11 06:58:50'),(15840,25,29,'Kg',0.000,6.500,0.0000,0.00,NULL,'2026-10-11 06:58:50'),(15841,25,50,'Kg',0.000,6.500,0.0000,0.00,NULL,'2026-10-11 06:58:50'),(15842,25,49,'Kg',0.000,6.500,0.0000,0.00,NULL,'2026-10-11 06:58:50'),(15843,25,30,'Kg',0.000,12.500,0.0000,0.00,NULL,'2026-10-11 06:58:50'),(15844,25,31,'Kg',0.000,6.500,0.0000,0.00,NULL,'2026-10-11 06:58:50'),(15845,25,46,'Kg',0.000,6.500,0.0000,0.00,NULL,'2026-10-11 06:58:50'),(15846,25,56,'Kg',0.000,6.500,0.0000,0.00,NULL,'2026-10-11 06:58:50'),(15847,25,42,'Kg',0.000,6.500,0.0000,0.00,NULL,'2026-10-11 06:58:50'),(15848,25,40,'Kg',0.000,6.500,0.0000,0.00,NULL,'2026-10-11 06:58:50'),(15849,25,54,'Kg',0.000,3.750,0.0000,0.00,NULL,'2026-10-11 06:58:50'),(15850,25,107,'Kg',0.000,7.000,0.0000,0.00,NULL,'2026-10-11 06:58:50'),(15851,25,108,'Kg',0.000,7.100,0.0000,0.00,NULL,'2026-10-11 06:58:50'),(15852,25,34,'Kg',0.000,12.500,0.0000,0.00,NULL,'2026-10-11 06:58:50'),(15853,25,116,'Kg',0.000,12.500,0.0000,0.00,NULL,'2026-10-11 06:58:50'),(15854,25,38,'Kg',0.000,12.500,0.0000,0.00,NULL,'2026-10-11 06:58:50'),(15855,25,8,'Kg',0.000,12.500,0.0000,0.00,NULL,'2026-10-11 06:58:50'),(15856,25,37,'Kg',0.000,7.500,0.0000,0.00,NULL,'2026-10-11 06:58:50'),(15857,25,39,'Kg',0.000,7.500,0.0000,0.00,NULL,'2026-10-11 06:58:50'),(15858,25,115,'Kg',0.000,6.500,0.0000,0.00,NULL,'2026-10-11 06:58:50'),(15859,25,32,'Kg',0.000,6.500,0.0000,0.00,NULL,'2026-10-11 06:58:50'),(15860,25,36,'Kg',0.000,1.350,0.0000,0.00,NULL,'2026-10-11 06:58:50'),(15861,25,10,'Kg',0.000,2.500,0.0000,0.00,NULL,'2026-10-11 06:58:50'),(15862,25,209,'Kg',0.000,13.500,0.0000,0.00,NULL,'2026-10-11 06:58:50'),(15863,25,46,'Kg',0.000,2.250,0.0000,0.00,NULL,'2026-10-11 06:58:50'),(15864,25,107,'Kg',0.000,2.100,0.0000,0.00,NULL,'2026-10-11 06:58:50'),(15865,25,108,'Kg',0.000,2.100,0.0000,0.00,NULL,'2026-10-11 06:58:50'),(15866,25,38,'Kg',0.000,3.000,0.0000,0.00,NULL,'2026-10-11 06:58:50'),(15867,25,37,'Kg',0.000,3.000,0.0000,0.00,NULL,'2026-10-11 06:58:50'),(15868,25,10,'Kg',0.000,1.500,0.0000,0.00,NULL,'2026-10-11 06:58:50'),(15869,25,209,'Kg',0.000,4.500,0.0000,0.00,NULL,'2026-10-11 06:58:50'),(15970,26,9,'Kg',0.000,14.500,272.0000,3944.00,NULL,'2026-10-11 07:09:25'),(15971,26,10,'Kg',0.000,4.500,143.9716,647.87,NULL,'2026-10-11 07:09:25'),(15972,26,9,'Kg',0.000,14.500,272.0000,3944.00,NULL,'2026-10-11 07:09:25'),(15973,26,10,'Kg',0.000,4.500,143.9716,647.87,NULL,'2026-10-11 07:09:25'),(15974,26,233,'Kg',0.000,30.000,10.0000,300.00,NULL,'2026-10-11 07:09:25'),(16497,27,123,'Kg',0.000,1.800,177.0000,637.20,NULL,'2026-10-11 07:19:40'),(16498,27,171,'Kg',0.000,1.800,184.0000,331.20,NULL,'2026-10-11 07:19:40'),(16499,27,226,'Kg',0.000,18.000,199.0000,3582.00,NULL,'2026-10-11 07:19:40'),(16500,27,120,'Kg',0.000,4.800,667.0000,3201.60,NULL,'2026-10-11 07:19:40'),(16501,27,178,'Kg',0.000,4.800,192.0133,921.66,NULL,'2026-10-11 07:19:40'),(16502,27,123,'Kg',0.000,3.600,177.0000,637.20,NULL,'2026-10-11 07:19:40'),(16503,27,139,'Kg',0.000,3.600,675.0000,2430.00,NULL,'2026-10-11 07:19:40'),(16504,27,119,'Kg',0.000,3.600,267.0000,961.20,NULL,'2026-10-11 07:19:40'),(16505,27,125,'Kg',0.000,1.200,929.0000,1114.80,NULL,'2026-10-11 07:19:40'),(16506,27,192,'Kg',0.000,7.200,276.0000,1987.20,NULL,'2026-10-11 07:19:40'),(16507,27,147,'Kg',0.000,5.200,360.0000,1872.00,NULL,'2026-10-11 07:19:40'),(16508,27,216,'Kg',0.000,1.700,603.0000,1025.10,NULL,'2026-10-11 07:19:40'),(16509,27,218,'Kg',0.000,0.085,499.5000,199.80,NULL,'2026-10-11 07:19:40'),(16510,27,219,'Kg',0.000,0.800,371.0000,296.80,NULL,'2026-10-11 07:19:40'),(16511,27,217,'Kg',0.000,0.400,794.0000,317.60,NULL,'2026-10-11 07:19:40'),(16512,27,218,'Kg',0.000,0.400,499.5000,199.80,NULL,'2026-10-11 07:19:40'),(16582,28,211,'Piece',0.000,545.000,71.1872,38797.05,NULL,'2026-10-14 13:39:46'),(16595,24,227,'Kg',0.000,120.000,150.0000,18000.00,NULL,'2026-10-15 11:31:28'),(17604,23,9,'Kg',0.000,1.750,272.0000,476.00,NULL,'2026-10-16 13:01:58'),(17605,23,10,'Kg',0.000,1.750,143.9716,43.19,NULL,'2026-10-16 13:01:58'),(17606,23,209,'Kg',0.000,2.500,87.3371,174.67,NULL,'2026-10-16 13:01:58'),(17607,23,46,'Kg',0.000,9.500,280.0000,2660.00,NULL,'2026-10-16 13:01:58'),(17608,23,33,'Kg',0.000,4.000,269.4737,1077.89,NULL,'2026-10-16 13:01:58'),(17609,23,47,'Kg',0.000,4.000,58.6002,234.40,NULL,'2026-10-16 13:01:58'),(17610,23,47,'Kg',0.000,4.000,58.6002,234.40,NULL,'2026-10-16 13:01:58'),(17611,23,49,'Kg',0.000,1.800,53.5182,42.81,NULL,'2026-10-16 13:01:58'),(17612,23,29,'Kg',0.000,6.500,76.8292,460.98,NULL,'2026-10-16 13:01:58'),(17613,23,50,'Kg',0.000,3.750,141.1667,529.38,NULL,'2026-10-16 13:01:58'),(17614,23,49,'Kg',0.000,0.800,53.5182,42.81,NULL,'2026-10-16 13:01:58'),(17615,23,30,'Kg',0.000,11.000,54.9546,604.50,NULL,'2026-10-16 13:01:58'),(17616,23,31,'Kg',0.000,12.000,144.3030,1731.64,NULL,'2026-10-16 13:01:58'),(17617,23,234,'Kg',0.000,6.000,148.0000,888.00,NULL,'2026-10-16 13:01:58'),(17618,23,62,'Kg',0.000,9.000,145.0000,1305.00,NULL,'2026-10-16 13:01:58'),(17619,23,235,'Kg',0.000,9.600,195.0000,1872.00,NULL,'2026-10-16 13:01:58'),(17620,23,41,'Kg',0.000,10.750,216.0000,2322.00,NULL,'2026-10-16 13:01:58'),(17621,23,42,'Kg',0.000,9.250,35.6761,330.00,NULL,'2026-10-16 13:01:58'),(17622,23,40,'Kg',0.000,2.200,0.0000,0.00,NULL,'2026-10-16 13:01:58'),(17623,23,48,'Kg',0.000,4.000,176.0000,52.80,NULL,'2026-10-16 13:01:58'),(17624,23,231,'Kg',0.000,2.500,1030.4100,309.12,NULL,'2026-10-16 13:01:58'),(17625,23,88,'Kg',0.000,0.200,520.4800,104.10,NULL,'2026-10-16 13:01:58'),(17626,23,16,'Kg',0.000,3.000,262.0000,786.00,NULL,'2026-10-16 13:01:58'),(17627,23,35,'Kg',0.000,3.250,107.3793,80.53,NULL,'2026-10-16 13:01:58'),(17628,23,11,'Kg',0.000,6.500,187.0000,1215.50,NULL,'2026-10-16 13:01:58'),(17629,23,32,'Kg',0.000,3.500,317.4803,95.24,NULL,'2026-10-16 13:01:58'),(17630,23,115,'Kg',0.000,3.500,173.4000,606.90,NULL,'2026-10-16 13:01:58'),(17631,23,10,'Kg',0.000,1.000,143.9716,43.19,NULL,'2026-10-16 13:01:58'),(17632,23,29,'Kg',0.000,6.000,76.8292,460.98,NULL,'2026-10-16 13:01:58'),(17633,23,48,'Kg',0.000,0.300,176.0000,52.80,NULL,'2026-10-16 13:01:58'),(17634,23,231,'Kg',0.000,0.300,1030.4100,309.12,NULL,'2026-10-16 13:01:58'),(17635,23,35,'Kg',0.000,0.750,107.3793,80.53,NULL,'2026-10-16 13:01:58'),(17636,23,32,'Kg',0.000,0.300,317.4803,95.24,NULL,'2026-10-16 13:01:58'),(17637,23,10,'Kg',0.000,0.300,143.9716,43.19,NULL,'2026-10-16 13:01:58'),(17638,23,209,'Kg',0.000,2.000,87.3371,174.67,NULL,'2026-10-16 13:01:58'),(18633,29,123,'Kg',0.000,1.000,177.0000,1770.00,NULL,'2026-10-16 13:21:09'),(18634,29,171,'Kg',0.000,1.000,184.0000,184.00,NULL,'2026-10-16 13:21:09'),(18635,29,118,'Kg',0.000,10.000,150.0000,1500.00,NULL,'2026-10-16 13:21:09'),(18636,29,123,'Kg',0.000,10.000,177.0000,1770.00,NULL,'2026-10-16 13:21:09'),(18637,29,227,'Kg',0.000,5.000,150.0000,750.00,NULL,'2026-10-16 13:21:09'),(18638,29,121,'Kg',0.000,5.000,150.0000,750.00,NULL,'2026-10-16 13:21:09'),(18639,29,178,'Kg',0.000,5.000,192.0133,960.07,NULL,'2026-10-16 13:21:09'),(18640,29,125,'Kg',0.000,2.000,667.4940,534.00,NULL,'2026-10-16 13:21:09'),(18641,29,182,'Kg',0.000,6.750,711.0000,4799.25,NULL,'2026-10-16 13:21:09'),(18642,29,190,'Kg',0.000,3.950,493.0000,1947.35,NULL,'2026-10-16 13:21:09'),(18643,29,181,'Kg',0.000,0.600,0.0000,0.00,NULL,'2026-10-16 13:21:09'),(18644,29,236,'Kg',0.000,0.780,602.0000,469.56,NULL,'2026-10-16 13:21:09'),(18645,29,237,'Kg',0.000,1.000,504.0000,504.00,NULL,'2026-10-16 13:21:09'),(18646,29,184,'Kg',0.000,0.800,1098.0000,878.40,NULL,'2026-10-16 13:21:09'),(18647,29,103,'Kg',0.000,0.090,0.0000,0.00,NULL,'2026-10-16 13:21:09'),(18648,29,76,'Kg',0.000,0.080,847.0900,67.77,NULL,'2026-10-16 13:21:09'),(18649,29,196,'Kg',0.000,0.010,1469.0000,14.69,NULL,'2026-10-16 13:21:09'),(18650,29,156,'Kg',0.000,4.500,475.0000,2137.50,NULL,'2026-10-16 13:21:09'),(18651,29,157,'Kg',0.000,4.500,377.0000,1696.50,NULL,'2026-10-16 13:21:09'),(18652,29,125,'Kg',0.000,0.360,667.4940,534.00,NULL,'2026-10-16 13:21:09'),(18653,29,125,'Kg',0.000,0.800,667.4940,534.00,NULL,'2026-10-16 13:21:09'),(22332,30,9,'Kg',0.000,1.500,272.0000,408.00,NULL,'2026-10-22 16:40:00'),(22333,30,10,'Kg',0.000,1.500,140.0000,210.00,NULL,'2026-10-22 16:40:00'),(22334,30,209,'Kg',0.000,1.800,86.0000,154.80,NULL,'2026-10-22 16:40:00'),(22335,30,52,'Kg',0.000,11.500,112.0000,1288.00,NULL,'2026-10-22 16:40:00'),(22336,30,46,'Kg',0.000,8.500,185.0000,1572.50,NULL,'2026-10-22 16:40:00'),(22337,30,33,'Kg',0.000,3.500,256.0000,896.00,NULL,'2026-10-22 16:40:00'),(22338,30,47,'Kg',0.000,3.500,55.0000,192.50,NULL,'2026-10-22 16:40:00'),(22339,30,49,'Kg',0.000,1.500,50.0000,75.00,NULL,'2026-10-22 16:40:00'),(22340,30,29,'Kg',0.000,6.000,187.0000,1122.00,NULL,'2026-10-22 16:40:00'),(22341,30,50,'Kg',0.000,3.250,121.0000,393.25,NULL,'2026-10-22 16:40:00'),(22342,30,49,'Kg',0.000,0.700,50.0000,35.00,NULL,'2026-10-22 16:40:00'),(22343,30,30,'Kg',0.000,8.500,153.0000,1300.50,NULL,'2026-10-22 16:40:00'),(22344,30,31,'Kg',0.000,10.500,139.0000,1459.50,NULL,'2026-10-22 16:40:00'),(22345,30,62,'Kg',0.000,5.500,145.0000,797.50,NULL,'2026-10-22 16:40:00'),(22346,30,12,'Kg',0.000,3.000,124.0000,372.00,NULL,'2026-10-22 16:40:00'),(22347,30,41,'Kg',0.000,5.750,216.0000,1242.00,NULL,'2026-10-22 16:40:00'),(22348,30,42,'Kg',0.000,5.500,148.0000,814.00,NULL,'2026-10-22 16:40:00'),(22349,30,48,'Kg',0.000,3.000,176.0000,528.00,NULL,'2026-10-22 16:40:00'),(22350,30,109,'Kg',0.000,1.300,544.5100,707.86,NULL,'2026-10-22 16:40:00'),(22351,30,97,'Kg',0.000,0.300,479.6200,143.89,NULL,'2026-10-22 16:40:00'),(22352,30,88,'Kg',0.000,0.010,520.4800,5.20,NULL,'2026-10-22 16:40:00'),(22353,30,16,'Kg',0.000,1.500,262.0000,393.00,NULL,'2026-10-22 16:40:00'),(22354,30,35,'Kg',0.000,4.500,346.0000,1557.00,NULL,'2026-10-22 16:40:00'),(22355,30,32,'Kg',0.000,3.000,288.0000,864.00,NULL,'2026-10-22 16:40:00'),(22356,30,11,'Kg',0.000,6.000,187.0000,1122.00,NULL,'2026-10-22 16:40:00'),(22357,30,115,'Kg',0.000,3.000,173.4000,520.20,NULL,'2026-10-22 16:40:00'),(22358,30,10,'Kg',0.000,0.700,140.0000,98.00,NULL,'2026-10-22 16:40:00'),(22359,30,29,'Kg',0.000,5.500,187.0000,1028.50,NULL,'2026-10-22 16:40:00'),(22360,30,209,'Kg',0.000,6.500,80.0000,520.00,NULL,'2026-10-22 16:40:00'),(22361,30,46,'Kg',0.000,2.750,185.0000,508.75,NULL,'2026-10-22 16:40:00'),(22362,30,35,'Kg',0.000,0.750,346.0000,259.50,NULL,'2026-10-22 16:40:00'),(22363,30,209,'Kg',0.000,1.000,86.0000,86.00,NULL,'2026-10-22 16:40:00'),(22410,32,210,'Kg',0.000,8.000,379.0000,3032.00,NULL,'2026-10-23 06:22:07'),(22411,31,123,'Kg',0.000,0.800,177.0000,141.60,NULL,'2026-10-23 13:36:28'),(22412,31,118,'Kg',0.000,15.000,150.0000,2250.00,NULL,'2026-10-23 13:36:28'),(22413,31,123,'Kg',0.000,10.000,177.0000,1770.00,NULL,'2026-10-23 13:36:28'),(22414,31,121,'Kg',0.000,5.000,150.0000,750.00,NULL,'2026-10-23 13:36:28'),(22415,31,170,'Kg',0.000,5.000,244.0000,1220.00,NULL,'2026-10-23 13:36:28'),(22416,31,120,'Kg',0.000,5.000,667.0000,3335.00,NULL,'2026-10-23 13:36:28'),(22417,31,125,'Kg',0.000,2.000,929.0000,1858.00,NULL,'2026-10-23 13:36:28'),(22418,31,182,'Kg',0.000,16.000,711.0000,11376.00,NULL,'2026-10-23 13:36:28'),(22419,31,158,'Kg',0.000,0.120,5204.0000,624.48,NULL,'2026-10-23 13:36:28'),(22420,31,173,'Kg',0.000,1.875,811.0000,1520.63,NULL,'2026-10-23 13:36:28'),(22421,31,120,'Kg',0.000,1.875,667.0000,1250.63,NULL,'2026-10-23 13:36:28'),(22422,31,172,'Kg',0.000,2.250,381.0000,857.25,NULL,'2026-10-23 13:36:28'),(22423,31,167,'Kg',0.000,1.050,675.0000,708.75,NULL,'2026-10-23 13:36:28'),(22424,31,125,'Kg',0.000,0.750,929.0000,696.75,NULL,'2026-10-23 13:36:28'),(22425,31,126,'Kg',0.000,0.300,1564.0000,469.20,NULL,'2026-10-23 13:36:28');
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
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `issue_no` (`issue_no`),
  KEY `idx_mi_warehouse` (`warehouse_id`),
  KEY `idx_mi_status` (`status`),
  KEY `idx_mi_deleted_at` (`deleted_at`),
  KEY `idx_mi_batch_stage` (`production_batch`,`process_stage`),
  CONSTRAINT `fk_mi_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_issues`
--

LOCK TABLES `material_issues` WRITE;
/*!40000 ALTER TABLE `material_issues` DISABLE KEYS */;
INSERT INTO `material_issues` VALUES (19,'ISS-2026-00002','2026-09-28','Production',NULL,'PRP-000001','Wet End','Sheep  Full Grain White','White',3500.000,'Piece','Sheep  Full Grain White','FIFO',8,'2026-09-28','2026-09-28',NULL,0.00,0.00,37903.98,37903.98,NULL,'Posted',7,7,'2026-09-28 09:22:40','2026-10-23 13:24:39',NULL),(20,'ISS-2026-00003','2026-09-28','Production',NULL,'PRP-000001','Wet End','Sheep  Full Grain White','White',3500.000,'Piece','Sheep  Full Grain White','FIFO',8,'2026-09-28','2026-09-28',NULL,0.00,0.00,27211.07,27211.07,NULL,'Posted',7,7,'2026-09-28 09:48:16','2026-10-08 11:03:43',NULL),(21,'ISS-2026-00004','2026-09-28','Production',NULL,'PRP-000001','Measurement','Sheep  Full Grain White','White',3500.000,'Square Feet','Sheep  Full Grain White','FIFO',8,'2026-09-28','2026-09-28',NULL,0.00,0.00,36126.38,36126.38,NULL,'Draft',16,16,'2026-09-28 11:25:19','2026-10-11 05:28:02',NULL),(23,'ISS-2026-00005','2026-10-08','Production',NULL,'PRP-000005','Wet End','Sheep Lining','Beige ',625.000,'Piece','Sheep Lining','FIFO',8,'2026-10-05','2026-10-16',NULL,0.00,0.00,19539.58,19539.58,NULL,'Posted',16,16,'2026-10-08 12:45:01','2026-10-23 13:24:40',NULL),(24,'ISS-2026-00006','2026-10-09','Production',NULL,'PRP-000001','Measurement','Sheep  Full Grain White','White',3500.000,'Square Feet','Sheep  Full Grain White','FIFO',8,'2026-09-28','2026-09-28',NULL,0.00,0.00,18000.00,18000.00,NULL,'Draft',16,16,'2026-10-09 10:35:15','2026-10-15 11:25:23',NULL),(25,'ISS-2026-00007','2026-09-24','Production',NULL,'PRP-000003','Finishing','Sheep  Softy Black','Black',0.000,'Pcs','Sheep  Softy Black','FIFO',8,'2026-09-28','2026-10-05',NULL,0.00,0.00,1516.00,1516.00,NULL,'Posted',16,16,'2026-10-09 10:54:56','2026-10-23 13:24:40',NULL),(26,'ISS-2026-00008','2026-10-11','Production',NULL,'PRP-000003','Wet End','Sheep  Softy Black','Black',0.000,'Pcs','Sheep  Softy Black','FIFO',8,'2026-10-05','2026-10-05',NULL,0.00,0.00,9483.74,9483.74,NULL,'Posted',16,16,'2026-10-11 07:04:12','2026-10-11 07:09:25',NULL),(27,'ISS-2026-00009','2026-10-11','Production',NULL,'PRP-000003','Finishing','Sheep  Softy Black','Black',0.000,'Pcs','Sheep  Softy Black','FIFO',8,'2026-10-05','2026-10-05',NULL,0.00,0.00,19715.16,19715.16,NULL,'Posted',16,16,'2026-10-11 07:10:56','2026-10-23 13:24:40',NULL),(28,'ISS-2026-00010','2026-10-14','Production',NULL,'PRP-000004','Wet End','Sheep Lining','Beige ',545.000,'Piece','Sheep Lining','FIFO',7,'2026-10-14','2026-10-14',NULL,0.00,0.00,38797.05,38797.05,NULL,'Posted',7,7,'2026-10-14 13:34:33','2026-10-14 13:39:46',NULL),(29,'ISS-2026-00011','2026-10-16','Production',NULL,'PRP-000005','Finishing','Sheep Lining','Beige ',625.000,'Piece','Sheep Lining','FIFO',8,'2026-10-05','2026-10-05',NULL,0.00,0.00,21801.09,21801.09,NULL,'Posted',16,16,'2026-10-16 13:05:42','2026-10-23 13:24:39',NULL),(30,'ISS-2026-00012','2026-09-26','Production',NULL,'PRP-000008','Wet End','Sheep Lining','Ice',472.000,'Piece','Sheep Lining','FIFO',8,'2026-10-17','2025-09-26',NULL,0.00,0.00,20674.45,20674.45,NULL,'Draft',16,7,'2026-10-21 11:17:07','2026-10-22 16:40:00',NULL),(31,'ISS-2026-00013','2026-09-26','Production',NULL,'PRP-000001','Wet End','Sheep  Full Grain White','White',3500.000,'Piece','Sheep  Full Grain White','FIFO',8,'2026-09-26','2026-09-26',NULL,0.00,0.00,28828.29,28828.29,NULL,'Draft',7,7,'2026-10-22 17:08:10','2026-10-23 13:36:28',NULL),(32,'ISS-2026-00014','2026-10-22',NULL,NULL,NULL,NULL,NULL,NULL,0.000,NULL,NULL,'FIFO',8,NULL,NULL,NULL,0.00,0.00,3032.00,3032.00,NULL,'Draft',7,7,'2026-10-23 06:22:05','2026-10-23 06:54:09','2026-10-23 06:54:09');
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
  `manufacture_date` date DEFAULT NULL,
  `shelf_life_months` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_mritem_receipt` (`receipt_id`),
  KEY `idx_mritem_material` (`material_id`),
  CONSTRAINT `fk_mritem_material` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`),
  CONSTRAINT `fk_mritem_receipt` FOREIGN KEY (`receipt_id`) REFERENCES `material_receipts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2352 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_receipt_items`
--

LOCK TABLES `material_receipt_items` WRITE;
/*!40000 ALTER TABLE `material_receipt_items` DISABLE KEYS */;
INSERT INTO `material_receipt_items` VALUES (32,12,211,'Piece','Piece','Square Feet',607.0000,3141.0000,'INR',1.000000,0.0000,232.6500,0.0000,141218.5500,0.000,607.000,0.0000,141218.55,NULL,NULL,NULL,NULL,'2026-09-28 08:39:44'),(2097,47,126,'Kg','Kg',NULL,5.0000,0.0000,'INR',1.000000,0.0000,1564.0000,0.0000,7820.0000,0.000,5.000,0.0000,7820.00,NULL,NULL,NULL,NULL,'2026-10-08 12:27:27'),(2105,39,192,'Kg','Kg',NULL,30.0000,0.0000,'INR',1.000000,0.0000,276.0000,0.0000,8280.0000,0.000,30.000,0.0000,8280.00,NULL,NULL,NULL,NULL,'2026-10-08 12:31:07'),(2106,39,171,'Kg','Kg',NULL,30.0000,0.0000,'INR',1.000000,0.0000,184.0000,0.0000,5520.0000,0.000,30.000,0.0000,5520.00,NULL,NULL,NULL,NULL,'2026-10-08 12:31:07'),(2107,39,46,'Kg','Kg',NULL,50.0000,0.0000,'INR',1.000000,0.0000,171.0000,0.0000,8550.0000,0.000,50.000,0.0000,8550.00,NULL,NULL,NULL,NULL,'2026-10-08 12:31:07'),(2108,39,226,'Kg','Kg',NULL,120.0000,0.0000,'INR',1.000000,0.0000,199.0000,0.0000,23880.0000,0.000,120.000,0.0000,23880.00,NULL,NULL,NULL,NULL,'2026-10-08 12:31:07'),(2110,40,50,'Kg','Kg',NULL,60.0000,0.0000,'INR',1.000000,0.0000,121.0000,0.0000,7260.0000,0.000,60.000,0.0000,7260.00,NULL,NULL,NULL,NULL,'2026-10-08 12:31:44'),(2115,41,172,'Kg','Kg',NULL,30.0000,0.0000,'INR',1.000000,0.0000,381.0000,0.0000,11430.0000,0.000,30.000,0.0000,11430.00,NULL,NULL,NULL,NULL,'2026-10-08 12:31:56'),(2116,41,173,'Kg','Kg',NULL,30.0000,0.0000,'INR',1.000000,0.0000,811.0000,0.0000,24330.0000,0.000,30.000,0.0000,24330.00,NULL,NULL,NULL,NULL,'2026-10-08 12:31:56'),(2117,41,167,'Kg','Kg',NULL,10.0000,0.0000,'INR',1.000000,0.0000,675.0000,0.0000,6750.0000,0.000,10.000,0.0000,6750.00,NULL,NULL,NULL,NULL,'2026-10-08 12:31:56'),(2118,41,158,'Kg','Kg',NULL,1.0000,0.0000,'INR',1.000000,0.0000,5204.0000,0.0000,5204.0000,0.000,1.000,0.0000,5204.00,NULL,NULL,NULL,NULL,'2026-10-08 12:31:56'),(2122,42,118,'Kg','Kg',NULL,120.0000,0.0000,'INR',1.000000,0.0000,150.0000,0.0000,18000.0000,0.000,120.000,0.0000,18000.00,NULL,NULL,NULL,NULL,'2026-10-08 12:32:08'),(2123,42,227,'Kg','Kg',NULL,120.0000,0.0000,'INR',1.000000,0.0000,150.0000,0.0000,18000.0000,0.000,120.000,0.0000,18000.00,NULL,NULL,NULL,NULL,'2026-10-08 12:32:08'),(2124,42,121,'Kg','Kg',NULL,120.0000,0.0000,'INR',1.000000,0.0000,150.0000,0.0000,18000.0000,0.000,120.000,0.0000,18000.00,NULL,NULL,NULL,NULL,'2026-10-08 12:32:08'),(2127,43,178,'Kg','Kg',NULL,120.0000,0.0000,'INR',1.000000,0.0000,191.0000,0.0000,22920.0000,0.000,120.000,0.0000,22920.00,NULL,NULL,NULL,NULL,'2026-10-08 12:32:21'),(2128,43,228,'Kg','Kg',NULL,5.0000,0.0000,'INR',1.000000,0.0000,261.0000,0.0000,1305.0000,0.000,5.000,0.0000,1305.00,NULL,NULL,NULL,NULL,'2026-10-08 12:32:21'),(2136,44,120,'Kg','Kg',NULL,30.0000,0.0000,'INR',1.000000,0.0000,667.0000,0.0000,20010.0000,0.000,30.000,0.0000,20010.00,NULL,NULL,NULL,NULL,'2026-10-08 12:32:49'),(2137,44,125,'Kg','Kg',NULL,20.0000,0.0000,'INR',1.000000,0.0000,929.0000,0.0000,18580.0000,0.000,20.000,0.0000,18580.00,NULL,NULL,NULL,NULL,'2026-10-08 12:32:49'),(2138,44,190,'Kg','Kg',NULL,10.0000,0.0000,'INR',1.000000,0.0000,493.0000,0.0000,4930.0000,0.000,10.000,0.0000,4930.00,NULL,NULL,NULL,NULL,'2026-10-08 12:32:49'),(2139,44,183,'Kg','Kg',NULL,10.0000,0.0000,'INR',1.000000,0.0000,504.0000,0.0000,5040.0000,0.000,10.000,0.0000,5040.00,NULL,NULL,NULL,NULL,'2026-10-08 12:32:49'),(2140,44,184,'Kg','Kg',NULL,5.0000,0.0000,'INR',1.000000,0.0000,1098.0000,0.0000,5490.0000,0.000,5.000,0.0000,5490.00,NULL,NULL,NULL,NULL,'2026-10-08 12:32:49'),(2141,44,185,'Kg','Kg',NULL,3.0000,0.0000,'INR',1.000000,0.0000,753.0000,0.0000,2259.0000,0.000,3.000,0.0000,2259.00,NULL,NULL,NULL,NULL,'2026-10-08 12:32:49'),(2142,44,229,'Kg','Kg',NULL,5.0000,0.0000,'INR',1.000000,0.0000,960.0000,0.0000,4800.0000,0.000,5.000,0.0000,4800.00,NULL,NULL,NULL,NULL,'2026-10-08 12:32:49'),(2144,45,230,'Kg','Kg',NULL,500.0000,0.0000,'INR',1.000000,0.0000,105.2500,0.0000,52625.0000,0.000,500.000,0.0000,52625.00,NULL,NULL,NULL,NULL,'2026-10-08 12:34:02'),(2163,14,213,'Kilogram','Kilogram',NULL,2.0000,0.0000,'INR',1.000000,0.0000,786.9600,0.0000,1573.9200,0.000,2.000,0.0000,1573.92,NULL,NULL,NULL,NULL,'2026-10-08 12:34:13'),(2164,14,85,'Kg','Kg',NULL,2.0000,0.0000,'INR',1.000000,0.0000,808.0000,0.0000,1616.0000,0.000,2.000,0.0000,1616.00,NULL,NULL,NULL,NULL,'2026-10-08 12:34:13'),(2165,14,31,'Kg','Kg',NULL,100.0000,0.0000,'INR',1.000000,0.0000,139.0000,0.0000,13900.0000,0.000,100.000,0.0000,13900.00,NULL,NULL,NULL,NULL,'2026-10-08 12:34:13'),(2166,14,182,'Kg','Kg',NULL,100.0000,0.0000,'INR',1.000000,0.0000,711.0000,0.0000,71100.0000,0.000,100.000,0.0000,71100.00,NULL,NULL,NULL,NULL,'2026-10-08 12:34:13'),(2167,14,173,'Kg','Kg',NULL,30.0000,0.0000,'INR',1.000000,0.0000,811.0000,0.0000,24330.0000,0.000,30.000,0.0000,24330.00,NULL,NULL,NULL,NULL,'2026-10-08 12:34:13'),(2168,14,172,'Kg','Kg',NULL,30.0000,0.0000,'INR',1.000000,0.0000,381.0000,0.0000,11430.0000,0.000,30.000,0.0000,11430.00,NULL,NULL,NULL,NULL,'2026-10-08 12:34:13'),(2169,14,158,'Kg','Kg',NULL,1.0000,0.0000,'INR',1.000000,0.0000,5204.0000,0.0000,5204.0000,0.000,1.000,0.0000,5204.00,NULL,NULL,NULL,NULL,'2026-10-08 12:34:13'),(2170,14,125,'Kg','Kg',NULL,10.0000,0.0000,'INR',1.000000,0.0000,929.0000,0.0000,9290.0000,0.000,10.000,0.0000,9290.00,NULL,NULL,NULL,NULL,'2026-10-08 12:34:13'),(2171,14,167,'Kg','Kg',NULL,10.0000,0.0000,'INR',1.000000,0.0000,675.0000,0.0000,6750.0000,0.000,10.000,0.0000,6750.00,NULL,NULL,NULL,NULL,'2026-10-08 12:34:13'),(2172,14,126,'Kg','Kg',NULL,5.0000,0.0000,'INR',1.000000,0.0000,1564.0000,0.0000,7820.0000,0.000,5.000,0.0000,7820.00,NULL,NULL,NULL,NULL,'2026-10-08 12:34:13'),(2173,14,107,'Kg','Kg',NULL,25.0000,0.0000,'INR',1.000000,0.0000,540.0000,0.0000,13500.0000,0.000,25.000,0.0000,13500.00,NULL,NULL,NULL,NULL,'2026-10-08 12:34:13'),(2174,14,108,'Kg','Kg',NULL,25.0000,0.0000,'INR',1.000000,0.0000,450.0000,0.0000,11250.0000,0.000,25.000,0.0000,11250.00,NULL,NULL,NULL,NULL,'2026-10-08 12:34:13'),(2175,14,214,'Kilogram','Kilogram',NULL,1.0000,0.0000,'INR',1.000000,0.0000,663.0000,0.0000,663.0000,0.000,1.000,0.0000,663.00,NULL,NULL,NULL,NULL,'2026-10-08 12:34:13'),(2176,14,178,'Kg','Kg',NULL,30.0000,0.0000,'INR',1.000000,0.0000,196.0000,0.0000,5880.0000,0.000,30.000,0.0000,5880.00,NULL,NULL,NULL,NULL,'2026-10-08 12:34:13'),(2177,14,123,'Kg','Kg',NULL,120.0000,0.0000,'INR',1.000000,0.0000,177.0000,0.0000,21240.0000,0.000,120.000,0.0000,21240.00,NULL,NULL,NULL,NULL,'2026-10-08 12:34:13'),(2178,14,209,'Kilogram','Kilogram','Kilogram',350.0000,0.0000,'INR',1.000000,0.0000,86.0000,0.0000,30100.0000,0.000,350.000,0.0000,30100.00,NULL,NULL,NULL,NULL,'2026-10-08 12:34:13'),(2179,14,209,'Kilogram','Kilogram','Kilogram',210.0000,0.0000,'INR',1.000000,0.0000,80.0000,0.0000,16800.0000,0.000,210.000,0.0000,16800.00,NULL,NULL,NULL,NULL,'2026-10-08 12:34:13'),(2180,14,213,'Kilogram','Kilogram',NULL,10.0000,0.0000,'INR',1.000000,0.0000,0.0000,0.0000,0.0000,0.000,10.000,0.0000,0.00,NULL,NULL,NULL,NULL,'2026-10-08 12:34:13'),(2185,36,120,'Kg','Kg',NULL,30.0000,0.0000,'INR',1.000000,0.0000,667.0000,0.0000,16008.0000,0.000,30.000,0.0000,16008.00,NULL,NULL,NULL,NULL,'2026-10-08 12:34:30'),(2186,36,125,'Kg','Kg',NULL,10.0000,0.0000,'INR',1.000000,0.0000,929.0000,0.0000,7432.0000,0.000,10.000,0.0000,7432.00,NULL,NULL,NULL,NULL,'2026-10-08 12:34:30'),(2187,36,139,'Kg','Kg',NULL,10.0000,0.0000,'INR',1.000000,0.0000,675.0000,0.0000,5400.0000,0.000,10.000,0.0000,5400.00,NULL,NULL,NULL,NULL,'2026-10-08 12:34:30'),(2188,36,168,'Kg','Kg',NULL,10.0000,0.0000,'INR',1.000000,0.0000,405.0000,0.0000,3240.0000,0.000,10.000,0.0000,3240.00,NULL,NULL,NULL,NULL,'2026-10-08 12:34:30'),(2195,35,220,'Kg','Kg',NULL,1.0000,0.0000,'INR',1.000000,0.0000,364.0000,0.0000,364.0000,0.000,1.000,0.0000,364.00,NULL,NULL,NULL,NULL,'2026-10-08 12:34:38'),(2196,35,221,'Kg','Kg',NULL,1.0000,0.0000,'INR',1.000000,0.0000,710.0000,0.0000,710.0000,0.000,1.000,0.0000,710.00,NULL,NULL,NULL,NULL,'2026-10-08 12:34:38'),(2197,35,222,'Kg','Kg',NULL,1.0000,0.0000,'INR',1.000000,0.0000,507.0000,0.0000,507.0000,0.000,1.000,0.0000,507.00,NULL,NULL,NULL,NULL,'2026-10-08 12:34:38'),(2198,35,223,'Kg','Kg',NULL,1.0000,0.0000,'INR',1.000000,0.0000,725.0000,0.0000,725.0000,0.000,1.000,0.0000,725.00,NULL,NULL,NULL,NULL,'2026-10-08 12:34:38'),(2199,35,224,'Kg','Kg',NULL,1.0000,0.0000,'INR',1.000000,0.0000,518.0000,0.0000,518.0000,0.000,1.000,0.0000,518.00,NULL,NULL,NULL,NULL,'2026-10-08 12:34:38'),(2200,35,225,'Kg','Kg',NULL,1.0000,0.0000,'INR',1.000000,0.0000,497.0000,0.0000,497.0000,0.000,1.000,0.0000,497.00,NULL,NULL,NULL,NULL,'2026-10-08 12:34:38'),(2202,38,119,'Kg','Kg',NULL,10.0000,0.0000,'INR',1.000000,0.0000,267.0000,0.0000,2269.5000,0.000,10.000,0.0000,2269.50,NULL,NULL,NULL,NULL,'2026-10-08 12:34:51'),(2208,17,215,'Kilogram','Kilogram',NULL,10.0000,0.0000,'INR',1.000000,0.0000,479.0000,0.0000,4071.5000,0.000,10.000,0.0000,4071.50,NULL,NULL,NULL,NULL,'2026-10-08 12:35:01'),(2209,17,216,'Kg','Kg',NULL,5.0000,0.0000,'INR',1.000000,0.0000,603.0000,0.0000,3015.0000,0.000,5.000,0.0000,3015.00,NULL,NULL,NULL,NULL,'2026-10-08 12:35:01'),(2210,17,217,'Kg','Kg',NULL,2.0000,0.0000,'INR',1.000000,0.0000,794.0000,0.0000,1588.0000,0.000,2.000,0.0000,1588.00,NULL,NULL,NULL,NULL,'2026-10-08 12:35:01'),(2211,17,218,'Kg','Kg',NULL,2.0000,0.0000,'INR',1.000000,0.0000,628.0000,0.0000,1256.0000,0.000,2.000,0.0000,1256.00,NULL,NULL,NULL,NULL,'2026-10-08 12:35:01'),(2212,17,219,'Kg','Kg',NULL,3.0000,0.0000,'INR',1.000000,0.0000,371.0000,0.0000,1113.0000,0.000,3.000,0.0000,1113.00,NULL,NULL,NULL,NULL,'2026-10-08 12:35:01'),(2217,48,72,'Kg','Kg',NULL,5.0000,0.0000,'INR',1.000000,0.0000,249.0000,0.0000,1245.0000,0.000,5.000,0.0000,1245.00,NULL,NULL,NULL,NULL,'2026-10-09 12:42:18'),(2231,49,156,'Kg','Kg',NULL,10.0000,0.0000,'INR',1.000000,0.0000,475.0000,0.0000,4750.0000,0.000,10.000,0.0000,4750.00,NULL,NULL,NULL,NULL,'2026-10-09 12:44:22'),(2232,49,157,'Kg','Kg',NULL,10.0000,0.0000,'INR',1.000000,0.0000,377.0000,0.0000,3770.0000,0.000,10.000,0.0000,3770.00,NULL,NULL,NULL,NULL,'2026-10-09 12:44:22'),(2272,50,147,'Kg','Kg',NULL,5.0000,0.0000,'INR',1.000000,0.0000,432.0000,0.0000,2160.0000,0.000,5.000,0.0000,2160.00,NULL,NULL,NULL,NULL,'2026-10-09 13:30:13'),(2273,50,216,'Kg','Kg',NULL,2.0000,0.0000,'INR',1.000000,0.0000,603.0000,0.0000,1206.0000,0.000,2.000,0.0000,1206.00,NULL,NULL,NULL,NULL,'2026-10-09 13:30:13'),(2274,50,218,'Kg','Kg',NULL,2.0000,0.0000,'INR',1.000000,0.0000,371.0000,0.0000,742.0000,0.000,2.000,0.0000,742.00,NULL,NULL,NULL,NULL,'2026-10-09 13:30:13'),(2275,50,217,'Kg','Kg',NULL,2.0000,0.0000,'INR',1.000000,0.0000,794.0000,0.0000,1588.0000,0.000,2.000,0.0000,1588.00,NULL,NULL,NULL,NULL,'2026-10-09 13:30:13'),(2315,51,182,'Kg','Kg',NULL,50.0000,0.0000,'INR',1.000000,0.0000,711.0000,0.0000,35550.0000,0.000,50.000,0.0000,35550.00,NULL,NULL,NULL,NULL,'2026-10-09 13:33:15'),(2316,51,124,'Kg','Kg',NULL,50.0000,0.0000,'INR',1.000000,0.0000,314.0000,0.0000,15700.0000,0.000,50.000,0.0000,15700.00,NULL,NULL,NULL,NULL,'2026-10-09 13:33:15'),(2317,51,139,'Kg','Kg',NULL,30.0000,0.0000,'INR',1.000000,0.0000,675.0000,0.0000,20250.0000,0.000,30.000,0.0000,20250.00,NULL,NULL,NULL,NULL,'2026-10-09 13:33:15'),(2318,51,120,'Kg','Kg',NULL,30.0000,0.0000,'INR',1.000000,0.0000,667.0000,0.0000,20010.0000,0.000,30.000,0.0000,20010.00,NULL,NULL,NULL,NULL,'2026-10-09 13:33:15'),(2323,52,41,'Kg','Kg',NULL,50.0000,0.0000,'INR',1.000000,0.0000,216.0000,0.0000,10800.0000,0.000,50.000,0.0000,10800.00,NULL,NULL,NULL,NULL,'2026-10-09 13:34:38'),(2328,53,232,'Kg','Kg',NULL,2.0000,0.0000,'INR',1.000000,0.0000,1035.0000,0.0000,2070.0000,0.000,2.000,0.0000,2070.00,NULL,NULL,NULL,NULL,'2026-10-09 13:41:56'),(2335,54,211,'Piece','Piece','Square Feet',2077.0000,8151.0000,'INR',1.000000,0.0000,24.0000,0.0000,49848.0000,0.000,2077.000,0.0000,49848.00,NULL,NULL,NULL,NULL,'2026-10-14 13:32:31'),(2338,46,231,'Kg','Kg',NULL,5.0000,0.0000,'INR',1.000000,0.0000,1030.4100,0.0000,5152.0500,0.000,5.000,0.0000,5152.05,NULL,NULL,NULL,NULL,'2026-10-20 11:50:39'),(2339,46,214,'Kg','Kg',NULL,1.0000,0.0000,'INR',1.000000,0.0000,667.7400,0.0000,667.7400,0.000,1.000,0.0000,667.74,NULL,NULL,NULL,NULL,'2026-10-20 11:50:39'),(2341,37,106,'Kg','Kg',NULL,30.0000,0.0000,'INR',1.000000,0.0000,276.0000,0.0000,7038.0000,0.000,30.000,0.0000,7038.00,NULL,NULL,NULL,NULL,'2026-10-20 11:50:49'),(2346,55,234,'Kg','Kg',NULL,10.0000,0.0000,'INR',1.000000,0.0000,148.0000,0.0000,1480.0000,0.000,10.000,0.0000,1480.00,NULL,NULL,NULL,NULL,'2026-10-22 11:12:40'),(2351,56,209,'Kg','Kg',NULL,10.0000,0.0000,'INR',1.000000,0.0000,80.0000,0.0000,800.0000,0.000,10.000,0.0000,800.00,NULL,NULL,NULL,NULL,'2026-10-23 13:39:40');
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
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_receipts`
--

LOCK TABLES `material_receipts` WRITE;
/*!40000 ALTER TABLE `material_receipts` DISABLE KEYS */;
INSERT INTO `material_receipts` VALUES (12,'GRN-2026-00001','2026-09-28','Physical Stock',14,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,7,0.00,0.00,0.00,5.00,0.0000,0.0000,7060.9275,7060.9275,'IGST',0.0000,141218.55,148279.48,NULL,'Posted',7,7,'2026-09-28 08:39:40','2026-09-28 08:39:44'),(14,'GRN-2026-00002','2026-09-28','Physical Stock',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,8,0.00,0.00,0.00,0.00,0.0000,0.0000,0.0000,0.0000,'IGST',0.0000,252446.92,252446.92,NULL,'Posted',16,16,'2026-09-28 12:37:43','2026-10-08 12:34:13'),(17,'GRN-2026-00003','2026-09-26','Physical Stock',16,NULL,NULL,'PFC/26-27/1832','2026-09-26',NULL,NULL,NULL,NULL,8,440.00,0.00,0.00,0.00,0.0000,0.0000,0.0000,0.0000,'IGST',440.0000,11043.50,11483.50,NULL,'Posted',12,16,'2026-09-30 12:05:47','2026-10-08 12:35:01'),(35,'GRN-2026-00004','2026-09-25','Physical Stock',24,NULL,NULL,'2210/26-27','2026-09-25',NULL,NULL,NULL,NULL,8,0.00,0.00,0.22,0.00,0.0000,0.0000,0.0000,0.0000,'IGST',0.2200,3321.00,3321.22,NULL,'Posted',16,16,'2026-10-05 10:42:41','2026-10-08 12:34:38'),(36,'GRN-2026-00005','2026-09-28','Physical Stock',21,NULL,NULL,'1760/26-27','2026-09-26',NULL,NULL,NULL,NULL,8,0.00,0.00,-0.40,0.00,0.0000,0.0000,0.0000,0.0000,'IGST',-0.4000,32080.00,32079.60,NULL,'Posted',16,16,'2026-10-05 11:34:08','2026-10-08 12:34:30'),(37,'GRN-2026-00006','2026-09-26','Physical Stock',16,NULL,NULL,'PFC/26-27/1830','2026-06-26',NULL,NULL,NULL,NULL,8,0.00,0.00,0.16,0.00,0.0000,0.0000,0.0000,0.0000,'IGST',0.1600,7038.00,7038.16,NULL,'Posted',16,16,'2026-10-05 11:39:07','2026-10-20 11:50:49'),(38,'GRN-2026-00007','2026-09-27','Physical Stock',16,NULL,NULL,'PFC/26-27-1845','2026-09-28',NULL,NULL,NULL,NULL,8,0.00,0.00,-0.01,0.00,0.0000,0.0000,0.0000,0.0000,'IGST',-0.0100,2269.50,2269.49,NULL,'Posted',16,16,'2026-10-05 11:41:23','2026-10-08 12:34:51'),(39,'GRN-2026-00008','2026-10-05','Physical Stock',16,NULL,NULL,'PFC/26-27/1893','2026-10-05',NULL,NULL,NULL,NULL,7,0.00,0.00,0.00,0.00,0.0000,0.0000,0.0000,0.0000,'IGST',0.0000,46230.00,46230.00,NULL,'Posted',16,16,'2026-10-06 10:35:18','2026-10-08 12:31:07'),(40,'GRN-2026-00009','2026-10-05','Physical Stock',6,NULL,NULL,'VS-993/26-27','2026-10-05',NULL,NULL,NULL,NULL,7,0.00,0.00,0.00,0.00,0.0000,0.0000,0.0000,0.0000,'IGST',0.0000,7260.00,7260.00,NULL,'Posted',16,16,'2026-10-06 10:41:00','2026-10-08 12:31:44'),(41,'GRN-2026-00010','2026-10-03','Physical Stock',21,NULL,NULL,'1798/26-27','2026-10-03',NULL,NULL,NULL,NULL,8,0.00,0.00,0.00,0.00,0.0000,0.0000,0.0000,0.0000,'IGST',0.0000,47714.00,47714.00,NULL,'Posted',16,16,'2026-10-06 10:42:54','2026-10-08 12:31:56'),(42,'GRN-2026-00011','2026-10-01','Physical Stock',6,NULL,NULL,'VS-990/26-27','2026-10-01',NULL,NULL,NULL,NULL,7,0.00,0.00,0.00,0.00,0.0000,0.0000,0.0000,0.0000,'IGST',0.0000,54000.00,54000.00,NULL,'Posted',16,16,'2026-10-06 10:45:42','2026-10-08 12:32:08'),(43,'GRN-2026-00012','2026-10-01','Physical Stock',16,NULL,NULL,'PFC/26-27/1874','2026-10-01',NULL,NULL,NULL,NULL,8,0.00,0.00,0.00,0.00,0.0000,0.0000,0.0000,0.0000,'IGST',0.0000,24225.00,24225.00,NULL,'Posted',16,16,'2026-10-06 10:50:06','2026-10-08 12:32:21'),(44,'GRN-2026-00013','2026-10-01','Physical Stock',21,NULL,NULL,'1789/26-27','2026-10-01',NULL,NULL,NULL,NULL,8,0.00,0.00,0.00,0.00,0.0000,0.0000,0.0000,0.0000,'IGST',0.0000,61109.00,61109.00,NULL,'Posted',16,16,'2026-10-06 11:01:23','2026-10-08 12:32:49'),(45,'GRN-2026-00014','2026-09-30','Physical Stock',28,NULL,NULL,'129',NULL,NULL,NULL,NULL,NULL,8,0.00,0.00,0.00,0.00,0.0000,0.0000,0.0000,0.0000,'CGST_SGST',0.0000,52625.00,52625.00,NULL,'Posted',16,16,'2026-10-06 11:12:01','2026-10-08 12:34:02'),(46,'GRN-2026-00015','2026-09-26','Physical Stock',19,NULL,NULL,'1011','2026-09-26',NULL,NULL,NULL,NULL,8,0.00,0.00,0.00,0.00,0.0000,0.0000,0.0000,0.0000,'IGST',0.0000,5819.79,5819.79,NULL,'Posted',16,16,'2026-10-06 11:17:10','2026-10-20 11:50:39'),(47,'GRN-2026-00016','2026-10-05','Physical Stock',6,NULL,NULL,'vs-994/26-27','2026-10-05',NULL,NULL,NULL,NULL,7,0.00,0.00,0.00,0.00,0.0000,0.0000,0.0000,0.0000,'IGST',0.0000,7820.00,7820.00,NULL,'Posted',16,16,'2026-10-06 11:22:48','2026-10-08 12:27:27'),(48,'GRN-2026-00017','2026-10-08','Physical Stock',6,NULL,NULL,'VS-1025/26-27','2026-10-08',NULL,NULL,NULL,NULL,8,0.00,0.00,0.00,0.00,0.0000,0.0000,0.0000,0.0000,'IGST',0.0000,1245.00,1245.00,NULL,'Posted',16,16,'2026-10-09 12:41:40','2026-10-09 12:42:18'),(49,'GRN-2026-00018','2026-10-07','Physical Stock',6,NULL,NULL,'VS-1017-26-27','2026-10-07',NULL,NULL,NULL,NULL,8,0.00,0.00,0.00,0.00,0.0000,0.0000,0.0000,0.0000,'IGST',0.0000,8520.00,8520.00,NULL,'Posted',16,16,'2026-10-09 12:43:45','2026-10-09 12:44:22'),(50,'GRN-2026-00019','2026-10-07','Physical Stock',16,NULL,NULL,'PFC/26-27/1920','2026-10-07',NULL,NULL,NULL,NULL,8,0.00,0.00,0.00,0.00,0.0000,0.0000,0.0000,0.0000,'IGST',0.0000,5696.00,5696.00,NULL,'Posted',16,16,'2026-10-09 13:28:58','2026-10-09 13:30:13'),(51,'GRN-2026-00020','2026-10-05','Physical Stock',21,NULL,NULL,'1811/26-27','2026-10-05',NULL,NULL,NULL,NULL,8,0.00,0.00,0.00,0.00,0.0000,0.0000,0.0000,0.0000,'IGST',0.0000,91510.00,91510.00,NULL,'Posted',16,16,'2026-10-09 13:32:19','2026-10-09 13:33:15'),(52,'GRN-2026-00021','2026-10-06','Physical Stock',9,NULL,NULL,'VI-183/26-27','1906-10-06',NULL,NULL,NULL,NULL,8,0.00,0.00,0.00,0.00,0.0000,0.0000,0.0000,0.0000,'IGST',0.0000,10800.00,10800.00,NULL,'Posted',16,16,'2026-10-09 13:34:29','2026-10-09 13:34:38'),(53,'GRN-2026-00022','2026-09-28','Physical Stock',29,NULL,NULL,'VAT-192','2026-09-28',NULL,NULL,NULL,NULL,8,0.00,0.00,0.00,0.00,0.0000,0.0000,0.0000,0.0000,'CGST_SGST',0.0000,2070.00,2070.00,NULL,'Posted',16,16,'2026-10-09 13:41:49','2026-10-09 13:41:56'),(54,'GRN-2026-00023','2026-10-04','Direct Purchase',14,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,7,0.00,0.00,0.00,5.00,0.0000,0.0000,2492.4000,2492.4000,'IGST',0.0000,49848.00,52340.40,NULL,'Posted',7,7,'2026-10-14 13:32:04','2026-10-14 13:32:31'),(55,'GRN-2026-00024','2026-10-22','Purchase Order',8,NULL,'2026-10-22','1234','2026-10-22',NULL,NULL,NULL,NULL,8,0.00,0.00,0.00,5.00,0.0000,0.0000,74.0000,74.0000,'IGST',0.0000,1480.00,1554.00,'for test','Posted',16,16,'2026-10-22 11:12:28','2026-10-22 11:12:40'),(56,'GRN-2026-00025','2026-10-22','Transfer',29,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,8,0.00,0.00,0.00,5.00,20.0000,20.0000,0.0000,40.0000,'CGST_SGST',0.0000,800.00,840.00,NULL,'Posted',7,7,'2026-10-23 13:39:24','2026-10-23 13:39:40');
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
  `code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `uom` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Kg',
  `primary_uom_id` int DEFAULT NULL,
  `secondary_uom_id` int DEFAULT NULL,
  `currency` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'INR',
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
) ENGINE=InnoDB AUTO_INCREMENT=250 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `materials`
--

LOCK TABLES `materials` WRITE;
/*!40000 ALTER TABLE `materials` DISABLE KEYS */;
INSERT INTO `materials` VALUES (1,'MAT-00001','Felidurm MS','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',14.70,5733.00,NULL,14.70,0.00,0.00,390.00,390.00,390.000000,6,NULL,NULL,NULL,NULL,NULL),(2,'MAT-00002','Zymo Viesol GMR 2','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'35079099',NULL,NULL,NULL,0,'AKM Chemicals',14.00,4508.00,NULL,14.00,0.00,0.00,322.00,322.00,322.000000,2,NULL,NULL,NULL,NULL,NULL),(3,'MAT-00003','Oxalic Acid','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'29171100',NULL,NULL,NULL,0,'AKM Chemicals',27.50,3437.50,NULL,27.50,0.00,0.00,125.00,125.00,125.000000,3,NULL,NULL,NULL,NULL,NULL),(4,'MAT-00004','Sodium Metabisulphite','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'28321090',NULL,NULL,NULL,0,'AKM Chemicals',11.30,904.00,NULL,11.30,0.00,0.00,80.00,80.00,80.000000,3,NULL,NULL,NULL,NULL,NULL),(5,'MAT-00005','Buzyme 7702','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'35079099',NULL,NULL,NULL,0,'AKM Chemicals',25.50,4360.50,NULL,25.50,0.00,0.00,171.00,171.00,171.000000,2,NULL,NULL,NULL,NULL,NULL),(6,'MAT-00006','UNIA R528','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',16.90,5323.50,NULL,16.90,0.00,0.00,315.00,315.00,315.000000,4,NULL,NULL,NULL,NULL,NULL),(7,'MAT-00007','Fospol LC80','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',13.70,5891.00,NULL,13.70,0.00,0.00,430.00,430.00,430.000000,4,NULL,NULL,NULL,NULL,NULL),(8,'MAT-00008','Coripol SFC','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',50.00,10200.00,NULL,50.00,0.00,0.00,204.00,204.00,204.000000,16,NULL,NULL,NULL,NULL,NULL),(9,'MAT-00009','Busperse 7794','Kg',3,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-10-15 11:42:50',NULL,'Active',NULL,16,NULL,'15',NULL,NULL,NULL,NULL,NULL,'34029090',NULL,NULL,NULL,0,'AKM Chemicals',139.80,38025.60,'Kg',139.80,0.00,0.00,272.00,272.00,272.000000,4,NULL,NULL,NULL,NULL,NULL),(10,'MAT-00010','Lipidol UW 113','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',145.00,20300.00,NULL,145.00,0.00,0.00,140.00,140.00,140.000000,15,NULL,NULL,NULL,NULL,NULL),(11,'MAT-00011','Sasyol SJB','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34029090',NULL,NULL,NULL,0,'AKM Chemicals',148.00,27676.00,NULL,148.00,0.00,0.00,187.00,187.00,187.000000,10,NULL,NULL,NULL,NULL,NULL),(12,'MAT-00012','Tanicor FTG','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',30.00,3720.00,NULL,30.00,0.00,0.00,124.00,124.00,124.000000,6,NULL,NULL,NULL,NULL,NULL),(13,'MAT-00013','Kurtalix PALIQ','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34029090',NULL,NULL,NULL,0,'AKM Chemicals',33.00,19866.00,NULL,33.00,0.00,0.00,602.00,602.00,602.000000,11,NULL,NULL,NULL,NULL,NULL),(14,'MAT-00014','Vernaminol Liquor ASN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',150.00,33300.00,NULL,150.00,0.00,0.00,222.00,222.00,222.000000,6,NULL,NULL,NULL,NULL,NULL),(15,'MAT-00015','Magnopal RHN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',9.40,2697.80,NULL,9.40,0.00,0.00,287.00,287.00,287.000000,16,NULL,NULL,NULL,NULL,NULL),(16,'MAT-00016','Vernol Liquor PN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',4.60,1205.20,NULL,4.60,0.00,0.00,262.00,262.00,262.000000,6,NULL,NULL,NULL,NULL,NULL),(17,'MAT-00017','Polyol AK','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',5.00,2875.00,NULL,5.00,0.00,0.00,575.00,575.00,575.000000,15,NULL,NULL,NULL,NULL,NULL),(18,'MAT-00018','Synthol GS 606','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',3.00,1395.00,NULL,3.00,0.00,0.00,465.00,465.00,465.000000,15,NULL,NULL,NULL,NULL,NULL),(19,'MAT-00019','Ledosol OX LIQ','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',5.50,2453.00,NULL,5.50,0.00,0.00,446.00,446.00,446.000000,11,NULL,NULL,NULL,NULL,NULL),(20,'MAT-00020','Relugan GT 50','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',85.00,32215.00,NULL,85.00,0.00,0.00,379.00,379.00,379.000000,6,NULL,NULL,NULL,NULL,NULL),(21,'MAT-00021','Veprovod VA','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',1.80,417.60,NULL,1.80,0.00,0.00,232.00,232.00,232.000000,6,NULL,NULL,NULL,NULL,NULL),(22,'MAT-00022','Tanicor MLB','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',21.30,5026.80,NULL,21.30,0.00,0.00,236.00,236.00,236.000000,6,NULL,NULL,NULL,NULL,NULL),(23,'MAT-00023','Tergotan ER','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',10.90,1885.70,NULL,10.90,0.00,0.00,173.00,173.00,173.000000,6,NULL,NULL,NULL,NULL,NULL),(24,'MAT-00024','Fospol M3 Imp','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',0.50,103.00,NULL,0.50,0.00,0.00,206.00,206.00,206.000000,4,NULL,NULL,NULL,NULL,NULL),(25,'MAT-00025','Levotan CO2','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',6.00,1926.00,NULL,6.00,0.00,0.00,321.00,321.00,321.000000,16,NULL,NULL,NULL,NULL,NULL),(26,'MAT-00026','Atlas 30 CT','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',3.00,1680.00,NULL,3.00,0.00,0.00,560.00,560.00,560.000000,18,NULL,NULL,NULL,NULL,NULL),(27,'MAT-00027','Sasyol CSK','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',2.50,590.00,NULL,2.50,0.00,0.00,236.00,236.00,236.000000,10,NULL,NULL,NULL,NULL,NULL),(28,'MAT-00028','Tergotan ESN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',2.40,542.40,NULL,2.40,0.00,0.00,226.00,226.00,226.000000,6,NULL,NULL,NULL,NULL,NULL),(29,'MAT-00029','Butan 7822','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',96.00,17952.00,NULL,96.00,0.00,0.00,187.00,187.00,187.000000,4,NULL,NULL,NULL,NULL,NULL),(30,'MAT-00030','Retanal RCN40','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',70.00,11900.00,NULL,70.00,0.00,0.00,170.00,170.00,170.000000,4,NULL,NULL,NULL,NULL,NULL),(31,'MAT-00031','Dutan MR LIQ','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',30.00,4170.00,NULL,30.00,0.00,0.00,139.00,139.00,139.000000,2,NULL,NULL,NULL,NULL,NULL),(32,'MAT-00032','Butan Oil 1919','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',70.00,20160.00,NULL,70.00,0.00,0.00,288.00,288.00,288.000000,4,NULL,NULL,NULL,NULL,NULL),(33,'MAT-00033','Fos Fol M3','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34029090',NULL,NULL,NULL,0,'AKM Chemicals',130.00,33280.00,NULL,130.00,0.00,0.00,256.00,256.00,256.000000,4,NULL,NULL,NULL,NULL,NULL),(34,'MAT-00034','Lawgerat 94L','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',80.00,16800.00,NULL,80.00,0.00,0.00,210.00,210.00,210.000000,8,NULL,NULL,NULL,NULL,NULL),(35,'MAT-00035','Coripol UFB/W','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38089990',NULL,NULL,NULL,0,'AKM Chemicals',30.00,10380.00,NULL,30.00,0.00,0.00,346.00,346.00,346.000000,16,NULL,NULL,NULL,NULL,NULL),(36,'MAT-00036','Preventol ICI','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',20.00,26060.00,NULL,20.00,0.00,0.00,1303.00,1303.00,1303.000000,17,NULL,NULL,NULL,NULL,NULL),(37,'MAT-00037','Synthol BS150','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',25.00,5250.00,NULL,25.00,0.00,0.00,210.00,210.00,210.000000,15,NULL,NULL,NULL,NULL,NULL),(38,'MAT-00038','Coripol ESS','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',35.00,7175.00,NULL,35.00,0.00,0.00,205.00,205.00,205.000000,18,NULL,NULL,NULL,NULL,NULL),(39,'MAT-00039','Fos Fol CL','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',10.00,2300.00,NULL,10.00,0.00,0.00,230.00,230.00,230.000000,4,NULL,NULL,NULL,NULL,NULL),(40,'MAT-00040','Coritan VTP','Kg',3,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-10-16 12:41:47',NULL,'Active',NULL,16,NULL,'15',NULL,NULL,NULL,NULL,NULL,'32029020',NULL,NULL,NULL,0,'AKM Chemicals',15.00,2655.00,'Kg',8.70,0.00,0.00,177.00,177.00,177.000000,10,NULL,NULL,NULL,NULL,NULL),(41,'MAT-00041','GS Powder (ele)','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',32.50,7020.00,NULL,32.50,0.00,0.00,216.00,216.00,216.000000,9,NULL,NULL,NULL,NULL,NULL),(42,'MAT-00042','Butan 7864','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',42.30,6133.50,NULL,42.30,0.00,0.00,145.00,145.00,145.000000,4,NULL,NULL,NULL,NULL,NULL),(43,'MAT-00043','Vernatan OS','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',159.50,36685.00,NULL,159.50,0.00,0.00,230.00,230.00,230.000000,6,NULL,NULL,NULL,NULL,NULL),(44,'MAT-00044','Tanicor KW','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32029020',NULL,NULL,NULL,0,'AKM Chemicals',50.00,15350.00,NULL,50.00,0.00,0.00,307.00,307.00,307.000000,6,NULL,NULL,NULL,NULL,NULL),(45,'MAT-00045','Sasyntan CAN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32029020',NULL,NULL,NULL,0,'AKM Chemicals',74.30,12556.70,NULL,74.30,0.00,0.00,169.00,169.00,169.000000,10,NULL,NULL,NULL,NULL,NULL),(46,'MAT-00046','Tanigan OSO','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',42.00,7770.00,NULL,42.00,0.00,0.00,185.00,185.00,185.000000,16,NULL,NULL,NULL,NULL,NULL),(47,'MAT-00047','Acetate','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'29152990',NULL,NULL,NULL,0,'AKM Chemicals',105.80,5819.00,NULL,105.80,0.00,0.00,55.00,55.00,55.000000,3,NULL,NULL,NULL,NULL,NULL),(48,'MAT-00048','Coralon OT','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',59.00,10384.00,NULL,59.00,0.00,0.00,176.00,176.00,176.000000,6,NULL,NULL,NULL,NULL,NULL),(49,'MAT-00049','Soda','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'28362000',NULL,NULL,NULL,0,'AKM Chemicals',129.30,6465.00,NULL,129.30,0.00,0.00,50.00,50.00,50.000000,3,NULL,NULL,NULL,NULL,NULL),(50,'MAT-00050','Neutralan BA','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32029020',NULL,NULL,NULL,0,'AKM Chemicals',45.50,5505.50,NULL,45.50,0.00,0.00,121.00,121.00,121.000000,6,NULL,NULL,NULL,NULL,NULL),(51,'MAT-00051','Retanal CRO','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32029020',NULL,NULL,NULL,0,'AKM Chemicals',63.70,7452.90,NULL,63.70,0.00,0.00,117.00,117.00,117.000000,4,NULL,NULL,NULL,NULL,NULL),(52,'MAT-00052','Chrom','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'28332990',NULL,NULL,NULL,0,'AKM Chemicals',119.00,13328.00,NULL,119.00,0.00,0.00,112.00,112.00,112.000000,25,NULL,NULL,NULL,NULL,NULL),(53,'MAT-00053','Synektan DDS','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',21.50,5848.00,NULL,21.50,0.00,0.00,272.00,272.00,272.000000,6,NULL,NULL,NULL,NULL,NULL),(54,'MAT-00054','Didisyn NM','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',46.50,5533.50,NULL,46.50,0.00,0.00,119.00,119.00,119.000000,5,NULL,NULL,NULL,NULL,NULL),(55,'MAT-00055','D7','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',5.00,625.00,NULL,5.00,0.00,0.00,125.00,125.00,125.000000,6,NULL,NULL,NULL,NULL,NULL),(56,'MAT-00056','Pidisyntan TR','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',63.00,10080.00,NULL,63.00,0.00,0.00,160.00,160.00,160.000000,5,NULL,NULL,NULL,NULL,NULL),(57,'MAT-00057','Bot Veg GS','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32019000',NULL,NULL,NULL,0,'AKM Chemicals',20.00,3600.00,NULL,20.00,0.00,0.00,180.00,180.00,180.000000,7,NULL,NULL,NULL,NULL,NULL),(58,'MAT-00058','Bot Veg QB','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32019000',NULL,NULL,NULL,0,'AKM Chemicals',38.90,8013.40,NULL,38.90,0.00,0.00,206.00,206.00,206.000000,7,NULL,NULL,NULL,NULL,NULL),(59,'MAT-00059','Ledoresin MD','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32029090',NULL,NULL,NULL,0,'AKM Chemicals',11.50,3197.00,NULL,11.50,0.00,0.00,278.00,278.00,278.000000,11,NULL,NULL,NULL,NULL,NULL),(60,'MAT-00060','Ledosol PWN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',11.30,2994.50,NULL,11.30,0.00,0.00,265.00,265.00,265.000000,11,NULL,NULL,NULL,NULL,NULL),(61,'MAT-00061','Synektan VW','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',11.95,2210.75,NULL,11.95,0.00,0.00,185.00,185.00,185.000000,6,NULL,NULL,NULL,NULL,NULL),(62,'MAT-00062','Lawgetan MN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',19.50,2827.50,NULL,19.50,0.00,0.00,145.00,145.00,145.000000,8,NULL,NULL,NULL,NULL,NULL),(63,'MAT-00063','Lawgetan TR','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',11.40,1687.20,NULL,11.40,0.00,0.00,148.00,148.00,148.000000,8,NULL,NULL,NULL,NULL,NULL),(64,'MAT-00064','Lawgetan','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',17.00,3315.00,NULL,17.00,0.00,0.00,195.00,195.00,195.000000,8,NULL,NULL,NULL,NULL,NULL),(65,'MAT-00065','Vernatan BL','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',15.90,1987.50,NULL,15.90,0.00,0.00,125.00,125.00,125.000000,6,NULL,NULL,NULL,NULL,NULL),(66,'MAT-00066','Tanicor DLE','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',61.00,7625.00,NULL,61.00,0.00,0.00,125.00,125.00,125.000000,6,NULL,NULL,NULL,NULL,NULL),(67,'MAT-00067','Gambini ST Powder','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32029020',NULL,NULL,NULL,0,'AKM Chemicals',14.40,3801.60,NULL,14.40,0.00,0.00,264.00,264.00,264.000000,11,NULL,NULL,NULL,NULL,NULL),(68,'MAT-00068','Blancotan 2X Powder','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32029090',NULL,NULL,NULL,0,'AKM Chemicals',20.30,6171.20,NULL,20.30,0.00,0.00,304.00,304.00,304.000000,11,NULL,NULL,NULL,NULL,NULL),(69,'MAT-00069','Titanium Dioxide','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'28230010',NULL,NULL,NULL,0,'AKM Chemicals',14.50,4785.00,NULL,14.50,0.00,0.00,330.00,330.00,330.000000,13,NULL,NULL,NULL,NULL,NULL),(70,'MAT-00070','Chikatan CFT','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',11.00,0.00,NULL,11.00,0.00,0.00,0.00,0.00,0.000000,12,NULL,NULL,NULL,NULL,NULL),(71,'MAT-00071','Quebracho','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32011000',NULL,NULL,NULL,0,'AKM Chemicals',43.50,13398.00,NULL,43.50,0.00,0.00,308.00,308.00,308.000000,9,NULL,NULL,NULL,NULL,NULL),(72,'MAT-00072','Dermafix S','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',0.75,185.25,NULL,0.75,0.00,0.00,247.00,247.00,247.000000,6,NULL,NULL,NULL,NULL,NULL),(73,'MAT-00073','Green BG','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.60,494.43,NULL,0.60,0.00,0.00,824.05,824.05,824.050000,19,NULL,NULL,NULL,NULL,NULL),(74,'MAT-00074','Brill Blue FRL','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.50,261.74,NULL,0.50,0.00,0.00,523.48,523.48,523.480000,19,NULL,NULL,NULL,NULL,NULL),(75,'MAT-00075','Black EBR','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.35,361.00,NULL,0.35,0.00,0.00,1031.44,1031.44,1031.440000,19,NULL,NULL,NULL,NULL,NULL),(76,'MAT-00076','Blue NR','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',3.30,2795.40,NULL,3.30,0.00,0.00,847.09,847.09,847.090000,19,NULL,NULL,NULL,NULL,NULL),(77,'MAT-00077','Coripacide Blue RG','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.60,269.55,NULL,0.60,0.00,0.00,449.25,449.25,449.250000,19,NULL,NULL,NULL,NULL,NULL),(78,'MAT-00078','Y Brown RL','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',5.25,6084.75,NULL,5.25,0.00,0.00,1159.00,1159.00,1159.000000,19,NULL,NULL,NULL,NULL,NULL),(79,'MAT-00079','Brown R','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.25,164.35,NULL,0.25,0.00,0.00,657.40,657.40,657.400000,19,NULL,NULL,NULL,NULL,NULL),(80,'MAT-00080','Brown NG12','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041900',NULL,NULL,NULL,0,'AKM Chemicals',0.60,296.66,NULL,0.60,0.00,0.00,494.43,494.43,494.430000,19,NULL,NULL,NULL,NULL,NULL),(81,'MAT-00081','Brn MLRL','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',2.60,2134.70,NULL,2.60,0.00,0.00,821.04,821.04,821.040000,19,NULL,NULL,NULL,NULL,NULL),(82,'MAT-00082','Brn FBR','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',3.70,3319.57,NULL,3.70,0.00,0.00,897.18,897.18,897.180000,19,NULL,NULL,NULL,NULL,NULL),(83,'MAT-00083','Olive Brn G','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',1.50,1160.94,NULL,1.50,0.00,0.00,773.96,773.96,773.960000,19,NULL,NULL,NULL,NULL,NULL),(84,'MAT-00084','HR Brn NGB','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',2.95,2840.85,NULL,2.95,0.00,0.00,963.00,963.00,963.000000,6,NULL,NULL,NULL,NULL,NULL),(85,'MAT-00085','Brown BLB','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.10,81.90,NULL,0.10,0.00,0.00,819.00,819.00,819.000000,19,NULL,NULL,NULL,NULL,NULL),(86,'MAT-00086','Brn B','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.40,344.00,NULL,0.40,0.00,0.00,860.00,860.00,860.000000,19,NULL,NULL,NULL,NULL,NULL),(87,'MAT-00087','Dk Brn R','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.45,548.10,NULL,0.45,0.00,0.00,1218.00,1218.00,1218.000000,6,NULL,NULL,NULL,NULL,NULL),(88,'MAT-00088','Brn CFW','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',2.00,1040.96,NULL,2.00,0.00,0.00,520.48,520.48,520.480000,19,NULL,NULL,NULL,NULL,NULL),(89,'MAT-00089','Brown HGN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',4.95,6499.35,NULL,4.95,0.00,0.00,1313.00,1313.00,1313.000000,6,NULL,NULL,NULL,NULL,NULL),(90,'MAT-00090','103 Polynesian Beige','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.85,510.00,NULL,0.85,0.00,0.00,600.00,600.00,600.000000,20,NULL,NULL,NULL,NULL,NULL),(91,'MAT-00091','104 Sabia','Kilogram',3,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-28 16:19:35',NULL,'Active',NULL,7,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.85,532.10,NULL,0.85,0.00,0.00,626.00,626.00,626.000000,20,NULL,NULL,NULL,NULL,NULL),(92,'MAT-00092','Blue RF','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.22,907.06,NULL,0.22,0.00,0.00,4123.00,4123.00,4123.000000,6,NULL,NULL,NULL,NULL,NULL),(93,'MAT-00093','Grey MCWS','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:25','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.20,74.44,NULL,0.20,0.00,0.00,372.20,372.20,372.200000,19,NULL,NULL,NULL,NULL,NULL),(94,'MAT-00094','Brn FB3GN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.09,65.61,NULL,0.09,0.00,0.00,729.00,729.00,729.000000,6,NULL,NULL,NULL,NULL,NULL),(95,'MAT-00095','Brown NGB','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.30,151.33,NULL,0.30,0.00,0.00,504.43,504.43,504.430000,19,NULL,NULL,NULL,NULL,NULL),(96,'MAT-00096','Brown CBT','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.65,284.45,NULL,0.65,0.00,0.00,437.62,437.62,437.620000,19,NULL,NULL,NULL,NULL,NULL),(97,'MAT-00097','Beige UR','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',1.70,815.35,NULL,1.70,0.00,0.00,479.62,479.62,479.620000,19,NULL,NULL,NULL,NULL,NULL),(98,'MAT-00098','Red SG','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.10,64.77,NULL,0.10,0.00,0.00,647.70,647.70,647.700000,19,NULL,NULL,NULL,NULL,NULL),(99,'MAT-00099','Brown RN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.40,264.29,NULL,0.40,0.00,0.00,660.72,660.72,660.720000,19,NULL,NULL,NULL,NULL,NULL),(100,'MAT-00100','Bordeaux UCN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',1.80,1046.83,NULL,1.80,0.00,0.00,581.57,581.57,581.570000,19,NULL,NULL,NULL,NULL,NULL),(101,'MAT-00101','Red 2BN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',1.10,1408.64,NULL,1.10,0.00,0.00,1280.58,1280.58,1280.580000,19,NULL,NULL,NULL,NULL,NULL),(102,'MAT-00102','Inoderm Brn NT','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.55,0.00,NULL,0.55,0.00,0.00,0.00,0.00,0.000000,6,NULL,NULL,NULL,NULL,NULL),(103,'MAT-00103','Dk Green N','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.40,0.00,NULL,0.40,0.00,0.00,0.00,0.00,0.000000,6,NULL,NULL,NULL,NULL,NULL),(104,'MAT-00104','Violet BR','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.85,383.63,NULL,0.85,0.00,0.00,451.33,451.33,451.330000,19,NULL,NULL,NULL,NULL,NULL),(105,'MAT-00105','Coffee Brown CRB','Kilogram',3,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:30:28',NULL,'Active',NULL,7,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.70,641.34,NULL,0.70,0.00,0.00,916.20,916.20,916.200000,19,NULL,NULL,NULL,NULL,NULL),(106,'MAT-00106','Jet Black','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',17.50,16857.93,NULL,17.50,0.00,0.00,963.31,963.31,963.310000,19,NULL,NULL,NULL,NULL,NULL),(107,'MAT-00107','Powder Black PPS','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',60.90,32886.00,NULL,60.90,0.00,0.00,540.00,540.00,540.000000,13,NULL,NULL,NULL,NULL,NULL),(108,'MAT-00108','Powder Black PPR','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',60.00,27000.00,NULL,60.00,0.00,0.00,450.00,450.00,450.000000,13,NULL,NULL,NULL,NULL,NULL),(109,'MAT-00109','Beige U-NS','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',3.65,1987.46,NULL,3.65,0.00,0.00,544.51,544.51,544.510000,19,NULL,NULL,NULL,NULL,NULL),(110,'MAT-00110','Red Brown CRN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',3.25,1873.85,NULL,3.25,0.00,0.00,576.57,576.57,576.570000,19,NULL,NULL,NULL,NULL,NULL),(111,'MAT-00111','Navy Blue SRL','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',3.50,2610.58,NULL,3.50,0.00,0.00,745.88,745.88,745.880000,19,NULL,NULL,NULL,NULL,NULL),(112,'MAT-00112','Navy Blue RL','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',8.80,5161.90,NULL,8.80,0.00,0.00,586.58,586.58,586.580000,19,NULL,NULL,NULL,NULL,NULL),(113,'MAT-00113','Yellow 2RLN','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',5.30,3730.14,NULL,5.30,0.00,0.00,703.80,703.80,703.800000,19,NULL,NULL,NULL,NULL,NULL),(114,'MAT-00114','Dermalix WWL','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34029090',NULL,NULL,NULL,0,'AKM Chemicals',10.00,2730.00,NULL,10.00,0.00,0.00,273.00,273.00,273.000000,6,NULL,NULL,NULL,NULL,NULL),(115,'MAT-00115','Repelan MA/B','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',93.50,14305.50,NULL,93.50,0.00,0.00,153.00,153.00,153.000000,4,NULL,NULL,NULL,NULL,NULL),(116,'MAT-00116','Sasyol ECW','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',72.50,25012.50,NULL,72.50,0.00,0.00,345.00,345.00,345.000000,10,NULL,NULL,NULL,NULL,NULL),(117,'MAT-00117','Sintoil GH','Kg',NULL,NULL,'INR','Wet-end',11,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',7.00,3759.00,NULL,7.00,0.00,0.00,537.00,537.00,537.000000,11,NULL,NULL,NULL,NULL,NULL),(118,'MAT-00118','RC-27165','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',120.00,18000.00,NULL,120.00,0.00,0.00,150.00,150.00,150.000000,6,NULL,NULL,NULL,NULL,NULL),(119,'MAT-00119','Hyper 93','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34029090',NULL,NULL,NULL,0,'AKM Chemicals',10.00,2670.00,NULL,10.00,0.00,0.00,267.00,267.00,267.000000,16,NULL,NULL,NULL,NULL,NULL),(120,'MAT-00120','BM 3058','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',49.00,32683.00,NULL,49.00,0.00,0.00,667.00,667.00,667.000000,21,NULL,NULL,NULL,NULL,NULL),(121,'MAT-00121','RA 27007','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',50.00,7500.00,NULL,50.00,0.00,0.00,150.00,150.00,150.000000,6,NULL,NULL,NULL,NULL,NULL),(122,'MAT-00122','RA 27066','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',100.00,15000.00,NULL,100.00,0.00,0.00,150.00,150.00,150.000000,6,NULL,NULL,NULL,NULL,NULL),(123,'MAT-00123','Corial Microbinder AM','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',80.00,14160.00,NULL,80.00,0.00,0.00,177.00,177.00,177.000000,6,NULL,NULL,NULL,NULL,NULL),(124,'MAT-00124','Argowax 4008','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34049000',NULL,NULL,NULL,0,'AKM Chemicals',18.00,5652.00,NULL,18.00,0.00,0.00,314.00,314.00,314.000000,21,NULL,NULL,NULL,NULL,NULL),(125,'MAT-00125','MTW 4506','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',15.00,13935.00,NULL,15.00,0.00,0.00,929.00,929.00,929.000000,21,NULL,NULL,NULL,NULL,NULL),(126,'MAT-00126','HM 183','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38249990',NULL,NULL,NULL,0,'AKM Chemicals',0.85,1329.40,NULL,0.85,0.00,0.00,1564.00,1564.00,1564.000000,6,NULL,NULL,NULL,NULL,NULL),(127,'MAT-00127','LL 3875','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',1.50,1008.00,NULL,1.50,0.00,0.00,672.00,672.00,672.000000,22,NULL,NULL,NULL,NULL,NULL),(128,'MAT-00128','LP 1488','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',1.30,1209.00,NULL,1.30,0.00,0.00,930.00,930.00,930.000000,22,NULL,NULL,NULL,NULL,NULL),(129,'MAT-00129','Mix Carteggio','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38249990',NULL,NULL,NULL,0,'AKM Chemicals',1.80,1060.20,NULL,1.80,0.00,0.00,589.00,589.00,589.000000,22,NULL,NULL,NULL,NULL,NULL),(130,'MAT-00130','LPM 1000','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',1.80,2970.00,NULL,1.80,0.00,0.00,1650.00,1650.00,1650.000000,22,NULL,NULL,NULL,NULL,NULL),(131,'MAT-00131','LP 1247','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',2.20,1988.80,NULL,2.20,0.00,0.00,904.00,904.00,904.000000,22,NULL,NULL,NULL,NULL,NULL),(132,'MAT-00132','LP 1238','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',2.00,1682.00,NULL,2.00,0.00,0.00,841.00,841.00,841.000000,22,NULL,NULL,NULL,NULL,NULL),(133,'MAT-00133','LH 44/B','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',0.50,166.00,NULL,0.50,0.00,0.00,332.00,332.00,332.000000,22,NULL,NULL,NULL,NULL,NULL),(134,'MAT-00134','LP 3452','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',4.50,2790.00,NULL,4.50,0.00,0.00,620.00,620.00,620.000000,22,NULL,NULL,NULL,NULL,NULL),(135,'MAT-00135','LP 1422','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',4.80,3278.40,NULL,4.80,0.00,0.00,683.00,683.00,683.000000,22,NULL,NULL,NULL,NULL,NULL),(136,'MAT-00136','LP 1298','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',4.80,3177.60,NULL,4.80,0.00,0.00,662.00,662.00,662.000000,22,NULL,NULL,NULL,NULL,NULL),(137,'MAT-00137','LT 1110','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',4.90,2420.60,NULL,4.90,0.00,0.00,494.00,494.00,494.000000,22,NULL,NULL,NULL,NULL,NULL),(138,'MAT-00138','LW 65377','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',3.50,1764.00,NULL,3.50,0.00,0.00,504.00,504.00,504.000000,6,NULL,NULL,NULL,NULL,NULL),(139,'MAT-00139','Filla 4477','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',8.00,5400.00,NULL,8.00,0.00,0.00,675.00,675.00,675.000000,21,NULL,NULL,NULL,NULL,NULL),(140,'MAT-00140','Aquarius 3577','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',2.70,1682.10,NULL,2.70,0.00,0.00,623.00,623.00,623.000000,21,NULL,NULL,NULL,NULL,NULL),(141,'MAT-00141','RA 1079','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',0.80,348.80,NULL,0.80,0.00,0.00,436.00,436.00,436.000000,6,NULL,NULL,NULL,NULL,NULL),(142,'MAT-00142','Argowax 611','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34049000',NULL,NULL,NULL,0,'AKM Chemicals',53.50,36968.50,NULL,53.50,0.00,0.00,691.00,691.00,691.000000,21,NULL,NULL,NULL,NULL,NULL),(143,'MAT-00143','LA 021','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',6.20,1829.00,NULL,6.20,0.00,0.00,295.00,295.00,295.000000,22,NULL,NULL,NULL,NULL,NULL),(144,'MAT-00144','LT 1178','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',6.00,2964.00,NULL,6.00,0.00,0.00,494.00,494.00,494.000000,22,NULL,NULL,NULL,NULL,NULL),(145,'MAT-00145','Liquor Ammonia','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'28142000',NULL,NULL,NULL,0,'AKM Chemicals',6.50,260.00,NULL,6.50,0.00,0.00,40.00,40.00,40.000000,23,NULL,NULL,NULL,NULL,NULL),(146,'MAT-00146','B123','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38249990',NULL,NULL,NULL,0,'AKM Chemicals',3.80,1987.40,NULL,3.80,0.00,0.00,523.00,523.00,523.000000,24,NULL,NULL,NULL,NULL,NULL),(147,'MAT-00147','IW08','Kg',3,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-10-12 09:59:25',NULL,'Active',NULL,16,NULL,'15',NULL,NULL,NULL,NULL,NULL,'38249990',NULL,NULL,NULL,0,'AKM Chemicals',20.00,7200.00,'Kg',1.00,0.00,0.00,0.00,0.00,360.000000,16,NULL,NULL,NULL,NULL,NULL),(148,'MAT-00148','Rodapur ADX','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34029090',NULL,NULL,NULL,0,'AKM Chemicals',2.50,1197.50,NULL,2.50,0.00,0.00,479.00,479.00,479.000000,16,NULL,NULL,NULL,NULL,NULL),(149,'MAT-00149','Hycryl 55','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',2.50,807.50,NULL,2.50,0.00,0.00,323.00,323.00,323.000000,16,NULL,NULL,NULL,NULL,NULL),(150,'MAT-00150','BM 3159 CT','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',0.90,0.00,NULL,0.90,0.00,0.00,0.00,0.00,0.000000,21,NULL,NULL,NULL,NULL,NULL),(151,'MAT-00151','Soleda Roller 633 CT','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',0.80,468.00,NULL,0.80,0.00,0.00,585.00,585.00,585.000000,21,NULL,NULL,NULL,NULL,NULL),(152,'MAT-00152','Acrilan Soft 6','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',48.00,16704.00,NULL,48.00,0.00,0.00,348.00,348.00,348.000000,21,NULL,NULL,NULL,NULL,NULL),(153,'MAT-00153','Melio WO 606','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',1.80,0.00,NULL,1.80,0.00,0.00,0.00,0.00,0.000000,6,NULL,NULL,NULL,NULL,NULL),(154,'MAT-00154','Argowax 555 NT','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34049000',NULL,NULL,NULL,0,'AKM Chemicals',3.80,1383.20,NULL,3.80,0.00,0.00,364.00,364.00,364.000000,21,NULL,NULL,NULL,NULL,NULL),(155,'MAT-00155','Bioban 045','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38089990',NULL,NULL,NULL,0,'AKM Chemicals',2.80,0.00,NULL,2.80,0.00,0.00,0.00,0.00,0.000000,15,NULL,NULL,NULL,NULL,NULL),(156,'MAT-00156','LW 27703','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',1.40,665.00,NULL,1.40,0.00,0.00,475.00,475.00,475.000000,6,NULL,NULL,NULL,NULL,NULL),(157,'MAT-00157','LW 65701','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',1.80,678.60,NULL,1.80,0.00,0.00,377.00,377.00,377.000000,6,NULL,NULL,NULL,NULL,NULL),(158,'MAT-00158','Argo Fix 172','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',0.57,2966.28,NULL,0.57,0.00,0.00,5204.00,5204.00,5204.000000,21,NULL,NULL,NULL,NULL,NULL),(159,'MAT-00159','LF 1297','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',2.60,0.00,NULL,2.60,0.00,0.00,0.00,0.00,0.000000,22,NULL,NULL,NULL,NULL,NULL),(160,'MAT-00160','Lisofix M 300','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',1.50,0.00,NULL,1.50,0.00,0.00,0.00,0.00,0.000000,22,NULL,NULL,NULL,NULL,NULL),(161,'MAT-00161','Aqulan Top NG 02','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',1.00,0.00,NULL,1.00,0.00,0.00,0.00,0.00,0.000000,6,NULL,NULL,NULL,NULL,NULL),(162,'MAT-00162','Argowax 4004','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34049000',NULL,NULL,NULL,0,'AKM Chemicals',2.00,912.00,NULL,2.00,0.00,0.00,456.00,456.00,456.000000,21,NULL,NULL,NULL,NULL,NULL),(163,'MAT-00163','I KBEC','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38249990',NULL,NULL,NULL,0,'AKM Chemicals',1.00,0.00,NULL,1.00,0.00,0.00,0.00,0.00,0.000000,22,NULL,NULL,NULL,NULL,NULL),(164,'MAT-00164','Liso Top L1','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32089020',NULL,NULL,NULL,0,'AKM Chemicals',0.90,0.00,NULL,0.90,0.00,0.00,0.00,0.00,0.000000,22,NULL,NULL,NULL,NULL,NULL),(165,'MAT-00165','BM 3157 CT','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34039100',NULL,NULL,NULL,0,'AKM Chemicals',0.25,146.75,NULL,0.25,0.00,0.00,587.00,587.00,587.000000,21,NULL,NULL,NULL,NULL,NULL),(166,'MAT-00166','Top U95 kT','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32089020',NULL,NULL,NULL,0,'AKM Chemicals',0.35,164.15,NULL,0.35,0.00,0.00,469.00,469.00,469.000000,16,NULL,NULL,NULL,NULL,NULL),(167,'MAT-00167','Lucido 1186','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',5.50,3712.50,NULL,5.50,0.00,0.00,675.00,675.00,675.000000,21,NULL,NULL,NULL,NULL,NULL),(168,'MAT-00168','Acrilan 2043 E','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',1.50,607.50,NULL,1.50,0.00,0.00,405.00,405.00,405.000000,21,NULL,NULL,NULL,NULL,NULL),(169,'MAT-00169','Argowax 4094','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34049000',NULL,NULL,NULL,0,'AKM Chemicals',3.50,1876.00,NULL,3.50,0.00,0.00,536.00,536.00,536.000000,21,NULL,NULL,NULL,NULL,NULL),(170,'MAT-00170','Hypro 85','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',21.00,5124.00,NULL,21.00,0.00,0.00,244.00,244.00,244.000000,16,NULL,NULL,NULL,NULL,NULL),(171,'MAT-00171','Hypro 86','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38099300',NULL,NULL,NULL,0,'AKM Chemicals',25.00,4600.00,NULL,25.00,0.00,0.00,184.00,184.00,184.000000,16,NULL,NULL,NULL,NULL,NULL),(172,'MAT-00172','Top 1591','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32089020',NULL,NULL,NULL,0,'AKM Chemicals',17.00,6477.00,NULL,17.00,0.00,0.00,381.00,381.00,381.000000,21,NULL,NULL,NULL,NULL,NULL),(173,'MAT-00173','Aquarius 3700 N','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',8.00,6488.00,NULL,8.00,0.00,0.00,811.00,811.00,811.000000,21,NULL,NULL,NULL,NULL,NULL),(174,'MAT-00174','Filler NMR','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32021000',NULL,NULL,NULL,0,'AKM Chemicals',3.00,1308.00,NULL,3.00,0.00,0.00,436.00,436.00,436.000000,21,NULL,NULL,NULL,NULL,NULL),(175,'MAT-00175','4139','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38249990',NULL,NULL,NULL,0,'AKM Chemicals',0.70,490.00,NULL,0.70,0.00,0.00,700.00,700.00,700.000000,21,NULL,NULL,NULL,NULL,NULL),(176,'MAT-00176','Q Wax 80','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'34049000',NULL,NULL,NULL,0,'AKM Chemicals',0.35,0.00,NULL,0.35,0.00,0.00,0.00,0.00,0.000000,21,NULL,NULL,NULL,NULL,NULL),(177,'MAT-00177','4134','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38249990',NULL,NULL,NULL,0,'AKM Chemicals',0.60,140.40,NULL,0.60,0.00,0.00,234.00,234.00,234.000000,21,NULL,NULL,NULL,NULL,NULL),(178,'MAT-00178','Hy 88','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'38249990',NULL,NULL,NULL,0,'AKM Chemicals',0.50,98.00,NULL,0.50,0.00,0.00,196.00,196.00,196.000000,21,NULL,NULL,NULL,NULL,NULL),(179,'MAT-00179','96','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.30,153.00,NULL,0.30,0.00,0.00,510.00,510.00,510.000000,21,NULL,NULL,NULL,NULL,NULL),(180,'MAT-00180','Iride Dark Brn LX','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',10.00,6020.00,NULL,10.00,0.00,0.00,602.00,602.00,602.000000,21,NULL,NULL,NULL,NULL,NULL),(181,'MAT-00181','Iride Lemon LX','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',2.00,0.00,NULL,2.00,0.00,0.00,0.00,0.00,0.000000,21,NULL,NULL,NULL,NULL,NULL),(182,'MAT-00182','Iride Bianco N','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',50.00,35550.00,NULL,50.00,0.00,0.00,711.00,711.00,711.000000,21,NULL,NULL,NULL,NULL,NULL),(183,'MAT-00183','Iride Brown LX','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',1.50,756.00,NULL,1.50,0.00,0.00,504.00,504.00,504.000000,21,NULL,NULL,NULL,NULL,NULL),(184,'MAT-00184','Iride Yellow LX','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.00,0.00,NULL,0.00,0.00,0.00,1098.00,1098.00,1098.000000,21,NULL,NULL,NULL,NULL,NULL),(185,'MAT-00185','Iride Green LX','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.50,376.50,NULL,0.50,0.00,0.00,753.00,753.00,753.000000,21,NULL,NULL,NULL,NULL,NULL),(186,'MAT-00186','Iride Fuxia LX','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',4.70,6218.10,NULL,4.70,0.00,0.00,1323.00,1323.00,1323.000000,21,NULL,NULL,NULL,NULL,NULL),(187,'MAT-00187','Iride Bordo LX','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',5.70,7518.30,NULL,5.70,0.00,0.00,1319.00,1319.00,1319.000000,21,NULL,NULL,NULL,NULL,NULL),(188,'MAT-00188','Iride Red LX','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',1.50,1165.50,NULL,1.50,0.00,0.00,777.00,777.00,777.000000,21,NULL,NULL,NULL,NULL,NULL),(189,'MAT-00189','Iride Black LX','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',4.50,1966.50,NULL,4.50,0.00,0.00,437.00,437.00,437.000000,21,NULL,NULL,NULL,NULL,NULL),(190,'MAT-00190','Iride Ocra','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',5.00,2465.00,NULL,5.00,0.00,0.00,493.00,493.00,493.000000,21,NULL,NULL,NULL,NULL,NULL),(191,'MAT-00191','AC 1 Eco Navy Blue','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',3.00,1149.00,NULL,3.00,0.00,0.00,383.00,383.00,383.000000,16,NULL,NULL,NULL,NULL,NULL),(192,'MAT-00192','AC 1 Eco Jet Black','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',15.00,4140.00,NULL,15.00,0.00,0.00,276.00,276.00,276.000000,16,NULL,NULL,NULL,NULL,NULL),(193,'MAT-00193','AC 1 Eco Yellow Brown','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',5.00,2750.00,NULL,5.00,0.00,0.00,550.00,550.00,550.000000,16,NULL,NULL,NULL,NULL,NULL),(194,'MAT-00194','Supronil Dk Brn LD 5924','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.40,568.80,NULL,0.40,0.00,0.00,1422.00,1422.00,1422.000000,6,NULL,NULL,NULL,NULL,NULL),(195,'MAT-00195','Supronil Yellow LD 5928','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.80,10168.80,NULL,0.80,0.00,0.00,12711.00,12711.00,12711.000000,6,NULL,NULL,NULL,NULL,NULL),(196,'MAT-00196','Supronil Orange LD 5957','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.70,1028.30,NULL,0.70,0.00,0.00,1469.00,1469.00,1469.000000,6,NULL,NULL,NULL,NULL,NULL),(197,'MAT-00197','Supronil Lemon LD 5927','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.50,2827.00,NULL,0.50,0.00,0.00,5654.00,5654.00,5654.000000,6,NULL,NULL,NULL,NULL,NULL),(198,'MAT-00198','Supronil Y/Brown LD 5985','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.65,921.70,NULL,0.65,0.00,0.00,1418.00,1418.00,1418.000000,6,NULL,NULL,NULL,NULL,NULL),(199,'MAT-00199','Supronil Black W LD 5932','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.70,662.20,NULL,0.70,0.00,0.00,946.00,946.00,946.000000,6,NULL,NULL,NULL,NULL,NULL),(200,'MAT-00200','Luxolin Green','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.10,0.00,NULL,0.10,0.00,0.00,0.00,0.00,0.000000,15,NULL,NULL,NULL,NULL,NULL),(201,'MAT-00201','Katiolux Brown','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.75,0.00,NULL,0.75,0.00,0.00,0.00,0.00,0.000000,25,NULL,NULL,NULL,NULL,NULL),(202,'MAT-00202','Pulver PS Silver','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041790',NULL,NULL,NULL,0,'AKM Chemicals',0.50,0.00,NULL,0.50,0.00,0.00,0.00,0.00,0.000000,26,NULL,NULL,NULL,NULL,NULL),(203,'MAT-00203','Pulver PS Blue','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.23,0.00,NULL,0.23,0.00,0.00,0.00,0.00,0.000000,26,NULL,NULL,NULL,NULL,NULL),(204,'MAT-00204','Pulver PS Red','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',0.40,0.00,NULL,0.40,0.00,0.00,0.00,0.00,0.000000,26,NULL,NULL,NULL,NULL,NULL),(205,'MAT-00205','Pulver PS Pale Gold','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041790',NULL,NULL,NULL,0,'AKM Chemicals',0.25,0.00,NULL,0.25,0.00,0.00,0.00,0.00,0.000000,26,NULL,NULL,NULL,NULL,NULL),(206,'MAT-00206','Hyper Gold','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041790',NULL,NULL,NULL,0,'AKM Chemicals',0.50,0.00,NULL,0.50,0.00,0.00,0.00,0.00,0.000000,16,NULL,NULL,NULL,NULL,NULL),(207,'MAT-00207','Supronil Red LD 5986','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',1.00,1699.00,NULL,1.00,0.00,0.00,1699.00,1699.00,1699.000000,6,NULL,NULL,NULL,NULL,NULL),(208,'MAT-00208','Supronil R/Brn LD 5981','Kg',NULL,NULL,'INR','Finishing',12,'2026-09-25 10:51:26','2026-09-27 13:39:15',NULL,'Active',NULL,NULL,NULL,'Chemicals',NULL,NULL,NULL,NULL,NULL,'32041200',NULL,NULL,NULL,0,'AKM Chemicals',1.00,2034.00,NULL,1.00,0.00,0.00,2034.00,2034.00,2034.000000,6,NULL,NULL,NULL,NULL,NULL),(209,'MAT-00209','Formic Acid','Kg',3,NULL,'INR','Wet-end',11,'2026-09-25 12:46:14','2026-10-11 06:38:35',NULL,'Active',16,16,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'AKM Chemicals',560.00,44800.00,'Kilogram',0.00,0.00,0.00,0.00,0.00,80.000000,3,NULL,NULL,NULL,NULL,NULL),(210,'MAT-00210','Relugan G724','Kg',3,NULL,'INR','Wet-end',11,'2026-09-26 05:44:13','2026-09-30 12:10:07',NULL,'Active',16,7,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'AKM Chemicals',10.00,3790.00,'Kilogram',0.00,0.00,0.00,0.00,0.00,379.000000,NULL,NULL,NULL,NULL,NULL,NULL),(211,'MAT-00211','Sheep Wet Blue','Piece',6,1,'INR','Wet-end',7,'2026-09-26 12:14:04','2026-09-28 09:09:18',NULL,'Active',7,7,NULL,'4',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'AKM Wetblue ',0.00,0.00,NULL,0.00,0.00,0.00,0.00,0.00,0.000000,14,NULL,NULL,NULL,NULL,NULL),(213,'MAT-00213','Brown RE ','Kg',3,NULL,'INR','Wet-end',3,'2026-09-28 12:23:27','2026-09-30 12:09:45',NULL,'Active',16,7,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'AKM Chemicals',0.00,0.00,'Kg',0.00,0.00,0.00,0.00,0.00,0.000000,19,NULL,NULL,NULL,NULL,NULL),(214,'MAT-00214','Brown F','Kg',3,NULL,'INR','Finishing',3,'2026-09-28 12:50:52','2026-10-06 11:18:37',NULL,'Active',16,16,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'AKM Chemicals',1.00,667.74,'Kg',0.00,0.00,0.00,0.00,0.00,667.740000,19,NULL,NULL,NULL,NULL,NULL),(215,'MAT-00215','HYLA W 08','Kg',3,NULL,'INR','Finishing',12,'2026-09-30 12:04:35','2026-09-30 12:10:00',NULL,'Active',12,7,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'AKM Finishing Chemicals',10.00,4790.00,'Kilogram',10.00,0.00,0.00,0.00,0.00,479.000000,16,NULL,NULL,NULL,NULL,NULL),(216,'MAT-00216','RODA LAC 4130','Kg',3,NULL,'INR','Finishing',12,'2026-09-30 12:09:07','2026-09-30 12:09:07',NULL,'Active',12,NULL,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,5.00,3015.00,'Kg',5.00,0.00,0.00,0.00,0.00,603.000000,NULL,NULL,NULL,NULL,NULL,NULL),(217,'MAT-00217','RODA FEEL 980/N','Kg',3,NULL,'INR','Finishing',12,'2026-09-30 12:11:43','2026-09-30 12:11:43',NULL,'Active',12,NULL,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'AKM Finishing Chemicals',2.00,1588.00,'Kg',2.00,0.00,0.00,0.00,0.00,794.000000,NULL,NULL,NULL,NULL,NULL,NULL),(218,'MAT-00218','RODA FEEL KTA 950-I','Kg',3,NULL,'INR','Finishing',12,'2026-09-30 12:14:25','2026-09-30 12:14:25',NULL,'Active',12,NULL,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'AKM Finishing Chemicals',2.00,1256.00,'Kg',2.00,0.00,0.00,0.00,0.00,628.000000,NULL,NULL,NULL,NULL,NULL,NULL),(219,'MAT-00219','RODA WAX K 619-I','Kg',3,NULL,'INR','Finishing',12,'2026-09-30 12:17:53','2026-09-30 12:17:53',NULL,'Active',12,NULL,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'AKM Finishing Chemicals',3.00,1113.00,'Kg',3.00,0.00,0.00,0.00,0.00,371.000000,16,NULL,NULL,NULL,NULL,NULL),(220,'MAT-00220','LUSTRAL UT','Kg',3,NULL,'INR','Finishing',12,'2026-10-05 07:03:04','2026-10-05 07:40:54',NULL,'Active',16,16,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,1.00,364.00,'Kg',1.00,0.00,0.00,0.00,0.00,364.000000,24,NULL,NULL,NULL,NULL,NULL),(221,'MAT-00221','ALPATOP 143 L','Kg',3,NULL,'INR','Finishing',12,'2026-10-05 07:05:15','2026-10-05 07:40:25',NULL,'Active',16,16,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,1.00,710.00,'Kg',1.00,0.00,0.00,0.00,0.00,710.000000,24,NULL,NULL,NULL,NULL,NULL),(222,'MAT-00222','LUSTRAL 511','Kg',3,NULL,'INR','Finishing',12,'2026-10-05 07:07:09','2026-10-05 07:39:53',NULL,'Active',16,16,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,1.00,507.00,'Kg',1.00,0.00,0.00,0.00,0.00,507.000000,24,NULL,NULL,NULL,NULL,NULL),(223,'MAT-00223','LUSTRAL WAX LL','Kg',3,NULL,'INR','Finishing',12,'2026-10-05 07:11:19','2026-10-05 07:39:30',NULL,'Active',16,16,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'AKM Finishing Chemicals',1.00,725.00,'Kg',1.00,0.00,0.00,0.00,0.00,725.000000,24,NULL,NULL,NULL,NULL,NULL),(224,'MAT-00224','LUSTRAL C ','Kg',3,NULL,'INR','Finishing',12,'2026-10-05 07:13:33','2026-10-05 07:39:07',NULL,'Active',16,16,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'AKM Finishing Chemicals',1.00,518.00,'Kg',1.00,0.00,0.00,0.00,0.00,518.000000,24,NULL,NULL,NULL,NULL,NULL),(225,'MAT-00225','LUSTRAL 622','Kg',3,NULL,'INR','Finishing',12,'2026-10-05 07:20:46','2026-10-06 06:37:22',NULL,'Active',16,16,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,'AKM Finishing Chemicals',1.00,497.00,'Kg',497.00,0.00,0.00,0.00,0.00,497.000000,24,NULL,NULL,NULL,NULL,NULL),(226,'MAT-00226','Roda Base 4133-UP','Kg',3,NULL,'INR','Wet-end',11,'2026-10-06 10:37:17','2026-10-11 07:12:44',NULL,'Active',16,16,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'AKM Chemicals',120.00,23880.00,'Kg',120.00,0.00,0.00,0.00,0.00,199.000000,NULL,NULL,NULL,NULL,NULL,NULL),(227,'MAT-00227','RA-27006','Kg',3,NULL,'INR','Wet-end',11,'2026-10-06 10:46:40','2026-10-09 10:42:43',NULL,'Active',16,7,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'AKM Chemicals',120.00,18000.00,'Kg',120.00,0.00,0.00,0.00,0.00,150.000000,NULL,NULL,NULL,NULL,NULL,NULL),(228,'MAT-00228','Roda Link 3315/F-1','Kg',3,NULL,'INR','Finishing',12,'2026-10-06 10:52:40','2026-10-06 10:59:07',NULL,'Active',16,16,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,5.00,1305.00,'Kg',5.00,0.00,0.00,0.00,0.00,261.000000,NULL,NULL,NULL,NULL,NULL,NULL),(229,'MAT-00229','Iride BLU C','Kg',3,NULL,'INR','Finishing',12,'2026-10-06 11:04:00','2026-10-09 12:08:17',NULL,'Active',16,16,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,5.00,4800.00,'Kg',5.00,0.00,0.00,0.00,0.00,960.000000,NULL,NULL,NULL,NULL,NULL,NULL),(230,'MAT-00230','Basic Chromium Sulphate Spray Dryed','Kg',3,NULL,'INR','Finishing',12,'2026-10-06 11:11:41','2026-10-06 11:12:22',NULL,'Active',16,16,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'AKM Finishing Chemicals',500.00,52625.00,'Kg',105.25,0.00,0.00,0.00,0.00,105.250000,NULL,NULL,NULL,NULL,NULL,NULL),(231,'MAT-00231','Coloderm Brown NR','Kg',3,NULL,'INR','Finishing',12,'2026-10-06 11:16:38','2026-10-10 13:02:12',NULL,'Active',16,16,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'AKM Chemicals',3.00,3091.23,'Kg',3.00,0.00,0.00,0.00,0.00,1030.410000,19,NULL,NULL,NULL,NULL,NULL),(232,'MAT-00232','DERMAT BROWN SGR','Kg',3,NULL,'INR','Wet-end',11,'2026-10-09 13:40:07','2026-10-09 13:40:07',NULL,'Active',16,NULL,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'AKM Chemicals',0.00,0.00,'Kg',0.00,0.00,0.00,0.00,0.00,0.000000,29,NULL,NULL,NULL,NULL,NULL),(233,'MAT-00233','common Salt','Kg',3,NULL,'INR','Wet-end',11,'2026-10-11 07:06:41','2026-10-11 07:08:13',NULL,'Active',16,16,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'AKM Chemicals',50.00,500.00,'Kg',50.00,0.00,0.00,0.00,0.00,10.000000,NULL,NULL,NULL,NULL,NULL,NULL),(234,'MAT-00234','largetan 7R','Kg',3,NULL,'INR','Wet-end',11,'2026-10-16 11:13:50','2026-10-22 10:52:17',NULL,'Active',16,16,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'AKM Chemicals',5.00,740.00,'Kg',6.00,0.00,0.00,0.00,0.00,148.000000,NULL,NULL,NULL,NULL,NULL,NULL),(235,'MAT-00235','LARGENTAN WHITE GP','Kg',3,NULL,'INR','Wet-end',11,'2026-10-16 12:39:18','2026-10-16 12:39:18',NULL,'Active',16,NULL,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'AKM Chemicals',10.00,1950.00,'Kg',10.00,0.00,0.00,0.00,0.00,195.000000,NULL,NULL,NULL,NULL,NULL,NULL),(236,'MAT-00236','DK Brown','Kg',3,NULL,'INR','Finishing',12,'2026-10-16 13:13:23','2026-10-17 10:30:06',NULL,'Active',16,16,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'AKM Chemicals',5.00,3010.00,'Kg',1.00,0.00,0.00,0.00,0.00,602.000000,21,NULL,NULL,NULL,NULL,NULL),(237,'MAT-00237','Brown','Kg',3,NULL,'INR','Finishing',12,'2026-10-16 13:15:27','2026-10-17 10:29:19',NULL,'Active',16,16,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'AKM Chemicals',5.00,2520.00,'Kg',1.00,0.00,0.00,0.00,0.00,504.000000,21,NULL,NULL,NULL,NULL,NULL),(238,'MAT-00238','27047','Kg',3,NULL,'INR','Wet-end',11,'2026-10-17 11:53:12','2026-10-17 11:53:12',NULL,'Active',16,NULL,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'AKM Chemicals',2.00,824.00,'Kg',2.00,0.00,0.00,0.00,0.00,412.000000,6,NULL,NULL,NULL,NULL,NULL),(239,'MAT-00239','HM 22677','Kg',3,NULL,'INR','Wet-end',11,'2026-10-17 12:01:54','2026-10-17 12:01:54',NULL,'Active',16,NULL,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,1.00,1438.00,'Kg',1.00,0.00,0.00,0.00,0.00,1438.000000,NULL,NULL,NULL,NULL,NULL,NULL),(240,'MAT-00240','RC 17708','Kg',3,NULL,'INR','Wet-end',11,'2026-10-17 12:03:23','2026-10-17 12:05:04',NULL,'Active',16,16,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'AKM Chemicals',2.00,1320.00,'Kg',2.00,0.00,0.00,0.00,0.00,660.000000,NULL,NULL,NULL,NULL,NULL,NULL),(241,'MAT-00241','BM 904 RU','Kg',3,NULL,'INR','Wet-end',11,'2026-10-17 12:04:43','2026-10-17 12:04:43',NULL,'Active',16,NULL,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'AKM Chemicals',2.00,1316.00,'Kg',2.00,0.00,0.00,0.00,0.00,658.000000,6,NULL,NULL,NULL,NULL,NULL),(242,'MAT-00242','SYNTHOL ES 150','Kg',3,NULL,'INR','Wet-end',11,'2026-10-17 12:28:29','2026-10-17 12:28:29',NULL,'Active',16,NULL,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,140.00,29400.00,'Kg',140.00,0.00,0.00,0.00,0.00,210.000000,NULL,NULL,NULL,NULL,NULL,NULL),(243,'MAT-00243','RODA PUR K34/N','Kg',3,NULL,'INR','Finishing',12,'2026-10-17 12:30:14','2026-10-17 12:30:14',NULL,'Active',16,NULL,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,2.00,2640.00,'Kg',2.00,0.00,0.00,0.00,0.00,1320.000000,16,NULL,NULL,NULL,NULL,NULL),(244,'MAT-00244','RODA KP BLACK SUPER','Kg',3,NULL,'INR','Finishing',1,'2026-10-17 12:31:20','2026-10-17 12:31:39',NULL,'Active',16,16,NULL,'1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,1.00,1029.00,'Kg',1.00,0.00,0.00,0.00,0.00,1029.000000,16,NULL,NULL,NULL,NULL,NULL),(245,'MAT-00245','AQUARIUS WS','Kg',3,NULL,'INR','Finishing',2,'2026-10-19 10:49:15','2026-10-19 10:51:36',NULL,'Active',16,16,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'AKM Chemicals',5.00,3035.00,'Kg',0.00,0.00,0.00,0.00,0.00,607.000000,21,NULL,NULL,NULL,NULL,NULL),(246,'MAT-00246','BM 349','Kg',3,NULL,'INR','Finishing',12,'2026-10-19 10:53:18','2026-10-19 10:53:18',NULL,'Active',16,NULL,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'AKM Chemicals',3.00,1395.00,'Kg',3.00,0.00,0.00,0.00,0.00,465.000000,NULL,NULL,NULL,NULL,NULL,NULL),(247,'MAT-00247','SOLEDA BIANCO','Kg',3,NULL,'INR','Finishing',NULL,'2026-10-19 10:55:47','2026-10-19 10:55:47',NULL,'Active',16,NULL,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'AKM Chemicals',1.00,693.00,'Kg',1.00,0.00,0.00,0.00,0.00,693.000000,21,NULL,NULL,NULL,NULL,NULL),(248,'MAT-00248','COLOUDEM BROWN G','Kg',3,NULL,'INR','Finishing',12,'2026-10-19 10:58:31','2026-10-19 10:58:31',NULL,'Active',16,NULL,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0.00,0.00,'Kg',0.00,0.00,0.00,0.00,0.00,745.000000,NULL,NULL,NULL,NULL,NULL,NULL),(249,'MAT-00249','COLODERM RED SRS','Kg',3,NULL,'INR','Finishing',12,'2026-10-19 11:05:35','2026-10-19 11:05:35',NULL,'Active',16,NULL,NULL,'15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'AKM Chemicals',1.00,1030.41,'Kg',1.00,0.00,0.00,0.00,0.00,1030.410000,NULL,NULL,NULL,NULL,NULL,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `outbound_deliveries`
--

LOCK TABLES `outbound_deliveries` WRITE;
/*!40000 ALTER TABLE `outbound_deliveries` DISABLE KEYS */;
INSERT INTO `outbound_deliveries` VALUES (1,'OBD-2026-00001','2026-10-23',8,28,NULL,NULL,NULL,'DCN-2026-00001',10.0000,872.00,NULL,'Posted',7,NULL,'2026-10-23 13:44:23','2026-10-23 13:44:23');
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `outbound_delivery_items`
--

LOCK TABLES `outbound_delivery_items` WRITE;
/*!40000 ALTER TABLE `outbound_delivery_items` DISABLE KEYS */;
INSERT INTO `outbound_delivery_items` VALUES (1,1,209,'Kg',532.5000,10.0000,87.2000,872.00,NULL,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `physical_stock_entries`
--

LOCK TABLES `physical_stock_entries` WRITE;
/*!40000 ALTER TABLE `physical_stock_entries` DISABLE KEYS */;
INSERT INTO `physical_stock_entries` VALUES (1,'PSE-2024-00045','2024-05-20','2024-05-20',NULL,'All','Main Store',NULL,NULL,NULL,'All',NULL,'All','Ref / Document No.',6,2,4,-7.000,-1320.00,'Cancelled','Enter remarks (optional)...',1,NULL,'2026-10-14 10:28:16','2026-07-21 07:07:33','2026-10-14 10:28:16'),(2,'PSE-2026-00001','2026-10-14','2026-10-14',8,'All','Main Store',NULL,NULL,NULL,'All',NULL,'KG',NULL,1,0,1,27.200,27.20,'Cancelled',NULL,16,7,'2026-10-14 11:40:03','2026-10-14 10:59:11','2026-10-14 11:40:03'),(3,'PSE-2026-00002','2026-10-14','2026-10-14',8,'All','Main Store',NULL,NULL,NULL,'All',NULL,'KG',NULL,1,0,1,27.200,27.20,'Cancelled',NULL,7,7,'2026-10-14 11:51:29','2026-10-14 11:40:39','2026-10-14 11:51:29'),(4,'PSE-2026-00003','2026-10-14','2026-10-14',8,'All','Main Store',NULL,NULL,NULL,'All',NULL,'KG',NULL,1,0,1,27.200,27.20,'Cancelled',NULL,7,7,'2026-10-14 11:53:30','2026-10-14 11:51:51','2026-10-14 11:53:30'),(5,'PSE-2026-00004','2026-10-14','2026-10-14',8,'All','Main Store',NULL,NULL,NULL,'All',NULL,'KG',NULL,1,0,1,14.200,14.20,'Cancelled',NULL,16,16,'2026-10-14 12:51:44','2026-10-14 12:38:19','2026-10-14 12:51:44'),(6,'PSE-2026-00005','2026-10-14','2026-10-14',8,'All','Main Store',NULL,NULL,NULL,'All',NULL,'KG',NULL,1,0,1,14.200,14.20,'Completed',NULL,16,16,NULL,'2026-10-14 12:52:37','2026-10-14 12:52:42'),(7,'PSE-2026-00006','2026-10-16','0202-10-16',8,'All','Main Store',NULL,NULL,NULL,'All',NULL,'KG',NULL,1,0,1,-182.600,-182.60,'Draft',NULL,16,NULL,NULL,'2026-10-17 12:05:20','2026-10-17 12:05:20'),(8,'PSE-2026-00007','2026-10-15','2026-10-15',8,'All','Main Store',NULL,NULL,NULL,'All',NULL,'KG',NULL,4,0,4,-54.210,-54.21,'Completed','BILL NO 1917\nDATE : 15/10/2026',16,16,NULL,'2026-10-17 12:10:28','2026-10-22 10:56:03'),(9,'PSE-2026-00008','2026-10-15','2026-10-15',8,'All','Main Store',NULL,NULL,NULL,'All',NULL,'KG',NULL,1,0,1,38.980,38.98,'Completed',NULL,16,16,NULL,'2026-10-17 12:19:25','2026-10-22 10:55:47'),(10,'PSE-2026-00009','2026-10-14','2026-10-14',8,'All','Main Store',NULL,NULL,NULL,'All',NULL,'KG',NULL,1,0,1,100.500,100.50,'Completed','INV 2223\nDATE 14/10/2026',16,16,NULL,'2026-10-17 12:21:26','2026-10-22 10:55:37'),(11,'PSE-2026-00010','2026-10-09','2026-10-09',8,'All','Main Store',NULL,NULL,NULL,'All',NULL,'KG',NULL,1,0,1,43.500,43.50,'Completed',NULL,16,16,NULL,'2026-10-17 12:26:01','2026-10-22 10:55:28'),(12,'PSE-2026-00011','2026-10-09','2026-10-09',8,'All','Main Store',NULL,NULL,NULL,'All',NULL,'KG',NULL,1,0,1,10.500,10.50,'Completed','INV 1889\nDATE 09-10-2026',16,16,NULL,'2026-10-17 13:28:09','2026-10-22 10:55:18'),(13,'PSE-2026-00012','2026-10-17','2026-10-17',8,'All','Main Store',NULL,NULL,NULL,'All',NULL,'KG',NULL,1,0,1,3.600,3.60,'Completed','INV : 2034 \nDATE : 17/10/2026',16,16,NULL,'2026-10-19 10:40:23','2026-10-22 10:55:09'),(14,'PSE-2026-00013','2026-10-14','2026-10-14',8,'All','Main Store',NULL,NULL,NULL,'All',NULL,'KG',NULL,3,1,2,-0.450,-0.45,'Completed','INV : 1091\nDATE : 14/10/2026',16,16,NULL,'2026-10-19 10:50:58','2026-10-22 10:54:57'),(15,'PSE-2026-00014','2026-10-08','2026-10-08',8,'All','Main Store',NULL,NULL,NULL,'All',NULL,'KG',NULL,1,0,1,24.000,24.00,'Completed','inv : 1929\ndate : 8/10/2026',16,16,NULL,'2026-10-20 11:06:06','2026-10-22 10:54:43'),(16,'PSE-2026-00015','2026-10-08','2026-10-08',8,'All','Main Store',NULL,NULL,NULL,'All',NULL,'KG',NULL,1,0,1,1.350,1.35,'Completed','inv : 1067\ndate : 8/10/2026',16,16,NULL,'2026-10-20 11:46:46','2026-10-22 10:54:34'),(17,'PSE-2026-00016','2026-10-06','2026-10-06',8,'All','Main Store',NULL,NULL,NULL,'All',NULL,'KG',NULL,4,0,4,241.750,241.75,'Completed','inv : 1404\ndate : 6/10/2026',16,16,NULL,'2026-10-20 11:48:27','2026-10-22 10:54:23');
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
) ENGINE=InnoDB AUTO_INCREMENT=113 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `physical_stock_entry_items`
--

LOCK TABLES `physical_stock_entry_items` WRITE;
/*!40000 ALTER TABLE `physical_stock_entry_items` DISABLE KEYS */;
INSERT INTO `physical_stock_entry_items` VALUES (1,1,1,'RAW-001','Cow Leather - Black','SQ.FT','BATCH-240501','A-01-01',125.000,120.000,-5.000,-1250.00,NULL,'2026-07-21 07:07:33','2026-07-21 07:07:33'),(2,1,2,'RAW-002','Sheep Leather - White','SQ.FT','BATCH-240528','A-01-02',200.000,200.000,0.000,0.00,NULL,'2026-07-21 07:07:33','2026-07-21 07:07:33'),(3,1,3,'CHEM-001','Chrome Powder','KG','BATCH-240503','B-02-01',50.000,48.000,-2.000,-320.00,NULL,'2026-07-21 07:07:33','2026-07-21 07:07:33'),(4,1,4,'CHEM-005','Retanning Agent','KG','BATCH-240530','B-02-02',75.000,80.000,5.000,750.00,NULL,'2026-07-21 07:07:33','2026-07-21 07:07:33'),(5,1,5,'PKG-010','Plastic Bag Large','NOS','BATCH-240501','C-03-01',1000.000,1000.000,0.000,0.00,NULL,'2026-07-21 07:07:33','2026-07-21 07:07:33'),(6,1,6,'ACC-002','Edge Paint - Black','LTR','BATCH-240525','B-02-03',30.000,25.000,-5.000,-500.00,NULL,'2026-07-21 07:07:33','2026-07-21 07:07:33'),(11,2,1,'MAT-00192','AC 1 Eco Jet Black','Kg',NULL,NULL,7.800,35.000,27.200,27.20,NULL,'2026-10-14 11:39:24','2026-10-14 11:39:24'),(15,3,1,'MAT-00192','AC 1 Eco Jet Black','Kg',NULL,'test',7.800,35.000,27.200,27.20,NULL,'2026-10-14 11:46:05','2026-10-14 11:46:05'),(17,4,1,'MAT-00192','AC 1 Eco Jet Black','Kg',NULL,NULL,7.800,35.000,27.200,27.20,NULL,'2026-10-14 11:51:57','2026-10-14 11:51:57'),(19,5,1,'MAT-00147','IW08','Kg',NULL,NULL,0.800,15.000,14.200,14.20,NULL,'2026-10-14 12:38:43','2026-10-14 12:38:43'),(21,6,1,'MAT-00147','IW08','Kg',NULL,NULL,0.800,15.000,14.200,14.20,NULL,'2026-10-14 12:52:42','2026-10-14 12:52:42'),(22,7,1,'MAT-00123','Corial Microbinder AM','Kg',NULL,NULL,183.600,1.000,-182.600,-182.60,NULL,'2026-10-17 12:05:20','2026-10-17 12:05:20'),(95,17,1,'MAT-00030','Retanal RCN40','Kg',NULL,NULL,46.500,130.000,83.500,83.50,NULL,'2026-10-22 10:54:23','2026-10-22 10:54:23'),(96,17,2,'MAT-00051','Retanal CRO','Kg',NULL,NULL,58.200,100.000,41.800,41.80,NULL,'2026-10-22 10:54:23','2026-10-22 10:54:23'),(97,17,3,'MAT-00029','Butan 7822','Kg',NULL,NULL,77.000,120.000,43.000,43.00,NULL,'2026-10-22 10:54:23','2026-10-22 10:54:23'),(98,17,4,'MAT-00042','Butan 7864','Kg',NULL,NULL,26.550,100.000,73.450,73.45,NULL,'2026-10-22 10:54:23','2026-10-22 10:54:23'),(99,16,1,'MAT-00109','Beige U-NS','Kg',NULL,NULL,3.650,5.000,1.350,1.35,NULL,'2026-10-22 10:54:34','2026-10-22 10:54:34'),(100,15,1,'MAT-00035','Coripol UFB/W','Kg',NULL,NULL,26.000,50.000,24.000,24.00,NULL,'2026-10-22 10:54:43','2026-10-22 10:54:43'),(101,14,1,'MAT-00231','Coloderm Brown NR','Kg',NULL,NULL,0.200,1.000,0.800,0.80,NULL,'2026-10-22 10:54:57','2026-10-22 10:54:57'),(102,14,2,'MAT-00249','COLODERM RED SRS','Kg',NULL,NULL,1.000,1.000,0.000,0.00,NULL,'2026-10-22 10:54:57','2026-10-22 10:54:57'),(103,14,3,'MAT-00110','Red Brown CRN','Kg',NULL,NULL,3.250,2.000,-1.250,-1.25,NULL,'2026-10-22 10:54:57','2026-10-22 10:54:57'),(104,13,1,'MAT-00119','Hyper 93','Kg',NULL,NULL,16.400,20.000,3.600,3.60,NULL,'2026-10-22 10:55:09','2026-10-22 10:55:09'),(105,12,1,'MAT-00069','Titanium Dioxide','Kg',NULL,NULL,14.500,25.000,10.500,10.50,NULL,'2026-10-22 10:55:18','2026-10-22 10:55:18'),(106,11,1,'MAT-00056','Pidisyntan TR','Kg',NULL,NULL,56.500,100.000,43.500,43.50,NULL,'2026-10-22 10:55:28','2026-10-22 10:55:28'),(107,10,1,'MAT-00038','Coripol ESS','Kg',NULL,NULL,19.500,120.000,100.500,100.50,NULL,'2026-10-22 10:55:37','2026-10-22 10:55:37'),(108,9,1,'MAT-00035','Coripol UFB/W','Kg',NULL,NULL,26.000,64.980,38.980,38.98,NULL,'2026-10-22 10:55:47','2026-10-22 10:55:47'),(109,8,1,'MAT-00125','MTW 4506','Kg',NULL,NULL,50.640,20.000,-30.640,-30.64,NULL,'2026-10-22 10:56:03','2026-10-22 10:56:03'),(110,8,2,'MAT-00167','Lucido 1186','Kg',NULL,NULL,25.500,10.000,-15.500,-15.50,NULL,'2026-10-22 10:56:03','2026-10-22 10:56:03'),(111,8,3,'MAT-00168','Acrilan 2043 E','Kg',NULL,NULL,11.500,5.000,-6.500,-6.50,NULL,'2026-10-22 10:56:03','2026-10-22 10:56:03'),(112,8,4,'MAT-00158','Argo Fix 172','Kg',NULL,NULL,2.570,1.000,-1.570,-1.57,NULL,'2026-10-22 10:56:03','2026-10-22 10:56:03');
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
INSERT INTO `price_approval_items` VALUES (1,1,1,1,1,'CP-1001','Chemicals','KG',210.00,205.00,'INR',-5.00,-2.38,'2024-05-16',NULL,210.00,'2024-05-01','Pending','Monthly revision','Price effective from 16 May 2024','2026-07-21 07:07:33','2026-07-21 07:07:33'),(2,2,1,2,5,NULL,'Chemicals','LTR',64.00,60.00,'INR',-4.00,-6.25,'2024-05-18',NULL,64.00,'2024-04-01','Pending','Price reduced','Quarterly revision','2026-07-21 07:07:33','2026-07-21 07:07:33'),(3,3,1,3,2,'ST-2001','Chemicals','KG',48.00,52.00,'INR',4.00,8.33,'2024-05-20',NULL,48.00,'2024-05-10','Rejected','New supplier','test','2026-07-21 07:07:33','2026-10-27 07:41:33'),(4,4,1,1,6,'FL-4001','Chemicals','KG',95.00,92.00,'INR',-3.00,-3.16,'2024-05-21',NULL,95.00,'2024-04-01','Approved','Bulk approved','Old price','2026-07-21 07:07:33','2026-10-27 07:38:52');
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
INSERT INTO `price_approval_requests` VALUES (1,'PRQ-2024-0012','2024-05-16',1,'Purchase',1,'Pending','Supplier has given revised price list for May 2024. Approval requested.','Price revision',1,NULL,NULL,'2026-07-21 07:07:33','2026-07-21 07:07:33'),(2,'PRQ-2024-0013','2024-05-16',1,'Purchase',1,'Pending','Price adjustment for new contract','FineChem industries price update',1,NULL,NULL,'2026-07-21 07:07:33','2026-07-21 07:07:33'),(3,'PRQ-2024-0014','2024-05-17',1,'Purchase',1,'Rejected','New supplier pricing','Tannery Supplies Ltd. - Sodium Sulphide',1,7,NULL,'2026-07-21 07:07:33','2026-10-27 07:41:33'),(4,'PRQ-2024-0015','2024-05-17',1,'Purchase',1,'Partially Approved','Price adjustment','Cow Leather - Wet Blue price update',1,7,NULL,'2026-07-21 07:07:33','2026-10-27 07:38:52');
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `price_approval_workflow`
--

LOCK TABLES `price_approval_workflow` WRITE;
/*!40000 ALTER TABLE `price_approval_workflow` DISABLE KEYS */;
INSERT INTO `price_approval_workflow` VALUES (1,1,1,'Submitted',1,'2026-07-21 07:07:33','Submitted for approval','Draft','Pending','2026-07-21 07:07:33'),(2,4,NULL,'Approved',7,'2026-10-27 07:38:52','Bulk approved','Pending','Partially Approved','2026-10-27 07:38:52'),(3,3,NULL,'Rejected',7,'2026-10-27 07:41:33','test','Pending','Partially Rejected','2026-10-27 07:41:33');
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
  `uom` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
INSERT INTO `process_stages` VALUES (1,'INS-01','Leather Inspection','Inspect incoming leather for defects',10,NULL,'Inactive','2026-07-05 14:29:55','2026-09-01 16:07:50',NULL,NULL,'2026-09-01 16:07:50'),(2,'BUFF-01','Buffing','Buff leather surface for smoothness',20,NULL,'Inactive','2026-07-05 14:29:55','2026-09-01 16:07:50',NULL,NULL,'2026-09-01 16:07:50'),(3,'SPRAY-01','Spray Base Coat','Apply base coat spraying',30,NULL,'Inactive','2026-07-05 14:29:55','2026-09-01 16:07:50',NULL,NULL,'2026-09-01 16:07:50'),(4,'DRY-01','Drying','Dry leather in tunnel dryer',40,NULL,'Inactive','2026-07-05 14:29:55','2026-09-01 16:07:50',NULL,7,'2026-09-01 16:07:50'),(5,'IRON-01','Ironing','Apply heat and pressure',50,NULL,'Inactive','2026-07-05 14:29:55','2026-09-01 16:07:50',NULL,NULL,'2026-09-01 16:07:50'),(6,'SPRAY-02','Top Coat','Apply top finish coating',60,NULL,'Inactive','2026-07-05 14:29:55','2026-09-01 16:07:50',NULL,NULL,'2026-09-01 16:07:50'),(7,'DRY-02','Final Drying','Final drying process',70,NULL,'Inactive','2026-07-05 14:29:55','2026-09-01 16:07:50',NULL,NULL,'2026-09-01 16:07:50'),(8,'INS-02','Final Inspection','QC check for finished leather',80,NULL,'Inactive','2026-07-05 14:29:55','2026-09-01 16:07:50',NULL,NULL,'2026-09-01 16:07:50'),(10,'PS-00002','testing','',60,NULL,'Inactive','2026-07-13 22:36:31','2026-09-01 16:07:50',1,1,'2026-09-01 16:07:50'),(11,'PS-00003','Wet End','Wet End',1,'Piece','Active','2026-09-01 16:08:32','2026-09-01 16:08:32',7,NULL,NULL),(12,'PS-00004','Finishing','',2,'Piece','Active','2026-09-01 16:08:52','2026-10-24 15:21:14',7,7,NULL),(13,'PS-00005','Measurement','',3,'Square Feet','Active','2026-09-01 16:09:10','2026-10-24 15:21:22',7,7,NULL),(14,'PS-00006','Packing','',4,'Piece','Active','2026-09-01 16:09:28','2026-09-01 16:09:28',7,NULL,NULL);
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
  KEY `idx_pps_plan_stage` (`plan_id`,`stage_name`),
  CONSTRAINT `fk_pps_plan` FOREIGN KEY (`plan_id`) REFERENCES `production_plans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=162 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `production_plan_stages`
--

LOCK TABLES `production_plan_stages` WRITE;
/*!40000 ALTER TABLE `production_plan_stages` DISABLE KEYS */;
INSERT INTO `production_plan_stages` VALUES (136,14,1,13,'Measurement',0.00,3500.00,0.00,100.00,0.00,738.00,2762.00,0.00,0.00,'In Progress',NULL,'2026-10-01 12:22:00','2026-10-01 12:22:00'),(137,14,2,12,'Finishing',0.00,3500.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'Planned',NULL,'2026-10-01 12:22:00','2026-10-01 12:22:00'),(139,15,1,11,'Wet End',0.00,532.00,0.00,100.00,0.00,14.10,2500.00,0.00,0.00,'Completed',NULL,'2026-10-10 16:28:00','2026-10-10 16:28:00'),(140,16,1,11,'Wet End',0.00,1100.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'Pending',NULL,'2026-10-12 12:13:13','2026-10-12 12:13:13'),(142,17,1,11,'Wet End',0.00,545.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'Pending',NULL,'2026-10-14 13:33:53','2026-10-14 13:33:53'),(143,18,1,11,'Wet End',0.00,625.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'Pending',NULL,'2026-10-16 11:02:42','2026-10-16 11:02:42'),(144,18,2,13,'Measurement',0.00,2100.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'Pending',NULL,'2026-10-16 11:02:42','2026-10-16 11:02:42'),(145,18,3,12,'Finishing',0.00,625.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'Pending',NULL,'2026-10-16 11:02:42','2026-10-16 11:02:42'),(146,18,4,14,'Packing',0.00,625.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'Pending',NULL,'2026-10-16 11:02:42','2026-10-16 11:02:42'),(147,19,1,11,'Wet End',0.00,625.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'Pending',NULL,'2026-10-16 11:24:00','2026-10-16 11:24:00'),(148,19,2,13,'Measurement',0.00,2100.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'Pending',NULL,'2026-10-16 11:24:00','2026-10-16 11:24:00'),(149,19,3,12,'Finishing',0.00,625.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'Pending',NULL,'2026-10-16 11:24:00','2026-10-16 11:24:00'),(150,19,4,14,'Packing',0.00,625.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'Pending',NULL,'2026-10-16 11:24:00','2026-10-16 11:24:00'),(151,20,1,11,'Wet End',0.00,625.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'Pending',NULL,'2026-10-16 11:26:39','2026-10-16 11:26:39'),(152,20,2,13,'Measurement',0.00,2100.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'Pending',NULL,'2026-10-16 11:26:39','2026-10-16 11:26:39'),(153,20,4,14,'Packing',0.00,625.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'Pending',NULL,'2026-10-16 11:26:39','2026-10-16 11:26:39'),(154,20,3,12,'Finishing',0.00,625.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'Pending',NULL,'2026-10-16 11:26:39','2026-10-16 11:26:39'),(155,21,1,11,'Wet End',0.00,472.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'Pending',NULL,'2026-10-17 11:19:10','2026-10-17 11:19:10'),(156,21,2,13,'Measurement',0.00,1388.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'Pending',NULL,'2026-10-17 11:19:10','2026-10-17 11:19:10'),(157,21,3,12,'Finishing',0.00,425.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'Pending',NULL,'2026-10-17 11:19:10','2026-10-17 11:19:10'),(158,21,4,14,'Packing',0.00,425.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'Pending',NULL,'2026-10-17 11:19:10','2026-10-17 11:19:10'),(159,22,1,11,'Wet End',0.00,475.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'Pending',NULL,'2026-10-17 11:43:24','2026-10-17 11:43:24'),(160,22,2,13,'Measurement',0.00,1400.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'Pending',NULL,'2026-10-17 11:43:24','2026-10-17 11:43:24'),(161,22,3,12,'Finishing',0.00,425.00,0.00,100.00,0.00,0.00,0.00,0.00,0.00,'Pending',NULL,'2026-10-17 11:43:24','2026-10-17 11:43:24');
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
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `production_plans`
--

LOCK TABLES `production_plans` WRITE;
/*!40000 ALTER TABLE `production_plans` DISABLE KEYS */;
INSERT INTO `production_plans` VALUES (14,'PRP-000001','2026-09-28',16,NULL,8,NULL,'Sheep  Full Grain White','White',NULL,NULL,'Pcs',3500.00,92.00,NULL,0.00,3500.00,7000.00,0.00,0,0.00,0.00,0.00,7000.00,NULL,NULL,'Medium',NULL,'Completed',7,16,'2026-09-28 08:48:30','2026-10-01 12:22:00',NULL),(15,'PRP-000002','2026-09-28',17,NULL,8,NULL,'Sheep  Softy Black','Black',NULL,NULL,'Pcs',2500.00,92.00,NULL,2500.00,2500.00,532.00,0.00,0,1968.00,0.00,0.00,532.00,NULL,NULL,'Medium',NULL,'Completed',16,7,'2026-09-28 11:20:34','2026-10-10 16:28:00',NULL),(16,'PRP-000003','2026-10-05',19,NULL,12,NULL,'Sheep  Softy Black','Black',NULL,NULL,'Pcs',7200.00,92.00,NULL,0.00,7200.00,1100.00,0.00,0,6100.00,0.00,0.00,1100.00,NULL,NULL,'Medium',NULL,'Pending',16,16,'2026-10-05 05:49:41','2026-10-12 12:13:13',NULL),(17,'PRP-000004','2026-10-14',24,NULL,14,NULL,'Sheep Lining','Beige ',NULL,NULL,'Pcs',2100.00,92.00,NULL,0.00,2100.00,545.00,0.00,0,1555.00,0.00,0.00,545.00,NULL,NULL,'Medium',NULL,'Pending',7,7,'2026-10-14 13:33:15','2026-10-14 13:33:53',NULL),(18,'PRP-000005','2026-10-16',24,NULL,14,NULL,'Sheep Lining','Beige ',NULL,NULL,'Pcs',2100.00,92.00,NULL,0.00,2100.00,3975.00,0.00,0,0.00,0.00,0.00,3975.00,NULL,NULL,'Medium',NULL,'Pending',16,NULL,'2026-10-16 11:02:42','2026-10-16 11:02:42',NULL),(19,'PRP-000006','2026-09-26',24,NULL,14,NULL,'Sheep Lining','Beige ',NULL,NULL,'Pcs',2100.00,92.00,NULL,0.00,2100.00,3975.00,0.00,0,0.00,0.00,0.00,3975.00,NULL,NULL,'Medium',NULL,'Pending',16,NULL,'2026-10-16 11:24:00','2026-10-16 11:24:00',NULL),(20,'PRP-000007','2026-10-16',24,NULL,14,NULL,'Sheep Lining','Beige ',NULL,NULL,'Pcs',2100.00,92.00,NULL,0.00,2100.00,3975.00,0.00,0,0.00,0.00,0.00,3975.00,NULL,NULL,'Medium',NULL,'Pending',16,NULL,'2026-10-16 11:26:39','2026-10-16 11:26:39',NULL),(21,'PRP-000008','2026-10-17',24,NULL,14,NULL,'Sheep Lining','Ice',NULL,NULL,'Pcs',1400.00,92.00,NULL,0.00,1400.00,2710.00,0.00,0,0.00,0.00,0.00,2710.00,NULL,NULL,'Medium',NULL,'Pending',16,NULL,'2026-10-17 11:19:10','2026-10-17 11:19:10',NULL),(22,'PRP-000009','2026-10-17',24,NULL,14,NULL,'Sheep Lining','Ice',NULL,NULL,'Pcs',1400.00,92.00,NULL,0.00,1400.00,2300.00,0.00,0,0.00,0.00,0.00,2300.00,NULL,NULL,'Medium',NULL,'Pending',16,NULL,'2026-10-17 11:43:24','2026-10-17 11:43:24',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `production_status_orders`
--

LOCK TABLES `production_status_orders` WRITE;
/*!40000 ALTER TABLE `production_status_orders` DISABLE KEYS */;
INSERT INTO `production_status_orders` VALUES (20,14,'PRP-000001','2026-09-28','KFA',8,'Sheep  Full Grain White','White','Wet End',0.00,2762.00,0.00,'Pcs','Posted',NULL,7,7,7,'2026-09-28 08:48:30','2026-09-28 10:53:46','2026-09-28 10:53:46',NULL),(21,15,'PRP-000002','2026-09-28','KFA',8,'Sheep  Softy Black','Black','Wet End',0.00,2500.00,0.00,'Pcs','Completed',NULL,16,7,NULL,'2026-09-28 11:20:34','2026-10-07 06:30:24',NULL,NULL),(22,14,'PRP-000001','2026-09-28','KFA',8,'Sheep  Full Grain White','White','Measurement',165.00,106.00,6894.00,'Pcs','In Progress',NULL,7,7,NULL,'2026-09-30 07:21:09','2026-10-02 15:55:54',NULL,NULL),(23,14,'PRP-000001','2026-09-28','KFA',8,'Sheep  Full Grain White','White','Packing',0.00,0.00,0.00,'Pcs','Pending',NULL,7,7,NULL,'2026-09-30 07:21:09','2026-09-30 07:21:09',NULL,NULL),(24,14,'PRP-000001','2026-09-28','KFA',8,'Sheep  Full Grain White','White','Finishing',0.00,0.00,0.00,'Pcs','Pending',NULL,16,16,NULL,'2026-10-01 12:22:00','2026-10-01 12:22:00',NULL,NULL),(25,16,'PRP-000003','2026-10-05','UFM',12,'Sheep  Softy Black','Black',NULL,0.00,0.00,0.00,'Pcs','Pending',NULL,16,16,NULL,'2026-10-05 05:49:41','2026-10-05 05:49:41',NULL,NULL),(26,16,'PRP-000003','2026-10-05','UFM',12,'Sheep  Softy Black','Black','Wet End',0.00,0.00,0.00,'Pcs','Pending',NULL,16,16,NULL,'2026-10-12 12:13:13','2026-10-12 12:13:13',NULL,NULL),(27,17,'PRP-000004','2026-10-14','ACC',14,'Sheep Lining','Beige ','Wet End',0.00,0.00,0.00,'Pcs','Pending',NULL,7,7,NULL,'2026-10-14 13:33:15','2026-10-14 13:33:15',NULL,NULL),(28,18,'PRP-000005','2026-10-16','ACC',14,'Sheep Lining','Beige ','Wet End',0.00,0.00,0.00,'Pcs','Pending',NULL,16,16,NULL,'2026-10-16 11:02:42','2026-10-16 11:02:42',NULL,NULL),(29,18,'PRP-000005','2026-10-16','ACC',14,'Sheep Lining','Beige ','Measurement',0.00,0.00,0.00,'Pcs','Pending',NULL,16,16,NULL,'2026-10-16 11:02:42','2026-10-16 11:02:42',NULL,NULL),(30,18,'PRP-000005','2026-10-16','ACC',14,'Sheep Lining','Beige ','Finishing',0.00,0.00,0.00,'Pcs','Pending',NULL,16,16,NULL,'2026-10-16 11:02:42','2026-10-16 11:02:42',NULL,NULL),(31,18,'PRP-000005','2026-10-16','ACC',14,'Sheep Lining','Beige ','Packing',0.00,0.00,0.00,'Pcs','Pending',NULL,16,16,NULL,'2026-10-16 11:02:42','2026-10-16 11:02:42',NULL,NULL),(32,19,'PRP-000006','2026-09-26','ACC',14,'Sheep Lining','Beige ','Wet End',0.00,0.00,0.00,'Pcs','Pending',NULL,16,16,NULL,'2026-10-16 11:24:00','2026-10-16 11:24:00',NULL,NULL),(33,19,'PRP-000006','2026-09-26','ACC',14,'Sheep Lining','Beige ','Measurement',0.00,0.00,0.00,'Pcs','Pending',NULL,16,16,NULL,'2026-10-16 11:24:00','2026-10-16 11:24:00',NULL,NULL),(34,19,'PRP-000006','2026-09-26','ACC',14,'Sheep Lining','Beige ','Finishing',0.00,0.00,0.00,'Pcs','Pending',NULL,16,16,NULL,'2026-10-16 11:24:00','2026-10-16 11:24:00',NULL,NULL),(35,19,'PRP-000006','2026-09-26','ACC',14,'Sheep Lining','Beige ','Packing',0.00,0.00,0.00,'Pcs','Pending',NULL,16,16,NULL,'2026-10-16 11:24:00','2026-10-16 11:24:00',NULL,NULL),(36,20,'PRP-000007','2026-10-16','ACC',14,'Sheep Lining','Beige ','Wet End',0.00,0.00,0.00,'Pcs','Pending',NULL,16,16,NULL,'2026-10-16 11:26:39','2026-10-16 11:26:39',NULL,NULL),(37,20,'PRP-000007','2026-10-16','ACC',14,'Sheep Lining','Beige ','Measurement',0.00,0.00,0.00,'Pcs','Pending',NULL,16,16,NULL,'2026-10-16 11:26:39','2026-10-16 11:26:39',NULL,NULL),(38,20,'PRP-000007','2026-10-16','ACC',14,'Sheep Lining','Beige ','Packing',0.00,0.00,0.00,'Pcs','Pending',NULL,16,16,NULL,'2026-10-16 11:26:39','2026-10-16 11:26:39',NULL,NULL),(39,20,'PRP-000007','2026-10-16','ACC',14,'Sheep Lining','Beige ','Finishing',0.00,0.00,0.00,'Pcs','Pending',NULL,16,16,NULL,'2026-10-16 11:26:39','2026-10-16 11:26:39',NULL,NULL),(40,21,'PRP-000008','2026-10-17','ACC',14,'Sheep Lining','Ice','Wet End',0.00,0.00,0.00,'Pcs','Pending',NULL,16,16,NULL,'2026-10-17 11:19:10','2026-10-17 11:19:10',NULL,NULL),(41,21,'PRP-000008','2026-10-17','ACC',14,'Sheep Lining','Ice','Measurement',0.00,0.00,0.00,'Pcs','Pending',NULL,16,16,NULL,'2026-10-17 11:19:10','2026-10-17 11:19:10',NULL,NULL),(42,21,'PRP-000008','2026-10-17','ACC',14,'Sheep Lining','Ice','Finishing',0.00,0.00,0.00,'Pcs','Pending',NULL,16,16,NULL,'2026-10-17 11:19:10','2026-10-17 11:19:10',NULL,NULL),(43,21,'PRP-000008','2026-10-17','ACC',14,'Sheep Lining','Ice','Packing',0.00,0.00,0.00,'Pcs','Pending',NULL,16,16,NULL,'2026-10-17 11:19:10','2026-10-17 11:19:10',NULL,NULL),(44,22,'PRP-000009','2026-10-17','ACC',14,'Sheep Lining','Ice','Wet End',0.00,0.00,0.00,'Pcs','Pending',NULL,16,16,NULL,'2026-10-17 11:43:24','2026-10-17 11:43:24',NULL,NULL),(45,22,'PRP-000009','2026-10-17','ACC',14,'Sheep Lining','Ice','Measurement',0.00,0.00,0.00,'Pcs','Pending',NULL,16,16,NULL,'2026-10-17 11:43:24','2026-10-17 11:43:24',NULL,NULL),(46,22,'PRP-000009','2026-10-17','ACC',14,'Sheep Lining','Ice','Finishing',422.00,3.00,2297.00,'Pcs','Posted',NULL,16,16,16,'2026-10-17 11:43:24','2026-10-22 12:21:20','2026-10-22 12:21:20',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `production_status_transactions`
--

LOCK TABLES `production_status_transactions` WRITE;
/*!40000 ALTER TABLE `production_status_transactions` DISABLE KEYS */;
INSERT INTO `production_status_transactions` VALUES (14,20,'TXN-260928-0001','2026-09-28',0.00,3500.00,0.00,0.00,3500.00,'Pcs',NULL,7,7,'2026-09-28 08:52:40','2026-09-28 10:53:10','2026-09-28 10:53:10'),(15,20,'TXN-260928-0002','2026-09-28',3500.00,0.00,3500.00,0.00,0.00,'Pcs',NULL,7,7,'2026-09-28 09:52:03','2026-09-28 10:49:02','2026-09-28 10:49:02'),(16,20,'TXN-260928-0003','2026-09-28',3500.00,0.00,2762.00,738.00,0.00,'Pcs',NULL,7,7,'2026-09-28 10:48:15','2026-09-28 10:53:28',NULL),(17,21,'TXN-260929-0001','2026-09-29',0.00,0.00,2500.00,14.10,0.00,'Pcs',NULL,16,16,'2026-09-29 12:03:34','2026-09-29 12:06:41',NULL),(18,22,'TXN-261002-0001','2026-10-02',0.00,100.00,50.00,10.00,40.00,'Pcs',NULL,7,7,'2026-10-02 10:17:58','2026-10-02 10:17:58',NULL),(19,22,'TXN-261002-0002','2026-10-02',40.00,60.00,50.00,20.00,30.00,'Pcs',NULL,7,7,'2026-10-02 10:19:28','2026-10-02 10:19:28',NULL),(20,22,'TXN-261002-0003','2026-10-02',30.00,5.00,6.00,2.00,27.00,'Pcs',NULL,7,7,'2026-10-02 15:55:22','2026-10-02 15:55:22',NULL),(21,22,'TXN-261002-0004','2026-10-02',27.00,5.00,0.00,0.00,32.00,'Pcs',NULL,7,7,'2026-10-02 15:55:40','2026-10-02 15:55:54','2026-10-02 15:55:54'),(22,46,'TXN-261022-0001','2026-10-22',0.00,422.00,3.00,0.00,419.00,'Pcs',NULL,7,16,'2026-10-22 12:16:46','2026-10-22 12:17:23','2026-10-22 12:17:23'),(23,46,'TXN-261022-0002','2026-10-22',0.00,422.00,3.00,0.00,419.00,'Pcs',NULL,16,16,'2026-10-22 12:16:49','2026-10-22 12:16:49',NULL);
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
  `category` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'testing','Goat  Patent Green','Crust Leather','cow','Kilogram','Medium (1.0-1.2 mm)','Green','Patent','test','Synthetic Tanning Agents','a',1.00,'test','Inactive','2026-07-01 16:37:05','2026-09-14 09:29:37',3,NULL,3,3,NULL,2,10,7,1,NULL,5,NULL,NULL,1,NULL),(2,'PRD-00NaN','Buffalo  Patent Grey','General','cow',NULL,NULL,NULL,NULL,'demo',NULL,'a',0.00,NULL,'Active','2026-07-28 06:12:37','2026-09-14 09:29:37',1,NULL,2,NULL,NULL,4,6,7,3,5,1,NULL,7,NULL,NULL),(4,'PRD-00001','Sheep  Crust Natural','General','cow',NULL,NULL,NULL,NULL,'',NULL,'a',0.00,NULL,'Active','2026-08-10 12:21:06','2026-09-14 09:29:37',3,NULL,4,1,6,3,5,9,1,NULL,1,7,7,NULL,NULL),(5,'PRD-00002','Sheep  Crust Black','General','cow',NULL,NULL,NULL,NULL,'',NULL,'a',0.00,NULL,'Active','2026-08-10 12:23:16','2026-09-14 09:29:37',2,NULL,4,1,NULL,3,1,9,2,NULL,1,7,7,NULL,NULL),(6,'PRD-00003','Sheep  Softy Black','General','cow',NULL,NULL,NULL,NULL,'',NULL,'a',0.00,NULL,'Active','2026-09-01 15:37:55','2026-09-14 09:29:37',1,1,4,1,6,1,1,12,2,NULL,7,7,7,7,NULL),(7,'PRD-00004','Sheep  Softy off white','General','cow',NULL,NULL,NULL,NULL,'',NULL,'a',0.00,NULL,'Active','2026-09-01 15:41:27','2026-09-14 09:29:37',1,1,4,1,6,1,13,12,2,NULL,7,7,7,7,NULL),(8,'PRD-00005','Sheep  Softy Beige','General','cow',NULL,NULL,NULL,NULL,'',NULL,'a',0.00,NULL,'Active','2026-09-01 15:42:58','2026-09-14 09:29:37',1,1,4,1,6,1,7,12,2,NULL,7,7,7,7,NULL),(9,'PRD-00006','Sheep  Softy Bark','General','cow',NULL,NULL,NULL,NULL,'',NULL,'a',0.00,NULL,'Active','2026-09-01 15:44:34','2026-09-14 09:29:37',1,1,4,3,6,1,14,12,2,NULL,7,7,7,7,NULL),(10,'PRD-00007','Sheep  Pull-Up Bark','General','cow',NULL,NULL,NULL,NULL,'',NULL,'a',0.00,NULL,'Active','2026-09-05 14:04:11','2026-09-17 11:04:15',1,1,4,1,6,3,14,6,2,NULL,7,NULL,7,16,NULL),(11,'PRD-00008','Sheep  Nappa off white','General','cow',NULL,NULL,NULL,NULL,'',NULL,'a',0.00,NULL,'Active','2026-09-25 11:25:33','2026-09-26 13:29:45',1,13,4,6,6,2,13,3,2,NULL,2,NULL,16,7,NULL),(12,'PRD-00009','Sheep  sheep upper pearl white','General','cow',NULL,NULL,NULL,NULL,'',NULL,'a',0.00,NULL,'Active','2026-09-25 12:24:27','2026-09-25 12:24:27',1,1,4,9,NULL,5,12,13,NULL,NULL,NULL,NULL,16,NULL,NULL),(13,'PRD-00010','Sheep  Full Grain White','General','cow',NULL,NULL,NULL,NULL,'',NULL,'a',0.00,NULL,'Active','2026-09-26 11:31:26','2026-09-26 11:31:26',1,1,4,1,6,2,15,2,2,NULL,7,NULL,7,NULL,NULL),(16,'PRD-00011','Sheep Munjaro Full Grain','General','cow',NULL,NULL,NULL,NULL,'',NULL,'a',0.00,NULL,'Active','2026-10-11 06:33:37','2026-10-11 07:47:19',1,1,7,1,6,2,NULL,2,1,NULL,7,NULL,7,7,NULL),(17,'PRD-00012','Sheep Munjaro Full Grain','General','cow',NULL,NULL,NULL,NULL,'',NULL,'a',0.00,NULL,'Active','2026-10-11 06:42:15','2026-10-11 07:46:49',1,1,7,1,6,2,NULL,2,1,NULL,7,NULL,7,7,NULL),(18,'PRD-00013','Sheep Lining Full Grain Beige','General','cow',NULL,NULL,NULL,NULL,'',NULL,'a',0.00,NULL,'Active','2026-10-11 06:45:44','2026-10-11 07:47:45',1,1,8,1,6,1,7,2,3,NULL,7,NULL,7,7,NULL),(19,'PRD-00014','Sheep Lining','General','cow',NULL,NULL,NULL,NULL,'',NULL,'a',0.00,NULL,'Active','2026-10-11 07:51:51','2026-10-11 08:17:41',1,1,8,1,6,1,NULL,NULL,NULL,NULL,NULL,NULL,7,7,NULL);
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
  `leather_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `thickness` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `process_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'finishing',
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
) ENGINE=InnoDB AUTO_INCREMENT=1008 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_menu_access`
--

LOCK TABLES `role_menu_access` WRITE;
/*!40000 ALTER TABLE `role_menu_access` DISABLE KEYS */;
INSERT INTO `role_menu_access` VALUES (716,9,'/dashboard','2026-09-16 09:11:51'),(717,9,'/sales-orders','2026-09-16 09:11:51'),(719,10,'/dashboard','2026-09-16 09:11:51'),(720,10,'/production-plan','2026-09-16 09:11:51'),(721,10,'/production-plan/new','2026-09-16 09:11:51'),(725,12,'/dashboard','2026-09-16 09:11:51'),(726,12,'/production-status','2026-09-16 09:11:51'),(728,13,'/dashboard','2026-09-16 09:11:51'),(729,13,'/general-cost','2026-09-16 09:11:51'),(730,13,'/machine-cost','2026-09-16 09:11:51'),(731,13,'/costing-report','2026-09-16 09:11:51'),(869,11,'/material-issue','2026-09-30 11:39:32'),(870,11,'/material-receipt','2026-09-30 11:39:32'),(939,1,'/batch-completion','2026-10-24 09:40:43'),(940,1,'/batch-lot-tracking','2026-10-24 09:40:43'),(941,1,'/batch-process','2026-10-24 09:40:43'),(942,1,'/bom','2026-10-24 09:40:43'),(943,1,'/bom-revision','2026-10-24 09:40:43'),(944,1,'/business-units','2026-10-24 09:40:43'),(945,1,'/chemical-master','2026-10-24 09:40:43'),(946,1,'/color','2026-10-24 09:40:43'),(947,1,'/company','2026-10-24 09:40:43'),(948,1,'/cost-analysis','2026-10-24 09:40:43'),(949,1,'/cost-breakdown','2026-10-24 09:40:43'),(950,1,'/cost-components','2026-10-24 09:40:43'),(951,1,'/costing-report','2026-10-24 09:40:43'),(952,1,'/customer-master','2026-10-24 09:40:43'),(953,1,'/dashboard','2026-10-24 09:40:43'),(954,1,'/data-templates','2026-10-24 09:40:43'),(955,1,'/database-backups','2026-10-24 09:40:43'),(956,1,'/department-master','2026-10-24 09:40:43'),(957,1,'/finish-type','2026-10-24 09:40:43'),(958,1,'/general-cost','2026-10-24 09:40:43'),(959,1,'/grade','2026-10-24 09:40:43'),(960,1,'/grn','2026-10-24 09:40:43'),(961,1,'/group-master','2026-10-24 09:40:43'),(962,1,'/hsn-code','2026-10-24 09:40:43'),(963,1,'/inventory-reports','2026-10-24 09:40:43'),(964,1,'/leather-type','2026-10-24 09:40:43'),(965,1,'/location-rack','2026-10-24 09:40:43'),(966,1,'/machine','2026-10-24 09:40:43'),(967,1,'/machine-cost','2026-10-24 09:40:43'),(968,1,'/material-issue','2026-10-24 09:40:43'),(969,1,'/material-receipt','2026-10-24 09:40:43'),(970,1,'/material-requirement','2026-10-24 09:40:43'),(971,1,'/monthly-batch-process','2026-10-24 09:40:43'),(972,1,'/outbound-delivery','2026-10-24 09:40:43'),(973,1,'/physical-stock-entry','2026-10-24 09:40:43'),(974,1,'/process-stage','2026-10-24 09:40:43'),(975,1,'/product-category','2026-10-24 09:40:43'),(976,1,'/product-master','2026-10-24 09:40:43'),(977,1,'/production-plan','2026-10-24 09:40:43'),(978,1,'/production-plan/new','2026-10-24 09:40:43'),(979,1,'/production-status','2026-10-24 09:40:43'),(980,1,'/purchase-orders','2026-10-24 09:40:43'),(981,1,'/rate-master','2026-10-24 09:40:43'),(982,1,'/recipe-creation','2026-10-24 09:40:43'),(983,1,'/reports','2026-10-24 09:40:43'),(984,1,'/reports/actual-production','2026-10-24 09:40:43'),(985,1,'/reports/inventory','2026-10-24 09:40:43'),(986,1,'/reports/production-plan','2026-10-24 09:40:43'),(987,1,'/reports/sales-order','2026-10-24 09:40:43'),(988,1,'/reports/stage-costing','2026-10-24 09:40:43'),(989,1,'/reports/wip-cost-summary','2026-10-24 09:40:43'),(990,1,'/roles','2026-10-24 09:40:43'),(991,1,'/sales-orders','2026-10-24 09:40:43'),(992,1,'/standard-cost-bom','2026-10-24 09:40:43'),(993,1,'/standard-costing','2026-10-24 09:40:43'),(994,1,'/standard-size','2026-10-24 09:40:43'),(995,1,'/stock-opening-entry','2026-10-24 09:40:43'),(996,1,'/stock-transfer','2026-10-24 09:40:43'),(997,1,'/supplier-invoice','2026-10-24 09:40:43'),(998,1,'/supplier-master','2026-10-24 09:40:43'),(999,1,'/supplier-price-approval','2026-10-24 09:40:43'),(1000,1,'/supplier-pricing-history','2026-10-24 09:40:43'),(1001,1,'/supplier-return','2026-10-24 09:40:43'),(1002,1,'/tax-master','2026-10-24 09:40:43'),(1003,1,'/thickness','2026-10-24 09:40:43'),(1004,1,'/uom','2026-10-24 09:40:43'),(1005,1,'/users','2026-10-24 09:40:43'),(1006,1,'/warehouse-master','2026-10-24 09:40:43'),(1007,1,'/material-transfer-note','2026-10-24 09:40:43');
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
  `access_level` enum('read_write','read_only') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'read_write',
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
  KEY `idx_soi_order_product` (`sales_order_id`,`product_id`),
  CONSTRAINT `fk_soi_order` FOREIGN KEY (`sales_order_id`) REFERENCES `sales_orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales_order_items`
--

LOCK TABLES `sales_order_items` WRITE;
/*!40000 ALTER TABLE `sales_order_items` DISABLE KEYS */;
INSERT INTO `sales_order_items` VALUES (31,16,'PRD-00010','Sheep  Full Grain White',13,NULL,'Sheep ','White','Medium (1.0-1.2 mm)','Square Feet',3141.00,NULL,110.0000,0.00,345510.00,'2026-09-28 10:50:12'),(35,17,'PRD-00003','Sheep  Softy Black',6,NULL,'Sheep ','Black','Thin (0.8-1.0 mm)','Square Feet',2500.00,'2026-09-21',110.0000,0.00,275000.00,'2026-09-29 07:18:54'),(52,19,'PRD-00003','Sheep  Softy Black',6,NULL,'Sheep ','Black','Thin (0.8-1.0 mm)','Square Feet',7200.00,NULL,110.0000,0.00,792000.00,'2026-10-12 09:51:41'),(53,23,'PRD-00003','Sheep  Softy Black',6,NULL,'Sheep ','Black','Thin (0.8-1.0 mm)','Square Feet',7200.00,NULL,110.0000,0.00,792000.00,'2026-10-12 12:04:25'),(68,24,'PRD-00014','Sheep Lining',19,NULL,'Sheep Lining','Beige ','Thin (0.8-1.0 mm)','Square Feet',2100.00,NULL,65.0000,0.00,136500.00,'2026-10-16 10:58:25'),(69,24,'PRD-00014','Sheep Lining',19,NULL,'Sheep Lining','Ice','Thin (0.8-1.0 mm)','Square Feet',1400.00,NULL,65.0000,0.00,91000.00,'2026-10-16 10:58:25'),(70,24,'PRD-00014','Sheep Lining',19,NULL,'Sheep Lining','Bordo','Thin (0.8-1.0 mm)','Square Feet',400.00,NULL,65.0000,0.00,26000.00,'2026-10-16 10:58:25'),(71,24,'PRD-00014','Sheep Lining',19,NULL,'Sheep Lining','Cuoio','Thin (0.8-1.0 mm)','Square Feet',2100.00,NULL,65.0000,0.00,136500.00,'2026-10-16 10:58:25'),(72,24,'PRD-00014','Sheep Lining',19,NULL,'Sheep Lining','Beige','Thin (0.8-1.0 mm)','Square Feet',1500.00,NULL,65.0000,0.00,97500.00,'2026-10-16 10:58:25');
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
  `shipped_qty` decimal(14,3) DEFAULT NULL,
  `shipped_date` date DEFAULT NULL,
  `terms_conditions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `discount` decimal(12,2) DEFAULT '0.00',
  `freight` decimal(12,2) DEFAULT '0.00',
  `tax_percent` decimal(5,2) DEFAULT '18.00',
  `sub_total` decimal(14,2) DEFAULT '0.00',
  `tax_amount` decimal(12,2) DEFAULT '0.00',
  `cgst_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `sgst_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `igst_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `tax_type` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'IGST',
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
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales_orders`
--

LOCK TABLES `sales_orders` WRITE;
/*!40000 ALTER TABLE `sales_orders` DISABLE KEYS */;
INSERT INTO `sales_orders` VALUES (16,'SO-2026-00001',8,'2026-09-11',NULL,'AKM-153','Standard','Mr KFA',NULL,'Advance','INR',NULL,NULL,'Confirmed',NULL,NULL,NULL,0.00,0.00,5.00,345510.00,17275.50,8637.75,8637.75,0.00,'CGST_SGST',362785.50,NULL,7,7,'2026-09-26 11:32:57','2026-09-28 10:50:12'),(17,'SO-2026-00002',8,'2026-09-28',NULL,'AKM154','Standard','Mr KFA',NULL,'Advance','INR',NULL,NULL,'Confirmed',NULL,NULL,NULL,0.00,0.00,5.00,275000.00,13750.00,6875.00,6875.00,0.00,'CGST_SGST',288750.00,NULL,16,16,'2026-09-28 11:09:06','2026-09-29 12:03:34'),(19,'SO-2026-00003',12,'2026-10-05',NULL,'GM2610/1','Standard','UFM',NULL,'Advance','INR',NULL,NULL,'Draft',NULL,NULL,NULL,0.00,0.00,5.00,792000.00,39600.00,0.00,0.00,39600.00,'IGST',831600.00,NULL,16,16,'2026-10-05 05:47:25','2026-10-12 09:51:41'),(23,'SO-2026-00004',12,'2026-10-05',NULL,NULL,'Standard','UFM',NULL,'Advance','INR',NULL,NULL,'Draft',NULL,NULL,NULL,0.00,0.00,5.00,792000.00,39600.00,0.00,0.00,39600.00,'IGST',831600.00,NULL,16,NULL,'2026-10-12 12:04:25','2026-10-12 12:04:25'),(24,'SO-2026-00005',14,'2026-10-01',NULL,'ACI-L-107/26-27','Standard','Mr TQ',NULL,'30 Days','INR',NULL,NULL,'Confirmed',NULL,NULL,NULL,0.00,0.00,5.00,487500.00,24375.00,12187.50,12187.50,0.00,'CGST_SGST',511875.00,NULL,7,16,'2026-10-14 13:00:56','2026-10-22 12:16:46');
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `standard_cost_sheets`
--

LOCK TABLES `standard_cost_sheets` WRITE;
/*!40000 ALTER TABLE `standard_cost_sheets` DISABLE KEYS */;
INSERT INTO `standard_cost_sheets` VALUES (1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0.00,0.00,'Wet End',1,'KFA092601',1,'INR','Sq.Ft.',0.0000,0.00,0.00,0.0000,0.0000,'Draft',7,7,7,'2026-09-28 10:54:12','2026-09-28 10:54:12'),(2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0.00,0.00,'Wet End',1,'KFA092602',1,'INR','Sq.Ft.',0.0000,0.00,0.00,0.0000,0.0000,'Draft',7,7,7,'2026-09-28 10:54:23','2026-09-28 10:54:23'),(3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0.00,0.00,'Wet End',1,'KFA092603',1,'INR','Sq.Ft.',0.0000,0.00,0.00,0.0000,0.0000,'Draft',7,7,7,'2026-09-28 10:54:40','2026-09-28 10:54:40'),(4,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0.00,0.00,'Wet End',1,'KFA092604',1,'INR','Sq.Ft.',0.0000,0.00,0.00,0.0000,0.0000,'Draft',7,7,7,'2026-09-28 13:02:00','2026-09-28 13:02:00'),(5,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0.00,0.00,'Wet End',1,'KFA092605',1,'INR','Sq.Ft.',0.0000,0.00,0.00,0.0000,0.0000,'Draft',16,16,16,'2026-09-30 06:50:17','2026-09-30 06:50:17'),(6,NULL,NULL,15,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0.00,0.00,'BOM',1,'KFA102601',1,'INR','Sq.Ft.',0.0000,27698.00,-27698.00,0.0000,27698.0000,'Approved',7,7,7,'2026-10-02 10:55:47','2026-10-02 10:55:47'),(7,NULL,NULL,22,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0.00,0.00,'BOM',1,'ACC102601',1,'INR','Sq.Ft.',0.0000,148834.43,-148834.43,0.0000,148834.4300,'Draft',16,16,16,'2026-10-22 13:28:03','2026-10-22 13:28:03');
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
  `transaction_type` enum('Opening','Receipt','Transfer In','Transfer Out','Issue','Outbound Delivery','Adjustment','Stock Adjustment') NOT NULL,
  `reference_type` varchar(50) NOT NULL,
  `reference_id` int NOT NULL,
  `reference_no` varchar(50) DEFAULT NULL,
  `warehouse_id` int NOT NULL,
  `material_id` int NOT NULL,
  `uom` varchar(30) DEFAULT NULL,
  `batch_no` varchar(100) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `opening_qty` decimal(14,3) NOT NULL DEFAULT '0.000',
  `opening_value` decimal(16,2) NOT NULL DEFAULT '0.00',
  `in_qty` decimal(14,3) DEFAULT '0.000',
  `in_value` decimal(16,2) NOT NULL DEFAULT '0.00',
  `out_qty` decimal(14,3) DEFAULT '0.000',
  `out_value` decimal(16,2) NOT NULL DEFAULT '0.00',
  `unit_cost` decimal(14,4) DEFAULT '0.0000',
  `amount` decimal(16,2) DEFAULT '0.00',
  `balance_qty` decimal(14,3) DEFAULT '0.000',
  `balance_value` decimal(16,2) NOT NULL DEFAULT '0.00',
  `remarks` text,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sl_warehouse` (`warehouse_id`),
  KEY `idx_sl_material` (`material_id`),
  KEY `idx_sl_ref` (`reference_type`,`reference_id`),
  KEY `idx_sl_date` (`transaction_date`),
  KEY `idx_sl_wh_mat_date` (`warehouse_id`,`material_id`,`transaction_date`,`id`),
  CONSTRAINT `fk_sl_material` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`),
  CONSTRAINT `fk_sl_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=777 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_ledger`
--

LOCK TABLES `stock_ledger` WRITE;
/*!40000 ALTER TABLE `stock_ledger` DISABLE KEYS */;
INSERT INTO `stock_ledger` VALUES (21,'2026-09-27','Opening','material_master',105,'MAT-00105',8,105,NULL,NULL,NULL,0.000,0.00,0.700,641.34,0.000,0.00,916.2000,641.34,0.700,641.34,'Opening stock (material master)',NULL,'2026-09-27 14:57:23'),(25,'2026-09-27','Opening','material_master',208,'MAT-00208',8,208,NULL,NULL,NULL,0.000,0.00,1.000,2034.00,0.000,0.00,2034.0000,2034.00,1.000,2034.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(26,'2026-09-27','Opening','material_master',207,'MAT-00207',8,207,NULL,NULL,NULL,0.000,0.00,1.000,1699.00,0.000,0.00,1699.0000,1699.00,1.000,1699.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(27,'2026-09-27','Opening','material_master',206,'MAT-00206',8,206,NULL,NULL,NULL,0.000,0.00,0.500,0.00,0.000,0.00,0.0000,0.00,0.500,0.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(28,'2026-09-27','Opening','material_master',205,'MAT-00205',8,205,NULL,NULL,NULL,0.000,0.00,0.250,0.00,0.000,0.00,0.0000,0.00,0.250,0.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(29,'2026-09-27','Opening','material_master',204,'MAT-00204',8,204,NULL,NULL,NULL,0.000,0.00,0.400,0.00,0.000,0.00,0.0000,0.00,0.400,0.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(30,'2026-09-27','Opening','material_master',203,'MAT-00203',8,203,NULL,NULL,NULL,0.000,0.00,0.230,0.00,0.000,0.00,0.0000,0.00,0.230,0.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(31,'2026-09-26','Opening','material_master',202,'MAT-00202',8,202,NULL,NULL,NULL,0.000,0.00,0.500,0.00,0.000,0.00,0.0000,0.00,0.500,0.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(32,'2026-09-27','Opening','material_master',201,'MAT-00201',8,201,NULL,NULL,NULL,0.000,0.00,0.750,0.00,0.000,0.00,0.0000,0.00,0.750,0.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(33,'2026-09-27','Opening','material_master',200,'MAT-00200',8,200,NULL,NULL,NULL,0.000,0.00,0.100,0.00,0.000,0.00,0.0000,0.00,0.100,0.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(34,'2026-09-27','Opening','material_master',199,'MAT-00199',8,199,NULL,NULL,NULL,0.000,0.00,0.700,662.20,0.000,0.00,946.0000,662.20,0.700,662.20,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(35,'2026-09-27','Opening','material_master',198,'MAT-00198',8,198,NULL,NULL,NULL,0.000,0.00,0.650,921.70,0.000,0.00,1418.0000,921.70,0.650,921.70,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(36,'2026-09-27','Opening','material_master',197,'MAT-00197',8,197,NULL,NULL,NULL,0.000,0.00,0.500,2827.00,0.000,0.00,5654.0000,2827.00,0.500,2827.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(37,'2026-09-27','Opening','material_master',196,'MAT-00196',8,196,NULL,NULL,NULL,0.000,0.00,0.700,1028.30,0.000,0.00,1469.0000,1028.30,0.700,1028.30,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(38,'2026-09-27','Opening','material_master',195,'MAT-00195',8,195,NULL,NULL,NULL,0.000,0.00,0.800,10168.80,0.000,0.00,12711.0000,10168.80,0.800,10168.80,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(39,'2026-09-27','Opening','material_master',194,'MAT-00194',8,194,NULL,NULL,NULL,0.000,0.00,0.400,568.80,0.000,0.00,1422.0000,568.80,0.400,568.80,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(40,'2026-09-27','Opening','material_master',193,'MAT-00193',8,193,NULL,NULL,NULL,0.000,0.00,5.000,2750.00,0.000,0.00,550.0000,2750.00,5.000,2750.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(41,'2026-09-27','Opening','material_master',192,'MAT-00192',8,192,NULL,NULL,NULL,0.000,0.00,15.000,4140.00,0.000,0.00,276.0000,4140.00,15.000,4140.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(42,'2026-09-27','Opening','material_master',191,'MAT-00191',8,191,NULL,NULL,NULL,0.000,0.00,3.000,1149.00,0.000,0.00,383.0000,1149.00,3.000,1149.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(43,'2026-09-27','Opening','material_master',190,'MAT-00190',8,190,NULL,NULL,NULL,0.000,0.00,5.000,2465.00,0.000,0.00,493.0000,2465.00,5.000,2465.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(44,'2026-09-27','Opening','material_master',189,'MAT-00189',8,189,NULL,NULL,NULL,0.000,0.00,4.500,1966.50,0.000,0.00,437.0000,1966.50,4.500,1966.50,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(45,'2026-09-27','Opening','material_master',188,'MAT-00188',8,188,NULL,NULL,NULL,0.000,0.00,1.500,1165.50,0.000,0.00,777.0000,1165.50,1.500,1165.50,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(46,'2026-09-27','Opening','material_master',187,'MAT-00187',8,187,NULL,NULL,NULL,0.000,0.00,5.700,7518.30,0.000,0.00,1319.0000,7518.30,5.700,7518.30,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(47,'2026-09-27','Opening','material_master',186,'MAT-00186',8,186,NULL,NULL,NULL,0.000,0.00,4.700,6218.10,0.000,0.00,1323.0000,6218.10,4.700,6218.10,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(48,'2026-09-27','Opening','material_master',185,'MAT-00185',8,185,NULL,NULL,NULL,0.000,0.00,0.500,376.50,0.000,0.00,753.0000,376.50,0.500,376.50,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(49,'2026-09-27','Opening','material_master',183,'MAT-00183',8,183,NULL,NULL,NULL,0.000,0.00,1.500,756.00,0.000,0.00,504.0000,756.00,1.500,756.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(50,'2026-09-27','Opening','material_master',182,'MAT-00182',8,182,NULL,NULL,NULL,0.000,0.00,50.000,35550.00,0.000,0.00,711.0000,35550.00,50.000,35550.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(51,'2026-09-27','Opening','material_master',181,'MAT-00181',8,181,NULL,NULL,NULL,0.000,0.00,2.000,0.00,0.000,0.00,0.0000,0.00,2.000,0.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(52,'2026-09-27','Opening','material_master',180,'MAT-00180',8,180,NULL,NULL,NULL,0.000,0.00,10.000,6020.00,0.000,0.00,602.0000,6020.00,10.000,6020.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(53,'2026-09-27','Opening','material_master',179,'MAT-00179',8,179,NULL,NULL,NULL,0.000,0.00,0.300,153.00,0.000,0.00,510.0000,153.00,0.300,153.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(54,'2026-09-27','Opening','material_master',178,'MAT-00178',8,178,NULL,NULL,NULL,0.000,0.00,0.500,98.00,0.000,0.00,196.0000,98.00,0.500,98.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(55,'2026-09-27','Opening','material_master',177,'MAT-00177',8,177,NULL,NULL,NULL,0.000,0.00,0.600,140.40,0.000,0.00,234.0000,140.40,0.600,140.40,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(56,'2026-09-27','Opening','material_master',176,'MAT-00176',8,176,NULL,NULL,NULL,0.000,0.00,0.350,0.00,0.000,0.00,0.0000,0.00,0.350,0.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(57,'2026-09-27','Opening','material_master',175,'MAT-00175',8,175,NULL,NULL,NULL,0.000,0.00,0.700,490.00,0.000,0.00,700.0000,490.00,0.700,490.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(58,'2026-09-27','Opening','material_master',174,'MAT-00174',8,174,NULL,NULL,NULL,0.000,0.00,3.000,1308.00,0.000,0.00,436.0000,1308.00,3.000,1308.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(59,'2026-09-27','Opening','material_master',173,'MAT-00173',8,173,NULL,NULL,NULL,0.000,0.00,8.000,6488.00,0.000,0.00,811.0000,6488.00,8.000,6488.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(60,'2026-09-27','Opening','material_master',172,'MAT-00172',8,172,NULL,NULL,NULL,0.000,0.00,17.000,6477.00,0.000,0.00,381.0000,6477.00,17.000,6477.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(61,'2026-09-27','Opening','material_master',171,'MAT-00171',8,171,NULL,NULL,NULL,0.000,0.00,25.000,4600.00,0.000,0.00,184.0000,4600.00,25.000,4600.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(62,'2026-09-27','Opening','material_master',170,'MAT-00170',8,170,NULL,NULL,NULL,0.000,0.00,21.000,5124.00,0.000,0.00,244.0000,5124.00,21.000,5124.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(63,'2026-09-27','Opening','material_master',169,'MAT-00169',8,169,NULL,NULL,NULL,0.000,0.00,3.500,1876.00,0.000,0.00,536.0000,1876.00,3.500,1876.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(64,'2026-09-27','Opening','material_master',168,'MAT-00168',8,168,NULL,NULL,NULL,0.000,0.00,1.500,607.50,0.000,0.00,405.0000,607.50,1.500,607.50,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(65,'2026-09-27','Opening','material_master',167,'MAT-00167',8,167,NULL,NULL,NULL,0.000,0.00,5.500,3712.50,0.000,0.00,675.0000,3712.50,5.500,3712.50,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(66,'2026-09-27','Opening','material_master',166,'MAT-00166',8,166,NULL,NULL,NULL,0.000,0.00,0.350,164.15,0.000,0.00,469.0000,164.15,0.350,164.15,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(67,'2026-09-27','Opening','material_master',165,'MAT-00165',8,165,NULL,NULL,NULL,0.000,0.00,0.250,146.75,0.000,0.00,587.0000,146.75,0.250,146.75,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(68,'2026-09-27','Opening','material_master',164,'MAT-00164',8,164,NULL,NULL,NULL,0.000,0.00,0.900,0.00,0.000,0.00,0.0000,0.00,0.900,0.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(69,'2026-09-27','Opening','material_master',163,'MAT-00163',8,163,NULL,NULL,NULL,0.000,0.00,1.000,0.00,0.000,0.00,0.0000,0.00,1.000,0.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(70,'2026-09-27','Opening','material_master',162,'MAT-00162',8,162,NULL,NULL,NULL,0.000,0.00,2.000,912.00,0.000,0.00,456.0000,912.00,2.000,912.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(71,'2026-09-27','Opening','material_master',161,'MAT-00161',8,161,NULL,NULL,NULL,0.000,0.00,1.000,0.00,0.000,0.00,0.0000,0.00,1.000,0.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(72,'2026-09-27','Opening','material_master',160,'MAT-00160',8,160,NULL,NULL,NULL,0.000,0.00,1.500,0.00,0.000,0.00,0.0000,0.00,1.500,0.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(73,'2026-09-27','Opening','material_master',159,'MAT-00159',8,159,NULL,NULL,NULL,0.000,0.00,2.600,0.00,0.000,0.00,0.0000,0.00,2.600,0.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(74,'2026-09-27','Opening','material_master',158,'MAT-00158',8,158,NULL,NULL,NULL,0.000,0.00,0.570,2966.28,0.000,0.00,5204.0000,2966.28,0.570,2966.28,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(75,'2026-09-27','Opening','material_master',157,'MAT-00157',8,157,NULL,NULL,NULL,0.000,0.00,1.800,678.60,0.000,0.00,377.0000,678.60,1.800,678.60,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(76,'2026-09-27','Opening','material_master',156,'MAT-00156',8,156,NULL,NULL,NULL,0.000,0.00,1.400,665.00,0.000,0.00,475.0000,665.00,1.400,665.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(77,'2026-09-27','Opening','material_master',155,'MAT-00155',8,155,NULL,NULL,NULL,0.000,0.00,2.800,0.00,0.000,0.00,0.0000,0.00,2.800,0.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(78,'2026-09-27','Opening','material_master',154,'MAT-00154',8,154,NULL,NULL,NULL,0.000,0.00,3.800,1383.20,0.000,0.00,364.0000,1383.20,3.800,1383.20,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(79,'2026-09-27','Opening','material_master',153,'MAT-00153',8,153,NULL,NULL,NULL,0.000,0.00,1.800,0.00,0.000,0.00,0.0000,0.00,1.800,0.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(80,'2026-09-27','Opening','material_master',152,'MAT-00152',8,152,NULL,NULL,NULL,0.000,0.00,48.000,16704.00,0.000,0.00,348.0000,16704.00,48.000,16704.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(81,'2026-09-27','Opening','material_master',151,'MAT-00151',8,151,NULL,NULL,NULL,0.000,0.00,0.800,468.00,0.000,0.00,585.0000,468.00,0.800,468.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(82,'2026-09-27','Opening','material_master',150,'MAT-00150',8,150,NULL,NULL,NULL,0.000,0.00,0.900,0.00,0.000,0.00,0.0000,0.00,0.900,0.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(83,'2026-09-27','Opening','material_master',149,'MAT-00149',8,149,NULL,NULL,NULL,0.000,0.00,2.500,807.50,0.000,0.00,323.0000,807.50,2.500,807.50,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(84,'2026-09-27','Opening','material_master',148,'MAT-00148',8,148,NULL,NULL,NULL,0.000,0.00,2.500,1197.50,0.000,0.00,479.0000,1197.50,2.500,1197.50,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(85,'2026-09-27','Opening','material_master',147,'MAT-00147',8,147,NULL,NULL,NULL,0.000,0.00,1.000,0.00,0.000,0.00,0.0000,0.00,1.000,0.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(86,'2026-09-27','Opening','material_master',146,'MAT-00146',8,146,NULL,NULL,NULL,0.000,0.00,3.800,1987.40,0.000,0.00,523.0000,1987.40,3.800,1987.40,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(87,'2026-09-27','Opening','material_master',145,'MAT-00145',8,145,NULL,NULL,NULL,0.000,0.00,6.500,260.00,0.000,0.00,40.0000,260.00,6.500,260.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(88,'2026-09-27','Opening','material_master',144,'MAT-00144',8,144,NULL,NULL,NULL,0.000,0.00,6.000,2964.00,0.000,0.00,494.0000,2964.00,6.000,2964.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(89,'2026-09-27','Opening','material_master',143,'MAT-00143',8,143,NULL,NULL,NULL,0.000,0.00,6.200,1829.00,0.000,0.00,295.0000,1829.00,6.200,1829.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(90,'2026-09-27','Opening','material_master',142,'MAT-00142',8,142,NULL,NULL,NULL,0.000,0.00,53.500,36968.50,0.000,0.00,691.0000,36968.50,53.500,36968.50,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(91,'2026-09-27','Opening','material_master',141,'MAT-00141',8,141,NULL,NULL,NULL,0.000,0.00,0.800,348.80,0.000,0.00,436.0000,348.80,0.800,348.80,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(92,'2026-09-27','Opening','material_master',140,'MAT-00140',8,140,NULL,NULL,NULL,0.000,0.00,2.700,1682.10,0.000,0.00,623.0000,1682.10,2.700,1682.10,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(93,'2026-09-27','Opening','material_master',139,'MAT-00139',8,139,NULL,NULL,NULL,0.000,0.00,8.000,5400.00,0.000,0.00,675.0000,5400.00,8.000,5400.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(94,'2026-09-27','Opening','material_master',138,'MAT-00138',8,138,NULL,NULL,NULL,0.000,0.00,3.500,1764.00,0.000,0.00,504.0000,1764.00,3.500,1764.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(95,'2026-09-27','Opening','material_master',137,'MAT-00137',8,137,NULL,NULL,NULL,0.000,0.00,4.900,2420.60,0.000,0.00,494.0000,2420.60,4.900,2420.60,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(96,'2026-09-27','Opening','material_master',136,'MAT-00136',8,136,NULL,NULL,NULL,0.000,0.00,4.800,3177.60,0.000,0.00,662.0000,3177.60,4.800,3177.60,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(97,'2026-09-27','Opening','material_master',135,'MAT-00135',8,135,NULL,NULL,NULL,0.000,0.00,4.800,3278.40,0.000,0.00,683.0000,3278.40,4.800,3278.40,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(98,'2026-09-27','Opening','material_master',134,'MAT-00134',8,134,NULL,NULL,NULL,0.000,0.00,4.500,2790.00,0.000,0.00,620.0000,2790.00,4.500,2790.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(99,'2026-09-27','Opening','material_master',133,'MAT-00133',8,133,NULL,NULL,NULL,0.000,0.00,0.500,166.00,0.000,0.00,332.0000,166.00,0.500,166.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(100,'2026-09-27','Opening','material_master',132,'MAT-00132',8,132,NULL,NULL,NULL,0.000,0.00,2.000,1682.00,0.000,0.00,841.0000,1682.00,2.000,1682.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(101,'2026-09-27','Opening','material_master',131,'MAT-00131',8,131,NULL,NULL,NULL,0.000,0.00,2.200,1988.80,0.000,0.00,904.0000,1988.80,2.200,1988.80,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(102,'2026-09-27','Opening','material_master',130,'MAT-00130',8,130,NULL,NULL,NULL,0.000,0.00,1.800,2970.00,0.000,0.00,1650.0000,2970.00,1.800,2970.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(103,'2026-09-27','Opening','material_master',129,'MAT-00129',8,129,NULL,NULL,NULL,0.000,0.00,1.800,1060.20,0.000,0.00,589.0000,1060.20,1.800,1060.20,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(104,'2026-09-27','Opening','material_master',128,'MAT-00128',8,128,NULL,NULL,NULL,0.000,0.00,1.300,1209.00,0.000,0.00,930.0000,1209.00,1.300,1209.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(105,'2026-09-27','Opening','material_master',127,'MAT-00127',8,127,NULL,NULL,NULL,0.000,0.00,1.500,1008.00,0.000,0.00,672.0000,1008.00,1.500,1008.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(106,'2026-09-27','Opening','material_master',126,'MAT-00126',8,126,NULL,NULL,NULL,0.000,0.00,0.850,1329.40,0.000,0.00,1564.0000,1329.40,0.850,1329.40,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(107,'2026-09-27','Opening','material_master',125,'MAT-00125',8,125,NULL,NULL,NULL,0.000,0.00,15.000,13935.00,0.000,0.00,929.0000,13935.00,15.000,13935.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(108,'2026-09-27','Opening','material_master',124,'MAT-00124',8,124,NULL,NULL,NULL,0.000,0.00,18.000,5652.00,0.000,0.00,314.0000,5652.00,18.000,5652.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(109,'2026-09-27','Opening','material_master',123,'MAT-00123',8,123,NULL,NULL,NULL,0.000,0.00,80.000,14160.00,0.000,0.00,177.0000,14160.00,80.000,14160.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(110,'2026-09-27','Opening','material_master',122,'MAT-00122',8,122,NULL,NULL,NULL,0.000,0.00,100.000,15000.00,0.000,0.00,150.0000,15000.00,100.000,15000.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(111,'2026-09-27','Opening','material_master',121,'MAT-00121',8,121,NULL,NULL,NULL,0.000,0.00,50.000,7500.00,0.000,0.00,150.0000,7500.00,50.000,7500.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(112,'2026-09-27','Opening','material_master',120,'MAT-00120',8,120,NULL,NULL,NULL,0.000,0.00,49.000,32683.00,0.000,0.00,667.0000,32683.00,49.000,32683.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(113,'2026-09-27','Opening','material_master',119,'MAT-00119',8,119,NULL,NULL,NULL,0.000,0.00,10.000,2670.00,0.000,0.00,267.0000,2670.00,10.000,2670.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(114,'2026-09-27','Opening','material_master',118,'MAT-00118',8,118,NULL,NULL,NULL,0.000,0.00,120.000,18000.00,0.000,0.00,150.0000,18000.00,120.000,18000.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(115,'2026-09-27','Opening','material_master',117,'MAT-00117',8,117,NULL,NULL,NULL,0.000,0.00,7.000,3759.00,0.000,0.00,537.0000,3759.00,7.000,3759.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(116,'2026-09-27','Opening','material_master',116,'MAT-00116',8,116,NULL,NULL,NULL,-12.500,0.00,72.500,25012.50,0.000,0.00,345.0000,25012.50,60.000,25012.50,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(117,'2026-09-27','Opening','material_master',115,'MAT-00115',8,115,NULL,NULL,NULL,-11.000,0.00,93.500,14305.50,0.000,0.00,153.0000,14305.50,82.500,14305.50,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(118,'2026-09-27','Opening','material_master',114,'MAT-00114',8,114,NULL,NULL,NULL,0.000,0.00,10.000,2730.00,0.000,0.00,273.0000,2730.00,10.000,2730.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(119,'2026-09-27','Opening','material_master',113,'MAT-00113',8,113,NULL,NULL,NULL,0.000,0.00,5.300,3730.14,0.000,0.00,703.8000,3730.14,5.300,3730.14,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(120,'2026-09-27','Opening','material_master',112,'MAT-00112',8,112,NULL,NULL,NULL,0.000,0.00,8.800,5161.90,0.000,0.00,586.5800,5161.90,8.800,5161.90,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(121,'2026-09-27','Opening','material_master',111,'MAT-00111',8,111,NULL,NULL,NULL,0.000,0.00,3.500,2610.58,0.000,0.00,745.8800,2610.58,3.500,2610.58,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(122,'2026-09-27','Opening','material_master',110,'MAT-00110',8,110,NULL,NULL,NULL,0.000,0.00,3.250,1873.85,0.000,0.00,576.5700,1873.85,3.250,1873.85,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(123,'2026-09-27','Opening','material_master',109,'MAT-00109',8,109,NULL,NULL,NULL,0.000,0.00,3.650,1987.46,0.000,0.00,544.5100,1987.46,3.650,1987.46,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(124,'2026-09-27','Opening','material_master',108,'MAT-00108',8,108,NULL,NULL,NULL,-12.250,0.00,60.000,27000.00,0.000,0.00,450.0000,27000.00,47.750,27000.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(125,'2026-09-27','Opening','material_master',107,'MAT-00107',8,107,NULL,NULL,NULL,-12.150,0.00,60.900,32886.00,0.000,0.00,540.0000,32886.00,48.750,32886.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(126,'2026-09-27','Opening','material_master',106,'MAT-00106',8,106,NULL,NULL,NULL,30.000,8280.00,17.500,16857.92,0.000,0.00,963.3100,16857.92,47.500,25137.92,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(127,'2026-09-27','Opening','material_master',104,'MAT-00104',8,104,NULL,NULL,NULL,0.000,0.00,0.850,383.63,0.000,0.00,451.3300,383.63,0.850,383.63,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(128,'2026-09-27','Opening','material_master',103,'MAT-00103',8,103,NULL,NULL,NULL,0.000,0.00,0.400,0.00,0.000,0.00,0.0000,0.00,0.400,0.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(129,'2026-09-27','Opening','material_master',102,'MAT-00102',8,102,NULL,NULL,NULL,0.000,0.00,0.550,0.00,0.000,0.00,0.0000,0.00,0.550,0.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(130,'2026-09-27','Opening','material_master',101,'MAT-00101',8,101,NULL,NULL,NULL,0.000,0.00,1.100,1408.64,0.000,0.00,1280.5800,1408.64,1.100,1408.64,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(131,'2026-09-27','Opening','material_master',100,'MAT-00100',8,100,NULL,NULL,NULL,0.000,0.00,1.800,1046.83,0.000,0.00,581.5700,1046.83,1.800,1046.83,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(132,'2026-09-27','Opening','material_master',99,'MAT-00099',8,99,NULL,NULL,NULL,0.000,0.00,0.400,264.29,0.000,0.00,660.7200,264.29,0.400,264.29,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(133,'2026-09-27','Opening','material_master',98,'MAT-00098',8,98,NULL,NULL,NULL,0.000,0.00,0.100,64.77,0.000,0.00,647.7000,64.77,0.100,64.77,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(134,'2026-09-27','Opening','material_master',97,'MAT-00097',8,97,NULL,NULL,NULL,0.000,0.00,1.700,815.35,0.000,0.00,479.6200,815.35,1.700,815.35,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(135,'2026-09-27','Opening','material_master',96,'MAT-00096',8,96,NULL,NULL,NULL,0.000,0.00,0.650,284.45,0.000,0.00,437.6200,284.45,0.650,284.45,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(136,'2026-09-27','Opening','material_master',95,'MAT-00095',8,95,NULL,NULL,NULL,0.000,0.00,0.300,151.33,0.000,0.00,504.4300,151.33,0.300,151.33,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(137,'2026-09-27','Opening','material_master',94,'MAT-00094',8,94,NULL,NULL,NULL,0.000,0.00,0.090,65.61,0.000,0.00,729.0000,65.61,0.090,65.61,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(138,'2026-09-27','Opening','material_master',93,'MAT-00093',8,93,NULL,NULL,NULL,0.000,0.00,0.200,74.44,0.000,0.00,372.2000,74.44,0.200,74.44,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(139,'2026-09-27','Opening','material_master',92,'MAT-00092',8,92,NULL,NULL,NULL,0.000,0.00,0.220,907.06,0.000,0.00,4123.0000,907.06,0.220,907.06,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(140,'2026-09-27','Opening','material_master',91,'MAT-00091',8,91,NULL,NULL,NULL,0.000,0.00,0.850,532.10,0.000,0.00,626.0000,532.10,0.850,532.10,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(141,'2026-09-27','Opening','material_master',90,'MAT-00090',8,90,NULL,NULL,NULL,0.000,0.00,0.850,510.00,0.000,0.00,600.0000,510.00,0.850,510.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(142,'2026-09-27','Opening','material_master',89,'MAT-00089',8,89,NULL,NULL,NULL,0.000,0.00,4.950,6499.35,0.000,0.00,1313.0000,6499.35,4.950,6499.35,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(143,'2026-09-27','Opening','material_master',88,'MAT-00088',8,88,NULL,NULL,NULL,0.000,0.00,2.000,1040.96,0.000,0.00,520.4800,1040.96,2.000,1040.96,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(144,'2026-09-27','Opening','material_master',87,'MAT-00087',8,87,NULL,NULL,NULL,0.000,0.00,0.450,548.10,0.000,0.00,1218.0000,548.10,0.450,548.10,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(145,'2026-09-27','Opening','material_master',86,'MAT-00086',8,86,NULL,NULL,NULL,0.000,0.00,0.400,344.00,0.000,0.00,860.0000,344.00,0.400,344.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(146,'2026-09-27','Opening','material_master',85,'MAT-00085',8,85,NULL,NULL,NULL,0.000,0.00,0.100,81.90,0.000,0.00,819.0000,81.90,0.100,81.90,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(147,'2026-09-27','Opening','material_master',84,'MAT-00084',8,84,NULL,NULL,NULL,0.000,0.00,2.950,2840.85,0.000,0.00,963.0000,2840.85,2.950,2840.85,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(148,'2026-09-27','Opening','material_master',83,'MAT-00083',8,83,NULL,NULL,NULL,0.000,0.00,1.500,1160.94,0.000,0.00,773.9600,1160.94,1.500,1160.94,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(149,'2026-09-27','Opening','material_master',82,'MAT-00082',8,82,NULL,NULL,NULL,0.000,0.00,3.700,3319.57,0.000,0.00,897.1800,3319.57,3.700,3319.57,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(150,'2026-09-27','Opening','material_master',81,'MAT-00081',8,81,NULL,NULL,NULL,0.000,0.00,2.600,2134.70,0.000,0.00,821.0400,2134.70,2.600,2134.70,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(151,'2026-09-27','Opening','material_master',80,'MAT-00080',8,80,NULL,NULL,NULL,0.000,0.00,0.600,296.66,0.000,0.00,494.4300,296.66,0.600,296.66,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(152,'2026-09-27','Opening','material_master',79,'MAT-00079',8,79,NULL,NULL,NULL,0.000,0.00,0.250,164.35,0.000,0.00,657.4000,164.35,0.250,164.35,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(153,'2026-09-27','Opening','material_master',78,'MAT-00078',8,78,NULL,NULL,NULL,0.000,0.00,5.250,6084.75,0.000,0.00,1159.0000,6084.75,5.250,6084.75,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(154,'2026-09-27','Opening','material_master',77,'MAT-00077',8,77,NULL,NULL,NULL,0.000,0.00,0.600,269.55,0.000,0.00,449.2500,269.55,0.600,269.55,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(155,'2026-09-27','Opening','material_master',76,'MAT-00076',8,76,NULL,NULL,NULL,0.000,0.00,3.300,2795.40,0.000,0.00,847.0900,2795.40,3.300,2795.40,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(156,'2026-09-27','Opening','material_master',75,'MAT-00075',8,75,NULL,NULL,NULL,0.000,0.00,0.350,361.00,0.000,0.00,1031.4400,361.00,0.350,361.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(157,'2026-09-27','Opening','material_master',74,'MAT-00074',8,74,NULL,NULL,NULL,0.000,0.00,0.500,261.74,0.000,0.00,523.4800,261.74,0.500,261.74,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(158,'2026-09-27','Opening','material_master',73,'MAT-00073',8,73,NULL,NULL,NULL,0.000,0.00,0.600,494.43,0.000,0.00,824.0500,494.43,0.600,494.43,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(159,'2026-09-27','Opening','material_master',72,'MAT-00072',8,72,NULL,NULL,NULL,0.000,0.00,0.750,185.25,0.000,0.00,247.0000,185.25,0.750,185.25,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(160,'2026-09-27','Opening','material_master',71,'MAT-00071',8,71,NULL,NULL,NULL,0.000,0.00,43.500,13398.00,0.000,0.00,308.0000,13398.00,43.500,13398.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(161,'2026-09-27','Opening','material_master',70,'MAT-00070',8,70,NULL,NULL,NULL,0.000,0.00,11.000,0.00,0.000,0.00,0.0000,0.00,11.000,0.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(162,'2026-09-27','Opening','material_master',69,'MAT-00069',8,69,NULL,NULL,NULL,0.000,0.00,14.500,4785.00,0.000,0.00,330.0000,4785.00,14.500,4785.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(163,'2026-09-27','Opening','material_master',68,'MAT-00068',8,68,NULL,NULL,NULL,0.000,0.00,20.300,6171.20,0.000,0.00,304.0000,6171.20,20.300,6171.20,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(164,'2026-09-27','Opening','material_master',67,'MAT-00067',8,67,NULL,NULL,NULL,0.000,0.00,14.400,3801.60,0.000,0.00,264.0000,3801.60,14.400,3801.60,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(165,'2026-09-27','Opening','material_master',66,'MAT-00066',8,66,NULL,NULL,NULL,0.000,0.00,61.000,7625.00,0.000,0.00,125.0000,7625.00,61.000,7625.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(166,'2026-09-27','Opening','material_master',65,'MAT-00065',8,65,NULL,NULL,NULL,0.000,0.00,15.900,1987.50,0.000,0.00,125.0000,1987.50,15.900,1987.50,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(167,'2026-09-27','Opening','material_master',64,'MAT-00064',8,64,NULL,NULL,NULL,0.000,0.00,17.000,3315.00,0.000,0.00,195.0000,3315.00,17.000,3315.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(168,'2026-09-27','Opening','material_master',63,'MAT-00063',8,63,NULL,NULL,NULL,0.000,0.00,11.400,1687.20,0.000,0.00,148.0000,1687.20,11.400,1687.20,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(169,'2026-09-27','Opening','material_master',62,'MAT-00062',8,62,NULL,NULL,NULL,0.000,0.00,19.500,2827.50,0.000,0.00,145.0000,2827.50,19.500,2827.50,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(170,'2026-09-27','Opening','material_master',61,'MAT-00061',8,61,NULL,NULL,NULL,0.000,0.00,11.950,2210.75,0.000,0.00,185.0000,2210.75,11.950,2210.75,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(171,'2026-09-27','Opening','material_master',60,'MAT-00060',8,60,NULL,NULL,NULL,0.000,0.00,11.300,2994.50,0.000,0.00,265.0000,2994.50,11.300,2994.50,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(172,'2026-09-27','Opening','material_master',59,'MAT-00059',8,59,NULL,NULL,NULL,0.000,0.00,11.500,3197.00,0.000,0.00,278.0000,3197.00,11.500,3197.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(173,'2026-09-27','Opening','material_master',58,'MAT-00058',8,58,NULL,NULL,NULL,0.000,0.00,38.900,8013.40,0.000,0.00,206.0000,8013.40,38.900,8013.40,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(174,'2026-09-27','Opening','material_master',57,'MAT-00057',8,57,NULL,NULL,NULL,0.000,0.00,20.000,3600.00,0.000,0.00,180.0000,3600.00,20.000,3600.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(175,'2026-09-27','Opening','material_master',56,'MAT-00056',8,56,NULL,NULL,NULL,-6.500,0.00,63.000,10080.00,0.000,0.00,160.0000,10080.00,56.500,10080.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(176,'2026-09-27','Opening','material_master',55,'MAT-00055',8,55,NULL,NULL,NULL,0.000,0.00,5.000,625.00,0.000,0.00,125.0000,625.00,5.000,625.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(177,'2026-09-27','Opening','material_master',54,'MAT-00054',8,54,NULL,NULL,NULL,-3.750,0.00,46.500,5533.50,0.000,0.00,119.0000,5533.50,42.750,5533.50,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(178,'2026-09-27','Opening','material_master',53,'MAT-00053',8,53,NULL,NULL,NULL,0.000,0.00,21.500,5848.00,0.000,0.00,272.0000,5848.00,21.500,5848.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(179,'2026-09-27','Opening','material_master',52,'MAT-00052',8,52,NULL,NULL,NULL,-23.500,0.00,119.000,13328.00,0.000,0.00,112.0000,13328.00,95.500,13328.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(180,'2026-09-27','Opening','material_master',51,'MAT-00051',8,51,NULL,NULL,NULL,-5.500,0.00,63.700,7452.90,0.000,0.00,117.0000,7452.90,58.200,7452.90,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(181,'2026-09-27','Opening','material_master',50,'MAT-00050',8,50,NULL,NULL,NULL,-6.500,0.00,45.500,5505.50,0.000,0.00,121.0000,5505.50,39.000,5505.50,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(182,'2026-09-27','Opening','material_master',49,'MAT-00049',8,49,NULL,NULL,NULL,-8.500,0.00,129.300,6465.00,0.000,0.00,50.0000,6465.00,120.800,6465.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(183,'2026-09-27','Opening','material_master',48,'MAT-00048',8,48,NULL,NULL,NULL,0.000,0.00,59.000,10384.00,0.000,0.00,176.0000,10384.00,59.000,10384.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(184,'2026-09-27','Opening','material_master',47,'MAT-00047',8,47,NULL,NULL,NULL,-6.500,0.00,105.800,5819.00,0.000,0.00,55.0000,5819.00,99.300,5819.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(185,'2026-09-27','Opening','material_master',46,'MAT-00046',8,46,NULL,NULL,NULL,-14.250,0.00,42.000,7770.00,0.000,0.00,185.0000,7770.00,27.750,7770.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(186,'2026-09-27','Opening','material_master',45,'MAT-00045',8,45,NULL,NULL,NULL,0.000,0.00,74.300,12556.70,0.000,0.00,169.0000,12556.70,74.300,12556.70,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(187,'2026-09-27','Opening','material_master',44,'MAT-00044',8,44,NULL,NULL,NULL,0.000,0.00,50.000,15350.00,0.000,0.00,307.0000,15350.00,50.000,15350.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(188,'2026-09-27','Opening','material_master',43,'MAT-00043',8,43,NULL,NULL,NULL,0.000,0.00,159.500,36685.00,0.000,0.00,230.0000,36685.00,159.500,36685.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(189,'2026-09-27','Opening','material_master',42,'MAT-00042',8,42,NULL,NULL,NULL,-6.500,0.00,42.300,6133.50,0.000,0.00,145.0000,6133.50,35.800,6133.50,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(190,'2026-09-27','Opening','material_master',41,'MAT-00041',8,41,NULL,NULL,NULL,0.000,0.00,32.500,7020.00,0.000,0.00,216.0000,7020.00,32.500,7020.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(191,'2026-09-27','Opening','material_master',40,'MAT-00040',8,40,NULL,NULL,NULL,-6.500,0.00,8.700,1539.90,0.000,0.00,177.0000,1539.90,2.200,1539.90,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(192,'2026-09-27','Opening','material_master',39,'MAT-00039',8,39,NULL,NULL,NULL,-7.500,0.00,10.000,2300.00,0.000,0.00,230.0000,2300.00,2.500,2300.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(193,'2026-09-27','Opening','material_master',38,'MAT-00038',8,38,NULL,NULL,NULL,-15.500,0.00,35.000,7175.00,0.000,0.00,205.0000,7175.00,19.500,7175.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(194,'2026-09-27','Opening','material_master',37,'MAT-00037',8,37,NULL,NULL,NULL,-10.500,0.00,25.000,5250.00,0.000,0.00,210.0000,5250.00,14.500,5250.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(195,'2026-09-27','Opening','material_master',36,'MAT-00036',8,36,NULL,NULL,NULL,-1.350,0.00,20.000,26060.00,0.000,0.00,1303.0000,26060.00,18.650,26060.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(196,'2026-09-27','Opening','material_master',35,'MAT-00035',8,35,NULL,NULL,NULL,0.000,0.00,30.000,10380.00,0.000,0.00,346.0000,10380.00,30.000,10380.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(197,'2026-09-27','Opening','material_master',34,'MAT-00034',8,34,NULL,NULL,NULL,-12.500,0.00,80.000,16800.00,0.000,0.00,210.0000,16800.00,67.500,16800.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(198,'2026-09-27','Opening','material_master',33,'MAT-00033',8,33,NULL,NULL,NULL,-6.500,0.00,130.000,33280.00,0.000,0.00,256.0000,33280.00,123.500,33280.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(199,'2026-09-27','Opening','material_master',32,'MAT-00032',8,32,NULL,NULL,NULL,-6.500,0.00,70.000,20160.00,0.000,0.00,288.0000,20160.00,63.500,20160.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(200,'2026-09-27','Opening','material_master',31,'MAT-00031',8,31,NULL,NULL,NULL,-6.500,0.00,30.000,4170.00,0.000,0.00,139.0000,4170.00,23.500,4170.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(201,'2026-09-27','Opening','material_master',30,'MAT-00030',8,30,NULL,NULL,NULL,-12.500,0.00,70.000,11900.00,0.000,0.00,170.0000,11900.00,57.500,11900.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(202,'2026-09-27','Opening','material_master',29,'MAT-00029',8,29,NULL,NULL,NULL,-6.500,0.00,96.000,17952.00,0.000,0.00,187.0000,17952.00,89.500,17952.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(203,'2026-09-27','Opening','material_master',28,'MAT-00028',8,28,NULL,NULL,NULL,0.000,0.00,2.400,542.40,0.000,0.00,226.0000,542.40,2.400,542.40,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(204,'2026-09-27','Opening','material_master',27,'MAT-00027',8,27,NULL,NULL,NULL,0.000,0.00,2.500,590.00,0.000,0.00,236.0000,590.00,2.500,590.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(205,'2026-09-27','Opening','material_master',26,'MAT-00026',8,26,NULL,NULL,NULL,0.000,0.00,3.000,1680.00,0.000,0.00,560.0000,1680.00,3.000,1680.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(206,'2026-09-27','Opening','material_master',25,'MAT-00025',8,25,NULL,NULL,NULL,0.000,0.00,6.000,1926.00,0.000,0.00,321.0000,1926.00,6.000,1926.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(207,'2026-09-27','Opening','material_master',24,'MAT-00024',8,24,NULL,NULL,NULL,0.000,0.00,0.500,103.00,0.000,0.00,206.0000,103.00,0.500,103.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(208,'2026-09-27','Opening','material_master',23,'MAT-00023',8,23,NULL,NULL,NULL,0.000,0.00,10.900,1885.70,0.000,0.00,173.0000,1885.70,10.900,1885.70,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(209,'2026-09-27','Opening','material_master',22,'MAT-00022',8,22,NULL,NULL,NULL,0.000,0.00,21.300,5026.80,0.000,0.00,236.0000,5026.80,21.300,5026.80,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(210,'2026-09-27','Opening','material_master',21,'MAT-00021',8,21,NULL,NULL,NULL,0.000,0.00,1.800,417.60,0.000,0.00,232.0000,417.60,1.800,417.60,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(211,'2026-09-27','Opening','material_master',20,'MAT-00020',8,20,NULL,NULL,NULL,0.000,0.00,85.000,32215.00,0.000,0.00,379.0000,32215.00,85.000,32215.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(212,'2026-09-27','Opening','material_master',19,'MAT-00019',8,19,NULL,NULL,NULL,0.000,0.00,5.500,2453.00,0.000,0.00,446.0000,2453.00,5.500,2453.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(213,'2026-09-27','Opening','material_master',18,'MAT-00018',8,18,NULL,NULL,NULL,0.000,0.00,3.000,1395.00,0.000,0.00,465.0000,1395.00,3.000,1395.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(214,'2026-09-27','Opening','material_master',17,'MAT-00017',8,17,NULL,NULL,NULL,0.000,0.00,5.000,2875.00,0.000,0.00,575.0000,2875.00,5.000,2875.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(215,'2026-09-27','Opening','material_master',16,'MAT-00016',8,16,NULL,NULL,NULL,0.000,0.00,4.600,1205.20,0.000,0.00,262.0000,1205.20,4.600,1205.20,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(216,'2026-09-27','Opening','material_master',15,'MAT-00015',8,15,NULL,NULL,NULL,0.000,0.00,9.400,2697.80,0.000,0.00,287.0000,2697.80,9.400,2697.80,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(217,'2026-09-27','Opening','material_master',14,'MAT-00014',8,14,NULL,NULL,NULL,0.000,0.00,150.000,33300.00,0.000,0.00,222.0000,33300.00,150.000,33300.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(218,'2026-09-27','Opening','material_master',13,'MAT-00013',8,13,NULL,NULL,NULL,0.000,0.00,33.000,19866.00,0.000,0.00,602.0000,19866.00,33.000,19866.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(219,'2026-09-27','Opening','material_master',12,'MAT-00012',8,12,NULL,NULL,NULL,0.000,0.00,30.000,3720.00,0.000,0.00,124.0000,3720.00,30.000,3720.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(220,'2026-09-27','Opening','material_master',11,'MAT-00011',8,11,NULL,NULL,NULL,0.000,0.00,148.000,27676.00,0.000,0.00,187.0000,27676.00,148.000,27676.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(221,'2026-09-27','Opening','material_master',10,'MAT-00010',8,10,NULL,NULL,NULL,-4.000,0.00,145.000,20300.00,0.000,0.00,140.0000,20300.00,141.000,20300.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(222,'2026-09-27','Opening','material_master',9,'MAT-00009',8,9,NULL,NULL,NULL,0.000,0.00,139.800,38025.60,0.000,0.00,272.0000,38025.60,139.800,38025.60,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(223,'2026-09-27','Opening','material_master',8,'MAT-00008',8,8,NULL,NULL,NULL,-12.500,0.00,50.000,10200.00,0.000,0.00,204.0000,10200.00,37.500,10200.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(224,'2026-09-27','Opening','material_master',7,'MAT-00007',8,7,NULL,NULL,NULL,0.000,0.00,13.700,5891.00,0.000,0.00,430.0000,5891.00,13.700,5891.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(225,'2026-09-27','Opening','material_master',6,'MAT-00006',8,6,NULL,NULL,NULL,0.000,0.00,16.900,5323.50,0.000,0.00,315.0000,5323.50,16.900,5323.50,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(226,'2026-09-27','Opening','material_master',5,'MAT-00005',8,5,NULL,NULL,NULL,0.000,0.00,25.500,4360.50,0.000,0.00,171.0000,4360.50,25.500,4360.50,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(227,'2026-09-27','Opening','material_master',4,'MAT-00004',8,4,NULL,NULL,NULL,0.000,0.00,11.300,904.00,0.000,0.00,80.0000,904.00,11.300,904.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(228,'2026-09-27','Opening','material_master',3,'MAT-00003',8,3,NULL,NULL,NULL,0.000,0.00,27.500,3437.50,0.000,0.00,125.0000,3437.50,27.500,3437.50,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(229,'2026-09-27','Opening','material_master',2,'MAT-00002',8,2,NULL,NULL,NULL,0.000,0.00,14.000,4508.00,0.000,0.00,322.0000,4508.00,14.000,4508.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(230,'2026-09-27','Opening','material_master',1,'MAT-00001',8,1,NULL,NULL,NULL,0.000,0.00,14.700,5733.00,0.000,0.00,390.0000,5733.00,14.700,5733.00,'Opening stock (material master backfill)',NULL,'2026-09-27 16:05:59'),(282,'2026-09-28','Receipt','material_receipt',12,'GRN-2026-00001',7,211,'Piece',NULL,NULL,0.000,0.00,607.000,141218.55,0.000,0.00,232.6500,141218.55,607.000,141218.55,'Material receipt',7,'2026-09-28 08:39:44'),(283,'2026-09-28','Issue','material_issue',19,'ISS-2026-00002',8,9,'Kg',NULL,NULL,139.800,38025.60,0.000,0.00,1.750,476.00,272.0000,476.00,138.050,37549.60,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(284,'2026-09-28','Issue','material_issue',19,'ISS-2026-00002',8,10,'Kg',NULL,NULL,141.000,20300.00,0.000,0.00,1.750,251.95,143.9716,251.95,139.250,20048.05,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(285,'2026-09-28','Issue','material_issue',19,'ISS-2026-00002',8,52,'Kg',NULL,NULL,95.500,13328.00,0.000,0.00,5.500,767.58,139.5602,767.58,90.000,12560.42,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(286,'2026-09-28','Issue','material_issue',19,'ISS-2026-00002',8,51,'Kg',NULL,NULL,58.200,7452.90,0.000,0.00,7.500,960.43,128.0567,960.43,50.700,6492.47,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(287,'2026-09-28','Issue','material_issue',19,'ISS-2026-00002',8,44,'Kg',NULL,NULL,50.000,15350.00,0.000,0.00,8.500,2609.50,307.0000,2609.50,41.500,12740.50,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(288,'2026-09-28','Issue','material_issue',19,'ISS-2026-00002',8,33,'Kg',NULL,NULL,123.500,33280.00,0.000,0.00,3.000,808.42,269.4737,808.42,120.500,32471.58,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(289,'2026-09-28','Issue','material_issue',19,'ISS-2026-00002',8,47,'Kg',NULL,NULL,99.300,5819.00,0.000,0.00,4.000,234.40,58.6002,234.40,95.300,5584.60,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(290,'2026-09-28','Issue','material_issue',19,'ISS-2026-00002',8,49,'Kg',NULL,NULL,120.800,6465.00,0.000,0.00,1.700,90.98,53.5182,90.98,119.100,6374.02,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(291,'2026-09-28','Issue','material_issue',19,'ISS-2026-00002',8,29,'Kg',NULL,NULL,89.500,17952.00,0.000,0.00,7.500,1504.36,200.5810,1504.36,82.000,16447.64,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(292,'2026-09-28','Issue','material_issue',19,'ISS-2026-00002',8,50,'Kg',NULL,NULL,39.000,5505.50,0.000,0.00,4.000,564.67,141.1667,564.67,35.000,4940.83,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(293,'2026-09-28','Issue','material_issue',19,'ISS-2026-00002',8,49,'Kg',NULL,NULL,119.100,6374.02,0.000,0.00,1.000,53.52,53.5182,53.52,118.100,6320.50,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(294,'2026-09-28','Issue','material_issue',19,'ISS-2026-00002',8,30,'Kg',NULL,NULL,57.500,11900.00,0.000,0.00,10.500,2173.04,206.9565,2173.04,47.000,9726.96,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(295,'2026-09-28','Issue','material_issue',19,'ISS-2026-00002',8,31,'Kg',NULL,NULL,23.500,4170.00,0.000,0.00,7.500,1330.85,177.4468,1330.85,16.000,2839.15,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(296,'2026-09-28','Issue','material_issue',19,'ISS-2026-00002',8,43,'Kg',NULL,NULL,159.500,36685.00,0.000,0.00,12.500,2875.00,230.0000,2875.00,147.000,33810.00,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(297,'2026-09-28','Issue','material_issue',19,'ISS-2026-00002',8,56,'Kg',NULL,NULL,56.500,10080.00,0.000,0.00,7.500,1338.05,178.4071,1338.05,49.000,8741.95,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(298,'2026-09-28','Issue','material_issue',19,'ISS-2026-00002',8,61,'Kg',NULL,NULL,11.950,2210.75,0.000,0.00,6.500,1202.50,185.0000,1202.50,5.450,1008.25,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(299,'2026-09-28','Issue','material_issue',19,'ISS-2026-00002',8,45,'Kg',NULL,NULL,74.300,12556.70,0.000,0.00,12.500,2112.50,169.0000,2112.50,61.800,10444.20,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(300,'2026-09-28','Issue','material_issue',19,'ISS-2026-00002',8,40,'Kg',NULL,NULL,2.200,1539.90,0.000,0.00,3.500,2449.84,699.9545,2449.84,-1.300,-909.94,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(301,'2026-09-28','Issue','material_issue',19,'ISS-2026-00002',8,42,'Kg',NULL,NULL,35.800,6133.50,0.000,0.00,9.500,1627.60,171.3268,1627.60,26.300,4505.90,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(302,'2026-09-28','Issue','material_issue',19,'ISS-2026-00002',8,69,'Kg',NULL,NULL,14.500,4785.00,0.000,0.00,5.500,1815.00,330.0000,1815.00,9.000,2970.00,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(303,'2026-09-28','Issue','material_issue',19,'ISS-2026-00002',8,182,'Kg',NULL,NULL,50.000,35550.00,0.000,0.00,2.600,1848.60,711.0000,1848.60,47.400,33701.40,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(304,'2026-09-28','Issue','material_issue',19,'ISS-2026-00002',8,35,'Kg',NULL,NULL,30.000,10380.00,0.000,0.00,7.500,2595.00,346.0000,2595.00,22.500,7785.00,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(305,'2026-09-28','Issue','material_issue',19,'ISS-2026-00002',8,116,'Kg',NULL,NULL,60.000,25012.50,0.000,0.00,7.500,3126.56,416.8750,3126.56,52.500,21885.94,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(306,'2026-09-28','Issue','material_issue',19,'ISS-2026-00002',8,32,'Kg',NULL,NULL,63.500,20160.00,0.000,0.00,4.000,1269.92,317.4803,1269.92,59.500,18890.08,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(307,'2026-09-28','Issue','material_issue',19,'ISS-2026-00002',8,115,'Kg',NULL,NULL,82.500,14305.50,0.000,0.00,4.000,693.60,173.4000,693.60,78.500,13611.90,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(308,'2026-09-28','Issue','material_issue',19,'ISS-2026-00002',8,114,'Kg',NULL,NULL,10.000,2730.00,0.000,0.00,3.500,955.50,273.0000,955.50,6.500,1774.50,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(309,'2026-09-28','Issue','material_issue',19,'ISS-2026-00002',8,10,'Kg',NULL,NULL,139.250,20048.05,0.000,0.00,0.750,107.98,143.9716,107.98,138.500,19940.07,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(310,'2026-09-28','Issue','material_issue',19,'ISS-2026-00002',8,29,'Kg',NULL,NULL,82.000,16447.64,0.000,0.00,7.500,1504.36,200.5810,1504.36,74.500,14943.28,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(311,'2026-09-28','Issue','material_issue',19,'ISS-2026-00002',8,69,'Kg',NULL,NULL,9.000,2970.00,0.000,0.00,1.000,330.00,330.0000,330.00,8.000,2640.00,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(312,'2026-09-28','Issue','material_issue',19,'ISS-2026-00002',8,66,'Kg',NULL,NULL,61.000,7625.00,0.000,0.00,3.250,406.25,125.0000,406.25,57.750,7218.75,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(313,'2026-09-28','Issue','material_issue',19,'ISS-2026-00002',8,114,'Kg',NULL,NULL,6.500,1774.50,0.000,0.00,2.500,682.50,273.0000,682.50,4.000,1092.00,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(314,'2026-09-28','Issue','material_issue',19,'ISS-2026-00002',8,10,'Kg',NULL,NULL,138.500,19940.07,0.000,0.00,1.000,143.97,143.9716,143.97,137.500,19796.10,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(315,'2026-09-28','Issue','material_issue',19,'ISS-2026-00002',8,15,'Kg',NULL,NULL,9.400,2697.80,0.000,0.00,3.000,861.00,287.0000,861.00,6.400,1836.80,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(316,'2026-09-28','Issue','material_issue',20,'ISS-2026-00003',8,123,'Kg',NULL,NULL,80.000,14160.00,0.000,0.00,0.800,141.60,177.0000,141.60,79.200,14018.40,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(317,'2026-09-28','Issue','material_issue',20,'ISS-2026-00003',8,118,'Kg',NULL,NULL,120.000,18000.00,0.000,0.00,15.000,2250.00,150.0000,2250.00,105.000,15750.00,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(318,'2026-09-28','Issue','material_issue',20,'ISS-2026-00003',8,123,'Kg',NULL,NULL,79.200,14018.40,0.000,0.00,10.000,1770.00,177.0000,1770.00,69.200,12248.40,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(319,'2026-09-28','Issue','material_issue',20,'ISS-2026-00003',8,121,'Kg',NULL,NULL,50.000,7500.00,0.000,0.00,5.000,750.00,150.0000,750.00,45.000,6750.00,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(320,'2026-09-28','Issue','material_issue',20,'ISS-2026-00003',8,170,'Kg',NULL,NULL,21.000,5124.00,0.000,0.00,5.000,1220.00,244.0000,1220.00,16.000,3904.00,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(321,'2026-09-28','Issue','material_issue',20,'ISS-2026-00003',8,120,'Kg',NULL,NULL,49.000,32683.00,0.000,0.00,5.000,3335.00,667.0000,3335.00,44.000,29348.00,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(322,'2026-09-28','Issue','material_issue',20,'ISS-2026-00003',8,125,'Kg',NULL,NULL,15.000,13935.00,0.000,0.00,2.000,1858.00,929.0000,1858.00,13.000,12077.00,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(323,'2026-09-28','Issue','material_issue',20,'ISS-2026-00003',8,182,'Kg',NULL,NULL,47.400,33701.40,0.000,0.00,16.000,11376.00,711.0000,11376.00,31.400,22325.40,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(324,'2026-09-28','Issue','material_issue',20,'ISS-2026-00003',8,158,'Kg',NULL,NULL,0.570,2966.28,0.000,0.00,0.120,624.48,5204.0000,624.48,0.450,2341.80,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(325,'2026-09-28','Issue','material_issue',20,'ISS-2026-00003',8,173,'Kg',NULL,NULL,8.000,6488.00,0.000,0.00,1.875,1520.63,811.0000,1520.63,6.125,4967.38,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(326,'2026-09-28','Issue','material_issue',20,'ISS-2026-00003',8,120,'Kg',NULL,NULL,44.000,29348.00,0.000,0.00,1.875,1250.63,667.0000,1250.63,42.125,28097.38,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(327,'2026-09-28','Issue','material_issue',20,'ISS-2026-00003',8,172,'Kg',NULL,NULL,17.000,6477.00,0.000,0.00,2.250,857.25,381.0000,857.25,14.750,5619.75,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(328,'2026-09-28','Issue','material_issue',20,'ISS-2026-00003',8,167,'Kg',NULL,NULL,5.500,3712.50,0.000,0.00,1.050,708.75,675.0000,708.75,4.450,3003.75,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(329,'2026-09-28','Issue','material_issue',20,'ISS-2026-00003',8,125,'Kg',NULL,NULL,13.000,12077.00,0.000,0.00,0.750,696.75,929.0000,696.75,12.250,11380.25,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(330,'2026-09-28','Issue','material_issue',20,'ISS-2026-00003',8,126,'Kg',NULL,NULL,0.850,1329.40,0.000,0.00,0.300,469.20,1564.0000,469.20,0.550,860.20,'Issue (posted-issue ledger backfill)',7,'2026-10-08 10:52:26'),(346,'2026-10-05','Receipt','material_receipt',47,'GRN-2026-00016',7,126,'Kg',NULL,NULL,0.000,0.00,5.000,7820.00,0.000,0.00,1564.0000,7820.00,5.000,7820.00,'Material receipt',16,'2026-10-08 12:27:27'),(347,'2026-10-05','Receipt','material_receipt',39,'GRN-2026-00008',7,192,'Kg',NULL,NULL,0.000,0.00,30.000,8280.00,0.000,0.00,276.0000,8280.00,30.000,8280.00,'Material receipt',16,'2026-10-08 12:31:07'),(348,'2026-10-05','Receipt','material_receipt',39,'GRN-2026-00008',7,171,'Kg',NULL,NULL,0.000,0.00,30.000,5520.00,0.000,0.00,184.0000,5520.00,30.000,5520.00,'Material receipt',16,'2026-10-08 12:31:07'),(349,'2026-10-05','Receipt','material_receipt',39,'GRN-2026-00008',7,46,'Kg',NULL,NULL,0.000,0.00,50.000,8550.00,0.000,0.00,171.0000,8550.00,50.000,8550.00,'Material receipt',16,'2026-10-08 12:31:07'),(350,'2026-10-05','Receipt','material_receipt',39,'GRN-2026-00008',7,226,'Kg',NULL,NULL,0.000,0.00,120.000,23880.00,0.000,0.00,199.0000,23880.00,120.000,23880.00,'Material receipt',16,'2026-10-08 12:31:07'),(351,'2026-10-05','Receipt','material_receipt',40,'GRN-2026-00009',7,50,'Kg',NULL,NULL,0.000,0.00,60.000,7260.00,0.000,0.00,121.0000,7260.00,60.000,7260.00,'Material receipt',16,'2026-10-08 12:31:44'),(352,'2026-10-03','Receipt','material_receipt',41,'GRN-2026-00010',8,172,'Kg',NULL,NULL,44.750,17049.75,30.000,11430.00,0.000,0.00,381.0000,11430.00,74.750,28479.75,'Material receipt',16,'2026-10-08 12:31:56'),(353,'2026-10-03','Receipt','material_receipt',41,'GRN-2026-00010',8,173,'Kg',NULL,NULL,36.125,29297.38,30.000,24330.00,0.000,0.00,811.0000,24330.00,66.125,53627.38,'Material receipt',16,'2026-10-08 12:31:56'),(354,'2026-10-03','Receipt','material_receipt',41,'GRN-2026-00010',8,167,'Kg',NULL,NULL,14.450,9753.75,10.000,6750.00,0.000,0.00,675.0000,6750.00,24.450,16503.75,'Material receipt',16,'2026-10-08 12:31:56'),(355,'2026-10-03','Receipt','material_receipt',41,'GRN-2026-00010',8,158,'Kg',NULL,NULL,1.450,7545.80,1.000,5204.00,0.000,0.00,5204.0000,5204.00,2.450,12749.80,'Material receipt',16,'2026-10-08 12:31:56'),(356,'2026-10-01','Receipt','material_receipt',42,'GRN-2026-00011',7,118,'Kg',NULL,NULL,0.000,0.00,120.000,18000.00,0.000,0.00,150.0000,18000.00,120.000,18000.00,'Material receipt',16,'2026-10-08 12:32:08'),(357,'2026-10-01','Receipt','material_receipt',42,'GRN-2026-00011',7,227,'Kg',NULL,NULL,0.000,0.00,120.000,18000.00,0.000,0.00,150.0000,18000.00,120.000,18000.00,'Material receipt',16,'2026-10-08 12:32:08'),(358,'2026-10-01','Receipt','material_receipt',42,'GRN-2026-00011',7,121,'Kg',NULL,NULL,0.000,0.00,120.000,18000.00,0.000,0.00,150.0000,18000.00,120.000,18000.00,'Material receipt',16,'2026-10-08 12:32:08'),(359,'2026-10-01','Receipt','material_receipt',43,'GRN-2026-00012',8,178,'Kg',NULL,NULL,30.500,5978.00,120.000,22920.00,0.000,0.00,191.0000,22920.00,150.500,28898.00,'Material receipt',16,'2026-10-08 12:32:21'),(360,'2026-10-01','Receipt','material_receipt',43,'GRN-2026-00012',8,228,'Kg',NULL,NULL,0.000,0.00,5.000,1305.00,0.000,0.00,261.0000,1305.00,5.000,1305.00,'Material receipt',16,'2026-10-08 12:32:21'),(361,'2026-10-01','Receipt','material_receipt',44,'GRN-2026-00013',8,120,'Kg',NULL,NULL,72.125,48107.38,30.000,20010.00,0.000,0.00,667.0000,20010.00,102.125,68117.38,'Material receipt',16,'2026-10-08 12:32:49'),(362,'2026-10-01','Receipt','material_receipt',44,'GRN-2026-00013',8,125,'Kg',NULL,NULL,32.250,29960.25,20.000,18580.00,0.000,0.00,929.0000,18580.00,52.250,48540.25,'Material receipt',16,'2026-10-08 12:32:49'),(363,'2026-10-01','Receipt','material_receipt',44,'GRN-2026-00013',8,190,'Kg',NULL,NULL,5.000,2465.00,10.000,4930.00,0.000,0.00,493.0000,4930.00,15.000,7395.00,'Material receipt',16,'2026-10-08 12:32:49'),(364,'2026-10-01','Receipt','material_receipt',44,'GRN-2026-00013',8,183,'Kg',NULL,NULL,1.500,756.00,10.000,5040.00,0.000,0.00,504.0000,5040.00,11.500,5796.00,'Material receipt',16,'2026-10-08 12:32:49'),(365,'2026-10-01','Receipt','material_receipt',44,'GRN-2026-00013',8,184,'Kg',NULL,NULL,0.000,0.00,5.000,5490.00,0.000,0.00,1098.0000,5490.00,5.000,5490.00,'Material receipt',16,'2026-10-08 12:32:49'),(366,'2026-10-01','Receipt','material_receipt',44,'GRN-2026-00013',8,185,'Kg',NULL,NULL,0.500,376.50,3.000,2259.00,0.000,0.00,753.0000,2259.00,3.500,2635.50,'Material receipt',16,'2026-10-08 12:32:49'),(367,'2026-10-01','Receipt','material_receipt',44,'GRN-2026-00013',8,229,'Kg',NULL,NULL,0.000,0.00,5.000,4800.00,0.000,0.00,960.0000,4800.00,5.000,4800.00,'Material receipt',16,'2026-10-08 12:32:49'),(368,'2026-09-30','Receipt','material_receipt',45,'GRN-2026-00014',8,230,'Kg',NULL,NULL,0.000,0.00,500.000,52625.00,0.000,0.00,105.2500,52625.00,500.000,52625.00,'Material receipt',16,'2026-10-08 12:34:02'),(369,'2026-09-28','Receipt','material_receipt',14,'GRN-2026-00002',8,213,'Kilogram',NULL,NULL,0.000,0.00,2.000,1573.92,0.000,0.00,786.9600,1573.92,2.000,1573.92,'Material receipt',16,'2026-10-08 12:34:13'),(370,'2026-09-28','Receipt','material_receipt',14,'GRN-2026-00002',8,85,'Kg',NULL,NULL,0.100,81.90,2.000,1616.00,0.000,0.00,808.0000,1616.00,2.100,1697.90,'Material receipt',16,'2026-10-08 12:34:13'),(371,'2026-09-28','Receipt','material_receipt',14,'GRN-2026-00002',8,31,'Kg',NULL,NULL,16.000,2839.15,100.000,13900.00,0.000,0.00,139.0000,13900.00,116.000,16739.15,'Material receipt',16,'2026-10-08 12:34:13'),(372,'2026-09-28','Receipt','material_receipt',14,'GRN-2026-00002',8,182,'Kg',NULL,NULL,31.400,22325.40,100.000,71100.00,0.000,0.00,711.0000,71100.00,131.400,93425.40,'Material receipt',16,'2026-10-08 12:34:13'),(373,'2026-09-28','Receipt','material_receipt',14,'GRN-2026-00002',8,173,'Kg',NULL,NULL,6.125,4967.38,30.000,24330.00,0.000,0.00,811.0000,24330.00,36.125,29297.38,'Material receipt',16,'2026-10-08 12:34:13'),(374,'2026-09-28','Receipt','material_receipt',14,'GRN-2026-00002',8,172,'Kg',NULL,NULL,14.750,5619.75,30.000,11430.00,0.000,0.00,381.0000,11430.00,44.750,17049.75,'Material receipt',16,'2026-10-08 12:34:13'),(375,'2026-09-28','Receipt','material_receipt',14,'GRN-2026-00002',8,158,'Kg',NULL,NULL,0.450,2341.80,1.000,5204.00,0.000,0.00,5204.0000,5204.00,1.450,7545.80,'Material receipt',16,'2026-10-08 12:34:13'),(376,'2026-09-28','Receipt','material_receipt',14,'GRN-2026-00002',8,125,'Kg',NULL,NULL,12.250,11380.25,10.000,9290.00,0.000,0.00,929.0000,9290.00,22.250,20670.25,'Material receipt',16,'2026-10-08 12:34:13'),(377,'2026-09-28','Receipt','material_receipt',14,'GRN-2026-00002',8,167,'Kg',NULL,NULL,4.450,3003.75,10.000,6750.00,0.000,0.00,675.0000,6750.00,14.450,9753.75,'Material receipt',16,'2026-10-08 12:34:13'),(378,'2026-09-28','Receipt','material_receipt',14,'GRN-2026-00002',8,126,'Kg',NULL,NULL,0.550,860.20,5.000,7820.00,0.000,0.00,1564.0000,7820.00,5.550,8680.20,'Material receipt',16,'2026-10-08 12:34:13'),(379,'2026-09-28','Receipt','material_receipt',14,'GRN-2026-00002',8,107,'Kg',NULL,NULL,48.750,32886.00,25.000,13500.00,0.000,0.00,540.0000,13500.00,73.750,46386.00,'Material receipt',16,'2026-10-08 12:34:13'),(380,'2026-09-28','Receipt','material_receipt',14,'GRN-2026-00002',8,108,'Kg',NULL,NULL,47.750,27000.00,25.000,11250.00,0.000,0.00,450.0000,11250.00,72.750,38250.00,'Material receipt',16,'2026-10-08 12:34:13'),(381,'2026-09-28','Receipt','material_receipt',14,'GRN-2026-00002',8,214,'Kilogram',NULL,NULL,1.000,667.74,1.000,663.00,0.000,0.00,663.0000,663.00,2.000,1330.74,'Material receipt',16,'2026-10-08 12:34:13'),(382,'2026-09-28','Receipt','material_receipt',14,'GRN-2026-00002',8,178,'Kg',NULL,NULL,0.500,98.00,30.000,5880.00,0.000,0.00,196.0000,5880.00,30.500,5978.00,'Material receipt',16,'2026-10-08 12:34:13'),(383,'2026-09-28','Receipt','material_receipt',14,'GRN-2026-00002',8,123,'Kg',NULL,NULL,69.200,12248.40,120.000,21240.00,0.000,0.00,177.0000,21240.00,189.200,33488.40,'Material receipt',16,'2026-10-08 12:34:13'),(384,'2026-09-28','Receipt','material_receipt',14,'GRN-2026-00002',8,209,'Kilogram',NULL,NULL,-23.000,0.00,350.000,30100.00,0.000,0.00,86.0000,30100.00,327.000,30100.00,'Material receipt',16,'2026-10-08 12:34:13'),(385,'2026-09-28','Receipt','material_receipt',14,'GRN-2026-00002',8,209,'Kilogram',NULL,NULL,327.000,30100.00,210.000,16800.00,0.000,0.00,80.0000,16800.00,537.000,46900.00,'Material receipt',16,'2026-10-08 12:34:13'),(386,'2026-09-28','Receipt','material_receipt',14,'GRN-2026-00002',8,213,'Kilogram',NULL,NULL,2.000,1573.92,10.000,0.00,0.000,0.00,0.0000,0.00,12.000,1573.92,'Material receipt',16,'2026-10-08 12:34:13'),(387,'2026-09-28','Receipt','material_receipt',36,'GRN-2026-00005',8,120,'Kg',NULL,NULL,42.125,28097.38,30.000,20010.00,0.000,0.00,667.0000,20010.00,72.125,48107.38,'Material receipt',16,'2026-10-08 12:34:30'),(388,'2026-09-28','Receipt','material_receipt',36,'GRN-2026-00005',8,125,'Kg',NULL,NULL,22.250,20670.25,10.000,9290.00,0.000,0.00,929.0000,9290.00,32.250,29960.25,'Material receipt',16,'2026-10-08 12:34:30'),(389,'2026-09-28','Receipt','material_receipt',36,'GRN-2026-00005',8,139,'Kg',NULL,NULL,8.000,5400.00,10.000,6750.00,0.000,0.00,675.0000,6750.00,18.000,12150.00,'Material receipt',16,'2026-10-08 12:34:30'),(390,'2026-09-28','Receipt','material_receipt',36,'GRN-2026-00005',8,168,'Kg',NULL,NULL,1.500,607.50,10.000,4050.00,0.000,0.00,405.0000,4050.00,11.500,4657.50,'Material receipt',16,'2026-10-08 12:34:30'),(391,'2026-09-25','Receipt','material_receipt',35,'GRN-2026-00004',8,220,'Kg',NULL,NULL,0.000,0.00,1.000,364.00,0.000,0.00,364.0000,364.00,1.000,364.00,'Material receipt',16,'2026-10-08 12:34:38'),(392,'2026-09-25','Receipt','material_receipt',35,'GRN-2026-00004',8,221,'Kg',NULL,NULL,0.000,0.00,1.000,710.00,0.000,0.00,710.0000,710.00,1.000,710.00,'Material receipt',16,'2026-10-08 12:34:38'),(393,'2026-09-25','Receipt','material_receipt',35,'GRN-2026-00004',8,222,'Kg',NULL,NULL,0.000,0.00,1.000,507.00,0.000,0.00,507.0000,507.00,1.000,507.00,'Material receipt',16,'2026-10-08 12:34:38'),(394,'2026-09-25','Receipt','material_receipt',35,'GRN-2026-00004',8,223,'Kg',NULL,NULL,0.000,0.00,1.000,725.00,0.000,0.00,725.0000,725.00,1.000,725.00,'Material receipt',16,'2026-10-08 12:34:38'),(395,'2026-09-25','Receipt','material_receipt',35,'GRN-2026-00004',8,224,'Kg',NULL,NULL,0.000,0.00,1.000,518.00,0.000,0.00,518.0000,518.00,1.000,518.00,'Material receipt',16,'2026-10-08 12:34:38'),(396,'2026-09-25','Receipt','material_receipt',35,'GRN-2026-00004',8,225,'Kg',NULL,NULL,0.000,0.00,1.000,497.00,0.000,0.00,497.0000,497.00,1.000,497.00,'Material receipt',16,'2026-10-08 12:34:38'),(397,'2026-09-27','Receipt','material_receipt',38,'GRN-2026-00007',8,119,'Kg',NULL,NULL,10.000,2670.00,10.000,2670.00,0.000,0.00,267.0000,2670.00,20.000,5340.00,'Material receipt',16,'2026-10-08 12:34:51'),(398,'2026-09-26','Receipt','material_receipt',17,'GRN-2026-00003',8,215,'Kilogram',NULL,NULL,0.000,0.00,10.000,4790.00,0.000,0.00,479.0000,4790.00,10.000,4790.00,'Material receipt',16,'2026-10-08 12:35:01'),(399,'2026-09-26','Receipt','material_receipt',17,'GRN-2026-00003',8,216,'Kg',NULL,NULL,0.000,0.00,5.000,3015.00,0.000,0.00,603.0000,3015.00,5.000,3015.00,'Material receipt',16,'2026-10-08 12:35:01'),(400,'2026-09-26','Receipt','material_receipt',17,'GRN-2026-00003',8,217,'Kg',NULL,NULL,0.000,0.00,2.000,1588.00,0.000,0.00,794.0000,1588.00,2.000,1588.00,'Material receipt',16,'2026-10-08 12:35:01'),(401,'2026-09-26','Receipt','material_receipt',17,'GRN-2026-00003',8,218,'Kg',NULL,NULL,0.000,0.00,2.000,1256.00,0.000,0.00,628.0000,1256.00,2.000,1256.00,'Material receipt',16,'2026-10-08 12:35:01'),(402,'2026-09-26','Receipt','material_receipt',17,'GRN-2026-00003',8,219,'Kg',NULL,NULL,0.000,0.00,3.000,1113.00,0.000,0.00,371.0000,1113.00,3.000,1113.00,'Material receipt',16,'2026-10-08 12:35:01'),(403,'2026-10-08','Receipt','material_receipt',48,'GRN-2026-00017',8,72,'Kg',NULL,NULL,0.750,185.25,5.000,1245.00,0.000,0.00,249.0000,1245.00,5.750,1430.25,'Material receipt',16,'2026-10-09 12:42:18'),(404,'2026-10-07','Receipt','material_receipt',49,'GRN-2026-00018',8,156,'Kg',NULL,NULL,1.400,665.00,10.000,4750.00,0.000,0.00,475.0000,4750.00,11.400,5415.00,'Material receipt',16,'2026-10-09 12:44:22'),(405,'2026-10-07','Receipt','material_receipt',49,'GRN-2026-00018',8,157,'Kg',NULL,NULL,1.800,678.60,10.000,3770.00,0.000,0.00,377.0000,3770.00,11.800,4448.60,'Material receipt',16,'2026-10-09 12:44:22'),(406,'2026-10-07','Receipt','material_receipt',50,'GRN-2026-00019',8,147,'Kg',NULL,NULL,1.000,0.00,5.000,2160.00,0.000,0.00,432.0000,2160.00,6.000,2160.00,'Material receipt',16,'2026-10-09 13:30:13'),(407,'2026-10-07','Receipt','material_receipt',50,'GRN-2026-00019',8,216,'Kg',NULL,NULL,5.000,3015.00,2.000,1206.00,0.000,0.00,603.0000,1206.00,7.000,4221.00,'Material receipt',16,'2026-10-09 13:30:13'),(408,'2026-10-07','Receipt','material_receipt',50,'GRN-2026-00019',8,218,'Kg',NULL,NULL,2.000,1256.00,2.000,742.00,0.000,0.00,371.0000,742.00,4.000,1998.00,'Material receipt',16,'2026-10-09 13:30:13'),(409,'2026-10-07','Receipt','material_receipt',50,'GRN-2026-00019',8,217,'Kg',NULL,NULL,2.000,1588.00,2.000,1588.00,0.000,0.00,794.0000,1588.00,4.000,3176.00,'Material receipt',16,'2026-10-09 13:30:13'),(410,'2026-10-05','Receipt','material_receipt',51,'GRN-2026-00020',8,182,'Kg',NULL,NULL,131.400,93425.40,50.000,35550.00,0.000,0.00,711.0000,35550.00,181.400,128975.40,'Material receipt',16,'2026-10-09 13:33:15'),(411,'2026-10-05','Receipt','material_receipt',51,'GRN-2026-00020',8,124,'Kg',NULL,NULL,18.000,5652.00,50.000,15700.00,0.000,0.00,314.0000,15700.00,68.000,21352.00,'Material receipt',16,'2026-10-09 13:33:15'),(412,'2026-10-05','Receipt','material_receipt',51,'GRN-2026-00020',8,139,'Kg',NULL,NULL,18.000,12150.00,30.000,20250.00,0.000,0.00,675.0000,20250.00,48.000,32400.00,'Material receipt',16,'2026-10-09 13:33:15'),(413,'2026-10-05','Receipt','material_receipt',51,'GRN-2026-00020',8,120,'Kg',NULL,NULL,102.125,68117.38,30.000,20010.00,0.000,0.00,667.0000,20010.00,132.125,88127.38,'Material receipt',16,'2026-10-09 13:33:15'),(414,'2026-10-06','Receipt','material_receipt',52,'GRN-2026-00021',8,41,'Kg',NULL,NULL,32.500,7020.00,50.000,10800.00,0.000,0.00,216.0000,10800.00,82.500,17820.00,'Material receipt',16,'2026-10-09 13:34:38'),(415,'2026-09-28','Receipt','material_receipt',53,'GRN-2026-00022',8,232,'Kg',NULL,NULL,0.000,0.00,2.000,2070.00,0.000,0.00,1035.0000,2070.00,2.000,2070.00,'Material receipt',16,'2026-10-09 13:41:56'),(416,'2026-09-24','Opening','material_master',210,'MAT-00210',8,210,NULL,NULL,NULL,0.000,0.00,10.000,3790.00,0.000,0.00,379.0000,3790.00,10.000,3790.00,'Opening stock (material master)',NULL,'2026-10-11 06:58:50'),(417,'2026-10-11','Opening','material_master',233,'MAT-00233',8,233,NULL,NULL,NULL,0.000,0.00,50.000,500.00,0.000,0.00,10.0000,500.00,50.000,500.00,'Opening stock (material master)',NULL,'2026-10-11 07:09:25'),(418,'2026-10-11','Opening','material_master',226,'MAT-00226',8,226,NULL,NULL,NULL,0.000,0.00,120.000,23880.00,0.000,0.00,199.0000,23880.00,120.000,23880.00,'Opening stock (material master)',NULL,'2026-10-11 07:19:40'),(426,'2026-10-14','Stock Adjustment','physical_stock',6,'PSE-2026-00005',8,147,'Kg',NULL,NULL,0.800,288.00,15.000,0.00,0.000,0.00,0.0000,0.00,15.800,288.00,'Physical stock adjustment (PSE-2026-00005)',16,'2026-10-14 12:52:42'),(427,'2026-10-04','Receipt','material_receipt',54,'GRN-2026-00023',7,211,'Piece',NULL,NULL,607.000,141218.55,2077.000,49848.00,0.000,0.00,24.0000,49848.00,2684.000,191066.55,'Material receipt',7,'2026-10-14 13:32:31'),(428,'2026-10-08','Opening','material_master',234,'MAT-00234',8,234,NULL,NULL,NULL,0.000,0.00,6.000,888.00,0.000,0.00,148.0000,888.00,6.000,888.00,'Opening stock (material master)',NULL,'2026-10-16 13:01:58'),(429,'2026-10-08','Opening','material_master',235,'MAT-00235',8,235,NULL,NULL,NULL,0.000,0.00,10.000,1950.00,0.000,0.00,195.0000,1950.00,10.000,1950.00,'Opening stock (material master)',NULL,'2026-10-16 13:01:58'),(430,'2026-10-08','Opening','material_master',231,'MAT-00231',8,231,NULL,NULL,NULL,5.000,5152.05,3.000,3091.23,0.000,0.00,1030.4100,3091.23,8.000,8243.28,'Opening stock (material master)',NULL,'2026-10-16 13:01:58'),(431,'2026-10-16','Opening','material_master',227,'MAT-00227',8,227,NULL,NULL,NULL,0.000,0.00,120.000,18000.00,0.000,0.00,150.0000,18000.00,120.000,18000.00,'Opening stock (material master)',NULL,'2026-10-16 13:21:09'),(432,'2026-10-16','Opening','material_master',236,'MAT-00236',8,236,NULL,NULL,NULL,0.000,0.00,1.000,602.00,0.000,0.00,602.0000,602.00,1.000,602.00,'Opening stock (material master)',NULL,'2026-10-16 13:21:09'),(433,'2026-10-16','Opening','material_master',237,'MAT-00237',8,237,NULL,NULL,NULL,0.000,0.00,1.000,504.00,0.000,0.00,504.0000,504.00,1.000,504.00,'Opening stock (material master)',NULL,'2026-10-16 13:21:09'),(434,'2026-09-26','Receipt','material_receipt',46,'GRN-2026-00015',8,231,'Kg',NULL,NULL,0.000,0.00,5.000,5152.05,0.000,0.00,1030.4100,5152.05,5.000,5152.05,'Material receipt',16,'2026-10-20 11:50:39'),(435,'2026-09-26','Receipt','material_receipt',46,'GRN-2026-00015',8,214,'Kg',NULL,NULL,0.000,0.00,1.000,667.74,0.000,0.00,667.7400,667.74,1.000,667.74,'Material receipt',16,'2026-10-20 11:50:39'),(436,'2026-09-26','Receipt','material_receipt',37,'GRN-2026-00006',8,106,'Kg',NULL,NULL,0.000,0.00,30.000,8280.00,0.000,0.00,276.0000,8280.00,30.000,8280.00,'Material receipt',16,'2026-10-20 11:50:49'),(437,'2026-10-06','Stock Adjustment','physical_stock',17,'PSE-2026-00016',8,30,'Kg',NULL,NULL,47.000,9726.96,130.000,0.00,0.000,0.00,0.0000,0.00,177.000,9726.96,'Physical stock adjustment (PSE-2026-00016)',16,'2026-10-22 10:54:23'),(438,'2026-10-06','Stock Adjustment','physical_stock',17,'PSE-2026-00016',8,51,'Kg',NULL,NULL,50.700,6492.47,100.000,0.00,0.000,0.00,0.0000,0.00,150.700,6492.47,'Physical stock adjustment (PSE-2026-00016)',16,'2026-10-22 10:54:23'),(439,'2026-10-06','Stock Adjustment','physical_stock',17,'PSE-2026-00016',8,29,'Kg',NULL,NULL,74.500,14943.28,120.000,0.00,0.000,0.00,0.0000,0.00,194.500,14943.28,'Physical stock adjustment (PSE-2026-00016)',16,'2026-10-22 10:54:23'),(440,'2026-10-06','Stock Adjustment','physical_stock',17,'PSE-2026-00016',8,42,'Kg',NULL,NULL,26.300,4505.90,100.000,0.00,0.000,0.00,0.0000,0.00,126.300,4505.90,'Physical stock adjustment (PSE-2026-00016)',16,'2026-10-22 10:54:23'),(441,'2026-10-08','Stock Adjustment','physical_stock',16,'PSE-2026-00015',8,109,'Kg',NULL,NULL,3.650,1987.46,5.000,0.00,0.000,0.00,0.0000,0.00,8.650,1987.46,'Physical stock adjustment (PSE-2026-00015)',16,'2026-10-22 10:54:34'),(442,'2026-10-08','Stock Adjustment','physical_stock',15,'PSE-2026-00014',8,35,'Kg',NULL,NULL,22.500,7785.00,50.000,0.00,0.000,0.00,0.0000,0.00,72.500,7785.00,'Physical stock adjustment (PSE-2026-00014)',16,'2026-10-22 10:54:43'),(443,'2026-10-14','Stock Adjustment','physical_stock',14,'PSE-2026-00013',8,231,'Kg',NULL,NULL,5.200,5358.13,1.000,0.00,0.000,0.00,0.0000,0.00,6.200,5358.13,'Physical stock adjustment (PSE-2026-00013)',16,'2026-10-22 10:54:57'),(444,'2026-10-14','Stock Adjustment','physical_stock',14,'PSE-2026-00013',8,249,'Kg',NULL,NULL,0.000,0.00,1.000,0.00,0.000,0.00,0.0000,0.00,1.000,0.00,'Physical stock adjustment (PSE-2026-00013)',16,'2026-10-22 10:54:57'),(445,'2026-10-14','Stock Adjustment','physical_stock',14,'PSE-2026-00013',8,110,'Kg',NULL,NULL,3.250,1873.85,2.000,0.00,0.000,0.00,0.0000,0.00,5.250,1873.85,'Physical stock adjustment (PSE-2026-00013)',16,'2026-10-22 10:54:57'),(446,'2026-10-17','Stock Adjustment','physical_stock',13,'PSE-2026-00012',8,119,'Kg',NULL,NULL,16.400,4378.80,20.000,0.00,0.000,0.00,0.0000,0.00,36.400,4378.80,'Physical stock adjustment (PSE-2026-00012)',16,'2026-10-22 10:55:09'),(447,'2026-10-09','Stock Adjustment','physical_stock',12,'PSE-2026-00011',8,69,'Kg',NULL,NULL,8.000,2640.00,25.000,0.00,0.000,0.00,0.0000,0.00,33.000,2640.00,'Physical stock adjustment (PSE-2026-00011)',16,'2026-10-22 10:55:18'),(448,'2026-10-09','Stock Adjustment','physical_stock',11,'PSE-2026-00010',8,56,'Kg',NULL,NULL,49.000,8741.95,100.000,0.00,0.000,0.00,0.0000,0.00,149.000,8741.95,'Physical stock adjustment (PSE-2026-00010)',16,'2026-10-22 10:55:28'),(449,'2026-10-14','Stock Adjustment','physical_stock',10,'PSE-2026-00009',8,38,'Kg',NULL,NULL,19.500,7175.00,120.000,0.00,0.000,0.00,0.0000,0.00,139.500,7175.00,'Physical stock adjustment (PSE-2026-00009)',16,'2026-10-22 10:55:37'),(450,'2026-10-15','Stock Adjustment','physical_stock',9,'PSE-2026-00008',8,35,'Kg',NULL,NULL,68.500,7355.48,64.980,0.00,0.000,0.00,0.0000,0.00,133.480,7355.48,'Physical stock adjustment (PSE-2026-00008)',16,'2026-10-22 10:55:47'),(451,'2026-10-15','Stock Adjustment','physical_stock',8,'PSE-2026-00007',8,125,'Kg',NULL,NULL,51.050,47425.45,20.000,0.00,0.000,0.00,0.0000,0.00,71.050,47425.45,'Physical stock adjustment (PSE-2026-00007)',16,'2026-10-22 10:56:03'),(452,'2026-10-15','Stock Adjustment','physical_stock',8,'PSE-2026-00007',8,167,'Kg',NULL,NULL,24.450,16503.75,10.000,0.00,0.000,0.00,0.0000,0.00,34.450,16503.75,'Physical stock adjustment (PSE-2026-00007)',16,'2026-10-22 10:56:03'),(453,'2026-10-15','Stock Adjustment','physical_stock',8,'PSE-2026-00007',8,168,'Kg',NULL,NULL,11.500,4657.50,5.000,0.00,0.000,0.00,0.0000,0.00,16.500,4657.50,'Physical stock adjustment (PSE-2026-00007)',16,'2026-10-22 10:56:03'),(454,'2026-10-15','Stock Adjustment','physical_stock',8,'PSE-2026-00007',8,158,'Kg',NULL,NULL,2.450,12749.80,1.000,0.00,0.000,0.00,0.0000,0.00,3.450,12749.80,'Physical stock adjustment (PSE-2026-00007)',16,'2026-10-22 10:56:03'),(455,'2026-10-22','Receipt','material_receipt',55,'GRN-2026-00024',8,234,'Kg',NULL,NULL,0.000,0.00,10.000,1480.00,0.000,0.00,148.0000,1480.00,10.000,1480.00,'Material receipt',16,'2026-10-22 11:12:40'),(583,'2026-10-08','Issue','material_issue',23,'ISS-2026-00005',8,9,'Kg',NULL,NULL,138.050,37549.60,0.000,0.00,1.750,476.00,272.0000,476.00,136.300,37073.60,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(584,'2026-10-08','Issue','material_issue',23,'ISS-2026-00005',8,10,'Kg',NULL,NULL,137.500,19796.10,0.000,0.00,1.750,251.95,143.9716,251.95,135.750,19544.15,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(585,'2026-10-08','Issue','material_issue',23,'ISS-2026-00005',8,209,'Kg',NULL,NULL,537.000,46900.00,0.000,0.00,2.500,218.34,87.3371,218.34,534.500,46681.66,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(586,'2026-10-08','Issue','material_issue',23,'ISS-2026-00005',8,46,'Kg',NULL,NULL,27.750,7770.00,0.000,0.00,9.500,2660.00,280.0000,2660.00,18.250,5110.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(587,'2026-10-08','Issue','material_issue',23,'ISS-2026-00005',8,33,'Kg',NULL,NULL,120.500,32471.58,0.000,0.00,4.000,1077.89,269.4737,1077.89,116.500,31393.68,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(588,'2026-10-08','Issue','material_issue',23,'ISS-2026-00005',8,47,'Kg',NULL,NULL,95.300,5584.60,0.000,0.00,4.000,234.40,58.6002,234.40,91.300,5350.20,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(589,'2026-10-08','Issue','material_issue',23,'ISS-2026-00005',8,47,'Kg',NULL,NULL,91.300,5350.20,0.000,0.00,4.000,234.40,58.6002,234.40,87.300,5115.80,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(590,'2026-10-08','Issue','material_issue',23,'ISS-2026-00005',8,49,'Kg',NULL,NULL,118.100,6320.50,0.000,0.00,1.800,96.33,53.5182,96.33,116.300,6224.17,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(591,'2026-10-08','Issue','material_issue',23,'ISS-2026-00005',8,29,'Kg',NULL,NULL,194.500,14943.28,0.000,0.00,6.500,499.39,76.8292,499.39,188.000,14443.89,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(592,'2026-10-08','Issue','material_issue',23,'ISS-2026-00005',8,50,'Kg',NULL,NULL,35.000,4940.83,0.000,0.00,3.750,529.38,141.1667,529.38,31.250,4411.46,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(593,'2026-10-08','Issue','material_issue',23,'ISS-2026-00005',8,49,'Kg',NULL,NULL,116.300,6224.17,0.000,0.00,0.800,42.81,53.5182,42.81,115.500,6181.35,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(594,'2026-10-08','Issue','material_issue',23,'ISS-2026-00005',8,30,'Kg',NULL,NULL,177.000,9726.96,0.000,0.00,11.000,604.50,54.9546,604.50,166.000,9122.46,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(595,'2026-10-08','Issue','material_issue',23,'ISS-2026-00005',8,31,'Kg',NULL,NULL,116.000,16739.15,0.000,0.00,12.000,1731.64,144.3030,1731.64,104.000,15007.51,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(596,'2026-10-08','Issue','material_issue',23,'ISS-2026-00005',8,234,'Kg',NULL,NULL,6.000,888.00,0.000,0.00,6.000,888.00,148.0000,888.00,0.000,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(597,'2026-10-08','Issue','material_issue',23,'ISS-2026-00005',8,62,'Kg',NULL,NULL,19.500,2827.50,0.000,0.00,9.000,1305.00,145.0000,1305.00,10.500,1522.50,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(598,'2026-10-08','Issue','material_issue',23,'ISS-2026-00005',8,235,'Kg',NULL,NULL,10.000,1950.00,0.000,0.00,9.600,1872.00,195.0000,1872.00,0.400,78.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(599,'2026-10-08','Issue','material_issue',23,'ISS-2026-00005',8,41,'Kg',NULL,NULL,82.500,17820.00,0.000,0.00,10.750,2322.00,216.0000,2322.00,71.750,15498.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(600,'2026-10-08','Issue','material_issue',23,'ISS-2026-00005',8,42,'Kg',NULL,NULL,126.300,4505.90,0.000,0.00,9.250,330.00,35.6761,330.00,117.050,4175.89,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(601,'2026-10-08','Issue','material_issue',23,'ISS-2026-00005',8,40,'Kg',NULL,NULL,-1.300,-909.94,0.000,0.00,2.200,0.00,0.0000,0.00,-3.500,-909.94,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(602,'2026-10-08','Issue','material_issue',23,'ISS-2026-00005',8,48,'Kg',NULL,NULL,59.000,10384.00,0.000,0.00,4.000,704.00,176.0000,704.00,55.000,9680.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(603,'2026-10-08','Issue','material_issue',23,'ISS-2026-00005',8,231,'Kg',NULL,NULL,8.000,8243.28,0.000,0.00,2.500,2576.03,1030.4100,2576.03,5.500,5667.26,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(604,'2026-10-08','Issue','material_issue',23,'ISS-2026-00005',8,88,'Kg',NULL,NULL,2.000,1040.96,0.000,0.00,0.200,104.10,520.4800,104.10,1.800,936.86,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(605,'2026-10-08','Issue','material_issue',23,'ISS-2026-00005',8,16,'Kg',NULL,NULL,4.600,1205.20,0.000,0.00,3.000,786.00,262.0000,786.00,1.600,419.20,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(606,'2026-10-08','Issue','material_issue',23,'ISS-2026-00005',8,35,'Kg',NULL,NULL,72.500,7785.00,0.000,0.00,3.250,348.98,107.3793,348.98,69.250,7436.02,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(607,'2026-10-08','Issue','material_issue',23,'ISS-2026-00005',8,11,'Kg',NULL,NULL,148.000,27676.00,0.000,0.00,6.500,1215.50,187.0000,1215.50,141.500,26460.50,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(608,'2026-10-08','Issue','material_issue',23,'ISS-2026-00005',8,32,'Kg',NULL,NULL,59.500,18890.08,0.000,0.00,3.500,1111.18,317.4803,1111.18,56.000,17778.90,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(609,'2026-10-08','Issue','material_issue',23,'ISS-2026-00005',8,115,'Kg',NULL,NULL,78.500,13611.90,0.000,0.00,3.500,606.90,173.4000,606.90,75.000,13005.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(610,'2026-10-08','Issue','material_issue',23,'ISS-2026-00005',8,10,'Kg',NULL,NULL,135.750,19544.15,0.000,0.00,1.000,143.97,143.9716,143.97,134.750,19400.18,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(611,'2026-10-08','Issue','material_issue',23,'ISS-2026-00005',8,29,'Kg',NULL,NULL,188.000,14443.89,0.000,0.00,6.000,460.98,76.8292,460.98,182.000,13982.92,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(612,'2026-10-08','Issue','material_issue',23,'ISS-2026-00005',8,48,'Kg',NULL,NULL,55.000,9680.00,0.000,0.00,0.300,52.80,176.0000,52.80,54.700,9627.20,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(613,'2026-10-08','Issue','material_issue',23,'ISS-2026-00005',8,231,'Kg',NULL,NULL,5.500,5667.26,0.000,0.00,0.300,309.12,1030.4100,309.12,5.200,5358.13,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(614,'2026-10-08','Issue','material_issue',23,'ISS-2026-00005',8,35,'Kg',NULL,NULL,69.250,7436.02,0.000,0.00,0.750,80.53,107.3793,80.53,68.500,7355.48,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(615,'2026-10-08','Issue','material_issue',23,'ISS-2026-00005',8,32,'Kg',NULL,NULL,56.000,17778.90,0.000,0.00,0.300,95.24,317.4803,95.24,55.700,17683.65,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(616,'2026-10-08','Issue','material_issue',23,'ISS-2026-00005',8,10,'Kg',NULL,NULL,134.750,19400.18,0.000,0.00,0.300,43.19,143.9716,43.19,134.450,19356.99,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(617,'2026-10-08','Issue','material_issue',23,'ISS-2026-00005',8,209,'Kg',NULL,NULL,534.500,46681.66,0.000,0.00,2.000,174.67,87.3371,174.67,532.500,46506.98,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(618,'2026-09-24','Issue','material_issue',25,'ISS-2026-00007',8,107,'Kg',NULL,NULL,0.000,0.00,0.000,0.00,3.050,0.00,0.0000,0.00,-3.050,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(619,'2026-09-24','Issue','material_issue',25,'ISS-2026-00007',8,108,'Kg',NULL,NULL,0.000,0.00,0.000,0.00,3.050,0.00,0.0000,0.00,-3.050,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(620,'2026-09-24','Issue','material_issue',25,'ISS-2026-00007',8,115,'Kg',NULL,NULL,0.000,0.00,0.000,0.00,4.500,0.00,0.0000,0.00,-4.500,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(621,'2026-09-24','Issue','material_issue',25,'ISS-2026-00007',8,209,'Kg',NULL,NULL,0.000,0.00,0.000,0.00,5.000,0.00,0.0000,0.00,-5.000,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(622,'2026-09-24','Issue','material_issue',25,'ISS-2026-00007',8,210,'Kg',NULL,NULL,10.000,3790.00,0.000,0.00,4.000,1516.00,379.0000,1516.00,6.000,2274.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(623,'2026-09-24','Issue','material_issue',25,'ISS-2026-00007',8,52,'Kg',NULL,NULL,0.000,0.00,0.000,0.00,23.500,0.00,0.0000,0.00,-23.500,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(624,'2026-09-24','Issue','material_issue',25,'ISS-2026-00007',8,51,'Kg',NULL,NULL,0.000,0.00,0.000,0.00,5.500,0.00,0.0000,0.00,-5.500,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(625,'2026-09-24','Issue','material_issue',25,'ISS-2026-00007',8,46,'Kg',NULL,NULL,0.000,0.00,0.000,0.00,5.500,0.00,0.0000,0.00,-5.500,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(626,'2026-09-24','Issue','material_issue',25,'ISS-2026-00007',8,33,'Kg',NULL,NULL,0.000,0.00,0.000,0.00,6.500,0.00,0.0000,0.00,-6.500,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(627,'2026-09-24','Issue','material_issue',25,'ISS-2026-00007',8,47,'Kg',NULL,NULL,0.000,0.00,0.000,0.00,6.500,0.00,0.0000,0.00,-6.500,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(628,'2026-09-24','Issue','material_issue',25,'ISS-2026-00007',8,49,'Kg',NULL,NULL,0.000,0.00,0.000,0.00,2.000,0.00,0.0000,0.00,-2.000,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(629,'2026-09-24','Issue','material_issue',25,'ISS-2026-00007',8,29,'Kg',NULL,NULL,0.000,0.00,0.000,0.00,6.500,0.00,0.0000,0.00,-6.500,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(630,'2026-09-24','Issue','material_issue',25,'ISS-2026-00007',8,50,'Kg',NULL,NULL,0.000,0.00,0.000,0.00,6.500,0.00,0.0000,0.00,-6.500,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(631,'2026-09-24','Issue','material_issue',25,'ISS-2026-00007',8,49,'Kg',NULL,NULL,-2.000,0.00,0.000,0.00,6.500,0.00,0.0000,0.00,-8.500,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(632,'2026-09-24','Issue','material_issue',25,'ISS-2026-00007',8,30,'Kg',NULL,NULL,0.000,0.00,0.000,0.00,12.500,0.00,0.0000,0.00,-12.500,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(633,'2026-09-24','Issue','material_issue',25,'ISS-2026-00007',8,31,'Kg',NULL,NULL,0.000,0.00,0.000,0.00,6.500,0.00,0.0000,0.00,-6.500,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(634,'2026-09-24','Issue','material_issue',25,'ISS-2026-00007',8,46,'Kg',NULL,NULL,-5.500,0.00,0.000,0.00,6.500,0.00,0.0000,0.00,-12.000,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(635,'2026-09-24','Issue','material_issue',25,'ISS-2026-00007',8,56,'Kg',NULL,NULL,0.000,0.00,0.000,0.00,6.500,0.00,0.0000,0.00,-6.500,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(636,'2026-09-24','Issue','material_issue',25,'ISS-2026-00007',8,42,'Kg',NULL,NULL,0.000,0.00,0.000,0.00,6.500,0.00,0.0000,0.00,-6.500,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(637,'2026-09-24','Issue','material_issue',25,'ISS-2026-00007',8,40,'Kg',NULL,NULL,0.000,0.00,0.000,0.00,6.500,0.00,0.0000,0.00,-6.500,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(638,'2026-09-24','Issue','material_issue',25,'ISS-2026-00007',8,54,'Kg',NULL,NULL,0.000,0.00,0.000,0.00,3.750,0.00,0.0000,0.00,-3.750,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(639,'2026-09-24','Issue','material_issue',25,'ISS-2026-00007',8,107,'Kg',NULL,NULL,-3.050,0.00,0.000,0.00,7.000,0.00,0.0000,0.00,-10.050,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(640,'2026-09-24','Issue','material_issue',25,'ISS-2026-00007',8,108,'Kg',NULL,NULL,-3.050,0.00,0.000,0.00,7.100,0.00,0.0000,0.00,-10.150,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(641,'2026-09-24','Issue','material_issue',25,'ISS-2026-00007',8,34,'Kg',NULL,NULL,0.000,0.00,0.000,0.00,12.500,0.00,0.0000,0.00,-12.500,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(642,'2026-09-24','Issue','material_issue',25,'ISS-2026-00007',8,116,'Kg',NULL,NULL,0.000,0.00,0.000,0.00,12.500,0.00,0.0000,0.00,-12.500,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(643,'2026-09-24','Issue','material_issue',25,'ISS-2026-00007',8,38,'Kg',NULL,NULL,0.000,0.00,0.000,0.00,12.500,0.00,0.0000,0.00,-12.500,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(644,'2026-09-24','Issue','material_issue',25,'ISS-2026-00007',8,8,'Kg',NULL,NULL,0.000,0.00,0.000,0.00,12.500,0.00,0.0000,0.00,-12.500,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(645,'2026-09-24','Issue','material_issue',25,'ISS-2026-00007',8,37,'Kg',NULL,NULL,0.000,0.00,0.000,0.00,7.500,0.00,0.0000,0.00,-7.500,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(646,'2026-09-24','Issue','material_issue',25,'ISS-2026-00007',8,39,'Kg',NULL,NULL,0.000,0.00,0.000,0.00,7.500,0.00,0.0000,0.00,-7.500,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(647,'2026-09-24','Issue','material_issue',25,'ISS-2026-00007',8,115,'Kg',NULL,NULL,-4.500,0.00,0.000,0.00,6.500,0.00,0.0000,0.00,-11.000,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(648,'2026-09-24','Issue','material_issue',25,'ISS-2026-00007',8,32,'Kg',NULL,NULL,0.000,0.00,0.000,0.00,6.500,0.00,0.0000,0.00,-6.500,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(649,'2026-09-24','Issue','material_issue',25,'ISS-2026-00007',8,36,'Kg',NULL,NULL,0.000,0.00,0.000,0.00,1.350,0.00,0.0000,0.00,-1.350,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(650,'2026-09-24','Issue','material_issue',25,'ISS-2026-00007',8,10,'Kg',NULL,NULL,0.000,0.00,0.000,0.00,2.500,0.00,0.0000,0.00,-2.500,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(651,'2026-09-24','Issue','material_issue',25,'ISS-2026-00007',8,209,'Kg',NULL,NULL,-5.000,0.00,0.000,0.00,13.500,0.00,0.0000,0.00,-18.500,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(652,'2026-09-24','Issue','material_issue',25,'ISS-2026-00007',8,46,'Kg',NULL,NULL,-12.000,0.00,0.000,0.00,2.250,0.00,0.0000,0.00,-14.250,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(653,'2026-09-24','Issue','material_issue',25,'ISS-2026-00007',8,107,'Kg',NULL,NULL,-10.050,0.00,0.000,0.00,2.100,0.00,0.0000,0.00,-12.150,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(654,'2026-09-24','Issue','material_issue',25,'ISS-2026-00007',8,108,'Kg',NULL,NULL,-10.150,0.00,0.000,0.00,2.100,0.00,0.0000,0.00,-12.250,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(655,'2026-09-24','Issue','material_issue',25,'ISS-2026-00007',8,38,'Kg',NULL,NULL,-12.500,0.00,0.000,0.00,3.000,0.00,0.0000,0.00,-15.500,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(656,'2026-09-24','Issue','material_issue',25,'ISS-2026-00007',8,37,'Kg',NULL,NULL,-7.500,0.00,0.000,0.00,3.000,0.00,0.0000,0.00,-10.500,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(657,'2026-09-24','Issue','material_issue',25,'ISS-2026-00007',8,10,'Kg',NULL,NULL,-2.500,0.00,0.000,0.00,1.500,0.00,0.0000,0.00,-4.000,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(658,'2026-09-24','Issue','material_issue',25,'ISS-2026-00007',8,209,'Kg',NULL,NULL,-18.500,0.00,0.000,0.00,4.500,0.00,0.0000,0.00,-23.000,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(659,'2026-10-11','Issue','material_issue',26,'ISS-2026-00008',8,9,'Kg',NULL,NULL,136.300,37073.60,0.000,0.00,14.500,3944.00,272.0000,3944.00,121.800,33129.60,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(660,'2026-10-11','Issue','material_issue',26,'ISS-2026-00008',8,10,'Kg',NULL,NULL,134.450,19356.99,0.000,0.00,4.500,647.87,143.9716,647.87,129.950,18709.11,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(661,'2026-10-11','Issue','material_issue',26,'ISS-2026-00008',8,9,'Kg',NULL,NULL,121.800,33129.60,0.000,0.00,14.500,3944.00,272.0000,3944.00,107.300,29185.60,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(662,'2026-10-11','Issue','material_issue',26,'ISS-2026-00008',8,10,'Kg',NULL,NULL,129.950,18709.11,0.000,0.00,4.500,647.87,143.9716,647.87,125.450,18061.24,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(663,'2026-10-11','Issue','material_issue',26,'ISS-2026-00008',8,233,'Kg',NULL,NULL,50.000,500.00,0.000,0.00,30.000,300.00,10.0000,300.00,20.000,200.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(664,'2026-10-11','Issue','material_issue',27,'ISS-2026-00009',8,123,'Kg',NULL,NULL,189.200,33488.40,0.000,0.00,1.800,318.60,177.0000,318.60,187.400,33169.80,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(665,'2026-10-11','Issue','material_issue',27,'ISS-2026-00009',8,171,'Kg',NULL,NULL,25.000,4600.00,0.000,0.00,1.800,331.20,184.0000,331.20,23.200,4268.80,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(666,'2026-10-11','Issue','material_issue',27,'ISS-2026-00009',8,226,'Kg',NULL,NULL,120.000,23880.00,0.000,0.00,18.000,3582.00,199.0000,3582.00,102.000,20298.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(667,'2026-10-11','Issue','material_issue',27,'ISS-2026-00009',8,120,'Kg',NULL,NULL,132.125,88127.38,0.000,0.00,4.800,3201.60,667.0000,3201.60,127.325,84925.77,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(668,'2026-10-11','Issue','material_issue',27,'ISS-2026-00009',8,178,'Kg',NULL,NULL,150.500,28898.00,0.000,0.00,4.800,921.66,192.0133,921.66,145.700,27976.34,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(669,'2026-10-11','Issue','material_issue',27,'ISS-2026-00009',8,123,'Kg',NULL,NULL,187.400,33169.80,0.000,0.00,3.600,637.20,177.0000,637.20,183.800,32532.60,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(670,'2026-10-11','Issue','material_issue',27,'ISS-2026-00009',8,139,'Kg',NULL,NULL,48.000,32400.00,0.000,0.00,3.600,2430.00,675.0000,2430.00,44.400,29970.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(671,'2026-10-11','Issue','material_issue',27,'ISS-2026-00009',8,119,'Kg',NULL,NULL,20.000,5340.00,0.000,0.00,3.600,961.20,267.0000,961.20,16.400,4378.80,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(672,'2026-10-11','Issue','material_issue',27,'ISS-2026-00009',8,125,'Kg',NULL,NULL,52.250,48540.25,0.000,0.00,1.200,1114.80,929.0000,1114.80,51.050,47425.45,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(673,'2026-10-11','Issue','material_issue',27,'ISS-2026-00009',8,192,'Kg',NULL,NULL,15.000,4140.00,0.000,0.00,7.200,1987.20,276.0000,1987.20,7.800,2152.80,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(674,'2026-10-11','Issue','material_issue',27,'ISS-2026-00009',8,147,'Kg',NULL,NULL,6.000,2160.00,0.000,0.00,5.200,1872.00,360.0000,1872.00,0.800,288.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(675,'2026-10-11','Issue','material_issue',27,'ISS-2026-00009',8,216,'Kg',NULL,NULL,7.000,4221.00,0.000,0.00,1.700,1025.10,603.0000,1025.10,5.300,3195.90,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(676,'2026-10-11','Issue','material_issue',27,'ISS-2026-00009',8,218,'Kg',NULL,NULL,4.000,1998.00,0.000,0.00,0.085,42.46,499.5000,42.46,3.915,1955.54,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(677,'2026-10-11','Issue','material_issue',27,'ISS-2026-00009',8,219,'Kg',NULL,NULL,3.000,1113.00,0.000,0.00,0.800,296.80,371.0000,296.80,2.200,816.20,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(678,'2026-10-11','Issue','material_issue',27,'ISS-2026-00009',8,217,'Kg',NULL,NULL,4.000,3176.00,0.000,0.00,0.400,317.60,794.0000,317.60,3.600,2858.40,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(679,'2026-10-11','Issue','material_issue',27,'ISS-2026-00009',8,218,'Kg',NULL,NULL,3.915,1955.54,0.000,0.00,0.400,199.80,499.5000,199.80,3.515,1755.74,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(680,'2026-10-14','Issue','material_issue',28,'ISS-2026-00010',7,211,'Piece',NULL,NULL,2684.000,191066.55,0.000,0.00,545.000,38797.05,71.1872,38797.05,2139.000,152269.50,'SL069 issue backfill',7,'2026-10-23 13:22:25'),(681,'2026-10-16','Issue','material_issue',29,'ISS-2026-00011',8,123,'Kg',NULL,NULL,183.800,32532.60,0.000,0.00,1.000,177.00,177.0000,177.00,182.800,32355.60,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(682,'2026-10-16','Issue','material_issue',29,'ISS-2026-00011',8,171,'Kg',NULL,NULL,23.200,4268.80,0.000,0.00,1.000,184.00,184.0000,184.00,22.200,4084.80,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(683,'2026-10-16','Issue','material_issue',29,'ISS-2026-00011',8,118,'Kg',NULL,NULL,105.000,15750.00,0.000,0.00,10.000,1500.00,150.0000,1500.00,95.000,14250.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(684,'2026-10-16','Issue','material_issue',29,'ISS-2026-00011',8,123,'Kg',NULL,NULL,182.800,32355.60,0.000,0.00,10.000,1770.00,177.0000,1770.00,172.800,30585.60,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(685,'2026-10-16','Issue','material_issue',29,'ISS-2026-00011',8,227,'Kg',NULL,NULL,120.000,18000.00,0.000,0.00,5.000,750.00,150.0000,750.00,115.000,17250.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(686,'2026-10-16','Issue','material_issue',29,'ISS-2026-00011',8,121,'Kg',NULL,NULL,45.000,6750.00,0.000,0.00,5.000,750.00,150.0000,750.00,40.000,6000.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(687,'2026-10-16','Issue','material_issue',29,'ISS-2026-00011',8,178,'Kg',NULL,NULL,145.700,27976.34,0.000,0.00,5.000,960.07,192.0133,960.07,140.700,27016.27,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(688,'2026-10-16','Issue','material_issue',29,'ISS-2026-00011',8,125,'Kg',NULL,NULL,71.050,47425.45,0.000,0.00,2.000,1334.99,667.4940,1334.99,69.050,46090.46,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(689,'2026-10-16','Issue','material_issue',29,'ISS-2026-00011',8,182,'Kg',NULL,NULL,181.400,128975.40,0.000,0.00,6.750,4799.25,711.0000,4799.25,174.650,124176.15,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(690,'2026-10-16','Issue','material_issue',29,'ISS-2026-00011',8,190,'Kg',NULL,NULL,15.000,7395.00,0.000,0.00,3.950,1947.35,493.0000,1947.35,11.050,5447.65,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(691,'2026-10-16','Issue','material_issue',29,'ISS-2026-00011',8,181,'Kg',NULL,NULL,2.000,0.00,0.000,0.00,0.600,0.00,0.0000,0.00,1.400,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(692,'2026-10-16','Issue','material_issue',29,'ISS-2026-00011',8,236,'Kg',NULL,NULL,1.000,602.00,0.000,0.00,0.780,469.56,602.0000,469.56,0.220,132.44,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(693,'2026-10-16','Issue','material_issue',29,'ISS-2026-00011',8,237,'Kg',NULL,NULL,1.000,504.00,0.000,0.00,1.000,504.00,504.0000,504.00,0.000,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(694,'2026-10-16','Issue','material_issue',29,'ISS-2026-00011',8,184,'Kg',NULL,NULL,5.000,5490.00,0.000,0.00,0.800,878.40,1098.0000,878.40,4.200,4611.60,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(695,'2026-10-16','Issue','material_issue',29,'ISS-2026-00011',8,103,'Kg',NULL,NULL,0.400,0.00,0.000,0.00,0.090,0.00,0.0000,0.00,0.310,0.00,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(696,'2026-10-16','Issue','material_issue',29,'ISS-2026-00011',8,76,'Kg',NULL,NULL,3.300,2795.40,0.000,0.00,0.080,67.77,847.0900,67.77,3.220,2727.63,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(697,'2026-10-16','Issue','material_issue',29,'ISS-2026-00011',8,196,'Kg',NULL,NULL,0.700,1028.30,0.000,0.00,0.010,14.69,1469.0000,14.69,0.690,1013.61,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(698,'2026-10-16','Issue','material_issue',29,'ISS-2026-00011',8,156,'Kg',NULL,NULL,11.400,5415.00,0.000,0.00,4.500,2137.50,475.0000,2137.50,6.900,3277.50,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(699,'2026-10-16','Issue','material_issue',29,'ISS-2026-00011',8,157,'Kg',NULL,NULL,11.800,4448.60,0.000,0.00,4.500,1696.50,377.0000,1696.50,7.300,2752.10,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(700,'2026-10-16','Issue','material_issue',29,'ISS-2026-00011',8,125,'Kg',NULL,NULL,69.050,46090.46,0.000,0.00,0.360,240.30,667.4940,240.30,68.690,45850.16,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(701,'2026-10-16','Issue','material_issue',29,'ISS-2026-00011',8,125,'Kg',NULL,NULL,68.690,45850.16,0.000,0.00,0.800,534.00,667.4940,534.00,67.890,45316.17,'SL069 issue backfill',16,'2026-10-23 13:22:25'),(710,'2026-10-23','Stock Adjustment','stock_correction',0,'SC-070',8,9,'Kg',NULL,NULL,107.300,29185.60,1.750,476.00,0.000,0.00,272.0000,476.00,109.050,29661.60,'Opening balance correction (SC-070)',NULL,'2026-10-23 13:27:25'),(711,'2026-10-23','Stock Adjustment','stock_correction',0,'SC-070',8,10,'Kg',NULL,NULL,125.450,18061.24,3.500,503.90,0.000,0.00,143.9716,503.90,128.950,18565.14,'Opening balance correction (SC-070)',NULL,'2026-10-23 13:27:25'),(712,'2026-10-23','Stock Adjustment','stock_correction',0,'SC-070',8,15,'Kg',NULL,NULL,6.400,1836.80,3.000,861.00,0.000,0.00,287.0000,861.00,9.400,2697.80,'Opening balance correction (SC-070)',NULL,'2026-10-23 13:27:25'),(713,'2026-10-23','Stock Adjustment','stock_correction',0,'SC-070',8,29,'Kg',NULL,NULL,182.000,13982.92,15.000,1285.35,0.000,0.00,85.6897,1285.35,197.000,15268.27,'Opening balance correction (SC-070)',NULL,'2026-10-23 13:27:25'),(714,'2026-10-23','Stock Adjustment','stock_correction',0,'SC-070',8,30,'Kg',NULL,NULL,166.000,9122.46,10.500,666.40,0.000,0.00,63.4667,666.40,176.500,9788.86,'Opening balance correction (SC-070)',NULL,'2026-10-23 13:27:25'),(715,'2026-10-23','Stock Adjustment','stock_correction',0,'SC-070',8,31,'Kg',NULL,NULL,104.000,15007.51,7.500,1097.37,0.000,0.00,146.3158,1097.37,111.500,16104.88,'Opening balance correction (SC-070)',NULL,'2026-10-23 13:27:25'),(716,'2026-10-23','Stock Adjustment','stock_correction',0,'SC-070',8,32,'Kg',NULL,NULL,55.700,17683.65,4.000,1269.92,0.000,0.00,317.4803,1269.92,59.700,18953.57,'Opening balance correction (SC-070)',NULL,'2026-10-23 13:27:25'),(717,'2026-10-23','Stock Adjustment','stock_correction',0,'SC-070',8,33,'Kg',NULL,NULL,116.500,31393.68,3.000,808.42,0.000,0.00,269.4737,808.42,119.500,32202.11,'Opening balance correction (SC-070)',NULL,'2026-10-23 13:27:25'),(718,'2026-10-23','Stock Adjustment','stock_correction',0,'SC-070',8,35,'Kg',NULL,NULL,133.480,7355.48,7.500,478.58,0.000,0.00,63.8105,478.58,140.980,7834.06,'Opening balance correction (SC-070)',NULL,'2026-10-23 13:27:25'),(719,'2026-10-23','Stock Adjustment','stock_correction',0,'SC-070',8,40,'Kg',NULL,NULL,-3.500,-909.94,3.500,2449.84,0.000,0.00,699.9545,2449.84,0.000,1539.90,'Opening balance correction (SC-070)',NULL,'2026-10-23 13:27:25'),(720,'2026-10-23','Stock Adjustment','stock_correction',0,'SC-070',8,42,'Kg',NULL,NULL,117.050,4175.89,9.500,429.07,0.000,0.00,45.1657,429.07,126.550,4604.97,'Opening balance correction (SC-070)',NULL,'2026-10-23 13:27:25'),(721,'2026-10-23','Stock Adjustment','stock_correction',0,'SC-070',8,43,'Kg',NULL,NULL,147.000,33810.00,12.500,2875.00,0.000,0.00,230.0000,2875.00,159.500,36685.00,'Opening balance correction (SC-070)',NULL,'2026-10-23 13:27:25'),(722,'2026-10-23','Stock Adjustment','stock_correction',0,'SC-070',8,44,'Kg',NULL,NULL,41.500,12740.50,8.500,2609.50,0.000,0.00,307.0000,2609.50,50.000,15350.00,'Opening balance correction (SC-070)',NULL,'2026-10-23 13:27:25'),(723,'2026-10-23','Stock Adjustment','stock_correction',0,'SC-070',8,45,'Kg',NULL,NULL,61.800,10444.20,12.500,2112.50,0.000,0.00,169.0000,2112.50,74.300,12556.70,'Opening balance correction (SC-070)',NULL,'2026-10-23 13:27:25'),(724,'2026-10-23','Stock Adjustment','stock_correction',0,'SC-070',8,47,'Kg',NULL,NULL,87.300,5115.80,4.000,234.40,0.000,0.00,58.6002,234.40,91.300,5350.20,'Opening balance correction (SC-070)',NULL,'2026-10-23 13:27:25'),(725,'2026-10-23','Stock Adjustment','stock_correction',0,'SC-070',8,49,'Kg',NULL,NULL,115.500,6181.35,2.700,144.50,0.000,0.00,53.5182,144.50,118.200,6325.85,'Opening balance correction (SC-070)',NULL,'2026-10-23 13:27:25'),(726,'2026-10-23','Stock Adjustment','stock_correction',0,'SC-070',8,50,'Kg',NULL,NULL,31.250,4411.46,4.000,564.67,0.000,0.00,141.1667,564.67,35.250,4976.13,'Opening balance correction (SC-070)',NULL,'2026-10-23 13:27:25'),(727,'2026-10-23','Stock Adjustment','stock_correction',0,'SC-070',8,51,'Kg',NULL,NULL,150.700,6492.47,7.500,353.33,0.000,0.00,47.1106,353.33,158.200,6845.80,'Opening balance correction (SC-070)',NULL,'2026-10-23 13:27:25'),(728,'2026-10-23','Stock Adjustment','stock_correction',0,'SC-070',8,52,'Kg',NULL,NULL,90.000,12560.42,5.500,767.58,0.000,0.00,139.5602,767.58,95.500,13328.00,'Opening balance correction (SC-070)',NULL,'2026-10-23 13:27:25'),(729,'2026-10-23','Stock Adjustment','stock_correction',0,'SC-070',8,56,'Kg',NULL,NULL,149.000,8741.95,7.500,483.07,0.000,0.00,64.4089,483.07,156.500,9225.01,'Opening balance correction (SC-070)',NULL,'2026-10-23 13:27:25'),(730,'2026-10-23','Stock Adjustment','stock_correction',0,'SC-070',8,61,'Kg',NULL,NULL,5.450,1008.25,6.500,1202.50,0.000,0.00,185.0000,1202.50,11.950,2210.75,'Opening balance correction (SC-070)',NULL,'2026-10-23 13:27:25'),(731,'2026-10-23','Stock Adjustment','stock_correction',0,'SC-070',8,66,'Kg',NULL,NULL,57.750,7218.75,3.250,406.25,0.000,0.00,125.0000,406.25,61.000,7625.00,'Opening balance correction (SC-070)',NULL,'2026-10-23 13:27:25'),(732,'2026-10-23','Stock Adjustment','stock_correction',0,'SC-070',8,69,'Kg',NULL,NULL,33.000,2640.00,6.500,787.40,0.000,0.00,121.1392,787.40,39.500,3427.40,'Opening balance correction (SC-070)',NULL,'2026-10-23 13:27:25'),(733,'2026-10-23','Stock Adjustment','stock_correction',0,'SC-070',8,105,NULL,NULL,NULL,0.700,641.34,0.000,0.00,0.700,641.34,916.2000,641.34,0.000,0.00,'Opening balance correction (SC-070)',NULL,'2026-10-23 13:27:25'),(734,'2026-10-23','Stock Adjustment','stock_correction',0,'SC-070',8,114,'Kg',NULL,NULL,4.000,1092.00,6.000,1638.00,0.000,0.00,273.0000,1638.00,10.000,2730.00,'Opening balance correction (SC-070)',NULL,'2026-10-23 13:27:25'),(735,'2026-10-23','Stock Adjustment','stock_correction',0,'SC-070',8,115,'Kg',NULL,NULL,75.000,13005.00,4.000,693.60,0.000,0.00,173.4000,693.60,79.000,13698.60,'Opening balance correction (SC-070)',NULL,'2026-10-23 13:27:25'),(736,'2026-10-23','Stock Adjustment','stock_correction',0,'SC-070',8,116,'Kg',NULL,NULL,52.500,21885.94,7.500,3126.56,0.000,0.00,416.8750,3126.56,60.000,25012.50,'Opening balance correction (SC-070)',NULL,'2026-10-23 13:27:25'),(737,'2026-10-23','Stock Adjustment','stock_correction',0,'SC-070',8,118,'Kg',NULL,NULL,95.000,14250.00,15.000,2250.00,0.000,0.00,150.0000,2250.00,110.000,16500.00,'Opening balance correction (SC-070)',NULL,'2026-10-23 13:27:25'),(738,'2026-10-23','Stock Adjustment','stock_correction',0,'SC-070',8,120,'Kg',NULL,NULL,127.325,84925.77,6.875,4387.68,0.000,0.00,638.2086,4387.68,134.200,89313.46,'Opening balance correction (SC-070)',NULL,'2026-10-23 13:27:25'),(739,'2026-10-23','Stock Adjustment','stock_correction',0,'SC-070',8,121,'Kg',NULL,NULL,40.000,6000.00,5.000,750.00,0.000,0.00,150.0000,750.00,45.000,6750.00,'Opening balance correction (SC-070)',NULL,'2026-10-23 13:27:25'),(740,'2026-10-23','Stock Adjustment','stock_correction',0,'SC-070',8,123,'Kg',NULL,NULL,172.800,30585.60,10.800,1911.60,0.000,0.00,177.0000,1911.60,183.600,32497.20,'Opening balance correction (SC-070)',NULL,'2026-10-23 13:27:25'),(741,'2026-10-23','Stock Adjustment','stock_correction',0,'SC-070',8,125,'Kg',NULL,NULL,67.890,45316.17,2.750,1794.68,0.000,0.00,652.6116,1794.68,70.640,47110.85,'Opening balance correction (SC-070)',NULL,'2026-10-23 13:27:25'),(742,'2026-10-23','Stock Adjustment','stock_correction',0,'SC-070',8,126,'Kg',NULL,NULL,5.550,8680.20,0.300,469.20,0.000,0.00,1564.0000,469.20,5.850,9149.40,'Opening balance correction (SC-070)',NULL,'2026-10-23 13:27:25'),(743,'2026-10-23','Stock Adjustment','stock_correction',0,'SC-070',8,158,'Kg',NULL,NULL,3.450,12749.80,0.120,449.56,0.000,0.00,3746.2969,449.56,3.570,13199.36,'Opening balance correction (SC-070)',NULL,'2026-10-23 13:27:25'),(744,'2026-10-23','Stock Adjustment','stock_correction',0,'SC-070',8,167,'Kg',NULL,NULL,34.450,16503.75,1.050,509.10,0.000,0.00,484.8592,509.10,35.500,17012.85,'Opening balance correction (SC-070)',NULL,'2026-10-23 13:27:25'),(745,'2026-10-23','Stock Adjustment','stock_correction',0,'SC-070',8,170,'Kg',NULL,NULL,16.000,3904.00,5.000,1220.00,0.000,0.00,244.0000,1220.00,21.000,5124.00,'Opening balance correction (SC-070)',NULL,'2026-10-23 13:27:25'),(746,'2026-10-23','Stock Adjustment','stock_correction',0,'SC-070',8,172,'Kg',NULL,NULL,74.750,28479.75,2.250,857.25,0.000,0.00,381.0000,857.25,77.000,29337.00,'Opening balance correction (SC-070)',NULL,'2026-10-23 13:27:25'),(747,'2026-10-23','Stock Adjustment','stock_correction',0,'SC-070',8,173,'Kg',NULL,NULL,66.125,53627.38,1.875,1520.63,0.000,0.00,811.0000,1520.63,68.000,55148.00,'Opening balance correction (SC-070)',NULL,'2026-10-23 13:27:25'),(748,'2026-10-23','Stock Adjustment','stock_correction',0,'SC-070',8,182,'Kg',NULL,NULL,174.650,124176.15,18.600,13224.60,0.000,0.00,711.0000,13224.60,193.250,137400.75,'Opening balance correction (SC-070)',NULL,'2026-10-23 13:27:25'),(773,'2026-10-22','Receipt','material_receipt',56,'GRN-2026-00025',8,209,'Kg',NULL,NULL,532.500,46506.98,10.000,800.00,0.000,0.00,80.0000,800.00,542.500,47306.98,'Material receipt',7,'2026-10-23 13:39:40'),(774,'2026-10-23','Transfer Out','stock_transfer',2,'STN-2026-00001',8,209,'Kg',NULL,NULL,542.500,47306.98,0.000,0.00,10.000,872.02,87.2018,872.02,532.500,46434.97,'Transfer to ',7,'2026-10-23 13:42:51'),(775,'2026-10-23','Transfer In','stock_transfer',2,'STN-2026-00001',7,209,'Kg',NULL,NULL,0.000,0.00,10.000,872.00,0.000,0.00,87.2000,872.00,10.000,872.00,'Transfer from ',7,'2026-10-23 13:42:51'),(776,'2026-10-23','Outbound Delivery','outbound_delivery',1,'OBD-2026-00001',8,209,'Kg',NULL,NULL,532.500,46434.97,0.000,0.00,10.000,872.02,87.2018,872.02,522.500,45562.95,'Outbound delivery to METRO DYE CHEM',7,'2026-10-23 13:44:23');
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_transfer_items`
--

LOCK TABLES `stock_transfer_items` WRITE;
/*!40000 ALTER TABLE `stock_transfer_items` DISABLE KEYS */;
INSERT INTO `stock_transfer_items` VALUES (2,2,209,'Kg',542.500,10.000,87.2000,872.00,NULL,NULL,'2026-10-23 13:42:51');
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_transfers`
--

LOCK TABLES `stock_transfers` WRITE;
/*!40000 ALTER TABLE `stock_transfers` DISABLE KEYS */;
INSERT INTO `stock_transfers` VALUES (2,'STN-2026-00001','2026-10-23',8,7,NULL,NULL,NULL,NULL,10.000,872.00,NULL,'Posted',7,NULL,'2026-10-23 13:42:51','2026-10-23 13:42:51');
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
INSERT INTO `supplier_pricing` VALUES (1,1,1,'KG',200.00,'2024-05-01','2024-05-30','Approved','2026-07-21 07:07:33','2026-07-21 07:07:33',1,NULL),(2,1,1,'KG',210.00,'2024-04-01','2024-04-30','Approved','2026-07-21 07:07:33','2026-07-21 07:07:33',1,NULL),(3,1,1,'KG',220.00,'2024-03-01','2024-03-31','Approved','2026-07-21 07:07:33','2026-07-21 07:07:33',1,NULL),(4,1,2,'KG',185.00,'2024-05-01','2024-05-31','Approved','2026-07-21 07:07:33','2026-07-21 07:07:33',1,NULL),(5,1,3,'LTR',65.00,'2024-05-01','2024-05-31','Approved','2026-07-21 07:07:33','2026-07-21 07:07:33',1,NULL),(6,1,4,'KG',145.00,'2024-05-01','2024-05-31','Approved','2026-07-21 07:07:33','2026-07-21 07:07:33',1,NULL),(7,1,5,'LTR',62.00,'2024-04-16','2024-04-30','Pending','2026-07-21 07:07:33','2026-07-21 07:07:33',1,NULL),(8,1,6,'KG',92.00,'2024-05-01','2024-05-31','Approved','2026-07-21 07:07:33','2026-10-27 07:38:52',1,7);
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
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `supply_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES (1,'testing','test','test','1234566789','test@gmail.com','765431133','test','test',NULL,'','654321','test','chemical','chemical','test','test','30','test','test','test','test','Active','2026-07-01 16:38:38','2026-07-02 16:56:39',NULL,NULL,NULL,NULL,NULL,NULL),(2,'SUP-004','Navochem',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:49','2026-08-10 06:14:49',NULL,NULL,NULL,NULL,NULL,NULL),(3,'SUP-005','Shama Enterprises',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:49','2026-08-10 06:14:49',NULL,NULL,NULL,NULL,NULL,NULL),(4,'SUP-006','MS Traders',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:49','2026-08-10 06:14:49',NULL,NULL,NULL,NULL,NULL,NULL),(5,'SUP-007','Shankar Chemicals',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:49','2026-08-10 06:14:49',NULL,NULL,NULL,NULL,NULL,NULL),(6,'SUP-008','Meghdoot',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:49','2026-08-10 06:14:49',NULL,NULL,NULL,NULL,NULL,NULL),(7,'SUP-009','TFB Exim(1) PVT LTD',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:49','2026-08-10 06:14:49',NULL,NULL,NULL,NULL,NULL,NULL),(8,'SUP-010','Imad import Chemicals',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:49','2026-08-10 06:14:49',NULL,NULL,NULL,NULL,NULL,NULL),(9,'SUP-011','Raitan PVT LTD',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:49','2026-08-10 06:14:49',NULL,NULL,NULL,NULL,NULL,NULL),(10,'SUP-012','AVT Enterprises',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:49','2026-08-10 06:14:49',NULL,NULL,NULL,NULL,NULL,NULL),(11,'SUP-013','Fortune International',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:49','2026-08-10 06:14:49',NULL,NULL,NULL,NULL,NULL,NULL),(12,'SUP-014','Bharath Enterprises',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:49','2026-08-10 06:14:49',NULL,NULL,NULL,NULL,NULL,NULL),(13,'SUP-015','Ponpure Chemicals',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:49','2026-08-10 06:14:49',NULL,NULL,NULL,NULL,NULL,NULL),(14,'SUP-016','Limra',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:49','2026-08-10 06:14:49',NULL,NULL,NULL,NULL,NULL,NULL),(15,'SUP-017','Perfect Colours',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:49','2026-08-10 06:14:49',NULL,NULL,NULL,NULL,NULL,NULL),(16,'SUP-018','Perfect Finishing Chemicals',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:50','2026-08-10 06:14:50',NULL,NULL,NULL,NULL,NULL,NULL),(17,'SUP-019','Mangilia Enterprise',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:50','2026-08-10 06:14:50',NULL,NULL,NULL,NULL,NULL,NULL),(18,'SUP-020','Meenakshi & Co',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:50','2026-08-10 06:14:50',NULL,NULL,NULL,NULL,NULL,NULL),(19,'SUP-021','Shankar Dye Chem',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:50','2026-08-10 06:14:50',NULL,NULL,NULL,NULL,NULL,NULL),(20,'SUP-022','Ambition Colours & Chemicals',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:50','2026-08-10 06:14:50',NULL,NULL,NULL,NULL,NULL,NULL),(21,'SUP-023','Color Shoppe',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:50','2026-08-10 06:14:50',NULL,NULL,NULL,NULL,NULL,NULL),(22,'SUP-024','Itakem Fine Chem',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:50','2026-08-10 06:14:50',NULL,NULL,NULL,NULL,NULL,NULL),(23,'SUP-025','Basic Vendor',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:50','2026-08-10 06:14:50',NULL,NULL,NULL,NULL,NULL,NULL),(24,'SUP-026','Sathya Colours PVT LTD',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:50','2026-08-10 06:14:50',NULL,NULL,NULL,NULL,NULL,NULL),(25,'SUP-027','Leer Chem',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:50','2026-08-10 06:14:50',NULL,NULL,NULL,NULL,NULL,NULL),(26,'SUP-028','Color Pelle',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'chemical','chemical',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Active','2026-08-10 06:14:50','2026-08-10 06:14:50',NULL,NULL,NULL,NULL,NULL,NULL),(28,'SUP-00029','METRO DYE CHEM','Metro Dye chem','','metrodyechem@gmail.com','','Chennai','Tamil Nadu','India','154/168 Govindappan Street','600001','','domestic','chemicals','33AAAFM4497R1ZN','AAAEM4497R','30','','','','','Active','2026-10-06 11:09:27','2026-10-06 11:09:27',NULL,NULL,NULL,NULL,NULL,NULL),(29,'SUP-00030','GS CHEM','GS CHEM','9344723883','','','Vaniyambadi','Tamil Nadu','India','','635751','','domestic','chemicals','33BDDPS5823E1ZP','','30','','','','','Active','2026-10-09 13:37:41','2026-10-09 13:37:41',NULL,NULL,NULL,NULL,NULL,NULL);
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
  `code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `short_form` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
INSERT INTO `uom` VALUES (1,'SQFT','Square Feet',NULL,'Area measurement in square feet','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(2,'SQM','Square Meter',NULL,'Area measurement in square meters','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(3,'KG','Kg',NULL,'Weight measurement in kilograms','Active','2026-07-05 14:29:03','2026-09-30 12:09:06',NULL,7,NULL),(4,'LTR','Liter',NULL,'Liquid volume in liters','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(5,'MTR','Meter',NULL,'Linear measurement in meters','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(6,'PIECE','Piece','Pcs','Individual unit count','Active','2026-07-05 14:29:03','2026-10-26 10:12:36',NULL,7,NULL),(7,'DOZEN','Dozen',NULL,'Pack of 12 units','Active','2026-07-05 14:29:03','2026-07-05 14:29:03',NULL,NULL,NULL),(9,'UOM-00NaN','Bundle',NULL,'','Active','2026-08-11 14:51:34','2026-08-11 14:51:34',7,NULL,NULL),(10,'UOM-00001','Box',NULL,'','Active','2026-08-11 14:51:42','2026-08-11 14:51:42',7,NULL,NULL),(11,'UOM-00002','none',NULL,'none','Active','2026-08-22 06:18:01','2026-08-22 06:18:01',7,NULL,NULL);
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
INSERT INTO `users` VALUES (7,'akmadmin','$2a$10$d/6u5QHlAmduzPJucmCB5ekmmd7BC.p72sdF0/v3WmahOBCrs8uD6','akmadmin@gmail.com','Admin Akm',1,NULL,NULL,'Active','2026-10-26 15:37:33','2026-07-22 05:21:44','2026-10-26 15:37:33',1,NULL),(8,'ihtishaam','$2a$10$wokvJgCPZnM.tPgbajHZ9OWH6cGCg8R8TL5Xumy5cSnZbjKrNoToW',NULL,'Ihtishaam',1,NULL,NULL,'Active',NULL,'2026-09-16 09:11:51','2026-09-16 09:11:51',NULL,NULL),(9,'abdullah','$2a$10$TMixMR2xrVR939XeCuTDEulH3la0Ynw8YFI2nxLWTNxQhLzGZyM8W',NULL,'Abdullah Basha',1,NULL,NULL,'Active','2026-10-04 06:26:30','2026-09-16 09:11:51','2026-10-04 06:26:30',NULL,7),(10,'tabrez','$2a$10$wokvJgCPZnM.tPgbajHZ9OWH6cGCg8R8TL5Xumy5cSnZbjKrNoToW',NULL,'Tabrez',11,NULL,NULL,'Active',NULL,'2026-09-16 09:11:51','2026-09-16 09:11:51',NULL,NULL),(11,'sami','$2a$10$wokvJgCPZnM.tPgbajHZ9OWH6cGCg8R8TL5Xumy5cSnZbjKrNoToW',NULL,'Sami',12,NULL,NULL,'Active',NULL,'2026-09-16 09:11:51','2026-09-16 09:11:51',NULL,NULL),(12,'ameen','$2a$10$morOH0c7Vbd/T8rgWuZg6eyLEJkBeBiOsgLB6HTR95zQyOfVMzJcG',NULL,'Ameen',11,NULL,NULL,'Active','2026-09-30 11:55:31','2026-09-16 09:11:51','2026-09-30 11:55:31',NULL,7),(13,'aadil','$2a$10$wokvJgCPZnM.tPgbajHZ9OWH6cGCg8R8TL5Xumy5cSnZbjKrNoToW',NULL,'Aadil',12,NULL,NULL,'Active',NULL,'2026-09-16 09:11:51','2026-09-16 09:11:51',NULL,NULL),(14,'waseem','$2a$10$wokvJgCPZnM.tPgbajHZ9OWH6cGCg8R8TL5Xumy5cSnZbjKrNoToW',NULL,'Waseem',12,NULL,NULL,'Active',NULL,'2026-09-16 09:11:51','2026-09-16 09:11:51',NULL,NULL),(15,'umar','$2a$10$wokvJgCPZnM.tPgbajHZ9OWH6cGCg8R8TL5Xumy5cSnZbjKrNoToW',NULL,'Umar',12,NULL,NULL,'Active',NULL,'2026-09-16 09:11:51','2026-09-16 09:11:51',NULL,NULL),(16,'Salman','$2a$10$AmjXGgzYJk5vB7S9cgAPC.sDx3AJHmvkez583pIPXDmkKXepEt1um','sallu7037@gmail.com','Mohammed Salman',1,NULL,NULL,'Active','2026-10-22 13:25:08','2026-09-17 10:43:45','2026-10-22 13:25:08',7,NULL);
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
/*!40000 ALTER TABLE `warehouse_bins` ENABLE KEYS */;
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
INSERT INTO `warehouses` VALUES (7,'WH-002','AKM Wetblue ',NULL,'Raw Material',NULL,'No',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Dry','No','No',NULL,'FIFO',0,NULL,NULL,'Active',7,NULL,'2026-09-26 11:34:56','2026-09-26 11:34:56'),(8,'WH-003','AKM Chemicals',NULL,'Raw Material',NULL,'No',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Ameen ','CC-RAW-01',NULL,NULL,NULL,'Dry','No','No',NULL,'FIFO',0,NULL,NULL,'Active',7,16,'2026-09-26 12:34:00','2026-10-08 13:29:58');
/*!40000 ALTER TABLE `warehouses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'tannery_mini_erp'
--

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

-- Dump completed on 2026-10-27 17:29:02
