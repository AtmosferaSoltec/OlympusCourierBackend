import { Request, Response } from 'express';
import { pool } from '../db';
import { tbEmpresa, tbRol, tbUsuario } from '../func/tablas';
import "dotenv/config";
import jwt from 'jsonwebtoken';

const secretKey = process.env.SECRET_KEY || 'secretKey';

const login = async (req: Request, res: Response) => {
    try {
        const { documento, clave } = req.body;

        if (!documento || !clave) {
            return res.json({
                isSuccess: false,
                mensaje: 'Por favor, proporciona documento y contraseña.'
            });
        }

        const consulta = `SELECT * FROM ${tbUsuario} WHERE documento = ? AND clave = ? LIMIT 1`;
        const [resultados]: any[] = await pool.query(consulta, [documento, clave]);
        
        if (resultados.length > 0) {

            const payload = resultados[0];
            const token = jwt.sign(payload, secretKey, { expiresIn: '5h' });

            res.json({
                isSuccess: true,
                mensaje: 'Inicio de sesión exitoso',
                data: {
                    id: payload.id, 
                    token
                }
            });
        } else {
            res.json({
                isSuccess: false,
                mensaje: 'Credenciales incorrectas'
            });
        }
    } catch (err: any) {
        res.json({
            isSuccess: false,
            mensaje: err.message
        });
    }
};

const getAllUsuarios = async (req: Request, res: Response) => {
    try {
        const { id_ruc } = req.body.user;

        const { estado } = req.query;
        //Validar los campos
        if (!estado) {
            return res.json({
                isSuccess: false,
                mensaje: 'Se requiere del estado'
            })
        }

        let query = `SELECT * FROM ${tbUsuario} WHERE id_ruc = ?`;
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

        const [destinos]: any[] = await pool.query(query, [id_ruc]);
        res.json({
            isSuccess: true,
            data: destinos
        });
    } catch (error: any) {
        res.json({
            isSuccess: true,
            mensaje: error.message
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

        const { id_ruc } = req.body.user;
        const { documento, nombres, apellidos, telefono, correo, cod_rol } = req.body;
        let { fecha_nac } = req.body;
        // Validar si los campos estan vacios
        if (!documento || !nombres || !cod_rol) {
            return res.json({
                isSuccess: false,
                mensaje: 'Por favor, proporciona todos los campos.'
            });
        }

        if (!fecha_nac) {
            fecha_nac = '1900-01-01'
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
        if (correo) {
            const [correoExistente]: any = await pool.query(`SELECT COUNT(*) AS count FROM ${tbUsuario} WHERE correo = ?`, [correo]);
            if (correoExistente[0].count > 0) {
                return res.json({
                    isSuccess: false,
                    mensaje: 'Correo ya se encuentra registrado'
                })
            }
        }

        //Validad si el telefono ya existe
        const [telefonoExistente]: any = await pool.query(`SELECT COUNT(*) AS count FROM ${tbUsuario} WHERE telefono = ?`, [telefono]);
        if (telefonoExistente[0].count > 0) {
            return res.json({
                isSuccess: false,
                mensaje: 'Telefono ya se encuentra registrado'
            })
        }

        //Validar si el cod_rol existe
        const [codRolExistente]: any = await pool.query(`SELECT COUNT(*) AS count FROM ${tbRol} WHERE cod = ?`, [cod_rol]);
        if (codRolExistente[0].count === 0) {
            return res.json({
                isSuccess: false,
                mensaje: 'El rol no existe'
            })
        }

        //Insertar usuario
        const query = `INSERT INTO ${tbUsuario} (id_ruc, documento, nombres, apellidos, telefono, correo, fecha_nac, clave, cod_rol) VALUES (?,?,?,?,?,?,?,?,?)`;
        const [result]: any[] = await pool.query(query, [id_ruc, documento, nombres, apellidos, telefono, correo, fecha_nac, documento, cod_rol]);

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
        console.log(error);
        res.json({
            isSuccess: false,
            mensaje: error.message,
            data: null
        });
    }
};

const updateUsuario = async (req: Request, res: Response) => {
    try {
        const { id_ruc } = req.body.user;
        const { id } = req.params;
        const { documento, nombres, apellidos, telefono, correo, fecha_nac, cod_rol } = req.body;

        // Validar si los campos estan vacios
        if (!documento || !nombres || !cod_rol) {
            return res.json({
                isSuccess: false,
                mensaje: 'Por favor, proporciona todos los campos.'
            });
        }

        const fechaObj = new Date(fecha_nac);
        // Verifica si la fecha es válida
        if (isNaN(fechaObj.getTime())) {
            return res.json({
                isSuccess: false,
                mensaje: 'Fecha no válida'
            });
        }

        //Validar si el cod_rol existe
        const [codRolExistente]: any = await pool.query(`SELECT COUNT(*) AS count FROM ${tbRol} WHERE cod = ?`, [cod_rol]);
        if (codRolExistente[0].count === 0) {
            return res.json({
                isSuccess: false,
                mensaje: 'El rol no existe'
            })
        }

        //Verificar si existe el usuario
        const [verificar]: any[] = await pool.query(`SELECT COUNT(*) AS count FROM ${tbUsuario} WHERE id = ? AND id_ruc = ?`, [id, id_ruc]);
        if (verificar[0].count === 0) {
            return res.json({
                isSuccess: false,
                mensaje: 'Usuario no encontrado'
            });
        }

        // Validar si el documento ya existe
        const [documentoExistente]: any = await pool.query(`SELECT COUNT(*) AS count FROM ${tbUsuario} WHERE documento = ? AND id_ruc = ?`, [documento, id, id_ruc]);
        if (documentoExistente[0].count > 1) {
            return res.json({
                isSuccess: false,
                mensaje: 'El documento ya existe en otro usuario'
            });
        }

        //Validar si el telefono ya existe
        const [telefonoExistente]: any = await pool.query(`SELECT COUNT(*) AS count FROM ${tbUsuario} WHERE telefono = ? AND id_ruc = ?`, [telefono, id_ruc]);
        if (telefonoExistente[0].count > 1) {
            return res.json({
                isSuccess: false,
                mensaje: 'El telefono ya existe en otro usuario'
            });
        }

        if (correo) {
            //Validar si el correo ya existe
            const [correoExistente]: any = await pool.query(`SELECT COUNT(*) AS count FROM ${tbUsuario} WHERE correo = ? AND id != ? AND id_ruc = ?`, [correo, id, id_ruc]);
            if (correoExistente[0].count > 0) {
                return res.json({
                    isSuccess: false,
                    mensaje: 'El correo ya existe en otro usuario'
                });
            }
        }

        // Actualizar usuario
        const query = `UPDATE ${tbUsuario} SET documento = ?, nombres = ?, apellidos = ?, telefono = ?, correo = ?, fecha_nac = ?, cod_rol = ? WHERE id = ?`;
        const [result]: any[] = await pool.query(query, [documento, nombres, apellidos, telefono, correo, fechaObj, cod_rol, id]);

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

const cambiarPassword = async (req: Request, res: Response) => {
    try {
        const { id } = req.body.user;
        const { pass_anterior, pass_nueva } = req.body;

        // Validar si los campos estan vacios
        if (!pass_anterior || !pass_nueva) {
            return res.json({
                isSuccess: false,
                mensaje: 'Por favor, proporciona todos los campos.'
            });
        }

        //Verificar si el usuario existe con COUNT(*) AS
        const [verificar]: any[] = await pool.query(`SELECT COUNT(*) AS count FROM ${tbUsuario} WHERE id = ?`, [id]);
        if (verificar[0].count === 0) {
            return res.json({
                isSuccess: false,
                mensaje: 'Usuario no encontrado'
            });
        }

        //Verificar si la contraseña anterior es correcta
        const [verificarPass]: any[] = await pool.query(`SELECT COUNT(*) AS count FROM ${tbUsuario} WHERE id = ? AND clave = ?`, [id, pass_anterior]);
        if (verificarPass[0].count === 0) {
            return res.json({
                isSuccess: false,
                mensaje: 'Contraseña anterior incorrecta'
            });
        }

        //Actualizar contraseña
        const [updateResult]: any[] = await pool.query(`UPDATE ${tbUsuario} SET clave = ? WHERE id = ?`, [pass_nueva, id]);
        if (updateResult.affectedRows === 1) {
            res.json({
                isSuccess: true,
                mensaje: 'Contraseña actualizada correctamente'
            });
        } else {
            res.json({
                isSuccess: false,
                mensaje: 'No se pudo actualizar la contraseña'
            });
        };
    } catch (error: any) {
        res.json({
            isSuccess: false,
            mensaje: error.message
        });
    }
}

export default { login, getAllUsuarios, getUsuario, insertUsuario, updateUsuario, setActivoUsuario, cambiarPassword }
