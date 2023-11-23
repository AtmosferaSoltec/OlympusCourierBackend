"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clienteRoutes = void 0;
const express_1 = __importDefault(require("express"));
const cliente_controllers_1 = __importDefault(require("../controllers/cliente.controllers"));
const exceljs_1 = __importDefault(require("exceljs"));
const promises_1 = __importDefault(require("fs/promises"));
const clienteRoutes = express_1.default.Router();
exports.clienteRoutes = clienteRoutes;
clienteRoutes.get('/clientes', cliente_controllers_1.default.getAllClientes);
clienteRoutes.get('/clientes/get/:id', cliente_controllers_1.default.getCliente);
clienteRoutes.get('/clientes/search/:datos', cliente_controllers_1.default.searchCliente);
clienteRoutes.post('/clientes', cliente_controllers_1.default.insertCliente);
clienteRoutes.post('/clientes/exportarCliente', async (req, res) => {
    try {
        const listClientes = req.body.listClientes;
        if (!Array.isArray(listClientes) || listClientes.length === 0) {
            return res.status(400).send('La lista de clientes es inválida o está vacía.');
        }
        const workbook = new exceljs_1.default.Workbook();
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
        const excelBuffer = await promises_1.default.readFile(excelPath);
        res.send(excelBuffer);
        await promises_1.default.unlink(excelPath);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
});
clienteRoutes.put('/clientes/:id', cliente_controllers_1.default.updateCliente);
clienteRoutes.delete('/clientes/:id', cliente_controllers_1.default.deleteCliente);
