import { Request, Response } from 'express';
import { pool } from '../db';
import { tbDistrito } from '../func/tablas';

const getAllDistritos = async (req: Request, res: Response) => {
    try {
        const query = `SELECT * FROM ${tbDistrito} WHERE activo != "E"`;
        const [call] : any[] = await pool.query(query);
        res.json({
            isSuccess: true,
            data: call
        });
    } catch (error) {
        res.json({
            isSuccess: false,
            mensaje: error,
        });
    }
};

const getDistrito = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const query = `SELECT * FROM ${tbDistrito} WHERE id = ? LIMIT 1`;
        const [call]: any[] = await pool.query(query, [id]);
        if (call.length === 0) {
            return res.status(404).json({
                isSuccess: false,
                mensaje: `No se encontró el ID ${id}`
            });
        }

        res.json({
            isSuccess: true,
            data: call[0]
        });
    } catch (error) {
        res.json({
            isSuccess: false,
            mensaje: error,
        });
    }
};

const insertDistrito = async (req: Request, res: Response) => {
    try {
        const { nombre } = req.body;
        if (!nombre) {
            return res.json({
                isSuccess: false,
                mensaje: 'El campo "nombre" es requerido.'
            });
        }

        const [result]: any[] = await pool.query(`INSERT INTO ${tbDistrito} (nombre) VALUES (?)`, [nombre]);

        if (result.affectedRows === 1) {
            res.json({
                isSuccess: true,
                mensaje: 'Distrito insertado correctamente',
                data: result.insertId
            });
        } else {
            res.json({
                isSuccess: false,
                mensaje: 'No se pudo insertar el distrito'
            });
        }
    } catch (error) {
        res.json({
            isSuccess: false,
            mensaje: error
        });
    }
};

const updateDistrito = async (req: Request, res: Response) => {
    try {
        const destinoId = req.params.id;
        const { nombre } = req.body;

        if (!nombre) {
            return res.json({
                isSuccess: false,
                mensaje: 'El campo "nombre" es requerido para la actualización.'
            });
        }

        const query = `UPDATE ${tbDistrito} SET nombre = ? WHERE id = ?`;
        const [result]: any[] = await pool.query(query, [nombre, destinoId]);

        if (result.affectedRows === 1) {
            res.json({
                isSuccess: true,
                mensaje: 'Distrito actualizado correctamente'
            });
        } else {
            res.json({
                isSuccess: false,
                mensaje: 'No se encontró el distrito para actualizar'
            });
        }
    } catch (error) {
        res.json({
            isSuccess: false,
            mensaje: error
        });
    }
};

const setActivoDistrito = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const { activo } = req.body;

        if(!activo){
            return res.json({
                isSuccess:false,
                mensaje: 'Se requiere del activo'
            })
        }

        const [rows]: any[] = await pool.query(`SELECT * FROM ${tbDistrito} WHERE id = ?`, [id]);
        if (rows.length === 0) {
            res.json({
                isSuccess: false,
                mensaje: `El registro con ID ${id} no existe`
            });
            return;
        };

        const [updateResult]: any[] = await pool.query(`UPDATE ${tbDistrito} SET activo = ? WHERE id = ?`, [activo,id]);

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

    } catch (error) {
        res.json({
            isSuccess: false,
            mensaje: error
        });
    }
};

export default { getAllDistritos, getDistrito, insertDistrito, updateDistrito, setActivoDistrito }