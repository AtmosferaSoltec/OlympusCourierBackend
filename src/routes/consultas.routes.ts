import { Router } from 'express';
import consultasController from '../controllers/consultas.controller';

const router = Router();

router.get('/dni/:doc', consultasController.consultarDni);
router.get('/ruc/:doc', consultasController.consultarRuc);


export { router };