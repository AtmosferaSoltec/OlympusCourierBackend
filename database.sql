CREATE DATABASE olympus_courier;

USE olympus_courier;

CREATE TABLE distrito (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50),
  fecha_creacion TIMESTAMP DEFAULT now(),
  activo CHAR(1) DEFAULT 'S'
);

CREATE TABLE metodo_pago (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50),
  fecha_creacion TIMESTAMP DEFAULT now(),
  activo CHAR(1) DEFAULT 'S'
);

INSERT INTO
metodo_pago (nombre)
VALUES
	('Efectivo'),
    ('Yape');

INSERT INTO
  distrito (nombre)
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

INSERT INTO
  tipo_paquete (nombre)
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
  detalle VARCHAR(255),
  cant_caracteres INT,
  fecha_creacion TIMESTAMP DEFAULT now(),
  activo CHAR(1) DEFAULT 'S'
);

INSERT INTO
  tipo_doc (cod, detalle, cant_caracteres)
VALUES
  ('6', 'RUC', 11),
  ('1', 'Documento', 8),
  ('-', 'Varios', 255),
  ('4', 'Carnet de Extranjeria', 12),
  ('7', 'Pasaporte', 12);

CREATE TABLE cliente (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cod_tipodoc CHAR(1),
  documento VARCHAR(20) UNIQUE NOT NULL,
  nombres VARCHAR(255) NOT NULL,
  telefono VARCHAR(15) UNIQUE NOT NULL,
  correo VARCHAR(255),
  genero CHAR(1) DEFAULT 'S',
  id_distrito INT DEFAULT 1,
  direc VARCHAR(255) NOT NULL,
  referencia VARCHAR(255) DEFAULT '',
  url_maps VARCHAR(255) DEFAULT '',
  fecha_creacion TIMESTAMP DEFAULT now(),
  activo CHAR(1) DEFAULT 'S',
  FOREIGN KEY (cod_tipodoc) REFERENCES tipo_doc(cod),
  FOREIGN KEY (id_distrito) REFERENCES distrito(id)
);

INSERT INTO
  cliente (
    cod_tipodoc,
    documento,
    nombres,
    telefono,
    genero,
    id_distrito,
    direc,
    referencia,
    url_maps
  )
VALUES
  (
    '1',
    '25668735',
    'Paquita Fernandez Lara',
    '984334920',
    'F',
    1,
    'Calle Pedro Moreno 102',
    'Frente a Plaza de Armas',
    ''
  ),
  (
    '6',
    '20492684679',
    'Sistema y Soluciones',
    '971842536',
    'S',
    3,
    'Av. Enrique Torres Saldamando 146',
    'Atras de Sunat',
    'https://maps.app.goo.gl/7R8DX9e5gtWtka8q7'
  ),
  (
    '1',
    '25666175',
    'Juan Carlos Maldonado Reynaga',
    '949071783',
    'S',
    2,
    'Prol. Luis Massaro 118',
    'Atras de Plaza vea',
    ''
  ),
  (
    '1',
    '25707522',
    'Richard Tataje Maldonado',
    '931245632',
    'M',
    4,
    'Av. Las Palmeras 12',
    'Atras de Plaza Norte',
    ''
  );

CREATE TABLE rol (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cod CHAR(1) UNIQUE,
  nombre VARCHAR(50),
  fecha_creacion TIMESTAMP DEFAULT now(),
  activo CHAR(1) DEFAULT 'S'
);

INSERT INTO
  rol (cod, nombre)
VALUES
  ('U', 'Usuario'),
  ('A', 'Admin'),
  ('S', 'SuperAdmin'),
  ('D', 'Delivery');

CREATE TABLE usuario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  documento VARCHAR(20) UNIQUE NOT NULL,
  nombres VARCHAR(255) NOT NULL,
  ape_paterno VARCHAR(255),
  ape_materno VARCHAR(255),
  telefono VARCHAR(15) UNIQUE,
  correo VARCHAR(255) UNIQUE,
  fecha_nac DATE DEFAULT '1900-01-01' NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT now(),
  clave VARCHAR(255),
  cod_rol CHAR(1),
  activo CHAR(1) DEFAULT 'S',
  FOREIGN KEY (cod_rol) REFERENCES rol(cod)
);

INSERT INTO
  usuario (
    documento,
    nombres,
    ape_paterno,
    ape_materno,
    telefono,
    correo,
    fecha_nac,
    clave,
    cod_rol
  )
VALUES
  (
    '74866419',
    'Hector Adriel',
    'Albino',
    'Tasayco',
    '955003641',
    'adrilito@gmail.com',
    '1997-11-02',
    '1234',
    'A'
  ),
  (
    '74455518',
    'Joel',
    'Maldonado',
    'Fernandez',
    '936416623',
    'joelmaldonadodev@gmail.com',
    '1999-10-11',
    '1234',
    'S'
  );

CREATE TABLE comprobante (
  id INT PRIMARY KEY AUTO_INCREMENT,
  id_reparto INT,
  tipo_comprobante INT,
  serie VARCHAR(5),
  num_serie INT,
  id_metodo_pago INT,
  num_operacion VARCHAR(255),
  foto_operacion VARCHAR(500),
  tipo_doc CHAR(1),
  documento VARCHAR(15),
  nombre VARCHAR(100),
  direc VARCHAR(255),
  correo VARCHAR(255),
  telefono VARCHAR(255),
  enlace VARCHAR(500),
  url_pdf VARCHAR(500),
  url_xml VARCHAR(500),
  url_cdr VARCHAR(500),
  id_usuario INT,
  fecha_creacion TIMESTAMP DEFAULT now(),
  activo CHAR(1) DEFAULT 'S',
  FOREIGN KEY (id_reparto) REFERENCES reparto(id),
  FOREIGN KEY (id_metodo_pago) REFERENCES metodo_pago(id),
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
  url_foto VARCHAR(500),
  total DECIMAL(10, 2),
  activo CHAR(1) DEFAULT 'S',
  FOREIGN KEY (id_cliente) REFERENCES cliente(id),
  FOREIGN KEY (id_usuario) REFERENCES usuario(id),
  FOREIGN KEY (id_repartidor) REFERENCES usuario(id)
);

CREATE TABLE item_reparto (
  id INT AUTO_INCREMENT PRIMARY KEY,
  num_guia VARCHAR(15),
  detalle VARCHAR(255),
  cant INT,
  precio DECIMAL(10, 2),
  id_reparto INT NOT NULL,
  id_tipo_paquete INT NOT NULL,
  activo CHAR(1) DEFAULT 'S',
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (id_reparto) REFERENCES reparto(id),
  FOREIGN KEY (id_tipo_paquete) REFERENCES tipo_paquete(id)
);

CREATE TABLE contador(
	id INT auto_increment primary key,
    ruc VARCHAR(11),
    serie_f CHAR(4),
    num_f INT,
    serie_b CHAR(4),
    num_b INT
);

CREATE TABLE auditoria (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tabla VARCHAR(50),
  operacion VARCHAR(50),
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

CALL getAllItemsReparto(1);

/**Resetear valores de una tabla*/
SET
  foreign_key_checks = 0;

TRUNCATE TABLE usuario;

CALL subirContador(1, 3);

ALTER TABLE
  usuario AUTO_INCREMENT = 1;

SET
  foreign_key_checks = 1;