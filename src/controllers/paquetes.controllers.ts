import { Request, Response } from 'express';
import { pool } from '../db';
import { tbEmpresa, tbTipoPaquete } from '../func/tablas';

const getAllPaquetes = async (req: Request, res: Response) => {
    try {
        const { estado, id_ruc } = req.query;

        //Verificar si existe el id_ruc
        if (!id_ruc) {
            return res.json({
                isSuccess: false,
                mensaje: 'El campo id_ruc es requerido.'
            });
        }

        //Verificar si la empresa existe
        const [empresa]: any[] = await pool.query(`SELECT COUNT(*) as count FROM ${tbEmpresa} WHERE id = ?`, [id_ruc]);
        if (empresa[0].count === 0) {
            return res.json({
                isSuccess: false,
                mensaje: `La empresa con ID: ${id_ruc} no existe`
            });
        }

        let query = `SELECT * FROM ${tbTipoPaquete} WHERE id_ruc = ?`;
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

const getPaquete = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const query = `SELECT * FROM ${tbTipoPaquete} WHERE id = ? LIMIT 1`;
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
    } catch (error: any) {
        res.json({
            isSuccess: false,
            mensaje: error.message
        });
    }
};

const insertPaquete = async (req: Request, res: Response) => {
    try {
        const { nombre, id_ruc } = req.body;

        //Verificarlos cmapos estan completos
        if (!nombre || !id_ruc) {
            return res.json({
                isSuccess: false,
                mensaje: 'Los campos "nombre" y "id_ruc" son requeridos.'
            });
        }

        //Verificar si la empresa existe
        const [empresa]: any[] = await pool.query(`SELECT COUNT(*) as count FROM ${tbEmpresa} WHERE id = ?`, [id_ruc]);
        if (empresa[0].count === 0) {
            return res.json({
                isSuccess: false,
                mensaje: `La empresa con ID: ${id_ruc} no existe`
            });
        }

        //Verificar si el nombre ya existe en la tabla
        const [rows]: any[] = await pool.query(`SELECT COUNT(*) as count FROM ${tbTipoPaquete} WHERE nombre = ? AND id_ruc = ?`, [nombre, id_ruc]);
        if (rows[0].count > 0) {
            return res.json({
                isSuccess: false,
                mensaje: `El tipo paquete ${nombre} ya existe`
            });
        }

        const [result]: any[] = await pool.query(`INSERT INTO ${tbTipoPaquete} (id_ruc, nombre) VALUES (?,?)`, [id_ruc, nombre]);

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
    } catch (error: any) {
        res.json({
            isSuccess: false,
            mensaje: error.message
        });
    }
};

const updatePaquete = async (req: Request, res: Response) => {
    try {
        const { id, nombre, id_ruc } = req.body;

        //Verificar si existe el nombre
        if (!nombre) {
            return res.json({
                isSuccess: false,
                mensaje: 'El campo "nombre" es requerido para la actualización.'
            });
        }

        // Verificar que el paquete exista
        const [rows]: any[] = await pool.query(`SELECT COUNT(*) as count FROM ${tbTipoPaquete} WHERE id = ?`, [id]);
        if (rows[0].count === 0) {
            return res.json({
                isSuccess: false,
                mensaje: `El paquete con ID: ${id} no existe`
            });
        }

        //Verificamos si el nombre ya existe
        const [nombreExistente]: any[] = await pool.query(`SELECT COUNT(*) AS count FROM ${tbTipoPaquete} WHERE nombre = ? AND id != ? AND id_ruc = ?`, [nombre, id, id_ruc]);
        if (nombreExistente[0].count > 0) {
            return res.json({
                isSuccess: false,
                mensaje: 'El nombre ya existe'
            });
        }

        //Actualizar el Paquete
        const query = `UPDATE ${tbTipoPaquete} SET nombre = ? WHERE id = ?`;
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
    } catch (error: any) {
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
        const [rows]: any[] = await pool.query(`SELECT COUNT(*) as count FROM ${tbTipoPaquete} WHERE id = ?`, [id]);
        if (rows[0].count === 0) {
            return res.json({
                isSuccess: false,
                mensaje: `El paquete con ID: ${id} no existe`
            });
        }

        //Actualizar el activo del paquete
        const [updateResult]: any[] = await pool.query(`UPDATE ${tbTipoPaquete} SET activo = ? WHERE id = ?`, [activo, id]);
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
}


export default { getAllPaquetes, getPaquete, insertPaquete, updatePaquete, setActivoPaquete }