import { Router } from 'express';
import contadorController from '../controllers/empresa.controllers';
import { checkAuth } from '../middleware/checkAuth';

const router = Router();

router.get('/', checkAuth as any, contadorController.get as any);
router.post('/', checkAuth as any, contadorController.insert as any);
router.put('/', checkAuth as any, contadorController.update as any);

export { router };