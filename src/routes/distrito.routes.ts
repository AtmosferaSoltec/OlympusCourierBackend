import { Router } from 'express';
import controller from '../controllers/distrito.controllers';
import { checkAuth } from '../middleware/checkAuth';

const router = Router();

router.get('/', checkAuth, controller.getAllDistritos);
router.get('/:id', checkAuth, controller.getDistrito);
router.post('/', checkAuth, controller.insertDistrito);
router.put('/', checkAuth, controller.updateDistrito);
router.patch('/:id', checkAuth, controller.setActivoDistrito);

export { router };