import axios from "axios";
import { Request, Response } from "express";

const consultarDni = async (req: Request, res: Response) => {
    try {
        const token = 'apis-token-6355.FCdTEo9yWq1R3AzFHR2kLAcvlzWgTgQc';
        const headers = {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
        };

        const { doc } = req.params;

        if (!doc) {
            return res.json({
                isSuccess: false,
                mensaje: 'Es necesario un documento'
            })
        }

        const url = `https://api.apis.net.pe/v2/reniec/dni?numero=${doc}`;

        const respuesta = await axios.get(url, { headers });
        const datos = respuesta.data;
        res.json({ datos });
    } catch (error) {
        res.json({
            isSuccess: false,
            mensaje: error
        });
    }
};

const consultarRuc = async (req: Request, res: Response) => {
    try {

        const token = 'apis-token-6355.FCdTEo9yWq1R3AzFHR2kLAcvlzWgTgQc';
        const headers = {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
        };

        const { doc } = req.params;

        if (!doc) {
            return res.json({
                isSuccess: false,
                mensaje: 'Es necesario un documento'
            })
        }

        const url = `https://api.apis.net.pe/v2/sunat/ruc?numero=${doc}`;
        const respuesta = await axios.get(url, { headers });
        const datos = respuesta.data;
        res.json({ datos });
    } catch (error) {
        res.json({
            isSuccess: false,
            mensaje: error
        });
    }
};

export default { consultarDni, consultarRuc }