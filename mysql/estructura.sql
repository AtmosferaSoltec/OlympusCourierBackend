

CREATE TABLE comprobantes (
	id INT PRIMARY KEY AUTO_INCREMENT,
    idReparto INT,
    tipoComprobante INT,
    idTipoDoc INT,
    documento VARCHAR(15),
    nombre VARCHAR(255),
    direc VARCHAR(255),
    correo VARCHAR(255)
);

CREATE TABLE item_comprobante (
    id INT PRIMARY KEY,
    num_guia VARCHAR(20),
    detalle VARCHAR(255),
    cant INT,
    precio DECIMAL(10, 2),
    id_reparto INT,
    id_tipo_paquete INT,
    FOREIGN KEY (id_reparto) REFERENCES comprobantes (idReparto)
);