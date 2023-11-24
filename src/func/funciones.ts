import { pool } from '../db';
import { tbCliente, tbDistrito, tbItemReparto, tbTipoDoc, tbUsuario } from './tablas';

export const getDistritoById = async (id: number) => {
    try {
        const [call]: any[] = await pool.query(`SELECT nombre FROM ${tbDistrito} WHERE id = ? LIMIT 1`, [id]);
        if (call.length === 0) {
            return '';
        } else {
            return call[0].nombre;
        }
    } catch {
        return '';
    }
};

export const getTipoDocByCod = async (cod: number) => {
    try {
        const [call]: any[] = await pool.query(`SELECT * FROM ${tbTipoDoc} WHERE cod = ? LIMIT 1`, [cod]);
        if (call.length === 0) {
            return null;
        } else {
            delete call[0].id;
            delete call[0].cod;
            return call[0];
        }
    } catch (err) {
        console.log(err);
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
                distrito_id: resultado[0].distrito_id,
                distrito: await getDistritoById(resultado[0].distrito_id),
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

export const getItemsRepartoByRepartoId = async (id: number) => {
    try {
        const [items]: any[] = await pool.query(`SELECT * FROM ${tbItemReparto} WHERE id_reparto = ?`, [id]);
        return items;
    } catch (error) {
        console.log(error);
        return []
    }
};