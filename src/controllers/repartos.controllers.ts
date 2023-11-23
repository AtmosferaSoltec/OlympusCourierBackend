import { Request, Response } from 'express';
import connect from '../mysql';

const listarTodos = async (req: Request, res: Response) => {
    try {
        const db = await connect();
        const queryRepartos = 'SELECT * FROM repartos';
        const repartos: any = await db.query(queryRepartos);
        const repartosConItems = await Promise.all(
            repartos.map(async (reparto: any) => {
                const queryItems = 'SELECT * FROM item_reparto WHERE id_reparto = ?';
                const items = await db.query(queryItems, [reparto.id]);
                const cliente = await getCliente(reparto.id_cliente);
                const usuario = await getUsuario(reparto.id_usuario);
                const repartidor = await getUsuario(reparto.id_repartidor);
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
        res.json(repartosConItems);
    } catch (error) {
        console.error('Error al recuperar datos de las tablas Repartos e item_reparto:', error);
        res.status(500).json({ error: 'Ocurrió un error al obtener los datos de las tablas Repartos e item_reparto' });
    }
};

const getReparto = async (req: Request, res: Response) => {
    const repartoId = req.params.id;
    try {
        const db = await connect();
        const queryReparto = 'SELECT * FROM repartos WHERE id = ? LIMIT 1';
        const reparto: any = await db.query(queryReparto, [repartoId]);

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
            cliente: await getCliente(reparto[0].id_cliente),
            id_usuario: reparto[0].id_usuario,
            usuario: await getUsuario(reparto[0].id_usuario),
            id_repartidor: reparto[0].id_repartidor,
            items: await obtenerItemsPorRepartoId(reparto[0].id),
            total: parseFloat(reparto[0].total)
        };
        res.json(repartoConItems);
    } catch (error) {
        console.error('Error al recuperar datos del reparto por ID:', error);
        res.status(500).json({ error: 'Ocurrió un error al obtener los datos del reparto por ID' });
    }
};

const obtenerItemsPorRepartoId = async (repartoId: number) => {
    try {
        const db = await connect();
        const queryItems = 'SELECT * FROM item_reparto WHERE id_reparto = ?';
        const items: any = await db.query(queryItems, [repartoId]);
        return items;
    } catch (error) {
        console.error('Error al recuperar datos de los items por ID de reparto:', error);
        throw new Error('Ocurrió un error al obtener los datos de los items por ID de reparto');
    }
};

const getCliente = async (id: number) => {
    try {
        const db = await connect();
        const query = 'SELECT * FROM clientes WHERE id = ? LIMIT 1';
        const resultado: any = await db.query(query, [id]);
        if (resultado.length === 1) {
            const [distrito]: any = await db.query('SELECT nombre FROM destinos WHERE id = ? LIMIT 1', [1]);
            const {
                tipo_doc,
                documento,
                nombres,
                telefono,
                correo,
                genero,
                distrito_id,
                direc,
                referencia,
                url_maps
            } = resultado[0];
            return {
                tipo_doc,
                documento,
                nombres,
                telefono,
                correo,
                genero,
                distrito_id,
                distrito: distrito.nombre,
                direc,
                referencia,
                url_maps
            }
        } else if (resultado.length === 0) {
            return null;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
}
const getUsuario = async (id: number) => {
    try {
        const db = await connect();
        const query = 'SELECT * FROM usuarios WHERE id = ? LIMIT 1';
        const resultado: any = await db.query(query, [id]);
        if (resultado.length === 1) {
            const { documento, nombres, ape_materno, ape_paterno, telefono, correo, rol } = resultado[0];
            return { documento, nombres, ape_materno, ape_paterno, telefono, correo, rol };
        } else if (resultado.length === 0) {
            return null;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
}

const insertar = async (req: Request, res: Response) => {
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
    } catch (error) {
        console.error('Error al insertar un reparto:', error);
        res.json({
            isSuccess: false,
            mensaje: error
        });
    }
};

const darConformidad = async (req: Request, res: Response) => {
    try {
        const db = await connect();
        const { id_reparto, id_usuario, url_foto } = req.body;
        const fechaActual = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const query = 'UPDATE repartos SET estado = ?, fecha_entrega = ?, id_repartidor = ?, url_foto = ? WHERE id = ?';
        const result : any = await db.query(query, ['E', fechaActual, id_usuario, url_foto, id_reparto]);
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
    } catch (error) {
        res.json({
            isSuccess: false,
            mensaje: error
        });
    }
};

const actualizar = async (req: Request, res: Response) => {
    const db = await connect();
    const id = req.params.id;
    const { anotacion, clave, id_cliente, id_usuario, items } = req.body;

    try {
        const repartoRows : any = await db.query('SELECT * FROM repartos WHERE id = ?', [id]);
        if (repartoRows.length === 0) {
            return res.status(404).json({ error: `El reparto con ID ${id} no existe` });
        }
        const actualizarRepartoQuery = 'UPDATE repartos SET anotacion = ?, clave = ?, id_cliente = ?, id_usuario = ? WHERE id = ?';
        const repartoResult : any = await db.query(actualizarRepartoQuery, [anotacion, clave, id_cliente, id_usuario, id]);

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
    } catch (error) {
        console.error('Error al intentar actualizar el reparto:', error);
        res.status(500).json({ error: 'Ocurrió un error al intentar actualizar el reparto' });
    }
};

const eliminar = async (req: Request, res: Response) => {
    try {
        const db = await connect();
        const id = req.params.id;
        await db.query('DELETE FROM item_reparto WHERE id_reparto = ?', [id]);
        const repartoRows : any = await db.query('SELECT * FROM repartos WHERE id = ?', [id]);

        if (repartoRows.length === 0) {
            return res.status(404).json({ error: `El reparto con ID ${id} no existe` });
        }

        const repartoResult : any = await db.query('DELETE FROM repartos WHERE id = ?', [id]);

        if (repartoResult.affectedRows === 1) {
            res.json({ mensaje: 'Reparto y elementos relacionados eliminados correctamente' });
        } else {
            res.status(500).json({ error: 'No se pudo eliminar el reparto y sus elementos relacionados' });
        }
    } catch (error) {
        console.error('Error al intentar eliminar el reparto y sus elementos relacionados:', error);
        res.status(500).json({ error: 'Ocurrió un error al intentar eliminar el reparto y sus elementos relacionados' });
    }
};

export default { listarTodos, getReparto, insertar, darConformidad, actualizar, eliminar }