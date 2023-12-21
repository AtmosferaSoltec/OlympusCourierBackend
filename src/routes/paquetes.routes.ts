import { Router } from 'express';
import controller from '../controllers/paquetes.controllers';
import { checkAuth } from '../middleware/checkAuth';

const router = Router();

router.get('/', checkAuth, controller.getAllPaquetes);
router.get('/:id', checkAuth, controller.getPaquete);
router.post('/', checkAuth, controller.insertPaquete);
router.put('/', checkAuth, controller.updatePaquete);
router.patch('/:id', checkAuth, controller.setActivoPaquete);


export { router };