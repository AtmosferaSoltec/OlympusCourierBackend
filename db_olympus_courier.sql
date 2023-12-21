CREATE DATABASE olympus_courier;

USE olympus_courier;

CREATE TABLE empresa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ruc CHAR(11),
  razon_social VARCHAR(100),
  ruta VARCHAR(255),
  token VARCHAR(255),
  num_reparto INT,
  serie_f CHAR(4),
  num_f INT,
  serie_b CHAR(4),
  num_b INT
);

CREATE TABLE distrito (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_ruc INT,
  nombre VARCHAR(50),
  fecha_creacion TIMESTAMP DEFAULT now(),
  activo CHAR(1) DEFAULT 'S',
  FOREIGN KEY (id_ruc) REFERENCES empresa(id)
);

CREATE TABLE metodo_pago (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_ruc INT,
  nombre VARCHAR(50),
  fecha_creacion TIMESTAMP DEFAULT now(),
  activo CHAR(1) DEFAULT 'S',
  FOREIGN KEY (id_ruc) REFERENCES empresa(id)
);

CREATE TABLE tipo_paquete (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_ruc INT,
  nombre VARCHAR(50),
  fecha_creacion TIMESTAMP DEFAULT now(),
  activo CHAR(1) DEFAULT 'S',
  FOREIGN KEY (id_ruc) REFERENCES empresa(id)
);

CREATE TABLE tipo_doc (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cod CHAR(1) UNIQUE,
  detalle VARCHAR(255),
  cant_caracteres INT,
  fecha_creacion TIMESTAMP DEFAULT now(),
  activo CHAR(1) DEFAULT 'S'
);

CREATE TABLE rol (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cod CHAR(1) UNIQUE,
  nombre VARCHAR(50)
);

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

CREATE TABLE usuario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_ruc INT,
  documento VARCHAR(20) UNIQUE NOT NULL,
  nombres VARCHAR(255) NOT NULL,
  ape_paterno VARCHAR(255),
  ape_materno VARCHAR(255),
  telefono VARCHAR(15) UNIQUE,
  correo VARCHAR(255) UNIQUE,
  fecha_nac DATE,
  fecha_creacion TIMESTAMP DEFAULT now(),
  clave VARCHAR(255),
  cod_rol CHAR(1),
  activo CHAR(1) DEFAULT 'S',
  FOREIGN KEY (id_ruc) REFERENCES empresa(id),
  FOREIGN KEY (cod_rol) REFERENCES rol(cod)
);

CREATE TABLE reparto (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_ruc INT,
  num_reparto INT,
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
  id_comprobante INT,
  FOREIGN KEY (id_cliente) REFERENCES cliente(id),
  FOREIGN KEY (id_usuario) REFERENCES usuario(id),
  FOREIGN KEY (id_repartidor) REFERENCES usuario(id),
  FOREIGN KEY (id_ruc) REFERENCES empresa(id),
  FOREIGN KEY (id_comprobante) REFERENCES comprobante(id)
);

INSERT INTO
  reparto (
    id_ruc,
    anotacion,
    clave,
    id_cliente,
    id_usuario,
    total
  )
VALUES
  (
    1,
    'Cliente quiere que vayan a las 12pm',
    '1234',
    3,
    1,
    30
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

CREATE TABLE comprobante (
  id INT PRIMARY KEY AUTO_INCREMENT,
  id_ruc INT,
  tipo_comprobante INT,
  serie VARCHAR(5),
  num_serie INT,
  id_metodo_pago INT,
  num_operacion VARCHAR(255),
  tipo_doc CHAR(1),
  documento VARCHAR(15),
  nombre VARCHAR(100),
  direc VARCHAR(255),
  correo VARCHAR(255),
  telefono VARCHAR(255),
  id_usuario INT,
  fecha_creacion TIMESTAMP DEFAULT now(),
  activo CHAR(1) DEFAULT 'S',
  FOREIGN KEY (id_metodo_pago) REFERENCES metodo_pago(id),
  FOREIGN KEY (id_usuario) REFERENCES usuario(id),
  FOREIGN KEY (id_ruc) REFERENCES empresa(id)
);

CREATE TABLE auditoria (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_ruc INT,
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
  FOREIGN KEY (id_user) REFERENCES usuario(id),
  FOREIGN KEY (id_ruc) REFERENCES empresa(id)
);

INSERT INTO
  rol (cod, nombre)
VALUES
  ('S', 'SuperAdmin'),
  ('U', 'Usuario'),
  ('A', 'Admin'),
  ('D', 'Delivery');

SHOW TRIGGERS;

DROP TRIGGER insert_num_reparto;

/** Trigers**/
-- Crear un trigger después de insertar en una tabla
DELIMITER / / CREATE TRIGGER insert_num_reparto
AFTER
INSERT
  ON reparto FOR EACH ROW BEGIN -- Obtener el num_reparto actual de la tabla empresa usando el ruc del nuevo reparto
SET
  @num_reparto_empresa = (
    SELECT
      num_reparto
    FROM
      empresa
    WHERE
      id = NEW.id_ruc
    LIMIT
      1
  );

-- Incrementar el num_reparto
SET
  @nuevo_num_reparto = @num_reparto_empresa + 1;

-- Actualizar el nuevo num_reparto en la tabla empresa
UPDATE
  empresa
SET
  num_reparto = @nuevo_num_reparto
WHERE
  id = NEW.id_ruc;

-- Actualizar el nuevo num_reparto en el nuevo registro de la tabla reparto
UPDATE
  reparto
SET
  num_reparto = @nuevo_num_reparto
WHERE
  id = NEW.id;

END;

/ / DELIMITER;

/**Resetear valores de una tabla*/
SET
  foreign_key_checks = 0;

TRUNCATE TABLE usuario;

CALL subirContador(1, 3);

ALTER TABLE
  usuario AUTO_INCREMENT = 1;

SET
  foreign_key_checks = 1;