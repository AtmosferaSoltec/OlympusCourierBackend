import { Request, Response } from 'express';
import connectToDatabase from '../mysql';

const getAllClientes = async (req: Request, res: Response) => {
    try {
        const connection = await connectToDatabase();
        const query = 'SELECT * FROM clientes';
        const [destinos] = await connection.query(query);
        res.json(destinos);
    } catch (error) {
        console.error('Error al recuperar datos de la tabla Clientes:', error);
        res.status(500).json({ error: 'Ocurrió un error al obtener los datos de la tabla Clientes' });
    }
};

const getCliente = async (req: Request, res: Response) => {
    try {
        const db = await connectToDatabase();
        const query = 'SELECT * FROM clientes WHERE id = ? LIMIT 1';
        const resultado: any = await db.query(query, [req.params.id]);

        if (resultado.length === 1) {
            res.json(resultado[0]);
        } else if (resultado.length === 0) {
            res.status(404).json({ error: 'Cliente no encontrado' });
        } else {
            res.status(500).json({ error: 'Error inesperado al obtener el cliente' });
        }
    } catch (error) {
        console.error('Error al recuperar datos de la tabla Clientes:', error);
        res.status(500).json({ error: 'Ocurrió un error al obtener los datos de la tabla Clientes' });
    }
}

const searchCliente = async (req: Request, res: Response) => {
    try {
        const db = await connectToDatabase();
        const datos = req.params.datos;
        const query = 'SELECT * FROM clientes WHERE documento LIKE ? OR nombres LIKE ? OR telefono LIKE ?';
        const rows = await db.query(query, [`%${datos}%`, `%${datos}%`, `%${datos}%`]);
        res.json(rows);
    } catch (error) {
        console.error('Error al buscar clientes:', error);
        res.status(500).json({ error: 'Error al buscar clientes en la base de datos' });
    }
};

const insertCliente = async (req: Request, res: Response) => {
    try {
        const db = await connectToDatabase();
        const { tipo_doc, documento, nombres, telefono, correo, genero, distrito_id, direc, referencia, url_maps } = req.body;
        const result: any = await db.query('INSERT INTO clientes (tipo_doc, documento, nombres, telefono, correo, genero, distrito_id, direc, referencia, url_maps) VALUES (?,?,?,?,?,?,?,?,?,?)', [tipo_doc, documento, nombres, telefono, correo, genero, distrito_id, direc, referencia, url_maps]);

        if (result.affectedRows === 1) {
            res.json({ mensaje: 'Cliente insertado correctamente' });
        } else {
            res.status(500).json({ error: 'No se pudo insertar' });
        }
    } catch (error) {
        console.error('Error al insertar un cliente:', error);
        res.status(500).json({ error: 'Ocurrió un error al insertar el cliente' });
    }
};

const updateCliente = async (req: Request, res: Response) => {
    try {
        const db = await connectToDatabase();
        const destinoId = req.params.id;
        const { tipo_doc, documento, nombres, telefono, correo, genero, distrito_id, direc, referencia } = req.body;

        const query = 'UPDATE clientes SET tipo_doc = ?, documento = ?, nombres = ?, telefono = ?, correo = ?, genero = ?, distrito_id = ?, direc = ?, referencia = ? WHERE id = ?';

        const result: any = await db.query(query, [tipo_doc, documento, nombres, telefono, correo, genero, distrito_id, direc, referencia, destinoId]);

        if (result.affectedRows === 1) {
            res.json({ mensaje: 'Cliente actualizado correctamente' });
        } else {
            res.status(500).json({ error: 'No se pudo actualizar' });
        }
    } catch (error) {
        console.error('Error al actualizar un destino:', error);
        res.status(500).json({ error: 'Ocurrió un error al actualizar el cliente' });
    }
};

const deleteCliente = async (req: Request, res: Response) => {
    const db = await connectToDatabase();
    const id = req.params.id;

    const rows: any = await db.query('SELECT * FROM clientes WHERE id = ?', [id]);

    if (rows.length === 0) {
        res.status(404).json({ error: `El registro con ID ${id} no existe` });
        return;
    }

    const result: any = await db.query('DELETE FROM clientes WHERE id = ?', [id]);

    if (result.affectedRows === 1) {
        res.json({ mensaje: 'Cliente eliminado correctamente' });
    } else {
        res.status(500).json({ error: 'No se pudo actualizar' });
    }
}

export default { getAllClientes, getCliente, searchCliente, insertCliente, updateCliente, deleteCliente }