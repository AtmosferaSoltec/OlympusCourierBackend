import express from 'express';
import destinoControllers from '../controllers/distrito.controllers';

const distritoRoutes = express.Router();

distritoRoutes.get('/distritos', destinoControllers.getAllDistritos);
distritoRoutes.post('/distritos', destinoControllers.insertDistrito);
distritoRoutes.put('/distritos/:id', destinoControllers.updateDistrito);
distritoRoutes.delete('/distritos/:id', destinoControllers.deleteDistrito);

export { distritoRoutes };