"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = __importDefault(require("../mysql"));
const getAllClientes = async (req, res) => {
    try {
        const connection = await (0, mysql_1.default)();
        const query = 'SELECT * FROM clientes';
        const [destinos] = await connection.query(query);
        res.json(destinos);
    }
    catch (error) {
        console.error('Error al recuperar datos de la tabla Clientes:', error);
        res.status(500).json({ error: 'Ocurrió un error al obtener los datos de la tabla Clientes' });
    }
};
const getCliente = async (req, res) => {
    try {
        const db = await (0, mysql_1.default)();
        const query = 'SELECT * FROM clientes WHERE id = ? LIMIT 1';
        const resultado = await db.query(query, [req.params.id]);
        if (resultado.length === 1) {
            res.json(resultado[0]);
        }
        else if (resultado.length === 0) {
            res.status(404).json({ error: 'Cliente no encontrado' });
        }
        else {
            res.status(500).json({ error: 'Error inesperado al obtener el cliente' });
        }
    }
    catch (error) {
        console.error('Error al recuperar datos de la tabla Clientes:', error);
        res.status(500).json({ error: 'Ocurrió un error al obtener los datos de la tabla Clientes' });
    }
};
const searchCliente = async (req, res) => {
    try {
        const db = await (0, mysql_1.default)();
        const datos = req.params.datos;
        const query = 'SELECT * FROM clientes WHERE documento LIKE ? OR nombres LIKE ? OR telefono LIKE ?';
        const rows = await db.query(query, [`%${datos}%`, `%${datos}%`, `%${datos}%`]);
        res.json(rows);
    }
    catch (error) {
        console.error('Error al buscar clientes:', error);
        res.status(500).json({ error: 'Error al buscar clientes en la base de datos' });
    }
};
const insertCliente = async (req, res) => {
    try {
        const db = await (0, mysql_1.default)();
        const { tipo_doc, documento, nombres, telefono, correo, genero, distrito_id, direc, referencia, url_maps } = req.body;
        const result = await db.query('INSERT INTO clientes (tipo_doc, documento, nombres, telefono, correo, genero, distrito_id, direc, referencia, url_maps) VALUES (?,?,?,?,?,?,?,?,?,?)', [tipo_doc, documento, nombres, telefono, correo, genero, distrito_id, direc, referencia, url_maps]);
        if (result.affectedRows === 1) {
            res.json({ mensaje: 'Cliente insertado correctamente' });
        }
        else {
            res.status(500).json({ error: 'No se pudo insertar' });
        }
    }
    catch (error) {
        console.error('Error al insertar un cliente:', error);
        res.status(500).json({ error: 'Ocurrió un error al insertar el cliente' });
    }
};
const updateCliente = async (req, res) => {
    try {
        const db = await (0, mysql_1.default)();
        const destinoId = req.params.id;
        const { tipo_doc, documento, nombres, telefono, correo, genero, distrito_id, direc, referencia } = req.body;
        const query = 'UPDATE clientes SET tipo_doc = ?, documento = ?, nombres = ?, telefono = ?, correo = ?, genero = ?, distrito_id = ?, direc = ?, referencia = ? WHERE id = ?';
        const result = await db.query(query, [tipo_doc, documento, nombres, telefono, correo, genero, distrito_id, direc, referencia, destinoId]);
        if (result.affectedRows === 1) {
            res.json({ mensaje: 'Cliente actualizado correctamente' });
        }
        else {
            res.status(500).json({ error: 'No se pudo actualizar' });
        }
    }
    catch (error) {
        console.error('Error al actualizar un destino:', error);
        res.status(500).json({ error: 'Ocurrió un error al actualizar el cliente' });
    }
};
const deleteCliente = async (req, res) => {
    const db = await (0, mysql_1.default)();
    const id = req.params.id;
    const rows = await db.query('SELECT * FROM clientes WHERE id = ?', [id]);
    if (rows.length === 0) {
        res.status(404).json({ error: `El registro con ID ${id} no existe` });
        return;
    }
    const result = await db.query('DELETE FROM clientes WHERE id = ?', [id]);
    if (result.affectedRows === 1) {
        res.json({ mensaje: 'Cliente eliminado correctamente' });
    }
    else {
        res.status(500).json({ error: 'No se pudo actualizar' });
    }
};
exports.default = { getAllClientes, getCliente, searchCliente, insertCliente, updateCliente, deleteCliente };
