import express from 'express';
import comprobantesControllers from '../controllers/comprobantes.controllers';

const comprobantesRoutes = express.Router();

comprobantesRoutes.get('/comprobantes', comprobantesControllers.listarTodos);
comprobantesRoutes.post('/comprobantes', comprobantesControllers.insertar);
comprobantesRoutes.put('/comprobantes/:id', comprobantesControllers.actualizar);
comprobantesRoutes.delete('/comprobantes/:id', comprobantesControllers.eliminar);


export { comprobantesRoutes };