import { Response, Router } from 'express';
import repartosControllers from '../controllers/repartos.controllers';
import { checkAuth } from '../middleware/checkAuth';

const router = Router();

router.get('/', checkAuth as any, repartosControllers.getAllRepartos as any);
router.get('/:id', checkAuth as any, repartosControllers.getReparto as any);
router.post('/', checkAuth as any, repartosControllers.insertReparto as any);
router.put('/:id', checkAuth as any, repartosControllers.updateReparto as any);
router.patch('/:id', checkAuth as any, repartosControllers.setActivoReparto as any);
router.post('/darConformidad', checkAuth as any, repartosControllers.darConformidad as any)

export { router };