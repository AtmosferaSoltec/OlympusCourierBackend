import { Request, Response } from 'express';
import { pool } from '../db';
import { tbDocumento } from '../func/tablas';

const getAllDocumento = async (req: Request, res: Response) => {
    try {
        const query = `SELECT * FROM ${tbDocumento}`;
        const [call] : any[]= await pool.query(query);
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

export default { getAllDocumento }