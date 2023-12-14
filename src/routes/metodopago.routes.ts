import { Router } from 'express';
import tipoPaquetesControllers from '../controllers/metodopago.controllers';

const router = Router();

router.get('/', tipoPaquetesControllers.getAll);

export { router };