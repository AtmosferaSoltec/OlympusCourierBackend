import { Request, Response } from 'express';
import connect from '../mysql';
import { tbUsuario } from '../func/tablas';

const login = async (req: Request, res: Response) => {
    const db = await connect();
    const { documento, clave } = req.body;

    if (!documento || !clave) {
        return res.json({
            isSuccess: false,
            mensaje: 'Por favor, proporciona documento y contraseña.'
        });
    }

    try {
        const consulta = `SELECT id FROM ${tbUsuario} WHERE documento = ? AND clave = ? LIMIT 1`;
        const resultados: any = await db.query(consulta, [documento, clave]);
        if (resultados.length > 0) {
            res.json({
                isSuccess: true,
                mensaje: 'Inicio de sesión exitoso',
                data: resultados[0].id
            });
        } else {
            res.json({
                isSuccess: false,
                mensaje: 'Credenciales incorrectas'
            });
        }
    } catch (err) {
        console.error(err);
        res.json({
            isSuccess: false,
            mensaje: err
        });
    }
};

const getAllUsuarios = async (req: Request, res: Response) => {
    try {
        const db = await connect();
        const query = `SELECT * FROM ${tbUsuario}`;
        const [destinos]: any = await db.query(query);
        res.json({
            isSuccess: true,
            data: destinos
        });
    } catch (error) {
        res.json({
            isSuccess: true,
            mensaje: error
        });
    }
};

const getUsuario = async (req: Request, res: Response) => {
    try {
        const db = await connect();
        const { id } = req.params;
        const query = `SELECT * FROM ${tbUsuario} WHERE id = ? LIMIT 1`;
        const resultado: any = await db.query(query, [id]);

        if (resultado.length !== undefined && resultado.length > 0) {
            const usuario = resultado[0];
            delete usuario.clave;
            res.json({
                isSuccess: true,
                data: usuario
            });
        } else {
            res.json({
                isSuccess: false,
                mensaje: 'Usuario no encontrado'
            });
        }
    } catch (error) {
        res.json({
            isSuccess: false,
            mensaje: error,
            data: null
        });
    }
};

const insertUsuario = async (req: Request, res: Response) => {
    try {
        const db = await connect();
        const { documento, nombres, ape_materno, ape_paterno, telefono, correo, fecha_nacimiento, clave, rol } = req.body;
        const valores = [
            documento,
            nombres,
            ape_materno || '',
            ape_paterno || '',
            telefono || '',
            correo || '',
            fecha_nacimiento || '1900-01-01',
            clave || '1234',
            rol || 'U'
        ];
        const query = 'INSERT INTO usuarios (documento, nombres, ape_materno, ape_paterno, telefono, correo, fecha_nacimiento, clave, rol) VALUES (?,?,?,?,?,?,?,?,?)'
        const result: any = await db.query(query, valores);

        if (result.affectedRows === 1) {
            res.json({ mensaje: 'Usuario insertado correctamente' });
        } else {
            res.status(500).json({ error: 'No se pudo insertar' });
        }
    } catch (error) {
        res.json({
            isSuccess: false,
            mensaje: error,
            data: null
        });
    }
};

const updateUsuario = async (req: Request, res: Response) => {
    try {
        const db = await connect();
        const destinoId = req.params.id;
        const { documento, nombres, ape_materno, ape_paterno, telefono, correo, fecha_nacimiento, clave, rol } = req.body;
        const query = 'UPDATE usuarios SET documento = ?, nombres = ?, ape_materno = ?, ape_paterno = ?, telefono = ?, correo = ?, fecha_nacimiento = ?, clave = ?, rol = ? WHERE id = ?';
        const result: any = await db.query(query, [documento, nombres, ape_materno, ape_paterno, telefono, correo, fecha_nacimiento, clave, rol, destinoId]);

        if (result.affectedRows === 1) {
            res.json({ mensaje: 'Usuario actualizado correctamente' });
        } else {
            res.status(500).json({ error: 'No se pudo actualizar' });
        }
    } catch (error) {
        res.json({
            isSuccess: false,
            mensaje: error,
            data: null
        });
    }
};


const deleteUsuario = async (req: Request, res: Response) => {
    try {
        const db = await connect();
        const id = req.params.id;
        const [verificar]: any[] = await db.query(`SELECT * FROM ${tbUsuario} WHERE id = ? AND activo = 'S' LIMIT 1`, [id]);

        if (verificar.length === 0) {
            res.json({
                isSuccess: false,
                mensaje: 'Cliente no encontrado'
            });
            return;
        }

        // Verificar si el usuario está siendo referenciado por alguna tabla
        const [references]: any[] = await db.query('SELECT table_name, column_name ' +
            'FROM information_schema.key_column_usage ' +
            'WHERE referenced_table_name = ? AND referenced_column_name = "id"',
            [tbUsuario]);

        if (references.length > 0) {
            // El usuario está siendo referenciado por al menos una tabla
            // Cambiar el activo a "N" en lugar de eliminarlo
            const [updateResult]: any[] = await db.query(`UPDATE ${tbUsuario} SET activo = 'N' WHERE id = ?`, [id]);

            if (updateResult.affectedRows === 1) {
                res.json({
                    isSuccess: true,
                    mensaje: 'Usuario marcado como inactivo, ya que está siendo referenciado por otras tablas.'
                });
            } else {
                res.json({
                    isSuccess: false,
                    mensaje: 'No se pudo marcar al usuario como inactivo.'
                });
            }
        } else {
            // El usuario no está siendo referenciado por ninguna tabla, eliminarlo
            const [deleteResult]: any[] = await db.query(`DELETE FROM ${tbUsuario} WHERE id = ?`, [id]);

            if (deleteResult.affectedRows === 1) {
                res.json({
                    isSuccess: true,
                    mensaje: 'Usuario eliminado correctamente'
                });
            } else {
                res.json({
                    isSuccess: false,
                    mensaje: 'No se pudo eliminar al usuario.'
                });
            }
        }
    } catch (error) {
        res.json({
            isSuccess: false,
            mensaje: error
        });
    }
}

export default { login, getAllUsuarios, getUsuario, insertUsuario, updateUsuario, deleteUsuario }