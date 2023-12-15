import { Request, Response } from 'express';
import { pool } from '../db';
import { tbEmpresa } from '../func/tablas';

const get = async (req: Request, res: Response) => {
    try {
        const { id_ruc } = req.query;

        if (!id_ruc) {
            return res.json({
                isSuccess: false,
                mensaje: 'Es necesario un RUC'
            })
        }

        //Verificar si el RUC existe
        const [verificar]: any[] = await pool.query(`SELECT COUNT(*) AS count FROM ${tbEmpresa} WHERE id = ?`, [id_ruc]);
        if (verificar[0].count === 0) {
            return res.json({
                isSuccess: false,
                mensaje: 'RUC no encontrado'
            });
        }

        const query = `SELECT * FROM ${tbEmpresa} WHERE id = ? LIMIT 1`;
        const [call]: any[] = await pool.query(query, [id_ruc]);
        if (call.length === 0) {
            return res.json({
                isSuccess: false,
                mensaje: `No se encontró el ID ${id_ruc}`
            });
        }

        res.json({
            isSuccess: true,
            data: call[0]
        });
    } catch (error: any) {
        res.json({
            isSuccess: false,
            mensaje: error.message
        });
    }
};

const insert = async (req: Request, res: Response) => {
    try {
        const { ruc, ruta, token, razon_social, serie_f, num_f, serie_b, num_b } = req.body;

        if (!ruc || !serie_f || !num_f || !serie_b || !num_b || !ruta || !token || !razon_social) {
            return res.json({
                isSuccess: false,
                mensaje: 'Faltan campos requeridos, por favor verifique.'
            });
        }

        //Verificar si RUC existe
        const [verificar]: any[] = await pool.query(`SELECT COUNT(*) AS count FROM ${tbEmpresa} WHERE ruc = ?`, [ruc]);
        if (verificar[0].count > 0) {
            return res.json({
                isSuccess: false,
                mensaje: 'RUC ya existe'
            });
        }

        const query = `INSERT INTO ${tbEmpresa} (ruc, serie_f, num_f, serie_b, num_b, ruta, token, razon_social) VALUES (?,?,?,?,?,?,?,?)`;
        const [result]: any[] = await pool.query(query, [ruc, serie_f, num_f, serie_b, num_b, ruta, token, razon_social]);

        if (result.affectedRows === 1) {
            res.json({
                isSuccess: true,
                mensaje: 'Insertado correctamente',
                data: result.insertId
            });
        } else {
            res.json({
                isSuccess: false,
                mensaje: 'No se pudo insertar'
            });
        }
    } catch (error: any) {
        res.json({
            isSuccess: false,
            mensaje: error.message
        });
    }
};

const update = async (req: Request, res: Response) => {
    try {
        const { id_ruc, ruta, token, serie_f, num_f, serie_b, num_b } = req.body;

        if (!id_ruc || !serie_f || !serie_b || !ruta || !token) {
            return res.json({
                isSuccess: false,
                mensaje: 'Faltan campos requeridos, por favor verifique.'
            });
        }

        //Verificar si el RUC existe
        const [verificarID]: any[] = await pool.query(`SELECT COUNT(*) AS count FROM ${tbEmpresa} WHERE id = ?`, [id_ruc]);
        if (verificarID[0].count === 0) {
            return res.json({
                isSuccess: false,
                mensaje: 'ID no encontrado'
            });
        }

        const query = `UPDATE ${tbEmpresa} SET ruta = ?, token = ?, serie_f = ?, num_f = ?, serie_b = ?, num_b = ? WHERE id = ?`;
        const [result]: any[] = await pool.query(query, [ruta, token, serie_f, num_f, serie_b, num_b, id_ruc]);

        if (result.affectedRows === 1) {
            res.json({
                isSuccess: true,
                mensaje: 'Actualizado correctamente'
            });
        } else {
            res.json({
                isSuccess: false,
                mensaje: 'No se pudo actualizar'
            });
        }
    } catch (error: any) {
        res.json({
            isSuccess: false,
            mensaje: error.message
        });
    }
};

export default { get, insert, update }