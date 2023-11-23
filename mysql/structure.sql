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
-- Table structure for table `clientes`
--

DROP TABLE IF EXISTS `clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo_doc` char(1) NOT NULL,
  `documento` varchar(20) NOT NULL,
  `nombres` varchar(255) NOT NULL,
  `telefono` varchar(15) NOT NULL,
  `correo` varchar(255) DEFAULT '',
  `genero` char(1) DEFAULT 'M',
  `distrito_id` int DEFAULT '1',
  `direc` varchar(255) NOT NULL,
  `referencia` varchar(255) DEFAULT '',
  `url_maps` varchar(255) DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `distrito_id` (`distrito_id`),
  CONSTRAINT `clientes_ibfk_1` FOREIGN KEY (`distrito_id`) REFERENCES `distrito` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `distrito`
--

DROP TABLE IF EXISTS `distrito`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `distrito` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `item_reparto`
--

DROP TABLE IF EXISTS `item_reparto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `item_reparto` (
  `id` int NOT NULL AUTO_INCREMENT,
  `num_guia` varchar(255) DEFAULT '',
  `detalle` varchar(255) DEFAULT '',
  `cant` int DEFAULT '0',
  `precio` decimal(10,2) DEFAULT '0.00',
  `id_reparto` int NOT NULL,
  `id_tipo_paquete` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_reparto` (`id_reparto`),
  KEY `id_tipo_paquete` (`id_tipo_paquete`),
  CONSTRAINT `item_reparto_ibfk_1` FOREIGN KEY (`id_reparto`) REFERENCES `repartos` (`id`),
  CONSTRAINT `item_reparto_ibfk_2` FOREIGN KEY (`id_tipo_paquete`) REFERENCES `tipo_paquete` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `repartos`
--

DROP TABLE IF EXISTS `repartos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `repartos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `anotacion` varchar(255) DEFAULT '',
  `clave` varchar(255) DEFAULT '',
  `estado` char(1) DEFAULT 'P',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_entrega` timestamp NULL DEFAULT NULL,
  `id_cliente` int NOT NULL,
  `id_usuario` int NOT NULL,
  `id_repartidor` int DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_cliente` (`id_cliente`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_repartidor` (`id_repartidor`),
  CONSTRAINT `repartos_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id`),
  CONSTRAINT `repartos_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `repartos_ibfk_3` FOREIGN KEY (`id_repartidor`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tipo_paquete`
--

DROP TABLE IF EXISTS `tipo_paquete`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_paquete` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `documento` varchar(20) NOT NULL,
  `nombres` varchar(255) NOT NULL,
  `ape_materno` varchar(255) DEFAULT '',
  `ape_paterno` varchar(255) DEFAULT '',
  `telefono` varchar(15) DEFAULT '',
  `correo` varchar(255) DEFAULT '',
  `fecha_nacimiento` date NOT NULL DEFAULT '1900-01-01',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `clave` varchar(255) DEFAULT NULL,
  `rol` char(1) DEFAULT NULL,
  `activo` char(1) DEFAULT 'S',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-11-23 10:59:57
