import { Request, Response } from 'express';
import axios from "axios";
import connect from '../mysql';

const listarTodos = async (req: Request, res: Response) => {
    try {
        const db = await connect();
        const query = 'SELECT * FROM comprobantes';
        const destinos = await db.query(query);
        res.json(destinos);
    } catch (error) {
        console.error('Error al recuperar datos de la tabla Comprobantes:', error);
        res.status(500).json({ error: 'Ocurrió un error al obtener los datos de la tabla Comprobantes' });
    }
};


const insertar = async (req: Request, res: Response) => {
    try {

        const db = await connect();
        const { tipoComprobante, tipoDoc, documento, nombre, direc, correo, items, idReparto } = req.body;
        if (!Array.isArray(items)) {
            console.error('El campo "items" no es una lista.');
            res.status(400).json({ error: 'El campo "items" debe ser una lista.' });
            return;
        }

        if (items.length == 0) {
            res.status(404).json({ error: 'Minimo debe haber un item' });
            return;
        }

        const itemsNubefact: any[] = []

        items.forEach(item => {
            const precioUn = item.precio / 1.18
            const igv = item.precio - precioUn;
            itemsNubefact.push(
                {
                    "unidad_de_medida": "ZZ",
                    "codigo": item.id,
                    "codigo_producto_sunat": "",
                    "descripcion": `SERVICIO REPARTO A DOMICILIO DE ${item.cant} Cajas`,
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

        const total = itemsNubefact.reduce((total, currentItem) => total + currentItem.total, 0);
        const montoBase = total / 1.18
        const mongoIgv = total - montoBase;

        let serie = '';

        if (tipoComprobante == 1) {
            serie = 'FFF1';
        } else if (tipoComprobante == 2) {
            serie = 'BBB1'
        }
        const query = 'SELECT IFNULL(MAX(numero) + 1, 1) AS numero FROM comprobantes WHERE tipo_comprobante = ?'
        const [{ numero }]: any = await db.query(query, [tipoComprobante]);
        const url = 'https://api.pse.pe/api/v1/6baf3f2f6c284defa9cf148782cdb136f19c6f2ec1b84e8eb9f4144f67df2145'
        const token = 'eyJhbGciOiJIUzI1NiJ9.ImMzYTljNmI5YWJlZTQ0ZDFiMjExZmRlMzIxNTE1ZDRhM2VkODFlMDQ1OTkyNDMyZDk3NTI2NjVjMDY2NDEzZGUi.oRgBsVpXqZlgJ1OPBQd0TpLEyeFrtWppa2vE92GjYA0'
        const data = {
            "operacion": "generar_comprobante",
            "tipo_de_comprobante": tipoComprobante,
            "serie": serie,
            "numero": numero,
            "sunat_transaction": 1,
            "cliente_tipo_de_documento": tipoDoc,
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

        const headers = {
            'Authorization': token,
            'Content-Type': 'application/json',
        };


        const call = await axios.post(url, data, { headers });
        if (call.data) {
            const { tipo_de_comprobante, serie, numero, enlace, enlace_del_pdf, enlace_del_xml } = call.data;

            const query = 'INSERT INTO comprobantes (tipo_comprobante,serie,numero,enlace,enlace_pdf,enlace_xml,id_reparto) VALUES (?,?,?,?,?,?,?)'
            const result: any = await db.query(query, [tipo_de_comprobante, serie, numero, enlace, enlace_del_pdf, enlace_del_xml, idReparto]);
            if (result.affectedRows === 1) {
                res.json({ message: 'Comprobante insertado correctamente' });
            } else {
                res.status(500).json({ error: 'No se pudo insertar el destino' });
            }
        } else {
            res.json({ error: 'Error al generar comprobante' })
        }
    } catch (error: any) {
        if (error.response) {
            res.json(error.response.data);
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
const eliminar = (req: Request, res: Response) => {

};

export default {
    listarTodos,
    insertar,
    actualizar,
    eliminar
}