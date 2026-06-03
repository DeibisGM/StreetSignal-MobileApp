-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: zephyr.proxy.rlwy.net    Database: railway
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Categories`
--

DROP TABLE IF EXISTS `Categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Categories` (
  `Id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Name` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Slug` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Icon` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nombre del icono UI (trash, lightbulb...)',
  `Color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Hex #RRGGBB para badges',
  `IsActive` tinyint(1) NOT NULL DEFAULT '1',
  `SortOrder` int NOT NULL DEFAULT '0',
  `CreatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`Id`),
  UNIQUE KEY `uk_categories_slug` (`Slug`),
  KEY `idx_categories_active` (`IsActive`,`SortOrder`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Catalogo de categorias. Soft-delete via IsActive.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Categories`
--

LOCK TABLES `Categories` WRITE;
/*!40000 ALTER TABLE `Categories` DISABLE KEYS */;
INSERT INTO `Categories` VALUES ('3f5b0a82-5f3a-4a44-8f29-8d68f6b3a001','Basura acumulada','basura-acumulada','Acumulacion de residuos en espacios publicos.','trash','#16A34A',1,10,'2026-06-03 17:35:11.414'),('3f5b0a82-5f3a-4a44-8f29-8d68f6b3a002','Luminaria defectuosa','luminaria-defectuosa','Farolas apagadas, intermitentes o danadas.','lightbulb','#F59E0B',1,20,'2026-06-03 17:35:11.414'),('3f5b0a82-5f3a-4a44-8f29-8d68f6b3a003','Fuga de agua','fuga-de-agua','Fugas en tuberias, hidrantes o conexiones.','droplet','#0EA5E9',1,30,'2026-06-03 17:35:11.414'),('3f5b0a82-5f3a-4a44-8f29-8d68f6b3a004','Dano en calle','dano-en-calle','Baches, grietas o hundimientos en vias publicas.','road','#EF4444',1,40,'2026-06-03 17:35:11.414'),('3f5b0a82-5f3a-4a44-8f29-8d68f6b3a005','Infraestructura danada','infraestructura-danada','Danos en puentes, aceras, muros o senalizacion.','building','#7C3AED',1,50,'2026-06-03 17:35:11.414'),('3f5b0a82-5f3a-4a44-8f29-8d68f6b3a006','Arbol u obstruccion','arbol-obstruccion','Arboles caidos, ramas peligrosas u obstaculos.','tree','#10B981',1,60,'2026-06-03 17:35:11.414'),('3f5b0a82-5f3a-4a44-8f29-8d68f6b3a007','Senalizacion danada','senalizacion-danada','Senales de transito deterioradas o ausentes.','sign','#6366F1',1,70,'2026-06-03 17:35:11.414'),('3f5b0a82-5f3a-4a44-8f29-8d68f6b3a999','Otro','otro','Cualquier otra incidencia que no encaje.','more','#64748B',1,99,'2026-06-03 17:35:11.414');
/*!40000 ALTER TABLE `Categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Notifications`
--

DROP TABLE IF EXISTS `Notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Notifications` (
  `Id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `UserId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ReportId` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Title` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Message` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `IsRead` tinyint(1) NOT NULL DEFAULT '0',
  `CreatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `ReadAt` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `idx_notif_user_unread` (`UserId`,`IsRead`,`CreatedAt`),
  KEY `fk_notif_report` (`ReportId`),
  CONSTRAINT `fk_notif_report` FOREIGN KEY (`ReportId`) REFERENCES `Reports` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bandeja de notificaciones in-app.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Notifications`
--

LOCK TABLES `Notifications` WRITE;
/*!40000 ALTER TABLE `Notifications` DISABLE KEYS */;
INSERT INTO `Notifications` VALUES ('771f9b9e-cb98-4d3d-8788-955a7a442001','52af55ef-2a35-48cc-9e75-1ab3cf92c0c1','a6d2fd95-9d71-4b47-9627-fad5d7822001','Reporte en proceso','Tu reporte \"Basura acumulada frente al parque central\" ahora esta En Progreso.',0,'2026-06-02 15:00:00.000',NULL),('771f9b9e-cb98-4d3d-8788-955a7a442002','52af55ef-2a35-48cc-9e75-1ab3cf92c0c1','a6d2fd95-9d71-4b47-9627-fad5d7822003','Reporte resuelto','Tu reporte \"Bache profundo en Avenida 6\" fue marcado como Resuelto.',1,'2026-06-02 18:00:00.000',NULL);
/*!40000 ALTER TABLE `Notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ReportUpdates`
--

DROP TABLE IF EXISTS `ReportUpdates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ReportUpdates` (
  `Id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ReportId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `CreatedById` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Type` enum('Comment','StatusChange','System') COLLATE utf8mb4_unicode_ci NOT NULL,
  `Message` text COLLATE utf8mb4_unicode_ci,
  `OldStatus` enum('Pending','InReview','Assigned','InProgress','Resolved','Rejected') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `NewStatus` enum('Pending','InReview','Assigned','InProgress','Resolved','Rejected') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `IsOfficial` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1 si lo escribe Staff/Admin',
  `CreatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`Id`),
  KEY `idx_updates_report` (`ReportId`,`CreatedAt`),
  KEY `idx_updates_user` (`CreatedById`),
  CONSTRAINT `fk_updates_report` FOREIGN KEY (`ReportId`) REFERENCES `Reports` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `fk_updates_user` FOREIGN KEY (`CreatedById`) REFERENCES `Users` (`Id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_updates_status_pair` CHECK (((`Type` <> _utf8mb4'StatusChange') or ((`OldStatus` is not null) and (`NewStatus` is not null) and (`OldStatus` <> `NewStatus`))))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Timeline inmutable: comentarios, cambios de estado, eventos sistema.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ReportUpdates`
--

LOCK TABLES `ReportUpdates` WRITE;
/*!40000 ALTER TABLE `ReportUpdates` DISABLE KEYS */;
INSERT INTO `ReportUpdates` VALUES ('0cb57e24-00dd-46d6-9032-199dfd4b2001','a6d2fd95-9d71-4b47-9627-fad5d7822001','52af55ef-2a35-48cc-9e75-1ab3cf92c0c2','StatusChange','Asignado a cuadrilla de aseo urbano.','Pending','InProgress',1,'2026-06-02 12:00:00.000'),('0cb57e24-00dd-46d6-9032-199dfd4b2002','a6d2fd95-9d71-4b47-9627-fad5d7822001','52af55ef-2a35-48cc-9e75-1ab3cf92c0c1','Comment','Gracias por la pronta atencion!',NULL,NULL,0,'2026-06-02 15:15:00.000'),('0cb57e24-00dd-46d6-9032-199dfd4b2003','a6d2fd95-9d71-4b47-9627-fad5d7822003','52af55ef-2a35-48cc-9e75-1ab3cf92c0c2','StatusChange','Equipo de bacheo finalizo el trabajo.','InReview','Resolved',1,'2026-06-02 18:00:00.000');
/*!40000 ALTER TABLE `ReportUpdates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Reports`
--

DROP TABLE IF EXISTS `Reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Reports` (
  `Id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `CategoryId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Status` enum('Pending','InReview','Assigned','InProgress','Resolved','Rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pending',
  `Priority` enum('Low','Medium','High','Critical') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Latitude` decimal(10,7) NOT NULL,
  `Longitude` decimal(10,7) NOT NULL,
  `Address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ImageUrl` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'URL publica de la imagen (CDN, storage, etc.)',
  `CreatedById` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `CreatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `UpdatedAt` datetime(3) DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(3),
  `ResolvedAt` datetime(3) DEFAULT NULL COMMENT 'Auto-set cuando Status pasa a Resolved',
  PRIMARY KEY (`Id`),
  KEY `idx_reports_status` (`Status`),
  KEY `idx_reports_category` (`CategoryId`),
  KEY `idx_reports_created_by` (`CreatedById`),
  KEY `idx_reports_created_at` (`CreatedAt`),
  KEY `idx_reports_status_date` (`Status`,`CreatedAt`),
  KEY `idx_reports_geo` (`Latitude`,`Longitude`),
  CONSTRAINT `fk_reports_category` FOREIGN KEY (`CategoryId`) REFERENCES `Categories` (`Id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_reports_creator` FOREIGN KEY (`CreatedById`) REFERENCES `Users` (`Id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_reports_lat` CHECK ((`Latitude` between -(90) and 90)),
  CONSTRAINT `chk_reports_lng` CHECK ((`Longitude` between -(180) and 180))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Reportes ciudadanos. 1 imagen por reporte (como en el OpenAPI).';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Reports`
--

LOCK TABLES `Reports` WRITE;
/*!40000 ALTER TABLE `Reports` DISABLE KEYS */;
INSERT INTO `Reports` VALUES ('a6d2fd95-9d71-4b47-9627-fad5d7822001','Basura acumulada frente al parque central','Hay varias bolsas de basura acumuladas desde hace dias en la entrada norte del parque. Generan mal olor.','3f5b0a82-5f3a-4a44-8f29-8d68f6b3a001','InProgress','Medium',10.3271000,-84.4305000,'Ciudad Quesada, San Carlos, Alajuela','https://storage.example.com/reports/report-001.jpg','52af55ef-2a35-48cc-9e75-1ab3cf92c0c1','2026-06-02 10:00:00.000',NULL,NULL),('a6d2fd95-9d71-4b47-9627-fad5d7822002','Luminaria apagada en Calle 2','La farola del poste 145 lleva 5 noches apagada, es una zona muy transitada.','3f5b0a82-5f3a-4a44-8f29-8d68f6b3a002','Pending','Low',10.3254500,-84.4321000,'Calle 2, Ciudad Quesada','https://storage.example.com/reports/report-002.jpg','52af55ef-2a35-48cc-9e75-1ab3cf92c0c1','2026-06-02 11:30:00.000',NULL,NULL),('a6d2fd95-9d71-4b47-9627-fad5d7822003','Bache profundo en Avenida 6','Bache de aprox. 60cm de diametro y 15cm de profundidad. Ya ha danado dos vehiculos.','3f5b0a82-5f3a-4a44-8f29-8d68f6b3a004','Resolved','High',10.3300100,-84.4287000,'Avenida 6, Ciudad Quesada','https://storage.example.com/reports/report-003.jpg','52af55ef-2a35-48cc-9e75-1ab3cf92c0c1','2026-05-30 14:00:00.000','2026-06-02 15:30:00.000','2026-06-02 18:00:00.000');
/*!40000 ALTER TABLE `Reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `Id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `FullName` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `PasswordHash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'BCrypt(11) o Argon2id',
  `Role` enum('Citizen','Staff','Admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Citizen',
  `IsActive` tinyint(1) NOT NULL DEFAULT '1',
  `CreatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `UpdatedAt` datetime(3) DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`Id`),
  UNIQUE KEY `uk_users_email` (`Email`),
  KEY `idx_users_role` (`Role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Usuarios: ciudadanos, funcionarios municipales y administradores.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES ('52af55ef-2a35-48cc-9e75-1ab3cf92c0c1','Ciudadano Demo','ciudadano@test.com','8888-8888','$2a$11$PLACEHOLDER.REPLACE.WITH.REAL.BCRYPT.HASH.OF.Password123!','Citizen',1,'2026-06-01 09:00:00.000',NULL),('52af55ef-2a35-48cc-9e75-1ab3cf92c0c2','Funcionario Demo','funcionario@test.com','8888-9999','$2a$11$PLACEHOLDER.REPLACE.WITH.REAL.BCRYPT.HASH.OF.Password123!','Staff',1,'2026-06-01 09:00:00.000',NULL),('52af55ef-2a35-48cc-9e75-1ab3cf92c0c3','Administrador','admin@test.com','8000-0000','$2a$11$PLACEHOLDER.REPLACE.WITH.REAL.BCRYPT.HASH.OF.Password123!','Admin',1,'2026-06-01 09:00:00.000',NULL),('f713dbbd-cd01-44bf-9a86-a7e6465b163c','Arturo Chavarria','arturo01097@gmail.com','87284135','AQAAAAIAAYagAAAAEFa8sQ82wmRC4nzirufqngl2QzsgDxuZ7y8WUmbrrRzA0WlkaMDCvaiclVDO248atQ==','Citizen',1,'2026-06-03 18:08:19.689',NULL);
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-03 12:28:24
