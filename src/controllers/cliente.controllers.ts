import { Request, Response } from 'express';
import { getDistritoById } from '../func/funciones';
import { tbCliente, tbDistrito } from '../func/tablas';
import { pool } from '../db';

const getAllClientes = async (req: Request, res: Response) => {
    try {
        const query = `SELECT * FROM ${tbCliente}`;
        const [call]: any[] = await pool.query(query);

        const calMap = await Promise.all(
            call.map(async (cliente: any) => ({
                id: cliente.id,
                tipo_doc: cliente.tipo_doc,
                documento: cliente.documento,
                nombres: cliente.nombres,
                telefono: cliente.telefono,
                correo: cliente.correo,
                genero: cliente.genero,
                id_distrito: cliente.id_distrito,
                distrito: await getDistritoById(cliente.id_distrito),
                direc: cliente.direc,
                referencia: cliente.referencia,
                url_maps: cliente.url_maps
            }))
        );

        res.json({
            isSuccess: true,
            data: calMap
        });
    } catch (error: any) {
        res.json({
            isSuccess: false,
            mensaje: error.message,
        });
    }
};

const getCliente = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const [call]: any[] = await pool.query(`SELECT * FROM ${tbCliente} WHERE id = ? LIMIT 1`, [id]);
        if (call.length === 0) {
            return res.json({
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
        const datos = req.params.datos;
        const query = `SELECT * FROM ${tbCliente} WHERE documento LIKE ? OR nombres LIKE ? OR telefono LIKE ? LIMIT 5`;
        const [rows]: any[] = await pool.query(query, [`%${datos}%`, `%${datos}%`, `%${datos}%`]);

        const calMap = await Promise.all(
            rows.map(async (cliente: any) => ({
                id: cliente.id,
                tipo_doc: cliente.tipo_doc,
                documento: cliente.documento,
                nombres: cliente.nombres,
                telefono: cliente.telefono,
                correo: cliente.correo,
                genero: cliente.genero,
                id_distrito: cliente.id_distrito,
                distrito: await getDistritoById(cliente.id_distrito),
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
            mensaje: 'Error al buscar clientes en la base de datos'
        });
    }
};

const insertCliente = async (req: Request, res: Response) => {
    try {
        let {
            tipo_doc,
            documento,
            nombres,
            telefono,
            correo,
            genero,
            id_distrito,
            direc,
            referencia,
            url_maps
        } = req.body;

        if (!tipo_doc || !documento || !nombres || !id_distrito) {
            return res.json({
                isSuccess: false,
                mensaje: 'Faltan parámetros obligatorios'
            });
        }
        const [resultDistrito]: any[] = await pool.query(`SELECT id FROM ${tbDistrito} WHERE ID = ?`, [id_distrito])
        if (resultDistrito.length === 0) {
            return res.json({
                isSuccess: false,
                mensaje: `No existe el distrito con el ID: ${id_distrito}`
            });
        }

        telefono = telefono || ''
        correo = correo || ''
        genero = genero || 'S'
        direc = direc || '';
        referencia = referencia || '';
        url_maps = url_maps || '';

        const query = `INSERT INTO ${tbCliente} (cod_tipodoc,documento,nombres,telefono,correo,genero,id_distrito,direc,referencia,url_maps) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const [result]: any[] = await pool.query(query, [tipo_doc, documento, nombres, telefono, correo, genero, id_distrito, direc, referencia, url_maps]);

        if (result.affectedRows === 1) {
            res.json({
                isSuccess: true,
                mensaje: 'Cliente insertado correctamente'
            });
        } else {
            res.json({
                isSuccess: false,
                mensaje: 'No se pudo insertar el cliente'
            });
        }
    } catch (err: any) {
        res.json({
            isSuccess: false,
            mensaje: err.message
        });
    }
}

const updateCliente = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { cod_tipodoc, documento, nombres, telefono, correo, genero, id_distrito, direc, referencia, url_maps } = req.body;


        //TODO Validar que el codtipo R sea pára ruc y D Para DNI

        const query = `UPDATE ${tbCliente} SET cod_tipodoc = ?, documento = ?, nombres = ?, telefono = ?, correo = ?, genero = ?, id_distrito = ?, direc = ?, referencia = ?, url_maps = ? WHERE id = ?`;

        const [result]: any[] = await pool.query(query, [cod_tipodoc, documento, nombres, telefono, correo, genero, id_distrito, direc, referencia, url_maps, id]);


        if (result.affectedRows === 1) {
            res.json({
                isSuccess: true,
                mensaje: 'Cliente actualizado correctamente'
            });
        } else {
            res.json({
                isSuccess: false,
                mensaje: 'No se pudo actualizar'
            });
        }
    } catch (error: any) {
        res.json({
            isSuccess: false,
            mensaje: error.message,
        });
    }
};

const setActivoCliente = async (req: Request, res: Response) => {
    const id = req.params.id;
    const { activo } = req.body;

    if (!activo) {
        return res.json({
            isSuccess: false,
            mensaje: 'Se requiere del activo'
        })
    }
    const [rows]: any[] = await pool.query(`SELECT * FROM ${tbCliente} WHERE id = ?`, [id]);

    if (rows.length === 0) {
        return res.json({
            isSuccess: false,
            mensaje: `El ID: ${id} no existe`
        });
    }

    const [updateResult]: any[] = await pool.query(`UPDATE ${tbCliente} SET activo = ? WHERE id = ?`, [activo, id]);

    if (updateResult.affectedRows === 1) {
        res.json({
            isSuccess: true,
            mensaje: 'Distrito marcado como inactivo'
        });
    } else {
        res.json({
            isSuccess: false,
            mensaje: 'No se pudo marcar al distrito como inactivo.'
        });
    };
}

export default { getAllClientes, getCliente, searchCliente, insertCliente, updateCliente, setActivoCliente }