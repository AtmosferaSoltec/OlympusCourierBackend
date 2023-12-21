import { Router } from 'express';
import controller from '../controllers/empresa.controllers';
import { checkAuth } from '../middleware/checkAuth';

const router = Router();

router.get('/', checkAuth, controller.get);
router.post('/', checkAuth, controller.insert);
router.put('/', checkAuth, controller.update);

export { router };