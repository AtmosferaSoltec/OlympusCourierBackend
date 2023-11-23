"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comprobantesRoutes = void 0;
const express_1 = __importDefault(require("express"));
const comprobantes_controllers_1 = __importDefault(require("../controllers/comprobantes.controllers"));
const comprobantesRoutes = express_1.default.Router();
exports.comprobantesRoutes = comprobantesRoutes;
comprobantesRoutes.get('/comprobantes', comprobantes_controllers_1.default.listarTodos);
comprobantesRoutes.post('/comprobantes', comprobantes_controllers_1.default.insertar);
comprobantesRoutes.put('/comprobantes/:id', comprobantes_controllers_1.default.actualizar);
comprobantesRoutes.delete('/comprobantes/:id', comprobantes_controllers_1.default.eliminar);
