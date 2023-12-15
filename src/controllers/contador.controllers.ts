import { Request, Response } from 'express';
import { pool } from '../db';
import { tbDistrito, tb_contador } from '../func/tablas';

const get = async (req: Request, res: Response) => {
    try {
        const { ruc } = req.query;

        if (!ruc) {
            return res.json({
                isSuccess: false,
                mensaje: 'Es necesario un RUC'
            })
        }

        //Verificar si el RUC existe
        const [verificar]: any[] = await pool.query(`SELECT COUNT(*) AS count FROM ${tb_contador} WHERE ruc = ?`, [ruc]);
        if (verificar[0].count === 0) {
            return res.json({
                isSuccess: false,
                mensaje: 'RUC no encontrado'
            });
        }

        const query = `SELECT * FROM ${tb_contador} WHERE ruc = ? LIMIT 1`;
        const [call]: any[] = await pool.query(query, [ruc]);
        if (call.length === 0) {
            return res.json({
                isSuccess: false,
                mensaje: `No se encontró el ID ${ruc}`
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
        const [verificar]: any[] = await pool.query(`SELECT COUNT(*) AS count FROM ${tb_contador} WHERE ruc = ?`, [ruc]);
        if (verificar[0].count > 0) {
            return res.json({
                isSuccess: false,
                mensaje: 'RUC ya existe'
            });
        }

        const query = `INSERT INTO ${tb_contador} (ruc, serie_f, num_f, serie_b, num_b, ruta, token, razon_social) VALUES (?,?,?,?,?,?,?,?)`;
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
        const { ruc } = req.query;
        const { ruta, token, razon_social, serie_f, num_f, serie_b, num_b } = req.body;

        if (!ruc || !serie_f || !num_f || !serie_b || !num_b || !ruta || !token || !razon_social) {
            return res.json({
                isSuccess: false,
                mensaje: 'Faltan campos requeridos, por favor verifique.'
            });
        }

        //Verificar si el RUC existe
        const [verificarID]: any[] = await pool.query(`SELECT COUNT(*) AS count FROM ${tb_contador} WHERE ruc = ?`, [ruc]);
        if (verificarID[0].count === 0) {
            return res.json({
                isSuccess: false,
                mensaje: 'ID no encontrado'
            });
        }

        const query = `UPDATE ${tb_contador} SET ruta = ?, token = ?, razon_social = ?, serie_f = ?, num_f = ?, serie_b = ?, num_b = ? WHERE ruc = ?`;
        const [result]: any[] = await pool.query(query, [ruta, token, razon_social, serie_f, num_f, serie_b, num_b, ruc]);

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

const setActivoDistrito = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const { activo } = req.body;

        if (!activo) {
            return res.json({
                isSuccess: false,
                mensaje: 'Se requiere del activo'
            })
        }

        //Verificar si el distrito existe
        const [verificar]: any[] = await pool.query(`SELECT COUNT(*) AS count FROM ${tbDistrito} WHERE id = ?`, [id]);
        if (verificar[0].count === 0) {
            return res.json({
                isSuccess: false,
                mensaje: 'Distrito no encontrado'
            });
        }

        //Actualizar el activo
        const [updateResult]: any[] = await pool.query(`UPDATE ${tbDistrito} SET activo = ? WHERE id = ?`, [activo, id]);

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

    } catch (error: any) {
        res.json({
            isSuccess: false,
            mensaje: error.message
        });
    }
};

export default { get, insert, update }