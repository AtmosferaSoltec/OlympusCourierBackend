import { getClienteById, getUsuarioById } from '../func/funciones';
import { Request, Response } from 'express';
import connect from '../mysql';
import { tbReparto } from '../func/tablas';

const getAllRepartos = async (req: Request, res: Response) => {
    try {
        const db = await connect();
        const queryRepartos = 'SELECT * FROM repartos';
        const [repartos]: any[] = await db.query(queryRepartos);
        const repartosConItems = await Promise.all(
            repartos.map(async (reparto: any) => {
                const queryItems = 'SELECT * FROM item_reparto WHERE id_reparto = ?';
                const [items]: any[] = await db.query(queryItems, [reparto.id]);
                const cliente = await getClienteById(reparto.id_cliente);
                const usuario = await getUsuarioById(reparto.id_usuario);
                const repartidor = await getUsuarioById(reparto.id_repartidor);
                return {
                    id: reparto.id,
                    anotacion: reparto.anotacion,
                    clave: reparto.clave,
                    estado: reparto.estado,
                    fecha_creacion: reparto.fecha_creacion,
                    fecha_entrega: reparto.fecha_entrega,
                    id_cliente: reparto.id_cliente,
                    cliente,
                    id_usuario: reparto.id_usuario,
                    usuario,
                    id_repartidor: reparto.id_repartidor,
                    repartidor,
                    items,
                    total: parseFloat(reparto.total)
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
            items: await obtenerItemsPorRepartoId(reparto[0].id),
            total: parseFloat(reparto[0].total)
        };
        res.json({
            isSuccess: true,
            data: repartoConItems
        });
    } catch (err) {
        res.json({
            isSuccess: false,
            mensaje: err
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
            if (typeof item.precio === 'number') {
                return acumulador + item.precio;
            } else {
                throw new Error('Cada objeto en "items" debe tener una propiedad "precio" numérica.');
            }
        }, 0);

        const query = 'INSERT INTO repartos (anotacion, clave, id_cliente, id_usuario, total) VALUES (?,?,?,?,?)'
        const result: any = await db.query(query, [anotacion, clave, id_cliente, id_usuario, total]);

        if (result.affectedRows === 1) {
            for (const item of items) {
                const { num_guia, detalle, cant, precio, id_tipo_paquete } = item
                const query2 = 'INSERT INTO item_reparto (num_guia, detalle, cant, precio, id_reparto, id_tipo_paquete) VALUES (?,?,?,?,?,?)'
                const result2: any = await db.query(query2, [num_guia, detalle, cant, precio, result.insertId, id_tipo_paquete]);

                if (result2.affectedRows !== 1) {
                    return res.json({
                        isSuccess: false,
                        mensaje: 'No se pudo insertar'
                    });
                }
            }
            res.json({
                isSuccess: true,
                mensaje: 'Reparto insertado correctamente'
            });
        } else {
            res.json({
                isSuccess: false,
                mensaje: 'No se pudo insertar'
            });
        }
    } catch (err) {
        res.json({
            isSuccess: false,
            mensaje: err
        });
    }
};

const updateReparto = async (req: Request, res: Response) => {
    const db = await connect();
    const id = req.params.id;
    const { anotacion, clave, id_cliente, id_usuario, items } = req.body;

    try {
        const repartoRows: any = await db.query('SELECT * FROM repartos WHERE id = ?', [id]);
        if (repartoRows.length === 0) {
            return res.status(404).json({ error: `El reparto con ID ${id} no existe` });
        }
        const actualizarRepartoQuery = 'UPDATE repartos SET anotacion = ?, clave = ?, id_cliente = ?, id_usuario = ? WHERE id = ?';
        const repartoResult: any = await db.query(actualizarRepartoQuery, [anotacion, clave, id_cliente, id_usuario, id]);

        if (items && items.length > 0) {
            await db.query('DELETE FROM item_reparto WHERE id_reparto = ?', [id]);
            for (const item of items) {
                const { num_guia, detalle, cant, precio, id_tipo_paquete } = item;
                const insertarItemQuery = 'INSERT INTO item_reparto (num_guia, detalle, cant, precio, id_reparto, id_tipo_paquete) VALUES (?,?,?,?,?,?)';
                await db.query(insertarItemQuery, [num_guia, detalle, cant, precio, id, id_tipo_paquete]);
            }
        }

        if (repartoResult.affectedRows === 1) {
            res.json({ mensaje: 'Reparto actualizado correctamente' });
        } else {
            res.status(500).json({ error: 'No se pudo actualizar el reparto' });
        }
    } catch (err) {
        res.json({
            isSuccess: false,
            mensaje: err
        });
    }
};

const deleteReparto = async (req: Request, res: Response) => {
    try {
        const db = await connect();
        const id = req.params.id;
        await db.query('DELETE FROM item_reparto WHERE id_reparto = ?', [id]);
        const repartoRows: any = await db.query('SELECT * FROM repartos WHERE id = ?', [id]);

        if (repartoRows.length === 0) {
            return res.status(404).json({ error: `El reparto con ID ${id} no existe` });
        }

        const repartoResult: any = await db.query('DELETE FROM repartos WHERE id = ?', [id]);

        if (repartoResult.affectedRows === 1) {
            res.json({ mensaje: 'Reparto y elementos relacionados eliminados correctamente' });
        } else {
            res.status(500).json({ error: 'No se pudo eliminar el reparto y sus elementos relacionados' });
        }
    } catch (err) {
        res.json({
            isSuccess: false,
            mensaje: err
        });
    }
};

const obtenerItemsPorRepartoId = async (repartoId: number) => {
    try {
        const db = await connect();
        const queryItems = 'SELECT * FROM item_reparto WHERE id_reparto = ?';
        const [items]: any[] = await db.query(queryItems, [repartoId]);
        return items;
    } catch (error) {
        throw new Error('Ocurrió un error al obtener los datos de los items por ID de reparto');
    }
};

const darConformidad = async (req: Request, res: Response) => {
    try {
        const db = await connect();
        const { id_reparto, id_usuario, url_foto } = req.body;
        const fechaActual = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const query = 'UPDATE repartos SET estado = ?, fecha_entrega = ?, id_repartidor = ?, url_foto = ? WHERE id = ?';
        const result: any = await db.query(query, ['E', fechaActual, id_usuario, url_foto, id_reparto]);
        if (result.affectedRows > 0) {
            res.json({
                isSuccess: true,
                mensaje: 'Conformidad registrada con éxito'
            });
        } else {
            res.json({
                isSuccess: false,
                mensaje: 'No se encontró el reparto con el ID proporcionado'
            });
        }
    } catch (err) {
        res.json({
            isSuccess: false,
            mensaje: err
        });
    }
};


export default { getAllRepartos, getReparto, insertReparto, darConformidad, updateReparto, deleteReparto }