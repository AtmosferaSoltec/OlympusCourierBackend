import { Request, Response } from 'express';
import connect from '../mysql';
import { getDistritoById } from '../func/funciones';
import { tbCliente } from '../func/tablas';

const getAllClientes = async (req: Request, res: Response) => {
    try {
        const db = await connect();
        const query = `SELECT * FROM ${tbCliente}`;
        const [call]: any[] = await db.query(query);

        const calMap = await Promise.all(
            call.map(async (cliente: any) => ({
                id: cliente.id,
                tipo_doc: cliente.tipo_doc,
                documento: cliente.documento,
                nombres: cliente.nombres,
                telefono: cliente.telefono,
                correo: cliente.correo,
                genero: cliente.genero,
                distrito_id: cliente.distrito_id,
                distrito: await getDistritoById(cliente.distrito_id),
                direc: cliente.direc,
                referencia: cliente.referencia,
                url_maps: cliente.url_maps
            }))
        );

        res.json({
            isSuccess: true,
            data: calMap
        });
    } catch (error) {
        res.json({
            isSuccess: false,
            mensaje: error,
        });
    }
};

const getCliente = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const db = await connect();
        const query = `SELECT * FROM ${tbCliente} WHERE id = ? LIMIT 1`;
        const [call]: any[] = await db.query(query, [id]);
        if (call.length === 0) {
            return res.status(404).json({
                isSuccess: false,
                mensaje: `No se encontró el ID: ${id}`
            });
        }

        const calMap = {
            id: call[0].id,
            tipo_doc: call[0].tipo_doc,
            documento: call[0].documento,
            nombres: call[0].nombres,
            telefono: call[0].telefono,
            correo: call[0].correo,
            genero: call[0].genero,
            distrito_id: call[0].distrito_id,
            distrito: await getDistritoById(call[0].distrito_id),
            direc: call[0].direc,
            referencia: call[0].referencia,
            url_maps: call[0].url_maps
        };

        res.json({
            isSuccess: true,
            data: calMap
        });
    } catch (error) {
        res.json({
            isSuccess: false,
            mensaje: error,
        });
    }
}

const searchCliente = async (req: Request, res: Response) => {
    try {
        const db = await connect();
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
        const db = await connect();
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
        const db = await connect();
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
    const db = await connect();
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