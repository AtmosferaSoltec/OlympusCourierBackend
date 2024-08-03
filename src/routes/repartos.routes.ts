import { Response, Router } from 'express';
import controller from '../controllers/repartos.controllers';
import { checkAuth } from '../middleware/checkAuth';

const router = Router();

router.post('/subirMercaderia', checkAuth, controller.subirMercaderia);
router.get('/', checkAuth, controller.getAllRepartos);
router.get('/:id', checkAuth, controller.getReparto);
router.post('/', checkAuth, controller.insertReparto);
router.patch('/:id_reparto', checkAuth, controller.setActivoReparto);
router.post('/darConformidad', checkAuth, controller.darConformidad)

export { router };