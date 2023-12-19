import { Router } from 'express';
import tipoPaquetesControllers from '../controllers/paquetes.controllers';
import { checkAuth } from '../middleware/checkAuth';

const router = Router();

router.get('/', checkAuth as any, tipoPaquetesControllers.getAllPaquetes as any);
router.get('/:id', checkAuth as any, tipoPaquetesControllers.getPaquete as any);
router.post('/', checkAuth as any, tipoPaquetesControllers.insertPaquete as any);
router.put('/', checkAuth as any, tipoPaquetesControllers.updatePaquete as any);
router.patch('/:id', checkAuth as any, tipoPaquetesControllers.setActivoPaquete as any);


export { router };