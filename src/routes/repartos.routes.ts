import express from 'express';
import repartosControllers from '../controllers/repartos.controllers';

const repartoRoutes = express.Router();

repartoRoutes.get('/repartos', repartosControllers.listarTodos);
repartoRoutes.get('/repartos/get/:id', repartosControllers.getReparto);
repartoRoutes.post('/repartos', repartosControllers.insertar);
repartoRoutes.put('/repartos/:id', repartosControllers.actualizar);
repartoRoutes.delete('/repartos/:id', repartosControllers.eliminar);

repartoRoutes.post('/repartos/darConformidad', repartosControllers.darConformidad)

export { repartoRoutes };