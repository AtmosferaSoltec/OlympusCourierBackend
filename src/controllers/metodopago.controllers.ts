import { Request, Response } from 'express';
import { pool } from '../db';
import { tbEmpresa, tbMetodoPago } from '../func/tablas';
import { RequestWithUser } from '../interfaces/usuario';

const getAll = async (req: RequestWithUser, res: Response) => {
    try {
        const { id_ruc } = req.user;
        const { estado } = req.query;
        //Verificar si el estado y el id_ruc son válidos
        if (!estado) {
            return res.json({
                isSuccess: false,
                mensaje: 'El campo estado es requerido.'
            });
        }

        let query = `SELECT * FROM ${tbMetodoPago} WHERE id_ruc = ?`;
        switch (estado?.toString().toUpperCase()) {
            case 'S':
                query += " AND activo = 'S'";
                break;
            case 'N':
                query += " AND activo = 'N'";
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
        const [call]: any[] = await pool.query(query, [id_ruc]);
        res.json({
            isSuccess: true,
            data: call
        });
    } catch (error: any) {
        res.json({
            isSuccess: false,
            mensaje: error.message
        });
    }
};

const insert = async (req: RequestWithUser, res: Response) => {
    try {
        const { id_ruc } = req.user;
        const { nombre } = req.body;

        if (!nombre) {
            return res.json({
                isSuccess: false,
                mensaje: 'Campo nombre es requerido.'
            });
        }

        //Verificar si el nombre ya existe
        const [verificarNombre]: any[] = await pool.query(`SELECT COUNT(*) AS count FROM ${tbMetodoPago} WHERE nombre = ? AND id_ruc = ?`, [nombre, id_ruc]);
        if (verificarNombre[0].count > 0) {
            return res.json({
                isSuccess: false,
                mensaje: `El nombre ${nombre} ya existe`
            });
        }

        const query = `INSERT INTO ${tbMetodoPago} (id_ruc, nombre) VALUES (?, ?)`;
        const [call]: any[] = await pool.query(query, [id_ruc, nombre]);
        if (call.affectedRows === 0) {
            return res.json({
                isSuccess: false,
                mensaje: 'No se pudo insertar'
            });
        }

        res.json({
            isSuccess: true,
            mensaje: 'Se insertó correctamente'
        });
    } catch (error: any) {
        res.json({
            isSuccess: false,
            mensaje: error.message
        });
    }
}

// Actualizar Metodo de Pago
const update = async (req: Request, res: Response) => {
    try {
        const { id, nombre } = req.body;

        if (!id || !nombre) {
            return res.json({
                isSuccess: false,
                mensaje: 'Faltan campos requeridos, por favor verifique.'
            });
        }

        //Verificar si el id existe
        const [verificar]: any[] = await pool.query(`SELECT COUNT(*) AS count FROM ${tbMetodoPago} WHERE id = ?`, [id]);
        if (verificar[0].count === 0) {
            return res.json({
                isSuccess: false,
                mensaje: 'ID no encontrado'
            });
        }

        //Verificar si el nombre ya existe
        const [verificarNombre]: any[] = await pool.query(`SELECT COUNT(*) AS count FROM ${tbMetodoPago} WHERE nombre = ? AND id != ?`, [nombre, id]);
        if (verificarNombre[0].count > 0) {
            return res.json({
                isSuccess: false,
                mensaje: `El nombre ${nombre} ya existe`
            });
        }

        const query = `UPDATE ${tbMetodoPago} SET nombre = ? WHERE id = ?`;
        const [call]: any[] = await pool.query(query, [nombre, id]);
        if (call.affectedRows === 0) {
            return res.json({
                isSuccess: false,
                mensaje: 'No se pudo actualizar'
            });
        }

        res.json({
            isSuccess: true,
            mensaje: 'Se actualizó correctamente'
        });
    } catch (error: any) {
        res.json({
            isSuccess: false,
            mensaje: error.message
        });
    }
}

const setActivo = async (req: Request, res: Response) => {
    try {
        const { id, activo } = req.body;

        if (!id || !activo) {
            return res.json({
                isSuccess: false,
                mensaje: 'Faltan campos requeridos, por favor verifique.'
            });
        }

        //Verificar si el id existe
        const [verificar]: any[] = await pool.query(`SELECT COUNT(*) AS count FROM ${tbMetodoPago} WHERE id = ?`, [id]);
        if (verificar[0].count === 0) {
            return res.json({
                isSuccess: false,
                mensaje: 'ID no encontrado'
            });
        }

        const query = `UPDATE ${tbMetodoPago} SET activo = ? WHERE id = ?`;
        const [call]: any[] = await pool.query(query, [activo, id]);
        if (call.affectedRows === 0) {
            return res.json({
                isSuccess: false,
                mensaje: 'No se pudo actualizar'
            });
        }

        res.json({
            isSuccess: true,
            mensaje: 'Se actualizó correctamente'
        });
    } catch (error: any) {
        res.json({
            isSuccess: false,
            mensaje: error.message
        });
    }
}

export default { getAll, insert, update, setActivo }