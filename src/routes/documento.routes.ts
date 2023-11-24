import { Router } from 'express';
import documentoControllers from '../controllers/documento.controllers';

const router = Router();

router.get('/', documentoControllers.getAllDocumento);
router.get('/:id', documentoControllers.getDocumento);
router.post('/', documentoControllers.insertDocumento);
router.put('/:id', documentoControllers.updateDocumento);
router.patch('/:id', documentoControllers.setActivoDocumento);

export { router };