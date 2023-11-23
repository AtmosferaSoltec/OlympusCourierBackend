import connect from '../mysql';
import { tbDistrito } from './tablas';

export const getDistritoById = async (id: number) => {
    try {
        const db = await connect();
        const [call]: any[] = await db.query(`SELECT nombre FROM ${tbDistrito} WHERE id = ? LIMIT 1`, [id]);
        console.log(call);

        if (call.length === 0) {
            return '';
        } else {
            return call[0].nombre;
        }
    } catch {
        return '';
    }
};



export const getClienteById = async (id: number) => {
    try {
        const db = await connect();
        const query = 'SELECT * FROM clientes WHERE id = ? LIMIT 1';
        const [resultado]: any[] = await db.query(query, [id]);
        if (resultado.length === 0) {
            return null;

        } else {

            return {
                tipo_doc: resultado[0].tipo_doc,
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
            }
        }
    } catch (error) {
        return null;
    }
}

export const getUsuarioById = async (id: number) => {
    try {
        const db = await connect();
        const query = 'SELECT * FROM usuarios WHERE id = ? LIMIT 1';
        const [resultado]: any[] = await db.query(query, [id]);
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