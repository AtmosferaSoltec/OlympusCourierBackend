import { Router } from 'express';
import comprobantesControllers from '../controllers/comprobantes.controllers';

const router = Router();

router.get('/', comprobantesControllers.listarTodos);
router.post('/', comprobantesControllers.insertar);
router.put('/:id', comprobantesControllers.actualizar);
router.patch('/:id', comprobantesControllers.setActivoComprobante);


export { router };