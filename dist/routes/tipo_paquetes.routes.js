"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tipoPaquetesRoutes = void 0;
const express_1 = __importDefault(require("express"));
const tipo_paquetes_controllers_1 = __importDefault(require("../controllers/tipo_paquetes.controllers"));
const tipoPaquetesRoutes = express_1.default.Router();
exports.tipoPaquetesRoutes = tipoPaquetesRoutes;
tipoPaquetesRoutes.get('/paquetes', tipo_paquetes_controllers_1.default.listarTodos);
tipoPaquetesRoutes.post('/paquetes', tipo_paquetes_controllers_1.default.insertar);
tipoPaquetesRoutes.put('/paquetes/:id', tipo_paquetes_controllers_1.default.actualizar);
tipoPaquetesRoutes.delete('/paquetes/:id', tipo_paquetes_controllers_1.default.eliminar);
