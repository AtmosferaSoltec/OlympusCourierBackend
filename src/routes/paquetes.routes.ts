import { Router } from 'express';
import tipoPaquetesControllers from '../controllers/paquetes.controllers';

const router = Router();

router.get('/', tipoPaquetesControllers.getAllPaquetes);
router.get('/:id', tipoPaquetesControllers.getPaquete);
router.post('/', tipoPaquetesControllers.insertPaquete);
router.put('/:id', tipoPaquetesControllers.updatePaquete);
router.delete('/:id', tipoPaquetesControllers.deletePaquete);


export { router };