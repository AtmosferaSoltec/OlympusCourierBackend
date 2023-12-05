import { Router } from 'express';
import documentoControllers from '../controllers/documento.controllers';

const router = Router();

router.get('/', documentoControllers.getAllDocumento);

export { router };