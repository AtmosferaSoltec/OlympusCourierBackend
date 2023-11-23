import express from 'express';
import consultasController from '../controllers/consultas.controller';

const consultasRoutes = express.Router();

consultasRoutes.post('/consultas', consultasController.consultarDoc);


export { consultasRoutes };