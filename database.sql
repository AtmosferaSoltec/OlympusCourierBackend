CREATE DATABASE olympus_courier;

USE olympus_courier;

CREATE TABLE distrito (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50)
);

CREATE TABLE tipo_paquete (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50)
);

CREATE TABLE clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo_doc CHAR(1) NOT NULL,
  documento VARCHAR(20) NOT NULL,
  nombres VARCHAR(255) NOT NULL,
  telefono VARCHAR(15) NOT NULL,
  correo VARCHAR(255) DEFAULT '',
  genero CHAR(1) DEFAULT 'M',
  distrito_id INT DEFAULT 1,
  direc VARCHAR(255) NOT NULL,
  referencia VARCHAR(255) DEFAULT '',
  FOREIGN KEY (distrito_id) REFERENCES distrito(id)
);

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  documento VARCHAR(20) NOT NULL,
  nombres VARCHAR(255) NOT NULL,
  ape_materno VARCHAR(255) DEFAULT '',
  ape_paterno VARCHAR(255) DEFAULT '',
  telefono VARCHAR(15) DEFAULT '',
  correo VARCHAR(255) DEFAULT '',
  fecha_nacimiento DATE DEFAULT '1900-01-01' NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT now(),
  clave VARCHAR(255),
  rol CHAR(1)
);

CREATE TABLE repartos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  anotacion VARCHAR(255) DEFAULT '',
  clave VARCHAR(255) DEFAULT '',
  estado CHAR(1) DEFAULT 'P',
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_entrega TIMESTAMP,
  id_cliente INT NOT NULL,
  id_usuario INT NOT NULL,
  id_repartidor INT,
  total DECIMAL(10, 2),
  FOREIGN KEY (id_cliente) REFERENCES clientes(id),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
  FOREIGN KEY (id_repartidor) REFERENCES usuarios(id)
);

CREATE TABLE item_reparto (
  id INT AUTO_INCREMENT PRIMARY KEY,
  num_guia VARCHAR(255) DEFAULT '',
  detalle VARCHAR(255) DEFAULT '',
  cant INT DEFAULT 0,
  precio DECIMAL(10, 2) DEFAULT 0.0,
  id_reparto INT NOT NULL,
  id_tipo_paquete INT NOT NULL,
  FOREIGN KEY (id_reparto) REFERENCES repartos(id),
  FOREIGN KEY (id_tipo_paquete) REFERENCES tipo_paquete(id)
);