import axios from 'axios';
import { pool } from '../db';
import { tbCliente, tbComprobante, tbDistrito, tbHistorialReparto, tbItemReparto, tbPendientesAnulacion, tbTipoDoc, tbTipoOperacion, tbUsuario } from './tablas';

export const getDistritoById = async (id: number) => {
    try {
        const [call]: any[] = await pool.query(`SELECT nombre FROM ${tbDistrito} WHERE id = ? LIMIT 1`, [id]);
        return call[0]?.nombre || null;
    } catch {
        return null;
    }
};

export const getTipoDocByCod = async (cod: number) => {
    try {
        const [call]: any[] = await pool.query(`SELECT * FROM ${tbTipoDoc} WHERE cod = ? LIMIT 1`, [cod]);
        if (call[0]) {
            delete call[0].id;
            delete call[0].cod;
        }
        return call[0] || null;
    } catch {
        return null;
    }
};

export const getClienteById = async (id: number) => {
    try {
        const query = `SELECT * FROM ${tbCliente} WHERE id = ? LIMIT 1`;
        const [resultado]: any[] = await pool.query(query, [id]);
        if (resultado.length === 0) {
            return null;
        } else {
            return {
                cod_tipodoc: resultado[0].cod_tipodoc,
                tipodoc: await getTipoDocByCod(resultado[0].cod_tipodoc),
                documento: resultado[0].documento,
                nombres: resultado[0].nombres,
                telefono: resultado[0].telefono,
                correo: resultado[0].correo,
                genero: resultado[0].genero,
                id_distrito: resultado[0].id_distrito,
                distrito: await getDistritoById(resultado[0].id_distrito),
                direc: resultado[0].direc,
                referencia: resultado[0].referencia,
                url_maps: resultado[0].url_maps,
                activo: resultado[0].activo
            }
        }
    } catch (error) {
        return null;
    }
}

export const getUsuarioById = async (id: number) => {
    try {
        const [resultado]: any[] = await pool.query(`SELECT * FROM ${tbUsuario} WHERE id = ? LIMIT 1`, [id]);
        if (resultado.length === 0) {
            return null;
        } else {
            const res = resultado[0];
            delete res.clave;
            delete res.id;
            return res;
        }
    } catch (error) {
        return null;
    }
};

export const getComprobanteById = async (id: number) => {
    try {
        const [resultado]: any[] = await pool.query(`SELECT * FROM ${tbComprobante} WHERE id = ? LIMIT 1`, [id]);
        if (resultado.length === 0) {
            return null;
        } else {
            const { tipo_comprobante, serie, num_serie } = resultado[0];
            return { tipo_comprobante, serie, num_serie };
        }
    } catch (error) {
        return null;
    }
};

export const getItemsRepartoByRepartoId = async (id: number) => {
    try {
        const [items]: any[] = await pool.query(`SELECT * FROM ${tbItemReparto} WHERE id_reparto = ?`, [id]);
        return items;
    } catch (error) {
        console.log(error);
        return []
    }
};

export const getMovimientosRepartoByRepartoId = async (id: number) => {
    try {
        const [movimientos]: any[] = await pool.query(`SELECT th.*, tu.nombres as nombre, tt.nombre as tipo_operacion FROM ${tbHistorialReparto} th LEFT JOIN ${tbUsuario} tu ON th.id_usuario = tu.id LEFT JOIN ${tbTipoOperacion} tt ON th.id_tipo_operacion = tt.id WHERE id_reparto = ?`, [id]);
        return movimientos;
    } catch (error) {
        console.log(error);
        return []
    }
};

export const eliminarComprobantesSunat = async () => {
    try {

        const [pendientes]: any[] = await pool.query(`SELECT * FROM ${tbPendientesAnulacion} WHERE estado_anulacion = 'P'`)
        if (pendientes.length > 0) {
            for (const pendiente of pendientes) {
                const { tipo_comprobante, serie, num_serie, motivo, ruta, token } = pendiente;

                const data = {
                    "operacion": "generar_anulacion",
                    "tipo_de_comprobante": tipo_comprobante,
                    "serie": serie,
                    "numero": num_serie,
                    "motivo": motivo || "ANULACION POR ERROR"
                }
                try {
                    const call = await axios.post(ruta, data, { headers: { 'Authorization': token, 'Content-Type': 'application/json', } })
                    if (call.status !== 200) {
                        console.log('Error al anular comprobante:', call.data);
                        return;
                    }
                    const { errors, sunat_description, enlace } = call.data;

                    let mensaje_sunat = '';
                    if (sunat_description) {
                        mensaje_sunat = sunat_description;
                    } else {
                        mensaje_sunat = errors;
                    }

                    const queryUpdate = `UPDATE ${tbPendientesAnulacion} SET estado_anulacion = ?, mensaje_sunat = ?, enlace_anulacion = ? WHERE id = ?`;
                    await pool.query(queryUpdate, ['E', mensaje_sunat, enlace, pendiente.id]);

                } catch (error: any) {
                    const queryUpdate = `UPDATE ${tbPendientesAnulacion} SET mensaje_sunat = ? WHERE id = ?`;
                    await pool.query(queryUpdate, [error.message, pendiente.id]);
                }

            }
        }

    } catch (error) {
        console.log(error);
    }
};

export const verificarAnulacionesSunat = async () => {
    try {

        const [pendientes]: any[] = await pool.query(`SELECT * FROM ${tbPendientesAnulacion} WHERE estado_anulacion = 'P'`)
        if (pendientes.length > 0) {
            for (const pendiente of pendientes) {
                const { tipo_comprobante, serie, num_serie, motivo, ruta, token } = pendiente;

                const data = {
                    "operacion": "consultar_comprobante",
                    "tipo_de_comprobante": tipo_comprobante,
                    "serie": serie,
                    "numero": num_serie
                }
                try {
                    const call = await axios.post(ruta, data, { headers: { 'Authorization': token, 'Content-Type': 'application/json', } })
                    if (call.status !== 200) {
                        console.log('Error al anular comprobante:', call.data);
                        return;
                    }
                    const { errors, sunat_description, enlace } = call.data;

                    let mensaje_sunat = '';
                    if (sunat_description) {
                        mensaje_sunat = sunat_description;
                    } else {
                        mensaje_sunat = errors;
                    }

                    const queryUpdate = `UPDATE ${tbPendientesAnulacion} SET estado_anulacion = ?, mensaje_sunat = ?, enlace_anulacion = ? WHERE id = ?`;
                    await pool.query(queryUpdate, ['E', mensaje_sunat, enlace, pendiente.id]);

                } catch (error: any) {
                    const queryUpdate = `UPDATE ${tbPendientesAnulacion} SET mensaje_sunat = ? WHERE id = ?`;
                    await pool.query(queryUpdate, [error.message, pendiente.id]);
                }

            }
        }
    } catch (error: any) {
        console.log(error.message);

    }
};