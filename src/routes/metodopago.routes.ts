import { Router } from 'express';
import metodoPagoControllers from '../controllers/metodopago.controllers';

const router = Router();

router.get('/', metodoPagoControllers.getAll);

router.post('/', metodoPagoControllers.insert);

router.put('/', metodoPagoControllers.update);

router.patch('/', metodoPagoControllers.setActivo)
export { router };