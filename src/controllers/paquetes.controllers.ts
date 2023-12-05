import { Request, Response } from 'express';
import { pool } from '../db';

const tabla = 'tipo_paquete';

const getAllPaquetes = async (req: Request, res: Response) => {
    try {
        const query = `SELECT * FROM ${tabla}`;
        const [call]: any[] = await pool.query(query);
        res.json({
            isSuccess: true,
            data: call
        });
    } catch (error:any) {
        res.json({
            isSuccess: false,
            mensaje: error.message
        });
    }
};

const getPaquete = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const query = `SELECT * FROM ${tabla} WHERE id = ? LIMIT 1`;
        const [call]: any[] = await pool.query(query, [id]);
        if (call.length === 0) {
            return res.json({
                isSuccess: false,
                mensaje: `No se encontró el ID`
            });
        }

        res.json({
            isSuccess: true,
            data: call[0]
        });
    } catch (error:any) {
        res.json({
            isSuccess: false,
            mensaje: error.message
        });
    }
};

const insertPaquete = async (req: Request, res: Response) => {
    try {
        const { nombre } = req.body;

        //Verificarlos cmapos estan completos
        if (!nombre) {
            return res.json({
                isSuccess: false,
                mensaje: 'El campo nombre es requerido.'
            });
        }

        //Verificar si el nombre ya existe en la tabla
        const [rows]: any[] = await pool.query(`SELECT COUNT(*) as count FROM ${tabla} WHERE nombre = ?`, [nombre]);
        if (rows[0].count > 0) {
            return res.json({
                isSuccess: false,
                mensaje: `El tipo paquete ${nombre} ya existe`
            });
        }

        const [result]: any[] = await pool.query(`INSERT INTO ${tabla} (nombre) VALUES (?)`, [nombre]);

        if (result.affectedRows === 1) {
            res.json({
                isSuccess: true,
                mensaje: 'Tipo Paquete insertado correctamente',
                data: result.insertId
            });
        } else {
            res.json({
                isSuccess: false,
                data: 'No se pudo insertar',
            });
        }
    } catch (error:any) {
        res.json({
            isSuccess: false,
            mensaje: error.message
        });
    }
};

const updatePaquete = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const { nombre } = req.body;

        //Verificar si existe el nombre
        if (!nombre) {
            return res.json({
                isSuccess: false,
                mensaje: 'El campo "nombre" es requerido para la actualización.'
            });
        }

        // Verificar que el paquete exista
        const [rows]: any[] = await pool.query(`SELECT COUNT(*) as count FROM ${tabla} WHERE id = ?`, [id]);
        if (rows[0].count === 0) {
            return res.json({
                isSuccess: false,
                mensaje: `El paquete con ID: ${id} no existe`
            });
        }

        //Actualizar el Paquete
        const query = `UPDATE ${tabla} SET nombre = ? WHERE id = ?`;
        const [result]: any[] = await pool.query(query, [nombre, id]);

        if (result.affectedRows === 1) {
            res.json({
                isSuccess: true,
                mensaje: 'TipoPaquete actualizado correctamente'
            });
        } else {
            res.json({
                isSuccess: false,
                mensaje: 'No se encontró el id para actualizar'
            });
        }
    } catch (error:any) {
        res.json({
            isSuccess: false,
            mensaje: error.message
        });
    }
};

const setActivoPaquete = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        const { activo } = req.body;

        if (!activo) {
            return res.json({
                isSuccess: false,
                mensaje: 'Se requiere del activo'
            })
        }
        
        // Verificar que el paquete exista con COUNT(*) as count
        const [rows]: any[] = await pool.query(`SELECT COUNT(*) as count FROM ${tabla} WHERE id = ?`, [id]);
        if (rows[0].count === 0) {
            return res.json({
                isSuccess: false,
                mensaje: `El paquete con ID: ${id} no existe`
            });
        }

        //Actualizar el activo del paquete
        const [updateResult]: any[] = await pool.query(`UPDATE ${tabla} SET activo = ? WHERE id = ?`, [activo, id]);
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
    } catch (error:any) {
        res.json({
            isSuccess: false,
            mensaje: error.message
        });
    }
}


export default { getAllPaquetes, getPaquete, insertPaquete, updatePaquete, setActivoPaquete }