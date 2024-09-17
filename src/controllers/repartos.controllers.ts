import {
  getClienteById,
  getComprobanteById,
  getItemsRepartoByRepartoId,
  getMovimientosRepartoByRepartoId,
} from "../func/funciones";
import { Request, Response } from "express";
import { pool } from "../db";
import {
  tbCliente,
  tbEmpresa,
  tbHistorialReparto,
  tbItemReparto,
  tbReparto,
  tbUsuario,
} from "../func/tablas";

const getAllRepartos = async (req: Request, res: Response) => {
  try {
    const { id_ruc } = req.body.user;

    const {
      estado,
      estado_envio,
      num_reparto,
      cliente,
      desde,
      hasta,
      id_usuario,
      id_distrito,
      id_vehiculo,
    } = req.query;

    //Traemos todos los repartos y el nombre del cliente para poder hacer un filtrado
    let query = `
        SELECT tr.*, tc.nombres, tu.nombres as nombre_usuario
        FROM ${tbReparto} tr
        LEFT JOIN ${tbCliente} tc ON tr.id_cliente = tc.id
        LEFT JOIN ${tbUsuario} tu ON tr.id_usuario = tu.id
        WHERE tr.id_ruc = ?`;

    let params: any[] = [id_ruc];

    if (estado === "S" || estado === "N") {
      query += ` AND tr.activo = ?`;
      params.push(estado);
    }

    if (
      estado_envio === "E" ||
      estado_envio === "A" ||
      estado_envio === "P" ||
      estado_envio === "C"
    ) {
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

    if (id_usuario && !isNaN(Number(id_usuario))) {
      query += ` AND tr.id_usuario = ?`;
      params.push(id_usuario);
    }

    if (id_distrito) {
      query += ` AND tc.id_distrito =?`;
      params.push(id_distrito);
    }

    if (id_vehiculo) {
      query += ` AND tr.id_vehiculo =?`;
      params.push(id_vehiculo);
    }

    // Ordenar por fecha de creación
    query += ` ORDER BY tr.fecha_creacion DESC`;

    //Maximo 50 repartos
    //query += ` LIMIT 50`;

    const [repartos]: any[] = await pool.query(query, params);
    const repartosConItems = await Promise.all(
      repartos.map(async (reparto: any) => {
        return {
          ...reparto,
          cliente: await getClienteById(reparto.id_cliente),
          comprobante: await getComprobanteById(reparto.id_comprobante),
          total: parseFloat(reparto.total),
          items: await getItemsRepartoByRepartoId(reparto.id),
          historial: await getMovimientosRepartoByRepartoId(reparto.id),
        };
      })
    );
    return res.json({
      isSuccess: true,
      data: repartosConItems,
    });
  } catch (err: any) {
    return res.json({
      isSuccess: false,
      mensaje: err?.message,
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
        mensaje: "Se requiere del id_reparto",
      });
      return;
    }

    let query = `SELECT * FROM ${tbReparto} WHERE id_ruc = ? AND id = ? LIMIT 1`;
    const [reparto]: any[] = await pool.query(query, [id_ruc, id_reparto]);

    if (reparto.length === 0) {
      return res.json({
        isSuccess: true,
        data: [],
      });
    }

    const repartoConItems = {
      ...reparto[0],
      cliente: await getClienteById(reparto[0].id_cliente),
      comprobante: await getComprobanteById(reparto[0].id_comprobante),
      total: parseFloat(reparto[0].total),
      items: await getItemsRepartoByRepartoId(reparto[0].id),
      historial: await getMovimientosRepartoByRepartoId(reparto[0].id),
    };
    return res.json({
      isSuccess: true,
      data: repartoConItems,
    });
  } catch (err: any) {
    res.json({
      isSuccess: false,
      mensaje: err.message,
    });
  }
};

const insertReparto = async (req: Request, res: Response) => {
  try {
    const { id_ruc, id } = req.body.user;
    const { id_cliente, items } = req.body;
    let { id_vehiculo } = req.body;

    //Verificar si todos los campos fueron proporcionados
    if (!id_cliente || !id_vehiculo || !items) {
      return res.json({
        isSuccess: false,
        mensaje: "Faltan campos requeridos, por favor verifique.",
      });
    }

    //Verificar si los items son una lista de objetos
    if (
      !Array.isArray(items) ||
      items.some((item: any) => typeof item !== "object")
    ) {
      return res.json({
        isSuccess: false,
        mensaje: 'El campo "items" debe ser una lista de objetos.',
      });
    }

    if (items.length === 0) {
      return res.json({
        isSuccess: false,
        mensaje: "No se puede ingresar sin items",
      });
    }

    let total = 0;
    items.forEach((item: any) => {
      if (item.precio) {
        total += item.precio;
      }
    });

    if (id_vehiculo === "T") {
      id_vehiculo = null;
    }

    //Verificar si el cliente existe
    const [clienteRows]: any[] = await pool.query(
      `SELECT COUNT(*) AS count FROM ${tbCliente} WHERE id = ?`,
      [id_cliente]
    );
    if (clienteRows[0].count === 0) {
      return res.json({
        isSuccess: false,
        mensaje: `El cliente con ID: ${id_cliente} no existe`,
      });
    }

    // Obtener el num_reparto actual de la tabla empresa usando el ruc
    const [empresasRows]: any[] = await pool.query(
      `SELECT num_reparto FROM ${tbEmpresa} WHERE id = ? LIMIT 1`,
      [id_ruc]
    );
    const nuevo_num_reparto = empresasRows[0].num_reparto + 1;

    // Insertar el reparto
    const repartoQuery = `INSERT INTO ${tbReparto} (id_ruc, num_reparto, id_vehiculo, id_cliente, id_usuario, total) VALUES (?,?,?,?,?,?)`;
    const [repartoResult]: any[] = await pool.query(repartoQuery, [
      id_ruc,
      nuevo_num_reparto,
      id_vehiculo,
      id_cliente,
      id,
      total,
    ]);

    if (repartoResult.affectedRows !== 1) {
      return res.json({
        isSuccess: false,
        mensaje: "No se pudo insertar",
      });
    }

    //Insertar el movimiento
    const movimientoQuery = `INSERT INTO ${tbHistorialReparto} (id_reparto, id_usuario, id_tipo_operacion) VALUES (?,?,?)`;
    const [movimientoResult]: any[] = await pool.query(movimientoQuery, [
      repartoResult.insertId,
      id,
      1,
    ]);
    if (movimientoResult.affectedRows !== 1) {
      return res.json({
        isSuccess: false,
        mensaje: "No se pudo insertar el movimiento",
      });
    }

    //Verificamos si el correlativo de la empresa se actualiza correctamente
    const [correlativo]: any[] = await pool.query(
      `UPDATE ${tbEmpresa} SET num_reparto = ? WHERE id = ?`,
      [nuevo_num_reparto, id_ruc]
    );
    if (correlativo.affectedRows !== 1) {
      return res.json({
        isSuccess: false,
        mensaje: "No se pudo actualizar el correlativo",
      });
    }

    for (const item of items) {
      const { num_guia, precio, adicional, clave, detalle } = item;

      const itemQuery = `INSERT INTO ${tbItemReparto} (id_reparto, num_guia, precio, adicional, clave, detalle) VALUES (?,?,?,?,?,?)`;
      const [itemResult]: any[] = await pool.query(itemQuery, [
        repartoResult.insertId,
        num_guia,
        precio,
        adicional,
        clave,
        detalle,
      ]);

      if (itemResult.affectedRows === 0) {
        return res.json({
          isSuccess: false,
          mensaje: "No se pudo insertar",
        });
      }
    }

    return res.json({
      isSuccess: true,
      mensaje: "Insertado correctamente",
    });
  } catch (err: any) {
    console.log(err);
    
    return res.json({
      isSuccess: false,
      mensaje: err.message,
    });
  }
};

const updateReparto = async (req: Request, res: Response) => {
  try {
    const id_reparto = req.params.id;
    const { id } = req.body.user;
    let { id_cliente, items, id_vehiculo} = req.body;

    if (id_vehiculo === "T") {
      id_vehiculo = null;
    }

    // Verificar si se proporcionó el id_reparto
    if (id_reparto === undefined) {
      return res.json({
        isSuccess: false,
        mensaje: "No se proporcionó el ID del reparto",
      });
    }

    // Verificar si todos los campos fueron proporcionados
    if (!id_cliente || !id_vehiculo || !items) {
      return res.json({
        isSuccess: false,
        mensaje: "Faltan campos requeridos, por favor verifique.",
      });
    }

    // Verificar si los items son una lista de objetos
    if (
      !Array.isArray(items) ||
      items.some((item: any) => typeof item !== "object")
    ) {
      return res.json({
        isSuccess: false,
        mensaje: 'El campo "items" debe ser una lista de objetos.',
      });
    }

    // Verificar si la lista no esta vacía
    if (items.length === 0) {
      return res.json({
        isSuccess: false,
        mensaje: "No se puede ingresar sin items",
      });
    }

    let total = 0;
    items.forEach((item: any) => {
      if (item.precio) {
        total += item.precio;
      }
    });

    // Verificar si el cliente existe
    const [clienteRows]: any[] = await pool.query(
      `SELECT COUNT(*) AS count FROM ${tbCliente} WHERE id = ?`,
      [id_cliente]
    );
    if (clienteRows[0].count === 0) {
      return res.json({
        isSuccess: false,
        mensaje: `El cliente con ID: ${id_cliente} no existe`,
      });
    }

    // Actualizar el reparto
    const repartoQuery = `UPDATE ${tbReparto} SET id_vehiculo = ?, id_cliente = ?, total = ? WHERE id = ?`;
    const [repartoResult]: any[] = await pool.query(repartoQuery, [
      id_vehiculo,
      id_cliente,
      total,
      id_reparto,
    ]);

    if (repartoResult.affectedRows !== 1) {
      return res.json({
        isSuccess: false,
        mensaje: "No se pudo actualizar",
      });
    }

    // Insertar el movimiento
    const movimientoQuery = `INSERT INTO ${tbHistorialReparto} (id_reparto, id_usuario, id_tipo_operacion) VALUES (?,?,?)`;
    const [movimientoResult]: any[] = await pool.query(movimientoQuery, [
      id_reparto,
      id,
      7,
    ]);

    if (movimientoResult.affectedRows !== 1) {
      return res.json({
        isSuccess: false,
        mensaje: "No se pudo insertar el movimiento",
      });
    }

    // Eliminar los items actuales
    const deleteItemsQuery = `DELETE FROM ${tbItemReparto} WHERE id_reparto = ?`;
    const [deleteItemsResult]: any[] = await pool.query(deleteItemsQuery, [
      id_reparto,
    ]);

    if (deleteItemsResult.affectedRows === 0) {
      return res.json({
        isSuccess: false,
        mensaje: "No se pudo eliminar los items",
      });
    }

    // Insertar los nuevos items
    for (const item of items) {
      const { num_guia, precio, adicional, clave, detalle } = item;

      const itemQuery = `INSERT INTO ${tbItemReparto} (id_reparto, num_guia, precio, adicional, clave, detalle) VALUES (?,?,?,?,?,?)`;
      const [itemResult]: any[] = await pool.query(itemQuery, [
        id_reparto,
        num_guia,
        precio,
        adicional,
        clave,
        detalle,
      ]);

      if (itemResult.affectedRows === 0) {
        return res.json({
          isSuccess: false,
          mensaje: "No se pudo insertar",
        });
      }
    }

    return res.json({
      isSuccess: true,
      mensaje: "Actualizado correctamente",
    });

  } catch (error) {
    return res.json({
      isSuccess: false,
      mensaje: "No se puede actualizar el reparto",
    });
  }
};

const setActivoReparto = async (req: Request, res: Response) => {
  try {
    const { id } = req.body.user;
    const { id_reparto } = req.params;
    const { activo } = req.body;

    if (!activo) {
      return res.json({
        isSuccess: false,
        mensaje: "Se requiere del activo",
      });
    }

    if (isNaN(Number(id_reparto))) {
      return res.json({
        isSuccess: false,
        mensaje: "El ID proporcionado no es numérico",
      });
    }

    //Verificar si el activo es S o N
    if (activo !== "S" && activo !== "N") {
      return res.json({
        isSuccess: false,
        mensaje: "El activo debe ser S o N",
      });
    }

    // Verificar la existencia del reparto
    const [repartoRows]: any[] = await pool.query(
      `SELECT * FROM ${tbReparto} WHERE id = ?`,
      [id_reparto]
    );
    if (repartoRows.length === 0) {
      return res.json({
        isSuccess: false,
        mensaje: `El ID: ${id_reparto} no existe`,
      });
    }

    // Actualizar el activo
    const [updateResult]: any[] = await pool.query(
      `UPDATE ${tbReparto} SET activo = ? WHERE id = ?`,
      [activo, id_reparto]
    );
    if (updateResult.affectedRows !== 1) {
      return res.json({
        isSuccess: false,
        mensaje: "No se pudo actualizar el activo",
      });
    }

    let id_tipo_operacion;
    switch (activo) {
      case "S":
        id_tipo_operacion = 3;
        break;
      case "N":
        id_tipo_operacion = 2;
        break;
    }

    //Insertar el movimiento
    const movimientoQuery = `INSERT INTO ${tbHistorialReparto} (id_reparto, id_usuario, id_tipo_operacion) VALUES (?,?,?)`;
    const [movimientoResult]: any[] = await pool.query(movimientoQuery, [
      id_reparto,
      id,
      id_tipo_operacion,
    ]);
    if (movimientoResult.affectedRows !== 1) {
      return res.json({
        isSuccess: false,
        mensaje: "No se pudo insertar el movimiento",
      });
    }

    return res.json({
      isSuccess: true,
      mensaje: "Activo actualizado",
    });
  } catch (err: any) {
    return res.json({
      isSuccess: false,
      mensaje: err.message,
    });
  }
};

const darConformidad = async (req: Request, res: Response) => {
  try {
    const { id } = req.body.user;
    const { id_reparto, url_foto } = req.body;

    // Obtener la fecha actual en formato YYYY-MM-DD HH:mm:ss
    const fechaActual = new Date().toISOString().slice(0, 19).replace("T", " ");

    const query = `UPDATE ${tbReparto} SET estado = ?, fecha_entrega = ?, url_foto = ? WHERE id = ?`;
    const [result]: any[] = await pool.query(query, [
      "E",
      fechaActual,
      url_foto,
      id_reparto,
    ]);

    if (result.affectedRows !== 1) {
      return res.json({
        isSuccess: false,
        mensaje: "No se encontró el reparto con el ID proporcionado",
      });
    }

    //Insertar el movimiento
    const movimientoQuery = `INSERT INTO ${tbHistorialReparto} (id_reparto, id_usuario, id_tipo_operacion) VALUES (?,?,?)`;
    const [movimientoResult]: any[] = await pool.query(movimientoQuery, [
      id_reparto,
      id,
      4,
    ]);
    if (movimientoResult.affectedRows !== 1) {
      return res.json({
        isSuccess: false,
        mensaje: "No se pudo insertar el movimiento",
      });
    }

    return res.json({
      isSuccess: true,
      mensaje: "Conformidad registrada con éxito",
    });
  } catch (err) {
    res.json({
      isSuccess: false,
      mensaje: err || "Error desconocido",
    });
  }
};

const subirMercaderia = async (req: Request, res: Response) => {
  const { id } = req.body.user;
  const { idReparto } = req.body;

  const reparto: any = await pool.query(
    `SELECT * FROM ${tbReparto} WHERE id = ?`,
    [idReparto]
  );
  if (!reparto) {
    return res.json({
      isSuccess: false,
      mensaje: "No se encontró el reparto con el ID proporcionado",
    });
  }

  if (reparto[0][0]?.estado == "C") {
    return res.json({
      isSuccess: false,
      mensaje: "El reparto ya esta en curso",
    });
  }

  const query = `UPDATE ${tbReparto} SET estado = 'C' WHERE id = ?`;
  try {
    const [result]: any[] = await pool.query(query, [idReparto]);
    if (result.affectedRows !== 1) {
      return res.json({
        isSuccess: false,
        mensaje: "No se encontró el reparto con el ID proporcionado",
      });
    }

    const movimientoQuery = `INSERT INTO ${tbHistorialReparto} (id_reparto, id_usuario, id_tipo_operacion) VALUES (?,?,?)`;
    const [movimientoResult]: any[] = await pool.query(movimientoQuery, [
      idReparto,
      id,
      5,
    ]);

    if (movimientoResult.affectedRows !== 1) {
      return res.json({
        isSuccess: false,
        mensaje: "No se pudo insertar el movimiento",
      });
    }

    return res.json({
      isSuccess: true,
      mensaje: "Mercadería subida con éxito",
    });
  } catch (err) {
    res.json({
      isSuccess: false,
      mensaje: err || "Error desconocido",
    });
  }
};

const cancelarReparto = async (req: Request, res: Response) => {
  try {
    const idReparto = req.query.id;
    const { id } = req.body.user;

    const reparto: any = await pool.query(
      `SELECT * FROM ${tbReparto} WHERE id = ?`,
      [idReparto]
    );

    if (!reparto) {
      return res.json({
        isSuccess: false,
        mensaje: "No se encontró el reparto con el ID proporcionado",
      });
    }

    if (reparto[0][0]?.estado != "C") {
      return res.json({
        isSuccess: false,
        mensaje: "El reparto no esta en curso",
      });
    }

    const query = `UPDATE ${tbReparto} SET estado = 'P' WHERE id = ?`;
    const [result]: any[] = await pool.query(query, [idReparto]);
    if (result.affectedRows !== 1) {
      return res.json({
        isSuccess: false,
        mensaje: "No se encontró el reparto con el ID proporcionado",
      });
    }

    const movimientoQuery = `INSERT INTO ${tbHistorialReparto} (id_reparto, id_usuario, id_tipo_operacion) VALUES (?,?,?)`;
    const [movimientoResult]: any[] = await pool.query(movimientoQuery, [
      idReparto,
      id,
      6,
    ]);

    if (movimientoResult.affectedRows !== 1) {
      return res.json({
        isSuccess: false,
        mensaje: "No se pudo insertar el movimiento",
      });
    }

    return res.json({
      isSuccess: true,
      mensaje: "Reparto cancelado con éxito",
    });
  } catch (err) {
    res.json({
      isSuccess: false,
      mensaje: err || "Error desconocido",
    });
  }
};

export default {
  getAllRepartos,
  getReparto,
  insertReparto,
  updateReparto,
  darConformidad,
  setActivoReparto,
  subirMercaderia,
  cancelarReparto,
};
