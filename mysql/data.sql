-- MySQL dump 10.13  Distrib 8.0.33, for Win64 (x86_64)
--
-- Host: 161.132.47.45    Database: olympus_courier
-- ------------------------------------------------------
-- Server version	8.0.35-0ubuntu0.22.04.1

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
-- Dumping data for table `clientes`
--

LOCK TABLES `clientes` WRITE;
/*!40000 ALTER TABLE `clientes` DISABLE KEYS */;
INSERT INTO `clientes` VALUES (1,'D','25668735','Paquita Fernandez Lara','984334920','','F',1,'Calle Pedro Moreno 102','',''),(2,'R','20492684679','Sistema y Soluciones','971842536','sys@gmail.com','S',3,'Av. Enrique Torres Saldamando 146','Atras de Sunat','https://maps.app.goo.gl/7R8DX9e5gtWtka8q7'),(3,'D','25666175','Juan Carlos Maldonado Reynaga','949071783','','S',2,'Prol. Luis Massaro 118','Atras de Plaza vea',''),(5,'D','25707522','Richard Tataje Maldonado','931245632','','M',7,'Av. Las Palmeras 12','Atras de Plaza Norte','');
/*!40000 ALTER TABLE `clientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `distrito`
--

LOCK TABLES `distrito` WRITE;
/*!40000 ALTER TABLE `distrito` DISABLE KEYS */;
INSERT INTO `distrito` VALUES (1,'Tambo de Mora'),(2,'Chincha Alta'),(3,'Chincha Baja'),(4,'Sunampe'),(7,'Grocio Prado'),(8,'El Carmen'),(9,'Alto Laran');
/*!40000 ALTER TABLE `distrito` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `item_reparto`
--

LOCK TABLES `item_reparto` WRITE;
/*!40000 ALTER TABLE `item_reparto` DISABLE KEYS */;
INSERT INTO `item_reparto` VALUES (1,'','',1,10.00,1,1),(2,'','',2,20.00,1,1);
/*!40000 ALTER TABLE `item_reparto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `repartos`
--

LOCK TABLES `repartos` WRITE;
/*!40000 ALTER TABLE `repartos` DISABLE KEYS */;
INSERT INTO `repartos` VALUES (1,'','1234','P','2023-11-23 04:53:05',NULL,1,1,NULL,30.00);
/*!40000 ALTER TABLE `repartos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `tipo_paquete`
--

LOCK TABLES `tipo_paquete` WRITE;
/*!40000 ALTER TABLE `tipo_paquete` DISABLE KEYS */;
INSERT INTO `tipo_paquete` VALUES (1,'Bulto'),(2,'Paquete'),(3,'Sobre');
/*!40000 ALTER TABLE `tipo_paquete` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'74866419','Hector Adriel','Albino','Tasayco','955003641','adrilito@gmail.com','1997-11-02','2023-11-23 04:42:42','1234','U','1');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-11-23 11:00:43
