import { Request, Response } from 'express';
import connectToDatabase from '../mysql';

const getAllDistritos = async (req: Request, res: Response) => {
    try {
        const db = await connectToDatabase();
        const query = 'SELECT * FROM distrito';
        const destinos = await db.query(query);
        res.json(destinos);
    } catch (error) {
        console.error('Error al recuperar datos de la tabla distrito:', error);
        res.status(500).json({ error: 'Ocurrió un error al obtener los datos de la tabla Destinos' });
    }
};

const insertDistrito = async (req: Request, res: Response) => {
    try {
        const db = await connectToDatabase();
        const { nombre } = req.body;
        const result: any = await db.query('INSERT INTO distrito (nombre) VALUES (?)', [nombre]);

        if (result.affectedRows === 1) {
            res.json({ message: 'Destino insertado correctamente' });
        } else {
            res.status(500).json({ error: 'No se pudo insertar el destino' });
        }
    } catch (error) {
        console.error('Error al insertar un destino:', error);
        res.status(500).json({ error: 'Ocurrió un error al insertar el destino' });
    }
};

const updateDistrito = async (req: Request, res: Response) => {
    try {
        const db: any = await connectToDatabase();
        const destinoId = req.params.id;
        const { nombre } = req.body;

        const query = 'UPDATE distrito SET nombre = ? WHERE id = ?';
        const result = await db.query(query, [nombre, destinoId]);

        if (result.affectedRows === 1) {
            res.json({ message: 'Destino actualizado correctamente' });
        } else {
            res.status(500).json({ error: 'No se pudo actualizar el destino' });
        }
    } catch (error) {
        console.error('Error al actualizar un destino:', error);
        res.status(500).json({ error: 'Ocurrió un error al actualizar el destino' });
    }
};

const deleteDistrito = async (req: Request, res: Response) => {
    const db = await connectToDatabase();
    const id = req.params.id;

    const rows: any = await db.query('SELECT * FROM distrito WHERE id = ?', [id]);

    if (rows.length === 0) {
        res.status(404).json({ error: `El registro con ID ${id} no existe` });
        return;
    }

    const result = await db.query('DELETE FROM distrito WHERE id = ?', [id]);

    res.json(result);
}


export default { getAllDistritos, insertDistrito, updateDistrito, deleteDistrito }