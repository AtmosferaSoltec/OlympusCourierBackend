import { Request, Response } from 'express';
import { pool } from '../db';
import { tbUsuario } from '../func/tablas';

const login = async (req: Request, res: Response) => {
    const { documento, clave } = req.body;

    if (!documento || !clave) {
        return res.json({
            isSuccess: false,
            mensaje: 'Por favor, proporciona documento y contraseña.'
        });
    }

    try {
        const consulta = `SELECT id FROM ${tbUsuario} WHERE documento = ? AND clave = ? LIMIT 1`;
        const [resultados]: any[] = await pool.query(consulta, [documento, clave]);
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
        const query = `SELECT * FROM ${tbUsuario} WHERE activo != "E"`;
        const [destinos]: any[] = await pool.query(query);
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
        const { id } = req.params;
        const query = `SELECT * FROM ${tbUsuario} WHERE id = ? LIMIT 1`;
        const [resultado]: any[] = await pool.query(query, [id]);

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
        const { documento, nombres, ape_materno, ape_paterno, telefono, correo, fecha_nac, clave, cod_rol } = req.body;
        const valores = [
            documento,
            nombres,
            ape_materno || '',
            ape_paterno || '',
            telefono || '',
            correo || '',
            fecha_nac || '1900-01-01',
            clave || '1234',
            cod_rol || 'U'
        ];

        const [verificarDoc]: any[] = await pool.query(`SELECT documento FROM ${tbUsuario} WHERE documento = ?`, [documento])

        if (verificarDoc.length > 0){
            return res.json({
                isSuccess: false,
                mensaje: 'Documento ya se encuentra registrado'
            })
        }

        const query = `INSERT INTO ${tbUsuario} (documento, nombres, ape_materno, ape_paterno, telefono, correo, fecha_nac, clave, cod_rol) VALUES (?,?,?,?,?,?,?,?,?)`
        const [result]: any[] = await pool.query(query, valores);

        if (result.affectedRows === 1) {
            res.json({
                isSuccess: true,
                mensaje: 'Usuario insertado correctamente'
            });
        } else {
            res.json({
                isSuccess: false,
                mensaje: 'No se pudo insertar'
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

const updateUsuario = async (req: Request, res: Response) => {
    try {
        const destinoId = req.params.id;
        const { documento, nombres, ape_materno, ape_paterno, telefono, correo, fecha_nacimiento, clave, rol } = req.body;
        const query = 'UPDATE usuarios SET documento = ?, nombres = ?, ape_materno = ?, ape_paterno = ?, telefono = ?, correo = ?, fecha_nacimiento = ?, clave = ?, rol = ? WHERE id = ?';
        const [result]: any[] = await pool.query(query, [documento, nombres, ape_materno, ape_paterno, telefono, correo, fecha_nacimiento, clave, rol, destinoId]);

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


const setActivoUsuario = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const { activo } = req.body;

        if (!activo) {
            return res.json({
                isSuccess: false,
                mensaje: 'Se requiere del activo'
            })
        }

        const [verificar]: any[] = await pool.query(`SELECT * FROM ${tbUsuario} WHERE id = ? LIMIT 1`, [id]);
        if (verificar.length === 0) {
            res.json({
                isSuccess: false,
                mensaje: 'Cliente no encontrado'
            });
            return;
        }

        const [updateResult]: any[] = await pool.query(`UPDATE ${tbUsuario} SET activo = ? WHERE id = ?`, [activo, id]);

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
}

export default { login, getAllUsuarios, getUsuario, insertUsuario, updateUsuario, setActivoUsuario }