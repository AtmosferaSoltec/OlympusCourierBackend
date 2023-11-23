"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.distritoRoutes = void 0;
const express_1 = __importDefault(require("express"));
const distrito_controllers_1 = __importDefault(require("../controllers/distrito.controllers"));
const distritoRoutes = express_1.default.Router();
exports.distritoRoutes = distritoRoutes;
distritoRoutes.get('/destinos', distrito_controllers_1.default.getAllDestinos);
distritoRoutes.post('/destinos', distrito_controllers_1.default.insertDestino);
distritoRoutes.put('/destinos/:id', distrito_controllers_1.default.updateDestino);
distritoRoutes.delete('/destinos/:id', distrito_controllers_1.default.deleteDestino);
