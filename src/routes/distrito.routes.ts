import { Router } from 'express';
import destinoControllers from '../controllers/distrito.controllers';
import { checkAuth } from '../middleware/checkAuth';

const router = Router();

router.get('/', checkAuth as any, destinoControllers.getAllDistritos as any);
router.get('/:id', checkAuth as any, destinoControllers.getDistrito as any);
router.post('/', checkAuth as any, destinoControllers.insertDistrito as any);
router.put('/', checkAuth as any, destinoControllers.updateDistrito as any);
router.patch('/:id', checkAuth as any, destinoControllers.setActivoDistrito as any);

export { router };