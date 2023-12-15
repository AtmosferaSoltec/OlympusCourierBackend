import { Router } from 'express';
import contadorController from '../controllers/empresa.controllers';

const router = Router();

router.get('/', contadorController.get);
router.post('/', contadorController.insert);
router.put('/', contadorController.update);

export { router };