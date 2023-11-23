"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.consultasRoutes = void 0;
const express_1 = __importDefault(require("express"));
const consultas_controller_1 = __importDefault(require("../controllers/consultas.controller"));
const consultasRoutes = express_1.default.Router();
exports.consultasRoutes = consultasRoutes;
consultasRoutes.post('/consultas', consultas_controller_1.default.consultarDoc);
