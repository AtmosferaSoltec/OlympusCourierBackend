import { Router } from 'express';
import controller from '../controllers/metodopago.controllers';
import { checkAuth } from '../middleware/checkAuth';

const router = Router();

router.get('/', checkAuth, controller.getAll);
router.post('/', checkAuth, controller.insert);
router.put('/', checkAuth, controller.update);
router.patch('/', checkAuth, controller.setActivo)

export { router };