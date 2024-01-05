import { Router } from 'express';
import controller from '../controllers/comprobantes.controllers';
import { checkAuth } from '../middleware/checkAuth';

const router = Router();

router.get('/', checkAuth, controller.listarTodos);
router.get('/:id', checkAuth, controller.get);
router.post('/', checkAuth, controller.insertar);
router.post('/anular', checkAuth, controller.anular);
router.patch('/:id', checkAuth, controller.setActivoComprobante);


export { router };