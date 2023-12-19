import { Request, Response } from 'express';
import { getDistritoById } from '../func/funciones';
import { tbCliente, tbDistrito, tbEmpresa } from '../func/tablas';
import { pool } from '../db';

const getAllClientes = async (req: Request, res: Response) => {
    try {

        const { estado, num_reparto, cliente } = req.query;

        console.log(estado, );
        

        let query = `SELECT ${tbCliente}.*, ${tbDistrito}.nombre as distrito FROM ${tbCliente} LEFT JOIN ${tbDistrito} ON ${tbCliente}.id_distrito = ${tbDistrito}.id`
        let params: any[] = [];
        let hasWhere = false;

        if (estado === 'S' || estado === 'N') {
            if (hasWhere) {
                query += ` AND ${tbCliente}.activo = ?`;
            } else {
                query += ` WHERE ${tbCliente}.activo = ?`;
                hasWhere = true;
            }
            params.push(estado);
        }

        const [call]: any[] = await pool.query(query, params);
        res.json({
            isSuccess: true,
            data: call
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

        //Verificar si existe el cliente
        const [call]: any[] = await pool.query(`SELECT * FROM ${tbCliente} WHERE id = ?`, [id]);
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
            id_distrito: call[0].id_distrito,
            distrito: await getDistritoById(call[0].id_distrito),
            direc: call[0].direc,
            referencia: call[0].referencia,
            url_maps: call[0].url_maps
        };

        res.json({
            isSuccess: true,
            data: calMap
        });
    } catch (error: any) {
        res.json({
            isSuccess: false,
            mensaje: error.message
        });
    }
}

const searchCliente = async (req: Request, res: Response) => {
    try {
        const { datos } = req.params;
        const query = `SELECT * FROM ${tbCliente} WHERE documento LIKE ? OR nombres LIKE ? OR telefono LIKE ? LIMIT 5`;
        const [rows]: any[] = await pool.query(query, [`%${datos}%`, `%${datos}%`, `%${datos}%`]);

        const calMap = await Promise.all(
            rows.map(async (cliente: any) => ({
                id: cliente.id,
                cod_tipo_doc: cliente.tipo_doc,
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
        const { cod_tipodoc, documento, nombres, telefono, correo, genero, id_distrito, direc, referencia, url_maps } = req.body;

        if (!documento || !cod_tipodoc || !nombres || !id_distrito) {
            return res.json({
                isSuccess: false,
                mensaje: 'Faltan parámetros obligatorios'
            });
        }

        //
        if (cod_tipodoc !== '6' && cod_tipodoc !== '1') {
            return res.json({
                isSuccess: false,
                mensaje: 'El codTipoDoc debe ser 1, 6, 4, 7 o -'
            });
        }

        //Validar el codTipoDoc si es correcto, si es RUC o DNI
        if (cod_tipodoc == '6' && documento.length !== 11) {
            return res.json({
                isSuccess: false,
                mensaje: 'El RUC debe tener 11 dígitos'
            });
        }
        if (cod_tipodoc == '1' && documento.length !== 8) {
            return res.json({
                isSuccess: false,
                mensaje: 'El DNI debe tener 8 dígitos'
            });
        }


        //Verificar si documento ya existe
        const [verificarDocumento]: any[] = await pool.query(`SELECT COUNT(*) AS count FROM ${tbCliente} WHERE documento = ?`, [documento]);
        if (verificarDocumento[0].count > 0) {
            return res.json({
                isSuccess: false,
                mensaje: `El documento ${documento} ya existe`
            });
        }

        //Verificar si telefono ya existe
        const [verificarTelefono]: any[] = await pool.query(`SELECT COUNT(*) AS count FROM ${tbCliente} WHERE telefono = ?`, [telefono]);
        if (verificarTelefono[0].count > 0) {
            return res.json({
                isSuccess: false,
                mensaje: `El telefono ${telefono} ya existe`
            });
        }

        //Verificar si existe el distrito
        const [verificarDistrito]: any[] = await pool.query(`SELECT COUNT(*) AS count FROM ${tbDistrito} WHERE id = ?`, [id_distrito]);
        if (verificarDistrito[0].count === 0) {
            return res.json({
                isSuccess: false,
                mensaje: `No existe el distrito con el ID: ${id_distrito}`
            });
        }

        const query = `INSERT INTO ${tbCliente} (cod_tipodoc,documento,nombres,telefono,correo,genero,id_distrito,direc,referencia,url_maps) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const [result]: any[] = await pool.query(query, [cod_tipodoc, documento, nombres, telefono, correo, genero, id_distrito, direc, referencia, url_maps]);

        //Verificar si se insertó correctamente y devolver el id insertado
        if (result.affectedRows === 1) {
            res.json({
                isSuccess: true,
                mensaje: 'Cliente insertado correctamente',
                data: result.insertId
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

        //Verificar si existe el cliente
        const [verificarCliente]: any[] = await pool.query(`SELECT COUNT(*) AS count FROM ${tbCliente} WHERE id = ?`, [id]);
        if (verificarCliente[0].count === 0) {
            return res.json({
                isSuccess: false,
                mensaje: `No existe el cliente con el ID: ${id}`
            });
        }

        //Verificar si documento ya existe
        const [verificarDocumento]: any[] = await pool.query(`SELECT COUNT(*) AS count FROM ${tbCliente} WHERE documento = ?`, [documento]);
        if (verificarDocumento[0].count > 1) {
            return res.json({
                isSuccess: false,
                mensaje: `El documento ${documento} ya existe`
            });
        }

        //Verificar si telefono ya existe
        const [verificarTelefono]: any[] = await pool.query(`SELECT COUNT(*) AS count FROM ${tbCliente} WHERE telefono = ?`, [telefono]);
        if (verificarTelefono[0].count > 1) {
            return res.json({
                isSuccess: false,
                mensaje: `El telefono ${telefono} ya existe`
            });
        }

        //Validar el codTipoDoc si es correcto, si es RUC o DNI
        if (cod_tipodoc == '6' && documento.length !== 11) {
            return res.json({
                isSuccess: false,
                mensaje: 'El RUC debe tener 11 dígitos'
            });
        }
        if (cod_tipodoc == '1' && documento.length !== 8) {
            return res.json({
                isSuccess: false,
                mensaje: 'El DNI debe tener 8 dígitos'
            });
        }
        if (cod_tipodoc == '4' && documento.length !== 12) {
            return res.json({
                isSuccess: false,
                mensaje: 'El CARNET DE EXTRANJERÍA debe tener 12 dígitos'
            });
        }
        if (cod_tipodoc == '7' && documento.length !== 12) {
            return res.json({
                isSuccess: false,
                mensaje: 'El PASAPORTE debe tener 12 dígitos'
            });
        }

        //Actualizar
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
    try {
        const { id, activo } = req.body;

        if (!activo) {
            return res.json({
                isSuccess: false,
                mensaje: 'Se requiere del activo'
            })
        }

        //Verificar si existe el cliente
        const [verificarCliente]: any[] = await pool.query(`SELECT COUNT(*) AS count FROM ${tbCliente} WHERE id = ?`, [id]);
        if (verificarCliente[0].count === 0) {
            return res.json({
                isSuccess: false,
                mensaje: `No existe el cliente con el ID: ${id}`
            });
        }

        const [updateResult]: any[] = await pool.query(`UPDATE ${tbCliente} SET activo = ? WHERE id = ?`, [activo, id]);

        if (updateResult.affectedRows === 1) {
            res.json({
                isSuccess: true,
                mensaje: 'Cliente actualizado'
            });
        } else {
            res.json({
                isSuccess: false,
                mensaje: 'No se pudo actualizar cliente'
            });
        };

    } catch (error: any) {
        return res.json({
            isSuccess: false,
            mensaje: error.message
        });
    }
}

export default { getAllClientes, getCliente, searchCliente, insertCliente, updateCliente, setActivoCliente }