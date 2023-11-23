"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usuarioRoutes = void 0;
const express_1 = __importDefault(require("express"));
const usuarios_controllers_1 = __importDefault(require("../controllers/usuarios.controllers"));
const usuarioRoutes = express_1.default.Router();
exports.usuarioRoutes = usuarioRoutes;
usuarioRoutes.post('/usuarios/login', usuarios_controllers_1.default.login);
usuarioRoutes.get('/usuarios', usuarios_controllers_1.default.getAllUsuarios);
usuarioRoutes.get('/usuarios/get/:id', usuarios_controllers_1.default.getUsuario);
usuarioRoutes.post('/usuarios', usuarios_controllers_1.default.insertUsuario);
usuarioRoutes.put('/usuarios/:id', usuarios_controllers_1.default.updateUsuario);
usuarioRoutes.delete('/usuarios/:id', usuarios_controllers_1.default.deleteUsuario);
