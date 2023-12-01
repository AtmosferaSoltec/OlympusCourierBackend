CREATE DATABASE olympus_courier;

USE olympus_courier;

CREATE TABLE distrito (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50),
  fecha_creacion TIMESTAMP DEFAULT now(),
  activo CHAR(1) DEFAULT 'S'
);

INSERT INTO distrito (nombre)
VALUES
	('Chincha Alta'),
	('Chincha Baja'),
	('Pueblo Nuevo'),
	('Tambo de Mora'),
	('Sunampe'),
	('Grocio Prado'),
	('El Carmen'),
	('Alto Laran');

CREATE TABLE tipo_paquete (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50),
  fecha_creacion TIMESTAMP DEFAULT now(),
  activo CHAR(1) DEFAULT 'S'
);

INSERT INTO tipo_paquete (nombre)
VALUES
	('Caja'),
	('Paquete'),
	('Paqueteria'),
	('Sobre'),
	('Bulto'),
	('Otro');

CREATE TABLE tipo_doc (
	id INT PRIMARY KEY AUTO_INCREMENT,
    cod CHAR(1) UNIQUE,
    nombre VARCHAR(25),
    detalle VARCHAR(255),
    cant_caracteres INT
);

INSERT INTO tipo_doc (cod, nombre, detalle, cant_caracteres)
VALUES
	('6', 'R', 'RUC', 11),
	('1', 'D', 'Documento', 8),
    ('-', 'V', 'Varios', 255),
    ('4', 'C', 'Carnet de Extranjeria', 12),
    ('7', 'P', 'Pasaporte', 12);


CREATE TABLE cliente (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cod_tipodoc CHAR(1),
  documento VARCHAR(20) UNIQUE NOT NULL,
  nombres VARCHAR(255) NOT NULL,
  telefono VARCHAR(15) NOT NULL,
  correo VARCHAR(255) DEFAULT '',
  genero CHAR(1) DEFAULT 'S',
  id_distrito INT DEFAULT 1,
  direc VARCHAR(255) NOT NULL,
  referencia VARCHAR(255) DEFAULT '',
  url_maps VARCHAR(255) DEFAULT '',
  activo CHAR(1) DEFAULT 'S',
  fecha_creacion TIMESTAMP DEFAULT now(),
  FOREIGN KEY (cod_tipodoc) REFERENCES tipo_doc(cod),
  FOREIGN KEY (id_distrito) REFERENCES distrito(id)
);

INSERT INTO cliente (cod_tipodoc, documento, nombres, telefono, genero, id_distrito, direc, referencia, url_maps)
VALUES 
	('1','25668735','Paquita Fernandez Lara','984334920','F',1,'Calle Pedro Moreno 102','Frente a Plaza de Armas',''),
	('6','20492684679','Sistema y Soluciones','971842536','S',3,'Av. Enrique Torres Saldamando 146','Atras de Sunat','https://maps.app.goo.gl/7R8DX9e5gtWtka8q7'),
    ('1','25666175','Juan Carlos Maldonado Reynaga','949071783','S',2,'Prol. Luis Massaro 118','Atras de Plaza vea',''),
    ('1','25707522','Richard Tataje Maldonado','931245632','M',4,'Av. Las Palmeras 12','Atras de Plaza Norte','');
    
CREATE TABLE rol (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cod CHAR(1) UNIQUE,
  nombre VARCHAR(50),
  fecha_creacion TIMESTAMP DEFAULT now(),
  activo CHAR(1) DEFAULT 'S'
);

INSERT INTO rol (cod, nombre)
VALUES
	('U','Usuario'),
	('A','Admin'),
	('S','SuperAdmin'),
	('D','Delivery');

CREATE TABLE usuario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  documento VARCHAR(20) NOT NULL,
  nombres VARCHAR(255) NOT NULL,
  ape_paterno VARCHAR(255) DEFAULT '',
  ape_materno VARCHAR(255) DEFAULT '',
  telefono VARCHAR(15) DEFAULT '',
  correo VARCHAR(255) DEFAULT '',
  fecha_nac DATE DEFAULT '1900-01-01' NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT now(),
  clave VARCHAR(255),
  cod_rol CHAR(1),
  activo CHAR(1) DEFAULT 'S',
  FOREIGN KEY (cod_rol) REFERENCES rol(cod)
);

INSERT INTO usuario (documento,nombres,ape_paterno,ape_materno,telefono,correo,fecha_nac,clave,cod_rol)
VALUES
	('74866419','Hector Adriel','Albino','Tasayco','955003641','adrilito@gmail.com','1997-11-02','1234','A'),
	('74455518','Joel','Maldonado','Fernandez','936416623','joelmaldonadodev@gmail.com','1999-10-11','1234','S');

CREATE TABLE comprobante (
	id INT PRIMARY KEY AUTO_INCREMENT,
    id_cliente INT NOT NULL,
    id_usuario INT NOT NULL,
    tipo_de_comprobante INT,
    serie VARCHAR(5),
    numero INT,
    enlace VARCHAR(255) DEFAULT '',
    url_pdf VARCHAR(255) DEFAULT '',
    url_xml VARCHAR(255) DEFAULT '',
	fecha_creacion TIMESTAMP DEFAULT now(),
	activo CHAR(1) DEFAULT 'S',
    FOREIGN KEY (id_cliente) REFERENCES cliente(id),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id)
);

CREATE TABLE reparto (
  id INT AUTO_INCREMENT PRIMARY KEY,
  anotacion VARCHAR(255) DEFAULT '',
  clave VARCHAR(255) DEFAULT '',
  estado CHAR(1) DEFAULT 'P',
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_entrega TIMESTAMP,
  id_cliente INT NOT NULL,
  id_usuario INT NOT NULL,
  id_repartidor INT,
  id_comprobante INT,
  url_foto VARCHAR(255),
  total DECIMAL(10, 2),
  activo CHAR(1) DEFAULT 'S',
  FOREIGN KEY (id_cliente) REFERENCES cliente(id),
  FOREIGN KEY (id_usuario) REFERENCES usuario(id),
  FOREIGN KEY (id_repartidor) REFERENCES usuario(id),
  FOREIGN KEY (id_comprobante) REFERENCES comprobante(id)
);
    
CREATE TABLE item_reparto (
  id INT AUTO_INCREMENT PRIMARY KEY,
  num_guia VARCHAR(255) DEFAULT '',
  detalle VARCHAR(255) DEFAULT '',
  cant INT DEFAULT 0,
  precio DECIMAL(10, 2) DEFAULT 0.0,
  id_reparto INT NOT NULL,
  id_tipo_paquete INT NOT NULL,
  activo CHAR(1) DEFAULT 'S',
  FOREIGN KEY (id_reparto) REFERENCES reparto(id),
  FOREIGN KEY (id_tipo_paquete) REFERENCES tipo_paquete(id)
);


CREATE TABLE registro (
	id INT AUTO_INCREMENT PRIMARY KEY,
    tabla VARCHAR(50),
    id_tabla INT,
    fecha TIMESTAMP DEFAULT NOW(),
    id_user INT,
    campo VARCHAR(50),
    valor_old VARCHAR(255),
    valor_new VARCHAR(255),
    pc VARCHAR(50),
    ip VARCHAR(50),
    FOREIGN KEY (id_user) REFERENCES usuario(id)
);





/**Resetear valores de una tabla*/
SET foreign_key_checks = 0;
TRUNCATE TABLE usuario;
ALTER TABLE usuario AUTO_INCREMENT = 1;
SET foreign_key_checks = 1;