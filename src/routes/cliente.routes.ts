import { Request, Response } from "express";

import express from 'express';
import clienteControllers from '../controllers/cliente.controllers';


import ExcelJS from 'exceljs';
import fs from 'fs/promises';

const clienteRoutes = express.Router();

clienteRoutes.get('/clientes', clienteControllers.getAllClientes);

clienteRoutes.get('/clientes/get/:id', clienteControllers.getCliente);

clienteRoutes.get('/clientes/search/:datos', clienteControllers.searchCliente)

clienteRoutes.post('/clientes', clienteControllers.insertCliente);


clienteRoutes.post('/clientes/exportarCliente', async (req: Request, res: Response) => {
    try {

        const listClientes = req.body.listClientes;

        if (!Array.isArray(listClientes) || listClientes.length === 0) {
            return res.status(400).send('La lista de clientes es inválida o está vacía.');
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet 1');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 20 },
            { header: 'Tipo Documento', key: 'tipo_doc', width: 15 },
            { header: 'Documento', key: 'documento', width: 20 },
            { header: 'Nombres', key: 'nombres', width: 20 },
            { header: 'Telefono', key: 'telefono', width: 20 },
            { header: 'Correo', key: 'correo', width: 20 },
            { header: 'Genero', key: 'genero', width: 20 },
            { header: 'Distrito', key: 'distrito_id', width: 20 },
            { header: 'Dirección', key: 'direc', width: 20 },
            { header: 'Referencia', key: 'referencia', width: 20 },
            { header: 'Url Map', key: 'url_maps', width: 20 },
        ];

        worksheet.addRows(listClientes);
        const excelPath = 'temp.xlsx';
        await workbook.xlsx.writeFile(excelPath);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=informacion.xlsx');
        const excelBuffer = await fs.readFile(excelPath);
        res.send(excelBuffer);
        await fs.unlink(excelPath);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
});

clienteRoutes.put('/clientes/:id', clienteControllers.updateCliente);

clienteRoutes.delete('/clientes/:id', clienteControllers.deleteCliente);

export { clienteRoutes };