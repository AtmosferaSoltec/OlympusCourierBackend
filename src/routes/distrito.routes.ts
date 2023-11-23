import { Router } from 'express';
import destinoControllers from '../controllers/distrito.controllers';

const router = Router();

router.get('/', destinoControllers.getAllDistritos);
router.get('/:id', destinoControllers.getDistrito);
router.post('/', destinoControllers.insertDistrito);
router.put('/:id', destinoControllers.updateDistrito);
router.patch('/:id', destinoControllers.setActivoDistrito);

export { router };