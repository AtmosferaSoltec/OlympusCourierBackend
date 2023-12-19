import { Router } from 'express';
import comprobantesControllers from '../controllers/comprobantes.controllers';
import { checkAuth } from '../middleware/checkAuth';

const router = Router();

router.get('/', checkAuth as any, comprobantesControllers.listarTodos as any);
router.get('/:id', checkAuth as any, comprobantesControllers.get as any);
router.post('/', checkAuth as any, comprobantesControllers.insertar as any);
router.put('/:id', checkAuth as any, comprobantesControllers.actualizar as any);
router.patch('/:id', checkAuth as any, comprobantesControllers.setActivoComprobante as any);


export { router };