import { Router } from 'express';
import consultasController from '../controllers/consultas.controller';

const router = Router();

router.post('/', consultasController.consultarDoc);


export { router };