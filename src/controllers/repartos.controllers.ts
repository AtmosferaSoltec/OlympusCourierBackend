import { getClienteById, getItemsRepartoByRepartoId, getUsuarioById } from '../func/funciones';
import { Request, Response } from 'express';
import connect from '../mysql';
import { tbItemReparto, tbReparto } from '../func/tablas';

const getAllRepartos = async (req: Request, res: Response) => {
    try {
        const db = await connect();
        const queryRepartos = `SELECT * FROM ${tbReparto}`;
        const [repartos]: any[] = await db.query(queryRepartos);
        const repartosConItems = await Promise.all(
            repartos.map(async (reparto: any) => {
                return {
                    id: reparto.id,
                    anotacion: reparto.anotacion,
                    clave: reparto.clave,
                    estado: reparto.estado,
                    fecha_creacion: reparto.fecha_creacion,
                    fecha_entrega: reparto.fecha_entrega,
                    id_cliente: reparto.id_cliente,
                    cliente: await getClienteById(reparto.id_cliente),
                    id_usuario: reparto.id_usuario,
                    usuario: await getUsuarioById(reparto.id_usuario),
                    id_repartidor: reparto.id_repartidor,
                    repartidor: await getUsuarioById(reparto.id_repartidor),
                    id_comprobante: await getUsuarioById(reparto.id_repartidor),
                    comprobante: null,
                    total: parseFloat(reparto.total),
                    activo: reparto.activo,
                    items: await getItemsRepartoByRepartoId(reparto.id)
                };
            })
        );
        res.json({
            isSuccess: true,
            data: repartosConItems
        });
    } catch (err) {
        res.json({
            isSuccess: false,
            mensaje: err
        });
    }
};

const getReparto = async (req: Request, res: Response) => {
    const repartoId = req.params.id;
    try {
        const db = await connect();
        const queryReparto = `SELECT * FROM ${tbReparto} WHERE id = ? LIMIT 1`;
        const [reparto]: any[] = await db.query(queryReparto, [repartoId]);

        if (reparto.length === 0) {
            res.status(404).json({ mensaje: 'Reparto no encontrado' });
            return;
        }

        const repartoConItems = {
            id: reparto[0].id,
            anotacion: reparto[0].anotacion,
            clave: reparto[0].clave,
            estado: reparto[0].estado,
            fecha_creacion: reparto[0].fecha_creacion,
            fecha_entrega: reparto[0].fecha_entrega,
            id_cliente: reparto[0].id_cliente,
            cliente: await getClienteById(reparto[0].id_cliente),
            id_usuario: reparto[0].id_usuario,
            usuario: await getUsuarioById(reparto[0].id_usuario),
            id_repartidor: reparto[0].id_repartidor,
            repartidor: await getUsuarioById(reparto[0].id_repartidor),
            id_comprobante: await getUsuarioById(reparto[0].id_repartidor),
            comprobante: null,
            total: parseFloat(reparto[0].total),
            activo: reparto[0].activo,
            items: await getItemsRepartoByRepartoId(reparto[0].id)
        };
        res.json({
            isSuccess: true,
            data: repartoConItems
        });
    } catch (err) {
        res.json({
            isSuccess: false,
            mensaje: err || 'Error desconocido'
        });
    }
};

const insertReparto = async (req: Request, res: Response) => {
    try {
        const db = await connect();
        const { anotacion, clave, id_cliente, id_usuario, items } = req.body;

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

        const total = items.reduce((acumulador, item) => {
            if (typeof item.precio !== 'number') {
                throw new Error('Cada objeto en "items" debe tener una propiedad "precio" numérica.');
            }
            return acumulador + item.precio;
        }, 0);


        const repartoQuery = `INSERT INTO ${tbReparto} (anotacion, clave, id_cliente, id_usuario, total) VALUES (?,?,?,?,?)`;
        const [repartoResult]: any[] = await db.query(repartoQuery, [anotacion, clave, id_cliente, id_usuario, total]);

        if (repartoResult.affectedRows !== 1) {
            return res.json({
                isSuccess: false,
                mensaje: 'No se pudo insertar'
            });
        }

        for (const item of items) {
            const { num_guia, detalle, cant, precio, id_tipo_paquete } = item;
            const itemQuery = `INSERT INTO ${tbItemReparto} (num_guia, detalle, cant, precio, id_reparto, id_tipo_paquete) VALUES (?,?,?,?,?,?)`;
            const [itemResult]: any[] = await db.query(itemQuery, [num_guia, detalle, cant, precio, repartoResult.insertId, id_tipo_paquete]);

            if (itemResult.affectedRows === 0) {
                return res.json({
                    isSuccess: false,
                    mensaje: 'No se pudo insertar'
                });
            }
        }

        res.json({
            isSuccess: true,
            mensaje: 'Insertado correctamente'
        });
    } catch (err) {
        res.json({
            isSuccess: false,
            mensaje: err || 'Error desconocido'
        });
    }
};

const updateReparto = async (req: Request, res: Response) => {
    try {
        const db = await connect();
        const id = req.params.id;
        const { anotacion, clave, id_cliente, id_usuario, items } = req.body;

        // Verificar si el reparto existe
        const [repartoRows]: any[] = await db.query(`SELECT * FROM ${tbReparto} WHERE id = ?`, [id]);

        if (repartoRows.length === 0) {
            return res.status(404).json({ error: `El reparto con ID ${id} no existe` });
        }

        // Actualizar la información del reparto
        const actualizarRepartoQuery = `UPDATE ${tbReparto} SET anotacion = ?, clave = ?, id_cliente = ?, id_usuario = ? WHERE id = ?`;
        const [repartoResult]: any[] = await db.query(actualizarRepartoQuery, [anotacion, clave, id_cliente, id_usuario, id]);

        // Actualizar los items del reparto si se proporcionan
        if (items && items.length > 0) {
            // Eliminar los items existentes
            await db.query(`DELETE FROM ${tbItemReparto} WHERE id_reparto = ?`, [id]);

            // Insertar los nuevos items
            const insertarItemQuery = `INSERT INTO ${tbItemReparto} (num_guia, detalle, cant, precio, id_reparto, id_tipo_paquete) VALUES (?,?,?,?,?,?)`;
            for (const item of items) {
                const { num_guia, detalle, cant, precio, id_tipo_paquete } = item;
                await db.query(insertarItemQuery, [num_guia, detalle, cant, precio, id, id_tipo_paquete]);
            }
        }

        // Verificar si la actualización fue exitosa
        if (repartoResult.affectedRows === 1) {
            res.json({ mensaje: 'Reparto actualizado correctamente' });
        } else {
            res.status(500).json({ error: 'No se pudo actualizar el reparto' });
        }
    } catch (err) {
        res.status(500).json({
            isSuccess: false,
            mensaje: err || 'Error desconocido'
        });
    }
};

const deleteReparto = async (req: Request, res: Response) => {
    try {
        const db = await connect();
        const id = req.params.id;

        if (isNaN(Number(id))) {
            return res.json({
                isSuccess: false,
                mensaje: 'El ID proporcionado no es numérico'
            });
        }

        // Verificar la existencia del reparto
        const [repartoRows]: any[] = await db.query(`SELECT * FROM ${tbReparto} WHERE id = ?`, [id]);
        if (repartoRows.length === 0) {
            return res.json({
                isSuccess: false,
                mensaje: `El ID: ${id} no existe`
            });
        }

        // Eliminar los items relacionados al reparto
        await db.query(`DELETE FROM ${tbItemReparto} WHERE id_reparto = ?`, [id]);

        // Eliminar el reparto
        const [repartoResult]: any[] = await db.query(`DELETE FROM ${tbReparto} WHERE id = ?`, [id]);

        // Verificar si la eliminación fue exitosa
        if (repartoResult.affectedRows === 1) {
            res.json({
                isSuccess: true,
                mensaje: 'Reparto eliminado correctamente'
            });
        } else {
            res.json({
                isSuccess: false,
                mensaje: 'No se pudo eliminar el reparto y sus elementos relacionados'
            });
        }
    } catch (err) {
        res.status(500).json({
            isSuccess: false,
            mensaje: err || 'Error desconocido'
        });
    }
};

const darConformidad = async (req: Request, res: Response) => {
    try {
        const db = await connect();
        const { id_reparto, id_usuario, url_foto } = req.body;

        // Obtener la fecha actual en formato YYYY-MM-DD HH:mm:ss
        const fechaActual = new Date().toISOString().slice(0, 19).replace('T', ' ');

        const query = `UPDATE ${tbReparto} SET estado = ?, fecha_entrega = ?, id_repartidor = ?, url_foto = ? WHERE id = ?`;
        const [result]: any[] = await db.query(query, ['E', fechaActual, id_usuario, url_foto, id_reparto]);

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


export default { getAllRepartos, getReparto, insertReparto, darConformidad, updateReparto, deleteReparto }