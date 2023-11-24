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
    } catch (error) {
        res.json({
            isSuccess: false,
            mensaje: error,
        });
    }
};
const getDocumento = (req: Request, res: Response) => {
};

const insertDocumento = (req: Request, res: Response) => {
};

const updateDocumento = (req: Request, res: Response) => {
};

const setActivoDocumento = (req: Request, res: Response) => {
};

export default { getAllDocumento, getDocumento, insertDocumento, updateDocumento, setActivoDocumento }