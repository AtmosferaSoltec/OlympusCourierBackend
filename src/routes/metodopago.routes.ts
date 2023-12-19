import { Router } from 'express';
import metodoPagoControllers from '../controllers/metodopago.controllers';
import { checkAuth } from '../middleware/checkAuth';

const router = Router();

router.get('/', checkAuth as any, metodoPagoControllers.getAll as any);
router.post('/', checkAuth as any, metodoPagoControllers.insert as any);
router.put('/', checkAuth as any, metodoPagoControllers.update as any);
router.patch('/', checkAuth as any, metodoPagoControllers.setActivo as any)

export { router };