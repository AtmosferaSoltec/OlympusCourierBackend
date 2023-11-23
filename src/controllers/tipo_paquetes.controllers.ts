import { Request, Response } from 'express';
import connectToDatabase from '../mysql';

const listarTodos = async (req: Request, res: Response) => {
    try {
        const db = await connectToDatabase();
        const query = 'SELECT * FROM tipo_paquete';
        const destinos = await db.query(query);
        res.json(destinos);
    } catch (error) {
        console.error('Error al recuperar datos de la tabla Tipo_Cliente:', error);
        res.status(500).json({ error: 'Ocurrió un error al obtener los datos de la tabla Tipo_Clientes' });
    }
};

const insertar = async (req: Request, res: Response) => {
    try {
        const db = await connectToDatabase();
        const { nombre } = req.body;
        const result: any = await db.query('INSERT INTO tipo_paquete (nombre) VALUES (?)', [nombre]);

        if (result.affectedRows === 1) {
            res.json({ mensaje: 'Tipo Paquete insertado correctamente' });
        } else {
            res.status(500).json({ error: 'No se pudo insertar' });
        }
    } catch (error) {
        console.error('Error al insertar un tipo_paquete:', error);
        res.status(500).json({ error: 'Ocurrió un error al insertar el tipo_paquete' });
    }
};

const actualizar = async (req: Request, res: Response) => {
    try {
        const db = await connectToDatabase();
        const destinoId = req.params.id;
        const { nombre } = req.body;

        const query = 'UPDATE tipo_paquete SET nombre = ? WHERE id = ?';

        const result : any = await db.query(query, [nombre, destinoId]);

        if (result.affectedRows === 1) {
            res.json({ mensaje: 'tipo_paquete actualizado correctamente' });
        } else {
            res.status(500).json({ error: 'No se pudo actualizar' });
        }
    } catch (error) {
        console.error('Error al actualizar un tipo_paquete:', error);
        res.status(500).json({ error: 'Ocurrió un error al actualizar el tipo_paquete' });
    }
};

const eliminar = async (req: Request, res: Response) => {
    const db = await connectToDatabase();
    const id = req.params.id;

    const rows :any = await db.query('SELECT * FROM tipo_paquete WHERE id = ?', [id]);

    if (rows.length === 0) {
        res.status(404).json({ error: `El registro con ID ${id} no existe` });
        return;
    }

    const result : any = await db.query('DELETE FROM tipo_paquete WHERE id = ?', [id]);

    if (result.affectedRows === 1) {
        res.json({ mensaje: 'tipo_paquete eliminado correctamente' });
    } else {
        res.status(500).json({ error: 'No se pudo actualizar' });
    }
}


export default { listarTodos, insertar, actualizar, eliminar }