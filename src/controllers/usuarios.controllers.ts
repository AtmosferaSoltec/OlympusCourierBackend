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
    } catch (err:any) {
        res.json({
            isSuccess: false,
            mensaje: err.message
        });
    }
};

const getAllUsuarios = async (req: Request, res: Response) => {
    try {
        const query = `SELECT * FROM ${tbUsuario}`;
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
        const query = `SELECT * FROM ${tbUsuario} WHERE id = ?`;
        const [resultado]: any[] = await pool.query(query, [id]);

        if (resultado.length === 0) {
            return res.json({
                isSuccess: false,
                mensaje: `No se encontró el ID: ${id}`
            });
        }
        
        delete resultado[0].clave;
        res.json({
            isSuccess: true,
            data: resultado[0]
        });

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

        const { documento, nombres, ape_paterno, ape_materno, telefono, correo, fecha_nac, clave, cod_rol } = req.body;

        // Validar si los campos estan vacios
        if (!documento || !nombres || !ape_paterno || !ape_materno || !telefono || !correo || !fecha_nac || !clave || !cod_rol) {
            return res.json({
                isSuccess: false,
                mensaje: 'Por favor, proporciona todos los campos.'
            });
        }

        // Validar si el documento ya existe
        const [documentoExistente]: any = await pool.query(`SELECT COUNT(*) AS count FROM ${tbUsuario} WHERE documento = ?`, [documento]);
        if (documentoExistente[0].count > 0) {
            return res.json({
                isSuccess: false,
                mensaje: 'Documento ya se encuentra registrado'
            })
        }

        //Validar si el correo ya existe
        const [correoExistente]: any = await pool.query(`SELECT COUNT(*) AS count FROM ${tbUsuario} WHERE correo = ?`, [correo]);
        if (correoExistente[0].count > 0) {
            return res.json({
                isSuccess: false,
                mensaje: 'Correo ya se encuentra registrado'
            })
        }

        //Validad si el telefono ya existe
        const [telefonoExistente]: any = await pool.query(`SELECT COUNT(*) AS count FROM ${tbUsuario} WHERE telefono = ?`, [telefono]);
        if (telefonoExistente[0].count > 0) {
            return res.json({
                isSuccess: false,
                mensaje: 'Telefono ya se encuentra registrado'
            })
        }

        //Insertar usuario
        const query = `INSERT INTO ${tbUsuario} (documento, nombres, ape_paterno, ape_materno, telefono, correo, fecha_nac, clave, cod_rol) VALUES (?,?,?,?,?,?,?,?,?)`;
        const [result]: any[] = await pool.query(query, [documento, nombres, ape_paterno, ape_materno, telefono, correo, fecha_nac, clave, cod_rol]);

        if (result.affectedRows === 1) {
            res.json({
                isSuccess: true,
                mensaje: 'Usuario insertado correctamente',
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
            mensaje: error.message,
            data: null
        });
    }
};

const updateUsuario = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const { documento, nombres, ape_materno, ape_paterno, telefono, correo, fecha_nacimiento, clave, rol } = req.body;

        //Verificar si existe el usuario
        const [verificar]: any[] = await pool.query(`SELECT COUNT(*) AS count FROM ${tbUsuario} WHERE id = ?`, [id]);
        if (verificar[0].count === 0) {
            return res.json({
                isSuccess: false,
                mensaje: 'Usuario no encontrado'
            });
        }

        // Validar si el documento ya existe
        const [documentoExistente]: any = await pool.query(`SELECT COUNT(*) AS count FROM ${tbUsuario} WHERE documento = ?`, [documento]);
        if (documentoExistente[0].count > 0) {
            return res.json({
                isSuccess: false,
                mensaje: 'El documento ya existe en otro usuario'
            });
        }

        //Validar si el telefono ya existe
        const [telefonoExistente]: any = await pool.query(`SELECT COUNT(*) AS count FROM ${tbUsuario} WHERE telefono = ?`, [telefono]);
        if (telefonoExistente[0].count > 0) {
            return res.json({
                isSuccess: false,
                mensaje: 'El telefono ya existe en otro usuario'
            });
        }

        //Validar si el correo ya existe
        const [correoExistente]: any = await pool.query(`SELECT COUNT(*) AS count FROM ${tbUsuario} WHERE correo = ?`, [correo]);
        if (correoExistente[0].count > 0) {
            return res.json({
                isSuccess: false,
                mensaje: 'El correo ya existe en otro usuario'
            });
        }

        // Actualizar usuario
        const query = `UPDATE ${tbUsuario} SET documento = ?, nombres = ?, ape_paterno = ?, ape_materno = ?, telefono = ?, correo = ?, fecha_nacimiento = ?, clave = ?, rol = ? WHERE id = ?`;
        const [result]: any[] = await pool.query(query, [documento, nombres, ape_paterno, ape_materno, telefono, correo, fecha_nacimiento, clave, rol, id]);

        if (result.affectedRows === 1) {

            res.json({
                isSuccess: true,
                mensaje: 'Usuario actualizado correctamente'
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
            mensaje: error.message,
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
                mensaje: 'Se requiere del estado'
            })
        }

        //Verificar si el usuario existe con COUNT(*) AS
        const [verificar]: any[] = await pool.query(`SELECT COUNT(*) AS count FROM ${tbUsuario} WHERE id = ?`, [id]);

        if (verificar[0].count === 0) {
            return res.json({
                isSuccess: false,
                mensaje: 'Usuario no encontrado'
            });
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

    } catch (error: any) {
        res.json({
            isSuccess: false,
            mensaje: error.message
        });
    }
}

export default { login, getAllUsuarios, getUsuario, insertUsuario, updateUsuario, setActivoUsuario }
