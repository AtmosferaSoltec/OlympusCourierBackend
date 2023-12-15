import e, { Request, Response } from 'express';
import axios from "axios";
import { pool } from '../db';
import { tbComprobante, tbItemReparto, tbMetodoPago, tbReparto, tbTipoDoc, tbTipoPaquete, tbUsuario, tb_contador } from '../func/tablas';

const listarTodos = async (req: Request, res: Response) => {
    try {
        const { estado, metodoPago, tipoDoc, idUser } = req.query;
        let query = `SELECT * FROM ${tbComprobante}`;

        switch (estado?.toString().toUpperCase()) {
            case 'S':
                query += " WHERE activo = 'S'";
                break;
            case 'N':
                query += " WHERE activo = 'N'";
                break;
            case 'T': break;
            default: {
                res.json({
                    isSuccess: false,
                    mensaje: 'El estado no es válido'
                })
                return;
            }
        }

        const [destinos]: any[] = await pool.query(query);
        res.json({
            isSuccess: true,
            data: destinos
        });
    } catch (error) {
        console.error('Error al recuperar datos de la tabla Comprobantes:', error);
        res.json({
            isSuccess: false,
            mensaje: 'Error al recuperar datos de la tabla Comprobantes'
        })
    }
};

const get = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        //Verificar que el reparto exista
        const [verificarComprobante]: any[] = await pool.query(`SELECT COUNT(*) as count FROM ${tbComprobante} WHERE id_reparto = ? LIMIT 1`, [id]);

        if (verificarComprobante[0].count === 0) {
            res.json({
                isSuccess: false,
                mensaje: 'El comprobante no existe'
            });
            return;
        }

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
        const {
            id_reparto, tipo_comprobante,
            id_metodo_pago, num_operacion, foto_operacion,
            tipo_doc, documento, nombre, direc, correo, telefono,
            id_usuario, ruc } = req.body;

        // Validar que todos los campos requeridos estén presentes
        if (!ruc || !id_reparto || !tipo_comprobante || !id_metodo_pago || !tipo_doc || !documento || !nombre || !direc || !id_usuario) {
            res.json({
                isSuccess: false,
                mensaje: 'Se requieren todos los campos'
            });
            return;
        }

        //Verificar que el reparto exista
        const [verificarReparto]: any[] = await pool.query(`SELECT COUNT(*) as count FROM ${tbReparto} WHERE id = ?`, [id_reparto]);
        if (verificarReparto[0].count === 0) {
            res.json({
                isSuccess: false,
                mensaje: 'El reparto no existe'
            });
            return;
        }

        //Verificar que el tipo de comprobante sea 1 o 2
        if (tipo_comprobante !== 1 && tipo_comprobante !== 2) {
            res.json({
                isSuccess: false,
                mensaje: 'El tipo de comprobante debe ser 1 o 2'
            });
            return;
        }

        //Verificar que el metodo de pago exista
        const [verificarMetodoPago]: any[] = await pool.query(`SELECT COUNT(*) as count FROM ${tbMetodoPago} WHERE id = ?`, [id_metodo_pago]);
        if (verificarMetodoPago[0].count === 0) {
            res.json({
                isSuccess: false,
                mensaje: 'El metodo de pago no existe'
            });
            return;
        }

        //Verificar que el tipo de documento sea 1 o 6
        if (tipo_doc !== 1 && tipo_doc !== 6) {
            res.json({
                isSuccess: false,
                mensaje: 'El tipo de documento debe ser 1 o 6'
            });
            return;
        }

        //Verificar que el id_usuario exista
        const [verificarUsuario]: any[] = await pool.query(`SELECT COUNT(*) as count FROM ${tbUsuario} WHERE id = ?`, [id_usuario]);
        if (verificarUsuario[0].count === 0) {
            res.json({
                isSuccess: false,
                mensaje: 'El usuario no existe'
            });
            return;
        }

        //Traer Lista de Items del Reparto con tipo de paquete
        const [[items]]: any = await pool.query(`CALL getAllItemsReparto(?);`, [id_reparto]);
        if (items.length == 0) {
            res.json({
                isSuccess: false,
                mensaje: 'Debe haber al menos un item'
            });
            return;
        }

        const itemsNubefact: any[] = []

        items.forEach((item: any) => {
            let precioUn = item.precio / 1.18;
            precioUn = +(precioUn.toFixed(4)); // limita a 4 decimales

            let igv = item.precio - precioUn;
            igv = +(igv.toFixed(4)); // limita a 4 decimales

            itemsNubefact.push({
                "unidad_de_medida": "ZZ",
                "codigo": item.id,
                "codigo_producto_sunat": "",
                "descripcion": `Servicio de transporte de ${item.cant} (${item.tipo_paquete})`,
                "cantidad": 1,
                "valor_unitario": precioUn,
                "precio_unitario": item.precio,
                "descuento": "",
                "subtotal": precioUn,
                "tipo_de_igv": 1,
                "igv": igv,
                "total": item.precio,
                "anticipo_regularizacion": false,
                "anticipo_documento_serie": "",
                "anticipo_documento_numero": ""
            })
        });
        let total = itemsNubefact.reduce((total, currentItem) => total + Number(currentItem.total), 0);
        total = +(total.toFixed(4)); // limita a 4 decimales

        let montoBase = total / 1.18;
        montoBase = +(montoBase.toFixed(4)); // limita a 4 decimales

        let mongoIgv = total - montoBase;
        mongoIgv = +(mongoIgv.toFixed(4));

        if (+(montoBase + mongoIgv).toFixed(4) !== total) {
            console.log('La suma de montoBase e igv no es igual a total');
        }

        //Obtener Credenciales
        const [credenciales]: any[] = await pool.query(`SELECT * FROM ${tb_contador} WHERE ruc = ? LIMIT 1`, [ruc]);
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
        if (tipo_comprobante === 1) {
            serie = credenciales[0].serie_f;
            num_serie = credenciales[0].num_f + 1;
        } else if (tipo_comprobante === 2) {
            serie = credenciales[0].serie_b;
            num_serie = credenciales[0].num_b + 1;
        } else {
            res.json({
                isSuccess: false,
                mensaje: 'El tipo de comprobante no es válido'
            });
            return;
        }

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
            "total_igv": mongoIgv,
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

        const call = await axios.post(
            ruta,
            data,
            {
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json',
                }
            }
        )

        if (call.status !== 200) {
            res.json({
                isSuccess: false,
                mensaje: call.data?.errors
            });
            return;
        }

        const { enlace, enlace_del_pdf, enlace_del_xml, enlace_del_cdr } = call.data;
        const query = `INSERT INTO ${tbComprobante} (id_reparto, ruc, tipo_comprobante, serie, num_serie, id_metodo_pago, num_operacion, foto_operacion, tipo_doc, documento, nombre, direc, correo, telefono, id_usuario, enlace, url_pdf, url_xml, url_cdr) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
        const [result]: any[] = await pool.query(query, [id_reparto, ruc, tipo_comprobante, serie, num_serie, id_metodo_pago, num_operacion, foto_operacion, tipo_doc, documento, nombre, direc, correo, telefono, id_usuario, enlace, enlace_del_pdf, enlace_del_xml, enlace_del_cdr]);

        //Subir Contador
        const [resContador]: any[] = await pool.query(`CALL subirContador(?,?)`, [tipo_comprobante, num_serie])

        if (result.affectedRows === 1 && resContador.affectedRows === 1) {
            res.json({
                isSuccess: true,
                mensaje: 'Comprobante insertado correctamente'
            });
        } else {
            res.json({
                isSuccess: false,
                mensaje: 'Error al insertar comprobante'
            })
        }

    } catch (error: any) {
        if (error.response && error.response.status === 400) {
            const mensajeError = error.response.data?.errors ?? "Error al insertar comprobante";
            res.json({ isSuccess: false, mensaje: mensajeError });
        } else {
            res.json({ isSuccess: false, mensaje: error.message });
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

const actualizar = (req: Request, res: Response) => {

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
    actualizar,
    setActivoComprobante
}