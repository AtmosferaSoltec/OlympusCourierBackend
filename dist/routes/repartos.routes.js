"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.repartoRoutes = void 0;
const express_1 = __importDefault(require("express"));
const repartos_controllers_1 = __importDefault(require("../controllers/repartos.controllers"));
const repartoRoutes = express_1.default.Router();
exports.repartoRoutes = repartoRoutes;
repartoRoutes.get('/repartos', repartos_controllers_1.default.listarTodos);
repartoRoutes.get('/repartos/get/:id', repartos_controllers_1.default.getReparto);
repartoRoutes.post('/repartos', repartos_controllers_1.default.insertar);
repartoRoutes.put('/repartos/:id', repartos_controllers_1.default.actualizar);
repartoRoutes.delete('/repartos/:id', repartos_controllers_1.default.eliminar);
repartoRoutes.post('/repartos/darConformidad', repartos_controllers_1.default.darConformidad);
