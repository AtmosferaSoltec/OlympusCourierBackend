import express from 'express';
import tipoPaquetesControllers from '../controllers/tipo_paquetes.controllers';

const tipoPaquetesRoutes = express.Router();

tipoPaquetesRoutes.get('/paquetes', tipoPaquetesControllers.listarTodos);
tipoPaquetesRoutes.post('/paquetes', tipoPaquetesControllers.insertar);
tipoPaquetesRoutes.put('/paquetes/:id', tipoPaquetesControllers.actualizar);
tipoPaquetesRoutes.delete('/paquetes/:id', tipoPaquetesControllers.eliminar);


export { tipoPaquetesRoutes };