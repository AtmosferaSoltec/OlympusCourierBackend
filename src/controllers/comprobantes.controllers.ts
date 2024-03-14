import { Request, Response } from 'express';
import axios from "axios";
import { pool } from '../db';
import { tbComprobante, tbEmpresa, tbItemReparto, tbMetodoPago, tbPendientesAnulacion, tbReparto, tbUsuario } from '../func/tablas';

const listarTodos = async (req: Request, res: Response) => {
    try {
        const { id_ruc } = req.body.user;
        const { serie, comprobante, cliente, desde, hasta, tipo_comprobante, activo, id_metodo_pago } = req.query;

        let query = `SELECT tc.*, tu.nombres as usuario, tm.nombre as metodo_pago FROM ${tbComprobante} tc LEFT JOIN ${tbUsuario} tu ON tc.id_usuario = tu.id LEFT JOIN ${tbMetodoPago} tm ON tc.id_metodo_pago = tm.id WHERE tc.id_ruc = ?`;
        let params: any[] = [id_ruc];

        if (serie) {
            query += ` AND tc.serie = ?`;
            params.push(serie);
        }

        if (comprobante) {
            query += ` AND tc.num_serie = ?`;
            params.push(comprobante);
        }

        if (cliente) {
            query += ` AND tc.nombre LIKE ?`;
            params.push(`%${cliente}%`);
        }

        if (desde && hasta) {
            query += ` AND DATE(tc.fecha_creacion) BETWEEN ? AND ?`;
            params.push(desde, hasta);
        }

        if (tipo_comprobante === '1' || tipo_comprobante === '2') {
            query += ` AND tc.tipo_comprobante = ?`;
            params.push(tipo_comprobante);
        }

        if (id_metodo_pago) {
            const queryMetodoPago = `SELECT * FROM ${tbMetodoPago} WHERE id = ? AND id_ruc = ? LIMIT 1`
            const [callMetodoPago]: any[] = await pool.query(queryMetodoPago, [id_metodo_pago, id_ruc]);
            if (callMetodoPago.length > 0) {
                query += ` AND tc.id_metodo_pago = ?`;
                params.push(id_metodo_pago);
            }
        }

        if (activo === 'S' || activo === 'N') {
            query += ` AND tc.activo = '${activo}'`;
            params.push(activo);
        }


        // Ordenar por fecha de creación
        query += ` ORDER BY tc.fecha_creacion DESC`;

        //Maximo 50 repartos
        query += ` LIMIT 50`;

        const [comprobantes]: any[] = await pool.query(query, params);


        return res.json({
            isSuccess: true,
            data: comprobantes
        });
    } catch (err: any) {
        return res.json({
            isSuccess: false,
            mensaje: err.message
        })
    }
};

const get = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        //Verificar que el reparto exista
        const [verificarComprobante]: any[] = await pool.query(`SELECT COUNT(*) as count FROM ${tbComprobante} WHERE id_reparto = ? LIMIT 1`, [id]);

        if (verificarComprobante[0].count === 0) {
            res.json({
                isSuccess: false,
                mensaje: 'El comprobante no existe'
            });
            return;
        };

        const query = `SELECT * FROM ${tbComprobante} WHERE id_reparto = ? LIMIT 1;`;
        const [comprobante]: any[] = await pool.query(query, [id]);
        res.json({
            isSuccess: true,
            data: comprobante[0]
        });
    } catch (error) {
        res.json({
            isSuccess: false,
            mensaje: 'Error al recuperar datos de la tabla Comprobantes'
        })
    }
};

const insertar = async (req: Request, res: Response) => {
    try {
        const { id_ruc, id } = req.body.user;

        const {
            tipo_comprobante, id_metodo_pago, num_operacion,
            tipo_doc, documento, nombre,
            direc, correo, telefono, repartos
        } = req.body;

        // Validar que todos los campos requeridos estén presentes
        //Validar si el tipo de comprobante es 1 o 2
        if (tipo_comprobante !== 1 && tipo_comprobante !== 2) {
            res.json({
                isSuccess: false,
                mensaje: 'Tipo de comprobante no admitido'
            });
            return;
        }
        if (!id_metodo_pago) {
            res.json({
                isSuccess: false,
                mensaje: 'El campo id_metodo_pago es requerido'
            });
            return;
        }
        if (tipo_doc !== 1 && tipo_doc !== 6 && tipo_doc !== 4) {
            res.json({
                isSuccess: false,
                mensaje: 'Tipo de documento no admitido'
            });
            return;
        }
        
        //El nombre es requerido
        if (!nombre) {
            res.json({
                isSuccess: false,
                mensaje: 'El campo nombre es requerido'
            });
            return;
        }
        //Si el tipo de documento es 6, la dirección es requerida
        if (tipo_doc === 6 && !direc) {
            res.json({
                isSuccess: false,
                mensaje: 'El campo direc es requerido'
            });
            return;
        }

        //Verificamos si el correo es válido
        if (correo && !correo.includes('@')) {
            res.json({
                isSuccess: false,
                mensaje: 'El campo correo no es válido'
            });
            return;
        }

        //Verificar si los repartos son un array y que tenga al menos un item
        if (!Array.isArray(repartos) || repartos.length === 0) {
            res.json({
                isSuccess: false,
                mensaje: 'Debe haber al menos un reparto'
            });
            return;
        }

        //Verificar que los repartos existan y que los repartos no tengan id_comprobante y esten activos
        const [verificarRepartos]: any[] = await pool.query(`SELECT COUNT(*) as count FROM ${tbReparto} WHERE id IN (?) AND id_comprobante IS NULL AND activo = 'S'`, [repartos]);
        if (verificarRepartos[0].count !== repartos.length) {
            res.json({
                isSuccess: false,
                mensaje: 'Uno o más repartos no existen o ya tienen un comprobante'
            });
            return;
        }

        //Verificar que el metodo de pago exista
        const [verificarMetodoPago]: any[] = await pool.query(`SELECT COUNT(*) as count FROM ${tbMetodoPago} WHERE id = ? AND id_ruc = ?`, [id_metodo_pago, id_ruc]);
        if (verificarMetodoPago[0].count === 0) {
            res.json({
                isSuccess: false,
                mensaje: 'El metodo de pago no existe'
            });
            return;
        }

        //Traer Lista de Items de los repartos con el tipo de paquete usando left join
        const [items]: any[] = await pool.query(`SELECT * FROM ${tbItemReparto} WHERE id_reparto IN (?)`, [repartos]);
        if (items.length === 0) {
            res.json({
                isSuccess: false,
                mensaje: 'No se encontraron items'
            });
            return;
        }

        let total = items.reduce((total: any, currentItem: any) => total + Number(currentItem.precio), 0);
        total = +(total.toFixed(4)); // limita a 4 decimales

        let montoBase = total / 1.18;
        montoBase = +(montoBase.toFixed(4)); // limita a 4 decimales

        let montoIgv = total - montoBase;
        montoIgv = +(montoIgv.toFixed(4));

        if (+(montoBase + montoIgv).toFixed(4) !== total) {
            return res.json({
                isSuccess: false,
                mensaje: 'La suma de montoBase e igv no es igual a total'

            })
        }

        //Obtener Credenciales
        const [credenciales]: any[] = await pool.query(`SELECT * FROM ${tbEmpresa} WHERE id = ? LIMIT 1`, [id_ruc]);
        if (credenciales.length === 0) {
            res.json({
                isSuccess: false,
                mensaje: 'No se encontraron credenciales'
            });
            return;
        }


        const ruta = credenciales[0].ruta;
        const token = credenciales[0].token;
        let serie: string;
        let num_serie: string;

        switch (tipo_comprobante) {
            case 1:
                serie = credenciales[0].serie_f;
                num_serie = credenciales[0].num_f + 1;
                break;
            case 2:
                serie = credenciales[0].serie_b;
                num_serie = credenciales[0].num_b + 1;
                break;
            default:
                res.json({
                    isSuccess: false,
                    mensaje: 'Tipo de comprobante no admitido'
                });
                return;
        }


        const itemsNubefact: any[] = []

        itemsNubefact.push({
            "unidad_de_medida": "ZZ",
            "codigo": "",
            "codigo_producto_sunat": "",
            "descripcion": `SERVICIO DE REPARTO`,
            "cantidad": 1,
            "valor_unitario": montoBase,
            "precio_unitario": total,
            "descuento": "",
            "subtotal": montoBase,
            "tipo_de_igv": 1,
            "igv": montoIgv,
            "total": total,
            "anticipo_regularizacion": false,
            "anticipo_documento_serie": "",
            "anticipo_documento_numero": ""
        })

        const data = {
            "operacion": "generar_comprobante",
            "tipo_de_comprobante": tipo_comprobante,
            "serie": serie,
            "numero": num_serie,
            "sunat_transaction": 1,
            "cliente_tipo_de_documento": tipo_doc,
            "cliente_numero_de_documento": documento,
            "cliente_denominacion": nombre,
            "cliente_direccion": direc,
            "cliente_email": correo,
            "cliente_email_1": "",
            "cliente_email_2": "",
            "fecha_de_emision": getFechaEmision(),
            "fecha_de_vencimiento": "",
            "moneda": 1,
            "tipo_de_cambio": "",
            "porcentaje_de_igv": 18.00,
            "descuento_global": "",
            "total_descuento": "",
            "total_anticipo": "",
            "total_gravada": montoBase,
            "total_inafecta": "",
            "total_exonerada": "",
            "total_igv": montoIgv,
            "total_gratuita": "",
            "total_otros_cargos": "",
            "total": total,
            "percepcion_tipo": "",
            "percepcion_base_imponible": "",
            "total_percepcion": "",
            "total_incluido_percepcion": "",
            "retencion_tipo": "",
            "retencion_base_imponible": "",
            "total_retencion": "",
            "total_impuestos_bolsas": "",
            "detraccion": false,
            "observaciones": "",
            "documento_que_se_modifica_tipo": "",
            "documento_que_se_modifica_serie": "",
            "documento_que_se_modifica_numero": "",
            "tipo_de_nota_de_credito": "",
            "tipo_de_nota_de_debito": "",
            "enviar_automaticamente_a_la_sunat": true,
            "enviar_automaticamente_al_cliente": false,
            "condiciones_de_pago": "",
            "medio_de_pago": "",
            "placa_vehiculo": "",
            "orden_compra_servicio": "",
            "formato_de_pdf": "",
            "generado_por_contingencia": "",
            "bienes_region_selva": "",
            "servicios_region_selva": "",
            "items": itemsNubefact,
            "guias": [],
            "venta_al_credito": []
        }

        try {
            const call = await axios.post(ruta, data, { headers: { 'Authorization': token, 'Content-Type': 'application/json', } })
            if (call.status !== 200) {
                return res.json({
                    isSuccess: false,
                    mensaje: call.data?.errors
                });
            }
            const { enlace_del_pdf, enlace_del_xml, sunat_description } = call.data;
            const query = `INSERT INTO ${tbComprobante} (id_ruc, tipo_comprobante, serie, num_serie, id_metodo_pago, num_operacion, tipo_doc, documento, nombre, direc, correo, telefono, id_usuario, sunat_descrip, enlace_pdf, enlace_xml, importe_total) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
            const [result]: any[] = await pool.query(query, [id_ruc, tipo_comprobante, serie, num_serie, id_metodo_pago, num_operacion, tipo_doc, documento, nombre, direc, correo, telefono, id, sunat_description, enlace_del_pdf, enlace_del_xml, total]);
            if (result.affectedRows !== 1) {
                return res.json({
                    isSuccess: false,
                    mensaje: 'Error al insertar comprobante'
                })
            }


            //Subir Contador en la tabla empresa
            const queryContador = `UPDATE ${tbEmpresa} SET num_${tipo_comprobante === 1 ? 'f' : 'b'} = ? WHERE id = ?`
            const [resContador]: any[] = await pool.query(queryContador, [num_serie, id_ruc])
            if (resContador.affectedRows !== 1) {
                return res.json({
                    isSuccess: false,
                    mensaje: 'Error al actualizar contador'
                })
            }

            //Actualizar los repartos con el id_comprobante
            const queryRepartos = `UPDATE ${tbReparto} SET id_comprobante = ? WHERE id IN (?)`
            const [resRepartos]: any[] = await pool.query(queryRepartos, [result.insertId, repartos])
            if (resRepartos.affectedRows !== repartos.length) {
                return res.json({
                    isSuccess: false,
                    mensaje: 'Error al actualizar repartos'
                })
            }

            //Comprobante Insertado
            res.json({
                isSuccess: true,
                mensaje: 'Comprobante insertado'
            });

        } catch (error: any) {
            console.error('Error al insertar comprobante:', error);
            res.json({
                isSuccess: false,
                mensaje: error.message
            });
            return;
        }


    } catch (error: any) {
        if (error.response && error.response.status === 400) {
            const mensajeError = error.response.data?.errors ?? "Error al insertar comprobante";
            return res.json({ isSuccess: false, mensaje: mensajeError });
        } else {
            return res.json({ isSuccess: false, mensaje: error.message });
        }
    }

};

const getFechaEmision = () => {
    const fecha = new Date();
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}-${mes}-${anio}`;
}

const anular = async (req: Request, res: Response) => {
    try {
        const { id_comprobante, motivo } = req.body;

        if (!id_comprobante) {
            return res.json({
                isSuccess: false,
                mensaje: 'Se requiere del id_comprobante'
            })
        }

        if (!motivo) {
            return res.json({
                isSuccess: false,
                mensaje: 'Se requiere del motivo'
            })
        }

        //Verificar que el comprobante exista
        const query = `SELECT * FROM ${tbComprobante} WHERE id = ? LIMIT 1`;
        const [comprobante]: any[] = await pool.query(query, [id_comprobante]);
        if (comprobante.length === 0) {
            return res.json({
                isSuccess: false,
                mensaje: 'El comprobante no existe'
            })
        }

        //Obtener Credenciales
        const [credenciales]: any[] = await pool.query(`SELECT * FROM ${tbEmpresa} WHERE id = ? LIMIT 1`, [comprobante[0].id_ruc]);
        if (credenciales.length === 0) {
            res.json({
                isSuccess: false,
                mensaje: 'No se encontraron credenciales'
            });
            return;
        }

        const { ruta, token } = credenciales[0];
        const { tipo_comprobante, serie, num_serie } = comprobante[0];

        //Insertar en la tabla pendientes_anular_comprobantes
        const queryPendientes = `INSERT INTO ${tbPendientesAnulacion} (tipo_comprobante, serie, num_serie, motivo, ruta, token, id_empresa) VALUES (?,?,?,?,?,?,?)`;
        const [resPendientes]: any[] = await pool.query(queryPendientes, [tipo_comprobante, serie, num_serie, motivo, ruta, token, comprobante[0].id_ruc]);
        if (resPendientes.affectedRows !== 1) {
            return res.json({
                isSuccess: false,
                mensaje: 'Error al insertar pendiente'
            })
        }

        //Anular el comprobante
        const queryAnular = `UPDATE ${tbComprobante} SET activo = 'N' WHERE id = ?`
        const [resAnular]: any[] = await pool.query(queryAnular, [id_comprobante])
        if (resAnular.affectedRows !== 1) {
            return res.json({
                isSuccess: false,
                mensaje: 'Error al anular comprobante'
            })
        }

        //Anular el id_comprobante en los repartos
        const queryRepartos = `UPDATE ${tbReparto} SET id_comprobante = NULL WHERE id_comprobante = ?`
        const [resRepartos]: any[] = await pool.query(queryRepartos, [id_comprobante])
        if (resRepartos.affectedRows !== 1) {
            return res.json({
                isSuccess: false,
                mensaje: 'Error al anular repartos'
            })
        }

        return res.json({
            isSuccess: true,
            mensaje: 'Comprobante anulado'
        });


    } catch (error: any) {
        console.log('Error al anular comprobante:', error);
        return res.json({
            isSuccess: false,
            mensaje: error.message
        });
    }
};


const setActivoComprobante = async (req: Request, res: Response) => {
    const id = req.params.id;
    const { activo } = req.body;

    if (!activo) {
        return res.json({
            isSuccess: false,
            mensaje: 'Se requiere del activo'
        })
    }

    const [rows]: any[] = await pool.query(`SELECT * FROM ${tbComprobante} WHERE id = ?`, [id]);

    if (rows.length === 0) {
        return res.json({
            isSuccess: false,
            mensaje: `El ID: ${id} no existe`
        });
    }

    const [updateResult]: any[] = await pool.query(`UPDATE ${tbComprobante} SET activo = ? WHERE id = ?`, [activo, id]);

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
};

export default {
    listarTodos,
    get,
    insertar,
    anular,
    setActivoComprobante
}