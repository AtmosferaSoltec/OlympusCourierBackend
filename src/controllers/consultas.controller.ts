import axios from "axios";
import { Request, Response } from "express";

const consultarDoc = async (req: Request, res: Response) => {
    try {
        const token = 'apis-token-6355.FCdTEo9yWq1R3AzFHR2kLAcvlzWgTgQc';
        const headers = {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
        };

        let url;
        if (req.body.tipo === 'D') {
            url = `https://api.apis.net.pe/v2/reniec/dni?numero=${req.body.doc}`;
        } else if (req.body.tipo === 'R') {
            url = `https://api.apis.net.pe/v2/sunat/ruc?numero=${req.body.doc}`;
        } else {
            return res.status(400).json({ error: 'Tipo de documento no válido' });
        }

        const respuesta = await axios.get(url, { headers });
        const datos = respuesta.data;
        res.json({ datos });
    } catch (error) {
        console.error('Error al hacer la solicitud a la API:', error);
        res.status(500).json({ error: 'Ocurrió un error al realizar la solicitud a la API' });
    }
};

export default { consultarDoc }