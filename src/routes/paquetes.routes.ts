import { Router } from 'express';
import tipoPaquetesControllers from '../controllers/paquetes.controllers';

const router = Router();

router.get('/', tipoPaquetesControllers.getAllPaquetes);
router.get('/:id', tipoPaquetesControllers.getPaquete);
router.post('/', tipoPaquetesControllers.insertPaquete);
router.put('/', tipoPaquetesControllers.updatePaquete);
router.patch('/:id', tipoPaquetesControllers.setActivoPaquete);


export { router };