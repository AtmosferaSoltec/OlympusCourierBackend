import { Router } from 'express';
import repartosControllers from '../controllers/repartos.controllers';

const router = Router();

router.get('/', repartosControllers.getAllRepartos);
router.get('/:id', repartosControllers.getReparto);
router.post('/', repartosControllers.insertReparto);
router.put('/:id', repartosControllers.updateReparto);
router.patch('/:id', repartosControllers.setActivoReparto);
router.post('/darConformidad', repartosControllers.darConformidad)

export { router };