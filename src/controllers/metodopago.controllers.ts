import { Request, Response } from 'express';
import { pool } from '../db';
import { tbMetodoPago } from '../func/tablas';

const getAll = async (req: Request, res: Response) => {
    try {
        const query = `SELECT * FROM ${tbMetodoPago}`;
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

export default { getAll }