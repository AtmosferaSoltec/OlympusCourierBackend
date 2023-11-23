import { Router } from 'express';
import repartosControllers from '../controllers/repartos.controllers';

const router = Router();

router.get('/', repartosControllers.getAllRepartos);
router.get('/:id', repartosControllers.getReparto);
router.post('/', repartosControllers.insertReparto);
router.put('/:id', repartosControllers.updateReparto);
router.delete('/:id', repartosControllers.deleteReparto);
router.post('/darConformidad', repartosControllers.darConformidad)

export { router };