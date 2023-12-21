import { Router } from 'express';
import controller from '../controllers/consultas.controller';
import { checkAuth } from '../middleware/checkAuth';

const router = Router();

router.get('/dni/:doc', checkAuth, controller.consultarDni);
router.get('/ruc/:doc', checkAuth, controller.consultarRuc);


export { router };