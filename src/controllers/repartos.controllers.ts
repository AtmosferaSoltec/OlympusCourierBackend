import { getClienteById, getItemsRepartoByRepartoId, getUsuarioById } from '../func/funciones';
import { Request, Response } from 'express';
import { pool } from '../db';
import { tbCliente, tbComprobante, tbEmpresa, tbItemReparto, tbReparto, tbTipoPaquete, tbUsuario } from '../func/tablas';
import { RequestWithUser } from '../interfaces/usuario';

/**
 * Devolver por rangos
 * 
 const { page = 1, pageSize = 50, desde, hasta } = req.query;

  const offset = (page - 1) * pageSize;
  const limit = parseInt(pageSize);

  // Filtro por fecha
  const fechaFilter = desde && hasta ? `WHERE fecha BETWEEN ? AND ?` : '';
  const fechaParams = desde && hasta ? [desde, hasta] : [];

  // Consulta SQL paginada y filtrada
  const query = `
    SELECT * FROM movimientos
    ${fechaFilter}
    ORDER BY fecha DESC
    LIMIT ?, ?;
  `;

  try {
    const [rows] = await pool.query(query, [...fechaParams, offset, limit]);

    res.json(rows);
  } catch (error) {
    console.error('Error al recuperar movimientos:', error);
    res.status(500).json({ error: 'Error al recuperar movimientos' });
  }
 * **/

const getAllRepartos = async (req: RequestWithUser, res: Response) => {
    try {

        const { id_ruc } = req.user;
        const { estado, estado_envio, num_reparto, cliente } = req.query;

        console.log(estado, estado_envio, num_reparto, cliente);


        let query = `SELECT ${tbReparto}.*, ${tbComprobante}.id as id_comprobante, ${tbCliente}.nombres FROM ${tbReparto} LEFT JOIN ${tbComprobante} ON ${tbReparto}.id = ${tbComprobante}.id_reparto LEFT JOIN ${tbCliente} ON ${tbReparto}.id_cliente = ${tbCliente}.id WHERE ${tbReparto}.id_ruc = ?`
        let params: any[] = [id_ruc];

        if (estado === 'S' || estado === 'N') {
            query += ` AND ${tbReparto}.activo = ?`;
            params.push(estado);
        }

        if (estado_envio === 'E' || estado_envio === 'A' || estado_envio === 'P') {
            query += ` AND ${tbReparto}.estado = ?`;
            params.push(estado_envio);
        }

        if (num_reparto) {
            query += ` AND ${tbReparto}.num_reparto = ?`;
            params.push(num_reparto);
        }

        if (cliente) {
            query += ` AND ${tbCliente}.nombres LIKE ?`;
            params.push(`%${cliente}%`);
        }

        const [repartos]: any[] = await pool.query(query, params);
        const repartosConItems = await Promise.all(
            repartos.map(async (reparto: any) => {
                return {
                    id: reparto.id,
                    id_ruc: reparto.id_ruc,
                    num_reparto: reparto.num_reparto,
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
                    id_comprobante: reparto.id_comprobante,
                    url_foto: reparto?.url_foto,
                    total: parseFloat(reparto.total),
                    activo: reparto.activo,
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

const getReparto = async (req: RequestWithUser, res: Response) => {

    try {
        const id_reparto = req.params.id;
        const { id_ruc } = req.user;

        // Verificar si se proporcionó el id_ruc y el id_reparto
        if (!id_reparto) {
            res.json({
                isSuccess: false,
                mensaje: 'Se requiere del id_reparto'
            });
            return;
        }

        let query = `SELECT ${tbReparto}.*, ${tbComprobante}.id as id_comprobante FROM ${tbReparto} LEFT JOIN ${tbComprobante} ON ${tbReparto}.id = ${tbComprobante}.id_reparto WHERE ${tbReparto}.id_ruc = ? AND ${tbReparto}.id = ? LIMIT 1`;
        const [reparto]: any[] = await pool.query(query, [id_ruc, id_reparto]);

        if (reparto.length === 0) {
            res.json({
                isSuccess: false,
                mensaje: 'Reparto no encontrado'
            });
            return;
        }

        const repartoConItems = {
            id: reparto[0].id,
            id_ruc: reparto[0].id_ruc,
            num_reparto: reparto[0].num_reparto,
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
            id_comprobante: reparto[0]?.id_comprobante,
            url_foto: reparto[0].url_foto,
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
        const { id_ruc, anotacion, clave, id_cliente, id_usuario, items } = req.body;

        //Verificar si todos los campos fueron proporcionados
        if (!id_ruc || !clave || !id_cliente || !id_usuario || !items) {
            return res.json({
                isSuccess: false,
                mensaje: 'Faltan campos requeridos, por favor verifique.'
            });
        }

        //Verificar si la empresa existe
        const [empresaRows]: any[] = await pool.query(`SELECT COUNT(*) AS count FROM ${tbEmpresa} WHERE id = ?`, [id_ruc]);
        if (empresaRows[0].count === 0) {
            return res.json({
                isSuccess: false,
                mensaje: `La empresa con ID: ${id_ruc} no existe`
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

        //Verificar si el usuario existe
        const [usuarioRows]: any[] = await pool.query(`SELECT COUNT(*) AS count FROM ${tbUsuario} WHERE id = ?`, [id_usuario]);
        if (usuarioRows[0].count === 0) {
            return res.json({
                isSuccess: false,
                mensaje: `El usuario con ID: ${id_usuario} no existe`
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

        const total = items.reduce((acumulador, item) => {
            if (typeof item.precio !== 'number') {
                throw new Error('Cada objeto en "items" debe tener una propiedad "precio" numérica.');
            }
            return acumulador + item.precio;
        }, 0);

        // Obtener el num_reparto actual de la tabla empresa usando el ruc
        const [empresasRows]: any[] = await pool.query(`SELECT num_reparto FROM ${tbEmpresa} WHERE id = ? LIMIT 1`, [id_ruc]);
        const num_reparto_empresa = empresasRows[0].num_reparto;

        const nuevo_num_reparto = num_reparto_empresa + 1;


        const repartoQuery = `INSERT INTO ${tbReparto} (id_ruc, num_reparto, anotacion, clave, id_cliente, id_usuario, total) VALUES (?,?,?,?,?,?,?)`;
        const [repartoResult]: any[] = await pool.query(repartoQuery, [id_ruc, nuevo_num_reparto, anotacion, clave, id_cliente, id_usuario, total]);

        if (repartoResult.affectedRows !== 1) {
            return res.json({
                isSuccess: false,
                mensaje: 'No se pudo insertar'
            });
        }

        await pool.query(`UPDATE ${tbEmpresa} SET num_reparto = ? WHERE id = ?`, [nuevo_num_reparto, id_ruc]);

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

        res.json({
            isSuccess: true,
            mensaje: 'Insertado correctamente'
        });
    } catch (err: any) {
        res.json({
            isSuccess: false,
            mensaje: err
        });
    }
};

const updateReparto = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const { anotacion, clave, id_cliente, id_usuario, items } = req.body;

        // Verificar si el reparto existe
        const [repartoRows]: any[] = await pool.query(`SELECT * FROM ${tbReparto} WHERE id = ?`, [id]);

        if (repartoRows.length === 0) {
            return res.status(404).json({ error: `El reparto con ID ${id} no existe` });
        }

        // Actualizar la información del reparto
        const actualizarRepartoQuery = `UPDATE ${tbReparto} SET anotacion = ?, clave = ?, id_cliente = ?, id_usuario = ? WHERE id = ?`;
        const [repartoResult]: any[] = await pool.query(actualizarRepartoQuery, [anotacion, clave, id_cliente, id_usuario, id]);

        // Actualizar los items del reparto si se proporcionan
        if (items && items.length > 0) {
            // Eliminar los items existentes
            await pool.query(`DELETE FROM ${tbItemReparto} WHERE id_reparto = ?`, [id]);

            // Insertar los nuevos items
            const insertarItemQuery = `INSERT INTO ${tbItemReparto} (num_guia, detalle, cant, precio, id_reparto, id_tipo_paquete) VALUES (?,?,?,?,?,?)`;
            for (const item of items) {
                const { num_guia, detalle, cant, precio, id_tipo_paquete } = item;
                await pool.query(insertarItemQuery, [num_guia, detalle, cant, precio, id, id_tipo_paquete]);
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
        await pool.query(`UPDATE ${tbItemReparto} SET activo = ? WHERE id_reparto = ?`, [activo, id]);

        const [updateResult]: any[] = await pool.query(`UPDATE ${tbReparto} SET activo = ? WHERE id = ?`, [activo, id]);

        if (updateResult.affectedRows === 1) {
            res.json({
                isSuccess: true,
                mensaje: 'Activo actualizado'
            });
        } else {
            res.json({
                isSuccess: false,
                mensaje: 'No se pudo actualizar el activo'
            });
        };
    } catch (err) {
        res.json({
            isSuccess: false,
            mensaje: err || 'Error desconocido'
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


export default { getAllRepartos, getReparto, insertReparto, darConformidad, updateReparto, setActivoReparto }