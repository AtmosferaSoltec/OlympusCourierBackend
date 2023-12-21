import { getClienteById, getComprobanteById, getItemsRepartoByRepartoId, getUsuarioById } from '../func/funciones';
import { Request, Response } from 'express';
import { pool } from '../db';
import { tbCliente, tbComprobante, tbEmpresa, tbItemReparto, tbReparto, tbTipoPaquete, tbUsuario } from '../func/tablas';

const getAllRepartos = async (req: Request, res: Response) => {
    try {

        const { id_ruc } = req.body.user;

        const { estado, estado_envio, num_reparto, cliente, desde, hasta } = req.query;        

        //Traemos todos los repartos y el nombre del cliente para poder hacer un filtrado
        let query = `SELECT tr.*, tc.nombres FROM ${tbReparto} tr LEFT JOIN ${tbCliente} tc ON tr.id_cliente = tc.id WHERE tr.id_ruc = ?`
        let params: any[] = [id_ruc];

        if (estado === 'S' || estado === 'N') {
            query += ` AND tr.activo = ?`;
            params.push(estado);
        }

        if (estado_envio === 'E' || estado_envio === 'A' || estado_envio === 'P') {
            query += ` AND tr.estado = ?`;
            params.push(estado_envio);
        }

        if (num_reparto) {
            query += ` AND tr.num_reparto = ?`;
            params.push(num_reparto);
        }

        if (cliente) {
            query += ` AND tc.nombres LIKE ?`;
            params.push(`%${cliente}%`);
        }

        if (desde && hasta) {
            query += ` AND DATE(tr.fecha_creacion) BETWEEN ? AND ?`;
            params.push(desde, hasta);
        }

        // Ordenar por fecha de creación
        query += ` ORDER BY tr.fecha_creacion DESC`;

        //Maximo 50 repartos
        query += ` LIMIT 50`;

        const [repartos]: any[] = await pool.query(query, params);
        const repartosConItems = await Promise.all(
            repartos.map(async (reparto: any) => {
                return {
                    ...reparto,
                    cliente: await getClienteById(reparto.id_cliente),
                    usuario: await getUsuarioById(reparto.id_usuario),
                    repartidor: await getUsuarioById(reparto.id_repartidor),
                    comprobante: await getComprobanteById(reparto.id_comprobante),
                    total: parseFloat(reparto.total),
                    items: await getItemsRepartoByRepartoId(reparto.id)
                };
            })
        );
        return res.json({
            isSuccess: true,
            data: repartosConItems
        });
    } catch (err) {
        return res.json({
            isSuccess: false,
            mensaje: err
        });
    }
};

const getReparto = async (req: Request, res: Response) => {

    try {
        const id_reparto = req.params.id;
        const { id_ruc } = req.body.user;

        // Verificar si se proporcionó el id_ruc y el id_reparto
        if (!id_reparto) {
            res.json({
                isSuccess: false,
                mensaje: 'Se requiere del id_reparto'
            });
            return;
        }

        let query = `SELECT * FROM ${tbReparto} WHERE id_ruc = ? AND id = ? LIMIT 1`;
        const [reparto]: any[] = await pool.query(query, [id_ruc, id_reparto]);

        if (reparto.length === 0) {
            return res.json({
                isSuccess: true,
                data: []
            });
        }

        const repartoConItems = {
            ...reparto[0],
            cliente: await getClienteById(reparto[0].id_cliente),
            usuario: await getUsuarioById(reparto[0].id_usuario),
            repartidor: await getUsuarioById(reparto[0].id_repartidor),
            total: parseFloat(reparto[0].total),
            items: await getItemsRepartoByRepartoId(reparto[0].id)
        };
        res.json({
            isSuccess: true,
            data: repartoConItems
        });
    } catch (err: any) {
        res.json({
            isSuccess: false,
            mensaje: err.message
        });
    }
};

const insertReparto = async (req: Request, res: Response) => {
    try {
        const { id_ruc, id } = req.body.user;
        const { anotacion, clave, id_cliente, items } = req.body;

        //Verificar si todos los campos fueron proporcionados
        if (!id_cliente || !items) {
            return res.json({
                isSuccess: false,
                mensaje: 'Faltan campos requeridos, por favor verifique.'
            });
        }

        if(!clave){
            return res.json({
                isSuccess: false,
                mensaje: 'Falta la clave'
            });
        }

        //Verificar si el cliente existe
        const [clienteRows]: any[] = await pool.query(`SELECT COUNT(*) AS count FROM ${tbCliente} WHERE id = ?`, [id_cliente]);
        if (clienteRows[0].count === 0) {
            return res.json({
                isSuccess: false,
                mensaje: `El cliente con ID: ${id_cliente} no existe`
            });
        }

        //Verificar si los items son una lista de objetos
        if (!Array.isArray(items) || items.some(item => typeof item !== 'object')) {
            return res.json({
                isSuccess: false,
                mensaje: 'El campo "items" debe ser una lista de objetos.'
            });
        }

        if (items.length === 0) {
            return res.json({
                isSuccess: false,
                mensaje: 'No se puede ingresar sin items'
            });
        }

        let total = 0;
        items.forEach((item: any) => {
            if (item.precio) {
                total += item.precio;
            }
        });

        // Obtener el num_reparto actual de la tabla empresa usando el ruc
        const [empresasRows]: any[] = await pool.query(`SELECT num_reparto FROM ${tbEmpresa} WHERE id = ? LIMIT 1`, [id_ruc]);
        const num_reparto_empresa = empresasRows[0].num_reparto;

        const nuevo_num_reparto = num_reparto_empresa + 1;

        const repartoQuery = `INSERT INTO ${tbReparto} (id_ruc, num_reparto, anotacion, clave, id_cliente, id_usuario, total) VALUES (?,?,?,?,?,?,?)`;
        const [repartoResult]: any[] = await pool.query(repartoQuery, [id_ruc, nuevo_num_reparto, anotacion, clave, id_cliente, id, total]);

        if (repartoResult.affectedRows !== 1) {
            return res.json({
                isSuccess: false,
                mensaje: 'No se pudo insertar'
            });
        }

        //Verificamos si el correlativo de la empresa se actualiza correctamente
        const [correlativo]: any[] = await pool.query(`UPDATE ${tbEmpresa} SET num_reparto = ? WHERE id = ?`, [nuevo_num_reparto, id_ruc]);
        if (correlativo.affectedRows !== 1) {
            return res.json({
                isSuccess: false,
                mensaje: 'No se pudo actualizar el correlativo'
            });
        }

        for (const item of items) {
            const { num_guia, detalle, cant, precio, id_tipo_paquete } = item;

            // Verificar si el tipo de paquete existe
            const [tipoPaqueteRows]: any[] = await pool.query(`SELECT COUNT(*) AS count FROM ${tbTipoPaquete} WHERE id = ?`, [id_tipo_paquete]);
            if (tipoPaqueteRows[0].count === 0) {
                return res.json({
                    isSuccess: false,
                    mensaje: `El tipo de paquete con ID: ${id_tipo_paquete} no existe`
                });
            }

            const itemQuery = `INSERT INTO ${tbItemReparto} (num_guia, detalle, cant, precio, id_reparto, id_tipo_paquete) VALUES (?,?,?,?,?,?)`;
            const [itemResult]: any[] = await pool.query(itemQuery, [num_guia, detalle, cant, precio, repartoResult.insertId, id_tipo_paquete]);

            if (itemResult.affectedRows === 0) {
                return res.json({
                    isSuccess: false,
                    mensaje: 'No se pudo insertar'
                });
            }
        }

        return res.json({
            isSuccess: true,
            mensaje: 'Insertado correctamente'
        });

    } catch (err: any) {
        return res.json({
            isSuccess: false,
            mensaje: err.message
        });
    }
};

const setActivoReparto = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const { activo } = req.body;

        if (!activo) {
            return res.json({
                isSuccess: false,
                mensaje: 'Se requiere del activo'
            })
        }

        if (isNaN(Number(id))) {
            return res.json({
                isSuccess: false,
                mensaje: 'El ID proporcionado no es numérico'
            });
        }

        // Verificar la existencia del reparto
        const [repartoRows]: any[] = await pool.query(`SELECT * FROM ${tbReparto} WHERE id = ?`, [id]);
        if (repartoRows.length === 0) {
            return res.json({
                isSuccess: false,
                mensaje: `El ID: ${id} no existe`
            });
        }

        // Eliminar los items relacionados al reparto
        const [updateResult]: any[] = await pool.query(`UPDATE ${tbReparto} SET activo = ? WHERE id = ?`, [activo, id]);
        if (updateResult.affectedRows === 1) {
           return res.json({
                isSuccess: true,
                mensaje: 'Activo actualizado'
            });
        } else {
            return res.json({
                isSuccess: false,
                mensaje: 'No se pudo actualizar el activo'
            });
        };
    } catch (err:any) {
        return res.json({
            isSuccess: false,
            mensaje: err.message
        });
    }
};

const darConformidad = async (req: Request, res: Response) => {
    try {
        const { id_reparto, id_usuario, url_foto } = req.body;

        // Obtener la fecha actual en formato YYYY-MM-DD HH:mm:ss
        const fechaActual = new Date().toISOString().slice(0, 19).replace('T', ' ');

        const query = `UPDATE ${tbReparto} SET estado = ?, fecha_entrega = ?, id_repartidor = ?, url_foto = ? WHERE id = ?`;
        const [result]: any[] = await pool.query(query, ['E', fechaActual, id_usuario, url_foto, id_reparto]);

        if (result.affectedRows > 0) {
            res.json({
                isSuccess: true,
                mensaje: 'Conformidad registrada con éxito'
            });
        } else {
            res.status(404).json({
                isSuccess: false,
                mensaje: 'No se encontró el reparto con el ID proporcionado'
            });
        }
    } catch (err) {
        res.json({
            isSuccess: false,
            mensaje: err || 'Error desconocido'
        });
    }
};


export default { getAllRepartos, getReparto, insertReparto, darConformidad, setActivoReparto }