import axios from "axios";
import { Request, Response } from "express";
import { tbCliente } from "../func/tablas";
import { pool } from "../db";


const token = 'apis-token-6355.FCdTEo9yWq1R3AzFHR2kLAcvlzWgTgQc';
const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
};


const consultarDni = async (req: Request, res: Response) => {
    try {
        const { doc } = req.params;

        if (!doc) {
            return res.json({
                isSuccess: false,
                mensaje: 'Es necesario un documento'
            })
        }

        if (doc.length !== 8) {
            return res.json({
                isSuccess: false,
                mensaje: 'El documento debe tener 8 dígitos'
            })
        }

        //Verificar primero en la base de datos
        const query = `SELECT * FROM ${tbCliente} WHERE documento = ? LIMIT 1`;
        const [clientes]: any = await pool.query(query, [doc]);
        if (clientes.length > 0) {
            return res.json({
                isSuccess: true,
                data: {
                    nombres: clientes[0].nombres,
                    direc: clientes[0].direc,
                    correo: clientes[0].correo,
                    telefono: clientes[0].telefono
                }
            })
        }

        //Si no existe, consultar en la API

        const url = `https://api.apis.net.pe/v2/reniec/dni?numero=${doc}`;

        const respuesta = await axios.get(url, { headers: headers });
        if (respuesta.status !== 200) {
            return res.json({
                isSuccess: false,
                mensaje: 'No se pudo consultar el DNI'
            })
        }
        const { nombres, apellidoPaterno, apellidoMaterno, } = respuesta.data;
        res.json({
            isSuccess: true,
            data: {
                nombres: `${nombres} ${apellidoPaterno} ${apellidoMaterno}`
            }
        });
    } catch (error) {
        res.json({
            isSuccess: false,
            mensaje: error
        });
    }
};

const consultarRuc = async (req: Request, res: Response) => {
    try {
        const { doc } = req.params;

        if (!doc) {
            return res.json({
                isSuccess: false,
                mensaje: 'Es necesario un documento'
            })
        }

        if (doc.length !== 11) {
            return res.json({
                isSuccess: false,
                mensaje: 'El documento debe tener 11 dígitos'
            })
        }

        //Verificar primero en la base de datos
        const query = `SELECT * FROM ${tbCliente} WHERE documento = ? LIMIT 1`;
        const [clientes]: any = await pool.query(query, [doc]);
        console.log(clientes);

        if (clientes.length > 0) {
            return res.json({
                isSuccess: true,
                data: {
                    nombres: clientes[0].nombres,
                    direc: clientes[0].direc,
                    correo: clientes[0].correo,
                    telefono: clientes[0].telefono
                }
            })
        }

        //Si no existe, consultar en la API
        const url = `https://api.apis.net.pe/v2/sunat/ruc?numero=${doc}`;

        const respuesta = await axios.get(url, { headers: headers });
        if (respuesta.status !== 200) {
            return res.json({
                isSuccess: false,
                mensaje: 'No se pudo consultar el DNI'
            })
        }
        const { razonSocial, direccion } = respuesta.data;
        res.json({
            isSuccess: true,
            data: {
                nombres: `${razonSocial}`,
                direc: direccion
            }
        });
    } catch (error) {
        res.json({
            isSuccess: false,
            mensaje: error
        });
    }
};

export default { consultarDni, consultarRuc }